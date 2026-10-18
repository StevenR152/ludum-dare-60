# PRD: Remove pottery sizes

**Goal** — A pot is only a shape (Bowl, Cup, Vase); the Small/Medium/Large variants go, so art needs 3 pots, not 9.

**Context**
- `ORDER_SIZES` (Small/Medium/Large) and a size-keyed `ORDER_CLAY_GRAMS` live in `constants.js`; orders pick a random size and show "Medium Bowl (500g)".
- The workbench has 9 model spots (3 shapes × 3 sizes). The owl checks weighed clay against `ORDER_CLAY_GRAMS[shape][size]`; the pot copies `model.size`.
- Nothing else reads `size` (checked by grep: no art, drying, kiln or shelf code uses it).

**Scope** — Drop size from constants, orders, workbench models, owl check and pot data; one clay weight per shape; update README. **Out of scope** — new art, changing shapes, glaze, speed, clay colours, drying rates (drying times shift only because pot weights are now fixed; no retune).

**Flow**
1. An order reads e.g. "Bowl (500g)".
2. Workbench shows 3 models (Bowl, Cup, Vase).
3. Fox weighs clay, picks a model, clicks the owl; he accepts only the exact grams for that shape, else "That's X g, a Bowl needs Y g".
4. The thrown pot is `{shape, weight, glaze...}` with no size.

**Requirements**
1. `ORDER_SIZES` removed; `ORDER_CLAY_GRAMS` is `{Bowl: 500, Cup: 200, Vase: 500}` (the old Medium values).
2. `makeOrder` has no `size`; `grams = ORDER_CLAY_GRAMS[shape]`; card text is `shape (grams g)`.
3. Workbench makes 3 model spots (still 62×56), labelled with the shape only, in one row starting at x + 320; messages drop the size word.
4. `potter.js` uses `ORDER_CLAY_GRAMS[model.shape]` and messages drop size.
5. `pottery.js` pot has no `size`.
6. No `size`/`ORDER_SIZES` references to pots remain; README line 15 updated; `weigh-model-glaze.md` and `customer-orders.md` need no edit (history).

**Acceptance criteria**
- [x] New orders show only shape + grams, never a size word.
- [x] Bench shows exactly 3 models, all fit inside the bench.
- [x] Right grams for the shape: owl takes clay + model; wrong grams: refusal naming shape and needed g.
- [x] Pot is thrown by the owl with no size and no console errors. (Kiln→glaze→shelf route not driven: no code there reads size, per grep.)
- [x] `grep -i "ORDER_SIZES\|\.size"` finds no pot-size use.

**Constraints** — Edit only `constants.js`, `components/{orders,workbench,potter,pottery}.js`, `README.md`. Plain Crafty/JS, no new files.

**Open questions** — None. Gram values settled: the old Medium (Bowl 500, Cup 200, Vase 500), all multiples of the 50 g scales step.

**Tasks**
- [x] `constants.js`: remove `ORDER_SIZES`, flatten `ORDER_CLAY_GRAMS`, fix model comment
- [x] `orders.js`: drop size, new card text
- [x] `workbench.js`: 3 model spots in a row, shape-only labels/status, header comment
- [x] `potter.js`: shape-only lookup and messages, header comment
- [x] `pottery.js`: drop `size` from pot
- [x] `README.md`: update owl line
- [x] Verify in browser (orders, bench, owl accept/refuse, throw; kiln route not driven)

## Decisions
- Gram values: old Medium (Bowl 500, Cup 200, Vase 500).
- Model spots: keep 62×56, one row from x + 320 (default).
- Drying constants untouched; out of scope.
- Order card: "Bowl (500g)" (default).
