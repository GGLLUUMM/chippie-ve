import { getBrowser } from '../browser'

const ALGOLIA_API = 'https://api-search.farmatodo.com/1/indexes/*/queries'
const BASE = 'https://www.farmatodo.com.ve'

interface FarmatodoHit {
  id: string
  item: number
  description: string
  largeDescription: string
  fullPrice: number
  listUrlImages: string[]
  itemUrl: string | null
  barcode: string
  brand: string
  marca: string
  available: boolean
  without_stock: boolean
  availableOnline?: boolean
  outofstore?: boolean
  valid?: boolean
  stock?: number
  totalStock?: number
  url: string | null
  urlCanonical?: string | null
}

/**
 * Consulta a Algolia (el buscador de Farmatodo).
 */
async function fetchFromAlgolia(
  query: string,
  page = 0,
  hitsPerPage = 20,
): Promise<FarmatodoHit[]> {
  const body = {
    requests: [
      {
        indexName: 'prod-vzla',
        query,
        params: `hitsPerPage=${hitsPerPage}&page=${page}&facets=*&maxValuesPerFacet=100`,
      },
    ],
  }

  const res = await fetch(
    `${ALGOLIA_API}?x-algolia-agent=Algolia%20for%20JavaScript%20(4.25.3)%3B%20Browser`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Farmatodo Algolia error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.results?.[0]?.hits || []
}

/**
 * Construye la URL de compra del producto.
 *
 * Estrategia (en orden de prioridad):
 *   1. Ruta canónica de producto usando el `item` ID (la más fiable).
 *   2. `hit.url` o `hit.urlCanonical` si vienen desde Algolia.
 *   3. Fallback de búsqueda por nombre (menos fiable, puede dar 404).
 */
function buildProductUrl(hit: FarmatodoHit): string {
  // 1. Intentar con la URL canónica que usa Farmatodo: /producto/<item>
  //    Si tras probar en el navegador ves que la ruta es distinta
  //    (ej: /p/<slug>-<item>), ajusta esta línea.
  if (hit.item) {
    return `${BASE}/producto/${hit.item}`
  }

  // 2. Usar la URL que devuelve Algolia, si existe
  const productPath = hit.url || hit.urlCanonical
  if (productPath) {
    try {
      return new URL(productPath, BASE).toString()
    } catch {
      // Si no es una URL válida, continuamos al fallback
    }
  }

  // 3. Último recurso: página de búsqueda (puede dar 404 o redirigir mal)
  console.warn(
    `[Farmatodo] Producto sin item/url, usando búsqueda: ${hit.description}`,
  )
  return `${BASE}/buscar?product=${encodeURIComponent(hit.description)}&departamento=Todos&filtros=`
}

/**
 * Extrae el item ID desde una URL de imagen de Google (lh3.googleusercontent.com).
 * Farmatodo adjunta el item como query param `item=<id>`.
 */
/**
 * Scrapea la página de búsqueda para obtener los datos visibles actualmente.
 */
async function fetchImagesFromSearchPage(
  query: string,
): Promise<Map<number, { imageUrl: string | null; price: number | null }>> {
  const productMap = new Map<number, { imageUrl: string | null; price: number | null }>()
  let browser

  try {
    browser = await getBrowser()
    const page = await browser.newPage()

    await page.goto(
      `${BASE}/buscar?product=${encodeURIComponent(query)}&departamento=Todos&filtros=`,
      { waitUntil: 'domcontentloaded', timeout: 15000 },
    )

    await page
      .waitForSelector('[class*="product"] img, [class*="gallery"] img', {
        timeout: 10000,
      })
      .catch(() => {})

    await page.waitForTimeout(1500)

    const products = await page.$$eval(
      'a[href*="/producto/"]',
      (links: HTMLAnchorElement[]) =>
        links.map((link) => {
          const itemId = link.href.match(/\/producto\/(\d+)/)?.[1]
          const container = link.closest('article, [class*="product"], [class*="card"]')
          const text = container?.textContent ?? link.textContent ?? ''
          const priceText = text.match(/Bs\.\s*([\d.]+,\d{2})/)?.[1]
          const price = priceText
            ? Number(priceText.replace(/\./g, '').replace(',', '.'))
            : null
          const image = container?.querySelector<HTMLImageElement>('img[src*="googleusercontent.com"]')

          return {
            itemId: itemId ? Number(itemId) : null,
            imageUrl: image?.src ?? null,
            price: Number.isFinite(price) ? price : null,
          }
        }).filter((product) => product.itemId !== null),
    )

    for (const product of products) {
      if (product.itemId !== null && !productMap.has(product.itemId)) {
        productMap.set(product.itemId, {
          imageUrl: product.imageUrl?.replace(/=s\d+-rw/, '=s400-rw') ?? null,
          price: product.price,
        })
      }
    }

    await page.close()
  } catch (e) {
    console.warn('[Farmatodo] Error obteniendo imágenes del DOM:', e)
  }

  return productMap
}

async function fetchCurrentPrices(
  hits: FarmatodoHit[],
): Promise<Map<number, number>> {
  const prices = new Map<number, number>()

  await Promise.all(
    hits.map(async (hit) => {
      if (!hit.item) return

      try {
        const res = await fetch(`${BASE}/producto/${hit.item}`, {
          headers: { Accept: 'text/html' },
        })
        if (!res.ok) return

        const html = await res.text()
        const match = html.match(/"priceCurrency":"VES","price":([\d.]+)/)
        const price = match ? Number(match[1]) : NaN
        if (Number.isFinite(price) && price > 0) prices.set(hit.item, price)
      } catch {
        // El precio de Algolia sigue siendo un fallback válido si el detalle falla.
      }
    }),
  )

  return prices
}

/**
 * Normaliza una URL de imagen para que apunte a una resolución razonable.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  // Algunas URLs de Farmatodo vienen con tamaños muy pequeños
  return url.replace(/=s\d+/, '=s400')
}

export async function fetchFarmatodo(query: string) {
  try {
    // Ejecutamos Algolia y el scraping del DOM en paralelo
    const [hits, imageMap] = await Promise.all([
      fetchFromAlgolia(query),
      fetchImagesFromSearchPage(query),
    ])
    const currentPrices = await fetchCurrentPrices(hits)

    let fromAlgolia = 0
    let fromDom = 0
    let withoutImage = 0
    let withoutUrl = 0

    const results = hits
      .filter((hit: FarmatodoHit) => {
        // Descartamos productos sin precio o marcados como no disponibles
        if (!hit.fullPrice || hit.fullPrice <= 0) return false
          const stock = hit.totalStock ?? hit.stock
          if (stock == null || stock <= 0) return false
          if (hit.available === false || hit.availableOnline === false) return false
          if (hit.without_stock === true || hit.outofstore === true || hit.valid === false) return false
        return true
      })
      .map((hit: FarmatodoHit) => {
        // --- Imagen ---
        // Prioridad 1: imagen que viene directo de Algolia
        let imageUrl = normalizeImageUrl(hit.listUrlImages?.[0])

        if (imageUrl) {
          fromAlgolia++
        } else {
          // Prioridad 2: imagen scrapeada del DOM, emparejada por item ID
          const domProduct = imageMap.get(hit.item)
          if (domProduct?.imageUrl) {
            imageUrl = domProduct.imageUrl
            fromDom++
          } else {
            withoutImage++
          }
        }

        // --- URL de compra ---
        const url = buildProductUrl(hit)
        if (!hit.item && !hit.url && !hit.urlCanonical) {
          withoutUrl++
        }

        return {
          name: hit.description,
          brand: hit.brand || hit.marca || null,
          normalized: hit.description.toLowerCase().trim(),
          imageUrl,
          price: currentPrices.get(hit.item) ?? imageMap.get(hit.item)?.price ?? hit.fullPrice,
          url,
          available:
            hit.available !== false &&
            hit.availableOnline !== false &&
            hit.without_stock !== true &&
            hit.outofstore !== true &&
            hit.valid !== false &&
            (hit.totalStock ?? hit.stock ?? 0) > 0,
        }
      })
      .filter((p) => p.name && p.price > 0)

    console.log(
      `[Farmatodo] ${results.length} productos ` +
        `(imgs Algolia: ${fromAlgolia}, DOM: ${fromDom}, sin img: ${withoutImage}, sin URL canónica: ${withoutUrl})`,
    )

    return results
  } catch (error) {
    console.error('[Farmatodo] scraper error:', error)
    return []
  }
}