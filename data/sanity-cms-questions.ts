export type SanityQuestion = {
  id: string
  category: 'fundamentals' | 'schema' | 'groq' | 'studio' | 'nextjs' | 'content-ops'
  difficulty: 'junior' | 'mid' | 'senior'
  question: string
  hints?: string[]
  answer: string
  tags: string[]
}

export const sanityQuestionCategories = [
  'fundamentals',
  'schema',
  'groq',
  'studio',
  'nextjs',
  'content-ops',
] as const

export const SANITY_CATEGORY_LABEL: Record<SanityQuestion['category'], string> = {
  fundamentals: 'Fundamentals',
  schema: 'Schema & content model',
  groq: 'GROQ',
  studio: 'Sanity Studio',
  nextjs: 'Next.js integration',
  'content-ops': 'Ops & delivery',
}

export const sanityCmsQuestions: SanityQuestion[] = [
  {
    id: 'sanity-01',
    category: 'fundamentals',
    difficulty: 'junior',
    question: 'What is Sanity, and how does it differ from a traditional monolithic CMS like WordPress?',
    hints: [
      'Headless / API-first',
      'Content Lake vs page builder',
      'Developers own the front end',
    ],
    answer:
      'Sanity is a headless, API-first CMS: content is stored in the Content Lake and delivered as JSON via APIs (GROQ/HTTP). Editors use Sanity Studio; developers choose any front end (React, Next.js, etc.). Unlike WordPress, Sanity does not own routing, templates, or theme rendering — it focuses on structured content, real-time collaboration, and developer-defined schemas.',
    tags: ['headless', 'content-lake'],
  },
  {
    id: 'sanity-02',
    category: 'schema',
    difficulty: 'mid',
    question: 'How do you define a document type in Sanity schema? Explain `name`, `type`, and `fields`.',
    hints: ['schemaTypes array', 'field types: string, text, reference, array', 'validation rules'],
    answer:
      'Document types are defined in schema files exported as `schemaTypes`. Each type has `name` (schema id), `title`, `type: "document"`, and `fields[]`. Each field has `name`, `type` (string, slug, image, reference, array, block…), optional `validation`, `options`, and `initialValue`. Example: a `post` document with `title`, `slug`, `body` (block content), and `author` reference. Schema drives Studio UI and the shape of stored JSON documents.',
    tags: ['schema', 'document-types'],
  },
  {
    id: 'sanity-03',
    category: 'schema',
    difficulty: 'mid',
    question: 'What is a reference field, and how would you model a blog post with an author and categories?',
    hints: ['reference vs embedding', 'weak references', '_ref in stored JSON'],
    answer:
      'A `reference` field points to another document by `_ref` (stored as `{ _type: "reference", _ref: "<id>" }`). A post might reference one `author` document and an array of `category` references. GROQ uses `->` to dereference. Prefer references for reusable entities (authors, categories); embed small structs when you need duplication or offline snapshots. Use `weak: true` only when orphaned refs are acceptable.',
    tags: ['references', 'content-model'],
  },
  {
    id: 'sanity-04',
    category: 'groq',
    difficulty: 'mid',
    question: 'Write a GROQ query that fetches the 10 most recent published posts with title, slug, and dereferenced author name.',
    hints: ['*[_type == "post"]', 'order(_createdAt desc)', 'author->{name}', 'projection {...}'],
    answer:
      '```groq\n*[_type == "post" && defined(slug.current)] | order(_updatedAt desc)[0...10] {\n  title,\n  "slug": slug.current,\n  "authorName": author->name\n}\n```\nExplain filters (`defined`, draft exclusion in production), ordering, slice syntax `[0...10]`, and projection. In production you often also filter `!(_id in path("drafts.**"))` or use the CDN perspective that excludes drafts.',
    tags: ['groq', 'projections'],
  },
  {
    id: 'sanity-05',
    category: 'groq',
    difficulty: 'senior',
    question: 'How do parameters work in GROQ, and why are they important for security and performance?',
    hints: ['$slug in query', 'client.fetch(query, { slug })', 'avoid string concatenation'],
    answer:
      'GROQ supports parameters like `$slug` passed as a separate object to `client.fetch(query, params)`. They prevent injection, enable query caching/CDN cache keys, and avoid rebuilding query strings. Example: `*[_type=="post" && slug.current == $slug][0]` with `{ slug: "hello-world" }`. Never interpolate user input directly into query strings.',
    tags: ['groq', 'parameters', 'security'],
  },
  {
    id: 'sanity-06',
    category: 'studio',
    difficulty: 'mid',
    question: 'What is Portable Text, and how do you render it in a React front end?',
    hints: ['block content', '@portabletext/react', 'custom components for marks/types'],
    answer:
      'Portable Text is Sanity\'s JSON-rich text format (blocks, spans, marks, custom block types). In React, use `@portabletext/react` with `<PortableText value={body} components={...} />` to map block types (images, CTAs) and marks (links, strong). Studio schema defines allowed block styles and custom objects in `body` fields. This separates content structure from presentation.',
    tags: ['portable-text', 'react'],
  },
  {
    id: 'sanity-07',
    category: 'studio',
    difficulty: 'mid',
    question: 'How can you customize Sanity Studio for editors (structure, previews, custom inputs)?',
    hints: ['structureTool', 'desk structure', 'preview.prepare', 'custom React components'],
    answer:
      'Use `structureTool` (or legacy desk structure) to organize lists, filters, and singletons. Field-level: `components.input`, `options`, `validation`, `preview: { select, prepare }` for relationship cards. Plugins add media, SEO, dashboards. Goal: reduce editor errors with validation, previews that mirror the site, and navigation that matches the content model — not expose raw schema complexity.',
    tags: ['studio', 'editor-experience'],
  },
  {
    id: 'sanity-08',
    category: 'nextjs',
    difficulty: 'mid',
    question: 'How do you integrate Sanity with Next.js App Router for static and preview content?',
    hints: ['@sanity/client', 'next-sanity', 'draftMode', 'revalidateTag / webhook'],
    answer:
      'Use `@sanity/client` or `next-sanity` with projectId, dataset, apiVersion. Fetch in Server Components with GROQ; cache with `fetch` options or `sanityFetch` helpers. For previews: enable Next.js `draftMode()`, use a token with read access to drafts, and a `/api/draft` route. On publish, trigger revalidation via Sanity webhook → `/api/revalidate` with secret + tag/path. Separate read client (CDN) vs preview client (authenticated, no CDN for drafts).',
    tags: ['nextjs', 'preview', 'isr'],
  },
  {
    id: 'sanity-09',
    category: 'nextjs',
    difficulty: 'senior',
    question: 'How do you build image URLs from Sanity image assets? Mention hotspot and crop.',
    hints: ['@sanity/image-url', 'urlFor(image)', 'fit, width, format'],
    answer:
      'Stored images include `asset._ref` plus optional `hotspot` and `crop` metadata from Studio. Use `@sanity/image-url` (`createImageUrlBuilder(client).image(source).width(800).auto("format").url()`). Hotspot/crop preserve art direction when resizing. Serve via Sanity CDN; use `srcSet` in Next.js `<Image>` with computed widths for responsive layouts.',
    tags: ['images', 'cdn'],
  },
  {
    id: 'sanity-10',
    category: 'content-ops',
    difficulty: 'mid',
    question: 'What happens when content is published in Sanity, and how can the front end stay in sync?',
    hints: ['webhooks', 'ISR revalidation', 'listen API / live preview'],
    answer:
      'Publish writes the document to the Content Lake and triggers CDN invalidation. Front ends sync via: webhooks calling revalidate endpoints, periodic ISR, client-side listeners (`@sanity/client` listen) for live preview, or on-demand `revalidateTag`. For marketing sites, webhook + tag-based revalidation is common; for preview, use draft mode and live queries.',
    tags: ['webhooks', 'revalidation'],
  },
  {
    id: 'sanity-11',
    category: 'content-ops',
    difficulty: 'senior',
    question: 'How do roles, datasets, and environments typically fit into a Sanity project workflow?',
    hints: ['production vs development dataset', 'CORS origins', 'token scopes'],
    answer:
      'A project has one or more datasets (`production`, `development`). Studio and API tokens are scoped to dataset + permissions (read/write, draft access). Use separate datasets or projects for staging; restrict write tokens to CI/Studio only; read CDN tokens on the public site. Configure CORS for Studio and front-end origins. Document migration with `sanity dataset copy` or structured import/export for schema changes.',
    tags: ['datasets', 'tokens', 'environments'],
  },
  {
    id: 'sanity-12',
    category: 'fundamentals',
    difficulty: 'senior',
    question: 'When would you choose embedded objects vs references vs singleton documents in a content model?',
    hints: ['reuse', 'editor UX', 'query complexity', 'page settings singleton'],
    answer:
      'References: reusable entities queried across pages (author, product). Embedded objects: value objects owned by one document (SEO block, hero CTA) — fewer joins, but duplicated if reused. Singletons: one global doc (`siteSettings`) edited in a fixed Studio structure entry. Balance editor clarity, query cost (dereference depth), and migration flexibility — over-normalizing hurts Studio UX; under-normalizing hurts reuse.',
    tags: ['content-model', 'architecture'],
  },
]

export const sanityAssessmentQuestionCount = 10

export function pickSanityAssessmentQuestions(count = sanityAssessmentQuestionCount): SanityQuestion[] {
  const pool = [...sanityCmsQuestions]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}
