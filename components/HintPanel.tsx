'use client'

import { useState } from 'react'
import type { Challenge } from '@/lib/types'

interface Props {
  challenge: Challenge
  currentCode: string
  hintsUsed: number
  onClose: () => void
  onHintUsed: () => void
}

type HintSource = 'anthropic' | 'gemini' | 'local'
type HintItem = { id: number; text: string; open: boolean; source?: HintSource }

const SOURCE_LABEL: Record<HintSource, string> = {
  anthropic: 'Mentor',
  gemini: 'Mentor',
  local: 'Guía del ejercicio',
}

const STAGE_LABEL: Record<number, string> = {
  1: 'Orientación',
  2: 'Enfoque',
  3: 'Cierre',
}

function parseHintSource(value: string | null): HintSource | undefined {
  if (value === 'anthropic' || value === 'gemini' || value === 'local') return value
  return undefined
}

export default function HintPanel({
  challenge,
  currentCode,
  hintsUsed,
  onClose,
  onHintUsed,
}: Props) {
  const [hints, setHints] = useState<HintItem[]>([])
  const [loading, setLoading] = useState(false)

  async function getHint() {
    if (loading || hintsUsed >= 3) return
    setLoading(true)
    const nextNumber = hintsUsed + 1
    setHints((prev) => [...prev.map((item) => ({ ...item, open: false })), { id: nextNumber, text: '', open: true }])

    try {
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          currentCode,
          hintNumber: nextNumber,
        }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Error ${response.status}`)
      }
      const source = parseHintSource(response.headers.get('X-Hint-Source'))
      if (!response.body) throw new Error('No stream available')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const chunk = await reader.read()
        done = chunk.done
        if (chunk.value) {
          const text = decoder.decode(chunk.value, { stream: !done })
          setHints((prev) =>
            prev.map((item) =>
              item.id === nextNumber ? { ...item, text: `${item.text}${text}`, source: source ?? item.source } : item,
            ),
          )
        }
      }
      onHintUsed()
    } catch (error) {
      setHints((prev) =>
        prev.map((item) =>
          item.id === nextNumber
            ? { ...item, text: `No se pudo cargar la pista: ${(error as Error).message}`, source: 'local' }
            : item,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Cerrar pistas"
        style={{ background: 'rgba(19, 18, 17, 0.72)' }}
        onClick={onClose}
      />
      <aside
        className="panel-in absolute right-0 top-0 flex h-full w-full flex-col border-l sm:w-[400px]"
        style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}
      >
        <header className="border-b px-4 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <p className="kicker mb-1">Cuaderno de pistas</p>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {challenge.title}
              </h3>
            </div>
            <button type="button" className="btn shrink-0" onClick={onClose} aria-label="Cerrar">
              Cerrar
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {hintsUsed}/3 pistas usadas · máximo 3 por sesión
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
          {hints.length === 0 ? (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Pedí una pista cuando te trabes. No muestran la solución completa: van de orientación general a un empujón más
              concreto.
            </p>
          ) : null}
          {hints.map((hint) => (
            <article
              key={hint.id}
              className={`pista-card panel p-3 ${hint.open ? 'is-open' : ''}`}
            >
              <button
                type="button"
                className="mb-2 flex w-full items-center justify-between gap-2 text-left"
                onClick={() => setHints((prev) => prev.map((item) => (item.id === hint.id ? { ...item, open: !item.open } : item)))}
              >
                <span className="text-sm font-medium">
                  Pista {hint.id} · {STAGE_LABEL[hint.id]}
                </span>
                <span className="text-xs" style={{ color: 'var(--dim)' }}>
                  {hint.open ? 'Ocultar' : 'Ver'}
                </span>
              </button>
              {hint.source ? (
                <p className="mb-2 text-xs" style={{ color: 'var(--dim)' }}>
                  {SOURCE_LABEL[hint.source]}
                </p>
              ) : null}
              {hint.open ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {hint.text || (loading && hint.id === hintsUsed + 1 ? 'Escribiendo…' : '…')}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <footer className="border-t px-4 py-4" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            className="btn btn-accent w-full justify-center"
            onClick={getHint}
            disabled={hintsUsed >= 3 || loading}
          >
            {loading ? 'Preparando pista…' : hintsUsed >= 3 ? 'Sin pistas restantes' : `Pedir pista ${hintsUsed + 1}`}
          </button>
        </footer>
      </aside>
    </div>
  )
}
