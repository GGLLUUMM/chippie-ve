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
  'Damasco': { color: '#B91C1C', logo: '/logos/damasco.png' },
  'EPA': { color: '#169ef9', logo: '/logos/epa.png' },
  'Canguro': { color: '#FACC15', logo: '/logos/canguro.png' },
  'SoyTecno': { color: '#1a28f3', logo: '/logos/soytecno.png' },
} as const

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

function SkeletonCard() {
  return (
    <motion.div
      className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4 min-h-[330px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 h-40 w-full rounded-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 animate-pulse" />
      <div className="h-5 w-3/4 rounded bg-white/10 animate-pulse mb-2" />
      <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse mb-3" />
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-full bg-white/10 animate-pulse" />
        <div className="h-5 w-20 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="mt-auto flex gap-2">
        <div className="flex-1 h-10 rounded-lg bg-white/10 animate-pulse" />
      </div>
    </motion.div>
  )
}

function ProductCard({ product, index, minPrice, maxPrice }: { product: Product; index: number; minPrice: number; maxPrice: number }) {
  const price = product.prices[0]
  const storeTheme = getStoreTheme(product.store.name)
  const priceColor = getPriceColor(product.inVES, minPrice, maxPrice)
  const inUSD = price.currency === 'USD'

  return (
    <motion.li
      key={product.id}
      layout
      className="group relative flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4 min-h-[330px] backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)]"
      style={{ borderColor: `${storeTheme.color}44` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: 'easeOut' }}
    >
      <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-white/5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-30">📦</div>
        )}
        <AnimatePresence>
          {inUSD && (
            <motion.div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'gradient' in storeTheme && storeTheme.gradient ? storeTheme.gradient : storeTheme.color }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              USD
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col">
        <p className="line-clamp-2 font-medium text-white leading-snug group-hover:text-emerald-100 transition-colors">
          {product.name}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {storeTheme.logo && (
            <Image
              src={storeTheme.logo}
              alt=""
              width={28}
              height={28}
              className="h-6 w-6 rounded-full object-contain bg-white/5 p-1"
            />
          )}
          <p
            className="line-clamp-1 text-sm font-semibold"
            style={
              'gradient' in storeTheme && storeTheme.gradient
                ? {
                    backgroundImage: storeTheme.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }
                : { color: storeTheme.color }
            }
          >
            {product.store.name}
          </p>
        </div>

        <motion.p
          className="mt-3 text-2xl font-extrabold tracking-tight"
          style={{ color: priceColor }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + index * 0.03, type: 'spring', stiffness: 200 }}
        >
          Bs.{formatPriceVES(product.inVES)}
        </motion.p>

        {inUSD && (
          <p className="mt-1 text-xs text-gray-400">
            ≈ ${formatPriceUSD(Number(price.amount))}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Actualizado {new Date(price.capturedAt).toLocaleDateString('es-VE')}
        </p>

        <motion.a
          href={price.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          style={{ background: `linear-gradient(135deg, ${storeTheme.color}CC, ${storeTheme.color}88)` }}
          whileHover={{ scale: 1.02, boxShadow: `0 8px 25px -5px ${storeTheme.color}66` }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Comprar
        </motion.a>
      </div>
    </motion.li>
  )
}

function LoadingWave() {
  return (
    <motion.div
      className="flex items-end justify-center gap-1 h-8"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ background: 'linear-gradient(180deg, #10b981, #059669)' }}
          animate={{ height: ['4px', '24px', '4px'] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )
}

function SearchBar({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  const [focused, setFocused] = useState(false)
  const [inputValue, setInputValue] = useState(query)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) onSearch(inputValue.trim())
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div
        className="relative flex-1"
        style={{
          boxShadow: focused
            ? '0 0 0 3px rgba(16, 185, 129, 0.2), 0 20px 40px -10px rgba(16, 185, 129, 0.1)'
            : '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-emerald-400/10 opacity-0 pointer-events-none"
          animate={{ opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ej: arroz, acetaminofen, shampoo..."
          className="w-full rounded-xl bg-black/40 border border-emerald-800 px-5 py-4 text-white placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 backdrop-blur-sm"
          autoComplete="off"
        />
        {inputValue && (
          <motion.button
            type="button"
            onClick={() => setInputValue('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Limpiar búsqueda"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={!inputValue.trim()}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)' }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar
        </span>
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0"
          animate={{ opacity: focused ? 1 : 0 }}
        />
      </motion.button>
    </motion.form>
  )
}

function ResultsHeader({ query, count, stores }: { query: string; count: number; stores: string[] }) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div>
        <p className="text-lg text-gray-300">
          {count} resultado{count !== 1 ? 's' : ''} para <span className="font-semibold text-white">“{query}”</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Buscando en {stores.join(', ')}
        </p>
      </div>
      <motion.div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-medium text-emerald-300 bg-emerald-900/30 border border-emerald-800">
          Orden: Menor precio
        </span>
      </motion.div>
    </motion.div>
  )
}

function LoadMoreButton({ onClick, loading, hasMore }: { onClick: () => void; loading: boolean; hasMore: boolean }) {
  if (!hasMore) return null

  return (
    <motion.div className="mt-10 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.button
        onClick={onClick}
        disabled={loading}
        className="relative flex items-center justify-center gap-3 rounded-xl border border-emerald-800 bg-black/40 px-8 py-4 font-medium text-white backdrop-blur-sm hover:border-emerald-500/50 hover:bg-emerald-900/20 disabled:opacity-50 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{loading ? 'Cargando más...' : 'Ver más productos'}</span>
        {loading && <LoadingWave />}
        <motion.svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          animate={{ rotate: loading ? 360 : 0 }}
          transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </motion.svg>
      </motion.button>
    </motion.div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-900/30"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-12 h-12 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2">No hay resultados para “{query}”</h3>
      <p className="text-gray-400 max-w-sm mx-auto">
        Intenta con términos más genéricos o revisa la ortografía.
      </p>
    </motion.div>
  )
}

export default function BuscarClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storesSearched, setStoresSearched] = useState<string[]>([])

  const minPrice = products.length > 0 ? products[0].inVES : 0
  const maxPrice = products.length > 0 ? products[products.length - 1].inVES : 0

  const fetchProducts = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query,
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      })

      const res = await fetch(`/api/buscar?${params.toString()}`)
      if (!res.ok) throw new Error('Error al buscar')

      const data: SearchResult = await res.json()

      const pageProducts = uniqueProducts(data.products)

      if (isLoadMore) {
        setProducts((previousProducts) =>
          uniqueProducts([...previousProducts, ...pageProducts]),
        )
      } else {
        setProducts(pageProducts)
      }
      setHasMore(data.hasMore)
      setStoresSearched([...new Set(pageProducts.map((p) => p.store.name))])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [query])

  const handleSearch = (q: string) => {
    setQuery(q)
    setPage(1)
    router.push(`/buscar?q=${encodeURIComponent(q)}`)
  }

  useEffect(() => {
    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return

      if (query.trim()) {
        void fetchProducts(1)
      } else {
        setProducts([])
        setHasMore(true)
        setStoresSearched([])
        setPage(1)
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [query, fetchProducts])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, true)
      setPage(p => p + 1)
    }
  }

  if (!query.trim()) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-emerald-950/30 to-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
          <motion.h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Buscar en <span className="text-emerald-400">Chippie</span>
          </motion.h1>
          <p className="text-xl text-gray-400 mb-10">Escribe un producto para comparar precios en todas las tiendas</p>
          <SearchBar query="" onSearch={handleSearch} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-emerald-950/30 to-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>

        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Buscar en <span className="text-emerald-400">Chippie</span>
          </h1>
          <p className="mt-2 text-gray-400">Compara precios en todas las tiendas disponibles</p>
        </motion.header>

        <SearchBar query={query} onSearch={handleSearch} />

        {error && (
          <motion.div
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="flex flex-col items-center gap-6">
                <LoadingWave />
                <motion.p className="text-gray-400 text-center max-w-md">
                  Buscando <span className="font-semibold text-emerald-300">“{query}”</span> en todas las tiendas...
                </motion.p>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {products.length > 0 && (
                <ResultsHeader query={query} count={products.length} stores={storesSearched} />
              )}

              <AnimatePresence mode="popLayout">
                <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                    />
                  ))}
                </ul>
              </AnimatePresence>

              {products.length === 0 && !loading && <EmptyState query={query} />}

              <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} hasMore={hasMore} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}