"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { MapPin, ArrowRight, Loader2, Heart, DollarSign, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from "@/store/features/destinations/destinationsApi"
import { useAppSelector } from "@/store/hooks"
import { selectIsAuthenticated } from "@/store/features/auth/authSlice"
import { useToast } from "@/components/ui/use-toast"

export default function FavoritesPage() {
    const { toast } = useToast()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    // Fetch favorites from API
    const { data: favorites = [], isLoading, error } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })
    const [removeFavorite] = useRemoveFavoriteMutation()

    const handleRemoveFavorite = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            await removeFavorite(id).unwrap()
            toast({ title: "Removed from favorites" })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to remove from favorites.",
                variant: "destructive",
            })
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-6 px-4 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <Heart className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
                <p className="text-gray-600 max-w-sm">Please login to view your favorite destinations.</p>
                <Link href="/auth/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Login Now</Button>
                </Link>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <p className="text-red-500 font-semibold text-lg">Failed to load favorites.</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="font-display text-4xl font-bold text-bronze mb-2">My Favorites</h1>
                        <p className="text-bronze/80">All the places you&apos;ve saved for your adventure</p>
                    </motion.div>

                    <Link href="/destinations">
                        <Button variant="outline" className="border-amber-200 text-bronze hover:bg-amber-50 rounded-xl">
                            Explore More
                        </Button>
                    </Link>
                </div>

                {/* Favorites Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((destination, index) => (
                            <motion.div
                                key={destination.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Link href={`/destinations/detail?id=${destination.id}`} className="block h-full group">
                                    <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 relative group bg-white/80 backdrop-blur-sm">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            {destination.imageUrl ? (
                                                <Image
                                                    src={destination.imageUrl}
                                                    alt={destination.name || "Destination"}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    No Image
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                                                <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white border border-gold/30 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-gold" />
                                                    {destination.city}
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                                                    onClick={(e) => handleRemoveFavorite(e, destination.id)}
                                                >
                                                    <Heart className="w-4 h-4 fill-current" />
                                                </Button>
                                            </div>

                                            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                                                {destination.estimatedPrice !== undefined && (
                                                    <div className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-bronze shadow-sm">
                                                        {destination.estimatedPrice === 0 ? "Free" : `${destination.estimatedPrice} EGP`}
                                                    </div>
                                                )}
                                                {destination.vrUrlImage && (
                                                    <div className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-bronze shadow-sm">
                                                        VR
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <CardContent className="p-5">
                                            <h3 className="font-display text-xl font-bold text-bronze mb-2 line-clamp-1 group-hover:text-gold transition-colors">
                                                {destination.name}
                                            </h3>

                                            <p className="text-sm text-bronze/80 line-clamp-2 mb-4 leading-relaxed">
                                                {destination.description}
                                            </p>

                                            <div className="flex items-center text-gold text-sm font-semibold group-hover:gap-2 transition-all">
                                                View Details
                                                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-2 border-dashed border-amber-200/50 bg-white/60">
                            <CardContent className="py-20 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-100">
                                    <Heart className="w-10 h-10 text-gold/50" />
                                </div>
                                <h3 className="text-2xl font-bold text-bronze mb-2">No favorites yet</h3>
                                <p className="text-bronze/60 max-w-xs mb-8">
                                    Browse destinations and click the heart icon to save them here.
                                </p>
                                <Link href="/destinations">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-bronze font-bold px-8 rounded-xl h-12 shadow-lg hover:shadow-amber-500/20 transition-all btn-active-taupe">
                                        Browse Destinations
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
