"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Send, Bot, User, Sparkles, AlertCircle, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getChatbotResponse, mockChatHistory } from "@/data/chatbot-responses"
import { ChatMessage } from "@/types"

export default function ChatbotPage() {
    const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory)
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSend = () => {
        if (!input.trim()) return

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: input,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsTyping(true)

        setTimeout(() => {
            const response = getChatbotResponse(input)
            const aiMessage: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: "assistant",
                content: response,
                timestamp: new Date().toISOString()
            }
            setMessages(prev => [...prev, aiMessage])
            setIsTyping(false)
        }, 1200)
    }

    const suggestedQuestions = [
        "Best time to visit Pyramids?",
        "Vegetarian food options?",
        "Is it safe to walk at night?",
        "Price of Nile cruise?"
    ]

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-3">
                            <span className="bg-egyptian-gold/10 p-2 rounded-xl text-egyptian-gold"><Bot className="w-6 h-6 sm:w-8 sm:h-8" /></span>
                            Travel Assistant
                        </h1>
                        <p className="text-gray-500 text-sm sm:text-base">
                            Your personal AI guide for all things Egypt.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="flex-1 border-none shadow-xl overflow-hidden flex flex-col bg-white rounded-2xl">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
                    {messages.map((message) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex items-end max-w-[85%] md:max-w-[70%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${message.role === "user" ? "bg-egyptian-terracotta" : "bg-white border text-egyptian-gold"
                                    }`}>
                                    {message.role === "user" ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${message.role === "user"
                                    ? "bg-egyptian-terracotta text-white rounded-br-none"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    <span className={`text-[10px] mt-2 block opacity-70 ${message.role === "user" ? "text-white" : "text-gray-400"}`}>
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex items-end gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border text-egyptian-gold flex items-center justify-center shadow-sm">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="whitespace-nowrap px-4 py-2 bg-gray-50 hover:bg-egyptian-gold/10 hover:text-egyptian-gold text-gray-600 text-sm rounded-full transition-colors border border-gray-100"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 items-center">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask about travel, history, or logistics..."
                            className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-egyptian-gold/30 h-12 rounded-xl"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="bg-egyptian-gold hover:bg-egyptian-terracotta h-12 w-12 rounded-xl shadow-lg shadow-egyptian-gold/20 p-0 flex items-center justify-center"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" /> AI can make mistakes. Verify important info.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
