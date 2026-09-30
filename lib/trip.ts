/**
 * The trip — what the guest is holding, not what they've bought. Nothing here is booked,
 * reserved or confirmed: prices lock in at the resort visit (brief §2).
 *
 * TripItem is structurally a `CartItem` from lib/qualify, plus `preferredDates`. The shared
 * QualificationForm files are byte-identical to cabogolf's and must stay that way, so the
 * extra field rides along here rather than being added to the shared type. It survives into
 * `cartItemsJson` because payload.ts stringifies the items as given.
 */
import type { CartItem } from "@/lib/qualify"
import { findActivity, type Activity } from "@/data/activities"

export type TripItem = CartItem & {
  /** "Roughly when?" — free text, one per activity. Optional. */
  preferredDates: string
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`

/** Children are charged the child rate where the operator has one, otherwise the adult rate. */
export const childOur = (a: Activity) => a.childOurPrice ?? a.ourPrice
export const childPublic = (a: Activity) => a.childPublicPrice ?? a.publicPrice

export function itemFromActivity(
  a: Activity,
  { adults, children, preferredDates }: { adults: number; children: number; preferredDates: string },
): TripItem {
  return {
    id: a.id,
    name: a.name,
    adults,
    children,
    ourPrice: a.ourPrice,
    publicPrice: a.publicPrice,
    preferredDates: preferredDates.trim(),
  }
}

/**
 * Savings for one line. Children use the child rate when the catalog carries one — looked up
 * by id so a stored trip stays correct if the catalog changes under it.
 */
export function itemSavings(item: TripItem, activity?: Activity): number {
  if (activity?.perGroup) return item.publicPrice - item.ourPrice // a charter saves once, not per guest
  const adultSaving = (item.publicPrice - item.ourPrice) * item.adults
  if (!item.children) return adultSaving
  const cPublic = activity ? childPublic(activity) : item.publicPrice
  const cOur = activity ? childOur(activity) : item.ourPrice
  return adultSaving + (cPublic - cOur) * item.children
}

export function itemTotal(item: TripItem, activity?: Activity): number {
  if (activity?.perGroup) return item.ourPrice
  const adults = item.ourPrice * item.adults
  if (!item.children) return adults
  return adults + (activity ? childOur(activity) : item.ourPrice) * item.children
}

export const tripSavings = (items: TripItem[], lookup: (id: string) => Activity | undefined) =>
  items.reduce((sum, i) => sum + itemSavings(i, lookup(i.id)), 0)

export const tripTotal = (items: TripItem[], lookup: (id: string) => Activity | undefined) =>
  items.reduce((sum, i) => sum + itemTotal(i, lookup(i.id)), 0)

/** "per adult", or the charter's own unit. */
export const priceUnit = (a: Activity) => a.perGroup ?? "per adult"

export const minAgeLabel = (a: Activity) => `Min ${a.minAge} ${a.minAge === 1 ? "year" : "years"} old`

export const tripGuests = (item: TripItem) => item.adults + item.children

export const TRIP_STORAGE_KEY = "cabodeals.trip"

/**
 * The trip as the grid left it. Only ids still in the catalog survive — a stale trip would
 * price wrong. Storage can throw (private mode, blocked site data), so this never rejects.
 */
export function readStoredTrip(): TripItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.sessionStorage.getItem(TRIP_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as TripItem[]).filter((i) => i && typeof i.id === "string" && findActivity(i.id))
  } catch {
    return []
  }
}

export function writeStoredTrip(items: TripItem[]) {
  try {
    window.sessionStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Private mode or a full quota — the trip just doesn't survive a reload.
  }
}
