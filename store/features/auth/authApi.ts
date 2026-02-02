import { api } from '../baseApi'
import {
    setCredentials,
    logoutAction,
    setLoading,
    setError,
    setUser,
    AuthResponse,
    User,
    UserPreferences
} from './authSlice'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    role: number // 0 for tourist, 1 for admin
}

// Auth API
export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Login
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/Auth/login',
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (response: any) => {
                // Backend shape: { success, data: { accessToken, refreshToken, user, expiresIn } }
                const data = response?.data || response

                // Robust role detection
                const rawUser = data?.user || data
                const rawRole = rawUser?.role !== undefined ? rawUser.role : data?.role
                const mappedRole = typeof rawRole === 'number'
                    ? (rawRole === 1 ? 'admin' : 'tourist')
                    : (String(rawRole).toLowerCase() === 'admin' ? 'admin' : 'tourist')

                // Store expiry time in localStorage
                const expiresIn = data?.expiresIn || 3600 // Default 1 hour
                const expiryTime = Date.now() + (expiresIn * 1000)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tokenExpiry', expiryTime.toString())
                }

                return {
                    user: {
                        id: rawUser?.id || data?.userId || data?.id || '',
                        name: rawUser?.name || [rawUser?.firstName, rawUser?.lastName].filter(Boolean).join(' ') || 'User',
                        email: rawUser?.email || data?.email || '',
                        role: mappedRole,
                        emailVerified: rawUser?.emailVerified,
                        createdAt: rawUser?.createdAt || '',
                        updatedAt: rawUser?.updatedAt || '',
                    } as User,
                    token: data?.accessToken || data?.token,
                    refreshToken: data?.refreshToken,
                    expiresIn,
                } as AuthResponse
            },
            onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
                dispatch(setLoading(true))
                try {
                    const { data } = await queryFulfilled
                    dispatch(setCredentials(data))
                } catch (error: any) {
                    dispatch(setLoading(false))
                    const errorMsg = error?.error?.data?.message || 'Login failed'
                    dispatch(setError(errorMsg))
                }
            }
        }),

        // Register
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: '/Auth/register',
                method: 'POST',
                body: userData,
            }),
            transformResponse: (response: any) => {
                const data = response?.data || response

                // Robust role detection
                const rawUser = data?.user || data
                const rawRole = rawUser?.role !== undefined ? rawUser.role : data?.role
                const mappedRole = typeof rawRole === 'number'
                    ? (rawRole === 1 ? 'admin' : 'tourist')
                    : (String(rawRole).toLowerCase() === 'admin' ? 'admin' : 'tourist')

                // Store expiry time in localStorage
                const expiresIn = data?.expiresIn || 3600
                const expiryTime = Date.now() + (expiresIn * 1000)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tokenExpiry', expiryTime.toString())
                }

                return {
                    user: {
                        id: data?.userId || rawUser?.id || '',
                        name: rawUser?.name || [data?.firstName || rawUser?.firstName, data?.lastName || rawUser?.lastName].filter(Boolean).join(' ') || 'User',
                        email: data?.email || rawUser?.email || '',
                        role: mappedRole,
                        emailVerified: false,
                        createdAt: '',
                        updatedAt: '',
                    } as User,
                    token: data?.accessToken || data?.token || '',
                    refreshToken: data?.refreshToken || '',
                    expiresIn,
                } as AuthResponse
            },
            onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
                dispatch(setLoading(true))
                try {
                    const { data } = await queryFulfilled
                    dispatch(setCredentials(data))
                } catch (error: any) {
                    dispatch(setLoading(false))
                    const errorMsg = error?.error?.data?.message || 'Registration failed'
                    dispatch(setError(errorMsg))
                }
            }
        }),

        // Refresh Token
        refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
            query: ({ refreshToken }) => ({
                url: '/Auth/refresh',
                method: 'POST',
                body: { refreshToken },
            }),
            transformResponse: (response: any) => {
                const data = response?.data || response
                return {
                    user: undefined as any,
                    token: data?.accessToken,
                    refreshToken: data?.refreshToken,
                } as AuthResponse
            },
        }),

        // Logout
        logout: builder.mutation<void, { refreshToken: string }>({
            query: ({ refreshToken }) => ({
                url: '/Auth/logout',
                method: 'POST',
                body: { refreshToken },
            }),
            onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled
                    dispatch(logoutAction())
                } catch {
                    // Force logout anyway on error
                    dispatch(logoutAction())
                }
            }
        }),

        // Get Current User
        getCurrentUser: builder.query<User, void>({
            query: () => '/auth/me',
            providesTags: ['User'],
            onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled
                    dispatch(setUser(data))
                } catch { }
            }
        }),

        // Update Profile
        updateProfile: builder.mutation<User, Partial<User>>({
            query: (userData) => ({
                url: '/auth/profile',
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Change Password
        changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
            query: ({ currentPassword, newPassword }) => ({
                url: '/Auth/change-password',
                method: 'POST',
                body: { currentPassword, newPassword },
            }),
        }),

        // Forgot Password
        forgotPassword: builder.mutation<void, { email: string }>({
            query: ({ email }) => ({
                url: '/Auth/forgot-password',
                method: 'POST',
                body: { email },
            }),
        }),

        // Reset Password
        resetPassword: builder.mutation<void, { email: string; otp: string; newPassword: string }>({
            query: ({ email, otp, newPassword }) => ({
                url: '/Auth/reset-password',
                method: 'POST',
                body: { email, otp, newPassword },
            }),
        }),

        // Update Preferences
        updatePreferences: builder.mutation<User, Partial<UserPreferences>>({
            query: (preferences) => ({
                url: '/auth/preferences',
                method: 'PUT',
                body: preferences,
            }),
            invalidatesTags: ['User'],
        }),

        // Verify Email
        verifyEmail: builder.mutation<{ success: boolean; message: string }, { email: string; otp: string }>({
            query: ({ email, otp }) => ({
                url: '/Auth/verify-email',
                method: 'POST',
                body: { email, otp },
            }),
        }),

        // Resend OTP
        resendOtp: builder.mutation<{ success: boolean; message: string }, { email: string }>({
            query: ({ email }) => ({
                url: '/Auth/resend-otp',
                method: 'POST',
                body: { email },
            }),
        }),
    }),
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useUpdatePreferencesMutation,
    useVerifyEmailMutation,
    useResendOtpMutation,
} = authApi

