'use client'

import { useState, Suspense } from 'react'
import { useGetTripQuery } from '@/store/features/trip/tripApi'
import { useGetDestinationsQuery } from '@/store/features/destinations/destinationsApi'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Loader2,
    MapPin,
    Clock,
    Calendar,
    ArrowLeft,
    Compass,
    Users,
    Navigation,
    Info,
    MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"

function TripDetailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    // Data Fetching
    const { data: trip, isLoading, error } = useGetTripQuery(id || '', { skip: !id })
    const { data: destinations } = useGetDestinationsQuery()

    // Helper to format dates nicely
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getActivityTypeLabel = (type: number) => {
        const types = ['Sightseeing', 'Adventure', 'History', 'Cuisine', 'Shopping', 'Relaxation', 'Entertainment']
        return types[type] || 'Experience'
    }

    const getCompanionsLabel = (companions: any) => {
        if (typeof companions === 'string') {
            const lower = companions.toLowerCase()
            if (lower.includes('couple')) return 'Couple'
            if (lower.includes('small') || lower.includes('family')) return 'Small Group'
            if (lower.includes('large') || lower.includes('group') || lower.includes('friend')) return 'Large Group'
            if (lower.includes('solo')) return 'Solo'
            return companions
        }
        const labels: Record<number, string> = { 0: 'Solo', 1: 'Couple', 2: 'Small Group', 3: 'Large Group' }
        return labels[companions as number] ?? 'Solo'
    }

    const formatTime12h = (timeString: string) => {
        if (!timeString) return '';
        const parts = timeString.split(':');
        if (parts.length < 2) return timeString;
        let hours = parseInt(parts[0], 10);
        const mins = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }

    if (!id) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-md p-8 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Missing Trip ID</h2>
                <p className="text-gray-600 mb-8">Please select a trip from your dashboard to view its details.</p>
                <Link href="/dashboard/trips">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        Back to My Trips
                    </button>
                </Link>
            </Card>
        </div>
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Coming together your journey...</p>
                </motion.div>
            </div>
        )
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4 font-sans">
                <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-md p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
                    <p className="text-gray-600 mb-8">We couldn't load this trip. It might have been deleted or there's a connection issue.</p>
                    <Link href="/dashboard/trips">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            Back to My Trips
                        </button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/dashboard/trips"
                        className="inline-flex items-center text-bronze hover:text-gold font-semibold transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to My Trips
                    </Link>
                </motion.div>

                {/* Trip Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-amber-200/40 mb-10"
                >
                    <div className="relative h-[25rem] sm:h-[30rem]">
                        <img
                            src={trip.imageUrl || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9855?auto=format&fit=crop&q=80'}
                            alt={trip.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {trip.experienceTypes?.map((type, idx) => (
                                    <span key={idx} className="px-4 py-1.5 bg-[#1C2B6A]/80 backdrop-blur-md border border-[#d5bb88]/30 text-[#d5bb88] text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        {type}
                                    </span>
                                ))}
                            </div>
                            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                                {trip.title}
                            </h1>
                            <div className="flex items-center text-white/90 font-bold">
                                <span className="text-2xl font-extrabold text-[#d5bb88] mr-2">EGP</span>
                                <span className="text-3xl font-bold text-white mr-2">{Number(trip.price).toLocaleString()}</span>
                                <span className="text-white/70 text-base">Total Estimated Price</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <p className="text-[#1C2B6A] font-bold text-lg sm:text-xl leading-relaxed mb-10">
                            {trip.description}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<Clock className="w-6 h-6" />} label="Duration" value={`${trip.durationDays} Days`} />
                            <StatCard icon={<Users className="w-6 h-6" />} label="Travelers" value={getCompanionsLabel(trip.travelCompanions)} />
                            <StatCard icon={<Calendar className="w-6 h-6" />} label="Start Date" value={new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                            <StatCard icon={<Compass className="w-6 h-6" />} label="Interests" value={trip.interests?.[0] || 'Culture'} />
                        </div>
                    </div>
                </motion.div>

                {/* Itinerary Section */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-1.5 h-10 bg-[#d5bb88] rounded-full" />
                        <h2 className="font-display text-3xl font-bold text-[#1C2B6A]">Your Detailed Itinerary</h2>
                    </div>

                    {!trip.days || trip.days.length === 0 ? (
                        <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm p-16 text-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                                <Calendar className="w-8 h-8 text-gold/50" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-bronze mb-2">Itinerary Pending</h3>
                            <p className="text-bronze/60">The daily breakdown for this journey hasn't been finalized yet.</p>
                        </Card>
                    ) : (
                        <div className="space-y-12">
                            {[...(trip.days || [])].sort((a, b) => a.dayNumber - b.dayNumber).map((day, idx) => (
                                <motion.div
                                    key={day.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative pl-8 sm:pl-12 border-l-2 border-dashed border-gold/30"
                                >
                                    {/* Timeline Marker */}
                                    <div className="absolute top-0 left-0 -translate-x-1/2 w-14 h-8 rounded-full bg-[#1C2B6A] flex items-center justify-center text-[#d5bb88] font-bold text-sm shadow-lg border border-[#d5bb88]/30 ring-4 ring-background">
                                        Day {day.dayNumber}
                                    </div>

                                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-amber-200/40 group hover:shadow-2xl transition-all duration-300">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <div>
                                                <div className="text-[#d5bb88] font-bold uppercase tracking-widest text-[10px] mb-1">
                                                    {formatDate(day.date)}
                                                </div>
                                                <h3 className="font-display text-xl font-bold text-[#1C2B6A]">
                                                    {day.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center bg-[#1C2B6A]/10 px-4 py-2 rounded-xl text-[#1C2B6A] font-bold text-sm border border-[#1C2B6A]/20">
                                                <MapPin className="w-4 h-4 mr-2 text-[#d5bb88]" />
                                                {day.city}
                                            </div>
                                        </div>

                                        <p className="text-[#1C2B6A] font-bold text-lg mb-8 leading-relaxed italic border-l-4 border-[#d5bb88] pl-4 py-1">
                                            {day.description}
                                        </p>

                                        {/* Activities */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-bronze/50 mb-4">
                                                <Navigation className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Daily Activities</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {day.activities?.map((activity) => {
                                                    const placeName = destinations?.find(d => d.id === activity.destinationId)?.name || 'Specific landmark'
                                                    return (
                                                        <div
                                                            key={activity.id}
                                                            className="bg-white/80 p-6 rounded-2xl border border-[#d5bb88]/20 shadow-sm hover:border-[#1C2B6A]/30 hover:shadow-md transition-all group/activity hover:bg-white"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-[#1C2B6A] text-[#d5bb88] flex items-center justify-center flex-shrink-0 shadow-lg mt-1">
                                                                    <Clock className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-display font-bold text-2xl text-[#1C2B6A] mb-1 group-hover:text-[#d5bb88] transition-colors">
                                                                        {placeName}
                                                                    </h4>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-display text-[#1C2B6A] font-bold text-base tracking-tight">{formatTime12h(activity.startTime)}</span>
                                                                            <span className="w-1.5 h-1.5 bg-[#d5bb88] rounded-full" />
                                                                            <span className="text-[#d5bb88] text-[10px] font-bold uppercase tracking-tighter">
                                                                                {getActivityTypeLabel(activity.activityType)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[#1C2B6A]/50 text-xs font-bold">{activity.durationHours}h</div>
                                                                    </div>
                                                                    <p className="font-display text-sm text-[#1C2B6A] font-bold leading-relaxed mt-1">
                                                                        {activity.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Final CTA placed securely at the bottom of the itinerary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 text-center flex flex-col items-center justify-center space-y-6 bg-white/40 backdrop-blur-md rounded-3xl p-10 border border-amber-200/50 shadow-xl"
                    >
                        <h3 className="font-display text-2xl font-bold text-bronze mb-2">Ready to take the next step?</h3>
                        <p className="text-bronze/80 mb-4 max-w-lg">Looking for more ideas or travel advice? Let KEMET Assistant assist you with anything you need for your trip in Egypt.</p>
                        <Link href="/dashboard/chatbot" className="inline-flex items-center justify-center">
                            <button className="flex items-center gap-3 btn-kio py-4 px-10 rounded-2xl text-lg group">
                                <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                Chat with KEMET Assistant
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <div className="bg-[#1C2B6A] p-6 rounded-2xl border border-[#d5bb88]/30 shadow-lg flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#d5bb88] mb-4 shadow-inner group-hover:bg-[#d5bb88] group-hover:text-[#1C2B6A] transition-all`}>
                {icon}
            </div>
            <div className="text-[10px] text-[#d5bb88]/60 font-bold uppercase tracking-widest mb-1">{label}</div>
            <div className="text-lg font-bold text-white leading-tight">{value}</div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 h-10 w-10 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading details...</p>
                </div>
            </div>
        }>
            <TripDetailContent />
        </Suspense>
    )
}
