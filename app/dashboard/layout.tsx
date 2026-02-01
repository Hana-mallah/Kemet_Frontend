"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Home, Map, MessageSquare, Languages, LogOut, PanelLeft, Pyramid, Heart, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isTourist, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        if (!isAuthenticated || !isTourist) {
            router.push("/login")
        }
    }, [isAuthenticated, isTourist, router])

    if (!isAuthenticated || !isTourist) {
        return null
    }

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Travel Plan", href: "/dashboard/travel-plan", icon: Map },
        { name: "AI Assistant", href: "/dashboard/chatbot", icon: MessageSquare },
        { name: "Translator", href: "/dashboard/translator", icon: Languages },
        { name: "Favorites", href: "/dashboard/favorites", icon: Heart },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-blue-600 transition-colors" title="Back to main site">
                        <Home className="w-5 h-5" />
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg text-gray-800">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url(/logo.png)' }}></div>
                        <span>Kemet</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 h-9 w-9"
                        onClick={() => {
                            logout()
                            router.push("/")
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8 border shadow-sm">
                        <AvatarFallback className="bg-gray-800 text-white text-[10px] font-medium font-sans">
                            {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </header>

            {/* Sidebar Desktop */}
            <motion.aside
                initial={shouldReduceMotion ? false as any : { width: 280 }}
                animate={shouldReduceMotion ? undefined : { width: isSidebarOpen ? 280 : 80 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.2, ease: "easeInOut" }}
                className="hidden md:flex flex-col bg-white border-r h-screen sticky top-0 z-30 shadow-sm flex-shrink-0"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <motion.div
                            initial={shouldReduceMotion ? false as any : { opacity: 0 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                            className="flex items-center gap-2 font-display font-bold text-xl text-gray-800"
                        >
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url(/logo.png)' }}></div>
                            Kemet
                        </motion.div>
                    ) : (
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url(/logo.png)' }}></div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hidden lg:block"
                    >
                        <PanelLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4 mb-4">
                    <Link href="/" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                        <Home className="w-5 h-5" />
                        {isSidebarOpen && <span className="text-sm font-semibold">Back to Home</span>}
                    </Link>
                </div>

                <Separator className="mx-4 mb-6 w-auto opacity-50" />

                <div className={`px-4 mb-6 ${!isSidebarOpen && "text-center"}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 ${!isSidebarOpen && "justify-center"}`}>
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-600 text-white font-medium">
                                {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        {isSidebarOpen && (
                            <motion.div
                                initial={shouldReduceMotion ? false as any : { opacity: 0 }}
                                animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                                className="overflow-hidden"
                            >
                                <p className="font-semibold text-sm truncate text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">Explorer</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block"
                            >
                                <div className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative ${active
                                    ? "bg-gray-800 text-white shadow-lg shadow-gray-800/30"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                    }`}>
                                    <Icon className={`h-5 w-5 flex-shrink-0 ${!isSidebarOpen && "mx-auto"} ${active ? "text-white" : "text-gray-400 group-hover:text-gray-800"}`} />
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={shouldReduceMotion ? false as any : { opacity: 0 }}
                                            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                                            className="ml-3 font-medium text-sm"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                    {active && isSidebarOpen && (
                                        <motion.div
                                            layoutId={shouldReduceMotion ? undefined : "activeIndicator"}
                                            className="absolute left-0 w-1 h-6 bg-gray-500 rounded-r-full"
                                        />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <Button
                        variant="ghost"
                        className={`w-full text-red-500 hover:text-red-600 hover:bg-red-50 justify-start ${!isSidebarOpen && "justify-center px-0"}`}
                        onClick={() => {
                            logout()
                            router.push("/")
                        }}
                    >
                        <LogOut className="h-5 w-5 mr-0 md:mr-2" />
                        {isSidebarOpen && "Log out"}
                    </Button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto max-h-screen pb-20 md:pb-0">
                <div className="p-4 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <div className="grid grid-cols-5 gap-1 p-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 ${active
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                                <span className={`text-[9px] mt-1 font-bold truncate w-full text-center ${active ? "text-blue-600" : "text-gray-500"}`}>
                                    {item.name.split(" ")[0]}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
