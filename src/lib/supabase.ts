import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env')
}

export const supabase = createClient(url, key)

export type AvailableRoom = {
  room_id: string
  property_id: string
  property_name: string
  room_label: string
  municipio: string
  comuna: string | null
  price_hour: number
  price_night: number
  photos: string[]
  amenities: string[]
  verified: boolean
  avg_rating: number | null
  distance_m: number
}

/** The core query of the product: what is free right now, nearest to me. */
export async function searchAvailableRooms(opts: {
  lat: number
  lng: number
  startsAt?: Date
  endsAt?: Date
  radiusM?: number
  maxPrice?: number | null
  mode?: 'horas' | 'noites'
}) {
  const starts = opts.startsAt ?? new Date()
  const ends = opts.endsAt ?? new Date(starts.getTime() + 2 * 60 * 60 * 1000)

  const { data, error } = await supabase.rpc('search_available_rooms', {
    p_lat: opts.lat,
    p_lng: opts.lng,
    p_starts_at: starts.toISOString(),
    p_ends_at: ends.toISOString(),
    p_radius_m: opts.radiusM ?? 15000,
    p_max_price: opts.maxPrice ?? null,
    p_mode: opts.mode ?? 'horas',
  })

  if (error) throw error
  return data as AvailableRoom[]
}

export const kwanza = (n: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency', currency: 'AOA', maximumFractionDigits: 0,
  }).format(n).replace('AOA', 'Kz')
