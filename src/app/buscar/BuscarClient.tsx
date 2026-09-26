'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const storeThemes = {
  'Farmacia SAAS': { color: '#43B97F', logo: '/logos/farmaciassaas.png' },
  Locatel: { color: '#009B77', logo: '/logos/locatel.png' },
  Farmago: { color: '#6D28D9', logo: '/logos/farmago.png', gradient: 'linear-gradient(90deg, #00CFE8, #6D28D9)' },
  'Gama en Línea': { color: '#F59E0B', logo: '/logos/gama.png' },
  Farmatodo: { color: '#1d5be1', logo: '/logos/farmatodo.png' },
  'Damasco': { color: '#B91C1C', logo: '/logos/damasco.jpg' },
  'Tiendas Daka': { color: '#fde400', logo: '/logos/daka.png' },
} as const

const suspendedStores = new Set(['EPA', 'Canguro', 'SoyTecno'])

function getStoreTheme(storeName: string) {
  return storeThemes[storeName as keyof typeof storeThemes] ?? { color: '#374151', logo: null }
}

function formatPriceVES(amount: number) {
  return amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPriceUSD(amount: number) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getPriceColor(value: number, min: number, max: number) {
  const factor = max === min ? 0 : (value - min) / (max - min)
  const hue = 140 - factor * 140
  return `hsl(${hue} 65% 35%)`
}

interface Product {
  id: string
  name: string
  brand: string | null
  imageUrl: string | null
  normalized: string
  store: { name: string }
  prices: Array<{
    amount: number
    currency: string
    url: string
    capturedAt: Date
  }>
  inVES: number
}

interface SearchResult {
  products: Product[]
  totalCount: number
  hasMore: boolean
}

const ITEMS_PER_PAGE = 50

function uniqueProducts(products: Product[]) {
  return Array.from(
    new Map(products.map((product) => [product.id, product])).values(),
  )
}
