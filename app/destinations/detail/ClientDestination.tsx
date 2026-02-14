"use client"

import { useGetDestinationQuery, useAddFavoriteMutation, useRemoveFavoriteMutation, useGetFavoritesQuery } from "@/store/features/destinations/destinationsApi"
import { motion } from "framer-motion"
import { MapPin, Loader2, Info, Eye, Heart, Clock, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { useAppSelector } from "@/store/hooks"
import { selectIsAuthenticated } from "@/store/features/auth/authSlice"

export default function ClientDestination({ destinationId }: { destinationId: string }) {
    const { toast } = useToast()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const { data: destination, isLoading, error } = useGetDestinationQuery(destinationId)
    const { data: favorites = [] } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })

    const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation()
    const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation()

    const isFavorite = favorites.some(f => f.id === destinationId)

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please login to add destinations to your favorites.",
                variant: "destructive",
            })
            return
        }

        try {
            if (isFavorite) {
                await removeFavorite(destinationId).unwrap()
                toast({ title: "Removed from favorites" })
            } else {
                await addFavorite(destinationId).unwrap()
                toast({ title: "Added to favorites" })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update favorites. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !destination) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <p className="text-red-500 font-semibold text-lg">Failed to load destination details.</p>
                <Link href="/destinations">
                    <Button>Back to Destinations</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                {destination.imageUrl ? (
                    <Image
                        src={destination.imageUrl}
                        alt={destination.name || "Destination image"}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No Image Available</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute top-6 right-6 z-10">
                    <Button
                        variant="secondary"
                        size="icon"
                        className={`rounded-full shadow-lg backdrop-blur-md transition-all ${isFavorite ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-black/30 text-white hover:bg-black/50 border border-white/20"
                            }`}
                        onClick={toggleFavorite}
                        disabled={isAdding || isRemoving}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="container mx-auto max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className="bg-black/60 backdrop-blur-md text-white border-gold/50">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-gold" />
                                    {destination.city}
                                </Badge>
                                {destination.estimatedPrice !== undefined && (
                                    <Badge className="bg-primary/90 backdrop-blur-md text-bronze border-none font-bold">
                                        <DollarSign className="h-3.5 w-3.5 mr-1 text-bronze" />
                                        {destination.estimatedPrice === 0 ? "Free" : `${destination.estimatedPrice} EGP`}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-md">
                                {destination.name}
                            </h1>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="border-amber-200/40 shadow-sm bg-white/60 backdrop-blur-sm">
                                <CardHeader className="border-b border-amber-200/20">
                                    <CardTitle className="text-2xl font-display flex items-center gap-2 text-bronze">
                                        <Info className="w-5 h-5 text-gold" />
                                        About
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-bronze/90 leading-relaxed text-base whitespace-pre-line">
                                        {destination.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* VR Tour */}
                        {destination.vrUrlImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <Card className="border-amber-200/40 shadow-sm overflow-hidden">
                                    <CardHeader className="gradient-egyptian text-white border-none">
                                        <CardTitle className="flex items-center gap-2 text-xl text-bronze font-bold">
                                            <Eye className="w-5 h-5 text-bronze" />
                                            Virtual Tour
                                        </CardTitle>
                                        <p className="text-sm text-bronze/80 mt-1 font-medium">
                                            Experience {destination.name} in immersive 360° virtual reality
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="aspect-video bg-black relative">
                                            <iframe
                                                src={destination?.vrUrlImage}
                                                className="w-full h-full"
                                                allowFullScreen
                                                title={`VR Tour of ${destination.name}`}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card className="border-amber-200/40 shadow-sm bg-white/60 backdrop-blur-sm">
                                <CardHeader className="border-b border-amber-200/20 pb-3">
                                    <CardTitle className="text-base font-semibold text-bronze">Practical Information</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gold mt-0.5" />
                                        <div>
                                            <p className="text-xs text-bronze/60 uppercase tracking-wide font-bold">Location</p>
                                            <p className="text-sm font-medium text-bronze">{destination.city}, Egypt</p>
                                        </div>
                                    </div>

                                    {(destination.fromWorkingHours || destination.endWorkingHours) && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-4 h-4 text-gold mt-0.5" />
                                            <div>
                                                <p className="text-xs text-bronze/60 uppercase tracking-wide font-bold">Working Hours</p>
                                                <p className="text-sm font-medium text-bronze">
                                                    {destination.fromWorkingHours?.substring(0, 5) || "09:00"} - {destination.endWorkingHours?.substring(0, 5) || "18:00"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {destination.estimatedPrice !== undefined && (
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="w-4 h-4 text-gold mt-0.5" />
                                            <div>
                                                <p className="text-xs text-bronze/60 uppercase tracking-wide font-bold">Estimated Entry Fee</p>
                                                <p className="text-sm font-medium text-bronze">
                                                    {destination.estimatedPrice === 0 ? "Free Entry" : `${destination.estimatedPrice} EGP`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-4 h-4 text-gold mt-0.5" />
                                        <div>
                                            <p className="text-xs text-bronze/60 uppercase tracking-wide font-bold">Best Time to Visit</p>
                                            <p className="text-sm font-medium text-bronze">October - April</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <Card className="border-amber-200/40 shadow-sm sticky top-6 bg-white/60 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-2 text-bronze">Plan Your Visit</h3>
                                    <p className="text-bronze/80 text-sm mb-6 leading-relaxed">
                                        Add {destination.name} to your personalized Egypt itinerary and let our AI help you plan the perfect trip.
                                    </p>
                                    <Link href="/dashboard/trips/generate">
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-bronze font-bold h-11 shadow-lg shadow-amber-500/20 btn-active-taupe">
                                            Create Travel Plan
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
