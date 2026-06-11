export type SnippetQuestion = {
  id: string
  category: 'javascript' | 'typescript' | 'react'
  kind: 'explain' | 'debug' | 'error'
  difficulty: 'junior' | 'mid' | 'senior'
  prompt: string
  code: string
  answer: string
  tags: string[]
}

export const g2iSnippetQuestions: SnippetQuestion[] = [
  {
    id: 'snip-js-01',
    category: 'javascript',
    kind: 'explain',
    difficulty: 'junior',
    prompt: 'What does this print? Explain step by step.',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}`,
    answer:
      'Prints 3, 3, 3. `var` is function-scoped; by the time callbacks run, the loop finished and `i` is 3. Fix: use `let` (block scope captures per iteration) or an IIFE/copy `i` into a closure parameter.',
    tags: ['closures', 'event-loop', 'var-vs-let'],
  },
  {
    id: 'snip-js-02',
    category: 'javascript',
    kind: 'debug',
    difficulty: 'mid',
    prompt: 'This shallow copy fails silently in React-like code. What is wrong?',
    code: `const user = { name: 'Ana', prefs: { theme: 'dark' } }
const copy = { ...user }
copy.prefs.theme = 'light'
console.log(user.prefs.theme) // ?`,
    answer:
      'Spread is shallow: `copy.prefs` references the same object as `user.prefs`, so mutating `copy.prefs.theme` mutates the original. Fix: deep clone nested objects (`structuredClone`, nested spread, or immutable update helpers).',
    tags: ['shallow-copy', 'immutability'],
  },
  {
    id: 'snip-js-03',
    category: 'javascript',
    kind: 'explain',
    difficulty: 'mid',
    prompt: 'In what order do the logs appear? Why?',
    code: `console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')`,
    answer: 'A, D, C, B. Sync first. Microtasks (promises) run before the next macrotask (setTimeout). This is the event loop: call stack → microtask queue → macrotask queue.',
    tags: ['event-loop', 'promises'],
  },
  {
    id: 'snip-js-04',
    category: 'javascript',
    kind: 'debug',
    difficulty: 'junior',
    prompt: 'Why might `this` be undefined inside the callback?',
    code: `class Counter {
  count = 0
  increment() {
    this.count += 1
  }
}
const c = new Counter()
setTimeout(c.increment, 100)`,
    answer:
      'Method passed as bare callback loses receiver; `this` is not the instance (strict mode → undefined). Fix: `setTimeout(() => c.increment(), 100)`, `.bind(c)`, or arrow method in class.',
    tags: ['this', 'callbacks'],
  },
  {
    id: 'snip-ts-01',
    category: 'typescript',
    kind: 'debug',
    difficulty: 'mid',
    prompt: 'This compiles but crashes at runtime. What happened?',
    code: `function getLength(x: string | number) {
  return x.length
}
getLength(42)`,
    answer:
      'Numbers have no `.length`; TS allowed it because both types were treated loosely (only common safe ops). Fix: narrow with `typeof x === "string"` or use overloads/discriminated handling before accessing `.length`.',
    tags: ['narrowing', 'runtime-vs-compile'],
  },
  {
    id: 'snip-ts-02',
    category: 'typescript',
    kind: 'explain',
    difficulty: 'mid',
    prompt: 'What is the inferred return type? Why is it useful?',
    code: `function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>
  for (const k of keys) out[k] = obj[k]
  return out
}`,
    answer:
      'Returns `Pick<T, K>` — only the keys requested, typed. `K extends keyof T` ensures keys exist on `obj`. Callers get autocomplete and excess-key safety at compile time; runtime still copies values.',
    tags: ['generics', 'Pick', 'keyof'],
  },
  {
    id: 'snip-ts-03',
    category: 'typescript',
    kind: 'debug',
    difficulty: 'senior',
    prompt: 'Why does this assignment error? How would you fix it?',
    code: `type User = { id: string; role: 'admin' | 'user' }
type Admin = User & { role: 'admin'; permissions: string[] }

function promote(u: User): Admin {
  return { ...u, permissions: ['all'] }
}`,
    answer:
      'Spread `u` keeps `role: "admin" | "user"`; TS cannot prove `role` is `"admin"`. Fix: narrow first (`if (u.role !== "admin") throw…`) or pass `Admin` input, or return with explicit `role: "admin" as const` after a runtime check.',
    tags: ['intersection', 'narrowing'],
  },
  {
    id: 'snip-react-01',
    category: 'react',
    kind: 'debug',
    difficulty: 'mid',
    prompt: 'This causes "Maximum update depth exceeded". Why?',
    code: `function Profile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((r) => r.json())
      .then(setUser)
  })

  return user ? <p>{user.name}</p> : <p>Loading…</p>
}`,
    answer:
      'Missing dependency array → effect runs after every render → fetch → setState → re-render → infinite loop. Fix: `[userId]` deps; cancel/ignore stale requests on cleanup if needed.',
    tags: ['useEffect', 'infinite-loop'],
  },
  {
    id: 'snip-react-02',
    category: 'react',
    kind: 'error',
    difficulty: 'mid',
    prompt: 'Console: "Rendered more hooks than during the previous render." What likely caused it?',
    code: `function Dashboard({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    const [tab, setTab] = useState('users')
    return <AdminPanel tab={tab} onTab={setTab} />
  }
  const [view, setView] = useState('home')
  return <Home view={view} onView={setView} />
}`,
    answer:
      'Hooks called conditionally change hook count/order between renders — violates Rules of Hooks. Fix: call all hooks unconditionally at top level; branch on `isAdmin` in JSX or derived state after hooks.',
    tags: ['rules-of-hooks'],
  },
  {
    id: 'snip-react-03',
    category: 'react',
    kind: 'debug',
    difficulty: 'mid',
    prompt: 'Stale closure: counter stays at 0. Explain and fix.',
    code: `function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return <span>{count}</span>
}`,
    answer:
      'Effect deps `[]` captures initial `count` (0) forever. Fix: functional update `setCount(c => c + 1)` (no dep on count) or include `count` in deps (re-subscribes each tick — functional update is cleaner).',
    tags: ['stale-closure', 'useEffect'],
  },
  {
    id: 'snip-react-04',
    category: 'react',
    kind: 'error',
    difficulty: 'senior',
    prompt: 'Hydration mismatch in Next.js — what is suspicious here?',
    code: `export default function Banner() {
  return (
    <div>
      <p>Welcome back!</p>
      <p>{new Date().toLocaleTimeString()}</p>
    </div>
  )
}`,
    answer:
      'Server HTML time ≠ client time on hydrate. Fix: render time only on client (`useEffect` + state), use `suppressHydrationWarning` on that node if intentional, or avoid non-deterministic output in SSR.',
    tags: ['hydration', 'ssr'],
  },
  {
    id: 'snip-react-05',
    category: 'react',
    kind: 'debug',
    difficulty: 'mid',
    prompt: 'List re-renders too often. What is wrong with this memoization?',
    code: `function TodoList({ items }: { items: string[] }) {
  const sorted = items.sort()
  const handleClick = () => console.log('click')

  return sorted.map((t) => (
    <MemoRow key={t} label={t} onClick={handleClick} />
  ))
}

const MemoRow = React.memo(function Row({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>
})`,
    answer:
      '`sort()` mutates `items` in place and runs every render. `handleClick` is a new function reference each render, breaking `React.memo`. Fix: `[...items].sort()`, `useMemo` for sorted list, `useCallback` for handler (or pass stable props).',
    tags: ['memo', 'useMemo', 'mutation'],
  },
  {
    id: 'snip-react-06',
    category: 'react',
    kind: 'explain',
    difficulty: 'junior',
    prompt: 'What happens on each click? Why?',
    code: `function LikeButton() {
  const [likes, setLikes] = useState(0)

  return (
    <button onClick={() => {
      setLikes(likes + 1)
      setLikes(likes + 1)
    }}>
      {likes}
    </button>
  )
}`,
    answer:
      'Increments by 1, not 2. Both updates use the same render snapshot of `likes`. Batching merges them with the same value. Fix: `setLikes(n => n + 1)` twice or single `setLikes(likes + 2)`.',
    tags: ['setState', 'batching'],
  },
  {
    id: 'snip-js-05',
    category: 'javascript',
    kind: 'debug',
    difficulty: 'mid',
    prompt: 'Why is the comparison surprising?',
    code: `console.log([] == ![])
console.log([] == false)
console.log('' == 0)`,
    answer:
      'Loose equality coerces types: `![]` → false; `[] == false` coerces array to primitive. `"" == 0` → both to numbers. Prefer `===` and explicit checks; avoid `==` in production code.',
    tags: ['coercion', 'equality'],
  },
  {
    id: 'snip-ts-04',
    category: 'typescript',
    kind: 'explain',
    difficulty: 'junior',
    prompt: 'What is wrong with using `any` here? Better typing?',
    code: `function parseConfig(raw: any) {
  return { host: raw.host, port: raw.port }
}`,
    answer:
      '`any` disables checking — typos and wrong shapes slip through. Better: define `ConfigInput` interface, use `unknown` + validation (zod/io-ts), or narrow with typeof checks before access.',
    tags: ['any', 'unknown', 'validation'],
  },
  {
    id: 'snip-react-07',
    category: 'react',
    kind: 'debug',
    difficulty: 'senior',
    prompt: 'Context consumers re-render the whole tree. One improvement?',
    code: `const AppContext = createContext({ user: null, theme: 'light' })

function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')
  const value = { user, setUser, theme, setTheme }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}`,
    answer:
      'New `value` object every render → all consumers re-render. Fix: `useMemo` for value, split contexts (UserContext / ThemeContext), or store selectors (Zustand, Redux, use-context-selector).',
    tags: ['context', 'performance'],
  },
  {
    id: 'snip-react-08',
    category: 'react',
    kind: 'error',
    difficulty: 'mid',
    prompt: 'Error: "Cannot update a component while rendering a different component." Source?',
    code: `function Parent() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Child onReady={() => setCount(c => c + 1)} />
      <p>{count}</p>
    </>
  )
}

function Child({ onReady }) {
  onReady()
  return null
}`,
    answer:
      '`onReady()` runs during Child render, triggering Parent setState synchronously — forbidden. Fix: call in `useEffect`, event handler, or pass data up via callback invoked from user action, not render.',
    tags: ['setState-in-render'],
  },
  {
    id: 'snip-js-06',
    category: 'javascript',
    kind: 'explain',
    difficulty: 'senior',
    prompt: 'What does this log? Explain `??` vs `||`.',
    code: `console.log(0 || 'fallback')
console.log(0 ?? 'fallback')
console.log('' ?? 'fallback')
console.log(null ?? 'fallback')`,
    answer:
      '`||` treats falsy (0, "", false) as missing → first log "fallback". `??` only replaces null/undefined → 0 stays 0, "" stays "", null → "fallback". Use `??` when 0 or empty string are valid values.',
    tags: ['nullish-coalescing', 'operators'],
  },
]

export const g2iSnippetKinds = ['explain', 'debug', 'error'] as const
