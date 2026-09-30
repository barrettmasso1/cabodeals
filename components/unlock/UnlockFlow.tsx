"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { QualificationForm, type SubmitResult } from "@/components/QualificationForm"
import { findActivity } from "@/data/activities"
import { track } from "@/lib/track"
import { itemSavings, readStoredTrip, usd, type TripItem } from "@/lib/trip"
import { Confirmation } from "./Confirmation"
import { NqOffer } from "./NqOffer"

/** Brief §5.5 — the fourth disclosure line, the one that names when you pay. */
const DISCLOSURE_CLOSING =
  "Your activities are confirmed and paid that same morning, at the resort. That's what unlocks the pricing — and once it's done, the rates are yours for the rest of your stay."

type Phase = { kind: "form" } | { kind: "done"; result: SubmitResult } | { kind: "nq"; result: SubmitResult }

export function UnlockFlow() {
  const [trip, setTrip] = useState<TripItem[] | null>(null) // null until we've read storage
  const [phase, setPhase] = useState<Phase>({ kind: "form" })
  const started = useRef(false)

  useEffect(() => {
    setTrip(readStoredTrip())
  }, [])

  const savingsTotal = useMemo(
    () => (trip ?? []).reduce((t, i) => t + itemSavings(i, findActivity(i.id)), 0),
    [trip],
  )

  useEffect(() => {
    if (trip === null || started.current) return
    started.current = true
    track("unlock_start", { cartItemCount: trip.length, cartSavingsTotal: savingsTotal })
  }, [trip, savingsTotal])

  useEffect(() => {
    if (phase.kind !== "form") window.scrollTo(0, 0)
  }, [phase])

  if (trip === null) return <div className="min-h-[60vh]" aria-hidden />

  if (phase.kind === "done") return <Confirmation result={phase.result} items={trip} />
  if (phase.kind === "nq") return <NqOffer result={phase.result} items={trip} />

  if (trip.length === 0) return <EmptyTrip />

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto mb-6 w-full max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-gold">Unlock your prices</p>
        <h1 className="mt-2 font-heading text-3xl font-light tracking-tight text-charcoal md:text-4xl">
          {trip.length} {trip.length === 1 ? "activity" : "activities"} held ·{" "}
          <span className="text-gold">{usd(savingsTotal)}</span> saved
        </h1>
        <p className="mt-2 font-light text-charcoal/70">
          Book the resort visit and these prices are yours for the rest of your stay.
        </p>
      </div>

      <QualificationForm
        brand="cabodeals"
        hook="activities"
        product="activities"
        market="los_cabos"
        offer={{ kind: "activities", items: trip, savingsTotal }}
        rewardPhrase="these prices"
        disclosureClosing={DISCLOSURE_CLOSING}
        onComplete={(result) =>
          // A reroute only changes which resort buys the lead — the guest's visit is the same,
          // so there's nothing to offer them to choose between. Only NQ branches.
          setPhase(result.qualification.qualificationState === "nq" ? { kind: "nq", result } : { kind: "done", result })
        }
      />
    </div>
  )
}

function EmptyTrip() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-light text-charcoal">Your trip is empty</h1>
      <p className="mt-3 font-light leading-relaxed text-charcoal/70">
        Add the activities you want first — the savings total is what you&rsquo;re unlocking, so we need to know what
        you&rsquo;re after before we book your visit.
      </p>
      <Link
        href="/#activities"
        className="mt-6 inline-block bg-ink px-6 py-4 font-sans text-sm uppercase tracking-wider text-white transition hover:bg-ink/90"
      >
        Build your trip
      </Link>
    </div>
  )
}
