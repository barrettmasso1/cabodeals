import Link from "next/link"
import { UnlockFlow } from "@/components/unlock/UnlockFlow"

export const metadata = {
  title: "Unlock your prices | Cabo Deals",
  robots: { index: false },
}

export default function UnlockPage() {
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
            Edit my trip
          </Link>
        </div>
      </header>
      <main>
        <UnlockFlow />
      </main>
    </>
  )
}
