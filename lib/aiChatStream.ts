import Anthropic from '@anthropic-ai/sdk'
import { getGeminiApiKey } from '@/lib/geminiHint'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatStreamSource = 'anthropic' | 'gemini'

function extractGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
  const parts = candidates?.[0]?.content?.parts
  if (!parts?.length) return ''
  return parts.map((p) => p.text ?? '').join('')
}

function parseGeminiSse(buffer: string): { remainder: string; texts: string[] } {
  const texts: string[] = []
  const lines = buffer.split('\n')
  const remainder = lines.pop() ?? ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const jsonStr = trimmed.slice(5).trim()
    if (!jsonStr || jsonStr === '[DONE]') continue
    try {
      const text = extractGeminiText(JSON.parse(jsonStr))
      if (text) texts.push(text)
    } catch {
      // ignore malformed SSE
    }
  }

  return { remainder, texts }
}

async function streamGeminiChat(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<ReadableStream<Uint8Array>> {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Gemini API error ${response.status}`)
  }

  if (!response.body) throw new Error('Gemini API returned no body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const { remainder, texts } = parseGeminiSse(buffer)
          buffer = remainder
          for (const text of texts) controller.enqueue(encoder.encode(text))
        }
        if (buffer.trim()) {
          const { texts } = parseGeminiSse(`${buffer}\n`)
          for (const text of texts) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

async function streamAnthropicChat(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<ReadableStream<Uint8Array>> {
  const anthropic = new Anthropic({ apiKey })
  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  })
  return stream.toReadableStream()
}

export async function streamInterviewChat(
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens = 1200,
): Promise<{ stream: ReadableStream<Uint8Array>; source: ChatStreamSource }> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (anthropicKey) {
    const stream = await streamAnthropicChat(anthropicKey, systemPrompt, messages, maxTokens)
    return { stream, source: 'anthropic' }
  }

  const geminiKey = getGeminiApiKey()
  if (geminiKey) {
    const stream = await streamGeminiChat(geminiKey, systemPrompt, messages, maxTokens)
    return { stream, source: 'gemini' }
  }

  throw new Error('Missing ANTHROPIC_API_KEY or GEMINI_API_KEY. Add one in .env.local or Vercel.')
}
