"use client"

import { useMemo, useState } from "react"
import { ACTIVITIES, CATEGORIES, type Activity, type Category } from "@/data/activities"
import { track } from "@/lib/track"
import { useTrip } from "@/components/trip/TripProvider"
import { ActivityCard } from "./ActivityCard"
import { ActivityModal } from "./ActivityModal"
import { DisclosureRibbon } from "./DisclosureRibbon"

export function ActivityGrid() {
  const [filter, setFilter] = useState<Category | "all">("all")
  const [open, setOpen] = useState<Activity | null>(null)
  const { count, savingsTotal } = useTrip()

  const counts = useMemo(() => {
    const map = new Map<Category, number>()
    for (const a of ACTIVITIES) for (const c of a.categories) map.set(c, (map.get(c) ?? 0) + 1)
    return map
  }, [])

  const shown = filter === "all" ? ACTIVITIES : ACTIVITIES.filter((a) => a.categories.includes(filter))

  const openActivity = (a: Activity) => {
    setOpen(a)
    track("activity_view", {
      activity_id: a.id,
      activity_name: a.name,
      ourPrice: a.ourPrice,
      publicPrice: a.publicPrice,
      savings: a.publicPrice - a.ourPrice,
      cartItemCount: count,
      cartSavingsTotal: savingsTotal,
    })
  }

  return (
    <section id="activities" className="scroll-mt-16">
      <DisclosureRibbon />

      <div className="mx-auto max-w-grid px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <Chip active={filter === "all"} onClick={() => setFilter("all")} label="All" count={ACTIVITIES.length} />
          {CATEGORIES.filter((c) => counts.has(c.id)).map((c) => (
            <Chip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
              label={c.label}
              count={counts.get(c.id) ?? 0}
            />
          ))}
        </div>

        {count === 0 && (
          <p className="mt-6 text-center text-sm font-light text-charcoal/60">
            Add activities to see how much you&rsquo;ll save.
          </p>
        )}

        {shown.length === 0 ? (
          <p className="mt-12 text-center font-light text-charcoal/60">
            Nothing in this category yet — more of the catalog is still being priced.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((a) => (
              <ActivityCard key={a.id} activity={a} onOpen={openActivity} />
            ))}
          </div>
        )}

        {/* Keeps the last row clear of the sticky trip bar on mobile. */}
        <div aria-hidden className="h-28 md:h-0" />
      </div>

      <ActivityModal activity={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  const empty = count === 0
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 font-sans text-xs uppercase tracking-wider transition md:text-sm ${
        active ? "border-ink bg-ink text-white" : "border-ink/20 text-charcoal/70 hover:border-ink hover:text-charcoal"
      } ${empty ? "opacity-40" : ""}`}
    >
      {label}
      <span className="ml-2 text-[11px] opacity-60">{count}</span>
    </button>
  )
}
