# PRD: SPACE to act, D to drop
**Goal** — SPACE does what a click does on whatever the fox is touching; D drops the selected item.

**Context**
- Today SPACE = drop (`Fox.onKeyDown` → `dropSelected`); actions are `MouseDown` handlers on entities, each checking `fox.touches(this)`. Hold actions (dig, wedge, chop) use `MouseDown`/`MouseUp`.
- `Fourway` binds WASD as well as arrows, so D already walks right. Phone tap is mapped to SPACE (`main.js`, `mobile/`).

**Scope** — Fox picks the touched world entity and fires its `MouseDown` on SPACE down and `MouseUp` on SPACE up; D drops; walking becomes arrows only. Clicking is unchanged.
**Out of scope** — HUD/menu buttons, new interactions, `E` select, any phone drop gesture (see Open questions).

**Flow**
1. Fox stands on the kiln/shelf/clay/owl/etc. and taps SPACE: same result as clicking it.
2. Fox stands on clay, bench or tree and holds SPACE: dig/wedge/chop runs; releasing early cancels, as with the mouse.
3. Fox presses D: the selected item goes back to the station or onto the ground, as SPACE did.

**Requirements**
1. SPACE down triggers `MouseDown` on the one touched `Mouse` entity (excluding HUD) whose centre is nearest the fox's centre, ties to higher z; SPACE up triggers `MouseUp` on that same entity.
2. With nothing touched, SPACE does nothing (no drop, no message).
3. Auto-repeat of a held SPACE fires once.
4. D calls `dropSelected` ("Nothing to drop" when empty).
5. D no longer walks the fox; arrow keys move it (WASD per the open question); E unchanged.
6. Mouse and touch clicks behave exactly as before.

**Acceptance criteria**
- [ ] SPACE at kiln, owl, torch, both shelves (slot and elsewhere), scales, glaze buckets, bench models, dropped item each acts like a click.
- [ ] Holding SPACE digs clay, wedges, chops; releasing early stops with the same message.
- [ ] Holding SPACE on an item then walking off cancels cleanly (no stuck dig/wedge sound).
- [ ] SPACE away from everything: nothing happens.
- [ ] D drops to ground, returns models to bench / clay to its node; empty pack shows "Nothing to drop".
- [ ] D does not move the fox; arrows still do.
- [ ] Mouse clicks still work everywhere.

**Constraints** — `components/fox.js` (+ comments in `dropped_item.js`, README wording); Crafty 0.9.0; no new files.
**Open questions**
- Walking: drop WASD entirely (recommended; `multiway` on arrows only) or keep W/A/S?
- Phone tap currently = SPACE = drop. After this it becomes "act", so phones lose drop. Leave as is, or add a gesture (e.g. swipe down = D) in a follow-up?

**Tasks**
- [ ] `fox.js`: replace `fourway` with arrows-only `multiway`
- [ ] `fox.js`: SPACE KeyDown/KeyUp → nearest touched entity's `MouseDown`/`MouseUp`; ignore repeats
- [ ] `fox.js`: D → `dropSelected`; fix header comments
- [ ] README + `dropped_item.js` comment: SPACE/D wording
- [ ] Verify every acceptance item in-app
