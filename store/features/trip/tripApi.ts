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

// Trip API endpoints
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
            transformResponse: (response: any) => {
                return response?.data || response
            },
            providesTags: (result, error, id) => [{ type: 'Trip', id }],
        }),

        // Generate trip using Groq AI
        generateTripWithAI: builder.mutation<Trip, GenerateTripRequest>({
            queryFn: async (request, _api, _extraOptions, baseQuery) => {
                try {
                    console.log('Generating trip with Groq AI...', request)

                    // Fetch destinations from backend dynamically
                    const destResult = await baseQuery('/Destinations')
                    const destinationsData = (destResult.data as any)?.data || destResult.data
                    const allowedDestinations = Array.isArray(destinationsData) ? destinationsData : []

                    const systemPrompt = `You are an AI Trip Planning Agent for Kemet platform.
Your responsibility is to create a personalized travel plan in Egypt based strictly on a Trip Persona provided as input.
The plan should contain days and day activity in details.
Retrieve the destinations from provided destinations only.

RULES & CONSTRAINTS:
1. Focus ONLY on destinations and activities in Egypt that are in the provided list.
2. Enum values MUST be returned as STRING literals (e.g., "Solo", "Budget", "Sightseeing").
3. Field names MUST match the requested schema. Use "dayActivities" in your internal JSON structure.
4. Duration MUST match DurationDays exactly. Do NOT exceed it.
5. Prices must be estimated based on TravelStyle AND MUST be in Egyptian Pounds (EGP) only.
6. CRITICAL: The number of days in the "days" array MUST equal DurationDays exactly.
7. CRITICAL: Calculate endDate as: startDate + (durationDays - 1) days. For example, a 7-day trip starting Jan 1 ends Jan 7.
8. Each day in the "days" array must have sequential dates starting from startDate.

BUDGET RULES (CRITICAL):
9. Total trip cost MUST NOT exceed the provided total budget.
10. The budget MUST be distributed across trip days based on the destinations planned per day.
11. Each day MUST include a visible allocated per-day budget in Egyptian Pounds (EGP).
12. The sum of all daily budgets MUST equal the total trip price.

DESTINATION UNIQUENESS:
13. A destinationId MUST NOT be repeated across the trip.
14. Visiting the same city multiple times is allowed ONLY if different destinationIds are used.
15. Do NOT reuse the same destination on multiple days under any circumstances.

ALLOWED DESTINATIONS:
${JSON.stringify(allowedDestinations.map(d => ({ id: d.id, name: d.name, city: d.city, estimatedPrice: d.estimatedPrice })), null, 2)}

Output ONLY a JSON object:
{
  "title": "string",
  "travelCompanions": "string",
  "travelStyle": "string",
  "experienceTypes": ["string"],
  "interests": ["string"],
  "startDate": "ISO string",
  "endDate": "ISO string",
  "durationDays": number,
  "price": number,
  "description": "string",
  "days": [
    {
      "dayNumber": number,
      "date": "ISO string",
      "title": "string",
      "description": "string",
      "city": "string",
      "dayActivities": [
        {
          "destinationId": "UUID",
          "activityType": "string",
          "startTime": "string",
          "durationHours": number,
          "description": "string"
        }
      ]
    }
  ]
}`;

                    const userPrompt = `INPUT: Trip Persona
TravelCompanions: ${request.travelStyle === 0 ? 'Solo' : request.travelStyle === 1 ? 'Couple' : 'Family'}
TravelStyle: ${request.travelStyle === 0 ? 'Budget' : request.travelStyle === 1 ? 'MidBudget' : 'Luxury'}
ExperienceTypes: ${JSON.stringify(request.interests)}
Interests: ${JSON.stringify(request.interests)}
StartDate: ${request.startDate}
DurationDays: ${request.durationDays}
Description: "Personalized trip to Egypt"

Generate the Trip Plan JSON now.`;

                    // Step 1: Call Groq AI API
                    const groqResponse = await fetch(
                        'https://api.groq.com/openai/v1/chat/completions',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer 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',
                            },
                            body: JSON.stringify({
                                model: 'llama-3.3-70b-versatile',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: userPrompt + "\n\nIMPORTANT: Return ONLY raw JSON. Do not include markdown formatting or explanations." }
                                ],
                                temperature: 0.7
                            }),
                        }
                    )

                    if (!groqResponse.ok) {
                        const errorData = await groqResponse.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || 'Failed to generate trip with Groq AI');
                    }

                    const groqData = await groqResponse.json();
                    let contentText = groqData.choices[0].message.content;

                    console.log('Raw Groq response (first 200 chars):', contentText.substring(0, 200));

                    // --- Robust JSON Extraction ---
                    // Handles cases where Groq might wrap output in ```json ... ``` blocks
                    if (contentText.includes('```')) {
                        // Simple cleanup: remove ```json and ``` markers
                        contentText = contentText.replace(/```json/g, '').replace(/```/g, '');
                    }

                    let rawTripData = JSON.parse(contentText.trim());

                    // --- Date Validation & Correction ---
                    // Ensure endDate is calculated correctly from startDate + durationDays
                    const startDate = new Date(rawTripData.startDate || rawTripData.StartDate || request.startDate);
                    const durationDays = Number(rawTripData.durationDays || rawTripData.DurationDays || request.durationDays || 7);

                    // Calculate correct endDate: startDate + (durationDays - 1) days
                    // Example: 7-day trip from Jan 1 = Jan 1 to Jan 7 (inclusive)
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + (durationDays - 1));

                    // Override AI's endDate with calculated value to ensure consistency
                    rawTripData.endDate = endDate.toISOString();
                    rawTripData.startDate = startDate.toISOString();
                    rawTripData.durationDays = durationDays;

                    // --- Mapping Helpers (Map Strings back to Backend IDs) ---
                    const mapTravelStyle = (style: any): number => {
                        const s = String(style).toLowerCase();
                        if (s.includes('budget') && !s.includes('mid')) return 0;
                        if (s.includes('mid') || s.includes('comfort') || s.includes('moderate')) return 1;
                        if (s.includes('luxury')) return 2;
                        return typeof style === 'number' ? style : 1;
                    };

                    const mapTravelCompanions = (companions: any): number => {
                        const c = String(companions).toLowerCase();
                        if (c.includes('solo')) return 0;
                        if (c.includes('couple')) return 1;
                        if (c.includes('family')) return 2;
                        if (c.includes('friend')) return 3;
                        return typeof companions === 'number' ? companions : 0;
                    };

                    const mapActivityType = (type: any): number => {
                        if (typeof type === 'number') return type;
                        const t = String(type).toLowerCase();
                        if (t.includes('sight')) return 0;
                        if (t.includes('food')) return 3;
                        if (t.includes('museum')) return 2;
                        if (t.includes('adven')) return 1;
                        if (t.includes('relax')) return 5;
                        if (t.includes('shop')) return 4;
                        if (t.includes('night')) return 6;
                        return 0;
                    };

                    // Step 2: Construct the trip object aligned EXACTLY with the .NET backend
                    const tripObject = {
                        title: String(rawTripData.title || rawTripData.Title || "Personalized Egypt Adventure").substring(0, 200),
                        description: String(rawTripData.description || rawTripData.Description || "A carefully curated journey through the wonders of Egypt"),
                        travelCompanions: mapTravelCompanions(rawTripData.travelCompanions || rawTripData.TravelCompanions || request.travelStyle),
                        travelStyle: mapTravelStyle(rawTripData.travelStyle || rawTripData.TravelStyle || request.travelStyle),
                        experienceTypes: Array.isArray(rawTripData.experienceTypes) ? rawTripData.experienceTypes : (request.interests || []),
                        interests: Array.isArray(rawTripData.interests) ? rawTripData.interests : (request.interests || []),
                        startDate: rawTripData.startDate || rawTripData.StartDate || request.startDate || new Date().toISOString(),
                        endDate: rawTripData.endDate || rawTripData.EndDate || new Date(new Date(request.startDate || Date.now()).getTime() + (request.durationDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
                        durationDays: Number(rawTripData.durationDays || rawTripData.DurationDays || request.durationDays || 7),
                        price: Number(rawTripData.price || rawTripData.Price || request.budget || 5000),
                        imageUrl: rawTripData.imageUrl || rawTripData.ImageUrl || "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80",
                        days: (rawTripData.days || rawTripData.Days || []).map((day: any) => ({
                            dayNumber: Number(day.dayNumber || day.DayNumber || 1),
                            date: day.date || day.Date || new Date().toISOString(),
                            title: day.title || day.Title || `Day ${day.dayNumber || day.DayNumber || ''}`,
                            description: day.description || day.Description || "Exciting day of exploration",
                            city: day.city || day.City || "Cairo",
                            activities: (day.dayActivities || day.activities || day.Activities || []).map((activity: any) => ({
                                destinationId: activity.destinationId || activity.DestinationId || (allowedDestinations[0]?.id || "8ad2198a-289e-4e09-a4e0-059d68b014af"),
                                activityType: mapActivityType(activity.type || activity.activityType || activity.Type || 0),
                                startTime: activity.startTime || activity.StartTime || "09:00",
                                durationHours: Number(activity.durationHours || activity.Duration || 2),
                                description: activity.description || activity.Description || "Explore and enjoy"
                            }))
                        }))
                    };

                    console.log('Trip object to send to backend:', JSON.stringify(tripObject, null, 2));

                    // Step 3: Create the trip in our backend
                    const createResult = await baseQuery({
                        url: '/Trip',
                        method: 'POST',
                        body: tripObject,
                    })

                    if (createResult.error) {
                        console.error('Backend validation error:', createResult.error)
                        return { error: createResult.error }
                    }

                    const createdTrip = (createResult.data as any)?.data || createResult.data;
                    return { data: createdTrip };
                } catch (error: any) {
                    console.error('Groq AI integration error:', error);
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: error.message || 'Failed to process Groq AI trip response',
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
            transformResponse: (response: any) => {
                return response?.data || response
            },
            invalidatesTags: ['Trip'],
        }),

        // Update trip
        updateTrip: builder.mutation<Trip, { id: string; data: CreateTripRequest }>({
            query: ({ id, data }) => ({
                url: `/Trip/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => {
                return response?.data || response
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Trip', id },
                'Trip'
            ],
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
            transformResponse: (response: any) => {
                return response?.data || response
            },
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Trip', id: tripId },
                'Trip'
            ],
        }),

        updateDay: builder.mutation<TripDay, { tripId: string; dayId: string; data: CreateDayRequest }>({
            query: ({ tripId, dayId, data }) => ({
                url: `/Trip/${tripId}/days/${dayId}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => {
                return response?.data || response
            },
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Trip', id: tripId },
                'Trip'
            ],
        }),

        deleteDay: builder.mutation<void, { tripId: string; dayId: string }>({
            query: ({ tripId, dayId }) => ({
                url: `/Trip/${tripId}/days/${dayId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Trip', id: tripId },
                'Trip'
            ],
        }),

        // Activity Operations
        addActivityToDay: builder.mutation<TripActivity, { tripId: string; dayId: string; data: CreateActivityRequest }>({
            query: ({ tripId, dayId, data }) => ({
                url: `/Trip/${tripId}/days/${dayId}/activities`,
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => {
                return response?.data || response
            },
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Trip', id: tripId },
                'Trip'
            ],
        }),

        updateActivity: builder.mutation<TripActivity, { tripId: string; dayId: string; activityId: string; data: CreateActivityRequest }>({
            query: ({ tripId, dayId, activityId, data }) => ({
                url: `/Trip/${tripId}/days/${dayId}/activities/${activityId}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => {
                return response?.data || response
            },
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Trip', id: tripId },
                'Trip'
            ],
        }),

        deleteActivity: builder.mutation<void, { tripId: string; dayId: string; activityId: string }>({
            query: ({ tripId, dayId, activityId }) => ({
                url: `/Trip/${tripId}/days/${dayId}/activities/${activityId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Trip', id: tripId },
                'Trip'
            ],
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
