// Order options — captured from Annie's Google Form (see agents/ORDER-FORM-FIELDS.md).
// Pricing confirmed by Christine 2026-07-23: $125 per seasonal arrangement.

export const ARRANGEMENT_PRICE = 125
export const BULK_THRESHOLD = 3 // 3+ arrangements
export const BULK_DISCOUNT = 10 // $10 off each
export const CUSTOM_MINIMUM = 375

export type Arrangement = {
  id: string
  label: string
  delivery: string
}

// Dates for the 2026-27 season, confirmed by Christine 2026-07-23. Listed in the order
// they actually arrive, so the form reads like a calendar rather than a list.
//
// NOTE — Thanksgiving delivery is provisional. Christine wrote "delivery Friday 22", but
// Nov 22 2026 is a Sunday. Friday is the 20th; Tuesday (matching Christmas) is the 24th.
// Using Friday Nov 20 until she confirms which she meant.
export const HOLIDAY_ARRANGEMENTS: Arrangement[] = [
  { id: 'thanksgiving', label: 'Thanksgiving', delivery: 'Delivered Fri, Nov 20' },
  { id: 'christmas', label: 'Christmas', delivery: 'Delivered Tue, Dec 22' },
  { id: 'valentines', label: "Valentine's Day", delivery: 'Delivered Fri, Feb 12' },
  { id: 'easter', label: 'Easter', delivery: 'Delivered Fri, Mar 26' },
  { id: 'mothers-day', label: "Mother's Day", delivery: 'Delivered Fri, May 7' },
  {
    id: 'monthly-subscription',
    label: 'Monthly Subscription',
    delivery: 'Delivered the first Friday of each month',
  },
]

export const CUSTOM_OPTION: Arrangement = {
  id: 'custom-event',
  label: 'Custom arrangement or event',
  delivery: `Weddings, gatherings, and one-off designs. From $${CUSTOM_MINIMUM}.`,
}

// Estimate for the seasonal arrangements only (custom/event is quoted separately).
export function estimateTotal(selectedIds: string[]): number {
  const seasonalCount = selectedIds.filter((id) => id !== CUSTOM_OPTION.id).length
  if (seasonalCount === 0) return 0
  const each =
    seasonalCount >= BULK_THRESHOLD ? ARRANGEMENT_PRICE - BULK_DISCOUNT : ARRANGEMENT_PRICE
  return seasonalCount * each
}
