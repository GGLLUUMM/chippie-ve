import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { syncQuery } from '@/lib/sync'

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
      <div className="mx-auto max-w-3xl px-6 py-10">
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

        <ul className="mt-6 space-y-3">
          {results.map((product) => {
            const price = product.price

            return (
              <li
                key={product.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg border bg-gray-50 object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                    📦
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    {product.store.logoUrl && (
                      <img
                        src={product.store.logoUrl}
                        alt={product.store.name}
                        className="h-4 w-auto"
                      />
                    )}

                    {product.store.name} · actualizado{' '}
                    {new Date(price.capturedAt).toLocaleString('es-VE')}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="whitespace-nowrap text-lg font-bold"
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
                </div>

                <a
                  href={price.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                >
                  Comprar ↗
                </a>
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