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
    totalViews: number
    growthRate: number
    featureUses: number
    userGrowth: Array<{ month: string; users: number }>
    destinationViews: Array<{ name: string; views: number }>
    featureUsage: Array<{ feature: string; usage: number }>
    dailyActivity: Array<{ day: string; activities: number }>
    recentActivities?: any[]
}

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/Dashboard
        getAdminDashboard: builder.query<DashboardStats, void>({
            query: () => '/Dashboard',
            transformResponse: (response: any) => {
                // Handle different response structures (data wrapper or direct)
                const data = response.data || response;
                
                // Extract summary data (checking both nested and root)
                const summary = data.summary || data;
                
                // Calculate cumulative users for growth chart if newUsers is provided
                let cumulativeUsers = 0;
                const userGrowthTrend = data.userGrowthTrend || data.userGrowth || [];
                const userGrowth = userGrowthTrend.map((item: any) => {
                    // If the API already provides cumulative 'users', use it
                    if (item.users !== undefined) return { month: item.month, users: item.users };
                    
                    // Otherwise calculate from newUsers
                    cumulativeUsers += item.newUsers || 0;
                    return {
                        month: item.month,
                        users: cumulativeUsers
                    };
                });

                return {
                    totalUsers: summary.totalUsers || 0,
                    totalViews: summary.totalViews || 0,
                    growthRate: summary.growthRate || 0,
                    featureUses: summary.featureUses || 0,
                    userGrowth,
                    destinationViews: (data.destinationPopularity || data.destinationViews || []).map((item: any) => ({
                        name: item.name,
                        views: item.count || item.views || 0
                    })),
                    featureUsage: (data.featureUsageDistribution || data.featureUsage || []).map((item: any) => ({
                        feature: item.featureName || item.feature,
                        usage: item.usageCount || item.usage || 0
                    })),
                    dailyActivity: (data.dailyActivity || []).map((item: any) => ({
                        day: item.day,
                        activities: item.activityCount || item.activities || 0
                    })),
                    recentActivities: data.recentActivities || []
                };
            },
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
