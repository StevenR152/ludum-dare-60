# PRD: Visible door teleport locations (debug)

**Goal** — With `DEBUG_HITBOXES` on, each `DOOR_DESTINATIONS` spot is drawn in lime green so it can be tweaked by eye.

**Context**
- `constants.js:102` `DOOR_DESTINATIONS` already sets the arrival x, y (fox sprite top-left); `game.js:185-186` and `useDoor` use it. Only the visualisation is missing.
- `DebugHitbox` (`components/debug_hitbox.js`) draws a hard-coded red 2px border on `DebugOutlineLayer`, z 1000.
- `game.js:189-199` already console-warns on a blocked or door-touching spot.

**Scope** — Lime-green marker per destination, shown only when `DEBUG_HITBOXES`; `DebugHitbox` takes an optional colour. **Out of scope** — door sizes/positions, art, fox collision, arrival logic, other people's areas.

**Flow**
1. `DEBUG_HITBOXES = true`, load the game.
2. Lime boxes sit at both arrival spots, labelled.
3. Edit `DOOR_DESTINATIONS`, reload: the boxes move with it.

**Requirements**
1. Two markers, one per `DOOR_DESTINATIONS` entry, each the full fox sprite box (160x102, at x, y).
2. Lime green border, not red; existing red hitboxes unchanged.
3. Each has a small label ("to inside" / "to outside").
4. Hidden when `DEBUG_HITBOXES` is false.
5. Markers read positions from `DOOR_DESTINATIONS`; no copied coordinates.
6. Markers are non-interactive and never affect collision or the door triggers.

**Acceptance criteria**
- [x] Both lime boxes visible at the arrival spots; fox lands exactly in the matching box after a door.
- [x] Changing a `DOOR_DESTINATIONS` value and reloading moves its box.
- [x] `DEBUG_HITBOXES = false`: no markers, no labels.
- [x] Fox, door and station red hitboxes still red.
- [x] No new console warnings; no ping-pong at defaults. (headless Chromium; stand-in art for missing pot/sound files)

**Constraints** — `components/debug_hitbox.js`, `scenes/game.js`, `constants.js` (colour constant). No art/sound changes. Use `DebugOutlineLayer`.

**Decisions** — Marker = full sprite box. Colour = lime green (`DEBUG_DESTINATION_COLOR` in constants.js). Labelled. Colour is set via a `debugBorder(color)` method on `DebugHitbox`. README line 34 updated.

**Open questions** — None.

**Tasks**
- [x] Add optional colour to `DebugHitbox` (default red).
- [x] Add `DEBUG_DESTINATION_COLOR = "lime"` to constants.js.
- [x] Draw labelled markers from `DOOR_DESTINATIONS` in game.js.
- [x] Verify in browser, `DEBUG_HITBOXES` on and off.
