# PRD: Goal steps tick off as you play

**Goal** — Each Goal-panel step flips from ☐ to ☑ the first time the player does it, driven by game events the panel listens for.

**Context**
- `showGoalPanel` (`scenes/levels.js`) draws static text; `level.steps` is a string list, never ticked.
- Gameplay already announces itself with global `Crafty.trigger`: `KilnLit`, `PotterWorking`, `PotsDried`, `PotGlazed`, `OrderDelivered`. Gaps: `ClayDug` is entity-local (`this.trigger`, clay.js:79, nobody hears it), no event for logs chopped, and pot state changes (`Pottery.advance`, pottery.js:105) are silent.
- Weigh (`weighOut`), wedge and throw all go through `advance`, so one event there covers weighed/wedged/thrown/fired/cooled/glazed.

**Scope** — Global events `LogChopped`, `ClayDug` (made global), `PotAdvanced {pot, to}`; each step becomes `{text, on, when?}`; the Goal panel binds the events and re-renders ticked lines. **Out of scope** — step order enforcement, sounds/animation, saving ticks, level-complete logic (stays on `OrderDelivered`), analytics.

**Flow**
1. Level starts: every step ☐.
2. Player does a matching action (e.g. chops a log): that line becomes ☑ at once; repeats do nothing.
3. Steps tick in any order. Restart / next level rebuilds the panel with all ☐.

**Requirements**
1. `Forest.finishChop` fires `Crafty.trigger("LogChopped")` on a successful chop; `Clay.dig` fires global `ClayDug` with the clay type.
2. `Pottery.advance` fires `Crafty.trigger("PotAdvanced", {pot: this, to: to})` after a successful change.
3. Step shape `{text, on: "EventName", when: function(payload)}`; no `when` = any payload. Each ticks once.
4. Mapping: chop log→`LogChopped`; set fire level→`KilnLit`; bisque→`PotAdvanced` to `cooled`; fire again→`glazeCooled`, each only if `!pot.pot.cracked` (a cracked pot doesn't count as fired); dig→`ClayDug`; weigh→`weighed`; wedge→`wedged`; owl→`PotterWorking` (bundled steps tick on their last action only); dry→new `PotDry` (fired from `Pottery.dry` when dryness reaches 1; `PotsDried` fires every frame so isn't used); glaze→`PotGlazed`; shelf→`OrderDelivered`.
5. The panel unbinds with its scene (no stale ticks after Restart); layout and height unchanged.
6. Existing listeners are unaffected (`PotCracked`, `OrderDelivered` level-complete still work).

**Acceptance criteria**
- [x] L1: chopping a log ticks "Chop logs"; lighting the kiln ticks "Set the fire level" (fire steps checked via real Pottery.advance, not a live kiln run); a cracked pot ticks neither.
- [x] L2: each of the 8 steps ticks on its action, in whatever order done.
- [x] L3: glaze dip ticks "Dip it in a glaze"; shelf delivery ticks last step.
- [x] Repeating an action doesn't change anything; Restart resets all to ☐.
- [x] No console errors. (Level complete advancing not re-tested; that code is untouched.)

**Constraints** — Crafty 0.9.0, no deps. Edits: `scenes/levels.js`, `components/forest.js`, `clay.js`, `pottery.js`.

**Open questions** — None.

**Tasks**
- [x] Add `LogChopped`, global `ClayDug`, `PotDry`, `PotAdvanced` triggers
- [x] Convert `LEVELS[].steps` to `{text, on, when}` with the mapping above
- [x] Goal panel: keep text entity, bind events, re-render with ☑
- [x] Verify each level in the browser

## Decisions
1. Bundled steps (L2/L3 owl, L3 dig-weigh-wedge) → tick on the last action only (default).
2. "Dry the pot" → ticks when a pot reaches bone dry, via a new `PotDry` event (default).
3. Fire steps → tick when the pot comes out of the kiln, and only if uncracked; a cracked pot doesn't count.
4. Specifics (black, 200 g, 1 log) → not enforced; any dig/weigh/fire ticks (default).
5. Style → plain ☑, text unchanged (default).
6. Ticks on first occurrence, any order, not persisted (default).
