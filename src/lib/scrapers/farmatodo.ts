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
  // fullPrice appears to be in cents (e.g., 2450 = 24.50 VES)
  return fullPrice / 100
}

export async function fetchFarmatodo(query: string) {
  try {
    const hits = await fetchFromAlgolia(query)

    const results = hits
      .filter((hit: FarmatodoHit) => hit.fullPrice && hit.fullPrice > 0)
      .map((hit: FarmatodoHit) => {
        const rawImage = hit.listUrlImages?.[0] || null
        
        return {
          name: hit.description, // Use description for actual product name
          brand: hit.brand || hit.marca || null,
          normalized: hit.description.toLowerCase().trim(),
          imageUrl: rawImage,
          price: parsePrice(hit.fullPrice),
          url: buildProductUrl(hit.item, hit.url),
          available: hit.available !== false && hit.without_stock !== true,
        }
      })
      .filter((p) => p.name && p.price > 0)

    console.log(`Farmatodo (Algolia): ${results.length} productos`)
    return results
  } catch (error) {
    console.error('Farmatodo scraper error:', error)
    return []
  }
}