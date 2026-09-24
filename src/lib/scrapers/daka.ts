import { getBrowser } from '../browser'

const BASE = 'https://daka.tiendasdaka.com'

export async function fetchDaka(query: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    // 1. Configuración para parecer un navegador real
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept-Language': 'es-VE,es;q=0.9,en-US;q=0.8,en;q=0.7',
    })

    // 2. Navegación a la página de resultados
    const searchUrl = `${BASE}/ve/results/${encodeURIComponent(query)}?q=${encodeURIComponent(query)}`
    console.log(`[Daka] Buscando en: ${searchUrl}`)

    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 })
    } catch {
      console.log('[Daka] Networkidle timeout, intentando continuar...')
    }

    // Espera adicional para renderizado de JS
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // --- Scroll automático optimizado ---
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 500
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= scrollHeight || totalHeight > 4000) {
            clearInterval(timer)
            resolve()
          }
        }, 300)
      })
    })

    // 3. Extracción ultra-flexible
    const products = await page.evaluate(() => {
      type RawProduct = {
        name: string
        priceText: string
        url: string
        imageUrl: string
        available: boolean
      }

      const results: RawProduct[] = []

      // Convertimos el NodeList en un Array para poder usar .filter()
      const allElements = Array.from(document.querySelectorAll<HTMLElement>('*'))

      const priceElements = allElements.filter(
        (el) => el.children.length === 0 && /Bs\.?\s?[\d.,]+/i.test(el.innerText)
      )

      priceElements.forEach((priceEl) => {
        // Subimos al ancestro más cercano que parezca una tarjeta
        const card = priceEl.closest<HTMLElement>('div, section, li, a')
        if (!card) return

        const nameEl = card.querySelector<HTMLElement>(
          'h3, [class*="name"], [class*="title"], span[class*="product"], a'
        )
        const linkEl =
          card.querySelector<HTMLAnchorElement>('a') ||
          (card.tagName === 'A' ? (card as HTMLAnchorElement) : null)
        const imgEl = card.querySelector<HTMLImageElement>('img')

        if (nameEl && linkEl) {
          const priceText = priceEl.innerText
          const priceMatch = priceText.match(/[\d.,]+/)

          if (priceMatch) {
            results.push({
              name: nameEl.innerText.trim(),
              priceText: priceMatch[0],
              url: linkEl.getAttribute('href') || '',
              imageUrl:
                imgEl?.getAttribute('src') ||
                imgEl?.getAttribute('data-src') ||
                '',
              available: true,
            })
          }
        }
      })

      // Eliminar duplicados basados en el nombre
      const seen = new Set<string>()
      return results.filter((p) => {
        const dup = seen.has(p.name)
        seen.add(p.name)
        return !dup
      })
    })

    console.log(
      `[Daka] Éxito: ${products.length} productos encontrados via DOM Flexible`
    )

    // 5. Formateo final y limpieza de precios
    return products
      .map((p) => {
        // Limpieza de precio ultra-robusta
        let cleanPrice = p.priceText.replace(/[^\d,.]/g, '')

        // Formato latino: 1.200,50 -> 1200.50
        if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
          cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.')
        } else if (cleanPrice.includes(',')) {
          // Si solo hay coma, asumimos separador decimal
          cleanPrice = cleanPrice.replace(',', '.')
        }

        const finalPrice = parseFloat(cleanPrice)

        return {
          name: p.name,
          brand: null as string | null,
          normalized: p.name.toLowerCase().trim(),
          imageUrl: p.imageUrl
            ? p.imageUrl.startsWith('http')
              ? p.imageUrl
              : new URL(p.imageUrl, BASE).toString()
            : null,
          price: finalPrice,
          url: p.url.startsWith('http')
            ? p.url
            : new URL(p.url, BASE).toString(),
          available: p.available,
        }
      })
      .filter((p) => {
        if (!p.name || isNaN(p.price)) {
          return false
        }
        return true
      })
  } catch (error) {
    console.error(`[Daka] Error crítico de scraping: ${error}`)
    return []
  } finally {
    await page.close().catch(() => {})
  }
}