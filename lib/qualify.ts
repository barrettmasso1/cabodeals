// Qualification filter (brief §3). Mirrored in the cabodeals.mx repo — keep identical.
// Pure function. Advisory only: GHL recomputes server-side and is authoritative.
// Never dispatch transport off the client result.

import type { Hook, SolmarTier } from "@/lib/hotels"

export type Brand = "cabogolf" | "cabodeals"
export type Product = "value_round" | "collection" | "private_club" | "activities"
export type Course = "pacific_dunes" | "campestre" | "cabo_real" | "puerto_los_cabos" | "diamante"
export type Buyer = "solmar" | "questro" | "diamante" | "vg"
export type MaritalStatus = "married" | "single" | "divorced" | "widowed"
export type Gender = "male" | "female"
export type PayingWith = "cash_card" | "timeshare_points" | "hotel_points" | "comped"
export type CreditCards = "1" | "2plus"
export type OwnClubs = "all" | "some" | "none"
export type HandicapProofType = "ghin" | "app_screenshot" | "club_membership"
export type TeeWindow = "morning" | "afternoon" | "no_preference"
export type VisitWindow = "first_party" | "second_party" | "flexible"
export type Country = "US" | "CA" | "MX" | "Other"
export type QualificationState = "confirmed" | "reroute" | "nq"

export type Adult = {
  firstName: string
  lastName: string
  dateOfBirth: string // ISO yyyy-mm-dd
  maritalStatus: MaritalStatus | ""
  gender: Gender | ""
}

export type CartItem = {
  id: string
  name: string
  adults: number
  children: number
  ourPrice: number
  publicPrice: number
}

export type Lead = {
  brand: Brand
  hook: Hook
  product: Product
  course: Course | null
  market: string

  hotelName: string
  hotelId: string
  hotelTierSolmar: SolmarTier | null // non-golfer list
  hotelSolmarGolferTier: SolmarTier | null // golfer list
  hotelSolmarImOk: boolean
  hotelQuestroOk: boolean
  hotelQuestro5Star: boolean
  hotelDiamanteOk: boolean
  hotelListaDosOk: boolean
  hotelVgOk: boolean
  isRental: boolean
  nightlyRate: number | null // informational; hotel flags are already resolved
  nightsRemaining: number
  payingWith: PayingWith | ""
  stayingAsGuestOfOwner: boolean
  purchasedAtResortThisTrip: boolean
  country: Country | ""
  stateProvince: string

  adults: Adult[]
  totalAdults: number
  totalChildren: number
  spouseAttending: boolean
  ownsTimeshare: boolean
  creditCards: CreditCards | ""

  ownClubs: OwnClubs | null
  hasHandicapProof: boolean
}

type Match = { buyer: Buyer; tier: string; pay: number; nonGolf?: true }

export type QualifyResult = {
  qualificationState: QualificationState
  eligibleBuyers: Buyer[]
  assignedBuyer: Buyer | null
  assignedTier: string | null
  expectedGrossPay: number | null
  nqReasons: string[]
}

const UNIVERSAL_BLOCKS = (d: Lead): string[] => {
  const b: string[] = []
  if (d.adults.some((a) => a.maritalStatus === "married") && !d.spouseAttending) b.push("spouse_not_attending")
  if (d.purchasedAtResortThisTrip) b.push("purchased_at_resort") // ASUDESTICO fine risk
  if (d.stayingAsGuestOfOwner) b.push("in_house_guest")
  if (d.stateProvince === "QC") b.push("quebec")
  return b
}

/**
 * Calendar age on a given day. The payload sends these numbers to GHL (which can't compute
 * age from a date), so tiering here and routing there must use the same calculation.
 */
export function ageAt(dob: string, now: number = Date.now()): number | null {
  const [by, bm, bd] = dob.split("-").map(Number)
  if (!by || !bm || !bd) return null
  const t = new Date(now)
  const [ty, tm, td] = [t.getFullYear(), t.getMonth() + 1, t.getDate()]
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

const isCouple = (d: Lead) => d.totalAdults >= 2 && d.spouseAttending === true
const isSingle = (d: Lead) => d.totalAdults === 1

// --- SOLMAR — "The Value Round" ---
// Married couples only. Singles pay $150 (≈$53 net) — block them.
// Two tier lists: golfer vs non-golfer. Read the one matching `hook`.
function qualifySolmar(d: Lead, a: number[]): Match | null {
  if (!isCouple(d)) return null
  const t = d.hook === "golf" ? d.hotelSolmarGolferTier : d.hotelTierSolmar
  if (!t) return null
  const band = { A: [40, 79], IM: [40, 79], B: [35, 80], C: [32, 80] }[t]
  if (!a.some((x) => x >= band[0] && x <= band[1])) return null
  if ((t === "A" || t === "IM") && !d.ownsTimeshare) return null
  if ((t === "A" || t === "IM") && d.creditCards !== "2plus") return null
  const clubs = d.ownClubs === "all"
  const pay = { A: clubs ? 700 : 600, IM: 500, B: 475, C: 325 }[t]
  return { buyer: "solmar", tier: `MC${t}_golfer${clubs ? "_own_clubs" : ""}`, pay }
}

// --- QUESTRO — "The Collection" ---
// Widest golf qualification. Singles pay best here ($550).
function qualifyQuestro(d: Lead, a: number[]): Match | null {
  if (!d.hotelQuestroOk) return null
  if (d.creditCards !== "2plus") return null
  if (d.payingWith === "comped" || d.payingWith === "hotel_points") return null
  if (d.nightsRemaining < 3) return null // needs a second morning
  if (isSingle(d)) {
    if (!(a[0] >= 40 && a[0] <= 75)) return null
    return { buyer: "questro", tier: "single_golfer", pay: 550 }
  }
  if (!isCouple(d)) return null
  if (!a.some((x) => x >= 40 && x <= 75)) return null
  const clubs = d.ownClubs === "all"
  const mx = d.country === "MX"
  return {
    buyer: "questro",
    tier: mx ? "mx_couple" : `couple${clubs ? "_own_clubs" : "_rentals"}`,
    pay: mx ? 400 : clubs ? 700 : 600,
  }
}

// --- DIAMANTE — "The Private Club" ---
// Requires proof they're a golfer.
function qualifyDiamante(d: Lead, a: number[]): Match | null {
  if (!d.hotelDiamanteOk) return null
  if (!d.hasHandicapProof) return null
  if (isSingle(d)) {
    const m = d.adults[0]
    if (m.maritalStatus === "single" && m.gender === "male" && a[0] >= 40 && a[0] <= 70)
      return { buyer: "diamante", tier: "AG_single_man", pay: 400 }
    return null // single-woman golfer codes unconfirmed — non-golf catch-all handles her
  }
  if (!isCouple(d)) return null
  if (!a.some((x) => x >= 35 && x <= 75)) return null
  if (d.country === "CA") return { buyer: "diamante", tier: "FG_canadian", pay: 400 }
  if (d.country === "MX") return { buyer: "diamante", tier: "GG_mexican", pay: 500 }
  return { buyer: "diamante", tier: "DG_married_40_69", pay: 700 }
}

// --- DIAMANTE NON-GOLF — the catch-all. Only buyer for single men,
//     cruise passengers, Mexican couples, 30-35s and 71-75s. ---
function qualifyDiamanteNonGolf(d: Lead, a: number[]): Match | null {
  const m = diamanteNonGolfTier(d, a)
  return m && { ...m, nonGolf: true }
}

function diamanteNonGolfTier(d: Lead, a: number[]): Match | null {
  if (!d.hotelDiamanteOk) return null
  const lista2 = d.hotelListaDosOk === true // premium list -> higher pay, 1 card OK
  const oldest = Math.max(...a)
  const g = d.adults[0]?.gender

  if (isCouple(d)) {
    if (d.country === "CA") {
      if (oldest >= 36 && oldest <= 59) return { buyer: "diamante", tier: "F_can_married", pay: 400 }
      if (oldest >= 60 && oldest <= 70) return { buyer: "diamante", tier: "K_can_married", pay: 400 }
      if (oldest >= 28 && oldest <= 35) return { buyer: "diamante", tier: "J_can_married", pay: 200 }
      return null
    }
    if (d.country === "MX" && oldest >= 35 && oldest <= 65) return { buyer: "diamante", tier: "G_mx_married", pay: 250 }
    if (oldest >= 34 && oldest <= 35 && lista2) return { buyer: "diamante", tier: "DH", pay: 400 }
    if (oldest >= 36 && oldest <= 59) return { buyer: "diamante", tier: lista2 ? "DP" : "D", pay: lista2 ? 600 : 500 }
    if (oldest >= 60 && oldest <= 70) return { buyer: "diamante", tier: lista2 ? "EP" : "E", pay: lista2 ? 600 : 500 }
    if (oldest >= 30 && oldest <= 35) return { buyer: "diamante", tier: "C_married_30_35", pay: 200 }
    if (oldest >= 71 && oldest <= 75) return { buyer: "diamante", tier: "Z_americans_71_75", pay: 200 }
    return null
  }

  if (isSingle(d)) {
    const x = a[0]
    if (g === "female") {
      if (d.country === "CA" && x >= 36 && x <= 70) return { buyer: "diamante", tier: "I_M_can_single_w", pay: 250 }
      if (x >= 36 && x <= 59) return { buyer: "diamante", tier: "B_single_w", pay: 350 }
      if (x >= 60 && x <= 70) return { buyer: "diamante", tier: "B2_single_w", pay: 250 }
      if (x >= 28 && x <= 35) return { buyer: "diamante", tier: "B1_single_w", pay: 150 }
      return null
    }
    // ONLY buyer on the board that takes single men
    if (x >= 35 && x <= 70) return { buyer: "diamante", tier: "A_single_man", pay: 200 }
  }
  return null
}

// --- VILLA GROUP — non-golf, loosest quals, no fulfillment cost ---
// 1 major credit card is sufficient, so no card check.
function qualifyVg(d: Lead, a: number[]): Match | null {
  if (!d.hotelVgOk) return null // 5-star list OR any hotel/STR $125+/night
  if (!a.some((x) => x >= 36 && x <= 70)) return null
  if (isCouple(d)) return { buyer: "vg", tier: "married_couple", pay: 600, nonGolf: true }
  if (isSingle(d) && d.adults[0].gender === "female") return { buyer: "vg", tier: "single_woman", pay: 350, nonGolf: true }
  return null // single men: rate unconfirmed
}

const REQUESTED_BUYER: Record<Product, Buyer> = {
  value_round: "solmar",
  collection: "questro",
  private_club: "diamante",
  activities: "vg",
}

export function qualify(d: Lead, now: number = Date.now()): QualifyResult {
  const nq = (nqReasons: string[]): QualifyResult => ({
    qualificationState: "nq",
    eligibleBuyers: [],
    assignedBuyer: null,
    assignedTier: null,
    expectedGrossPay: null,
    nqReasons,
  })

  const blocks = UNIVERSAL_BLOCKS(d)
  if (blocks.length) return nq(blocks)

  const a = d.adults.map((x) => ageAt(x.dateOfBirth, now) ?? -1)
  const results = [
    qualifySolmar(d, a),
    qualifyQuestro(d, a),
    qualifyDiamante(d, a),
    qualifyVg(d, a),
    qualifyDiamanteNonGolf(d, a), // catch-all, evaluated last
  ].filter((r): r is Match => r !== null)
  if (!results.length) return nq(["no_buyer_match"])

  // A golf product is only "confirmed" by a golf tier. Without this, Diamante's non-golf
  // catch-all (also buyer "diamante") confirms Private Club leads that have no handicap proof.
  const match = results.find((r) => r.buyer === REQUESTED_BUYER[d.product] && (d.hook !== "golf" || !r.nonGolf))
  const best = [...results].sort((x, y) => y.pay - x.pay)[0]
  const chosen = match ?? best

  return {
    qualificationState: match ? "confirmed" : "reroute",
    eligibleBuyers: Array.from(new Set(results.map((r) => r.buyer))),
    assignedBuyer: chosen.buyer,
    assignedTier: chosen.tier,
    expectedGrossPay: chosen.pay,
    nqReasons: [],
  }
}
