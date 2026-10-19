# PRD: Load new art + tree row in the forest
**Goal** — Preload the 15 new images from commit 3462a85 and replace the single green forest box with a row of choppable trees confined to that box.

**Context**
- Branch `loading-new-art` (from `auto-doors`; the uncommitted outside-map resize in `assets.js`/`scenes/game.js` came along, 5763x2458 drawn at x:-350 y:-100 w:2500 h:1080).
- Green box = `Forest` (`components/forest.js`), `{x:5,y:350,w:525,h:307}`: hold LOG_CHOP_MS while the fox touches it → one log. Nothing in the new art is loaded or drawn yet.
- Full-size (5763x2458) files are map-aligned overlays: draw with the background's exact `attr`, z just above it. Square/box files are single objects scaled by w/h.

| Image (size) | What it is | Goes to |
|---|---|---|
| trees_1_square (2268²) | tall dark pine, no ground tuft | Tree #1 art (this PRD) |
| trees_2_square (2268²) | slim bright pine with grass | Tree #2 art (this PRD) |
| trees_square (2268²) | both pines together | Tree #3 art (this PRD) |
| trees / trees_1 / trees_2 (5763x2458) | same trees, placed on the map at left | Not used: duplicates of the squares; preload only |
| wood.png (2268²) | log pile | Log item icon / HUD (later) |
| kiln_base / kiln_firing (2268x1177) | kiln idle / lit | Kiln `{1605,527,240,232}` art, swap on firing (later) |
| door_outside (2056x2268) | wooden door slab | Outside door `{1120,467}` art (later) |
| patch_ClayA_red / B_black / C_white (5763x2458) | one clay patch each, map-aligned | Overlay per `Clay` node: red→clayTwo, black→clayOne, white→clayThree (later) |
| patch_Clay_all (5763x2458) | all three patches | Not used: preload only |

**Scope** — Preload all 15 in `assets.js`; replace the one forest box with N tree entities in a line across `{x:5,w:525,y:350,h:307}`, each a slice of the box with its own art and its own chop hitbox. **Out of scope** — Placing wood/kiln/door/clay art (table lists the plan), chop timing, log mechanics, background art.

**Flow**
1. Fox walks into the forest row; trees are drawn where the green box was.
2. Fox overlaps a tree's slice, holds the mouse on it → "Chopping…" → one log after LOG_CHOP_MS.
3. Fox outside the row or clicking beyond the slices → "Walk into the forest first"/nothing.

**Requirements**
1. All 15 images load with no 404s (sprite keys for the squares; overlays only if later used).
2. 5 trees in a line (art order 1, 2, 3, 1, 2), slices tile the old box exactly (no gaps, no outside coverage).
3. Each tree reuses `Forest` chop behaviour; a chop needs the fox touching that tree's slice and the mouse on it.
4. Tree art is bottom-anchored to the slice and visually centred in it; z so the fox walks in front.
5. DebugHitbox outlines each slice.

**Acceptance criteria**
- [x] Console/network clean on load.
- [x] 5 trees visible in a row over the old green box area; no solid green fill remains.
- [x] Chopping works on each tree, gives a log; clicking a tree the fox isn't touching doesn't.
- [x] Clicking just outside the row chops nothing.

**Constraints** — Plain Crafty ES5, no build; extend `components/forest.js` (art via sprite component, shared chop logic), place in `scenes/game.js`.

**Open questions** — Tree size: assumed ~full box height (~307 world px tall; the square canvas is mostly transparent, so scaled/offset to match). Assumed 5 trees; say if you want another count.

**Tasks**
- [x] Add image/sprite entries to `assets.js`
- [x] `Forest` takes art; build the row in `game.js`
- [x] Tune size/offset, verify in browser, tick criteria
