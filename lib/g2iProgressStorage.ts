import type { SimulationResults } from '@/lib/g2iSimulatorUtils'

export type WeakItemKind = 'theory' | 'snippet' | 'error'

export type WeakItemRecord = {
  id: string
  kind: WeakItemKind
  title: string
  category?: string
  tags: string[]
  at: number
}

export type SessionRecord = {
  at: number
  mode: 'full' | 'realistic' | 'free'
  knew: number
  unknown: number
  assessed: number
  total: number
}

export type PersistedProgress = {
  weakItems: WeakItemRecord[]
  sessions: SessionRecord[]
  categoryTotals: Record<string, { knew: number; unknown: number }>
}

const PROGRESS_KEY = 'g2i-prep-progress-v1'
const MAX_WEAK_ITEMS = 40
const MAX_SESSIONS = 20

const EMPTY: PersistedProgress = {
  weakItems: [],
  sessions: [],
  categoryTotals: {},
}

function readProgress(): PersistedProgress {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return { ...EMPTY, weakItems: [], sessions: [], categoryTotals: {} }
    const parsed = JSON.parse(raw) as PersistedProgress
    return {
      weakItems: parsed.weakItems ?? [],
      sessions: parsed.sessions ?? [],
      categoryTotals: parsed.categoryTotals ?? {},
    }
  } catch {
    return { ...EMPTY, weakItems: [], sessions: [], categoryTotals: {} }
  }
}

function writeProgress(progress: PersistedProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

export function loadProgress(): PersistedProgress {
  return readProgress()
}

export function recordWeakAssessment(input: {
  id: string
  kind: WeakItemKind
  title: string
  category?: string
  tags?: string[]
}): PersistedProgress {
  const progress = readProgress()
  const entry: WeakItemRecord = {
    id: input.id,
    kind: input.kind,
    title: input.title,
    category: input.category,
    tags: input.tags ?? [],
    at: Date.now(),
  }
  const withoutDup = progress.weakItems.filter((w) => w.id !== input.id)
  const weakItems = [entry, ...withoutDup].slice(0, MAX_WEAK_ITEMS)
  const next = { ...progress, weakItems }
  writeProgress(next)
  return next
}

export function recordSessionResults(
  results: SimulationResults,
  mode: SessionRecord['mode'],
): PersistedProgress {
  const progress = readProgress()
  const session: SessionRecord = {
    at: Date.now(),
    mode,
    knew: results.knew,
    unknown: results.unknown,
    assessed: results.assessed,
    total: results.total,
  }
  const sessions = [session, ...progress.sessions].slice(0, MAX_SESSIONS)

  const categoryTotals = { ...progress.categoryTotals }
  for (const [cat, stats] of Object.entries(results.byCategory)) {
    const prev = categoryTotals[cat] ?? { knew: 0, unknown: 0 }
    categoryTotals[cat] = {
      knew: prev.knew + stats.knew,
      unknown: prev.unknown + stats.unknown,
    }
  }

  const next = { ...progress, sessions, categoryTotals }
  writeProgress(next)
  return next
}

export function clearProgress(): PersistedProgress {
  writeProgress(EMPTY)
  return EMPTY
}

export function getCategoryPercentages(
  categoryTotals: Record<string, { knew: number; unknown: number }>,
): { category: string; pct: number; total: number }[] {
  return Object.entries(categoryTotals)
    .map(([category, stats]) => {
      const total = stats.knew + stats.unknown
      const pct = total > 0 ? Math.round((stats.knew / total) * 100) : 0
      return { category, pct, total }
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => a.pct - b.pct)
}

export function getRecentWeakItems(progress: PersistedProgress, limit = 8): WeakItemRecord[] {
  return progress.weakItems.slice(0, limit)
}

export function getLastSession(progress: PersistedProgress): SessionRecord | null {
  return progress.sessions[0] ?? null
}
