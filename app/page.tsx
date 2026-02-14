"use client"

import Link from "next/link"
import Image from "next/image"
import OptimizedImage from "@/components/ui/optimized-image"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sparkles, Map, MessageSquare, Car, Languages, Eye, Star, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRef } from "react"
import { useGetDestinationsQuery, useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from "@/store/features/destinations/destinationsApi"
import { useAppSelector } from "@/store/hooks"
import { selectIsAuthenticated } from "@/store/features/auth/authSlice"
import { useToast } from "@/components/ui/use-toast"
import { Heart } from "lucide-react"

function FavoriteButton({ id }: { id: string }) {
    const { toast } = useToast()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const { data: favorites = [] } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })
    const [addFavorite] = useAddFavoriteMutation()
    const [removeFavorite] = useRemoveFavoriteMutation()

    const isFavorite = favorites.some(f => f.id === id)

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please login to save favorites.",
                variant: "destructive",
            })
            return
        }

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

    return (
        <Button
            variant="secondary"
            size="icon"
            className={`rounded-full h-10 w-10 shadow-lg backdrop-blur-md transition-all ${isFavorite ? "bg-red-50 text-red-500" : "bg-white/20 text-white hover:bg-white/40"
                }`}
            onClick={handleToggleFavorite}
        >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
    )
}

export default function HomePage() {
    // Fetch real destinations from API
    const { data: allDestinations = [], isLoading } = useGetDestinationsQuery()

    // Get first 6 destinations for featured section
    const featuredDestinations = allDestinations.slice(0, 6)
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

    const features = [
        {
            icon: Sparkles,
            title: "AI-Powered Planning",
            description: "Get personalized itineraries based on your preferences, budget, and travel style",
            color: "text-orange-500",
            delay: 0
        },
        {
            icon: MessageSquare,
            title: "24/7 AI Assistant",
            description: "Get instant answers to your questions about Egypt anytime, anywhere",
            color: "text-blue-600",
            delay: 0.1
        },
        {
            icon: Languages,
            title: "Smart Translator",
            description: "Translate Arabic phrases and learn local customs instantly",
            color: "text-orange-500",
            delay: 0.2
        },
    ]

    return (
        <div ref={containerRef} className="flex flex-col min-h-screen overflow-x-hidden bg-background">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />

                {/* Hero image - Egypt Pyramids */}
                <div className="absolute inset-0">
                    <OptimizedImage
                        src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop"
                        alt="Egypt Pyramids"
                        fill
                        className="object-cover opacity-20 sepia-[.2]"
                        priority
                    />
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative container mx-auto px-4 text-center max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        {/* Elegant badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Badge className="px-6 py-2 bg-white/60 backdrop-blur-md text-bronze border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <Sparkles className="h-4 w-4 mr-2 text-gold" />
                                AI-Powered Kemet Explorer
                            </Badge>
                        </motion.div>

                        {/* Main heading with better alignment */}
                        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-bronze">
                            Discover the <span className="text-transparent bg-clip-text gradient-egyptian">Magic of Egypt</span>
                            <br />
                            with <span className="text-transparent bg-clip-text gradient-egyptian">Kemet</span>
                        </h1>

                        {/* Subtitle with better alignment */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-xl text-bronze/80 max-w-3xl mx-auto leading-relaxed font-light"
                        >
                            Your intelligent companion for exploring ancient wonders, vibrant culture, and unforgettable experiences—designed for the modern traveler.
                        </motion.p>

                        {/* CTA buttons with better alignment */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
                        >
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-8 text-base gradient-egyptian hover:opacity-90 text-bronze font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl btn-active-taupe">
                                    Start Planning <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/destinations">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2 border-amber-200/50 text-bronze hover:border-gold hover:bg-amber-50/50 transition-all duration-300 rounded-xl">
                                    Explore Destinations
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats card with better alignment */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mt-16"
                    >
                        <Card className="bg-white/40 backdrop-blur-xl border border-amber-200/30 shadow-xl rounded-2xl">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                    {[
                                        { label: "Years History", value: "7,000+" },
                                        { label: "Active Users", value: "50k+" },
                                        { label: "Destinations", value: "100+" },
                                        { label: "AI Plans Created", value: "120k+" },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.9 + i * 0.1 }}
                                        >
                                            <h3 className="text-2xl md:text-3xl font-bold text-gold font-display">{stat.value}</h3>
                                            <p className="text-xs md:text-sm text-bronze/70 uppercase tracking-wider mt-1 font-medium">{stat.label}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            <Separator className="bg-amber-200/20" />

            {/* Features Section */}
            <section className="py-24 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-50/10 to-transparent" />

                <div className="relative container mx-auto px-4">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-gold font-semibold tracking-wider uppercase text-sm mb-4 block">Smart Travel</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 leading-tight text-bronze">
                                Why Choose <span className="text-transparent bg-clip-text gradient-egyptian">Kemet</span>?
                            </h2>
                            <p className="text-lg text-bronze/80 max-w-2xl mx-auto leading-relaxed font-light">
                                Experience Egypt like never before with our cutting-edge tourism ecosystem designed for the modern traveler.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <Card className="h-full border-amber-200/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden group-hover:bg-white/80">
                                    <div className="p-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 bg-amber-50 text-gold border border-amber-100`}>
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-xl mb-3 text-bronze">{feature.title}</h3>
                                        <p className="text-bronze/70 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Destinations */}
            <section className="py-24 relative overflow-hidden bg-background">
                {/* Sophisticated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-amber-50/20 to-background" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

                <div className="relative container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="max-w-2xl"
                        >
                            <span className="text-gold font-semibold tracking-wider uppercase text-sm mb-4 block">Curated Experiences</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 leading-tight text-bronze">
                                Popular <span className="text-transparent bg-clip-text gradient-egyptian">Destinations</span>
                            </h2>
                            <p className="text-lg text-bronze/80 leading-relaxed font-light max-w-xl">
                                Explore Egypt&apos;s most iconic and breathtaking locations, hand-picked for the ultimate experience.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Link href="/destinations">
                                <Button size="lg" variant="outline" className="group h-14 px-8 border-2 border-amber-200/50 text-bronze hover:border-gold hover:bg-amber-50/50 transition-all duration-300 rounded-xl">
                                    View All Destinations <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="w-12 h-12 animate-spin text-gold" />
                        </div>
                    ) : featuredDestinations.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-bronze/60 text-lg">No destinations available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredDestinations.map((destination, index) => (
                                <motion.div
                                    key={destination.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={`/destinations/detail?id=${destination.id}`}>
                                        <div className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-amber-200/20">
                                            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
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
                                                    <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                                                        <span className="text-bronze/40">No Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sophisticated overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-500" />

                                            {/* Favorite Button on Home Page */}
                                            <div className="absolute top-4 right-4 z-20">
                                                <FavoriteButton id={destination.id} />
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                                <h3 className="font-display text-2xl font-bold mb-3 text-white">{destination.name}</h3>
                                                <p className="text-white/80 mb-4 line-clamp-2 text-base leading-relaxed">{destination.description}</p>
                                                <div className="flex items-center text-primary font-semibold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                                                    Explore Now <ArrowRight className="ml-2 w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 overflow-hidden">
                {/* Elegant background */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[#1c170d]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

                {/* Egypt background image */}
                <div className="absolute inset-0">
                    <OptimizedImage
                        src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1920&h=1080&fit=crop"
                        alt="Egypt Desert"
                        fill
                        className="object-cover opacity-20 sepia"
                    />
                </div>

                {/* Floating elements */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-gold/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />

                <div className="relative container mx-auto px-4 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="font-display text-3xl md:text-5xl font-bold mb-8 text-white leading-tight">
                            Ready to Write Your
                            <br />
                            <span className="text-transparent bg-clip-text gradient-egyptian">Own History</span>?
                        </h2>
                        <p className="text-lg md:text-xl mb-8 text-white/80 leading-relaxed font-light max-w-3xl mx-auto">
                            Join thousands of travelers who have discovered the secrets of Egypt with our intelligent platform. Your adventure begins here.
                        </p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-10 text-base gradient-egyptian text-bronze hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl rounded-xl font-bold btn-active-taupe">
                                    Create Your Free Account
                                </Button>
                            </Link>
                        </motion.div>
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4 text-gold" />
                                <span>Free Plan Available</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4 text-gold" />
                                <span>No Credit Card Required</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4 text-gold" />
                                <span>24/7 Support</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
