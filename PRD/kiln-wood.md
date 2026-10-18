# PRD: Wood fuels the kiln

**Goal** — The fox collects logs in the forest and loads them into the kiln's wood inventory; the number of logs (1/2/3) sets the fire level (low/mid/high) of the firing.

**Context**
- Kiln (`components/kiln.js`) has one pot `Inventory`; loading a dried pot starts firing for `KILN_FIRE_MS`, cooling for `KILN_COOL_MS`. Click wiring is in `scenes/game.js`.
- Fox inventory (cap 2) holds one item type at a time; `itemColor`, `ITEM_SHAPES` and the drop message know only clay and pots. The kiln HUD row shows its pot slot only.
- No forest or wood exists yet.

**Scope** — A `log` item; a forest zone to collect logs; a kiln wood `Inventory` (cap 3); fire level recorded per firing; HUD shows the kiln's wood slots.
**Out of scope** — Clay cracking or needing a fire level (next change), different firing times per level, wood running out, real forest/log art, sounds, a second kiln.

**Flow**
1. The fox walks to the forest square (Outside) and clicks it while touching it: one log goes in the pack (max 2, and only if the pack holds no clay or pots).
2. At the kiln, clicking with logs held moves them (up to 3 total) into the kiln's wood slots, shown in the Kiln HUD row.
3. Clicking with a dried pot while the kiln has ≥1 log loads the pot and starts firing. The logs are used up; fire level = log count (1 low, 2 mid, 3 high).
4. Firing, cooling and collecting are unchanged.

**Requirements**
1. Forest square at a fixed Outside position; a click while the fox overlaps it adds `{type: "log"}` to the fox, else a status message (pack full / carrying something else). Unlimited logs.
2. `Kiln.woodInventory`: capacity `KILN_WOOD_CAPACITY` (3), accepts only logs. Logs can be added only while the kiln is empty (not firing, cooling or ready).
3. Clicking the kiln with logs selected moves as many as fit; with no room, status "The kiln is full of wood".
4. A dried pot is refused with status "Put wood in the kiln first" when the wood inventory is empty.
5. Starting a firing consumes all wood and sets `fireLevel` = "low"/"mid"/"high" on the kiln and on the pot (`pot.fireLevel`), kept for the later cracking work.
6. Logs have a HUD colour/shape (`LOG_COLOR`, in `ITEM_SHAPES`); dropping one says "Dropped a log". Logs do not slow the fox.
7. The Kiln HUD row shows the 3 wood slots after the pot slot.
8. New run: empty wood, no leftovers (kiln is created per scene).

**Acceptance criteria**
- [ ] Click the forest while touching it: a log appears in the HUD; twice fills the pack; a third click shows a message. Clicking from outside does nothing.
- [ ] At the kiln, held logs go into the Kiln row's wood slots; the fox's slots empty.
- [ ] Clicking with a dried pot and no wood shows the message and nothing moves.
- [ ] With 1, 2, then 3 logs loaded, the pot starts firing, the wood slots empty, and `kiln.fireLevel` reads low, mid, high (checked in console).
- [ ] Wood can't be added during firing/cooling/ready.
- [ ] Fired pot collection, SPACE drop, owl, clay, timer behave as before.

**Constraints** — Crafty 0.9.0, no new dependencies. Edits in `components/kiln.js`, `components/inventory.js` (`itemColor`), `components/fox.js` (drop message), `components/game_hud.js`, `scenes/game.js`, `constants.js`; forest is a plain coloured box like the kiln zone (a small `Forest` component or inline in `game.js`).

**Open questions** — Forest position is a guess (left-centre of the Outside map); I will place it and check it in the preview.

**Tasks**
- [ ] Constants: `KILN_WOOD_CAPACITY`, `LOG_COLOR`, `FOREST_COLOR`, log in `ITEM_SHAPES`, fire level names
- [ ] `log` item support: `itemColor`, drop message
- [ ] Kiln `woodInventory`, wood-gated pot loading, `fireLevel` on start
- [ ] Forest zone + click-to-collect in `game.js`; kiln click moves logs
- [ ] Kiln HUD row shows wood slots
- [ ] Verify the acceptance criteria in the browser
