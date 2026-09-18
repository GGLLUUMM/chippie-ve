import { prisma } from './prisma'
import { fetchLocatel } from './scrapers/locatel'
import { fetchFarmaciaSAAS } from './scrapers/farmaciassaas'
import { fetchFarmago } from './scrapers/farmago'
import { fetchGama } from './scrapers/gama'
import { fetchFarmatodo } from './scrapers/farmatodo'

const sources = [
  {
    id: 'locatel-ve',
    name: 'Locatel',
    baseUrl: 'https://www.locatel.com.ve',
    fetcher: fetchLocatel,
    currency: 'VES',
  },
  {
    id: 'farmaciasaas',
    name: 'Farmacia SAAS',
    baseUrl: 'https://www.farmaciasaas.com',
    fetcher: fetchFarmaciaSAAS,
    currency: 'USD',
  },
  {
    id: 'farmago-ve',
    name: 'Farmago',
    baseUrl: 'https://www.farmago.com.ve',
    fetcher: fetchFarmago,
    currency: 'VES',
  },
  {
    id: 'gamaenlinea',
    name: 'Gama en Línea',
    baseUrl: 'https://gamaenlinea.com',
    fetcher: fetchGama,
    currency: 'USD',
  },
  {
    id: 'farmatodo-ve',
    name: 'Farmatodo',
    baseUrl: 'https://www.farmatodo.com.ve',
    fetcher: fetchFarmatodo,
    currency: 'VES',
  },
] as const

async function ensureFreshRate(): Promise<number> {
  const last = await prisma.rate.findFirst({
    orderBy: { date: 'desc' },
  })

  const isFresh =
    last &&
    Date.now() - last.date.getTime() <= 12 * 60 * 60 * 1000

  if (isFresh) {
    const savedRate = Number(last.rate)

    if (Number.isFinite(savedRate) && savedRate > 0) {
      return savedRate
    }
  }

  const response = await fetch(
    'https://ve.dolarapi.com/v1/dolares/oficial',
    {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`No se pudo obtener la tasa: HTTP ${response.status}`)
  }

  const data = (await response.json()) as {
    promedio?: number
    venta?: number
  }

  const rate = Number(data.promedio ?? data.venta)

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('La tasa recibida no es válida')
  }

  await prisma.rate.create({
    data: {
      currency: 'USD',
      rate,
    },
  })

  return rate
}

export async function syncQuery(query: string) {
  if (!query.trim()) return

  // Guarda o actualiza la tasa para que la página pueda convertir los precios USD.
  await ensureFreshRate()

  for (const source of sources) {
    try {
      const items = await source.fetcher(query.trim())

      const store = await prisma.store.upsert({
        where: { id: source.id },
        update: {
          name: source.name,
          baseUrl: source.baseUrl,
        },
        create: {
          id: source.id,
          name: source.name,
          baseUrl: source.baseUrl,
        },
      })

      for (const item of items) {
        const product = await prisma.product.upsert({
          where: {
            normalized_storeId: {
              normalized: item.normalized,
              storeId: store.id,
            },
          },
          update: {
            name: item.name,
            brand: item.brand,
            imageUrl: item.imageUrl,
          },
          create: {
            name: item.name,
            brand: item.brand,
            normalized: item.normalized,
            imageUrl: item.imageUrl,
            storeId: store.id,
          },
        })

        const amount = Number(item.price)

        if (!Number.isFinite(amount) || amount <= 0) {
          continue
        }

        await prisma.price.create({
          data: {
            amount,
            currency: source.currency,
            url: item.url,
            productId: product.id,
          },
        })
      }

      console.log(`✅ ${source.name}: ${items.length} productos`)
    } catch (error) {
      console.error(`❌ ${source.name}:`, error)
    }
  }
}