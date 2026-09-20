import { NextRequest, NextResponse } from 'next/server'

// Whitelist de dominios permitidos (sin protocolo, sin www)
const ALLOWED_HOSTS = [
  'locatel.com.ve',
  'vteximg.com.br',
  'vtexassets.com',
  'farmaciasaas.com',
  'farmago.com.ve',
  'damascovzla.com',
  'mercadolibre.com',
  'mlstatic.com',
  'googleusercontent.com',
  'epaenlinea.com',
  'cangurovenezuela.com',
  'soytechno.com',
  'farmatodo.com',
  'farmatodo.com.ve',
  'commerce.ondemand.com',
  'cloudfront.net',
  'arcadier.io',
  'shopify.com',
  'shopifycdn.com',
  'shopifycdn.net',
]

function isAllowed(hostname: string) {
  return ALLOWED_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  )
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return new NextResponse('Invalid protocol', { status: 400 })
  }

  if (!isAllowed(target.hostname)) {
    return new NextResponse('Host not allowed', { status: 403 })
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: 'image/*,*/*;q=0.8',
    },
  })

  if (!upstream.ok || !upstream.body) {
    return new NextResponse('Upstream error', { status: 502 })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}