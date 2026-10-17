# PRD: Fox delivers clay to the owl

**Goal** — The owl only makes pots from clay the fox digs and hands him; the free refill goes.

**Context**
- The fox digs clay into `Fox.backpack` (up to `BACKPACK_CAPACITY` clay types, shown in the HUD, slows the fox per kg). E cycles the selected slot.
- The `Potter` component (owl) takes clay via `ClayDelivered` with an amount, but `startPot()` re-triggers `ClayDelivered, 1` as a placeholder, so clay never runs out.
- Clicking the owl while touching him takes his finished pot if `gameState.heldItem` is empty (`scenes/game.js`).

**Scope** — Remove the placeholder refill and the starting clay. Clicking the owl while touching hands over the selected backpack clay, then the existing pot pickup runs as before.
**Out of scope** — Clay types mattering to the owl (he just counts kilos), orders, showing the owl's clay count, sounds, art.

**Flow**
1. Scene loads. The owl has 0 clay and makes nothing.
2. The fox digs clay outside, walks through the door to the owl, and picks a slot with E.
3. The fox clicks the owl while touching him. The selected clay leaves the backpack, the HUD strip redraws, the fox speeds up by one kilo, and a status reads "Gave the master one kilo of <type> clay".
4. In the same click, if the owl holds a pot and the fox's hands are empty, the fox takes the pot (unchanged).
5. The owl makes one pot per clay (8 s each) while his hands are free, until his clay runs out.

**Requirements**
1. `Potter.startPot()` no longer triggers `ClayDelivered`; `owl.clay` only goes up on delivery.
2. The owl starts with 0 clay.
3. Clicking the owl while touching, with a non-empty backpack, removes the selected clay, triggers `ClayDelivered` with 1, clamps the selection and triggers `BackpackChanged`.
4. Clicking from a distance, or with an empty backpack, delivers nothing.
5. Delivery shows a status message naming the clay type.
6. Pot pickup still works in the same click and is unaffected by delivery.

**Acceptance criteria**
- [ ] One pot appears for each clay delivered, 8 seconds after the potter starts it; with no delivery, none appear.
- [ ] Carrying 2 clays and clicking the owl from far away changes nothing.
- [ ] Clicking while touching removes only the selected clay from the HUD, speeds the fox up by one kilo, shows the status, and `owl.clay` rises by 1.
- [ ] Delivering 2 clays (two clicks) to an idle owl makes two pots in turn (taking each one).
- [ ] Clicking with a pot ready and clay in the backpack delivers one clay and picks up the pot.
- [ ] Digging, E/SPACE backpack keys, doors and kiln still behave as before.

**Constraints** — Crafty 0.9.0, no new deps. Changes in `components/potter.js`, `components/fox.js` (a `takeSelected()` method shared by dropping and delivering), `scenes/game.js` owl click.

**Open questions** — None.

**Tasks**
- [ ] Remove the placeholder refill and start the owl at 0 clay in `potter.js`; update the header comment
- [ ] Add `Fox.takeSelected()` (removes and returns the selected clay or null, triggers `BackpackChanged`); `dropSelected` uses it
- [ ] Owl click in `game.js`: deliver the selected clay (with status) before the pot pickup
- [ ] Verify the acceptance criteria in the browser

## Decisions
1. Delivery → the selected slot only, one kilo per click (chosen over the whole backpack).
2. Starting clay → 0, so every pot comes from delivered clay.
