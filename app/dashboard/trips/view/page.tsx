'use client'

import { useState, Suspense } from 'react'
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
import { useGetDestinationsQuery, Destination } from '@/store/features/destinations/destinationsApi'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { CreateDayRequest, CreateActivityRequest, TripDay, TripActivity } from '@/types'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Loader2,
    Plus,
    Trash2,
    Edit2,
    MapPin,
    Clock,
    Calendar,
    X,
    Save,
    MoreVertical,
    CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'


function TripDetailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const { toast } = useToast()

    // Data Fetching
    const { data: trip, isLoading, error } = useGetTripQuery(id || '', { skip: !id })
    const { data: allDestinations } = useGetDestinationsQuery()

    // Compute used destination IDs
    const usedDestinationIds = new Set<string>()
    trip?.days?.forEach(day => {
        day.activities?.forEach(act => {
            if (act.destinationId) usedDestinationIds.add(act.destinationId)
        })
    })

    const [addDay, { isLoading: isAddingDay }] = useAddDayToTripMutation()
    const [updateDay, { isLoading: isUpdatingDay }] = useUpdateDayMutation()
    const [deleteDay, { isLoading: isDeletingDay }] = useDeleteDayMutation()
    const [addActivity, { isLoading: isAddingActivity }] = useAddActivityToDayMutation()
    const [updateActivity, { isLoading: isUpdatingActivity }] = useUpdateActivityMutation()
    const [deleteActivity, { isLoading: isDeletingActivity }] = useDeleteActivityMutation()

    const [showAddDay, setShowAddDay] = useState(false)
    const [showAddActivity, setShowAddActivity] = useState<string | undefined>(undefined)
    const [editingDay, setEditingDay] = useState<TripDay | undefined>(undefined)
    const [editingActivity, setEditingActivity] = useState<{ dayId: string; activity: TripActivity } | undefined>(undefined)
    const [deletingId, setDeletingId] = useState<string | null>(null)

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
        const types = ['Sightseeing', 'Adventure', 'Museum', 'Food & Dining', 'Shopping', 'Relaxation']
        return types[type] || 'Activity'
    }

    // CRUD Handlers with Toast Feedback
    const handleAddDay = async (dayData: CreateDayRequest) => {
        if (!id) return
        try {
            await addDay({ tripId: id, data: dayData }).unwrap()
            setShowAddDay(false)
            toast({
                title: "Success",
                description: "Day added successfully",
                className: "bg-green-50 border-green-200 text-green-900"
            })
        } catch (err) {
            console.error('Failed to add day:', err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add day. Please try again."
            })
        }
    }

    const handleUpdateDay = async (dayId: string, dayData: CreateDayRequest) => {
        if (!id) return
        try {
            await updateDay({ tripId: id, dayId, data: dayData }).unwrap()
            setEditingDay(undefined)
            toast({
                title: "Success",
                description: "Day updated successfully",
                className: "bg-green-50 border-green-200 text-green-900"
            })
        } catch (err) {
            console.error('Failed to update day:', err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update day."
            })
        }
    }

    const handleDeleteDay = async (dayId: string) => {
        if (!id) return
        if (!confirm('Are you sure you want to delete this day? All activities will be lost.')) return

        setDeletingId(dayId)
        try {
            await deleteDay({ tripId: id, dayId }).unwrap()
            toast({
                title: "Deleted",
                description: "Day and its activities were removed.",
            })
        } catch (err) {
            console.error('Failed to delete day:', err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete day."
            })
        } finally {
            setDeletingId(null)
        }
    }

    const handleAddActivity = async (dayId: string, activityData: CreateActivityRequest) => {
        if (!id) return
        try {
            await addActivity({ tripId: id, dayId, data: activityData }).unwrap()
            setShowAddActivity(undefined)
            toast({
                title: "Success",
                description: "Activity added successfully",
                className: "bg-green-50 border-green-200 text-green-900"
            })
        } catch (err) {
            console.error('Failed to add activity:', err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add activity."
            })
        }
    }

    const handleUpdateActivity = async (dayId: string, activityId: string, activityData: CreateActivityRequest) => {
        if (!id) return
        try {
            await updateActivity({ tripId: id, dayId, activityId, data: activityData }).unwrap()
            setEditingActivity(undefined)
            toast({
                title: "Success",
                description: "Activity updated successfully",
                className: "bg-green-50 border-green-200 text-green-900"
            })
        } catch (err) {
            console.error('Failed to update activity:', err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update activity."
            })
        }
    }

    const handleDeleteActivity = async (dayId: string, activityId: string) => {
        if (!id) return
        if (!confirm('Are you sure you want to delete this activity?')) return

        setDeletingId(activityId)
        try {
            await deleteActivity({ tripId: id, dayId, activityId }).unwrap()
            toast({
                title: "Deleted",
                description: "Activity removed.",
            })
        } catch (err) {
            console.error('Failed to delete activity:', err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete activity."
            })
        } finally {
            setDeletingId(null)
        }
    }

    if (!id) return <div className="p-8 text-center text-red-500">Invalid Trip Configuration</div>

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your journey...</p>
                </motion.div>
            </div>
        )
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-red-800 font-semibold text-xl mb-2">Trip Not Found</h2>
                    <p className="text-red-600 mb-6">The trip you're looking for doesn't exist or unable to load.</p>
                    <Button asChild variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                        <Link href="/dashboard/trips">Back to Trips</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-6 px-4 md:py-12 md:px-8">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
                {/* Back Link */}
                <Link
                    href="/dashboard/trips"
                    className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium transition-colors group py-2"
                >
                    <div className="bg-amber-100 p-2 rounded-full mr-3 group-hover:-translate-x-1 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    Back to All Trips
                </Link>

                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50"
                >
                    {trip.imageUrl && (
                        <div className="h-56 md:h-96 w-full relative">
                            <img
                                src={trip.imageUrl}
                                alt={trip.title}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 text-white">
                                <h1 className="text-2xl md:text-5xl font-bold mb-2 shadow-black/10 drop-shadow-lg leading-tight">{trip.title}</h1>
                                <p className="text-sm md:text-lg opacity-90 max-w-2xl text-shadow line-clamp-2 md:line-clamp-none">{trip.description}</p>
                            </div>
                            <div className="absolute top-4 right-4 md:top-6 md:right-8 bg-white/90 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg">
                                <span className="text-lg md:text-2xl font-bold text-amber-600">${trip.price}</span>
                            </div>
                        </div>
                    )}

                    {!trip.imageUrl && (
                        <div className="p-6 md:p-8 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{trip.title}</h1>
                                    <p className="text-gray-600 text-sm md:text-lg max-w-3xl">{trip.description}</p>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-amber-600">${trip.price}</div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 md:p-8 pt-4 md:pt-6 bg-white/50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatCard label="Duration" value={`${trip.durationDays} Days`} color="amber" />
                            <StatCard label="Travelers" value={trip.travelCompanions} color="blue" />
                            <StatCard label="Start Date" value={new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} color="green" />
                            <StatCard label="End Date" value={new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} color="purple" />
                        </div>
                    </div>
                </motion.div>

                {/* Itinerary Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <MapPin className="w-6 h-6 text-amber-600" />
                            </div>
                            Itinerary
                        </h2>
                        <Button
                            onClick={() => setShowAddDay(true)}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl rounded-xl h-12 px-6"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Day
                        </Button>
                    </div>

                    {/* Add Day Form */}
                    <AnimatePresence>
                        {showAddDay && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
                                    <DayForm
                                        onSubmit={handleAddDay}
                                        onCancel={() => setShowAddDay(false)}
                                        nextDayNumber={(trip.days?.length || 0) + 1}
                                        isLoading={isAddingDay}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Days List */}
                    <div className="space-y-8 relative">
                        {(!trip.days || trip.days.length === 0) && !showAddDay && (
                            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your itinerary is empty</h3>
                                <p className="text-gray-500 mb-6">Start building your dream trip by adding your first day.</p>
                                <Button onClick={() => setShowAddDay(true)} variant="outline">Create a Day</Button>
                            </div>
                        )}

                        {trip.days && (
                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block" />
                        )}

                        {[...(trip.days || [])].sort((a, b) => a.dayNumber - b.dayNumber).map((day, index) => (
                            <motion.div
                                key={day.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative md:pl-16"
                            >
                                {/* Timeline Connector */}
                                <div className="absolute left-0 top-8 hidden md:flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-amber-100 z-10 shadow-sm">
                                    <span className="text-amber-700 font-bold text-lg">{day.dayNumber}</span>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100/50 overflow-hidden">
                                    {/* Day Header - Editable Mode check */}
                                    {editingDay?.id === day.id ? (
                                        <div className="p-6 bg-amber-50/50 border-b border-amber-100">
                                            <div className="flex items-center gap-2 mb-4 text-amber-700 font-medium">
                                                <Edit2 className="w-4 h-4" />
                                                Editing Day {day.dayNumber}
                                            </div>
                                            <DayForm
                                                initialData={editingDay}
                                                onSubmit={(data) => day.id && handleUpdateDay(day.id, data)}
                                                onCancel={() => setEditingDay(undefined)}
                                                nextDayNumber={day.dayNumber}
                                                isLoading={isUpdatingDay}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6 flex justify-between items-start group">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="md:hidden bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">Day {day.dayNumber}</span>
                                                    <div className="text-sm font-medium text-amber-600 flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(day.date)}
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900">{day.title}</h3>
                                                <p className="text-gray-500 mt-1 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {day.city}
                                                </p>
                                                <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-2xl">{day.description}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" onClick={() => setEditingDay(day)} className="hover:bg-amber-50 text-gray-500 hover:text-amber-600">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => day.id && handleDeleteDay(day.id)}
                                                    className="hover:bg-red-50 text-gray-500 hover:text-red-600"
                                                    disabled={deletingId === day.id}
                                                >
                                                    {deletingId === day.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Activities Section */}
                                    <div className="p-6 bg-white min-h-[100px]">
                                        <div className="flex justify-between items-center mb-5">
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Activities</h4>
                                            {showAddActivity !== day.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAddActivity(day.id)}
                                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Add Activity
                                                </Button>
                                            )}
                                        </div>

                                        {/* Add Activity Form */}
                                        <AnimatePresence>
                                            {showAddActivity === day.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mb-6 bg-gray-50/80 rounded-xl p-4 border border-gray-100"
                                                >
                                                    <ActivityForm
                                                        onSubmit={(data) => day.id && handleAddActivity(day.id, data)}
                                                        onCancel={() => setShowAddActivity(undefined)}
                                                        isLoading={isAddingActivity}
                                                        allDestinations={allDestinations || []}
                                                        usedDestinationIds={usedDestinationIds}
                                                        currentCity={day.city}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="grid gap-3">
                                            {day.activities?.length === 0 && (
                                                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                                    No activities planned for this day yet
                                                </div>
                                            )}
                                            {day.activities?.map((activity) => (
                                                <motion.div
                                                    layout
                                                    key={activity.id}
                                                    className="group relative bg-white border border-gray-100 rounded-xl hover:border-amber-200 hover:shadow-md transition-all p-4"
                                                >
                                                    {editingActivity?.activity.id === activity.id ? (
                                                        <ActivityForm
                                                            initialData={activity}
                                                            onSubmit={(data) => activity.id && day.id && handleUpdateActivity(day.id, activity.id, data)}
                                                            onCancel={() => setEditingActivity(undefined)}
                                                            isLoading={isUpdatingActivity}
                                                            allDestinations={allDestinations || []}
                                                            usedDestinationIds={usedDestinationIds}
                                                            currentCity={day.city}
                                                        />
                                                    ) : (
                                                        <div className="flex gap-4">
                                                            {/* Time Column */}
                                                            <div className="flex-shrink-0 w-16 pt-1">
                                                                <div className="text-sm font-bold text-gray-900">{activity.startTime}</div>
                                                                <div className="text-xs text-gray-500">{activity.durationHours}h</div>
                                                            </div>

                                                            {/* Content Column */}
                                                            <div className="flex-grow">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 mb-1">
                                                                            {getActivityTypeLabel(activity.activityType)}
                                                                        </span>
                                                                        <p className="text-gray-900 text-sm font-medium leading-normal">{activity.description}</p>
                                                                    </div>
                                                                    {/* Hover Actions */}
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => day.id && setEditingActivity({ dayId: day.id, activity })}>
                                                                            <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-amber-600" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-7 w-7"
                                                                            onClick={() => activity.id && day.id && handleDeleteActivity(day.id, activity.id)}
                                                                            disabled={deletingId === activity.id}
                                                                        >
                                                                            {deletingId === activity.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-600" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-amber-600" /></div>}>
            <TripDetailContent />
        </Suspense>
    )
}

// ---------------- UI Components ----------------

function StatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
    const colorClasses: Record<string, string> = {
        amber: "bg-amber-50 text-amber-700",
        blue: "bg-blue-50 text-blue-700",
        green: "bg-green-50 text-green-700",
        purple: "bg-purple-50 text-purple-700",
    }

    return (
        <div className={`${colorClasses[color]} rounded-xl p-4 border border-current/10`}>
            <div className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">{label}</div>
            <div className="text-lg font-bold">{value}</div>
        </div>
    )
}

function DayForm({
    initialData,
    onSubmit,
    onCancel,
    nextDayNumber,
    isLoading
}: {
    initialData?: TripDay
    onSubmit: (data: CreateDayRequest) => void
    onCancel: () => void
    nextDayNumber: number
    isLoading: boolean
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Day Number</Label>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={formData.dayNumber}
                        onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) })}
                        required
                        disabled={!!initialData} // Disable editing day number
                        className={initialData ? "bg-gray-100" : ""}
                    />
                </div>
                <div>
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <Label>Title</Label>
                    <Input
                        placeholder="e.g. Arrival in Cairo"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>
                <div className="col-span-1">
                    <Label>City</Label>
                    <Input
                        placeholder="e.g. Cairo"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div>
                <Label>Description</Label>
                <Textarea
                    placeholder="Briefly describe the day's events..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {initialData ? 'Save Changes' : 'Create Day'}
                </Button>
            </div>
        </form>
    )
}

function ActivityForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    allDestinations,
    usedDestinationIds,
    currentCity
}: {
    initialData?: TripActivity
    onSubmit: (data: CreateActivityRequest) => void
    onCancel: () => void
    isLoading: boolean
    allDestinations: Destination[]
    usedDestinationIds: Set<string>
    currentCity: string
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

    const normalizedCurrentCity = currentCity?.toLowerCase().trim() || ''

    const availableDestinations = allDestinations.filter(d =>
        !usedDestinationIds.has(d.id) || d.id === initialData?.destinationId
    )

    const recommended = availableDestinations.filter(d =>
        d.city?.toLowerCase().includes(normalizedCurrentCity)
    )

    const others = availableDestinations.filter(d =>
        !d.city?.toLowerCase().includes(normalizedCurrentCity)
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                    <Label className="text-xs font-semibold uppercase text-gray-500 mb-1.5 block">Type</Label>
                    <select
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:shadow-sm"
                        value={formData.activityType}
                        onChange={(e) => setFormData({ ...formData, activityType: parseInt(e.target.value) })}
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
                    <Label className="text-xs font-semibold uppercase text-gray-500 mb-1.5 block">Destination</Label>
                    <select
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:shadow-sm"
                        value={formData.destinationId}
                        onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Select a place</option>

                        {recommended.length > 0 && (
                            <optgroup label={`Recommended in ${currentCity}`}>
                                {recommended.map(dest => (
                                    <option key={dest.id} value={dest.id}>
                                        {dest.name} ({dest.city})
                                    </option>
                                ))}
                            </optgroup>
                        )}

                        {others.length > 0 && (
                            <optgroup label="Other Locations">
                                {others.map(dest => (
                                    <option key={dest.id} value={dest.id}>
                                        {dest.name} ({dest.city})
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs">Start Time</Label>
                    <Input
                        type="time"
                        className="h-10"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label className="text-xs">Duration (h)</Label>
                    <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        className="h-10"
                        value={formData.durationHours}
                        onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) })}
                        required
                    />
                </div>
            </div>

            <div>
                <Label className="text-xs">Details</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-20"
                    placeholder="What will you be doing?"
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    {initialData ? 'Update' : 'Add'}
                </Button>
            </div>
        </form>
    )
}
