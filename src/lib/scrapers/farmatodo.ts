import { chromium } from 'playwright'

const BASE = 'https://www.farmatodo.com.ve'

export async function fetchFarmatodo(query: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Intentar capturar la respuesta JSON interna que la página le pide a su servidor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiItems: any[] = []
  page.on('response', async (res) => {
    const url = res.url()
    if ((url.includes('products/search') || url.includes('graphql')) && res.status() === 200) {
      try {
        const json = await res.json()
        if (Array.isArray(json)) apiItems = json
      } catch { /* no era JSON, ignorar */ }
    }
  })

  await page.goto(`${BASE}/buscar?ft=${encodeURIComponent(query)}`, {
    waitUntil: 'domcontentloaded',
  })

  // Esperar a que aparezcan resultados (máx 15 seg)
  try {
    await page.waitForSelector('[class*="galleryItem"], [class*="productName"]', { timeout: 15000 })
  } catch {
    console.warn('Farmatodo: no aparecieron resultados en 15s')
  }
  await page.waitForTimeout(2000) // dejar que terminen de cargar precios/imágenes

  // Estrategia A: datos de la API interceptada (lo ideal)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any[] = []
  if (apiItems.length > 0) {
    results = apiItems
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => ({
        name: p.productName,
        brand: p.brand ?? null,
        normalized: p.productName.toLowerCase().trim(),
        imageUrl: p.items?.[0]?.images?.[0]?.imageUrl ?? null,
        price: p.items?.[0]?.sellers?.[0]?.commertialOffer?.Price,
        url: new URL(p.link, BASE).toString(),
        available: true,
      }))
      .filter((p) => p.price)
  } else {
    // Estrategia B: leer del DOM renderizado
    results = await page.$$eval('[class*="galleryItem"]', (cards) =>
      cards.map((card) => {
        const name = card.querySelector('[class*="productName"]')?.textContent?.trim() ?? ''
        const priceText =
          card.querySelector('[class*="spotPrice"]')?.textContent ??
          card.querySelector('[class*="sellingPrice"]')?.textContent ??
          ''
        const link = (card.querySelector('a') as HTMLAnchorElement)?.href ?? ''
        const img = card.querySelector('img')?.src ?? null
        const amount = parseFloat(priceText.replace(/[^\d,]/g, '').replace('.', '').replace(',', '.'))
        if (!name || !amount) return null
        return {
          name,
          brand: null,
          normalized: name.toLowerCase().trim(),
          imageUrl: img,
          price: amount,
          url: link,
          available: true,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).filter(Boolean) as any[]
    )
  }

  await browser.close()
  console.log(`Farmatodo: ${results.length} productos`)
  return results
}