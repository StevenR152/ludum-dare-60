# PRD: Auto-triggering doors, thinner inside door

**Goal** — Walking into either door teleports the fox instantly (no click), and the inside door is thinner and shifted left.

**Context**
- `scenes/game.js:160-180`: both doors teleport via `MouseDown` only when the fox already touches them.
- Inside door is `x:-2619, w:62, h:185`; outside door `x:1120, w:60, h:110`. Arrival spot is 20px below the partner door (clear of it).
- Prior behaviour in `PRD/door-teleport.md` ("Walking into a door alone does nothing") is superseded.

**Scope** — Inside door: narrower and moved left. Both doors: teleport on fox overlap, no click. **Out of scope** — outside door size/position, door art, sounds, transitions.

**Flow**
1. Fox walks into the Outside door → appears below the Inside door.
2. Fox walks into the Inside door → appears below the Outside door.
3. Standing where it arrived does nothing; walking back into the door goes back.

**Requirements**
1. Inside door width 62 → 40 (assumed "thinner"), x moved left by a quarter of the old width (~16px), height unchanged.
2. Fox overlapping a door triggers the teleport automatically, once per entry.
3. Clicking is no longer required (click handler removed).
4. Arrival spot stays clear of the partner door, so no ping-pong.

**Acceptance criteria**
- [x] Inside door visibly thinner and further left.
- [x] Touching the outside door teleports inside with no click.
- [x] Touching the inside door teleports outside with no click.
- [x] No repeated teleporting while standing at the arrival point.
- [ ] Works with keyboard and touch controls. (not device-tested; trigger is position-based so input-agnostic)

**Constraints** — `scenes/game.js` only; reuse existing `useDoor` logic.

**Open questions** — "Thinner" amount and "1/4 more left" (of door width vs. of position) are assumed above; say if you want different values.

**Tasks**
- [x] Resize and shift the inside door.
- [x] Replace `MouseDown` binding with an overlap check (e.g. `EnterFrame`) on both doors.
- [x] Verify both directions in browser, no ping-pong.

**Follow-up (done):** both doors hitboxes extended 60px up and 60px down and made transparent (invisible trigger zones).

**Follow-up (done):** fox touch area is now its sprite box inset 40px on every side (`FOX_HITBOX_INSET`, `Fox.touches()`), used by doors, stations, and collision hits.
