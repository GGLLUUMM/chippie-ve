// gama.ts
import * as cheerio from 'cheerio'

const BASE = 'https://gamaenlinea.com'

export async function fetchGama(query: string) {
  const res = await fetch(
    `${BASE}/es/search/${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept-Language': 'es-VE,es;q=0.9',
      },
    }
  )
  if (!res.ok) throw new Error(`Gama error ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = []

  $('cx-product-grid-item').each((_, el) => {
    const card = $(el)

    // Nombre: hay que quitar el <em class="search-results-highlight"> interno
    const nameEl = card.find('a.cx-product-name h3').first()
    if (!nameEl.length) return
    // clonamos para no mutar el DOM original
    const nameClone = nameEl.clone()
    nameClone.find('em').each((_, em) => {
      // reemplazamos el <em> por su texto
      const $em = nameClone.find('em').first()
      $em.replaceWith($em.text())
    })
    const name = nameClone.text().trim().replace(/\s+/g, ' ')

    // Precio: " Total Ref. 1,52 " → 1.52
    const priceText = card.find('.cx-product-price span').first().text().trim()
    const priceMatch = priceText.match(/([\d.,]+)/)
    if (!priceMatch) return
    // Formato VE: "1.432,18" → 1432.18
    const price = parseFloat(
      priceMatch[1].replace(/\./g, '').replace(',', '.')
    )
    if (isNaN(price)) return

    // Link
    const href =
      card.find('a.cx-product-image-container').attr('href') ??
      card.find('a.cx-product-name').attr('href') ??
      ''
    if (!href) return
    const url = new URL(href, BASE).toString()

    // Imagen
    const img = card.find('cx-media img').attr('src') ?? null
    const imageUrl = img ? new URL(img, BASE).toString() : null

    // Categoría (a veces sirve como "marca" aproximada)
    const category = card.find('.item-category').text().trim() || null

    // Disponibilidad
    const available = card.find('.out-of-stock-label').length === 0

    results.push({
      name,
      brand: null,          // Gama no expone marca directamente en el grid
      category,             // la guardamos por si te sirve
      normalized: name.toLowerCase().trim(),
      imageUrl,
      price,
      url,
      available,
    })
  })

  console.log(`Gama: ${results.length} productos`)
  return results
}