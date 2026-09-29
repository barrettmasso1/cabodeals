import { UNLISTED_HOTEL_ID } from "@/lib/hotels"
import { asksNightlyRate, isRentalPick, isUnlistedPick } from "./lodging"
import { ageOn, todayIso, visitDateRange } from "./dates"
import type { FormState } from "./types"

export type SectionId = "contact" | "trip" | "group" | "product" | "visit"
export type Errors = Record<string, string>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** GHL holds two adults — the couple attending the visit. Larger groups only report the first two. */
export const MAX_DETAIL_ADULTS = 2

export const detailAdults = (s: FormState) => s.adults.slice(0, Math.min(s.totalAdults, MAX_DETAIL_ADULTS))

export const anyMarried = (s: FormState) => detailAdults(s).some((a) => a.maritalStatus === "married")

export const needsStateSelect = (s: FormState) => s.country === "US" || s.country === "CA"

function contact(s: FormState): Errors {
  const e: Errors = {}
  if (!s.firstName.trim()) e.firstName = "First name, please."
  if (!s.lastName.trim()) e.lastName = "Last name, please."
  if (!EMAIL.test(s.email.trim())) e.email = "That email doesn't look right."
  if (s.phone.replace(/\D/g, "").length < 10) e.phone = "Include the full number with area code."
  return e
}

function trip(s: FormState): Errors {
  const e: Errors = {}
  const today = todayIso()
  if (!s.lodgingId) e.lodgingId = "Pick your hotel from the list."
  if (isUnlistedPick(s) && !s.lodgingName.trim()) e.lodgingName = "What's the name of your hotel?"
  if (isRentalPick(s)) {
    if (s.rentalInsideProperty === null) e.rentalInsideProperty = "Choose one."
    if (s.rentalInsideProperty && !s.rentalPropertyId) e.rentalPropertyId = "Pick the resort or hotel from the list."
    if (s.rentalInsideProperty && s.rentalPropertyId === UNLISTED_HOTEL_ID && !s.rentalAtProperty.trim())
      e.rentalAtProperty = "What's the name of the resort or hotel?"
  }
  if (asksNightlyRate(s) && !(s.nightlyRate && s.nightlyRate > 0)) e.nightlyRate = "A rough number is fine."
  if (!s.checkIn) e.checkIn = "When did you (or will you) arrive?"
  if (!s.checkOut) e.checkOut = "When do you head home?"
  else if (s.checkOut <= today) e.checkOut = "Check-out needs to be after today."
  else if (s.checkIn && s.checkOut <= s.checkIn) e.checkOut = "Check-out needs to be after check-in."
  if (!s.payingWith) e.payingWith = "Choose one."
  if (s.stayingAsGuestOfOwner === null) e.stayingAsGuestOfOwner = "Choose one."
  if (s.purchasedAtResortThisTrip === null) e.purchasedAtResortThisTrip = "Choose one."
  if (!s.country) e.country = "Choose one."
  if (needsStateSelect(s) && !s.stateProvince) e.stateProvince = "Choose one."
  return e
}

function group(s: FormState): Errors {
  const e: Errors = {}
  const today = todayIso()
  detailAdults(s).forEach((a, i) => {
    const p = `adults.${i}.`
    if (!a.firstName.trim()) e[p + "firstName"] = "First name, please."
    if (!a.lastName.trim()) e[p + "lastName"] = "Last name, please."
    if (!a.dateOfBirth) e[p + "dateOfBirth"] = "Date of birth, please."
    else {
      const age = ageOn(a.dateOfBirth, today)
      if (age < 18 || age > 110) e[p + "dateOfBirth"] = "Double-check this date."
    }
    if (!a.maritalStatus) e[p + "maritalStatus"] = "Choose one."
    if (!a.gender) e[p + "gender"] = "Choose one."
  })
  if (anyMarried(s)) {
    if (s.spouseAttending === null) e.spouseAttending = "Please let us know."
    else if (s.spouseAttending && s.totalAdults < 2) e.spouseAttending = "Add your spouse as a second adult above."
  }
  if (s.ownsTimeshare === null) e.ownsTimeshare = "Choose one."
  if (s.ownsTimeshare && !s.timeshareWhere.trim()) e.timeshareWhere = "Where is it?"
  if (!s.creditCards) e.creditCards = "Choose one."
  return e
}

function product(s: FormState): Errors {
  const e: Errors = {}
  if (s.hook !== "golf") return e
  if (!s.ownClubs) e.ownClubs = "Choose one."
  if (!s.preferredTeeWindow) e.preferredTeeWindow = "Choose one."
  if (s.product === "private_club" && s.hasHandicapProof === null) e.hasHandicapProof = "Choose one."
  if (s.product === "private_club" && s.hasHandicapProof && !s.handicapProofType)
    e.handicapProofType = "What kind of proof do you have?"
  return e
}

function visit(s: FormState): Errors {
  const e: Errors = {}
  const { min, max } = visitDateRange(s.checkIn, s.checkOut)
  if (!s.preferredVisitDate) e.preferredVisitDate = "Pick a morning."
  else if (s.preferredVisitDate < min || s.preferredVisitDate > max)
    e.preferredVisitDate = "Pick a morning during your stay, starting tomorrow."
  if (!s.preferredWindow) e.preferredWindow = "Choose one."
  if (s.transportNeeded === null) e.transportNeeded = "Choose one."
  if (s.transportNeeded && !s.pickupAddress.trim()) e.pickupAddress = "Where should we pick you up?"
  return e
}

export const VALIDATORS: Record<SectionId, (s: FormState) => Errors> = { contact, trip, group, product, visit }
