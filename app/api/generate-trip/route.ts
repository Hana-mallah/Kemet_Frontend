import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const GROQ_API_KEY = process.env.GROQ_API_KEY || 'change-secret-key-2026'
const GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://chat-gpt-fast-api.vercel.app/v1'
const GROQ_MODEL = process.env.GROQ_MODEL || 'gpt-4o-mini'

const client = new OpenAI({
    baseURL: GROQ_API_BASE,
    apiKey: GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        if (!GROQ_API_KEY) {
            console.error('[generate-trip] GROQ_API_KEY is not set')
            return NextResponse.json(
                { error: 'Groq API key not configured on server' },
                { status: 500 }
            )
        }

        const body = await req.json()
        const { systemPrompt, userPrompt } = body

        if (!systemPrompt || !userPrompt) {
            return NextResponse.json(
                { error: 'systemPrompt and userPrompt are required' },
                { status: 400 }
            )
        }

        console.log('[generate-trip] Calling OpenAI API with model:', GROQ_MODEL)

        const response = await client.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        })

        const content = response.choices?.[0]?.message?.content

        if (!content) {
            return NextResponse.json(
                { error: 'No content in response' },
                { status: 500 }
            )
        }

        console.log('[generate-trip] ✅ Response received, length:', content.length)
        return NextResponse.json({ content })

    } catch (error: any) {
        console.error('[generate-trip] Internal error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
