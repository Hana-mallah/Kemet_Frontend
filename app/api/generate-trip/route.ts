import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// The secret key must match API_SECRET_KEY set in your Railway environment variables.
// Default matches the FastAPI default: "change-secret-key-2026"
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'change-secret-key-2026'
const GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://chatgptfastapi-production.up.railway.app/v1'
const GROQ_MODEL = process.env.GROQ_MODEL || 'gpt-4o-mini'

const client = new OpenAI({
    baseURL: GROQ_API_BASE,
    apiKey: GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { systemPrompt, userPrompt } = body

        if (!systemPrompt || !userPrompt) {
            return NextResponse.json(
                { error: 'systemPrompt and userPrompt are required' },
                { status: 400 }
            )
        }

        console.log('[generate-trip] Calling AI at:', GROQ_API_BASE, 'model:', GROQ_MODEL)

        const response = await client.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt +
                        '\n\nIMPORTANT: You MUST respond with ONLY valid JSON. ' +
                        'No markdown, no code fences, no explanation — raw JSON only.'
                },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 4096,
        })

        const content = response.choices?.[0]?.message?.content

        if (!content) {
            console.error('[generate-trip] Empty content in response')
            return NextResponse.json(
                { error: 'No content in AI response' },
                { status: 500 }
            )
        }

        console.log('[generate-trip] ✅ Response received, length:', content.length)
        return NextResponse.json({ content })

    } catch (error: any) {
        console.error('[generate-trip] Error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
