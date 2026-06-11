'use client'

import G2iAnswerFramework from '@/components/G2iAnswerFramework'
import { useCallback, useEffect, useRef, useState } from 'react'
import { G2I_INTERVIEW_TOTAL_QUESTIONS } from '@/lib/g2iInterviewerPrompt'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onExit: () => void
}

function countAnswers(apiMessages: ChatMessage[]): number {
  const userMessages = apiMessages.filter((m) => m.role === 'user')
  if (userMessages.length === 0) return 0
  const first = userMessages[0]?.content.toLowerCase() ?? ''
  const isKickoff =
    first.includes('comenz') ||
    first.includes('start the interview') ||
    first.includes('begin the interview')
  return Math.max(0, userMessages.length - (isKickoff ? 1 : 0))
}

export default function G2iAiInterview({ onExit }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiSource, setAiSource] = useState<string | null>(null)
  const [answerCount, setAnswerCount] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const apiMessagesRef = useRef<ChatMessage[]>([])
  const startedRef = useRef(false)

  const answersGiven = answerCount
  const interviewDone = answersGiven >= G2I_INTERVIEW_TOTAL_QUESTIONS

  const syncAnswerCount = useCallback(() => {
    setAnswerCount(countAnswers(apiMessagesRef.current))
  }, [])

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  const streamAssistant = useCallback(async () => {
    const history = apiMessagesRef.current
    setLoading(true)
    setError(null)
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/g2i-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          answersGiven: countAnswers(history),
        }),
      })

      const source = response.headers.get('X-AI-Source')
      if (source) setAiSource(source)

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Error ${response.status}`)
      }

      if (!response.body) throw new Error('No stream available')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      let done = false

      while (!done) {
        const chunk = await reader.read()
        done = chunk.done
        if (chunk.value) {
          const text = decoder.decode(chunk.value, { stream: !done })
          assistantText += text
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last?.role === 'assistant') {
              next[next.length - 1] = { ...last, content: assistantText }
            }
            return next
          })
        }
      }

      apiMessagesRef.current = [...history, { role: 'assistant', content: assistantText }]
      syncAnswerCount()
    } catch (err) {
      setError((err as Error).message)
      setMessages((prev) => {
        const next = [...prev]
        if (next[next.length - 1]?.role === 'assistant' && !next[next.length - 1]?.content) {
          next.pop()
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }, [syncAnswerCount])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    apiMessagesRef.current = [{ role: 'user', content: 'Comenzá la entrevista.' }]
    void streamAssistant()
  }, [streamAssistant])

  async function sendAnswer() {
    const text = draft.trim()
    if (!text || loading || interviewDone) return

    apiMessagesRef.current = [...apiMessagesRef.current, { role: 'user', content: text }]
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')
    syncAnswerCount()
    await streamAssistant()
  }

  const displayAnswers = answerCount

  return (
    <section className="flex min-h-[70vh] flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="kicker mb-1">AI interviewer</p>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Live technical interview
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="badge">
            Answers {displayAnswers}/{G2I_INTERVIEW_TOTAL_QUESTIONS}
          </span>
          {aiSource ? <span className="tag">via {aiSource}</span> : null}
        </div>
      </div>

      <G2iAnswerFramework compact />
      <p className="mb-3 text-xs" style={{ color: 'var(--muted)' }}>
        Tip: answer out loud before typing — G2i evaluates how you communicate, not just correctness.
      </p>

      <div
        className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-lg border p-3 sm:p-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', maxHeight: '55vh' }}
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${
              message.role === 'assistant' ? 'mr-4 sm:mr-12' : 'ml-4 sm:ml-12'
            }`}
            style={{
              borderColor: message.role === 'assistant' ? 'var(--border)' : 'rgba(196, 165, 116, 0.35)',
              background: message.role === 'assistant' ? 'var(--bg-2)' : 'var(--accent-bg)',
              color: 'var(--text)',
            }}
          >
            <p className="kicker mb-1">{message.role === 'assistant' ? 'Interviewer' : 'You'}</p>
            <p className="whitespace-pre-wrap">{message.content || (loading && index === messages.length - 1 ? '…' : '')}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {error ? (
        <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          {error}
        </p>
      ) : null}

      {displayAnswers >= G2I_INTERVIEW_TOTAL_QUESTIONS && !loading ? (
        <p className="mb-3 text-sm" style={{ color: 'var(--mint)' }}>
          Interview complete. Review the final feedback above.
        </p>
      ) : null}

      {displayAnswers < G2I_INTERVIEW_TOTAL_QUESTIONS ? (
        <>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--dim)' }}>
            Your answer
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            disabled={loading}
            className="mb-3 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2"
            style={{
              borderColor: 'var(--border-2)',
              background: 'var(--bg-2)',
              color: 'var(--text)',
            }}
            placeholder="Respondé como en una entrevista real: contexto, enfoque, tradeoffs..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void sendAnswer()
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-accent" onClick={() => void sendAnswer()} disabled={loading || !draft.trim()}>
              {loading ? 'Interviewer responding…' : 'Send answer'}
            </button>
            <span className="self-center text-xs" style={{ color: 'var(--muted)' }}>
              Ctrl/Cmd+Enter to send
            </span>
          </div>
        </>
      ) : null}

      <button type="button" className="btn mt-4 self-start" onClick={onExit}>
        Exit AI interview
      </button>
    </section>
  )
}
