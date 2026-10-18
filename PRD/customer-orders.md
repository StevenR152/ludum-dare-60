# PRD: Customer orders

**Goal** — Customers place random pottery orders, one every 2 game-minutes, and the active orders are listed top right so the player knows what to make.

**Context**
- No orders exist yet. The loop so far: dig clay, owl throws pots, kiln fires them. Clay is `CLAY_TYPES` (brown, red, blue) in `constants.js`; per-run state lives in `game_state.js`.
- `GameTimer` is a HUD text at top right (x W-100, y 20) counting `gameState.seconds`. The order list sits below it.
- Glaze buckets, delivery and scoring don't exist yet; this PRD only generates and shows orders.

**Scope** — Order generator, order data in `gameState`, and a HUD panel showing each order as clay colour squares plus descriptive words.
**Out of scope** — Fulfilling/handing in orders, scoring, order expiry or failure, glaze buckets, final order art, sounds, difficulty ramp.

**Flow**
1. The run starts with no orders. After 2:00 the first order appears (see open question), then one more every 2:00.
2. Each order appears in the top-right panel, newest at the bottom, below the timer.
3. An order shows coloured squares for its clay, then words, e.g. `Large Vase · Glaze A then B · Fast`.
4. Orders stay listed until later features remove them.

**Requirements**
1. An order has: shape (Bowl, Cup, Vase), size (Small, Medium, Large), clay colours (1 or 3 of the clay types), glaze (A, B, A then B, B then A), speed (Slow, Medium, Fast). Each is picked at random.
2. Clay needed in grams is derived from shape + size: Bowl 200/500/1000, Cup 150/200/500, Vase 300/500/1500 (small/medium/large). It is stored in constants and shown on the order.
3. "3 colours" means all three clay types; "1 colour" means one random type.
4. `ORDER_INTERVAL_MS = 120000` is in `constants.js`. Orders are created by game time, so they pause with `Crafty.pause()`.
5. Orders live in `gameState.orders` and reset with `resetGameState()`.
6. The panel shows one square per clay colour (using `CLAY_TYPES` colours) and the words, and grows downward as orders arrive.
7. New orders trigger `Crafty.trigger("OrderAdded", order)` for later features.

**Acceptance criteria**
- [ ] No order before 2:00; the first at 2:00; then 4:00, 6:00, and so on.
- [ ] Each order has all five fields, drawn from the allowed values only.
- [ ] 1-colour orders show one square; 3-colour orders show three.
- [ ] Grams match the table for all nine shape/size combinations (check in console).
- [ ] The panel doesn't overlap the timer, and multiple orders stack readably.
- [ ] Start a new run: orders are cleared and the clock restarts.

**Constraints** — Crafty 0.9.0, no new dependencies. New `components/orders.js` (added to `index.html`), data tables in `constants.js`, state in `game_state.js`, wired in `scenes/game.js`. Placeholder visuals: coloured boxes and text.

**Open questions**
- Does the first order arrive at 0:00 (so there's something to do) or at 2:00? Assumed 2:00.
- Do 3-colour orders have a gram split per colour? Assumed no, just total grams.

**Tasks**
- [ ] Add interval, shapes, sizes, glazes, speeds and gram table to `constants.js`
- [ ] Add `orders: []` to `gameState`
- [ ] `Orders` component: random generator, timer, `OrderAdded` trigger
- [ ] HUD panel: clay squares + descriptive text, stacked under the timer
- [ ] Wire into `scenes/game.js` and `index.html`
- [ ] Verify acceptance criteria in the browser (temporarily shorten the interval)
