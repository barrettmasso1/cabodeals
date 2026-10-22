import Link from "next/link"
import { Wordmark } from "./Wordmark"

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-grid items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" aria-label="Cabo Deals" className="text-white">
          <Wordmark className="w-[132px] md:w-[150px]" />
        </Link>
        {/* The wordmark plus three links does not fit a phone; the hero CTA is the action there. */}
        <nav className="hidden items-center gap-5 text-xs uppercase tracking-wider text-white/90 sm:flex md:gap-7 md:text-sm">
          <a href="#activities" className="transition hover:text-white">
            Activities
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <Link href="/faq" className="transition hover:text-white">
            Questions
          </Link>
        </nav>
      </div>
    </header>
  )
}
