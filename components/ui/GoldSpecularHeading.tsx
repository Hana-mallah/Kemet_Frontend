"use client"

import { useRef, useCallback } from "react"

/**
 * GoldSpecularHeading
 * ─────────────────────────────────────────────────────────────────────────────
 * Hero heading with mouse-reactive specular highlight on gold text.
 *
 * Words "Discover" and "with" are solid Deep Blue (#1C2B6A) — matte, no reaction.
 * Words "Timeless Egypt" and "Kemet" carry the .gold-specular class.
 *
 * On mousemove over the heading we compute the cursor's X position as a
 * percentage of the heading's width, then map it to a background-position
 * value for the gloss layer.
 *
 * The gloss gradient in .gold-specular has background-size: 400% 100%.
 * The needle is centred at 50% of the gradient, so:
 *   - background-position 300% → needle parked off right edge (default)
 *   - background-position 100% → needle at right side of span
 *   - background-position   0% → needle at left side of span
 *
 * We map: cursor 0% → gloss 100%, cursor 100% → gloss 0%
 *   (inverted so moving right sweeps the light left-to-right on screen)
 *
 * CSS `transition: background-position 0.4s ease-out` on .gold-specular
 * handles the smooth drift — no requestAnimationFrame needed.
 */
export default function GoldSpecularHeading() {
    const headingRef = useRef<HTMLHeadingElement>(null)
    const goldSpansRef = useRef<(HTMLSpanElement | null)[]>([null, null])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLHeadingElement>) => {
        const rect = headingRef.current?.getBoundingClientRect()
        if (!rect) return

        // Mouse X as 0–1 fraction across the full heading
        const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

        // Map to background-position for the 400%-wide gloss layer.
        // At frac=0 (cursor left)  → position 100% (gloss on left side of span)
        // At frac=1 (cursor right) → position   0% (gloss on right side of span)
        // The subtle inversion makes the highlight appear to follow the light source.
        const glossPos = `${(1 - frac) * 100}% 0`
        const basePos  = "0 0"

        goldSpansRef.current.forEach(span => {
            if (span) span.style.backgroundPosition = `${glossPos}, ${basePos}`
        })
    }, [])

    const handleMouseLeave = useCallback(() => {
        // Return gloss to the off-canvas rest position — CSS transition handles the drift
        goldSpansRef.current.forEach(span => {
            if (span) span.style.backgroundPosition = "300% 0, 0 0"
        })
    }, [])

    return (
        <h1
            ref={headingRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight inline-block py-2 cursor-default select-none"
        >
            {/* Matte Deep Blue — does NOT react to mouse */}
            <span className="text-[#1C2B6A]">Discover </span>

            {/* Gold span 1 — specular reactive */}
            <span
                ref={el => { goldSpansRef.current[0] = el }}
                className="gold-specular"
            >
                Timeless Egypt
            </span>

            <br />

            {/* Matte Deep Blue */}
            <span className="text-[#1C2B6A]">with </span>

            {/* Gold span 2 — specular reactive */}
            <span
                ref={el => { goldSpansRef.current[1] = el }}
                className="gold-specular"
            >
                Kemet
            </span>
        </h1>
    )
}
