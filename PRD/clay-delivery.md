# PRD: Fox delivers clay to the owl

**Goal** — The owl only makes pots from clay the fox digs and hands him; the free refill goes.

**Context**
- The fox digs clay into `Fox.backpack` (up to `BACKPACK_CAPACITY` clay types, shown in the HUD, slows the fox per kg). E cycles the selected slot; touch has no E, so phones always use slot 1.
- The `Potter` component (owl) takes clay via `ClayDelivered` with an amount, but `startPot()` re-triggers `ClayDelivered, 1` as a placeholder, so clay never runs out.
- Clicking the owl while touching him takes his finished pot if `gameState.heldItem` is empty (`scenes/game.js`). Taps on the owl don't also press SPACE.

**Scope** — Remove the placeholder refill and the starting clay. Clicking the owl while touching takes his pot (as before), then hands over the selected backpack clay if he's idle.
**Out of scope** — Clay types mattering to the owl (he just counts kilos), orders, a clay stockpile, showing the owl's clay, sounds, art.

**Flow**
1. Scene loads. The owl has 0 clay and makes nothing.
2. The fox digs clay outside, walks through the door to the owl, and picks a slot with E.
3. The fox clicks the owl while touching him. If he holds a finished pot and the fox's hands are empty, the fox takes it first (unchanged).
4. If the owl is now idle (no clay, not making a pot, not holding one), the selected clay leaves the backpack, the HUD strip redraws, the fox speeds up by one kilo, a status reads "Gave the master one kilo of <type> clay", and he starts a pot.
5. If he isn't idle, he refuses: "The master is busy, come back when he's done". The backpack keeps its clay.

**Requirements**
1. `Potter.startPot()` no longer triggers `ClayDelivered`; `owl.clay` only goes up on delivery.
2. The owl starts with 0 clay. `Potter.isIdle()` is true when he has no clay, isn't making a pot and holds no pot.
3. In the owl click, pot pickup runs before delivery, so one click can take a pot and hand over clay.
4. Touching and clicking with a non-empty backpack and an idle owl removes the selected clay, triggers `ClayDelivered` with 1, clamps the selection and triggers `BackpackChanged`. Whatever the fox holds in its hands doesn't matter.
5. If the owl isn't idle, nothing is removed and the busy status shows.
6. Clicking from a distance does nothing.
7. Touching and clicking with an empty backpack and an idle owl shows "The master needs clay to make pots".

**Acceptance criteria**
- [x] With no delivery, no pots appear. Each delivered clay gives one pot, 8 seconds later.
- [x] Carrying 2 clays and clicking the owl from far away changes nothing.
- [x] Clicking an idle owl while touching removes only the selected clay from the HUD, speeds the fox up by one kilo, shows the status, and he starts a pot.
- [x] Clicking again while he's making it shows the busy status, and the backpack keeps its clay.
- [x] Empty-handed, clicking when his pot is ready takes the pot and hands over the next clay in one click.
- [x] Holding a pot in hands while his pot is ready: the click is refused as busy and both pots stay put.
- [x] Holding a pot in hands with an idle owl: clay is still delivered.
- [x] Empty backpack and idle owl: clicking him shows "The master needs clay to make pots".
- [ ] Digging, E/SPACE backpack keys, doors and kiln still behave as before. (E and SPACE verified; digging, doors and kiln code untouched but not re-clicked.)

**Constraints** — Crafty 0.9.0, no new deps. Changes in `components/potter.js` (`isIdle()`), `components/fox.js` (a `takeSelected()` method shared by dropping and delivering), `scenes/game.js` owl click.

**Open questions** — None.

**Tasks**
- [x] Remove the placeholder refill, start the owl at 0 clay, add `isIdle()` in `potter.js`; update the header comment
- [x] Add `Fox.takeSelected()` (removes and returns the selected clay or null, triggers `BackpackChanged`); `dropSelected` uses it
- [x] Owl click in `game.js`: pot pickup, then deliver the selected clay (with statuses)
- [x] Verify the acceptance criteria in the browser

## Decisions
1. Delivery → the selected slot only, one kilo per click (chosen over the whole backpack).
2. Starting clay → 0, so every pot comes from delivered clay.
3. Delivering while holding something in hands → allowed; backpack and hands are independent (default).
4. Empty-handed click on an idle owl → status "The master needs clay to make pots" (default).
5. Owl clay → only accepted when he's completely idle; no stockpile. Pot pickup runs first in the click so a ready pot doesn't block delivery.
