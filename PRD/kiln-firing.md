# PRD: Kiln fires the owl's pots

**Goal** — The fox loads the owl's unfired pot into the outdoor kiln, which fires it for 10 s, cools it for 10 s, and then gives back a fired pot for the fox to carry.

**Context**
- Loop so far: the owl throws a pot every 8 s and the fox clicks him to carry it as `gameState.heldItem = {type: "pot"}`. Clay delivery to the owl is another engineer's area.
- Clicking things only works while the fox touches them (doors, owl). SPACE drops the held item, which just disappears.
- There is no kiln yet. The kiln art sits on the Outside map, near x 1605–1960, y 527–759.

**Scope** — A `Kiln` component (zone square, fire → cool → ready states, held pot), click to load and unload, and a fired pot that looks different in the HUD slot.
**Out of scope** — Clay delivery (other engineer), wood, glazing, cracking or timing skill, a second kiln, firing several pots at once, timer bars, sounds, real kiln art. Dropping stays the existing SPACE testing aid.

**Flow**
1. Outside, a translucent square covers the front of the kiln. It is the kiln's "at the kiln" zone and click target.
2. The fox carries an unfired pot into the square and clicks it. The pot leaves the HUD slot and the kiln starts **firing** (square turns orange-red).
3. After 10 s it switches to **cooling** (square turns grey-blue).
4. After 10 more seconds it is **ready**: a fired pot box shows on the kiln.
5. With empty hands, the fox clicks the square and gets `{type: "pot", fired: true}`. The HUD slot shows it in a darker terracotta colour. The kiln is empty again.
6. SPACE drops the fired pot, the same as any held item.

**Requirements**
1. The zone square is at x 1605, y 527, 355×232. That is exactly the area the fox's body covers when its position is anywhere from (1605, 527) to (1800, 657), the corners logged in game.
2. The fox counts as "at the kiln" only when its body is fully inside the square.
3. Clicking while at the kiln, with the kiln empty and an unfired pot in hand, loads the pot and starts firing.
4. The kiln fires for `KILN_FIRE_MS` (10000), then cools for `KILN_COOL_MS` (10000), then holds one fired pot.
5. Clicking while at the kiln, with a fired pot ready and empty hands, moves it to `gameState.heldItem = {type: "pot", fired: true}`.
6. Any other click does nothing: from outside the zone, while firing or cooling, empty-handed with nothing ready, loading a fired pot, or with hands full when a pot is ready.
7. The HUD slot shows a fired pot in `FIRED_POT_COLOR`, an unfired pot in `POT_COLOR`.
8. A new run starts with an empty kiln. It is created with the Game scene, so this comes for free.

**Acceptance criteria**
- [ ] The square sits over the kiln front. Standing at each of the four logged positions counts as at the kiln; one step outside any edge does not.
- [ ] Clicking with an unfired pot from inside the square empties the HUD slot and turns the square orange-red. From outside, nothing happens.
- [ ] About 10 s later the square turns grey-blue, and about 10 s after that a fired pot appears on the kiln.
- [ ] Clicking during firing or cooling, with or without a pot, changes nothing.
- [ ] Clicking with empty hands when ready puts a terracotta pot in the HUD slot and clears the kiln. Clicking with a pot in hand when ready leaves both where they are.
- [ ] SPACE drops the fired pot. The owl, doors, clay patches and timer behave as before.
- [ ] Works with the mouse and with a tap.

**Constraints** — Crafty 0.9.0, no new dependencies. New `components/kiln.js` (added to `index.html`), timings and colours in `constants.js`, wiring in `scenes/game.js`, HUD colour in `components/inventory_slot.js`. Placeholder art uses coloured boxes.

**Open questions**
- You wrote "deposits a clay he's holding". I've read that as the owl's unfired pot, since the fox only ever carries pots today. Right?
- Should the square stay visible in the finished game, or only while we lay out the scene?

**Tasks**
- [ ] Add `KILN_FIRE_MS`, `KILN_COOL_MS`, `FIRED_POT_COLOR` and the state colours to `constants.js`
- [ ] `Kiln` component: zone square, empty/firing/cooling/ready states, fired pot box, `loadPot()` and `takePot()`
- [ ] Place the kiln Outside and wire the click with the fully-inside check in `game.js`
- [ ] HUD slot shows fired pots in terracotta
- [ ] Verify the acceptance criteria in the browser
