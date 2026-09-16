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

  if (q) {
  await syncQuery(q)   // ← busca en vivo en las tiendas

  const words = q.toLowerCase().split(/\s+/)
  results = await prisma.product.findMany({
    where: { AND: words.map((w) => ({ normalized: { contains: w } })) }, // ← AND, no OR
    include: {
      store: true,
      prices: { orderBy: { capturedAt: 'desc' }, take: 1 },
    },
    take: 60,
  })  
}

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-emerald-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/" className="text-emerald-600 text-sm">← Volver al inicio</Link>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Buscar en Chippie</h1>

        {/* El formulario hace GET a esta misma página con ?q= */}
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
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
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
          {results.map((p, index) => {
            const price = p.prices[0]
            const priceColor =
              index < results.length / 3
                ? 'text-emerald-400'
                : index >= (results.length * 2) / 3
                  ? 'text-red-400'
                  : 'text-yellow-500'
            return (
              <li key={p.id} className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
                    {/* Imagen del producto */}
                    {p.imageUrl ? (
                        <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-16 w-16 rounded-lg object-contain bg-gray-50 border"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                        📦
                        </div>
                    )}

                    <div className="flex-1">
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {/* Logo + nombre de la tienda */}
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        {p.store.logoUrl && (
                            <img src={p.store.logoUrl} alt={p.store.name} className="h-4 w-auto" />
                        )}
                        {p.store.name} · actualizado {new Date(price.capturedAt).toLocaleString('es-VE')}
                        </p>
                    </div>

                    <p className={`text-lg font-bold ${priceColor} whitespace-nowrap`}>
                        Bs. {Number(price.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </p>
                    <a
                        href={price.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 whitespace-nowrap"
                    >
                        Comprar ↗
                    </a>
            </li>
            )
          })}
        </ul>

        {q && results.length === 0 && (
            <p className="mt-10 text-center text-gray-200">
            No hay resultados todavía. ¿Ya sincronizaste este producto?
            <code className="mt-2 block rounded bg-black/30 p-2 text-sm text-gray-200">
              pnpm tsx scripts/sync.ts {q}
            </code>
          </p>
        )}
      </div>
    </main>
  )
}