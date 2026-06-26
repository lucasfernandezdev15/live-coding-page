'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  G2I_THEORY_CATEGORY_LABEL,
  g2iEvaluationCriteriaEs,
  g2iLogisticsChecklistEs,
  g2iPrepResourcesEs,
  g2iTheoryCategories,
  g2iTheoryFormatSummary,
  g2iTheoryQuestions,
  g2iTheoryStudyTips,
  type G2iTheoryCategory,
  type G2iTheoryDifficulty,
  type G2iTheoryQuestion,
} from '@/data/g2i-theory-bank'
import {
  G2I_PRACTICE_CATEGORY_LABEL,
  g2iPracticeCategories,
  g2iPracticeExercises,
  g2iPracticeFormatSummary,
  g2iPracticeSandboxTips,
  g2iVettingProcess,
  openTriviaApiNotes,
  type G2iPracticeCategory,
  type G2iPracticeDifficulty,
  type G2iPracticeExercise,
} from '@/data/g2i-practice-bank'

type Tab = 'theory' | 'practice'

const DIFFICULTIES = ['all', 'junior', 'mid', 'senior'] as const

type Props = {
  initialTab?: Tab
}

function G2iBadge() {
  return (
    <span
      className="badge"
      title="Reportado por candidatos online como usado en el proceso de G2i"
      style={{ background: 'var(--accent)', color: '#0b0b0b', fontWeight: 600 }}
    >
      ★ Reportado en G2i
    </span>
  )
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="btn text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          setCopied(false)
        }
      }}
    >
      {copied ? '✓ Copiado' : label}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      className="mt-2 overflow-auto rounded-md border p-3 text-xs leading-relaxed"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-2)', fontFamily: 'var(--font-mono)' }}
    >
      {code}
    </pre>
  )
}

export default function G2iStudyHub({ initialTab = 'theory' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)

  // Theory state
  const [thCategory, setThCategory] = useState<'all' | G2iTheoryCategory>('all')
  const [thDifficulty, setThDifficulty] = useState<'all' | G2iTheoryDifficulty>('all')
  const [thOnlyG2i, setThOnlyG2i] = useState(false)
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({})
  const [openThHints, setOpenThHints] = useState<Record<string, boolean>>({})

  // Practice state
  const [prCategory, setPrCategory] = useState<'all' | G2iPracticeCategory>('all')
  const [prDifficulty, setPrDifficulty] = useState<'all' | G2iPracticeDifficulty>('all')
  const [prOnlyG2i, setPrOnlyG2i] = useState(false)
  const [openBase, setOpenBase] = useState<Record<string, boolean>>({})
  const [openSolution, setOpenSolution] = useState<Record<string, boolean>>({})
  const [openPrHints, setOpenPrHints] = useState<Record<string, boolean>>({})

  const theoryFiltered = useMemo(() => {
    return g2iTheoryQuestions.filter((q) => {
      const okCat = thCategory === 'all' || q.category === thCategory
      const okDiff = thDifficulty === 'all' || q.difficulty === thDifficulty
      const okG2i = !thOnlyG2i || q.reportedByG2i
      return okCat && okDiff && okG2i
    })
  }, [thCategory, thDifficulty, thOnlyG2i])

  const practiceFiltered = useMemo(() => {
    return g2iPracticeExercises.filter((e) => {
      const okCat = prCategory === 'all' || e.category === prCategory
      const okDiff = prDifficulty === 'all' || e.difficulty === prDifficulty
      const okG2i = !prOnlyG2i || e.reportedByG2i
      return okCat && okDiff && okG2i
    })
  }, [prCategory, prDifficulty, prOnlyG2i])

  const theoryG2iCount = g2iTheoryQuestions.filter((q) => q.reportedByG2i).length
  const practiceG2iCount = g2iPracticeExercises.filter((e) => e.reportedByG2i).length

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-6">
        <Link href="/" className="mb-3 inline-flex text-sm" style={{ color: 'var(--muted)' }}>
          ← Volver al dashboard
        </Link>
        <p className="kicker mb-2">Preparación G2i</p>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          G2i: Teoría y Práctica
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Dos apartados para preparar el vetting técnico de G2i: un banco amplio de preguntas teóricas y un set de
          ejercicios de live coding con código base y solución. Las tarjetas con <span style={{ color: 'var(--accent)' }}>★ Reportado en G2i</span>{' '}
          marcan temas que candidatos describen online como recurrentes en su proceso.
        </p>
      </header>

      <section className="mb-6 flex flex-wrap gap-2">
        <button type="button" className={`btn ${tab === 'theory' ? 'btn-accent' : ''}`} onClick={() => setTab('theory')}>
          G2i Teoría ({g2iTheoryQuestions.length})
        </button>
        <button type="button" className={`btn ${tab === 'practice' ? 'btn-accent' : ''}`} onClick={() => setTab('practice')}>
          G2i Práctica ({g2iPracticeExercises.length})
        </button>
      </section>

      {tab === 'theory' ? (
        <>
          <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="mb-2 text-lg font-semibold">Qué esperar (teoría)</h2>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {g2iTheoryFormatSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold">Cómo practicar</h3>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {g2iTheoryStudyTips.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                Logística (brief oficial)
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                {g2iLogisticsChecklistEs.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                Qué evalúan
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                {g2iEvaluationCriteriaEs.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                Recursos sugeridos
              </h3>
              <ul className="space-y-1 text-xs leading-relaxed">
                {g2iPrepResourcesEs.map((resource) => (
                  <li key={resource.title}>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        {resource.title}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text)' }}>{resource.title}</span>
                    )}
                    <span style={{ color: 'var(--muted)' }}> — {resource.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            <button type="button" className={`btn ${thCategory === 'all' ? 'btn-accent' : ''}`} onClick={() => setThCategory('all')}>
              Todos los temas
            </button>
            {g2iTheoryCategories.map((item) => (
              <button
                key={item}
                type="button"
                className={`btn ${thCategory === item ? 'btn-accent' : ''}`}
                onClick={() => setThCategory(item)}
              >
                {G2I_THEORY_CATEGORY_LABEL[item]}
              </button>
            ))}
          </section>

          <section className="mb-4 flex flex-wrap items-center gap-2">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                className={`btn ${thDifficulty === level ? 'btn-accent' : ''}`}
                onClick={() => setThDifficulty(level)}
              >
                {level === 'all' ? 'Todos los niveles' : level}
              </button>
            ))}
            <button
              type="button"
              className={`btn ${thOnlyG2i ? 'btn-accent' : ''}`}
              onClick={() => setThOnlyG2i((v) => !v)}
            >
              ★ Solo reportadas en G2i ({theoryG2iCount})
            </button>
            <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
              {theoryFiltered.length} preguntas
            </span>
          </section>

          <section className="space-y-4">
            {theoryFiltered.map((item: G2iTheoryQuestion, idx) => (
              <article key={item.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{idx + 1}.</span>
                  <span className="badge btn-accent">{G2I_THEORY_CATEGORY_LABEL[item.category]}</span>
                  <span className="badge">{item.difficulty}</span>
                  {item.reportedByG2i ? <G2iBadge /> : null}
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mb-3 whitespace-pre-wrap text-base font-semibold leading-relaxed">{item.question}</h3>

                {item.reportedByG2i && item.sourceNote ? (
                  <p className="mb-3 text-xs italic" style={{ color: 'var(--accent)' }}>
                    {item.sourceNote}
                  </p>
                ) : null}

                {item.hints?.length ? (
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn text-xs"
                      onClick={() => setOpenThHints((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    >
                      {openThHints[item.id] ? 'Ocultar pistas' : 'Ver pistas'}
                    </button>
                    {openThHints[item.id] ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
                        {item.hints.map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => setOpenAnswers((p) => ({ ...p, [item.id]: !p[item.id] }))}
                >
                  {openAnswers[item.id] ? 'Ocultar respuesta' : 'Revelar respuesta'}
                </button>

                {openAnswers[item.id] ? (
                  <div
                    className="hint-card panel mt-3 whitespace-pre-wrap p-3 text-sm leading-relaxed is-open"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.answer}
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          {theoryFiltered.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No hay preguntas con esos filtros.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">Proceso de vetting de G2i</h2>
              <span className="badge" style={{ background: 'var(--accent)', color: '#0b0b0b', fontWeight: 600 }}>
                ✓ Verificado (FAQ oficial)
              </span>
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed">
              {g2iVettingProcess.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </section>

          <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="mb-2 text-lg font-semibold">Formato del live coding y del code challenge</h2>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {g2iPracticeFormatSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold">Cómo usar este apartado</h3>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {g2iPracticeSandboxTips.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold">Referencia rápida de Open Trivia DB</h3>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {openTriviaApiNotes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            <button type="button" className={`btn ${prCategory === 'all' ? 'btn-accent' : ''}`} onClick={() => setPrCategory('all')}>
              Todos los temas
            </button>
            {g2iPracticeCategories.map((item) => (
              <button
                key={item}
                type="button"
                className={`btn ${prCategory === item ? 'btn-accent' : ''}`}
                onClick={() => setPrCategory(item)}
              >
                {G2I_PRACTICE_CATEGORY_LABEL[item]}
              </button>
            ))}
          </section>

          <section className="mb-4 flex flex-wrap items-center gap-2">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                className={`btn ${prDifficulty === level ? 'btn-accent' : ''}`}
                onClick={() => setPrDifficulty(level)}
              >
                {level === 'all' ? 'Todos los niveles' : level}
              </button>
            ))}
            <button
              type="button"
              className={`btn ${prOnlyG2i ? 'btn-accent' : ''}`}
              onClick={() => setPrOnlyG2i((v) => !v)}
            >
              ★ Solo reportados en G2i ({practiceG2iCount})
            </button>
            <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
              {practiceFiltered.length} ejercicios
            </span>
          </section>

          <section className="space-y-4">
            {practiceFiltered.map((item: G2iPracticeExercise, idx) => (
              <article key={item.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{idx + 1}.</span>
                  <span className="badge btn-accent">{G2I_PRACTICE_CATEGORY_LABEL[item.category]}</span>
                  <span className="badge">{item.difficulty}</span>
                  <span className="badge">{item.timeLimit} min</span>
                  {item.reportedByG2i ? <G2iBadge /> : null}
                </div>
                <h3 className="mb-1 text-base font-semibold">{item.title}</h3>
                <p className="mb-2 text-xs" style={{ color: 'var(--dim)' }}>
                  Sandbox sugerido: {item.sandbox}
                </p>

                {item.reportedByG2i && item.sourceNote ? (
                  <p className="mb-3 text-xs italic" style={{ color: 'var(--accent)' }}>
                    {item.sourceNote}
                  </p>
                ) : null}

                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                  Premisa
                </h4>
                <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {item.premise}
                </p>

                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                  Requisitos
                </h4>
                <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">
                  {item.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>

                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                  Criterios de evaluación
                </h4>
                <ul className="mb-3 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
                  {item.evaluationCriteria.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button type="button" className="btn text-xs" onClick={() => setOpenBase((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                    {openBase[item.id] ? 'Ocultar código base' : 'Ver código base'}
                  </button>
                  {openBase[item.id] ? <CopyButton text={item.baseCode} label="Copiar código base" /> : null}
                  <button type="button" className="btn text-xs" onClick={() => setOpenPrHints((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                    {openPrHints[item.id] ? 'Ocultar pistas' : 'Ver pistas'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-accent text-xs"
                    onClick={() => setOpenSolution((p) => ({ ...p, [item.id]: !p[item.id] }))}
                  >
                    {openSolution[item.id] ? 'Ocultar solución' : 'Revelar solución'}
                  </button>
                  {openSolution[item.id] ? <CopyButton text={item.solution} label="Copiar solución" /> : null}
                </div>

                {openBase[item.id] ? <CodeBlock code={item.baseCode} /> : null}

                {openPrHints[item.id] ? (
                  <ul className="mb-3 mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
                    {item.hints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ul>
                ) : null}

                {openSolution[item.id] ? (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                      Solución
                    </p>
                    <pre
                      className="hint-card panel overflow-auto whitespace-pre-wrap p-3 text-xs leading-relaxed is-open"
                      style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
                    >
                      {item.solution}
                    </pre>
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          {practiceFiltered.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No hay ejercicios con esos filtros.
            </p>
          ) : null}
        </>
      )}
    </main>
  )
}
