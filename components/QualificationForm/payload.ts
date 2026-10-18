// Payload contract (brief §2 / §2b). Mirrored in the cabodeals.mx repo —
// keys and option strings must stay byte-identical: GHL custom fields are built against them.
//
// Internal state uses §2's machine values (married, 2plus, cash_card) so qualify() reads cleanly.
// toWirePayload() converts every dropdown to GHL's option text ("Married", "2 or more", "Yes").

import { ageAt, qualify, type Lead, type QualifyResult } from "@/lib/qualify"
import { anyAttached, detailAdults } from "./validate"
import { nightsRemaining } from "./dates"
import { asksNightlyRate, resolveLodging } from "./lodging"
import type { FormState, Attribution, SubmitResult } from "./types"

const yn = (v: boolean | null) => (v ? "Yes" : "No")
const tier = (v: string | null) => v ?? "none"

const PAYING_WITH = {
  cash_card: "cash or card",
  timeshare_points: "timeshare points",
  hotel_points: "hotel points",
  comped: "comped",
} as const
const CREDIT_CARDS = { "1": "1", "2plus": "2 or more" } as const
const OWN_CLUBS = { all: "All", some: "Some", none: "None" } as const
const TEE_WINDOW = { morning: "Morning", afternoon: "Afternoon", no_preference: "No Preference" } as const
const VISIT_WINDOW = { first_party: "First Party", second_party: "Second Party", flexible: "Flexible" } as const
const PROOF_TYPE = { ghin: "GHIN", app_screenshot: "App Screenshot", club_membership: "Club Membership" } as const
const MARITAL = { married: "Married", partnered: "In A Relationship", single: "Single" } as const
const GENDER = { male: "Male", female: "Female" } as const
const QUAL_STATE = { confirmed: "Confirmed", reroute: "Reroute", nq: "NQ" } as const
const BUYER = { solmar: "Solmar", questro: "Questro", diamante: "Diamante", vg: "VG" } as const

/**
 * Tags GHL can apply as-is, comma separated: "buyer-vg,state-confirmed".
 * Buyer and state come straight from the qualify() result — GHL should not re-derive them.
 */
function leadTagsFor(q: QualifyResult, extras: string[] = []): string {
  const tags: string[] = []
  if (q.assignedBuyer) tags.push(`buyer-${q.assignedBuyer}`)
  tags.push(`state-${q.qualificationState}`)
  return [...tags, ...extras].join(",")
}

const map = <M extends Record<string, string>>(m: M, v: string | null | undefined): M[keyof M] | null =>
  v ? ((m as Record<string, string>)[v] as M[keyof M]) ?? null : null

/** The subset qualify() reads. Unanswered / not-applicable yes-no questions become false. */
export function toLead(s: FormState, nightsRemaining: number): Lead {
  return {
    ...s,
    adults: detailAdults(s),
    nightsRemaining,
    nightlyRate: asksNightlyRate(s) ? s.nightlyRate : null,
    purchasedAtResortThisTrip: s.purchasedAtResortThisTrip === true,
    spouseAttending: anyAttached(s) && s.spouseAttending === true,
    ownsTimeshare: s.ownsTimeshare === true,
    hasHandicapProof: s.hook === "golf" && s.hasHandicapProof === true,
    ownClubs: s.hook === "golf" ? s.ownClubs : null,
  }
}

// Must match the GHL form_status dropdown options character-for-character.
export type FormStatus = "Incomplete" | "Complete"

export type PartialWirePayload = ReturnType<typeof toPartialPayload>
export type WirePayload = ReturnType<typeof toWirePayload>
export type LeadPayload = PartialWirePayload | WirePayload

const cartOf = (s: FormState) => {
  const cartItems = s.hook === "activities" ? s.cartItems : []
  return {
    cartItems,
    cartItemsJson: JSON.stringify(cartItems),
    cartItemCount: cartItems.length,
    cartSavingsTotal: s.hook === "activities" ? s.cartSavingsTotal : 0,
  }
}

/**
 * Ages computed from DOB at submission time — GHL routes on plain numbers, not dates.
 * All three are null until the group section is filled in (i.e. on the step-1 payload).
 */
function agesOf(s: FormState) {
  const [a1, a2] = [0, 1].map((i) => {
    const dob = detailAdults(s)[i]?.dateOfBirth
    return dob ? ageAt(dob) : null
  })
  return {
    adult1Age: a1,
    adult2Age: a2,
    oldestAge: a1 === null ? a2 : a2 === null ? a1 : Math.max(a1, a2),
  }
}

/**
 * Step-1 payload: source + contact (+ cart for activities). `formStatus: "incomplete"`
 * tells the GHL workflow to tag the contact and keep it out of routing.
 */
export function toPartialPayload(s: FormState, attribution: Attribution) {
  return {
    formStatus: "Incomplete" as FormStatus,
    // No decision yet — the step-1 lead is tagged so the workflow can exit to nurture.
    leadTags: "form-incomplete",

    // --- source ---
    brand: s.brand,
    hook: s.hook,
    product: s.product,
    course: s.course,
    market: s.market,
    ...attribution,

    // --- contact ---
    firstName: s.firstName.trim(),
    lastName: s.lastName.trim(),
    email: s.email.trim(),
    phone: s.phone.trim(),
    smsConsent: s.smsConsent, // GHL native DND/consent, not a custom dropdown

    // Adult 1 is the person filling the form (the group section prefills from these), so the
    // step-1 payload carries them too — GHL can map the contact's name from either pair.
    adult1FirstName: s.firstName.trim(),
    adult1LastName: s.lastName.trim(),

    ...agesOf(s),
    ...cartOf(s),
  }
}

type WireAdult = { firstName: string; lastName: string; dateOfBirth: string; maritalStatus: string | null; gender: string | null }

/**
 * GHL's webhook mapper cannot always reach into an array, and adult_1_* / adult_2_* are ten
 * fields. Send flat keys as well as `adults` so either mapping style works. Empty strings for
 * an absent second adult, so the mapping never resolves to "undefined".
 */
function flattenAdults(adults: WireAdult[]) {
  const flat: Record<string, string> = {}
  for (const i of [0, 1]) {
    const a = adults[i]
    const n = i + 1
    flat[`adult${n}FirstName`] = a?.firstName ?? ""
    flat[`adult${n}LastName`] = a?.lastName ?? ""
    flat[`adult${n}Dob`] = a?.dateOfBirth ?? ""
    flat[`adult${n}MaritalStatus`] = a?.maritalStatus ?? ""
    flat[`adult${n}Gender`] = a?.gender ?? ""
  }
  return flat
}

export function toWirePayload(s: FormState, lead: Lead, attribution: Attribution, q: QualifyResult) {
  const golf = s.hook === "golf"
  const lodging = resolveLodging(s)
  const insideProperty = s.isRental && s.rentalInsideProperty === true

  return {
    ...toPartialPayload(s, attribution),
    formStatus: "Complete" as FormStatus,
    // GHL lead_tags is single-line text: comma-separated.
    leadTags: leadTagsFor(q, lodging.propertyUnlisted ? ["hotel-unlisted"] : []),

    // --- trip ---
    hotelName: s.hotelName.trim(),
    // The resort's id when a rental sits inside a listed property; the rental category
    // ("airbnb-rental" / "private-residence") when standalone; "unlisted" when typed in.
    hotelId: s.hotelId,
    hotelTierSolmar: tier(s.hotelTierSolmar),
    hotelSolmarGolferTier: tier(s.hotelSolmarGolferTier),
    hotelSolmarImOk: yn(s.hotelSolmarImOk),
    hotelQuestroOk: yn(s.hotelQuestroOk),
    hotelQuestro5Star: yn(s.hotelQuestro5Star),
    hotelDiamanteOk: yn(s.hotelDiamanteOk),
    hotelListaDosOk: yn(s.hotelListaDosOk),
    hotelVgOk: yn(s.hotelVgOk),
    roomNumber: s.roomNumber.trim(),
    isRental: yn(s.isRental),
    rentalAtProperty: insideProperty ? s.rentalAtProperty.trim() : "",
    // Sent even when a matched property overrides it for tiering (VG's rule is "$125+/night").
    nightlyRate: lead.nightlyRate,
    checkIn: s.checkIn,
    checkOut: s.checkOut,
    nightsRemaining: lead.nightsRemaining,
    payingWith: map(PAYING_WITH, s.payingWith),
    purchasedAtResortThisTrip: yn(s.purchasedAtResortThisTrip),
    country: s.country || null,
    stateProvince: s.stateProvince.trim(),

    // --- group ---
    // Sent twice on purpose: as an array (the §2 contract) and flattened (what GHL maps).
    ...flattenAdults(
      lead.adults.map((a) => ({
        firstName: a.firstName.trim(),
        lastName: a.lastName.trim(),
        dateOfBirth: a.dateOfBirth,
        maritalStatus: map(MARITAL, a.maritalStatus),
        gender: map(GENDER, a.gender),
      })),
    ),
    adults: lead.adults.map((a) => ({
      firstName: a.firstName.trim(),
      lastName: a.lastName.trim(),
      dateOfBirth: a.dateOfBirth,
      maritalStatus: map(MARITAL, a.maritalStatus),
      gender: map(GENDER, a.gender),
    })),
    totalAdults: s.totalAdults,
    totalChildren: s.totalChildren,
    spouseAttending: yn(lead.spouseAttending),
    ownsTimeshare: yn(s.ownsTimeshare),
    timeshareWhere: s.ownsTimeshare ? s.timeshareWhere.trim() : "",
    creditCards: map(CREDIT_CARDS, s.creditCards),

    // --- golf (hook = golf) ---
    ownClubs: golf ? map(OWN_CLUBS, s.ownClubs) : null,
    rentalSetsNeeded: golf ? s.rentalSetsNeeded : 0,
    ridersCount: golf ? s.ridersCount : 0,
    hasHandicapProof: yn(lead.hasHandicapProof),
    handicapProofType: lead.hasHandicapProof ? map(PROOF_TYPE, s.handicapProofType) : null,
    handicapProofUrl: null, // self-declared only; kept for the contract
    roundsPerMonth: golf ? s.roundsPerMonth : 0,
    preferredTeeWindow: golf ? map(TEE_WINDOW, s.preferredTeeWindow) : null,

    // --- visit ---
    preferredVisitDate: s.preferredVisitDate,
    preferredWindow: map(VISIT_WINDOW, s.preferredWindow),
    transportNeeded: yn(s.transportNeeded),
    pickupAddress: s.transportNeeded ? s.pickupAddress.trim() : "",

    // --- filter output (advisory; GHL recomputes) ---
    eligibleBuyers: q.eligibleBuyers,
    assignedBuyer: map(BUYER, q.assignedBuyer),
    assignedTier: q.assignedTier,
    expectedGrossPay: q.expectedGrossPay,
    qualificationState: QUAL_STATE[q.qualificationState],
    nqReasons: q.nqReasons.join("\n"), // GHL multi-line text
  }
}

/** Qualify the current form state and build the complete payload. */
export function buildSubmission(state: FormState, attribution: Attribution): SubmitResult {
  const lead = toLead(state, nightsRemaining(state.checkIn, state.checkOut))
  const qualification = qualify(lead)
  const payload = toWirePayload(state, lead, attribution, qualification)
  return { qualification, payload, state, attribution }
}

/** Re-qualify a submitted guest against another golf product (reroute accepted). */
export function switchProduct(prev: SubmitResult, product: Lead["product"], course: Lead["course"]): SubmitResult {
  return buildSubmission({ ...prev.state, product, course }, prev.attribution)
}

export async function postLead(payload: LeadPayload, endpoint = "/api/lead"): Promise<void> {
  validatePayload(payload)
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
  if (!res.ok) {
    // The route answers with { code, error } — surface both so a failed lead is diagnosable
    // from the browser console (e.g. code "no_webhook_url" means the deployment lacks the env var).
    const body = await res.json().catch(() => null)
    throw new Error(`POST ${endpoint} → ${res.status}${body?.code ? ` [${body.code}] ${body.error ?? ""}` : ""}`)
  }
}

// --- Validator (brief §2b "Required: a payload validator") ---
// Every dropdown checked against GHL's option text. Mismatches are logged, never thrown,
// so the rest of the lead still posts.

const YES_NO = ["Yes", "No"]
const TIERS = ["A", "B", "C", "IM", "none"]

const ALLOWED: Record<string, readonly string[]> = {
  formStatus: ["Incomplete", "Complete"],
  brand: ["cabogolf", "cabodeals"],
  hook: ["golf", "activities"],
  product: ["value_round", "collection", "private_club", "activities"],
  course: ["pacific_dunes", "campestre", "cabo_real", "puerto_los_cabos", "diamante"],
  hotelTierSolmar: TIERS,
  hotelSolmarGolferTier: TIERS,
  hotelSolmarImOk: YES_NO,
  hotelQuestroOk: YES_NO,
  hotelQuestro5Star: YES_NO,
  hotelDiamanteOk: YES_NO,
  hotelListaDosOk: YES_NO,
  hotelVgOk: YES_NO,
  isRental: YES_NO,
  purchasedAtResortThisTrip: YES_NO,
  spouseAttending: YES_NO,
  ownsTimeshare: YES_NO,
  hasHandicapProof: YES_NO,
  transportNeeded: YES_NO,
  payingWith: Object.values(PAYING_WITH),
  creditCards: Object.values(CREDIT_CARDS),
  country: ["US", "CA", "MX", "Other"],
  ownClubs: Object.values(OWN_CLUBS),
  preferredTeeWindow: Object.values(TEE_WINDOW),
  preferredWindow: Object.values(VISIT_WINDOW),
  handicapProofType: Object.values(PROOF_TYPE),
  qualificationState: Object.values(QUAL_STATE),
  assignedBuyer: ["Solmar", "Questro", "Diamante", "Country Club", "VG"],
}

const ADULT_ALLOWED: Record<string, readonly string[]> = {
  maritalStatus: Object.values(MARITAL),
  gender: Object.values(GENDER),
}

// Nullable dropdowns: null means "not applicable" and is sent as-is.
const NULLABLE = new Set([
  "course",
  "ownClubs",
  "preferredTeeWindow",
  "handicapProofType",
  "assignedBuyer",
])

export type PayloadIssue = { field: string; value: unknown }

export function validatePayload(p: Record<string, unknown>): PayloadIssue[] {
  const issues: PayloadIssue[] = []
  // The step-1 payload only carries source + contact; absent keys are expected there.
  const partial = p.formStatus === "Incomplete"
  const check = (field: string, value: unknown, allowed: readonly string[], nullable: boolean) => {
    if (value === undefined && partial) return
    if (value === null && nullable) return
    if (typeof value !== "string" || !allowed.includes(value)) issues.push({ field, value })
  }

  for (const [field, allowed] of Object.entries(ALLOWED)) check(field, p[field], allowed, NULLABLE.has(field))

  const adults = Array.isArray(p.adults) ? (p.adults as Record<string, unknown>[]) : []
  adults.forEach((a, i) => {
    for (const [field, allowed] of Object.entries(ADULT_ALLOWED)) check(`adults[${i}].${field}`, a[field], allowed, false)
  })

  const NULLABLE_NUMBERS = new Set(["nightlyRate", "adult1Age", "adult2Age", "oldestAge"])
  for (const field of ["nightlyRate", "adult1Age", "adult2Age", "oldestAge", "nightsRemaining", "totalAdults", "totalChildren", "rentalSetsNeeded", "ridersCount", "roundsPerMonth", "cartSavingsTotal", "cartItemCount"]) {
    if (p[field] === undefined && partial) continue
    if (NULLABLE_NUMBERS.has(field) && p[field] === null) continue
    if (!Number.isInteger(p[field])) issues.push({ field, value: p[field] })
  }

  for (const issue of issues) {
    console.error(`[QualificationForm] GHL value mismatch: ${issue.field} = ${JSON.stringify(issue.value)}`)
  }
  return issues
}
