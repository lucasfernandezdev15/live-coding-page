'use client'

import Link from 'next/link'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Play } from 'lucide-react'
import type { Challenge } from '@/lib/types'
import ChallengeEditor from '@/components/ChallengeEditor'
import HintPanel from '@/components/HintPanel'
import SandpackPreview from '@/components/SandpackPreview'
import SolutionModal from '@/components/SolutionModal'
import Timer from '@/components/Timer'
import useKeyboardShortcuts from '@/components/useKeyboardShortcuts'

type ChallengeState = {
  code: string
  hintsUsed: number
  hintPanelOpen: boolean
  solutionRevealed: boolean
  compareOpen: boolean
  elapsedSeconds: number
  hintAvailable: boolean
}

type Action =
  | { type: 'SET_CODE'; payload: string }
  | { type: 'OPEN_HINT' }
  | { type: 'CLOSE_HINT' }
  | { type: 'HINT_USED' }
  | { type: 'REVEAL_SOLUTION' }
  | { type: 'CLOSE_COMPARE' }
  | { type: 'OPEN_COMPARE' }
  | { type: 'SET_ELAPSED'; payload: number }
  | { type: 'SET_HINT_AVAILABLE' }
  | { type: 'RESET_CODE'; payload: string }

function reducer(state: ChallengeState, action: Action): ChallengeState {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, code: action.payload }
    case 'OPEN_HINT':
      return { ...state, hintPanelOpen: true }
    case 'CLOSE_HINT':
      return { ...state, hintPanelOpen: false }
    case 'HINT_USED':
      return { ...state, hintsUsed: state.hintsUsed + 1 }
    case 'REVEAL_SOLUTION':
      return { ...state, solutionRevealed: true, compareOpen: true }
    case 'OPEN_COMPARE':
      return { ...state, compareOpen: true }
    case 'CLOSE_COMPARE':
      return { ...state, compareOpen: false }
    case 'SET_ELAPSED':
      return { ...state, elapsedSeconds: action.payload }
    case 'SET_HINT_AVAILABLE':
      return { ...state, hintAvailable: true }
    case 'RESET_CODE':
      return { ...state, code: action.payload }
    default:
      return state
  }
}

function outputLabel(previewType: Challenge['previewType']) {
  if (previewType === 'test') return 'Run tests in your local environment.'
  return 'Run in your local environment.'
}

export default function ChallengeWorkspace({ challenge }: { challenge: Challenge }) {
  const [state, dispatch] = useReducer(reducer, {
    code: challenge.starterCode,
    hintsUsed: 0,
    hintPanelOpen: false,
    solutionRevealed: false,
    compareOpen: false,
    elapsedSeconds: 0,
    hintAvailable: false,
  })
  const [showResetBanner, setShowResetBanner] = useState(false)
  const [showRevealConfirm, setShowRevealConfirm] = useState(false)
  const [timerResetSignal, setTimerResetSignal] = useState(0)
  const [fastTyping, setFastTyping] = useState(false)
  const [previewCode, setPreviewCode] = useState(challenge.starterCode)
  const [previewKey, setPreviewKey] = useState(0)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const hasLivePreview = challenge.previewType === 'react' || challenge.previewType === 'nextjs'
  const previewPending = hasLivePreview && previewCode !== state.code

  useEffect(() => {
    setPreviewCode(challenge.starterCode)
    setPreviewKey((key) => key + 1)
  }, [challenge.id, challenge.starterCode])

  function runPreview() {
    setPreviewCode(state.code)
    setPreviewKey((key) => key + 1)
  }

  useEffect(() => {
    if (state.code === challenge.starterCode) return
    const raw = localStorage.getItem('devprobe:progress')
    const progress = raw ? (JSON.parse(raw) as Record<string, { attempted: boolean; completed: boolean; bestTimeSeconds: number }>) : {}
    const prev = progress[challenge.id]
    progress[challenge.id] = {
      attempted: true,
      completed: prev?.completed ?? false,
      bestTimeSeconds: prev?.bestTimeSeconds ?? 0,
    }
    localStorage.setItem('devprobe:progress', JSON.stringify(progress))
  }, [challenge.id, challenge.starterCode, state.code])

  const closeAll = () => {
    dispatch({ type: 'CLOSE_HINT' })
    dispatch({ type: 'CLOSE_COMPARE' })
  }

  useKeyboardShortcuts({
    onFocusEditor: () => editorContainerRef.current?.focus(),
    onEscape: closeAll,
    onHint: () => {
      if (state.hintAvailable) dispatch({ type: 'OPEN_HINT' })
    },
    onReset: () => setShowResetBanner(true),
  })

  const closeNudge = useMemo(
    () => state.elapsedSeconds > 120 && state.code.length > challenge.solution.length * 0.5 && !state.solutionRevealed,
    [challenge.solution.length, state.code.length, state.elapsedSeconds, state.solutionRevealed],
  )

  function revealSolution() {
    dispatch({ type: 'REVEAL_SOLUTION' })
    setShowRevealConfirm(false)
    const raw = localStorage.getItem('devprobe:progress')
    const progress = raw ? (JSON.parse(raw) as Record<string, { attempted: boolean; completed: boolean; bestTimeSeconds: number }>) : {}
    const prev = progress[challenge.id]
    const nextBest = !prev?.bestTimeSeconds ? state.elapsedSeconds : Math.min(prev.bestTimeSeconds, state.elapsedSeconds)
    progress[challenge.id] = { attempted: true, completed: true, bestTimeSeconds: nextBest }
    localStorage.setItem('devprobe:progress', JSON.stringify(progress))
  }

  return (
    <main className="grid min-h-screen grid-cols-1 gap-0 lg:h-screen lg:grid-cols-[38%_62%]">
      <aside className="border-b px-3 py-4 lg:border-b-0 lg:border-r lg:px-6 lg:py-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="badge" style={{ color: 'var(--accent)' }}>{challenge.category}</span>
          <span className={`badge ${challenge.difficulty === 'easy' ? 'btn-mint' : challenge.difficulty === 'medium' ? 'btn-amber' : 'btn-red'}`}>
            {challenge.difficulty}
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold lg:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{challenge.title}</h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>{challenge.description}</p>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm">
          {challenge.instructions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {challenge.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-red"
            onClick={() => {
              if (state.elapsedSeconds >= 300) revealSolution()
              else setShowRevealConfirm(true)
            }}
          >
            Reveal Solution
          </button>
          {state.solutionRevealed ? (
            <button type="button" className="btn btn-amber" onClick={() => dispatch({ type: 'OPEN_COMPARE' })}>
              Compare Solutions
            </button>
          ) : null}
        </div>
        {showRevealConfirm ? (
          <div className="mb-4 rounded-md border p-3 text-sm" style={{ borderColor: 'var(--red)', background: 'var(--red-bg)' }}>
            Five minutes have not passed yet. Revealing the solution now may reduce the value of the practice.
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn btn-red" onClick={revealSolution}>
                Reveal anyway
              </button>
              <button type="button" className="btn" onClick={() => setShowRevealConfirm(false)}>
                Keep trying
              </button>
            </div>
          </div>
        ) : null}
        <div className="mt-auto space-y-1 text-xs" style={{ color: 'var(--muted)' }}>
          <p>Shortcuts: Ctrl/Cmd+Enter (editor)</p>
          <p>Esc (close panel/modal), Ctrl/Cmd+Shift+H (hints)</p>
          <p>Ctrl/Cmd+Shift+R (reset)</p>
        </div>
      </aside>

      <section className="grid min-h-0 grid-rows-[auto_auto_minmax(220px,1fr)_minmax(260px,1.1fr)] p-3 lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,1.2fr)] lg:p-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border p-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <Timer
            onHintUnlock={() => dispatch({ type: 'SET_HINT_AVAILABLE' })}
            onTick={(value) => dispatch({ type: 'SET_ELAPSED', payload: value })}
            resetSignal={timerResetSignal}
          />
          <label className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={fastTyping}
              onChange={(event) => {
                setFastTyping(event.target.checked)
              }}
            />
            Fast Typing
          </label>
          <button
            type="button"
            disabled={!state.hintAvailable}
            className={`btn ${state.hintAvailable ? 'btn-accent hint-available' : ''}`}
            onClick={() => dispatch({ type: 'OPEN_HINT' })}
          >
            <BookOpen size={14} />
            {state.hintAvailable ? `Hints (${state.hintsUsed}/3)` : 'Hints at 01:00'}
          </button>
          <button type="button" className="btn" onClick={() => setShowResetBanner(true)}>
            Reset code
          </button>
        </header>

        {showResetBanner ? (
          <div className="mb-2 rounded-md border p-3 text-sm" style={{ borderColor: 'var(--amber)', background: 'var(--amber-bg)' }}>
            Reset to starter code? This will erase your progress.
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-amber"
                onClick={() => {
                  dispatch({ type: 'RESET_CODE', payload: challenge.starterCode })
                  setPreviewCode(challenge.starterCode)
                  setPreviewKey((key) => key + 1)
                  setTimerResetSignal((prev) => prev + 1)
                  setShowResetBanner(false)
                }}
              >
                Confirm
              </button>
              <button type="button" className="btn" onClick={() => setShowResetBanner(false)}>Cancel</button>
            </div>
          </div>
        ) : null}

        <div className="mb-3 flex min-h-0 flex-col overflow-hidden rounded-md border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {hasLivePreview ? (
            <>
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
                style={{ borderColor: 'var(--border)' }}
              >
                <button type="button" className="btn btn-accent" onClick={runPreview}>
                  <Play size={14} />
                  {previewPending ? 'Update preview' : 'Run again'}
                </button>
                <span className="text-xs" style={{ color: previewPending ? 'var(--amber)' : 'var(--muted)' }}>
                  {previewPending ? 'Unapplied changes' : 'Preview up to date'}
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <SandpackPreview key={previewKey} code={previewCode} challenge={challenge} />
              </div>
            </>
          ) : (
            <div className="h-full overflow-auto p-4" style={{ background: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
              <p className="mb-2" style={{ color: 'var(--accent)' }}>Output panel</p>
              <p style={{ color: 'var(--muted)' }}>{outputLabel(challenge.previewType)}</p>
            </div>
          )}
        </div>

        <div ref={editorContainerRef} tabIndex={-1} className="min-h-0 overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-2)' }}>
          <ChallengeEditor
            value={state.code}
            onChange={(value) => dispatch({ type: 'SET_CODE', payload: value })}
            language={challenge.previewType === 'test' ? 'javascript' : 'typescript'}
            fastTyping={fastTyping}
            height="100%"
          />
        </div>
        {closeNudge ? (
          <div className="mt-2 rounded-md border p-2 text-sm" style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Looks like you're close! Want to compare with the solution?</span>
              <button type="button" className="btn btn-amber" onClick={() => dispatch({ type: 'OPEN_COMPARE' })}>
                Compare
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {state.hintPanelOpen ? (
        <HintPanel
          challenge={challenge}
          currentCode={state.code}
          hintsUsed={state.hintsUsed}
          onClose={() => dispatch({ type: 'CLOSE_HINT' })}
          onHintUsed={() => dispatch({ type: 'HINT_USED' })}
        />
      ) : null}

      {state.compareOpen ? (
        <SolutionModal challenge={challenge} userCode={state.code} onClose={() => dispatch({ type: 'CLOSE_COMPARE' })} />
      ) : null}
    </main>
  )
}
