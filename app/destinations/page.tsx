"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, MapPin, ArrowRight, Loader2, Heart, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGetDestinationsQuery, useAddFavoriteMutation, useRemoveFavoriteMutation, useGetFavoritesQuery } from "@/store/features/destinations/destinationsApi"
import { useAppSelector } from "@/store/hooks"
import { selectIsAuthenticated } from "@/store/features/auth/authSlice"
import { useToast } from "@/components/ui/use-toast"

export default function DestinationsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const { toast } = useToast()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    // Fetch destinations from API
    const { data: destinations = [], isLoading, error } = useGetDestinationsQuery()
    const { data: favorites = [] } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })

    const [addFavorite] = useAddFavoriteMutation()
    const [removeFavorite] = useRemoveFavoriteMutation()

    // Filter destinations based on search term
    const filteredDestinations = destinations.filter(dest => {
        const matchesSearch =
            dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.description?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please login to add destinations to your favorites.",
                variant: "destructive",
            })
            return
        }

        const isFavorite = favorites.some(f => f.id === id)
        try {
            if (isFavorite) {
                await removeFavorite(id).unwrap()
                toast({ title: "Removed from favorites" })
            } else {
                await addFavorite(id).unwrap()
                toast({ title: "Added to favorites" })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update favorites.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
                <p className="text-red-500 font-semibold text-lg">Failed to load destinations.</p>
                <Button onClick={() => window.location.reload()} className="bg-primary text-bronze hover:bg-primary/90">Try Again</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-amber-200/40">
                <div className="container mx-auto px-4 py-16 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-bronze">
                            Explore Egypt
                        </h1>
                        <p className="text-lg text-bronze/80">
                            Discover ancient wonders and unforgettable experiences across the land of the Pharaohs
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Search Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10"
                >
                    <Card className="border-amber-200/40 shadow-sm bg-white/60">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Search destinations, landmarks, cities..."
                                    className="pl-12 h-12 bg-white/80 border-amber-200/40 focus:border-gold focus:ring-gold text-bronze placeholder:text-bronze/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results Count */}
                {filteredDestinations.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-bronze/80">
                            Showing <span className="font-semibold text-bronze">{filteredDestinations.length}</span> destination{filteredDestinations.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Destinations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDestinations.map((destination, index) => {
                        const isFavorite = favorites.some(f => f.id === destination.id)

                        return (
                            <motion.div
                                key={destination.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Link href={`/destinations/detail?id=${destination.id}`} className="block h-full group">
                                    <Card className="h-full overflow-hidden border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 relative">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            {destination.imageUrl ? (
                                                <Image
                                                    src={destination.imageUrl}
                                                    alt={destination.name || "Destination image"}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    priority={index < 6}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    No Image
                                                </div>
                                            )}

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                            {/* Top badges/buttons */}
                                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                                                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1 shadow-sm">
                                                    <MapPin className="h-3 w-3" />
                                                    {destination.city}
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 rounded-full shadow-sm backdrop-blur-md transition-all ${isFavorite ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/20 text-white hover:bg-white/40"
                                                        }`}
                                                    onClick={(e) => handleToggleFavorite(e, destination.id)}
                                                >
                                                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                                                </Button>
                                            </div>

                                            {/* Price Badge */}
                                            {destination.estimatedPrice !== undefined && (
                                                <div className="absolute bottom-3 left-3 z-10">
                                                    <div className="bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-bronze flex items-center gap-1 shadow-sm">
                                                        <DollarSign className="h-3 w-3" />
                                                        {destination.estimatedPrice === 0 ? "Free" : `${destination.estimatedPrice} EGP`}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <CardContent className="p-5">
                                            <h3 className="font-display text-xl font-bold text-bronze mb-2 line-clamp-1 group-hover:text-gold transition-colors">
                                                {destination.name}
                                            </h3>

                                            <p className="text-sm text-bronze/80 line-clamp-2 mb-4 leading-relaxed">
                                                {destination.description}
                                            </p>

                                            <div className="flex items-center text-gold text-sm font-medium group-hover:gap-2 transition-all">
                                                View Details
                                                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>

                {filteredDestinations.length === 0 && (
                    <Card className="border-gray-200">
                        <CardContent className="py-16 text-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="h-7 w-7 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No destinations found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search terms.</p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSearchTerm("")}
                                className="border-gray-300"
                            >
                                Clear search
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
