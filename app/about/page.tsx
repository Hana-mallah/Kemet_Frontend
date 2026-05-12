"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Landmark, Sun, Users, ArrowRight,
    MapPin, BedDouble, ShoppingBag, Ticket
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function AboutPage() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    const handlePlanJourney = () => {
        if (isAuthenticated) {
            router.push("/dashboard/trips/generate")
        } else {
            router.push("/signup")
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 text-center max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >

                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#1C2B6A]">
                            Echoes of Eternity
                        </h1>
                        <p className="text-xl md:text-2xl font-semibold text-[#1C2B6A] max-w-3xl mx-auto leading-relaxed mb-8">
                            Step into the land where civilization began and history lives on through every wonder.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/destinations">
                                <Button
                                    size="lg"
                                    className="btn-kio text-[#d5bb88] font-bold h-14 px-8 text-base shadow-lg hover:shadow-xl hover:shadow-[#1C2B6A]/30 transition-all duration-300 group"
                                >
                                    Explore Destinations <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                onClick={handlePlanJourney}
                                className="h-14 px-8 text-base bg-[#d5bb88] text-[#170C79] hover:bg-[#eace83] border border-[#170C79]/20 font-bold transition-all duration-300 shadow-md"
                            >
                                Plan Your Journey
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Separator className="bg-[#d5bb88]/30" />

            <div className="container mx-auto px-4 py-20">

                {/* ── Intro Block ───────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-16 items-center mb-24">
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge className="mb-4 bg-[#d5bb88]/15 text-[#1C2B6A] border-[#d5bb88]/30">
                                7,000 Years of Civilization
                            </Badge>
                            <h2 className="font-display text-4xl font-bold mb-6 text-[#d5bb88]">
                                The Soul of a Civilization
                            </h2>
                            <p className="text-lg font-semibold text-[#1C2B6A] leading-relaxed">
                                Egypt stands as one of the world&apos;s greatest civilizations, where ancient temples,
                                majestic pyramids, and the timeless flow of the Nile preserve thousands of years of
                                history. From the heart of Cairo to the wonders of Luxor and Aswan, every destination
                                invites you to experience the beauty, mystery, and legacy of a culture that shaped the world.
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
                            <Card className="glass-card border-[#d5bb88]/30 overflow-hidden ag-float">
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

                {/* ── Key Facts Grid ────────────────────────────────── */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-[#1C2B6A]/10 text-[#1C2B6A] border-[#1C2B6A]/20">
                            Why Egypt?
                        </Badge>
                        <h2 className="font-display text-4xl font-bold mb-4 text-[#d5bb88]">
                            Discover Egypt&apos;s Wonders
                        </h2>
                        <p className="text-lg font-semibold text-[#1C2B6A] max-w-2xl mx-auto">
                            Experience the magic of ancient civilization combined with modern hospitality
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Landmark,
                                title: "Ancient Wonders",
                                desc: "Home to the only surviving wonder of the ancient world — the Great Pyramid of Giza.",
                                iconColor: "text-[#d5bb88]",
                                iconBg: "bg-[#d5bb88]/10",
                            },
                            {
                                icon: Sun,
                                title: "Perfect Climate",
                                desc: "Over 300 days of sunshine per year, ideal for year-round exploration.",
                                iconColor: "text-[#eace83]",
                                iconBg: "bg-[#eace83]/10",
                            },
                            {
                                icon: Users,
                                title: "Warm Hospitality",
                                desc: "Egyptians are known for their friendliness and welcoming nature to visitors.",
                                iconColor: "text-[#1C2B6A]",
                                iconBg: "bg-[#1C2B6A]/10",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full ag-glass ag-float ag-interactive border-[#d5bb88]/20 hover:shadow-xl transition-all duration-300 group">
                                    <CardContent className="p-8 text-center">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                                        </div>
                                        <h3 className="font-display font-bold text-xl mb-3 text-[#d5bb88]">
                                            {item.title}
                                        </h3>
                                        <p className="text-base font-semibold text-[#1C2B6A] leading-relaxed">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Travel Essentials ─────────────────────────────── */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-[#d5bb88]/15 text-[#1C2B6A] border-[#d5bb88]/30">
                            Your Digital Travel Companion
                        </Badge>
                        <h2 className="font-display text-4xl font-bold mb-4 text-[#d5bb88]">
                            Travel Essentials
                        </h2>
                        <p className="text-lg font-semibold text-[#1C2B6A] max-w-2xl mx-auto">
                            Navigate Egypt with ease using Kemet&apos;s integrated guide to local services and bookings.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: MapPin,
                                title: "Seamless Mobility",
                                desc: "Navigate Egypt effortlessly with top ride-hailing apps like Uber and DiDi, integrated for your convenience.",
                                label: "Transportation",
                            },
                            {
                                icon: BedDouble,
                                title: "Stay in Comfort",
                                desc: "Discover and book the finest hotels across Egypt, from luxury Nile-view suites to cozy boutique stays.",
                                label: "Accommodations",
                            },
                            {
                                icon: ShoppingBag,
                                title: "Local Flavors Delivered",
                                desc: "Access Egypt's top delivery apps like Talabat, InstaShop, and Breadfast for fresh groceries and local cuisine.",
                                label: "Food & Groceries",
                            },
                            {
                                icon: Ticket,
                                title: "Advance Access",
                                desc: "Skip the lines by booking your tickets for museums, pyramids, and paid attractions directly through Kemet.",
                                label: "Bookings",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="glass-card ag-interactive border border-[#d5bb88]/25 hover:shadow-xl hover:border-[#d5bb88]/50 transition-all duration-300 group">
                                    <CardContent className="p-8">
                                        <div className="flex items-start gap-5">
                                            {/* Dual-tone icon container */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 rounded-2xl bg-[#1C2B6A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                                    <item.icon className="h-7 w-7 text-[#d5bb88]" />
                                                </div>
                                                {/* Gold accent ring */}
                                                <div className="absolute -inset-0.5 rounded-2xl border border-[#d5bb88]/40 pointer-events-none" />
                                            </div>

                                            <div className="flex-1">
                                                {/* Category label */}
                                                <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#d5bb88]/70 mb-1.5">
                                                    {item.label}
                                                </span>
                                                <h3 className="font-bold text-xl mb-2 text-[#1C2B6A]">
                                                    {item.title}
                                                </h3>
                                                <p className="text-base font-semibold text-[#1C2B6A] leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
