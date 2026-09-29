"use client"

import { useId, useMemo, useRef, useState } from "react"
import { Check, Search, X } from "lucide-react"
import { searchHotels } from "@/lib/hotels"
import { cn } from "@/lib/utils"
import { inputClass } from "./fields"

type Props = {
  label: string
  /** What's picked, as displayed — null shows the search box. */
  selectedLabel: string | null
  /** Hotel ids never offered (e.g. the rental entry when searching for a rental's resort). */
  exclude?: readonly string[]
  hint?: string
  error?: string
  onSelect: (hotel: { id: string; name: string } | null) => void
  /** "My hotel isn't listed" — the form then asks for the name as free text. */
  onUnlisted: () => void
}

/**
 * Local typeahead over data/hotels.json — names and aliases. The value is a canonical hotel
 * from the map, or the "isn't listed" escape hatch (always offered, so no guest dead-ends here).
 */
export function HotelTypeahead({ label, selectedLabel, exclude, hint, error, onSelect, onUnlisted }: Props) {
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const results = useMemo(() => searchHotels(query, 8, exclude), [query, exclude])
  // The last option is always "My hotel isn't listed".
  const optionCount = results.length + 1

  const choose = (i: number) => {
    const r = results[i]
    if (r) onSelect({ id: r.id, name: r.name })
    else onUnlisted()
    setQuery("")
    setOpen(false)
  }

  if (selectedLabel !== null) {
    return (
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-gray-900 bg-white px-4 py-2">
          <span className="flex items-center gap-2 text-gray-900">
            <Check className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            {selectedLabel}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 underline-offset-2 hover:underline"
            onClick={() => {
              onSelect(null)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
          >
            <X className="h-4 w-4" aria-hidden />
            Change
          </button>
        </div>
      </div>
    )
  }

  const showList = open && query.trim().length > 0

  return (
    <div className="space-y-1.5" data-field-error={error ? true : undefined}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          aria-invalid={!!error}
          placeholder="Start typing your hotel or resort"
          className={cn(inputClass, "pl-10")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!showList) return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, optionCount - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === "Enter") {
              e.preventDefault()
              choose(active)
            } else if (e.key === "Escape") {
              setOpen(false)
            }
          }}
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {results.length === 0 && (
              <li role="presentation" className="px-4 py-3 text-sm font-light text-gray-500">
                No match. Try a shorter name.
              </li>
            )}
            {results.map((r, i) => (
              <li
                key={r.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={cn("cursor-pointer px-4 py-3", i === active ? "bg-gray-100" : "hover:bg-gray-50")}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                <span className="block text-gray-900">{r.name}</span>
                {r.matchedAlias && <span className="block text-xs font-light text-gray-500">also known as {r.matchedAlias}</span>}
              </li>
            ))}
            <li
              id={`${listId}-${results.length}`}
              role="option"
              aria-selected={active === results.length}
              className={cn(
                "cursor-pointer border-t border-gray-100 px-4 py-3 text-gray-700",
                active === results.length ? "bg-gray-100" : "hover:bg-gray-50",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(results.length)}
              onClick={() => choose(results.length)}
            >
              My hotel isn&apos;t listed
            </li>
          </ul>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm font-light text-gray-500">
        {hint && <>{hint} </>}
        <button type="button" className="underline underline-offset-2 hover:text-gray-800" onClick={onUnlisted}>
          My hotel isn&apos;t listed
        </button>
      </p>
    </div>
  )
}
