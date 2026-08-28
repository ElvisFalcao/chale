import { useEffect, useState } from 'react'
import { searchAvailableRooms, kwanza, type AvailableRoom } from './lib/supabase'

// Deliberately unstyled. This is a connection smoke test, not the UI.
// The real interface gets built once the Claude Design direction is chosen
// and theme-factory has produced the token system.
export default function App() {
  const [rooms, setRooms] = useState<AvailableRoom[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Talatona, Luanda - stand-in until geolocation is wired up
    searchAvailableRooms({ lat: -8.9167, lng: 13.1833 })
      .then(setRooms)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: 24 }}>A procurar quartos disponíveis…</p>
  if (error) return <pre style={{ padding: 24, color: 'crimson' }}>{error}</pre>

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Chale</h1>
      <p>
        Ligação ao Supabase OK. {rooms.length} quarto(s) disponível(is) agora.
        {rooms.length === 0 && ' Base de dados ainda vazia — falta carregar hospedarias.'}
      </p>
      <ul>
        {rooms.map((r) => (
          <li key={r.room_id}>
            {r.property_name} — {r.room_label} · {r.municipio} ·{' '}
            {kwanza(r.price_hour)}/hora · {Math.round(r.distance_m)} m
          </li>
        ))}
      </ul>
    </main>
  )
}
