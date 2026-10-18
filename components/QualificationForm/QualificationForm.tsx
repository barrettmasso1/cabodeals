"use client"

// <QualificationForm /> — brief §4.
// Mirrored in the cabodeals.mx repo (components/QualificationForm/). Keep the payload
// contract byte-identical between the two; edit both copies together.

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { HOTELS, isRentalHotel, RENTAL_HOTEL_ID, RENTAL_HOTEL_IDS, UNLISTED_HOTEL_ID } from "@/lib/hotels"
import type { Adult } from "@/lib/qualify"
import { cn } from "@/lib/utils"
import { EMPTY_ATTRIBUTION, readAttribution } from "./attribution"
import { formatDate, todayIso, visitDateRange } from "./dates"
import { Disclosure } from "./Disclosure"
import { Choice, Field, inputClass, PrimaryButton, Section, Stepper, YesNo } from "./fields"
import { HotelTypeahead } from "./HotelTypeahead"
import { asksNightlyRate, isRentalPick, isUnlistedPick, NO_HOTEL_FLAGS, resolveLodging, type LodgingInput } from "./lodging"
import * as O from "./options"
import { buildSubmission, postLead, toPartialPayload, type LeadPayload } from "./payload"
import { itemSavings, RailSummary, RightRail } from "./RightRail"
import { track } from "./tracking"
import type { Attribution, FormState, QualificationFormProps } from "./types"
import { anyAttached, MAX_DETAIL_ADULTS, needsStateSelect, VALIDATORS, type Errors, type SectionId } from "./validate"

const EMPTY_ADULT: Adult = { firstName: "", lastName: "", dateOfBirth: "", maritalStatus: "", gender: "" }

const UNLISTED_LABEL = "My hotel isn't listed"

/** Every lodging change goes through here so hotelId, isRental and the flags never drift. */
function withLodging(s: FormState, patch: Partial<LodgingInput>): FormState {
  const next = { ...s, ...patch }
  const { propertyUnlisted: _u, rateDerived: _r, ...resolved } = resolveLodging(next)
  return { ...next, ...resolved }
}

const parseRate = (v: string): number | null => {
  const n = Math.round(Number(v.replace(/[^0-9.]/g, "")))
  return v.trim() && Number.isFinite(n) ? n : null
}

function initialState(p: QualificationFormProps, savingsTotal: number): FormState {
  return {
    brand: p.brand,
    hook: p.hook,
    product: p.product,
    course: p.course ?? null,
    market: p.market,

    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    smsConsent: true,

    lodgingId: "",
    lodgingName: "",
    rentalInsideProperty: null,
    rentalPropertyId: "",
    rentalAtProperty: "",
    nightlyRate: null,
    hotelName: "",
    hotelId: "",
    ...NO_HOTEL_FLAGS,
    roomNumber: "",
    isRental: false,
    checkIn: "",
    checkOut: "",
    payingWith: "",
    purchasedAtResortThisTrip: null,
    country: "",
    stateProvince: "",

    adults: [{ ...EMPTY_ADULT }, { ...EMPTY_ADULT }],
    totalAdults: 2,
    totalChildren: 0,
    spouseAttending: null,
    ownsTimeshare: null,
    timeshareWhere: "",
    creditCards: "",

    ownClubs: null,
    rentalSetsNeeded: 0,
    ridersCount: 0,
    hasHandicapProof: null,
    handicapProofType: null,
    handicapProofUrl: null,
    roundsPerMonth: 0,
    preferredTeeWindow: null,

    cartItems: p.offer.kind === "activities" ? p.offer.items : [],
    cartSavingsTotal: savingsTotal,

    preferredVisitDate: "",
    preferredWindow: null,
    transportNeeded: null,
    pickupAddress: "",
  }
}

export function QualificationForm(props: QualificationFormProps) {
  const { hook, product, offer, endpoint = "/api/lead", send, onComplete } = props

  const savingsTotal = useMemo(
    () => (offer.kind === "activities" ? offer.savingsTotal ?? offer.items.reduce((t, i) => t + itemSavings(i), 0) : 0),
    [offer],
  )
  const rewardPhrase = props.rewardPhrase ?? (offer.kind === "golf" ? `the $${offer.price} round` : "these prices")

  const sections: SectionId[] = hook === "golf" ? ["contact", "trip", "group", "product", "visit"] : ["contact", "trip", "group", "visit"]

  const [s, setS] = useState<FormState>(() => initialState(props, savingsTotal))
  const [revealed, setRevealed] = useState(1)
  const [attempted, setAttempted] = useState<Set<SectionId>>(new Set())
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const attribution = useRef<Attribution>(EMPTY_ATTRIBUTION)
  const fired = useRef(new Set<string>())
  const sectionEls = useRef<(HTMLElement | null)[]>([])

  const set = (patch: Partial<FormState>) => setS((prev) => ({ ...prev, ...patch }))
  const setLodging = (patch: Partial<LodgingInput>) => setS((prev) => withLodging(prev, patch))
  const setAdult = (i: number, patch: Partial<Adult>) =>
    setS((prev) => ({ ...prev, adults: prev.adults.map((a, j) => (j === i ? { ...a, ...patch } : a)) }))

  const fireOnce = (event: Parameters<typeof track>[0], params: Record<string, unknown>) => {
    if (fired.current.has(event)) return
    fired.current.add(event)
    track(event, params)
  }

  const deliver = (payload: LeadPayload) => (send ? send(payload) : postLead(payload, endpoint))

  const eventBase = { brand: s.brand, hook, product, course: s.course, market: s.market, cartSavingsTotal: s.cartSavingsTotal }

  useEffect(() => {
    attribution.current = readAttribution()
    fireOnce("booking_start", eventBase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Errors are derived, so they clear as soon as the guest fixes a field.
  const errors: Errors = useMemo(() => {
    const all: Errors = {}
    attempted.forEach((id) => Object.assign(all, VALIDATORS[id](s)))
    return all
  }, [attempted, s])

  const scrollToFirstError = () =>
    requestAnimationFrame(() =>
      document.querySelector("[data-qf] [data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }),
    )

  const continueFrom = (index: number) => {
    const id = sections[index]
    setAttempted((a) => new Set(a).add(id))
    if (Object.keys(VALIDATORS[id](s)).length) return scrollToFirstError()

    if (id === "contact") {
      fireOnce("lead", eventBase)
      // Partial lead: retargetable in GHL even if they abandon now. Never blocks the form.
      if (!fired.current.has("partial_post")) {
        fired.current.add("partial_post")
        deliver(toPartialPayload(s, attribution.current)).catch((err) =>
          console.error("[QualificationForm] step-1 post failed", err),
        )
      }
      // Pre-fill the first adult from the contact they just gave us.
      if (!s.adults[0].firstName && !s.adults[0].lastName) setAdult(0, { firstName: s.firstName.trim(), lastName: s.lastName.trim() })
    }
    if (id === "group") fireOnce("qualification_complete", eventBase)

    const next = index + 1
    setRevealed((r) => Math.max(r, next + 1))
    requestAnimationFrame(() => sectionEls.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  const submit = async () => {
    setAttempted(new Set(sections))
    const firstBad = sections.findIndex((id) => Object.keys(VALIDATORS[id](s)).length)
    if (firstBad !== -1) return scrollToFirstError()

    setStatus("submitting")
    const result = buildSubmission(s, attribution.current)
    const { qualification } = result

    try {
      await deliver(result.payload)
    } catch (err) {
      console.error("[QualificationForm] submit failed", err)
      setStatus("error")
      return
    }

    fireOnce("booking_complete", {
      ...eventBase,
      assignedBuyer: qualification.assignedBuyer,
      expectedGrossPay: qualification.expectedGrossPay,
      qualificationState: qualification.qualificationState,
    })
    onComplete(result)
  }

  const today = todayIso()
  const visitRange = visitDateRange(s.checkIn, s.checkOut, today)
  const attached = anyAttached(s)
  const detailCount = Math.min(s.totalAdults, MAX_DETAIL_ADULTS)
  const golf = offer.kind === "golf" ? offer : null
  const rental = isRentalPick(s)
  const insideProperty = rental && s.rentalInsideProperty === true
  const standaloneRental = isRentalHotel(s.hotelId)

  const continueButton = (index: number) =>
    index === revealed - 1 && index < sections.length - 1 ? (
      <div className="pt-2">
        <PrimaryButton type="button" onClick={() => continueFrom(index)}>
          Continue <ArrowRight className="h-4 w-4" aria-hidden />
        </PrimaryButton>
      </div>
    ) : null

  const renderSection = (id: SectionId, index: number) => {
    const ref = (el: HTMLElement | null) => {
      sectionEls.current[index] = el
    }
    const n = index + 1

    switch (id) {
      case "contact":
        return (
          <Section key={id} index={n} title="Your contact info" sectionRef={ref}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName}>
                {(a) => <input {...a} className={inputClass} autoComplete="given-name" value={s.firstName} onChange={(e) => set({ firstName: e.target.value })} />}
              </Field>
              <Field label="Last name" error={errors.lastName}>
                {(a) => <input {...a} className={inputClass} autoComplete="family-name" value={s.lastName} onChange={(e) => set({ lastName: e.target.value })} />}
              </Field>
            </div>
            <Field label="Email" error={errors.email}>
              {(a) => <input {...a} type="email" inputMode="email" className={inputClass} autoComplete="email" value={s.email} onChange={(e) => set({ email: e.target.value })} />}
            </Field>
            <Field label="Mobile phone" hint="We'll text your visit details here." error={errors.phone}>
              {(a) => <input {...a} type="tel" inputMode="tel" className={inputClass} autoComplete="tel" value={s.phone} onChange={(e) => set({ phone: e.target.value })} />}
            </Field>
            <label className="flex items-start gap-3 text-sm font-light text-gray-600">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 accent-gray-900"
                checked={s.smsConsent}
                onChange={(e) => set({ smsConsent: e.target.checked })}
              />
              <span>Text me about my booking. Msg &amp; data rates may apply. Reply STOP to opt out.</span>
            </label>
            {continueButton(index)}
          </Section>
        )

      case "trip":
        return (
          <Section key={id} index={n} title="Your trip" sectionRef={ref}>
            <HotelTypeahead
              label="Where are you staying?"
              selectedLabel={s.lodgingId ? (isUnlistedPick(s) ? UNLISTED_LABEL : HOTELS[s.lodgingId]?.name ?? null) : null}
              hint="Staying in an Airbnb or VRBO? Type “Airbnb”."
              error={errors.lodgingId}
              onSelect={(h) =>
                setLodging({ lodgingId: h?.id ?? "", lodgingName: h?.name ?? "", rentalInsideProperty: null, rentalPropertyId: "", rentalAtProperty: "" })
              }
              onUnlisted={() =>
                setLodging({ lodgingId: UNLISTED_HOTEL_ID, lodgingName: "", rentalInsideProperty: null, rentalPropertyId: "", rentalAtProperty: "" })
              }
            />
            {isUnlistedPick(s) && (
              <Field label="Hotel name" error={errors.lodgingName}>
                {(a) => <input {...a} className={inputClass} autoFocus value={s.lodgingName} onChange={(e) => setLodging({ lodgingName: e.target.value })} />}
              </Field>
            )}
            {rental && (
              <YesNo
                label={s.lodgingId === RENTAL_HOTEL_ID ? "Is your rental inside a resort or hotel?" : "Is the residence inside a resort or hotel?"}
                hint="Lots of Cabo rentals are privately owned units inside a resort."
                value={s.rentalInsideProperty}
                error={errors.rentalInsideProperty}
                onChange={(v) => setLodging({ rentalInsideProperty: v, ...(v ? {} : { rentalPropertyId: "", rentalAtProperty: "" }) })}
              />
            )}
            {insideProperty && (
              <HotelTypeahead
                label="Which resort or hotel?"
                selectedLabel={s.rentalPropertyId ? (s.rentalPropertyId === UNLISTED_HOTEL_ID ? UNLISTED_LABEL : s.rentalAtProperty) : null}
                exclude={RENTAL_HOTEL_IDS}
                error={errors.rentalPropertyId}
                onSelect={(h) => setLodging({ rentalPropertyId: h?.id ?? "", rentalAtProperty: h?.name ?? "" })}
                onUnlisted={() => setLodging({ rentalPropertyId: UNLISTED_HOTEL_ID, rentalAtProperty: "" })}
              />
            )}
            {insideProperty && s.rentalPropertyId === UNLISTED_HOTEL_ID && (
              <Field label="Resort or hotel name" error={errors.rentalAtProperty}>
                {(a) => <input {...a} className={inputClass} autoFocus value={s.rentalAtProperty} onChange={(e) => setLodging({ rentalAtProperty: e.target.value })} />}
              </Field>
            )}
            {asksNightlyRate(s) && (
              <Field label="Roughly what are you paying per night?" hint="In US dollars. An estimate is fine." error={errors.nightlyRate}>
                {(a) => (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      {...a}
                      type="text"
                      inputMode="numeric"
                      className={cn(inputClass, "pl-8")}
                      value={s.nightlyRate ?? ""}
                      onChange={(e) => setLodging({ nightlyRate: parseRate(e.target.value) })}
                    />
                  </div>
                )}
              </Field>
            )}
            {(!rental || insideProperty) && (
              <Field label={rental ? "Unit number" : "Room number"} hint="Optional — helps our driver find you.">
                {(a) => <input {...a} className={inputClass} value={s.roomNumber} onChange={(e) => set({ roomNumber: e.target.value })} />}
              </Field>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Check-in" error={errors.checkIn}>
                {(a) => <input {...a} type="date" className={inputClass} value={s.checkIn} onChange={(e) => set({ checkIn: e.target.value })} />}
              </Field>
              <Field label="Check-out" error={errors.checkOut}>
                {(a) => (
                  <input {...a} type="date" className={inputClass} min={s.checkIn || today} value={s.checkOut} onChange={(e) => set({ checkOut: e.target.value })} />
                )}
              </Field>
            </div>
            <Choice label="How are you paying for your stay?" value={s.payingWith} options={O.PAYING_WITH} error={errors.payingWith} onChange={(v) => set({ payingWith: v })} />
            <YesNo
              label="Have you purchased real estate or a vacation ownership program on this trip?"
              value={s.purchasedAtResortThisTrip}
              error={errors.purchasedAtResortThisTrip}
              onChange={(v) => set({ purchasedAtResortThisTrip: v })}
            />
            <Choice label="Where do you live?" columns={4} value={s.country} options={O.COUNTRIES} error={errors.country} onChange={(v) => set({ country: v, stateProvince: "" })} />
            {needsStateSelect(s) && (
              <Field label={s.country === "CA" ? "Province" : "State"} error={errors.stateProvince}>
                {(a) => (
                  <select {...a} className={inputClass} value={s.stateProvince} onChange={(e) => set({ stateProvince: e.target.value })}>
                    <option value="">Select…</option>
                    {(s.country === "CA" ? O.CA_PROVINCES : O.US_STATES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}
            {(s.country === "MX" || s.country === "Other") && (
              <Field label="State / province / region" hint="Optional">
                {(a) => <input {...a} className={inputClass} value={s.stateProvince} onChange={(e) => set({ stateProvince: e.target.value })} />}
              </Field>
            )}
            {continueButton(index)}
          </Section>
        )

      case "group":
        return (
          <Section
            key={id}
            index={n}
            title="Your group"
            sectionRef={ref}
            intro={s.totalAdults > MAX_DETAIL_ADULTS ? "Tell us about the two adults who'll come to the resort visit." : undefined}
          >
            <div className="grid grid-cols-2 gap-4">
              <Stepper label="Adults" min={1} max={12} value={s.totalAdults} onChange={(v) => set({ totalAdults: v })} />
              <Stepper label="Kids" max={12} value={s.totalChildren} onChange={(v) => set({ totalChildren: v })} />
            </div>

            {s.adults.slice(0, detailCount).map((adult, i) => {
              const e = (f: keyof Adult) => errors[`adults.${i}.${f}`]
              return (
                <div key={i} className="space-y-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{i === 0 ? "You" : "Second adult"}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name" error={e("firstName")}>
                      {(a) => <input {...a} className={inputClass} value={adult.firstName} onChange={(ev) => setAdult(i, { firstName: ev.target.value })} />}
                    </Field>
                    <Field label="Last name" error={e("lastName")}>
                      {(a) => <input {...a} className={inputClass} value={adult.lastName} onChange={(ev) => setAdult(i, { lastName: ev.target.value })} />}
                    </Field>
                  </div>
                  <Field label="Date of birth" error={e("dateOfBirth")}>
                    {(a) => (
                      <input {...a} type="date" className={inputClass} max={today} value={adult.dateOfBirth} onChange={(ev) => setAdult(i, { dateOfBirth: ev.target.value })} />
                    )}
                  </Field>
                  <Choice label="Marital status" columns={4} value={adult.maritalStatus} options={O.MARITAL} error={e("maritalStatus")} onChange={(v) => setAdult(i, { maritalStatus: v })} />
                  <Choice label="Gender" value={adult.gender} options={O.GENDER} error={e("gender")} onChange={(v) => setAdult(i, { gender: v })} />
                </div>
              )
            })}

            {attached && (
              <div
                className={cn(
                  "rounded-lg border-2 p-4",
                  errors.spouseAttending ? "border-red-300 bg-red-50" : "border-amber-400 bg-amber-50",
                )}
              >
                <YesNo
                  label="Will your spouse be joining you for the resort visit?"
                  hint="Both of you need to be there for the resort visit — that's what unlocks the pricing, and honestly it's better anyway since you'll both want a say."
                  value={s.spouseAttending}
                  error={errors.spouseAttending}
                  onChange={(v) => set({ spouseAttending: v })}
                />
              </div>
            )}

            <YesNo label="Do you own a timeshare or vacation club anywhere?" value={s.ownsTimeshare} error={errors.ownsTimeshare} onChange={(v) => set({ ownsTimeshare: v })} />
            {s.ownsTimeshare && (
              <Field label="Where?" error={errors.timeshareWhere}>
                {(a) => <input {...a} className={inputClass} placeholder="Resort or brand" value={s.timeshareWhere} onChange={(e) => set({ timeshareWhere: e.target.value })} />}
              </Field>
            )}
            <Choice
              label="How many major credit cards do you carry?"
              hint="Just so we match you with the right resort. We never ask for card numbers."
              value={s.creditCards}
              options={O.CREDIT_CARDS}
              error={errors.creditCards}
              onChange={(v) => set({ creditCards: v })}
            />
            {continueButton(index)}
          </Section>
        )

      case "product": {
        const maxPlayers = s.totalAdults + s.totalChildren
        return (
          <Section key={id} index={n} title="Your golf" sectionRef={ref}>
            <Choice label="Bringing your own clubs?" columns={3} value={s.ownClubs} options={O.OWN_CLUBS} error={errors.ownClubs} onChange={(v) => set({ ownClubs: v, rentalSetsNeeded: v === "all" ? 0 : s.rentalSetsNeeded })} />
            {s.ownClubs && s.ownClubs !== "all" && (
              <Stepper
                label="Rental sets needed"
                hint={golf?.rentalSetPrice ? `$${golf.rentalSetPrice} per set, paid at the course.` : undefined}
                max={maxPlayers}
                value={s.rentalSetsNeeded}
                onChange={(v) => set({ rentalSetsNeeded: v })}
              />
            )}
            <Stepper
              label="Non-golfers riding along"
              hint={golf?.riderPrice ? `$${golf.riderPrice} per rider, paid at the course.` : undefined}
              max={maxPlayers}
              value={s.ridersCount}
              onChange={(v) => set({ ridersCount: v })}
            />
            <Field label="Rounds you play per month, roughly">
              {(a) => (
                <input
                  {...a}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={31}
                  className={inputClass}
                  value={s.roundsPerMonth}
                  onChange={(e) => set({ roundsPerMonth: Math.max(0, Math.min(31, Math.floor(Number(e.target.value) || 0))) })}
                />
              )}
            </Field>
            <Choice
              label="Preferred tee time"
              hint="A preference, not a booking — we confirm the exact time with you."
              columns={3}
              value={s.preferredTeeWindow}
              options={O.TEE_WINDOWS}
              error={errors.preferredTeeWindow}
              onChange={(v) => set({ preferredTeeWindow: v })}
            />

            {product === "private_club" && (
              <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                <p className="font-light text-gray-700">
                  Diamante is a private club — they just need to see you&apos;re a golfer. Bring it on the day; a screenshot of your golf app works.
                </p>
                <YesNo label="Can you show a handicap or golf record?" value={s.hasHandicapProof} error={errors.hasHandicapProof} onChange={(v) => set({ hasHandicapProof: v })} />
                {s.hasHandicapProof && (
                  <Choice label="What kind?" columns={3} value={s.handicapProofType} options={O.PROOF_TYPES} error={errors.handicapProofType} onChange={(v) => set({ handicapProofType: v })} />
                )}
              </div>
            )}
            {continueButton(index)}
          </Section>
        )
      }

      case "visit":
        return (
          <Section
            key={id}
            index={n}
            title="Your resort visit"
            sectionRef={ref}
            intro="Breakfast and a walk around the property — about 90 minutes."
          >
            <Field
              label="Which morning works best?"
              hint={visitRange.max ? `Any morning from ${formatDate(visitRange.min)} to ${formatDate(visitRange.max)}.` : undefined}
              error={errors.preferredVisitDate}
            >
              {(a) => (
                <input
                  {...a}
                  type="date"
                  className={inputClass}
                  min={visitRange.min}
                  max={visitRange.max || undefined}
                  value={s.preferredVisitDate}
                  onChange={(e) => set({ preferredVisitDate: e.target.value })}
                />
              )}
            </Field>
            <Choice label="Earlier or later start?" columns={3} value={s.preferredWindow} options={O.VISIT_WINDOWS} error={errors.preferredWindow} onChange={(v) => set({ preferredWindow: v })} />
            <YesNo
              label="Would you like us to pick you up?"
              hint="Available for most visits — our concierge confirms it with you."
              value={s.transportNeeded}
              error={errors.transportNeeded}
              onChange={(v) =>
                set({
                  transportNeeded: v,
                  pickupAddress: v && !s.pickupAddress && !standaloneRental && s.hotelName.trim() ? [s.hotelName, s.roomNumber && `${s.isRental ? "unit" : "room"} ${s.roomNumber}`].filter(Boolean).join(", ") : s.pickupAddress,
                })
              }
            />
            {s.transportNeeded && (
              <Field label="Pickup address" hint={standaloneRental ? "The street address of your rental." : undefined} error={errors.pickupAddress}>
                {(a) => <input {...a} className={inputClass} autoComplete="street-address" value={s.pickupAddress} onChange={(e) => set({ pickupAddress: e.target.value })} />}
              </Field>
            )}

            <div className="space-y-3 pt-2">
              {status === "error" && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Something went wrong sending your details. Please try again.
                </p>
              )}
              <PrimaryButton type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
                  </>
                ) : (
                  <>
                    {hook === "golf" ? "Lock in my round" : "Lock in these prices"} <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </PrimaryButton>
              <p className="text-xs font-light text-gray-500">Nothing is charged online. You pay in person on the day.</p>
            </div>
          </Section>
        )
    }
  }

  return (
    <div data-qf className="mx-auto w-full max-w-5xl">
      <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <RailSummary offer={offer} savingsTotal={s.cartSavingsTotal} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <form
          noValidate
          className="space-y-4 md:space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Disclosure rewardPhrase={rewardPhrase} closing={props.disclosureClosing} />
          {sections.slice(0, revealed).map(renderSection)}
        </form>

        <div className="hidden lg:block">
          <div className="sticky top-6">
            <RightRail offer={offer} savingsTotal={s.cartSavingsTotal} />
          </div>
        </div>
      </div>
    </div>
  )
}
