/** Three steps — brief §7, verbatim. */
const STEPS = [
  {
    title: "Build your trip.",
    body: "Add whatever you want — ATVs, snorkeling, sunset cruises, camels. Watch your savings add up.",
  },
  {
    title: "Book your resort visit.",
    body: "Breakfast, a 90-minute look around a partner property, transportation both ways. No pressure, no hard sell.",
  },
  {
    title: "Lock it in.",
    body: "Pay for your activities that morning at the resort, and your prices are yours for the rest of your stay.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-[#FAFAF8] px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-grid">
        <h2 className="text-center font-heading text-[2.25rem] font-light leading-tight tracking-tight text-charcoal md:text-[3rem]">
          How it works
        </h2>
        <ol className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="text-center md:text-left">
              <span className="font-heading text-3xl font-extralight text-gold">{i + 1}</span>
              <h3 className="mt-2 font-heading text-[22px] font-normal text-charcoal">{step.title}</h3>
              <p className="mt-2 text-base font-light leading-relaxed text-charcoal/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
