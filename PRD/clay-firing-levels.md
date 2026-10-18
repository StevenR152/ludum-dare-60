# PRD: Clay needs a firing level

**Goal** — Each clay type needs one firing level (low, mid or high); a pot fired at any other level cracks when it cools, is marked with a black cross, and can't be shelved.

**Context**
- Clay types live in `CLAY_TYPES` (`constants.js`); `Pottery` copies name/colour into `pottery.clay` and walks `POTTERY_STATES` (`pottery.js`). Nothing can crack yet.
- Another agent is changing the kiln: a 3-log wood inventory, where 1 log = low, 2 = mid, 3 = high fire. This PRD touches none of that.
- Pots are drawn as coloured boxes in the HUD (`inventory_hud.js`) and on shelves (`shelf.js`), both via `itemColor` (`inventory.js`).

**Scope** — A fire level per clay type, a level on the Pottery, a cracked flag set at `cooled`, a cross drawn on cracked pots in the HUD and shelves, and the completed shelf refusing them.
**Out of scope** — The kiln (logs, wood, UI, its own pot box), the bin where cracked pots get discarded (`PRD/trash-bin.md`; until then SPACE drops them), orders, sounds, glaze, a second firing.

**Flow**
1. The fox digs clay; its type says the level it needs (brown low, red mid, blue high).
2. Wedge, throw and dry as today.
3. The kiln calls `pottery.setFireLevel(level)` before `advance("firing")`.
4. When the pot reaches `cooled` it is `cracked` if the level differs from its clay's level.
5. A cracked pot shows with a black cross in the HUD; the completed shelf refuses it. The fox drops it with SPACE.

**Requirements**
1. `FIRE_LEVELS` in `constants.js` = `["low", "mid", "high"]`; `CLAY_TYPES` entries get `fireLevel`: brown `low`, red `mid`, blue `high`.
2. `new Pottery(clayType)` copies it to `clay.fireLevel`; shared `CLAY_TYPES` is never mutated.
3. `pottery.setFireLevel(level)` stores `pot.fireLevel`. It returns false, warns and changes nothing for an unknown level or unless the state is `dried`.
4. `pot` starts with `fireLevel: null, cracked: false`. On `advance("cooled")`, `pot.cracked = (pot.fireLevel !== clay.fireLevel)`; no level set counts as a mismatch. Cracking is decided only then (no timing skill).
5. A cracked pot keeps its state `cooled`; no station crashes on it. `CompletedShelf` accepts only `cooled` pots that are not cracked, and says so ("Cracked pots can't go on the shelf") so cracked pots never count toward the 3 that end the game.
6. A shared helper next to `itemColor` draws a black diagonal cross over a cracked pot's rectangle; the HUD slot and the shelf slot boxes both use it, and clear it for sound items. `itemColor` is otherwise unchanged.
7. `kiln.js` carries a `NOTE` comment: call `pottery.setFireLevel(level)` before `advance("firing")`, and draw the cross on its own ready-pot box with the same helper. (Written as a comment only; no kiln logic changes.)

**Acceptance criteria**
- [ ] Console: brown fired low → `cracked` false; brown mid/high → true; red needs mid; blue needs high.
- [ ] Console: `setFireLevel("hot")` and a call on a `thrown` pot return false and warn; `CLAY_TYPES` unchanged.
- [ ] A pot cooled with no level set is cracked.
- [ ] A cracked pot in the HUD shows a black cross over its rectangle; a sound pot shows none; SPACE drops it.
- [ ] The completed shelf refuses a cracked pot with the message and the count stays put; a sound pot still goes on, three end the game.
- [ ] A cracked pot placed on any other shelf shows the cross there; the existing loop works once the kiln sets a level.

**Constraints** — Crafty 0.9.0, no new deps. Edit `constants.js`, `pottery.js`, `inventory.js`, `inventory_hud.js`, `shelf.js`, `completed_shelf.js`, a comment in `kiln.js`, README. No kiln logic changes.

**Open questions** — None.

**Tasks**
- [ ] `FIRE_LEVELS` and `fireLevel` on `CLAY_TYPES`
- [ ] `Pottery`: `clay.fireLevel`, `setFireLevel`, `pot.fireLevel/cracked`, crack check on `cooled`
- [ ] Cross helper; use in HUD and shelf slots
- [ ] Completed shelf refuses cracked pots
- [ ] Kiln `NOTE` comment and README
- [ ] Verify in the browser/console

## Decisions
1. Pairings brown low, red mid, blue high → yes.
2. Kiln hook → separate `setFireLevel`, with a note in the kiln code for the other agent.
3. Cracking is decided when the pot reaches `cooled`.
4. Cracked look → black cross over the pot rectangle, in the HUD and in game (shelves; the kiln's own box is the other agent's, via the note).
5. A cracked pot does not count toward the 3 shelved pots.
6. Pot reaching the kiln with no level → cracked (default).
7. A bin will be needed to discard cracked pots → `PRD/trash-bin.md`.
