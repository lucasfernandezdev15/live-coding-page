import { streamInterviewChat, type ChatMessage } from '@/lib/aiChatStream'
import { buildInterviewerSystemPrompt } from '@/lib/g2iInterviewerPrompt'

export async function POST(req: Request) {
  try {
    const { messages, answersGiven } = (await req.json()) as {
      messages?: ChatMessage[]
      answersGiven?: number
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid request payload', { status: 400 })
    }

    const valid = messages.every(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )

    if (!valid) {
      return new Response('Invalid message format', { status: 400 })
    }

    const answerCount = typeof answersGiven === 'number' && answersGiven >= 0 ? answersGiven : countUserAnswers(messages)
    const systemPrompt = buildInterviewerSystemPrompt(answerCount)
    const { stream, source } = await streamInterviewChat(systemPrompt, messages)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-AI-Source': source,
      },
    })
  } catch (error) {
    return new Response(`Interview AI failed: ${(error as Error).message}`, { status: 500 })
  }
}

function countUserAnswers(messages: ChatMessage[]): number {
  const userMessages = messages.filter((m) => m.role === 'user')
  if (userMessages.length === 0) return 0
  const first = userMessages[0]?.content.toLowerCase() ?? ''
  const isKickoff =
    first.includes('comenz') ||
    first.includes('start the interview') ||
    first.includes('begin the interview')
  return Math.max(0, userMessages.length - (isKickoff ? 1 : 0))
}
