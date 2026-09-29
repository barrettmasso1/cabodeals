import { captureSalesRep, getSalesRepForSubmission } from "@/lib/salesRepTracking"
import type { Attribution } from "./types"

const KEY = "cq_attribution"

const PARAMS: [keyof Attribution, string][] = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmContent", "utm_content"],
  ["utmTerm", "utm_term"],
  ["fbclid", "fbclid"],
  ["gclid", "gclid"],
]

export const EMPTY_ATTRIBUTION: Attribution = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  fbclid: "",
  gclid: "",
  landingPage: "",
  salesRep: "",
  referredBy: "",
  salesRepName: "",
}

/** ?ref= is kept for 30 days in localStorage; capture again here in case the guest landed on the form. */
function readSalesRep(): Pick<Attribution, "salesRep" | "referredBy" | "salesRepName"> {
  captureSalesRep()
  const rep = getSalesRepForSubmission()
  return { salesRep: rep.salesRep ?? "", referredBy: rep.referredBy ?? "", salesRepName: rep.salesRepName ?? "" }
}

/**
 * First-touch attribution for this browser session. The current URL wins if it carries
 * any tracking params; otherwise we fall back to what the session landed with.
 */
export function readAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY_ATTRIBUTION
  const qs = new URLSearchParams(window.location.search)
  const rep = readSalesRep()
  const fromUrl: Attribution = { ...EMPTY_ATTRIBUTION, landingPage: window.location.href }
  for (const [key, param] of PARAMS) fromUrl[key] = qs.get(param) ?? ""
  const urlHasParams = PARAMS.some(([key]) => fromUrl[key])

  try {
    const stored = window.sessionStorage.getItem(KEY)
    if (stored && !urlHasParams) return { ...EMPTY_ATTRIBUTION, ...JSON.parse(stored), ...rep }
    window.sessionStorage.setItem(KEY, JSON.stringify(fromUrl))
  } catch {
    // storage blocked — URL values are still usable
  }
  return { ...fromUrl, ...rep }
}
