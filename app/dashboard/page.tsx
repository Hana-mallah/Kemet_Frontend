"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Map, MessageSquare, Sparkles, Calendar, MapPin, Clock, TrendingUp, Compass, Heart, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useGetFavoritesQuery } from "@/store/features/destinations/destinationsApi"

export default function DashboardPage() {
    const { user } = useAuth()
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
            href: "/dashboard/trips/generate",
        },
        {
            title: "KEMET Assistant",
            description: "Get instant help",
            icon: MessageSquare,
            href: "/dashboard/chatbot",
        },
        {
            title: "My Favorites",
            description: "Saved destinations",
            icon: Heart,
            href: "/dashboard/favorites",
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
        <div className="min-h-screen bg-background">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
            >
                {/* Header */}
                <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1C2B6A] mb-2 leading-tight">
                            {mounted ? `${greeting}, ${user?.name?.split(" ")[0]} 👋` : 'Welcome'}
                        </h1>
                        <p className="text-[#1C2B6A]/70 text-base sm:text-lg font-semibold">
                            Ready to explore Egypt&apos;s wonders?
                        </p>
                    </div>
                    <Link href="/dashboard/trips/generate" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto btn-kio text-[#d5bb88] font-bold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 h-14 px-8 rounded-xl group text-base">
                            <Compass className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform text-[#eace83]" />
                            Plan New Trip
                        </Button>
                    </Link>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-[#d5bb88] rounded-full" />
                        <h2 className="font-display text-2xl font-bold text-[#1C2B6A]">Quick Actions</h2>
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
                                    <Card className="h-full glass-card border-[#d5bb88]/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                                        <CardContent className="p-6">
                                            <div className="relative w-14 h-14 mb-5 flex-shrink-0">
                                                <div className="w-14 h-14 rounded-2xl bg-[#1C2B6A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <action.icon className="w-7 h-7 text-[#d5bb88]" />
                                                </div>
                                                <div className="absolute -inset-0.5 rounded-2xl border border-[#d5bb88]/30 pointer-events-none" />
                                            </div>
                                            <h3 className="font-bold text-xl mb-2 text-[#1C2B6A]">{action.title}</h3>
                                            <p className="text-[#1C2B6A]/70 font-semibold mb-4">{action.description}</p>
                                            <div className="flex items-center text-[#d5bb88] font-bold group-hover:gap-2 transition-all">
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
                            <div className="w-1 h-8 bg-[#d5bb88] rounded-full" />
                            <h2 className="font-display text-2xl font-bold text-[#1C2B6A]">Saved Destinations</h2>
                        </div>
                        <Link href="/dashboard/favorites" className="text-[#1C2B6A] hover:text-[#170C79] text-sm font-bold flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {isFavoritesLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#1C2B6A]" />
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
                                                <MapPin className="w-3 h-3 text-[#d5bb88]" />
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
                        <Card className="glass-card border-[#d5bb88]/20 shadow-md p-8 text-center transition-all hover:shadow-lg">
                            <div className="relative w-12 h-12 mx-auto mb-4">
                                <div className="w-12 h-12 bg-[#1C2B6A] rounded-full flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-[#d5bb88]" />
                                </div>
                            </div>
                            <h3 className="font-bold text-[#1C2B6A] mb-2">No favorites yet</h3>
                            <p className="text-[#1C2B6A]/70 font-semibold text-sm mb-4">Start exploring Egypt and save your favorite spots!</p>
                            <Link href="/destinations">
                                <Button size="sm" className="bg-[#1C2B6A] text-[#d5bb88] hover:bg-[#170C79] font-bold border border-[#d5bb88]/20">
                                    Explore Now
                                </Button>
                            </Link>
                        </Card>
                    )}
                </motion.div>

                {/* Info Cards */}
                <motion.div variants={item}>
                    <div className="max-w-2xl">
                        {/* Did You Know Card */}
                        <Card className="glass-card border-[#d5bb88]/25 shadow-lg overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 bg-[#1C2B6A] rounded-xl flex items-center justify-center shadow-lg">
                                            <Sparkles className="w-6 h-6 text-[#d5bb88]" />
                                        </div>
                                        <div className="absolute -inset-0.5 rounded-xl border border-[#d5bb88]/30 pointer-events-none" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-3 text-[#d5bb88]">Did You Know?</h3>
                                        <p className="text-[#1C2B6A] font-semibold leading-relaxed">
                                            The Great Pyramid of Giza was the tallest man-made structure in the world for over 3,800 years, standing at 146.6 meters tall.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </motion.div>
        </div >
    )
}
