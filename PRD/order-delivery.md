# PRD: Order delivery and scoring

**Goal** — Intact pots on the completed shelf fulfil matching order tickets (green, with points); orders that run out of time turn red and cost points.

**Context**
- `CompletedShelf` (`components/completed_shelf.js`) accepts any `glazeCooled` pot, cracked or not, never releases pots, and never touches `gameState.orders`. Orders (`components/orders.js`) are cards with a draining bar and no "done" or "expired" state.
- A pot has `clay.name`, `pot.shape`, `pot.glaze` (bucket names in dip order), `pot.cracked`; an order has `shape`, `clay.name`, `glaze`, `deadlineMs`, `madeMs`. Shelf fill (3 pots) currently ends the game via `OrdersComplete`.
- No score exists yet (`gameState` has only `seconds`, `orders`).
- **Sounds:** `assets/sounds/Sounds/` has four order sounds (unregistered, file names spelt "succes"): `order succes.wav`, `order succes 2.wav`, `order succes 3.wav`, `order succes 4.wav`. Delivery uses `order succes.wav` (`orderDelivered`); a missed order uses `order succes 3.wav` (`orderFailed`).

**Scope** — Cracked-pot refusal, pot-to-ticket matching (live and when a ticket appears later), delivered/expired states and colours, "+N points" text, delivered-first ordering, delivery sound, score counter, penalties.
**Out of scope** — New art, kiln/cracking rules, game-over on score, levels.

**Flow**
1. Cracked pot on the shelf → refused, "Broken pots can't be delivered", pot stays in the pack.
2. Intact finished pot → goes on the shelf. If an open ticket matches (shape, clay, glaze), the oldest such ticket completes at once and that pot leaves the shelf.
3. No matching ticket → the pot waits on the shelf. A new order that matches a waiting pot completes at once (oldest waiting pot). The player can pick a waiting pot back up to free the slot.
4. Completing: ticket turns green, bar hidden, shows "+50 points" or "+30 points", moves to the top, sound plays, score updates.
5. A ticket whose time runs out undelivered turns red, loses points once, stays listed, and can never be completed. Orders can be completed in any order.

**Requirements**
1. Shelf accepts only `glazeCooled`, `!pot.cracked` pots, and (new) releases a waiting pot when the fox takes it. Delivered pots are removed from the shelf.
2. Matching runs when a pot is shelved and on `OrderAdded`; the oldest open (not delivered/expired) order wins; sets `order.delivered`, `order.points`, triggers `OrderDelivered`.
3. Points: `madeMs < deadlineMs / 2` (measured from arrival) → 50; otherwise before the deadline → 30. A waiting pot delivering a fresh order gives 50.
4. Expiry (`madeMs >= deadlineMs`, undelivered): Cup −10, Vase −20, Bowl −25, once; `order.expired = true`, triggers `OrderExpired`. A pot arriving after expiry does not collect it.
5. `gameState.score` starts at 0, resets with `resetGameState()`, may go negative. A score bar sits directly above the first order card (below the timer, same width as the cards, `ORDER_CARD_W`), reading "Total Score  0" and updating on every delivery and expiry.
6. Delivered card: clear green background; expired card: clear red background and "−N points" text; both bars hidden, timers stop. Colours bright enough to read at a glance but soft, not saturated (e.g. green `#7CD992`, red `#E57373`, dark text). Card order: delivered, open, expired.
7. `GameSounds` plays `orderDelivered` on `OrderDelivered` and `orderFailed` on `OrderExpired`; both registered in `assets.js`.
8. `ORDER_MAX` (5) counts only open orders; delivered/expired cards stay visible and the oldest finished cards are dropped if the panel runs out of room.
9. The game ends (existing 1.5s pause, then `GameOver`) when 3 orders are delivered, not when the shelf fills. Temporary until levels exist. `COMPLETED_CAPACITY` stays 3.

**Acceptance criteria**
- [x] Cracked pot cannot be placed; message shown.
- [x] Matching pot in the first half of the time → green, "+50 points", score +50; second half → "+30 points", +30.
- [x] Delivered pot leaves the shelf; its slot is free.
- [x] Pot with no ticket waits; a matching order arriving later completes with it (+50); the fox can take the waiting pot back. (take-back checked by code path, not by clicking)
- [x] Unglazed order needs an unglazed pot; glaze A→B ≠ B→A.
- [x] Expired order is red with "−10/−20/−25 points", score drops once, later matching pots don't complete it.
- [x] Orders can be completed in any order; delivered tickets list above open ones, expired below.
- [x] Third delivered order ends the game; waiting pots don't.
- [x] A "Total Score" bar shows 0 at the start above the order queue without overlapping the timer or cards, and follows every +/− change (including below zero).
- [x] Success sound plays on delivery; the failed sound plays once when an order expires; new run resets score and tickets.

**Constraints** — Crafty 0.9.0, vanilla JS, no deps. Edits in `completed_shelf.js`, `shelf.js`/`orders.js`, `game_state.js`, `game_sounds.js`, `assets.js`; the score bar lives in `OrderPanel` so no extra wiring in `scenes/game.js`.

**Open questions** — None.

**Tasks**
- [x] `gameState.score`; "Total Score" bar above the order queue (in `OrderPanel`)
- [x] Shelf: reject cracked; let the fox take waiting pots; remove delivered pots
- [x] Match on shelve and on `OrderAdded`; delivered state, points by half-time, `OrderDelivered`
- [x] Expiry check in `updateBars`, penalty by shape, `OrderExpired`
- [x] Cards: green/red backgrounds, "+N/−N points", delivered/open/expired layout, open-only cap
- [x] Move game end from shelf-full to 3 deliveries
- [x] Register `order succes.wav` as `orderDelivered` and `order succes 3.wav` as `orderFailed`; bind both in `GameSounds`
- [x] Verify acceptance criteria in the browser

## Decisions
1. Waiting pots can be taken back by the fox.
2. Delivered pots leave the shelf.
3. Oldest waiting pot / oldest open order wins (default).
4. Delivery after expiry doesn't collect the order; first half measured from arrival (default).
5. Expired orders stay listed in red and block nothing; any completion order.
6. Cap counts only open orders (default).
7. Penalties Cup −10, Vase −20, Bowl −25 confirmed.
8. Delivery plays `order succes.wav`; a missed order plays `order succes 3.wav`.
