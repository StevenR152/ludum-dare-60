# PRD: Clay state machine (Pottery object)

**Goal** — Every dug kilo of clay becomes one `Pottery` object whose `state` only moves along a fixed path, and each station does its step only when the pottery is in the right state.

**Context**
- Progress is spread over loose flags: `wedged` (clay), `drying`/`dried`/`fired` (pot), plus the Kiln's own `state`. Each station checks them in its `Inventory` `accepts`/`releases` rules (`workbench.js`, `potter.js`, `drying_shelf.js`, `kiln.js`, `completed_shelf.js`).
- `Inventory` allows one item `type` at a time ("clay" or "pot"); `itemColor` and the HUD outline read the flags.
- The loop already plays in order, but nothing enforces it.

**Scope** — A `Pottery` class (new `pottery.js`) with `clay`, `pot` and `state`; a `POTTERY_STATES` table; stations use it instead of flags. **Out of scope** — Glaze (the table just supports optional states), cracking/failure, order matching, new stations, timings, art, sounds, the Kiln's zone-colour `state`.

**Flow** (state in brackets)
1. Dig clay: new Pottery, clay copied from the clay type (name, colour) [dug].
2. Hold on workbench 3 s: weighed and wedged [wedged].
3. Owl throws it: `pot` created [thrown].
4. On drying shelf [drying], after 15 s [dried].
5. Placed in kiln: firing starts [firing]; then cooling [cooling]; then [cooled]; fox takes it out.
6. Put on completed shelf [shelved].

**Requirements**
1. `Pottery` has `clay` `{name, color, wedged:false, weight:null}`, `pot` (null until thrown) and `state`. Both `clay` and `pot` start null before the dig; the dig fills `clay`. Shared `CLAY_TYPES` is never mutated.
2. Wedging sets `clay.wedged = true` and `clay.weight = 1000` (grams, the measured kilo). Throwing sets `pot = {shape, size, dried:false, fired:false, completed:false}` (shape/size placeholders, `"pot"`/`"medium"`); `dried`, `fired`, `completed` flip true on the matching transitions. The pot inherits `clay.color`.
3. `POTTERY_STATES` in `constants.js` is an ordered list `{name, optional}`: dug, wedged, thrown, drying, dried, firing, cooling, cooled, shelved (none optional yet). `pottery.advance(to)` succeeds if `to` is the next state, or every state between is `optional`; else it returns false, warns in the console and changes nothing. No going back.
4. `pottery.type` is `"clay"` until `pot` exists, then `"pot"`, so `Inventory`'s one-type rule and the "clay or pots, never both" pack are unchanged.
5. Each station's accept rule is "pottery is in the state before mine": workbench `dug`, owl `wedged`, drying shelf `thrown`, kiln `dried`, completed shelf `cooled`. Drying shelf releases only `dried`; kiln only `cooled`. The owl moves the same Pottery from input to output (no new object).
6. Timers advance state through `advance` (drying→dried; firing→cooling→cooled). The Kiln keeps its own `state` for its zone colour, but release now checks `pottery.state === "cooled"`.
7. No code reads `wedged`, `drying`, `dried`, `fired` on items any more. Refusal statuses stay as today.
8. `itemColor`/HUD derive from state: dug/wedged clay use `clay.color` (wedged outline as today); thrown/drying use the wet colour; dried/firing/cooling the dried colour; cooled/shelved the fired colour.

**Acceptance criteria**
- [ ] Full run in the browser (not run: browser pane denied localhost) dig → wedge → owl → dry → kiln → shelf works; the 3rd shelved pot ends the game.
- [ ] (browser, not run) Owl refuses `dug` clay; kiln refuses a `thrown`/`drying` pot; completed shelf refuses a pot not `cooled`; drying shelf refuses clay.
- [ ] (browser, not run) Pot in the kiln can't be taken during firing or cooling, only when `cooled`.
- [x] Console: `advance` on a skip (`dug`→`thrown`) or repeat returns false; a table with an optional middle state lets it be skipped.
- [x] After throwing, `pottery.pot` holds shape, size and the three flags; `clay.weight` is 1000 after wedging.
- [x] grep finds no `.wedged`/`.dried`/`.fired`/`.drying` on items; colour mapping checked in Node (HUD/shelf not seen in a browser).
- [ ] HUD/shelf colours and no console errors in the running game (browser pane refused localhost, not verified).

**Constraints** — Crafty 0.9.0, no new deps. New `components/pottery.js` (in `index.html`); edits to `constants.js`, `clay.js`, `workbench.js`, `potter.js`, `drying_shelf.js`, `kiln.js`, `completed_shelf.js`, `inventory.js`, `inventory_hud.js`; README updates.

**Open questions** — None.

**Tasks**
- [x] `Pottery` class, `POTTERY_STATES`, `advance`; `type`, `itemColor`/HUD from state
- [x] Clay dig creates Pottery; workbench wedges/weighs; owl throws the pot
- [x] Drying shelf and kiln use states (timers advance them)
- [x] Completed shelf uses states; remove old flags
- [x] README update
- [ ] Verify acceptance criteria in the browser (blocked, see above)

## Decisions
1. Pottery object with `clay`, `pot`, `state`; owl turns clay into a pot on the same object; optional states supported (user).
2. Kiln keeps its zone `state`; Pottery state is the truth for release (default).
3. Drying shelf releases only `dried`.
4. Colours as listed in req. 8 (default).
5. Rejected `advance` returns false and warns in the console.
6. `Pottery` is a plain global, testable from the console.
7. SPACE drop discards the item as today (default).
8. Weight = 1000 g set at wedge (my reading of "etc for weight").
