# PRD: Fit the game screen to any window
**Goal** — The whole 2304×768 game screen is visible and playable on any desktop window size, with clicks still landing where they should.

**Context**
- `Crafty.init(2304, 768)` (main.js) makes a fixed-size stage; `body { width: 2304px }` (index.html) forces horizontal scrolling and clipping on monitors under ~2300px wide.
- HUD (inventory, order panel, timer, mute) is laid out in 2304×768 screen coords on a non-scaling `HUD` layer (`scaleResponse: 0`); camera runs at `Crafty.viewport.scale(1)` (camera.js).
- Touch devices already fit via `TouchControls._fitPage` (meta viewport); desktop has nothing.

**Scope** — Uniform scale-to-fit of the entire stage (world + HUD) to the browser window, recomputed on resize; page title/instructions sit below it. **Out of scope** — touch-device fitting (leave `_fitPage` as is), changing HUD layout, art, camera follow logic, Phaser/other engines, other people's `mobile/` code.

**Flow**
1. Open the game in a 1366×768 (or smaller) window: the full game screen is visible, no horizontal scroll, aspect ratio kept (letterbox if needed).
2. Resize the window: the screen rescales live.
3. Click/hold on clay, doors, owl, kiln, shelves, HUD buttons: they respond at the visible position.

**Requirements**
1. Scale = min(window width / 2304, window height / 768), applied to world and HUD layers together; never above 1 (no upscaling on big monitors).
2. Recomputed on load and every `resize`.
3. Stage is centred horizontally; `body` no longer hard-codes 2304px.
4. Mouse hit-testing (hold-to-dig, clicks, `TouchControls` tap on desktop touchscreens) stays accurate at every scale.
5. HUD stays anchored correctly (order panel right edge, inventory left edge) at every scale.
6. Touch-device behaviour unchanged.

**Acceptance criteria**
- [ ] At 1280×720 and 1024×600 all four screen edges of the game are visible, no page horizontal scrollbar.
- [ ] At 2304+ wide the game looks identical to today (scale 1).
- [ ] Dig clay, use door, weigh, deliver to owl, fire kiln all work at scale ≈ 0.5 by mouse.
- [ ] Dragging the window narrower/wider rescales without reload and clicks stay accurate.
- [ ] Order panel and inventory visible and clickable at scale < 1.
- [ ] Phone/touch emulation behaves as before.

**Constraints** — Plain Crafty 0.9 in `main.js`, `camera.js`, `index.html` (one small helper, no new library). Don't touch `mobile/touch-controls.js`. Leave the user's uncommitted edits in `scenes/game.js` / `components/player_notification.js` alone.

**Open questions**
- Cap scale at 1 (crisp art, small blank margins on huge monitors) or allow upscaling to fill big screens? Defaulting to cap at 1.

**Tasks**
- [ ] Spike: confirm how `Crafty.viewport.scale` treats the DOM/HUD layers (origin, stage size, mouse mapping); fall back to CSS-sizing the stage + `Crafty.viewport` if HUD misplaces
- [ ] Add `fitToWindow()` (scale calc, centre stage) called at start and on `resize`
- [ ] Remove `body width: 2304px` in index.html and keep `constants.js` comment in sync
- [ ] Skip on touch devices (`TouchControls.isActive()`)
- [ ] Verify in browser at 2304, 1366, 1024, resize live, click-test dig/door/HUD
