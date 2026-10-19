# PRD: Clay interaction box matches the art
**Goal** — Make each clay patch's click/dig area cover what the player sees of the patch, not a shrunken rectangle.

**Context**
- `Clay.clay` (`components/clay.js:30`) sizes the box to the patch art's opaque bounds cut to x+10%, y+35%, w 80%, h 65%. In world px: red 584×191 vs art 731×295, black 360×115 vs 450×178, white 228×82 vs 286×127. The top third and the sides of every patch can't be clicked.
- The art is irregular blobs (thin tip on top, round bottom); `patchContent` in `constants.js` is verified against the PNGs (±1 px). Crafty `Mouse` tests rectangles only, never pixels.
- Digging needs both a press on the box and the fox's hit box (sprite inset 25 px) touching it. `DEBUG_HITBOXES` outlines the box.

**Scope** — Clay box size/shape in `components/clay.js`, with any tunables in `constants.js`. **Out of scope** — the art (never edited), patch positions/shift, dig/respawn timing, `acceptDrop`, doors, kiln, other stations, mobile controls.

**Flow**
1. Fox walks onto a visible patch (any colour).
2. Player presses and holds on the visible clay; the dig runs as today.
3. Pressing empty ground beside or above the patch does nothing (or, if the bounds are the box, only the transparent corners inside it).
4. Dug patch fades and respawns as today.

**Requirements**
1. The box covers the patch's full opaque bounds (derived from `patchContent`), for red, black and white.
2. The old 80%/65% cut is removed; no per-clay hand numbers beyond `patchContent`.
3. Pressing a transparent pixel of the patch art does not start a dig (alpha check at the click point, same `COLLISION_ALPHA` threshold as the masks).
4. Dig still needs the fox touching the patch; messages stay first-person ("I can't harvest the clay from here").
5. White patch's shift still moves box and art together.
6. With `DEBUG_HITBOXES` on, the red outline wraps the visible patch.

**Acceptance criteria**
- [x] Box = visible art bounds for all 3 incl. white after its shift (checked by numbers; outline not eyeballed).
- [x] Press on visible clay digs (tested on every 4 px point vs the PNG alpha, <0.3% edge mismatch); real fox walk not tested.
- [x] Press on transparent art or outside the box does not dig.
- [ ] Dig, cancel, fade, respawn, drop-to-refill unchanged (code untouched; not run in the full game).
- [ ] (not tested) Fox can still reach the patch from any side; phone tap works.

**Constraints** — Plain Crafty ES5, no build; edit `components/clay.js` (+ `constants.js` if needed) only; art untouched.

**Open questions** — None.

**Tasks**
- [x] Box = full opaque bounds from `patchContent`; drop the 80%/65% cut
- [x] Add `patchUrl` per clay; read its opaque crop into a canvas once; press ignores alpha < `COLLISION_ALPHA`
- [x] Verify (isolated harness, not full game) with `DEBUG_HITBOXES` for all 3 patches; tick criteria

## Decisions
- Problem: boxes too small and too square → full bounds plus pixel-accurate press
- Pixel match is easy (~25 lines: draw the PNG to a canvas once, read alpha at the click); art never edited
- Fox reach: unchanged, body box touching the clay box
