# PRD: Fit the game inside an itch.io embed
**Goal** — The game fills an itch.io iframe with no page chrome or scrollbars, and is never drawn wider than 1600px.

**Context**
- `fitScreenToWindow` (camera.js) already scales to the window, but reserves space under the `<h2>` title and the long instructions sit below the stage, so inside an iframe the game is shrunk and the page scrolls.
- The game is 3:1 (2304×768). itch.io iframes are a fixed size set on the game page (not responsive), so we pick it.
- itch gives no hard max width; advice is a fixed frame plus the **Fullscreen button** (https://itch.io/updates/more-embed-options-for-html5-games).

**Scope** — In an iframe: hide the title and instructions, remove body margin/scrollbars, fit the stage to the full frame (centred, letterboxed), capped at 1600px wide. Document the itch upload settings. **Out of scope** — new levels/art, touch-controls code, the standalone page (unchanged).

**Flow**
1. Upload the zip; set embed to Manual size 1600×533, tick Fullscreen button.
2. Player sees the game filling the frame at scale ≈ 0.69 (no title, no scrollbars).
3. Player hits Fullscreen: the game stays at most 1600 wide, centred and letterboxed; clicks stay accurate.

**Requirements**
1. Iframe detected with `window.self !== window.top`; adds a class on `<html>` that hides the title/instructions and sets `body` margin 0, `overflow: hidden`.
2. In an iframe, available height = `window.innerHeight` (no `offsetTop` subtraction), width = `clientWidth`, and scale ≤ `ITCH_MAX_WIDTH / 2304` (1600 → ≈ 0.69).
3. Stage centred both ways in an iframe, background matching the stage colour.
4. Standalone page unchanged.
5. README gets an "itch.io upload" note: embed 1600×533 (exact 3:1) plus Fullscreen button.

**Acceptance criteria**
- [ ] A test page embedding `index.html` in a 1600×533 iframe shows the full game, no scrollbars, no title.
- [ ] Same at 960×320 and 800×600 (letterboxed, still fits); at 2000×900 the game stays 1600 wide, centred.
- [ ] Clicks on HUD and world are accurate inside the iframe.
- [ ] Opening `index.html` directly looks as it does now.
- [ ] README note present with the settings.

**Constraints** — `camera.js`, `constants.js`, `index.html`, `README.md` only; no new libraries; don't touch `mobile/touch-controls.js`.

**Open questions**
- Should the 1600 cap also apply to the standalone page? Defaulting to iframe only. Note 1600 may exceed itch's default page column and be clipped there; the Fullscreen button covers that.

**Tasks**
- [ ] Add iframe class + CSS in index.html; add `ITCH_MAX_WIDTH = 1600` to constants.js
- [ ] Update `screenFitScale` (full-frame height, 1600 width cap) and centring for iframes
- [ ] Add a test iframe page in the scratchpad (not committed) and verify the sizes
- [ ] README itch.io note
