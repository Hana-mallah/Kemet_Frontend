import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1'
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b'

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

        console.log('[generate-trip] Calling Groq API with model:', GROQ_MODEL)

        const groqResponse = await fetch(`${GROQ_API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 4096,
                response_format: { type: 'json_object' },
            }),
        })

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json().catch(() => ({}))
            console.error('[generate-trip] Groq API error:', errorData)
            return NextResponse.json(
                { error: errorData?.error?.message || `Groq API returned ${groqResponse.status}` },
                { status: groqResponse.status }
            )
        }

        const groqData = await groqResponse.json()
        const content = groqData.choices?.[0]?.message?.content

        if (!content) {
            return NextResponse.json(
                { error: 'No content in Groq response' },
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
