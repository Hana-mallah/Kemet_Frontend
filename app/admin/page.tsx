"use client"

import { motion } from "framer-motion"
import { Users, Eye, TrendingUp, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockAnalytics, userGrowthData, destinationViewsData } from "@/data/analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { useGetAdminDashboardQuery } from "@/store/features/admin/adminApi"

export default function AdminDashboardPage() {
    const { data: stats, isLoading, isSuccess, refetch } = useGetAdminDashboardQuery()

    const statCards = [
        {
            title: "Total Users",
            value: isSuccess ? stats.totalUsers.toLocaleString() : "---",
            change: isSuccess ? `+${stats.growthRate}%` : "---",
            trend: "up",
            icon: Users,
            color: "text-[#1C2B6A]",
            bg: "bg-blue-50"
        },
        {
            title: "Total Views",
            value: isSuccess ? stats.totalViews.toLocaleString() : "---",
            change: "+8%",
            trend: "up",
            icon: Eye,
            color: "text-[#1C2B6A]",
            bg: "bg-green-50"
        },
        {
            title: "Growth Rate",
            value: isSuccess ? `${stats.growthRate}%` : "---",
            change: "Target 100%",
            trend: "up",
            icon: TrendingUp,
            color: "text-[#1C2B6A]",
            bg: "bg-purple-50"
        }
    ]

    const chartData = stats?.userGrowth?.length ? stats.userGrowth : userGrowthData
    const viewsData = stats?.destinationViews?.length ? stats.destinationViews : destinationViewsData

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-[#1C2B6A]"></div>
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
                        <h1 className="font-display text-3xl font-bold mb-2 text-bronze">Dashboard Overview</h1>
                        <p className="text-bronze/70">
                            Live platform performance and user engagement metrics.
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

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                                            <p className="text-sm text-bronze/70 font-medium mb-1">{stat.title}</p>
                                            <h3 className="text-3xl font-bold text-bronze">{stat.value}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 gap-8 mb-8">
                    {/* User Growth Chart */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-bronze">User Growth Analytics</CardTitle>
                            <CardDescription>Monthly active users trend over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1C2B6A" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#1C2B6A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="#1C2B6A" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-8 mb-8">
                    {/* Destination Views */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-bronze">Top Destinations</CardTitle>
                            <CardDescription>Most viewed location pages based on popularity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={viewsData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{ fill: '#4B5563', fontWeight: 500 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="views" fill="#d5bb88" radius={[0, 4, 4, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div >
        </div >
    )
}
