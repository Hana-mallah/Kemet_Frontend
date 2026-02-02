'use client'

import { use, useState } from 'react'
import {
    useGetTripQuery,
    useUpdateTripMutation,
    useAddDayToTripMutation,
    useUpdateDayMutation,
    useDeleteDayMutation,
    useAddActivityToDayMutation,
    useUpdateActivityMutation,
    useDeleteActivityMutation,
} from '@/store/features/trip/tripApi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CreateDayRequest, CreateActivityRequest, TripDay, TripActivity } from '@/types'

export default function ClientTripDetailPage({ id }: { id: string }) {
    const router = useRouter()
    const { data: trip, isLoading, error } = useGetTripQuery(id)

    const [updateTrip] = useUpdateTripMutation()
    const [addDay] = useAddDayToTripMutation()
    const [updateDay] = useUpdateDayMutation()
    const [deleteDay] = useDeleteDayMutation()
    const [addActivity] = useAddActivityToDayMutation()
    const [updateActivity] = useUpdateActivityMutation()
    const [deleteActivity] = useDeleteActivityMutation()

    const [showAddDay, setShowAddDay] = useState(false)
    const [showAddActivity, setShowAddActivity] = useState<string | undefined>(undefined)
    const [editingDay, setEditingDay] = useState<TripDay | undefined>(undefined)
    const [editingActivity, setEditingActivity] = useState<{ dayId: string; activity: TripActivity } | undefined>(undefined)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getActivityTypeLabel = (type: number) => {
        const types = ['Sightseeing', 'Adventure', 'Museum', 'Food & Dining', 'Shopping', 'Relaxation']
        return types[type] || 'Activity'
    }

    const handleAddDay = async (dayData: CreateDayRequest) => {
        try {
            await addDay({ tripId: id, data: dayData }).unwrap()
            setShowAddDay(false)
        } catch (err) {
            console.error('Failed to add day:', err)
            alert('Failed to add day')
        }
    }

    const handleUpdateDay = async (dayId: string, dayData: CreateDayRequest) => {
        try {
            await updateDay({ tripId: id, dayId, data: dayData }).unwrap()
            setEditingDay(undefined)
        } catch (err) {
            console.error('Failed to update day:', err)
            alert('Failed to update day')
        }
    }

    const handleDeleteDay = async (dayId: string) => {
        if (!confirm('Are you sure you want to delete this day?')) return
        try {
            await deleteDay({ tripId: id, dayId }).unwrap()
        } catch (err) {
            console.error('Failed to delete day:', err)
            alert('Failed to delete day')
        }
    }

    const handleAddActivity = async (dayId: string, activityData: CreateActivityRequest) => {
        try {
            await addActivity({ tripId: id, dayId, data: activityData }).unwrap()
            setShowAddActivity(undefined)
        } catch (err) {
            console.error('Failed to add activity:', err)
            alert('Failed to add activity')
        }
    }

    const handleUpdateActivity = async (dayId: string, activityId: string, activityData: CreateActivityRequest) => {
        try {
            await updateActivity({ tripId: id, dayId, activityId, data: activityData }).unwrap()
            setEditingActivity(undefined)
        } catch (err) {
            console.error('Failed to update activity:', err)
            alert('Failed to update activity')
        }
    }

    const handleDeleteActivity = async (dayId: string, activityId: string) => {
        if (!confirm('Are you sure you want to delete this activity?')) return
        try {
            await deleteActivity({ tripId: id, dayId, activityId }).unwrap()
        } catch (err) {
            console.error('Failed to delete activity:', err)
            alert('Failed to delete activity')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading trip details...</p>
                </div>
            </div>
        )
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
                    <h2 className="text-red-800 font-semibold text-xl mb-2">Trip Not Found</h2>
                    <p className="text-red-600 mb-4">The trip you're looking for doesn't exist.</p>
                    <Link href="/dashboard/trips" className="text-amber-600 hover:text-amber-700 font-medium">
                        ← Back to Trips
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/dashboard/trips"
                    className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium mb-6 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Trips
                </Link>

                {/* Trip Header */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-amber-100 mb-8">
                    {trip.imageUrl && (
                        <div className="h-64 overflow-hidden">
                            <img
                                src={trip.imageUrl}
                                alt={trip.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-4xl font-bold text-gray-800">{trip.title}</h1>
                            <div className="text-3xl font-bold text-amber-600">${trip.price}</div>
                        </div>
                        <p className="text-gray-600 text-lg mb-6">{trip.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-amber-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">Duration</div>
                                <div className="text-xl font-semibold text-gray-800">{trip.durationDays} Days</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">Travelers</div>
                                <div className="text-xl font-semibold text-gray-800">{trip.travelCompanions}</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">Start Date</div>
                                <div className="text-xl font-semibold text-gray-800">
                                    {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">End Date</div>
                                <div className="text-xl font-semibold text-gray-800">
                                    {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {trip.experienceTypes?.map((type, idx) => (
                                <span key={idx} className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                                    {type}
                                </span>
                            ))}
                            {trip.interests?.map((interest, idx) => (
                                <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Days Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Itinerary</h2>
                        <button
                            onClick={() => setShowAddDay(true)}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            + Add Day
                        </button>
                    </div>

                    {/* Add Day Form */}
                    {showAddDay && (
                        <DayForm
                            onSubmit={handleAddDay}
                            onCancel={() => setShowAddDay(false)}
                            nextDayNumber={(trip.days?.length || 0) + 1}
                        />
                    )}

                    {/* Days List */}
                    <div className="space-y-6">
                        {trip.days?.sort((a, b) => a.dayNumber - b.dayNumber).map((day) => (
                            <div key={day.id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-medium opacity-90 mb-1">Day {day.dayNumber}</div>
                                            <h3 className="text-2xl font-bold mb-2">{day.title}</h3>
                                            <p className="text-amber-50">{day.description}</p>
                                            <div className="flex items-center mt-3 space-x-4">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(day.date)}
                                                </div>
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {day.city}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingDay(day)}
                                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => day.id && handleDeleteDay(day.id)}
                                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Day Form */}
                                {editingDay?.id === day.id && (
                                    <div className="p-6 bg-amber-50">
                                        <DayForm
                                            initialData={editingDay}
                                            onSubmit={(data) => day.id && handleUpdateDay(day.id, data)}
                                            onCancel={() => setEditingDay(undefined)}
                                            nextDayNumber={day.dayNumber}
                                        />
                                    </div>
                                )}

                                {/* Activities */}
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800">Activities</h4>
                                        <button
                                            onClick={() => setShowAddActivity(day.id)}
                                            className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                                        >
                                            + Add Activity
                                        </button>
                                    </div>

                                    {/* Add Activity Form */}
                                    {showAddActivity === day.id && (
                                        <ActivityForm
                                            onSubmit={(data) => day.id && handleAddActivity(day.id, data)}
                                            onCancel={() => setShowAddActivity(undefined)}
                                        />
                                    )}

                                    {/* Activities List */}
                                    {day.activities && day.activities.length > 0 ? (
                                        <div className="space-y-3">
                                            {day.activities.map((activity) => (
                                                <div key={activity.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                                    {editingActivity?.activity.id === activity.id ? (
                                                        <ActivityForm
                                                            initialData={activity}
                                                            onSubmit={(data) => activity.id && day.id && handleUpdateActivity(day.id, activity.id, data)}
                                                            onCancel={() => setEditingActivity(undefined)}
                                                        />
                                                    ) : (
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                                        {getActivityTypeLabel(activity.activityType)}
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">
                                                                        {activity.startTime} • {activity.durationHours}h
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-700">{activity.description}</p>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => day.id && setEditingActivity({ dayId: day.id, activity })}
                                                                    className="text-gray-400 hover:text-amber-600 transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => activity.id && day.id && handleDeleteActivity(day.id, activity.id)}
                                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No activities yet. Add your first activity!</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!trip.days || trip.days.length === 0) && !showAddDay && (
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No days planned yet</h3>
                            <p className="text-gray-500 mb-4">Start building your itinerary by adding days</p>
                            <button
                                onClick={() => setShowAddDay(true)}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Add First Day
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Day Form Component
function DayForm({
    initialData,
    onSubmit,
    onCancel,
    nextDayNumber
}: {
    initialData?: TripDay
    onSubmit: (data: CreateDayRequest) => void
    onCancel: () => void
    nextDayNumber: number
}) {
    const [formData, setFormData] = useState<CreateDayRequest>({
        dayNumber: initialData?.dayNumber || nextDayNumber,
        date: initialData?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        title: initialData?.title || '',
        description: initialData?.description || '',
        city: initialData?.city || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {initialData ? 'Edit Day' : 'Add New Day'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day Number</label>
                    <input
                        type="number"
                        value={formData.dayNumber}
                        onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                    {initialData ? 'Update Day' : 'Add Day'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

// Activity Form Component
function ActivityForm({
    initialData,
    onSubmit,
    onCancel
}: {
    initialData?: TripActivity
    onSubmit: (data: CreateActivityRequest) => void
    onCancel: () => void
}) {
    const [formData, setFormData] = useState<CreateActivityRequest>({
        destinationId: initialData?.destinationId || '',
        activityType: initialData?.activityType || 0,
        startTime: initialData?.startTime || '09:00',
        durationHours: initialData?.durationHours || 2,
        description: initialData?.description || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-md space-y-3 mb-3">
            <h4 className="text-md font-semibold text-gray-800">
                {initialData ? 'Edit Activity' : 'Add New Activity'}
            </h4>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                    <select
                        value={formData.activityType}
                        onChange={(e) => setFormData({ ...formData, activityType: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value={0}>Sightseeing</option>
                        <option value={1}>Adventure</option>
                        <option value={2}>Museum</option>
                        <option value={3}>Food & Dining</option>
                        <option value={4}>Shopping</option>
                        <option value={5}>Relaxation</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination ID</label>
                    <input
                        type="text"
                        value={formData.destinationId}
                        onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="UUID"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                    <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.durationHours}
                        onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
                >
                    {initialData ? 'Update' : 'Add'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
