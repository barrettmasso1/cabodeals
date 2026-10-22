# Buyer pay tables

What each buyer pays us per qualified lead. `lib/qualify.ts` reads these files;
the *eligibility* rules (age bands, hotel lists, credit cards, nights remaining)
live in code there, next to each buyer's function.

Mirrored in the cabodeals.mx repo — edit both copies together.

## Shape

```json
{
  "buyer": "solmar",
  "clubsBonus": 100,
  "tiers": {
    "A": { "pay": 600 }
  }
}
```

- `tiers.<tier>.pay` — base pay for that tier, in USD.
- `clubsBonus` (buyer level) — the default bonus when at least one guest brings
  their own clubs.
- `tiers.<tier>.clubsBonus` — overrides that default for one tier. **`0` means
  the tier earns no bonus.**

## The clubs bonus

```
expectedGrossPay = tiers[matchedTier].pay + (bringsOwnClubs ? clubsBonus : 0)
```

**"At least one guest brings their own clubs" means `ownClubs` is `all` or
`some`.** A couple where only one golfer brings clubs still earns the bonus.
`none` (or a non-golf lead, where `ownClubs` is null) earns no bonus.

Which tiers earn it (confirmed Sep 2026):

| Buyer | Tiers with the bonus | Tiers without |
|---|---|---|
| Solmar | IM, B | **A, C** |
| Questro | all (single, couple, mx_couple) | — |
| Diamante, VG | — | all (no pay file; rates inline in lib/qualify.ts) |

Print the whole matrix any time:

```
npx tsx scripts/buyer-pay-table.ts
```

The bonus is a buyer-level field, not a separate tier: don't add `_own_clubs`
variants to `tiers`. `assignedTier` never encodes clubs — the bonus shows up
only in `expectedGrossPay`.

Set `clubsBonus` to `0` for a buyer that doesn't pay one. Diamante and VG have
no pay file yet; their rates are still inline in `lib/qualify.ts`.
