'use client'

import { useState } from 'react'
import { useGetAllTripsQuery, useDeleteTripMutation } from '@/store/features/trip/tripApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
            // You might want to add a toast notification here instead of alert
            // toast.error("Failed to delete trip")
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
        const styles = ['Budget', 'Moderate', 'Luxury']
        return styles[style] || 'Unknown'
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your trips...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
                    <h2 className="text-red-800 font-semibold text-xl mb-2">Error Loading Trips</h2>
                    <p className="text-red-600">Failed to load trips. Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            My Trips
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Manage and explore your travel itineraries
                        </p>
                    </div>
                    <Link
                        href="/dashboard/trips/generate"
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        + Generate New Trip
                    </Link>
                </div>

                {/* Trips Grid */}
                {!trips || trips.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border border-amber-100">
                        <div className="max-w-md mx-auto">
                            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No trips yet</h3>
                            <p className="text-gray-500 mb-6">
                                Start planning your next adventure by generating a trip with AI
                            </p>
                            <Link
                                href="/dashboard/trips/generate"
                                className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Generate Your First Trip
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200"
                            >
                                {/* Trip Image */}
                                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-100 to-blue-100">
                                    {trip.imageUrl ? (
                                        <img
                                            src={trip.imageUrl}
                                            alt={trip.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-20 h-20 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-amber-700">
                                        ${trip.price}
                                    </div>
                                </div>

                                {/* Trip Details */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                        {trip.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {trip.description}
                                    </p>

                                    {/* Trip Meta */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {trip.durationDays} days
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {trip.travelCompanions} {trip.travelCompanions === 1 ? 'traveler' : 'travelers'}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                            {getTravelStyleLabel(trip.travelStyle)}
                                        </span>
                                        {trip.experienceTypes?.slice(0, 2).map((type, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                {type}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/trips/view?id=${trip.id}`}
                                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-all duration-200"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => trip.id && setTripToDelete(trip.id)}
                                            disabled={deletingId === trip.id}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                                        >
                                            {deletingId === trip.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{trips?.find(t => t.id === tripToDelete)?.title}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                        >
                            {deletingId ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span> Deleting...
                                </>
                            ) : (
                                "Delete Trip"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
