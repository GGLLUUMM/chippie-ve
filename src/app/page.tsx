import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-emerald-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-6 text-5xl font-extrabold text-white">
          Chippie<span className="text-emerald-400">.ve</span>
        </h1>
        <p className="mt-4 text-xl text-white max-w-2xl mx-auto">
          Compara precios de los mismos productos en distintas tiendas
          y encuentralo al mejor precio. Sin registrarte. Sin letra pequeña.
        </p>
        <Link
          href="/buscar"
          className="mt-8 inline-block rounded-lg bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-700 transition"
        >
          Buscar productos →
        </Link>

        <div className="mt-20 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-6 shadow-sm">
            <h3 className="font-bold text-lg">🔍 Compara</h3>
            <p className="mt-2 text-white text-sm">
              Buscamos el mismo producto en Mercado Libre, Locatel y más tiendas.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-6 shadow-sm">
            <h3 className="font-bold text-lg">💰 Ahorra</h3>
            <p className="mt-2 text-white text-sm">
              Ve todos los precios juntos y elige el menor por el mismo producto.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-6 shadow-sm">
            <h3 className="font-bold text-lg">🔗 Compra directo</h3>
            <p className="mt-2 text-white text-sm">
              Te llevamos a la tienda. Nosotros no vendemos ni cobramos nada.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}