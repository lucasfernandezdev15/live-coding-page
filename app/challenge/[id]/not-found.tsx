import Link from 'next/link'

export default function ChallengeNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="rounded-lg border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h1 className="mb-2 text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          Challenge not found
        </h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          The requested id does not exist or was removed.
        </p>
        <Link href="/" className="btn btn-accent">
          Back to dashboard
        </Link>
      </section>
    </main>
  )
}
