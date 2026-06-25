// G2i Práctica — banco de ejercicios de live coding.
//
// Cada ejercicio trae: premisa, código base (para copiar a un sandbox como
// CodeSandbox/StackBlitz/Replit) y una solución completa para comparar después.
//
// `reportedByG2i: true` marca ejercicios/formatos que candidatos describen
// públicamente como parte del live coding de G2i (notablemente el quiz que
// consume Open Trivia DB). El resto son ejercicios de práctica del mismo estilo.

export type G2iPracticeCategory =
  | 'react'
  | 'typescript'
  | 'javascript'
  | 'react-native'
  | 'css'

export type G2iPracticeDifficulty = 'junior' | 'mid' | 'senior'

export type G2iPracticeExercise = {
  id: string
  title: string
  category: G2iPracticeCategory
  difficulty: G2iPracticeDifficulty
  /** minutos sugeridos para resolverlo. */
  timeLimit: number
  /** dónde conviene resolverlo (sandbox sugerido). */
  sandbox: string
  /** la consigna/premisa. */
  premise: string
  requirements: string[]
  /** código de arranque para copiar al sandbox. */
  baseCode: string
  hints: string[]
  /** solución completa para comparar luego. */
  solution: string
  evaluationCriteria: string[]
  reportedByG2i?: boolean
  sourceNote?: string
}

export const G2I_PRACTICE_CATEGORY_LABEL: Record<G2iPracticeCategory, string> = {
  react: 'React',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  'react-native': 'React Native',
  css: 'CSS',
}

export const g2iPracticeFormatSummary = [
  'El live coding suele ser construir una mini app o componente desde cero (no clonar un template pesado).',
  'Patrón histórico más reportado: una UI de trivia/quiz que consume Open Trivia DB (https://opentdb.com/api_config.php).',
  'Los reviewers miran estructura de carpetas, componentes reutilizables, custom hooks, una capa fina de servicios y dueño claro del estado.',
  'Importa manejar loading, error y estados vacíos, no solo el happy path.',
  'Explicá tus decisiones en voz alta mientras codeás: por qué separás archivos, cómo manejás errores, qué agregarías con más tiempo.',
  'Los tests suman: al menos happy-path de fetch, estado de error y una interacción del usuario.',
]

export const g2iPracticeSandboxTips = [
  'Copiá el código base en CodeSandbox (React template) o StackBlitz; para JS/TS puro alcanza un archivo y la consola.',
  'En la entrevista real el playground suele ser Replit: creá la cuenta antes y practicá sin depender del autocompletado.',
  'Resolvé primero, sin mirar la solución; recién después comparála para ver qué te faltó (errores, edge cases, naming).',
  'Cronometrate con el tiempo sugerido para simular la presión real.',
]

export const openTriviaApiNotes = [
  'Base URL: https://opentdb.com/api.php',
  'Ejemplo: GET ?amount=10&category=9&difficulty=easy&type=multiple',
  'Shape de respuesta: { response_code: number, results: TriviaQuestion[] }',
  'response_code 0 = éxito. Otros códigos = error (sin resultados, token inválido, etc.).',
  'El texto trae entidades HTML — decodificalas antes de renderizar (truco del textarea o librería he).',
  'Categorías: https://opentdb.com/api_category.php devuelve { trivia_categories: [{ id, name }] }.',
]

export const g2iPracticeExercises: G2iPracticeExercise[] = [
  // ──────────────────────────────────────────────────────────────────
  // 1. Trivia quiz — el clásico reportado de G2i
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-trivia-quiz',
    title: 'Trivia quiz consumiendo Open Trivia DB',
    category: 'react',
    difficulty: 'mid',
    timeLimit: 45,
    sandbox: 'CodeSandbox (React + TS) o Replit',
    premise:
      'Construí una SPA de trivia que trae 10 preguntas multiple-choice de Open Trivia DB, muestra una a la vez, lleva el puntaje y termina con una pantalla de resumen. Organizá el proyecto vos mismo (servicio / hook / componentes), no metas todo en App.',
    requirements: [
      'Traer 10 preguntas multiple al iniciar (amount configurable por constante)',
      'Mostrar UI de loading y error, con opción de reintentar',
      'Decodificar entidades HTML del texto antes de mostrarlo',
      'Mezclar las respuestas incorrectas con la correcta para las opciones',
      'Deshabilitar las opciones tras elegir y marcar si fue correcta',
      'Avanzar a la siguiente y mostrar el puntaje final (ej. 7/10)',
      'Separar en: servicio de API + hook useTriviaQuiz + componentes presentacionales',
    ],
    baseCode: `import { useEffect, useState } from 'react'

const TRIVIA_API = 'https://opentdb.com/api.php'

type TriviaApiQuestion = {
  type: 'multiple' | 'boolean'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

// TODO:
// 1) services/triviaService: fetchQuestions(amount)
// 2) hooks/useTriviaQuiz: estado idle | loading | playing | done | error
// 3) components: QuestionCard, QuizSummary
// 4) App: cablear todo

export default function App() {
  return <div>TODO: trivia quiz</div>
}
`,
    hints: [
      'Mapeá response_code !== 0 a un Error en el servicio.',
      'Guardá índice actual, puntaje y preguntas en el hook, no useState sueltos en App.',
      'Para decodificar HTML: const el = document.createElement("textarea"); el.innerHTML = txt; return el.value.',
      'Mezclá las opciones UNA vez al cargar (no en cada render) para que no salten de lugar.',
    ],
    solution: `// services/triviaService.ts
const TRIVIA_API = 'https://opentdb.com/api.php'

export type TriviaApiQuestion = {
  type: 'multiple' | 'boolean'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

function decodeHtml(text: string): string {
  const el = document.createElement('textarea')
  el.innerHTML = text
  return el.value
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export type QuizQuestion = {
  id: number
  prompt: string
  options: string[]
  correct: string
}

export async function fetchQuestions(amount = 10): Promise<QuizQuestion[]> {
  const res = await fetch(\`\${TRIVIA_API}?amount=\${amount}&type=multiple\`)
  if (!res.ok) throw new Error('Network error')
  const json = await res.json()
  if (json.response_code !== 0) throw new Error('Trivia API error: ' + json.response_code)
  return (json.results as TriviaApiQuestion[]).map((q, i) => {
    const correct = decodeHtml(q.correct_answer)
    return {
      id: i,
      prompt: decodeHtml(q.question),
      correct,
      options: shuffle([correct, ...q.incorrect_answers.map(decodeHtml)]),
    }
  })
}

// hooks/useTriviaQuiz.ts
import { useCallback, useEffect, useState } from 'react'
import { fetchQuestions, type QuizQuestion } from '../services/triviaService'

type Status = 'loading' | 'playing' | 'done' | 'error'

export function useTriviaQuiz(amount = 10) {
  const [status, setStatus] = useState<Status>('loading')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    setIndex(0); setScore(0); setPicked(null)
    fetchQuestions(amount)
      .then((qs) => { setQuestions(qs); setStatus('playing') })
      .catch(() => setStatus('error'))
  }, [amount])

  useEffect(() => { load() }, [load])

  const select = (option: string) => {
    if (picked) return
    setPicked(option)
    if (option === questions[index].correct) setScore((s) => s + 1)
  }

  const next = () => {
    setPicked(null)
    if (index + 1 >= questions.length) setStatus('done')
    else setIndex((i) => i + 1)
  }

  return { status, question: questions[index], index, total: questions.length, score, picked, select, next, retry: load }
}

// components/QuestionCard.tsx
function QuestionCard({ question, picked, onSelect }) {
  return (
    <div>
      <h2 dangerouslySetInnerHTML={{ __html: question.prompt }} />
      <ul>
        {question.options.map((opt) => {
          const isPicked = picked === opt
          const isCorrect = opt === question.correct
          const bg = picked && isCorrect ? '#1f6f43' : isPicked ? '#7a2230' : 'transparent'
          return (
            <li key={opt}>
              <button disabled={!!picked} onClick={() => onSelect(opt)} style={{ background: bg }}>
                {opt}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// App.tsx
export default function App() {
  const quiz = useTriviaQuiz(10)
  if (quiz.status === 'loading') return <p>Cargando…</p>
  if (quiz.status === 'error') return <button onClick={quiz.retry}>Reintentar</button>
  if (quiz.status === 'done') return <h1>Puntaje: {quiz.score}/{quiz.total}</h1>
  return (
    <div>
      <p>Pregunta {quiz.index + 1}/{quiz.total} · Puntaje {quiz.score}</p>
      <QuestionCard question={quiz.question} picked={quiz.picked} onSelect={quiz.select} />
      {quiz.picked && <button onClick={quiz.next}>Siguiente</button>}
    </div>
  )
}`,
    evaluationCriteria: [
      'Separación clara: servicio / hook / componentes presentacionales',
      'Loading, error, vacío y éxito manejados',
      'Sin lógica de negocio dentro del JSX más allá de condicionales simples',
      'Naming legible y funciones chicas',
    ],
    reportedByG2i: true,
    sourceNote: 'El quiz con Open Trivia DB es el ejercicio de live coding de G2i más citado por candidatos online.',
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. Pantalla de setup del quiz
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-trivia-setup',
    title: 'Pantalla de configuración del quiz (categoría y dificultad)',
    category: 'react',
    difficulty: 'senior',
    timeLimit: 50,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Antes de empezar el quiz, dejá que el usuario elija categoría y dificultad y luego traé preguntas filtradas de Open Trivia DB. Las categorías vienen del endpoint de metadata.',
    requirements: [
      'Al montar, traer categorías de https://opentdb.com/api_category.php',
      'Render: dropdown de categoría + radios de dificultad + botón Start',
      'Traer preguntas con los filtros: ?amount=10&category={id}&difficulty={level}',
      'Manejar estado de config con Context (o Redux Toolkit), justificando la elección',
      'Skeleton/spinner mientras cargan las categorías',
      'No traer preguntas hasta que el usuario clickea Start',
    ],
    baseCode: `import { useEffect, useState } from 'react'

// Category API: { trivia_categories: [{ id: number, name: string }] }

export default function App() {
  // TODO: SetupScreen -> onStart(config) -> QuizScreen
  return <div>TODO: setup screen</div>
}
`,
    hints: [
      'Los nombres de categoría traen entidades HTML ("Entertainment: Film").',
      'Mantené el fetch de preguntas en el servicio; el form solo arma el config.',
      'Colocá el config en context para que QuizScreen lo lea sin prop drilling.',
    ],
    solution: `// services/triviaService.ts
export type Category = { id: number; name: string }

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('https://opentdb.com/api_category.php')
  if (!res.ok) throw new Error('Network error')
  const json = await res.json()
  return json.trivia_categories as Category[]
}

export type QuizConfig = { categoryId: number; difficulty: 'easy' | 'medium' | 'hard' }

export async function fetchQuestions({ categoryId, difficulty }: QuizConfig, amount = 10) {
  const url = \`https://opentdb.com/api.php?amount=\${amount}&category=\${categoryId}&difficulty=\${difficulty}&type=multiple\`
  const res = await fetch(url)
  const json = await res.json()
  if (json.response_code !== 0) throw new Error('Trivia API error')
  return json.results
}

// context/QuizConfigContext.tsx
import { createContext, useContext, useState } from 'react'

type Ctx = { config: QuizConfig | null; start: (c: QuizConfig) => void }
const QuizConfigContext = createContext<Ctx | null>(null)
export const useQuizConfig = () => {
  const ctx = useContext(QuizConfigContext)
  if (!ctx) throw new Error('useQuizConfig fuera del provider')
  return ctx
}
export function QuizConfigProvider({ children }) {
  const [config, setConfig] = useState<QuizConfig | null>(null)
  return <QuizConfigContext.Provider value={{ config, start: setConfig }}>{children}</QuizConfigContext.Provider>
}

// SetupScreen.tsx
function SetupScreen() {
  const { start } = useQuizConfig()
  const [cats, setCats] = useState<Category[] | null>(null)
  const [categoryId, setCategoryId] = useState<number>()
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  useEffect(() => { fetchCategories().then(setCats).catch(() => setCats([])) }, [])
  if (!cats) return <p>Cargando categorías…</p>

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (categoryId) start({ categoryId, difficulty }) }}>
      <label>Categoría
        <select value={categoryId ?? ''} onChange={(e) => setCategoryId(Number(e.target.value))}>
          <option value="" disabled>Elegí…</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <fieldset>
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <label key={d}>
            <input type="radio" name="diff" checked={difficulty === d} onChange={() => setDifficulty(d)} /> {d}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={!categoryId}>Start</button>
    </form>
  )
}

// App.tsx — elijo Context porque el estado es chico y de UI; Redux sería overkill.
export default function App() {
  return (
    <QuizConfigProvider>
      <Router />
    </QuizConfigProvider>
  )
}
function Router() {
  const { config } = useQuizConfig()
  return config ? <QuizScreen /> : <SetupScreen />
}`,
    evaluationCriteria: [
      'Flujo en dos fases (setup → quiz) con handoff limpio',
      'Conocimiento de API: endpoints y query params correctos',
      'Elección de estado intencional, no global accidental',
      'Controles de formulario accesibles (labels, focus)',
    ],
    reportedByG2i: true,
    sourceNote: 'Variante reportada del quiz de G2i donde se pide elegir categoría/dificultad.',
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. useDebounce + búsqueda
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-use-debounce',
    title: 'Hook useDebounce + buscador con API',
    category: 'react',
    difficulty: 'mid',
    timeLimit: 30,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Hacé un buscador que pega a una API mientras el usuario tipea, pero sin disparar un request por tecla. Implementá un hook reutilizable useDebouncedValue y usalo para debouncar el query.',
    requirements: [
      'Hook useDebouncedValue(value, delay) que devuelve el valor retrasado',
      'Limpiar el timer en cada cambio y al desmontar',
      'Disparar el fetch solo cuando el valor debounced cambia',
      'Cancelar requests viejos para evitar race conditions (AbortController)',
      'Mostrar loading y resultados',
    ],
    baseCode: `import { useEffect, useState } from 'react'

// API de ejemplo: https://jsonplaceholder.typicode.com/users?q=...
// (o usá la que prefieras)

export default function SearchUsers() {
  const [query, setQuery] = useState('')
  // TODO: debounce + fetch
  return <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" />
}
`,
    hints: [
      'El hook setea un setTimeout en un useEffect con deps [value, delay] y limpia en el return.',
      'En el efecto del fetch, creá un AbortController y abortalo en el cleanup.',
      'Ignorá el error de tipo AbortError cuando cancelás.',
    ],
    solution: `import { useEffect, useState } from 'react'

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

type User = { id: number; name: string }

export default function SearchUsers() {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 350)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!debounced.trim()) { setUsers([]); return }
    const ctrl = new AbortController()
    setLoading(true)
    fetch(\`https://jsonplaceholder.typicode.com/users\`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((all: User[]) =>
        setUsers(all.filter((u) => u.name.toLowerCase().includes(debounced.toLowerCase()))),
      )
      .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [debounced])

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" />
      {loading && <span> cargando…</span>}
      <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
    </div>
  )
}`,
    evaluationCriteria: [
      'Hook genérico y reutilizable (no atado a string)',
      'Cleanup correcto del timer y del fetch',
      'Sin race conditions visibles',
      'Estados de loading/empty manejados',
    ],
    reportedByG2i: true,
    sourceNote: 'Debounce de búsqueda es un patrón frecuente reportado en el live coding de front.',
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. debounce vanilla con cancel/flush
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-debounce-vanilla',
    title: 'debounce(fn, wait) con .cancel() y .flush()',
    category: 'javascript',
    difficulty: 'mid',
    timeLimit: 25,
    sandbox: 'Cualquier sandbox JS / consola del navegador',
    premise:
      'Implementá debounce(fn, wait) que devuelva una función debounceada con métodos .cancel() y .flush(). Es el patrón detrás de inputs de búsqueda y handlers de resize.',
    requirements: [
      'Trailing edge: invocar tras `wait` ms sin nuevas llamadas',
      'Pasar el `this` y los argumentos más recientes a fn',
      'cancel() limpia el timer pendiente sin invocar',
      'flush() invoca de inmediato con los últimos args y limpia el timer',
      'Llamadas sucesivas reinician el timer',
    ],
    baseCode: `function debounce(fn, wait) {
  // TODO
}

// Pruebas manuales:
// const log = debounce((x) => console.log('run', x), 200)
// log(1); log(2); log(3)  -> debería loguear solo "run 3" tras 200ms
`,
    hints: [
      'Guardá timeoutId, lastArgs y lastThis en el closure.',
      'flush es útil antes de un unmount o submit.',
    ],
    solution: `function debounce(fn, wait) {
  let timer = null
  let lastArgs = null
  let lastThis = null

  function invoke() {
    timer = null
    fn.apply(lastThis, lastArgs)
    lastArgs = lastThis = null
  }

  function debounced(...args) {
    lastArgs = args
    lastThis = this
    clearTimeout(timer)
    timer = setTimeout(invoke, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
    lastArgs = lastThis = null
  }

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer)
      invoke()
    }
  }

  return debounced
}`,
    evaluationCriteria: [
      'Semántica de timing correcta',
      'Edge cases de cancel/flush sin timer pendiente',
      'Sin leaks (clear del timeout)',
      'Closure legible',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. deepClone vanilla
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-deep-clone',
    title: 'deepClone(value) con manejo de ciclos',
    category: 'javascript',
    difficulty: 'senior',
    timeLimit: 30,
    sandbox: 'Cualquier sandbox JS / consola',
    premise:
      'Implementá deepClone(value) para objetos planos, arrays, Date y null, documentando qué NO soportás. Manejá referencias circulares con un WeakMap.',
    requirements: [
      'Manejar null, primitivos, Date (instancia nueva), Array y objeto plano',
      'Detectar referencias circulares y preservarlas con WeakMap',
      'No clonar funciones, símbolos ni instancias de clase (documentarlo)',
      'Comparar tu approach con structuredClone en un comentario',
    ],
    baseCode: `function deepClone(value) {
  // TODO
}

// Pruebas:
// const a = { x: 1, nested: { y: 2 }, when: new Date() }
// a.self = a  // ciclo
// const b = deepClone(a)
// console.log(b.self === b)        // true
// console.log(b.nested === a.nested) // false
`,
    hints: [
      'typeof null === "object": chequeá null primero.',
      'Usá un WeakMap "seen" para mapear original -> copia y romper ciclos.',
    ],
    solution: `function deepClone(value, seen = new WeakMap()) {
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

  // No soportado: funciones, símbolos, Map/Set, instancias de clase.
  // structuredClone() cubre Map/Set/Date/ArrayBuffer y ciclos, pero tira
  // con funciones y símbolos. Esta versión es educativa y explícita.
  throw new TypeError('deepClone: tipo no soportado')
}`,
    evaluationCriteria: [
      'Clonado anidado correcto',
      'Documentación honesta de limitaciones',
      'Sin comportamiento silencioso erróneo en ciclos',
      'Recursión limpia',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 6. Typed fetch client (TS)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-typed-client',
    title: 'Cliente tipado de Open Trivia DB (sin React)',
    category: 'typescript',
    difficulty: 'mid',
    timeLimit: 30,
    sandbox: 'TS Playground o sandbox TS',
    premise:
      'Sin React, definí los tipos y una capa de fetch tipada para Open Trivia DB. Incluí manejo de response_code y un mapper a un tipo de dominio QuizQuestion.',
    requirements: [
      'Definir TriviaApiResponse, TriviaApiQuestion y QuizQuestion',
      'Usar una discriminated union o Result para éxito vs error de la API',
      'Implementar getQuestions(params)',
      'Mapear el shape de la API a QuizQuestion con texto decodificado',
      'Sin `any`; usar `unknown` en el borde del JSON si hace falta',
    ],
    baseCode: `// Definí los tipos y getQuestions aquí.
// response_code 0 = éxito.

export interface QuizQuestion {
  // TODO
}

export async function getQuestions(/* params */) {
  // TODO
}
`,
    hints: [
      'response_code 0 = success; cualquier otro es error.',
      'incorrect_answers siempre es string[]; correct_answer es string.',
      'El decoder puede ser un util puro decodeHtmlEntities(text): string.',
    ],
    solution: `type TriviaApiQuestion = {
  type: 'multiple' | 'boolean'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

type TriviaSuccess = { response_code: 0; results: TriviaApiQuestion[] }
type TriviaFailure = { response_code: number; results: [] }
type TriviaApiResponse = TriviaSuccess | TriviaFailure

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctOption: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

function isSuccess(r: TriviaApiResponse): r is TriviaSuccess {
  return r.response_code === 0
}

function decodeHtmlEntities(text: string): string {
  // En Node usar 'he'; en browser, el truco del textarea.
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
}

function mapQuestion(q: TriviaApiQuestion, i: number): QuizQuestion {
  const correctOption = decodeHtmlEntities(q.correct_answer)
  return {
    id: String(i),
    prompt: decodeHtmlEntities(q.question),
    correctOption,
    options: [correctOption, ...q.incorrect_answers.map(decodeHtmlEntities)],
    category: q.category,
    difficulty: q.difficulty,
  }
}

export async function getQuestions(params: {
  amount: number
  category?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}): Promise<QuizQuestion[]> {
  const qs = new URLSearchParams({ amount: String(params.amount), type: 'multiple' })
  if (params.category) qs.set('category', String(params.category))
  if (params.difficulty) qs.set('difficulty', params.difficulty)

  const res = await fetch(\`https://opentdb.com/api.php?\${qs}\`)
  const data: unknown = await res.json()
  const parsed = data as TriviaApiResponse
  if (!isSuccess(parsed)) throw new Error('Trivia API error: ' + parsed.response_code)
  return parsed.results.map(mapQuestion)
}`,
    evaluationCriteria: [
      'Tipos que reflejan la API real, no campos imaginarios',
      'Narrowing tras chequear response_code',
      'Mapper aislado del fetch (testeable)',
      'Tipado sensato de params opcionales',
    ],
    reportedByG2i: true,
    sourceNote: 'Variante "solo lógica/tipos" del ejercicio de trivia, útil para roles con foco TS.',
  },

  // ──────────────────────────────────────────────────────────────────
  // 7. groupBy genérico (TS)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-groupby',
    title: 'groupBy genérico y type-safe',
    category: 'typescript',
    difficulty: 'senior',
    timeLimit: 20,
    sandbox: 'TS Playground',
    premise:
      'Implementá un groupBy type-safe que agrupe un array por una key derivada de cada item. Aparece seguido en rondas de utils.',
    requirements: [
      'Firma: groupBy<T, K extends PropertyKey>(items, keyFn): Record<K, T[]>',
      'Preservar tipos; input vacío devuelve objeto vacío',
      'No mutar el array de entrada',
      'Incluir 2-3 casos de prueba que demuestren la inferencia',
    ],
    baseCode: `export function groupBy(/* items, keyFn */) {
  // TODO
}
`,
    hints: [
      'Reduce a un Record empujando a arrays por key.',
      'K extends PropertyKey mantiene válidas las keys del Record.',
    ],
    solution: `export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item)
    ;(acc[key] ??= []).push(item)
    return acc
  }, {} as Record<K, T[]>)
}

// Pruebas:
const users = [
  { name: 'Ana', role: 'admin' as const },
  { name: 'Beto', role: 'user' as const },
  { name: 'Cami', role: 'admin' as const },
]
const byRole = groupBy(users, (u) => u.role)
// byRole: Record<'admin' | 'user', {name,role}[]>
console.log(byRole.admin.length) // 2

const nums = groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'))
console.log(nums.even) // [2, 4]`,
    evaluationCriteria: [
      'Constraints de generics correctos',
      'Tipo de retorno preciso por key',
      'Función pura, sin efectos',
      'Tests que demuestran inferencia',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 8. Todo list (React básico)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-todo-list',
    title: 'Todo list con agregar, completar y filtrar',
    category: 'react',
    difficulty: 'junior',
    timeLimit: 30,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Construí una todo list: agregar tareas, marcarlas como completas, borrarlas y filtrar por todas/activas/completas. Estado local, sin librerías.',
    requirements: [
      'Input + botón (o Enter) para agregar; no permitir vacíos',
      'Marcar/desmarcar completada y borrar',
      'Filtro: all | active | completed',
      'Mostrar contador de tareas activas',
      'Cada item con id estable (no índice como key)',
    ],
    baseCode: `import { useState } from 'react'

type Todo = { id: string; text: string; done: boolean }

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  // TODO: agregar, toggle, borrar, filtrar
  return <div>TODO</div>
}
`,
    hints: [
      'crypto.randomUUID() da ids estables.',
      'Derivá la lista filtrada en render, no la guardes en otro state.',
    ],
    solution: `import { useMemo, useState } from 'react'

type Todo = { id: string; text: string; done: boolean }
type Filter = 'all' | 'active' | 'completed'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: t, done: false }])
    setText('')
  }
  const toggle = (id: string) =>
    setTodos((prev) => prev.map((td) => (td.id === id ? { ...td, done: !td.done } : td)))
  const remove = (id: string) => setTodos((prev) => prev.filter((td) => td.id !== id))

  const visible = useMemo(
    () => todos.filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.done : t.done)),
    [todos, filter],
  )
  const activeCount = todos.filter((t) => !t.done).length

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
        placeholder="Nueva tarea"
      />
      <button onClick={add}>Agregar</button>

      <div>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button key={f} disabled={filter === f} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            <label style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} /> {t.text}
            </label>
            <button onClick={() => remove(t.id)}>✕</button>
          </li>
        ))}
      </ul>
      <p>{activeCount} activas</p>
    </div>
  )
}`,
    evaluationCriteria: [
      'Updates inmutables del estado',
      'Lista filtrada derivada, no duplicada en state',
      'Keys estables por id',
      'Manejo de input vacío',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 9. Star rating accesible
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-star-rating',
    title: 'Componente Star Rating controlado y accesible',
    category: 'react',
    difficulty: 'mid',
    timeLimit: 30,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Hacé un componente de rating con estrellas: hover muestra preview, click fija el valor, soporta teclado y es accesible. Debe poder usarse controlado.',
    requirements: [
      'Props: value, onChange, max (default 5)',
      'Hover muestra preview; al salir vuelve al value real',
      'Click setea el valor',
      'Navegable por teclado (flechas) y con roles ARIA',
      'Componente reutilizable y controlado',
    ],
    baseCode: `type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  // TODO
  return null
}
`,
    hints: [
      'Guardá un estado hover separado del value; mostrá hover ?? value.',
      'Usá role="radiogroup" y botones con aria-checked.',
    ],
    solution: `import { useState } from 'react'

type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(null)}>
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            role="radio"
            aria-checked={value === star}
            aria-label={\`\${star} estrellas\`}
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onChange(Math.min(max, value + 1))
              if (e.key === 'ArrowLeft') onChange(Math.max(1, value - 1))
            }}
            style={{ fontSize: 24, color: star <= display ? '#f5a623' : '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {star <= display ? '★' : '☆'}
          </button>
        )
      })}
    </div>
  )
}`,
    evaluationCriteria: [
      'Hover preview sin perder el value real',
      'Accesibilidad: roles, aria-checked, teclado',
      'Componente controlado y reutilizable',
      'Sin estado redundante',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 10. useFetch custom hook
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-use-fetch',
    title: 'Custom hook useFetch con loading/error/abort',
    category: 'react',
    difficulty: 'mid',
    timeLimit: 30,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Escribí un hook genérico useFetch<T>(url) que devuelva { data, loading, error } y maneje cancelación al cambiar la url o desmontar. Mostrá cómo lo usarías.',
    requirements: [
      'Genérico en T',
      'Estados loading, error y data',
      'Re-fetch cuando cambia la url',
      'Cancelar el request anterior (AbortController)',
      'No setear estado tras desmontar',
    ],
    baseCode: `import { useEffect, useState } from 'react'

function useFetch<T>(url: string) {
  // TODO
}

export default function Demo() {
  // TODO: usar useFetch
  return null
}
`,
    hints: [
      'Reiniciá loading/error al cambiar la url.',
      'Usá el signal del AbortController y abortá en el cleanup.',
    ],
    solution: `import { useEffect, useState } from 'react'

type State<T> = { data: T | null; loading: boolean; error: string | null }

function useFetch<T>(url: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    const ctrl = new AbortController()
    setState({ data: null, loading: true, error: null })

    fetch(url, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        return res.json() as Promise<T>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ data: null, loading: false, error: err.message })
      })

    return () => ctrl.abort()
  }, [url])

  return state
}

type Post = { id: number; title: string }

export default function Demo() {
  const { data, loading, error } = useFetch<Post[]>('https://jsonplaceholder.typicode.com/posts')
  if (loading) return <p>Cargando…</p>
  if (error) return <p>Error: {error}</p>
  return <ul>{data?.slice(0, 5).map((p) => <li key={p.id}>{p.title}</li>)}</ul>
}`,
    evaluationCriteria: [
      'Hook genérico y reutilizable',
      'Manejo de error HTTP y de red',
      'Cancelación correcta sin warning de setState tras unmount',
      'API de retorno clara',
    ],
    reportedByG2i: true,
    sourceNote: 'Construir un hook de data fetching es un pedido habitual del live coding de React.',
  },

  // ──────────────────────────────────────────────────────────────────
  // 11. Fix de lista lenta (perf)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-fix-slow-list',
    title: 'Arreglá una lista que se traba al filtrar',
    category: 'react',
    difficulty: 'senior',
    timeLimit: 35,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Te dan una pantalla que re-renderiza las 500+ filas en cada tecla del filtro. Optimizala sin cambiar el comportamiento de producto y explicá qué medís.',
    requirements: [
      'Mover el filtrado a useMemo; no filtrar dentro de cada hijo',
      'Debouncear/transicionar el update del filtro',
      'Memoizar la fila y asegurar props estables',
      'Comentar qué medirías para validar la mejora',
    ],
    baseCode: `import { useState } from 'react'

const MOCK = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  question: \`Pregunta \${i}\`,
  correct: String(i + i),
  picked: String(i),
}))

function ReviewRow({ row }: { row: typeof MOCK[0] }) {
  console.log('render', row.id)
  return (
    <li>
      <strong>{row.question}</strong> · Elegido: {row.picked} · Correcto: {row.correct}
    </li>
  )
}

export function ReviewScreen() {
  const [q, setQ] = useState('')
  const filtered = MOCK.filter((r) => r.question.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar" />
      <ul>{filtered.map((row) => <ReviewRow key={row.id} row={row} />)}</ul>
    </div>
  )
}
`,
    hints: [
      'React.memo en la fila solo ayuda si las props son estables.',
      'Con el Profiler, confirmá que baja la cantidad de filas renderizadas.',
      'Para 500+ filas reales, considerá virtualización (react-window).',
    ],
    solution: `import { memo, useMemo, useState, useEffect } from 'react'

const MOCK = Array.from({ length: 500 }, (_, i) => ({
  id: i, question: \`Pregunta \${i}\`, correct: String(i + i), picked: String(i),
}))

function useDebouncedValue<T>(value: T, delay = 200) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return v
}

// memo: la fila solo re-renderiza si SU row cambia (referencias estables del MOCK).
const ReviewRow = memo(function ReviewRow({ row }: { row: typeof MOCK[0] }) {
  return (
    <li>
      <strong>{row.question}</strong> · Elegido: {row.picked} · Correcto: {row.correct}
    </li>
  )
})

export function ReviewScreen() {
  const [q, setQ] = useState('')
  const debounced = useDebouncedValue(q, 200)

  // Filtrado memoizado: no recalcula en cada render, solo cuando cambia el query.
  const filtered = useMemo(
    () => MOCK.filter((r) => r.question.toLowerCase().includes(debounced.toLowerCase())),
    [debounced],
  )

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar" />
      <ul>{filtered.map((row) => <ReviewRow key={row.id} row={row} />)}</ul>
    </div>
  )
}

// Qué mido: con React DevTools Profiler confirmo que tipear ya no re-renderiza
// las 500 filas (solo el input + las visibles). Si la lista creciera mucho,
// el siguiente paso es virtualizar con react-window/@tanstack/react-virtual.`,
    evaluationCriteria: [
      'Identifica la causa raíz (filtrar + render completo por tecla)',
      'Fix medido, no "memo en todo" a ciegas',
      'UX idéntica desde el usuario',
      'Sabe cuándo vale la virtualización',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 12. Paginación con API
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-pagination',
    title: 'Lista paginada con API (prev/next + estados)',
    category: 'react',
    difficulty: 'mid',
    timeLimit: 35,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Mostrá una lista paginada que trae datos por página desde una API REST, con botones prev/next, indicador de página y manejo de loading/error/borde (primera y última página).',
    requirements: [
      'Fetch por página con query param (?_page=&_limit=)',
      'Botones prev/next deshabilitados en los bordes',
      'Mostrar número de página actual',
      'Loading y error por página, con reintento',
      'Evitar parpadeo: no borrar la lista vieja hasta que llegue la nueva (opcional)',
    ],
    baseCode: `import { useEffect, useState } from 'react'

// API: https://jsonplaceholder.typicode.com/posts?_page=1&_limit=10

type Post = { id: number; title: string }

export default function PagedPosts() {
  const [page, setPage] = useState(1)
  // TODO: fetch por page + prev/next + estados
  return <div>TODO</div>
}
`,
    hints: [
      'JSONPlaceholder tiene 100 posts; con _limit=10 hay 10 páginas.',
      'Recalculá el fetch en un efecto con dep [page] y cancelá con AbortController.',
    ],
    solution: `import { useEffect, useState } from 'react'

type Post = { id: number; title: string }
const LIMIT = 10
const TOTAL_PAGES = 10 // 100 posts / 10

export default function PagedPosts() {
  const [page, setPage] = useState(1)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setError(null)
    fetch(\`https://jsonplaceholder.typicode.com/posts?_page=\${page}&_limit=\${LIMIT}\`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then((data: Post[]) => setPosts(data))
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [page])

  return (
    <div>
      {error && (
        <div>
          <p>Error: {error}</p>
          <button onClick={() => setPage((p) => p)}>Reintentar</button>
        </div>
      )}
      {loading ? <p>Cargando…</p> : <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>}

      <div>
        <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
        <span> Página {page} de {TOTAL_PAGES} </span>
        <button disabled={page >= TOTAL_PAGES || loading} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
      </div>
    </div>
  )
}`,
    evaluationCriteria: [
      'Fetch correcto por página y cancelación',
      'Botones deshabilitados en bordes y durante carga',
      'Estados loading/error/empty',
      'Sin requests duplicados ni race conditions',
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 13. Accordion accesible
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'pr-accordion',
    title: 'Accordion accesible (un panel abierto a la vez)',
    category: 'react',
    difficulty: 'junior',
    timeLimit: 25,
    sandbox: 'CodeSandbox (React + TS)',
    premise:
      'Construí un accordion que reciba items {title, content} y permita abrir un panel a la vez. Debe ser accesible (botones, aria-expanded) y reutilizable.',
    requirements: [
      'Props: items: { id, title, content }[]',
      'Solo un panel abierto a la vez (toggle del actual lo cierra)',
      'Headers como <button> con aria-expanded',
      'Contenido oculto cuando está cerrado',
    ],
    baseCode: `type Item = { id: string; title: string; content: string }

export function Accordion({ items }: { items: Item[] }) {
  // TODO
  return null
}
`,
    hints: [
      'Guardá el id abierto en state (string | null).',
      'Toggle: si clickeás el abierto, ciérralo (null).',
    ],
    solution: `import { useState } from 'react'

type Item = { id: string; title: string; content: string }

export function Accordion({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id}>
            <h3>
              <button
                aria-expanded={isOpen}
                aria-controls={\`panel-\${item.id}\`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                {item.title} {isOpen ? '▲' : '▼'}
              </button>
            </h3>
            <div id={\`panel-\${item.id}\`} role="region" hidden={!isOpen}>
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}`,
    evaluationCriteria: [
      'Un solo panel abierto, toggle correcto',
      'Accesibilidad: button, aria-expanded, aria-controls',
      'Reutilizable vía props',
      'Sin estado redundante',
    ],
  },
]

export const g2iPracticeCategories: G2iPracticeCategory[] = [
  'react',
  'typescript',
  'javascript',
  'react-native',
  'css',
]
