# PRD: Pottery displayed in-world (shelves + master's wheel)

**Goal** — Pottery is shown in the house itself: one display per slot on both shelves, and the master's work on his spinning circle.

**Context**
- `Shelf.drawSlots` (`components/shelf.js`) draws a 40x40 box per slot with `paintItem`; `DryingShelf` and `CompletedShelf` have 3 slots each.
- The owl (`Potter`, 160x152 at -1660,327) holds up to 5 things (clay, models, pots to trim/collect). He only shows a finished pot in `potBox`, low on his body; nothing sits on the wheel.
- `paintItem(box, item)` already draws pot sprites, clay cubes, the cracked X and firing badges. No new art is needed.

**Scope** — Wheel display and its constant; both shelves keep one display per slot.
**Out of scope** — New or edited art (art stays human-made); wheel spin animation; shelf display repositioning/constants (deferred, user will revisit); HUD, kiln, dropped items; `Potter` job logic; shelf rules.

**Flow**
1. Fox gives the master clay + model: while he throws, the clay (then the new pot) shows on the wheel; the model is not shown.
2. Fox gives him a pot to trim: the pot shows on the wheel during the trim.
3. Job done: if the finished pot is the only thing he holds, it stays on the wheel. If he holds anything else, it moves to the `potBox` spot and the wheel is empty.
4. Fox takes the pot: the wheel and `potBox` clear.

**Requirements**
1. `constants.js` gets `POTTER_WHEEL = {x, y, w, h}` (world px, top-left; item fitted and centred), default x = owl right edge + 100 (-1400), near the owl's lower front. Commented for art alignment; editing it moves the display with no other change.
2. While `working`, the wheel shows the first clay or pot in his inventory (models skipped) via `paintItem`.
3. When idle: a lone finished pot in his inventory shows on the wheel; otherwise a finished pot shows in `potBox` (as today) and the wheel is empty. Nothing else is displayed (waiting clay, models, pots queued).
4. The wheel refreshes on his `InventoryChanged` and when a job starts or ends; it sits still, above the owl and inside art, and never blocks clicks on the owl.
5. Both shelves still show one display per slot (item sprite, bar, border) and refresh on `InventoryChanged`.

**Acceptance criteria**
- [ ] Throw: clay then the new pot appear on the wheel; the model never does.
- [ ] Trim: the pot is on the wheel during the trim.
- [ ] Finished pot alone in his hands stays on the wheel; with anything else held, it shows at `potBox` and the wheel is empty.
- [ ] Idle with only clay or models: wheel empty. Taking the pot clears the display.
- [ ] Editing `POTTER_WHEEL` and reloading moves/resizes the wheel display.
- [ ] Each slot of both shelves shows its pot and empties when taken.
- [ ] Clicking the wheel still reaches the owl; no console errors.

**Constraints** — Crafty 0.9.0, no new deps. Edit `constants.js`, `components/potter.js` (and `shelf.js` only if a fix is needed).

**Open questions** — Shelf displays: what is missing beyond today's slot boxes (larger, art-aligned, per-slot constants, a stand)? User will check in later.

**Tasks**
- [ ] Add `POTTER_WHEEL` to `constants.js`
- [ ] Wheel display in `Potter`: job-item rule while working, lone-finished-pot rule when idle, `potBox` otherwise
- [ ] Check z-order and click-through
- [ ] Confirm both shelves' slot displays still update
- [ ] Verify each acceptance item in the browser

## Decisions
- 1. Shelf display change → deferred, user will check in later.
- 2. Both shelves in scope (shelf displays kept as they are).
- 3. Wheel shows first clay or pot, models skipped.
- 4. Shown on the wheel during processing; a finished pot stays if alone, else moves to `potBox`; nothing else shown.
- 5. Wheel just right of the owl, ~100 units (x -1400, placeholder y/size).
- 6. Item sits still.
