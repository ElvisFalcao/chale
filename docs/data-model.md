# Data model — the decisions that matter

## 1. A property is not a room

The AI Studio prototype had one table, `alojamentos`, where each row was both the guesthouse and
the thing you booked. That cannot express the actual business: a hospedaria owner has **twelve
rooms**, and the question "do you have anything free?" is answered per room, not per building.

So: `properties` (the hospedaria — one location, one owner, one set of coordinates) →
`rooms` (individually bookable units, each with its own hourly and nightly price).

Everything downstream depends on this. Availability, the owner dashboard's "3 rooms free right
now", and the anti-overbooking guarantee are all per-room.

## 2. Overbooking is prevented by the database, not by the app

The prototype validated `(ts2 < te1) ∧ (te2 > ts1)` in JavaScript before writing. Under any real
concurrency — two guests tapping "confirmar" on the last room at the same second — that check
loses. Both requests read "free", both write.

Instead:

```sql
alter table bookings add constraint bookings_no_overlap
  exclude using gist (room_id with =, span with &&)
  where (status in ('PENDENTE','CONFIRMADA','EM_CURSO','EM_LIMPEZA'));
```

Postgres now refuses the second write itself. It is impossible to double-book a room, whatever the
application code does. The app's job shrinks to catching the constraint violation and showing a
decent message.

`blackouts` uses the same mechanism for owner-initiated blocks — maintenance, personal use, the
cleaning buffer after checkout.

## 3. "Available now, nearest to me" is the product

`search_available_rooms(lat, lng, starts_at, ends_at, radius_m, max_price, mode)` is the single
most important query in the system. It is a PostGIS `ST_DWithin` over `properties.location`,
filtered by "no overlapping booking and no blackout", ordered by distance.

This is why the schema uses `geography(Point,4326)` with a GiST index rather than storing loose
lat/lng columns. Distance sorting on raw floats does not work at country scale.

## 4. Check-in releases the money

`booking_checkin(booking_id, lat, lng)` does three things in one transaction:

1. Confirms the guest is within 100 m of the property (PostGIS distance, not hand-rolled Haversine).
2. Moves the booking to `EM_CURSO`.
3. **Releases the held payment to the owner.**

That third step is the escrow model. Money is held when the booking is made and only moves to the
owner once the guest has physically arrived. It is a database function rather than app code
because all three must succeed or none of them may.

While payments are still cash/TPA, step 3 is a no-op — nothing is in `retido` status. The
function does not need to change when online payments arrive.

## 5. Status lifecycle

```
PENDENTE → CONFIRMADA → EM_CURSO → EM_LIMPEZA → FINALIZADA
              ↓             ↓
          CANCELADA   NAO_COMPARECEU
```

`sweep_no_shows()` runs on `pg_cron` and marks confirmed bookings whose guest never arrived within
30 minutes, incrementing that guest's no-show counter. Reputation is earned and lost automatically.

## 6. RLS is the security model

There is no trusted API tier deciding who sees what. Row Level Security does it in the database:
guests see their own bookings, owners see bookings at properties they own, rooms and properties
are publicly browsable. This means the frontend can talk to Supabase directly for most reads, and
Pages Functions are reserved for the few operations that genuinely need server-side secrets.
