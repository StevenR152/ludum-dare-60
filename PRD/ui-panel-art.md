# PRD: Painted UI panels behind the HUD text

**Goal** — Replace the flat parchment/brown HUD rectangles with the painted pink panels in `assets/images/UI/`, drawn underneath the existing text.

**Context**
- Each `UI/*.png` is a 5763x2458 canvas, transparent except one panel (positions mirror `UI_overlay_reference.png`, a layout mock, not 1:1 with the game). Each must be cropped to its opaque area, then stretched to the element it backs.
- Today the panels are `Color` entities: left HUD panel (`components/game_hud.js`, x10 y10 w330), Goal panel (`showGoalPanel`, `scenes/levels.js`), order score bar and cards (`components/orders.js`), Restart/Menu `HudButton`s (`showLevelButtons`).
- Text, slots, bars and click handling stay as they are; only the backdrop changes. HUD z is 999+.

**Scope** — Mapping: `inventory.png` → left HUD panel (Fox/Master/Kiln rows); `taskbox.png` → Goal panel; `potterytasks.png` → order "Total Score" bar; `restart.png` / `menu.png` → the two buttons. Register the images in `assets.js`, add a crop table in `constants.js`, add a small helper that draws a cropped image at a rect (reuse the `WEDGED_CLAY_IMAGES` crop approach).
**Out of scope** — Order cards, weighing panel, start/menu scenes, text/slot restyling, the reference mock itself.

**Flow**
1. Start a level: left panel, Goal box, Restart, Menu and score bar show painted art with their text on top.
2. Hover/click Restart/Menu: sound and action as today; the cracked-pot pulse still reads (art tinted/overlaid red, not hidden).
3. Panel grows (more inventory rows or Goal lines): art stretches to the new height.

**Requirements**
1. Each image is cropped to its opaque bounds (no empty canvas drawn) and sized to the rect of the element it backs, behind that element's text/slots.
2. The old `Color` backdrop of those elements is removed (no parchment showing at the art's irregular corners).
3. Art ignores mouse; buttons stay clickable; fox's click-through check (`fox.js:302`) unchanged.
4. Text colour stays readable on the pink (adjust `HUD_TEXT_COLOR`/button text only if it fails).

**Acceptance criteria**
- [ ] All five elements show their painted art in-game, text legible on top.
- [ ] Left panel art stretches correctly with 1, 2 and 3 inventory rows (Fox only / +Master / +Kiln).
- [ ] Restart/Menu click, hover sound and cracked-pot alarm still work.
- [ ] No console errors; nothing else on screen shifts.

**Constraints** — `assets.js`, `constants.js`, `components/game_hud.js`, `scenes/levels.js`, `components/orders.js`. ES5, no build step.

**Open questions**
1. `box.png` (plain wide pink box, no dots) isn't in the reference mock. Which element is it for (e.g. weighing panel, dialog), or skip for now? Assumed: skip.
2. Stretch art to fit the rect (may distort the hand-drawn edges) vs. keep aspect and adjust the rect? Assumed: stretch.

**Tasks**
- [ ] Measure opaque bounds of the 5 images; add crop table
- [ ] Register images in `assets.js`
- [ ] Add draw-cropped-image helper
- [ ] Swap left HUD panel backdrop (grows with rows)
- [ ] Swap Goal panel backdrop
- [ ] Swap Restart/Menu and score-bar backdrops (keep alarm pulse)
- [ ] Verify in browser
