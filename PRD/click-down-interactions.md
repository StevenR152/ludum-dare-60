# PRD: Interactions fire on click-down
**Goal** — Doors and the other click interactions act the moment the button/finger goes down, not when it is released.

**Context**
- World interactions bind Crafty's `Click`, which fires on release (`scenes/game.js`: doors, owl, kiln, torch, shelves; `GlazeStation`, `Scales`, `Workbench` models, `DryingShelf` slots, `DroppedItem`).
- Hold interactions (`Clay` dig, `Workbench` wedge, `Forest` chop) already use `MouseDown`/`MouseUp`/`MouseOut`.
- Crafty's Mouse component turns touch into mouse events, so `MouseDown` also covers phone taps.

**Scope** — Switch the in-world `Click` bindings above to `MouseDown`. Same handlers, same "fox must be touching" checks.
**Out of scope** — Hold-to-dig/wedge/chop timing; UI buttons (`UIButton` Start/End, `MuteButton`); `mobile/touch-controls.js` (Space tap); the debug `logClickPosition`; door position/teleport behaviour (see `PRD/door-teleport.md`).

**Flow**
1. Fox stands at a door and presses the mouse button (or taps).
2. Fox arrives below the partner door at once, with the button still held.
3. Releasing the button does nothing extra.

**Requirements**
1. Each listed entity triggers its action on `MouseDown`, not `Click`.
2. Doors teleport on press, in both directions, landing as before (below the partner, centred, clear of it).
3. Releasing a press never triggers a second action, including on whatever is under the cursor after a teleport.
4. One press triggers exactly one action per entity (no double fire from `Click` plus `MouseDown`).
5. "Fox must be touching it" checks and status messages are unchanged.
6. Hold interactions and UI buttons behave as before.

**Acceptance criteria**
- [ ] Pressing (not releasing) on the outside door moves the fox inside; same for the inside door back out.
- [ ] Holding the button after a door press and releasing elsewhere causes nothing.
- [ ] Owl, kiln, torch, both shelves, glaze buckets, scales, models and dropped items each respond on press.
- [ ] Drying shelf slot press takes that pot once, and the shelf's own handler doesn't also fire.
- [ ] Dig, wedge and chop still need the full hold; Start/End/mute buttons still work.
- [ ] A phone tap on a door teleports on touch-down.

**Constraints** — Edit existing files only (`scenes/game.js` plus the components listed); no new files; Crafty 0.9.0.
**Open questions** — None.

## Decisions
- Scope: every in-world interaction except timed (hold) ones like dig, wedge, chop. Includes dropped-item pickup.
- UI buttons (Start, End, mute) stay on release.
- After a press-triggered teleport the held press is ignored until released: nothing else fires from it.

**Tasks**
- [ ] Doors: `useDoor` bound to `MouseDown`
- [ ] `scenes/game.js`: owl, kiln, torch, shelves to `MouseDown`
- [ ] `glaze_station.js`, `scales.js`, `workbench.js` models, `dropped_item.js` to `MouseDown`
- [ ] `drying_shelf.js` slot boxes: ensure only one of slot/shelf fires per press
- [ ] Check README/index.html wording ("click") and verify each acceptance item in-app
