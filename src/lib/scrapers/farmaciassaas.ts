const BASE = 'https://www.farmaciasaas.com'

export async function fetchFarmaciaSAAS(query: string) {
  const res = await fetch(
    `${BASE}/api/catalog_system/pub/products/search/?ft=${encodeURIComponent(query)}&_from=0&_to=19`
  )
  if (!res.ok) throw new Error(`SAAS error ${res.status}`)
  const items = await res.json()

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