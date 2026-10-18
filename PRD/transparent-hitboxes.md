# PRD: Transparent click areas over background art
**Goal** — Let world objects baked into the background art (clay piles first) be interacted with through an invisible Crafty box, so the artist needn't export them as separate images.

**Feasibility** — Yes. Confirmed in Crafty 0.9.0 source (`findPointerEventTargetByComponent`) and a live test: Mouse hit-testing uses the entity's rectangle, never its pixels. A fully transparent `Color` entity fires `MouseDown`, even with a non-Mouse entity (the fox, the background) drawn above it. Gotcha: `visible: false` does NOT work (Crafty skips invisible entities), so use a transparent colour, not hiding.

**Context**
- `Clay` (`components/clay.js`) and the doors (`scenes/game.js`) are plain `Color` rectangles with `Mouse`; the colour is the only "art".
- `Clay` recolours itself grey when dug and back on respawn, so a transparent pile would lose its dug feedback.

**Scope** — A `HITBOX_COLOR` constant (fully transparent) and a `SHOW_HITBOXES` debug flag in `constants.js`; clay piles and both doors use it. Clay keeps its dig/respawn logic. **Out of scope** — new art, moving positions, kiln/shelves/stations, mobile controls.

**Flow**
1. Fox walks onto the clay patch drawn in the background (no sprite entity).
2. Player presses and holds the invisible square; dig works as today (fox must touch it).
3. Pile dug → status message, respawn later; doors teleport on press.

**Requirements**
1. Clay and doors render nothing (alpha 0) when `SHOW_HITBOXES` is false.
2. Pressing/holding them still triggers dig/teleport with the fox standing on top (fox z above hitbox).
3. With `SHOW_HITBOXES` true they show as translucent boxes for placement.
4. Dug state still has visible feedback without a colour swap (see Open questions).
5. All clay types and `acceptDrop` behave as before.

**Acceptance criteria**
- [ ] Hitboxes invisible, art shows through, fox walks over them.
- [ ] Hold on pile digs; release early cancels; respawn works.
- [ ] Both doors teleport both ways.
- [ ] Flag on → boxes visible and aligned with the art.
- [ ] No console errors; phone tap works.

**Constraints** — `constants.js`, `components/clay.js`, `scenes/game.js`; Crafty 0.9.0; no `visible:false`.

**Open questions**
- Dug feedback: keep a small grey/"dug" marker over the pile, or status text only (art can't change)? Recommend a small marker entity shown while dug.

**Tasks**
- [ ] Add `HITBOX_COLOR`, `SHOW_HITBOXES`
- [ ] Clay: use hitbox colour; dug marker instead of recolour
- [ ] Doors: use hitbox colour
- [ ] Verify each acceptance item in-app
