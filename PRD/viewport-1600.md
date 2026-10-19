# PRD: 1600-wide game viewport
**Goal** — The game screen is 1600×768 instead of 2304×768, so it fits more monitors at scale 1.

**Context**
- `GAME_SCREEN_WIDTH = 2304` (constants.js) drives `Crafty.init`, `fitScreenToWindow` (camera.js) and all screen-centred / right-anchored HUD and scene layout (start, level_select, level_complete, end, loading, credits, OrderPanel at `WIDTH - 300`, status message).
- Scale-to-fit already shrinks below the constant and caps at 1, so it keeps working with the new width.
- Camera follows the player, so the world is unchanged; the player just sees ~30% less width at once.

**Scope** — Change the screen width to 1600 and fix anything that assumed 2304 (comments, hard-coded x values, PRD docs). **Out of scope** — world/level art, HUD redesign, touch `mobile/` code, itch embed work beyond updating its numbers.

**Flow**
1. Open the game on a ≥1600px-wide window: stage is 1600×768 at scale 1, no scrolling.
2. Play a level: HUD (inventory left, order panel right, timer, mute, status message) all visible and clickable.
3. Walk around: gameplay (dig, doors, owl, kiln) still works with the narrower camera view.

**Requirements**
1. `GAME_SCREEN_WIDTH` = 1600; constants.js comment updated.
2. Every scene's centred/right-anchored element sits correctly in 1600 (no off-screen or clipped UI).
3. Nothing in the camera or gameplay needs to see >1600px of world at once (e.g. door → target without losing the player).
4. Window ≥1600 wide renders at scale 1; narrower still scales down.
5. `PRD/itch-embed-fit.md` figures updated (1600×533 → 1600×768 is 1600/768 ≈ 2.08:1; cap now unnecessary).

**Acceptance criteria**
- [ ] Start, level select, level complete, end and loading scenes show centred content.
- [ ] In-game: order panel fully visible at the right edge, inventory at left, status message across bottom.
- [ ] Clicks on HUD and world accurate at 1600 and at a smaller (e.g. 1280) window.
- [ ] No hard-coded `2304` left in code.

**Constraints** — Mostly constants.js; touch only other files if a hard-coded layout breaks. Leave user's uncommitted edits in `scenes/game.js` etc. alone unless a fix is needed there.

**Open questions**
- Interpreting "viewport 1600 wide" as the logical game resolution (less world visible). If you meant only a render-size cap, say so and I'll just cap the scale instead.

**Tasks**
- [ ] Set `GAME_SCREEN_WIDTH = 1600` + comment
- [ ] Grep/eyeball every scene and component for layout assumptions
- [ ] Verify scenes and in-game HUD in browser at 1600 and 1280
- [ ] Update `PRD/itch-embed-fit.md` and `PRD/responsive-screen.md` numbers
