'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  clearProgress,
  getCategoryPercentages,
  getLastSession,
  getRecentWeakItems,
  loadProgress,
  type PersistedProgress,
} from '@/lib/g2iProgressStorage'
import { ERROR_SOURCE_LABEL } from '@/data/g2i-common-errors'

const CATEGORY_LABEL: Record<string, string> = {
  ...ERROR_SOURCE_LABEL,
  softskills: 'Soft skills',
}

const KIND_LABEL = {
  theory: 'Theory',
  snippet: 'Snippet',
  error: 'Console error',
} as const

export default function G2iProgressPanel() {
  const [progress, setProgress] = useState<PersistedProgress | null>(null)
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    setProgress(loadProgress())
  }, [])

  useEffect(() => {
    refresh()
    setMounted(true)
    const onFocus = () => refresh()
    const onProgress = () => refresh()
    window.addEventListener('focus', onFocus)
    window.addEventListener('g2i-progress-updated', onProgress)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('g2i-progress-updated', onProgress)
    }
  }, [refresh])

  if (!mounted || !progress) return null

  const last = getLastSession(progress)
  const weak = getRecentWeakItems(progress, 6)
  const categories = getCategoryPercentages(progress.categoryTotals)
  const hasData = last || weak.length > 0 || categories.length > 0

  if (!hasData) {
    return (
      <section
        className="mb-6 rounded-lg border p-4 sm:p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <h2 className="mb-2 text-lg font-semibold">Your progress</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Complete a simulation or mark &quot;Didn&apos;t know&quot; on questions — weak areas will show here between
          sessions.
        </p>
      </section>
    )
  }

  const lastScore =
    last && last.assessed > 0 ? Math.round((last.knew / last.assessed) * 100) : null

  return (
    <section
      className="mb-6 rounded-lg border p-4 sm:p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Your progress</h2>
        <button type="button" className="btn text-xs" onClick={() => setProgress(clearProgress())}>
          Clear history
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {last ? (
          <div className="rounded-md border p-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Last session
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>
              {lastScore !== null ? `${lastScore}%` : '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {last.knew}/{last.assessed} knew · {last.mode}
            </p>
          </div>
        ) : null}
        <div className="rounded-md border p-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Weak items tracked
          </p>
          <p className="text-lg font-semibold">{progress.weakItems.length}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Revisit in Free practice
          </p>
        </div>
        <div className="rounded-md border p-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Sessions logged
          </p>
          <p className="text-lg font-semibold">{progress.sessions.length}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Saved in this browser
          </p>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold">All-time by category</h3>
          <ul className="space-y-2">
            {categories.map((row) => (
              <li key={row.category}>
                <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{CATEGORY_LABEL[row.category] ?? row.category}</span>
                  <span>
                    {row.pct}% ({row.total} assessed)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-2)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${row.pct}%`, background: 'var(--accent)' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {weak.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Repasar</h3>
          <ul className="space-y-2 text-sm">
            {weak.map((item) => (
              <li
                key={`${item.kind}-${item.id}`}
                className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
                style={{ borderColor: 'var(--border-2)', color: 'var(--muted)' }}
              >
                <span className="badge">{KIND_LABEL[item.kind]}</span>
                {item.category ? <span className="badge btn-accent">{CATEGORY_LABEL[item.category] ?? item.category}</span> : null}
                <span style={{ color: 'var(--text)' }}>{item.title}</span>
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
