import { chromium, type Browser } from 'playwright'

let browserPromise: Promise<Browser> | null = null

export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    // Intenta Chrome instalado; si no, usa el Chromium de Playwright
    browserPromise = chromium.launch({ channel: 'chrome', headless: true }).catch(() =>
      chromium.launch({ headless: true })
    )
    browserPromise.catch(() => { browserPromise = null })
  }
  return browserPromise
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null)
    browserPromise = null
    if (b) await b.close().catch(() => {})
  }
}