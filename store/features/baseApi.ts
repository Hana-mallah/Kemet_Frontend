import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logoutAction, tokenRefreshed } from './auth/authSlice'

// Base API configuration
const isBrowser = typeof window !== 'undefined'

const safeGetItem = (key: string): string | null => {
    if (!isBrowser) return null
    try {
        return window.localStorage.getItem(key)
    } catch {
        return null
    }
}

const safeSetItem = (key: string, value: string) => {
    if (!isBrowser) return
    try {
        window.localStorage.setItem(key, value)
    } catch { }
}

const safeRemoveItem = (key: string) => {
    if (!isBrowser) return
    try {
        window.localStorage.removeItem(key)
    } catch { }
}

// Check if token is expired
const isTokenExpired = (): boolean => {
    const expiryTime = safeGetItem('tokenExpiry')
    if (!expiryTime) return true

    const now = Date.now()
    const expiry = parseInt(expiryTime, 10)

    // Token is expired if current time is past expiry
    return now >= expiry
}

// Check if token needs refresh (5 minutes before expiry)
const shouldRefreshToken = (): boolean => {
    const expiryTime = safeGetItem('tokenExpiry')
    if (!expiryTime) return false

    const now = Date.now()
    const expiry = parseInt(expiryTime, 10)
    const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

    // Refresh if less than 5 minutes until expiry (or already expired)
    return (expiry - now) < fiveMinutes
}

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://kemeteg.runasp.net/api',
    prepareHeaders: (headers, { getState }) => {
        // Get token from Redux store or localStorage (SSR-safe)
        const token = (getState() as any)?.auth?.token || safeGetItem('token')

        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }

        headers.set('content-type', 'application/json')
        return headers
    },
})

// Enhanced base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    // Check if we should proactively refresh the token
    if (shouldRefreshToken()) {
        console.log('Token expiring soon, refreshing proactively...')
        const refreshToken = safeGetItem('refreshToken')

        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: '/Auth/refresh',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            )

            if (refreshResult.data) {
                const rr = refreshResult.data as any
                const data = rr?.data || rr
                const newToken = data?.accessToken
                const newRefreshToken = data?.refreshToken
                const expiresIn = data?.expiresIn || 3600 // Default 1 hour if not provided

                if (newToken) {
                    safeSetItem('token', newToken)

                    // Update refresh token if provided
                    if (newRefreshToken) {
                        safeSetItem('refreshToken', newRefreshToken)
                    }

                    // Calculate and store expiry time
                    const expiryTime = Date.now() + (expiresIn * 1000)
                    safeSetItem('tokenExpiry', expiryTime.toString())

                    // CRITICAL: Update Redux state immediately so retries use new token
                    api.dispatch(tokenRefreshed({
                        token: newToken,
                        refreshToken: newRefreshToken || refreshToken,
                        expiresIn
                    }))

                    console.log('Token refreshed successfully')
                }
            }
        }
    }

    let result = await baseQuery(args, api, extraOptions)

    // Handle 401 unauthorized - try to refresh token
    if (result.error && result.error.status === 401) {
        console.log('Unauthorized (401), attempting to refresh token...')

        // Try to get refresh token
        const refreshToken = safeGetItem('refreshToken')
        if (refreshToken && !isTokenExpired()) {
            const refreshResult = await baseQuery(
                {
                    url: '/Auth/refresh',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            )

            if (refreshResult.data) {
                // Store new tokens
                const rr = refreshResult.data as any
                const data = rr?.data || rr
                const newToken = data?.accessToken
                const newRefreshToken = data?.refreshToken
                const expiresIn = data?.expiresIn || 3600

                if (newToken) {
                    safeSetItem('token', newToken)

                    if (newRefreshToken) {
                        safeSetItem('refreshToken', newRefreshToken)
                    }

                    const expiryTime = Date.now() + (expiresIn * 1000)
                    safeSetItem('tokenExpiry', expiryTime.toString())

                    // CRITICAL: Update Redux state immediately so retry uses new token
                    api.dispatch(tokenRefreshed({
                        token: newToken,
                        refreshToken: newRefreshToken || refreshToken,
                        expiresIn
                    }))

                    // Retry the original request with new token
                    result = await baseQuery(args, api, extraOptions)
                    console.log('Token refreshed and request retried')
                }
            } else {
                // Refresh failed, logout user
                console.log('Token refresh failed, logging out...')
                safeRemoveItem('token')
                safeRemoveItem('refreshToken')
                safeRemoveItem('tokenExpiry')

                // Dispatch logout action
                api.dispatch(logoutAction())

                if (isBrowser) {
                    window.location.href = '/login'
                }
            }
        } else {
            // No refresh token or token expired, logout
            console.log('No valid refresh token, logging out...')
            safeRemoveItem('token')
            safeRemoveItem('refreshToken')
            safeRemoveItem('tokenExpiry')

            api.dispatch(logoutAction())

            if (isBrowser) {
                window.location.href = '/login'
            }
        }
    }

    return result
}

// Create base API slice
export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'User',
        'Auth',
        'TravelPlan',
        'Destination',
        'Category',
        'Analytics',
        'Booking',
        'Review',
        'Preference',
        'Notification',
        'Favorites',
        'Trip',
        'AdminDashboard',
        'Users',
    ],
    endpoints: () => ({}),
})

export default api
