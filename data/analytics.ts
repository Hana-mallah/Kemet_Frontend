import { AnalyticsData } from "@/types"

export const mockAnalytics: AnalyticsData = {
    userStats: {
        total: 16,
        active: 10,
        new: 4,
        growth: 100
    },
    destinationStats: {
        mostVisited: [
            { name: "The Great Pyramid of Giza", visits: 535 },
            { name: "Ben ‘Ezra Synagogue", visits: 432 },
            { name: "Bab Zuwayla", visits: 131 },
            { name: "Dahshur", visits: 120 },
            { name: "Giza Plateau", visits: 109 }
        ],
        totalViews: 3707
    },
    featureUsage: {
        chatbot: 0,
        vrTours: 0,
        taxiEstimator: 0,
        translator: 0
    },
    systemHealth: {
        status: "healthy",
        uptime: 99.9,
        responseTime: 120
    }
}

// Time series data for charts
export const userGrowthData = [
    { month: "Nov", users: 0 },
    { month: "Dec", users: 0 },
    { month: "Jan", users: 6 },
    { month: "Feb", users: 11 },
    { month: "Mar", users: 12 },
    { month: "Apr", users: 12 },
    { month: "May", users: 16 }
]

export const destinationViewsData = [
    { name: "Great Pyramid", views: 535 },
    { name: "Synagogue", views: 432 },
    { name: "Bab Zuwayla", views: 131 },
    { name: "Dahshur", views: 120 },
    { name: "Giza Plateau", views: 109 }
]

export const featureUsageData = [
    { feature: "Chatbot", usage: 0 },
    { feature: "VR Tours", usage: 0 },
    { feature: "Taxi Estimator", usage: 0 },
    { feature: "Translator", usage: 0 }
]

export const dailyActivityData = [
    { day: "Mon", activities: 36 },
    { day: "Tue", activities: 25 },
    { day: "Wed", activities: 36 },
    { day: "Thu", activities: 6 },
    { day: "Fri", activities: 18 },
    { day: "Sat", activities: 2 },
    { day: "Sun", activities: 33 }
]
