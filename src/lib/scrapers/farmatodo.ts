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
function extractItemIdFromImage(src: string): number | null {
  const match = src.match(/[?&]item=(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Scrapea la página de búsqueda para obtener imágenes que Algolia no expone.
 * Devuelve un Map<itemId, imageUrl>.
 */
async function fetchImagesFromSearchPage(
  query: string,
): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>()
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

    const images = await page.$$eval(
      '[class*="product"] img, [class*="gallery"] img, article img',
      (imgs: HTMLImageElement[]) =>
        imgs
          .filter((img) => img.src.includes('googleusercontent.com'))
          .map((img) => ({
            src: img.src,
            itemId: (() => {
              const m = img.src.match(/[?&]item=(\d+)/)
              return m ? parseInt(m[1], 10) : null
            })(),
          }))
          .filter((i) => i.itemId !== null),
    )

    for (const img of images) {
      if (img.itemId !== null && !imageMap.has(img.itemId)) {
        // Aumentamos la resolución de la miniatura a 400px
        imageMap.set(img.itemId, img.src.replace(/=s\d+-rw/, '=s400-rw'))
      }
    }

    await page.close()
  } catch (e) {
    console.warn('[Farmatodo] Error obteniendo imágenes del DOM:', e)
  }

  return imageMap
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

    let fromAlgolia = 0
    let fromDom = 0
    let withoutImage = 0
    let withoutUrl = 0

    const results = hits
      .filter((hit: FarmatodoHit) => {
        // Descartamos productos sin precio o marcados como no disponibles
        if (!hit.fullPrice || hit.fullPrice <= 0) return false
        if (hit.available === false || hit.without_stock === true) return false
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
          const domImage = imageMap.get(hit.item)
          if (domImage) {
            imageUrl = domImage
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
          price: hit.fullPrice,
          url,
          available:
            hit.available !== false && hit.without_stock !== true,
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