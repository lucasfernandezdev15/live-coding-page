import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="rounded-lg border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h1 className="mb-2 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          Página no encontrada
        </h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          Revisa la URL o vuelve al inicio.
        </p>
        <Link href="/" className="btn btn-accent">Ir al inicio</Link>
      </div>
    </main>
  )
}
