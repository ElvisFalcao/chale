# Design tokens — direction 1c "Quiçama"

Source: `design/Chale-Explorations.dc.html`, artboard `#1c`. Four directions were explored
(1a Luanda Noite, 1b Ocre Editorial, 1c Quiçama, 1d Bruma Atlântica); Quiçama was chosen.

Values live in `src/styles/tokens.css` as CSS custom properties and are surfaced to Tailwind
in `tailwind.config.ts`. **Change them in the CSS file, not the Tailwind config.**

## Palette

| Token | Value | Role |
|---|---|---|
| `--chale-void` | `#081411` | Page ground, slider well, text on accent |
| `--chale-sheet` | `#0B1A16` | Bottom sheet |
| `--chale-surface` | `#0F211C` | Cards |
| `--chale-surface-2` | `#16302A` | Controls, badges, steppers |
| `--chale-line` | `#24463C` | Borders, grab handle |
| `--chale-accent` | `#7BD8A0` | CTA, totals, active state |
| `--chale-accent-2` | `#4FBB7F` | Gradient foot, currency suffix |
| `--chale-gold` | `#F0C46A` | Payment/status marker **only** — one dot per screen at most |
| `--chale-text` → `-4` | `#E9F3EC` `#C3D8CB` `#9CBCAB` `#6E8D7E` | Text, brightest to dimmest |

Dark is the only theme. The direction was designed night-first because most fractional bookings
happen after dark; a light variant would need its own pass, not an inversion.

## Type

**Space Grotesk** for everything, **Space Mono** for anything numeric — times, durations, Kwanza
amounts, the hour ruler. That split is the direction's signature: money and time read as data,
prose reads as voice. Do not set a price in the sans face.

Tracking tightens as size grows: `-0.02em` at body, `-0.03em` on the time range, `-0.04em` on the
total. Small mono labels open up instead: `0.14em` / `0.18em`.

## Radii

`16px` controls · `20px` slider track · `24px` cards · `22px` CTA · `32px 32px 0 0` sheet · `999px` pills.

## The booking slider

`src/components/BookingSheet.tsx`. Behaviour ported from the artboard's controller:

- Timeline spans **08:00–24:00**. Press sets the start hour; drag right extends the duration.
- Duration clamps to **1–12 hours**, and never past midnight.
- Nights mode maps hours to nights as `clamp(round(hours / 2), 1, 4)`.
- Total is `unit price × quantity + 3 000 Kz` cleaning fee.
- Kwanza uses a **thin space** (`U+2009`) as the thousands separator, not a comma or a full space.

Two things were added beyond the artboard, both deliberate:

1. **Booked slots are real.** The artboard had two decorative dead zones on the track; they are now
   a `booked` prop. The handle turns gold and the CTA disables on overlap, so the picker cannot
   propose a slot the database would reject. The overlap test is the same `[start, end)` rule as the
   Postgres exclusion constraint.
2. **Keyboard and screen reader support.** The track is a real `role="slider"` with arrow-key
   control and `aria-valuetext` announcing the time range.
