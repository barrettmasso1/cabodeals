/** Brief §4 / §8: always visible above the form. Not collapsible. Not in an accordion. */
export function Disclosure({ rewardPhrase }: { rewardPhrase: string }) {
  return (
    <aside
      aria-label="How this works"
      className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 md:p-6 text-gray-800"
    >
      <p className="font-heading text-lg md:text-xl text-gray-900">Here&apos;s exactly how this works.</p>
      <p className="mt-2 font-light leading-relaxed">
        We pick you up, you have a full breakfast at the resort, and someone walks you around the property. About 90
        minutes, start to finish. It&apos;s low-key — no pressure, no hard sell. That&apos;s it, and that&apos;s what
        gets you {rewardPhrase}.
      </p>
    </aside>
  )
}
