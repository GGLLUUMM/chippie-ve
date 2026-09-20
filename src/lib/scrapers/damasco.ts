const BASE = 'https://www.damascovzla.com'
import { fetchThroughBrowser } from '../browser'

export async function fetchDamasco(query: string) {
  const url = `${BASE}/api/catalog_system/pub/products/search/?ft=${encodeURIComponent(query)}&_from=0&_to=19`
  let items: unknown[]
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) throw new Error(`Damasco error ${res.status}`)
    items = await res.json()
  } catch {
    const fallback = await fetchThroughBrowser(url)
    if (fallback.status < 200 || fallback.status >= 300) throw new Error(`Damasco error ${fallback.status}`)
    items = JSON.parse(fallback.body)
  }

  
  return items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      name: p.productName,
      brand: p.brand ?? null,
      normalized: p.productName.toLowerCase().trim(),
      imageUrl: p.items?.[0]?.images?.[0]?.imageUrl ?? null,
      price: p.items?.[0]?.sellers?.[0]?.commertialOffer?.Price,
      url: new URL(p.link, BASE).toString(),
      available: p.items?.[0]?.sellers?.[0]?.commertialOffer?.AvailableQuantity > 0,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.available && p.price)
}