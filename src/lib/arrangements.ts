// Order options — captured from Annie's Google Form (see agents/ORDER-FORM-FIELDS.md).
// Pricing confirmed by Christine 2026-07-23: $125 per seasonal arrangement.

export const ARRANGEMENT_PRICE = 125
export const BULK_THRESHOLD = 3 // 3+ arrangements
export const BULK_DISCOUNT = 10 // $10 off each
export const CUSTOM_MINIMUM = 375

// A rose-only arrangement, available for any holiday (Christine, 2026-07-23).
export const ROSE_PRICE = 275
export const ROSE_COUNT = 100

// Every holiday can be ordered at either size.
export type Size = 'signature' | 'roses'

// holiday id -> chosen size. The custom/event option has no size, so it maps to
// 'signature' and is skipped in the maths.
export type Selection = Record<string, Size>

export type Arrangement = {
  id: string
  label: string
  delivery: string
}

// Dates for the 2026-27 season, confirmed by Christine 2026-07-23. Listed in the order
// they actually arrive, so the form reads like a calendar rather than a list.
export const HOLIDAY_ARRANGEMENTS: Arrangement[] = [
  { id: 'thanksgiving', label: 'Thanksgiving', delivery: 'Delivered Wed, Nov 25' },
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
//
// The 3-for-$10-off deal counts and discounts the $125 signature arrangements only.
// The $275 rose arrangement is left at full price, because discounting it was never
// part of the offer and guessing in the customer's favour costs Annie real money.
export function estimateTotal(selection: Selection): number {
  const sizes = Object.entries(selection)
    .filter(([id]) => id !== CUSTOM_OPTION.id)
    .map(([, size]) => size)

  const signatureCount = sizes.filter((s) => s === 'signature').length
  const roseCount = sizes.filter((s) => s === 'roses').length

  const each =
    signatureCount >= BULK_THRESHOLD ? ARRANGEMENT_PRICE - BULK_DISCOUNT : ARRANGEMENT_PRICE

  return signatureCount * each + roseCount * ROSE_PRICE
}

// What the order is called on the confirmation email and in Annie's order book.
export function describe(id: string, size: Size): string {
  const label = id === CUSTOM_OPTION.id
    ? CUSTOM_OPTION.label
    : HOLIDAY_ARRANGEMENTS.find((a) => a.id === id)?.label ?? id
  if (id === CUSTOM_OPTION.id) return label
  return size === 'roses' ? `${label} — ${ROSE_COUNT} roses` : label
}
