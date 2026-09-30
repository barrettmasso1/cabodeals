import Link from "next/link"
import { Check } from "lucide-react"
import type { SubmitResult } from "@/components/QualificationForm"
import { findActivity } from "@/data/activities"
import { itemSavings, itemTotal, usd, type TripItem } from "@/lib/trip"

const WINDOW_LABEL: Record<string, string> = {
  first_party: "around 8:00 AM",
  second_party: "around 10:45 AM",
  flexible: "we'll confirm the time with you",
}

/** "Friday, October 3" — the date input gives us an ISO day, parsed as local, not UTC. */
function longDate(iso: string): string | null {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

/**
 * Brief §5.6. Header is YOU'RE SET — never "Reservation Confirmed", because the activities
 * are held, not booked. The only thing confirmed here is the resort visit.
 */
export function Confirmation({ result, items }: { result: SubmitResult; items: TripItem[] }) {
  const { state } = result
  const visitDate = longDate(state.preferredVisitDate)
  const savings = items.reduce((t, i) => t + itemSavings(i, findActivity(i.id)), 0)
  const total = items.reduce((t, i) => t + itemTotal(i, findActivity(i.id)), 0)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <p className="text-xs uppercase tracking-widest text-gold">{state.firstName ? `Thanks, ${state.firstName}` : "Thanks"}</p>
      <h1 className="mt-2 font-heading text-4xl font-light tracking-tight text-charcoal md:text-5xl">YOU&rsquo;RE SET</h1>

      <section className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="font-heading text-2xl font-light text-charcoal">Your resort visit</h2>
        <dl className="mt-4 space-y-3 text-charcoal/80">
          <Row label="When">
            {visitDate ?? "We'll confirm the date with you"}
            {state.preferredWindow && ` · ${WINDOW_LABEL[state.preferredWindow] ?? ""}`}
          </Row>
          <Row label="Pickup">
            {state.transportNeeded
              ? `${state.pickupAddress?.trim() || state.hotelName || "Your hotel"} — we'll collect you and bring you back`
              : "You're making your own way there"}
          </Row>
          <Row label="How long">About 90 minutes, start to finish — breakfast, then a look around the property</Row>
          <Row label="Bring">
            A photo ID{state.adults?.some((a) => a.maritalStatus === "married") ? ", and both of you — married couples attend together" : ""}
          </Row>
        </dl>
        <p className="mt-4 text-sm font-light leading-relaxed text-charcoal/60">
          It&rsquo;s a presentation about the resort&rsquo;s vacation ownership program. Low-key, no pressure, no hard
          sell. That&rsquo;s the whole deal, and it&rsquo;s what unlocks your pricing.
        </p>
      </section>

      {items.length > 0 && (
        <section className="mt-10 border-t border-ink/10 pt-6">
          <h2 className="font-heading text-2xl font-light text-charcoal">Your list</h2>
          <p className="mt-1 text-sm font-light text-charcoal/60">Your prices lock in at your visit.</p>
          <ul className="mt-4 divide-y divide-ink/10">
            {items.map((i) => {
              const activity = findActivity(i.id)
              return (
                <li key={i.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-heading text-lg font-light text-charcoal">{i.name}</p>
                    <p className="mt-0.5 text-sm font-light text-charcoal/60">
                      {i.adults} adult{i.adults === 1 ? "" : "s"}
                      {i.children > 0 && ` · ${i.children} child${i.children === 1 ? "" : "ren"}`}
                      {i.preferredDates && ` · roughly ${i.preferredDates}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-lg text-charcoal">{usd(itemTotal(i, activity))}</p>
                    <p className="text-xs text-gold">saves {usd(itemSavings(i, activity))}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-ink/20 pt-3">
            <span className="text-charcoal">You save</span>
            <span className="font-heading text-3xl font-light text-gold">{usd(savings)}</span>
          </div>
          <p className="mt-1 text-right text-sm font-light text-charcoal/60">{usd(total)} total, paid at the resort</p>
        </section>
      )}

      <section className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="font-heading text-2xl font-light text-charcoal">What happens next</h2>
        <ol className="mt-4 space-y-4">
          {[
            "We check availability and hold your dates.",
            visitDate ? `Come to your resort visit on ${visitDate}.` : "Come to your resort visit.",
            "Pay for your activities that morning, at the resort — and you're set for the rest of your trip.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="font-heading text-xl font-light text-gold">{i + 1}</span>
              <span className="font-light leading-relaxed text-charcoal/80">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 flex items-center gap-2 text-sm font-light text-charcoal/60">
        <Check className="h-4 w-4 text-gold" aria-hidden />
        Nothing was charged. You pay in person, on the morning of your visit.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm uppercase tracking-wider text-charcoal underline underline-offset-4">
        Back to the activities
      </Link>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-widest text-charcoal/50">{label}</dt>
      <dd className="font-light">{children}</dd>
    </div>
  )
}
