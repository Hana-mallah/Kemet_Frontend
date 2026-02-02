"use client"

import { motion } from "framer-motion"
import { Users, MapPin, Eye, TrendingUp, Activity as ActivityIcon, ArrowUpRight, ArrowDownRight, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockAnalytics, userGrowthData, destinationViewsData } from "@/data/analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"
import { Badge } from "@/components/ui/badge"

import { useGetAdminDashboardQuery } from "@/store/features/admin/adminApi"

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useGetAdminDashboardQuery()
    const { featureUsage, systemHealth } = mockAnalytics

    const statCards = [
        {
            title: "Total Users",
            value: (stats?.totalUsers || 0).toLocaleString(),
            change: "+12%", // Fallback or dynamic if backend provides
            trend: "up",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Active Users",
            value: (stats?.activeUsers || stats?.totalUsers || 0).toLocaleString(),
            change: "+8%",
            trend: "up",
            icon: ActivityIcon,
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            title: "Total Destinations",
            value: (stats?.totalDestinations || 0).toLocaleString(),
            change: "+2 New",
            trend: "up",
            icon: MapPin,
            color: "text-gray-700",
            bg: "bg-gray-50"
        },
        {
            title: "Total Trips",
            value: (stats?.totalTrips || 0).toLocaleString(),
            change: "Stable",
            trend: "neutral",
            icon: Eye,
            color: "text-purple-500",
            bg: "bg-purple-50"
        }
    ]

    const chartData = stats?.userGrowth?.length ? stats.userGrowth : userGrowthData
    const viewsData = stats?.destinationViews?.length ? stats.destinationViews : destinationViewsData

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-gold-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold mb-2 text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500">
                            Monitor platform performance, user growth, and system health.
                        </p>
                    </div>
                    <Badge variant="outline" className="px-4 py-2 border-gray-200 bg-white text-gray-500 font-normal shadow-sm">
                        Last updated: Just now
                    </Badge>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                                <Icon className={`h-6 w-6 ${stat.color}`} />
                                            </div>
                                            {stat.change && (
                                                <Badge variant="secondary" className={`bg-white shadow-sm border ${stat.trend === "up" ? "text-green-600 border-green-100" : "text-gray-600 border-gray-100"}`}>
                                                    {stat.change} {stat.trend === "up" && <ArrowUpRight className="w-3 h-3 ml-1" />}
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                                            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* User Growth Chart */}
                    <Card className="lg:col-span-2 border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900">User Growth Analytics</CardTitle>
                            <CardDescription>Monthly active users trend over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feature Usage Radialish thing or list */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900">Feature Usage</CardTitle>
                            <CardDescription>Most used tools this week</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(Object.entries(featureUsage) as [string, number][]).map(([feature, usage], i) => (
                                <div key={feature} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium capitalize text-gray-700">{feature}</span>
                                        <span className="font-bold text-gray-900">{usage.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(usage / 15000) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={`h-full rounded-full ${i === 0 ? "bg-gray-800" :
                                                i === 1 ? "bg-gray-700" :
                                                    i === 2 ? "bg-gray-600" : "bg-gold-500"
                                                }`}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-gray-100 mt-4">
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    <span>User engagement up by 15% this week</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Destination Views */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900">Top Destinations</CardTitle>
                            <CardDescription>Most viewed location pages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={viewsData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#4B5563', fontWeight: 500 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="views" fill="#E07A5F" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Health */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900">System Health</CardTitle>
                            <CardDescription>Real-time server status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-100">
                                    <ActivityIcon className="w-8 h-8 text-green-500 mb-2" />
                                    <p className="text-gray-500 text-sm mb-1">Status</p>
                                    <p className="font-bold text-lg capitalize text-gray-900">{systemHealth.status}</p>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center border border-gray-100">
                                    <Clock className="w-8 h-8 text-blue-500 mb-2" />
                                    <p className="text-gray-500 text-sm mb-1">Uptime</p>
                                    <p className="font-bold text-lg text-gray-900">{systemHealth.uptime}%</p>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 border border-gray-100">
                                    <div className="w-full flex justify-between items-center mb-2 px-4">
                                        <span className="text-gray-500 text-sm">Response Time</span>
                                        <span className="font-bold text-gray-900">{systemHealth.responseTime}ms</span>
                                    </div>
                                    <div className="w-full px-4">
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: '35%' }} />
                                        </div>
                                        <p className="text-xs text-green-600 mt-2 text-left font-medium">Optimal performance</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    )
}
