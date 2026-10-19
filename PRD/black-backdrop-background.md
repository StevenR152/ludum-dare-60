# PRD: Black background behind the image backdrops
**Goal** — Wherever the Inside/Outside backdrop images don't cover the screen, the game scene shows black instead of light grey.
**Context**
- `buildWorld` (`scenes/game.js:19`) sets `Crafty.background("#EEE")`; this colour shows around/behind `backgroundOutside` (`OUTSIDE_MAP_BOX`, z -2) and `backgroundInside` (`INSIDE_MAP_BOX`, z -1).
- The 1600×768 stage is letterboxed by the page colour `#222` (`index.html`); menu scenes use `#DDD` (`start.js`, `level_select.js`).
- Art is not touched; the backdrop PNGs stay exactly as they are.
**Scope** — Game-scene stage background → `#000`, as a named constant in `constants.js`. **Out of scope** — art edits, backdrop position/size, menu scenes, page letterbox colour (see open question), `mobile/`.
**Flow**
1. Start a level → any screen area not covered by the Outside or Inside art is black, not grey.
2. Walk through the door → same inside; art unchanged.
**Requirements**
1. `buildWorld` calls `Crafty.background(GAME_BACKGROUND_COLOR)` with `GAME_BACKGROUND_COLOR = "#000"`.
2. No `#EEE` left in the game scene.
3. Backdrop images, overlay, z-order, HUD unchanged.
**Acceptance criteria**
- [ ] Camera at the edge of the Outside map shows black beyond the art, no grey.
- [ ] Same at the edge of the Inside map.
- [ ] Art, fox, HUD look identical otherwise; no console errors.
**Constraints** — `constants.js` and `scenes/game.js` only.
**Open questions** — None.
**Decisions**
- Game scene only: letterbox bars (`#222`) and menu scenes (`#DDD`) stay as they are.
- "Background" means the stage colour showing outside the art edges.
**Tasks**
- [ ] Add `GAME_BACKGROUND_COLOR = "#000"` to `constants.js`
- [ ] Use it in `buildWorld` instead of `"#EEE"`
- [ ] Verify in browser at both map edges
