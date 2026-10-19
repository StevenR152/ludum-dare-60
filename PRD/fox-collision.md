# PRD: Fox out-of-bounds collision
**Goal** — The fox (and anything it drops) cannot enter areas painted out-of-bounds on a per-area mask image; nothing else about movement changes.

**Context** (as built against the code of Oct 19, after the map/door update)
- `Fox` (`components/fox.js`) moves with `Fourway`; its existing collision polygon is the "touch" area for clicks and is left alone.
- One scene, two areas (`scenes/game.js`): Outside is `OUTSIDE_MAP_BOX` (2500×1080, art 5763×2458); Inside is `INSIDE_MAP_BOX` (2091×561.5 at x=-3200, art 8364×2246). Doors fire when the fox walks into them (`EnterFrame` + `touches`); items drop via `DroppedItem.dropFrom`.
- Constants live in `constants.js`; art is preloaded in `assets.js`; `DEBUG_HITBOXES` and `DebugHitbox` already exist.

**Scope** — A mask PNG per area, same shape as its background, painted by developers: alpha ≥ 128 = blocked, below = walkable. `collisionMap` (`components/collision_map.js`) loads the masks and answers "is this box blocked?". Fox feet strip and dropped items obey it. Door destinations move to config. Debug overlay shows the masks. Placeholder masks (12 px opaque border) for devs to repaint.
**Out of scope** — Final mask art, pushback/sound/messages, owl collision, mobile control changes, moving stations.

**Flow**
1. Fox walks toward a painted region and stops at its edge; a diagonal slides along it.
2. Fox drops an item against a wall: it lands at the nearest free spot.
3. Fox walks into a door: it appears at that door's configured destination and walks off freely.

**Requirements**
1. `COLLISION_AREAS` in `constants.js`: per area its mask asset, world x/y/w/h. Any point outside every area counts as blocked.
2. Masks may be any resolution with the area's aspect; each is drawn to a world-sized offscreen canvas at load.
3. Fox collides with its feet strip only (`FOX_FEET_BOX`, matched to the art's paws: x 30–130, y 62–79 of the sprite box); after any movement step it never overlaps a blocked pixel, resolved per axis so diagonals slide. Clicks (`touches`) still use the touch area.
4. `DOOR_DESTINATIONS` gives the fox's top-left x/y after each door; the door teleport reads it. Console warnings at scene start if a destination or the fox start is blocked, or a destination touches a door.
5. A dropped item (drop key or stumble) whose box overlaps blocked pixels moves to the closest clear spot (ring search; falls back to the fox's feet).
6. `DEBUG_HITBOXES` true draws every blocked pixel in solid red at a fixed 50% (`DEBUG_MASK_ALPHA`, independent of the PNGs' opacity) above the HUD and below the red outlines (both visible); false draws nothing.
7. Speed, slowdown, stumbling, inventory and touch controls unchanged.

**Acceptance criteria** (headless Chromium here: keyboard held for real time, no touch device)
- [x] Outside and Inside: fox can't cross any painted region or leave the area; diagonals slide.
- [x] Repainting a mask (no code change) changes what is blocked (masks are read from the PNGs at load).
- [x] Both doors land at their `DOOR_DESTINATIONS`, free to walk off, no bounce; no console warnings.
- [x] Dropping next to a wall puts the item on clear ground (snapped 16 px at the bottom wall).
- [x] `DEBUG_HITBOXES` on: blocked areas at a fixed 50% in a layer above the HUD (z 60 vs 50), outlines above that (z 70); off: nothing created.
- [x] Carrying clay and stumbling use the same code paths (unchanged); no console errors.
- [ ] Touch walking (same keys path via TouchControls; not tested on a device or emulated touch).

**Constraints** — `constants.js`, `assets.js`, `components/collision_map.js` (+ script tag), `components/fox.js`, `components/dropped_item.js`, `components/debug_hitbox.js`, `main.js` (debug layers), `scenes/game.js`; Crafty 0.9.0; masks served over HTTP (canvas read).

**Open questions** — None.

**Tasks**
- [x] Constants: `COLLISION_AREAS`, `FOX_FEET_BOX`, `DOOR_DESTINATIONS`, `INSIDE_MAP_BOX` (`DEBUG_HITBOXES` already existed)
- [x] Placeholder masks + load in `assets.js`
- [x] `collisionMap` (box-blocked test, nearest-free search, debug overlay)
- [x] Fox: per-axis stop using feet box
- [x] Door teleport reads `DOOR_DESTINATIONS`; load-time warnings
- [x] Dropped items snap to nearest free spot
- [x] Verify each acceptance item (touch excepted)

## Decisions
- Definition method → painted mask per area, debug-viewable
- Fox collider → feet strip; size matched to the art's paws (default was bottom 20 px of the box, which is empty margin)
- Seeded blockers → placeholder border masks (default)
- Door arrival → configured destinations, devs pick clear spots
- Debug → `DEBUG_HITBOXES` shows blocked areas at a fixed 50% (default 25% changed on request), between HUD and hitbox outlines
- Dropped items → obey collision, snap to nearest free spot
- Mask convention → alpha ≥ 128 = blocked, outside all areas = blocked (default)
- Door destination coords → fox top-left, same as `attr` (default)
- Placeholder border → 12 px, all sides, both areas (default)
