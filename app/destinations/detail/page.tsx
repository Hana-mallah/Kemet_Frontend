"use client"

import { useSearchParams } from "next/navigation"
import ClientDestination from "./ClientDestination"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

function DetailPageContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")

    if (!id) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-red-500 font-semibold">Error: No destination ID provided.</p>
            </div>
        )
    }

    return <ClientDestination destinationId={id} />
}

export default function DestinationDetailPageWrapper() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#1C2B6A]" />
            </div>
        }>
            <DetailPageContent />
        </Suspense>
    )
}
