import { NextRequest, NextResponse } from 'next/server'

// This debug route tests the backend trip creation schema
// It proxies a Trip POST with a provided auth token to reveal exact validation errors
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { token, tripObject } = body

        if (!token) {
            return NextResponse.json({ error: 'Provide token from localStorage' }, { status: 400 })
        }

        const backendUrl = 'https://kemeteg.runasp.net/api/Trip'

        const resp = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(tripObject),
        })

        const text = await resp.text()
        let json: any
        try { json = JSON.parse(text) } catch { json = text }

        return NextResponse.json({
            status: resp.status,
            statusText: resp.statusText,
            body: json,
            sentPayload: tripObject,
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
