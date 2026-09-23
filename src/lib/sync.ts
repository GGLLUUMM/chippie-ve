import { prisma } from './prisma'
import { fetchLocatel } from './scrapers/locatel'
import { fetchFarmaciaSAAS } from './scrapers/farmaciassaas'
import { fetchFarmago } from './scrapers/farmago'
import { fetchDamasco } from './scrapers/damasco'
import { fetchGama } from './scrapers/gama'
import { fetchFarmatodo } from './scrapers/farmatodo'
import { fetchDaka } from './scrapers/daka'
import { closeBrowser } from './browser'

const sources = [
  { id: 'locatel-ve', name: 'Locatel', baseUrl: 'https://www.locatel.com.ve', fetcher: fetchLocatel, currency: 'VES' },
  { id: 'farmaciasaas', name: 'Farmacia SAAS', baseUrl: 'https://www.farmaciasaas.com', fetcher: fetchFarmaciaSAAS, currency: 'USD' },
  { id: 'farmago-ve', name: 'Farmago', baseUrl: 'https://www.farmago.com.ve', fetcher: fetchFarmago, currency: 'VES' },
  { id: 'damasco', name: 'Damasco', baseUrl: 'https://www.damascovzla.com', fetcher: fetchDamasco, currency: 'USD' },
  { id: 'gama', name: 'Gama en Línea', baseUrl: 'https://gamaenlinea.com', fetcher: fetchGama, currency: 'USD' },
  { id: 'farmatodo-ve', name: 'Farmatodo', baseUrl: 'https://www.farmatodo.com.ve', fetcher: fetchFarmatodo, currency: 'VES' },
  { id: 'daka', name: 'Tiendas Daka', baseUrl: 'https://tiendasdaka.com', fetcher: fetchDaka, currency: 'USD' },
  // EPA, Canguro y SoyTecno están suspendidos por mantenimiento o bloqueo anti-bot.
]

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export async function syncQuery(query: string) {
  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      const items = await withTimeout(Promise.resolve(source.fetcher(query)), 30000)
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
          data: { amount: item.price, currency: source.currency, url: item.url, productId: product.id },
        })
      }
      return `${source.name}: ${items.length}`
    })
  )

  await closeBrowser() // ← cierra el navegador compartido al final

  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') console.log(`✅ ${r.value}`)
    else console.log(`❌ ${sources[i].name}: ${r.reason?.message ?? r.reason}`)
  })
}