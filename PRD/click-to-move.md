# PRD: Click to move
**Goal** — Pressing the ground walks the fox there; pressing an out-of-range interaction point walks the fox to it.

**Context**
- The fox moves only by keys (`Fourway` in `components/fox.js`, `FOX_SPEED`); phones walk toward a held finger (`mobile/touch-controls.js`, `holdToward`) and keep doing so.
- In-world interactions bind `MouseDown` and check `player.touches(this)`; out of range they show a line (kiln: "I can't reach the kiln from here") or do nothing.
- The ground is not a click target; `Crafty.s("Mouse")` `MouseDown` gives `realX/realY`. `Fox.keepInBounds` already stops the feet at walls.

**Scope** — A click-to-move walk on the fox: destination, per-frame step at the fox's current (slowed) speed, stop on arrival or at a wall. Ground press sets the destination to the press point; an out-of-range press on an interaction point sets it to that entity.
**Out of scope** — Pathfinding; changing hold timings (dig, wedge, chop), door teleport, UI buttons, or `mobile/touch-controls.js` (touch-and-hold keeps its current behaviour).

**Flow**
1. Press open ground: the fox walks in a straight line, facing its direction, until its feet box contains the clicked x,y. While the button stays down the target follows the cursor; on release it stays at the last position.
2. Tap a far station: its out-of-range line plays, the fox walks until it touches the station, then stops. A second press interacts.
3. Press and hold a far hold-station: no line, the fox walks there and the held interaction starts on arrival (details: Decisions).
4. Press an in-range station: it acts as today, no walk.
5. Arrow/WASD keys or a new press cancel or replace the walk.

**Requirements**
1. Ground press sets a destination; walk speed is `FOX_SPEED` with carry/ground slowdowns.
2. The sprite flips to the horizontal direction of travel, as with keys.
3. Out-of-range tap on a station shows its out-of-range line (fox's first-person voice) and starts a walk to it; if the press is held, no line.
4. The walk ends when the feet box (`FOX_FEET_BOX`) contains the target x,y (ground) or the fox first touches the station.
5. The walk ends the moment a step would put the feet on out-of-bounds ground (no sliding, no jitter, no timeout); walking up to the wall is fine.
6. Presses on the HUD/UI never start a walk; a press on a door is a ground press, so the fox walks onto it and teleports.
7. Only movement keys cancel; E and SPACE don't. A new press replaces the walk.
8. Scene change, restart, door teleport and menu clear the walk.
9. Existing key movement, stumbles, drops and touch-and-hold behave as before.

**Acceptance criteria**
- [ ] Press open ground: the fox walks there, stops with its hitbox on the point.
- [ ] Tap the kiln from afar: line plays, fox walks to it and stops touching; a second tap loads/acts once.
- [ ] Press and hold the kiln from afar: no line.
- [ ] Press an in-range station: no walk.
- [ ] Hold clay from afar and stay held: dig starts on arrival; release before arrival: nothing starts.
- [ ] Arrow key mid-walk cancels it; E/SPACE don't.
- [ ] Press beyond a wall: the fox stops the moment it meets the wall.
- [ ] Hold and drag on the ground: the fox follows the cursor; release keeps the last target.
- [ ] Press on HUD/UI: no walk. Press on a door: the fox walks in and teleports.
- [ ] Carrying clay or standing on dropped items slows the walk like keys.
- [ ] Phone touch-and-hold unchanged.

**Constraints** — Crafty 0.9.0; edit existing files (`components/fox.js`, `scenes/game.js`, interaction components); no art or sound changes.
**Open questions** — None.

## Decisions
- Interact on arrival only for held presses; otherwise stop and wait for another press.
- Tap on an out-of-range station: play its line, then walk. Held: walk silently.
- Stop when the fox's feet box contains the clicked x,y.
- Holding the ground and dragging moves the target with the cursor; release keeps the last target.
- Hitting a wall stops the walk immediately; walking up to one is fine, no pathfinding.
- HUD/UI presses never walk; doors count as ground (default).
- Phones keep touch-and-hold to move for now.
- Only movement keys cancel (default).
- Hold stations: the interaction fires on arrival only if the press is still held then; released before arrival, the fox just arrives and nothing happens.

**Tasks**
- [ ] `fox.js`: `walkTo(x, y)`, per-frame step, cancel on keys/new press/teleport
- [ ] `game.js`: ground press listener (skip when a `Mouse` entity was hit)
- [ ] Out-of-range station presses: line (tap only) + `walkToEntity`
- [ ] Hold stations: start on arrival only if the press is still held
- [ ] README "How to play"; verify each acceptance item in-app
