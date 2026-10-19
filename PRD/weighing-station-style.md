# PRD: Weighing station style

*Written alongside the build; everything below is implemented and checked.*

**Goal** — Make the weighing station look like it belongs in the game: the panel in the HUD's style, and the station itself in something other than placeholder magenta.

**Context**
- The weighing panel was raw browser controls (a default `<select>`, range slider and button) in a bold system font on a white box, beside a HUD that is now parchment and Alegreya.
- It opened at (20, 220), on top of the inventory panel's lower rows, covering the kiln's second row of slots.
- The station in the world was `WEIGHING_STATION_COLOR = "#800080"`, a placeholder magenta from before the art, with white pile boxes and white text.

**Scope** — Restyle the panel and its controls, move it clear of the HUD, and give the station a warm look. Light touch: proper station art is expected to replace this.
**Out of scope** — How weighing works (piles, step, limits). The other placeholder boxes inside (workbench models, shelf slots).

**Flow**
1. Put dug clay on the station: it's a dark wooden tray, each clay's pile in its own space, labelled in the HUD font; empty spaces are faint dashed outlines.
2. Click it again: the panel opens beside the inventory panel, under Restart and Menu.
3. The chooser shows the chosen clay's colour down its left edge; the grams show in large type; the slider fills in clay brown up to its handle; Weigh is a clay button like the menus'.

**Requirements**
1. The panel uses the HUD's parchment, border, shadow and Alegreya, via one stylesheet injected once (the `packHintStyle` pattern), built from the `MENU_*`/`HUD_*` constants.
2. The chooser has a custom arrow, capitalised clay names, and a left edge in `CLAY_TYPES[clay].color`.
3. The slider's track fills up to the value (`--fill`, updated on input and on refresh); its thumb is clay brown with a cream ring, in WebKit and Firefox.
4. The panel opens at `WEIGH_PANEL_X/Y` and overlaps no HUD element.
5. The station is a dark wood tray (`WEIGHING_STATION_COLOR`) with a rounded edge and shadow; empty piles are `WEIGHING_EMPTY_PILE_COLOR` with a dashed outline; pile labels are cream Alegreya.
6. Weighing behaves exactly as before.

**Acceptance criteria**
- [x] The panel renders in Alegreya on the HUD parchment, with the styled chooser, grams, slider and Weigh button.
- [x] It opens beside the inventory panel and overlaps no HUD element (checked by bounding boxes).
- [x] The chooser's edge is black clay's colour for black and red's for red; the slider fill tracks the value (20% at 200 of 1000).
- [x] The station is a dark wooden tray; filled piles show their clay and grams, the empty one a dashed outline.
- [x] Weighing 200 g of an 800 g black pile gives 200 g of weighed clay and leaves 600 g; the slider's max follows the chosen pile (600, then 1000 for red).
- [x] No console errors.
- [ ] **Not checked:** the slider thumb in Firefox (`::-moz-range-thumb`); only Chromium was available here.

**Constraints** — `components/weighing_station.js`, `constants.js`, plus the "purple weighing station" mentions in `scenes/game.js`, `README.md` and `itch-description.html`. ES5, no build step.

**Open questions** — None.

**Tasks**
- [x] Add `weighPanelCss()` and inject it once from `makePanel`.
- [x] Restructure the panel markup with classes; drop its inline look.
- [x] Colour the chooser's edge and paint the slider fill in `refresh` and on input.
- [x] Move the panel to `WEIGH_PANEL_X/Y`.
- [x] Restyle the station, its pile boxes and labels.
- [x] Replace "purple" in the comment, README and itch page.
- [x] Verify in the browser.

## Decisions
1. **Panel moved, not just restyled.** It covered the inventory panel's lower rows, so restyling it in place would still look broken; the space beside the HUD under Restart and Menu is empty.
2. **Slider fill in clay brown, not the clay's colour.** White clay's cream would barely show on the parchment track; the clay's colour goes on the chooser's edge instead.
