# PRD: One shared inventory system

**Goal** — Every holder (fox, owl, kiln, later shelf and drying rack) uses one fixed-size `Inventory` instead of today's separate mechanisms.

**Context**
- Fox: `backpack` array of clay (cap `BACKPACK_CAPACITY` 2, `BackpackChanged`, `BackpackDisplay` HUD squares) **plus** a separate one-pot `gameState.heldItem` (`InventoryChanged`, `InventorySlot` HUD).
- Owl (`Potter`): `clay` counter, `hasPot`/`making` flags, `potBox`. Kiln: `state` string + `potBox`. Each has its own load/take methods and display.
- Click handlers in `scenes/game.js` hand-move items between these (`takeSelected`, `takePot`, `loadPot`, `heldItem = ...`).

**Scope** — A reusable `Inventory` (fixed `capacity`, ordered item list `{type, ...}`, `add`/`take`/`has`/`isFull`, one `InventoryChanged` event naming the holder). Migrate fox, owl and kiln onto it, with holder-specific rules (what each accepts) layered on top. One HUD renderer for the fox's inventory. Transfers go through one helper.
**Out of scope** — Finished-pottery shelf and drying rack (design must allow them, not build them), new capacities/gameplay, new art, owl/kiln timings.

**Flow** (behaviour unchanged for the player)
1. Fox digs clay → it goes into the fox's inventory; HUD shows it.
2. Click owl: pot moves owl → fox; selected clay moves fox → owl when he is idle.
3. Click kiln: unfired pot fox → kiln; later fired pot kiln → fox.
4. E selects, SPACE drops, as today.

**Requirements**
1. `Inventory(capacity)` rejects `add` when full, or when the item's `type` differs from those held (returns false); never exceeds capacity. Unfired and fired pots are both `pot`.
2. Fox has one 2-slot inventory holding one item type at a time (all clay or all pots). Speed slowdown still counts clay only.
3. Owl input inventory holds clay; output holds ≤1 pot. Kiln holds 1 pot (in, then fired out). Capacities are constants in `constants.js`.
4. `gameState.heldItem`, `fox.backpack`, `Potter.clay/hasPot`, `BackpackChanged` and the `Potter`/`Kiln` ad-hoc take/load plumbing are removed.
5. A single `transfer(from, to, item)` moves items atomically (fails without change if `to` is full or refuses).
6. A HUD inventory bar (overlay, top-left under the mute button) has one labelled row per holder: **Fox**, **Master** (input slot, output slot) and **Kiln**. Old `InventorySlot`/`BackpackDisplay` merged into it.
7. Reset on new run via `resetGameState()`/scene creation.
8. Whatever a holder holds is both tracked in its `Inventory` and shown in its HUD row: nothing held is hidden, nothing shown is untracked. Clay the master is given stays in his input slot, visible, until the pot it makes is finished (then it is used up); the pot waits in his output slot.
9. Slots are always the same grey square with a dark border (selected slot: white border). Only the item in a slot differs in shape: clay is a square, a pot is a thinner rectangle, both centred in the slot. Item colour is correct: clay in its own colour (brown/red/blue), an unfired pot `POT_COLOR`, a fired pot `FIRED_POT_COLOR`.

**Acceptance criteria**
- [x] Dig clay twice: 2 slots filled, third dig refused, fox slower per clay as before.
- [x] Giving the master clay shows that clay (right colour, square) in his input slot until the pot appears in his output slot as a thin rectangle.
- [x] Every item the fox, master or kiln holds appears in its HUD row in the right colour and shape; clay is square, pots are thin; slots stay square.
- [x] Owl takes selected clay only when idle; pot appears after 8 s; clicking owl moves it to the fox's HUD.
- [x] Fox carrying clay cannot take a pot (and vice versa); a full inventory refuses too; nothing is lost.
- [x] Pot loads into kiln, fires 10 s, cools 10 s, fired pot (darker) returns to fox.
- [x] E cycles, SPACE drops the selected item (clay or pot).
- [x] Play Again starts with everything empty. No console errors.
- [x] Grep finds no `heldItem` or `backpack` remnants.

**Constraints** — Crafty 0.9.0, no new deps, plain script tags in `index.html`. New `components/inventory.js`; edits to `fox.js`, `potter.js`, `kiln.js`, `game.js`, `game_state.js`, `constants.js`, HUD component. Update `components/README.md` if it lists components.

**Open questions** — None. Decided: the fox holds one item type at a time (so it can now carry 2 pots); the owl takes one clay at a time, only when idle.

**Tasks**
- [x] Write `Inventory` + `transfer` helper
- [x] Fox onto Inventory (selection, drop, speed)
- [x] Merge HUD components into one inventory display
- [x] Owl (`Potter`) onto Inventory
- [x] Kiln onto Inventory
- [x] Simplify click handlers in `game.js`; remove `heldItem`/`backpack`
- [x] Verify all acceptance criteria in browser

## Decisions
0. HUD bar rows Fox / Master (in, out) / Kiln; items drawn as shapes inside fixed square slots. The master keeps the clay in his input slot while he works.
1. Clay-blocks-pot deadlock → status message, drop with SPACE (default).
2. Kiln loads the selected pot only if unfired; fired pot in hand is refused (default). With room and a ready pot it collects it.
3. E/SPACE one mechanism on `Inventory.selected` (default). Fox holding one type at a time; may carry 2 pots.
4. Owl: input holds clay only while idle; `ClayDelivered` event dropped (clay now arrives via `transferItem`).
5. HUD: one row of capacity slots at (20, 60) (default). Click owl: collect pot first, then give clay (default).
Verified in browser with simulated frames (preview pane throttles timers). Tap on a device not tested.
