# PRD: Kiln fires the owl's pots

**Goal** — The fox loads the owl's unfired pot into the outdoor kiln, which fires it for 10 s, cools it for 10 s, and then gives back a fired pot for the fox to carry.

**Context**
- Loop so far: the owl throws a pot every 8 s and the fox clicks him to carry it as `gameState.heldItem = {type: "pot"}`. Clay delivery to the owl is another engineer's area.
- Clicking things only works while the fox touches them (doors, owl). SPACE drops the held item, which just disappears.
- There is no kiln yet. The kiln art sits on the Outside map, near x 1605–1960, y 527–759.

**Scope** — A `Kiln` component (zone square, fire → cool → ready states, held pot), click to load and unload, and a fired pot that looks different in the HUD slot.
**Out of scope** — Clay delivery (other engineer), wood, glazing, cracking (later) or timing skill, a second kiln, firing several pots at once, timer bars, sounds, real kiln art. Dropping stays the existing SPACE testing aid.

**Flow**
1. Outside, a translucent square covers the front of the kiln, drawn behind the fox. It is the kiln's "at the kiln" zone and click target.
2. The fox carries an unfired pot until it overlaps the square, then clicks the square. The pot leaves the HUD slot and the kiln starts **firing** (square turns orange-red).
3. After 10 s it switches to **cooling** (square turns grey-blue).
4. After 10 more seconds it is **ready**: a fired pot box shows on the kiln. It waits there for as long as it takes.
5. With empty hands, the fox clicks the square and gets `{type: "pot", fired: true}`. The HUD slot shows it in a darker terracotta colour. The kiln is empty again.
6. SPACE drops the fired pot, the same as any held item.

**Requirements**
1. The zone square is at x 1605, y 527, 355×232. That is exactly the area the fox's body covers when its position is anywhere from (1605, 527) to (1800, 657), the corners logged in game.
2. The fox counts as "at the kiln" when its body overlaps the square, the same rule as the doors and the owl. The fox always draws in front of game items: the square, the pot boxes, the owl, the doors and the clay.
3. Clicking while at the kiln, with the kiln empty and an unfired pot in hand, loads the pot and starts firing.
4. The kiln fires for `KILN_FIRE_MS` (10000), then cools for `KILN_COOL_MS` (10000), then holds one fired pot until the fox takes it. It never cracks.
5. Clicking while at the kiln, with a fired pot ready and empty hands, moves it to `gameState.heldItem = {type: "pot", fired: true}`.
6. Any other click does nothing: from outside the zone, while firing or cooling, empty-handed with nothing ready, loading a fired pot, or with hands full when a pot is ready.
7. The HUD slot shows a fired pot in `FIRED_POT_COLOR`, an unfired pot in `POT_COLOR`.
8. A new run starts with an empty kiln. It is created with the Game scene, so this comes for free.

**Acceptance criteria**
- [x] The square sits over the kiln front, behind the fox. A click works while the fox overlaps the square, including at each of the four logged positions, and does nothing once the fox is clear of it.
- [x] Clicking with an unfired pot while overlapping the square empties the HUD slot and turns the square orange-red. From outside, nothing happens.
- [x] About 10 s later the square turns grey-blue, and about 10 s after that a fired pot appears on the kiln and stays there.
- [x] Clicking during firing or cooling, with or without a pot, changes nothing.
- [x] Clicking with empty hands when ready puts a terracotta pot in the HUD slot and clears the kiln. Clicking with a pot in hand when ready leaves both where they are.
- [x] SPACE drops the fired pot. The owl, doors, clay patches and timer behave as before.
- [ ] Works with the mouse and with a tap (mouse verified; tap not yet tested on a device).

**Constraints** — Crafty 0.9.0, no new dependencies. New `components/kiln.js` (added to `index.html`), timings and colours in `constants.js`, wiring in `scenes/game.js`, HUD colour in `components/inventory_slot.js`. Placeholder art uses coloured boxes.

**Open questions** — None.

**Tasks**
- [x] Add `KILN_FIRE_MS`, `KILN_COOL_MS`, `FIRED_POT_COLOR` and the state colours to `constants.js`
- [x] `Kiln` component: zone square, empty/firing/cooling/ready states, fired pot box, `loadPot()` and `takePot()`
- [x] Place the kiln Outside, wire the click with the overlap check, and keep the fox in front of game items in `game.js`
- [x] HUD slot shows fired pots in terracotta
- [x] Verify the acceptance criteria in the browser

## Decisions
1. What goes in the kiln → the owl's unfired pot, not raw clay.
2. Zone square → stays visible for now, as placeholder kiln art that shows firing and cooling.
3. At the kiln → the fox overlapping the square is enough, like the doors and the owl.
4. Loading and collecting → by click, not automatically on entering the square.
5. Ready pot → waits forever for now. Cracking comes later.
6. Draw order → the fox is always in front of game items, including the square.
