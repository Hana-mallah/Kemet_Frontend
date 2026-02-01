"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Languages, Volume2, Mic, MicOff, Copy, ArrowRightLeft, Sparkles, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { commonPhrases, getAllCategories, getPhrasesByCategory } from "@/data/translations"

export default function TranslatorPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [inputText, setInputText] = useState("")
    const [translatedText, setTranslatedText] = useState("")

    const categories = getAllCategories()
    const displayedPhrases = selectedCategory
        ? getPhrasesByCategory(selectedCategory)
        : commonPhrases

    const handleRecord = () => {
        setIsRecording(!isRecording)
        if (!isRecording) {
            // Mock recording start
            setTimeout(() => {
                setIsRecording(false)
                setInputText("Hello, how are you?")
                setTranslatedText("مرحبا، كيف حالك؟ (Marhaba, kayfa haluka?)")
            }, 2000)
        }
    }

    const handleTranslate = () => {
        if (!inputText) return
        // Mock translation
        setTranslatedText("مرحبا، كيف حالك؟ (Marhaba, kayfa haluka?)")
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="mb-2">
                <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-3">
                            <span className="bg-egyptian-gold/10 p-2 rounded-xl text-egyptian-gold"><Languages className="w-6 h-6 sm:w-8 sm:h-8" /></span>
                            AI Translator
                        </h1>
                        <p className="text-gray-500 text-sm sm:text-base">
                            Bridge the language gap instantly with our AI-powered English-Arabic translator.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Translator Interface */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl bg-white overflow-hidden">
                        <CardContent className="p-0">
                            {/* Input Area */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-gray-500 border-gray-200">English</Badge>
                                        <ArrowRightLeft className="w-4 h-4 text-gray-300" />
                                        <Badge className="bg-egyptian-nile hover:bg-egyptian-nile/90">Arabic</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setInputText("")}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <span className="sr-only">Clear</span>
                                        ×
                                    </Button>
                                </div>
                                <Textarea
                                    placeholder="Type or speak something to translate..."
                                    className="min-h-[120px] text-lg border-none focus-visible:ring-0 resize-none p-0 placeholder:text-gray-300"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                    <Button
                                        size="lg"
                                        onClick={handleRecord}
                                        className={`rounded-full px-6 transition-all duration-300 ${isRecording
                                            ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                                            }`}
                                        variant="outline"
                                    >
                                        {isRecording ? <MicOff className="h-5 w-5 mr-2 animate-pulse" /> : <Mic className="h-5 w-5 mr-2" />}
                                        {isRecording ? "Listening..." : "Voice Input"}
                                    </Button>
                                    <Button
                                        onClick={handleTranslate}
                                        disabled={!inputText}
                                        className="bg-egyptian-gold hover:bg-egyptian-terracotta text-white rounded-full px-8 shadow-lg shadow-egyptian-gold/20"
                                    >
                                        Translate <Sparkles className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>

                            {/* Output Area */}
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-[180px] flex flex-col justify-center relative">
                                {translatedText ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <p className="text-3xl font-bold text-egyptian-nile mb-2" dir="rtl">{translatedText.split("(")[0]}</p>
                                        <p className="text-gray-500 italic text-lg">{translatedText.split("(")[1]?.replace(")", "")}</p>

                                        <div className="flex gap-2 mt-6">
                                            <Button variant="outline" size="sm" className="rounded-full bg-white hover:bg-gray-50 border-gray-200 text-gray-600">
                                                <Volume2 className="h-4 w-4 mr-2" /> Play Audio
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-full bg-white hover:bg-gray-50 border-gray-200 text-gray-600">
                                                <Copy className="h-4 w-4 mr-2" /> Copy
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="text-center text-gray-300">
                                        <Languages className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Translation will appear here</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Phrasebook Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-egyptian-terracotta rounded-full" /> Quick Phrasebook
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    className={`cursor-pointer transition-colors ${selectedCategory === null ? 'bg-egyptian-terracotta hover:bg-egyptian-terracotta/90 text-white' : 'hover:bg-gray-100 text-gray-500 border-gray-200'}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All
                                </Badge>
                                {categories.map((category) => (
                                    <Badge
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        className={`cursor-pointer transition-colors ${selectedCategory === category ? 'bg-egyptian-terracotta hover:bg-egyptian-terracotta/90 text-white' : 'hover:bg-gray-100 text-gray-500 border-gray-200'}`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {displayedPhrases.map((phrase) => (
                                    <div
                                        key={phrase.id}
                                        className="p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer group"
                                        onClick={() => {
                                            setInputText(phrase.english)
                                            setTranslatedText(`${phrase.arabic} (${phrase.pronunciation})`)
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{phrase.english}</p>
                                                <p className="text-egyptian-terracotta font-medium text-lg mt-1" dir="rtl">{phrase.arabic}</p>
                                                <p className="text-xs text-gray-400 italic mt-1">{phrase.pronunciation}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                <Volume2 className="h-3 w-3 text-gray-400" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
