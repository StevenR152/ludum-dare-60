# PRD: Customer orders

**Goal** — Customers place random pottery orders, one every 2 game-minutes, and the active orders are listed top right with a deadline bar so the player knows what to make and how urgent it is.

**Context**
- No orders exist yet. The loop so far: dig clay, owl throws pots, kiln fires them. Clay is `CLAY_TYPES` (brown, red, blue) in `constants.js`; per-run state lives in `game_state.js`.
- `GameTimer` is a HUD text at top right (x W-100, y 20) counting `gameState.seconds`. The order list sits below it.
- Glaze buckets, delivery and scoring don't exist yet; this PRD generates and shows orders, plus a placeholder glazing station.

**Scope** — Order generator, order data in `gameState`, a HUD panel (clay square, words, deadline bar per order), and a non-interactive glazing station with two bucket squares: Glaze A yellow, Glaze B red.
**Out of scope** — Fulfilling/handing in orders, scoring, what happens when a deadline runs out, working glaze buckets, final order art, sounds, difficulty ramp.

**Flow**
1. The first order appears at 0:00, then one more every 2:00.
2. Each order appears in the top-right panel, newest at the bottom, below the timer.
3. An order shows a clay colour square, then words, e.g. `Large Vase (1500g) · Glaze A then B · Fast`, and a bar that drains toward its deadline.
4. Orders stay listed until later features remove them. At 5 listed orders, no more are created.

**Requirements**
1. An order has: shape (Bowl, Cup, Vase), size (Small, Medium, Large), clay colour (one of the 3 clay types), glaze (A, B, A then B, B then A), speed (Slow, Medium, Fast). Each is picked at random.
2. Clay needed in grams is derived from shape + size: Bowl 200/500/1000, Cup 150/200/500, Vase 300/500/1500 (small/medium/large). It is stored in constants and shown on the order, e.g. "Medium Bowl (500g)".
3. Speed sets the deadline: Slow 10 min, Medium 7 min, Fast 3 min (`ORDER_DEADLINE_MS` in constants), counted from the order's arrival.
4. `ORDER_INTERVAL_MS = 120000` is in `constants.js`. Orders are created by game time (first at 0:00), so they pause with `Crafty.pause()`. No order is created while 5 are listed.
5. Orders live in `gameState.orders` and reset with `resetGameState()`.
6. The panel shows a square in the order's `CLAY_TYPES` colour, the words, and a progress bar of time left; it grows downward under the timer, at most 5 orders. At 0 the bar is empty and the order stays.
7. Outside has a glazing station with two squares, Glaze A yellow and Glaze B red. Clicking them does nothing yet.
8. New orders trigger `Crafty.trigger("OrderAdded", order)` for later features.

**Acceptance criteria**
- [ ] The first order is at 0:00, then 2:00, 4:00, and so on; never more than 5 listed.
- [ ] Each order has all five fields, drawn from the allowed values only.
- [ ] Each order shows one clay square in a valid clay colour.
- [ ] The bar drains over 10, 7 or 3 minutes for Slow, Medium, Fast (check with a shortened scale) and stops at empty.
- [ ] The glazing station shows a yellow and a red square Outside.
- [ ] Grams match the table for all nine shape/size combinations (check in console).
- [ ] The panel doesn't overlap the timer, and multiple orders stack readably.
- [ ] Start a new run: orders are cleared and the clock restarts.

**Constraints** — Crafty 0.9.0, no new dependencies. New `components/orders.js` (added to `index.html`), data tables in `constants.js`, state in `game_state.js`, wired in `scenes/game.js`. Placeholder visuals: coloured boxes and text.

**Open questions** — None.

**Tasks**
- [ ] Add interval, shapes, sizes, glazes, speeds and gram table to `constants.js`
- [ ] Add `orders: []` to `gameState`
- [ ] `Orders` component: random generator, timer, `OrderAdded` trigger
- [ ] HUD panel: clay square, text and deadline bar, stacked under the timer, max 5
- [ ] Glazing station with yellow and red bucket squares Outside
- [ ] Wire into `scenes/game.js` and `index.html`
- [ ] Verify acceptance criteria in the browser (temporarily shorten the interval)

## Decisions
1. First order → at 0:00.
2. Clay → one colour per order, chosen from the 3 clay types (3-colour orders dropped).
3. Glaze → A then B differs from B then A; placeholder station with yellow (A) and red (B) squares.
4. Speed → deadlines of Slow 10 min, Medium 7 min, Fast 3 min, shown as progress bars.
5. Panel → capped at 5 orders; none created while full (default).
6. Grams → shown on the order (default).
7. Testing → shorten the interval temporarily, restore before commit.
