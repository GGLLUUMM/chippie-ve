import * as cheerio from 'cheerio'

const BASE = 'https://www.farmago.com.ve'

export async function fetchFarmago(query: string) {
  const res = await fetch(
    `${BASE}/website/search?search=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
    }
  )
  if (!res.ok) throw new Error(`Farmago error ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)
  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = []

  // Cada resultado es un <a class="dropdown-item"> con nombre, precio e imagen dentro
  $('a.dropdown-item').each((_, el) => {
    const card = $(el)
    const name = card.find('.o_search_result_item_detail .h6').text().trim()
    const priceText = card.find('.oe_currency_value').first().text().trim() // ej: "1.432,18"
    const href = card.attr('href')
    const img = card.find('img').attr('src')

    if (!name || !priceText || !href) return

    // "1.432,18" → 1432.18 (formato venezolano: punto = miles, coma = decimales)
    const price = parseFloat(priceText.replace(/\./g, '').replace(',', '.'))
    if (isNaN(price)) return

    results.push({
      name,
      brand: null,
      normalized: name.toLowerCase().trim(),
      imageUrl: img ? new URL(img, BASE).toString() : null,
      price,
      url: new URL(href, BASE).toString(),
      available: true,
    })
  })

  console.log(`Farmago: ${results.length} productos`)
  return results
}