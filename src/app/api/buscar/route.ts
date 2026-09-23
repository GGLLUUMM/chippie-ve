import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncQuery } from '@/lib/sync'
import { ensureRate } from '@/lib/rate'

export const maxDuration = 120 // segundos permitidos (Vercel/Node)

const suspendedStores = ['EPA', 'Canguro', 'SoyTecno']
const activeStores = ['Locatel', 'Farmacia SAAS', 'Farmago', 'Damasco', 'Gama en Línea', 'Farmatodo', 'Tiendas Daka']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))

  if (!q) return NextResponse.json({ products: [], totalCount: 0, hasMore: false })

  const rate = await ensureRate()

  const words = q.toLowerCase().split(/\s+/)

  const newestByStore = await Promise.all(
    activeStores.map((storeName) =>
      prisma.price.findFirst({
        where: {
          product: {
            AND: words.map((w) => ({ normalized: { contains: w } })),
            store: { name: storeName },
          },
        },
        orderBy: { capturedAt: 'desc' },
      }),
    ),
  )
  const gamaProductsWithLatestPrice = await prisma.product.findMany({
    where: {
      AND: words.map((w) => ({ normalized: { contains: w } })),
      store: { name: 'Gama en Línea' },
    },
    include: { prices: { orderBy: { capturedAt: 'desc' }, take: 1 } },
  })

  const stale = newestByStore.some(
    (newest, index) => {
      if (!newest || Date.now() - newest.capturedAt.getTime() > 6 * 60 * 60 * 1000) {
        return true
      }

      if (
        activeStores[index] === 'Farmatodo' &&
        newest.currency === 'VES' &&
        Number(newest.amount) / rate < 0.5
      ) {
        return true
      }

      // Repair Gama prices saved by the old scraper (/es/p/<slug>), which is
      // not a valid product route and would otherwise remain fresh forever.
      const isGama = activeStores[index] === 'Gama en Línea'
      return isGama && !/\/es\/[^/]+\/p\/[^/]+$/.test(newest.url)
    },
  ) || gamaProductsWithLatestPrice.some((product) => {
    const latestPrice = product.prices[0]
    return latestPrice && !/\/es\/[^/]+\/p\/[^/]+$/.test(latestPrice.url)
  })
  if (stale) await syncQuery(q)

  const raw = await prisma.product.findMany({
    where: {
      AND: words.map((w) => ({ normalized: { contains: w } })),
      store: { name: { notIn: suspendedStores } },
    },
    include: { store: true, prices: { orderBy: { capturedAt: 'desc' }, take: 1 } },
    take: 500,
  })

  const products = raw
    .filter((p) => p.prices.length > 0)
    .filter((p) => {
      const price = p.prices[0]
      return p.store.name !== 'Farmatodo' ||
        price.currency !== 'VES' ||
        Number(price.amount) / rate >= 0.5
    })
    .map((p) => {
      const price = p.prices[0]
      const amount = Number(price.amount)
      return {
        id: p.id, name: p.name, brand: p.brand, imageUrl: p.imageUrl, normalized: p.normalized,
        store: { name: p.store.name },
        prices: [{ amount, currency: price.currency, url: price.url, capturedAt: price.capturedAt }],
        inVES: price.currency === 'USD' ? amount * rate : amount,
      }
    })
    .sort((a, b) => a.inVES - b.inVES)

  const start = (page - 1) * limit
  return NextResponse.json({
    products: products.slice(start, start + limit),
    totalCount: products.length,
    hasMore: start + limit < products.length,
  })
}