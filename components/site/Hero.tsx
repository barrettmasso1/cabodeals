/**
 * Hero copy is brief §7, verbatim. The background video is the one the live site already
 * serves from the GHL media bucket.
 */
const HERO_VIDEO = "https://storage.googleapis.com/msgsndr/U3n8dRDsSZeqRHzv2q4c/media/68716976556bb06e6aadf494.mp4"

export function Hero() {
  return (
    <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-ink md:min-h-[620px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-28 text-center text-white md:pb-20 md:pt-32">
        <h1 className="font-heading text-[2.25rem] font-extralight leading-[1.15] md:text-[3.25rem]">
          Do everything in Cabo.
          <br />
          <span className="italic">Pay what locals pay.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-relaxed text-white/85 md:text-lg">
          Insider pricing on Cabo&rsquo;s best adventures — for your whole stay. Join us for breakfast and a 90-minute
          look at a partner resort, and the prices are yours.
        </p>
        <a
          href="#activities"
          className="mt-8 inline-block bg-sand px-8 py-4 font-sans text-sm uppercase tracking-wider text-slate shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:bg-sand-dark md:text-base"
        >
          Build your trip
        </a>
        <p className="mt-4 text-xs font-light text-white/70">
          Nothing is charged online. You pay at the resort, the morning of your visit.
        </p>
      </div>
    </section>
  )
}
