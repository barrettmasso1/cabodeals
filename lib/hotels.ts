// Hotel tier map lookup. Mirrored in the cabodeals.mx repo — keep identical.
// Data lives in data/hotels.json (shipped with the brief — do not regenerate).

import raw from "@/data/hotels.json"

export type SolmarTier = "A" | "B" | "C" | "IM"
export type Hook = "golf" | "activities"

type RuleValue = string | boolean
type RateRules = Partial<Record<keyof HotelFlagSource, Record<string, RuleValue>>>

type HotelFlagSource = {
  solmarGolferTier: SolmarTier | null
  solmarTier: SolmarTier | null
  solmarImOk: boolean
  questroOk: boolean
  questro5Star: boolean
  diamanteOk: boolean
  listaDosOk: boolean | null
  vgOk: boolean | null
}

export type HotelRecord = HotelFlagSource & {
  name: string
  aliases: string[]
  notes: string[]
  isRental?: boolean
  rateRules?: RateRules
}

export const HOTELS = raw as unknown as Record<string, HotelRecord>

/** The "Airbnb / VRBO / private rental" entry. Its `rateRules` also drive unlisted hotels. */
export const RENTAL_HOTEL_ID = "airbnb-rental"

/** Pseudo hotel id for "My hotel isn't listed". Never a key in HOTELS. */
export const UNLISTED_HOTEL_ID = "unlisted"

// Nightly rate compared directly against the JSON thresholds:
// ≥125 VG · ≥150 Solmar non-golfer A and IM · ≥200 Solmar golfer A · ≥400 Lista #2 and Diamante.
function applyRule(rule: Record<string, RuleValue>, rate: number | null): RuleValue | null {
  if (rate === null) return null
  let best = -1
  let out: RuleValue | null = null
  for (const [key, value] of Object.entries(rule)) {
    const threshold = Number(key.replace(">=", ""))
    if (rate >= threshold && threshold > best) {
      best = threshold
      out = value
    }
  }
  return out
}

export type HotelFlags = {
  hotelTierSolmar: SolmarTier | null
  hotelSolmarGolferTier: SolmarTier | null
  hotelSolmarImOk: boolean
  hotelQuestroOk: boolean
  hotelQuestro5Star: boolean
  hotelDiamanteOk: boolean
  hotelListaDosOk: boolean
  hotelVgOk: boolean
}

export function isRentalHotel(hotelId: string): boolean {
  return HOTELS[hotelId]?.isRental === true
}

/** Rate-tiered categories (Airbnb/VRBO, private residence) — never a resort to match a rental to. */
export const RENTAL_HOTEL_IDS: readonly string[] = Object.keys(HOTELS).filter(isRentalHotel)

/** A real property in the tier map — not the rental entry, not the unlisted sentinel. */
export function isListedProperty(hotelId: string): boolean {
  return !!HOTELS[hotelId] && !isRentalHotel(hotelId)
}

/**
 * Resolve every hotel flag. A listed property returns its own entry and ignores the rate.
 * The rental entry and unlisted hotels derive from `rateRules` + nightly rate.
 */
export function hotelFlags(hotelId: string, nightlyRate: number | null): HotelFlags | null {
  const h = HOTELS[hotelId === UNLISTED_HOTEL_ID ? RENTAL_HOTEL_ID : hotelId]
  if (!h) return null

  const pick = <K extends keyof HotelFlagSource>(field: K): HotelFlagSource[K] => {
    const rule = h.rateRules?.[field]
    if (h.isRental && rule) return applyRule(rule, nightlyRate) as HotelFlagSource[K]
    return h[field]
  }

  return {
    hotelTierSolmar: pick("solmarTier") ?? null,
    hotelSolmarGolferTier: pick("solmarGolferTier") ?? null,
    hotelSolmarImOk: pick("solmarImOk") === true,
    hotelQuestroOk: pick("questroOk") === true,
    hotelQuestro5Star: pick("questro5Star") === true,
    hotelDiamanteOk: pick("diamanteOk") === true,
    hotelListaDosOk: pick("listaDosOk") === true,
    hotelVgOk: pick("vgOk") === true,
  }
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

type SearchEntry = { id: string; name: string; terms: string[] }

const INDEX: SearchEntry[] = Object.entries(HOTELS).map(([id, h]) => ({
  id,
  name: h.name,
  terms: [h.name, ...h.aliases].map(normalize),
}))

export type HotelMatch = { id: string; name: string; matchedAlias: string | null }

/** Local typeahead over canonical names and every alias. No network. */
export function searchHotels(query: string, limit = 8, exclude: readonly string[] = []): HotelMatch[] {
  const q = normalize(query)
  if (!q) return []
  const tokens = q.split(" ")

  const scored: { entry: SearchEntry; score: number; term: string }[] = []
  for (const entry of INDEX) {
    if (exclude.includes(entry.id)) continue
    let bestScore = 0
    let bestTerm = ""
    for (const term of entry.terms) {
      let score = 0
      if (term === q) score = 100
      else if (term.startsWith(q)) score = 80
      else if (term.split(" ").some((w) => w.startsWith(q))) score = 60
      else if (tokens.every((t) => term.split(" ").some((w) => w.startsWith(t)))) score = 50
      else if (term.includes(q)) score = 30
      if (score > bestScore) {
        bestScore = score
        bestTerm = term
      }
    }
    if (bestScore) scored.push({ entry, score: bestScore, term: bestTerm })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map(({ entry, term }) => {
      const alias = HOTELS[entry.id].aliases.find((a) => normalize(a) === term)
      return {
        id: entry.id,
        name: entry.name,
        matchedAlias: alias && normalize(alias) !== normalize(entry.name) ? alias : null,
      }
    })
}
