'use client'

import { useState } from 'react'
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
    Palmtree
} from 'lucide-react'

interface TripPreferences {
    travelStyle: number
    groupSize: number
    durationDays: number
    startDate: string
    budget: number
    interests: string[]
    pace: string
}

const travelStyles = [
    { id: 0, label: 'Budget-Friendly', description: '$50-100/day', icon: DollarSign, budget: 3000 },
    { id: 1, label: 'Comfortable', description: '$100-200/day', icon: Hotel, budget: 5000 },
    { id: 2, label: 'Luxury Experience', description: '$200+/day', icon: Star, budget: 10000 },
]

const groupSizes = [
    { id: 1, label: 'Solo Adventure', description: 'Just me', icon: Users },
    { id: 2, label: 'Couple', description: '2 people', icon: Heart },
    { id: 4, label: 'Small Group', description: '3-4 people', icon: Users },
    { id: 6, label: 'Large Group', description: '5+ people', icon: Users },
]

const durations = [
    { id: 3, label: 'Quick Getaway', description: '3-5 days', icon: Calendar },
    { id: 7, label: 'Week Adventure', description: '7-10 days', icon: Calendar },
    { id: 14, label: 'Extended Journey', description: '14+ days', icon: Calendar },
]

const interests = [
    { id: 'Ancient History', label: 'Ancient History', icon: Camera },
    { id: 'Museums', label: 'Museums', icon: Hotel },
    { id: 'Architecture', label: 'Architecture', icon: MapPin },
    { id: 'Food & Cuisine', label: 'Egyptian Cuisine', icon: Utensils },
    { id: 'Adventure', label: 'Adventure', icon: Sparkles },
    { id: 'Beach & Relaxation', label: 'Beach & Relaxation', icon: Palmtree },
    { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'Nature & Wildlife', label: 'Nature', icon: MapPin },
]

const paces = [
    { id: 'relaxed', label: 'Relaxed Pace', description: '2-3 activities per day', icon: Clock },
    { id: 'moderate', label: 'Moderate Pace', description: '3-4 activities per day', icon: Clock },
    { id: 'packed', label: 'Action-Packed', description: '5+ activities per day', icon: Sparkles },
]

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

const loadingSteps = [
    "Analyzing your travel style...",
    "Scanning Egypt's hidden gems...",
    "Curating cultural experiences...",
    "Optimizing travel routes...",
    "Designing your perfect itinerary..."
]

const funFacts = [
    "Did you know? The Great Pyramid of Giza consists of 2.3 million stone blocks.",
    "Ancient Egyptians invented the 365-day calendar we use today.",
    "Cleopatra wasn't Egyptian; she was actually Greek!",
    "The Nile River flows north, unlike most major rivers.",
    "Cats were considered sacred in Ancient Egypt."
]

export default function TripGeneratorPage() {
    const router = useRouter()
    const [generateTrip, { isLoading, error }] = useGenerateTripWithAIMutation()
    const [currentStep, setCurrentStep] = useState(0)

    // Loading state management
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
        pace: 'moderate'
    })

    const totalSteps = 5
    const progress = ((currentStep + 1) / totalSteps) * 100

    const steps = [
        { title: 'Travel Style', description: 'What\'s your budget preference?' },
        { title: 'Group Size', description: 'How many people are traveling?' },
        { title: 'Duration', description: 'How long is your trip?' },
        { title: 'Interests', description: 'What interests you most?' },
        { title: 'Trip Details', description: 'Final touches for your journey' },
    ]

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
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
        // ... (Keep existing implementation of renderStepContent)
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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`cursor-pointer transition-all rounded-2xl p-6 border-2 ${isSelected
                                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl shadow-amber-200/50'
                                        : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg'
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
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isSelected
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                            : 'bg-gray-100'
                                            }`}>
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{style.label}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                                        {isSelected && (
                                            <div className="flex items-center justify-center gap-2 text-amber-600">
                                                <Check className="w-5 h-5" />
                                                <span className="text-sm font-semibold">Selected</span>
                                            </div>
                                        )}
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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`cursor-pointer transition-all rounded-2xl p-6 border-2 ${isSelected
                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl shadow-blue-200/50'
                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                                        }`}
                                    onClick={() => setPreferences(prev => ({ ...prev, groupSize: size.id }))}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isSelected
                                                ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                : 'bg-gray-100'
                                                }`}>
                                                <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{size.label}</h3>
                                                <p className="text-sm text-gray-600">{size.description}</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-6 h-6 text-blue-600" />
                                        )}
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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`cursor-pointer transition-all rounded-2xl p-6 border-2 ${isSelected
                                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl shadow-purple-200/50'
                                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
                                        }`}
                                    onClick={() => setPreferences(prev => ({ ...prev, durationDays: duration.id }))}
                                >
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isSelected
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-gray-100'
                                            }`}>
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{duration.label}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{duration.description}</p>
                                        {isSelected && (
                                            <div className="flex items-center justify-center gap-2 text-purple-600">
                                                <Check className="w-5 h-5" />
                                                <span className="text-sm font-semibold">Selected</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )

            case 3:
                return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {interests.map((interest) => {
                            const Icon = interest.icon
                            const isSelected = preferences.interests.includes(interest.id)
                            return (
                                <motion.div
                                    key={interest.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`cursor-pointer transition-all rounded-xl p-4 border-2 ${isSelected
                                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg'
                                        : 'border-gray-200 bg-white hover:border-amber-300'
                                        }`}
                                    onClick={() => handleInterestToggle(interest.id)}
                                >
                                    <div className="text-center">
                                        <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${isSelected
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                            : 'bg-gray-100'
                                            }`}>
                                            <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="font-medium text-sm text-gray-900 leading-tight">{interest.label}</h3>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-amber-600 mx-auto mt-2" />
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
                        {/* Date and Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={preferences.startDate}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-amber-600" />
                                    Total Budget (USD)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={preferences.budget}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    placeholder="e.g., 5000"
                                />
                            </div>
                        </div>

                        {/* Trip Summary */}
                        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200">
                            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-amber-600" />
                                Your Egypt Adventure Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Style</div>
                                    <div className="font-bold text-gray-900">
                                        {travelStyles.find(s => s.id === preferences.travelStyle)?.label}
                                    </div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Travelers</div>
                                    <div className="font-bold text-gray-900">{preferences.groupSize} {preferences.groupSize === 1 ? 'Person' : 'People'}</div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Duration</div>
                                    <div className="font-bold text-gray-900">{preferences.durationDays} Days</div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Interests</div>
                                    <div className="font-bold text-gray-900">{preferences.interests.length} Selected</div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Budget</div>
                                    <div className="font-bold text-gray-900">${preferences.budget.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                                    <div className="text-xs text-gray-600 mb-1 font-semibold uppercase tracking-wide">Start Date</div>
                                    <div className="font-bold text-gray-900">{new Date(preferences.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return preferences.travelStyle !== undefined
            case 1:
                return preferences.groupSize > 0
            case 2:
                return preferences.durationDays > 0
            case 3:
                return preferences.interests.length > 0
            case 4:
                return preferences.startDate !== ''
            default:
                return false
        }
    }

    // Normal Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 px-4 relative">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-md overflow-hidden"
                    >
                        {/* Ambient Background Blocks */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{ duration: 8, repeat: Infinity }}
                                className="absolute top-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
                            />
                        </div>

                        <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
                            {/* Main Loader */}
                            <div className="relative w-40 h-40 mx-auto">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-t-4 border-amber-500 border-r-transparent border-b-transparent border-l-transparent"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-2 rounded-full border-t-4 border-blue-400 border-r-transparent border-b-transparent border-l-transparent opacity-70"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-12 h-12 text-amber-600 animate-pulse" />
                                </div>
                            </div>

                            {/* Progress Steps */}
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    Generating Your Journey
                                </h2>
                                <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
                                        animate={{
                                            x: ["-100%", "100%"]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </div>
                                <div className="h-8 relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={loadingStepIndex}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            className="text-amber-600 font-medium"
                                        >
                                            {loadingSteps[loadingStepIndex]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Fun Facts */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-amber-100 max-w-lg mx-auto shadow-xl"
                            >
                                <div className="flex items-center justify-center gap-2 mb-3 text-amber-500">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Fun Fact</span>
                                    <Star className="w-4 h-4 fill-amber-500" />
                                </div>
                                <div className="h-16 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={factIndex}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            className="text-gray-800 text-lg font-medium leading-relaxed"
                                        >
                                            "{funFacts[factIndex]}"
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`max-w-5xl mx-auto transition-all duration-500 ${isLoading ? 'blur-md scale-95 opacity-50' : ''}`}>
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/trips" className="text-sm text-gray-500 hover:text-amber-600 flex items-center mb-4 transition-colors group">
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Trips
                    </Link>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Plan Your Egypt Adventure
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Let AI create your personalized itinerary in just a few steps
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Step {currentStep + 1} of {totalSteps}</span>
                        <span className="text-sm font-semibold text-amber-600">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full shadow-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 font-medium">{steps[currentStep].description}</p>
                </div>

                {/* Content */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 border border-amber-100 mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                {currentStep + 1}
                            </div>
                            {steps[currentStep].title}
                        </h2>
                        {renderStepContent()}
                    </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-start gap-3"
                    >
                        <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-700 font-bold text-sm">!</span>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Generation Failed</p>
                            <p className="text-sm">
                                {(error as any)?.data?.message || 'Failed to generate trip. Please try again.'}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>
                    {currentStep === totalSteps - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || isLoading}
                            className="flex items-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Generate My Egypt Trip</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <span>Continue</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2 text-lg">AI-Powered Personalization</h3>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                Our advanced AI analyzes your preferences to create a detailed, day-by-day itinerary
                                tailored specifically for your Egypt adventure. You can customize every detail after generation!
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
