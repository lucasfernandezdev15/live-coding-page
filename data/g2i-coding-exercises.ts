export type CodingExercise = {
  id: string
  title: string
  difficulty: 'junior' | 'mid' | 'senior'
  category: 'react' | 'typescript' | 'javascript'
  timeLimit: number
  description: string
  requirements: string[]
  starterCode?: string
  hints: string[]
  evaluationCriteria: string[]
  exampleSolution?: string
}

export const g2iCodingFormatSummary = [
  'Live coding screens often ask you to build a small app from scratch—not clone a heavy template.',
  'Historical pattern: a trivia/quiz UI consuming Open Trivia DB (https://opentdb.com/api_config.php).',
  'Reviewers look for folder structure, reusable components, custom hooks, a thin API service layer, and clear state ownership (Context or Redux Toolkit).',
  'Tests matter: at least happy-path fetch, error state, and one user interaction (select answer, next question).',
  'Explain tradeoffs out loud while you code: why you split files, how you handle loading/errors, what you would add with more time.',
]

export const openTriviaApiNotes = [
  'Base URL: https://opentdb.com/api.php',
  'Example: GET ?amount=10&category=9&difficulty=easy&type=multiple',
  'Response shape: { response_code: number, results: TriviaQuestion[] }',
  'Each question has HTML entities—decode before rendering (e.g. textarea trick or he library).',
  'Session tokens (?session=…) avoid duplicate questions across requests in one quiz run.',
]

export const g2iCodingExercises: CodingExercise[] = [
  // ── React + API (Open Trivia DB) ─────────────────────────────────
  {
    id: 'react-trivia-quiz',
    title: 'Trivia quiz flow (Open Trivia DB)',
    difficulty: 'mid',
    category: 'react',
    timeLimit: 45,
    description:
      'Build a single-page trivia quiz that fetches questions from Open Trivia DB, shows one question at a time, tracks score, and ends with a summary screen. Organize the project yourself—no heavy boilerplate.',
    requirements: [
      'Fetch 10 multiple-choice questions on start (configurable amount via constants)',
      'Show loading and error UI; allow retry on failure',
      'Decode HTML entities in question/answer text before display',
      'Shuffle incorrect answers and merge with correct_answer for options',
      'Disable options after selection; show if answer was correct',
      'Advance to next question; show final score (e.g. 7/10)',
      'Split into components + a `useTriviaQuiz` hook + `triviaService` module',
      'Add at least 2 tests (fetch success + one interaction)',
    ],
    starterCode: `// Suggested structure (create files yourself):
// src/
//   services/triviaService.ts   → fetchQuestions(params)
//   hooks/useTriviaQuiz.ts      → state machine: idle | loading | playing | done
//   components/QuestionCard.tsx
//   components/QuizSummary.tsx
//   App.tsx

export const TRIVIA_API = 'https://opentdb.com/api.php'

export type TriviaQuestion = {
  category: string
  type: 'multiple' | 'boolean'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

// TODO: implement App and wire fetch + UI
`,
    hints: [
      'Keep API types and fetch in `services/`; map response_code !== 0 to errors.',
      'Store current index, score, and questions in the hook—not scattered useState in App.',
      'Boolean questions have empty incorrect_answers; handle both types.',
    ],
    evaluationCriteria: [
      'Clear separation: service / hook / presentational components',
      'Loading, error, empty, and success states handled',
      'No business logic inside JSX beyond simple conditionals',
      'Readable naming and small functions',
      'Tests cover fetch mapping and score increment',
    ],
    exampleSolution: `// services/triviaService.ts (sketch)
export async function fetchQuestions(amount = 10) {
  const res = await fetch(\`\${TRIVIA_API}?amount=\${amount}&type=multiple\`)
  const json = await res.json()
  if (json.response_code !== 0) throw new Error('Trivia API error')
  return json.results as TriviaQuestion[]
}

// hooks/useTriviaQuiz.ts — load on mount, expose { question, options, select, next, score, status }
// components/QuestionCard — props: question, options, onSelect, disabled
// App — layout + status switches`,
  },
  {
    id: 'react-trivia-setup',
    title: 'Quiz setup screen (category & difficulty)',
    difficulty: 'senior',
    category: 'react',
    timeLimit: 50,
    description:
      'Before starting a quiz, let the user pick category and difficulty, then fetch tailored questions from Open Trivia DB. Categories come from the API metadata endpoint.',
    requirements: [
      'On mount, fetch category list from https://opentdb.com/api_category.php',
      'Render category dropdown + difficulty radio (easy/medium/hard) + Start button',
      'Fetch questions with selected filters: `?amount=10&category={id}&difficulty={level}`',
      'Use Context or Redux Toolkit for quiz config + session state (justify choice verbally)',
      'Persist last selected category in sessionStorage (optional stretch)',
      'Show skeleton or spinner while categories load',
      'Handle API response_code 3 (token not found) if using session tokens',
      'Write a test for the setup form submitting valid query params',
    ],
    starterCode: `// Category API returns:
// { trivia_categories: [{ id: number, name: string }] }

export function App() {
  // TODO: SetupScreen → onStart(config) → QuizScreen
  return null
}
`,
    hints: [
      'Map category names (they include HTML entities like "Entertainment: Film").',
      'Do not fetch questions until user clicks Start—keeps setup independent.',
      'Colocate filter state in context; keep fetchers in services/triviaService.ts.',
    ],
    evaluationCriteria: [
      'Two-phase flow (setup → quiz) with clean handoff',
      'API knowledge: correct endpoints and query params',
      'State management choice is intentional, not accidental global useState',
      'Accessible form controls (labels, focus)',
      'Edge cases: no category selected, network failure on categories',
    ],
    exampleSolution: `// services: fetchCategories(), fetchQuestions({ amount, category, difficulty })
// context/QuizConfigContext: { categoryId, difficulty, setConfig, startQuiz }
// SetupScreen validates and calls startQuiz(); QuizScreen reads config and loads questions`,
  },

  // ── TypeScript ───────────────────────────────────────────────────
  {
    id: 'ts-trivia-types',
    title: 'Type the Open Trivia DB client',
    difficulty: 'mid',
    category: 'typescript',
    timeLimit: 30,
    description:
      'Without React, define TypeScript types and a typed fetch layer for Open Trivia DB. Include response_code handling and a mapper to a domain-friendly `QuizQuestion` type.',
    requirements: [
      'Define `TriviaApiResponse`, `TriviaApiQuestion`, and `QuizQuestion` interfaces',
      'Use a discriminated union or Result type for success vs API error codes',
      'Implement `getQuestions(params: { amount: number; category?: number; difficulty?: string })`',
      'Map API shape to `QuizQuestion` with decoded text fields',
      'Export a type guard or assert for response_code === 0',
      'No `any`; use `unknown` at the JSON boundary if needed',
    ],
    hints: [
      'response_code 0 = success; see API docs for other codes.',
      'incorrect_answers is always string[]; correct_answer is string.',
      'Decoder can be a pure util: decodeHtmlEntities(text: string): string',
    ],
    evaluationCriteria: [
      'Types match real API, not imaginary fields',
      'Narrowing after response_code check',
      'Mapper isolated from fetch (testable)',
      'Sensible optional params typing',
    ],
    exampleSolution: `type TriviaSuccess = { response_code: 0; results: TriviaApiQuestion[] }
type TriviaFailure = { response_code: Exclude<number, 0>; results: unknown }
export type TriviaApiResponse = TriviaSuccess | TriviaFailure

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctOption: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export function mapApiQuestion(q: TriviaApiQuestion, index: number): QuizQuestion {
  const prompt = decodeHtmlEntities(q.question)
  const correct = decodeHtmlEntities(q.correct_answer)
  const options = shuffle([correct, ...q.incorrect_answers.map(decodeHtmlEntities)])
  return { id: String(index), prompt, options, correctOption: correct, category: q.category, difficulty: q.difficulty }
}`,
  },
  {
    id: 'ts-generic-groupby',
    title: 'Generic groupBy utility',
    difficulty: 'senior',
    category: 'typescript',
    timeLimit: 25,
    description:
      'Implement a type-safe `groupBy` function that groups an array by a key derived from each item. Common in interview utils rounds.',
    requirements: [
      'Signature: `groupBy<T, K extends string | number | symbol>(items: T[], keyFn: (item: T) => K): Record<K, T[]>`',
      'Preserve item types; empty input returns empty object',
      'Do not mutate the input array',
      'Add overload or helper type so keys are inferred from keyFn return',
      'Include 2–3 inline type tests or vitest cases at bottom of file',
    ],
    hints: [
      'Reduce into Record, pushing to arrays per key.',
      'K extends PropertyKey keeps Record keys valid.',
    ],
    evaluationCriteria: [
      'Correct generic constraints',
      'Return type accurate per key',
      'Pure function, no side effects',
      'Tests demonstrate inference',
    ],
    exampleSolution: `export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item)
    ;(acc[key] ??= []).push(item)
    return acc
  }, {} as Record<K, T[]>)
}

// groupBy(users, u => u.role) → Record<Role, User[]>`,
  },

  // ── JavaScript ───────────────────────────────────────────────────
  {
    id: 'js-debounce',
    title: 'debounce with cancel and flush',
    difficulty: 'mid',
    category: 'javascript',
    timeLimit: 25,
    description:
      'Implement `debounce(fn, wait)` returning a debounced function with `.cancel()` and `.flush()` methods—pattern used in search inputs and resize handlers.',
    requirements: [
      'Trailing edge: invoke after `wait` ms of no calls',
      'Pass latest `this` and arguments to underlying fn',
      'cancel() clears pending timer without invoking',
      'flush() invokes immediately with latest args and clears timer',
      'Subsequent calls reset the timer',
      'Include manual test cases in comments or a small test block',
    ],
    hints: [
      'Store timeoutId and lastArgs/lastThis in closure.',
      'flush is useful before unmount or form submit.',
    ],
    evaluationCriteria: [
      'Correct timing semantics',
      'cancel/flush edge cases (no pending timer)',
      'No memory leaks (clear timeout)',
      'Readable closure structure',
    ],
    exampleSolution: `export function debounce(fn, wait) {
  let timer, lastArgs, lastThis
  function invoke() {
    timer = undefined
    fn.apply(lastThis, lastArgs)
  }
  const debounced = function (...args) {
    lastArgs = args
    lastThis = this
    clearTimeout(timer)
    timer = setTimeout(invoke, wait)
  }
  debounced.cancel = () => { clearTimeout(timer); timer = undefined }
  debounced.flush = () => { if (timer) { clearTimeout(timer); invoke() } }
  return debounced
}`,
  },
  {
    id: 'js-deep-clone',
    title: 'deepClone with known limitations',
    difficulty: 'senior',
    category: 'javascript',
    timeLimit: 30,
    description:
      'Implement `deepClone(value)` for plain objects, arrays, dates, and null—document what you intentionally do not support.',
    requirements: [
      'Handle null, primitives, Date (new instance), Array, plain Object',
      'Detect circular references and throw a clear error OR use WeakMap to preserve cycles (stretch)',
      'Do not clone functions, symbols, or class instances unless discussed',
      'Add comment block listing unsupported types',
      'Compare your approach to structuredClone in a short comment',
    ],
    hints: [
      'typeof null === "object"—check null first.',
      'WeakMap visited map for cycle-safe clone.',
    ],
    evaluationCriteria: [
      'Correct nested cloning',
      'Honest limitation docs',
      'No silent wrong behavior on cycles',
      'Clean recursion or iterative stack',
    ],
    exampleSolution: `export function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value.getTime())
  if (seen.has(value)) return seen.get(value)
  if (Array.isArray(value)) {
    const out = []
    seen.set(value, out)
    value.forEach((v, i) => { out[i] = deepClone(v, seen) })
    return out
  }
  if (Object.prototype.toString.call(value) === '[object Object]') {
    const out = {}
    seen.set(value, out)
    for (const [k, v] of Object.entries(value)) out[k] = deepClone(v, seen)
    return out
  }
  throw new TypeError('Unsupported type for deepClone')
}`,
  },

  // ── React performance ────────────────────────────────────────────
  {
    id: 'react-trivia-perf',
    title: 'Fix a slow trivia review screen',
    difficulty: 'senior',
    category: 'react',
    timeLimit: 35,
    description:
      'You are given a trivia “review answers” screen that re-renders the entire list on every keystroke in a filter box. Optimize it without changing product behavior.',
    requirements: [
      'Starter reproduces lag: parent holds filter state and maps 500+ ReviewRow items inline',
      'Debounce or transition filter updates; virtualize list if needed',
      'Memoize ReviewRow; ensure props are stable',
      'Move filtering to useMemo; do not filter inside every child',
      'Explain in comments what you measured and why each change helps',
      'Optional: use Open Trivia DB shaped mock data for rows',
    ],
    starterCode: `import { useState } from 'react'

// BUG: every keystroke re-filters and re-renders all rows
const MOCK = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  question: \`Question \${i}: What is \${i} + \${i}?\`,
  correct: String(i + i),
  picked: String(i),
}))

function ReviewRow({ row }: { row: typeof MOCK[0] }) {
  console.log('render', row.id)
  return (
    <li style={{ padding: 8, borderBottom: '1px solid #333' }}>
      <strong>{row.question}</strong>
      <div>Picked: {row.picked} · Correct: {row.correct}</div>
    </li>
  )
}

export function ReviewScreen() {
  const [q, setQ] = useState('')
  const filtered = MOCK.filter((r) => r.question.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" />
      <ul>{filtered.map((row) => <ReviewRow key={row.id} row={row} />)}</ul>
    </div>
  )
}
`,
    hints: [
      'Split FilterInput from list; debounce query used for filtering.',
      'React.memo(ReviewRow) only helps if row reference or props are stable.',
      'Profiler: confirm row render count drops after fix.',
    ],
    evaluationCriteria: [
      'Identifies root cause (filter + full list render per keystroke)',
      'Fix is measured, not memo-everything blindly',
      'UX unchanged from user perspective',
      'Can articulate when virtualization is worth it',
    ],
    exampleSolution: `// 1) const [query, setQuery] = useState(''); const debounced = useDebouncedValue(query, 200)
// 2) const filtered = useMemo(() => MOCK.filter(...), [debounced])
// 3) const ReviewRow = memo(function ReviewRow({ row }) { ... })
// 4) Optional: react-window FixedSizeList for 500+ rows
// 5) Remove console.log after profiling`,
  },

  // ── Bonus: junior React + API warm-up ─────────────────────────────
  {
    id: 'react-trivia-boolean',
    title: 'True/False trivia card (API warm-up)',
    difficulty: 'junior',
    category: 'react',
    timeLimit: 30,
    description:
      'Smaller scope: fetch 5 boolean questions from Open Trivia DB and render a single card with True/False buttons and immediate feedback.',
    requirements: [
      'GET https://opentdb.com/api.php?amount=5&type=boolean',
      'Show one question; on answer, show correct/incorrect then Next',
      'Display loading and error states',
      'Extract fetch to `triviaService.ts`',
      'Keep components under ~80 lines each',
    ],
    hints: [
      'Boolean questions have two fixed options: True and False.',
      'correct_answer is the string "True" or "False".',
    ],
    evaluationCriteria: [
      'Working fetch and basic state machine',
      'Readable component split',
      'User feedback after selection',
      'No unnecessary libraries',
    ],
    exampleSolution: `// Minimal state: index, score, questions, status
// QuestionCard receives decoded question + onAnswer(boolean)
// fetchBooleanQuestions() in service module`,
  },
]

export const g2iCodingCategories = ['react', 'typescript', 'javascript'] as const
