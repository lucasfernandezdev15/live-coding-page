import { G2I_ANSWER_FRAMEWORK, G2I_ANSWER_FRAMEWORK_SHORT } from '@/lib/g2iAnswerFramework'

export default function G2iAnswerFramework({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p
        className="mb-4 rounded-md border px-3 py-2 text-xs leading-relaxed"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-2)', color: 'var(--muted)' }}
      >
        <strong style={{ color: 'var(--text)' }}>Answer framework:</strong> {G2I_ANSWER_FRAMEWORK_SHORT}
      </p>
    )
  }

  return (
    <section
      className="mb-4 rounded-lg border p-3 sm:p-4"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}
    >
      <p className="kicker mb-2">How to answer (G2i style)</p>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {G2I_ANSWER_FRAMEWORK.map((item, idx) => (
          <li key={item.step} className="text-sm leading-relaxed">
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>
              {idx + 1}. {item.step}
            </span>
            <span style={{ color: 'var(--muted)' }}> — {item.detail}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
