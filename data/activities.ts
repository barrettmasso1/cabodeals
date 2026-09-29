/**
 * Activity catalog — every tour on the cabodeals.mx grid, priced against the vendor list
 * (OUTHOUSE VENDOR LIST, 02-Jul-2025). `publicPrice` is the vendor's own public price, which
 * is why a few differ from what the old site displayed.
 *
 * Our costs are NOT in this file: it is imported by client components, so anything here ships
 * to the browser. They live in data/activity-costs.ts, which is gitignored and read only by
 * scripts/audit-prices.mjs. The rule it enforces: ourPrice ≥ our cost (brief §10). Run
 * `pnpm audit:prices` after any price edit.
 *
 * On-site fees are the ones the guest must pay at the gate, taken from the vendor notes and
 * each tour page's "Essential information". Optional extras (hotel transport at $5–10) are
 * deliberately absent.
 */

export type Category = "water" | "adventure" | "family" | "sunset" | "fishing"

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "water", label: "Water" },
  { id: "adventure", label: "Adventure" },
  { id: "family", label: "Family" },
  { id: "sunset", label: "Sunset" },
  { id: "fishing", label: "Fishing" },
]

/** Mandatory fees the guest pays at the gate. Disclosed on the card — never our margin. */
export type OnSiteFee = {
  label: string
  adult: number
  child?: number
}

export type Activity = {
  id: string
  name: string
  categories: Category[]
  /** Our insider rate, per adult (or per charter — see perGroup). */
  ourPrice: number
  /** The vendor's public price. Struck through on the card. */
  publicPrice: number
  /**
   * Set when the price is for the whole group, not per person (private charters). The value
   * is the unit label shown instead of "per adult". Savings count once, not per guest.
   */
  perGroup?: string
  /** Per child, where the operator runs a child rate. */
  childOurPrice?: number
  childPublicPrice?: number
  duration: string
  minAge: number
  image: string
  featured?: boolean
  onSiteFees?: OnSiteFee[]
}

// Fees as the vendor list and the tour pages state them.
const PARK_ENTRANCE: OnSiteFee = { label: "Tierra Sagrada entrance", adult: 25, child: 12.5 }
const MIGRINO_ENTRANCE: OnSiteFee = { label: "Migriño entrance", adult: 25 }
const DOCK_FEE: OnSiteFee = { label: "dock fee", adult: 2, child: 2 }
/** "All of our tours involving ATVs require the 35 USD fee" — Cabo Adventures' ATV FAQ. */
const ATV_DAMAGE_WAIVER: OnSiteFee = { label: "ATV damage waiver", adult: 35 }
const BALANDRA_ENTRANCE: OnSiteFee = { label: "Balandra entrance", adult: 20, child: 10 }
const JETSKI_ENTRANCE: OnSiteFee = { label: "marina entrance", adult: 10 }
const JETSKI_INSURANCE: OnSiteFee = { label: "jet ski insurance", adult: 35 }
const DIVE_GEAR: OnSiteFee = { label: "gear rental, unless you bring your own", adult: 40 }

export const ACTIVITIES: Activity[] = [
  {
    id: "four-hour-luxury-sailing",
    name: "4-HOUR LUXURY CABO SAILING BOAT TOUR",
    categories: ["water"],
    ourPrice: 68,
    publicPrice: 149,
    duration: "4 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-YhDZE9acdpiT3pkwdBuYMVqLsvF6CP.jpeg",
    featured: true,
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "dolphin-signature-experience",
    name: "CABO DOLPHIN SIGNATURE EXPERIENCE",
    categories: ["water", "family"],
    ourPrice: 100,
    publicPrice: 199,
    duration: "40 Minutes",
    minAge: 4,
    image: "https://cdn.sanity.io/images/esqfj3od/production/b8366a96d36c4e23611d26ba9e30706479cf107c-608x912.webp?w=640",
  },
  {
    id: "outdoor-adventure-4x4-zipline-rappel",
    name: "OUTDOOR ADVENTURE 4X4 + CABO ZIPLINE + RAPPEL",
    categories: ["adventure"],
    ourPrice: 49,
    publicPrice: 139,
    duration: "3.5 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-eAAzOaINap9886PdyvudjDGGo52zyB.png",
    onSiteFees: [PARK_ENTRANCE],
  },
  {
    id: "camels-atv-lunch",
    name: "CAMELS + ATV + LUNCH",
    categories: ["adventure"],
    ourPrice: 60,
    publicPrice: 149,
    duration: "3 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-lUKtjQlbwS76UlXzp9o4GX3cuibiwe.png",
    onSiteFees: [PARK_ENTRANCE, ATV_DAMAGE_WAIVER],
  },
  {
    id: "luxury-cabo-sunset-cruise",
    name: "LUXURY CABO SUNSET CRUISE",
    categories: ["sunset", "water"],
    ourPrice: 50,
    publicPrice: 109,
    duration: "2.5 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-4n8FKMFPJh7Cm8DRB27vxb2e1j3du4.png",
    featured: true,
  },
  {
    id: "dolphin-swim-experience",
    name: "CABO DOLPHIN SWIM EXPERIENCE",
    categories: ["water", "family"],
    ourPrice: 85,
    publicPrice: 169,
    duration: "30 Minutes",
    minAge: 4,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-bvy4DDFT3bQ7jBqJUl4qsUkVQtTJaC.png",
  },
  {
    id: "luxury-two-bay-snorkel",
    name: "LUXURY TWO-BAY SNORKEL",
    categories: ["water", "family"],
    ourPrice: 76,
    publicPrice: 149,
    childOurPrice: 66,
    childPublicPrice: 129,
    duration: "4 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jfif-sH33gPRpt7Z9knmiQWeJLg79O47LMb.jpeg",
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "outback-cabo-camel-ride",
    name: "OUTBACK & CABO CAMEL RIDE",
    categories: ["adventure", "family", "sunset"],
    ourPrice: 48,
    publicPrice: 119,
    childOurPrice: 36,
    childPublicPrice: 89,
    duration: "3 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.jfif-gtJfsWWIkBGHbv9eleydcBITWAKilD.jpeg",
    onSiteFees: [PARK_ENTRANCE],
  },
  {
    id: "balandra-beach-la-paz-snorkeling",
    name: "BALANDRA BEACH & LA PAZ SNORKELING",
    categories: ["water"],
    ourPrice: 132,
    publicPrice: 219,
    childOurPrice: 108,
    childPublicPrice: 179,
    duration: "4 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-AgLSCemotSSb9NJq1PqSy2OizEBktv.jpeg",
    featured: true,
    onSiteFees: [BALANDRA_ENTRANCE],
  },
  {
    id: "cabo-snorkel-lands-end-arch",
    name: "CABO SNORKEL & LAND'S END ARCH",
    categories: ["water", "family"],
    ourPrice: 50,
    publicPrice: 99,
    childOurPrice: 40,
    childPublicPrice: 79,
    duration: "3 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-KeB7G5tz6AHSOgt9jbBLgsYR9YSm0I.png",
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "cabo-pulmo-snorkeling",
    name: "CABO PULMO SNORKELING EXPEDITION",
    categories: ["water"],
    ourPrice: 168,
    publicPrice: 279,
    duration: "8 Hours",
    minAge: 10,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jfif-jDphuUbSPdQjB2xaqnhDQOO1CjstTQ.jpeg",
  },
  {
    id: "utv-off-road-camel",
    name: "UTV OFF ROAD + CAMEL TOUR",
    categories: ["adventure"],
    ourPrice: 113,
    publicPrice: 249,
    duration: "3 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-qQfegkheFn3bmMVSCAL9fcMFplIyZN.png",
    onSiteFees: [PARK_ENTRANCE],
  },
  {
    id: "family-dolphin-encounter",
    name: "FAMILY DOLPHIN ENCOUNTER CABO",
    categories: ["family", "water"],
    ourPrice: 65,
    publicPrice: 129,
    childOurPrice: 55,
    childPublicPrice: 109,
    duration: "20 Minutes",
    minAge: 1,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-2r6WKCSwHpKE0ptkW9Wmky5779EAKb.jpeg",
    featured: true,
  },
  {
    id: "camel-ride-arch-lunch",
    name: "CAMEL RIDE + ARCH + LUNCH",
    categories: ["adventure", "family"],
    ourPrice: 60,
    publicPrice: 149,
    childOurPrice: 48,
    childPublicPrice: 119,
    duration: "4 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.jfif-UFuB1cn30toqIjzLYMHtnqOA8tXyV2.jpeg",
    onSiteFees: [PARK_ENTRANCE],
  },
  {
    id: "off-road-utv-tour",
    name: "OFF ROAD UTV TOUR",
    categories: ["adventure"],
    ourPrice: 90,
    publicPrice: 199,
    duration: "3 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jfif-kTRvNEjt48FSqcy4JXndcbunlTpG2P.jpeg",
    onSiteFees: [PARK_ENTRANCE],
  },
  {
    id: "atv-desert-adventure",
    name: "CABO ATV TOUR & DESERT ADVENTURE",
    categories: ["adventure"],
    ourPrice: 33,
    publicPrice: 130,
    duration: "3 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-HmftMn0JEdf7PoaEkU6xq2Vwvl9auf.png",
    onSiteFees: [MIGRINO_ENTRANCE],
  },
  {
    id: "jet-ski-adventure",
    name: "JET SKI CABO ADVENTURE",
    categories: ["water", "adventure"],
    ourPrice: 108,
    publicPrice: 179,
    duration: "2 Hours",
    minAge: 10,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-d9MhtVNFf3Zf83ScHqyNnjO1hQNSnx.jpeg",
    featured: true,
    onSiteFees: [JETSKI_ENTRANCE, JETSKI_INSURANCE],
  },
  {
    id: "art-wine-evenings-san-jose",
    name: "ART & WINE EVENINGS IN SAN JOSE DEL CABO",
    categories: ["sunset"],
    ourPrice: 56,
    publicPrice: 119,
    duration: "5 Hours",
    minAge: 18,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-SK1YjciG3EIccrmOeAQyVuI1F4nswg.jpeg",
  },
  {
    id: "cabo-pulmo-diving",
    name: "CABO PULMO DIVING TOUR",
    categories: ["water", "adventure"],
    ourPrice: 168,
    publicPrice: 279,
    duration: "4 Hours",
    minAge: 12,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7.jfif-4ZemjBETC945UA7401DKaewJYS3MCR.jpeg",
    onSiteFees: [DIVE_GEAR],
  },
  {
    id: "electric-bike-camel",
    name: "ELECTRIC BIKE TOUR + CAMEL RIDE",
    categories: ["adventure"],
    ourPrice: 52,
    publicPrice: 129,
    childOurPrice: 40,
    childPublicPrice: 99,
    duration: "3 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.jfif-cDaFG3QsIc2ymUAdboU9u7eyiidKQ6.jpeg",
    onSiteFees: [PARK_ENTRANCE],
  },
  {
    id: "private-yacht-experience",
    name: "CABO PRIVATE YACHT EXPERIENCE",
    categories: ["water", "sunset"],
    ourPrice: 1329,
    publicPrice: 1899,
    perGroup: "per charter, up to 6 guests",
    duration: "Varies",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-fFb8e9i1VW3yvYjHmrP87gsm26YTam.jpeg",
    featured: true,
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "whale-shark-experience",
    name: "SWIMMING WITH WHALE SHARKS IN CABO EXPERIENCE",
    categories: ["water", "adventure"],
    ourPrice: 156,
    publicPrice: 259,
    childOurPrice: 132,
    childPublicPrice: 219,
    duration: "10 Hours",
    minAge: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-GmwvmPaO3fGTfiPZfnGcYOTngkra0t.png",
  },
  {
    id: "luxury-whale-watching",
    name: "LUXURY WHALE WATCHING IN CABO",
    categories: ["water", "family"],
    ourPrice: 71,
    publicPrice: 129,
    childOurPrice: 60,
    childPublicPrice: 109,
    duration: "2.5 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jfif-5PTrOy7FW2YCwH5AfmzW59SMxTI3we.jpeg",
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "private-scuba-diving",
    name: "PRIVATE SCUBA DIVING IN CABO",
    categories: ["water"],
    ourPrice: 520,
    publicPrice: 799,
    perGroup: "per charter, up to 6 divers",
    duration: "3.5 Hours",
    minAge: 10,
    image: "https://cdn.sanity.io/images/esqfj3od/production/a48941e25e2f4b012ddfe299c5e56a4075e824a5-1080x1630.webp?w=1920&q=65&fit=clip&auto=format",
    onSiteFees: [DIVE_GEAR],
  },
  {
    id: "padi-advanced-open-water",
    name: "PADI ADVANCED OPEN WATER DIVER COURSE",
    categories: ["water"],
    ourPrice: 360,
    publicPrice: 399,
    duration: "72 Hours",
    minAge: 15,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jfif-yMW7RbIpkWbgsAgovNGxFhMQZgF6yA.jpeg",
    featured: true,
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "padi-open-water-certification",
    name: "PADI OPEN WATER DIVER CERTIFICATION",
    categories: ["water"],
    ourPrice: 468,
    publicPrice: 519,
    duration: "72 Hours",
    minAge: 10,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jfif-Ki1pt1yAMPpFk13FKYag8ezaY9y5yc.jpeg",
    onSiteFees: [DOCK_FEE],
  },
  {
    id: "magical-todos-santos-camels",
    name: "MAGICAL TODOS SANTOS & CAMELS",
    categories: ["family"],
    ourPrice: 56,
    publicPrice: 119,
    childOurPrice: 42,
    childPublicPrice: 89,
    duration: "4 Hours",
    minAge: 5,
    image: "https://cdn.sanity.io/images/esqfj3od/production/ed065bdd700fd2da09836fa8d248dba5ba36b08c-608x912.webp?w=640",
  },
  {
    id: "cabo-arch-city-tour",
    name: "CABO SAN LUCAS ARCH & CITY TOUR",
    categories: ["family"],
    ourPrice: 56,
    publicPrice: 119,
    childOurPrice: 42,
    childPublicPrice: 89,
    duration: "4.5 Hours",
    minAge: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-dkRBtAvU5e0NygRJhaXrnSFjHjiQmU.png",
    onSiteFees: [DOCK_FEE],
  },
]

export const discountPercent = (a: Pick<Activity, "ourPrice" | "publicPrice">) =>
  Math.round((1 - a.ourPrice / a.publicPrice) * 100)

export const findActivity = (id: string) => ACTIVITIES.find((a) => a.id === id)
