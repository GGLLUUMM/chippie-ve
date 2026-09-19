import { getBrowser } from '../browser'
 
const BASE = 'https://ve.epaenlinea.com'

export async function fetchEPA(query: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(`${BASE}/catalogsearch/result/?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    })

    await page.waitForSelector('[class*="product"], .product-item, li.item', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)

    const results = await page.$$eval('[class*="product"], .product-item, li.item', (cards) =>
      cards.map((card) => {
        const nameEl = card.querySelector('[class*="name"], [class*="title"], .product-name a, h3 a')
        const priceEl = card.querySelector('[class*="price"], .price-box, .price, [data-price-amount]')
        const linkEl = card.querySelector('a[href*="/product"], .product-name a')
        const imgEl = card.querySelector('img')

        const name = nameEl?.textContent?.trim() ?? ''
        const priceText = priceEl?.textContent?.trim() ?? priceEl?.getAttribute('data-price-amount') ?? ''
        const href = linkEl?.getAttribute('href') ?? ''
        const img = imgEl?.getAttribute('src') ?? imgEl?.getAttribute('data-src') ?? null

        const amount = parseFloat(priceText.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'))
        if (!name || !amount || isNaN(amount)) return null

        return {
          name,
          brand: null,
          normalized: name.toLowerCase().trim(),
          imageUrl: img ? new URL(img, BASE).toString() : null,
          price: amount,
          url: href,
          available: true,
        }
      }).filter(Boolean)
    )

    console.log(`EPA: ${results.length} productos`)
    return results
  } catch (error) {
    console.error('EPA scraper error:', error)
    return []
  }
}