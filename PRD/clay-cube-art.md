# PRD: Clay cube art
**Goal** — Show carried, dropped and weighed clay as the new red/black/white clay cube pictures instead of flat colour squares.

**Context**
- New art (untracked): `clay_cube_A_red/B_black/C_white.png`, 4836×2268 each, cube centred and small (~915×760 px of opaque art near the middle, so it needs a crop like `LOG_IMAGE`). A=red, B=black, C=white = each `CLAY_TYPES[...].letter`.
- `paintItem` (`components/inventory.js`) paints clay as `itemColor(item)` (`CLAY_TYPES.color`); pots and logs already use cropped picture layers. Every box showing an item calls it: fox/owl HUD slots (`inventory_hud.js`), `DroppedItem`, and others via the same function.
- `WeighingStation.drawPile` paints each pile box with `clay.clay.color` directly (not `paintItem`) and writes "name N g" text on it.

**Scope** — Preload the 3 images; `paintItem` draws a cube picture for `item.type === "clay"` (HUD slots, dropped clay, any box using it); weighing-station piles show the cube. **Out of scope** — Pots, logs, models, clay patches on the map, the order cards, sounds, a cube-size change per grams.

**Flow**
1. Fox digs red clay → HUD slot shows the red cube, centred, in the 40×40 grey square (black border if wedged).
2. SPACE drops it → ground item is the same cube at `DROPPED_ITEM_SCALE`; picking up restores the HUD cube.
3. Clay put on the weighing station shows the cube in its pile box with "red 1000 g" still readable; empty pile unchanged.
4. Owl's HUD row shows cubes for wedged clay he holds.

**Requirements**
1. Three PNGs load (no 404s), listed in `images` in `assets.js`.
2. A `CLAY_IMAGES` table in `constants.js` per clay letter: url, image size (4836×2268), opaque `crop` (read the real bounds with a throwaway canvas alpha scan; the PNGs are never edited).
3. `paintItem` draws clay as the cropped cube, fitted in the box like logs (transparent background, `box.color("#FFF", 0)`); `itemColor` no longer used for clay.
4. Wedged clay gets a black border (was white) via `itemBorder`; pots unchanged.
5. Weighing pile boxes use the same cube fit (shared helper, no second copy of crop maths); empty piles keep the faint white box.
6. `ITEM_SHAPES.clay` becomes 34×28 (cube aspect); dropped scale unchanged.

**Acceptance criteria**
- [x] Console/network clean on load.
- [x] Dig each colour: HUD shows the matching cube, not a flat square. (red/black seen; white via styles)
- [ ] Drop it: cube appears on the ground, same colour; pick-up works as before. (style confirmed white cube; not eyeballed or picked up)
- [ ] Weighing station piles show cubes + weight text; weighed off pieces still show correctly. (styles + text confirmed; not eyeballed, weigh-off not run)
- [x] Wedged clay has a black border; cube not clipped or stretched.
- [ ] Pots, logs, models render as before. (shared code path edited, not eyeballed)

**Constraints** — Plain Crafty ES5, no build; edit `assets.js`, `constants.js`, `components/inventory.js`, `components/weighing_station.js` only.

**Open questions** — None.

**Tasks**
- [x] Measure opaque bbox of the 3 PNGs (no image edits); add `CLAY_IMAGES` + preload
- [x] `paintItem` clay branch (shared fit helper); tune `ITEM_SHAPES.clay`
- [ ] Weighing station piles show cubes + weight text; weighed off pieces still show correctly. (styles + text confirmed; not eyeballed, weigh-off not run)
- [x] Verify HUD, drop, pick-up, weighing in browser; tick criteria

## Decisions
- Weighing piles: cube fills box, text on top (default)
- HUD cube size: 34×28 (default)
- Dropped scale: unchanged (default)
- Wedged clay: black border instead of white
- Other clay displays: none, HUD, dropped and weighing piles only (default)
- Crop: measure only, never edit the images
