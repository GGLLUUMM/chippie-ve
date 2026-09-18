const API =
  'https://api.cl94ncbhsi-excelsior1-p1-public.model-t.cc.commerce.ondemand.com/occ/v2/egb2c-spa/products/search'
const BASE = 'https://gamaenlinea.com'

// Mismo patrón de fields que usa la propia página de Gama (simplificado)
const FIELDS =
  'products(code,name,seoName,url,summary,price(FULL),images(FULL),stock(FULL)),pagination(DEFAULT)'

export async function fetchGama(query: string) {
  const params = new URLSearchParams({
    fields: FIELDS,
    query,
    pageSize: '20',
    lang: 'es',
    curr: 'REF',
    warehouse: 'S007',
  })

  const res = await fetch(`${API}?${params.toString()}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0',
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Gama error ${res.status}`)
  const data = await res.json()

  return (data.products ?? [])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.price?.value != null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      name: p.name,
      brand: null,
      normalized: p.name.toLowerCase().trim(),
      imageUrl: p.images?.[0]?.url
        ? new URL(p.images[0].url, BASE).toString()
        : null,
      price: p.price.value, // "Ref." = dólares referenciales
      url: p.url
        ? new URL(p.url, BASE).toString()
        : `${BASE}/p/${p.seoName ?? p.code}`,
      available: p.stock?.stockLevelStatus !== 'outOfStock',
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.available)
}