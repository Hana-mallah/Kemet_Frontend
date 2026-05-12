"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Bot, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function ChatbotPage() {
    useEffect(() => {
        const script = document.createElement("script")
        script.type = "text/javascript"
        script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"
        script.onload = () => {
            if ((window as any).voiceflow && (window as any).voiceflow.chat) {
                (window as any).voiceflow.chat.load({
                    verify: { projectID: '69bafa2d60c986e8e0898041' },
                    url: 'https://general-runtime.voiceflow.com',
                    versionID: 'production',
                    voice: {
                        url: "https://runtime-api.voiceflow.com"
                    },
                    render: {
                        mode: 'embedded',
                        target: document.getElementById('voiceflow-chat-container')
                    }
                })
            }
        }
        document.body.appendChild(script)

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [])

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col font-sans">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-[#1C2B6A]/50 uppercase tracking-widest hover:text-[#1C2B6A] mb-4 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1C2B6A] mb-2 flex items-center gap-4">
                            <span className="bg-[#1C2B6A] p-3 rounded-2xl text-[#d5bb88] shadow-lg border border-[#d5bb88]/30">
                                <Bot className="w-7 h-7 sm:w-9 sm:h-9" />
                            </span>
                            Kemet Guide AI
                        </h1>
                        <p className="text-[#1C2B6A]/70 font-bold text-base sm:text-lg">
                            Your professional KEMET assistant for exploring Egypt&apos;s wonders.
                        </p>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex"
            >
                <Card className="flex-1 border-none shadow-2xl overflow-hidden flex flex-col bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 relative">
                    <div
                        id="voiceflow-chat-container"
                        className="absolute inset-0 w-full h-full [&>iframe]:!border-none [&>iframe]:!rounded-[2.5rem]"
                    >
                        {/* Voiceflow will inject the chat widget here */}
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-12 h-12 border-4 border-[#1C2B6A] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#1C2B6A]/40 font-bold uppercase tracking-widest text-xs">Initializing KEMET Assistant...</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}

