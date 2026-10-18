# PRD: Clay state machine

**Goal** — Every kilo of clay carries one `stage` that moves along a fixed path, and each station may only do its step when the item is in the right stage.

**Context**
- Progress is spread over flags: `wedged` (clay), `drying`/`dried`/`fired` (pot), plus the kiln's own `state`. Each station checks its own flags in its `Inventory` `accepts`/`releases` rules (`workbench.js`, `potter.js`, `drying_shelf.js`, `kiln.js`, `completed_shelf.js`).
- `itemColor` in `inventory.js` picks colours from those flags; the Kiln already walks empty → firing → cooling → ready.
- The loop already plays in this order, but nothing says what comes next or rejects a step out of order.

**Scope** — A small `ITEM_STAGES` table and `advanceStage(item, to)` helper (one place that knows the path); replace the scattered flags with `item.stage`; stations call `advanceStage` and check `item.stage`; `itemColor` reads `stage`.
**Out of scope** — New stations, glaze, cracking or failure stages, order matching, timings, art, sounds; changing the Kiln's own zone-colour `state` (it stays the station's state, the item's stage follows it).

**Flow** (stage in brackets)
1. Fox digs clay [dug].
2. Hold on workbench 3 s [wedged].
3. Owl takes it and throws a pot [thrown].
4. Pot put on the drying shelf [drying], then after 15 s [dried].
5. Dried pot put in the kiln, firing starts [firing].
6. Firing ends, cooling starts [cooling].
7. Cooling ends [cooled]; the fox takes it out.
8. Cooled pot put on the completed shelf [shelved].

**Requirements**
1. `ITEM_STAGES` in `constants.js` lists the order: dug, wedged, thrown, drying, dried, firing, cooling, cooled, shelved.
2. `advanceStage(item, to)` succeeds only when `to` is the stage right after `item.stage`; otherwise it returns false and changes nothing. No skipping, no going back.
3. Dug clay starts as `dug`; the owl's output pot is `thrown`. Both types otherwise unchanged.
4. Each station's accepts rule is "item is in the stage before mine": workbench `dug`, owl `wedged`, drying shelf `thrown`, kiln `dried`, completed shelf `cooled`. The drying shelf releases only `dried`, the kiln only `cooled`.
5. Timers advance the stage (drying→dried, firing→cooling→cooled) through `advanceStage`; no code reads `wedged`, `dried`, `drying` or `fired` any more.
6. Refusal statuses stay as today, based on stage (e.g. "Wedge the clay first", "The pot needs to dry first").
7. `itemColor` and the HUD outline derive from `stage` and look the same as now for each step (wedged outline, wet/dried/fired colours; a cooling pot shows the in-kiln colour).

**Acceptance criteria**
- [ ] Full run dig → wedge → owl → dry → kiln → shelf works end to end and the 3rd shelved pot ends the game.
- [ ] Owl refuses `dug` clay; kiln refuses a `thrown`/`drying` pot; shelf refuses a pot not `cooled`; drying shelf refuses clay.
- [ ] A pot in the kiln cannot be taken during firing or cooling, only once `cooled`.
- [ ] `advanceStage` unit check in the console: a skip (`dug`→`thrown`) and a repeat both return false.
- [ ] HUD and shelf colours match today's for every step; no console errors; `grep` finds no `.wedged`, `.dried`, `.fired`, `.drying`.

**Constraints** — Crafty 0.9.0, no new deps. Helper lives in `components/inventory.js` beside `itemColor`; edits to `constants.js`, `clay.js`, `workbench.js`, `potter.js`, `drying_shelf.js`, `kiln.js`, `completed_shelf.js`, `inventory_hud.js`; README mentions updated.

**Open questions** — None. (Assumed: placing a pot in the kiln starts firing at once, so "placed in kiln" and "firing" share one stage.)

**Tasks**
- [ ] `ITEM_STAGES` + `advanceStage`; `itemColor`/HUD from `stage`
- [ ] Clay, workbench, owl use stages
- [ ] Drying shelf and kiln use stages (timers advance them)
- [ ] Completed shelf uses stages; remove old flags
- [ ] README/components README; verify acceptance criteria in the browser
