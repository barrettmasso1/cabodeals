// Date-only helpers. All values are local calendar dates as "yyyy-mm-dd".

const pad = (n: number) => String(n).padStart(2, "0")

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayIso(): string {
  return isoDate(new Date())
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  return isoDate(new Date(y, m - 1, d + days))
}

export function daysBetween(fromIso: string, toIso: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(toIso) - toUtc(fromIso)) / 86400000)
}

const maxIso = (a: string, b: string) => (a > b ? a : b)

/** Nights left in the stay, counted from today (or check-in, if the trip hasn't started). */
export function nightsRemaining(checkIn: string, checkOut: string, today = todayIso()): number {
  if (!checkIn || !checkOut) return 0
  return Math.max(0, daysBetween(maxIso(today, checkIn), checkOut))
}

/** Visits are mornings: earliest is tomorrow (or check-in), latest the day before check-out. */
export function visitDateRange(checkIn: string, checkOut: string, today = todayIso()) {
  return {
    min: maxIso(addDays(today, 1), checkIn),
    max: checkOut ? addDays(checkOut, -1) : "",
  }
}

export function ageOn(dob: string, today = todayIso()): number {
  const [by, bm, bd] = dob.split("-").map(Number)
  const [ty, tm, td] = today.split("-").map(Number)
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

export function formatDate(iso: string): string {
  if (!iso) return ""
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}
