'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  checklistProgress,
  g2iPreInterviewChecklist,
  loadChecklistState,
  loadProjectStories,
  projectStoryProgress,
  saveChecklistItem,
  saveProjectStories,
  type ProjectStory,
} from '@/lib/g2iPrepStorage'

const STORY_FIELDS: { key: keyof ProjectStory; label: string; placeholder: string; rows: number }[] = [
  { key: 'title', label: 'Project name', placeholder: 'e.g. Customer portal redesign', rows: 1 },
  { key: 'problem', label: 'Problem / context', placeholder: 'What business or user problem did the app solve?', rows: 2 },
  { key: 'role', label: 'Your role', placeholder: 'What did you own on the team?', rows: 1 },
  { key: 'stack', label: 'Stack', placeholder: 'React, Next.js, TypeScript, state, API…', rows: 1 },
  { key: 'built', label: 'What you built', placeholder: 'Features, architecture, components, data flow…', rows: 3 },
  { key: 'challenge', label: 'Hard bug or decision', placeholder: 'Something that went wrong and how you fixed it', rows: 3 },
  { key: 'tradeoff', label: 'Tradeoff you made', placeholder: 'Why you chose approach A over B', rows: 2 },
]

export default function G2iPrepPanel() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [stories, setStories] = useState<ProjectStory[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setChecklist(loadChecklistState())
    setStories(loadProjectStories())
    setMounted(true)
  }, [])

  const { done, total } = checklistProgress(checklist)
  const storiesReady = projectStoryProgress(stories)

  const toggleCheck = useCallback((id: string, checked: boolean) => {
    setChecklist(saveChecklistItem(id, checked))
  }, [])

  const updateStory = useCallback((id: string, field: keyof ProjectStory, value: string) => {
    setStories((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      saveProjectStories(next)
      return next
    })
  }, [])

  if (!mounted) return null

  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Pre-interview checklist</h2>
          <span className="badge btn-accent">
            {done}/{total} done
          </span>
        </div>
        <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Saved in this browser. Complete before your real G2i session.
        </p>
        <ul className="space-y-3">
          {g2iPreInterviewChecklist.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  checked={Boolean(checklist[item.id])}
                  onChange={(e) => toggleCheck(item.id, e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span style={{ color: checklist[item.id] ? 'var(--muted)' : 'var(--text)' }}>
                  {item.link ? (
                    <>
                      {item.label}:{' '}
                      <a
                        href={item.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: 'var(--accent)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.link.text}
                      </a>
                      {item.link.after}
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">My React projects (STAR)</h2>
          <span className="badge btn-mint">{storiesReady}/3 ready</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          G2i evaluates production experience. Draft stories here — problem, what you built, a hard moment, and a tradeoff.
        </p>
        <div className="space-y-6">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              className="rounded-md border p-3 sm:p-4"
              style={{ borderColor: 'var(--border-2)', background: 'var(--bg-2)' }}
            >
              <p className="kicker mb-3">Story {idx + 1}</p>
              {STORY_FIELDS.map((field) => (
                <div key={field.key} className="mb-3 last:mb-0">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
                    {field.label}
                  </label>
                  {field.rows === 1 ? (
                    <input
                      type="text"
                      value={story[field.key]}
                      onChange={(e) => updateStory(story.id, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                      style={{
                        borderColor: 'var(--border-2)',
                        background: 'var(--surface)',
                        color: 'var(--text)',
                      }}
                    />
                  ) : (
                    <textarea
                      value={story[field.key]}
                      onChange={(e) => updateStory(story.id, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows}
                      className="w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2"
                      style={{
                        borderColor: 'var(--border-2)',
                        background: 'var(--surface)',
                        color: 'var(--text)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
