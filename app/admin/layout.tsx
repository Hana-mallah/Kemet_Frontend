"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { LayoutDashboard, Activity, LogOut, Pyramid, Menu, X, Plane, Users } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isAdmin, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [mounted, setMounted] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const [reduceMotion, setReduceMotion] = useState(false)

    useEffect(() => {
        setMounted(true)
        setReduceMotion(!!shouldReduceMotion)
    }, [shouldReduceMotion])

    useEffect(() => {
        if (mounted && (!isAuthenticated || !isAdmin)) {
            router.push("/")
        }
    }, [isAuthenticated, isAdmin, router, mounted])

    // During build or SSR, we want to render the shell or a loader
    // to avoid build errors. The effective auth check is the useEffect above.
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    {/* Using a simple div instead of Lucide icon to avoid any import issues in this specific block if imports change, 
                         but existing imports are fine. */}
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || !isAdmin) {
        return null // This will be handled by the router.push in useEffect
    }

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Destinations", href: "/admin/destinations", icon: Pyramid },
        { name: "Trips", href: "/admin/trips", icon: Plane },
        { name: "Analytics", href: "/admin/analytics", icon: Activity },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <motion.aside
                initial={reduceMotion ? false as any : { width: 280 }}
                animate={reduceMotion ? undefined : { width: isSidebarOpen ? 280 : 80 }}
                transition={reduceMotion ? undefined : { duration: 0.2, ease: "easeInOut" }}
                className="hidden md:flex flex-col bg-white border-r h-screen sticky top-0 z-30 shadow-sm"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3 font-display font-bold text-xl text-gray-800">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url(/logo.png)' }}></div>
                            <span>Kemet</span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url(/logo.png)' }}></div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hidden lg:block"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
                {isSidebarOpen && (
                    <div className="px-6 -mt-4 mb-2">
                        <Link href="/" className="text-xs text-gray-500 hover:text-gray-800">← Back to Home</Link>
                    </div>
                )}

                <div className={`px-4 mb-6 ${!isSidebarOpen && "text-center"}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 ${!isSidebarOpen && "justify-center"}`}>
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-600 text-white font-medium">
                                {user?.name?.charAt(0) || "A"}
                            </AvatarFallback>
                        </Avatar>
                        {isSidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="font-semibold text-sm truncate text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">Administrator</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <Link key={item.name} href={item.href} className="block">
                                <div
                                    className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
          ${active
                                            ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md shadow-black/30"
                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    {/* Active indicator bar */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-blue-500" />
                                    )}

                                    {/* Icon */}
                                    <Icon
                                        className={`h-5 w-5 transition-all duration-300
            ${active
                                                ? "text-white"
                                                : "text-gray-400 group-hover:text-gray-900"
                                            }
            ${!isSidebarOpen && "mx-auto"}
          `}
                                    />

                                    {/* Text */}
                                    {isSidebarOpen && (
                                        <span
                                            className={`text-sm font-medium transition-colors duration-300
              ${active
                                                    ? "text-white"
                                                    : "text-gray-700 group-hover:text-gray-900"
                                                }`}
                                        >
                                            {item.name}
                                        </span>
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
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
                <div className="grid grid-cols-5 gap-1 p-2">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${active
                                    ? "text-gray-800 bg-gray-100"
                                    : "text-gray-500"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
