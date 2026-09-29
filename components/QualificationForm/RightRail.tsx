import { Check } from "lucide-react"
import type { CartItem } from "@/lib/qualify"
import type { Offer } from "./types"

const usd = (n: number) => `$${n.toLocaleString("en-US")}`

export const itemSavings = (i: CartItem) => (i.publicPrice - i.ourPrice) * (i.adults + i.children)

/** What they're getting — kept in view during qualification. */
export function RightRail({ offer, savingsTotal }: { offer: Offer; savingsTotal: number }) {
  if (offer.kind === "golf") {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
        <p className="text-xs uppercase tracking-widest text-amber-600">{offer.productName}</p>
        <p className="mt-1 font-heading text-xl text-gray-900">{offer.courseName}</p>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-3xl font-light text-gray-900">{usd(offer.price)}</span>
          <span className="text-sm text-gray-400 line-through">{offer.publicPrice}</span>
          {offer.discountLabel && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{offer.discountLabel}</span>
          )}
        </div>
        <p className="mt-1 text-xs font-light text-gray-500">per golfer · paid in person, nothing charged online</p>
        <ul className="mt-4 space-y-2">
          {offer.included.map((line) => (
            <li key={line} className="flex gap-2 text-sm font-light text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
      <p className="text-xs uppercase tracking-widest text-amber-600">Your trip</p>
      <ul className="mt-3 divide-y divide-gray-100">
        {offer.items.map((i) => (
          <li key={i.id} className="py-3">
            <p className="text-gray-900">{i.name}</p>
            <p className="mt-0.5 text-sm font-light text-gray-500">
              {i.adults} adult{i.adults === 1 ? "" : "s"}
              {i.children > 0 && ` · ${i.children} child${i.children === 1 ? "" : "ren"}`} · {usd(i.ourPrice)}{" "}
              <span className="line-through">{usd(i.publicPrice)}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-3">
        <span className="text-sm font-medium text-gray-800">You save</span>
        <span className="text-2xl font-light text-amber-600">{usd(savingsTotal)}</span>
      </div>
      <p className="mt-1 text-xs font-light text-gray-500">Paid in person. Scheduling happens with our concierge after your visit.</p>
    </div>
  )
}

/** Compact version pinned to the top on mobile so the reward never scrolls away. */
export function RailSummary({ offer, savingsTotal }: { offer: Offer; savingsTotal: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      {offer.kind === "golf" ? (
        <>
          <span className="truncate text-gray-800">{offer.courseName}</span>
          <span className="shrink-0">
            <span className="font-medium text-gray-900">{usd(offer.price)}</span>{" "}
            <span className="text-gray-400 line-through">{offer.publicPrice}</span>
          </span>
        </>
      ) : (
        <>
          <span className="text-gray-800">
            {offer.items.length} activit{offer.items.length === 1 ? "y" : "ies"} in your trip
          </span>
          <span className="shrink-0 font-medium text-amber-600">You save {usd(savingsTotal)}</span>
        </>
      )}
    </div>
  )
}
