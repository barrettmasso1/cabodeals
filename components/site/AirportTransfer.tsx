import { Car } from "lucide-react"

/**
 * The airport SUV is a discounted promotional rate, not a freebie — the old site's "free
 * private SUV airport pickup" claim does not apply to activity guests. Stated plainly, and
 * kept out of the trip cart: it isn't an activity and shouldn't move the savings total.
 */
export function AirportTransfer() {
  return (
    <section className="bg-white px-4 pb-10 md:px-6 md:pb-14">
      <div className="mx-auto flex max-w-grid flex-col items-start gap-3 border border-ink/10 px-5 py-5 md:flex-row md:items-center md:gap-5 md:px-7 md:py-6">
        <Car className="h-6 w-6 shrink-0 text-gold" aria-hidden />
        <div>
          <h3 className="font-heading text-lg font-normal text-charcoal">Getting in from the airport</h3>
          <p className="mt-1 text-sm font-light leading-relaxed text-charcoal/70 md:text-base">
            Private SUV from Los Cabos International to any hotel in Los Cabos —{" "}
            <span className="text-charcoal">$89 one way</span>, a promotional rate for our guests. Tell us your flight
            when you book your resort visit and we&rsquo;ll arrange it.
          </p>
        </div>
      </div>
    </section>
  )
}
