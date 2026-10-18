# PRD: Trash bin

**Goal** — An outdoor bin is the one place the fox can discard items, so throwing something away (e.g. a cracked pot) costs the time of walking there.

**Context**
- Today SPACE drops the selected item anywhere, and it just disappears (`fox.dropSelected`). That is a testing aid.
- Clicking works only while the fox overlaps a zone square (kiln, doors, owl); the kiln is the model for a click target.
- Cracked pots (`PRD/clay-firing-levels.md`) can't go on the completed shelf, so the bin is where they end up.
- Not built yet; this is the spec for a later session.

**Scope** — A `Bin` component (zone square placed Outside, like the kiln), click to discard the fox's selected item, and removing the free SPACE drop.
**Out of scope** — Recovering discarded items, recycling clay, a score or penalty beyond walking time, bin art or sounds, a second bin, indoor bins.

**Flow**
1. The fox carries an item (clay, a pot or a cracked pot) Outside to the bin's square.
2. The fox overlaps the square and clicks it.
3. The selected item leaves the fox's inventory and is gone. A status line says what was thrown away.
4. Anywhere else, SPACE no longer drops anything.

**Requirements**
1. `Bin` is a translucent zone square drawn behind the fox, in a new colour `BIN_COLOR` in `constants.js`. It sits at x 1385, y 590, size 160×102 (the fox's size), so a fox standing at (1385, 590) covers it exactly. It is clear of the kiln square (starts x 1605).
2. The fox counts as "at the bin" when its body overlaps the square, the same rule as the kiln.
3. A click while at the bin with something selected takes that item out of `fox.inventory` (`take()`), ending its life. Any item is accepted: clay, an unfired pot, a fired pot or a cracked pot.
4. A click from outside the square, or with empty hands, does nothing (status: "Nothing to throw away").
5. SPACE no longer drops items; `fox.dropSelected` and its key binding are removed. The bin is the only way to get rid of an item.
6. No inventory limit or fuller state; the bin never fills.

**Acceptance criteria**
- [ ] The square sits Outside at (1385, 590) behind the fox; a click works while overlapping and does nothing once clear.
- [ ] Clicking with a held pot, clay or cracked pot empties that HUD slot and shows the status.
- [ ] Clicking empty-handed does nothing but the status.
- [ ] SPACE does nothing; a full pack can still be emptied by going to the bin.
- [ ] Works with mouse and tap (tap not yet tested on a device).

**Constraints** — Crafty 0.9.0, no new deps. New `components/bin.js` (in `index.html`), colour and position in `constants.js`/`scenes/game.js`, removal of the drop in `fox.js` and the README line on SPACE.

**Open questions** — None.

**Tasks**
- [ ] `BIN_COLOR` and position constant
- [ ] `Bin` component: zone square, overlap check, discard on click
- [ ] Place it Outside in `game.js`
- [ ] Remove the SPACE drop from `fox.js`; README
- [ ] Verify in the browser

## Decisions
1. Position: the fox at x 1385, y 590 is the bin spot; the square is placed there at the fox size (160x102).
2. The SPACE drop is removed; the bin is the only way to discard.
3. The bin takes whatever is selected, any item type.
