'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

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
    title: 'App móvil (Próximamente)',
    description: 'Próximamente al alcance de tu mano. Compara precios desde tu celular en cualquier momento.',
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

function ScrollIndicator() {
  return (
    <motion.a
      href="#tiendas"
      className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-emerald-300 transition-colors group"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      aria-label="Desplázate para ver más"
    >
      <motion.span
        className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Desliza
      </motion.span>

      <motion.div
        className="relative flex h-10 w-6 sm:h-12 sm:w-7 items-start justify-center rounded-full border-2 border-white/40 group-hover:border-emerald-400 p-1"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="h-2 w-1 rounded-full bg-emerald-400"
          animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.svg
        className="w-4 h-4 text-emerald-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </motion.svg>
    </motion.a>
  )
}

function StoreCard({ pharmacy, index }: { pharmacy: typeof stores[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-pointer w-full"
      style={{ aspectRatio: '4/3' }}
      whileHover={{ scale: 1.03, y: -6 }}
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
          className="absolute inset-0 w-full h-full object-contain p-6 sm:p-8 opacity-90"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          whileHover={{ scale: 1.1 }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 text-white"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
        >
          <motion.span
            className="text-5xl sm:text-7xl md:text-8xl mb-4 filter drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {pharmacy.icon}
          </motion.span>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center">
            {pharmacy.name}
          </h3>
        </motion.div>
      )}

      <motion.div
        className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-1 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold text-white/90 backdrop-blur-sm"
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
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white backdrop-blur-sm border border-white/20"
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

function HowItWorksModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const steps = [
    {
      icon: '🔍',
      title: 'Escribe lo que buscas',
      description:
        'Escribe el nombre del producto que quieres comprar (ej. "nevera", "acetaminofén", "shampoo"). No necesitas registrarte ni crear cuenta.',
      color: '#10b981',
    },
    {
      icon: '⚡',
      title: 'Buscamos en todas las tiendas',
      description:
        'En segundos, consultamos simultáneamente los catálogos de Farmacias Saas, Locatel, Farma Go, Damasco, Gama, Farmatodo y Tiendas Daka.',
      color: '#22d3ee',
    },
    {
      icon: '💰',
      title: 'Comparamos precios',
      description:
        'Verás todos los productos encontrados ordenados por precio, con la tienda de origen, la imagen y el precio actualizado en bolívares.',
      color: '#a78bfa',
    },
    {
      icon: '🔗',
      title: 'Compra en la tienda oficial',
      description:
        'Al hacer clic en "Comprar", te llevamos directamente a la página del producto en la tienda oficial. Sin comisiones ni intermediarios.',
      color: '#f59e0b',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              className="pointer-events-auto relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-emerald-700/50 bg-gradient-to-br from-emerald-950 via-black to-emerald-950 shadow-2xl shadow-emerald-900/50"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="how-it-works-title"
            >
              <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-800 bg-black/40 text-emerald-300 backdrop-blur-sm transition hover:border-emerald-500 hover:bg-emerald-900/50 hover:text-white"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <div className="relative p-6 sm:p-8">
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <motion.div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
                    style={{
                      background: 'linear-gradient(135deg, #10b98133, #05966933)',
                      border: '1px solid #10b98155',
                    }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    💡
                  </motion.div>
                  <h2 id="how-it-works-title" className="text-2xl sm:text-3xl font-extrabold text-white">
                    ¿Cómo funciona <span className="text-emerald-400">Chippie</span>?
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Comparar precios nunca fue tan fácil. Solo 4 pasos.
                  </p>
                </motion.div>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.title}
                      className="group relative flex gap-4 rounded-2xl border border-emerald-900/70 bg-black/30 p-4 transition-colors hover:border-emerald-700 hover:bg-emerald-950/40"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: 'easeOut' }}
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${step.color}33, ${step.color}11)`,
                            border: `1px solid ${step.color}55`,
                          }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {step.icon}
                        </motion.div>
                        {index < steps.length - 1 && (
                          <div className="mt-2 w-px flex-1 bg-gradient-to-b from-emerald-700/60 to-transparent" />
                        )}
                      </div>

                      <div className="flex-1 pt-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>
                          Paso {index + 1}
                        </span>
                        <h3 className="mt-1 font-bold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-white/60">{step.description}</p>
                      </div>

                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                        style={{ background: step.color }}
                        initial={{ scaleY: 0 }}
                        whileHover={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-8 flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <Link
                    href="/buscar"
                    className="group relative flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 font-semibold text-white overflow-hidden transition-all hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-600/30"
                  >
                    <span className="relative z-10">Probar ahora →</span>
                    <motion.span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-emerald-800 bg-black/40 px-6 py-4 font-semibold text-white backdrop-blur-sm transition hover:border-emerald-600 hover:bg-emerald-950/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Entendido
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function HeroSection() {
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  return (
    <>
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
            Compara precios de los mismos productos en <span className="font-semibold text-emerald-300">Diferentes tiendas</span>
            {' '}y encuéntralo al <span className="font-semibold text-emerald-300">mejor precio</span>. Sin registrarte. Sin letra pequeña.
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
              <motion.span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <motion.button
              onClick={() => setShowHowItWorks(true)}
              className="relative inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:border-emerald-600 hover:bg-emerald-950 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </motion.svg>
              Cómo funciona
            </motion.button>
          </motion.div>

          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/50 text-sm"
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
              <span>Las tiendas principales de tu día a día</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
              <span>Sin registro requerido</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Indicador de scroll mejorado y visible */}
        <ScrollIndicator />
      </motion.section>

      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </>
  )
}

function StoresSection() {
  const [isPaused, setIsPaused] = useState(false)
  const [perView, setPerView] = useState(3)

  // Responsive: 1 en móvil, 2 en tablet, 3 en desktop
  useEffect(() => {
    const updatePerView = () => {
      const w = window.innerWidth
      if (w < 640) setPerView(1)
      else if (w < 1024) setPerView(2)
      else setPerView(3)
    }
    updatePerView()
    window.addEventListener('resize', updatePerView)
    return () => window.removeEventListener('resize', updatePerView)
  }, [])

  const [offset, setOffset] = useState(0)

  // Auto-avance cada 3.5s (pausa al hacer hover/touch)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % stores.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [isPaused])

  const visibleStores = Array.from({ length: perView }, (_, i) =>
    stores[(offset + i) % stores.length],
  )

  function move(direction: number) {
    setOffset((prev) => (prev + direction + stores.length) % stores.length)
  }

  return (
    <section id="tiendas" className="relative overflow-hidden py-20 sm:py-24 md:py-32 px-4 sm:px-6">
      {/* Fondo blur decorativo (solo desktop para no marear en móvil) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:grid grid-cols-5 gap-6 opacity-40 place-items-center px-6">
        {stores.map((store, index) => (
          <motion.div
            key={`bg-${store.name}`}
            className="flex aspect-[4/3] w-full max-w-[200px] items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-950/40 p-4 text-center text-sm font-bold text-emerald-100/60 blur-[6px]"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 0.4, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.08 }}
          >
            {store.name}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span className="text-emerald-400 font-medium text-sm tracking-wider uppercase">
            Nuestras tiendas
          </motion.span>
          <motion.h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Comparamos en las principales <span className="text-emerald-400">tiendas de Venezuela</span>
          </motion.h2>
          <motion.p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Monitoreamos precios en las cadenas más grandes para que siempre encuentres la mejor oferta
          </motion.p>
        </motion.div>

        {/* Carrusel con auto-avance */}
        <div
          className="relative z-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className={`grid gap-4 sm:gap-6 ${
              perView === 1
                ? 'grid-cols-1'
                : perView === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {visibleStores.map((store, index) => (
                <motion.div
                  key={`${store.name}-${offset}-${index}`}
                  initial={{ opacity: 0, x: 60, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.9 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <StoreCard pharmacy={store} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Botones + dots */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <motion.button
              type="button"
              aria-label="Tiendas anteriores"
              onClick={() => move(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-700 bg-emerald-950/70 text-xl text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-900"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ←
            </motion.button>

            {/* Dots indicadores */}
            <div className="flex items-center gap-1.5">
              {stores.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir a tienda ${i + 1}`}
                  onClick={() => setOffset(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === offset % stores.length
                      ? 'w-6 bg-emerald-400'
                      : 'w-1.5 bg-emerald-800 hover:bg-emerald-600'
                  }`}
                />
              ))}
            </div>

            <motion.button
              type="button"
              aria-label="Siguientes tiendas"
              onClick={() => move(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-700 bg-emerald-950/70 text-xl text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-900"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              →
            </motion.button>
          </div>

          {/* Barra de progreso del auto-avance */}
          {!isPaused && (
            <motion.div
              key={offset}
              className="mx-auto mt-6 h-0.5 w-32 overflow-hidden rounded-full bg-emerald-900/50"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.5, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="relative py-20 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-emerald-950/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span className="text-emerald-400 font-medium text-sm tracking-wider uppercase">
            Por qué Chippie
          </motion.span>
          <motion.h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Todo lo que necesitas para <span className="text-emerald-400">ahorrar en tus compras</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
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
    <section className="relative py-20 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
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
        <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
          ¿Listo para <span className="text-emerald-400">empezar a ahorrar</span>?
        </motion.h2>
        <motion.p className="mt-4 text-base sm:text-lg text-white/70">
          Busca cualquier producto y compara precios al instante en Farmacias Saas, Locatel y Farma Go
        </motion.p>

        <motion.div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a
            href="/buscar"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold text-white overflow-hidden hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-xl shadow-emerald-600/40"
            whileHover={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Comenzar a comparar →</span>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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