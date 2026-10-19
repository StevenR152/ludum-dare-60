# PRD: Full-pack drop hint
**Goal** — The first time the fox's pack-full message is shown, say it with a drop suggestion and flash a golden highlight on the fox's inventory slot that pressing would drop.

**Context**
- The full line is "Backpack full, you can't put more in", shown from `Fox.pickUp` (`fox.js`) and, after a chop fills the pack, `Forest.finishChop` (`forest.js`). Both go through `showStatus` → `PlayerNotification`.
- The fox's row is an `InventoryHud` (`game_hud.js`); a slot press already selects, or drops if selected (`Fox.pressSlot`); BACKSPACE drops the selected item (`Fox.dropSelected`). The selected slot is outlined white.
- `gameState` (`game_state.js`) holds per-run state and is reset by `resetGameState()`.

**Scope** — First pack-full message per run: new line + flash on the selected fox slot. **Out of scope** — Owl/Kiln rows, other messages, later full messages (unchanged), art/sound, drop behaviour itself.

**Flow**
1. Fox's pack is full and a pickup fails (or a chop fills it) for the first time this run.
2. Text above the fox reads "My backpack is full, I could drop something that I'm holding (interact in the top left)" (fox's voice).
3. The selected slot in the Fox HUD row pulses gold for as long as the message is up; it follows the selection if the player picks the other slot.
4. Player clicks/taps the slot (or presses BACKSPACE): the item drops; the flash stops.
5. Later full-pack events in the same run show the old line, no flash.

**Requirements**
1. One shared `packFull(fox)` helper used by both call sites; a `gameState.packHintShown` flag set when the hint fires, cleared by `resetGameState()`.
2. First time: show the new line once; afterwards the existing line.
3. `InventoryHud.flashSlot(inventory, index, ms)` draws a gold (#FFC107-ish) pulsing border/glow on that slot; only one flash at a time.
4. The flash targets `inventory.selected` (the item a press or BACKSPACE would drop) and moves with it.
5. Flash lasts the message's duration (PlayerNotification: 1500 ms + 50 ms/char, plus the 600 ms fade), and also ends once the pack is no longer full or on HUD disable.
6. Flash never changes slot size, outline logic, or press handling.

**Acceptance criteria**
- [ ] Fill the pack, try a 3rd pickup: new line shown, selected slot flashes gold.
- [ ] Click the flashing slot / BACKSPACE: item drops, flash stops.
- [ ] Select the other slot (E): the flash moves to it.
- [ ] Flash and message fade out together.
- [ ] Second full-pack event in the same run: old line, no flash.
- [ ] Chopping the last log into a full pack shows the new line once, not twice.
- [ ] Play Again / new run: hint shows once again.
- [ ] Owl and Kiln rows never flash; no console errors.

**Constraints** — `components/fox.js`, `forest.js`, `inventory_hud.js`, `game_hud.js`, `game_state.js`, README if it lists messages; Crafty 0.9.0; no new files, no new art/sound.

**Open questions** — None.

**Tasks**
- [ ] `game_state.js`: `packHintShown` flag
- [ ] `inventory_hud.js` + `game_hud.js`: `flashSlot` / stop, fox row hookup
- [ ] `fox.js`: `packFull()` helper; `pickUp` uses it
- [ ] `forest.js`: use the helper after the filling chop
- [ ] Verify in browser (both triggers, drop via click and BACKSPACE, restart)

## Decisions
1. Wording → "…I could drop something that I'm holding (interact in the top left)"; "backup" read as a typo for "backpack".
2. Once per run (default flag reset by `resetGameState`).
3. Flash the currently selected slot; it follows selection.
4. Flash lasts as long as the status message.
5. All triggers (pickup, dig, chop, dropped item), via one helper.
6. Gold pulse border, ~0.6 s cycle, same slot size (default).
