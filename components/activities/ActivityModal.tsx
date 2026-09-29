"use client"

import { useEffect, useRef, useState } from "react"
import { Minus, Plus, X } from "lucide-react"
import { discountPercent, type Activity } from "@/data/activities"
import { childOur, childPublic, minAgeLabel, priceUnit, usd } from "@/lib/trip"
import { useTrip } from "@/components/trip/TripProvider"
import { onSiteFeeLine } from "./ActivityCard"

function Counter({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-charcoal">{label}</p>
        {hint && <p className="text-xs font-light text-charcoal/50">{hint}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink transition hover:border-ink disabled:opacity-30"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-6 text-center font-heading text-lg tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`More ${label.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink transition hover:border-ink"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

/**
 * Two questions: how many adults, how many children — plus an optional "roughly when?".
 * No date picker, no time slot, no line items, no total, no payment. Nothing is booked here.
 */
export function ActivityModal({ activity, onClose }: { activity: Activity | null; onClose: () => void }) {
  const { add, items } = useTrip()
  const existing = activity ? items.find((i) => i.id === activity.id) : undefined
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [preferredDates, setPreferredDates] = useState("")
  const dialogRef = useRef<HTMLDivElement>(null)

  // Re-seed from the trip whenever a different activity opens, so editing shows what they picked.
  useEffect(() => {
    if (!activity) return
    setAdults(existing?.adults ?? 2)
    setChildren(existing?.children ?? 0)
    setPreferredDates(existing?.preferredDates ?? "")
    dialogRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seed on open, not on every trip change
  }, [activity?.id])

  useEffect(() => {
    if (!activity) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [activity, onClose])

  if (!activity) return null

  const adultSave = activity.publicPrice - activity.ourPrice
  const childSave = childPublic(activity) - childOur(activity)
  const fees = onSiteFeeLine(activity)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 animate-fade-in md:items-center md:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={activity.name}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-white animate-slide-up outline-none md:animate-fade-in"
      >
        <div className="relative h-44 w-full overflow-hidden bg-ink md:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element -- see ActivityCard */}
          <img src={activity.image} alt="" className="h-full w-full object-cover opacity-90" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-black/50 text-white transition hover:bg-black/70"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          <span className="absolute bottom-3 left-5 bg-ink px-4 py-2 font-badge text-sm text-white">
            -{discountPercent(activity)}%
          </span>
        </div>

        <div className="px-5 py-5 md:px-7 md:py-6">
          <h2 className="font-heading text-2xl font-light leading-tight tracking-[0.4px] text-charcoal">
            {activity.name}
          </h2>
          <p className="mt-1 text-sm font-light text-charcoal/60">
            {activity.duration} • {minAgeLabel(activity)}
          </p>

          <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
            <Counter label="Adults" value={adults} min={1} onChange={setAdults} />
            <Counter
              label="Children"
              hint={activity.childOurPrice ? `${usd(activity.childOurPrice)} per child` : undefined}
              value={children}
              min={0}
              onChange={setChildren}
            />
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-charcoal/70">Your price</dt>
              <dd className="font-heading text-lg text-charcoal">{usd(activity.ourPrice)} {priceUnit(activity)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-charcoal/70">Retail price</dt>
              <dd className="font-light text-charcoal/60 line-through">{usd(activity.publicPrice)} {priceUnit(activity)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink/10 pt-2">
              <dt className="text-charcoal">You save</dt>
              <dd className="font-heading text-xl text-gold">
                {usd(adultSave)} {priceUnit(activity)}{" "}
                <span className="font-sans text-xs uppercase tracking-wider text-charcoal/50">
                  ({discountPercent(activity)}% off)
                </span>
              </dd>
            </div>
            {children > 0 && childSave > 0 && !activity.perGroup && (
              <div className="flex items-baseline justify-between text-charcoal/70">
                <dt>Per child</dt>
                <dd className="font-light">
                  {usd(childOur(activity))} · saves {usd(childSave)}
                </dd>
              </div>
            )}
          </dl>

          {fees && <p className="mt-3 text-xs font-light text-charcoal/60">{fees}.</p>}

          <p className="mt-4 text-sm font-light italic leading-relaxed text-charcoal/70">
            Tell us when you&rsquo;d like to go and we&rsquo;ll hold it. Bookings are confirmed and paid on the morning
            of your resort visit.
          </p>

          <label className="mt-5 block">
            <span className="text-sm text-charcoal">Roughly when?</span>
            <span className="ml-2 text-xs font-light text-charcoal/50">Optional</span>
            <input
              type="text"
              value={preferredDates}
              onChange={(e) => setPreferredDates(e.target.value)}
              placeholder="Thursday or Friday, late morning"
              className="mt-2 w-full border border-ink/20 px-3 py-3 text-base font-light text-charcoal outline-none transition focus:border-ink"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              add(activity, { adults, children, preferredDates })
              onClose()
            }}
            className="mt-5 w-full bg-ink px-4 py-4 font-sans text-base uppercase tracking-[0.3px] text-white transition hover:bg-ink/90"
          >
            {existing ? "Update my trip" : "Add to my trip"}
          </button>
        </div>
      </div>
    </div>
  )
}
