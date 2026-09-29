import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-grid items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" aria-label="Cabo Deals">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo still served by the old site */}
          <img src="https://www.cabodeals.mx/images/cabo-deals-logo.png" alt="Cabo Deals" className="h-8 w-auto md:h-9" />
        </Link>
        <nav className="flex items-center gap-5 text-xs uppercase tracking-wider text-white/90 md:gap-7 md:text-sm">
          <a href="#activities" className="transition hover:text-white">
            Activities
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
        </nav>
      </div>
    </header>
  )
}
