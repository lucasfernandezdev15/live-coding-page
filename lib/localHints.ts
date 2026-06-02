import type { Category, Challenge } from '@/lib/types'

const HINT_BY_CATEGORY: Record<Category, string[]> = {
  TypeScript: [
    'Empezá por la firma de tipos antes de implementar la utility; los tests al final validan que compile.',
    'Para utilidades tipo Pick/Omit, combiná mapped types con Exclude de keys.',
    'Evitá usar los built-in del ejercicio si el challenge pide implementarlos desde cero.',
    'Si usás generics, revisá que `extends` restrinja correctamente en cada parámetro.',
    'El reducer de eventos debe ser exhaustivo: el default con `assertNever` cubre casos imposibles.',
  ],
  React: [
    'Revisá si el estado se actualiza de forma inmutable y si los handlers no recrean objetos en cada render.',
    'Separá estado de UI (tab activa) del estado de datos (lista de items).',
    'En listas, usá un id estable como `key`, no el índice del array.',
    'Para tabs sin refetch, mantené paneles montados y ocultá los inactivos con CSS.',
    'Revisá dependencias del useEffect: valores stale suelen venir de closures mal declaradas.',
  ],
  'Next.js': [
    'En pages router, providers globales (QueryClient, theme) van en `_app.tsx`.',
    'SSR con styled-components en pages router se configura en `_document.tsx`.',
    'Para datos por request usá `getServerSideProps`; para estáticos, `getStaticProps`.',
    'Sincronizar filtros con la URL: `router.push` con query params sin perder otros params.',
    'En App Router vs pages: `useRouter` viene de `next/router` en pages, no de `next/navigation`.',
  ],
  'React Query': [
    'La query key debe incluir recurso + página + filtros que cambian.',
    '`staleTime` alto evita refetch al volver a una pestaña ya cargada.',
    'En v5 el tiempo de GC es `gcTime` (antes `cacheTime` en v4).',
    'Separá cache: `["characters", page]` vs `["locations", page]`.',
    'Con paginación, `placeholderData` / keepPreviousData evita pantalla vacía al cambiar página.',
  ],
  Zustand: [
    'Mantené el store pequeño: estado global solo para lo que varias pantallas necesitan.',
    'Acciones en el store deben ser puras respecto al estado previo (sin mutar fuera de set).',
    'Para selectores, evitá suscribirse a todo el store si solo necesitás un slice.',
    'Si combinás con React Query, el servidor va en queries y la UI local en Zustand.',
    'Documentá qué va al store vs props para justificarlo en entrevista.',
  ],
  Auth: [
    'No guardes tokens en localStorage si el brief pide cookies httpOnly.',
    'Protegé rutas en el servidor (middleware o getServerSideProps), no solo ocultando links.',
    'Manejá refresh/expiración de sesión y estados loading mientras validás el token.',
    'Separá “usuario autenticado” de “permisos/roles” en el modelo de datos.',
    'En errores 401, redirigí a login con returnUrl para mejor UX.',
  ],
  Testing: [
    'Testeá comportamiento (cambio de tab, error API), no detalles de implementación interna.',
    'Con React Query en tests, QueryClient nuevo por test y limpiá cache entre casos.',
    'Preferí `getByRole` y `userEvent` sobre testIds salvo que sea inevitable.',
    'Para debounce, `jest.useFakeTimers()` y `advanceTimersByTime`.',
    'Mockeá el cliente HTTP y contá llamadas al cambiar de pestaña si el brief pide no-refetch.',
  ],
}

const STAGE_PREFIX: Record<number, string> = {
  1: 'Empezá por el requisito principal del enunciado y el flujo mínimo que lo cumple.',
  2: 'Compará tu código con lo que pide el challenge: qué caso cubre cada parte y qué falta.',
  3: 'Pensá en el edge case más probable en producción y cómo lo explicarías en entrevista.',
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
      ? ' (Hints locales: añadí GEMINI_API_KEY gratis en aistudio.google.com o ANTHROPIC_API_KEY en .env.local para ayuda con tu código.)'
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
