// Event names are identical on both sites (brief §7). GA4 via GTM dataLayer, Meta pixel.

export type FormEvent = "product_view" | "booking_start" | "lead" | "qualification_complete" | "booking_complete"

type TrackWindow = Window & {
  dataLayer?: Record<string, unknown>[]
  fbq?: (...args: unknown[]) => void
}

/** Reads the Meta cookies the pixel sets; they materially improve CAPI match quality. */
export function metaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {}
  const get = (k: string) => document.cookie.match(new RegExp(`(?:^|; )${k}=([^;]*)`))?.[1]
  return { fbp: get("_fbp"), fbc: get("_fbc") }
}

/**
 * `eventId` is only meaningful on "lead": it is passed to the pixel as eventID so Meta can
 * deduplicate it against the same event arriving from the Conversions API.
 */
export function track(event: FormEvent, params: Record<string, unknown> = {}, eventId?: string) {
  if (typeof window === "undefined") return
  const w = window as TrackWindow
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...params })
  if (w.fbq) {
    if (event === "lead") w.fbq("track", "Lead", params, eventId ? { eventID: eventId } : undefined)
    else w.fbq("trackCustom", event, params)
  }
}
