import { fetchThroughBrowser } from '../browser'

const BASE = 'https://daka.tiendasdaka.com'
const API_SEARCH = `${BASE}/api/search`

interface DakaHit {
  id: string
  title: string
  handle: string
  thumbnail: string
  variant_sku: string
}

interface DakaResponse {
  hits: DakaHit[]
}

interface DakaProduct {
  name: string
  brand: string | null
  normalized: string
  imageUrl: string | null
  price: number
  url: string
  available: boolean
}

/**
 * 1) API de búsqueda (rápida, solo metadatos)
 */
async function fetchFromApi(
  query: string,
  page = 0,
  hitsPerPage = 40,
): Promise<DakaHit[]> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    hitsPerPage: hitsPerPage.toString(),
  })

  const url = `${API_SEARCH}?${params.toString()}`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    if (res.ok) {
      const data: DakaResponse = await res.json()
      return data.hits ?? []
    }
  } catch { /* fallback */ }

  const fallback = await fetchThroughBrowser(url)
  if (fallback.status < 200 || fallback.status >= 300) {
    throw new Error(`Daka API error ${fallback.status}`)
  }
  return JSON.parse(fallback.body).hits ?? []
}

/**
 * 2) Extrae TODAS las URLs reales de productos desde el HTML de la página de búsqueda.
 *    Esto evita adivinar rutas y elimina los 404s.
 */
async function fetchProductUrlsFromSearchPage(
  query: string,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>()

  try {
    const searchUrl = `${BASE}/ve/results/${encodeURIComponent(query)}?q=${encodeURIComponent(query)}`
    const res = await fetch(searchUrl, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!res.ok) {
      console.warn(`[Daka] No se pudo obtener página de búsqueda: ${res.status}`)
      return urlMap
    }

    const html = await res.text()

    // Buscar TODOS los enlaces que parezcan productos.
    // Daka suele usar rutas como /ve/<handle> o similares.
    // Este regex captura hrefs que no sean navegación ni categorías obvias.
    const linkRegex = /href="(\/[^"]+)"[^>]*>/gi
    let match

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]

      // Ignorar rutas de navegación, cuenta, carrito, etc.
      if (
        href.includes('/results/') ||
        href.includes('/account') ||
        href.includes('/cart') ||
        href.includes('/login') ||
        href.includes('/search') ||
        href.includes('/category') ||
        href.includes('/tiendas') ||
        href.includes('/about') ||
        href.includes('/faq') ||
        href.includes('/ofertas') ||
        href.includes('/marcas') ||
        href.split('/').filter(Boolean).length < 3
      ) {
        continue
      }

      // El último segmento es el handle
      const parts = href.split('/').filter(Boolean)
      const handle = parts[parts.length - 1]

      if (handle && !urlMap.has(handle)) {
        urlMap.set(handle, href.startsWith('http') ? href : `${BASE}${href}`)
      }
    }

    console.log(`[Daka] ${urlMap.size} URLs extraídas del HTML de búsqueda`)
  } catch (e) {
    console.warn('[Daka] Error extrayendo URLs:', e)
  }

  return urlMap
}

/**
 * 3) Extrae precio del HTML del detalle (JSON-LD primero, luego regex)
 */
function extractPriceFromHtml(html: string, productId: string): number | null {
  // JSON-LD
  const ldMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )
  for (const match of ldMatches) {
    try {
      const parsed = JSON.parse(match[1].trim())
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of candidates) {
        const offers = item?.offers
        if (!offers) continue
        const offerList = Array.isArray(offers) ? offers : [offers]
        for (const offer of offerList) {
          const price = Number(offer?.price ?? offer?.lowPrice)
          if (Number.isFinite(price) && price > 0) return price
        }
      }
    } catch { /* ignorar */ }
  }

  // Meta tags
  const metaPatterns = [
    /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([\d.,]+)["']/i,
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([\d.,]+)["']/i,
  ]
  for (const pattern of metaPatterns) {
    const m = html.match(pattern)
    if (m) {
      const price = parsePrice(m[1])
      if (price !== null) return price
    }
  }

  // Regex alrededor del id del producto
  const idIndex = html.indexOf(`product-info-${productId}`)
  if (idIndex !== -1) {
    const window = html.slice(Math.max(0, idIndex - 3000), idIndex + 5000)
    const usdMatch = window.match(/US\$\s*([\d.,]+)/i)
    if (usdMatch) {
      const price = parsePrice(usdMatch[1])
      if (price !== null) return price
    }
  }

  return null
}

function parsePrice(raw: string): number | null {
  if (!raw) return null
  let clean = raw.replace(/[^\d,.]/g, '')
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else {
      clean = clean.replace(/,/g, '')
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.')
  }
  const value = parseFloat(clean)
  return Number.isFinite(value) && value > 0 ? value : null
}

/**
 * 4) Obtiene precio de un producto con timeout agresivo (8s)
 */
async function fetchPriceForProduct(
  productUrl: string,
  productId: string,
): Promise<number | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(productUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      console.warn(`[Daka] Detalle ${res.status} para ${productUrl}`)
      return null
    }
    const html = await res.text()
    return extractPriceFromHtml(html, productId)
  } catch (e) {
    clearTimeout(timeoutId)
    if ((e as Error).name === 'AbortError') {
      console.warn(`[Daka] Timeout obteniendo ${productUrl}`)
    }
    return null
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }).map(
    async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await fn(items[index], index)
      }
    },
  )
  await Promise.all(workers)
  return results
}

function extractBrand(title: string): string | null {
  const knownBrands = [
    'Daewoo', 'Hyundai', 'LG', 'Samsung', 'Sansui', 'Whirlpool',
    'Ribelle', 'Oster', 'Mabe', 'Electrolux', 'Bosch', 'Panasonic',
    'Toshiba', 'Koblenz', 'Midea', 'Hisense', 'Indurama',
  ]
  const lower = title.toLowerCase()
  for (const brand of knownBrands) {
    if (lower.includes(brand.toLowerCase())) return brand
  }
  return null
}

export async function fetchDaka(query: string) {
  try {
    // 1) API de búsqueda
    const hits = await fetchFromApi(query)
    if (hits.length === 0) {
      console.log('[Daka] Sin resultados en la API')
      return []
    }

    // 2) Extraer URLs reales del HTML de la página de búsqueda (una sola petición)
    const urlMap = await fetchProductUrlsFromSearchPage(query)

    // 3) Para cada hit, obtener precio usando la URL REAL (sin reintentos de fallback)
    const priced = await mapWithConcurrency(hits, 5, async (hit) => {
      if (!hit.handle) return null

      const productUrl = urlMap.get(hit.handle)
      if (!productUrl) {
        // No está en el HTML, saltamos sin reintentar
        return null
      }

      const price = await fetchPriceForProduct(productUrl, hit.id)
      if (price === null) return null

      const name = hit.title?.trim()
      if (!name) return null

      return {
        name,
        brand: extractBrand(hit.title),
        normalized: name.toLowerCase().trim(),
        imageUrl: hit.thumbnail || null,
        price,
        url: productUrl,
        available: true,
      } as DakaProduct
    })

    const results = priced.filter((p): p is DakaProduct => p !== null)
    console.log(`[Daka] ${results.length}/${hits.length} productos con precio`)
    return results
  } catch (error) {
    console.error('[Daka] scraper error:', error)
    return []
  }
}