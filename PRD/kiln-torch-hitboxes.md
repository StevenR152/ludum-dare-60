# PRD: Kiln, torch and static-station hit boxes
**Goal** — Make the click/touch areas of the kiln and torch (and any other static craft area that is clearly off) match the art the player sees.

**Context**
- Kiln: `KILN_ART_BOX` 260×181 (`constants.js`) is the opaque bounds of `kiln_base.png`, so it includes the dome's empty top corners and the soft ground shadow. The whole rectangle takes the click (`scenes/game.js:90`), and fox reach uses the same box.
- Torch: hand-set 52×72 box at (1520, 549) (`game.js:100`). In an overlay on the art it sits ~7 px right of the flames and ~10 px above their top, mostly over the stone wall; it is drawn after the kiln so it wins clicks where they overlap.
- Inside stations (workbench, scales, both shelves, glaze buckets, door) line up with `background_inside.png` when overlaid. The master's wheel box `POTTER_WHEEL` (80×60) is not on the wheel disc (~190×100, about 330 px left of it); trees are equal slices of `FOREST_BOX`. The unused new interior art (`background_interior-*.png`) is not wired in.

**Scope** — Kiln box, torch box, plus a checked fix for each other box the overlay shows as clearly off (wheel; trees if confirmed). **Out of scope** — art (never edited), station logic/timings, door boxes, clay patches, the new interior art, mobile controls.

**Flow**
1. Fox stands in front of the kiln; pressing the kiln body (door, stones) loads/collects as today.
2. Pressing beside or above the dome, or on the ground shadow, does nothing.
3. Fox stands at the fire and presses the flames/wood pile: the kiln lights; the torch never steals clicks from the kiln door.

**Requirements**
1. Kiln press area follows the kiln's visible pixels (alpha mask of `kiln_base.png`, same method as clay), ignoring the soft ground shadow.
2. Torch press area covers the fire/wood pile in both kiln pictures, from the pictures, not hand-guessed numbers.
3. Overlapping torch/kiln pixels go to the torch; the rest of the kiln stays clickable.
4. Fox reach rules ("I can't reach the kiln from here") unchanged.
5. `DEBUG_HITBOXES` outlines wrap the new areas.
6. Any other box changed only if it is verified off in an overlay, and listed in Decisions.

**Acceptance criteria**
- [ ] Debug outline hugs the kiln and fire for both lit and unlit pictures.
- [ ] Press on door, stone, fire works; on empty corners and ground shadow does nothing.
- [ ] Lighting, loading, collecting, firing unchanged.
- [ ] No console errors.

**Constraints** — Plain Crafty ES5; `scenes/game.js`, `components/kiln.js`, `constants.js` (+ `forest.js`/wheel only if confirmed); art untouched.

**Open questions**
- What exactly feels wrong with the kiln and torch today (too small, too big, wrong place)?
- Pixel mask or simple tighter rectangles? Which other areas should change (wheel, trees, others)?

**Tasks**
- [ ] Overlay-check kiln, torch and the other candidates; confirm list
- [ ] Kiln alpha mask + tighter box
- [ ] Torch box/mask from the fire pixels; priority over kiln
- [ ] Fix confirmed extras
- [ ] Verify in debug view; tick criteria
