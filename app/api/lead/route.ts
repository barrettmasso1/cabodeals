import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { validatePayload } from "@/components/QualificationForm/payload"
import { capiConfigured, sendCapiLead } from "@/lib/metaCapi"

// Forwards <QualificationForm /> submissions to the GHL inbound webhook.
// GHL_WEBHOOK_URL must be the …/7e017bdf… endpoint — never the legacy …/149c988d… Pacific Dunes one.
//
// Env vars are bound when a deployment is built: adding GHL_WEBHOOK_URL in Vercel does nothing
// for deployments that already exist. Redeploy the branch, then check GET /api/lead.

const LEGACY_WEBHOOK_ID = "149c988d"
// Set LEAD_LOG_PAYLOAD=1 in Vercel to log the full JSON body (contains guest PII — turn it
// back off once a mapping problem is solved).
const LOG_PAYLOAD = process.env.LEAD_LOG_PAYLOAD === "1"
const UPSTREAM_TIMEOUT_MS = 15_000

type Config = { url: string } | { error: string; detail: string }

function readConfig(): Config {
  const raw = process.env.GHL_WEBHOOK_URL
  if (!raw || !raw.trim()) {
    return {
      error: "no_webhook_url",
      detail:
        "GHL_WEBHOOK_URL is unset in this deployment. Set it for this environment in Vercel, then redeploy — " +
        "existing deployments do not pick up new env vars.",
    }
  }
  const url = raw.trim()
  if (!/^https:\/\//.test(url)) {
    return { error: "bad_webhook_url", detail: "GHL_WEBHOOK_URL must be an absolute https URL." }
  }
  if (url.includes(LEGACY_WEBHOOK_ID)) {
    return { error: "legacy_webhook_url", detail: "GHL_WEBHOOK_URL points at the legacy Pacific Dunes webhook." }
  }
  return { url }
}

/** Identifies which endpoint a deployment is using without exposing the URL itself. */
const fingerprint = (url: string) => createHash("sha256").update(url).digest("hex").slice(0, 8)

/**
 * Health check: says whether this deployment can reach GHL, without revealing the URL.
 * Safe to open in a browser on any deployment.
 */
export async function GET() {
  const config = readConfig()
  const env = {
    vercelEnv: process.env.VERCEL_ENV ?? "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  }
  if ("error" in config) {
    console.error(`[lead] health: ${config.error} — ${config.detail}`, env)
    return NextResponse.json({ ok: false, configured: false, code: config.error, detail: config.detail, ...env }, { status: 503 })
  }
  return NextResponse.json({
    ok: true,
    configured: true,
    webhookHost: new URL(config.url).host,
    webhookFingerprint: fingerprint(config.url),
    logPayload: LOG_PAYLOAD,
    ...env,
  })
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  const config = readConfig()
  if ("error" in config) {
    console.error(`[lead ${requestId}] ${config.error} — ${config.detail}`)
    return NextResponse.json({ ok: false, code: config.error, error: config.detail }, { status: 500 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch (err) {
    console.error(`[lead ${requestId}] could not parse request body`, err)
    return NextResponse.json({ ok: false, code: "bad_json", error: "Invalid JSON" }, { status: 400 })
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    console.error(`[lead ${requestId}] body was not an object`)
    return NextResponse.json({ ok: false, code: "bad_payload", error: "Invalid payload" }, { status: 400 })
  }

  // Log mismatches server-side too, but post anyway so the rest of the lead survives.
  const issues = validatePayload(payload)
  console.log(
    `[lead ${requestId}] posting formStatus=${payload.formStatus} email=${payload.email} ` +
      `state=${payload.qualificationState ?? "-"} fields=${Object.keys(payload).length} valueIssues=${issues.length} ` +
      `webhook=${fingerprint(config.url)}`,
  )
  if (LOG_PAYLOAD) console.log(`[lead ${requestId}] body ${JSON.stringify(payload)}`)

  const started = Date.now()
  let res: Response
  try {
    res = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch (err) {
    // DNS failure, TLS error, or the 15s timeout — the request never got a response.
    console.error(`[lead ${requestId}] webhook request failed after ${Date.now() - started}ms`, err)
    return NextResponse.json({ ok: false, code: "upstream_unreachable", error: "Could not reach the webhook" }, { status: 502 })
  }

  const ms = Date.now() - started
  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable>")
    console.error(`[lead ${requestId}] webhook responded ${res.status} in ${ms}ms: ${body.slice(0, 500)}`)
    return NextResponse.json({ ok: false, code: "upstream_error", error: `Webhook responded ${res.status}` }, { status: 502 })
  }

  console.log(`[lead ${requestId}] webhook accepted in ${ms}ms`)

  // Server-side Lead for Meta, sharing the browser pixel's eventId so the two deduplicate.
  // The pixel loses a real share of conversions to ad blockers and iOS tracking prevention,
  // which is exactly the signal a campaign needs. Only the step-1 payload carries the id.
  let capi: { sent: boolean; reason?: string } = { sent: false, reason: "not_configured" }
  if (typeof payload.metaEventId === "string" && payload.metaEventId && capiConfigured()) {
    const str = (v: unknown) => (typeof v === "string" && v ? v : undefined)
    capi = await sendCapiLead({
      eventId: payload.metaEventId,
      email: str(payload.email),
      phone: str(payload.phone),
      firstName: str(payload.firstName),
      lastName: str(payload.lastName),
      state: str(payload.stateProvince),
      country: str(payload.country),
      sourceUrl: str(payload.landingPage),
      clientIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") ?? undefined,
      fbp: typeof payload.fbp === "string" ? payload.fbp : undefined,
      fbc: typeof payload.fbc === "string" ? payload.fbc : undefined,
    })
    console.log(`[lead ${requestId}] meta capi sent=${capi.sent}${capi.reason ? ` reason=${capi.reason}` : ""}`)
  }

  return NextResponse.json({ ok: true, requestId, capi: capi.sent })
}
