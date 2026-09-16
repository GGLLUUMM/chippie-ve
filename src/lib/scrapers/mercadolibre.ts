export async function fetchML(query: string) {
  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLV/search?q=${encodeURIComponent(query)}&limit=20`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept': 'application/json',
      },
    }
  )
  if (!res.ok) throw new Error(`ML error ${res.status}`)
  const data = await res.json()

  return data.results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.price && p.permalink)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      name: p.title,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      brand: p.attributes?.find((a: any) => a.id === 'BRAND')?.value_name ?? null,
      normalized: p.title.toLowerCase().trim(),
      price: p.price,
      url: p.permalink,
      available: true,
    }))
}