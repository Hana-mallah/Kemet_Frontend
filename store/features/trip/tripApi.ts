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

    // Parse 12-hour format "HH:MM AM/PM"
    const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (match) {
        let hours = parseInt(match[1], 10)
        const mins = match[2]
        const period = match[3].toUpperCase()
        if (hours === 12) {
            hours = period === 'AM' ? 0 : 12
        } else if (period === 'PM') {
            hours += 12
        }
        return `${String(hours).padStart(2, '0')}:${mins}:00`
    }

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

                    // ── 3. Build destination list for AI prompt (keep small to save tokens)
                    const destListLines = allDestinations
                        .slice(0, 8)
                        .map((d: any) =>
                            `${d.id}|${d.name || 'Unknown'}|${(d.city || 'Cairo').trim()}`
                        )
                        .join('\n')

                    // Compute per-activity budget share for the prompt
                    const totalActivities = durationDays * (
                        paceLabel === 'Relaxed' ? 1.5 :
                            paceLabel === 'Balanced' ? 2.5 : 4
                    )
                    const avgCostPerActivity = Math.round(budget / totalActivities)

                    const systemPrompt = `You are a strict JSON-only API. You MUST return ONLY a valid JSON object. Do not include any conversational text, greetings, or markdown code blocks (like \`\`\`json). Just output the raw JSON object.

Focus on generating the exact JSON fields first, then fill them with the real destinations requested.

RULES:
1. Strict Budget: Sum of all activity/ticket costs MUST be strictly <= ${budget} EGP. Use EGP.
2. Days: Exactly ${durationDays} days. No rest days.
3. Acts/day: ${paceLabel === 'Relaxed' ? '1-2' : paceLabel === 'Balanced' ? '2-3' : '4-5'} activities per day.
4. No Repeats: Never repeat a destination.
5. Real Summary Content (3-Line Rule): Every destination MUST have a unique, educational, and engaging summary of exactly 3 lines. The content must provide real value: Why should the user go there? What is unique about it? The description/summary field must NEVER contain the name of the destination again. If the title is 'The Royal Carriages Museum', start directly with facts, not the title. Example for Bab Zuwayla: 'One of the last remaining gates of Cairo’s Old City, offering a stunning panoramic view of Islamic Cairo from its twin minarets. It stands as a witness to centuries of history and the executions that once took place at its threshold.'
6. Dynamic Day Title & Description: Title MUST be a 1-sentence theme. Description MUST be: For Day 1: 'Welcome to Egypt! Start your first day in Egypt with...'. For Day 2: 'In your second day, we suggest you visit...'. For Day 3+: Generate a creative, context-aware bridge sentence.
7. Geographic Clustering: Group acts by area/day.
8. Tone: ${companionsLabel}.
9. Time Scheduling: Use strictly 12-hour format (e.g., "09:00 AM", "02:00 PM"). Every itinerary day MUST start strictly at "09:00 AM". There MUST be exactly 1 hour of free time between the end of one activity and the start of the next for transit and rest.
10. Fixed Ending: End the trip description with "Looking for more ideas or travel advice? Let KEMET Assistant assist you with anything you need for your trip in Egypt."
${paceLabel === 'Packed' && durationDays > 14 ? '11. PACKED+LONG needs 3-4 distinct interest categories.\n' : ''}
AVAILABLE DESTINATION IDs (use these exact IDs for destinationId):
${destListLines}

REQUIRED JSON SCHEMA:
{"title":"","description":"","travelCompanions":"${companionsLabel}","travelStyle":"${travelStyleLabel}","experienceTypes":${JSON.stringify(request.interests || ['Sightseeing'])},"interests":${JSON.stringify(request.interests || ['History'])},"startDate":"${startDate.toISOString()}","endDate":"${endDate.toISOString()}","durationDays":${durationDays},"price":${budget},"days":[{"dayNumber":1,"date":"${startDate.toISOString()}","title":"","description":"","city":"","dayActivities":[{"destinationId":"ID_HERE","activityType":"","startTime":"09:00 AM","durationHours":2,"description":""}]}]}`

                    const userPrompt = `Plan ${durationDays}-day Egypt trip. Pace:${paceLabel} Companions:${companionsLabel} Budget:${budget}EGP Interests:${(request.interests || ['History']).join(',')} Start:${startDate.toISOString().split('T')[0]}. JSON only.`

                    // ── 4. Call server-side API route ────────────────────────
                    console.log('[KEMET Assistant] Calling /api/generate-trip...')
                    const apiResponse = await fetch('/api/generate-trip', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ systemPrompt, userPrompt }),
                    })

                    if (!apiResponse.ok) {
                        const errData = await apiResponse.json().catch(() => ({}))
                        throw new Error(errData.error || `KEMET Assistant server error: ${apiResponse.status}`)
                    }

                    const { content } = await apiResponse.json()
                    if (!content || typeof content !== 'string') {
                        throw new Error('Empty response from KEMET Assistant')
                    }

                    console.log('[KEMET Assistant] Response (first 400 chars):', content.substring(0, 400))

                    // ── 5. Parse JSON ───────────────────────────────────────
                    let rawTripData: any
                    try {
                        rawTripData = JSON.parse(content.trim())
                    } catch {
                        let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
                        const match = cleaned.match(/\{[\s\S]*\}/)
                        if (!match) throw new Error('KEMET Assistant response is not valid JSON')
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


                        return {
                            dayNumber: dayIdx + 1,
                            date: dayDate.toISOString(),
                            title: String(day.title || `Day ${dayIdx + 1}`).substring(0, 200),
                            description: String(day.description || (dayIdx === 0 ? 'Welcome to Egypt! Start your first day in Egypt with...' : dayIdx === 1 ? 'In your second day, we suggest you visit...' : 'Discover more wonders today as we explore...')).substring(0, 500),
                            city: String((day.city || 'Cairo')).trim().substring(0, 100),
                            activities,
                        }
                    })

                    // Pad missing days — varied activity count within [minAct, maxAct]
                    while (days.length < durationDays) {
                        const dayIdx = days.length
                        const dayDate = new Date(startDate)
                        dayDate.setUTCDate(startDate.getUTCDate() + dayIdx)

                        days.push({
                            dayNumber: dayIdx + 1,
                            date: dayDate.toISOString(),
                            title: `Day ${dayIdx + 1}`,
                            description: dayIdx === 0 ? 'Welcome to Egypt! Start your first day in Egypt with...' : dayIdx === 1 ? 'In your second day, we suggest you visit...' : 'Discover more wonders today as we explore...',
                            city: 'Cairo',
                            activities: [],
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
