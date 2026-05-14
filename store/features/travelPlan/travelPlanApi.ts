import { api } from '../baseApi'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TravelPlan, TravelDay, PlannedActivity } from '@/types'

// Types - using the ones from @/types
export interface TripPreferences {
    tripType: string
    groupSize: string
    duration: string
    budget: string
    interests: string[]
    accommodation: string
    transportation: string
    pace: string
    name: string
}

export interface TravelPlanState {
    plans: TravelPlan[]
    currentPlan: TravelPlan | null
    isLoading: boolean
    error: string | null
}

// Travel Plan API
export const travelPlanApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Get all travel plans for user
        getTravelPlans: builder.query<TravelPlan[], void>({
            query: () => '/travel-plans',
            providesTags: ['TravelPlan'],
        }),

        // Get specific travel plan
        getTravelPlan: builder.query<TravelPlan, string>({
            query: (id) => `/travel-plans/${id}`,
            providesTags: (result, error, id) => [{ type: 'TravelPlan', id }],
        }),

        // Create new travel plan
        createTravelPlan: builder.mutation<TravelPlan, Partial<TravelPlan>>({
            query: (planData) => ({
                url: '/travel-plans',
                method: 'POST',
                body: planData,
            }),
            invalidatesTags: ['TravelPlan'],
        }),

        // Update travel plan
        updateTravelPlan: builder.mutation<TravelPlan, { id: string; data: Partial<TravelPlan> }>({
            query: ({ id, data }) => ({
                url: `/travel-plans/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'TravelPlan', id }],
        }),

        // Delete travel plan
        deleteTravelPlan: builder.mutation<void, string>({
            query: (id) => ({
                url: `/travel-plans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TravelPlan'],
        }),

        // Add activity to day
        addActivity: builder.mutation<PlannedActivity, { planId: string; dayId: number; activity: Partial<PlannedActivity> }>({
            query: ({ planId, dayId, activity }) => ({
                url: `/travel-plans/${planId}/days/${dayId}/activities`,
                method: 'POST',
                body: activity,
            }),
            invalidatesTags: (result, error, { planId }) => [{ type: 'TravelPlan', id: planId }],
        }),

        // Update activity
        updateActivity: builder.mutation<PlannedActivity, { planId: string; dayId: number; activityId: string; data: Partial<PlannedActivity> }>({
            query: ({ planId, dayId, activityId, data }) => ({
                url: `/travel-plans/${planId}/days/${dayId}/activities/${activityId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { planId }) => [{ type: 'TravelPlan', id: planId }],
        }),

        // Delete activity
        deleteActivity: builder.mutation<void, { planId: string; dayId: number; activityId: string }>({
            query: ({ planId, dayId, activityId }) => ({
                url: `/travel-plans/${planId}/days/${dayId}/activities/${activityId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { planId }) => [{ type: 'TravelPlan', id: planId }],
        }),

        // Generate AI travel plan
        generateTravelPlan: builder.mutation<TravelPlan, TripPreferences>({
            query: (preferences) => ({
                url: '/travel-plans/generate',
                method: 'POST',
                body: preferences,
            }),
            invalidatesTags: ['TravelPlan'],
        }),

        // Get travel plan suggestions
        getTravelSuggestions: builder.query<any[], { preferences: Partial<TripPreferences> }>({
            query: ({ preferences }) => ({
                url: '/travel-plans/suggestions',
                method: 'POST',
                body: preferences,
            }),
        }),

        // Export travel plan
        exportTravelPlan: builder.mutation<Blob, { id: string; format: 'pdf' | 'json' | 'ical' }>({
            query: ({ id, format }) => ({
                url: `/travel-plans/${id}/export?format=${format}`,
                method: 'GET',
                responseHandler: (response: any) => response.blob(),
            }),
        }),

        // Share travel plan
        shareTravelPlan: builder.mutation<{ shareUrl: string }, { id: string; permissions: string[] }>({
            query: ({ id, permissions }) => ({
                url: `/travel-plans/${id}/share`,
                method: 'POST',
                body: { permissions },
            }),
        }),

        // Duplicate travel plan
        duplicateTravelPlan: builder.mutation<TravelPlan, string>({
            query: (id) => ({
                url: `/travel-plans/${id}/duplicate`,
                method: 'POST',
            }),
            invalidatesTags: ['TravelPlan'],
        }),
    }),
})

export const {
    useGetTravelPlansQuery,
    useGetTravelPlanQuery,
    useCreateTravelPlanMutation,
    useUpdateTravelPlanMutation,
    useDeleteTravelPlanMutation,
    useAddActivityMutation,
    useUpdateActivityMutation,
    useDeleteActivityMutation,
    useGenerateTravelPlanMutation,
    useGetTravelSuggestionsQuery,
    useExportTravelPlanMutation,
    useShareTravelPlanMutation,
    useDuplicateTravelPlanMutation,
} = travelPlanApi

// Travel Plan Slice
const initialState: TravelPlanState = {
    plans: [],
    currentPlan: null,
    isLoading: false,
    error: null,
}

const travelPlanSlice = createSlice({
    name: 'travelPlan',
    initialState,
    reducers: {
        setCurrentPlan: (state, action: PayloadAction<TravelPlan | null>) => {
            state.currentPlan = action.payload
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
        addPlan: (state, action: PayloadAction<TravelPlan>) => {
            state.plans.push(action.payload)
        },
        updatePlan: (state, action: PayloadAction<TravelPlan>) => {
            const index = state.plans.findIndex(plan => plan.id === action.payload.id)
            if (index !== -1) {
                state.plans[index] = action.payload
            }
            if (state.currentPlan?.id === action.payload.id) {
                state.currentPlan = action.payload
            }
        },
        removePlan: (state, action: PayloadAction<string>) => {
            state.plans = state.plans.filter(plan => plan.id !== action.payload)
            if (state.currentPlan?.id === action.payload) {
                state.currentPlan = null
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Travel Plans
            .addMatcher(
                travelPlanApi.endpoints.getTravelPlans.matchPending,
                (state) => {
                    state.isLoading = true
                    state.error = null
                }
            )
            .addMatcher(
                travelPlanApi.endpoints.getTravelPlans.matchFulfilled,
                (state, action) => {
                    state.isLoading = false
                    state.plans = action.payload
                }
            )
            .addMatcher(
                travelPlanApi.endpoints.getTravelPlans.matchRejected,
                (state, action) => {
                    state.isLoading = false
                    state.error = action.error?.message || 'Failed to fetch travel plans'
                }
            )
            // Get Travel Plan
            .addMatcher(
                travelPlanApi.endpoints.getTravelPlan.matchFulfilled,
                (state, action) => {
                    state.currentPlan = action.payload
                }
            )
            // Create Travel Plan
            .addMatcher(
                travelPlanApi.endpoints.createTravelPlan.matchFulfilled,
                (state, action) => {
                    state.plans.push(action.payload)
                    state.currentPlan = action.payload
                }
            )
            // Update Travel Plan
            .addMatcher(
                travelPlanApi.endpoints.updateTravelPlan.matchFulfilled,
                (state, action) => {
                    travelPlanSlice.caseReducers.updatePlan(state, action)
                }
            )
            // Delete Travel Plan
            .addMatcher(
                travelPlanApi.endpoints.deleteTravelPlan.matchFulfilled,
                (state, action) => {
                    const planId = action.meta.arg.originalArgs
                    state.plans = state.plans.filter(plan => plan.id !== planId)
                    if (state.currentPlan?.id === planId) {
                        state.currentPlan = null
                    }
                }
            )
    },
})

export const {
    setCurrentPlan,
    setLoading,
    setError,
    clearError,
    addPlan,
    updatePlan,
    removePlan,
} = travelPlanSlice.actions

export default travelPlanSlice.reducer

// Selectors
export const selectTravelPlan = (state: { travelPlan: TravelPlanState }) => state.travelPlan
export const selectPlans = (state: { travelPlan: TravelPlanState }) => state.travelPlan.plans
export const selectCurrentPlan = (state: { travelPlan: TravelPlanState }) => state.travelPlan.currentPlan
export const selectIsLoading = (state: { travelPlan: TravelPlanState }) => state.travelPlan.isLoading
export const selectError = (state: { travelPlan: TravelPlanState }) => state.travelPlan.error

// Custom hook
// This hook is defined separately to avoid circular dependencies
export const useTravelPlan = () => {
    // This will be defined in a separate hooks file to avoid circular imports
    throw new Error('useTravelPlan hook should be imported from @/store/hooks')
}
