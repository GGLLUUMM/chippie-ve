
import { getBrowser } from '../browser'

const BASE = 'https://gamaenlinea.com'
const CDN_BASE = 'https://egb2c.cl94ncbhsi-excelsior1-p1-public.model-t.cc.commerce.ondemand.com'

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function buildProductUrl(product: { seoName?: string | null; code?: string | null; url?: string | null }): string | null {
  if (product.seoName && product.code) {
    return `${BASE}/es/${product.seoName}/p/${product.code}`
  }

  if (!product.url) return null

  try {
    const url = new URL(product.url, BASE)
    if (url.pathname.includes('/p/') && !url.pathname.startsWith('/es/')) {
      url.pathname = `/es${url.pathname}`
    }
    return url.toString()
  } catch {
    return null
  }
}

export async function fetchGama(query: string) {

  const browser = await getBrowser()
  const page = await browser.newPage()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apiData: any = null
  let searchUrl: string | null = null

  page.on('response', async (res) => {
    const url = res.url()
    if (url.includes('/products/search') && res.status() === 200) {
      try {
        const json = await res.json()
        if (json.products?.length > 0) {
          searchUrl ??= url
          apiData = json
        }
      } catch { }
    }
  })

  await page.goto(`${BASE}/es/search/${encodeURIComponent(query)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  })

  try {
    await page.waitForSelector('cx-product-card, [class*="product-card"], article[class*="product"]', { timeout: 15000 })
  } catch {
    console.warn('Gama: no aparecieron tarjetas de producto en 15s')
  }

  await page.waitForTimeout(2000)

  // The storefront requests only 12 items per page. Ask OCC for the full
  // result set so generic searches do not silently lose products.
  if (searchUrl) {
    try {
      const fullResults = await page.evaluate(async (url) => {
        const requestUrl = new URL(url)
        requestUrl.searchParams.set('page', '0')
        requestUrl.searchParams.set('pageSize', '100')
        const response = await fetch(requestUrl)
        return response.ok ? response.json() : null
      }, searchUrl)

      if (fullResults?.products?.length > 0) apiData = fullResults
    } catch (error) {
      console.warn('Gama: no se pudo ampliar la búsqueda OCC', error)
    }
  }

  if (apiData?.products?.length > 0) {
    const searchTerms = normalizeForSearch(query).split(/\s+/).filter(Boolean)

    return apiData.products
      // OCC can return loosely related products for generic terms such as "agua".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => {
        const name = normalizeForSearch(cleanText(p.name ?? ''))
        return searchTerms.every((term) => name.includes(term))
      })
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
          url: buildProductUrl(p),
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

  console.log(`Gama (Playwright): ${results.length} productos`)
  return results
}