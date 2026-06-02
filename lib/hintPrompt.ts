import type { Challenge } from '@/lib/types'

export const HINT_SYSTEM_PROMPT = `You are a coding mentor helping a developer practice for a senior frontend interview.
Your role is to give HINTS, not solutions. Be concise (2-4 sentences max).
Point them in the right direction without giving away the answer.
Adjust based on hintNumber: hint 1 = conceptual nudge, hint 2 = more specific,
hint 3 = almost a direct pointer to the exact line/approach needed.
Never show code. Never reveal the full solution.
Always respond in English.`

function truncateCode(code: string, max = 8000): string {
  if (code.length <= max) return code
  return `${code.slice(0, max)}\n... (code truncated)`
}

export function buildHintUserPrompt(challenge: Challenge, currentCode: string, hintNumber: number): string {
  return `Challenge: ${challenge.title}
Category: ${challenge.category}

Instructions the user must complete:
${challenge.instructions.join('\n')}

Current user code:
${truncateCode(currentCode)}

This is hint #${hintNumber} of 3. Give a hint appropriate for this stage.`
}
