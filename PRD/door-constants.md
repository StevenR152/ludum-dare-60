# PRD: Door constants

**Goal** — Move both house doors' size and position out of `scenes/game.js` into named constants in `constants.js`.

**Context**
- Outside door already uses `DOOR_ART_BOX` (box) and `DOOR_ART_CONTENT` (art crop) from `constants.js`.
- Inside door is hard-coded in `scenes/game.js` (~line 291): `{x: -2626, y: 268, w: 54, h: 112}`, colour `#8B5A2B`, alpha 0.
- `DOOR_DESTINATIONS` (arrival spots) already lives in `constants.js`.

**Scope** — Add an inside-door constant beside `DOOR_ART_BOX`; make `game.js` read both doors' boxes from constants. **Out of scope** — door behaviour, arrival spots, art, other stations.

**Flow**
1. Game builds the scene; both doors are created from constants.
2. Fox walks into either door and is moved to its `DOOR_DESTINATIONS` spot, exactly as today.

**Requirements**
1. `constants.js` defines `DOOR_BOXES = {outside: {x,y,w,h}, inside: {x,y,w,h}}` with a comment, next to `DOOR_DESTINATIONS`; `DOOR_ART_BOX` becomes an alias of `DOOR_BOXES.outside` so other users keep working.
2. `constants.js` defines `INSIDE_DOOR_COLOR` (`#8B5A2B`); `game.js` uses it.
3. `game.js` has no numeric door x/y/w/h literals.
4. Door positions, sizes and behaviour are identical to today.
5. Existing out-of-bounds / door-overlap warnings still work.

**Acceptance criteria**
- [ ] Debug outlines show both doors in the same places and sizes as before
- [ ] Walking through each door lands the fox at the same spot as before
- [ ] No new console warnings; no door literals left in `game.js`
- [ ] Editing a constant visibly moves/resizes that door

**Constraints** — Edit only `constants.js` and `scenes/game.js`; match existing var/comment style.

**Open questions** — None.

## Decisions
- One `DOOR_BOXES` object keyed outside/inside, like `DOOR_DESTINATIONS`.
- Inside door colour moves to `INSIDE_DOOR_COLOR` too.

**Tasks**
- [ ] Add `DOOR_BOXES`, `DOOR_ART_BOX` alias and `INSIDE_DOOR_COLOR` to `constants.js`
- [ ] Use them in `game.js`
- [ ] Verify against acceptance criteria
