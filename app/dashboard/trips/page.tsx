'use client'

import { useState } from 'react'
import { useGetAllTripsQuery, useDeleteTripMutation } from '@/store/features/trip/tripApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    Clock,
    Users,
    Trash2,
    ExternalLink,
    Map as MapIcon,
    Compass,
    Sparkles,
    AlertCircle,
    ArrowRight,
    Loader2
} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TripsPage() {
    const router = useRouter()
    const { data: trips, isLoading, error } = useGetAllTripsQuery()
    const [deleteTrip] = useDeleteTripMutation()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [tripToDelete, setTripToDelete] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!tripToDelete) return

        setDeletingId(tripToDelete)
        try {
            await deleteTrip(tripToDelete).unwrap()
            setTripToDelete(null)
        } catch (err) {
            console.error('Failed to delete trip:', err)
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getTravelStyleLabel = (style: number) => {
        const styles = ['Budget', 'Moderate', 'Luxury', 'Premium']
        return styles[style] ?? styles[1]  // never return Unknown
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-b-4 border-blue-600 rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 font-medium">Gathering your adventures...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">We couldn't load your trips. This might be a temporary connection issue.</p>
                        <Button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-bronze mb-2 leading-tight">
                            My Journeys
                        </h1>
                        <p className="text-bronze/80 text-lg">
                            Keep track of all your planned adventures in Egypt.
                        </p>
                    </div>
                    <Link href="/dashboard/trips/generate">
                        <Button className="bg-primary hover:bg-primary/90 text-bronze shadow-lg shadow-amber-500/20 h-14 px-8 rounded-xl group text-base font-bold btn-active-taupe">
                            <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                            Create New Trip
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {!trips || trips.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl p-16 text-center border border-amber-200/40"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-amber-50/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-100">
                                    <MapIcon className="w-12 h-12 text-gold" />
                                </div>
                                <h3 className="font-display text-3xl font-bold text-bronze mb-4">No trips yet</h3>
                                <p className="text-bronze/80 text-lg mb-8 leading-relaxed">
                                    The land of Pharaohs is waiting! Start planning your dream vacation with our AI trip generator.
                                </p>
                                <Link href="/dashboard/trips/generate">
                                    <Button size="lg" className="rounded-xl px-10 h-14 bg-primary hover:bg-primary/90 text-bronze group font-bold shadow-lg shadow-amber-500/20 btn-active-taupe">
                                        Plan My First Trip
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trips.map((trip, idx) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group"
                                >
                                    <Card className="border-amber-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm overflow-hidden rounded-[2rem] h-full flex flex-col">
                                        {/* Image Section */}
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={trip.imageUrl || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9855?auto=format&fit=crop&q=80'}
                                                alt={trip.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-bronze shadow-lg">
                                                {trip.price} EGP
                                            </div>
                                            <div className="absolute bottom-4 left-6 right-6">
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                        {getTravelStyleLabel(trip.travelStyle)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-8 flex-1 flex flex-col">
                                            <h3 className="font-display text-2xl font-bold text-bronze mb-3 group-hover:text-gold transition-colors line-clamp-1">
                                                {trip.title}
                                            </h3>
                                            <p className="text-bronze/80 text-sm mb-6 line-clamp-2 leading-relaxed">
                                                {trip.description}
                                            </p>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center text-sm font-medium text-bronze/70">
                                                    <Calendar className="w-4 h-4 mr-3 text-gold" />
                                                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-bronze/70">
                                                    <Clock className="w-4 h-4 mr-3 text-gold" />
                                                    {trip.durationDays} Magical Days
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-bronze/70">
                                                    <Users className="w-4 h-4 mr-3 text-gold" />
                                                {getCompanionsLabel(trip.travelCompanions)}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-auto">
                                                <Link
                                                    href={`/dashboard/trips/view?id=${trip.id}`}
                                                    className="flex-[2]"
                                                >
                                                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-bronze font-bold rounded-xl shadow-md transition-all btn-active-taupe">
                                                        View Details
                                                        <ExternalLink className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    onClick={() => trip.id && setTripToDelete(trip.id)}
                                                    variant="outline"
                                                    className="w-11 h-11 border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-100 hover:text-red-900 rounded-xl transition-all btn-active-taupe"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AlertDialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
                <AlertDialogContent className="rounded-[2rem] border-none p-10 max-w-lg bg-white/90 backdrop-blur-xl shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-3xl font-extrabold text-bronze mb-2">Delete this trip?</AlertDialogTitle>
                        <AlertDialogDescription className="text-bronze/80 text-lg leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-bronze">"{trips?.find(t => t.id === tripToDelete)?.title}"</span>? All your saved itinerary details will be lost forever.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-8">
                        <AlertDialogCancel className="h-12 border-gray-200 bg-white hover:bg-gray-50 rounded-xl font-bold text-bronze transition-all btn-active-taupe">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all border-none btn-active-taupe"
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                        >
                            {deletingId ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Yes, Delete It"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
