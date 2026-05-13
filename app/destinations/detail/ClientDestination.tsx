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
                <Loader2 className="h-12 w-12 animate-spin text-[#1C2B6A]" />
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

    const getEmbedUrl = (url: string) => {
        if (!url) return ""

        // Matterport
        if (url.includes("matterport.com")) {
            if (url.includes("/show/?m=")) return url
            const modelId = url.split("/").pop()?.split("?")[0]
            return `https://my.matterport.com/show/?m=${modelId}`
        }

        // Kuula
        if (url.includes("kuula.co")) {
            if (url.includes("/share/")) return url
            const postId = url.split("/").pop()?.split("?")[0]
            return `https://kuula.co/share/collection/${postId}`
        }

        return url
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
                        className={`rounded-full shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] backdrop-blur-md transition-all ${isFavorite ? "bg-white text-[#1C2B6A]" : "bg-white/40 text-[#1C2B6A] hover:bg-white/60 border border-white/20"
                            }`}
                        onClick={toggleFavorite}
                        disabled={isAdding || isRemoving}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? "fill-[#1C2B6A] text-[#1C2B6A]" : "text-[#1C2B6A]"}`} />
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
                                <Badge className="bg-[#1C2B6A] backdrop-blur-md text-[#d5bb88] border-[#d5bb88]/30 px-4 py-1.5 rounded-full shadow-lg">
                                    <MapPin className="h-4 w-4 mr-2 text-[#d5bb88]" />
                                    <span className="font-bold uppercase tracking-widest text-xs">{destination.city}</span>
                                </Badge>
                                {destination.estimatedPrice !== undefined && (
                                    <Badge className="bg-[#d5bb88] backdrop-blur-md text-[#1C2B6A] border-none font-bold rounded-full px-4 py-1.5 shadow-lg">
                                        {destination.estimatedPrice === 0 ? "Free" : `${destination.estimatedPrice} EGP`}
                                    </Badge>
                                )}
                                {destination.vrUrlImage && (
                                    <Badge className="bg-[#1C2B6A] backdrop-blur-md text-[#d5bb88] border-[#d5bb88]/30 px-4 py-1.5 rounded-full shadow-lg">
                                        <span className="font-bold uppercase tracking-widest text-xs">VR</span>
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
                            <Card className="border-[#d5bb88]/20 shadow-xl bg-white/80 backdrop-blur-md ag-float">
                                <CardHeader className="border-b border-[#d5bb88]/10">
                                    <CardTitle className="text-3xl font-display flex items-center gap-3 text-[#1C2B6A]">
                                        <div className="w-10 h-10 bg-[#1C2B6A] rounded-xl flex items-center justify-center shadow-lg">
                                            <Info className="w-5 h-5 text-[#d5bb88]" />
                                        </div>
                                        About
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <p className="text-[#1C2B6A] leading-relaxed text-lg font-bold whitespace-pre-line">
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
                                <Card className="border-[#d5bb88]/20 shadow-2xl overflow-hidden ag-float">
                                    <CardHeader className="bg-[#1C2B6A] text-[#d5bb88] border-none py-6">
                                        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                                            <div className="w-10 h-10 bg-[#d5bb88] rounded-xl flex items-center justify-center shadow-inner">
                                                <Eye className="w-6 h-6 text-[#1C2B6A]" />
                                            </div>
                                            Virtual Tour
                                        </CardTitle>
                                        <p className="text-sm text-[#d5bb88]/80 mt-2 font-bold uppercase tracking-widest">
                                            Experience {destination.name} in immersive 360° virtual reality
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="aspect-video bg-black relative">
                                            <iframe
                                                src={getEmbedUrl(destination?.vrUrlImage)}
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
                            <Card className="border-none shadow-2xl bg-[#1C2B6A] overflow-hidden ag-float">
                                <CardHeader className="border-b border-[#d5bb88]/20 pb-4 pt-6">
                                    <CardTitle className="text-lg font-bold text-[#d5bb88] uppercase tracking-widest flex items-center gap-3">
                                        Practical Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 pb-8 space-y-6">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-[#d5bb88]/10 border border-[#d5bb88]/20 flex items-center justify-center group-hover:bg-[#d5bb88] transition-all duration-300">
                                            <MapPin className="w-5 h-5 text-[#d5bb88] group-hover:text-[#1C2B6A]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#d5bb88]/60 uppercase tracking-widest font-bold mb-1">Location</p>
                                            <p className="text-base font-bold text-white">{destination.city}, Egypt</p>
                                        </div>
                                    </div>

                                    {(destination.fromWorkingHours || destination.endWorkingHours) && (
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-[#d5bb88]/10 border border-[#d5bb88]/20 flex items-center justify-center group-hover:bg-[#d5bb88] transition-all duration-300">
                                                <Clock className="w-5 h-5 text-[#d5bb88] group-hover:text-[#1C2B6A]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#d5bb88]/60 uppercase tracking-widest font-bold mb-1">Working Hours</p>
                                                <p className="text-base font-bold text-white">
                                                    {destination.fromWorkingHours?.substring(0, 5) || "09:00"} - {destination.endWorkingHours?.substring(0, 5) || "18:00"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {destination.estimatedPrice !== undefined && (
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-[#d5bb88]/10 border border-[#d5bb88]/20 flex items-center justify-center group-hover:bg-[#d5bb88] transition-all duration-300">
                                                <DollarSign className="w-5 h-5 text-[#d5bb88] group-hover:text-[#1C2B6A]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#d5bb88]/60 uppercase tracking-widest font-bold mb-1">Estimated Entry Fee</p>
                                                <p className="text-base font-bold text-white">
                                                    {destination.estimatedPrice === 0 ? "Free Entry" : `${destination.estimatedPrice} EGP`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <Card className="border-[#d5bb88]/20 shadow-2xl sticky top-6 bg-white/80 backdrop-blur-md ag-float">
                                <CardContent className="p-8">
                                    <h3 className="font-bold text-2xl mb-3 text-[#1C2B6A] font-display">Plan Your Visit</h3>
                                    <p className="text-[#1C2B6A]/80 text-base mb-8 leading-relaxed font-bold">
                                        Add {destination.name} to your personalized Egypt itinerary and let our AI help you plan the perfect trip.
                                    </p>
                                    <Link href="/dashboard/trips/generate">
                                        <Button className="w-full btn-kio text-[#d5bb88] font-bold h-14 rounded-2xl shadow-xl shadow-[#1C2B6A]/20">
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
