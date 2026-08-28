import { useCallback, useMemo, useRef, useState } from 'react'
import {
  DAY_START, DAY_END, DAY_SPAN, MAX_HOURS,
  clamp, fmt, hh, quote, overlaps,
  type Interval, type Mode,
} from '../lib/pricing'

type Props = {
  roomTitle: string
  priceHour: number
  priceNight: number
  cleaningFee?: number
  /** Slots already taken, in whole hours. Rendered as dead zones on the track. */
  booked?: Interval[]
  dateLabel?: string
  initialStart?: number
  initialHours?: number
  onClose?: () => void
  onConfirm?: (sel: { start: number; hours: number; mode: Mode; total: number }) => void
}

export default function BookingSheet({
  roomTitle,
  priceHour,
  priceNight,
  cleaningFee = 3000,
  booked = [],
  dateLabel = 'HOJE, 28 AGO',
  initialStart = 20,
  initialHours = 2,
  onClose,
  onConfirm,
}: Props) {
  const [start, setStart] = useState(initialStart)
  const [hours, setHours] = useState(initialHours)
  const [mode, setMode] = useState<Mode>('horas')

  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const q = useMemo(
    () => quote({ mode, hours, priceHour, priceNight, cleaningFee }),
    [mode, hours, priceHour, priceNight, cleaningFee],
  )

  const selection: Interval = { start, end: start + hours }
  const conflict = booked.some((b) => overlaps(selection, b))

  const hourAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect()
    const f = (clientX - rect.left) / rect.width
    return clamp(Math.round(DAY_START + f * DAY_SPAN), DAY_START, DAY_END - 1)
  }

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const h = hourAt(e.clientX)
    setStart(h)
    setHours((d) => clamp(d, 1, DAY_END - h))
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const h = hourAt(e.clientX)
    setHours((d) => {
      const next = clamp(h - start, 1, Math.min(MAX_HOURS, DAY_END - start))
      return next === d ? d : next
    })
  }, [start])

  const endDrag = useCallback(() => { dragging.current = false }, [])

  const step = (delta: number) =>
    setHours((d) => clamp(d + delta, 1, Math.min(MAX_HOURS, DAY_END - start)))

  const pct = (h: number) => ((h - DAY_START) / DAY_SPAN) * 100

  return (
    <div className="fixed inset-0 flex flex-col justify-end bg-void/60 backdrop-blur-sm">
      {/* header over the photo */}
      <div className="absolute inset-x-5 top-[52px] flex items-center justify-between">
        <span className="text-[17px] font-semibold">{roomTitle}</span>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-surface/85 text-xs"
        >
          ✕
        </button>
      </div>

      <section className="flex max-h-[92vh] flex-col gap-4 rounded-t-sheet bg-sheet px-5 pb-7 pt-3.5">
        <div className="mx-auto h-1 w-11 rounded-sm bg-line" />

        {/* mode toggle */}
        <div className="flex gap-[5px] rounded-[18px] bg-void p-[5px]">
          {(['horas', 'noites'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`flex-1 rounded-[14px] py-3 text-[13.5px] font-semibold capitalize transition-colors duration-[var(--chale-fast)] ${
                mode === m ? 'bg-accent text-void' : 'bg-transparent text-ink-3'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* the picker */}
        <div className="flex flex-col gap-3.5 rounded-card bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[3px]">
              <span className="font-mono text-[10px] tracking-[0.14em] text-ink-3">{dateLabel}</span>
              <span className="font-mono text-2xl tracking-[-0.03em]">
                {hh(start)} — {hh(start + hours)}
              </span>
            </div>
            <div className="rounded-control bg-surface-2 px-3.5 py-2.5 font-mono text-[13px] text-accent">
              {q.unitLabel}
            </div>
          </div>

          <div
            ref={trackRef}
            role="slider"
            aria-label="Duração da reserva"
            aria-valuemin={1}
            aria-valuemax={MAX_HOURS}
            aria-valuenow={hours}
            aria-valuetext={`${hh(start)} até ${hh(start + hours)}`}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
              if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
            }}
            className="relative h-[88px] cursor-grab touch-none overflow-hidden rounded-[20px] bg-void outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
          >
            {booked.map((b, i) => (
              <div
                key={i}
                aria-hidden
                className="absolute inset-y-0 bg-[var(--chale-wash)]"
                style={{ left: `${pct(b.start)}%`, width: `${((b.end - b.start) / DAY_SPAN) * 100}%` }}
              />
            ))}

            <div className="absolute inset-x-0 bottom-2.5 h-px bg-[var(--chale-hairline)]" />

            <div
              className={`absolute inset-y-2.5 flex items-center justify-between rounded-control px-2.5 shadow-glow transition-[left,width] duration-[var(--chale-fast)] ease-linear ${
                conflict
                  ? 'bg-gold'
                  : 'bg-gradient-to-b from-accent to-accent-2'
              }`}
              style={{ left: `${pct(start)}%`, width: `${(hours / DAY_SPAN) * 100}%` }}
            >
              <span className="h-[30px] w-[5px] rounded-[3px] bg-void/35" />
              <span className="font-mono text-[15px] text-void">
                {mode === 'horas' ? `${hours}h` : `${q.quantity}n`}
              </span>
              <span className="h-[30px] w-[5px] rounded-[3px] bg-void/35" />
            </div>
          </div>

          <div className="flex justify-between font-mono text-[10px] text-ink-4">
            <span>08</span><span>12</span><span>16</span><span>20</span><span>24</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => step(-1)}
              aria-label="Menos uma hora"
              className="flex h-[46px] w-[46px] select-none items-center justify-center rounded-control bg-surface-2 text-xl"
            >
              −
            </button>
            <div className="flex flex-1 items-center justify-center rounded-control bg-surface-2 text-[13px] text-ink-2">
              {mode === 'horas'
                ? `Início ${hh(start)} · ${hours}h`
                : `Check-in ${hh(start)} · ${q.quantity}n`}
            </div>
            <button
              onClick={() => step(1)}
              aria-label="Mais uma hora"
              className="flex h-[46px] w-[46px] select-none items-center justify-center rounded-control bg-surface-2 text-xl"
            >
              +
            </button>
          </div>
        </div>

        {/* totals */}
        <div className="flex flex-col gap-2.5 rounded-card bg-surface p-4">
          <Row label={q.lineLabel} value={`${fmt(q.subtotal)} Kz`} />
          <Row label="Taxa de limpeza" value={`${fmt(q.cleaningFee)} Kz`} />
          <div className="h-px bg-[var(--chale-hairline)]" />
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-ink-3">Total a pagar</span>
            <span className="font-mono text-[30px] tracking-[-0.04em] text-accent">
              {fmt(q.total)}
              <span className="text-sm text-accent-2"> Kz</span>
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2.5">
          <button
            disabled={conflict}
            onClick={() => onConfirm?.({ start, hours, mode, total: q.total })}
            className="rounded-cta bg-accent py-[18px] text-[15.5px] font-semibold text-void transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {conflict ? 'Horário já reservado' : `Confirmar ${q.unitLabel}`}
          </button>
          <div className="flex items-center justify-center gap-2 text-[11.5px] text-ink-4">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span>Pagas no TPA à chegada · sem cartão online</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px] text-ink-2">
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
