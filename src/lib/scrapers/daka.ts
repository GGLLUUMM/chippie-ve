import { getBrowser } from '../browser'

const BASE = 'https://tiendasdaka.com'

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parsePrice(priceText: string): number {
  const cleaned = priceText
    .replace(/[^\d,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const amount = parseFloat(cleaned)
  return isNaN(amount) ? 0 : amount
}

function extractProductsFromNextData(html: string): Array<{id: string, name: string, brand: string | null, price: number, currency: string}> {
  const products: Array<{id: string, name: string, brand: string | null, price: number, currency: string}> = []
  
  // Strategy 1: Look for GA4 ecommerce items in __next_f scripts
  // Format: "item_list_name":"...","items":[{...}]
  const itemListRegex = /"item_list_name"\s*:\s*"[^"]*"[^}]*"items"\s*:\s*(\[[\s\S]*?\])/g
  let match
  while ((match = itemListRegex.exec(html)) !== null) {
    try {
      const items = JSON.parse(match[1])
      for (const item of items) {
        if (item.item_id && item.item_name && item.price) {
          products.push({
            id: item.item_id,
            name: item.item_name,
            brand: item.item_brand || null,
            price: parseFloat(item.price),
            currency: item.currency || 'USD',
          })
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Strategy 2: Look for product data in __NEXT_DATA__ script
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1])
      // Navigate through the Next.js data structure to find products
      const pageProps = nextData?.props?.pageProps
      if (pageProps) {
        // Search recursively for product arrays
        // The embedded Next.js payload is intentionally untyped and only used as a fallback.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function findProducts(obj: any) {
          if (!obj || typeof obj !== 'object') return
          if (Array.isArray(obj)) {
            for (const item of obj) {
              if (item && typeof item === 'object' && item.item_id && item.item_name && item.price) {
                products.push({
                  id: item.item_id,
                  name: item.item_name,
                  brand: item.item_brand || null,
                  price: parseFloat(item.price),
                  currency: item.currency || 'USD',
                })
              }
              findProducts(item)
            }
          } else {
            for (const key of Object.keys(obj)) {
              findProducts(obj[key])
            }
          }
        }
        findProducts(pageProps)
      }
    } catch {
      // Ignore
    }
  }

  // Deduplicate by id
  const seen = new Set<string>()
  return products.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

export async function fetchDaka(query: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    const searchUrl = `${BASE}/ve/results/${encodeURIComponent(query)}?q=${encodeURIComponent(query)}`
    console.log(`Daka: fetching ${searchUrl}`)
    
    // Navigate with a realistic user agent and headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    })
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Wait for Next.js to hydrate and render products
    await page.waitForTimeout(5000)

    // Get the full HTML to extract Next.js embedded data
    const html = await page.content()
    
    // Extract products from Next.js embedded JSON data
    const extractedProducts = extractProductsFromNextData(html)
    console.log(`Daka: extracted ${extractedProducts.length} products from Next.js data`)

    if (extractedProducts.length > 0) {
      // Get DOM data for images and URLs
      const domProducts = await page.$$eval(
        '[data-testid="products-list"] li, li.product-card-item, [class*="product-card-item"]',
        (cards) =>
          cards.map((card) => {
            const linkEl = card.querySelector('a[href*="/products/"]')
            const imgEl = card.querySelector('img')
            const href = linkEl?.getAttribute('href') ?? ''
            const img = imgEl?.getAttribute('src') ?? imgEl?.getAttribute('data-src') ?? null
            return { href, img }
          })
      )

      // Merge extracted data with DOM data
      const results = extractedProducts.map((product, index) => {
        const domData = domProducts[index] || {}
        return {
          name: product.name,
          brand: product.brand,
          normalized: product.name.toLowerCase().trim(),
          imageUrl: domData.img ? new URL(domData.img, BASE).toString() : null,
          price: product.price,
          url: domData.href ? new URL(domData.href, BASE).toString() : null,
          available: true,
        }
      }).filter(p => p.name && p.price > 0)

      console.log(`Daka: ${results.length} productos`)
      return results
    }

    // Fallback: DOM scraping
    console.log('Daka: falling back to DOM scraping')
    const results = await page.$$eval(
      '[data-testid="products-list"] li, li.product-card-item, [class*="product-card-item"]',
      (cards) =>
        cards.map((card) => {
          // Name selector: line-clamp-2 with font-open-poppins
          const nameEl = card.querySelector(
            '[class*="line-clamp-2"], [class*="font-open-poppins"], h3, h4, a[href*="/products/"]'
          )
          // Brand selector: font-semibold text-gray
          const brandEl = card.querySelector('[class*="font-semibold"][class*="text-"]')
          // USD Price: data-testid="price"
          const priceUsdEl = card.querySelector('[data-testid="price"]')
          // VES Price: text-neutral-500 container
          const priceVesEl = card.querySelector('[class*="text-neutral-500"]')
          // Link
          const linkEl = card.querySelector('a[href*="/products/"]')
          // Image
          const imgEl = card.querySelector('img')

          const name = cleanText(nameEl?.textContent?.trim() ?? '')
          const brand = cleanText(brandEl?.textContent?.trim() ?? '')
          const priceUsdText = priceUsdEl?.textContent?.trim() ?? ''
          const priceVesText = priceVesEl?.textContent?.trim() ?? ''
          const href = linkEl?.getAttribute('href') ?? ''
          const img = imgEl?.getAttribute('src') ?? imgEl?.getAttribute('data-src') ?? null

          const priceUsd = parsePrice(priceUsdText)
          const priceVes = parsePrice(priceVesText)
          const price = priceUsd > 0 ? priceUsd : priceVes

          if (!name || !price || isNaN(price)) return null

          return {
            name,
            brand: brand || null,
            normalized: name.toLowerCase().trim(),
            imageUrl: img ? new URL(img, BASE).toString() : null,
            price,
            url: href ? new URL(href, BASE).toString() : null,
            available: true,
          }
        }).filter(Boolean)
    )

    console.log(`Daka: ${results.length} productos`)
    return results
  } catch (error) {
    console.error('Daka scraper error:', error)
    return []
  } finally {
    await page.close().catch(() => {})
  }
}