import { api } from '../baseApi'

export interface AdminUser {
    id: string
    userName?: string
    firstName?: string
    lastName?: string
    email: string
    role: string
    created_at: string
}

export interface DashboardStats {
    totalUsers: number
    activeUsers: number
    totalTrips: number
    totalDestinations: number
    totalPlaces: number
    totalVirtualTours: number
    userGrowth: Array<{ month: string; users: number }>
    destinationViews: Array<{ name: string; views: number }>
    recentActivities: any[]
}

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/Dashboard
        getAdminDashboard: builder.query<DashboardStats, void>({
            query: () => '/Dashboard',
            transformResponse: (response: any) => response.data || response,
            providesTags: ['AdminDashboard'],
        }),

        // GET /api/Admin/users
        getAdminUsers: builder.query<AdminUser[], void>({
            query: () => '/Admin/users',
            transformResponse: (response: any) => {
                return response?.data || response
            },
            providesTags: ['Users'],
        }),

        // PATCH /api/Admin/users/{userId}/role
        updateUserRole: builder.mutation<void, { userId: string; newRole: string }>({
            query: ({ userId, newRole }) => ({
                url: `/Admin/users/${userId}/role`,
                method: 'PATCH',
                body: { newRole },
            }),
            invalidatesTags: ['Users'],
        }),
    }),
})

export const {
    useGetAdminDashboardQuery,
    useGetAdminUsersQuery,
    useUpdateUserRoleMutation,
} = adminApi
