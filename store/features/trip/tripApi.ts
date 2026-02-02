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

        // Generate trip using Google Gemini AI
        generateTripWithAI: builder.mutation<Trip, GenerateTripRequest>({
            queryFn: async (request, _api, _extraOptions, baseQuery) => {
                try {
                    console.log('Generating trip with Gemini...', request)

                    const systemPrompt = `You are an AI Trip Planning Agent for Kemet platform.
Your responsibility is to create a personalized travel plan in Egypt based strictly on a Trip Persona provided as input.
The plan should contain days and day activity in details.
Retrieve the destinations from provided destinations only.

RULES & CONSTRAINTS:
1. Focus ONLY on destinations and activities in Egypt that are in the provided list.
2. Enum values MUST be returned as STRING literals (e.g., "Solo", "Budget", "Sightseeing").
3. Field names MUST match the requested schema. Use "dayActivities" in your internal JSON structure.
4. Duration MUST match DurationDays exactly. Do NOT exceed it.
5. Prices must be estimated based on TravelStyle.

ALLOWED DESTINATIONS:
[
  { "id": "8ad2198a-289e-4e09-a4e0-059d68b014af", "name": "The Great Pyramid of Giza", "city": "Giza", "estimatedPrice": 1000 },
  { "id": "ec199de0-aa4f-479e-b852-093ac5cbc82b", "name": "Bab Zuwayla", "city": "Cairo", "estimatedPrice": 100 },
  { "id": "6ba3a297-1c23-41b6-b636-18b1f35f438c", "name": "Dahshur", "city": "Giza", "estimatedPrice": 200 },
  { "id": "11b040f6-2330-4232-9430-1e1f77125204", "name": "Giza Plateau", "city": "Giza", "estimatedPrice": 700 },
  { "id": "9af9d86c-8390-4948-a73f-238a871067db", "name": "National Museum of Egyptian Civilization(NMEC)", "city": "Cairo", "estimatedPrice": 500 },
  { "id": "d50a119d-22db-4912-a7af-2bea87e8e30f", "name": "The Royal Carriages Museum", "city": "Cairo", "estimatedPrice": 300 },
  { "id": "3031eaac-5e58-4690-b6b6-3ca7d6615029", "name": "Samiha Kamil Palace", "city": "Cairo", "estimatedPrice": 10 },
  { "id": "a78ab2c9-9067-45e4-b870-867351188b12", "name": "National Military Museum", "city": "Cairo", "estimatedPrice": 200 },
  { "id": "33e8bc26-7cb5-4eec-9146-87afe3126461", "name": "Al-Mu'izz Street Heritage Sites", "city": "Cairo", "estimatedPrice": 220 },
  { "id": "747c8d86-640e-483b-ad97-8bdce0abd180", "name": "Grand Egyptian museum", "city": "Giza", "estimatedPrice": 1450 },
  { "id": "8c904950-1fda-4b46-a12f-900792ce760d", "name": "Imhotep Museum", "city": "Cairo", "estimatedPrice": 600 },
  { "id": "9ac3489f-a41c-4067-89e7-94c095436c82", "name": "Madrasa and Mausoleum of al-Saleh Najm al-Din Ayyub", "city": "Cairo", "estimatedPrice": 220 },
  { "id": "dde1681f-52de-4c62-8938-9d65885fc74b", "name": "Baron Empain Palace", "city": "Cairo", "estimatedPrice": 220 },
  { "id": "18285f23-5f3b-431a-baeb-9ef6785f78eb", "name": "Gayer-Anderson Museum", "city": "Cairo", "estimatedPrice": 100 },
  { "id": "0dda8961-390c-4b61-8d52-9fa38dafc9ee", "name": "Church of Saint Sergius and Bacchus", "city": "Old Cairo", "estimatedPrice": 0 },
  { "id": "65851b5e-f5d9-4f35-9182-ab3798bd40ce", "name": "Manial Palace Museum", "city": "Cairo", "estimatedPrice": 220 },
  { "id": "a303441e-e3c5-4314-bd18-af0038f333fd", "name": "Museum of Islamic Art", "city": "Cairo", "estimatedPrice": 340 },
  { "id": "2f3eca59-2cf8-41b1-bdc5-ba2dda5d9490", "name": "Helwan Corner Museum", "city": "Cairo", "estimatedPrice": 100 },
  { "id": "88ded194-52e7-4ac2-8bab-c891edebf7c2", "name": "The Mosque of ‘Amr ibn al-‘As", "city": "Old Cairo", "estimatedPrice": 0 },
  { "id": "cb38d877-2897-454c-8b19-c9f0fdd954d2", "name": "Mary’s Tree", "city": "Cairo", "estimatedPrice": 100 },
  { "id": "48966aaa-733e-4380-9247-cc29f175863b", "name": "Rawda Island Nilometer", "city": "Old Cairo", "estimatedPrice": 120 },
  { "id": "0458c5f3-2b8a-4189-8598-d2c07e9e3bf2", "name": "The Egyptian Museum", "city": "Cairo", "estimatedPrice": 550 },
  { "id": "ab214538-6129-4d51-ae5a-e27a335400c4", "name": "National Police Museum", "city": "Cairo", "estimatedPrice": 200 },
  { "id": "78b068fb-e4b0-4d08-ba4f-ebb6993b3279", "name": "Cairo Citadel", "city": "Cairo", "estimatedPrice": 550 },
  { "id": "27078ad8-5e91-4858-9434-eea2b4741b41", "name": "The Coptic Museum", "city": "Cairo", "estimatedPrice": 280 },
  { "id": "24037219-b41a-44d8-926a-fe8b7140444c", "name": "Tomb of the Two Brothers", "city": "Giza", "estimatedPrice": 600 }
]

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

                    // Step 1: Call Gemini API (using v1 with gemini-2.5-flash)
                    const geminiResponse = await fetch(
                        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyD8bMPZ4Ddc84ziYcVSJMMMNXOiar2F_fc`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{ text: systemPrompt + "\n\n" + userPrompt + "\n\nIMPORTANT: Return ONLY raw JSON. Do not include markdown formatting or explanations." }]
                                }]
                            }),
                        }
                    )

                    if (!geminiResponse.ok) {
                        const errorData = await geminiResponse.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || 'Failed to generate trip with Gemini');
                    }

                    const geminiData = await geminiResponse.json();
                    let contentText = geminiData.candidates[0].content.parts[0].text;

                    // --- Robust JSON Extraction ---
                    // Handles cases where Gemini might wrap output in ```json ... ``` blocks
                    if (contentText.includes('```')) {
                        const match = contentText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                        if (match && match[1]) {
                            contentText = match[1];
                        }
                    }

                    let rawTripData = JSON.parse(contentText.trim());

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
                                 destinationId: activity.destinationId || activity.DestinationId || "8ad2198a-289e-4e09-a4e0-059d68b014af",
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
                    console.error('Gemini integration error:', error);
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: error.message || 'Failed to process Gemini trip response',
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
