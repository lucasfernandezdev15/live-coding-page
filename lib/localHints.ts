import type { Category, Challenge } from '@/lib/types'

const HINT_BY_CATEGORY: Record<Category, string[]> = {
  TypeScript: [
    'Start with the type signature before implementing the utility; the tests at the bottom validate compilation.',
    'For Pick/Omit-style utilities, combine mapped types with Exclude on keys.',
    'Avoid built-ins when the challenge asks you to implement the utility from scratch.',
    'With generics, check that `extends` constraints are applied correctly on each parameter.',
    'Event reducers should be exhaustive: a default branch with `assertNever` covers impossible cases.',
  ],
  React: [
    'Check whether state updates are immutable and handlers avoid recreating objects every render.',
    'Separate UI state (active tab) from data state (item list).',
    'In lists, use a stable id as `key`, not the array index.',
    'For tabs without refetch, keep panels mounted and hide inactive ones with CSS.',
    'Review useEffect dependencies: stale values often come from poorly declared closures.',
  ],
  'Next.js': [
    'In the pages router, global providers (QueryClient, theme) belong in `_app.tsx`.',
    'SSR with styled-components in the pages router is configured in `_document.tsx`.',
    'For per-request data use `getServerSideProps`; for static data, `getStaticProps`.',
    'Sync filters with the URL via `router.push` and query params without dropping other params.',
    'Pages router: `useRouter` comes from `next/router`, not `next/navigation` (App Router).',
  ],
  'React Query': [
    'The query key should include resource + page + any changing filters.',
    'A high `staleTime` avoids refetch when returning to an already loaded tab.',
    'In v5, garbage collection time is `gcTime` (was `cacheTime` in v4).',
    'Split cache keys: `["characters", page]` vs `["locations", page]`.',
    'With pagination, `placeholderData` / keepPreviousData avoids an empty screen when changing pages.',
  ],
  Zustand: [
    'Keep the store small: global state only for what multiple screens need.',
    'Store actions should be pure with respect to previous state (no mutation outside set).',
    'For selectors, avoid subscribing to the whole store if you only need a slice.',
    'With React Query, server data lives in queries; local UI state can live in Zustand.',
    'Document what goes in the store vs props so you can justify it in an interview.',
  ],
  Auth: [
    'Do not store tokens in localStorage if the brief requires httpOnly cookies.',
    'Protect routes on the server (middleware or getServerSideProps), not only by hiding links.',
    'Handle session refresh/expiry and loading states while validating the token.',
    'Separate “authenticated user” from “permissions/roles” in your data model.',
    'On 401 errors, redirect to login with a returnUrl for better UX.',
  ],
  Testing: [
    'Test behavior (tab change, API error), not internal implementation details.',
    'With React Query in tests, use a fresh QueryClient per test and clear cache between cases.',
    'Prefer `getByRole` and `userEvent` over testIds unless unavoidable.',
    'For debounce, use `jest.useFakeTimers()` and `advanceTimersByTime`.',
    'Mock the HTTP client and count calls on tab change when the brief requires no refetch.',
  ],
}

const STAGE_PREFIX: Record<number, string> = {
  1: 'Start with the main requirement and the smallest flow that satisfies it.',
  2: 'Compare your code to what the challenge asks: which cases each part covers and what is missing.',
  3: 'Think about the most likely production edge case and how you would explain your approach in an interview.',
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function pickLocalHint(challenge: Challenge, hintNumber: number): string {
  const pool = HINT_BY_CATEGORY[challenge.category]
  const idx = (hashId(challenge.id) + hintNumber - 1) % pool.length
  const topic = pool[idx]
  const stage = STAGE_PREFIX[hintNumber] ?? STAGE_PREFIX[1]
  const footer =
    hintNumber === 3
      ? ' (Local hints: add GEMINI_API_KEY at aistudio.google.com or ANTHROPIC_API_KEY in .env.local for code-aware help.)'
      : ''

  return `Hint ${hintNumber}/3 — ${challenge.title}\n\n${stage}\n\n${topic}${footer}`
}

export function buildLocalHintStream(challenge: Challenge, hintNumber: number): ReadableStream<Uint8Array> {
  const text = pickLocalHint(challenge, hintNumber)
  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      let i = 0
      const pump = () => {
        if (i >= text.length) {
          controller.close()
          return
        }
        const slice = text.slice(i, Math.min(i + 14, text.length))
        i += slice.length
        controller.enqueue(encoder.encode(slice))
        setTimeout(pump, 16)
      }
      pump()
    },
  })
}
