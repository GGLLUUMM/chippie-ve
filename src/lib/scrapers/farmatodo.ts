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
}

async function fetchFromAlgolia(query: string, page = 0, hitsPerPage = 20): Promise<FarmatodoHit[]> {
  const body = {
    requests: [{
      indexName: 'products',
      query,
      params: `hitsPerPage=${hitsPerPage}&page=${page}&facets=*&maxValuesPerFacet=100`
    }]
  }

  const res = await fetch(`${ALGOLIA_API}?x-algolia-agent=Algolia%20for%20JavaScript%20(4.25.3)%3B%20Browser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Farmatodo Algolia error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.results?.[0]?.hits || []
}

function buildProductUrl(itemId: number, url?: string | null): string {
  if (url) return new URL(url, BASE).toString()
  return `${BASE}/producto/${itemId}`
}

function parsePrice(fullPrice: number): number {
  return fullPrice
}

async function fetchImagesFromSearchPage(query: string): Promise<Map<number, string>> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  const imageMap = new Map<number, string>()

  try {
    await page.goto(`${BASE}/buscar?product=${encodeURIComponent(query)}&departamento=Todos&filtros=`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    await page.waitForSelector('[class*="product"] img, [class*="gallery"] img', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)

    const images = await page.$$eval('[class*="product"] img, [class*="gallery"] img, article img', (imgs: HTMLImageElement[]) => 
      imgs
        .filter(img => img.src.includes('lh3.googleusercontent.com') && img.alt)
        .map(img => {
          const itemMatch = img.src.match(/[?&]item=(\d+)/)
          const alt = img.alt.trim()
          return { src: img.src, itemId: itemMatch ? parseInt(itemMatch[1]) : null, alt }
        })
        .filter(i => i.itemId)
    )

    for (const img of images) {
      if (!imageMap.has(img.itemId!)) {
        imageMap.set(img.itemId!, img.src.replace(/=s\d+-rw/, '=s400-rw'))
      }
    }
  } catch (e) {
    console.warn('Farmatodo image fetch failed:', e)
  }

  return imageMap
}

export async function fetchFarmatodo(query: string) {
  try {
    const [hits, imageMap] = await Promise.all([
      fetchFromAlgolia(query),
      fetchImagesFromSearchPage(query),
    ])

    const results = hits
      .filter((hit: FarmatodoHit) => hit.fullPrice && hit.fullPrice > 0)
      .map((hit: FarmatodoHit) => {
        const realImage = imageMap.get(hit.item) || hit.listUrlImages?.[0] || null
        
        return {
          name: hit.description,
          brand: hit.brand || hit.marca || null,
          normalized: hit.description.toLowerCase().trim(),
          imageUrl: realImage,
          price: parsePrice(hit.fullPrice),
          url: buildProductUrl(hit.item, hit.url),
          available: hit.available !== false && hit.without_stock !== true,
        }
      })
      .filter((p) => p.name && p.price > 0)

    console.log(`Farmatodo (Algolia+images): ${results.length} productos`)
    return results
  } catch (error) {
    console.error('Farmatodo scraper error:', error)
    return []
  }
}