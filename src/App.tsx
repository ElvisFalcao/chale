import { useEffect, useState } from 'react'
import BookingSheet from './components/BookingSheet'
import { searchAvailableRooms, type AvailableRoom } from './lib/supabase'

/**
 * First real screen: the booking sheet, direction 1c "Quicama".
 * Prices come from Supabase when the database has rooms in it; until then it
 * falls back to the Bungalow Vista Mar figures the artboard was designed around.
 */
const FALLBACK = {
  roomTitle: 'Bungalow Vista Mar',
  priceHour: 22000,
  priceNight: 110000,
}

export default function App() {
  const [room, setRoom] = useState<AvailableRoom | null>(null)

  useEffect(() => {
    searchAvailableRooms({ lat: -8.7833, lng: 13.2333 })
      .then((rooms) => setRoom(rooms[0] ?? null))
      .catch(() => setRoom(null))
  }, [])

  return (
    <BookingSheet
      roomTitle={room?.property_name ?? FALLBACK.roomTitle}
      priceHour={room?.price_hour ?? FALLBACK.priceHour}
      priceNight={room?.price_night ?? FALLBACK.priceNight}
      booked={[{ start: 12, end: 14 }, { start: 19, end: 20 }]}
      onConfirm={(sel) => console.log('reservar', sel)}
    />
  )
}
