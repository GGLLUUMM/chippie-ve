import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ITEMS_PER_PAGE = 50

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || ITEMS_PER_PAGE.toString())

  if (!query?.trim()) {
    return NextResponse.json({ products: [], totalCount: 0, hasMore: false })
  }

  try {
    const rateRow = await prisma.rate.findFirst({
      orderBy: { date: 'desc' },
    })

    const rate = rateRow ? Number(rateRow.rate) : 0
    const words = query.toLowerCase().trim().split(/\s+/)

    const skip = (page - 1) * limit
    const take = limit + 1 // Fetch one extra to check if there are more

    const raw = await prisma.product.findMany({
      where: {
        AND: words.map((word) => ({
          normalized: { contains: word },
        })),
      },
      include: {
        store: true,
        prices: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      skip,
      take,
      orderBy: {
        prices: {
          _count: 'desc',
        },
      },
    })

    const hasMore = raw.length > limit
    const products = hasMore ? raw.slice(0, limit) : raw

    const results = products
      .filter((product) => product.prices.length > 0)
      .map((product) => {
        const price = product.prices[0]
        const amount = Number(price.amount)

        const inVES =
          price.currency === 'USD'
            ? amount * rate
            : amount

        return {
          ...product,
          price,
          inVES,
        }
      })
      .filter((product) => Number.isFinite(product.inVES) && product.inVES > 0)
      .sort((a, b) => a.inVES - b.inVES)

    return NextResponse.json({
      products: results,
      totalCount: results.length + (page - 1) * limit,
      hasMore,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Error al buscar productos' }, { status: 500 })
  }
}