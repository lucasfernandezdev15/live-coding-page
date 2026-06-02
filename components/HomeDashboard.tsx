'use client'

import Link from 'next/link'
import { Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, challenges, LEVEL_GROUPS, LEVEL_LABELS } from '@/lib/challenges'
import type { Category, Challenge, Difficulty } from '@/lib/types'

type Progress = Record<
  string,
  { attempted: boolean; completed: boolean; bestTimeSeconds: number }
>

type SortMode = 'default' | 'easy' | 'hard' | 'shortest'
type DifficultyFilter = 'all' | Difficulty
type StackFilter = 'all' | 'frontend-core' | 'react' | 'nextjs' | 'javascript' | 'jest'
type LevelFilter = 'all' | 'junior' | 'mid' | 'senior'
type RoundFilter = 'all' | 'js-utils' | 'ui-coding' | 'testing'

const CATEGORY_VAR: Record<Category, string> = {
  TypeScript: 'var(--cat-ts)',
  React: 'var(--cat-react)',
  'Next.js': 'var(--cat-next)',
  'React Query': 'var(--cat-rq)',
  Zustand: 'var(--cat-zustand)',
  Auth: 'var(--cat-auth)',
  Testing: 'var(--cat-test)',
}

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

const LEGEND = [
  { label: 'TypeScript', color: 'var(--cat-ts)' },
  { label: 'React', color: 'var(--cat-react)' },
  { label: 'React Query', color: 'var(--cat-rq)' },
  { label: 'Zustand', color: 'var(--cat-zustand)' },
  { label: 'Next.js', color: 'var(--cat-next)' },
  { label: 'Auth', color: 'var(--cat-auth)' },
  { label: 'Testing', color: 'var(--cat-test)' },
]

function sortChallenges(items: Challenge[], mode: SortMode): Challenge[] {
  if (mode === 'default') return items
  return [...items].sort((a, b) => {
    if (mode === 'shortest') return a.estimatedMinutes - b.estimatedMinutes
    if (mode === 'easy') return DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]
    return DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty]
  })
}

export default function HomeDashboard() {
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [stack, setStack] = useState<StackFilter>('frontend-core')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [round, setRound] = useState<RoundFilter>('all')
  const [sort, setSort] = useState<SortMode>('default')
  const [progress, setProgress] = useState<Progress>({})

  useEffect(() => {
    const raw = localStorage.getItem('devprobe:progress')
    if (!raw) return
    try {
      setProgress(JSON.parse(raw) as Progress)
    } catch {
      setProgress({})
    }
  }, [])

  const filtered = useMemo(() => {
    const list = challenges.filter((challenge) => {
      const matchesCategory = category === 'All' || challenge.category === category
      const matchesDifficulty = difficulty === 'all' || challenge.difficulty === difficulty
      const matchesLevel = level === 'all' || LEVEL_GROUPS[level].includes(challenge.id)
      const tags = challenge.tags.map((tag) => tag.toLowerCase())
      const matchesStack =
        stack === 'all' ||
        (stack === 'frontend-core' && (challenge.category === 'React' || challenge.category === 'Next.js' || tags.includes('javascript'))) ||
        (stack === 'react' && challenge.category === 'React') ||
        (stack === 'nextjs' && challenge.category === 'Next.js') ||
        (stack === 'javascript' && (tags.includes('javascript') || challenge.previewType === 'react' || challenge.previewType === 'nextjs')) ||
        (stack === 'jest' &&
          challenge.category === 'Testing' &&
          (tags.includes('jest') || challenge.title.toLowerCase().includes('jest')))

      const matchesRound =
        round === 'all' ||
        (round === 'testing' && challenge.category === 'Testing') ||
        (round === 'ui-coding' &&
          (challenge.previewType === 'react' || challenge.previewType === 'nextjs') &&
          challenge.category !== 'Testing') ||
        (round === 'js-utils' &&
          (challenge.previewType === 'typescript' ||
            tags.includes('promise') ||
            tags.includes('debounce') ||
            tags.includes('events') ||
            challenge.category === 'TypeScript'))

      return matchesCategory && matchesDifficulty && matchesStack && matchesLevel && matchesRound
    })
    return sortChallenges(list, sort)
  }, [category, difficulty, sort, stack, level, round])

  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-8 space-y-4">
        <div>
          <p className="kicker mb-2">Práctica de entrevistas</p>
          <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            DevProbe
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed" style={{ color: 'var(--muted)' }}>
            Ejercicios de live coding frontend: TypeScript, React, Next.js, datos, auth y testing. Sin chat ni prompts:
            solo editor, tiempo y pistas graduales.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </header>

      <section className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn ${category === 'All' ? 'btn-accent' : ''}`}
          onClick={() => setCategory('All')}
        >
          All
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            className={`btn ${category === item ? 'btn-accent' : ''}`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          Stack:
        </span>
        <button type="button" className={`btn ${stack === 'frontend-core' ? 'btn-accent' : ''}`} onClick={() => setStack('frontend-core')}>
          Frontend core
        </button>
        <button type="button" className={`btn ${stack === 'react' ? 'btn-accent' : ''}`} onClick={() => setStack('react')}>
          React
        </button>
        <button type="button" className={`btn ${stack === 'nextjs' ? 'btn-accent' : ''}`} onClick={() => setStack('nextjs')}>
          Next.js
        </button>
        <button type="button" className={`btn ${stack === 'javascript' ? 'btn-accent' : ''}`} onClick={() => setStack('javascript')}>
          JavaScript
        </button>
        <button type="button" className={`btn ${stack === 'jest' ? 'btn-accent' : ''}`} onClick={() => setStack('jest')}>
          Jest
        </button>
        <button type="button" className={`btn ${stack === 'all' ? 'btn-accent' : ''}`} onClick={() => setStack('all')}>
          All stacks
        </button>
      </section>

      <section className="mb-4 rounded-md border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
          Tracks de práctica
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`btn ${level === 'all' ? 'btn-accent' : ''}`} onClick={() => setLevel('all')}>
            Todos
          </button>
          {(['junior', 'mid', 'senior'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`btn ${level === key ? 'btn-accent' : ''}`}
              onClick={() => setLevel(key)}
            >
              {LEVEL_LABELS[key]} ({LEVEL_GROUPS[key].length})
            </button>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-md border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
          Ronda de entrevista
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`btn ${round === 'all' ? 'btn-accent' : ''}`} onClick={() => setRound('all')}>
            Todas
          </button>
          <button type="button" className={`btn ${round === 'js-utils' ? 'btn-accent' : ''}`} onClick={() => setRound('js-utils')}>
            JS utilities
          </button>
          <button type="button" className={`btn ${round === 'ui-coding' ? 'btn-accent' : ''}`} onClick={() => setRound('ui-coding')}>
            UI coding
          </button>
          <button type="button" className={`btn ${round === 'testing' ? 'btn-accent' : ''}`} onClick={() => setRound('testing')}>
            Testing
          </button>
        </div>
      </section>

      <section className="mb-6 flex flex-wrap items-center gap-2">
        {(['all', 'easy', 'medium', 'hard'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`btn ${difficulty === item ? 'btn-accent' : ''}`}
            onClick={() => setDifficulty(item)}
          >
            {item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="w-full rounded-md border px-3 py-1.5 sm:ml-auto sm:w-auto"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-2)', color: 'var(--text)' }}
        >
          <option value="default">Default</option>
          <option value="easy">Easiest first</option>
          <option value="hard">Hardest first</option>
          <option value="shortest">Shortest first</option>
        </select>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((challenge) => {
          const itemProgress = progress[challenge.id]
          return (
            <article
              key={challenge.id}
              className="group fade-in overflow-hidden rounded-lg border p-4 transition-all duration-150 hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="mb-3 h-1 w-12 rounded-full"
                style={{ background: CATEGORY_VAR[challenge.category] }}
              />
              <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  {challenge.title}
                </h2>
                <span
                  className={`badge ${
                    challenge.difficulty === 'easy'
                      ? 'btn-mint'
                      : challenge.difficulty === 'medium'
                      ? 'btn-amber'
                      : 'btn-red'
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>
              <p
                className="mb-3 text-sm"
                style={{
                  color: 'var(--muted)',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {challenge.description}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {challenge.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                  <Clock3 size={14} />
                  {challenge.estimatedMinutes} min
                </span>
                <Link href={`/challenge/${challenge.id}`} className="btn btn-accent">
                  Start →
                </Link>
              </div>
              {itemProgress?.completed ? (
                <span className="mt-3 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--mint)' }}>
                  ✓ Completed
                </span>
              ) : itemProgress?.attempted ? (
                <span className="mt-3 inline-flex text-xs" style={{ color: 'var(--mint)' }}>
                  Attempted
                </span>
              ) : null}
            </article>
          )
        })}
      </section>
    </main>
  )
}
