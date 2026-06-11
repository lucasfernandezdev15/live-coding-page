export type G2iChecklistItem = {
  id: string
  label: string
  link?: { href: string; text: string; after?: string }
}

export const g2iPreInterviewChecklist: G2iChecklistItem[] = [
  { id: 'camera', label: 'Camera enabled; quiet, professional setting ready' },
  { id: 'meet', label: 'Mic and camera tested in Google Meet; headphones with mic ready' },
  {
    id: 'replit',
    label: 'Replit account created',
    link: { href: 'https://replit.com', text: 'replit.com', after: ' — used to share code live' },
  },
  { id: 'replit-practice', label: 'Practiced typing code out loud in Replit (minimal copy-paste)' },
  { id: 'projects', label: '2–3 React production project stories prepared (see below)' },
  { id: 'autocomplete', label: 'Comfortable coding with limited autocomplete, explaining as you type' },
]

export type ProjectStory = {
  id: string
  title: string
  problem: string
  role: string
  stack: string
  built: string
  challenge: string
  tradeoff: string
}

export const defaultProjectStories: ProjectStory[] = [
  { id: 'p1', title: 'Project 1', problem: '', role: '', stack: '', built: '', challenge: '', tradeoff: '' },
  { id: 'p2', title: 'Project 2', problem: '', role: '', stack: '', built: '', challenge: '', tradeoff: '' },
  { id: 'p3', title: 'Project 3', problem: '', role: '', stack: '', built: '', challenge: '', tradeoff: '' },
]

const CHECKLIST_KEY = 'g2i-prep-checklist-v1'
const STORIES_KEY = 'g2i-prep-stories-v1'

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private mode
  }
}

export function loadChecklistState(): Record<string, boolean> {
  return readJson(CHECKLIST_KEY, {})
}

export function saveChecklistItem(id: string, checked: boolean): Record<string, boolean> {
  const next = { ...loadChecklistState(), [id]: checked }
  writeJson(CHECKLIST_KEY, next)
  return next
}

export function loadProjectStories(): ProjectStory[] {
  const saved = readJson<ProjectStory[] | null>(STORIES_KEY, null)
  if (!saved?.length) return defaultProjectStories.map((s) => ({ ...s }))
  const byId = new Map(saved.map((s) => [s.id, s]))
  return defaultProjectStories.map((d) => ({ ...d, ...byId.get(d.id) }))
}

export function saveProjectStories(stories: ProjectStory[]): void {
  writeJson(STORIES_KEY, stories)
}

export function checklistProgress(checked: Record<string, boolean>): { done: number; total: number } {
  const total = g2iPreInterviewChecklist.length
  const done = g2iPreInterviewChecklist.filter((item) => checked[item.id]).length
  return { done, total }
}

export function projectStoryProgress(stories: ProjectStory[]): number {
  return stories.filter((s) => s.problem.trim() && s.built.trim() && s.challenge.trim()).length
}
