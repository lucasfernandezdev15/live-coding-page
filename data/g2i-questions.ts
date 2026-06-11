export type Question = {
  id: string
  category: 'javascript' | 'typescript' | 'react' | 'softskills'
  type: 'theoretical' | 'coding'
  difficulty: 'junior' | 'mid' | 'senior'
  question: string
  hints?: string[]
  answer: string
  tags: string[]
}

export const g2iQuestions: Question[] = [
  // ── TypeScript (6) ───────────────────────────────────────────────
  {
    id: 'ts-01',
    category: 'typescript',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'You receive an API payload typed as a union of success and error shapes. How do you narrow the type safely at runtime without `as` casts everywhere?',
    hints: [
      'Think discriminated unions and a single literal field both branches share.',
      'What does TypeScript need to trust a branch inside `if`?',
    ],
    answer:
      'Model the response as a discriminated union with a shared discriminator, e.g. `{ status: "ok"; data: T } | { status: "error"; message: string }`. At runtime, branch on `status` (or `kind`, `type`)—TypeScript narrows automatically inside each block. For unknown external JSON, validate first with a schema library (Zod, Valibot) or a type guard function `function isOk(x): x is Ok` that checks required fields. Avoid sprinkling `as`; if you need a cast, centralize it in one mapper next to the network boundary so the rest of the app works with trusted types.',
    tags: ['discriminated-unions', 'type-narrowing', 'api'],
  },
  {
    id: 'ts-02',
    category: 'typescript',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'Explain when you would use `satisfies` instead of a type annotation on an object. Give a concrete example where `as const` alone is not enough.',
    hints: [
      'Compare preserving literal types vs enforcing a wider interface.',
    ],
    answer:
      '`satisfies` checks that a value matches a type while keeping the most specific inferred type. A plain annotation widens literals: `const routes: Record<string, string> = { home: "/" }` loses the keys. `as const` preserves literals but does not verify excess properties against an interface. Example: theme tokens `const palette = { primary: "#3366ff", spacing: { sm: 8, md: 16 } } satisfies ThemeConfig`—you get autocomplete and compile-time validation that every required theme key exists, but `palette.spacing.sm` stays `8` (number literal) instead of widening to `number`. Use `satisfies` for config objects, route maps, and Redux initial state where you want both safety and precise inference.',
    tags: ['satisfies', 'inference', 'config'],
  },
  {
    id: 'ts-03',
    category: 'typescript',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'What is the difference between `unknown` and `any`? How should you handle errors in `catch` blocks in strict TypeScript?',
    hints: [
      'Which type forces you to narrow before use?',
    ],
    answer:
      '`any` disables checking—it propagates silently and defeats the type system. `unknown` means “we must verify before use,” which is correct for external input and caught errors. In `catch (e)`, `e` is `unknown` under `useUnknownInCatchVariables`. Narrow with `e instanceof Error`, or a helper `function getErrorMessage(e: unknown): string`. Never assume `.message` exists. For APIs returning `Promise<unknown>`, parse then narrow. Reserve `any` for truly dynamic interop (legacy libs) and isolate it; default to `unknown` at boundaries.',
    tags: ['unknown', 'any', 'error-handling'],
  },
  {
    id: 'ts-04',
    category: 'typescript',
    type: 'coding',
    difficulty: 'mid',
    question:
      'Implement the type-level utility `DeepPartial<T>` that makes every property optional recursively, except leave function properties as-is. When would you *not* use it in application code?',
    hints: [
      'Recursive mapped types need a base case for primitives.',
      'Patch/update APIs often need deep partials—full domain models usually do not.',
    ],
    answer:
      '```ts\ntype DeepPartial<T> = T extends (...args: never[]) => unknown\n  ? T\n  : T extends object\n    ? { [K in keyof T]?: DeepPartial<T[K]> }\n    : T\n```\nUse for PATCH payloads or nested form drafts where any subtree may be omitted. Avoid for core domain entities you pass around after validation—you want fully defined objects in business logic so undefined does not leak. Runtime still needs validation; `DeepPartial<User>` does not guarantee a valid `User` after merge.',
    tags: ['generics', 'mapped-types', 'utilities'],
  },
  {
    id: 'ts-05',
    category: 'typescript',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'Structural typing helped you pass an interview test, but production broke: two different concepts shared the same shape. How do you prevent “duck typing” accidents in TypeScript?',
    hints: [
      'Branded/nominal types, separate interfaces, validation at boundaries.',
    ],
    answer:
      'TypeScript is structural: if it looks like a duck, it is a duck. Accidents happen when `UserId` and `OrderId` are both `string`, or when API DTOs match domain types by coincidence. Mitigations: (1) branded types `type UserId = string & { readonly __brand: "UserId" }`, (2) separate types for DTO vs domain and explicit mappers, (3) `satisfies` + readonly configs, (4) avoid re-exporting loose interfaces across layers. At boundaries, validate and map once. In code review, flag primitives that carry business meaning without branding.',
    tags: ['structural-typing', 'branded-types', 'architecture'],
  },
  {
    id: 'ts-06',
    category: 'typescript',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'A junior uses `enum` for every string union. When do you prefer `as const` objects or union literals instead?',
    hints: [
      'Tree-shaking, reverse mapping, exhaustiveness in switch.',
    ],
    answer:
      'String union literals or `as const` objects are usually preferable in modern TS: better tree-shaking, no reverse-mapping surprises, works naturally with `switch` exhaustiveness via `assertNever`. Use `enum` when you need a runtime object iterated in UI (status dropdown) and the team standardizes on it—but document that numeric enums are especially risky. Pattern: `const Status = { Idle: "idle", Loading: "loading" } as const; type Status = (typeof Status)[keyof typeof Status]`. You keep runtime values and a union type without enum emit quirks.',
    tags: ['enums', 'unions', 'best-practices'],
  },

  // ── React (6) ────────────────────────────────────────────────────
  {
    id: 'react-01',
    category: 'react',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'Users describe a dashboard as “slow.” Walk through how you would diagnose and fix it without guessing.',
    hints: [
      'Measure first: React Profiler, Performance tab, network waterfall.',
      'Separate data-fetch slowness from render slowness.',
    ],
    answer:
      'Start with evidence: React DevTools Profiler (which components re-render, commit duration), Chrome Performance (long tasks, layout thrash), Network (waterfall, payload size). Ask what “slow” means—TTI, interaction delay, scroll jank. Common fixes by layer: (1) Data—stale closures refetching, missing cache keys, N+1 requests; dedupe with React Query/SWR, paginate, prefetch. (2) Render—context broadcasting, unstable props causing child re-renders; split context, memoize callbacks only where Profiler proves it helps, virtualize long lists. (3) Bundle—route-level code splitting. Ship one measurable improvement, re-profile, document before/after. Avoid premature `memo` everywhere.',
    tags: ['performance', 'profiling', 'situational'],
  },
  {
    id: 'react-02',
    category: 'react',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'What causes a React function component to re-render? List the cases and which ones you can control.',
    hints: [
      'Parent render, state, context, external store subscriptions.',
    ],
    answer:
      'A component re-renders when: (1) its own `useState`/`useReducer` updates, (2) its parent re-renders (default—children always re-render unless memoized and props stable), (3) consumed context value changes, (4) external store subscriptions (Zustand, Redux, `useSyncExternalStore`), (5) `forceUpdate` patterns (rare). You control: colocating state, splitting context providers, stable props (`useCallback`/`useMemo` when justified), `React.memo` on expensive pure children, keys on lists, moving state down. You do not “skip” parent renders—you reduce their impact. React 19 compiler may auto-memoize, but reasoning stays the same.',
    tags: ['re-rendering', 'fundamentals'],
  },
  {
    id: 'react-03',
    category: 'react',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'When would `useMemo` help, when would `useCallback` help, and when does `React.memo` help—and when are all three a waste?',
    hints: [
      'Each solves a different problem; Profiler should justify them.',
    ],
    answer:
      '`useMemo` caches a computed value between renders when dependencies are unchanged—useful for expensive derived data passed to children or used in effects. `useCallback` caches a function reference so memoized children or effect deps stay stable. `React.memo` skips re-render of a child if props are shallow-equal. None help if: the child is cheap, props change every render anyway, or you memoize without measuring (added complexity + memory). Anti-pattern: wrapping every handler in `useCallback` while parent still re-renders constantly. Rule: profile first; apply at boundaries (virtualized rows, heavy charts, pure list items).',
    tags: ['useMemo', 'useCallback', 'React.memo', 'performance'],
  },
  {
    id: 'react-04',
    category: 'react',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'You put user, theme, and cart in one React Context. Checkout page feels sluggish. What happened and how do you refactor?',
    hints: [
      'Single context value object recreated every render?',
    ],
    answer:
      'One context with a big value forces every consumer to re-render when any slice changes—even if a component only needs `theme`. If the provider does `value={{ user, theme, cart }}` inline, a new object every render re-renders all consumers anyway. Fix: split contexts by update frequency (ThemeContext, AuthContext, CartContext), or use a selector-based store (Zustand, Redux Toolkit) so components subscribe to slices. For cart, colocate state near checkout or use `useSyncExternalStore`. Measure with Profiler before/after. Document pattern for the team: “high-churn state does not live next to static theme.”',
    tags: ['context', 'performance', 'architecture'],
  },
  {
    id: 'react-05',
    category: 'react',
    type: 'coding',
    difficulty: 'senior',
    question:
      'A list renders 2,000 rows and scrolling stutters. The PM says “just use pagination.” What do you implement and what do you explain to the PM?',
    hints: [
      'Virtualization vs pagination—they solve different UX problems.',
    ],
    answer:
      'Technically: window the list with virtualization (`@tanstack/react-virtual`, `react-window`) so only ~20 DOM nodes exist; keep row components memoized and avoid inline styles/objects per row. If items vary in height, measure or estimate. Pagination helps server load and cognitive load but does not fix rendering 2,000 nodes if you still mount them all on one page. To PM: “Pagination changes UX and may hurt power users; virtualization keeps infinite scroll and fixes jank. We can combine both—virtual scroll client-side, server pagination for data.” Add skeleton states, preserve scroll position on filter changes, and verify with Performance panel.',
    tags: ['virtualization', 'lists', 'performance'],
  },
  {
    id: 'react-06',
    category: 'react',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'Explain the mental model of React 18 concurrent features (transitions, Suspense) in terms a mid-level dev understands. When would you reach for `useTransition`?',
    hints: [
      'Urgent vs non-urgent updates.',
    ],
    answer:
      'Concurrent rendering lets React interrupt and resume work so urgent updates (typing, clicking) stay responsive while heavier updates (filtering a big list, route transitions) can wait. `useTransition` marks state updates as non-urgent: `const [pending, startTransition] = useTransition(); startTransition(() => setFilter(q))` keeps the input snappy while the filtered view catches up. `Suspense` declares loading boundaries for lazy components or data (with compatible loaders). Use transitions when typing triggers expensive re-filter/re-render, tab switches, or visualizations—not for every `setState`. Still pair with proper data caching and memoization; concurrent features complement, not replace, architecture.',
    tags: ['concurrent', 'useTransition', 'Suspense'],
  },

  // ── JavaScript core (4) ──────────────────────────────────────────
  {
    id: 'js-01',
    category: 'javascript',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'Explain closures to a junior who can use them but cannot explain why this loop logs five 5s. How do you mentor, not lecture?',
    hints: [
      'Classic `var` + `setTimeout` loop; lexical environment persists.',
    ],
    answer:
      'Start with their code: `for (var i = 0; i < 5; i++) setTimeout(() => console.log(i), 0)` logs 5 five times because `var` is function-scoped—one shared `i` ends at 5 before callbacks run. Closure captures the binding, not the value at creation time. Fix with `let` (block scope per iteration) or IIFE. Build intuition: “inner function remembers variables from where it was created.” Exercise: make a `makeCounter()` factory. Ask them to predict before running. Connect to React: stale closures in `useEffect` with missing deps. Check understanding by having them teach it back with `let` and a custom hook example.',
    tags: ['closures', 'mentoring', 'event-loop'],
  },
  {
    id: 'js-02',
    category: 'javascript',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'Shallow copy vs deep copy: compare spread, `Object.assign`, `structuredClone`, and JSON.parse/stringify. When does each fail?',
    hints: [
      'Nested objects, dates, functions, prototypes, circular refs.',
    ],
    answer:
      'Spread/`Object.assign` copy top-level enumerable own properties—nested objects are shared references (shallow). `structuredClone` deep-clones most built-ins (Dates, Maps, Sets, ArrayBuffers) in modern browsers/Node; throws on functions, symbols, and circular references. `JSON.parse(JSON.stringify(x))` is a poor deep clone: drops `undefined`, functions, `Date` becomes string, `Map`/`Set` break, no cycles. Use shallow copy for immutable updates of one level (`{ ...user, name }`). Use `structuredClone` for detached config snapshots. For state management, prefer immutable updates (Immer) instead of cloning entire trees each action. In interviews, mention you pick based on data shape and environment support.',
    tags: ['copy', 'immutability', 'structuredClone'],
  },
  {
    id: 'js-03',
    category: 'javascript',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'Walk through the event loop: stack, microtask queue, macrotask queue. What runs first after `Promise.resolve().then(...)` and `setTimeout(..., 0)` in the same synchronous block?',
    hints: [
      'Sync code finishes, then microtasks drain, then one macrotask.',
    ],
    answer:
      'Synchronous code runs on the call stack to completion. Microtasks (promise callbacks, `queueMicrotask`, MutationObserver) run until the microtask queue is empty. Then the browser renders if needed, then the next macrotask (`setTimeout`, I/O, message events). In one block: both schedule; after sync ends, the promise `.then` runs before `setTimeout` callback. `async/await` before first `await` is sync; after `await`, continuation is a microtask. Explain impact: starving microtasks can delay paint; heavy sync work blocks clicks. Connect to React 18 batching and why deferring with `setTimeout(0)` vs `queueMicrotask` ordering matters in tests.',
    tags: ['event-loop', 'microtasks', 'macrotasks'],
  },
  {
    id: 'js-04',
    category: 'javascript',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      '“How does JavaScript work internally?”—give a senior-level answer without reciting the entire ECMA spec.',
    hints: [
      'Execution contexts, hoisting, scope chain, GC at high level.',
    ],
    answer:
      'JS is single-threaded with an event loop for async. Source is parsed into AST, compiled by modern engines (Ignition + TurboFan in V8). Execution happens in contexts: global and per-function, each with variable environment, lexical scope chain, and `this` binding. `let`/`const` live in temporal dead zone until initialized; `var` hoists undefined. Closures keep outer environments alive via scope links. Prototypes implement inheritance; property lookup walks the chain. GC reclaims unreachable objects (generational collection). Async = scheduling callbacks when stack clears, not parallel threads (Workers aside). Tie to practical bugs: hoisting surprises, closure staleness, memory leaks from detached DOM + listeners.',
    tags: ['internals', 'execution-context', 'engines'],
  },

  // ── Soft skills (3) ──────────────────────────────────────────────
  {
    id: 'soft-01',
    category: 'softskills',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'A PM asks for a major feature “by Friday” on a codebase with no tests and unclear scope. How do you respond in the meeting and after?',
    hints: [
      'Do not flat refuse or silently accept—negotiate scope, risk, and milestones.',
    ],
    answer:
      'In the meeting: acknowledge the business goal, ask clarifying questions (MVP vs full vision, who uses it, success metric), surface constraints honestly (“Friday is possible for X narrow slice; full Y needs longer”), propose options: reduced scope, phased delivery, or extra help. Name risks of skipping tests on critical paths. After: send a short written summary—agreed scope, out-of-scope items, assumptions, date for a demoable increment. Offer a spike if unknowns are large. Senior signal: you protect the team without being blockers; you make tradeoffs explicit so PM can escalate with data. Never promise what you cannot staff; do promise a plan.',
    tags: ['pm', 'scope', 'communication'],
  },
  {
    id: 'soft-02',
    category: 'softskills',
    type: 'theoretical',
    difficulty: 'mid',
    question:
      'How do you review a pull request? What do you look for first, and how do you give feedback that lands?',
    hints: [
      'Correctness, readability, tests, perf/security—prioritize by risk.',
    ],
    answer:
      'Order: (1) Understand intent—read description/ticket, skim diff size. (2) Correctness & edge cases—nulls, error paths, race conditions. (3) API/design—naming, boundaries, duplication. (4) Tests—meaningful cases, not snapshot noise. (5) Performance/security only where relevant (N+1, XSS, auth). (6) Nits last or automate with lint. Feedback: specific, kind, suggest alternatives (“consider extracting… because…”), distinguish blockers vs optional. Praise good patterns. For large PRs, ask to split. If you lack context, ask questions instead of assuming. Goal is shared ownership, not winning debates.',
    tags: ['code-review', 'teamwork'],
  },
  {
    id: 'soft-03',
    category: 'softskills',
    type: 'theoretical',
    difficulty: 'senior',
    question:
      'Two teammates disagree on architecture in a meeting and you are asked to break the tie. One wants Redux, one wants React Query only. How do you facilitate?',
    hints: [
      'Criteria over opinions; prototype or ADR; align on problem statement.',
    ],
    answer:
      'Reframe from people to problem: what state are we managing (server vs client UI), consistency needs, offline, dev experience, team familiarity. List criteria: cache invalidation, boilerplate, testability, time to ship. Often the answer is both—React Query for server cache, minimal client store for UI flags—or Query + context. Propose a time-boxed spike or ADR with two options and measured tradeoffs. In the meeting, ensure each person feels heard; summarize shared goals. Decide who owns the decision (tech lead, team vote on criteria-weighted matrix). Commit publicly, document, revisit after shipping. Senior move: reduce recurring debates with written principles.',
    tags: ['facilitation', 'architecture', 'teamwork'],
  },

  // ── Extra coding drills (optional depth) ─────────────────────────
  {
    id: 'react-07',
    category: 'react',
    type: 'coding',
    difficulty: 'mid',
    question:
      'Fix a component where typing in a search input feels laggy because every keystroke filters 10k items inline in render. What changes do you make?',
    hints: [
      'Defer work, memoize filtered list, maybe web worker for huge sets.',
    ],
    answer:
      'Immediate: move filtering out of render hot path—`useMemo` on filtered list with `[items, debouncedQuery]`, debounce input with 150–300ms or `useTransition` for non-urgent filter state. Ensure list item components are memoized and keyed by id. If still slow, virtualize results. Longer term: server-side search/pagination, index in worker, or fuse.js pre-built index. Verify with Profiler that input component is not re-rendering the whole tree—split SearchInput and Results, avoid lifting unnecessary state. Show metrics: input latency vs filter completion.',
    tags: ['performance', 'debounce', 'coding'],
  },
  {
    id: 'ts-07',
    category: 'typescript',
    type: 'coding',
    difficulty: 'senior',
    question:
      'Type a function `pick(obj, keys)` that returns only the selected keys with correct types—no `any`.',
    hints: [
      'Generic `K extends keyof T` and mapped types.',
    ],
    answer:
      '```ts\nfunction pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {\n  const out = {} as Pick<T, K>\n  for (const k of keys) out[k] = obj[k]\n  return out\n}\n```\nCall site: `pick(user, ["id", "email"] as const)` or overload for tuple keys. Explain `Pick<T,K>` built-in does the same at type level. In review, discuss readonly keys array vs rest params and excess property checks. Runtime still copies—this is about type safety at API boundaries.',
    tags: ['generics', 'Pick', 'coding'],
  },
]

export const g2iQuestionCategories = ['javascript', 'typescript', 'react', 'softskills'] as const

export { g2iInterviewFormatSummary } from '@/lib/g2iInterviewBrief'
