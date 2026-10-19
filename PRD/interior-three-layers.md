# PRD: Interior art in three layers
**Goal** — Draw the new interior (new door, all workstations) from the three layer PNGs instead of the old single background + overlay.
**Context**
- `scenes/game.js:48-53` draws `backgroundInside` (`background_inside.png`, z -1) and `overlayInside` (`interior-overlay-glazing.png`, z 50) at `INSIDE_MAP_BOX`; sprites registered in `assets.js:91-100`.
- New `background_interior-{bg,mid,front}.png` (already updated in place) are all 8364×2246, same as the old art, so `INSIDE_MAP_BOX` fits unchanged.
- Fox/stations z 0 (glaze buckets z 0), dropped items z 20, HUD ≥ 999. `front` holds the walk-behind items (shelf, tables, clutter); `mid` holds back furniture (right-hand tables, tongs, shelf).
**Scope** — Register 3 sprites, draw 3 entities, retire the old two sprites. **Out of scope** — editing art, moving stations/hitboxes/door boxes/masks (art owner's layout), deleting old PNG files.
**Flow**
1. Fox walks through the outside door → interior shows bg, mid behind him, front over him.
2. Fox walks behind front-layer items and is covered; in front of mid-layer items.
**Requirements**
1. `assets.js` maps `backgroundInterior`, `midInterior`, `frontInterior` (8364×2246 tiles); `backgroundInside`/`overlayInside` entries removed.
2. `game.js` draws bg at z -2, mid at z -1, front at z 50, all at `INSIDE_MAP_BOX`.
3. Glaze buckets (z 0) still visible above bg/mid; front covers them as the old overlay did.
**Acceptance criteria**
- [ ] Inside shows the new door and every workstation; no console/404 errors.
- [ ] Fox is hidden behind front items, drawn over mid items.
- [ ] With `DEBUG_HITBOXES`, stations, door and masks line up with the new art (report any that don't).
**Constraints** — `assets.js`, `scenes/game.js` only.
**Open questions** — Does the new art move any station or the inside door? If so, give new positions or I'll only report the drift.
**Tasks**
- [ ] Swap sprite entries in `assets.js`
- [ ] Draw three layers in `game.js`
- [ ] Verify in browser, check alignment
