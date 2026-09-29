"use client"

import { Check } from "lucide-react"
import { discountPercent, type Activity } from "@/data/activities"
import { minAgeLabel, usd } from "@/lib/trip"
import { useTrip } from "@/components/trip/TripProvider"

export function onSiteFeeLine(activity: Activity): string | null {
  if (!activity.onSiteFees?.length) return null
  return activity.onSiteFees.map((f) => `+ ${usd(f.adult)} ${f.label}`).join(", ") + ", paid on site"
}

/**
 * The live site's card design, kept as-is — image bed, gold FEATURED tag, navy discount badge,
 * gradient overlay. The checkout behind it is gone: the button opens the two-question modal.
 */
export function ActivityCard({ activity, onOpen }: { activity: Activity; onOpen: (a: Activity) => void }) {
  const { has } = useTrip()
  const inTrip = has(activity.id)
  const fees = onSiteFeeLine(activity)

  return (
    <div className="group relative h-[490px] overflow-hidden bg-ink shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
      {activity.featured && (
        <span className="absolute left-[15px] top-[15px] z-10 bg-gold px-2.5 py-1 font-sans text-[13px] uppercase text-white">
          Featured
        </span>
      )}
      <span className="absolute right-[15px] top-[15px] z-10 bg-ink px-5 py-2.5 font-badge text-[18px] font-medium text-white">
        -{discountPercent(activity)}%
      </span>

      {/* eslint-disable-next-line @next/next/no-img-element -- photography still lives in the old site's blob store */}
      <img
        src={activity.image}
        alt={activity.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="card-overlay-gradient absolute inset-x-0 bottom-0 px-[25px] pb-[30px] pt-16 text-left text-white">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="font-heading text-[30px] font-light leading-none">{usd(activity.ourPrice)}</span>
          <span className="font-heading text-base font-extralight leading-none line-through opacity-70">
            {usd(activity.publicPrice)}
          </span>
          {activity.perGroup && <span className="text-xs font-light text-white/70">{activity.perGroup}</span>}
        </div>
        <p className="mb-2 text-[11px] font-light uppercase tracking-wider text-white/85">
          Confirmed at your resort visit
        </p>
        <h3 className="mb-2 font-heading text-xl font-light leading-tight tracking-[0.4px]">{activity.name}</h3>
        <p className="mb-2 text-base font-light leading-snug opacity-90">
          {activity.duration} • {minAgeLabel(activity)}
        </p>
        {fees && <p className="mb-4 text-xs font-light text-white/70">{fees}</p>}

        <button
          type="button"
          onClick={() => onOpen(activity)}
          className="flex w-full items-center justify-center gap-2 bg-sand px-1 py-4 font-sans text-base uppercase tracking-[0.3px] text-slate shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-0.5 hover:bg-sand-dark hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
        >
          {inTrip && <Check className="h-4 w-4 text-gold" aria-hidden />}
          {inTrip ? "In your trip — edit" : "Add to my trip"}
        </button>
      </div>
    </div>
  )
}
