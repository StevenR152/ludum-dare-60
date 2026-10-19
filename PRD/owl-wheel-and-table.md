# PRD: Owl's pot moves from wheel to table
**Goal** — The clay or pot the owl is working on sits on his wheel at (-1743, 421); once he finishes, it moves to the table in front of him at (-1591, 437).
**Context**
- `Potter.showPot` (`components/potter.js:186`) puts the job's item on `wheel` at `POTTER_WHEEL` (`constants.js:215`, now x -1400, y 400, 80×60). Any finished pot he holds alone also stays on the wheel; with several, the oldest shows in `potBox` (40×40) low on the owl.
- Coordinates are world positions as logged by the click-logger in `scenes/game.js`; I read "well" as "wheel".
**Scope** — Move the wheel position; show finished pots on a table spot instead of the wheel or the owl's body. **Out of scope** — art, owl/fox positions, hitboxes, what the owl does with pots (throw/trim/take logic).
**Flow**
1. Fox gives the owl clay + model (or a pot to trim). The item appears on the wheel at (-1743, 421) while he works.
2. He finishes. The item leaves the wheel and appears on the table at (-1591, 437).
3. The fox takes it by clicking the owl; the table spot empties (next oldest finished pot, if any, shows there).
**Requirements**
1. The wheel item is centred on (-1743, 421); `POTTER_WHEEL` holds the centre and size, `showPot` derives x/y from it.
2. A finished pot never shows on the wheel, even when it is the only thing he holds.
3. The oldest finished pot is centred on (-1591, 437) via a new `POTTER_TABLE` constant (same 40×40 size as `potBox`), replacing the box low on the owl.
4. While he works, the wheel shows the job and the table shows any other finished pot already waiting.
**Acceptance criteria**
- [x] During a throw and during a trim, the item sits centred at the wheel point and nowhere else.
- [x] When the job ends, it appears on the table point and the wheel is empty.
- [x] Clicking the owl with a free slot clears the table spot, or shows the next finished pot.
- [x] Placed pots keep their colour/border (`paintItem`, `markBorder`); no console errors. (no console errors checked; colours not eyeballed, interior not on screen)
**Constraints** — `constants.js` and `components/potter.js` only; Crafty 0.9, no new assets.
**Open questions** — Are both points the item's centre (my assumption, matching the pre-placed pot convention), or its top-left?
**Tasks**
- [x] Set `POTTER_WHEEL` to the new centre and add `POTTER_TABLE`
- [x] Update `showPot`: wheel only for the working item, table for the oldest finished pot, centred
- [x] Update the header comment and `wheelItem` in `potter.js`
- [x] Verify in browser (throw, trim, take)
