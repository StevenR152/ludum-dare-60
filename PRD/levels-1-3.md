# PRD: Level select and levels 1–3

**Goal** — Play opens a numbered mission list; levels 1–3 are separate scenes that teach firing, then pottery-making, then glazed orders, one new idea at a time.

**Context**
- One `Game` scene (`scenes/game.js`) builds the whole world and runs endless random orders (`OrderPanel`, 1 per 2 min); the game ends after 3 delivered orders (`ORDERS_TO_WIN`). `Start` → `Game` → `End`.
- Reusable now: `Kiln` (fire levels by logs), `Forest`, `DryingShelf`, `CompletedShelf`, `GlazeStation`, `Potter` (owl), `Workbench`, `WeighingStation`, `Clay`, `DroppedItem`, `Pottery` states, `findOpenOrder`/`deliverOrder`.
- Not there yet: level scenes, fixed order lists, pre-placed pots, per-level feature switches, a restart button, saved progress.

**Scope** — Level-select scene; `Level1`–`Level3` scenes sharing one world builder (the `Game` scene body becomes `buildWorld(config)`); `LEVELS` config table; fixed-order mode; pre-placed pots; Restart button; Level Complete screen; `UNLOCK_ALL_LEVELS` constant.
**Out of scope** — Levels 4+, challenge and continuous modes (described below only); new art/sound (placeholders OK); changing the existing `Game` scene's behaviour (kept as-is for the future continuous mode); trimming (never used in levels 1–3).

## Shared rules (levels 1–3)
- **Menu:** Play → `LevelSelect` lists "1  Kiln Creations", "2  Pottery Craft", "3  First Orders" as buttons. Level 1 is open; 2 and 3 show a lock and ignore clicks until the previous level is completed. `UNLOCK_ALL_LEVELS = true` in `constants.js` opens all (set true while we develop).
- **Orders** are a fixed list given at the start (no random orders, no new ones arrive). They have no deadline, so no penalties or red cards. Score isn't shown in levels 1–3.
- **Complete:** all of the level's orders are delivered (level 1: the 3rd glaze-fired pot taken from the kiln) → 1.5 s pause → `LevelComplete` (level name, time) with "Next level" (hidden after level 3) and "Level select". Completing N unlocks N+1 (remembered in `localStorage`, guarded).
- **Restart:** a "Restart" button in the HUD is always visible and reloads the level from scratch. When any pot cracks (`PotCracked`) a message says "Cracked: restart the level" and the Restart button pulses; the player must restart (in level 1 especially, with no spare pots). No game over screen.
- **Goal panel:** a HUD box titled "Goal" with a one-line description and a checkbox list of the level's steps (below). The boxes are static and never tick for now; ticking is a later feature.
- **Menu buttons:** every level has "Menu" (to Level select) beside Restart; Level select has "Back" (to Start).
- **No ground damage:** in levels 1–3 pots dropped or walked over never take damage (`potsBreakOnGround: false`); they still slow the fox. Pots still crack from firing mistakes.

## Level 1 — Kiln Creations (learn clay, firing levels, bisque then glaze firing)
- **World:** Outside only. The house (Inside) isn't built: no door, inside map or mask, completed shelf, owl, weighing station, workbench, drying shelf or glaze station. Present: kiln, torch, forest. Only what the goal needs is placed.
- **Pre-placed:** 3 bone-dry unfired pots on the floor next to the kiln (`DroppedItem`s): white Cup, red Bowl, black Vase. No table. Each order needs both firings.
- **Teaching:** the Goal panel steps are: chop logs → set the fire level with logs → fire pots (bisque) → fire again. A fixed card shows black = low (1 log), red = mid (2 logs), white = high (3 logs); status hints on first kiln use. The kiln takes 4 pots, but a mixed batch cracks the pots whose clay needs another level.
- **Orders (fixed, 3, unglazed):** white Cup, red Bowl, black Vase. Nothing is delivered: a card turns green when a matching pot is taken out of the kiln after its glaze firing, so each order needs the second firing. The second firing is a plain fire since glazing is off.
- **Goal / early end:** the level ends (game over, straight to `LevelComplete`, no 1.5 s pause) the moment the fox removes the 3rd order pot from the kiln after its glaze firing; nobody carries pots anywhere else.

## Level 2 — Pottery Craft (make one pot end to end)
- **World:** only what the goal needs (no glaze station, no red or white clay patches, no other models): black clay patch only (low fire, 1 log: "single wood"), forest, kiln, owl, weighing station, workbench with a single Cup model, drying shelf, completed shelf.
- **Pre-placed:** nothing; no clay in the pack. The fox starts Outside.
- **Goal steps:** dig 1 kilo → weigh 200 g → wedge → hand clay and model to the owl → dry → fire (1 log) → fire again → completed shelf. (checklist in the Goal panel).
- **Orders (fixed, 1, unglazed):** black Cup.
- **Goal:** deliver that one cup.

## Level 3 — First Orders (four orders, one glaze each)
- **World:** all the stations the goal needs, including the glaze station (both buckets) and all 3 clay patches; workbench with a single Cup model; owl, weighing, drying, kilns, forest, completed shelf. Pots take **one dip only** (`maxGlazeDips = 1` for this level).
- **Pre-placed:** nothing. Fixed, no new orders.
- **Orders (fixed, 4, one shape):** white Cup + Orange (Glaze A), red Cup + Pink (Glaze B), black Cup + Pink, red Cup + Orange.
- **Goal:** deliver all 4. The player sets up the kiln (logs and level), weighs, wedges, dries, bisque-fires, dips, glaze-fires.
- **Goal steps:** dig, weigh, wedge, hand to owl, dry, bisque-fire (logs set the level), dip in a glaze, glaze-fire, completed shelf.

## Future levels (described only, not built)
- **L4 — Shapes:** repeat L3 with 5 fixed orders over 3 shapes (Cup, Bowl, Vase); still one dip per pot. Models for all 3 shapes on the bench.
- **L5 — Double glazing:** adds two-dip orders (Glaze A then B, B then A); 2 of the fixed orders need a full double dip.
- **L6 — Sets:** orders ask for sets (e.g. 3 matching cups); one order is delivered only when the whole set is on the shelf.
- **Challenge 1:** timed, most pot orders delivered in 7 min (random orders, score ranking). **Challenge 2:** a table of half-finished pots, 4 min to finish as many as possible.
- **Continuous:** the current random-order game, orders every few minutes and instantly when fewer than 3 are open, points per order.
- Random orders appear only from the challenge and continuous modes; levels 1–6 use fixed lists.

**Requirements**
1. `LevelSelect` shows the 3 levels by number and name; locked ones can't be started; `UNLOCK_ALL_LEVELS` unlocks all.
2. Start's Play button goes to `LevelSelect`; the old `Game` scene still loads and runs unchanged.
3. `buildWorld(config)` builds the existing world; config switches each element on/off (anything the goal does not need is left out) and sets the model list, clay list, `maxGlazeDips`, `potsBreakOnGround`, pre-placed items and the Goal panel. `Game` calls it with everything on.
4. Fixed-order mode: `OrderPanel` takes a list, creates no timed orders, and cards show no timer bar or penalty.
5. Level completes once every fixed order is delivered (L1: when the 3rd matching glaze-fired pot is removed from the kiln); `LevelComplete` and unlock work as above.
6. Restart reloads the same level with fresh state (inventories, kiln, pots, orders).
7. Level 1 floor pots start bone dry, unfired and not cracked.
8. Level 2 has only black clay and the Cup model; level 3 has three clays, the Cup model and one dip per pot.
9. TouchControls' scene list includes the level scenes.
10. A "Goal" HUD panel shows the level description and unticked checkbox steps; Menu and Back buttons work as above.

**Acceptance criteria**
- [ ] Play → mission list with 3 numbered, named levels; 2 and 3 locked with the constant false, open with it true.
- [ ] L1: Outside only (no door, nothing Inside, no completed shelf); 3 floor pots (white, red, black), no table; no owl, clay or glaze; 3 orders; the level ends when the 3rd matching glaze-fired pot is taken out of the kiln.
- [ ] L1: a pot fired at the wrong level cracks, the message shows, Restart returns a clean level; walking over the floor pots never damages them (levels 1–3).
- [ ] L2: one cup made end to end delivers the single order and completes the level; no other clay or shape available.
- [ ] L3: 4 fixed orders appear at once and no more ever come; a second dip is refused; all 4 delivered completes the level.
- [ ] Completing 1 then restarting the game (constant false) opens level 2; `Game` scene and its README rules still work.
- [ ] Each level shows a Goal panel with description and unticked steps; Menu returns to Level select, Back returns to Start.

**Constraints** — Crafty 0.9.0, no new dependencies; new `scenes/level_select.js`, `level_complete.js`, `levels.js` (config + scene definitions) added to `index.html`; refactor of `scenes/game.js` only to extract `buildWorld`.

**Open questions** — None.

**Tasks**
- [ ] Constants: `UNLOCK_ALL_LEVELS`, `LEVELS` table (name, orders, features, pre-placed)
- [ ] Extract `buildWorld(config)` from `scenes/game.js`; `Game` still uses everything
- [ ] Fixed-order mode in `OrderPanel` (no timers/penalties); level-complete check; L1 completion on the 3rd kiln removal
- [ ] `buildWorld` config can skip Inside entirely (doors, maps, masks, camera)
- [ ] Pre-placed pot helper (`makePot`) and floor placement
- [ ] `LevelSelect` scene and Start's Play wiring; unlock persistence
- [ ] Level scenes 1–3, Goal panel, Restart and Menu buttons, crack message, `potsBreakOnGround` switch
- [ ] `LevelComplete` scene; max dips = 1 in level 3
- [ ] Touch scene list, `index.html`, README section
- [ ] Verify acceptance criteria in the browser

## Decisions
1. Floor pots → no ground damage in levels 1–3 (breakage on the ground is off); firing mistakes still crack.
2. Hints → HUD "Goal" panel with description and static checklist; ticking later.
3. L1 removal → only an uncracked matching glaze-fired pot counts; a crack means restart.
4. Navigation → Menu button in levels, Back on Level select (default).
5. Unused clays, models and stations → left out of levels 1–3.
6. Earlier: L1 open and L2–3 unlock on completing the previous; L1 floor pots only; L2 black clay and 1 log; L3 all three clays.
