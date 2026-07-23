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

export const HOLIDAY_ARRANGEMENTS: Arrangement[] = [
  { id: 'valentines', label: "Valentine's Day", delivery: 'Delivered Fri, Feb 13' },
  { id: 'easter', label: 'Easter', delivery: 'Delivered Fri, Apr 3' },
  { id: 'mothers-day', label: "Mother's Day", delivery: 'Delivered Fri, May 8' },
  { id: 'fourth-of-july', label: 'Fourth of July', delivery: 'Delivered Tue, Jul 2' },
  { id: 'thanksgiving', label: 'Thanksgiving', delivery: 'Delivered Tue, Nov 25' },
  { id: 'christmas', label: 'Christmas', delivery: 'Delivered Tue, Dec 23' },
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
