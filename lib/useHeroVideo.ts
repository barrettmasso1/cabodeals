"use client"

import { useEffect, useState } from "react"

type Connection = { saveData?: boolean; effectiveType?: string }

/**
 * Whether a hero background video is worth loading.
 *
 * The homepage video is roughly 12MB. It is decoration — the poster image carries the same
 * picture — so it should never cost a phone user their data or their first paint. This returns
 * false on small screens, on metered or slow connections, and when the visitor has asked for
 * reduced motion. Those visitors keep the poster, which was always rendering underneath.
 *
 * Starts false and flips on after mount, so the server render and the first paint are identical
 * everywhere and nothing shifts.
 */
export function useHeroVideo(): boolean {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const wideEnough = window.matchMedia("(min-width: 768px)").matches
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const conn = (navigator as Navigator & { connection?: Connection }).connection
    const metered = conn?.saveData === true
    const slow = !!conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)

    if (!wideEnough || reducedMotion || metered || slow) return

    // Give the poster a moment to paint before asking for the video.
    const timer = setTimeout(() => setAllowed(true), 600)
    return () => clearTimeout(timer)
  }, [])

  return allowed
}
