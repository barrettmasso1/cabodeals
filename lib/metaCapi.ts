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
 * Ported from cabogolf — keep the two in step. The one deliberate difference: no hardcoded
 * pixel id. Set META_PIXEL_ID (server) and NEXT_PUBLIC_META_PIXEL_ID (browser) to the same
 * value, whether that is cabogolf's pixel or one of this brand's own.
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

export function capiConfigured(): boolean {
  return !!(process.env.META_CAPI_ACCESS_TOKEN && process.env.META_PIXEL_ID)
}

/**
 * Never throws and never blocks the caller's own work — a Meta outage must not cost us a lead.
 */
export async function sendCapiLead(lead: CapiLead): Promise<CapiResult> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  const pixelId = process.env.META_PIXEL_ID
  if (!token) return { sent: false, reason: "no_access_token" }
  if (!pixelId) return { sent: false, reason: "no_pixel_id" }

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
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${token}`, {
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
