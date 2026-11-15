# Design notes

## Data

| Collection | Main fields |
|---|---|
| **User** | role (business or customer), name, email, password hash, phone, address, business info (name, city, description) |
| **Service** | business, name, description, category, price, duration, active (visible or hidden) |
| **Appointment** | service, business, customer, start, end, status, notes, and a copy of the service name and price |
| **Invoice** | appointment, business, customer, amount, unpaid or paid |

The appointment saves its own copy of the price, so if a business changes its prices later, old bookings and invoices stay the same.

## Booking flow

```
customer books ──► pending ──(business accepts)──► confirmed ──(business marks done)──► completed ──► invoice ──(customer pays)──► paid
                      │                               │
                      └────── either side cancels ────┴──► cancelled
```

The status route in `server/src/routes/appointments.ts` checks who is allowed to make each change. For example, a customer can cancel a booking but can't confirm it.

## Time slots

Businesses are open from 9:00 to 17:00. For the chosen day, `server/src/lib/slots.ts` goes through the day every 30 minutes and keeps the start times where the whole service fits before closing and doesn't overlap a pending or confirmed booking. The browser sends its time zone offset so the hours match the customer's local time.

## Login

- Passwords are hashed with bcrypt and never sent back in responses.
- Logging in puts a JWT in an httpOnly cookie. Every request reads it to know who the user is.
- `requireAuth("business")` or `requireAuth("customer")` protects routes, and updates check that the record belongs to the logged-in user.

## Changes from the first version

- The front end was rewritten in React (it used to be plain HTML/JS pages).
- Passwords used to be stored in plain text, and any request could read or change any account. Both are fixed.
- Added time slots, double-booking checks, invoices that are created automatically, and a dashboard.

## What I'd add next

- Email notifications when a booking is confirmed or cancelled
- Opening hours that each business can set
- A real payment provider (for example Stripe in test mode)
