"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLoginMutation } from "@/store/features/auth/authApi"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [login, { isLoading }] = useLoginMutation()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        // Prevent default browser form submission
        e.preventDefault()
        setError("")

        try {
            console.log('Attempting login for:', email)
            const result = await login({ email, password }).unwrap()
            console.log('Login result:', result)

            const roleVal = result.user?.role
            console.log('Detected Role:', roleVal)

            if (roleVal === "admin") {
                console.log('Navigating to /admin')
                router.push("/admin")
            } else if (roleVal === "tourist") {
                console.log('Navigating to /dashboard')
                router.push("/dashboard")
            } else {
                console.warn('Unknown role, defaulting to /dashboard')
                router.push("/dashboard")
            }
        } catch (err: any) {
            console.error('Login error detail:', err)
            const errorMsg = err?.data?.error?.message ||
                err?.data?.message ||
                err?.message ||
                "Login failed. Please check your credentials."
            setError(errorMsg)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-background to-amber-100/30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-logo to-brand-icon mb-6 shadow-lg shadow-amber-500/20"
                    >
                        <Sparkles className="w-8 h-8 text-brand-text" />
                    </motion.div>
                    <h1 className="font-display text-4xl font-bold tracking-tight mb-3 text-logo">
                        Welcome Back
                    </h1>
                    <p className="text-brand-text/80 text-lg font-bold">Sign in to continue your journey</p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-3xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-brand-text">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-icon group-focus-within:text-logo transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-12 h-14 bg-white/50 border-border focus:border-brand-logo focus:ring-2 focus:ring-brand-logo/20 rounded-xl transition-all font-bold text-brand-text placeholder:text-brand-text/50"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-bold text-brand-text">
                                    Password
                                </Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-bold text-logo hover:text-brand-icon transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-icon group-focus-within:text-logo transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-12 h-14 bg-white/50 border-border focus:border-brand-logo focus:ring-2 focus:ring-brand-logo/20 rounded-xl transition-all font-bold text-brand-text placeholder:text-brand-text/50"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 leading-relaxed font-bold">{error}</p>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 gradient-egyptian hover:opacity-90 text-brand-text font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 group btn-active-taupe"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-brand-text/30 border-t-brand-text rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform icon-gold" />
                                </span>
                            )}
                        </Button>
                    </form>
                </motion.div>

                {/* Sign Up Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-brand-text/80 mt-6 font-bold"
                >
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-bold text-logo hover:text-brand-icon transition-colors"
                    >
                        Sign up for free
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    )
}
