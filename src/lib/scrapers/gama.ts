import { chromium } from 'playwright'

const BASE = 'https://gamaenlinea.com'
const CDN_BASE = 'https://egb2c.cl94ncbhsi-excelsior1-p1-public.model-t.cc.commerce.ondemand.com'

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchGama(query: string) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiData: any = null

  page.on('response', async (res) => {
    const url = res.url()
    if (url.includes('/products/search') && res.status() === 200) {
      try {
        const json = await res.json()
        if (json.products?.length > 0) apiData = json
      } catch { }
    }
  })

  await page.goto(`${BASE}/es/search/${encodeURIComponent(query)}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  try {
    await page.waitForSelector('cx-product-card, [class*="product-card"], article[class*="product"]', { timeout: 15000 })
  } catch {
    console.warn('Gama: no aparecieron tarjetas de producto en 15s')
  }

  await page.waitForTimeout(2000)

  if (apiData?.products?.length > 0) {
    await browser.close()
    return apiData.products
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => p.price?.value != null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => {
        // Use the 'product' format image (300x300) from CDN, not thumbnail
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productImage = p.images?.find((img: any) => img.format === 'product' && img.imageType === 'PRIMARY')
        const imageUrl = productImage?.url
          ? `${CDN_BASE}${productImage.url}`
          : p.images?.[0]?.url
            ? `${CDN_BASE}${p.images[0].url}`
            : null

        return {
          name: cleanText(p.name),
          brand: null,
          normalized: cleanText(p.name).toLowerCase().trim(),
          imageUrl,
          price: p.price.value,
          url: p.url ? new URL(p.url, BASE).toString() : `${BASE}/p/${p.seoName ?? p.code}`,
          available: p.stock?.stockLevelStatus !== 'outOfStock',
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => p.available)
  }

  // Fallback: leer del DOM renderizado
  const results = await page.$$eval('cx-product-card, [class*="product-card"], article[class*="product"]', (cards) =>
    cards.map((card) => {
      const nameEl = card.querySelector('[class*="name"], [class*="title"], h3, h4, .product-name')
      const priceEl = card.querySelector('[class*="price"], .price, [data-price]')
      const linkEl = card.querySelector('a[href*="/p/"]')
      const imgEl = card.querySelector('img')

      const name = cleanText(nameEl?.textContent?.trim() ?? '')
      const priceText = priceEl?.textContent?.trim() ?? ''
      const href = linkEl?.getAttribute('href') ?? ''
      const img = imgEl?.getAttribute('src') ?? imgEl?.getAttribute('data-src') ?? null

      const amount = parseFloat(priceText.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'))

      if (!name || !amount || isNaN(amount)) return null

      return {
        name,
        brand: null,
        normalized: name.toLowerCase().trim(),
        imageUrl: img ? (img.startsWith('http') ? img : new URL(img, BASE).toString()) : null,
        price: amount,
        url: href ? new URL(href, BASE).toString() : null,
        available: true,
      }
    }).filter(Boolean)
  )

  await browser.close()
  console.log(`Gama (Playwright): ${results.length} productos`)
  return results
}