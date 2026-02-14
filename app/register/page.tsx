"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, User, UserPlus, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRegisterMutation } from "@/store/features/auth/authApi"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: 0 // always user (0)
    })
    const [error, setError] = useState("")
    const router = useRouter()
    const [register, { isLoading }] = useRegisterMutation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        try {
            const result = await register({ ...formData, role: 0 }).unwrap()
            // Registration successful, guide user to verify email
            const emailParam = encodeURIComponent(result.user?.email || formData.email)
            router.push(`/verify-email?email=${emailParam}`)
        } catch (err: any) {
            setError(err?.data?.error?.message || err?.data?.message || "Registration failed. Please try again.")
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
                        <UserPlus className="w-8 h-8 text-brand-text" />
                    </motion.div>
                    <h1 className="font-display text-4xl font-bold tracking-tight mb-3 text-logo">
                        Create Account
                    </h1>
                    <p className="text-brand-text/80 text-lg font-bold">Start your Egyptian adventure today</p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-3xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-bold text-brand-text">
                                    First Name
                                </Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-icon group-focus-within:text-logo transition-colors" />
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                        className="pl-12 h-12 bg-white/50 border-border focus:border-brand-logo focus:ring-2 focus:ring-brand-logo/20 rounded-xl transition-all font-bold text-brand-text placeholder:text-brand-text/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-bold text-brand-text">
                                    Last Name
                                </Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-icon group-focus-within:text-logo transition-colors" />
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                        className="pl-12 h-12 bg-white/50 border-border focus:border-brand-logo focus:ring-2 focus:ring-brand-logo/20 rounded-xl transition-all font-bold text-brand-text placeholder:text-brand-text/50"
                                    />
                                </div>
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="pl-12 h-14 bg-white/50 border-border focus:border-brand-logo focus:ring-2 focus:ring-brand-logo/20 rounded-xl transition-all font-bold text-brand-text placeholder:text-brand-text/50"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold text-brand-text">
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-icon group-focus-within:text-logo transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="pl-12 h-14 bg-white/50 border-border focus:border-brand-logo focus:ring-2 focus:ring-brand-logo/20 rounded-xl transition-all font-bold text-brand-text placeholder:text-brand-text/50"
                                />
                            </div>
                            <p className="text-xs text-brand-text/70 mt-1 font-bold">Must be at least 8 characters</p>
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
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform icon-gold" />
                                </span>
                            )}
                        </Button>

                        {/* Sign In Link */}
                        <div className="text-center pt-2">
                            <span className="text-brand-text/80 text-sm font-bold">Already have an account? </span>
                            <Link
                                href="/login"
                                className="text-sm font-bold text-logo hover:text-brand-icon transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    )
}
