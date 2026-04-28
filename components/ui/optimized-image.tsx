"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
  priority?: boolean
  fallbackSrc?: string
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className,
  width,
  height,
  priority = false,
  fallbackSrc,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const getFallbackImage = () => {
    if (fallbackSrc) return fallbackSrc

    // Destination-specific fallbacks
    const altLower = alt.toLowerCase()
    if (altLower.includes('pyramid') || altLower.includes('giza')) {
      return '/images/pyramids-giza.svg'
    }
    if (altLower.includes('luxor')) {
      return '/images/luxor-temple.svg'
    }
    if (altLower.includes('red sea') || altLower.includes('resort')) {
      return '/images/red-sea-resort.svg'
    }

    // Generic fallback
    return 'https://placehold.co/600x400'
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(getFallbackImage())
    }
  }

  return (
    <div className={cn("relative overflow-hidden", fill && "w-full h-full", className)}>
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        className={cn(
          "object-cover transition-all duration-300",
          hasError && "opacity-90"
        )}
        onError={handleError}
        unoptimized={true}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 bg-white/80 px-2 py-1 rounded">
            <span className="text-xs">Fallback Image</span>
          </div>
        </div>
      )}
    </div>
  )
}
