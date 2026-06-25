// G2i Teoría — banco amplio de preguntas teóricas.
//
// `reportedByG2i: true` marca temas que candidatos describen públicamente
// (Glassdoor, Reddit, blogs de prep, foros) como parte del vetting técnico de
// G2i. G2i no publica su set exacto de preguntas, así que estas marcas reflejan
// patrones reportados por la comunidad, no un examen oficial filtrado.

export type G2iTheoryCategory =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'react-native'
  | 'css-html'
  | 'testing'
  | 'softskills'
  | 'system-design'

export type G2iTheoryDifficulty = 'junior' | 'mid' | 'senior'

export type G2iTheoryQuestion = {
  id: string
  category: G2iTheoryCategory
  difficulty: G2iTheoryDifficulty
  question: string
  hints?: string[]
  answer: string
  tags: string[]
  /** true si la comunidad reporta este tema como usado en entrevistas de G2i. */
  reportedByG2i?: boolean
  /** breve nota sobre de dónde viene el reporte (cuando aplica). */
  sourceNote?: string
}

export const G2I_THEORY_CATEGORY_LABEL: Record<G2iTheoryCategory, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  'react-native': 'React Native',
  'css-html': 'CSS / HTML',
  testing: 'Testing',
  softskills: 'Soft skills',
  'system-design': 'Diseño / Arquitectura',
}

export const g2iTheoryFormatSummary = [
  'Entrevista técnica de ~45 min con otro desarrollador React: preguntas de alto nivel y sobre snippets de código.',
  'Temas: JavaScript, React, front-end y software engineering general. No es estilo LeetCode/algoritmos.',
  'Te pueden pedir que escribas un snippet pequeño y expliques cómo resolverías un problema de JS/React.',
  'Se evalúa tanto la respuesta correcta como cómo comunicás la idea técnica en voz alta.',
  'El playground real suele ser Replit; el autocompletado es limitado, así que practicá explicando mientras escribís.',
  'Las preguntas marcadas "G2i" son temas que candidatos reportan online como recurrentes en el vetting de G2i.',
]

export const g2iTheoryStudyTips = [
  'Respondé en voz alta con la estructura: Contexto → Enfoque → Tradeoffs → Cómo lo verifico en producción.',
  'Si no sabés algo, decí cómo lo investigarías; G2i valora honestidad y razonamiento sobre memorización.',
  'Conectá cada respuesta con experiencia real: "en un proyecto tuve este bug y lo resolví así".',
  'Para preguntas de performance, siempre mencioná medir primero (Profiler, Performance tab) antes de optimizar.',
]

export const g2iTheoryQuestions: G2iTheoryQuestion[] = [
  // ──────────────────────────────────────────────────────────────────
  // JavaScript
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-js-01',
    category: 'javascript',
    difficulty: 'junior',
    question:
      'Diferencia entre `var`, `let` y `const`. ¿Por qué este bucle imprime 3, 3, 3 y cómo lo arreglás?\n\n```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0)\n}\n```',
    hints: [
      'Pensá en scope de función vs scope de bloque.',
      '¿Qué captura el closure: el valor o la variable?',
    ],
    answer:
      '`var` tiene scope de función y hoisting (se inicializa como `undefined`); `let`/`const` tienen scope de bloque y temporal dead zone. `const` además impide reasignar la referencia (no congela el objeto). En el bucle, `var i` es una sola variable compartida: cuando corren los `setTimeout`, el bucle ya terminó e `i` vale 3, así que imprime 3, 3, 3. El closure captura la variable, no el valor del momento. Fix: usar `let i` (crea un binding nuevo por iteración → 0, 1, 2) o una IIFE que copie `i` a un parámetro.',
    tags: ['var-let-const', 'closures', 'event-loop', 'scope'],
    reportedByG2i: true,
    sourceNote: 'Closures y var/let aparecen en reportes de candidatos como pregunta de calentamiento.',
  },
  {
    id: 'th-js-02',
    category: 'javascript',
    difficulty: 'junior',
    question: 'Explicá `==` vs `===`. ¿Cuándo es aceptable usar `==`?',
    hints: ['Coerción de tipos vs comparación estricta.'],
    answer:
      '`===` compara valor y tipo sin coerción; `==` aplica coerción de tipos antes de comparar, lo que produce resultados sorpresa (`0 == ""` es true, `null == undefined` es true, `[] == false` es true). Regla práctica: usá `===` por defecto. El único `==` defendible es `x == null` para chequear `null` o `undefined` a la vez. En la entrevista conviene decir que preferís estricto y que el linter (eqeqeq) lo fuerza.',
    tags: ['coercion', 'equality', 'fundamentals'],
  },
  {
    id: 'th-js-03',
    category: 'javascript',
    difficulty: 'mid',
    question:
      'Explicá el event loop: call stack, microtask queue y macrotask queue. ¿Qué corre primero entre `Promise.resolve().then(...)` y `setTimeout(..., 0)` en el mismo bloque?',
    hints: ['El código síncrono termina, luego se drenan microtasks, luego una macrotask.'],
    answer:
      'El código síncrono corre en el call stack hasta vaciarse. Luego se drenan TODAS las microtasks (callbacks de promesas, `queueMicrotask`, MutationObserver) hasta que la cola quede vacía. Después el navegador puede renderizar y recién toma la próxima macrotask (`setTimeout`, eventos de I/O, mensajes). Por eso, en un mismo bloque, el `.then` de la promesa corre ANTES del callback de `setTimeout(0)`. `async/await`: lo previo al primer `await` es síncrono; lo posterior al `await` es una microtask. Impacto práctico: saturar microtasks puede demorar el paint, y trabajo síncrono pesado bloquea los clics.',
    tags: ['event-loop', 'microtasks', 'promises'],
    reportedByG2i: true,
    sourceNote: 'Async/event loop figura entre los temas de JS que candidatos mencionan en el screening de G2i.',
  },
  {
    id: 'th-js-04',
    category: 'javascript',
    difficulty: 'mid',
    question:
      'Copia superficial vs profunda: compará spread, `Object.assign`, `structuredClone` y `JSON.parse(JSON.stringify())`. ¿Cuándo falla cada una?',
    hints: ['Objetos anidados, Date, funciones, referencias circulares.'],
    answer:
      'Spread y `Object.assign` copian solo el primer nivel de propiedades enumerables propias: los objetos anidados quedan compartidos por referencia (shallow). `structuredClone` clona en profundidad la mayoría de tipos nativos (Date, Map, Set, ArrayBuffer) pero lanza error con funciones, símbolos y referencias circulares no soportadas. `JSON.parse(JSON.stringify(x))` es un deep clone pobre: pierde `undefined` y funciones, convierte `Date` en string, rompe `Map`/`Set` y falla con ciclos. Recomendación: spread para updates inmutables de un nivel (`{ ...user, name }`), `structuredClone` para snapshots, e Immer para state trees sin clonar todo en cada acción.',
    tags: ['copy', 'immutability', 'structuredClone'],
  },
  {
    id: 'th-js-05',
    category: 'javascript',
    difficulty: 'mid',
    question: 'Explicá `this` en JavaScript. ¿Por qué una arrow function se comporta distinto que una función normal como método o callback?',
    hints: ['`this` se define por cómo se llama la función, salvo en arrow functions.'],
    answer:
      'En funciones normales, `this` depende de cómo se invoca: como método (`obj.fn()`) `this` es `obj`; suelta, es `undefined` en strict mode o el global fuera de él; con `call`/`apply`/`bind` lo fijás explícitamente; con `new` es la instancia nueva. Las arrow functions NO tienen su propio `this`: lo toman léxicamente del scope donde se definieron. Por eso una arrow es ideal como callback dentro de un método de clase (mantiene el `this` de la instancia) y es un error usarla como método de objeto que necesita su propio `this`. Bug clásico: pasar `this.handleClick` sin bind a un listener → `this` se pierde; se resuelve con arrow o `bind` en el constructor.',
    tags: ['this', 'arrow-functions', 'binding'],
  },
  {
    id: 'th-js-06',
    category: 'javascript',
    difficulty: 'senior',
    question:
      '“¿Cómo funciona JavaScript internamente?” — dá una respuesta de nivel senior sin recitar toda la spec de ECMA.',
    hints: ['Contextos de ejecución, hoisting, scope chain, GC a alto nivel.'],
    answer:
      'JS es single-threaded con event loop para asincronía. El motor (V8: Ignition + TurboFan) parsea a AST y compila/optimiza JIT. La ejecución ocurre en contextos: global y por función, cada uno con su variable environment, scope chain léxico y binding de `this`. `let`/`const` viven en TDZ hasta inicializarse; `var` hace hoisting a `undefined`. Los closures mantienen vivo el environment externo vía el scope chain. Los prototipos implementan herencia: el lookup de propiedades recorre la cadena. El GC recupera objetos inalcanzables (recolección generacional). Asincronía = agendar callbacks cuando el stack se vacía, no hilos paralelos (salvo Workers). Lo ato a bugs reales: sorpresas de hoisting, closures stale, y memory leaks por DOM desprendido con listeners.',
    tags: ['internals', 'execution-context', 'engines', 'gc'],
  },
  {
    id: 'th-js-07',
    category: 'javascript',
    difficulty: 'mid',
    question:
      'Promesas: ¿qué hacen `Promise.all`, `Promise.allSettled`, `Promise.race` y `Promise.any`? Dá un caso de uso para cada uno.',
    hints: ['Pensá en "todo o nada" vs "el primero que resuelva".'],
    answer:
      '`Promise.all` resuelve con un array de resultados cuando TODAS resuelven, y rechaza apenas una falla (fail-fast) — útil para cargar en paralelo recursos que necesitás todos (perfil + settings + permisos). `Promise.allSettled` espera a todas y devuelve `{status, value|reason}` por cada una — ideal cuando querés mostrar resultados parciales aunque alguna falle (dashboard con varios widgets). `Promise.race` se asienta con la primera que resuelva o rechace — útil para timeouts (corre la fetch contra un timer). `Promise.any` resuelve con la primera que tenga éxito e ignora rechazos hasta que todas fallen (AggregateError) — útil para pegarle a varios mirrors y quedarte con el más rápido que funcione.',
    tags: ['promises', 'async', 'concurrency'],
    reportedByG2i: true,
    sourceNote: 'El manejo de promesas y async es un foco reportado del screening de JS de G2i.',
  },
  {
    id: 'th-js-08',
    category: 'javascript',
    difficulty: 'mid',
    question: 'Explicá debounce vs throttle. ¿Cuándo usás cada uno?',
    hints: ['Uno espera a que pares; el otro limita la frecuencia.'],
    answer:
      'Debounce pospone la ejecución hasta que pasen N ms sin nuevas llamadas: ideal para búsquedas mientras el usuario tipea o autosave (solo te interesa el estado final). Throttle garantiza como máximo una ejecución cada N ms aunque sigan llegando eventos: ideal para scroll, resize o mousemove donde querés muestras periódicas, no solo la última. En la práctica suelo usar la versión de lodash o un custom hook (`useDebouncedValue`). Punto fino: debounce con "leading edge" dispara al inicio; throttle puede tener trailing call para no perder el último evento.',
    tags: ['debounce', 'throttle', 'performance'],
  },
  {
    id: 'th-js-09',
    category: 'javascript',
    difficulty: 'senior',
    question:
      'Detectaste un memory leak en una SPA: el uso de memoria sube en cada navegación entre rutas. ¿Cómo lo diagnosticás y qué causas comunes buscás?',
    hints: ['Heap snapshots, listeners no removidos, timers, closures que retienen DOM.'],
    answer:
      'Diagnóstico: tomo heap snapshots en Chrome DevTools antes/después de navegar varias veces y comparo (busco objetos detached y conteos que solo crecen); uso el Performance/Memory timeline para ver si el GC no recupera. Causas comunes en SPA/React: (1) listeners de `window`/`document` agregados en efectos sin cleanup; (2) `setInterval`/`setTimeout` o suscripciones (WebSocket, stores) sin limpiar en el return del `useEffect`; (3) closures que retienen nodos DOM o datasets grandes; (4) caches que crecen sin límite; (5) referencias en variables module-level. Fix: limpiar siempre en el cleanup del efecto, usar `AbortController` para fetch, y `WeakMap`/`WeakRef` cuando corresponde. Verifico re-tomando snapshots tras el fix.',
    tags: ['memory-leak', 'debugging', 'devtools'],
  },
  {
    id: 'th-js-10',
    category: 'javascript',
    difficulty: 'junior',
    question: 'Explicá hoisting. ¿Qué imprime `console.log(x)` antes de `var x = 5` y antes de `let y = 5`?',
    hints: ['var se inicializa a undefined; let está en TDZ.'],
    answer:
      'Hoisting es que las declaraciones se "mueven" arriba de su scope en la fase de creación. `var x` se hoistea e inicializa a `undefined`, así que `console.log(x)` antes de la asignación imprime `undefined` (no error). `let y` también se hoistea pero queda en la Temporal Dead Zone hasta su línea de declaración, así que acceder antes lanza `ReferenceError`. Las declaraciones de función se hoistean completas (podés llamarlas antes); las function expressions asignadas a `var`/`let` no.',
    tags: ['hoisting', 'tdz', 'fundamentals'],
  },

  // ──────────────────────────────────────────────────────────────────
  // TypeScript
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-ts-01',
    category: 'typescript',
    difficulty: 'junior',
    question: '¿Cuál es la diferencia entre `interface` y `type`? ¿Cuándo preferís cada uno?',
    hints: ['Declaration merging, uniones, extends.'],
    answer:
      'Ambos describen formas de objetos y son intercambiables en muchos casos. `interface` admite declaration merging (varias declaraciones se fusionan) y `extends` clásico, por lo que es ideal para contratos públicos de librerías y props de componentes. `type` es más flexible: puede expresar uniones, intersecciones, tuplas, tipos mapeados y condicionales, y alias de primitivos. Regla práctica común: `interface` para objetos/clases extensibles, `type` para uniones y composiciones complejas. Lo importante en la entrevista es la consistencia del equipo, no el dogma.',
    tags: ['interface', 'type', 'fundamentals'],
  },
  {
    id: 'th-ts-02',
    category: 'typescript',
    difficulty: 'mid',
    question:
      'Recibís un payload tipado como unión de "éxito" y "error". ¿Cómo lo estrechás de forma segura en runtime sin `as` por todos lados?',
    hints: ['Discriminated unions con un campo literal compartido.'],
    answer:
      'Modelo la respuesta como discriminated union con un discriminante compartido, p.ej. `{ status: "ok"; data: T } | { status: "error"; message: string }`. En runtime hago branch sobre `status` y TypeScript estrecha automáticamente dentro de cada bloque. Para JSON externo desconocido, valido primero con un schema (Zod, Valibot) o un type guard `function isOk(x): x is Ok`. Evito esparcir `as`; si necesito un cast, lo centralizo en un único mapper junto al borde de red, así el resto de la app trabaja con tipos confiables.',
    tags: ['discriminated-unions', 'type-narrowing', 'api'],
    reportedByG2i: true,
    sourceNote: 'El tipado de respuestas de API y narrowing aparece en prep de candidatos de G2i con stack TS.',
  },
  {
    id: 'th-ts-03',
    category: 'typescript',
    difficulty: 'mid',
    question: '¿Cuál es la diferencia entre `unknown` y `any`? ¿Cómo manejás el error en un `catch` en TS estricto?',
    hints: ['¿Cuál te obliga a estrechar antes de usar?'],
    answer:
      '`any` desactiva el chequeo: se propaga en silencio y rompe el sistema de tipos. `unknown` significa "hay que verificar antes de usar", lo correcto para input externo y errores capturados. Con `useUnknownInCatchVariables`, en `catch (e)` el `e` es `unknown`: lo estrecho con `e instanceof Error` o un helper `getErrorMessage(e: unknown): string`, nunca asumo que `.message` existe. Reservo `any` solo para interop verdaderamente dinámica (libs legacy) y lo aíslo; por defecto uso `unknown` en los bordes.',
    tags: ['unknown', 'any', 'error-handling'],
  },
  {
    id: 'th-ts-04',
    category: 'typescript',
    difficulty: 'senior',
    question: '¿Cuándo usás `satisfies` en lugar de una anotación de tipo? Dá un ejemplo donde `as const` solo no alcanza.',
    hints: ['Preservar tipos literales vs forzar una interfaz más ancha.'],
    answer:
      '`satisfies` verifica que un valor cumpla un tipo mientras conserva el tipo más específico inferido. Una anotación común ensancha literales: `const routes: Record<string, string> = { home: "/" }` pierde las keys exactas. `as const` preserva literales pero no valida contra una interfaz. Ejemplo: `const palette = { primary: "#36f", spacing: { sm: 8 } } satisfies ThemeConfig` te da autocomplete y validación de que existen todas las keys requeridas, pero `palette.spacing.sm` sigue siendo `8` (literal) en vez de ensancharse a `number`. Lo uso para objetos de config, mapas de rutas y estado inicial donde quiero seguridad e inferencia precisa a la vez.',
    tags: ['satisfies', 'inference', 'config'],
  },
  {
    id: 'th-ts-05',
    category: 'typescript',
    difficulty: 'senior',
    question:
      'Los generics: implementá el tipo `DeepPartial<T>` y explicá cuándo NO conviene usarlo en código de aplicación.',
    hints: ['Tipos mapeados recursivos con caso base para primitivos.'],
    answer:
      'Una versión típica:\n\n```ts\ntype DeepPartial<T> = T extends (...args: never[]) => unknown\n  ? T\n  : T extends object\n    ? { [K in keyof T]?: DeepPartial<T[K]> }\n    : T\n```\n\nSirve para payloads PATCH o borradores de formularios anidados donde cualquier subárbol puede faltar. No conviene para entidades de dominio que pasás por la app tras validar: querés objetos completamente definidos en la lógica de negocio para que `undefined` no se filtre. Y recordá que el tipo no garantiza validez en runtime: `DeepPartial<User>` tras un merge no asegura un `User` válido; eso lo da la validación.',
    tags: ['generics', 'mapped-types', 'utilities'],
  },
  {
    id: 'th-ts-06',
    category: 'typescript',
    difficulty: 'mid',
    question: 'Explicá los utility types `Partial`, `Pick`, `Omit`, `Record` y `Required` con un ejemplo de uso real.',
    hints: ['Son tipos mapeados de la stdlib.'],
    answer:
      '`Partial<T>` hace todas las props opcionales (updates parciales). `Required<T>` lo opuesto. `Pick<T,K>` selecciona un subconjunto de keys (DTO reducido para una vista). `Omit<T,K>` quita keys (props internas que no exponés). `Record<K,V>` construye un objeto con keys conocidas y valores homogéneos (`Record<Status, string>` para labels). Ejemplo: de `type User = { id: string; name: string; password: string }`, el cliente recibe `Omit<User, "password">`, el form de edición usa `Partial<Pick<User, "name">>`, y los labels de estado son `Record<Status, string>`. Componerlos evita duplicar tipos a mano.',
    tags: ['utility-types', 'mapped-types'],
  },
  {
    id: 'th-ts-07',
    category: 'typescript',
    difficulty: 'senior',
    question:
      'El typing estructural te pasó en el test pero rompió producción: dos conceptos distintos compartían la misma forma. ¿Cómo prevenís accidentes de "duck typing"?',
    hints: ['Branded/nominal types, tipos separados, validación en bordes.'],
    answer:
      'TypeScript es estructural: si tiene la forma de un pato, es un pato. Los accidentes pasan cuando `UserId` y `OrderId` son ambos `string`, o cuando un DTO coincide con un tipo de dominio por casualidad. Mitigaciones: (1) branded types `type UserId = string & { readonly __brand: "UserId" }`; (2) tipos separados para DTO vs dominio con mappers explícitos; (3) `satisfies` + configs readonly; (4) no reexportar interfaces laxas entre capas. En los bordes valido y mapeo una sola vez. En code review marco primitivos que cargan significado de negocio sin branding.',
    tags: ['structural-typing', 'branded-types', 'architecture'],
  },

  // ──────────────────────────────────────────────────────────────────
  // React
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-react-01',
    category: 'react',
    difficulty: 'junior',
    question: '¿Qué causa que un componente funcional de React se re-renderice? Listá los casos y cuáles podés controlar.',
    hints: ['Render del padre, state propio, context, stores externos.'],
    answer:
      'Un componente re-renderiza cuando: (1) su propio `useState`/`useReducer` cambia; (2) su padre re-renderiza (por defecto los hijos también, salvo memoización con props estables); (3) cambia el valor de un context que consume; (4) cambia una suscripción a store externo (Zustand, Redux, `useSyncExternalStore`). Controlás: colocar el estado donde se usa, separar providers de context, props estables (`useCallback`/`useMemo` cuando se justifica), `React.memo` en hijos puros caros, keys en listas, y bajar estado. No "saltás" el render del padre: reducís su impacto. El compilador de React 19 puede auto-memoizar, pero el razonamiento es el mismo.',
    tags: ['re-rendering', 'fundamentals'],
    reportedByG2i: true,
    sourceNote: 'El "por qué re-renderiza React" es una de las preguntas de React más citadas por candidatos de G2i.',
  },
  {
    id: 'th-react-02',
    category: 'react',
    difficulty: 'junior',
    question: 'Explicá las reglas de los hooks y por qué no podés llamar un hook dentro de un `if` o un loop.',
    hints: ['React identifica los hooks por orden de llamada.'],
    answer:
      'Reglas: (1) solo llamar hooks en el nivel superior del componente o de otro hook, nunca dentro de condicionales, loops o funciones anidadas; (2) solo llamarlos desde componentes de función o custom hooks. La razón: React no usa nombres para asociar el estado a cada hook, sino el ORDEN de llamada en cada render. Si un `useState` queda detrás de un `if`, el orden cambia entre renders y React asocia el estado equivocado, corrompiendo todo. Por eso el patrón correcto es llamar el hook siempre y mover la condición adentro (o usar early return después de declarar los hooks). El plugin eslint-plugin-react-hooks lo detecta.',
    tags: ['hooks', 'rules-of-hooks', 'fundamentals'],
  },
  {
    id: 'th-react-03',
    category: 'react',
    difficulty: 'mid',
    question:
      '¿Para qué sirve el array de dependencias de `useEffect`? ¿Qué problemas trae dejarlo mal y cómo manejás la limpieza?',
    hints: ['Stale closures, efectos que se re-disparan, cleanup.'],
    answer:
      'Las deps le dicen a React cuándo re-ejecutar el efecto: con `[]` corre una vez al montar; con `[a, b]` corre cuando `a` o `b` cambian; sin array, en cada render. Problemas frecuentes: (1) omitir deps usadas → stale closures (el efecto ve valores viejos); (2) incluir objetos/funciones recreados cada render → el efecto se dispara siempre (se resuelve con `useCallback`/`useMemo` o moviendo la definición); (3) no limpiar → leaks. El cleanup es la función que retornás: cancela suscripciones, timers y fetch (`AbortController`), y corre antes de re-ejecutar y al desmontar. Confío en el lint de exhaustive-deps y, si algo no debe ser dependencia, lo refactorizo en vez de mentirle al array.',
    tags: ['useEffect', 'dependencies', 'cleanup'],
    reportedByG2i: true,
    sourceNote: 'useEffect, dependencias y cleanup son temas recurrentes reportados en el live coding de G2i.',
  },
  {
    id: 'th-react-04',
    category: 'react',
    difficulty: 'mid',
    question: '¿Cuál es la diferencia entre estado controlado y no controlado en formularios? ¿Cuándo usás cada uno?',
    hints: ['Quién es la fuente de verdad: React o el DOM.'],
    answer:
      'En un input controlado, React es la fuente de verdad: el `value` viene del state y `onChange` lo actualiza. Permite validación en vivo, transformar el input y deshabilitar el submit fácilmente, a costa de un render por tecla. En uno no controlado, el DOM mantiene su propio valor y lo leés con `ref` (o `FormData`) al enviar: menos renders y código, útil para formularios grandes o integración con librerías no-React. Regla práctica: controlado cuando necesitás feedback inmediato o lógica dependiente del valor; no controlado para formularios simples o de alto volumen. Librerías como React Hook Form usan refs (no controlado) para minimizar renders.',
    tags: ['forms', 'controlled', 'uncontrolled'],
  },
  {
    id: 'th-react-05',
    category: 'react',
    difficulty: 'mid',
    question:
      '¿Cuándo ayuda `useMemo`, cuándo `useCallback` y cuándo `React.memo`? ¿Cuándo los tres son un desperdicio?',
    hints: ['Cada uno resuelve un problema distinto; el Profiler debe justificarlos.'],
    answer:
      '`useMemo` cachea un valor calculado entre renders mientras no cambien las deps — útil para datos derivados caros que pasás a hijos o usás en efectos. `useCallback` cachea la referencia de una función para que hijos memoizados o deps de efectos queden estables. `React.memo` evita el re-render de un hijo si sus props son shallow-equal. Ninguno ayuda si: el hijo es barato, las props cambian igual en cada render, o memoizás sin medir (sumás complejidad y memoria). Anti-patrón: envolver cada handler en `useCallback` mientras el padre re-renderiza igual. Regla: medí con el Profiler primero y aplicalos en los bordes (filas virtualizadas, charts pesados, items de lista puros).',
    tags: ['useMemo', 'useCallback', 'React.memo', 'performance'],
  },
  {
    id: 'th-react-06',
    category: 'react',
    difficulty: 'mid',
    question: 'Pusiste user, theme y cart en un solo Context. El checkout se siente lento. ¿Qué pasó y cómo lo refactorizás?',
    hints: ['¿El value es un objeto nuevo en cada render?'],
    answer:
      'Un único context con un value grande fuerza a TODOS los consumidores a re-renderizar cuando cambia cualquier slice, aunque un componente solo use `theme`. Y si el provider hace `value={{ user, theme, cart }}` inline, crea un objeto nuevo en cada render y re-renderiza a todos igual. Fix: separar contexts por frecuencia de cambio (ThemeContext, AuthContext, CartContext), o usar un store por selectores (Zustand, Redux Toolkit) para suscribirse solo a slices. Para el carrito, colocar el estado cerca del checkout o usar `useSyncExternalStore`. Mido con el Profiler antes/después y documento la regla: "estado de alta rotación no vive junto al theme estático".',
    tags: ['context', 'performance', 'architecture'],
  },
  {
    id: 'th-react-07',
    category: 'react',
    difficulty: 'senior',
    question: 'Los usuarios dicen que un dashboard está "lento". ¿Cómo diagnosticás y arreglás sin adivinar?',
    hints: ['Medí primero: React Profiler, Performance tab, network waterfall.'],
    answer:
      'Arranco con evidencia: React DevTools Profiler (qué componentes re-renderizan y cuánto dura el commit), Chrome Performance (long tasks, layout thrash) y Network (waterfall, tamaño de payload). Pregunto qué significa "lento": TTI, demora en interacción o jank al scrollear. Fixes por capa: (1) Datos — refetch por closures stale, falta de cache keys, N+1; dedupe con React Query/SWR, paginar, prefetch. (2) Render — context que difunde de más, props inestables; separo context, memoizo solo donde el Profiler lo prueba, virtualizo listas largas. (3) Bundle — code splitting por ruta. Entrego UNA mejora medible, re-perfilo y documento el antes/después. Evito `memo` por todos lados sin datos.',
    tags: ['performance', 'profiling', 'situational'],
  },
  {
    id: 'th-react-08',
    category: 'react',
    difficulty: 'senior',
    question:
      'Explicá las features concurrentes de React 18 (transitions, Suspense) en términos que un dev mid entienda. ¿Cuándo usás `useTransition`?',
    hints: ['Updates urgentes vs no urgentes.'],
    answer:
      'El render concurrente permite a React interrumpir y reanudar trabajo para que los updates urgentes (tipear, clickear) sigan respondiendo mientras los pesados (filtrar una lista grande, transición de ruta) esperan. `useTransition` marca updates como no urgentes: `const [pending, startTransition] = useTransition(); startTransition(() => setFilter(q))` mantiene el input fluido mientras la vista filtrada se pone al día. `Suspense` declara límites de carga para componentes lazy o data (con loaders compatibles). Uso transitions cuando tipear dispara un re-filtrado/re-render caro, en cambios de tab o visualizaciones — no en cada `setState`. Sigue siendo complemento de buena arquitectura y caching, no reemplazo.',
    tags: ['concurrent', 'useTransition', 'Suspense'],
  },
  {
    id: 'th-react-09',
    category: 'react',
    difficulty: 'senior',
    question:
      'Una lista renderiza 2.000 filas y el scroll trabaja. El PM dice "usá paginación". ¿Qué implementás y qué le explicás al PM?',
    hints: ['Virtualización vs paginación resuelven problemas distintos.'],
    answer:
      'Técnicamente: virtualizo la lista (`@tanstack/react-virtual`, `react-window`) para que solo existan ~20 nodos DOM; mantengo las filas memoizadas y evito estilos/objetos inline por fila. Si la altura varía, la mido o estimo. La paginación ayuda a la carga del server y a la carga cognitiva, pero no arregla renderizar 2.000 nodos si igual los montás todos en una página. Al PM: "la paginación cambia la UX y puede molestar a power users; la virtualización mantiene el scroll infinito y elimina el jank. Podemos combinar: virtual scroll en el cliente y paginación en el server para los datos". Agrego skeletons, preservo la posición de scroll al filtrar, y verifico con el panel Performance.',
    tags: ['virtualization', 'lists', 'performance'],
  },
  {
    id: 'th-react-10',
    category: 'react',
    difficulty: 'mid',
    question: '¿Qué es un custom hook? ¿Cuándo extraés lógica a uno y qué reglas seguís al diseñarlo?',
    hints: ['Reutilización de lógica con estado, no de UI.'],
    answer:
      'Un custom hook es una función que empieza con `use` y compone otros hooks para encapsular lógica con estado reutilizable (fetching, suscripciones, formularios, timers). Extraigo a un hook cuando la misma lógica aparece en 2+ componentes o cuando un componente mezcla demasiadas responsabilidades. Reglas de diseño: respetar las reglas de hooks; recibir inputs por parámetros y exponer una API clara (estado + acciones); no devolver JSX (eso es un componente); mantenerlo testeable con `renderHook`; y limpiar efectos internos. Ejemplo: `useDebouncedValue`, `useFetch`, `useLocalStorage`. Comparten lógica, no markup — para markup uso composición de componentes.',
    tags: ['custom-hooks', 'reuse', 'architecture'],
  },
  {
    id: 'th-react-11',
    category: 'react',
    difficulty: 'junior',
    question: '¿Por qué React necesita una `key` única en las listas? ¿Qué pasa si usás el índice del array como key?',
    hints: ['Reconciliación: cómo React identifica qué elemento cambió.'],
    answer:
      'La `key` le permite a React identificar cada elemento entre renders durante la reconciliación, para reusar/mover/remover el nodo correcto en vez de recrear todo. Si la lista es estática y nunca reordena ni inserta en el medio, el índice funciona. Pero si insertás, borrás o reordenás, el índice como key hace que React asocie el estado/DOM equivocado al elemento: inputs que conservan el valor de otra fila, animaciones rotas, checkboxes que se "mueven". La key correcta es un id estable del dato. Regla: índice solo en listas inmutables y sin estado por item.',
    tags: ['keys', 'reconciliation', 'lists'],
  },
  {
    id: 'th-react-12',
    category: 'react',
    difficulty: 'senior',
    question: '¿Cómo manejás data fetching en React moderno? Comparálo con hacerlo a mano en `useEffect`.',
    hints: ['React Query/SWR vs useEffect + useState.'],
    answer:
      'El patrón manual (`useEffect` + `useState` para data/loading/error) funciona pero te obliga a reimplementar cache, dedupe, reintentos, invalidación, refetch en focus y manejo de race conditions (request viejo que pisa al nuevo). Por eso uso React Query (TanStack) o SWR: dan cache por key, deduplicación, estados de loading/error, stale-while-revalidate, paginación/infinite y mutaciones con invalidación. Reservo `useEffect` para efectos no relacionados a fetch o casos triviales. Si igual hago fetch manual, cancelo con `AbortController`, manejo el unmount y evito setState sobre componentes desmontados. Con Server Components/Next, muevo el fetch al server cuando puedo.',
    tags: ['data-fetching', 'react-query', 'useEffect'],
  },

  // ──────────────────────────────────────────────────────────────────
  // React Native
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-rn-01',
    category: 'react-native',
    difficulty: 'mid',
    question: '¿Cómo funciona el "bridge" en React Native y qué cambia con la nueva arquitectura (JSI, Fabric, TurboModules)?',
    hints: ['Comunicación JS ↔ nativo, serialización, asincronía.'],
    answer:
      'En la arquitectura clásica, el código JS corre en un hilo aparte y se comunica con el lado nativo por el "bridge": mensajes serializados a JSON, asíncronos y por lotes. Eso genera cuellos de botella cuando hay mucho tráfico (listas grandes, animaciones, gestos). La nueva arquitectura reemplaza el bridge por JSI (JavaScript Interface), que permite a JS tener referencias directas a objetos nativos y llamadas síncronas sin serializar. Sobre JSI: Fabric (nuevo renderer, más eficiente y con render concurrente) y TurboModules (módulos nativos cargados lazy y con typing vía Codegen). Resultado: menos overhead, startup más rápido y mejor interop. En la entrevista alcanza con explicar el problema del bridge y qué resuelve JSI.',
    tags: ['bridge', 'jsi', 'fabric', 'architecture'],
    reportedByG2i: true,
    sourceNote: 'G2i históricamente vetea muchos devs React Native; la arquitectura RN aparece en reportes de su proceso.',
  },
  {
    id: 'th-rn-02',
    category: 'react-native',
    difficulty: 'mid',
    question: '¿Cuál es la diferencia entre `FlatList` y `ScrollView`? ¿Cuándo cada una y cómo optimizás listas largas?',
    hints: ['Renderizado perezoso vs renderizar todo.'],
    answer:
      '`ScrollView` renderiza TODOS sus hijos de una, así que solo sirve para contenido chico y acotado. `FlatList` (y `SectionList`) virtualiza: solo monta los items visibles y recicla, ideal para listas largas o data remota. Para optimizar `FlatList`: dar `keyExtractor` estable, memoizar `renderItem` y los items (`React.memo`), usar `getItemLayout` cuando la altura es fija (evita medir), ajustar `windowSize`/`initialNumToRender`/`maxToRenderPerBatch`, evitar funciones inline en props, y usar `removeClippedSubviews` con cuidado. Para casos extremos, FlashList de Shopify. Evito anidar listas virtualizadas en ScrollView.',
    tags: ['flatlist', 'performance', 'lists'],
  },
  {
    id: 'th-rn-03',
    category: 'react-native',
    difficulty: 'senior',
    question: '¿Por qué las animaciones a veces tironean en React Native y cómo usás Reanimated o `useNativeDriver` para resolverlo?',
    hints: ['JS thread vs UI thread.'],
    answer:
      'El tironeo aparece cuando la animación depende del hilo de JS y este está ocupado (renders, lógica), perdiendo frames. La `Animated` API con `useNativeDriver: true` envía la animación al hilo nativo/UI, que sigue corriendo a 60fps aunque JS esté trabado — pero solo aplica a props no relacionadas al layout (transform, opacity), no a width/height/top. Reanimated (v2/v3) va más allá: corre "worklets" directamente en el UI thread vía JSI, permitiendo animaciones y gestos complejos (con Gesture Handler) sin cruzar el bridge en cada frame. Regla: animar transform/opacity con native driver/Reanimated, evitar animar layout, y mantener el JS thread liviano.',
    tags: ['animations', 'reanimated', 'performance'],
  },

  // ──────────────────────────────────────────────────────────────────
  // CSS / HTML
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-css-01',
    category: 'css-html',
    difficulty: 'junior',
    question: 'Explicá el box model y la diferencia entre `box-sizing: content-box` y `border-box`.',
    hints: ['Content, padding, border, margin.'],
    answer:
      'El box model define que cada elemento es una caja con: content (contenido), padding (relleno interno), border (borde) y margin (espacio externo). Con `content-box` (default), `width` aplica solo al contenido y padding/border se SUMAN al ancho total → un `width: 200px` con padding 20 mide 240px. Con `border-box`, `width` incluye content + padding + border → 200px es 200px reales, mucho más predecible para layouts. Por eso es práctica común aplicar `* { box-sizing: border-box }` globalmente.',
    tags: ['box-model', 'box-sizing', 'fundamentals'],
  },
  {
    id: 'th-css-02',
    category: 'css-html',
    difficulty: 'mid',
    question: '¿Cuándo usás Flexbox y cuándo CSS Grid? Dá un ejemplo de cada uno.',
    hints: ['Una dimensión vs dos dimensiones.'],
    answer:
      'Flexbox es para layouts de UNA dimensión (una fila o una columna): navbars, toolbars, alinear y distribuir items con `justify-content`/`align-items`, o repartir espacio con `flex-grow`. Grid es para DOS dimensiones (filas y columnas a la vez): layouts de página, galerías, dashboards con áreas. Ejemplo Flex: una barra con logo a la izquierda y acciones a la derecha (`display:flex; justify-content:space-between`). Ejemplo Grid: una grilla de cards responsiva (`display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`). Se combinan: Grid para el esqueleto, Flex dentro de cada celda.',
    tags: ['flexbox', 'grid', 'layout'],
  },
  {
    id: 'th-css-03',
    category: 'css-html',
    difficulty: 'mid',
    question: 'Explicá la especificidad en CSS y por qué `!important` suele ser una mala señal.',
    hints: ['Inline > id > clase > elemento.'],
    answer:
      'La especificidad decide qué regla gana cuando varias apuntan al mismo elemento. Se calcula por categorías (de mayor a menor peso): estilos inline, luego ids, luego clases/atributos/pseudo-clases, luego elementos/pseudo-elementos. A igual especificidad, gana la última declarada (orden en la cascada). `!important` saltea todo esto, por eso suele ser un parche que esconde un problema de arquitectura de estilos y desata "guerras de !important" difíciles de mantener. Mejor: bajar especificidad, usar convenciones (BEM) o scoping (CSS Modules, utilidades como Tailwind) para que ganar no dependa de pelear especificidad.',
    tags: ['specificity', 'cascade', 'maintainability'],
  },

  // ──────────────────────────────────────────────────────────────────
  // Testing
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-test-01',
    category: 'testing',
    difficulty: 'mid',
    question: '¿Cómo testeás un componente React con React Testing Library? ¿Qué filosofía sigue frente a Enzyme?',
    hints: ['Testear como lo usa el usuario, no detalles de implementación.'],
    answer:
      'React Testing Library promueve testear el comportamiento observable: buscás elementos por rol/label/texto (como un usuario), interactuás con `userEvent` y asertás sobre lo que se ve, no sobre state interno ni instancias. A diferencia de Enzyme (que permitía inspeccionar state y métodos privados), RTL evita acoplarte a la implementación, así el test no se rompe al refactorizar. Patrón típico: render → query (`getByRole`, `findByText`) → act (`await userEvent.click`) → assert. Para fetch, mockeo con MSW o `jest.fn`. Cubro happy path, estado de error y una interacción del usuario.',
    tags: ['testing-library', 'jest', 'philosophy'],
    reportedByG2i: true,
    sourceNote: 'Algunos ejercicios de live coding reportados de G2i piden agregar tests al componente.',
  },
  {
    id: 'th-test-02',
    category: 'testing',
    difficulty: 'junior',
    question: '¿Cuál es la diferencia entre un unit test, un integration test y un e2e test? ¿Qué proporción usás?',
    hints: ['Pirámide de testing.'],
    answer:
      'Unit: prueba una unidad aislada (función, hook, componente) con dependencias mockeadas; rápido y específico. Integration: prueba varias piezas juntas (componente + store + service mockeado) verificando que colaboran bien. E2E: prueba el flujo completo en un navegador real (Cypress, Playwright), lento pero realista. La "pirámide" clásica sugiere muchos unit, menos integration y pocos e2e; en front moderno se habla más de un "trofeo" con peso fuerte en integration (RTL) porque dan más confianza por test. Lo importante: cubrir caminos críticos de negocio con e2e y el resto con integration/unit según riesgo.',
    tags: ['testing-pyramid', 'strategy'],
  },

  // ──────────────────────────────────────────────────────────────────
  // Diseño / Arquitectura
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-sd-01',
    category: 'system-design',
    difficulty: 'senior',
    question: '¿Cómo estructurarías una app React mediana/grande? Hablá de carpetas, capa de estado y límites entre módulos.',
    hints: ['Feature-based vs type-based, separación de capas.'],
    answer:
      'Prefiero estructura por features/dominio sobre la clásica por tipo (todos los components juntos, todos los hooks juntos), porque escala mejor: cada feature agrupa sus componentes, hooks, services y tests, y expone una API pública via un index. Capa de estado: server state con React Query (cache, invalidación), client/UI state con Zustand o context acotado, y URL como estado cuando aplica (filtros). Una capa fina de services para llamadas HTTP, separada de la UI. Límites claros: la UI no llama fetch directo, los tipos de dominio se mapean en el borde, y evito imports cruzados entre features (solo via su API pública). Agrego code splitting por ruta y un design system/components compartidos.',
    tags: ['architecture', 'folder-structure', 'state-management'],
  },
  {
    id: 'th-sd-02',
    category: 'system-design',
    difficulty: 'mid',
    question: '¿Cómo manejás autenticación en una SPA? Comparál JWT en localStorage vs cookies httpOnly.',
    hints: ['XSS, CSRF, refresh tokens.'],
    answer:
      'JWT en localStorage es simple pero vulnerable a XSS: cualquier script inyectado puede leer el token. Las cookies httpOnly no son accesibles desde JS (mitigan XSS) pero son susceptibles a CSRF, así que necesitás `SameSite=Lax/Strict` y/o tokens anti-CSRF. Patrón robusto: access token de vida corta + refresh token en cookie httpOnly, renovando en silencio; el backend valida y rota. En el cliente manejo 401 con un interceptor que intenta refresh y, si falla, desloguea. Nunca guardo secretos en el bundle. En la entrevista lo importante es nombrar el trade-off XSS vs CSRF y por qué httpOnly + short-lived tokens suele ser lo preferido.',
    tags: ['auth', 'security', 'jwt', 'cookies'],
  },
  {
    id: 'th-sd-03',
    category: 'system-design',
    difficulty: 'senior',
    question: 'Diseñá la estrategia de rendering para una app Next.js: ¿cuándo SSR, SSG, ISR o CSR?',
    hints: ['SEO, frescura de datos, costo de cómputo.'],
    answer:
      'Elijo por necesidad de SEO, frescura y costo: SSG (build time) para contenido estático o casi estático (landing, docs, blog) — máximo rendimiento y cacheable en CDN. ISR para contenido que cambia con baja frecuencia y querés revalidar sin rebuild completo (catálogo, precios cada N min). SSR (request time) cuando el contenido es personalizado o muy fresco y necesitás SEO (dashboard público, resultados de búsqueda). CSR para zonas privadas detrás de login donde el SEO no importa y querés interactividad (panel de usuario). Con el App Router, lo combino con Server Components por defecto y Client Components donde hay interacción, y uso streaming/Suspense para mejorar el TTFB percibido.',
    tags: ['nextjs', 'rendering', 'ssr', 'ssg', 'isr'],
  },

  // ──────────────────────────────────────────────────────────────────
  // Soft skills
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'th-soft-01',
    category: 'softskills',
    difficulty: 'mid',
    question: 'Contame de un bug difícil que resolviste en producción. ¿Cómo lo abordaste?',
    hints: ['Estructura: contexto, impacto, diagnóstico, fix, prevención.'],
    answer:
      'Respondé con estructura tipo STAR adaptada a debugging: (1) Contexto e impacto — qué fallaba, a cuántos usuarios afectaba, cómo me enteré (alertas, reporte). (2) Diagnóstico — cómo reproduje, qué hipótesis tuve, qué herramientas usé (logs, Sentry, DevTools, git bisect) para aislar la causa raíz en vez de adivinar. (3) Fix — la solución mínima segura y por qué, no un parche. (4) Prevención — test de regresión, alerta, o cambio de proceso para que no vuelva a pasar. G2i valora el razonamiento y la comunicación: mostrá calma bajo presión y que pensás en el equipo y el usuario, no solo en el código.',
    tags: ['debugging', 'storytelling', 'communication'],
    reportedByG2i: true,
    sourceNote: 'G2i evalúa explícitamente comunicación y experiencia real construyendo apps en producción.',
  },
  {
    id: 'th-soft-02',
    category: 'softskills',
    difficulty: 'senior',
    question:
      'Un PM pide una feature grande "para el viernes" sobre una base sin tests y scope poco claro. ¿Cómo respondés en la reunión y después?',
    hints: ['No rechazar de plano ni aceptar en silencio: negociar scope, riesgo y milestones.'],
    answer:
      'En la reunión: reconozco el objetivo de negocio, hago preguntas (MVP vs visión completa, quién lo usa, métrica de éxito), expongo restricciones con honestidad ("el viernes es posible para esta tajada angosta; la versión completa necesita más") y propongo opciones: scope reducido, entrega por fases, o ayuda extra. Nombro el riesgo de saltar tests en caminos críticos. Después: mando un resumen escrito — scope acordado, lo que queda afuera, supuestos y fecha de un incremento demostrable. Si hay muchas incógnitas, propongo un spike. La señal senior: protejo al equipo sin ser un bloqueante, hago los trade-offs explícitos para que el PM pueda escalar con datos, y prometo un plan, no milagros.',
    tags: ['pm', 'scope', 'communication'],
  },
  {
    id: 'th-soft-03',
    category: 'softskills',
    difficulty: 'mid',
    question: '¿Cómo revisás un pull request? ¿Qué mirás primero y cómo das feedback que aterrice?',
    hints: ['Correctitud, legibilidad, tests, perf/seguridad — priorizado por riesgo.'],
    answer:
      'Orden: (1) entender la intención — leo descripción/ticket y dimensiono el diff. (2) Correctitud y edge cases — nulls, caminos de error, race conditions. (3) Diseño/API — naming, límites, duplicación. (4) Tests — casos significativos, no ruido de snapshots. (5) Performance/seguridad solo donde aplica (N+1, XSS, auth). (6) Nits al final o automatizados con lint. Feedback: específico, amable, con alternativas ("considerá extraer X porque..."), distinguiendo bloqueantes de opcionales, y elogiando buenos patrones. Si el PR es enorme, pido dividirlo. Si me falta contexto, pregunto en vez de asumir. El objetivo es propiedad compartida, no ganar debates.',
    tags: ['code-review', 'teamwork'],
  },
  {
    id: 'th-soft-04',
    category: 'softskills',
    difficulty: 'junior',
    question: '¿Cómo es tu experiencia trabajando en equipos remotos/distribuidos y en inglés? (típico filtro inicial de G2i)',
    hints: ['Comunicación async, documentación, zonas horarias.'],
    answer:
      'G2i conecta devs con empresas (muchas de EE.UU.) para trabajo remoto, así que esperan soltura en inglés y autonomía. Respondé concreto: cómo comunicás de forma asíncrona (mensajes claros con contexto, no "tengo una duda" a secas), cómo documentás decisiones (PRs descriptivos, ADRs, Loom), cómo manejás diferencias horarias (overlap acordado, dejar todo desbloqueado al cerrar el día), y cómo pedís ayuda sin bloquearte (timebox antes de preguntar). Mostrá proactividad y ownership: en remoto se valora que avances solo, comuniques progreso y no requieras supervisión constante.',
    tags: ['remote', 'communication', 'english'],
    reportedByG2i: true,
    sourceNote: 'El screening inicial de G2i incluye una charla no técnica que evalúa inglés y experiencia remota.',
  },
]

export const g2iTheoryCategories: G2iTheoryCategory[] = [
  'javascript',
  'typescript',
  'react',
  'react-native',
  'css-html',
  'testing',
  'system-design',
  'softskills',
]
