# PRD: Weighing, models and glaze firing

**Goal** — The fox weighs out the right grams of wedged clay, gives it to the owl with a model, then glazes the fired pot and fires it again before it goes on the completed shelf.

**Context**
- `Pottery` (`components/pottery.js`) walks `POTTERY_STATES`: dug → wedged → thrown → drying → dried → firing → cooling → cooled → shelved. Optional states may be skipped. The pot's shape and size are placeholders, and wedging sets `clay.weight` to 1000.
- The workbench has no inventory. `GlazeStation` draws two buckets, Glaze A (yellow) and Glaze B (red), that do nothing. Orders list a shape, size, grams (`ORDER_CLAY_GRAMS`) and glaze, but nothing matches them yet.
- The kiln fires once. `CompletedShelf` takes `cooled` pots, and the 3rd ends the game.

**Scope** — A weighed state and scales with a slider. A bench inventory for leftover clay. Nine models on the bench. The owl checks the weight against the model. Glaze dipping at the buckets. A second (glaze) firing. The completed shelf takes only finished pots.
**Out of scope** — Matching orders and customer pickup (orders are read, never changed). Combining leftovers into more than 1 kg. Cracking. Glaze art. Sounds.

**Flow**
1. Dig 1 kg (`clay.weight` 1000) and wedge it on the bench as today.
2. Scales (a box on the bench): with the fox at the bench, a slider chooses 50–1000 g in 50 g steps. Clicking the scales with wedged clay selected gives the fox the chosen grams [weighed]. The rest (e.g. 800 g) stays on the bench inventory as wedged clay.
3. Click a model on the bench (Small/Medium/Large × Bowl/Cup/Vase) to pick it up into the fox's model hand.
4. Click the owl with weighed clay selected and a model in hand. If the weight equals `ORDER_CLAY_GRAMS[shape][size]`, he takes both and throws that shape and size [thrown]. Otherwise he refuses and nothing moves.
5. Dry, then bisque-fire in the kiln as today [dried → firing → cooling → cooled].
6. Click a bucket with a cooled pot selected to dip it [glazed]. A second dip in the other bucket adds a layer. Allowed: Yellow, Red, Yellow then Red, Red then Yellow. Unglazed means no dips.
7. Glazed pot in the kiln: [glaze firing → glaze cooling → glaze cooled].
8. Completed shelf takes glaze-cooled pots, or cooled unglazed pots [shelved].

**Requirements**
1. `POTTERY_STATES` becomes: dug, wedged, weighed, thrown, drying, dried, firing, cooling, cooled, glazed*, glazeFiring*, glazeCooling*, glazeCooled*, shelved (* optional, so unglazed goes cooled → shelved).
2. Digging sets `clay.weight` to 1000, and wedging no longer changes it. Weighing splits the clay into a weighed Pottery of the chosen grams (fox) and a wedged remainder (bench). Choosing 1000 g leaves nothing. Choosing more than the clay weighs is refused with a status.
3. The bench `Inventory` holds 3 wedged pieces. Clicking the bench (not the scales or a model) takes the selected piece back. The scales also weigh a piece that came from the bench.
4. Models are `{type: "model", shape, size}`. The fox has a separate 1-slot model inventory (its own HUD row), so clay and a model can be carried together. Each model returns to its bench spot once the owl has thrown it.
5. The owl's input takes a weighed clay plus a model atomically. On a wrong weight the status gives the grams carried and the grams needed. The pot gets the model's shape and size, `clay.weight`, and `glaze: []`.
6. A bucket click on a `cooled` or `glazed` pot pushes that bucket's name onto `pot.glaze` (the first dip advances to `glazed`). The same bucket twice, or a third dip, is refused.
7. The kiln loads `dried` (bisque) or `glazed` pots and runs the matching firing → cooling → cooled states with the same timings. It releases `cooled` or `glazeCooled`. It refuses a cooled unglazed pot ("Glaze it, or shelve it unglazed").
8. `CompletedShelf` accepts `glazeCooled`, or `cooled` with `pot.glaze` empty. Game over at 3 is unchanged.
9. The HUD shows a glazed pot in the colour of its last dip. The fox's speed counts grams of clay carried (each 1000 g = today's 1 kg slowdown).

**Acceptance criteria**
- [ ] Choosing 200 g on wedged 1 kg gives the fox 200 g weighed and leaves 800 g on the bench. That piece can be picked up and weighed again. More than its weight is refused.
- [ ] The owl throws a Medium Bowl from 500 g + a Medium Bowl model, refuses 200 g with it (status shows both weights), and the model returns to the bench.
- [ ] A cooled pot dipped yellow then red has `glaze` ["Glaze A","Glaze B"]. A repeat bucket or a 3rd dip is refused.
- [ ] A glazed pot fires a second time and comes out `glazeCooled`. The kiln refuses a cooled unglazed pot.
- [ ] The completed shelf takes glaze-cooled and unglazed cooled pots and refuses a glazed pot that hasn't had its glaze firing. The 3rd ends the game.
- [ ] Old steps (dig, wedge, dry, doors, SPACE) still work. No console errors.

**Constraints** — Crafty 0.9.0, no new deps. The slider is a plain HTML `<input type="range">` placed over the scales while the fox is at the bench. Edits to `constants.js`, `pottery.js`, `workbench.js`, `potter.js`, `kiln.js`, `glaze_station.js`, `completed_shelf.js`, `fox.js`, `inventory.js`, `game_hud.js`, `scenes/game.js` and the README. A new `components/scales.js` if the workbench gets too big.

**Open questions**
1. Large Vase needs 1500 g, but the fox only digs 1 kg. Should it be impossible for now, or should the scales combine pieces?
2. Should an unglazed pot also go through the second firing?
3. Your request says "create a new object + inventory" for the final shelf. Should it reuse `CompletedShelf`, or add a new shelf next to it?

**Tasks**
- [ ] States, weight on dig, HUD colour, speed by grams
- [ ] Bench inventory, scales and slider, weighing split
- [ ] Models, fox model hand, owl weight check and shape
- [ ] Glaze dipping at the buckets
- [ ] Kiln second firing and the completed shelf rule
- [ ] README; verify in the browser
