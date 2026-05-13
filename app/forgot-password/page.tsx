"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useForgotPasswordMutation } from "@/store/features/auth/authApi"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")
        setError("")
        try {
            const res = await forgotPassword({ email }).unwrap()
            setMessage("If the email exists, we've sent a reset code.")
            // Optionally redirect to reset page with email prefilled
            setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 700)
        } catch (err: any) {
            setError(err?.data?.error?.message || err?.data?.message || "Request failed. Please try again.")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 app-surface">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="font-display text-3xl font-bold text-[#1C2B6A] mb-2">Forgot Password</h2>
                    <p className="text-[#1C2B6A] font-bold">Enter your email to receive a reset code.</p>
                </div>
                <Card className="border-none shadow-xl glass-card">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-[#1C2B6A]">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/50 border-gray-200 focus:border-[#1C2B6A] focus:ring-0 font-bold text-[#1C2B6A]" />
                            </div>

                            {message && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{message}</div>}
                            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

                            <Button type="submit" className="w-full btn-kio text-[#d5bb88] font-bold h-12 shadow-lg" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Reset Code"}
                            </Button>
                            <div className="text-center mt-4">
                                <Link href="/login" className="text-[#1C2B6A] hover:text-[#170C79] font-bold text-sm transition-colors underline-offset-4 hover:underline">Back to login</Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
