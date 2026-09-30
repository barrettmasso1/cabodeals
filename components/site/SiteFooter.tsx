import Link from "next/link"

/** Minimal footer — mainly so the terms page is reachable from every page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-grid flex-col gap-4 text-sm font-light text-charcoal/60 md:flex-row md:items-center md:justify-between">
        <p>
          Cabo Deals · Los Cabos, Mexico ·{" "}
          <a href="tel:+16195667577" className="hover:text-charcoal">
            +1 (619) 566-7577
          </a>
        </p>
        <p className="flex items-center gap-4">
          <Link href="/terms-of-service" className="hover:text-charcoal">
            Terms of Service
          </Link>
          <span>Nothing is charged online.</span>
        </p>
      </div>
    </footer>
  )
}
