'use client'

import { useState } from 'react'
import { useGetAllTripsQuery, useDeleteTripMutation } from '@/store/features/trip/tripApi'
import Link from 'next/link'

export default function AdminTripsPage() {
    const { data: trips, isLoading, error } = useGetAllTripsQuery()
    const [deleteTrip] = useDeleteTripMutation()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return

        setDeletingId(id)
        try {
            await deleteTrip(id).unwrap()
        } catch (err) {
            console.error('Failed to delete trip:', err)
            alert('Failed to delete trip')
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

    const filteredTrips = trips?.filter(trip =>
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading trips...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Trips</h2>
                <p className="text-red-600">Failed to load trips. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
                    <p className="text-gray-600 mt-1">Manage all user trips and itineraries</p>
                </div>
                <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                    Total Trips: <span className="font-semibold text-gray-900">{trips?.length || 0}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search trips by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Trips Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {!filteredTrips || filteredTrips.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'No trips found' : 'No trips yet'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms' : 'Trips will appear here once users create them'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trip
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Style
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Days
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTrips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                                                    {trip.imageUrl ? (
                                                        <img
                                                            src={trip.imageUrl}
                                                            alt={trip.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                        {trip.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {trip.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{trip.durationDays} days</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(trip.startDate)}</div>
                                            <div className="text-xs text-gray-500">{formatDate(trip.endDate)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {getTravelStyleLabel(trip.travelStyle)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">${trip.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{trip.days?.length || 0} days</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/trips/view?id=${trip.id}`}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => trip.id && handleDelete(trip.id)}
                                                    disabled={deletingId === trip.id}
                                                    className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                                    title="Delete Trip"
                                                >
                                                    {deletingId === trip.id ? (
                                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            {trips && trips.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Trips</div>
                        <div className="text-3xl font-bold text-gray-900">{trips.length}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Days</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {trips.reduce((sum, trip) => sum + (trip.days?.length || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {Math.round(trips.reduce((sum, trip) => sum + trip.durationDays, 0) / trips.length)} days
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-1">Avg Price</div>
                        <div className="text-3xl font-bold text-gray-900">
                            ${Math.round(trips.reduce((sum, trip) => sum + trip.price, 0) / trips.length)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
