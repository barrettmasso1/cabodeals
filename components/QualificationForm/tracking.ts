// Event names are identical on both sites (brief §7). GA4 via GTM dataLayer, Meta pixel.

export type FormEvent = "product_view" | "booking_start" | "lead" | "qualification_complete" | "booking_complete"

type TrackWindow = Window & {
  dataLayer?: Record<string, unknown>[]
  fbq?: (...args: unknown[]) => void
}

export function track(event: FormEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  const w = window as TrackWindow
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...params })
  if (w.fbq) {
    if (event === "lead") w.fbq("track", "Lead", params)
    else w.fbq("trackCustom", event, params)
  }
}
