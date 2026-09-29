/**
 * Copy to data/activity-costs.ts and fill in from the vendor list (the OPC rate column).
 * The real file is gitignored: this repo is public, and data/activities.ts — which does ship
 * to the browser — deliberately carries no cost data.
 *
 * One entry per id in data/activities.ts. `null` = no matching vendor row, which the audit
 * reports as a violation.
 */
export const ACTIVITY_COSTS: Record<string, { cost: number | null; vendor: string }> = {
  "luxury-cabo-sunset-cruise": { cost: 49.05, vendor: "Example Vendor" },
}
