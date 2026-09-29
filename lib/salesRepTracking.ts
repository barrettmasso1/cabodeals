/**
 * Sales Rep Tracking Utility
 *
 * Captures and persists sales rep referral information from URL parameters
 * Usage: ?ref=adan, ?ref=sammy, ?ref=ricky, ?ref=omar
 */

const SALES_REP_KEY = "salesRep"
const STORAGE_DURATION_DAYS = 30

interface SalesRepData {
  rep: string
  timestamp: number
  expiresAt: number
}

/**
 * Captures the 'ref' parameter from URL and stores it in localStorage
 * Call this on page load in your layout or page components
 */
export function captureSalesRep(): string | null {
  if (typeof window === "undefined") return null

  try {
    // Check if we already have a stored sales rep that hasn't expired
    const existing = getSalesRep()
    if (existing) {
      console.log("[v0] Sales rep already captured:", existing)
    }

    // Check URL for ref parameter
    const urlParams = new URLSearchParams(window.location.search)
    const refParam = urlParams.get("ref")

    if (refParam) {
      const now = Date.now()
      const expiresAt = now + STORAGE_DURATION_DAYS * 24 * 60 * 60 * 1000

      const salesRepData: SalesRepData = {
        rep: refParam.toLowerCase(),
        timestamp: now,
        expiresAt,
      }

      localStorage.setItem(SALES_REP_KEY, JSON.stringify(salesRepData))
      console.log("[v0] Sales rep captured from URL:", refParam)

      return refParam
    }

    return existing
  } catch (error) {
    console.error("[v0] Error capturing sales rep:", error)
    return null
  }
}

/**
 * Retrieves the stored sales rep value if it hasn't expired
 */
export function getSalesRep(): string | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(SALES_REP_KEY)
    if (!stored) return null

    const data: SalesRepData = JSON.parse(stored)
    const now = Date.now()

    // Check if expired
    if (now > data.expiresAt) {
      localStorage.removeItem(SALES_REP_KEY)
      console.log("[v0] Sales rep data expired")
      return null
    }

    return data.rep
  } catch (error) {
    console.error("[v0] Error retrieving sales rep:", error)
    return null
  }
}

/**
 * Clears the stored sales rep data
 */
export function clearSalesRep(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SALES_REP_KEY)
  console.log("[v0] Sales rep data cleared")
}

/**
 * Gets sales rep data for form submission
 * Returns an object with all relevant fields for Go High Level
 */
export function getSalesRepForSubmission() {
  const salesRep = getSalesRep()

  if (!salesRep) {
    return {
      salesRep: null,
      referredBy: null,
      assignedTo: null,
      salesRepName: null,
    }
  }

  // Map ref values to full names
  const salesRepNames: Record<string, string> = {
    adan: "Adan",
    sammy: "Sammy",
    ricky: "Ricky",
    omar: "Omar",
  }

  const salesRepName = salesRepNames[salesRep] || salesRep

  return {
    salesRep: salesRep,
    referredBy: salesRepName,
    assignedTo: salesRepName,
    salesRepName: salesRepName,
    salesRepId: salesRep,
  }
}
