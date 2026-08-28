/** Timeline runs 08:00 -> 24:00, matching the Quicama artboard. */
export const DAY_START = 8
export const DAY_END = 24
export const DAY_SPAN = DAY_END - DAY_START

export const MAX_HOURS = 12
export const MAX_NIGHTS = 4

/** Thin space as the thousands separator, the way the design sets Kwanza. */
export const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')

export const hh = (h: number) => `${String(Math.round(h) % 24).padStart(2, '0')}:00`

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** Hours selected -> nights, the way the artboard maps between the two modes. */
export const nightsFromHours = (hours: number) =>
  clamp(Math.round(hours / 2), 1, MAX_NIGHTS)

export type Mode = 'horas' | 'noites'

export type Quote = {
  quantity: number
  unitPrice: number
  subtotal: number
  cleaningFee: number
  total: number
  unitLabel: string
  lineLabel: string
}

export function quote(opts: {
  mode: Mode
  hours: number
  priceHour: number
  priceNight: number
  cleaningFee: number
}): Quote {
  const isHours = opts.mode === 'horas'
  const quantity = isHours ? opts.hours : nightsFromHours(opts.hours)
  const unitPrice = isHours ? opts.priceHour : opts.priceNight
  const subtotal = unitPrice * quantity

  const noun = isHours
    ? quantity === 1 ? 'hora' : 'horas'
    : quantity === 1 ? 'noite' : 'noites'

  return {
    quantity,
    unitPrice,
    subtotal,
    cleaningFee: opts.cleaningFee,
    total: subtotal + opts.cleaningFee,
    unitLabel: `${quantity} ${noun}`,
    lineLabel: `${fmt(unitPrice)} Kz \u00d7 ${quantity} ${noun}`,
  }
}

export type Interval = { start: number; end: number }

/** Mirrors the database exclusion constraint: [start, end) overlap. */
export const overlaps = (a: Interval, b: Interval) => a.start < b.end && a.end > b.start
