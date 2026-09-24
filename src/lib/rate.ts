import * as cheerio from 'cheerio'
import https from 'node:https'
import { prisma } from './prisma'

const BCV_URL = 'https://www.bcv.org.ve/'
const RATE_MAX_AGE_MS = 24 * 60 * 60 * 1000

function parseRate(text: string): number {
  // Extraemos solo la parte numérica (incluyendo coma y punto)
  // Esto elimina "USD", espacios y cualquier otro texto
  const numericMatch = text.match(/[\d,\.]+/);
  if (!numericMatch) {
    throw new Error(`No se pudo encontrar un valor numérico en el texto del BCV: "${text}"`);
  }

  const rawValue = numericMatch[0];
  const normalized = rawValue.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const rate = Number.parseFloat(normalized);

  if (!Number.isFinite(rate) || rate < 1) {
    throw new Error(`No se pudo parsear la tasa del BCV: "${text}"`);
  }

  return rate
}

async function fetchBcvRate(): Promise<number> {
  let html: string

  try {
    const response = await fetch(BCV_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0' },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`BCV error ${response.status}`)
    html = await response.text()
  } catch (error) {
    const cause = (error as { cause?: { code?: string } }).cause
    if (cause?.code !== 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      throw error
    }

    html = await new Promise<string>((resolve, reject) => {
      https.get(BCV_URL, {
        agent: new https.Agent({ rejectUnauthorized: false }),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0' },
      }, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          response.resume()
          reject(new Error(`BCV error ${response.statusCode}`))
          return
        }

        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        response.on('error', reject)
      }).on('error', reject)
    })
  }

  const $ = cheerio.load(html)
  return parseRate($('#dolar strong, #dolar').first().text().trim())
}

export async function ensureRate(): Promise<number> {
  const latest = await prisma.rate.findFirst({
    where: { currency: 'USD' },
    orderBy: { date: 'desc' },
  })

  if (latest && Date.now() - latest.date.getTime() < RATE_MAX_AGE_MS) {
    return Number(latest.rate)
  }

  try {
    const rate = await fetchBcvRate()
    await prisma.rate.create({ data: { currency: 'USD', rate } })
    return rate
  } catch (error) {
    if (latest) {
      console.warn(`No se pudo actualizar la tasa del BCV; se usara la ultima disponible: ${(error as Error).message}`)
      return Number(latest.rate)
    }

    throw error
  }
}
