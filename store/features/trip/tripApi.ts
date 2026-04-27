import { api } from '../baseApi'
import type {
    Trip,
    CreateTripRequest,
    UpdateTripRequest,
    TripDay,
    CreateDayRequest,
    TripActivity,
    CreateActivityRequest,
    GenerateTripRequest
} from '@/types'

// ─── Mapping helpers ──────────────────────────────────────────────────────────

const mapTravelStyle = (style: any): number => {
    if (typeof style === 'number') return Math.min(Math.max(style, 0), 2)
    const s = String(style).toLowerCase()
    if (s.includes('luxury')) return 2
    if (s.includes('mid') || s.includes('comfort') || s.includes('moderate')) return 1
    if (s.includes('budget')) return 0
    return 1
}

const mapTravelCompanions = (companions: any): number => {
    // Handle raw UI groupSize IDs: 1=Solo, 2=Couple, 4=SmallGroup, 6=LargeGroup
    if (typeof companions === 'number') {
        if (companions === 1) return 0  // Solo
        if (companions === 2) return 1  // Couple
        if (companions === 4) return 2  // Small Group
        if (companions === 6) return 3  // Large Group
        return Math.min(Math.max(companions, 0), 3) // fallback clamp for legacy values
    }
    const c = String(companions).toLowerCase()
    if (c.includes('couple')) return 1
    if (c.includes('small') || c.includes('family')) return 2   // 'Small Group' or legacy 'Family'
    if (c.includes('large') || c.includes('friend') || c.includes('group')) return 3  // 'Large Group' or legacy 'Friends'
    return 0 // Solo default
}

const mapActivityType = (type: any): number => {
    if (typeof type === 'number') return Math.min(Math.max(type, 0), 6)
    const t = String(type).toLowerCase()
    if (t.includes('museum')) return 2
    if (t.includes('food') || t.includes('cuisine') || t.includes('dining') || t.includes('restaurant')) return 3
    if (t.includes('shop')) return 4
    if (t.includes('relax') || t.includes('beach') || t.includes('spa') || t.includes('leisure')) return 5
    if (t.includes('night') || t.includes('entertainment')) return 6
    if (t.includes('adven') || t.includes('sport') || t.includes('activ')) return 1
    return 0 // Sightseeing default
}

// Format time as HH:mm:ss — required by .NET TimeSpan deserialization
const formatTime = (time: any): string => {
    if (!time) return '09:00:00'
    const s = String(time).trim()
    // Already HH:mm:ss
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s
    // HH:mm → HH:mm:ss
    if (/^\d{1,2}:\d{2}$/.test(s)) return `${s}:00`
    return '09:00:00'
}

// ─── Trip API endpoints ───────────────────────────────────────────────────────

export const tripApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // Get all trips
        getAllTrips: builder.query<Trip[], void>({
            query: () => '/Trip',
            transformResponse: (response: any) => {
                const data = response?.data || response
                return Array.isArray(data) ? data : []
            },
            providesTags: ['Trip'],
        }),

        // Get specific trip by ID
        getTrip: builder.query<Trip, string>({
            query: (id) => `/Trip/${id}`,
            transformResponse: (response: any) => response?.data || response,
            providesTags: (result, error, id) => [{ type: 'Trip', id }],
        }),

        // ── Generate trip using Groq AI ──────────────────────────────────────
        generateTripWithAI: builder.mutation<Trip, GenerateTripRequest>({
            queryFn: async (request, _api, _extraOptions, baseQuery) => {
                try {
                    console.log('[AI Planner] Starting trip generation...', request)

                    // ── 1. Fetch REAL destinations from backend ─────────────
                    const destResult = await baseQuery('/Destinations')
                    if (destResult.error) {
                        throw new Error('Failed to fetch destinations from backend')
                    }
                    const destinationsData = (destResult.data as any)?.data || destResult.data
                    const allDestinations: any[] = Array.isArray(destinationsData) ? destinationsData : []

                    if (allDestinations.length === 0) {
                        throw new Error('No destinations available in the system')
                    }

                    const realDestinationIds = new Set(allDestinations.map((d: any) => d.id))
                    console.log(`[AI Planner] Loaded ${allDestinations.length} real destinations`)

                    // ── 2. Prepare parameters ───────────────────────────────
                    const rawDuration = Number(request.durationDays || 7)   // 3 | 7 | 14 (UI option IDs)
                    const travelStyleNum = Number(request.travelStyle ?? 1)
                    const paceLabel = travelStyleNum === 0 ? 'Relaxed' : travelStyleNum === 2 ? 'Packed' : 'Balanced'
                    // Keep travelStyleLabel for backend mapping (used later in mapTravelStyle)
                    const travelStyleLabel = travelStyleNum === 0 ? 'Budget' : travelStyleNum === 2 ? 'Luxury' : 'MidBudget'
                    // ── Group size: read from request.groupSize (UI IDs: 1=Solo, 2=Couple, 4=SmallGroup, 6=LargeGroup)
                    const groupSizeId = Number(request.groupSize ?? 1)
                    const companionsLabel =
                        groupSizeId === 2 ? 'Couple' :
                        groupSizeId === 4 ? 'Small Group' :
                        groupSizeId === 6 ? 'Large Group' : 'Solo'

                    const interestCount = (request.interests || []).length
                    const budget = Number(request.budget || 5000)
                    const isHighBudget = budget > 8000
                    const isLowBudget = budget < 3000

                    // ── Smart Duration Calculation ──────────────────────────
                    // rawDuration 3  → Quick Getaway  (3–5 days)
                    // rawDuration 7  → Week Adventure (7–10 days)
                    // rawDuration 14 → Extended Journey (14–21 days)
                    let calculatedDays: number
                    if (rawDuration <= 5) {
                        // Quick Getaway: 3–5 days
                        if (paceLabel === 'Relaxed' && isLowBudget) calculatedDays = 3
                        else if (paceLabel === 'Packed' || isHighBudget) calculatedDays = 5
                        else calculatedDays = interestCount > 2 ? 4 : 3  // Balanced or moderate
                    } else if (rawDuration <= 10) {
                        // Week Adventure: 7–10 days
                        if (paceLabel === 'Relaxed') calculatedDays = 7
                        else if (paceLabel === 'Packed' && interestCount > 3) calculatedDays = 10
                        else calculatedDays = interestCount > 2 ? 9 : 8   // Balanced
                    } else {
                        // Extended Journey: 14–21 days
                        // More interests = more days (each extra interest adds ~1 day, capped at 21)
                        calculatedDays = Math.min(21, 14 + Math.max(0, interestCount - 2))
                        if (isHighBudget && paceLabel === 'Packed') calculatedDays = Math.min(21, calculatedDays + 2)
                        if (paceLabel === 'Relaxed') calculatedDays = Math.min(18, calculatedDays)
                    }

                    const durationDays = calculatedDays   // alias used throughout the rest of the code
                    const startDateStr = request.startDate || new Date().toISOString().split('T')[0]
                    // Force UTC midnight to avoid timezone issues
                    const startDate = new Date(startDateStr.includes('T') ? startDateStr : `${startDateStr}T00:00:00.000Z`)
                    const endDate = new Date(startDate)
                    endDate.setUTCDate(startDate.getUTCDate() + (durationDays - 1))

                    // ── 3. Build numbered destination list for AI prompt ────
                    const destListLines = allDestinations
                        .slice(0, 20) // limit list size for prompt
                        .map((d: any, i: number) =>
                            `${i + 1}. destinationId="${d.id}" name="${d.name || 'Unknown'}" city="${(d.city || 'Cairo').trim()}"`
                        )
                        .join('\n')

                    // Compute per-activity budget share for the prompt
                    const totalActivities = durationDays * (
                        paceLabel === 'Relaxed' ? 1.5 :
                            paceLabel === 'Balanced' ? 2.5 : 4
                    )
                    const avgCostPerActivity = Math.round(budget / totalActivities)

                    const systemPrompt = `You are KEMET AI — an expert human travel consultant for Egypt. You MUST output ONLY a valid JSON object. No markdown, no code fences, no explanation text before or after the JSON.
All monetary values are in EGP (Egyptian Pounds) ONLY. Never use USD, EUR, or any other currency.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — DESTINATION CONSTRAINT (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use ONLY destinationId values from this list. Copy them exactly — never invent or modify any ID.

ALLOWED DESTINATIONS:
${destListLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — WORKLOAD-DURATION-INTEREST CHAIN (STRICT CONSTRAINTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTRAINT A — Interest Minimum for Long Packed Trips:
If pace is "Packed" AND durationDays > 14, the itinerary MUST include activities from at least 3–4 distinct interest categories.
It is LOGICALLY FORBIDDEN to plan a 14-day Packed trip with only 1 interest type. Mixing history, cuisine, nature, adventure, etc. is mandatory.

CONSTRAINT B — Dynamic Duration (Already Computed — Do NOT Change):
The system has pre-calculated the exact trip length for this request: ${durationDays} days.
This was derived from the user's range selection, pace ("${paceLabel}"), budget (${budget} EGP), and interest count (${interestCount}).
The reference logic used:
  • Range 3–5: 3 days → Relaxed + low budget | 4 days → Balanced | 5 days → Packed or high budget
  • Range 7–10: 7 days → Relaxed | 8–9 days → Balanced | 10 days → Packed + high budget/many interests
  • Range 14+: 14 + (interests − 2) days, capped at 21; +2 if Packed + high budget; max 18 if Relaxed
YOUR ONLY JOB: generate an itinerary for exactly ${durationDays} days. Do NOT recalculate. Do NOT change this number.
"durationDays" in your JSON MUST be ${durationDays}. The "days" array MUST contain exactly ${durationDays} objects.

CONSTRAINT C — Activity Count per Day (Strict Pace Rules):
Pace is "${paceLabel}".
${paceLabel === 'Relaxed'
    ? `• Each day MUST have 1–2 dayActivities. Choose freely between 1 and 2. Vary it across days for a natural rhythm.`
    : paceLabel === 'Balanced'
        ? `• Each day MUST have 2–3 dayActivities. Choose freely between 2 and 3. Vary it across days for a natural rhythm.`
        : `• Each day MUST have 4–5 dayActivities. Choose freely between 4 and 5. Vary it (e.g., Day1→4, Day2→5, Day3→4). Never give every day the same count.`
}
• 0 activities on ANY day is STRICTLY FORBIDDEN.
• Exceeding the maximum on ANY day is STRICTLY FORBIDDEN.
SELF-VERIFICATION (mandatory): Before outputting, scan every day. If any day violates the activity count rule, fix it first.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — GEOGRAPHIC INTELLIGENCE (CLUSTERING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST group all activities within a single day inside ONE geographic cluster:
  • Day 1 example: Giza Plateau only (Pyramids, Sphinx, Solar Boat Museum)
  • Day 2 example: Islamic Cairo only (Khan el-Khalili, Al-Azhar Mosque, Citadel)
  • Day 3 example: Luxor West Bank only (Valley of the Kings, Hatshepsut Temple, Colossi of Memnon)

ANTI-PATTERNS (STRICTLY FORBIDDEN — these violate geographic logic):
  ✗ Mixing Giza monuments with Downtown Cairo on the same day
  ✗ Mixing Alexandria with Luxor on the same day
  ✗ Mixing Sinai Red Sea with Cairo on the same day

Minimize transit time. A traveler should spend time experiencing, not commuting.
The "city" field for each day must match the geographic cluster for that day.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — FINANCIAL MATHEMATICAL PRECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Currency: EGP ONLY — no exceptions.

TOTAL BUDGET: ${budget} EGP for the ENTIRE trip.
Budget distribution formula:
  • Estimated activities in this trip: ~${Math.round(totalActivities)} total
  • Target average cost per activity: ~${avgCostPerActivity} EGP
  • Distribute realistically: landmark visits cost more, market walks cost less.
  • Budget-tier guidance:
    - Low budget (< 3,000 EGP): Prioritize free/cheap sites; avoid luxury venues.
    - Mid budget (3,000–8,000 EGP): Mix of paid sites and affordable dining.
    - High budget (> 8,000 EGP): Include premium experiences, guided tours, fine dining.

ABSOLUTE RULE: The top-level "price" field MUST EQUAL EXACTLY ${budget} EGP.
It is STRICTLY FORBIDDEN to output a "price" value that differs from ${budget} by even 1 EGP.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — TRAVEL COMPANION AWARENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Companion type for this trip: "${companionsLabel}"

Persona-specific guidance — tailor activity descriptions and venue selection accordingly:
  • Solo: Suggest social hostels, solo-friendly tours, self-guided exploration, flexible pacing. Mention safety tips for solo travelers.
  • Couple: Prioritize romantic settings (Nile cruises at sunset, quiet historical gardens, candlelit dinner spots). Use warm, intimate language.
  • Small Group (3–4): Balance between individual interests and group dynamics. Suggest venues with flexible group bookings.
  • Large Group (5+): Prioritize group-friendly venues with large capacity. Mention group tour discounts, logistics (bus transport, group entry fees). Avoid small, crowded spots unsuitable for groups.

The "travelCompanions" field in the JSON MUST be exactly one of: "Solo" | "Couple" | "Small Group" | "Large Group"
The value for this trip is "${companionsLabel}". Do NOT change it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — INTEREST VARIETY ENFORCEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The user has selected ${interestCount} interest categories: ${(request.interests || ['History']).join(', ')}.
You MUST incorporate activities from ALL of the user's selected interest categories across the trip.
If the trip is longer than 5 days, NO single interest category may dominate more than 50% of all activities.
Variety across days prevents boredom and fulfills the user's expressed preferences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — COMPULSORY OUTPUT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NO REST DAYS: Every single day MUST be fully planned with at least the minimum number of activities.
A "rest day" with 0 activities is STRICTLY FORBIDDEN.

Required JSON structure (follow exactly):
{
  "title": "Creative trip name that reflects the companion type and interests",
  "description": "2–3 sentence trip summary tailored to ${companionsLabel}. End with: Looking for more ideas or travel advice? Let KEMET AI assist you with anything you need for your trip in Egypt.",
  "travelCompanions": "${companionsLabel}",
  "travelStyle": "${travelStyleLabel}",
  "experienceTypes": ${JSON.stringify(request.interests || ['Sightseeing'])},
  "interests": ${JSON.stringify(request.interests || ['History'])},
  "startDate": "${startDate.toISOString()}",
  "endDate": "${endDate.toISOString()}",
  "durationDays": ${durationDays},
  "price": ${budget},
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate.toISOString()}",
      "title": "Descriptive day title (area + theme)",
      "description": "Day summary personalized to ${companionsLabel}",
      "city": "City/area name matching the geographic cluster",
      "dayActivities": [
        {
          "destinationId": "COPY EXACT ID FROM ALLOWED DESTINATIONS",
          "activityType": "Sightseeing",
          "startTime": "09:00",
          "durationHours": 3,
          "description": "Activity description personalized to ${companionsLabel}, cost context in EGP"
        }
      ]
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL 6-POINT VERIFICATION CHECKLIST (mandatory before output)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before outputting the JSON, verify ALL of the following. Fix any failures before outputting:
  1. ✅ "durationDays" == ${durationDays}
  2. ✅ "days" array contains exactly ${durationDays} objects
  3. ✅ Every day has the correct activity count per CONSTRAINT C (${paceLabel === 'Relaxed' ? '1–2' : paceLabel === 'Balanced' ? '2–3' : '4–5'} activities)
  4. ✅ "price" == ${budget} EGP exactly
  5. ✅ All destinationId values are from the ALLOWED DESTINATIONS list
  6. ✅ Activities within each day are geographically clustered (no cross-city mixing)
  ${paceLabel === 'Packed' && durationDays > 14 ? `7. ✅ At least 3–4 distinct interest categories are covered (CONSTRAINT A — Packed + long trip)` : ''}

Output ONLY the JSON object. Nothing before it. Nothing after it.`


                    const userPrompt = `Generate a ${durationDays}-day Egypt trip. (Duration was calculated from the user's selected range, pace, budget, and interests — do not change it.)
Travel Pace: ${paceLabel}
Companions: ${companionsLabel}
Interests (${interestCount} selected): ${(request.interests || ['History']).join(', ')}
Total Budget: ${budget} EGP (ALL costs must be in EGP)

MANDATORY CHECKLIST before you output JSON:
✅ "durationDays" = ${durationDays}
✅ "days" array has exactly ${durationDays} objects
✅ Every day has between ${paceLabel === 'Relaxed' ? '1–2' : paceLabel === 'Balanced' ? '2–3' : '4–5'} dayActivities (varied freely, NOT the same every day)
✅ "price" = ${budget} EGP exactly
✅ Places within each day are geographically clustered
Output only the JSON.`

                    // ── 4. Call server-side AI route ────────────────────────
                    console.log('[AI Planner] Calling /api/generate-trip...')
                    const apiResponse = await fetch('/api/generate-trip', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ systemPrompt, userPrompt }),
                    })

                    if (!apiResponse.ok) {
                        const errData = await apiResponse.json().catch(() => ({}))
                        throw new Error(errData.error || `AI server error: ${apiResponse.status}`)
                    }

                    const { content } = await apiResponse.json()
                    if (!content || typeof content !== 'string') {
                        throw new Error('Empty response from AI')
                    }

                    console.log('[AI Planner] AI response (first 400 chars):', content.substring(0, 400))

                    // ── 5. Parse JSON ───────────────────────────────────────
                    let rawTripData: any
                    try {
                        rawTripData = JSON.parse(content.trim())
                    } catch {
                        let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
                        const match = cleaned.match(/\{[\s\S]*\}/)
                        if (!match) throw new Error('AI response is not valid JSON')
                        rawTripData = JSON.parse(match[0])
                    }

                    // ── 6. Validate & fix destination IDs ───────────────────
                    const usedDestIds = new Set<string>()
                    let destIndex = 0

                    const getNextRealDestId = (): string => {
                        while (destIndex < allDestinations.length) {
                            const id = allDestinations[destIndex].id
                            destIndex++
                            if (id && !usedDestIds.has(id)) {
                                usedDestIds.add(id)
                                return id
                            }
                        }
                        // Ran out — reset and allow reuse
                        destIndex = 0
                        const id = allDestinations[0].id
                        return id
                    }

                    // ── Pace-derived activity count limits ──────────────────
                    const minAct = paceLabel === 'Relaxed' ? 1 : paceLabel === 'Balanced' ? 2 : 4  // minimum per day
                    const maxAct = paceLabel === 'Relaxed' ? 2 : paceLabel === 'Balanced' ? 3 : 5  // maximum per day

                    const days = (rawTripData.days || []).slice(0, durationDays).map((day: any, dayIdx: number) => {
                        const dayDate = new Date(startDate)
                        dayDate.setUTCDate(startDate.getUTCDate() + dayIdx)

                        const rawActivities = day.dayActivities || day.activities || []
                        const activities = rawActivities.slice(0, maxAct).map((act: any) => {
                            let destId = String(act.destinationId || act.DestinationId || '').trim()

                            if (!destId || !realDestinationIds.has(destId)) {
                                console.warn(`[AI Planner] Bad destinationId "${destId}" → replacing`)
                                destId = getNextRealDestId()
                            } else if (usedDestIds.has(destId)) {
                                console.warn(`[AI Planner] Duplicate destinationId "${destId}" → replacing`)
                                destId = getNextRealDestId()
                            } else {
                                usedDestIds.add(destId)
                            }

                            return {
                                destinationId: destId,
                                activityType: mapActivityType(act.activityType || act.type || 0),
                                startTime: formatTime(act.startTime),
                                durationHours: Math.max(1, Math.min(8, Number(act.durationHours) || 2)),
                                description: String(act.description || 'Explore the destination').substring(0, 500),
                            }
                        })

                        // If the AI returned fewer activities than the minimum, pad up to a varied count within [minAct, maxAct]
                        const targetForDay = minAct + (dayIdx % (maxAct - minAct + 1))
                        while (activities.length < targetForDay) {
                            const startHour = 9 + activities.length * 3
                            activities.push({
                                destinationId: getNextRealDestId(),
                                activityType: 0,
                                startTime: `${String(startHour).padStart(2, '0')}:00:00`,
                                durationHours: 2,
                                description: 'Explore the sights',
                            })
                        }

                        return {
                            dayNumber: dayIdx + 1,
                            date: dayDate.toISOString(),
                            title: String(day.title || `Day ${dayIdx + 1}`).substring(0, 200),
                            description: String(day.description || 'A day of exploration').substring(0, 500),
                            city: String((day.city || 'Cairo')).trim().substring(0, 100),
                            activities,
                        }
                    })

                    // Pad missing days — varied activity count within [minAct, maxAct]
                    while (days.length < durationDays) {
                        const dayIdx = days.length
                        const dayDate = new Date(startDate)
                        dayDate.setUTCDate(startDate.getUTCDate() + dayIdx)
                        const targetCount = minAct + (dayIdx % (maxAct - minAct + 1))
                        const paddedActivities = []
                        for (let a = 0; a < targetCount; a++) {
                            paddedActivities.push({
                                destinationId: getNextRealDestId(),
                                activityType: 0,
                                startTime: `${String(9 + a * 3).padStart(2, '0')}:00:00`,
                                durationHours: 2,
                                description: 'Explore Cairo',
                            })
                        }
                        days.push({
                            dayNumber: dayIdx + 1,
                            date: dayDate.toISOString(),
                            title: `Day ${dayIdx + 1}`,
                            description: 'Continue your Egyptian adventure',
                            city: 'Cairo',
                            activities: paddedActivities,
                        })
                    }

                    // ── 7. Build final trip object ───────────────────────────
                    const tripObject = {
                        title: String(rawTripData.title || 'Egypt Adventure').substring(0, 200),
                        description: String(rawTripData.description || 'A personalized journey through the wonders of Egypt').substring(0, 1000),
                        travelCompanions: mapTravelCompanions(groupSizeId),
                        travelStyle: mapTravelStyle(rawTripData.travelStyle || travelStyleLabel),
                        experienceTypes: Array.isArray(rawTripData.experienceTypes) && rawTripData.experienceTypes.length > 0
                            ? rawTripData.experienceTypes.map((e: any) => String(e))
                            : (request.interests || ['Sightseeing']),
                        interests: Array.isArray(rawTripData.interests) && rawTripData.interests.length > 0
                            ? rawTripData.interests.map((i: any) => String(i))
                            : (request.interests || ['History']),
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        durationDays,
                        price: Math.max(100, Math.min(
                            Number(rawTripData.price) || Number(request.budget) || 5000,
                            Number(request.budget) || 100000
                        )),
                        imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80',
                        days,
                    }

                    console.log('[AI Planner] Sending to backend:', JSON.stringify(tripObject, null, 2))

                    // ── 8. POST to backend ───────────────────────────────────
                    const createResult = await baseQuery({
                        url: '/Trip',
                        method: 'POST',
                        body: tripObject,
                    })

                    if (createResult.error) {
                        // Extract the most meaningful error message
                        const err = createResult.error as any
                        const errBody = err?.data
                        let errMsg = 'Backend validation error'

                        if (typeof errBody === 'string') {
                            errMsg = errBody
                        } else if (errBody?.message) {
                            errMsg = errBody.message
                        } else if (errBody?.errors) {
                            errMsg = Object.entries(errBody.errors)
                                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                                .join(' | ')
                        } else if (errBody?.title) {
                            errMsg = errBody.title
                        }

                        console.error('[AI Planner] Backend error:', JSON.stringify(err, null, 2))

                        return {
                            error: {
                                status: err?.status || 'CUSTOM_ERROR',
                                error: errMsg,
                                data: errBody,
                            },
                        }
                    }

                    const createdTrip = (createResult.data as any)?.data || createResult.data
                    console.log('[AI Planner] ✅ Trip created:', createdTrip?.id)
                    return { data: createdTrip }

                } catch (error: any) {
                    console.error('[AI Planner] Exception:', error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: error.message || 'Unknown error occurred',
                        },
                    }
                }
            },
            invalidatesTags: ['Trip'],
        }),

        // Create new trip
        createTrip: builder.mutation<Trip, CreateTripRequest>({
            query: (tripData) => ({
                url: '/Trip',
                method: 'POST',
                body: tripData,
            }),
            transformResponse: (response: any) => response?.data || response,
            invalidatesTags: ['Trip'],
        }),

        // Update trip
        updateTrip: builder.mutation<Trip, { id: string; data: CreateTripRequest }>({
            query: ({ id, data }) => ({
                url: `/Trip/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response?.data || response,
            invalidatesTags: (result, error, { id }) => [{ type: 'Trip', id }, 'Trip'],
        }),

        // Delete trip
        deleteTrip: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Trip/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Trip'],
        }),

        // Day Operations
        addDayToTrip: builder.mutation<TripDay, { tripId: string; data: CreateDayRequest }>({
            query: ({ tripId, data }) => ({
                url: `/Trip/${tripId}/days`,
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response?.data || response,
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }, 'Trip'],
        }),

        updateDay: builder.mutation<TripDay, { tripId: string; dayId: string; data: CreateDayRequest }>({
            query: ({ tripId, dayId, data }) => ({
                url: `/Trip/${tripId}/days/${dayId}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response?.data || response,
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }, 'Trip'],
        }),

        deleteDay: builder.mutation<void, { tripId: string; dayId: string }>({
            query: ({ tripId, dayId }) => ({
                url: `/Trip/${tripId}/days/${dayId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }, 'Trip'],
        }),

        // Activity Operations
        addActivityToDay: builder.mutation<TripActivity, { tripId: string; dayId: string; data: CreateActivityRequest }>({
            query: ({ tripId, dayId, data }) => ({
                url: `/Trip/${tripId}/days/${dayId}/activities`,
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response?.data || response,
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }, 'Trip'],
        }),

        updateActivity: builder.mutation<TripActivity, { tripId: string; dayId: string; activityId: string; data: CreateActivityRequest }>({
            query: ({ tripId, dayId, activityId, data }) => ({
                url: `/Trip/${tripId}/days/${dayId}/activities/${activityId}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response?.data || response,
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }, 'Trip'],
        }),

        deleteActivity: builder.mutation<void, { tripId: string; dayId: string; activityId: string }>({
            query: ({ tripId, dayId, activityId }) => ({
                url: `/Trip/${tripId}/days/${dayId}/activities/${activityId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }, 'Trip'],
        }),
    }),
})

export const {
    useGetAllTripsQuery,
    useGetTripQuery,
    useGenerateTripWithAIMutation,
    useCreateTripMutation,
    useUpdateTripMutation,
    useDeleteTripMutation,
    useAddDayToTripMutation,
    useUpdateDayMutation,
    useDeleteDayMutation,
    useAddActivityToDayMutation,
    useUpdateActivityMutation,
    useDeleteActivityMutation,
} = tripApi
