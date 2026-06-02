'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  rickMortyInterviewQuestions,
  rickMortyMcq,
  rickMortyProjectSummary,
} from '@/lib/rickMortyPrep'

export default function RickMortyExternalPrep() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [category, setCategory] = useState<
    'all' | 'react' | 'next-pages' | 'react-query' | 'axios' | 'styled-components' | 'testing' | 'decisions'
  >('all')
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  const filteredMcq = useMemo(() => {
    return rickMortyMcq.filter((item) => {
      const okCategory = category === 'all' || item.category === category
      const okDifficulty = difficulty === 'all' || item.difficulty === difficulty
      return okCategory && okDifficulty
    })
  }, [category, difficulty])

  const score = useMemo(() => {
    return filteredMcq.reduce((acc, item) => {
      return answers[item.id] === item.correctOptionId ? acc + 1 : acc
    }, 0)
  }, [answers, filteredMcq])

  const groupedByDifficulty = useMemo(() => {
    return {
      easy: filteredMcq.filter((item) => item.difficulty === 'easy'),
      medium: filteredMcq.filter((item) => item.difficulty === 'medium'),
      hard: filteredMcq.filter((item) => item.difficulty === 'hard'),
    }
  }, [filteredMcq])

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-6">
        <Link href="/" className="mb-3 inline-flex text-sm" style={{ color: 'var(--muted)' }}>
          ← Volver al dashboard
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Apartado externo: Rick & Morty Challenge
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Banco de preguntas multiple choice, respuestas explicadas y guia de entrevista sobre el challenge externo.
        </p>
      </header>

      <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <h2 className="mb-2 text-lg font-semibold">Detalle del proyecto</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {rickMortyProjectSummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Multiple choice (con explicaciones)</h2>
          <button type="button" className="btn btn-accent" onClick={() => setShowResult((v) => !v)}>
            {showResult ? 'Ocultar resultados' : 'Mostrar resultados'}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button className={`btn ${category === 'all' ? 'btn-accent' : ''}`} onClick={() => setCategory('all')}>
            Todas las categorias
          </button>
          <button className={`btn ${category === 'react' ? 'btn-accent' : ''}`} onClick={() => setCategory('react')}>
            React
          </button>
          <button className={`btn ${category === 'next-pages' ? 'btn-accent' : ''}`} onClick={() => setCategory('next-pages')}>
            Next pages
          </button>
          <button className={`btn ${category === 'react-query' ? 'btn-accent' : ''}`} onClick={() => setCategory('react-query')}>
            React Query
          </button>
          <button className={`btn ${category === 'axios' ? 'btn-accent' : ''}`} onClick={() => setCategory('axios')}>
            Axios
          </button>
          <button className={`btn ${category === 'styled-components' ? 'btn-accent' : ''}`} onClick={() => setCategory('styled-components')}>
            Styled
          </button>
          <button className={`btn ${category === 'testing' ? 'btn-accent' : ''}`} onClick={() => setCategory('testing')}>
            Testing
          </button>
          <button className={`btn ${category === 'decisions' ? 'btn-accent' : ''}`} onClick={() => setCategory('decisions')}>
            Decisiones
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              className={`btn ${difficulty === level ? 'btn-accent' : ''}`}
              onClick={() => setDifficulty(level)}
            >
              {level === 'all' ? 'Todas las dificultades' : level}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {(difficulty === 'all'
            ? (['easy', 'medium', 'hard'] as const).map((level) => ({ level, items: groupedByDifficulty[level] }))
            : [{ level: difficulty, items: filteredMcq }]
          ).map(({ level, items }) => (
            <section key={level} className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                Dificultad: {level} ({items.length})
              </h3>
              {items.map((item, idx) => {
                const selected = answers[item.id]
                const isCorrect = selected === item.correctOptionId
                return (
                  <article key={item.id} className="rounded-md border p-3" style={{ borderColor: 'var(--border)' }}>
                    <p className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
                      {idx + 1}. {item.topic} · {item.difficulty}
                    </p>
                    <h3 className="mb-3 text-sm font-semibold">{item.question}</h3>
                    <div className="space-y-2">
                      {item.options.map((option) => (
                        <label key={option.id} className="flex cursor-pointer items-start gap-2 text-sm">
                          <input
                            type="radio"
                            name={item.id}
                            checked={selected === option.id}
                            onChange={() => setAnswers((prev) => ({ ...prev, [item.id]: option.id }))}
                          />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                    {showResult && selected ? (
                      <div
                        className="mt-3 rounded-md border p-2 text-xs"
                        style={{
                          borderColor: isCorrect ? 'var(--mint)' : 'var(--amber)',
                          background: isCorrect ? 'var(--mint-bg)' : 'var(--amber-bg)',
                        }}
                      >
                        <p className="mb-1" style={{ color: isCorrect ? 'var(--mint)' : 'var(--amber)' }}>
                          {isCorrect ? 'Correcta' : 'Para revisar'} - Respuesta esperada:{' '}
                          {item.options.find((o) => o.id === item.correctOptionId)?.text}
                        </p>
                        <p style={{ color: 'var(--text)' }}>{item.explanation}</p>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </section>
          ))}
        </div>

        {difficulty === 'all' ? (
          <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
            Separadas por dificultad: easy ({groupedByDifficulty.easy.length}), medium ({groupedByDifficulty.medium.length}), hard ({groupedByDifficulty.hard.length})
          </p>
        ) : null}

        {showResult ? (
          <p className="mt-4 text-sm" style={{ color: 'var(--accent)' }}>
            Puntaje actual: {score}/{filteredMcq.length}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <h2 className="mb-2 text-lg font-semibold">Preguntas que te pueden hacer sobre el proyecto y decisiones</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {rickMortyInterviewQuestions.slice(0, 30).map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
