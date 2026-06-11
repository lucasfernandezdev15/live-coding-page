'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  g2iCodingCategories,
  g2iCodingExercises,
  g2iCodingFormatSummary,
  openTriviaApiNotes,
  type CodingExercise,
} from '@/data/g2i-coding-exercises'
import {
  g2iInterviewFormatSummary,
  g2iQuestionCategories,
  g2iQuestions,
  type Question,
} from '@/data/g2i-questions'
import {
  pickSanityAssessmentQuestions,
  SANITY_CATEGORY_LABEL,
  sanityAssessmentQuestionCount,
  sanityCmsQuestions,
  sanityQuestionCategories,
  type SanityQuestion,
} from '@/data/sanity-cms-questions'
import {
  sanityIntroTemplate,
  sanityInterviewFormatSummary,
  sanityInterviewProcedure,
  sanityInterviewTitle,
  sanityPrepResources,
} from '@/lib/sanityInterviewBrief'

type Mode = 'theory' | 'live-coding' | 'sanity-cms'
type CategoryFilter = 'all' | Question['category']
type DifficultyFilter = 'all' | Question['difficulty']
type TypeFilter = 'all' | Question['type']
type CodingCategoryFilter = 'all' | CodingExercise['category']
type CodingDifficultyFilter = 'all' | CodingExercise['difficulty']
type SanityCategoryFilter = 'all' | SanityQuestion['category']
type SanityDifficultyFilter = 'all' | SanityQuestion['difficulty']

const THEORY_CATEGORY_LABEL: Record<Question['category'], string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  softskills: 'Soft skills',
}

const CODING_CATEGORY_LABEL: Record<CodingExercise['category'], string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
}

type Props = {
  initialMode?: Mode
}

export default function InterviewDrillPrep({ initialMode = 'theory' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode)

  const [category, setCategory] = useState<CategoryFilter>('all')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [type, setType] = useState<TypeFilter>('all')
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({})
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({})

  const [codingCategory, setCodingCategory] = useState<CodingCategoryFilter>('all')
  const [codingDifficulty, setCodingDifficulty] = useState<CodingDifficultyFilter>('all')
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({})
  const [openCodingHints, setOpenCodingHints] = useState<Record<string, boolean>>({})
  const [openStarter, setOpenStarter] = useState<Record<string, boolean>>({})

  const [sanityCategory, setSanityCategory] = useState<SanityCategoryFilter>('all')
  const [sanityDifficulty, setSanityDifficulty] = useState<SanityDifficultyFilter>('all')
  const [sanityAssessmentIds, setSanityAssessmentIds] = useState<string[] | null>(null)
  const [openSanityAnswers, setOpenSanityAnswers] = useState<Record<string, boolean>>({})
  const [openSanityHints, setOpenSanityHints] = useState<Record<string, boolean>>({})
  const [showIntroTemplate, setShowIntroTemplate] = useState(false)

  const filteredQuestions = useMemo(() => {
    return g2iQuestions.filter((item) => {
      const okCategory = category === 'all' || item.category === category
      const okDifficulty = difficulty === 'all' || item.difficulty === difficulty
      const okType = type === 'all' || item.type === type
      return okCategory && okDifficulty && okType
    })
  }, [category, difficulty, type])

  const filteredExercises = useMemo(() => {
    return g2iCodingExercises.filter((item) => {
      const okCategory = codingCategory === 'all' || item.category === codingCategory
      const okDifficulty = codingDifficulty === 'all' || item.difficulty === codingDifficulty
      return okCategory && okDifficulty
    })
  }, [codingCategory, codingDifficulty])

  const filteredSanityQuestions = useMemo(() => {
    if (sanityAssessmentIds) {
      return sanityAssessmentIds
        .map((id) => sanityCmsQuestions.find((q) => q.id === id))
        .filter((q): q is SanityQuestion => Boolean(q))
    }
    return sanityCmsQuestions.filter((item) => {
      const okCategory = sanityCategory === 'all' || item.category === sanityCategory
      const okDifficulty = sanityDifficulty === 'all' || item.difficulty === sanityDifficulty
      return okCategory && okDifficulty
    })
  }, [sanityCategory, sanityDifficulty, sanityAssessmentIds])

  function startSanityAssessment() {
    const picked = pickSanityAssessmentQuestions(sanityAssessmentQuestionCount)
    setSanityAssessmentIds(picked.map((q) => q.id))
    setOpenSanityAnswers({})
    setOpenSanityHints({})
    setMode('sanity-cms')
  }

  function clearSanityAssessment() {
    setSanityAssessmentIds(null)
  }

  const questionCounts = useMemo(
    () => ({
      theoretical: filteredQuestions.filter((q) => q.type === 'theoretical').length,
      coding: filteredQuestions.filter((q) => q.type === 'coding').length,
    }),
    [filteredQuestions],
  )

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-6">
        <Link href="/" className="mb-3 inline-flex text-sm" style={{ color: 'var(--muted)' }}>
          ← Back to dashboard
        </Link>
        <p className="kicker mb-2">Private practice</p>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Technical interview drills
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Theory Q&A and live-coding exercise prompts. Practice out loud, then reveal hints and model answers.
        </p>
      </header>

      <section className="mb-6 flex flex-wrap gap-2">
        <button type="button" className={`btn ${mode === 'theory' ? 'btn-accent' : ''}`} onClick={() => setMode('theory')}>
          Theory ({g2iQuestions.length})
        </button>
        <button
          type="button"
          className={`btn ${mode === 'live-coding' ? 'btn-accent' : ''}`}
          onClick={() => setMode('live-coding')}
        >
          Live coding ({g2iCodingExercises.length})
        </button>
        <button
          type="button"
          className={`btn ${mode === 'sanity-cms' ? 'btn-accent' : ''}`}
          onClick={() => setMode('sanity-cms')}
        >
          Sanity CMS ({sanityCmsQuestions.length})
        </button>
      </section>

      {mode === 'theory' ? (
        <>
          <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="mb-2 text-lg font-semibold">What to expect</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {g2iInterviewFormatSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            <button type="button" className={`btn ${category === 'all' ? 'btn-accent' : ''}`} onClick={() => setCategory('all')}>
              All topics
            </button>
            {g2iQuestionCategories.map((item) => (
              <button
                key={item}
                type="button"
                className={`btn ${category === item ? 'btn-accent' : ''}`}
                onClick={() => setCategory(item)}
              >
                {THEORY_CATEGORY_LABEL[item]}
              </button>
            ))}
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            {(['all', 'junior', 'mid', 'senior'] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`btn ${difficulty === level ? 'btn-accent' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                {level === 'all' ? 'All levels' : level}
              </button>
            ))}
          </section>

          <section className="mb-6 flex flex-wrap gap-2">
            {(['all', 'theoretical', 'coding'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`btn ${type === item ? 'btn-accent' : ''}`}
                onClick={() => setType(item)}
              >
                {item === 'all' ? 'All types' : item}
              </button>
            ))}
            <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
              {filteredQuestions.length} questions · {questionCounts.theoretical} theory · {questionCounts.coding} coding
            </span>
          </section>

          <section className="space-y-4">
            {filteredQuestions.map((item, idx) => (
              <article key={item.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{idx + 1}.</span>
                  <span className="badge btn-accent">{THEORY_CATEGORY_LABEL[item.category]}</span>
                  <span className="badge">{item.difficulty}</span>
                  <span className="badge">{item.type}</span>
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mb-3 text-base font-semibold leading-relaxed">{item.question}</h3>

                {item.hints?.length ? (
                  <div className="mb-3">
                    <button type="button" className="btn text-xs" onClick={() => setOpenHints((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                      {openHints[item.id] ? 'Hide hints' : 'Show hints'}
                    </button>
                    {openHints[item.id] ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
                        {item.hints.map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                <button type="button" className="btn btn-accent" onClick={() => setOpenAnswers((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                  {openAnswers[item.id] ? 'Hide answer' : 'Reveal answer'}
                </button>

                {openAnswers[item.id] ? (
                  <div className="hint-card panel mt-3 whitespace-pre-wrap p-3 text-sm leading-relaxed is-open" style={{ color: 'var(--text)' }}>
                    {item.answer}
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        </>
      ) : mode === 'sanity-cms' ? (
        <>
          <section className="mb-6 rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="kicker mb-2">Initial call assessment</p>
            <h2 className="mb-2 text-lg font-semibold">{sanityInterviewTitle}</h2>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {sanityInterviewFormatSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold">Procedure on the call</h3>
            <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {sanityInterviewProcedure.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <div className="mb-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-accent" onClick={startSanityAssessment}>
                Simulate live assessment ({sanityAssessmentQuestionCount} questions)
              </button>
              {sanityAssessmentIds ? (
                <button type="button" className="btn" onClick={clearSanityAssessment}>
                  Show all questions
                </button>
              ) : null}
              <button type="button" className="btn btn-mint" onClick={() => setShowIntroTemplate((v) => !v)}>
                {showIntroTemplate ? 'Hide intro script' : 'Intro script'}
              </button>
            </div>
            {sanityAssessmentIds ? (
              <p className="mb-3 text-sm" style={{ color: 'var(--accent)' }}>
                Assessment mode: {filteredSanityQuestions.length} questions selected — practice answering out loud, then
                reveal each model answer.
              </p>
            ) : null}
            {showIntroTemplate ? (
              <div
                className="hint-card panel mb-4 whitespace-pre-wrap p-3 text-sm leading-relaxed is-open"
                style={{ color: 'var(--text)' }}
              >
                {sanityIntroTemplate}
              </div>
            ) : null}
            <h3 className="mb-2 text-sm font-semibold">Prep resources</h3>
            <ul className="space-y-1 text-sm">
              {sanityPrepResources.map((resource) => (
                <li key={resource.title}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {resource.title}
                  </a>
                  <span style={{ color: 'var(--muted)' }}> — {resource.description}</span>
                </li>
              ))}
            </ul>
          </section>

          {!sanityAssessmentIds ? (
            <>
              <section className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn ${sanityCategory === 'all' ? 'btn-accent' : ''}`}
                  onClick={() => setSanityCategory('all')}
                >
                  All topics
                </button>
                {sanityQuestionCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn ${sanityCategory === item ? 'btn-accent' : ''}`}
                    onClick={() => setSanityCategory(item)}
                  >
                    {SANITY_CATEGORY_LABEL[item]}
                  </button>
                ))}
              </section>

              <section className="mb-6 flex flex-wrap gap-2">
                {(['all', 'junior', 'mid', 'senior'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`btn ${sanityDifficulty === level ? 'btn-accent' : ''}`}
                    onClick={() => setSanityDifficulty(level)}
                  >
                    {level === 'all' ? 'All levels' : level}
                  </button>
                ))}
              </section>
            </>
          ) : null}

          <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>
            {filteredSanityQuestions.length} question{filteredSanityQuestions.length === 1 ? '' : 's'}
          </p>

          <section className="space-y-4">
            {filteredSanityQuestions.map((item, idx) => (
              <article key={item.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>
                    Q{idx + 1}
                    {sanityAssessmentIds ? ` / ${sanityAssessmentQuestionCount}` : ''}
                  </span>
                  <span className="badge btn-accent">{SANITY_CATEGORY_LABEL[item.category]}</span>
                  <span className="badge">{item.difficulty}</span>
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mb-3 text-base font-semibold leading-relaxed">{item.question}</h3>

                {item.hints?.length ? (
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn text-xs"
                      onClick={() => setOpenSanityHints((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    >
                      {openSanityHints[item.id] ? 'Hide hints' : 'Show hints'}
                    </button>
                    {openSanityHints[item.id] ? (
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
                  onClick={() => setOpenSanityAnswers((p) => ({ ...p, [item.id]: !p[item.id] }))}
                >
                  {openSanityAnswers[item.id] ? 'Hide answer' : 'Reveal answer'}
                </button>

                {openSanityAnswers[item.id] ? (
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

          {filteredSanityQuestions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No questions match these filters.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <section className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="mb-2 text-lg font-semibold">Live coding format</h2>
            <ul className="mb-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {g2iCodingFormatSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="mb-2 text-sm font-semibold">Open Trivia DB quick reference</h3>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {openTriviaApiNotes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn ${codingCategory === 'all' ? 'btn-accent' : ''}`}
              onClick={() => setCodingCategory('all')}
            >
              All topics
            </button>
            {g2iCodingCategories.map((item) => (
              <button
                key={item}
                type="button"
                className={`btn ${codingCategory === item ? 'btn-accent' : ''}`}
                onClick={() => setCodingCategory(item)}
              >
                {CODING_CATEGORY_LABEL[item]}
              </button>
            ))}
          </section>

          <section className="mb-6 flex flex-wrap gap-2">
            {(['all', 'junior', 'mid', 'senior'] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`btn ${codingDifficulty === level ? 'btn-accent' : ''}`}
                onClick={() => setCodingDifficulty(level)}
              >
                {level === 'all' ? 'All levels' : level}
              </button>
            ))}
            <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
              {filteredExercises.length} exercises
            </span>
          </section>

          <section className="space-y-4">
            {filteredExercises.map((item, idx) => (
              <article key={item.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{idx + 1}.</span>
                  <span className="badge btn-accent">{CODING_CATEGORY_LABEL[item.category]}</span>
                  <span className="badge">{item.difficulty}</span>
                  <span className="badge">{item.timeLimit} min</span>
                </div>
                <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
                <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {item.description}
                </p>

                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                  Requirements
                </h4>
                <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">
                  {item.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>

                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                  Evaluation criteria
                </h4>
                <ul className="mb-3 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
                  {item.evaluationCriteria.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>

                {item.starterCode ? (
                  <div className="mb-3">
                    <button type="button" className="btn text-xs" onClick={() => setOpenStarter((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                      {openStarter[item.id] ? 'Hide starter code' : 'Show starter code'}
                    </button>
                    {openStarter[item.id] ? (
                      <pre
                        className="mt-2 overflow-auto rounded-md border p-3 text-xs leading-relaxed"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-2)', fontFamily: 'var(--font-mono)' }}
                      >
                        {item.starterCode}
                      </pre>
                    ) : null}
                  </div>
                ) : null}

                <div className="mb-3 flex flex-wrap gap-2">
                  <button type="button" className="btn text-xs" onClick={() => setOpenCodingHints((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                    {openCodingHints[item.id] ? 'Hide hints' : 'Show hints'}
                  </button>
                  {item.exampleSolution ? (
                    <button type="button" className="btn btn-accent text-xs" onClick={() => setOpenSolutions((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                      {openSolutions[item.id] ? 'Hide solution sketch' : 'Reveal solution sketch'}
                    </button>
                  ) : null}
                </div>

                {openCodingHints[item.id] ? (
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--muted)' }}>
                    {item.hints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ul>
                ) : null}

                {openSolutions[item.id] && item.exampleSolution ? (
                  <pre
                    className="hint-card panel overflow-auto whitespace-pre-wrap p-3 text-xs leading-relaxed is-open"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
                  >
                    {item.exampleSolution}
                  </pre>
                ) : null}
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  )
}
