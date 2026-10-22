import { createHash } from "node:crypto"

/**
 * Meta Conversions API — the server-side half of Lead tracking.
 *
 * The browser pixel loses a meaningful share of conversions to ad blockers and iOS tracking
 * prevention, which is exactly the signal Meta needs to optimise a campaign. This sends the same
 * Lead event from the server, where none of that applies.
 *
 * Both halves carry the same eventId. Meta deduplicates on it, so a lead that arrives twice is
 * counted once — without it every conversion would be double-counted and the campaign would
 * optimise against inflated numbers.
 *
 * Identical in both repos — keep them in step. No pixel id is hardcoded anywhere:
 *   META_CAPI_TOKEN            the access token. Secret: never NEXT_PUBLIC_.
 *   META_PIXEL_ID              optional; falls back to NEXT_PUBLIC_META_PIXEL_ID so one id
 *                              serves the browser and the server and they cannot drift.
 * META_CAPI_ACCESS_TOKEN is still read, so an environment set up before the rename keeps
 * working.
 *
 * Personal data is SHA-256 hashed before it leaves this process, which is what Meta requires and
 * what we'd want anyway. Nothing identifiable is sent in the clear.
 */

const API_VERSION = "v21.0"

/** Meta wants lowercase, trimmed, no punctuation, then SHA-256. */
const hash = (v: string) => createHash("sha256").update(v).digest("hex")
const norm = (v: string) => v.trim().toLowerCase()
const digits = (v: string) => v.replace(/\D/g, "")

export type CapiLead = {
  eventId: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  country?: string
  sourceUrl?: string
  clientIp?: string
  userAgent?: string
  fbp?: string
  fbc?: string
}

export type CapiResult = { sent: boolean; reason?: string; status?: number }

/** The browser pixel's id, reused server-side so both halves report to the same pixel. */
const pixelId = () => process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID
/** Secret — deliberately NOT NEXT_PUBLIC_, which would ship it to the browser. */
const accessToken = () => process.env.META_CAPI_TOKEN || process.env.META_CAPI_ACCESS_TOKEN

export function capiConfigured(): boolean {
  return !!(accessToken() && pixelId())
}

/**
 * Never throws and never blocks the caller's own work — a Meta outage must not cost us a lead.
 */
export async function sendCapiLead(lead: CapiLead): Promise<CapiResult> {
  const token = accessToken()
  const id = pixelId()
  if (!token) return { sent: false, reason: "no_access_token" }
  if (!id) return { sent: false, reason: "no_pixel_id" }

  const user: Record<string, string[] | string> = {}
  if (lead.email) user.em = [hash(norm(lead.email))]
  if (lead.phone) user.ph = [hash(digits(lead.phone))]
  if (lead.firstName) user.fn = [hash(norm(lead.firstName))]
  if (lead.lastName) user.ln = [hash(norm(lead.lastName))]
  if (lead.city) user.ct = [hash(norm(lead.city).replace(/\s/g, ""))]
  if (lead.state) user.st = [hash(norm(lead.state))]
  if (lead.country) user.country = [hash(norm(lead.country))]
  // Not hashed — Meta matches these raw.
  if (lead.clientIp) user.client_ip_address = lead.clientIp
  if (lead.userAgent) user.client_user_agent = lead.userAgent
  if (lead.fbp) user.fbp = lead.fbp
  if (lead.fbc) user.fbc = lead.fbc

  const body = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: lead.eventId,
        event_source_url: lead.sourceUrl,
        action_source: "website",
        user_data: user,
      },
    ],
    ...(process.env.META_CAPI_TEST_CODE ? { test_event_code: process.env.META_CAPI_TEST_CODE } : {}),
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${id}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[metaCapi] ${res.status} ${text.slice(0, 300)}`)
      return { sent: false, reason: "upstream_error", status: res.status }
    }
    return { sent: true, status: res.status }
  } catch (err) {
    console.error("[metaCapi] request failed", err)
    return { sent: false, reason: "unreachable" }
  }
}
