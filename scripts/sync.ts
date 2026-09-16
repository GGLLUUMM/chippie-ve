import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { fetchLocatel } from '../src/lib/scrapers/locatel'
import { fetchML } from '../src/lib/scrapers/mercadolibre'

async function main() {
  const query = process.argv[2] ?? 'arroz'
  console.log(`🔍 Buscando "${query}" en todas las tiendas...\n`)

  const sources = [
    { id: 'locatel-ve', name: 'Locatel', baseUrl: 'https://www.locatel.com.ve', fetcher: fetchLocatel },
    { id: 'mercadolibre-ve', name: 'Mercado Libre VE', baseUrl: 'https://www.mercadolibre.com.ve', fetcher: fetchML },
    // { id: 'farmatodo-ve', name: 'Farmatodo', baseUrl: 'https://www.farmatodo.com.ve', fetcher: fetchFarmatodo },
  ]

  for (const source of sources) {
    try {
      const items = await source.fetcher(query)
      const store = await prisma.store.upsert({
        where: { id: source.id },
        update: {},
        create: { id: source.id, name: source.name, baseUrl: source.baseUrl },
      })

      for (const item of items) {
        // upsert: si el producto ya existe en esa tienda, lo reutiliza
        const product = await prisma.product.upsert({
          where: { normalized_storeId: { normalized: item.normalized, storeId: store.id } },
          update: { name: item.name, brand: item.brand },
          create: { name: item.name, brand: item.brand, normalized: item.normalized, storeId: store.id },
        })

        await prisma.price.create({
          data: { amount: item.price, currency: 'VES', url: item.url, productId: product.id },
        })
      }
      console.log(`✅ ${source.name}: ${items.length} productos`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(`❌ ${source.name}: ${e.message}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())