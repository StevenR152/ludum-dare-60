# PRD: Live date on the page

**Goal** — The page shows today's date as plain HTML text, and it stays correct while the page is open (rolls over at midnight).

**Context**
- `index.html` is only the game: `#game` (Crafty stage, fitted and scaled by `camera.js`) and `#rotate-hint`, on a `#222` body that letterboxes leftover space. Inline `<style>` and a small inline `<script>` at the end already live there.
- No date or clock exists anywhere on the page or in the HUD today.
- The browser's `Date` + `toLocaleDateString` own date formatting; no library needed.

**Scope** — One `<div id="live-date">` in `index.html`, styled in the existing inline `<style>`, filled and kept current by the existing inline `<script>`.
**Out of scope** — Drawing the date inside the Crafty stage/HUD, a ticking clock (time of day), game timers, itch description page, mobile touch controls, art and sound.

**Flow**
1. Open the game: the date (e.g. "Friday 13 November 2026") shows in the bottom-right corner of the window, over the letterbox/game.
2. Play normally: the date never blocks clicks, taps or holds on the game.
3. Leave the page open past midnight: within a minute the text changes to the new day, no reload.
4. Turn a phone upright: the rotate hint shows, and the date still shows in its corner.

**Requirements**
1. A `#live-date` element exists in the HTML and contains the current local date, formatted with the viewer's locale (`toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`).
2. Text is set on load and re-checked every 60 s, so it updates after midnight without a reload.
3. Positioned `fixed`, bottom-right, 8px from the edges, `pointer-events: none`, so it never intercepts game input.
4. Styled to match the rotate hint: Alegreya (already loaded), `#E3CDA8`, small (~14px), slightly transparent so it doesn't distract.
5. Visible in both landscape and the portrait rotate-hint state.

**Acceptance criteria**
- [x] Inspect the page: `#live-date` holds today's date in the browser's locale. (verified headless Chrome, en-US: "Friday, November 13, 2026")
- [x] Date sits bottom-right, readable, in Alegreya cream text. (computed: fixed, right/bottom 8px, Alegreya 14px, rgb(227,205,168), opacity 0.7; screenshot checked)
- [x] Click/hold on the game under the date: the fox walks/acts as normal. (game-shaped window: element under the date and a real mouse click there both hit `#game`; fox movement itself not driven, touch not device-tested)
- [x] Fake the clock past midnight (devtools override or temporarily shorter interval): text changes to the next day without reload. (Date shifted to 00:00:30 next day; real 60 s interval flipped text to the next day, no reload)
- [x] Phone portrait: rotate hint and date both show. (emulated 390x844 touch portrait; not tested on a real phone)

**Constraints** — `index.html` only (inline style + script); no new files or dependencies.

**Open questions**
- Corner: bottom-right overlaps the game's bottom edge when the window is exactly game-shaped. OK, or prefer another corner / only in the letterbox? **Resolved: bottom-right, as written.**

**Tasks**
- [x] Add `<div id="live-date">` next to `#rotate-hint`.
- [x] Add `#live-date` styles to the inline `<style>`.
- [x] Extend the inline `<script>`: set the text on load, refresh every 60 s.
- [x] Verify the acceptance criteria in the browser.
