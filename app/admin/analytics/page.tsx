"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { userGrowthData, destinationViewsData, dailyActivityData } from "@/data/analytics"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { useGetAdminDashboardQuery } from "@/store/features/admin/adminApi"

export default function AdminAnalyticsPage() {
    const { data: stats, isLoading, isSuccess, refetch } = useGetAdminDashboardQuery()

    const chartData = stats?.userGrowth?.length ? stats.userGrowth : userGrowthData
    const viewsData = stats?.destinationViews?.length ? stats.destinationViews : destinationViewsData
    const dailyData = stats?.dailyActivity?.length ? stats.dailyActivity : dailyActivityData

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-[#1C2B6A]"></div>
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
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-display text-4xl font-bold mb-2 text-bronze">Performance Analytics</h1>
                        <p className="text-xl text-bronze/70">
                            Detailed insights into platform performance and user engagement.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSuccess && (
                            <Badge variant="outline" className="px-3 py-1.5 border-green-200 bg-green-50 text-green-700 font-bold flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live Data
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="px-4 py-2 border-gray-200 bg-white text-bronze/60 font-normal shadow-sm hover:bg-gray-50"
                        >
                            Refetch
                        </Button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Growth */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-gray-900">
                                <TrendingUp className="h-5 w-5 mr-2 text-[#1C2B6A]" />
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
                                    <Line type="monotone" dataKey="users" stroke="#1C2B6A" strokeWidth={3} dot={{ r: 4, fill: '#1C2B6A' }} activeDot={{ r: 6 }} name="Total Users" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Destination Popularity */}
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

                    {/* Daily Activity - Full Width Now */}
                    <Card className="lg:col-span-2 border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-gray-900">
                                <Users className="h-5 w-5 mr-2 text-[#1C2B6A]" />
                                Daily Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyData}>
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
            </motion.div>
        </div>
    )
}
