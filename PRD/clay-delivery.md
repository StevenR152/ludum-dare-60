# PRD: Fox delivers clay to the owl

**Goal** — The owl only makes pots from clay the fox digs and hands him; the free refill goes.

**Context**
- The fox digs clay into `Fox.backpack` (up to `BACKPACK_CAPACITY` clay types, shown in the HUD, slows the fox per kg).
- The `Potter` component (owl) takes clay via `ClayDelivered` with an amount, but `startPot()` re-triggers `ClayDelivered, 1` as a placeholder, so clay never runs out.
- Clicking the owl while touching him takes his finished pot if `gameState.heldItem` is empty (`scenes/game.js`).

**Scope** — Remove the placeholder refill. Clicking the owl while touching hands over every clay in the backpack, then the existing pot pickup runs as before.
**Out of scope** — Clay types mattering to the owl (he just counts kilos), orders, showing the owl's clay count, sounds, art.

**Flow**
1. Scene loads. The owl has 1 clay, makes one pot (8 s) and then has 0 clay. No more pots appear on their own.
2. The fox digs clay outside, walks through the door to the owl.
3. The fox clicks the owl while touching him. The backpack empties, the HUD strip clears, the fox speeds back up, and a status reads "Gave the master N kilos of clay".
4. In the same click, if the owl holds a pot and the fox's hands are empty, the fox takes the pot (unchanged).
5. The owl keeps making pots, one per clay, while his hands are free, until his clay runs out.

**Requirements**
1. `Potter.startPot()` no longer triggers `ClayDelivered`; `owl.clay` only goes up on delivery.
2. The owl still starts with 1 clay.
3. Clicking the owl while touching, with a non-empty backpack, triggers `ClayDelivered` with the backpack size, empties the backpack, resets the selection and triggers `BackpackChanged`.
4. Clicking from a distance, or with an empty backpack, delivers nothing.
5. Delivery shows a status message with the number of kilos.
6. Pot pickup still works in the same click and is unaffected by delivery.

**Acceptance criteria**
- [ ] With no delivery, exactly one pot appears; after taking it, no new pot appears after 8 s+.
- [ ] Carrying 2 clays and clicking the owl from far away changes nothing.
- [ ] Clicking while touching empties the HUD backpack, restores fox speed, shows the status, and `owl.clay` rises by 2.
- [ ] After delivering 2 clays to an idle owl, two pots come out in turn (taking each one).
- [ ] Clicking with a pot ready and clay in the backpack delivers the clay and picks up the pot.
- [ ] Digging, E/SPACE backpack keys, doors and kiln still behave as before.

**Constraints** — Crafty 0.9.0, no new deps. Changes in `components/potter.js`, `components/fox.js` (a `giveAllClay()` method that empties the backpack and returns the count), `scenes/game.js` owl click.

**Open questions**
1. Deliver the whole backpack per click (default) or only the selected slot?
2. Keep the owl's 1 starting clay (default) or start at 0?

**Tasks**
- [ ] Remove the placeholder refill and its comment in `potter.js`; update the header comment
- [ ] Add `Fox.giveAllClay()` returning the count and triggering `BackpackChanged`
- [ ] Owl click in `game.js`: deliver clay (with status) before the pot pickup
- [ ] Verify the acceptance criteria in the browser
