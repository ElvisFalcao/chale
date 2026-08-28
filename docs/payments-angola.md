# Payments in Angola — options and the escrow plan

Status: **research, not decided.** Today the app books and the guest pays cash or on the
property's TPA terminal. This documents what the routes to in-app payment actually look like,
so the decision can be made on facts.

## The landscape

Card and electronic payments in Angola run through **EMIS** (Empresa Interbancária de Serviços),
which operates the **Multicaixa** network — the ATMs, the TPA terminals in shops, and
**Multicaixa Express**, the mobile payment app most Angolans with a bank account already have.
There is no Stripe here. Anything that moves money touches EMIS one way or another.

## Route A — Multicaixa reference payments (ProxyPay)

The guest is given a **reference number** (entity + reference + amount). They pay it from an ATM,
a TPA, internet banking or their bank's mobile app. Your server is notified when it clears.

- API: `api.proxypay.co.ao`, REST, API key in the Authorization header, sandbox available.
- Flow: `PUT` a reference with amount and expiry → poll `GET /payments` or receive a webhook
  (HMAC-SHA-256 signed) → acknowledge the event off the queue.
- **Fits Chale badly for hourly bookings.** References are asynchronous — the guest leaves the app,
  pays somewhere else, comes back. For a "I want a room in the next 30 minutes" product that is
  a lot of friction, and the room has to be held while they do it.
- **Fits Chale well for owner-side billing** — subscription, featured-listing fees, commission
  invoices. Those are not time-critical.

## Route B — Multicaixa Express (vPOS or direct)

Push a payment request to the guest's phone; they approve it in the Multicaixa Express app.
Synchronous, in-flow, and the closest thing to a Stripe experience available locally.

- **vPOS** is an Angolan gateway offering exactly this, with client libraries published for
  PHP, Python, Java and C# (and a `vpos` npm package).
- This is the right shape for the guest-side booking flow. Approve on your phone, room is yours.
- Requires a merchant relationship and onboarding — this is the thing to go and ask about.

## Route C — Bank transfer with proof upload

The fallback that always works. Guest transfers, uploads the comprovativo, owner or an operator
confirms. Manual, slow, but zero integration and zero licensing.

## Route D — Stay with cash and TPA (where we are now)

Zero integration risk. The friction is real but it is the friction Angolans already live with,
and the TPA terminal is already at the property. Not a bad v1.

## The escrow question — read this before promising it

The plan is: hold the guest's money at booking, release it to the owner after check-in. That is
the right product design. It is also the part with the most non-technical risk.

**Holding other people's money is a regulated activity.** In most jurisdictions, taking funds from
a payer and holding them before passing them to a payee makes you a payment institution and needs
a licence from the central bank — here, the **BNA (Banco Nacional de Angola)**. This is a question
for an Angolan lawyer and for the gateway's compliance team, not one to answer from documentation.

Three ways this usually gets resolved, in increasing order of ambition:

1. **Let the gateway hold it.** Some PSPs offer delayed capture or split settlement — you authorise
   at booking and capture at check-in. The money never sits in your account, so you may not be the
   one holding it. Ask vPOS/EMIS directly whether delayed capture is available.
2. **Settle to the owner on a cycle, net of commission.** Money lands with you, you pay owners
   weekly. Simpler to build, more exposed regulatorily, and needs owner trust.
3. **Get licensed or partner with someone who is.** The real answer at scale.

Until one of those is settled, cash/TPA at the property is not a compromise — it is the
compliant option, and it is what the schema already supports (`payment_method = 'dinheiro' | 'tpa'`).

## What is already built for this

`payments` carries `method`, `status` (`pendente → retido → libertado`), and `provider_ref`.
`booking_checkin()` already flips `retido → libertado` at the moment the guest arrives. When a
gateway is chosen, the work is a webhook handler in `functions/api/` that sets `retido` — the
release logic exists and does not change.

## Questions to take to a meeting

- Does vPOS or EMIS support **authorise now, capture later**? (This decides whether escrow needs a licence.)
- What are the per-transaction fees at low ticket sizes? A 9 000 Kz booking cannot absorb much.
- What is required to onboard as a merchant — company registration, NIF, bank account, minimum volume?
- Is there a sandbox, and how long does merchant approval take?
- Can settlement be split automatically between platform commission and the owner?

## Sources

- ProxyPay API — https://developer.proxypay.co.ao/v2/
- vPOS libraries — https://github.com/v-pos
- EMIS / Multicaixa background — https://en.wikipedia.org/wiki/Multicaixa
