"use client"

import type React from "react"
import { useId } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export const inputClass =
  "w-full h-12 px-4 border border-gray-200 rounded-lg bg-white font-light text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent aria-[invalid=true]:border-red-400"

type FieldProps = {
  label: string
  hint?: string
  error?: string
  className?: string
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={cn("space-y-1.5", className)} data-field-error={error ? true : undefined}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">
        {label}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm font-light text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type Option<T extends string> = { value: T; label: string }

/** Tap-friendly single choice. Renders as a radio group. */
export function Choice<T extends string>({
  label,
  hint,
  error,
  value,
  options,
  onChange,
  columns = 2,
  className,
}: {
  label: string
  hint?: string
  error?: string
  value: T | null | ""
  options: Option<T>[]
  onChange: (v: T) => void
  columns?: 2 | 3 | 4
  className?: string
}) {
  const id = useId()
  return (
    <fieldset className={cn("space-y-1.5", className)} data-field-error={error ? true : undefined}>
      <legend className="block text-sm font-medium text-gray-800 mb-1.5">{label}</legend>
      <div
        role="radiogroup"
        aria-invalid={!!error}
        className={cn(
          "grid gap-2",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((o) => {
          const selected = value === o.value
          return (
            <label
              key={o.value}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gray-900",
                selected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white font-light text-gray-800 hover:border-gray-400",
              )}
            >
              <input
                type="radio"
                name={id}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          )
        })}
      </div>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm font-light text-gray-500">{hint}</p>
      ) : null}
    </fieldset>
  )
}

export function YesNo({
  label,
  hint,
  error,
  value,
  onChange,
  className,
}: {
  label: string
  hint?: string
  error?: string
  value: boolean | null
  onChange: (v: boolean) => void
  className?: string
}) {
  return (
    <Choice
      label={label}
      hint={hint}
      error={error}
      className={className}
      value={value === null ? null : value ? "yes" : "no"}
      options={[
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ]}
      onChange={(v) => onChange(v === "yes")}
    />
  )
}

export function Stepper({
  label,
  hint,
  value,
  min = 0,
  max,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min?: number
  max: number
  onChange: (v: number) => void
}) {
  const id = useId()
  const btn =
    "flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 text-gray-800 hover:border-gray-400 disabled:opacity-40 disabled:hover:border-gray-200"
  return (
    <div className="space-y-1.5">
      <span id={id} className="block text-sm font-medium text-gray-800">
        {label}
      </span>
      <div className="flex items-center gap-3" role="group" aria-labelledby={id}>
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer — ${label}`}>
          <Minus className="h-4 w-4" />
        </button>
        <output aria-live="polite" className="w-8 text-center text-lg text-gray-900">
          {value}
        </output>
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More — ${label}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {hint && <p className="text-sm font-light text-gray-500">{hint}</p>}
    </div>
  )
}

export function Section({
  index,
  title,
  intro,
  children,
  sectionRef,
}: {
  index: number
  title: string
  intro?: React.ReactNode
  children: React.ReactNode
  sectionRef?: React.Ref<HTMLElement>
}) {
  return (
    <section
      ref={sectionRef}
      aria-labelledby={`qf-section-${index}`}
      className="scroll-mt-24 rounded-lg border border-gray-200 bg-white p-5 md:p-8"
    >
      <h3 id={`qf-section-${index}`} className="font-heading text-xl md:text-2xl font-light text-gray-900">
        <span className="mr-2 text-amber-500">{index}.</span>
        {title}
      </h3>
      {intro && <div className="mt-2 text-sm md:text-base font-light text-gray-600">{intro}</div>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  )
}

export function PrimaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 text-base font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60 md:w-auto",
        className,
      )}
    >
      {children}
    </button>
  )
}
