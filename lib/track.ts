/**
 * Activity-side events. Same dataLayer/pixel shape as the shared form tracker
 * (components/QualificationForm/tracking.ts) so both brands land in one funnel report.
 *
 * Stub for build-order step 7 — GTM, the Meta pixel and Clarity are not installed yet, so
 * these pushes are inert until the containers land. `cartSavingsTotal` rides on every event
 * from day one (brief §8).
 */
export type ActivityEvent = "activity_view" | "add_to_trip" | "unlock_start"

type TrackWindow = Window & {
  dataLayer?: Record<string, unknown>[]
  fbq?: (...args: unknown[]) => void
}

export function track(event: ActivityEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  const w = window as TrackWindow
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...params })
  w.fbq?.("trackCustom", event, params)
}
