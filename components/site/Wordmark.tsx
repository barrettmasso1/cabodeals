/**
 * The logo, as markup rather than an image.
 *
 * The old site hot-linked https://www.cabodeals.mx/images/cabo-deals-logo.png. That file went
 * away when the domain started serving this app, so every header was loading a 404 — which is
 * why no logo appeared. Drawing it here removes the dependency, keeps it crisp at any size,
 * and lets it take the colour of whatever it sits on.
 *
 * If you want the original PNG back, drop it at public/images/cabo-deals-logo.png and swap
 * this component for an <img src="/images/cabo-deals-logo.png">.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label="Cabo Deals" role="img">
      <span className="flex items-baseline gap-1.5">
        <span className="font-heading text-[1.35rem] font-normal tracking-[0.18em] md:text-2xl">CABO</span>
        <span className="font-sans text-sm font-light tracking-[0.06em] md:text-base">deals</span>
      </span>
      <svg viewBox="0 0 120 8" className="mt-0.5 h-1.5 w-full" fill="none" aria-hidden>
        <path d="M2 2.5c22 4 42 4.5 58 4.5s36-.5 58-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  )
}
