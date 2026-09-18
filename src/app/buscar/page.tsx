import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { syncQuery } from '@/lib/sync'

const storeThemes = {
  'Farmacia SAAS': {
    color: '#43B97F',
    logo: '/logos/farmaciassaas.png',
  },
  Locatel: {
    color: '#009B77',
    logo: '/logos/locatel.png',
  },
  Farmago: {
    color: '#6D28D9',
    logo: '/logos/farmago.png',
    gradient: 'linear-gradient(90deg, #00CFE8, #6D28D9)',
  },
  'Gama en Línea': {
    color: '#9B111E',
    logo: '/logos/gama.png',
  },
  Farmatodo: {
    color: '#173B8F',
    logo: '/logos/farmatodo.png',
  },
} as const

function getStoreTheme(storeName: string) {
  return storeThemes[storeName as keyof typeof storeThemes] ?? {
    color: '#374151',
    logo: null,
  }
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any[] = []

  if (q?.trim()) {
    await syncQuery(q.trim())

    const rateRow = await prisma.rate.findFirst({
      orderBy: { date: 'desc' },
    })

    const rate = rateRow ? Number(rateRow.rate) : 0
    const words = q.toLowerCase().trim().split(/\s+/)

    const raw = await prisma.product.findMany({
      where: {
        AND: words.map((word) => ({
          normalized: { contains: word },
        })),
      },
      include: {
        store: true,
        prices: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      take: 60,
    })

    results = raw
      .filter((product) => product.prices.length > 0)
      .map((product) => {
        const price = product.prices[0]
        const amount = Number(price.amount)

        const inVES =
          price.currency === 'USD'
            ? amount * rate
            : amount

        return {
          ...product,
          price,
          inVES,
        }
      })
      .filter((product) => Number.isFinite(product.inVES) && product.inVES > 0)
      .sort((a, b) => a.inVES - b.inVES)
  }

  const minPrice = results.length > 0 ? results[0].inVES : 0
  const maxPrice = results.length > 0 ? results.at(-1).inVES : 0

  function getPriceColor(value: number) {
    const factor =
      maxPrice === minPrice
        ? 0
        : (value - minPrice) / (maxPrice - minPrice)

    // Verde oscuro → amarillo oscuro → rojo oscuro.
    const hue = 140 - factor * 140
    return `hsl(${hue} 65% 35%)`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-emerald-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/" className="text-sm text-emerald-400">
          ← Volver al inicio
        </Link>

        <h1 className="mt-2 text-3xl font-extrabold">
          Buscar en Chippie
        </h1>

        <form method="GET" className="mt-6 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Ej: arroz, acetaminofen, shampoo..."
            className="flex-1 rounded-lg border border-emerald-700 bg-black/30 px-4 py-3 text-white placeholder:text-gray-300 focus:border-emerald-400 focus:outline-none"
          />

          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold hover:bg-emerald-800"
          >
            Buscar
          </button>
        </form>

        {q && (
          <p className="mt-4 text-gray-200">
            {results.length} resultado{results.length !== 1 && 's'} para “{q}”
          </p>
        )}

        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {results.map((product) => {
            const price = product.price
            const storeTheme = getStoreTheme(product.store.name)

            return (
              <li
                key={product.id}
                className="flex min-h-[330px] flex-col rounded-xl border-2 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: `${storeTheme.color}66` }}
              >
                {product.imageUrl ? (
                  <div className="relative mb-4 h-40 w-full">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 16vw"
                      className="rounded-lg border bg-gray-50 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-40 w-full items-center justify-center rounded-lg bg-gray-100 text-5xl">
                    📦
                  </div>
                )}

                <div className="flex flex-1 flex-col">
                  <p className="line-clamp-2 font-semibold text-gray-900">
                    {product.name}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    {storeTheme.logo && (
                      <Image
                        src={storeTheme.logo}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-contain"
                      />
                    )}
                    <p
                      className="line-clamp-1 text-sm font-semibold"
                      style={
                        'gradient' in storeTheme
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

                  <p
                    className="mt-3 text-xl font-bold"
                    style={{ color: getPriceColor(product.inVES) }}
                  >
                    Bs.{' '}
                    {product.inVES.toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>

                  {price.currency === 'USD' && (
                    <p className="text-xs text-gray-500">
                      ≈ $
                      {Number(price.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-400">
                    Actualizado{' '}
                    {new Date(price.capturedAt).toLocaleDateString('es-VE')}
                  </p>

                  <a
                    href={price.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-gray-700"
                  >
                    Comprar ↗
                  </a>
                </div>
              </li>
            )
          })}
        </ul>

        {q && results.length === 0 && (
          <p className="mt-10 text-center text-gray-200">
            No hay resultados para esta búsqueda.
          </p>
        )}
      </div>
    </main>
  )
}