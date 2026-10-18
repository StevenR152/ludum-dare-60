# PRD: Pot drying states, trimming and cracking

**Goal** — Pots dry from wet to leather hard to bone dry, heavier pots slower; the owl only trims leather-hard pots, the kiln only fires bone-dry ones well, and every wrong call cracks the pot.

**Context**
- `Pottery` walks `thrown → drying → dried → firing…`; the shelf dries a pot in a fixed `DRY_MS` and releases only `dried` pots. The batch kiln (4 pots, torch, logs set the level) takes only `dried` pots for bisque; `setFireLevel` needs `dried`.
- Cracking exists: `pot.cracked` is set at `cooled` on a fire-level mismatch, `markCracked` draws a black cross, and cracked pots can't be shelved. They stay in the game (a trash mountain comes later).
- The owl has `input` 1 + `modelIn` 1 + `output` 3, throws one pair at a time, and refuses clay while busy.

**Scope** — `dryness` (0–1) per pot with three stages, a wet—LH—dry bar, a shelf that releases any stage, an owl with a shared cap of 5 and a FIFO job queue that trims, `pot.trimmed`, and dryness cracks in the owl and the kiln.
**Out of scope** — Scoring (only `trimmed` is kept for it), the trash mountain, drying hacks, cracking on a drop, sounds, real art.

**Flow**
1. The owl throws a wet pot (`trimmed` false) into his output. The fox puts it on the shelf; its bar fills wet → LH → dry.
2. The fox takes it off at any stage and gives it to the owl. It keeps drying, more slowly, off the shelf.
3. The owl does one job at a time, the first given first: throw a clay + model pair, or trim a pot. Leather hard when he starts: after `POT_TRIM_MS` it is trimmed. Wet ("too soft") or bone dry: it cracks. Either way it goes to his output.
4. The fox puts the trimmed pot back on the shelf to reach bone dry.
5. The kiln takes unfired pots at any dryness, trimmed or not. A pot below bone dry cracks, revealed at `cooled` with the fire-level check. Glaze firing is unchanged.

**Requirements**
1. Pot has `dryness` 0–1 and `trimmed` (false when thrown). Wet is below `LEATHER_HARD_AT` (0.1), leather hard from there to below 1, bone dry at 1.
2. Dryness gains `dt / ((DRY_BASE_MS + pot.weight × DRY_MS_PER_GRAM) × k)`, where `DRY_BASE_MS` = 130000, `DRY_MS_PER_GRAM` = 250, k = 1 on the shelf, `OFF_SHELF_SLOWDOWN` (3) anywhere else, and there is no gain in the kiln.
3. `POTTERY_STATES` drops `drying` and `dried`; `pot.dried` becomes `dryness`. Bisque `setFireLevel` and firing start from `thrown`.
4. The shelf accepts unfired pots and releases any at any dryness. Clicking a pot's box takes that pot; clicking the shelf puts the selected pot on (or takes the driest). Each pot shows a bar (track, fill in its stage colour, tick at LH) and its stage label.
5. The owl holds at most `OWL_CAPACITY` (5) things in total (clay, models, pots to trim, pots to collect). He takes work while busy until that cap, and does the oldest job first.
6. A trim checks dryness when it starts and runs `POT_TRIM_MS` (5000). Leather hard → `trimmed` true. Otherwise `cracked` true, with a status. Both go to his output. A cracked or already-trimmed pot is refused.
7. At `cooled` after bisque, a pot whose dryness was below 1 when lit is `cracked`, with the same cross and shelf refusal as a level mismatch.
8. The HUD shows a dryness-stage colour (wet / LH / dry), a bar and a border on every pot box: solid green trimmed, dashed orange untrimmed. Cracked pots keep the cross everywhere.

**Acceptance criteria**
- [x] A 200 g cup on the shelf is LH after ~18 s and bone dry after ~180 s; a 1500 g vase takes ~50 s and ~505 s. Off the shelf both dry 3× slower. Nothing dries in the kiln.
- [x] The shelf lets me take wet, LH and dry pots. The 3-slot limit still holds.
- [x] Owl: LH pot → trimmed after 5 s; wet or bone dry → cracked with a cross; both in his output with a status. Oldest job first; a 6th item is refused.
- [x] The kiln takes a wet pot; it comes out cracked. A bone-dry pot at the right level comes out sound, trimmed or not. The `trimmed` flag survives firing.
- [x] Glazing, glaze firing, the completed shelf, orders and a full run still work; no console errors.

**Constraints** — Crafty 0.9.0, no new deps. Edits to `constants.js`, `pottery.js`, `drying_shelf.js`, `potter.js`, `kiln.js`, `inventory.js`, `inventory_hud.js`, `game_hud.js`, `game.js` and docs. Bars made from Crafty boxes.

**Open questions** — None.

**Tasks**
- [x] Constants; `dryness`/`trimmed` in `Pottery`; remove `drying`/`dried`
- [x] A drying tick for pots by location (shelf, elsewhere, kiln)
- [x] Drying shelf: bars, accept unfired, release any stage
- [x] Owl: shared cap 5, FIFO job queue, trimming → trimmed or cracked
- [x] Kiln: any dryness in, crack unless bone dry; HUD colours, bar and untrimmed marker
- [x] Verify in the browser

## Decisions
1. Drying time → proportional to weight (`DRY_MS_PER_GRAM`).
2. Owl → 5 things shared across all of his inventories; one job at a time, oldest first; pots keep drying while they wait (default).
3. Drying speed → faster on the shelf, 3× slower elsewhere (default), none in the kiln.
4. Trimmed pots → the fox collects them from the owl's output, then back to the shelf.
5. Kiln → takes wet or dry unfired pots; not bone dry → cracked, revealed at the end. Glazed pots are always dry.
6. Bars → on the shelf and in the HUD.
7. Untrimmed bone-dry pots → may be fired; `pot.trimmed` false marks them (scoring later); the HUD shows a marker.
8. Every spoilt pot (too wet, too dry to trim, not bone dry in the kiln, wrong fire level) → `cracked` with an X, never removed. Cracked pots from the owl go to his output, for the trash mountain later.
9. Taking from the shelf → click a pot to take that one, since a pot you've just taken is valid to put back on (found while building).
10. The "bone dry if the owl makes 2 pots first" rule → dropped; drying rates stay as built.
11. Drying too fast → a 200 g cup is leather hard after about 1 minute on the shelf, so time is a base plus a per-gram part, and LH starts at 0.1 and a cup is bone dry at 3 min (retuned again after play) (the first rule, 30 ms/g, dried a cup in 6 s).
