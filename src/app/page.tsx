'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const stores = [
  {
    name: 'Farmacias Saas',
    shortName: 'Saas',
    color: '#43B97F',
    gradient: 'linear-gradient(135deg, #ebebeb, #8efa93f6)',
    icon: '💊',
    logo: '/logos/farmaciassaas.png',
  },
  {
    name: 'Locatel',
    shortName: 'Locatel',
    color: '#009B77',
    gradient: 'linear-gradient(135deg, #009B77DD, #006B55AA)',
    icon: '🏪',
    logo: '/logos/locatel.png',
  },
  {
    name: 'Farma Go',
    shortName: 'Farma Go',
    color: '#00CFE8',
    gradient: 'linear-gradient(135deg, #00CFE8DD, #6D28D9CC)',
    icon: '🚀',
    logo: '/logos/farmago.png',
  },
  {
    name: 'Damasco',
    shortName: 'Damasco',
    color: '#E60012',
    gradient: 'linear-gradient(135deg, #E60012DD, #B3000ECC)',
    icon: '🏠',
    logo: '/logos/damasco.jpg',
  },
  // Canguro: suspendido por bloqueo de Cloudflare.
  // SoyTecno: suspendido por bloqueo de Cloudflare.
  // EPA: suspendido mientras su sitio permanece en mantenimiento.
  {
      name: 'Gama en Línea',
      shortName: 'Gama',
      color: '#9B111E',
      gradient: 'linear-gradient(135deg, #B21F32DD, #720817CC)',
      icon: '🛒',
      logo: '/logos/gama.png',
  },
  {
      name: 'Farmatodo',
      shortName: 'Farmatodo',
      color: '#173B8F',
      gradient: 'linear-gradient(135deg, #244DA8DD, #0B205CCC)',
      icon: '🧴',
      logo: '/logos/farmatodo.png',
  },
  {
      name: 'Tiendas Daka',
      shortName: 'Daka',
      color: '#ebe715',
      gradient: 'linear-gradient(135deg, #ecf010, #0560f3cc)',
      icon: '🛍️',
      logo: '/logos/daka.png',
  },
]

const features = [
  {
    icon: '🔍',
    title: 'Compara al instante',
    description: 'Buscamos el mismo producto en múltiples tiendas simultáneamente.',
  },
  {
    icon: '💰',
    title: 'Ahorra dinero',
    description: 'Ve todos los precios juntos y elige la mejor oferta por el mismo producto.',
  },
  {
    icon: '🔗',
    title: 'Compra directo',
    description: 'Te llevamos a la tienda oficial. Sin comisiones, sin intermediarios.',
  },
  {
    icon: '⚡',
    title: 'Tiempo real',
    description: 'Precios actualizados constantemente para que no te pierdas ninguna oferta.',
  },
  {
    icon: '📱',
    title: 'App móvil (Proximamente)',
    description: 'Proximamente al alcance de tu mano. Compara precios desde tu celular en cualquier momento.',
  },
  {
    icon: '🔒',
    title: 'Privacidad total',
    description: 'Sin registro, sin tracking, sin datos personales. Solo buscas y comparas.',
  },
]

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 61) % 100,
      size: (i % 4) + 1,
      delay: (i % 5) * 0.8,
      drift: ((i % 5) - 2) * 4,
      duration: 15 + (i % 6),
    }))

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          initial={false}
          animate={{
            y: [-10, 110, -10],
            x: [p.x, p.x + p.drift, p.x],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

function StoreCard({ pharmacy, index }: { pharmacy: typeof stores[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: '4/3' }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
    >
      <div className="absolute inset-0" style={{ background: pharmacy.gradient }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {pharmacy.logo ? (
        <motion.img
          src={pharmacy.logo}
          alt={pharmacy.name}
          className="absolute inset-0 w-full h-full object-contain p-8 opacity-90"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          whileHover={{ scale: 1.1 }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
        >
          <motion.span
            className="text-7xl md:text-9xl mb-4 filter drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {pharmacy.icon}
          </motion.span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-center">
            {pharmacy.name}
          </h3>
        </motion.div>
      )}

      <motion.div
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white/90 backdrop-blur-sm"
        style={{ backgroundColor: `${pharmacy.color}CC` }}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.1 + 0.5, type: 'spring', stiffness: 200 }}
      >
        {pharmacy.shortName}
      </motion.div>

      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="px-6 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-sm border border-white/20"
              style={{ backgroundColor: `${pharmacy.color}EE` }}
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Ver productos →
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      className="group relative rounded-2xl border border-emerald-800 bg-emerald-950/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-600 hover:bg-emerald-950"
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <motion.div
        className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4"
        style={{ background: 'linear-gradient(135deg, #10b98144, #05966944)' }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {feature.icon}
      </motion.div>
      <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-300 transition-colors">
        {feature.title}
      </h3>
      <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
      
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
        style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: index * 0.08 + 0.3 }}
      />
    </motion.div>
  )
}

function HeroSection() {
  return (
    <motion.section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <FloatingParticles />
      
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center py-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-emerald-300"
          style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ background: '#10b981' }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Comparador de precios de tiendas en Venezuela
        </motion.span>

        <motion.h1
          className="mt-6 text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Chippie
            <span className="text-emerald-400">.ve</span>
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Compara precios de los mismos productos en <span className="font-semibold text-emerald-300"> Diferentes tiendas </span>
          y encuéntralo al  <span className="font-semibold text-emerald-300"> mejor precio</span>. Sin registrarte. Sin letra pequeña.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link
            href="/buscar"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-lg font-semibold text-white overflow-hidden hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-600/30"
          >
            <span className="relative z-10">Buscar productos →</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </Link>
          
          <motion.button
            className="relative inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:border-emerald-600 hover:bg-emerald-950 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </motion.svg>
            Cómo funciona
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-8 text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <span>Precios en tiempo real</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <span>las tiendas principales de tu día a día</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
            <span>Sin registro requerido</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.2, duration: 1.5, repeat: Infinity }}
      >
        <motion.svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.div>
    </motion.section>
  )
}

function StoresSection() {
  const [storeOffset, setStoreOffset] = useState(0)
  const visibleStores = Array.from({ length: 3 }, (_, index) =>
    stores[(storeOffset + index) % stores.length],
  )

  function moveStores(direction: number) {
    setStoreOffset((current) =>
      (current + direction + stores.length) % stores.length,
    )
  }

  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 mx-auto grid max-w-6xl -translate-y-1/2 grid-cols-2 gap-6 opacity-50 sm:grid-cols-3 lg:grid-cols-5">
        {stores.map((store, index) => (
          <motion.div
            key={`background-${store.name}`}
            className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-950/40 p-4 text-center text-lg font-bold text-emerald-100/60 blur-[5px]"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 0.45, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.08 }}
          >
            {store.name}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span className="text-emerald-400 font-medium text-sm tracking-wider uppercase">
            Nuestras tiendas
          </motion.span>
          <motion.h2 className="mt-3 text-4xl md:text-5xl font-extrabold">
            Comparamos en las principales <span className="text-emerald-400">tiendas de Venezuela</span>
          </motion.h2>
          <motion.p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Monitoreamos precios en las cadenas más grandes para que siempre encuentres la mejor oferta
          </motion.p>
        </motion.div>

        <motion.div
          className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visibleStores.map((store, index) => (
              <motion.div
                key={`${store.name}-${storeOffset}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <StoreCard pharmacy={store} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Tiendas anteriores"
            onClick={() => moveStores(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-700 bg-emerald-950/70 text-xl text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-900"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Siguientes tiendas"
            onClick={() => moveStores(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-700 bg-emerald-950/70 text-xl text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-900"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 px-6 bg-gradient-to-b from-emerald-950/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span className="text-emerald-400 font-medium text-sm tracking-wider uppercase">
            Por qué Chippie
          </motion.span>
          <motion.h2 className="mt-3 text-4xl md:text-5xl font-extrabold">
            Todo lo que necesitas para <span className="text-emerald-400">ahorrar en tus compras</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <FeatureCard feature={feature} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-black to-emerald-950/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]" />
      
      <FloatingParticles />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 className="text-4xl md:text-5xl font-extrabold">
          ¿Listo para <span className="text-emerald-400">empezar a ahorrar</span>?
        </motion.h2>
        <motion.p className="mt-4 text-lg text-white/70">
          Busca cualquier producto y compara precios al instante en Farmacias Saas, Locatel y Farma Go
        </motion.p>
        
        <motion.div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a
            href="/buscar"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-10 py-5 text-xl font-semibold text-white overflow-hidden hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-xl shadow-emerald-600/40"
            whileHover={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Comenzar a comparar →</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </motion.a>
        </motion.div>

        <motion.p className="mt-8 text-sm text-white/50">
          Gratis · Sin registro · Resultados en segundos
        </motion.p>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-emerald-950/20 to-black text-white">
      <HeroSection />
      <StoresSection />
      <FeaturesSection />
      <CTASection />
      
      <footer className="relative py-12 px-6 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            Chippie.ve - Comparador de precios independiente. No afiliado a ninguna tienda.
          </p>
          <p className="mt-2 text-white/30 text-xs">
            Los precios son referenciales y pueden variar. Verifica en la tienda antes de comprar.
          </p>
          <p className="mt-2 text-white/30 text-xs">
            Developed with ❤️ by GGLLUUMM (Denzel Frias) Caracas. Venezuela 
          </p>
        </div>
      </footer>
    </main>
  )
}