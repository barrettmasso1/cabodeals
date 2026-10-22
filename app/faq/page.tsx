import Link from "next/link"
import { Wordmark } from "@/components/site/Wordmark"
import { SiteFooter } from "@/components/site/SiteFooter"

export const metadata = {
  title: "Questions | Cabo Deals",
  description:
    "How the insider pricing works, when you pay, and why the resort visit comes first. Nothing is charged online.",
}

/**
 * Brief §6, item 6: the FAQ is one of the six places the held-not-booked rule has to appear,
 * and §7 lists the claims the old FAQ made that this model cannot support — free airport
 * pickup, and 24-48 hour cancellation on activities that were never booked.
 */
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "When do I pay for the activities?",
    a: (
      <>
        On the morning of your resort visit, in person, at the resort. Nothing is charged on this website at any point
        — there is no card field anywhere on it.
      </>
    ),
  },
  {
    q: "Can I do the activities before the resort visit?",
    a: (
      <>
        No. The visit comes first, always. The insider rates exist because the resort is paying for your attendance, so
        they are not available until you have been. Once you have, the rates are yours for the rest of your stay.
      </>
    ),
  },
  {
    q: "Do I have to attend the resort visit?",
    a: (
      <>
        Yes — that is the deal, and we would rather say so plainly than have you find out on the morning. Breakfast, a
        90-minute look around a partner property, and a presentation about their vacation ownership program. Low-key,
        no pressure, no hard sell, and transportation both ways.
      </>
    ),
  },
  {
    q: "What if I don't qualify?",
    a: (
      <>
        Not everyone does — the resorts set the criteria, not us. If there is no visit we can offer you, we will say
        so, and a concierge will come back to you with the same activities at a smaller discount, no visit required.
        Still below retail, and still paid in person.
      </>
    ),
  },
  {
    q: "Is anything else due on the day?",
    a: (
      <>
        Some activities carry a fee paid directly to the operator at the gate — park and dock entrances, ATV damage
        waivers, dive gear. Where one applies, it is written on the activity card before you add it. Those are the
        operator&rsquo;s, not ours, and they are not included in our price.
      </>
    ),
  },
  {
    q: "What if I need to cancel?",
    a: (
      <>
        Just tell us. Nothing has been charged, so there is nothing to refund — a late cancellation or no-show simply
        releases the reservation and the activities held with it. We ask for 48 hours so we can offer the slot to
        someone else.
      </>
    ),
  },
  {
    q: "Can you pick us up from the airport?",
    a: (
      <>
        Yes, at a promotional rate: $89 for a private SUV, one way, to any hotel in Los Cabos. Tell us your flight when
        you book your visit and we will arrange it.
      </>
    ),
  },
  {
    q: "How long do these prices last?",
    a: <>The rest of your stay. Do one activity or do something every day — the rates hold either way.</>,
  },
  {
    q: "Can I pick the day and time?",
    a: (
      <>
        Tell us roughly when you would like to go and we will hold it. We do not own the boats or the ATVs, so we
        confirm the exact departure with the operator rather than promise you a time we cannot keep. Most of these run
        daily.
      </>
    ),
  },
  {
    q: "Are there age limits?",
    a: (
      <>
        They vary by activity and are set by the operator — the minimum age is on every card. Some also carry weight
        limits, and ATV drivers must be 18 with a licence.
      </>
    ),
  },
]

export default function FaqPage() {
  return (
    <>
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-grid items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" aria-label="Cabo Deals">
            <Wordmark className="w-[132px] text-charcoal md:w-[150px]" />
          </Link>
          <Link href="/#activities" className="text-xs uppercase tracking-wider text-charcoal/70 hover:text-charcoal">
            Activities
          </Link>
        </div>
      </header>

      <main className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="font-heading text-4xl font-light tracking-tight text-charcoal md:text-5xl">Questions</h1>
          <p className="mt-3 font-light leading-relaxed text-charcoal/70">
            The short version: the prices come from partner resorts, you join one for breakfast and a 90-minute look
            around, and you pay for your activities that same morning. Nothing is charged online.
          </p>

          <dl className="mt-10">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border-t border-ink/10 py-6">
                <dt className="font-heading text-xl font-light text-charcoal md:text-2xl">{q}</dt>
                <dd className="mt-2 font-light leading-relaxed text-charcoal/75">{a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="font-light text-charcoal/70">
              Anything else, call or text{" "}
              <a href="tel:+16195667577" className="underline underline-offset-4 hover:text-charcoal">
                +1 (619) 566-7577
              </a>
              .
            </p>
            <Link
              href="/#activities"
              className="mt-6 inline-block bg-ink px-6 py-4 font-sans text-sm uppercase tracking-wider text-white transition hover:bg-ink/90"
            >
              Build your trip
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
