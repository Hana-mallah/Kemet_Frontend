'use client'

import { useState, useEffect } from 'react'
import { useGenerateTripWithAIMutation } from '@/store/features/trip/tripApi'
import type { GenerateTripRequest } from '@/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Users,
    Calendar,
    DollarSign,
    MapPin,
    Heart,
    Camera,
    Utensils,
    ShoppingBag,
    Hotel,
    Sparkles,
    Clock,
    Star,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Palmtree,
    Info,
    ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TripPreferences {
    travelStyle: number
    groupSize: number
    durationDays: number
    startDate: string
    budget: number
    interests: string[]
}

const travelStyles = [
    { id: 0, label: 'Relaxed', description: '1–2 places/day', icon: Clock, budget: 3000, gradient: "from-blue-500 to-cyan-500" },
    { id: 1, label: 'Balanced', description: '2–3 places/day', icon: Hotel, budget: 5000, gradient: "from-purple-500 to-pink-500" },
    { id: 2, label: 'Packed', description: '3–5 places/day', icon: Star, budget: 10000, gradient: "from-orange-500 to-amber-500" },
]

const groupSizes = [
    { id: 1, label: 'Solo', description: 'Just me', icon: Users },
    { id: 2, label: 'Couple', description: '2 people', icon: Heart },
    { id: 4, label: 'Small Group (3-4 people)', description: '3–4 travelers', icon: Users },
    { id: 6, label: 'Large Group (5+ people)', description: '5 or more travelers', icon: Users },
]

const durations = [
    { id: 3, label: 'Quick Getaway', description: '3-5 days', icon: Calendar },
    { id: 7, label: 'Week Adventure', description: '7-10 days', icon: Calendar },
    { id: 14, label: 'Extended Journey', description: '14+ days', icon: Calendar },
]

const interests = [
    { id: 'Ancient History', label: 'History', icon: Camera },
    { id: 'Museums', label: 'Museums', icon: Hotel },
    { id: 'Architecture', label: 'Architecture', icon: MapPin },
    { id: 'Food & Cuisine', label: 'Cuisine', icon: Utensils },
    { id: 'Adventure', label: 'Adventure', icon: Sparkles },
    { id: 'Beach & Relaxation', label: 'Beach', icon: Palmtree },
    { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'Nature & Wildlife', label: 'Nature', icon: MapPin },
]

const loadingSteps = [
    "Analyzing your travel style...",
    "Scanning Egypt's hidden gems...",
    "Curating cultural experiences...",
    "Optimizing travel routes...",
    "Designing your perfect itinerary..."
]

const funFacts = [
    "The Great Pyramid of Giza was the tallest man-made structure for 3,800 years.",
    "Ancient Egyptians invented the 365-day calendar we use today.",
    "The Nile River is the longest river in the world.",
    "Egypt is home to the only remaining wonder of the ancient world.",
    "The Sphinx has the body of a lion and the head of a pharaoh."
]

// Mirrors the smart duration logic in tripApi.ts so the summary badge stays in sync
function computeDays(prefs: TripPreferences): number {
    const rawDuration = prefs.durationDays          // 3 | 7 | 14 (radio option IDs)
    const paceNum = prefs.travelStyle               // 0=Relaxed, 1=Balanced, 2=Packed
    const paceLabel = paceNum === 0 ? 'Relaxed' : paceNum === 2 ? 'Packed' : 'Balanced'
    const interestCount = prefs.interests.length
    const budget = prefs.budget
    const isHighBudget = budget > 8000
    const isLowBudget = budget < 3000

    if (rawDuration <= 5) {
        if (paceLabel === 'Relaxed' && isLowBudget) return 3
        if (paceLabel === 'Packed' || isHighBudget) return 5
        return interestCount > 2 ? 4 : 3
    }
    if (rawDuration <= 10) {
        if (paceLabel === 'Relaxed') return 7
        if (paceLabel === 'Packed' && interestCount > 3) return 10
        return interestCount > 2 ? 9 : 8
    }
    // Extended Journey
    let days = Math.min(21, 14 + Math.max(0, interestCount - 2))
    if (isHighBudget && paceLabel === 'Packed') days = Math.min(21, days + 2)
    if (paceLabel === 'Relaxed') days = Math.min(18, days)
    return days
}

export default function TripGeneratorPage() {
    const router = useRouter()
    const [generateTrip, { isLoading, error }] = useGenerateTripWithAIMutation()
    const [currentStep, setCurrentStep] = useState(0)
    const [loadingStepIndex, setLoadingStepIndex] = useState(0)
    const [factIndex, setFactIndex] = useState(0)

    useEffect(() => {
        if (isLoading) {
            const stepInterval = setInterval(() => {
                setLoadingStepIndex(prev => (prev + 1) % loadingSteps.length)
            }, 3000)

            const factInterval = setInterval(() => {
                setFactIndex(prev => (prev + 1) % funFacts.length)
            }, 5000)

            return () => {
                clearInterval(stepInterval)
                clearInterval(factInterval)
            }
        }
    }, [isLoading])

    const [preferences, setPreferences] = useState<TripPreferences>({
        travelStyle: 1,
        groupSize: 1,
        durationDays: 7,
        startDate: new Date().toISOString().split('T')[0],
        budget: 5000,
        interests: [],
    })

    const totalSteps = 5
    const progress = ((currentStep + 1) / totalSteps) * 100

    const steps = [
        { title: 'Travel Pace', description: 'Select your preferred rhythm of exploration' },
        { title: 'Travel Companions', description: 'Who will be joining you on your journey?' },
        { title: 'Duration', description: 'How many days will you explore?' },
        { title: 'Interests', description: 'Select the experiences you love' },
        { title: 'Trip Details', description: 'Finalize your travel plan' },
    ]

    const handleNext = () => {
        if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1)
    }

    const handleInterestToggle = (interestId: string) => {
        setPreferences(prev => ({
            ...prev,
            interests: prev.interests.includes(interestId)
                ? prev.interests.filter(id => id !== interestId)
                : [...prev.interests, interestId]
        }))
    }

    const handleSubmit = async () => {
        try {
            const requestPayload: GenerateTripRequest = {
                destination: 'Egypt',
                interests: preferences.interests,
                travelStyle: preferences.travelStyle,
                groupSize: preferences.groupSize,
                durationDays: preferences.durationDays,
                startDate: preferences.startDate,
                budget: preferences.budget,
            }

            const result = await generateTrip(requestPayload).unwrap()
            if (result.id) {
                router.push(`/dashboard/trips/view?id=${result.id}`)
            }
        } catch (err) {
            console.error('Failed to generate trip:', err)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {travelStyles.map((style) => {
                            const Icon = style.icon
                            const isSelected = preferences.travelStyle === style.id
                            return (
                                <motion.div
                                    key={style.id}
                                    whileHover={{ y: -5 }}
                                    className={`cursor-pointer transition-all rounded-[2rem] p-8 border-2 ${isSelected
                                        ? 'border-blue-500 bg-white shadow-2xl shadow-blue-200/50'
                                        : 'border-gray-100 bg-white hover:border-blue-200'
                                        }`}
                                    onClick={() => {
                                        setPreferences(prev => ({
                                            ...prev,
                                            travelStyle: style.id,
                                            budget: style.budget
                                        }))
                                    }}
                                >
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${style.gradient} text-white shadow-lg`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{style.label}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{style.description}</p>
                                        <div className={`w-6 h-6 rounded-full mx-auto border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200'}`}>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )

            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groupSizes.map((size) => {
                            const Icon = size.icon
                            const isSelected = preferences.groupSize === size.id
                            return (
                                <motion.div
                                    key={size.id}
                                    whileHover={{ x: 5 }}
                                    className={`cursor-pointer transition-all rounded-2xl p-6 border-2 ${isSelected
                                        ? 'border-purple-500 bg-white shadow-xl shadow-purple-200/50'
                                        : 'border-gray-100 bg-white hover:border-purple-200'
                                        }`}
                                    onClick={() => setPreferences(prev => ({ ...prev, groupSize: size.id }))}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-display text-lg font-bold text-gray-900">{size.label}</h3>
                                                <p className="text-sm text-gray-500 font-medium">{size.description}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-200'}`}>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )

            case 2:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {durations.map((duration) => {
                            const Icon = duration.icon
                            const isSelected = preferences.durationDays === duration.id
                            return (
                                <motion.div
                                    key={duration.id}
                                    whileHover={{ y: -5 }}
                                    className={`cursor-pointer transition-all rounded-2xl p-6 border-2 ${isSelected
                                        ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-200/50'
                                        : 'border-gray-100 bg-white hover:border-emerald-200'
                                        }`}
                                    onClick={() => setPreferences(prev => ({ ...prev, durationDays: duration.id }))}
                                >
                                    <div className="text-center">
                                        <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-display text-lg font-bold text-gray-900 mb-1">{duration.label}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{duration.description}</p>
                                        <div className={`w-6 h-6 rounded-full mx-auto border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200'}`}>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )

            case 3:
                return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {interests.map((interest) => {
                            const Icon = interest.icon
                            const isSelected = preferences.interests.includes(interest.id)
                            return (
                                <motion.div
                                    key={interest.id}
                                    whileHover={{ scale: 1.05 }}
                                    className={`cursor-pointer transition-all rounded-2xl p-4 border-2 ${isSelected
                                        ? 'border-orange-500 bg-white shadow-lg shadow-orange-200/50'
                                        : 'border-gray-100 bg-white hover:border-orange-200'
                                        }`}
                                    onClick={() => handleInterestToggle(interest.id)}
                                >
                                    <div className="text-center">
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isSelected ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-display text-sm font-bold text-gray-900 leading-tight">{interest.label}</h3>
                                        {isSelected && (
                                            <div className="bg-orange-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center mx-auto mt-2">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={preferences.startDate}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all font-bold text-gray-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">What is your total trip budget?</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-emerald-600 select-none">EGP</span>
                                    <input
                                        type="number"
                                        value={preferences.budget}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all font-bold text-gray-900 outline-none"
                                        placeholder="e.g. 5000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-[2rem] p-8 border border-white/50">
                            <div className="flex items-center gap-3 mb-8">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                                <h3 className="font-display text-2xl font-bold text-gray-900">Adventure Summary</h3>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <SummaryBadge label="Pace" value={travelStyles.find(s => s.id === preferences.travelStyle)?.label} />
                                <SummaryBadge label="Travelers" value={
                                    preferences.groupSize === 1 ? 'Solo' :
                                    preferences.groupSize === 2 ? 'Couple' :
                                    preferences.groupSize === 4 ? 'Small Group' :
                                    preferences.groupSize === 6 ? 'Large Group' : `${preferences.groupSize} People`
                                } />
                                <SummaryBadge label="Duration" value={`${computeDays(preferences)} Days`} />
                                <SummaryBadge label="Interests" value={`${preferences.interests.length} Categories`} />
                                <SummaryBadge label="Budget" value={`EGP ${preferences.budget.toLocaleString()}`} />
                                <SummaryBadge label="Start" value={new Date(preferences.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const canProceed = () => {
        if (currentStep === 3) return preferences.interests.length > 0
        if (currentStep === 4) return !!preferences.startDate && preferences.budget > 0
        return true
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-white/60 backdrop-blur-2xl"
                    >
                        <div className="max-w-xl w-full text-center space-y-12">
                            <div className="relative w-48 h-48 mx-auto">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-t-4 border-blue-600 border-r-transparent border-b-transparent border-l-transparent"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 rounded-full border-t-4 border-purple-500 border-r-transparent border-b-transparent border-l-transparent opacity-50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-14 h-14 text-blue-600 animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="font-display text-4xl font-extrabold text-gray-900">Your Journey Awaits</h2>
                                <div className="h-2 bg-gray-100 rounded-full max-w-sm mx-auto overflow-hidden shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </div>
                                <div className="h-8">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={loadingStepIndex}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            className="text-blue-600 font-bold uppercase tracking-widest text-xs"
                                        >
                                            {loadingSteps[loadingStepIndex]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/80 p-8 rounded-[2.5rem] shadow-xl border border-blue-100/50"
                            >
                                <div className="flex items-center justify-center gap-2 mb-4 text-amber-500">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Egypt Insight</span>
                                    <Star className="w-4 h-4 fill-amber-500" />
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={factIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-gray-800 text-xl font-medium leading-relaxed italic"
                                    >
                                        "{funFacts[factIndex]}"
                                    </motion.p>
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`max-w-5xl mx-auto transition-all duration-700 ${isLoading ? 'blur-2xl opacity-0' : ''}`}>
                {/* Navigation Header */}
                <div className="mb-12">
                    <Link href="/dashboard/trips" className="inline-flex items-center text-gray-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-6 transition-colors group">
                        <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to My Trips
                    </Link>
                    <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
                        Plan your dream journey.
                    </h1>
                    <p className="text-gray-600 text-lg sm:text-xl font-medium max-w-2xl">
                        KEMET assistant-crafted itineraries tailored to your unique travel style and interests.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Current Step</span>
                            <div className="text-3xl font-display font-extrabold text-gray-900">
                                {String(currentStep + 1).padStart(2, '0')}<span className="text-gray-300 mx-2">/</span>05
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Completion</span>
                            <div className="text-3xl font-display font-extrabold text-blue-600">{Math.round(progress)}%</div>
                        </div>
                    </div>
                    <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Main Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 md:p-16 border border-white/50 mb-10 overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                            <div>
                                <h2 className="font-display text-4xl font-extrabold text-gray-900 tracking-tight">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="text-gray-500 font-medium text-lg mt-1">{steps[currentStep].description}</p>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <div className={`w-3 h-3 rounded-full ${currentStep >= 0 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                            </div>
                        </div>
                        {renderStepContent()}
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="h-16 px-10 rounded-2xl font-bold text-gray-500 hover:text-gray-900 group"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Previous Step
                    </Button>

                    {currentStep === totalSteps - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || isLoading}
                            className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-lg shadow-2xl shadow-blue-500/30 group"
                        >
                            <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                            Generate My Adventure
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-extrabold text-lg group"
                        >
                            Continue
                            <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                </div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (() => {
                        const err = error as any
                        const msg =
                            err?.error ||
                            err?.data?.message ||
                            err?.data?.title ||
                            (err?.data?.errors
                                ? Object.entries(err.data.errors)
                                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? (v as string[]).join(', ') : v}`)
                                    .join(' | ')
                                : null) ||
                            'Something went wrong. Please try again.'
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4"
                            >
                                <Info className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-red-900">Something went wrong</h4>
                                    <p className="text-red-700 text-sm break-words">{msg}</p>
                                    {process.env.NODE_ENV === 'development' && err?.data && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-red-500 cursor-pointer">Technical details</summary>
                                            <pre className="text-xs text-red-400 mt-1 overflow-auto max-h-40">{JSON.stringify(err.data, null, 2)}</pre>
                                        </details>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })()}
                </AnimatePresence>
            </div>
        </div>
    )
}

function SummaryBadge({ label, value }: { label: string, value: string | number | undefined }) {
    return (
        <div className="bg-white/70 p-5 rounded-2xl border border-white flex flex-col items-center text-center shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</span>
            <span className="text-gray-900 font-extrabold">{value || 'Not set'}</span>
        </div>
    )
}
