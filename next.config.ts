import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.locatel.com.ve' },
      { protocol: 'https', hostname: '**.vteximg.com.br' },
      { protocol: 'https', hostname: '**.vtexassets.com' },
      { protocol: 'https', hostname: '**.farmaciasaas.com' },
      { protocol: 'https', hostname: '**.farmago.com.ve' },
      { protocol: 'https', hostname: '**.damascovzla.com' },
      { protocol: 'https', hostname: '**.mercadolibre.com' },
      { protocol: 'https', hostname: '**.mlstatic.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.epaenlinea.com' },
      { protocol: 'https', hostname: '**.cangurovenezuela.com' },
      { protocol: 'https', hostname: '**.soytechno.com' },
      { protocol: 'https', hostname: '**.farmatodo.com' },
      { protocol: 'https', hostname: '**.farmatodo.com.ve' },
      { protocol: 'https', hostname: '**.commerce.ondemand.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },
}

export default nextConfig