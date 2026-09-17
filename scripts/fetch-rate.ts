import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import * as cheerio from 'cheerio'

async function main() {
  const res = await fetch('https://www.bcv.org.ve/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0' },
  })
  if (!res.ok) throw new Error(`BCV error ${res.status}`)
  const $ = cheerio.load(await res.text())

  // El BCV muestra la tasa USD dentro de un div con id "dolar"
  const text = $('#dolar strong, #dolar').first().text().trim() // ej: "43,85"
  const rate = parseFloat(text.replace('.', '').replace(',', '.'))
  if (isNaN(rate) || rate < 1) throw new Error(`No se pudo parsear la tasa: "${text}"`)

  await prisma.rate.create({ data: { currency: 'USD', rate } })
  console.log(`💵 Tasa del día: Bs. ${rate} por $1`)
}

main().catch(console.error).finally(() => prisma.$disconnect())