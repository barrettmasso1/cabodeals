import Link from "next/link"
import { SiteFooter } from "@/components/site/SiteFooter"

export const metadata = {
  title: "Terms of Service | Cabo Deals",
  description: "How the resort visit, the activity holds and the pricing work. Nothing is charged online.",
}

/**
 * Ported from cabogolf.mx and adapted for activities. The cancellation section matches how
 * the booking actually works: nothing is charged in advance, so there is nothing to bill and
 * nothing to refund — a late cancellation releases the hold and the public rate applies.
 */
export default function TermsOfServicePage() {
  return (
    <>
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-grid items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" aria-label="Cabo Deals">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo still served by the old site */}
            <img
              src="https://www.cabodeals.mx/images/cabo-deals-logo.png"
              alt="Cabo Deals"
              className="h-8 w-auto brightness-0 md:h-9"
            />
          </Link>
          <Link href="/#activities" className="text-xs uppercase tracking-wider text-charcoal/70 hover:text-charcoal">
            Activities
          </Link>
        </div>
      </header>

      <main className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="font-heading text-4xl font-light tracking-tight text-charcoal md:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm font-light text-charcoal/60">Effective date: September 30, 2026</p>
          <p className="mt-6 font-light leading-relaxed text-charcoal/80">
            These Terms govern your use of cabodeals.mx and the services we arrange. By using this site or booking a
            resort visit with us, you agree to them.
          </p>

          <Section title="How the pricing works">
            <p>
              The rates on this site are available to guests who attend a 90-minute resort visit at one of our partner
              properties. The visit includes transportation from your hotel where available, breakfast at the resort,
              and a walk around the property with a member of their team. It is a presentation about the resort&rsquo;s
              vacation ownership program.
            </p>
            <p>
              Attending the visit is what unlocks the pricing. If you do not attend, the operator&rsquo;s standard
              public rate applies to any activity you still want to do.
            </p>
          </Section>

          <Section title="Holds, not bookings">
            <p>
              Activities you add here are <strong className="font-medium text-charcoal">held, not booked</strong>.
              Nothing is confirmed, and nothing is paid, until you attend your resort visit and pay for the activities
              in person that same morning, at the resort. Your resort visit must come first — activities cannot be done
              earlier in your stay and the visit attended later.
            </p>
            <p>
              We do not hold inventory or guarantee a specific departure time. We confirm the day and time with you
              once your visit is booked, subject to the operator&rsquo;s availability.
            </p>
          </Section>

          <Section title="Booking requirements">
            <ul className="list-inside list-disc space-y-1">
              <li>Bookings must be made at least 48 hours in advance</li>
              <li>Valid photo identification is required at check-in</li>
              <li>Married guests attend the resort visit together</li>
              <li>Minimum ages and weight limits are set by each operator and shown on the activity</li>
              <li>Subject to availability</li>
            </ul>
          </Section>

          <Section title="Cancellation">
            <p>
              Nothing is charged online, so there is never anything to refund. If you need to cancel, just let us know
              — we ask for 48 hours so we can offer the slot to someone else. A late cancellation or no-show simply
              releases the reservation and the activities held with it, and the operator&rsquo;s standard public rate
              would apply if you still wanted to go.
            </p>
          </Section>

          <Section title="Payments and fees paid on site">
            <ul className="list-inside list-disc space-y-1">
              <li>No payment is taken on this website, at any point</li>
              <li>Activities are paid in person, on the morning of your resort visit</li>
              <li>
                Some activities carry mandatory fees paid directly to the operator at the gate — park and dock
                entrances, ATV damage waivers, equipment rental. These are shown on the activity and are not included
                in our price
              </li>
              <li>Prices are in US dollars and may change without notice</li>
              <li>Gratuities are not included and are at your discretion</li>
            </ul>
          </Section>

          <Section title="Activity rules and assumption of risk">
            <p>
              Activities are operated by independent partners, and their rules apply on the day — including safety
              briefings, age and weight limits, and restrictions on cameras or personal items. Many of these activities
              carry inherent risk, including water activities, off-road vehicles, animal encounters and diving.
            </p>
            <p>
              By participating you acknowledge and assume those risks. Cabo Deals arranges these activities and is not
              the operator; we are not liable for injuries, damages or losses incurred during an activity or at a
              partner resort.
            </p>
          </Section>

          <Section title="Weather">
            <p>
              Activities may be suspended or cancelled by the operator for safety reasons. Because nothing has been
              paid, there is nothing to refund — we will work with you to reschedule where availability allows.
            </p>
          </Section>

          <Section title="Photography and marketing">
            <p>
              By joining a resort visit or activity, you consent to being photographed or filmed for marketing
              purposes. These images may be used on our website, in marketing materials and on social media.
            </p>
          </Section>

          <Section title="Your information">
            <p>
              We collect the details you give us to arrange your resort visit and activities, and to contact you about
              them. If you opt in, we may text you about your booking; reply STOP to opt out at any time.
            </p>
          </Section>

          <Section title="Intellectual property">
            <p>
              All content on this website, including text, images, logos and designs, is the property of Cabo Deals and
              is protected by copyright and trademark law.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These Terms are governed by the laws of Mexico. Any disputes will be resolved in the appropriate courts
              of Baja California Sur, Mexico.
            </p>
          </Section>

          <Section title="Changes to these Terms">
            <p>
              We may modify these Terms at any time. Changes take effect when posted on this website.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these Terms: call or text{" "}
              <a href="tel:+16195667577" className="underline underline-offset-4 hover:text-charcoal">
                +1 (619) 566-7577
              </a>
              , or find us at cabodeals.mx. Los Cabos, Baja California Sur, Mexico.
            </p>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 border-t border-ink/10 pt-6">
      <h2 className="font-heading text-2xl font-light text-charcoal">{title}</h2>
      <div className="mt-3 space-y-3 font-light leading-relaxed text-charcoal/80">{children}</div>
    </section>
  )
}
