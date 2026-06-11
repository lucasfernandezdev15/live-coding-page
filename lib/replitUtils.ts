import type { CodingExercise } from '@/data/g2i-coding-exercises'

const REPLIT_TEMPLATE: Record<CodingExercise['category'], string> = {
  react: 'https://replit.com/new/react-typescript',
  typescript: 'https://replit.com/new/typescript',
  javascript: 'https://replit.com/new/nodejs',
}

export function getReplitTemplateUrl(exercise: CodingExercise): string {
  return REPLIT_TEMPLATE[exercise.category]
}

export function buildExerciseClipboardText(exercise: CodingExercise): string {
  const lines = [
    `# ${exercise.title}`,
    '',
    exercise.description,
    '',
    '## Requirements',
    ...exercise.requirements.map((r) => `- ${r}`),
    '',
    '## Starter',
    exercise.starterCode ?? '// Your code here',
  ]
  return lines.join('\n')
}

export async function copyExerciseToClipboard(exercise: CodingExercise): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildExerciseClipboardText(exercise))
    return true
  } catch {
    return false
  }
}

export function openReplitTemplate(exercise: CodingExercise): void {
  window.open(getReplitTemplateUrl(exercise), '_blank', 'noopener,noreferrer')
}
