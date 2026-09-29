"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { ACTIVITIES, findActivity, type Activity } from "@/data/activities"
import { track } from "@/lib/track"
import { itemFromActivity, tripSavings, tripTotal, type TripItem } from "@/lib/trip"

const STORAGE_KEY = "cabodeals.trip"

type TripContextValue = {
  items: TripItem[]
  savingsTotal: number
  priceTotal: number
  count: number
  /** Bumps on every add so the savings figure can animate. */
  addTick: number
  add: (activity: Activity, opts: { adults: number; children: number; preferredDates: string }) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  expanded: boolean
  setExpanded: (open: boolean) => void
}

const TripContext = createContext<TripContextValue | null>(null)

/** Only ids still in the catalog survive a reload — a stale trip would price wrong. */
function readStored(): TripItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as TripItem[]).filter((i) => i && typeof i.id === "string" && findActivity(i.id))
  } catch {
    return []
  }
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<TripItem[]>([])
  const [expanded, setExpanded] = useState(false)
  const [addTick, setAddTick] = useState(0)
  const hydrated = useRef(false)

  useEffect(() => {
    setItems(readStored())
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Private mode or a full quota — the trip just doesn't survive a reload.
    }
  }, [items])

  const savingsTotal = useMemo(() => tripSavings(items, findActivity), [items])
  const priceTotal = useMemo(() => tripTotal(items, findActivity), [items])

  const add = useCallback<TripContextValue["add"]>((activity, opts) => {
    const item = itemFromActivity(activity, opts)
    setItems((prev) => {
      const next = prev.some((i) => i.id === item.id)
        ? prev.map((i) => (i.id === item.id ? item : i)) // re-adding updates the counts
        : [...prev, item]
      track("add_to_trip", {
        activity_id: item.id,
        activity_name: item.name,
        adults: item.adults,
        children: item.children,
        cartItemCount: next.length,
        cartSavingsTotal: tripSavings(next, findActivity),
      })
      return next
    })
    setAddTick((n) => n + 1)
    setExpanded(false)
  }, [])

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items])

  const value = useMemo(
    () => ({ items, savingsTotal, priceTotal, count: items.length, addTick, add, remove, has, expanded, setExpanded }),
    [items, savingsTotal, priceTotal, addTick, add, remove, has, expanded],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error("useTrip must be used inside <TripProvider>")
  return ctx
}

export const catalogCount = ACTIVITIES.length
