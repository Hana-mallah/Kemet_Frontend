"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Eye, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userGrowthData, destinationViewsData, featureUsageData, dailyActivityData } from "@/data/analytics"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { useGetAdminDashboardQuery } from "@/store/features/admin/adminApi"

export default function AdminAnalyticsPage() {
    const { data: stats, isLoading } = useGetAdminDashboardQuery()
    const COLORS = ["#D4AF37", "#E07A5F", "#2A6F97", "#F4E4C1"]

    const chartData = stats?.userGrowth?.length ? stats.userGrowth : userGrowthData
    const viewsData = stats?.destinationViews?.length ? stats.destinationViews : destinationViewsData
    const featureData = Object.entries(featureUsageData).map(([feature, usage]) => ({ feature, usage }))

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-gold-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold mb-2 text-gray-900">Analytics</h1>
                    <p className="text-xl text-gray-500">
                        Detailed insights into platform performance and user engagement.
                    </p>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Growth */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-gray-900">
                                <TrendingUp className="h-5 w-5 mr-2 text-gold-600" />
                                User Growth Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" />
                                    <Line type="monotone" dataKey="users" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} activeDot={{ r: 6 }} name="Total Users" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Destination Views */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-gray-900">
                                <Eye className="h-5 w-5 mr-2 text-terracotta-500" />
                                Destination Popularity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={viewsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8f9fa' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="views" fill="#E07A5F" radius={[4, 4, 0, 0]} name="Views" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Feature Usage */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-gray-900">
                                <Activity className="h-5 w-5 mr-2 text-nile-600" />
                                Feature Usage Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={featureData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ feature, percent }) => `${feature} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        innerRadius={60}
                                        paddingAngle={5}
                                        dataKey="usage"
                                    >
                                        {featureData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Daily Activity */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-gray-900">
                                <Users className="h-5 w-5 mr-2 text-gold-600" />
                                Daily Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyActivityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8f9fa' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="activities" fill="#2A6F97" radius={[4, 4, 0, 0]} name="Activities" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Stats */}
                <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm overflow-hidden mt-8">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-gray-900">Summary Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="text-center p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gold-200 transition-colors group">
                                <p className="text-4xl font-bold text-gold-600 mb-1 group-hover:scale-110 transition-transform">{(stats?.totalUsers || 15420).toLocaleString()}</p>
                                <p className="text-gray-500 font-medium">Total Users</p>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-terracotta-200 transition-colors group">
                                <p className="text-4xl font-bold text-terracotta-500 mb-1 group-hover:scale-110 transition-transform">{(stats?.totalTrips || 45680).toLocaleString()}</p>
                                <p className="text-gray-500 font-medium">Total Trips</p>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-nile-200 transition-colors group">
                                <p className="text-4xl font-bold text-nile-600 mb-1 group-hover:scale-110 transition-transform">{(stats?.totalDestinations || 33470).toLocaleString()}</p>
                                <p className="text-gray-500 font-medium">Destinations</p>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-green-200 transition-colors group">
                                <p className="text-4xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform">12.5%</p>
                                <p className="text-gray-500 font-medium">Growth Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
