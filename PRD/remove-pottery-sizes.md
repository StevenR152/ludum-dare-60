# PRD: Remove pottery sizes

**Goal** — A pot is only a shape (Bowl, Cup, Vase); the Small/Medium/Large variants go, so art needs 3 pots, not 9.

**Context**
- `ORDER_SIZES` (Small/Medium/Large) and a size-keyed `ORDER_CLAY_GRAMS` live in `constants.js`; orders pick a random size and show "Medium Bowl (500g)".
- The workbench has 9 model spots (3 shapes × 3 sizes). The owl checks weighed clay against `ORDER_CLAY_GRAMS[shape][size]`; the pot copies `model.size`.
- Nothing else reads `size` (checked by grep: no art, drying, kiln or shelf code uses it).

**Scope** — Drop size from constants, orders, workbench models, owl check and pot data; one clay weight per shape; update README. **Out of scope** — new art, changing shapes, glaze, speed, clay colours, drying rates.

**Flow**
1. An order reads e.g. "Bowl (500g)".
2. Workbench shows 3 models (Bowl, Cup, Vase).
3. Fox weighs clay, picks a model, clicks the owl; he accepts only the exact grams for that shape, else "That's X g, a Bowl needs Y g".
4. The thrown pot is `{shape, weight, glaze...}` with no size.

**Requirements**
1. `ORDER_SIZES` removed; `ORDER_CLAY_GRAMS` is `{Bowl: 500, Cup: 200, Vase: 500}` (the old Medium values).
2. `makeOrder` has no `size`; `grams = ORDER_CLAY_GRAMS[shape]`; card text is `shape (grams g)`.
3. Workbench makes 3 model spots, labelled with the shape only, laid out in one row; messages drop the size word.
4. `potter.js` uses `ORDER_CLAY_GRAMS[model.shape]` and messages drop size.
5. `pottery.js` pot has no `size`.
6. No `size`/`ORDER_SIZES` references to pots remain; README line 15 updated; `weigh-model-glaze.md` and `customer-orders.md` need no edit (history).

**Acceptance criteria**
- [ ] New orders show only shape + grams, never a size word.
- [ ] Bench shows exactly 3 models, all fit inside the bench.
- [ ] Right grams for the shape: owl takes clay + model; wrong grams: refusal naming shape and needed g.
- [ ] Pot completes the full route (throw → kiln → glaze → shelf) with no console errors.
- [ ] `grep -i "ORDER_SIZES\|\.size"` finds no pot-size use.

**Constraints** — Edit only `constants.js`, `components/{orders,workbench,potter,pottery}.js`, `README.md`. Plain Crafty/JS, no new files.

**Open questions** — Which gram value per shape? Assumed the old Medium (Bowl 500, Cup 200, Vase 500); change `ORDER_CLAY_GRAMS` if you want other values (scales step is 50 g).

**Tasks**
- [ ] `constants.js`: remove `ORDER_SIZES`, flatten `ORDER_CLAY_GRAMS`, fix model comment
- [ ] `orders.js`: drop size, new card text
- [ ] `workbench.js`: 3 model spots in a row, shape-only labels/status, header comment
- [ ] `potter.js`: shape-only lookup and messages, header comment
- [ ] `pottery.js`: drop `size` from pot
- [ ] `README.md`: update owl line
- [ ] Verify in browser (orders, bench, owl accept/refuse, full pot route)
