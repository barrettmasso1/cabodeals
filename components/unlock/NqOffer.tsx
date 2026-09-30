import Link from "next/link"
import type { SubmitResult } from "@/components/QualificationForm"
import { findActivity } from "@/data/activities"
import { itemTotal, usd, type TripItem } from "@/lib/trip"

/**
 * Brief §9 — the NQ path, stubbed (build-order step 10). Some guests won't qualify for any
 * buyer; turning them away is pure waste. No resort visit, a smaller discount, paid direct,
 * and no payment processing at launch — a concierge picks it up from here.
 *
 * The discount tier isn't set yet, so this promises a call, not a number.
 */
export function NqOffer({ result, items }: { result: SubmitResult; items: TripItem[] }) {
  const { state } = result
  const total = items.reduce((t, i) => t + itemTotal(i, findActivity(i.id)), 0)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <p className="text-xs uppercase tracking-widest text-gold">
        {state.firstName ? `Thanks, ${state.firstName}` : "Thanks"}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-light leading-tight tracking-tight text-charcoal md:text-4xl">
        The resort visit isn&rsquo;t a fit — but we can still get you out on the water.
      </h1>
      <p className="mt-4 font-light leading-relaxed text-charcoal/75">
        The insider rates come from partner resorts, and for your dates and party we don&rsquo;t have a visit to offer
        you. That&rsquo;s on us, not you. What we can do is book the same activities at a discount off retail — no
        resort visit, no presentation, nothing to sit through.
      </p>

      {items.length > 0 && (
        <section className="mt-8 border-t border-ink/10 pt-6">
          <h2 className="font-heading text-xl font-light text-charcoal">What you picked</h2>
          <ul className="mt-3 space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 text-sm font-light text-charcoal/80">
                <span>{i.name}</span>
                <span className="shrink-0">{usd(itemTotal(i, findActivity(i.id)))}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-light text-charcoal/60">
            {usd(total)} at insider pricing. Your rate without the visit will land above that and below retail — our
            concierge will confirm it with you.
          </p>
        </section>
      )}

      <section className="mt-8 border-t border-ink/10 pt-6">
        <h2 className="font-heading text-xl font-light text-charcoal">What happens next</h2>
        <p className="mt-3 font-light leading-relaxed text-charcoal/75">
          A concierge will contact you with your rates and availability, and you pay them in person. Nothing is charged
          online here either.
        </p>
      </section>

      <Link href="/" className="mt-8 inline-block text-sm uppercase tracking-wider text-charcoal underline underline-offset-4">
        Back to the activities
      </Link>
    </div>
  )
}
