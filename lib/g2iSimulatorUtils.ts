import type { Question } from '@/data/g2i-questions'
import { g2iQuestions } from '@/data/g2i-questions'
import { g2iCodingExercises, type CodingExercise } from '@/data/g2i-coding-exercises'

export const FULL_INTERVIEW_DURATION_SEC = 60 * 60
export const FULL_INTERVIEW_TS_COUNT = 6
export const FULL_INTERVIEW_REACT_COUNT = 6

export const REALISTIC_INTERVIEW_DURATION_SEC = 45 * 60
export const REALISTIC_THEORY_TS_COUNT = 4
export const REALISTIC_THEORY_REACT_COUNT = 3

export type RealisticInterviewBundle = {
  theory: Question[]
  exercise: CodingExercise
}

export type SelfAssessment = 'knew' | 'unknown'

export type TheorySessionItem = {
  question: Question
  userAnswer: string
  revealed: boolean
  assessment?: SelfAssessment
}

export function formatTimer(seconds: number): string {
  const clamped = Math.max(0, seconds)
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0')
  const ss = String(clamped % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom<T>(pool: T[], count: number): T[] {
  if (pool.length <= count) return shuffle(pool)
  return shuffle(pool).slice(0, count)
}

export function buildFullInterviewQuestions(): Question[] {
  const typescript = g2iQuestions.filter((q) => q.category === 'typescript')
  const react = g2iQuestions.filter((q) => q.category === 'react')
  const picked = [
    ...pickRandom(typescript, FULL_INTERVIEW_TS_COUNT),
    ...pickRandom(react, FULL_INTERVIEW_REACT_COUNT),
  ]
  return shuffle(picked)
}

export function buildRealisticInterview(): RealisticInterviewBundle {
  const typescript = g2iQuestions.filter((q) => q.category === 'typescript')
  const react = g2iQuestions.filter((q) => q.category === 'react')
  const reactExercises = g2iCodingExercises.filter((e) => e.category === 'react')
  const exercisePool = reactExercises.length > 0 ? reactExercises : g2iCodingExercises
  const theory = shuffle([
    ...pickRandom(typescript, REALISTIC_THEORY_TS_COUNT),
    ...pickRandom(react, REALISTIC_THEORY_REACT_COUNT),
  ])
  const [exercise] = pickRandom(exercisePool, 1)
  return { theory, exercise }
}

export function toTheorySessionItems(questions: Question[]): TheorySessionItem[] {
  return questions.map((question) => ({
    question,
    userAnswer: '',
    revealed: false,
  }))
}

export type SimulationResults = {
  total: number
  assessed: number
  knew: number
  unknown: number
  byCategory: Record<string, { knew: number; unknown: number; total: number }>
  weakTags: string[]
  weakCategories: string[]
}

export function computeSimulationResults(items: TheorySessionItem[]): SimulationResults {
  const assessedItems = items.filter((item) => item.assessment)
  const knew = assessedItems.filter((item) => item.assessment === 'knew').length
  const unknown = assessedItems.filter((item) => item.assessment === 'unknown').length

  const byCategory: SimulationResults['byCategory'] = {}
  const tagMisses: Record<string, number> = {}

  for (const item of assessedItems) {
    const cat = item.question.category
    if (!byCategory[cat]) byCategory[cat] = { knew: 0, unknown: 0, total: 0 }
    byCategory[cat].total += 1
    if (item.assessment === 'knew') byCategory[cat].knew += 1
    else {
      byCategory[cat].unknown += 1
      for (const tag of item.question.tags) {
        tagMisses[tag] = (tagMisses[tag] ?? 0) + 1
      }
    }
  }

  const weakCategories = Object.entries(byCategory)
    .filter(([, stats]) => stats.unknown > 0)
    .sort((a, b) => b[1].unknown - a[1].unknown)
    .map(([cat]) => cat)

  const weakTags = Object.entries(tagMisses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)

  return {
    total: items.length,
    assessed: assessedItems.length,
    knew,
    unknown,
    byCategory,
    weakTags,
    weakCategories,
  }
}
