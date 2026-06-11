export const G2I_ANSWER_FRAMEWORK = [
  { step: 'Context', detail: 'What problem / constraint are we solving?' },
  { step: 'Approach', detail: 'Your solution, pattern, or mental model' },
  { step: 'Tradeoffs', detail: 'Alternatives you rejected and why' },
  { step: 'Verify', detail: 'Tests, metrics, or checks in production' },
] as const

export const G2I_ANSWER_FRAMEWORK_SHORT =
  'Context → Approach → Tradeoffs → Verify in production'
