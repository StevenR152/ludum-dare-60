# PRD: Inside overlay layer
**Goal** — Draw `interior-overlay-glazing.png` in front of the fox so he visibly walks behind the foreground items.
**Context**
- `assets/images/interior-overlay-glazing.png` is 8364×2246 (same as `background_inside.png`): the background's foreground items on transparency (post, right-hand clutter, top-left wood).
- `scenes/game.js` places `backgroundInside` at `INSIDE_X`, 2091×561.5, z -1. The fox and stations use default z 0; dropped items z 20 (`DROPPED_ITEM_Z`); HUD is z ≥ 999.
- Sprites are registered in `assets.js` as one full-size tile each.
**Scope** — Register the image, add an entity with the same position/size as the inside background, z above the fox and dropped items, below the HUD. **Out of scope** — art edits, hitbox/walk-area changes, outside map, the other glazing art files.
**Flow**
1. Fox walks Inside past the post / clutter → fox is hidden where the overlay is opaque.
2. Fox walks elsewhere Inside → overlay is invisible (transparent), nothing changes.
**Requirements**
1. Overlay is preloaded as sprite `overlayInside` in `assets.js`.
2. Entity at `x: INSIDE_X, y: 0, w: 8364 / 4, h: 2246 / 4`, z 50 (above fox, owl, dropped items; below HUD 999+).
3. Overlay does not intercept clicks: stations, shelves, doors, owl stay clickable under it.
**Acceptance criteria**
- [x] Fox passing the post and clutter is drawn behind them; overlay aligns exactly with background art.
- [x] HUD, notifications and inventory stay on top of it.
- [x] Clicking stations/owl/doors where the overlay is transparent or opaque works as before; no console errors.
**Constraints** — `assets.js`, `scenes/game.js` only.
**Open questions** — None (overlay also covers dropped items and pots on shelves where opaque; assumed intended).
**Tasks**
- [x] Add `overlayInside` sprite entry
- [x] Add overlay entity after the inside background
- [x] Verify in browser (alignment, clicks, console)
