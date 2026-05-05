import { api } from '../baseApi'

// Types
export interface Destination {
    id: string
    name: string
    city: string
    description: string
    imageUrl: string
    vrUrlImage: string
    estimatedPrice?: number
    fromWorkingHours?: string
    endWorkingHours?: string
    categoryId?: string
    isFavorite?: boolean // Client-side helper
}

export interface DestinationFilters {
    search?: string
}

// Destinations API
export const destinationsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all destinations
        getDestinations: builder.query<Destination[], void>({
            query: () => '/Destinations',
            transformResponse: (response: any) => {
                const data = response?.data || response
                return (Array.isArray(data) ? data : []).map((item: any) => ({
                    ...item,
                    id: item.id || item.Id || item.destinationId || '',
                    categoryId: item.categoryId || item.CategoryId || item.category?.id || item.Category?.id || ''
                }))
            },
            providesTags: ['Destination'],
        }),

        // Get specific destination by ID
        getDestination: builder.query<Destination, string>({
            query: (id) => `/Destinations/${id}`,
            transformResponse: (response: any) => {
                const data = response?.data || response
                return {
                    ...data,
                    id: data.id || data.Id || data.destinationId || '',
                    categoryId: data.categoryId || data.CategoryId || data.category?.id || data.Category?.id || ''
                }
            },
            providesTags: (result, error, id) => [{ type: 'Destination', id }],
        }),

        // Create destination (admin only)
        createDestination: builder.mutation<Destination, Omit<Destination, 'id'>>({
            query: (destinationData) => ({
                url: '/Destinations',
                method: 'POST',
                body: destinationData,
            }),
            invalidatesTags: ['Destination'],
        }),

        // Update destination (admin only)
        updateDestination: builder.mutation<Destination, { id: string; data: Omit<Destination, 'id'> }>({
            query: ({ id, data }) => ({
                url: `/Destinations/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Destination', id },
                'Destination'
            ],
        }),

        // Delete destination (admin only)
        deleteDestination: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Destinations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Destination'],
        }),

        // Favorite Endpoints
        addFavorite: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/Destinations/${id}/favorite`,
                method: 'POST',
                body: {}, // Some servers require a body even if empty
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Destination', id }, 'Favorites'],
        }),

        removeFavorite: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/Destinations/${id}/favorite`,
                method: 'DELETE',
                body: {}, // Some servers require a body even if empty
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Destination', id }, 'Favorites'],
        }),

        getFavorites: builder.query<Destination[], void>({
            query: () => '/Destinations/favorites',
            transformResponse: (response: any) => {
                const data = response?.data || response
                const list = Array.isArray(data) ? data : []
                return list.map((item: any) => {
                    // Extract destination if wrapped (some APIs return { destination: {...} })
                    const dest = item.destination || item
                    return {
                        ...dest,
                        id: dest.id || dest.Id || dest.destinationId || item.id || item.Id || item.destinationId || ''
                    }
                })
            },
            providesTags: ['Favorites'],
        }),
    }),
})

export const {
    useGetDestinationsQuery,
    useGetDestinationQuery,
    useCreateDestinationMutation,
    useUpdateDestinationMutation,
    useDeleteDestinationMutation,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
    useGetFavoritesQuery,
} = destinationsApi
