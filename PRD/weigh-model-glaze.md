# PRD: Weighing, models and glaze firing

**Goal** — The fox weighs out the right grams of wedged clay from the bench, gives it to the owl with a model, then glazes (or not) the bisque-fired pot and fires it a second time before it goes on the completed shelf.

**Context**
- `Pottery` (`components/pottery.js`) walks `POTTERY_STATES`: dug → wedged → thrown → drying → dried → firing → cooling → cooled → shelved, skipping only optional states. The pot's shape and size are placeholders, and wedging sets `clay.weight` to 1000.
- The workbench has no inventory. `GlazeStation` draws two buckets that do nothing: Glaze A (yellow) and Glaze B (red). Orders (`orders.js`) list a shape, size, grams (`ORDER_CLAY_GRAMS`, up to 1500) and a glaze from `ORDER_GLAZES`.
- The kiln fires once. `CompletedShelf` takes `cooled` pots, and the 3rd ends the game. The fox carries 2 items of one type.

**Scope** — A `weighed` state. A bench clay pile and scales with a slider. Nine models. A mixed fox pack. The owl checks the weight. Glaze dips. A second firing for every pot. An "Unglazed" order option. The completed shelf takes only glaze-fired pots.
**Out of scope** — Matching orders and customer pickup. Cracking. Glaze art. Sounds. Dip timers.

**Flow**
1. Dig up to 2 kg (each `clay.weight` 1000) and carry them in.
2. Hold the bench for 3 s with dug clay selected: that kilo is wedged and goes onto the bench pile. Kilos of the same clay add up (2 blue = 2000 g). A different clay is refused until the pile is used up.
3. With the fox touching the scales, a click opens a slider (HUD, under the Fox row) from 50 g to the pile's grams in 50 g steps, plus a Weigh button. Weigh gives the fox a weighed piece of that many grams [weighed], and the rest stays on the pile. The slider closes when the fox walks off.
4. Click a model on the bench to put it in the pack.
5. Click the owl while carrying weighed clay and a model. If the grams equal `ORDER_CLAY_GRAMS[shape][size]`, he takes both and throws that pot [thrown], and the model goes back to its bench spot. Otherwise he refuses.
6. Dry, then bisque fire [dried → firing → cooling → cooled].
7. Optionally click the buckets to dip [glazed]: Yellow, Red, Yellow then Red, Red then Yellow, or no dips (unglazed).
8. Kiln again, glazed or not: [glazeFiring → glazeCooling → glazeCooled].
9. Completed shelf takes `glazeCooled` pots [shelved].

**Requirements**
1. `POTTERY_STATES`: dug, wedged, weighed, thrown, drying, dried, firing, cooling, cooled, glazed (optional), glazeFiring, glazeCooling, glazeCooled, shelved.
2. Digging sets `clay.weight` to 1000. Wedging advances the state and moves the kilo to the bench pile, a single wedged Pottery whose `clay.weight` sums its kilos and which holds one clay type.
3. Weighing chooses `g` (50 ≤ g ≤ pile weight, in steps of 50). It creates a weighed Pottery of `g` (same clay), takes `g` off the pile, and removes the pile at 0. The slider max follows the pile. Weighing an empty pile is refused with a status.
4. Fox pack (capacity 2): either up to 2 dug kilos, or up to 1 weighed clay + 1 model, or up to 2 pots. Anything else is refused with today's status. `Inventory` gets an optional `fits(items, item)` rule that replaces the one-type check for the fox. Speed counts grams of clay carried (1000 g = today's 1 kg slowdown).
5. Models are `{type: "model", shape, size}`, nine on a 3×3 grid on the bench. Picking one leaves its spot empty until the owl returns it.
6. The owl takes the weighed clay and the model together, or nothing. On a wrong weight the status reads "That's 200 g, a Medium Bowl needs 500 g". The pot gets the model's shape and size, `clay.weight`, and `glaze: []`.
7. A bucket click on a `cooled` or `glazed` pot adds that bucket to `pot.glaze` (the first dip advances to `glazed`). The same bucket twice, or a 3rd dip, is refused.
8. The kiln loads `dried` pots (bisque) or `cooled`/`glazed` pots (glaze firing), with the same timings, and releases `cooled` or `glazeCooled` pots.
9. `CompletedShelf` (reused, now the customer pickup shelf) accepts only `glazeCooled` pots. Game over at 3 is unchanged.
10. `ORDER_GLAZES` gains `[]`, and its card shows "Unglazed". The HUD shows a glazed pot in the colour of its last dip.

**Acceptance criteria**
- [ ] Wedging 2 blue kilos makes a 2000 g pile. The slider goes up to 2000. Weighing 1500 leaves 500. A red kilo is refused until the pile is empty.
- [ ] The fox can carry 1 weighed clay + 1 model, but not a model with dug clay or pots, nor 2 weighed pieces.
- [ ] The owl throws a Large Vase from 1500 g + its model and returns the model. He refuses 500 g with it, showing both weights, and nothing moves.
- [ ] Dipping yellow then red gives `glaze` ["Glaze A","Glaze B"]. A repeat bucket or a 3rd dip is refused.
- [ ] Glazed and unglazed cooled pots both fire again to `glazeCooled`. Only those go on the shelf, and the 3rd ends the game.
- [ ] An order card can show "Unglazed". Dig, doors and SPACE still work. No console errors.

**Constraints** — Crafty 0.9.0, no new deps. The slider is an HTML `<input type="range">` in a HUD DOM entity. Bench grows to 520×200 (scales left, pile middle, models right). Edits to `constants.js`, `pottery.js`, `inventory.js`, `workbench.js` (or a new `scales.js`), `potter.js`, `kiln.js`, `glaze_station.js`, `completed_shelf.js`, `fox.js`, `orders.js`, `inventory_hud.js`, `scenes/game.js`, `index.html` and the README.

**Open questions** — None.

**Tasks**
- [ ] States, `fits` rule, fox pack and speed by grams
- [ ] Wedging onto the bench pile; scales and slider; weighing
- [ ] Models; owl weight check and shape; model return
- [ ] Glaze dipping; Unglazed orders; HUD colour
- [ ] Kiln second firing; completed shelf rule
- [ ] README; verify in the browser

## Decisions
1. The scales combine clay. The max is the grams of wedged clay on the bench pile.
2. Unglazed pots still get the second firing (to vitrify). Orders can ask for Unglazed.
3. Reuse `CompletedShelf` as the pickup shelf.
4. The fox carries 1 model + 1 weighed clay. Dug clay is still up to 2 kg.
5. The owl refuses a wrong weight with a message.
6. The scales open the slider when the fox touches them and clicks.
7. Bench 520×200 with the scales, the pile and a 3×3 model grid (enlarge, user).
8. One dip per bucket, at most 2, in order, instant (default).
9. All wedged clay stays on the bench until it is weighed; only the weighed piece is carried by the fox (user).
