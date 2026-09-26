import { syncQuery } from '@/lib/sync'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60 // segundos (Pro), 10 en Hobby

export async function GET(request: Request) {
  // Verifica un secreto para que solo Vercel Cron pueda llamar esto
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Aquí decides qué queries sincronizar (ej: las más buscadas, o una lista fija)
  const queries = ['paracetamol', 'ibuprofeno', 'agua', 'leche']
  
  for (const q of queries) {
    await syncQuery(q)
  }

  return NextResponse.json({ ok: true })
}