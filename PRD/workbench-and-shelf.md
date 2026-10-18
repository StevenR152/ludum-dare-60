# PRD: Workbench, DryingShelf and CompletedShelf

**Goal** — Add three stations that fill the "Coming soon" gaps: a `Workbench` to measure and wedge clay, a `DryingShelf` to dry pots before firing, and a `CompletedShelf` that holds the finished pottery that will fulfil the orders.

**Context**
- Loop today: dig clay → owl throws a pot → kiln fires it. The fox, owl and kiln each own an `Inventory` (`components/inventory.js`); items move with `transferItem`. The fox holds 2 items of one type; E selects, SPACE drops.
- Zones are coloured squares that work when the fox overlaps them (kiln, owl, doors). Inside is a placeholder room at `INSIDE_X`, with a placeholder `GlazeStation` and the doors. Customer orders exist (`gameState.orders`) but can't be fulfilled yet.
- Nothing fires `GameOver` yet; the scene already goes to End on it. Fired pots are the stand-in for finished pottery until glaze works.

**Scope** — Three zone components inside the house on a shared `Shelf` base; a `wedged` flag on dug clay; a `dried` flag on pots; the owl takes only wedged clay; the kiln takes only dried pots; the fox HUD shows wedged clay (white outline) and dried pots (own colour); README and `index.html` updates.
**Out of scope** — Order matching and scoring, glaze and second firing, timer bars, cracking for bad wedging or drying, drying hacks, sounds, real art, new HUD rows.

**Flow**
1. Dig clay, go inside, pick a slot with E.
2. Workbench: hold-click for `WEDGE_MS` (3 s) while the fox overlaps it. The selected clay becomes wedged. "Measuring" is the one kilo taken per hold.
3. Owl: takes wedged clay only; otherwise "Wedge the clay on the workbench first". He throws a pot as before.
4. DryingShelf: click with the selected unfired pot to put it on a free slot. It dries for `DRY_MS` (15 s) per pot. Click with a dried pot waiting to take it.
5. Kiln: takes only dried pots; otherwise "The pot needs to dry first".
6. CompletedShelf: click with a fired pot to put it on. The 3rd pot ends the game after a short pause.

**Requirements**
1. `Clay.dig` hands the fox a copy of the clay type with `wedged: false`, so `CLAY_TYPES` is never changed.
2. Wedging finishes only if the fox still overlaps the bench and the selected item is unwedged clay at the end of the hold. Releasing early, walking off, no clay or already-wedged clay gives nothing (a status explains the last three).
3. `Potter.input` accepts only wedged clay.
4. `DryingShelf` holds `DRY_SLOTS` (3) pots, accepts unfired undried pots, releases only dried ones, shows a box per pot (wet or dried colour). A full shelf says "The drying shelf is full"; a click with nothing to take says nothing is dry yet.
5. `Kiln` accepts only pots with `dried` and not `fired`.
6. `CompletedShelf` holds `COMPLETED_CAPACITY` (3) fired pots, never gives them back (a `glazed` check comes with glaze). The 3rd pot triggers `GameOver` on the player after 1.5 s.
7. Inside layout (relative to `INSIDE_X`): workbench x 300 y 560 (300×160); drying shelf x 1500 y 330 (280×160); completed shelf x 1500 y 700 (300×160). The fox has no walls, so all are reachable.

**Acceptance criteria**
- [x] Owl refuses fresh clay with the wedge message and the pack keeps it; a 3 s bench hold wedges only the selected clay (white outline in the HUD); a short hold or walking off does not.
- [x] Wedged clay is accepted by the owl and the pot flows on as before.
- [x] A pot on the drying shelf turns dry after about 15 s and can then be collected; collecting early changes nothing; a 4th pot is refused.
- [x] The kiln refuses a wet pot and accepts a dried one.
- [x] A fired pot on the completed shelf leaves the fox's pack and shows on the shelf; other items change nothing. The 3rd ends the game on the End scene.
- [x] Digging, doors, owl, kiln and SPACE behave as before; no console errors.
- [ ] Works with mouse and tap (mouse verified; tap not device-tested).

**Constraints** — Crafty 0.9.0, no new deps. New `components/shelf.js`, `workbench.js`, `drying_shelf.js`, `completed_shelf.js` (in `index.html`), constants in `constants.js`, wiring in `scenes/game.js`, small edits to `clay.js`, `potter.js`, `kiln.js`, `inventory.js` (`itemColor`) and `inventory_hud.js`. The shelves' items live in their `Inventory`, which is rebuilt with the scene, so no `gameState` field is needed.

**Open questions** — None.

**Tasks**
- [x] Constants, `wedged` flag in `Clay.dig`, `itemColor` and HUD outline
- [x] `Workbench` + owl accepts wedged only
- [x] `Shelf` base + `DryingShelf` + kiln needs dried
- [x] `CompletedShelf` + game over
- [x] Wire stations in `game.js`; update README, `index.html`, components README
- [x] Verify acceptance criteria in the browser

## Decisions
1. Measuring → the one kilo the bench takes; a skill-based measure comes later (default).
2. Completed shelf → holds 3; the 3rd pot ends the game.
3. Fired pots count as completed for now; glaze changes this later.
4. Station positions → all reachable (no walls); chosen clear of the owl, door and glaze buckets.
5. Dried pots wait forever; cracking comes later, no failure state now.
