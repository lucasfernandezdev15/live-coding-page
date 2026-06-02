import Link from 'next/link'

export default function ChallengeNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="rounded-lg border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h1 className="mb-2 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          Challenge no encontrado
        </h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          El id solicitado no existe o fue removido.
        </p>
        <Link href="/" className="btn btn-accent">
          Volver al dashboard
        </Link>
      </section>
    </main>
  )
}
