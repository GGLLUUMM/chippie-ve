import { prisma } from './prisma'
import { fetchLocatel } from './scrapers/locatel'
import { fetchFarmatodo  } from './scrapers/farmatodo'

const sources = [
  { id: 'locatel-ve', name: 'Locatel', baseUrl: 'https://www.locatel.com.ve', fetcher: fetchLocatel },
  { id: 'farmatodo-ve', name: 'Farmatodo', baseUrl: 'https://www.farmatodo.com.ve', fetcher: fetchFarmatodo },
]

export async function syncQuery(query: string) {
  for (const source of sources) {
    try {
      const items = await source.fetcher(query)
      const store = await prisma.store.upsert({
        where: { id: source.id },
        update: {},
        create: { id: source.id, name: source.name, baseUrl: source.baseUrl },
      })
      for (const item of items) {
        const product = await prisma.product.upsert({
          where: { normalized_storeId: { normalized: item.normalized, storeId: store.id } },
          update: { name: item.name, brand: item.brand, imageUrl: item.imageUrl },
          create: {
            name: item.name, brand: item.brand, normalized: item.normalized,
            imageUrl: item.imageUrl, storeId: store.id,
          },
        })
        await prisma.price.create({
          data: { amount: item.price, currency: 'VES', url: item.url, productId: product.id },
        })
      }
    } catch (e) {
      console.error(`Error en ${source.name}:`, e)
    }
  }
}