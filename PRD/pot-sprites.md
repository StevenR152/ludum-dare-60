# PRD: Pot sprites and three clays (red, black, white)

**Goal** — The three clays become Red (A), Black (B) and White (C), and every pot shows the matching picture from `assets/images/pots/` (shape + clay + stage + glaze) instead of a coloured box.

**Context**
- Clay today is brown/red/blue (`CLAY_TYPES`, `constants.js`); its colour paints the clay patches, weighing-station piles, HUD clay boxes and order cards. Sounds (`WEDGE_SOUNDS`, `WET_POT_SOUND_SUFFIX`) and fire levels hang off the same names.
- Pots are drawn as boxes by `itemColor(item)` (`components/inventory.js`), used by the HUD, shelf, kiln, owl, dropped items. A pot knows `shape`, `clay.name`, `dryness`, `state`, `glaze[]` (0–2 dips), `cracked`.
- The 48 images (3 shapes × 16, complete, typos fixed by the artist) are 2268×2082 with the pot centred in white space. The sheet shows glaze 1 = orange, glaze 2 = pink; after the glaze firing they turn red and blue. Halfglazed = the dip over the lower half of the clay colour.

**Scope** — (c) Glazes are orange (Glaze A, glaze1, `#F47B30`) and pink (Glaze B, glaze2, `#EBA6DC`) everywhere: buckets, HUD, order cards, squares; `GLAZE_BUCKET_COLORS` is the single source. Orders show a pot sprite. (a) Rename/recolour the clays: A red, B black, C white, everywhere a clay colour or name is used. (b) `potSprite(item)` returns the image for a pot; register the images; draw them wherever a pot box is drawn, keeping bar, trimmed border and cracked X overlays. **Out of scope** — model/log art, bucket artwork, the glazing minigame, new artwork, changing balance.

**Flow (stage → image, per shape and clay)**
1. Owl throws a Cup/Bowl/Vase → unfired picture of that clay.
2. Dries, trimmed (same picture; bar shows the stage).
3. Bisque → `<shape>_clay<A|B|C>-fired`.
4. One dip → `-fired-halfglazed1|2` (1 = Glaze A orange, 2 = Glaze B pink). Two dips → `<shape>_fullyglazed<last dip>`.
5. Glaze firing → `<shape>_2nd-fire_glaze<last dip>`; an undipped pot keeps `-fired`.
6. Cracked pots keep their picture with the X on top.

**Requirements**
1. `CLAY_TYPES` becomes `red` (A), `black` (B), `white` (C), colours matched to the pot art (red ≈ `#E06450`, black ≈ `#2B2522`, white ≈ `#F5F0DC`, taken from the images). Clay patches, piles, HUD clay boxes and order cards use them. Names in sounds/orders/logs follow.
2. `potSprite(item)` is the only place mapping pot state to image. Shape: Cup→`smallpot`, Bowl→`bowl`, Vase→`vase`. Every combination has art, so no box fallback is built.
3. Images are never edited: scaled and offset in code (CSS background size/position, one shared crop box per shape) to fill the box, aspect ratio kept, same box sizes as today.
4. HUD, shelf, kiln, owl output, dropped items, the owl's pot box, the completed shelf and order cards (the ordered shape, clay and glaze) show sprites; non-pot items unchanged.
5. Bar, border and cracked X still draw on top.

**Acceptance criteria**
- [x] The three clay patches/piles/orders show red, black and white; no brown or blue remains.
- [~] A thrown Cup shows `smallpot_clayA/B/C` (red/black/white) and the same for Bowls and Vases, on owl, HUD, shelf and when dropped.
- [~] Bisque → `-fired` for each of the 3 clays × 3 shapes; one dip → halfglazed 1/2; two dips → fullyglazed; glaze fire → 2nd-fire.
- [x] Glaze buckets, HUD and order cards use orange and pink only; no red or yellow glaze square remains.
- [x] An order card shows the sprite of the ordered shape, clay and glaze.
- [x] Cracked pots show sprite + X; bar and border visible. No console errors or 404s; a full run works.

**Constraints** — Crafty 0.9.0, no new deps. Edits to `constants.js`, `assets.js`, `inventory.js`, `inventory_hud.js`, `shelf.js`, `drying_shelf.js`, `kiln.js`, `dropped_item.js`, `potter.js`, `clay.js`, `orders.js`, `game_sounds.js` as needed.

**Open questions** — None.

**Tasks**
- [x] Register the 48 images in `assets.js`
- [x] Recolour/rename clays (constants, sounds, clay, orders, weighing station); glazes orange/pink
- [x] Order cards show sprites
- [x] `potSprite(item)` + fallback; scale/offset helper in code
- [x] Swap boxes for sprites in HUD, shelf, kiln, owl, dropped items
- [x] Keep bar/border/X overlays working
- [~] Verify each clay × stage in the browser

## Image table

Clay: A = red, B = black, C = white. Glaze 1 = orange bucket and square (red on the pot after the glaze firing), glaze 2 = pink (blue after the glaze firing).

| Image(s) | Purpose / when shown |
|---|---|
| `smallpot_clayA/B/C` | **Cup**, unfired (wet / leather hard / bone dry): red, black, white |
| `bowl_clayA/B/C` | **Bowl**, unfired, same |
| `vase_clayA/B/C` | **Vase**, unfired, same |
| `smallpot_clayA/B/C-fired` | Cup after bisque firing (red, black, white); also undipped after glaze firing |
| `bowl_clayA/B/C-fired` | Bowl after bisque firing, same rule |
| `vase_clayA/B/C-fired` | Vase after bisque firing, same rule |
| `smallpot_clayA/B/C-fired-halfglazed1/2` | Cup with one dip: orange (1) or pink (2) over the clay colour |
| `bowl_clayA/B/C-fired-halfglazed1/2` | Bowl with one dip |
| `vase_clayA/B/C-fired-halfglazed1/2`  | Vase with one dip |
| `smallpot_fullyglazed1/2`, `bowl_fullyglazed1/2`, `vase_fullyglazed1/2` | Two dips, colour of the last glaze (orange/pink), before the glaze firing; clay-independent |
| `smallpot_2nd-fire_glaze1/2`, `bowl_2nd-fire_glaze1/2`, `vase_2nd-fire_glaze1/2` | Glazed pot after glaze firing: red (1) or blue (2); also completed shelf and orders; clay-independent |

## Decisions
0. Glazes → orange (glaze1) and pink (glaze2) everywhere (user); player picks one or both of them.
4. Art → never edited, scaled in code (user). Order cards show sprites (user).
5. Fire levels by slot: black low, red mid, white high (default). Last dip wins on a double-dipped pot (default).
1. Clays → A red, B black, C white (user), colours sampled from the art.
2. One mapping function → no scattered image names.
