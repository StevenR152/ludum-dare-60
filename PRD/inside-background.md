# PRD: Inside background art
**Goal** — Show the artist's `background_inside.png` as the 2nd subscene backdrop instead of the placeholder rectangle.
**Context**
- `scenes/game.js` drew a `#F5EDE3` Color box (2000×1080 at `INSIDE_X`) as placeholder.
- Outside uses a sprite-map entry in `assets.js` (`backgroundOutside`).
**Scope** — Register the image in `assets.js`, swap the placeholder in `game.js`. **Out of scope** — art edits, layout/zone changes.
**Requirements**
1. `background_inside.png` (8364×2246) is preloaded as sprite `backgroundInside`.
2. Inside entity uses it at the old placeholder's position/size (2000×1080, z -1).
**Acceptance criteria**
- [ ] Walking through the door shows the artwork, no console errors.
**Constraints** — `assets.js`, `scenes/game.js` only.
**Open questions** — Image is 3.72:1 but the area is 1.85:1, so it is squashed ~2× horizontally. Resize the area or re-export the art?
**Tasks**
- [x] Add sprite entry
- [x] Swap placeholder
