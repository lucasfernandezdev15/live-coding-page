import Anthropic from '@anthropic-ai/sdk'
import { getChallengeById } from '@/lib/challenges'
import { getGeminiApiKey, streamGeminiHint } from '@/lib/geminiHint'
import { buildHintUserPrompt, HINT_SYSTEM_PROMPT } from '@/lib/hintPrompt'
import { buildLocalHintStream } from '@/lib/localHints'

function hintResponse(stream: ReadableStream<Uint8Array>, source: 'anthropic' | 'gemini' | 'local') {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Hint-Source': source,
    },
  })
}

export async function POST(req: Request) {
  try {
    const { challengeId, currentCode, hintNumber } = (await req.json()) as {
      challengeId?: string
      currentCode?: string
      hintNumber?: number
    }

    if (!challengeId || typeof currentCode !== 'string' || !hintNumber || hintNumber < 1 || hintNumber > 3) {
      return new Response('Invalid request payload', { status: 400 })
    }

    const challenge = getChallengeById(challengeId)
    if (!challenge) {
      return new Response('Challenge not found', { status: 404 })
    }

    const userPrompt = buildHintUserPrompt(challenge, currentCode, hintNumber)

    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (anthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey })
      const stream = await anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: HINT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      })
      return hintResponse(stream.toReadableStream(), 'anthropic')
    }

    const geminiKey = getGeminiApiKey()
    if (geminiKey) {
      try {
        const stream = await streamGeminiHint(geminiKey, HINT_SYSTEM_PROMPT, userPrompt)
        return hintResponse(stream, 'gemini')
      } catch (geminiError) {
        console.warn('[hint] Gemini failed, using local fallback:', (geminiError as Error).message)
      }
    }

    return hintResponse(buildLocalHintStream(challenge, hintNumber), 'local')
  } catch (error) {
    return new Response(`Hint generation failed: ${(error as Error).message}`, { status: 500 })
  }
}
