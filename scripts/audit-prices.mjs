/**
 * Brief §10: every listed price must be at or above our cost. Run after any price edit.
 *
 * Reads both files as text, so it needs no build step: data/activities.ts for the selling and
 * retail prices, data/activity-costs.ts for our cost. That second file is gitignored — this
 * repo is public — so a fresh clone must copy data/activity-costs.example.ts and fill it in.
 */
import { readFileSync } from "node:fs"

const read = (rel) => {
  try {
    return readFileSync(new URL(rel, import.meta.url), "utf8")
  } catch {
    return null
  }
}

const catalog = read("../data/activities.ts")
const costSrc = read("../data/activity-costs.ts")

if (!costSrc) {
  console.error("audit:prices — data/activity-costs.ts is missing. Copy data/activity-costs.example.ts and fill it in from the vendor list.")
  process.exit(2)
}

const costs = new Map(
  [...costSrc.matchAll(/"([^"]+)":\s*\{\s*cost:\s*(null|[\d.]+)/g)].map((m) => [m[1], m[2] === "null" ? null : Number(m[2])]),
)

const rows = [...catalog.matchAll(/\n {4}id: "([^"]+)",[\s\S]*?\n {4}image:/g)].map((m) => {
  const num = (k) => {
    const hit = m[0].match(new RegExp(`${k}: ([\\d.]+),`))
    return hit ? Number(hit[1]) : undefined
  }
  return { id: m[1], ourPrice: num("ourPrice"), publicPrice: num("publicPrice") }
})

if (!rows.length) {
  console.error("audit:prices — parsed no activities; check data/activities.ts")
  process.exit(2)
}

const problems = []
const margins = []
for (const r of rows) {
  if (!costs.has(r.id)) {
    problems.push(`${r.id}: no entry in data/activity-costs.ts`)
    continue
  }
  const cost = costs.get(r.id)
  if (cost === null) problems.push(`${r.id}: no vendor cost on file — price unverified`)
  else if (r.ourPrice < cost)
    problems.push(`${r.id}: sells at $${r.ourPrice}, costs $${cost} — $${(cost - r.ourPrice).toFixed(2)} per guest out of our pocket`)
  else margins.push(r.ourPrice - cost)
  if (r.publicPrice <= r.ourPrice) problems.push(`${r.id}: retail $${r.publicPrice} is not above our price $${r.ourPrice}`)
}
for (const id of costs.keys()) if (!rows.some((r) => r.id === id)) problems.push(`${id}: cost on file for an activity not in the catalog`)

console.log(`audit:prices — ${rows.length} activities checked`)
if (problems.length) {
  for (const p of problems) console.error("  ✗ " + p)
  process.exit(1)
}
console.log(`  ✓ all at or above cost — thinnest margin $${Math.min(...margins).toFixed(2)}`)
