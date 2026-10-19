# PRD: Level 2 door glow hint

**Goal** — On level 2, if the player hasn't gone through the door into the house after 1 minute, the door glows to point the way.

**Context**
- Level 2 is "A Cup for Barnaby" (`LEVELS[1]`, `scenes/levels.js`): `inside: true`, the fox starts outside, and the clay must go to the owl indoors.
- The outside door is the `doorOutside` art entity in `buildWorld` (`scenes/game.js` ~309); walking into its zone fires `useDoor` and `Crafty.trigger("DoorUsed")`.
- Per-level behaviour is switched on via the `world` config (like `kilnHint`); door size/position live in `DOOR_BOXES` (`constants.js`).

**Scope** — A timed glow on the outside door for level 2, done in code (CSS), no new art. **Out of scope** — door art (original assets only, no AI edits), door behaviour/teleport, other levels, inside door, sounds.

**Flow**
1. Level 2 loads; a 60 s timer starts.
2. Fox goes through the door within 60 s → timer cancelled, no glow, ever.
3. Otherwise at 60 s the outside door starts a pulsing gold outline, like the inventory pack hint.
4. Fox walks into the door → glow stops permanently.

**Requirements**
1. `constants.js` has `DOOR_GLOW_DELAY_MS = 60000`, commented; the glow reuses `PACK_HINT_COLOR` (#FFC107).
2. The level 2 `world` sets `doorGlowAfterMs` (via `DOOR_GLOW_DELAY_MS`); other levels leave it out and never glow.
3. After that many ms without a `DoorUsed`, the outside door gets a 3px gold border plus a pulsing gold `box-shadow` (same keyframes style as `packHintPulse` in `inventory_hud.js`).
4. The first `DoorUsed` cancels the timer or removes the glow, for good (no re-arming).
5. The glow doesn't change the door's size, position or trigger zone, and never blocks clicks/walking.
6. Level load/Restart starts a fresh timer; leaving the level leaves no timer or glow behind.

**Acceptance criteria**
- [ ] Level 2: at 60 s idle outside, the door glows gold and pulses (checked with a temporary short delay, reverted to 60000)
- [ ] Using the door before 60 s: no glow ever appears
- [ ] Glow turns off once the fox walks through, and does not return after coming back out
- [ ] Levels 1 and 3–7 never glow
- [ ] Restart on level 2 restarts the 60 s countdown; no console errors
- [ ] Door still teleports both ways as before

**Constraints** — `constants.js`, `scenes/levels.js`, `scenes/game.js` only; use Crafty `Delay`/DOM CSS like the Restart pulse; match existing style.

**Open questions** — None.

**Tasks**
- [ ] Add glow constants to `constants.js`
- [ ] Add `doorGlowAfterMs` to the level 2 world and document it in the `buildWorld` config comment
- [ ] In `buildWorld`: start the timer, glow the door on expiry, clear on `DoorUsed`
- [ ] Verify against acceptance criteria

## Decisions
- Timer counts from level load; a door use cancels it. Restart re-arms it.
- Glow stops permanently on the first door use; never returns.
- Look: pulsing gold outline matching the inventory pack hint (`PACK_HINT_COLOR`).
- Only the outside door, only level 2.
- Test with a temporary short delay, then restore 60000.
