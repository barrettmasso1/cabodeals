// Where the guest is staying → hotelId, hotelName, isRental and every hotel flag.
//
// Precedence: a listed property always wins. A rental inside a resort on our lists is that
// resort to the buyer, so its flags come from the property's entry and the nightly rate is
// ignored for tiering. Rate-derived flags apply only to standalone rentals and unlisted hotels.

import {
  hotelFlags,
  isListedProperty,
  isRentalHotel,
  UNLISTED_HOTEL_ID,
  type HotelFlags,
} from "@/lib/hotels"

export type LodgingInput = {
  /** First typeahead: a listed property, a rental category (isRental in hotels.json), UNLISTED_HOTEL_ID, or "". */
  lodgingId: string
  /** Canonical name of that pick, or what the guest typed when unlisted. */
  lodgingName: string
  /** Rentals only: "Is your rental inside a resort or hotel?" */
  rentalInsideProperty: boolean | null
  /** Rentals inside a property: a listed property, UNLISTED_HOTEL_ID, or "". */
  rentalPropertyId: string
  /** Canonical name of that property, or what the guest typed when unlisted. */
  rentalAtProperty: string
  nightlyRate: number | null
}

export type ResolvedLodging = HotelFlags & {
  hotelId: string
  hotelName: string
  isRental: boolean
  /** An unlisted hotel, or a rental inside an unlisted property. */
  propertyUnlisted: boolean
  /** Flags came from nightlyRate rather than a property entry. */
  rateDerived: boolean
}

export const NO_HOTEL_FLAGS: HotelFlags = {
  hotelTierSolmar: null,
  hotelSolmarGolferTier: null,
  hotelSolmarImOk: false,
  hotelQuestroOk: false,
  hotelQuestro5Star: false,
  hotelDiamanteOk: false,
  hotelListaDosOk: false,
  hotelVgOk: false,
}

export const isRentalPick = (i: Pick<LodgingInput, "lodgingId">) => isRentalHotel(i.lodgingId)
export const isUnlistedPick = (i: Pick<LodgingInput, "lodgingId">) => i.lodgingId === UNLISTED_HOTEL_ID

/** The rate question shows for rentals and unlisted hotels. */
export const asksNightlyRate = (i: Pick<LodgingInput, "lodgingId">) => isRentalPick(i) || isUnlistedPick(i)

export function resolveLodging(i: LodgingInput): ResolvedLodging {
  const isRental = isRentalPick(i)
  const insideProperty = isRental && i.rentalInsideProperty === true

  // 1. Rental inside a listed property → that property, rate ignored.
  if (insideProperty && isListedProperty(i.rentalPropertyId)) {
    return {
      ...(hotelFlags(i.rentalPropertyId, null) ?? NO_HOTEL_FLAGS),
      hotelId: i.rentalPropertyId,
      hotelName: i.rentalAtProperty,
      isRental,
      propertyUnlisted: false,
      rateDerived: false,
    }
  }

  // 2. Standalone rental or private residence (or inside a property we don't list) →
  //    rate-derived from that category's own rateRules.
  if (isRental) {
    return {
      ...(hotelFlags(i.lodgingId, i.nightlyRate) ?? NO_HOTEL_FLAGS),
      hotelId: i.lodgingId,
      hotelName: i.lodgingName,
      isRental,
      propertyUnlisted: insideProperty && i.rentalPropertyId === UNLISTED_HOTEL_ID,
      rateDerived: true,
    }
  }

  // 3. Unlisted hotel → rate-derived.
  if (isUnlistedPick(i)) {
    return {
      ...(hotelFlags(UNLISTED_HOTEL_ID, i.nightlyRate) ?? NO_HOTEL_FLAGS),
      hotelId: UNLISTED_HOTEL_ID,
      hotelName: i.lodgingName,
      isRental,
      propertyUnlisted: true,
      rateDerived: true,
    }
  }

  // 4. Listed hotel (or nothing picked yet).
  const flags = i.lodgingId ? hotelFlags(i.lodgingId, null) : null
  return {
    ...(flags ?? NO_HOTEL_FLAGS),
    hotelId: flags ? i.lodgingId : "",
    hotelName: flags ? i.lodgingName : "",
    isRental,
    propertyUnlisted: false,
    rateDerived: false,
  }
}
