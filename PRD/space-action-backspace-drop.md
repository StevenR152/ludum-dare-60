# PRD: SPACE to act, BACKSPACE to drop, tap inventory on phones
**Goal** — SPACE does what a click does on whatever the fox is touching; BACKSPACE drops the selected item; on phones, tapping the fox's inventory slots selects and drops.

**Context**
- Was: SPACE = drop (`Fox.onKeyDown`); actions are `MouseDown` handlers on entities that check `fox.touches(this)`; hold actions (dig, wedge, chop) use `MouseDown`/`MouseUp`.
- Decided: D stays a walking key (WASD kept), so drop is BACKSPACE. Phone tap on empty ground = SPACE (act). Phones had no way to drop or cycle slots; swipe-down was tried and replaced (a steering flick could drop by accident).
- The fox's pack is drawn by `InventoryHud` (`components/inventory_hud.js`): HUD-layer grey squares, not clickable today. The same component draws the owl's row.

**Scope** — Done: `Fox` fires `MouseDown`/`MouseUp` on the nearest touched world `Mouse` entity on SPACE down/up; BACKSPACE drops. To do: make the fox's HUD slots tappable; remove the swipe-down gesture. Clicking in the world unchanged.
**Out of scope** — Owl's row, menu buttons, new interactions, walking keys.

**Requirements**
1. (Done) SPACE down triggers `MouseDown` on the touched non-HUD `Mouse` entity whose centre is nearest the fox's (tie: higher z); SPACE up triggers `MouseUp` on it. Nothing touched: nothing happens. Auto-repeat fires once.
2. (Done) BACKSPACE calls `dropSelected` ("Nothing to drop" when empty).
3. Pressing a filled slot in the fox's HUD row: if it is not the selected slot, select it; if it is selected, call `dropSelected`. Empty slots do nothing. Works with mouse and touch, and the tap does not also send SPACE (touches on `Mouse` entities are left to Crafty).
4. The owl's HUD row is not tappable.
5. No swipe gesture is configured (remove `swipe: {down: "BACKSPACE"}` from `main.js`).
6. World clicks behave as before.

**Acceptance criteria**
- [x] SPACE at the kiln acts like a click; on a dropped item picks it up.
- [x] Holding SPACE on clay digs; early release cancels; a full hold digs.
- [x] SPACE away from everything: no message, no state change.
- [x] BACKSPACE returns clay to its node / drops a model; empty pack: "Nothing to drop".
- [x] With 2 items, tapping the unselected slot selects it (white outline moves); tapping it again drops it and the other becomes selected.
- [x] Tapping an empty slot or the owl's slots does nothing.
- [x] A slot tap does not also act on the world (no SPACE pulse).
- [x] No swipe is configured, so a downward flick no longer drops.
- [x] Slot press works with a real mouse press (touch layer treats the slot as UI, so no SPACE); `?touch=1` not exercised.
- [ ] Not device-tested: real phone; the 40 px slots may be small for thumbs.

**Constraints** — `components/inventory_hud.js` (tap handling), `scenes/game.js` or wherever the fox row is built (to enable it for the fox only), `main.js`, README (phone wording), `itch-description.html` if needed; Crafty 0.9.0; no new files.
**Open questions** — None. Decided: a single carried item counts as selected, so one tap on it drops it at once.

**Tasks**
- [x] `fox.js`: SPACE act / BACKSPACE drop
- [x] README, itch description, `dropped_item.js` wording for SPACE/BACKSPACE
- [x] `inventory_hud.js`: opt-in tappable slots (`MouseDown`) for the fox row; select or drop per Requirement 3
- [x] `main.js`: remove the swipe config; update mobile wording in README and `mobile` comments
- [x] Verify in browser (mouse and triggered presses; no real touch)
