import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'locatelvenezuela.vteximg.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.vteximg.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.farmago.com.ve',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gamaenlinea.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'egb2c.cl94ncbhsi-excelsior1-p1-public.model-t.cc.commerce.ondemand.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.farmaciasaas.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.farmatodo.com.ve',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
