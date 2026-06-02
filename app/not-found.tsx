import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="rounded-lg border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h1 className="mb-2 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          Page not found
        </h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          Check the URL or return to the home page.
        </p>
        <Link href="/" className="btn btn-accent">
          Go home
        </Link>
      </div>
    </main>
  )
}
