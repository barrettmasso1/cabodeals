"use client"

import { useHeroVideo } from "@/lib/useHeroVideo"

/**
 * Hero copy is brief §7, verbatim.
 *
 * The background video is 10.74MB — 1280x720, 30s, about 3 Mbps, which is roughly twice the
 * bitrate this footage needs. It is decoration: the poster is a frame from the video itself, so
 * the hero looks right whether or not the video ever arrives. Phones, metered or slow
 * connections and reduced-motion visitors keep the still and request no video at all.
 *
 * The headline sits on its own scrim, so it is legible against the poster, the video, or a
 * blank background if both fail.
 */
const HERO_VIDEO = "https://storage.googleapis.com/msgsndr/U3n8dRDsSZeqRHzv2q4c/media/68716976556bb06e6aadf494.mp4"
/** A real frame from the video (1280x720, 119KB), served from this repo so it paints at once. */
const HERO_POSTER = "/images/hero-poster.jpg"

export function Hero() {
  const videoAllowed = useHeroVideo()

  return (
    <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-ink md:min-h-[620px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain <img> so it paints before hydration */}
      <img src={HERO_POSTER} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />

      {videoAllowed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        />
      )}

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
