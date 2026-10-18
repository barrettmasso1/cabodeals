import type {
  Country,
  CreditCards,
  Gender,
  HandicapProofType,
  MaritalStatus,
  OwnClubs,
  PayingWith,
  TeeWindow,
  VisitWindow,
} from "@/lib/qualify"

type Opt<T> = { value: T; label: string }

export const PAYING_WITH: Opt<PayingWith>[] = [
  { value: "cash_card", label: "Cash or card" },
  { value: "timeshare_points", label: "Timeshare points" },
  { value: "hotel_points", label: "Hotel or credit card points" },
  { value: "comped", label: "Comped / gifted" },
]

export const COUNTRIES: Opt<Country>[] = [
  { value: "US", label: "USA" },
  { value: "CA", label: "Canada" },
  { value: "MX", label: "Mexico" },
  { value: "Other", label: "Other" },
]

export const MARITAL: Opt<MaritalStatus>[] = [
  { value: "married", label: "Married" },
  { value: "partnered", label: "In a relationship" },
  { value: "single", label: "Single" },
]

export const GENDER: Opt<Gender>[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
]

export const CREDIT_CARDS: Opt<CreditCards>[] = [
  { value: "1", label: "1" },
  { value: "2plus", label: "2 or more" },
]

export const OWN_CLUBS: Opt<OwnClubs>[] = [
  { value: "all", label: "Yes, everyone" },
  { value: "some", label: "Some of us" },
  { value: "none", label: "No, we'll rent" },
]

export const TEE_WINDOWS: Opt<TeeWindow>[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "no_preference", label: "No preference" },
]

export const PROOF_TYPES: Opt<HandicapProofType>[] = [
  { value: "ghin", label: "GHIN" },
  { value: "app_screenshot", label: "Golf app" },
  { value: "club_membership", label: "Club membership" },
]

export const VISIT_WINDOWS: Opt<VisitWindow>[] = [
  { value: "first_party", label: "Early (around 8:00 AM)" },
  { value: "second_party", label: "Later (around 10:45 AM)" },
  { value: "flexible", label: "Either works" },
]

export const US_STATES: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"],
  ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
  ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
]

// Codes matter: the Quebec block in qualify() matches "QC".
export const CA_PROVINCES: [string, string][] = [
  ["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"], ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"], ["NS", "Nova Scotia"], ["NT", "Northwest Territories"],
  ["NU", "Nunavut"], ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"],
  ["SK", "Saskatchewan"], ["YT", "Yukon"],
]
