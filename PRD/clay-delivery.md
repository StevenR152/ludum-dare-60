# PRD: Fox delivers clay to the owl

**Goal** — The owl only makes pots from clay the fox digs and hands him; the free refill goes.

**Context**
- The fox digs clay into `Fox.backpack` (up to `BACKPACK_CAPACITY` clay types, shown in the HUD, slows the fox per kg). E cycles the selected slot; touch has no E, so phones always use slot 1.
- The `Potter` component (owl) takes clay via `ClayDelivered` with an amount, but `startPot()` re-triggers `ClayDelivered, 1` as a placeholder, so clay never runs out.
- Clicking the owl while touching him takes his finished pot if `gameState.heldItem` is empty (`scenes/game.js`). Taps on the owl don't also press SPACE.

**Scope** — Remove the placeholder refill and the starting clay. Clicking the owl while touching hands over the selected backpack clay if he has room, then the existing pot pickup runs as before.
**Out of scope** — Clay types mattering to the owl (he just counts kilos), orders, showing the owl's clay count, sounds, art.

**Flow**
1. Scene loads. The owl has 0 clay and makes nothing.
2. The fox digs clay outside, walks through the door to the owl, and picks a slot with E.
3. The fox clicks the owl while touching him. The selected clay leaves the backpack, the HUD strip redraws, the fox speeds up by one kilo, and a status reads "Gave the master one kilo of <type> clay".
4. The owl starts a pot straight away if his hands are free, using the clay. He can hold one clay in stock at a time, so the fox can drop off the next while he works.
5. In the same click, if the owl holds a pot and the fox's hands are empty, the fox takes the pot (unchanged).

**Requirements**
1. `Potter.startPot()` no longer triggers `ClayDelivered`; `owl.clay` only goes up on delivery.
2. The owl starts with 0 clay and holds at most `OWL_CLAY_CAPACITY` (1) in stock.
3. Clicking the owl while touching, with a non-empty backpack and the owl below capacity, removes the selected clay, triggers `ClayDelivered` with 1, clamps the selection and triggers `BackpackChanged`. This works whether or not the fox holds something in its hands.
4. If the owl is at capacity, nothing is removed and the status reads "The master already has clay".
5. Clicking from a distance delivers nothing.
6. Touching and clicking with an empty backpack while the owl has no clay, no pot and isn't making one shows "The master needs clay to make pots".
7. Delivery shows a status message naming the clay type.
8. Pot pickup still works in the same click and is unaffected by delivery.

**Acceptance criteria**
- [ ] One pot appears for each clay delivered, 8 seconds after the potter starts it; with no delivery, none appear.
- [ ] Carrying 2 clays and clicking the owl from far away changes nothing.
- [ ] Clicking while touching removes only the selected clay from the HUD, speeds the fox up by one kilo and shows the status. The owl starts a pot.
- [ ] While he's making that pot, a second click is accepted (`owl.clay` is 1). A third click is refused with "The master already has clay", and the backpack keeps that clay.
- [ ] Two clays delivered make two pots in turn (taking each one).
- [ ] Holding a pot in hands, clicking with clay in the backpack still delivers the clay.
- [ ] Clicking with a pot ready and clay in the backpack delivers one clay and picks up the pot.
- [ ] With an empty backpack and an idle, empty-handed owl, clicking him shows "The master needs clay to make pots".
- [ ] Digging, E/SPACE backpack keys, doors and kiln still behave as before.

**Constraints** — Crafty 0.9.0, no new deps. Changes in `components/potter.js` (`canTakeClay()`, `isIdle()`), `components/fox.js` (a `takeSelected()` method shared by dropping and delivering), `scenes/game.js` owl click, `OWL_CLAY_CAPACITY` in `constants.js`.

**Open questions** — None.

**Tasks**
- [ ] Remove the placeholder refill, start the owl at 0 clay, add `OWL_CLAY_CAPACITY`, `canTakeClay()` and `isIdle()` in `potter.js`; update the header comment
- [ ] Add `Fox.takeSelected()` (removes and returns the selected clay or null, triggers `BackpackChanged`); `dropSelected` uses it
- [ ] Owl click in `game.js`: deliver the selected clay (with statuses) before the pot pickup
- [ ] Verify the acceptance criteria in the browser

## Decisions
1. Delivery → the selected slot only, one kilo per click (chosen over the whole backpack).
2. Starting clay → 0, so every pot comes from delivered clay.
3. Delivering while holding something in hands → allowed; backpack and hands are independent (default).
4. Empty-handed click on an idle owl → status "The master needs clay to make pots" (default).
5. Owl clay stock → at most 1 at a time for now, in a constant so it's easy to raise.
