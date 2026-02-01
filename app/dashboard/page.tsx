"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Map, MessageSquare, Languages, Sparkles, Calendar, MapPin, Clock, TrendingUp, Compass, Heart, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useTravelPlanContext } from "@/contexts/TravelPlanContext"
import { useGetFavoritesQuery } from "@/store/features/destinations/destinationsApi"

export default function DashboardPage() {
    const { user } = useAuth()
    const { travelPlan } = useTravelPlanContext()
    const { data: favorites = [], isLoading: isFavoritesLoading } = useGetFavoritesQuery()
    const [greeting, setGreeting] = useState("Hello")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const hour = new Date().getHours()
        if (hour < 12) {
            setGreeting('Good Morning')
        } else if (hour < 18) {
            setGreeting('Good Afternoon')
        } else {
            setGreeting('Good Evening')
        }
    }, [])

    const quickActions = [
        {
            title: "Travel Planner",
            description: "Create your itinerary",
            icon: Map,
            href: "/dashboard/trip-planner",
            gradient: "from-blue-500 to-cyan-500",
            iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
        },
        {
            title: "AI Assistant",
            description: "Get instant help",
            icon: MessageSquare,
            href: "/dashboard/chatbot",
            gradient: "from-purple-500 to-pink-500",
            iconBg: "bg-gradient-to-br from-purple-500 to-pink-500"
        },
        {
            title: "Translator",
            description: "Translate phrases",
            icon: Languages,
            href: "/dashboard/translator",
            gradient: "from-orange-500 to-red-500",
            iconBg: "bg-gradient-to-br from-orange-500 to-red-500"
        },
        {
            title: "My Favorites",
            description: "Saved destinations",
            icon: Heart,
            href: "/dashboard/favorites",
            gradient: "from-red-500 to-orange-500",
            iconBg: "bg-gradient-to-br from-red-500 to-orange-500"
        }
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
            >
                {/* Header */}
                <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2 leading-tight">
                            {mounted ? `${greeting}, ${user?.name?.split(" ")[0]} 👋` : 'Welcome'}
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg">
                            Ready to explore Egypt&apos;s wonders?
                        </p>
                    </div>
                    <Link href="/dashboard/trip-planner" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 h-14 px-8 rounded-xl group text-base">
                            <Compass className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                            Plan New Trip
                        </Button>
                    </Link>
                </motion.div>

                {/* Travel Plan Widget */}
                <motion.div variants={item}>
                    {travelPlan ? (
                        <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-blue-100 mb-3">
                                            <Calendar className="w-5 h-5" />
                                            <span className="text-sm font-semibold uppercase tracking-wider">Active Trip</span>
                                        </div>
                                        <h2 className="font-display text-3xl font-bold mb-6">{travelPlan.name}</h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-white/10 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/20">
                                                <div className="flex items-center gap-2 text-blue-100 mb-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs font-medium uppercase">Dates</span>
                                                </div>
                                                <p className="font-semibold text-lg">
                                                    {new Date(travelPlan.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(travelPlan.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/20">
                                                <div className="flex items-center gap-2 text-blue-100 mb-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-medium uppercase">Duration</span>
                                                </div>
                                                <p className="font-semibold text-lg">{travelPlan.days.length} Days</p>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/20">
                                                <div className="flex items-center gap-2 text-blue-100 mb-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="text-xs font-medium uppercase">Status</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                    <span className="font-semibold text-lg capitalize">{travelPlan.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href="/dashboard/travel-plan" className="w-full md:w-auto">
                                        <Button size="lg" className="w-full md:w-auto bg-white text-blue-700 hover:bg-gray-50 border-none shadow-xl h-14 px-8 rounded-xl font-semibold group">
                                            View Itinerary
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm hover:border-blue-400 hover:bg-white/80 transition-all duration-300">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Map className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-2xl mb-3 text-gray-900">No Active Trip</h3>
                                <p className="text-gray-600 max-w-md mb-8 text-lg">
                                    Start planning your dream Egyptian adventure and create unforgettable memories
                                </p>
                                <Link href="/dashboard/trip-planner">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-8 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group">
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Create Your Plan
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                        <h2 className="font-display text-2xl font-bold text-gray-900">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href}>
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="h-full"
                                >
                                    <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden group">
                                        <CardContent className="p-6">
                                            <div className={`w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <action.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="font-bold text-xl mb-2 text-gray-900">{action.title}</h3>
                                            <p className="text-gray-600 mb-4">{action.description}</p>
                                            <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                                                Get Started
                                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Saved Destinations Preview */}
                <motion.div variants={item}>
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                            <h2 className="font-display text-2xl font-bold text-gray-900">Saved Destinations</h2>
                        </div>
                        <Link href="/dashboard/favorites" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {isFavoritesLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {favorites.slice(0, 4).map((destination) => (
                                <Link key={destination.id} href={`/destinations/detail?id=${destination.id}`}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg"
                                    >
                                        <Image
                                            src={destination.imageUrl}
                                            alt={destination.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="flex items-center gap-1 text-white/80 text-xs mb-1">
                                                <MapPin className="w-3 h-3" />
                                                {destination.city}
                                            </div>
                                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                                                {destination.name}
                                            </h3>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-none shadow-md bg-white p-8 text-center transition-all hover:shadow-lg">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">No favorites yet</h3>
                            <p className="text-gray-500 text-sm mb-4">Start exploring Egypt and save your favorite spots!</p>
                            <Link href="/destinations">
                                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                    Explore Now
                                </Button>
                            </Link>
                        </Card>
                    )}
                </motion.div>

                {/* Info Cards */}
                <motion.div variants={item}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Did You Know Card */}
                        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-3 text-gray-900">Did You Know?</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            The Great Pyramid of Giza was the tallest man-made structure in the world for over 3,800 years, standing at 146.6 meters tall.
                                        </p>
                                        <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-amber-200 text-amber-700 hover:text-amber-800 rounded-lg">
                                            Discover More
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weather Card */}
                        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-3 text-gray-900">Cairo Weather</h3>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-4xl font-bold text-gray-900">32°C</p>
                                                <p className="text-gray-600">Sunny & Clear</p>
                                            </div>
                                            <div className="text-6xl">☀️</div>
                                        </div>
                                        <p className="text-sm text-gray-600 bg-white/60 px-3 py-2 rounded-lg">
                                            Perfect weather for exploring the Pyramids!
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
