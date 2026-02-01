import type { Metadata } from "next"
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { TravelPlanProvider } from "@/contexts/TravelPlanContext"
import { AppChrome } from "@/components/shared/AppChrome"
import { ReduxProvider } from "@/store/ReduxProvider"
import { Toaster } from "@/components/ui/toaster"

const sans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans"
})

const display = DM_Serif_Display({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-display"
})

export const metadata: Metadata = {
    title: "Kemet - Discover Ancient Wonders",
    description: "Your AI-powered guide to exploring Egypt's ancient wonders, vibrant culture, and breathtaking destinations.",
    metadataBase: new URL('https://kemetegypttour.vercel.app/'), // Replace with your actual domain
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Kemet - Discover Ancient Wonders",
        description: "Your AI-powered guide to exploring Egypt's ancient wonders, vibrant culture, and breathtaking destinations.",
        url: 'https://kemetegypttour.vercel.app/', // Replace with your actual domain
        siteName: 'Kemet',
        images: [
            {
                url: '/logo.png', // Ideally a 1200x630 image for best results
                width: 1200,
                height: 630,
                alt: 'Kemet - Ancient Modernity',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Kemet - Discover Ancient Wonders",
        description: "Your AI-powered guide to exploring Egypt's ancient wonders, vibrant culture, and breathtaking destinations.",
        images: ['/logo.png'],
    },
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${sans.variable} ${display.variable}`}>
            <body className="font-sans antialiased">
                <ReduxProvider>
                    <AuthProvider>
                        <TravelPlanProvider>
                            <AppChrome>{children}</AppChrome>
                        </TravelPlanProvider>
                    </AuthProvider>
                </ReduxProvider>
                <Toaster />
            </body>
        </html>
    )
}
