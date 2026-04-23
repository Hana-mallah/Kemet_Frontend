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
    if (typeof companions === 'number') return Math.min(Math.max(companions, 0), 3)
    const c = String(companions).toLowerCase()
    if (c.includes('couple')) return 1
    if (c.includes('family')) return 2
    if (c.includes('friend') || c.includes('group')) return 3
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
                    const durationDays = Number(request.durationDays || 7)
                    const startDateStr = request.startDate || new Date().toISOString().split('T')[0]
                    // Force UTC midnight to avoid timezone issues
                    const startDate = new Date(startDateStr.includes('T') ? startDateStr : `${startDateStr}T00:00:00.000Z`)
                    const endDate = new Date(startDate)
                    endDate.setUTCDate(startDate.getUTCDate() + (durationDays - 1))

                    const travelStyleNum = Number(request.travelStyle ?? 1)
                    const travelStyleLabel = travelStyleNum === 0 ? 'Budget' : travelStyleNum === 2 ? 'Luxury' : 'MidBudget'
                    const companionsNum = Number(request.travelStyle ?? 0) // using groupSize from travelStyle mapping
                    const companionsLabel = companionsNum === 1 ? 'Couple' : companionsNum === 2 ? 'Family' : companionsNum === 3 ? 'Friends' : 'Solo'

                    // ── 3. Build numbered destination list for AI prompt ────
                    const destListLines = allDestinations
                        .slice(0, 20) // limit list size for prompt
                        .map((d: any, i: number) =>
                            `${i + 1}. destinationId="${d.id}" name="${d.name || 'Unknown'}" city="${(d.city || 'Cairo').trim()}"`
                        )
                        .join('\n')

                    const systemPrompt = `You are a JSON-only Egypt trip planner. You MUST output ONLY a valid JSON object with no markdown, no explanation, no code fences.

CRITICAL: Use ONLY the destinationId values from the ALLOWED DESTINATIONS LIST below. Copy them exactly — do not invent or modify any ID.

ALLOWED DESTINATIONS:
${destListLines}

OUTPUT JSON STRUCTURE (follow exactly):
{
  "title": "Creative trip name",
  "description": "2-3 sentence trip summary",
  "travelCompanions": "${companionsLabel}",
  "travelStyle": "${travelStyleLabel}",
  "experienceTypes": ${JSON.stringify(request.interests || ['Sightseeing'])},
  "interests": ${JSON.stringify(request.interests || ['History'])},
  "startDate": "${startDate.toISOString()}",
  "endDate": "${endDate.toISOString()}",
  "durationDays": ${durationDays},
  "price": 5000,
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate.toISOString()}",
      "title": "Day title",
      "description": "Day summary",
      "city": "Cairo",
      "dayActivities": [
        {
          "destinationId": "COPY EXACT ID FROM ALLOWED DESTINATIONS",
          "activityType": "Sightseeing",
          "startTime": "09:00",
          "durationHours": 3,
          "description": "Activity description"
        }
      ]
    }
  ]
}

RULES:
- days array must have exactly ${durationDays} items
- Each day: 1-2 activities maximum
- Do NOT reuse the same destinationId across different days
- price must be <= ${request.budget || 15000}
- Output ONLY the JSON object`

                    const userPrompt = `Generate a ${durationDays}-day Egypt trip.
Travel Style: ${travelStyleLabel}
Companions: ${companionsLabel}
Interests: ${(request.interests || ['History']).join(', ')}
Budget: ${request.budget || 5000} EGP

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

                    const days = (rawTripData.days || []).slice(0, durationDays).map((day: any, dayIdx: number) => {
                        const dayDate = new Date(startDate)
                        dayDate.setUTCDate(startDate.getUTCDate() + dayIdx)

                        const rawActivities = day.dayActivities || day.activities || []
                        const activities = rawActivities.slice(0, 3).map((act: any) => {
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

                        if (activities.length === 0) {
                            activities.push({
                                destinationId: getNextRealDestId(),
                                activityType: 0,
                                startTime: '09:00:00',
                                durationHours: 3,
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

                    // Pad missing days
                    while (days.length < durationDays) {
                        const dayIdx = days.length
                        const dayDate = new Date(startDate)
                        dayDate.setUTCDate(startDate.getUTCDate() + dayIdx)
                        days.push({
                            dayNumber: dayIdx + 1,
                            date: dayDate.toISOString(),
                            title: `Day ${dayIdx + 1}`,
                            description: 'Continue your Egyptian adventure',
                            city: 'Cairo',
                            activities: [{
                                destinationId: getNextRealDestId(),
                                activityType: 0,
                                startTime: '09:00:00',
                                durationHours: 3,
                                description: 'Explore Cairo',
                            }],
                        })
                    }

                    // ── 7. Build final trip object ───────────────────────────
                    const tripObject = {
                        title: String(rawTripData.title || 'Egypt Adventure').substring(0, 200),
                        description: String(rawTripData.description || 'A personalized journey through the wonders of Egypt').substring(0, 1000),
                        travelCompanions: mapTravelCompanions(rawTripData.travelCompanions || companionsLabel),
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
