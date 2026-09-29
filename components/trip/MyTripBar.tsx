"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { findActivity } from "@/data/activities"
import { itemSavings, itemTotal, usd } from "@/lib/trip"
import { useTrip } from "./TripProvider"

/** The savings figure — re-animates on every add (brief §5.4). */
function SavingsFigure({ value, tick, className = "" }: { value: number; tick: number; className?: string }) {
  const [pop, setPop] = useState(false)
  useEffect(() => {
    if (tick === 0) return
    setPop(true)
    const t = setTimeout(() => setPop(false), 450)
    return () => clearTimeout(t)
  }, [tick])
  return (
    <span className={`inline-block font-heading tabular-nums ${pop ? "animate-savings-pop" : ""} ${className}`}>
      {usd(value)}
    </span>
  )
}

/**
 * My Trip — bottom bar on mobile, top-right drawer on desktop, visible from the first add.
 * Nothing in here is booked: the copy says "held", and the CTA goes to the qualification form.
 */
export function MyTripBar() {
  const { items, count, savingsTotal, priceTotal, addTick, remove, expanded, setExpanded } = useTrip()

  if (count === 0) return null

  const activities = `${count} ${count === 1 ? "activity" : "activities"} in your trip`

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:w-[380px]">
      <div className="border-t border-white/10 bg-ink text-white shadow-[0_-6px_24px_rgba(0,0,0,0.25)] md:border md:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        {expanded && (
          <div className="max-h-[55vh] overflow-y-auto border-b border-white/10 md:max-h-[50vh]">
            <ul className="divide-y divide-white/10">
              {items.map((item) => {
                const activity = findActivity(item.id)
                return (
                  <li key={item.id} className="flex gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-light leading-snug tracking-wide">{item.name}</p>
                      <p className="mt-1 text-xs font-light text-white/60">
                        {item.adults} adult{item.adults === 1 ? "" : "s"}
                        {item.children > 0 && ` · ${item.children} child${item.children === 1 ? "" : "ren"}`} ·{" "}
                        {usd(itemTotal(item, activity))}
                      </p>
                      {item.preferredDates && (
                        <p className="mt-1 text-xs font-light italic text-white/50">Roughly: {item.preferredDates}</p>
                      )}
                      <p className="mt-1 text-xs text-gold">Saves {usd(itemSavings(item, activity))}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name} from your trip`}
                      className="h-7 w-7 shrink-0 self-start text-white/50 transition hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="flex items-baseline justify-between px-5 py-3 text-sm font-light">
              <span className="text-white/70">Your prices, all in</span>
              <span className="font-heading text-lg">{usd(priceTotal)}</span>
            </div>
          </div>
        )}

        {/* Stacked in both layouts — the desktop drawer is only 380px, so a single row squeezes. */}
        <div className="flex flex-col gap-3 px-4 py-3 md:px-5 md:py-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-light leading-tight text-white/80">
                <span>{activities}</span>
                {expanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
                ) : (
                  <ChevronUp className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
                )}
              </span>
              <span className="mt-0.5 flex items-baseline gap-2">
                <span className="font-badge text-[11px] uppercase tracking-widest text-white/60">You save</span>
                <SavingsFigure value={savingsTotal} tick={addTick} className="text-2xl font-light text-gold" />
              </span>
            </span>
          </button>

          <a
            href="/unlock"
            className="block shrink-0 bg-sand px-4 py-3.5 text-center font-sans text-sm uppercase tracking-wider text-slate shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:bg-sand-dark md:px-6 md:py-3"
          >
            Unlock these prices <span aria-hidden>→</span>
          </a>
        </div>

        <p className="px-4 pb-3 text-[11px] font-light text-white/50 md:px-5">Held until your resort visit</p>
      </div>
    </div>
  )
}
