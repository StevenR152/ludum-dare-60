# PRD: Bigger fox and owl, wedged clay art

**Goal** — Draw the fox and owl 30% larger, and show a picture of the clay (by colour) on the workbench while it is wedged.

**Context**
- Fox is a 160x102 sprite box (`components/fox.js`), with `FOX_HITBOX_INSET` 25 and `FOX_FEET_BOX` {35, 62, 90, 15} tied to that box. Owl is 160x152 at (-1660, 327) in `scenes/game.js`.
- Wedging is a 3 s hold on the Workbench's bare right half (`components/workbench.js`); nothing is drawn there today.
- New art: `assets/images/wedged_clayA_red.png`, `wedged_clayB_Black.png`, `wedged_clayC_white.png` (4836x2268, like the clay cubes). Opaque parts: A [2152, 864, 842, 602], B [2186, 858, 810, 610], C [2176, 866, 796, 616].

**Scope** — Scale both sprites and their hitboxes 1.3x; add `WEDGED_CLAY_IMAGES` (letter → url, crop) in `constants.js`; draw the picture on the bench's wedging half.
**Out of scope** — Collision masks, owl/fox art, HUD slot pictures, wedging rules/timing.

**Flow**
1. Fox holds weighed red/black/white clay at the bench and holds the mouse.
2. The matching A/B/C wedged-clay picture appears centred on the bench's right half.
3. It stays until the hold ends (finish, release, or walking off); then it disappears.

**Requirements**
1. Fox box is 208x133; `FOX_HITBOX_INSET` and `FOX_FEET_BOX` scaled 1.3x (32, {45, 81, 117, 20}); fox spawn/door positions still clear of masks.
2. Owl box is 208x198, feet and centre kept where they were (x -1684, y 281).
3. Picture chosen by `clay.letter` (red A, black B, white C), cropped to its opaque area, aspect preserved, fitted within the bench's right half.
4. Shown only while wedging, above the bench colour, below the fox.

**Acceptance criteria**
- [x] Fox and owl look 30% bigger in game; owl still stands on the same spot.
- [ ] Fox still can't walk onto out-of-bounds ground and touches stations as before (hitbox scaled). Not walked through in-game; only touching at the bench was checked.
- [x] Holding on the bench with red / black / white clay shows picture A / B / C respectively.
- [x] Picture vanishes on finish, release, and walking away; no console errors.

**Constraints** — `constants.js`, `assets.js` (preload), `components/fox.js`, `components/workbench.js`, `scenes/game.js`. ES5, no build step.

**Open questions** — Should the picture stay on the bench after wedging finishes (until the clay is picked up)? Assumed no: only while wedging.

**Tasks**
- [x] Scale fox box, hitbox inset, feet box
- [x] Scale owl box, keep feet position
- [x] Add WEDGED_CLAY_IMAGES and preload
- [x] Draw/remove picture in Workbench start/stop wedge
- [x] Verify in browser
