export const sanityInterviewTitle = 'Sanity CMS Engineer — initial call assessment'

export const sanityInterviewFormatSummary = [
  'Live and recorded during the initial call with the client.',
  'Theory-focused: Sanity CMS engineering (schema, GROQ, Studio, front-end integration).',
  'The interviewer shares the assessment during the call — you complete it live.',
  'Typically 10 questions; the client receives feedback on your answers after the call.',
]

export const sanityInterviewProcedure = [
  'Introduce yourself at the beginning: name, role, relevant Sanity / headless CMS experience.',
  'Confirm you can see the shared assessment and ask clarifying questions if a prompt is ambiguous.',
  'Think out loud: explain schema choices, query tradeoffs, and how content reaches production.',
  'If stuck, describe how you would look it up (Sanity docs, schema, Vision plugin) — stay structured.',
  'Leave time to double-check GROQ syntax and naming consistency before submitting each answer.',
]

export const sanityIntroTemplate = `Hi, I'm [name], a [role] with [X years] building headless CMS solutions. I've worked with Sanity on [project types — marketing site, e-commerce, etc.]: defining schemas in Studio, writing GROQ queries, integrating with Next.js, and setting up preview/webhooks. Happy to walk through the assessment — should I introduce my approach briefly before each answer or answer directly?`

export const sanityPrepResources = [
  {
    title: 'Sanity documentation',
    url: 'https://www.sanity.io/docs',
    description: 'Schema types, GROQ, Studio, and HTTP API reference.',
  },
  {
    title: 'GROQ cheat sheet',
    url: 'https://www.sanity.io/docs/groq',
    description: 'Query syntax, filters, projections, and parameters.',
  },
  {
    title: 'Next.js + Sanity',
    url: 'https://www.sanity.io/plugins/next-sanity',
    description: 'Official integration patterns for App Router and preview.',
  },
]
