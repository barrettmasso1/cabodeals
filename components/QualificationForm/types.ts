import type { HotelFlags } from "@/lib/hotels"
import type {
  Adult,
  CartItem,
  HandicapProofType,
  Lead,
  QualifyResult,
  TeeWindow,
  VisitWindow,
} from "@/lib/qualify"
import type { LodgingInput } from "./lodging"
import type { LeadPayload, WirePayload } from "./payload"

export type Attribution = {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  fbclid: string
  gclid: string
  landingPage: string
  // Sales-rep attribution from ?ref= (lib/salesRepTracking). "" when none.
  // Contact ownership is native in GHL, so there's deliberately no assignedTo.
  salesRep: string
  referredBy: string
  salesRepName: string
}

/** Yes/No questions the guest must answer explicitly — null until they do. */
export type YesNoKey =
  | "stayingAsGuestOfOwner"
  | "purchasedAtResortThisTrip"
  | "spouseAttending"
  | "ownsTimeshare"
  | "hasHandicapProof"

/**
 * Everything the form holds. Superset of `Lead` (what qualify() reads) — see toLead().
 * The LodgingInput fields are what the guest picked; hotelId, hotelName, isRental and the
 * hotel flags are derived from them by resolveLodging() on every change.
 */
export type FormState = Omit<Lead, YesNoKey | keyof HotelFlags | "ownClubs" | "nightsRemaining"> &
  HotelFlags &
  LodgingInput & { [K in YesNoKey]: boolean | null } & {
    firstName: string
    lastName: string
    email: string
    phone: string
    smsConsent: boolean

    roomNumber: string
    checkIn: string
    checkOut: string

    timeshareWhere: string

    ownClubs: Lead["ownClubs"]
    rentalSetsNeeded: number
    ridersCount: number
    handicapProofType: HandicapProofType | null
    handicapProofUrl: string | null
    roundsPerMonth: number
    preferredTeeWindow: TeeWindow | null

    cartItems: CartItem[]
    cartSavingsTotal: number

    preferredVisitDate: string
    preferredWindow: VisitWindow | null
    transportNeeded: boolean | null
    pickupAddress: string
  }

export type { Adult }

/** Right-rail content for golf products. */
export type GolfOffer = {
  kind: "golf"
  courseName: string
  productName: string // e.g. "The Value Round"
  price: number
  publicPrice: string // e.g. "$300–395"
  discountLabel?: string // e.g. "62% off"
  included: string[]
  rentalSetPrice?: number
  riderPrice?: number
}

/** Right-rail content for activities — the trip cart the visitor already built. */
export type ActivitiesOffer = {
  kind: "activities"
  items: CartItem[]
  /** Defaults to Σ (publicPrice − ourPrice) × (adults + children). */
  savingsTotal?: number
}

export type Offer = GolfOffer | ActivitiesOffer

export type SubmitResult = {
  qualification: QualifyResult
  payload: WirePayload
  /** Kept so a reroute can be re-qualified against another product — see switchProduct(). */
  state: FormState
  attribution: Attribution
}

export type QualificationFormProps = {
  brand: Lead["brand"]
  hook: Lead["hook"]
  product: Lead["product"]
  course?: Lead["course"]
  /** Never hardcode — we expand to PV/Cancun. */
  market: string
  offer: Offer
  /** Fills "that's what gets you ___" in the disclosure. Defaults from `offer`. */
  rewardPhrase?: string
  /** Where payloads are POSTed. The route forwards to GHL_WEBHOOK_URL. */
  endpoint?: string
  /**
   * Overrides the POST (previews, tests). Must throw on failure. Called twice per guest:
   * once after step 1 (`formStatus: "incomplete"`), once on submit (`"complete"`).
   */
  send?: (payload: LeadPayload) => Promise<void>
  /**
   * Called after a successful POST. The page routes on `qualification.qualificationState`:
   * confirmed → confirmation, reroute → interstitial, nq → retail/NQ page.
   */
  onComplete: (result: SubmitResult) => void
}
