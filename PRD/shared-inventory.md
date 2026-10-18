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
6. The HUD draws the fox's inventory slots (filled by item colour, empty grey, selected outlined); old `InventorySlot`/`BackpackDisplay` merged into it.
7. Reset on new run via `resetGameState()`/scene creation.

**Acceptance criteria**
- [ ] Dig clay twice: 2 slots filled, third dig refused, fox slower per clay as before.
- [ ] Owl takes selected clay only when idle; pot appears after 8 s; clicking owl moves it to the fox's HUD.
- [ ] Fox carrying clay cannot take a pot (and vice versa); a full inventory refuses too; nothing is lost.
- [ ] Pot loads into kiln, fires 10 s, cools 10 s, fired pot (darker) returns to fox.
- [ ] E cycles, SPACE drops the selected item (clay or pot).
- [ ] Play Again starts with everything empty. No console errors.
- [ ] Grep finds no `heldItem` or `backpack` remnants.

**Constraints** — Crafty 0.9.0, no new deps, plain script tags in `index.html`. New `components/inventory.js`; edits to `fox.js`, `potter.js`, `kiln.js`, `game.js`, `game_state.js`, `constants.js`, HUD component. Update `components/README.md` if it lists components.

**Open questions** — None. Decided: the fox holds one item type at a time (so it can now carry 2 pots); the owl takes one clay at a time, only when idle.

**Tasks**
- [ ] Write `Inventory` + `transfer` helper
- [ ] Fox onto Inventory (selection, drop, speed)
- [ ] Merge HUD components into one inventory display
- [ ] Owl (`Potter`) onto Inventory
- [ ] Kiln onto Inventory
- [ ] Simplify click handlers in `game.js`; remove `heldItem`/`backpack`
- [ ] Verify all acceptance criteria in browser
