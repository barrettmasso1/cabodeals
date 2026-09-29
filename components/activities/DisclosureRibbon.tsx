/**
 * Always visible, never dismissible (brief §5.2). A guest walked off a tour in July because
 * nobody told them there was a presentation — this is the first place we tell them.
 */
export function DisclosureRibbon() {
  return (
    <div className="border-y border-ink/10 bg-ink/[0.03] px-5 py-4 text-center md:py-5">
      <p className="mx-auto max-w-3xl text-sm font-light leading-relaxed text-charcoal/80 md:text-base">
        These are insider rates, available to guests who join us for breakfast and a 90-minute look at a partner
        resort. Build your trip below — <span className="text-charcoal">your prices lock in at your visit.</span>
      </p>
    </div>
  )
}
