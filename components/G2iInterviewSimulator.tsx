'use client'

import G2iAiInterview from '@/components/G2iAiInterview'
import G2iAnswerFramework from '@/components/G2iAnswerFramework'
import G2iPrepPanel from '@/components/G2iPrepPanel'
import G2iProgressPanel from '@/components/G2iProgressPanel'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ERROR_SOURCE_LABEL, g2iCommonErrors, type CommonErrorCard } from '@/data/g2i-common-errors'
import { g2iCodingExercises, type CodingExercise } from '@/data/g2i-coding-exercises'
import { g2iQuestions, type Question } from '@/data/g2i-questions'
import { g2iSnippetQuestions, type SnippetQuestion } from '@/data/g2i-snippet-questions'
import {
  getCategoryPercentages,
  loadProgress,
  recordSessionResults,
  recordWeakAssessment,
  type WeakItemKind,
} from '@/lib/g2iProgressStorage'
import { copyExerciseToClipboard, openReplitTemplate } from '@/lib/replitUtils'
import {
  buildFullInterviewQuestions,
  buildRealisticInterview,
  computeSimulationResults,
  formatTimer,
  FULL_INTERVIEW_DURATION_SEC,
  REALISTIC_INTERVIEW_DURATION_SEC,
  toTheorySessionItems,
  type SelfAssessment,
  type SimulationResults,
  type TheorySessionItem,
} from '@/lib/g2iSimulatorUtils'
import {
  g2iEvaluationCriteria,
  g2iInterviewFormatSummary,
  g2iInterviewTitle,
  g2iLogisticsChecklist,
  g2iPrepResources,
  g2iSimulatorModes,
} from '@/lib/g2iInterviewBrief'

type Screen = 'home' | 'full' | 'realistic' | 'free' | 'results' | 'ai'
type FreeContent = 'theory' | 'snippets' | 'errors' | 'coding'
type CategoryFilter =
  | 'all'
  | Question['category']
  | CodingExercise['category']
  | SnippetQuestion['category']
  | CommonErrorCard['source']
type DifficultyFilter = 'all' | Question['difficulty']
type SnippetKindFilter = 'all' | SnippetQuestion['kind']

type SnippetSessionItem = {
  snippet: SnippetQuestion
  userAnswer: string
  revealed: boolean
  assessment?: SelfAssessment
}

type ErrorSessionItem = {
  error: CommonErrorCard
  userAnswer: string
  revealed: boolean
  assessment?: SelfAssessment
}

function notifyProgressUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('g2i-progress-updated'))
  }
}

function trackWeakItem(
  kind: WeakItemKind,
  id: string,
  title: string,
  category?: string,
  tags?: string[],
) {
  recordWeakAssessment({ id, kind, title, category, tags })
  notifyProgressUpdate()
}

const SNIPPET_KIND_LABEL: Record<SnippetQuestion['kind'], string> = {
  explain: 'Explain output',
  debug: 'Find the bug',
  error: 'Console error',
}

const CATEGORY_LABEL: Record<string, string> = {
  typescript: 'TypeScript',
  react: 'React',
  javascript: 'JavaScript',
  softskills: 'Soft skills',
}

function ProcessHeader() {
  return (
    <section className="mb-6 space-y-5">
      <div className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <p className="kicker mb-2">G2i technical screen</p>
        <h1 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Interview simulator
        </h1>
        <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Practice for the official <strong style={{ color: 'var(--text)' }}>{g2iInterviewTitle}</strong> — conversational
          questions, code snippets, and small live exercises.
        </p>
        <ul className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {g2iSimulatorModes.map((item) => (
            <li key={item.label}>
              <strong style={{ color: 'var(--text)' }}>{item.label}:</strong> {item.detail}
            </li>
          ))}
        </ul>
      </div>

      <details className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--text)' }}>
          What to expect &amp; logistics
        </summary>
        <div className="mt-4 space-y-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          <div>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>
              Interview format
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {g2iInterviewFormatSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>
              Before you join (real interview)
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {g2iLogisticsChecklist.map((line) => (
                <li key={line}>
                  {line.startsWith('Create a Replit') ? (
                    <>
                      Create a Replit account:{' '}
                      <a
                        href="https://replit.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        replit.com
                      </a>{' '}
                      — used to share code snippets live.
                    </>
                  ) : (
                    line
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>
              What they evaluate
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {g2iEvaluationCriteria.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium" style={{ color: 'var(--text)' }}>
              Prep resources
            </p>
            <ul className="space-y-2">
              {g2iPrepResources.map((resource) => (
                <li key={resource.title}>
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      {resource.title}
                    </a>
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      {resource.title}
                    </span>
                  )}
                  <span style={{ color: 'var(--muted)' }}> — {resource.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  )
}

function CountdownBar({ seconds, label }: { seconds: number; label: string }) {
  const urgent = seconds <= 5 * 60
  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
      style={{
        borderColor: urgent ? 'var(--red)' : 'var(--border)',
        background: urgent ? 'var(--red-bg)' : 'var(--surface)',
      }}
    >
      <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span className="font-mono text-lg font-medium" style={{ color: urgent ? 'var(--red)' : 'var(--accent)' }}>
        {formatTimer(seconds)}
      </span>
    </div>
  )
}

function ErrorFlashcard({
  item,
  index,
  total,
  onAnswerChange,
  onReveal,
  onAssess,
}: {
  item: ErrorSessionItem
  index: number
  total: number
  onAnswerChange: (value: string) => void
  onReveal: () => void
  onAssess: (value: SelfAssessment) => void
}) {
  const { error } = item
  return (
    <article className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          Error {index + 1} / {total}
        </span>
        <span className="badge btn-accent">{ERROR_SOURCE_LABEL[error.source]}</span>
        <span className="badge">{error.difficulty}</span>
        {error.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <pre
        className="mb-4 overflow-x-auto rounded-md border p-3 text-xs leading-relaxed sm:text-sm"
        style={{
          borderColor: 'var(--red)',
          background: 'var(--red-bg)',
          color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <code>{error.message}</code>
      </pre>

      <h2 className="mb-4 text-base font-semibold leading-relaxed sm:text-lg">{error.prompt}</h2>

      {error.context ? (
        <pre
          className="mb-4 overflow-x-auto rounded-md border p-3 text-xs leading-relaxed"
          style={{
            borderColor: 'var(--border-2)',
            background: 'var(--bg-2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <code>{error.context}</code>
        </pre>
      ) : null}

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
        Your diagnosis (speak out loud first)
      </label>
      <textarea
        value={item.userAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={5}
        className="mb-4 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2"
        style={{
          borderColor: 'var(--border-2)',
          background: 'var(--bg-2)',
          color: 'var(--text)',
        }}
        placeholder="What caused it? How do you fix it? What would you check in the browser?"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-accent" onClick={onReveal}>
          {item.revealed ? 'Answer visible' : 'Reveal fix'}
        </button>
        <button type="button" className="btn btn-mint" disabled={!item.revealed} onClick={() => onAssess('knew')}>
          I knew it {item.assessment === 'knew' ? '✓' : ''}
        </button>
        <button type="button" className="btn btn-amber" disabled={!item.revealed} onClick={() => onAssess('unknown')}>
          Didn&apos;t know {item.assessment === 'unknown' ? '✓' : ''}
        </button>
      </div>

      {item.revealed ? (
        <div className="hint-card panel whitespace-pre-wrap p-4 text-sm leading-relaxed is-open" style={{ color: 'var(--text)' }}>
          <p className="kicker mb-2">Model answer</p>
          {error.answer}
        </div>
      ) : null}
    </article>
  )
}

function SnippetQuestionCard({
  item,
  index,
  total,
  onAnswerChange,
  onReveal,
  onAssess,
}: {
  item: SnippetSessionItem
  index: number
  total: number
  onAnswerChange: (value: string) => void
  onReveal: () => void
  onAssess: (value: SelfAssessment) => void
}) {
  const { snippet } = item
  return (
    <article className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          Snippet {index + 1} / {total}
        </span>
        <span className="badge btn-accent">{CATEGORY_LABEL[snippet.category]}</span>
        <span className="badge">{SNIPPET_KIND_LABEL[snippet.kind]}</span>
        <span className="badge">{snippet.difficulty}</span>
        {snippet.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <h2 className="mb-4 text-base font-semibold leading-relaxed sm:text-lg">{snippet.prompt}</h2>

      <pre
        className="mb-4 overflow-x-auto rounded-md border p-3 text-xs leading-relaxed sm:text-sm"
        style={{
          borderColor: 'var(--border-2)',
          background: 'var(--bg-2)',
          color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <code>{snippet.code}</code>
      </pre>

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
        Your explanation (speak out loud first)
      </label>
      <textarea
        value={item.userAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={5}
        className="mb-4 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2"
        style={{
          borderColor: 'var(--border-2)',
          background: 'var(--bg-2)',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
        }}
        placeholder="What runs? What breaks? How would you fix it?"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-accent" onClick={onReveal}>
          {item.revealed ? 'Answer visible' : 'Reveal diagnosis'}
        </button>
        <button type="button" className="btn btn-mint" disabled={!item.revealed} onClick={() => onAssess('knew')}>
          I knew it {item.assessment === 'knew' ? '✓' : ''}
        </button>
        <button type="button" className="btn btn-amber" disabled={!item.revealed} onClick={() => onAssess('unknown')}>
          Didn&apos;t know {item.assessment === 'unknown' ? '✓' : ''}
        </button>
      </div>

      {item.revealed ? (
        <div className="hint-card panel whitespace-pre-wrap p-4 text-sm leading-relaxed is-open" style={{ color: 'var(--text)' }}>
          <p className="kicker mb-2">Model answer</p>
          {snippet.answer}
        </div>
      ) : null}
    </article>
  )
}

function TheoryQuestionCard({
  item,
  index,
  total,
  onAnswerChange,
  onReveal,
  onAssess,
}: {
  item: TheorySessionItem
  index: number
  total: number
  onAnswerChange: (value: string) => void
  onReveal: () => void
  onAssess: (value: SelfAssessment) => void
}) {
  return (
    <article className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          Question {index + 1} / {total}
        </span>
        <span className="badge btn-accent">{CATEGORY_LABEL[item.question.category]}</span>
        <span className="badge">{item.question.difficulty}</span>
        {item.question.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <h2 className="mb-4 text-base font-semibold leading-relaxed sm:text-lg">{item.question.question}</h2>

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
        Your answer (speak out loud, then write key points)
      </label>
      <textarea
        value={item.userAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={6}
        className="mb-4 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2"
        style={{
          borderColor: 'var(--border-2)',
          background: 'var(--bg-2)',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
        }}
        placeholder="Structure: context → approach → tradeoffs → what you'd verify..."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-accent" onClick={onReveal}>
          {item.revealed ? 'Answer visible' : 'Reveal model answer'}
        </button>
        <button
          type="button"
          className="btn btn-mint"
          disabled={!item.revealed}
          onClick={() => onAssess('knew')}
        >
          I knew it {item.assessment === 'knew' ? '✓' : ''}
        </button>
        <button
          type="button"
          className="btn btn-amber"
          disabled={!item.revealed}
          onClick={() => onAssess('unknown')}
        >
          Didn&apos;t know {item.assessment === 'unknown' ? '✓' : ''}
        </button>
      </div>

      {item.revealed ? (
        <div className="hint-card panel whitespace-pre-wrap p-4 text-sm leading-relaxed is-open" style={{ color: 'var(--text)' }}>
          <p className="kicker mb-2">Model answer</p>
          {item.question.answer}
        </div>
      ) : null}
    </article>
  )
}

function CodingExerciseCard({
  exercise,
  code,
  elapsedSec,
  showCriteria,
  onCodeChange,
  onShowCriteria,
}: {
  exercise: CodingExercise
  code: string
  elapsedSec: number
  showCriteria: boolean
  onCodeChange: (value: string) => void
  onShowCriteria: () => void
}) {
  const overTime = elapsedSec > exercise.timeLimit * 60
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle')

  async function handleCopyBrief() {
    const ok = await copyExerciseToClipboard(exercise)
    setCopyStatus(ok ? 'ok' : 'fail')
    setTimeout(() => setCopyStatus('idle'), 2500)
  }

  return (
    <article className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="badge btn-accent">{CATEGORY_LABEL[exercise.category]}</span>
        <span className="badge">{exercise.difficulty}</span>
        <span className="badge">Suggested {exercise.timeLimit} min</span>
      </div>

      <h2 className="mb-2 text-lg font-semibold">{exercise.title}</h2>
      <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {exercise.description}
      </p>

      <CountdownBar
        seconds={Math.max(0, exercise.timeLimit * 60 - elapsedSec)}
        label={overTime ? 'Over suggested time' : 'Time remaining (suggested)'}
      />

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
        Requirements
      </h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm">
        {exercise.requirements.map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
        Your code
      </label>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        spellCheck={false}
        rows={16}
        className="mb-4 w-full resize-y rounded-md border px-3 py-2 text-xs leading-relaxed outline-none focus-visible:ring-2 sm:text-sm"
        style={{
          borderColor: 'var(--border-2)',
          background: 'var(--bg-2)',
          color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
        }}
        placeholder={exercise.starterCode ?? '// Start coding here...'}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-mint" onClick={() => openReplitTemplate(exercise)}>
          Open in Replit
        </button>
        <button type="button" className="btn" onClick={handleCopyBrief}>
          {copyStatus === 'ok' ? 'Copied!' : copyStatus === 'fail' ? 'Copy failed' : 'Copy brief + starter'}
        </button>
        <button type="button" className="btn btn-accent" onClick={onShowCriteria}>
          {showCriteria ? 'Evaluation criteria visible' : 'Show evaluation criteria'}
        </button>
      </div>
      <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        Replit opens a blank {exercise.category} template — paste the brief, then code out loud like the real interview.
      </p>

      {showCriteria ? (
        <div className="hint-card panel p-4 is-open">
          <p className="kicker mb-2">Evaluation criteria</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            {exercise.evaluationCriteria.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

function ResultsScreen({
  results,
  timedOut,
  sessionTitle,
  codingExerciseTitle,
  onRestart,
  onHome,
}: {
  results: SimulationResults
  timedOut: boolean
  sessionTitle?: string
  codingExerciseTitle?: string
  onRestart: () => void
  onHome: () => void
}) {
  const scorePct = results.assessed > 0 ? Math.round((results.knew / results.assessed) * 100) : 0
  const allTimeCategories = getCategoryPercentages(loadProgress().categoryTotals)

  return (
    <section className="rounded-lg border p-5 sm:p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <h2 className="mb-2 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        {sessionTitle ?? 'Simulation'} complete
      </h2>
      {timedOut ? (
        <p className="mb-4 text-sm" style={{ color: 'var(--amber)' }}>
          Time is up — here is your self-assessment score.
        </p>
      ) : null}
      {codingExerciseTitle ? (
        <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Live coding exercise: <strong style={{ color: 'var(--text)' }}>{codingExerciseTitle}</strong> — review your
          code and evaluation criteria if you ran out of time.
        </p>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border p-3 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--mint)' }}>
            {results.knew}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            I knew it
          </p>
        </div>
        <div className="rounded-md border p-3 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--amber)' }}>
            {results.unknown}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Didn&apos;t know
          </p>
        </div>
        <div className="rounded-md border p-3 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {scorePct}%
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Score ({results.assessed}/{results.total} assessed)
          </p>
        </div>
      </div>

      {results.weakCategories.length > 0 ? (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold">Areas to improve</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
            {results.weakCategories.map((cat) => {
              const stats = results.byCategory[cat]
              return (
                <li key={cat}>
                  {CATEGORY_LABEL[cat] ?? cat}: {stats.unknown} gap{stats.unknown === 1 ? '' : 's'} — review{' '}
                  {CATEGORY_LABEL[cat] ?? cat} questions and related tags
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="mb-4 text-sm" style={{ color: 'var(--mint)' }}>
          Strong session — no category flagged as weak. Keep practicing coding exercises in free mode.
        </p>
      )}

      {results.weakTags.length > 0 ? (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">Tags to revisit</h3>
          <div className="flex flex-wrap gap-2">
            {results.weakTags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {allTimeCategories.length > 0 ? (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">All-time by category (saved)</h3>
          <ul className="space-y-2">
            {allTimeCategories.map((row) => (
              <li key={row.category}>
                <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{CATEGORY_LABEL[row.category] ?? row.category}</span>
                  <span>
                    {row.pct}% · {row.total} assessed
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bg-2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: 'var(--mint)' }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-accent" onClick={onRestart}>
          Run again
        </button>
        <button type="button" className="btn" onClick={onHome}>
          Back to modes
        </button>
      </div>
    </section>
  )
}

export default function G2iInterviewSimulator() {
  const [screen, setScreen] = useState<Screen>('home')
  const [resultsMode, setResultsMode] = useState<'full' | 'realistic'>('full')
  const [fullSession, setFullSession] = useState<TheorySessionItem[]>([])
  const [fullIndex, setFullIndex] = useState(0)
  const [fullTimeLeft, setFullTimeLeft] = useState(FULL_INTERVIEW_DURATION_SEC)
  const [timedOut, setTimedOut] = useState(false)
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [resultsCodingTitle, setResultsCodingTitle] = useState<string | undefined>()

  const [realisticTheory, setRealisticTheory] = useState<TheorySessionItem[]>([])
  const [realisticExercise, setRealisticExercise] = useState<CodingExercise | null>(null)
  const [realisticPhase, setRealisticPhase] = useState<'theory' | 'coding'>('theory')
  const [realisticIndex, setRealisticIndex] = useState(0)
  const [realisticTimeLeft, setRealisticTimeLeft] = useState(REALISTIC_INTERVIEW_DURATION_SEC)
  const [realisticCodingCode, setRealisticCodingCode] = useState('')
  const [realisticCodingCriteria, setRealisticCodingCriteria] = useState(false)
  const [realisticCodingElapsed, setRealisticCodingElapsed] = useState(0)

  const [freeContent, setFreeContent] = useState<FreeContent>('theory')
  const [freeCategory, setFreeCategory] = useState<CategoryFilter>('all')
  const [freeDifficulty, setFreeDifficulty] = useState<DifficultyFilter>('all')
  const [snippetKind, setSnippetKind] = useState<SnippetKindFilter>('all')
  const [freeIndex, setFreeIndex] = useState(0)
  const [freeTheorySession, setFreeTheorySession] = useState<TheorySessionItem[]>([])
  const [freeSnippetSession, setFreeSnippetSession] = useState<SnippetSessionItem[]>([])
  const [freeErrorSession, setFreeErrorSession] = useState<ErrorSessionItem[]>([])
  const [codingCode, setCodingCode] = useState<Record<string, string>>({})
  const [codingCriteria, setCodingCriteria] = useState<Record<string, boolean>>({})
  const [codingElapsed, setCodingElapsed] = useState(0)
  const fullSessionRef = useRef(fullSession)
  const realisticTheoryRef = useRef(realisticTheory)
  const realisticExerciseRef = useRef(realisticExercise)
  const endedRef = useRef(false)

  fullSessionRef.current = fullSession
  realisticTheoryRef.current = realisticTheory
  realisticExerciseRef.current = realisticExercise

  const finishFullSimulation = useCallback((session: TheorySessionItem[], wasTimedOut: boolean) => {
    if (endedRef.current) return
    endedRef.current = true
    const computed = computeSimulationResults(session)
    setResultsMode('full')
    setResultsCodingTitle(undefined)
    setResults(computed)
    setTimedOut(wasTimedOut)
    recordSessionResults(computed, 'full')
    notifyProgressUpdate()
    setScreen('results')
  }, [])

  const finishRealisticSimulation = useCallback((session: TheorySessionItem[], wasTimedOut: boolean) => {
    if (endedRef.current) return
    endedRef.current = true
    const computed = computeSimulationResults(session)
    setResultsMode('realistic')
    setResultsCodingTitle(realisticExerciseRef.current?.title)
    setResults(computed)
    setTimedOut(wasTimedOut)
    recordSessionResults(computed, 'realistic')
    notifyProgressUpdate()
    setScreen('results')
  }, [])

  function handleTheoryAssess(
    assessment: SelfAssessment,
    question: Question,
    apply: (a: SelfAssessment) => void,
  ) {
    apply(assessment)
    if (assessment === 'unknown') {
      trackWeakItem('theory', question.id, question.question.slice(0, 80), question.category, question.tags)
    }
  }

  function handleSnippetAssess(
    assessment: SelfAssessment,
    snippet: SnippetQuestion,
    apply: (a: SelfAssessment) => void,
  ) {
    apply(assessment)
    if (assessment === 'unknown') {
      trackWeakItem('snippet', snippet.id, snippet.prompt, snippet.category, snippet.tags)
    }
  }

  function handleErrorAssess(
    assessment: SelfAssessment,
    error: CommonErrorCard,
    apply: (a: SelfAssessment) => void,
  ) {
    apply(assessment)
    if (assessment === 'unknown') {
      trackWeakItem('error', error.id, error.message.slice(0, 80), error.source, error.tags)
    }
  }

  useEffect(() => {
    if (screen !== 'full' && screen !== 'realistic') return
    const tick = setInterval(() => {
      if (screen === 'full') setFullTimeLeft((s) => Math.max(0, s - 1))
      else setRealisticTimeLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [screen])

  useEffect(() => {
    if (screen === 'full' && fullTimeLeft === 0) {
      finishFullSimulation(fullSessionRef.current, true)
    }
  }, [screen, fullTimeLeft, finishFullSimulation])

  useEffect(() => {
    if (screen === 'realistic' && realisticTimeLeft === 0) {
      finishRealisticSimulation(realisticTheoryRef.current, true)
    }
  }, [screen, realisticTimeLeft, finishRealisticSimulation])

  useEffect(() => {
    if (screen !== 'free' || freeContent !== 'coding') return
    setCodingElapsed(0)
    const id = setInterval(() => setCodingElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [screen, freeContent, freeIndex])

  useEffect(() => {
    if (screen !== 'realistic' || realisticPhase !== 'coding') return
    setRealisticCodingElapsed(0)
    const id = setInterval(() => setRealisticCodingElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [screen, realisticPhase, realisticExercise?.id])

  const filteredTheory = useMemo(() => {
    return g2iQuestions.filter((q) => {
      const okCat = freeCategory === 'all' || q.category === freeCategory
      const okDiff = freeDifficulty === 'all' || q.difficulty === freeDifficulty
      return okCat && okDiff
    })
  }, [freeCategory, freeDifficulty])

  const filteredCoding = useMemo(() => {
    return g2iCodingExercises.filter((ex) => {
      const okCat = freeCategory === 'all' || ex.category === freeCategory
      const okDiff = freeDifficulty === 'all' || ex.difficulty === freeDifficulty
      return okCat && okDiff
    })
  }, [freeCategory, freeDifficulty])

  const filteredSnippets = useMemo(() => {
    return g2iSnippetQuestions.filter((s) => {
      const okCat = freeCategory === 'all' || s.category === freeCategory
      const okDiff = freeDifficulty === 'all' || s.difficulty === freeDifficulty
      const okKind = snippetKind === 'all' || s.kind === snippetKind
      return okCat && okDiff && okKind
    })
  }, [freeCategory, freeDifficulty, snippetKind])

  const filteredErrors = useMemo(() => {
    return g2iCommonErrors.filter((e) => {
      const okCat = freeCategory === 'all' || e.source === freeCategory
      const okDiff = freeDifficulty === 'all' || e.difficulty === freeDifficulty
      return okCat && okDiff
    })
  }, [freeCategory, freeDifficulty])

  function toSnippetSessionItems(snippets: SnippetQuestion[]): SnippetSessionItem[] {
    return snippets.map((snippet) => ({ snippet, userAnswer: '', revealed: false }))
  }

  function toErrorSessionItems(errors: CommonErrorCard[]): ErrorSessionItem[] {
    return errors.map((error) => ({ error, userAnswer: '', revealed: false }))
  }

  function startFullSimulation() {
    const questions = buildFullInterviewQuestions()
    endedRef.current = false
    setFullSession(toTheorySessionItems(questions))
    setFullIndex(0)
    setFullTimeLeft(FULL_INTERVIEW_DURATION_SEC)
    setTimedOut(false)
    setResults(null)
    setScreen('full')
  }

  function startRealisticSimulation() {
    const bundle = buildRealisticInterview()
    endedRef.current = false
    setRealisticTheory(toTheorySessionItems(bundle.theory))
    setRealisticExercise(bundle.exercise)
    setRealisticPhase('theory')
    setRealisticIndex(0)
    setRealisticTimeLeft(REALISTIC_INTERVIEW_DURATION_SEC)
    setRealisticCodingCode(bundle.exercise.starterCode ?? '')
    setRealisticCodingCriteria(false)
    setTimedOut(false)
    setResults(null)
    setScreen('realistic')
  }

  function startFreePractice() {
    setFreeIndex(0)
    setFreeTheorySession(toTheorySessionItems(filteredTheory))
    setFreeSnippetSession(toSnippetSessionItems(filteredSnippets))
    setFreeErrorSession(toErrorSessionItems(filteredErrors))
    setScreen('free')
  }

  useEffect(() => {
    if (screen === 'free' && freeContent === 'theory') {
      setFreeTheorySession(toTheorySessionItems(filteredTheory))
      setFreeIndex(0)
    }
  }, [freeCategory, freeDifficulty, freeContent, screen, filteredTheory])

  useEffect(() => {
    if (screen === 'free' && freeContent === 'snippets') {
      setFreeSnippetSession(toSnippetSessionItems(filteredSnippets))
      setFreeIndex(0)
    }
  }, [freeCategory, freeDifficulty, snippetKind, freeContent, screen, filteredSnippets])

  useEffect(() => {
    if (screen === 'free' && freeContent === 'errors') {
      setFreeErrorSession(toErrorSessionItems(filteredErrors))
      setFreeIndex(0)
    }
  }, [freeCategory, freeDifficulty, freeContent, screen, filteredErrors])

  function updateFullItem(updater: (item: TheorySessionItem) => TheorySessionItem) {
    setFullSession((prev) => prev.map((item, i) => (i === fullIndex ? updater(item) : item)))
  }

  function updateFreeTheoryItem(updater: (item: TheorySessionItem) => TheorySessionItem) {
    setFreeTheorySession((prev) => prev.map((item, i) => (i === freeIndex ? updater(item) : item)))
  }

  function updateFreeSnippetItem(updater: (item: SnippetSessionItem) => SnippetSessionItem) {
    setFreeSnippetSession((prev) => prev.map((item, i) => (i === freeIndex ? updater(item) : item)))
  }

  function updateFreeErrorItem(updater: (item: ErrorSessionItem) => ErrorSessionItem) {
    setFreeErrorSession((prev) => prev.map((item, i) => (i === freeIndex ? updater(item) : item)))
  }

  function updateRealisticItem(updater: (item: TheorySessionItem) => TheorySessionItem) {
    setRealisticTheory((prev) => prev.map((item, i) => (i === realisticIndex ? updater(item) : item)))
  }

  const currentCoding = filteredCoding[freeIndex]

  return (
    <main className="mx-auto max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
      <Link href="/" className="mb-4 inline-flex text-sm" style={{ color: 'var(--muted)' }}>
        ← Back to dashboard
      </Link>

      {screen === 'home' ? (
        <>
          <ProcessHeader />
          <G2iPrepPanel />
          <G2iProgressPanel />
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-lg border p-5 sm:col-span-2 lg:col-span-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h2 className="mb-2 text-lg font-semibold">AI interviewer (G2i style)</h2>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Live conversation with an AI technical interviewer: situational questions, immediate feedback, and final
                review after 12 answers. Requires GEMINI_API_KEY or ANTHROPIC_API_KEY.
              </p>
              <button type="button" className="btn btn-accent" onClick={() => setScreen('ai')}>
                Iniciar con IA
              </button>
            </article>
            <article className="rounded-lg border p-5 sm:col-span-2" style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }}>
              <p className="kicker mb-2">Closest to real G2i</p>
              <h2 className="mb-2 text-lg font-semibold">Realistic session (45 min)</h2>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                7 theory questions (4 TS + 3 React), then 1 live-coding exercise (~20 min). Single 45-minute countdown.
              </p>
              <button type="button" className="btn btn-accent w-full justify-center" onClick={startRealisticSimulation}>
                Start realistic session
              </button>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h2 className="mb-2 text-lg font-semibold">Full theory simulation</h2>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                6 TypeScript + 6 React questions. 60-minute countdown. Self-assess after each model answer.
              </p>
              <button type="button" className="btn btn-accent w-full justify-center" onClick={startFullSimulation}>
                Start 60 min simulation
              </button>
            </article>
            <article className="rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h2 className="mb-2 text-lg font-semibold">Free practice</h2>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Theory, {g2iSnippetQuestions.length} snippets, {g2iCommonErrors.length} console-error cards, or
                live-coding exercises.
              </p>
              <button type="button" className="btn btn-mint w-full justify-center" onClick={startFreePractice}>
                Open free practice
              </button>
            </article>
          </section>
        </>
      ) : null}

      {screen === 'realistic' && realisticExercise ? (
        <>
          <CountdownBar seconds={realisticTimeLeft} label="Session time remaining (45 min)" />
          <G2iAnswerFramework compact />
          <p className="mb-4 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Phase {realisticPhase === 'theory' ? '1 — Theory' : '2 — Live coding'} ·{' '}
            {realisticPhase === 'theory'
              ? `Question ${realisticIndex + 1} / ${realisticTheory.length}`
              : realisticExercise.title}
          </p>

          {realisticPhase === 'theory' && realisticTheory[realisticIndex] ? (
            <>
              <TheoryQuestionCard
                item={realisticTheory[realisticIndex]}
                index={realisticIndex}
                total={realisticTheory.length}
                onAnswerChange={(value) => updateRealisticItem((item) => ({ ...item, userAnswer: value }))}
                onReveal={() => updateRealisticItem((item) => ({ ...item, revealed: true }))}
                onAssess={(assessment) =>
                  handleTheoryAssess(assessment, realisticTheory[realisticIndex].question, (a) =>
                    updateRealisticItem((item) => ({ ...item, assessment: a })),
                  )
                }
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="btn"
                  disabled={realisticIndex === 0}
                  onClick={() => setRealisticIndex((i) => i - 1)}
                >
                  Previous
                </button>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {realisticTheory.filter((i) => i.assessment).length} / {realisticTheory.length} assessed
                </span>
                {realisticIndex < realisticTheory.length - 1 ? (
                  <button type="button" className="btn btn-accent" onClick={() => setRealisticIndex((i) => i + 1)}>
                    Next question
                  </button>
                ) : (
                  <button type="button" className="btn btn-accent" onClick={() => setRealisticPhase('coding')}>
                    Start live coding →
                  </button>
                )}
              </div>
            </>
          ) : null}

          {realisticPhase === 'coding' ? (
            <>
              <CodingExerciseCard
                exercise={realisticExercise}
                code={realisticCodingCode}
                elapsedSec={realisticCodingElapsed}
                showCriteria={realisticCodingCriteria}
                onCodeChange={setRealisticCodingCode}
                onShowCriteria={() => setRealisticCodingCriteria(true)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn" onClick={() => setRealisticPhase('theory')}>
                  ← Back to theory
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    endedRef.current = false
                    finishRealisticSimulation(realisticTheory, false)
                  }}
                >
                  Finish session & see results
                </button>
              </div>
            </>
          ) : null}

          <button type="button" className="btn mt-3 text-xs" onClick={() => setScreen('home')}>
            Exit session
          </button>
        </>
      ) : null}

      {screen === 'full' && fullSession[fullIndex] ? (
        <>
          <CountdownBar seconds={fullTimeLeft} label="Interview time remaining" />
          <G2iAnswerFramework compact />
          <TheoryQuestionCard
            item={fullSession[fullIndex]}
            index={fullIndex}
            total={fullSession.length}
            onAnswerChange={(value) => updateFullItem((item) => ({ ...item, userAnswer: value }))}
            onReveal={() => updateFullItem((item) => ({ ...item, revealed: true }))}
            onAssess={(assessment) =>
              handleTheoryAssess(assessment, fullSession[fullIndex].question, (a) =>
                updateFullItem((item) => ({ ...item, assessment: a })),
              )
            }
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              className="btn"
              disabled={fullIndex === 0}
              onClick={() => setFullIndex((i) => i - 1)}
            >
              Previous
            </button>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {fullSession.filter((i) => i.assessment).length} / {fullSession.length} assessed
            </span>
            {fullIndex < fullSession.length - 1 ? (
              <button type="button" className="btn btn-accent" onClick={() => setFullIndex((i) => i + 1)}>
                Next question
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  endedRef.current = false
                  finishFullSimulation(fullSession, false)
                }}
              >
                Finish & see results
              </button>
            )}
          </div>
          <button type="button" className="btn mt-3 text-xs" onClick={() => setScreen('home')}>
            Exit simulation
          </button>
        </>
      ) : null}

      {screen === 'free' ? (
        <>
          <ProcessHeader />
          <section className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn ${freeContent === 'theory' ? 'btn-accent' : ''}`}
              onClick={() => setFreeContent('theory')}
            >
              Theory
            </button>
            <button
              type="button"
              className={`btn ${freeContent === 'snippets' ? 'btn-accent' : ''}`}
              onClick={() => setFreeContent('snippets')}
            >
              Snippets ({g2iSnippetQuestions.length})
            </button>
            <button
              type="button"
              className={`btn ${freeContent === 'errors' ? 'btn-accent' : ''}`}
              onClick={() => setFreeContent('errors')}
            >
              Console errors ({g2iCommonErrors.length})
            </button>
            <button
              type="button"
              className={`btn ${freeContent === 'coding' ? 'btn-accent' : ''}`}
              onClick={() => setFreeContent('coding')}
            >
              Live coding
            </button>
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            <button type="button" className={`btn ${freeCategory === 'all' ? 'btn-accent' : ''}`} onClick={() => setFreeCategory('all')}>
              All topics
            </button>
            {(freeContent === 'theory'
              ? (['typescript', 'react', 'javascript', 'softskills'] as const)
              : freeContent === 'errors'
                ? (['react', 'typescript', 'javascript', 'nextjs', 'browser'] as const)
                : (['typescript', 'react', 'javascript'] as const)
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn ${freeCategory === cat ? 'btn-accent' : ''}`}
                onClick={() => setFreeCategory(cat)}
              >
                {freeContent === 'errors' ? ERROR_SOURCE_LABEL[cat as CommonErrorCard['source']] : CATEGORY_LABEL[cat]}
              </button>
            ))}
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            {(['all', 'junior', 'mid', 'senior'] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`btn ${freeDifficulty === level ? 'btn-accent' : ''}`}
                onClick={() => setFreeDifficulty(level)}
              >
                {level === 'all' ? 'All levels' : level}
              </button>
            ))}
          </section>

          {freeContent === 'snippets' ? (
            <section className="mb-6 flex flex-wrap gap-2">
              {(['all', 'explain', 'debug', 'error'] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={`btn ${snippetKind === kind ? 'btn-accent' : ''}`}
                  onClick={() => setSnippetKind(kind)}
                >
                  {kind === 'all' ? 'All types' : SNIPPET_KIND_LABEL[kind]}
                </button>
              ))}
            </section>
          ) : null}

          {(freeContent === 'theory' || freeContent === 'snippets' || freeContent === 'errors') && (
            <G2iAnswerFramework compact />
          )}

          {freeContent === 'theory' && freeTheorySession[freeIndex] ? (
            <>
              <TheoryQuestionCard
                item={freeTheorySession[freeIndex]}
                index={freeIndex}
                total={freeTheorySession.length}
                onAnswerChange={(value) => updateFreeTheoryItem((item) => ({ ...item, userAnswer: value }))}
                onReveal={() => updateFreeTheoryItem((item) => ({ ...item, revealed: true }))}
                onAssess={(assessment) =>
                  handleTheoryAssess(assessment, freeTheorySession[freeIndex].question, (a) =>
                    updateFreeTheoryItem((item) => ({ ...item, assessment: a })),
                  )
                }
              />
              <div className="mt-4 flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  className="btn"
                  disabled={freeIndex === 0}
                  onClick={() => setFreeIndex((i) => i - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={freeIndex >= freeTheorySession.length - 1}
                  onClick={() => setFreeIndex((i) => i + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : null}

          {freeContent === 'snippets' && freeSnippetSession[freeIndex] ? (
            <>
              <SnippetQuestionCard
                item={freeSnippetSession[freeIndex]}
                index={freeIndex}
                total={freeSnippetSession.length}
                onAnswerChange={(value) => updateFreeSnippetItem((item) => ({ ...item, userAnswer: value }))}
                onReveal={() => updateFreeSnippetItem((item) => ({ ...item, revealed: true }))}
                onAssess={(assessment) =>
                  handleSnippetAssess(assessment, freeSnippetSession[freeIndex].snippet, (a) =>
                    updateFreeSnippetItem((item) => ({ ...item, assessment: a })),
                  )
                }
              />
              <div className="mt-4 flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  className="btn"
                  disabled={freeIndex === 0}
                  onClick={() => setFreeIndex((i) => i - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={freeIndex >= freeSnippetSession.length - 1}
                  onClick={() => setFreeIndex((i) => i + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : null}

          {freeContent === 'errors' && freeErrorSession[freeIndex] ? (
            <>
              <ErrorFlashcard
                item={freeErrorSession[freeIndex]}
                index={freeIndex}
                total={freeErrorSession.length}
                onAnswerChange={(value) => updateFreeErrorItem((item) => ({ ...item, userAnswer: value }))}
                onReveal={() => updateFreeErrorItem((item) => ({ ...item, revealed: true }))}
                onAssess={(assessment) =>
                  handleErrorAssess(assessment, freeErrorSession[freeIndex].error, (a) =>
                    updateFreeErrorItem((item) => ({ ...item, assessment: a })),
                  )
                }
              />
              <div className="mt-4 flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  className="btn"
                  disabled={freeIndex === 0}
                  onClick={() => setFreeIndex((i) => i - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={freeIndex >= freeErrorSession.length - 1}
                  onClick={() => setFreeIndex((i) => i + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : null}

          {freeContent === 'coding' && currentCoding ? (
            <CodingExerciseCard
              exercise={currentCoding}
              code={codingCode[currentCoding.id] ?? currentCoding.starterCode ?? ''}
              elapsedSec={codingElapsed}
              showCriteria={codingCriteria[currentCoding.id] ?? false}
              onCodeChange={(value) => setCodingCode((prev) => ({ ...prev, [currentCoding.id]: value }))}
              onShowCriteria={() => setCodingCriteria((prev) => ({ ...prev, [currentCoding.id]: true }))}
            />
          ) : null}

          {freeContent === 'coding' && filteredCoding.length > 1 ? (
            <div className="mt-4 flex flex-wrap justify-between gap-2">
              <button type="button" className="btn" disabled={freeIndex === 0} onClick={() => setFreeIndex((i) => i - 1)}>
                Previous exercise
              </button>
              <span className="text-xs self-center" style={{ color: 'var(--muted)' }}>
                {freeIndex + 1} / {filteredCoding.length}
              </span>
              <button
                type="button"
                className="btn btn-accent"
                disabled={freeIndex >= filteredCoding.length - 1}
                onClick={() => setFreeIndex((i) => i + 1)}
              >
                Next exercise
              </button>
            </div>
          ) : null}

          {freeContent === 'theory' && freeTheorySession.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No questions match these filters.
            </p>
          ) : null}

          {freeContent === 'snippets' && freeSnippetSession.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No snippets match these filters.
            </p>
          ) : null}

          {freeContent === 'errors' && freeErrorSession.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No error cards match these filters.
            </p>
          ) : null}

          {freeContent === 'coding' && filteredCoding.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No exercises match these filters.
            </p>
          ) : null}

          <button type="button" className="btn mt-6" onClick={() => setScreen('home')}>
            Back to modes
          </button>
        </>
      ) : null}

      {screen === 'ai' ? (
        <>
          <ProcessHeader />
          <G2iAiInterview onExit={() => setScreen('home')} />
        </>
      ) : null}

      {screen === 'results' && results ? (
        <ResultsScreen
          results={results}
          timedOut={timedOut}
          sessionTitle={resultsMode === 'realistic' ? 'Realistic session' : 'Full simulation'}
          codingExerciseTitle={resultsCodingTitle}
          onRestart={resultsMode === 'realistic' ? startRealisticSimulation : startFullSimulation}
          onHome={() => setScreen('home')}
        />
      ) : null}
    </main>
  )
}
