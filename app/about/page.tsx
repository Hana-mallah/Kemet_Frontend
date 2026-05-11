"use client"

import { motion } from "framer-motion"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Landmark, Palmtree, Sun, Users, Heart, Globe, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function AboutPage() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen bg-[#1C2B6A] text-[#d5bb88]">
            {/* Hero Section */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 text-center max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="mb-6 px-4 py-1.5 bg-egyptian-terracotta/10 text-egyptian-terracotta border-egyptian-terracotta/20">
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            Our Story
                        </Badge>
                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#d5bb88]">
                            Legacy of the Nile
                        </h1>
                        <p className="text-lg md:text-xl text-[#eace83] max-w-3xl mx-auto leading-relaxed mb-8">
                            Discover the land of pharaohs, pyramids, and timeless wonders where history breathes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/destinations">
                                <Button size="lg" variant="gradient" className="h-14 px-8 text-base shadow-lg">
                                    Explore Destinations <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href={isAuthenticated ? "/dashboard/travel-plan" : "/login"}>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                                    Plan Your Journey
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
            <Separator className="bg-border/60" />

            <div className="container mx-auto px-4 py-20">
                {/* Intro Block */}
                <div className="flex flex-col lg:flex-row gap-16 items-center mb-24">
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge className="mb-4 bg-egyptian-gold/10 text-egyptian-gold border-egyptian-gold/20">
                                7,000 Years of Civilization
                            </Badge>
                            <h2 className="font-display text-4xl font-bold mb-6 text-egyptian-nile">Journey Through Time</h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-6">
                                Egypt is home to one of the world&apos;s oldest civilizations, offering an unparalleled journey through time. From the Great Pyramids to the bustling streets of Cairo, every corner tells a story.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our platform helps you uncover these secrets, blending ancient history with modern technology to create the ultimate travel experience.
                            </p>
                        </motion.div>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <Card className="glass-card border-white/40 overflow-hidden">
                                <div className="aspect-[4/3] relative">
                                    <Image
                                        src="https://images.unsplash.com/photo-1632944398987-494eebe663be?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        alt="Egyptian Columns"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Key Facts Grid */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-egyptian-nile/10 text-egyptian-nile border-egyptian-nile/20">
                            Why Egypt?
                        </Badge>
                        <h2 className="font-display text-4xl font-bold mb-4">Discover Egypt&apos;s Wonders</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Experience the magic of ancient civilization combined with modern hospitality
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Landmark, title: "Ancient Wonders", desc: "Home to the only surviving wonder of the ancient world - the Great Pyramid of Giza.", color: "text-egyptian-gold", bg: "bg-egyptian-gold/5" },
                            { icon: Sun, title: "Perfect Climate", desc: "Over 300 days of sunshine per year, ideal for year-round exploration.", color: "text-egyptian-terracotta", bg: "bg-egyptian-terracotta/5" },
                            { icon: Users, title: "Warm Hospitality", desc: "Egyptians are known for their friendliness and welcoming nature to visitors.", color: "text-egyptian-nile", bg: "bg-egyptian-nile/5" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full ag-glass ag-float border-white/40 hover:shadow-xl transition-all duration-300 group bg-[#1C2B6A] text-[#d5bb88]">
                                    <CardContent className="p-8 text-center">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`h-8 w-8 ${item.color}`} />
                                        </div>
                                        <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Cultural Information */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-egyptian-terracotta/10 text-egyptian-terracotta border-egyptian-terracotta/20">
                            Cultural Heritage
                        </Badge>
                        <h2 className="font-display text-4xl font-bold mb-4">Cultural Highlights</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Immerse yourself in Egypt&apos;s rich tapestry of history and culture
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { icon: Heart, title: "Rich Heritage", desc: "Egypt's cultural tapestry weaves together ancient pharaonic traditions, Islamic heritage, Coptic Christianity, and modern influences.", bg: "bg-red-50", accent: "border-red-200" },
                            { icon: Palmtree, title: "Natural Beauty", desc: "Beyond ancient monuments, Egypt boasts stunning natural landscapes: the life-giving Nile River, vast Sahara Desert, and Red Sea reefs.", bg: "bg-green-50", accent: "border-green-200" },
                            { icon: Globe, title: "Strategic Location", desc: "Positioned at the crossroads of Africa, Asia, and Europe, Egypt has been a cultural and commercial hub for millennia.", bg: "bg-blue-50", accent: "border-blue-200" },
                            { icon: Landmark, title: "UNESCO Sites", desc: "Egypt is home to seven UNESCO World Heritage Sites, including the Pyramids of Giza, Ancient Thebes, Abu Simbel, and Historic Cairo.", bg: "bg-amber-50", accent: "border-amber-200" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="glass-card border-white/40 hover:shadow-lg transition-all duration-300 group">
                                    <CardContent className="p-8">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.accent} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                                <item.icon className="h-6 w-6 text-gray-800" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h3>
                                                <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Travel Tips */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-egyptian-nile/10 text-egyptian-nile border-egyptian-nile/20">
                            Travel Essentials
                        </Badge>
                        <h2 className="font-display text-4xl font-bold mb-4">Essential Travel Tips</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to know for your Egyptian adventure
                        </p>
                    </div>
                    <Card className="glass-card border-white/40">
                        <CardContent className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    { title: "Best Time to Visit", desc: "October to April offers pleasant temperatures (20-25°C).", icon: "🌤️" },
                                    { title: "Currency", desc: "Egyptian Pound (EGP). ATMs widely available.", icon: "💵" },
                                    { title: "Language", desc: "Arabic is official. English widely spoken in tourist areas.", icon: "🗣️" },
                                    { title: "Dress Code", desc: "Modest dress recommended, especially at religious sites.", icon: "👕" },
                                    { title: "Safety", desc: "Tourist areas are well-protected. Tourist police present at sites.", icon: "🛡️" },
                                    { title: "Cuisine", desc: "Try koshari, ful medames, ta'meya, and molokhia.", icon: "🍽️" },
                                ].map((tip, i) => (
                                    <Card key={i} className="border border-gray-100 hover:border-egyptian-gold/30 transition-colors">
                                        <CardContent className="p-6 text-center">
                                            <div className="text-4xl mb-4">{tip.icon}</div>
                                            <h4 className="font-bold text-lg mb-2 text-gray-900">{tip.title}</h4>
                                            <p className="text-gray-600 text-sm">{tip.desc}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
