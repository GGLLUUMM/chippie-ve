import { getBrowser } from '../browser'
 
const BASE = 'https://cangurovenezuela.com'

export async function fetchCanguro(query: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(`${BASE}/?s=${encodeURIComponent(query)}&post_type=product&dgwt_wcas=1`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    })

    await page.waitForSelector('[class*="product"], li.product, .product-item', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)

    const results = await page.$$eval('[class*="product"], li.product, .product-item', (cards) =>
      cards.map((card) => {
        const nameEl = card.querySelector('[class*="name"], [class*="title"], h3, h2, a[href*="/producto"]')
        const priceEl = card.querySelector('[class*="price"], .price, .woocommerce-Price-amount, .amount')
        const linkEl = card.querySelector('a[href*="/producto"], a[href*="/product"]')
        const imgEl = card.querySelector('img')

        const name = nameEl?.textContent?.trim() ?? ''
        const amounts = card.querySelectorAll('.woocommerce-Price-amount')
        const priceText = amounts.length
        ? amounts[amounts.length - 1].textContent?.trim() ?? '' // el último es el precio actual (oferta)
        : priceEl?.textContent?.trim() ?? ''
        const href = linkEl?.getAttribute('href') ?? ''
        const img = imgEl?.getAttribute('src') ?? imgEl?.getAttribute('data-src') ?? imgEl?.getAttribute('data-lazy-src') ?? null

        
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

    console.log(`Canguro: ${results.length} productos`)
    return results
  } catch (error) {
    console.error('Canguro scraper error:', error)
    return []
  }
}