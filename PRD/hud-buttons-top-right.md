# PRD: Restart / Menu buttons in the top-right corner

**Goal** — Restart and Menu sit in the top-right corner, spanning the width of the order panel, with the pottery order panel directly below them.

**Context**
- `showLevelButtons` (`scenes/levels.js`) builds both `HudButton`s 100x36 at y=10, x=350 (Restart) and x=460 (Menu), beside the left inventory panel.
- `OrderPanel` is built in `buildWorld` (`scenes/game.js`) at `x: GAME_SCREEN_WIDTH - 300, y: 60`; cards are 280 wide (`ORDER_CARD_W`), so it spans x=1300..1580 on the 1600x768 screen.
- The HUD layer stays pinned top-left and scales with the screen (`main.js`, `camera.js`); the left inventory + Goal panels stay where they are. Mobile has only gesture controls (no on-screen buttons), so nothing there sits in the corner.

**Scope** — Move both buttons to the top right, edges aligned with the order panel; update the stale "beside the inventory panel" comment.
**Out of scope** — Button size/look/labels (do not resize), click behaviour, the pulsing Restart on a cracked pot, the left HUD panels, order look and logic, mobile controls, art and sound.

**Flow**
1. Start any level (or the sandbox): Restart (left) and Menu (right) show top right, over the order panel.
2. The order panel (score bar, then cards) sits just below, unchanged.
3. Click Restart: the level rebuilds. Click Menu: level select (Start in the sandbox). Same as today.

**Requirements**
1. Menu's right edge = order panel's right edge (`GAME_SCREEN_WIDTH - 20`); Restart's left edge = order panel's left edge (`GAME_SCREEN_WIDTH - 300`); y stays 10.
2. Buttons keep their 100x36 size, so the gap between them grows to fit (80px now).
3. Positions derive from `GAME_SCREEN_WIDTH` / the order panel's x (no hard-coded 1300/1480); buttons end at y=46, above the order panel's top (y=60), never overlapping the score bar or cards.
4. Restart still pulses red on `PotCracked`; clicks and hover sounds work at the new spot.
5. Nothing else on the left HUD moves; the buttons follow the order panel as the window scales.

**Acceptance criteria**
- [ ] Restart's left edge and Menu's right edge line up with the order cards' left and right edges.
- [ ] Order panel directly below with no overlap, including 5 open + finished cards and a fixed-orders level.
- [ ] Restart rebuilds the level; Menu goes to level select; sandbox Menu goes to Start.
- [ ] Crack a pot: Restart pulses and shows the status line.
- [ ] Resize the browser window: buttons stay with the order panel. `?touch=1`: nothing overlaps.
- [ ] No console errors.

**Constraints** — Crafty 0.9.0, no new deps. Edit `scenes/levels.js` (and `constants.js` only if a named constant helps).

**Open questions** — None.

**Tasks**
- [x] Reposition the two buttons in `showLevelButtons` from the order panel's x/width
- [x] Fix the function's comment
- [ ] Check no overlap with the order panel (full card list, fixed-order level, `?touch=1`) — not run: no preview server
- [ ] Verify each acceptance item in the browser — not run: no preview server could be started from here

## Decisions
- Right edge → aligned with the order cards (x=1580); Restart's left edge aligns with the cards' left (x=1300).
- Order → Restart left, Menu right.
- Gap → free to change; buttons not resized (80px gap).
- Window scaling → follows the order panel.
- Mobile → checked: gesture-only controls, no on-screen buttons, no overlap.
