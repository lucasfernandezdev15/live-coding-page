export type CommonErrorCard = {
  id: string
  source: 'react' | 'typescript' | 'javascript' | 'browser' | 'nextjs'
  difficulty: 'junior' | 'mid' | 'senior'
  message: string
  prompt: string
  context?: string
  answer: string
  tags: string[]
}

export const g2iCommonErrors: CommonErrorCard[] = [
  {
    id: 'err-react-01',
    source: 'react',
    difficulty: 'mid',
    message: 'Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn\'t have a dependency array, or one of the dependencies changes on every render.',
    prompt: 'What usually causes this and how do you fix it?',
    answer:
      'An effect or handler triggers setState on every render (missing/wrong deps, setState during render, unstable deps like inline objects). Fix: add correct dependency array, use functional updates, memoize deps, or move setState to events. Use React DevTools "Highlight updates" to find the loop.',
    tags: ['useEffect', 'infinite-loop'],
  },
  {
    id: 'err-react-02',
    source: 'react',
    difficulty: 'mid',
    message: 'Rendered more hooks than during the previous render.',
    prompt: 'What did the developer do wrong?',
    answer:
      'Hooks were called conditionally or after an early return, changing hook order/count between renders. Fix: call hooks unconditionally at the top of the component; branch in JSX after all hooks.',
    tags: ['rules-of-hooks'],
  },
  {
    id: 'err-react-03',
    source: 'react',
    difficulty: 'mid',
    message: 'Invalid hook call. Hooks can only be called inside of the body of a function component.',
    prompt: 'Name three common causes of this error.',
    answer:
      '1) Hook in a regular function/class/event handler. 2) Duplicate React copies in bundle. 3) Calling hooks outside component body. Fix: only call from function components/custom hooks; dedupe React in bundler; restart dev server after dependency changes.',
    tags: ['rules-of-hooks', 'bundler'],
  },
  {
    id: 'err-react-04',
    source: 'react',
    difficulty: 'senior',
    message: 'Text content did not match. Server: "…" Client: "…" (hydration error)',
    prompt: 'What patterns cause hydration mismatches in React/Next.js?',
    answer:
      'Non-deterministic SSR output: Date.now(), random IDs, locale/time formatting, browser-only APIs in render, invalid HTML nesting. Fix: render volatile values in useEffect, use suppressHydrationWarning sparingly, match server/client markup, use dynamic import with ssr:false for client-only widgets.',
    tags: ['hydration', 'ssr'],
  },
  {
    id: 'err-react-05',
    source: 'react',
    difficulty: 'mid',
    message: 'Cannot update a component (`Parent`) while rendering a different component (`Child`).',
    prompt: 'Where should state updates happen instead?',
    answer:
      'setState was invoked during Child render (or a function Child calls synchronously while rendering). Move the update to useEffect, an event handler, or a callback fired from user interaction — never during render.',
    tags: ['setState-in-render'],
  },
  {
    id: 'err-react-06',
    source: 'react',
    difficulty: 'junior',
    message: 'Each child in a list should have a unique "key" prop.',
    prompt: 'Why do keys matter? What is a bad key choice?',
    answer:
      'Keys help React reconcile list items across renders. Bad: array index when list reorders/filters, or random keys each render. Good: stable unique IDs from data. Wrong keys cause lost focus, wrong component state, and unnecessary remounts.',
    tags: ['keys', 'lists'],
  },
  {
    id: 'err-ts-01',
    source: 'typescript',
    difficulty: 'mid',
    message: 'Object is possibly \'undefined\'.',
    prompt: 'What are safe ways to handle this without abusing `!`?',
    answer:
      'Narrow first: optional chaining, guard clauses, `if (x)` checks, default values, early return. Non-null assertion (`!`) only when you have a proven invariant. In React, often fix data loading states so UI does not render before data exists.',
    tags: ['narrowing', 'strict-null'],
  },
  {
    id: 'err-ts-02',
    source: 'typescript',
    difficulty: 'mid',
    message: 'Type \'X\' is not assignable to type \'Y\'.',
    prompt: 'How do you debug this systematically in an interview?',
    answer:
      'Hover the error, expand the type in IDE, find the mismatched field. Check optional vs required, union vs literal, generic inference, and contravariance in function props. Fix by narrowing, correcting the type definition, or adjusting the API contract — explain why the types differ.',
    tags: ['assignability', 'debugging'],
  },
  {
    id: 'err-ts-03',
    source: 'typescript',
    difficulty: 'senior',
    message: 'The inferred type of this node exceeds the maximum length the compiler will serialize.',
    prompt: 'What does this mean in practice and how do teams fix it?',
    answer:
      'TS inferred an enormous composite type (often heavy generics + libraries). Fix: add explicit return type annotation, simplify generics, upgrade TS, or split types. In interviews: mention explicit annotations at API boundaries to help the compiler and readers.',
    tags: ['inference', 'generics'],
  },
  {
    id: 'err-js-01',
    source: 'javascript',
    difficulty: 'junior',
    message: 'Uncaught TypeError: Cannot read properties of undefined (reading \'map\')',
    prompt: 'In a React fetch flow, what do you check first?',
    answer:
      'Data is undefined before load completes or API shape differs. Fix: optional chaining, default `[]`, loading/error states, validate response shape, typed guards. Do not call `.map` until data exists.',
    tags: ['undefined', 'fetch', 'react'],
  },
  {
    id: 'err-js-02',
    source: 'javascript',
    difficulty: 'mid',
    message: 'Uncaught ReferenceError: Cannot access \'X\' before initialization',
    prompt: 'What causes temporal dead zone errors?',
    answer:
      'Using `let`/`const` before declaration in the same scope, or circular imports where a binding is accessed before module init finishes. Fix: reorder declarations, use function declarations for hoisted helpers, break circular deps with lazy imports or moving shared code.',
    tags: ['tdz', 'modules'],
  },
  {
    id: 'err-next-01',
    source: 'nextjs',
    difficulty: 'mid',
    message: 'You\'re importing a component that needs useState. This React hook only works in a client component.',
    prompt: 'How do you fix this in Next.js App Router?',
    answer:
      'Add `"use client"` at the top of the file (or split: server wrapper + client leaf component). Keep server components for data fetching; pass serializable props to client children for interactivity.',
    tags: ['nextjs', 'rsc', 'use-client'],
  },
  {
    id: 'err-browser-01',
    source: 'browser',
    difficulty: 'mid',
    message: 'Access to fetch at \'…\' from origin \'…\' has been blocked by CORS policy',
    prompt: 'Explain CORS to the interviewer and practical fixes.',
    answer:
      'Browser blocks cross-origin responses unless server sends allowed Origin headers. Fixes: proxy via same-origin API route (Next.js `/api`), configure backend CORS, use server-side fetch in SSR. Not fixed by client-side headers alone — server must cooperate.',
    tags: ['cors', 'fetch', 'nextjs'],
  },
  {
    id: 'err-react-07',
    source: 'react',
    difficulty: 'senior',
    message: 'Warning: Cannot update during an existing state transition (React 18 concurrent feature)',
    prompt: 'What triggers this and how do you avoid it?',
    answer:
      'Synchronous setState from inside lifecycle/render paths during concurrent rendering, or external stores updating React without proper batching. Fix: defer updates with queueMicrotask/startTransition, subscribe in useEffect, use official external store patterns (useSyncExternalStore).',
    tags: ['concurrency', 'react18'],
  },
]

export const ERROR_SOURCE_LABEL: Record<CommonErrorCard['source'], string> = {
  react: 'React',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  browser: 'Browser',
  nextjs: 'Next.js',
}
