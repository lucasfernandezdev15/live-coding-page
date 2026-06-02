const DEFAULT_MODEL = 'gemini-2.0-flash'

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || undefined
}

function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
}

function extractGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
  const parts = candidates?.[0]?.content?.parts
  if (!parts?.length) return ''
  return parts.map((p) => p.text ?? '').join('')
}

function parseSseChunk(buffer: string): { remainder: string; texts: string[] } {
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
      // ignore malformed SSE lines
    }
  }

  return { remainder, texts }
}

export async function streamGeminiHint(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<ReadableStream<Uint8Array>> {
  const model = getGeminiModel()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.6,
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Gemini API error ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Gemini API returned no body')
  }

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
          const { remainder, texts } = parseSseChunk(buffer)
          buffer = remainder
          for (const text of texts) {
            controller.enqueue(encoder.encode(text))
          }
        }
        if (buffer.trim()) {
          const { texts } = parseSseChunk(`${buffer}\n`)
          for (const text of texts) {
            controller.enqueue(encoder.encode(text))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
