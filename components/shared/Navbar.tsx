"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Pyramid, User, LogOut } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { isAuthenticated, user, logout, isAdmin } = useAuth()

    const isActive = (path: string) => pathname === path

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-18 items-center justify-between py-2">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div>
                            <span className="font-display text-xl font-bold text-bronze">
                                Kemet
                            </span>
                            <p className="text-xs text-bronze/80 font-medium">Discover Ancient Wonders</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        <Link
                            href="/"
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive("/") ? "bg-primary text-bronze shadow-md" : "text-bronze hover:bg-amber-100/50 hover:text-bronze"}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/destinations"
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive("/destinations") ? "bg-primary text-bronze shadow-md" : "text-bronze hover:bg-amber-100/50 hover:text-bronze"}`}
                        >
                            Destinations
                        </Link>
                        <Link
                            href="/about"
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive("/about") ? "bg-primary text-bronze shadow-md" : "text-bronze hover:bg-amber-100/50 hover:text-bronze"}`}
                        >
                            About Kemet
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    href={isAdmin ? "/admin" : "/dashboard"}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive("/dashboard") || isActive("/admin") ? "bg-primary text-bronze shadow-md" : "text-bronze hover:bg-amber-100/50 hover:text-bronze"}`}
                                >
                                    {isAdmin ? "Admin" : "Dashboard"}
                                </Link>
                                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-amber-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-bronze chat-bubble-icon" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-sm font-bold text-bronze">{user?.name?.split(" ")[0]}</p>
                                            <p className="text-xs text-bronze/70">Explorer</p>
                                        </div>
                                    </div>
                                    <Button onClick={logout} variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-200 hover:text-red-900 border-amber-200 text-bronze btn-active-taupe">
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3 ml-4">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="hover:bg-amber-100/50 text-bronze font-bold btn-active-taupe">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-bronze font-bold shadow-lg shadow-amber-500/20 btn-active-taupe">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden rounded-xl p-2.5 hover:bg-amber-100/50 transition-colors text-bronze"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="lg:hidden pb-4">
                        <div className="glass-card rounded-2xl p-4 space-y-2">
                            <Link
                                href="/"
                                className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive("/") ? "bg-primary text-bronze" : "text-bronze hover:bg-amber-100/50"}`}
                                onClick={() => setIsOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/destinations"
                                className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive("/destinations") ? "bg-primary text-bronze" : "text-bronze hover:bg-amber-100/50"}`}
                                onClick={() => setIsOpen(false)}
                            >
                                Destinations
                            </Link>
                            <Link
                                href="/about"
                                className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive("/about") ? "bg-primary text-bronze" : "text-bronze hover:bg-amber-100/50"}`}
                                onClick={() => setIsOpen(false)}
                            >
                                About Egypt
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <div className="border-t border-amber-200 pt-2 mt-2">
                                        <Link
                                            href={isAdmin ? "/admin" : "/dashboard"}
                                            className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive("/dashboard") || isActive("/admin") ? "bg-primary text-bronze" : "text-bronze hover:bg-amber-100/50"}`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {isAdmin ? "Admin" : "Dashboard"}
                                        </Link>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-bronze" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-bronze">{user?.name?.split(" ")[0]}</p>
                                                    <p className="text-xs text-bronze/70">Explorer</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-900 border-amber-200 text-bronze btn-active-taupe">
                                            <LogOut className="h-4 w-4 mr-2" /> Logout
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2 border-t border-amber-200 pt-2 mt-2">
                                    <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full hover:bg-amber-100/50 text-bronze font-bold border-amber-200 btn-active-taupe">Login</Button>
                                    </Link>
                                    <Link href="/register" className="block" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-bronze font-bold btn-active-taupe">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
