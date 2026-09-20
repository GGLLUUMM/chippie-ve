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

export async function fetchThroughBrowser(url: string): Promise<{ status: number; body: string }> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
    return { status: response?.status() ?? 0, body: response ? (await response.body()).toString('utf8') : '' }
  } finally {
    await page.close().catch(() => {})
  }
}