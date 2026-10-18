# PRD: Wood fuels the kiln

**Goal** — The fox collects logs in the forest and loads them into the kiln's wood inventory, then lights the kiln with a torch; the number of logs (1/2/3) sets the fire level (low/mid/high).

**Context**
- Kiln (`components/kiln.js`) has one pot `Inventory`; today loading a dried pot starts firing at once (`KILN_FIRE_MS`, then `KILN_COOL_MS`). Click wiring is in `scenes/game.js`.
- Fox inventory (cap 2) holds one item type at a time; `itemColor`, `ITEM_SHAPES` and the drop message know only clay and pots. The Kiln HUD row shows its pot slot only.
- No forest, wood or torch exists yet.

**Scope** — A `log` item; a forest zone where holding collects logs; a kiln wood `Inventory` (cap 3); a torch on the kiln that starts firing; fire level recorded per firing; HUD shows the kiln's wood slots.
**Out of scope** — Clay cracking or needing a fire level (next change), different firing times per level, wood running out, real forest/torch/log art, sounds, a second kiln.

**Flow**
1. The fox stands on the forest square (Outside, left) and holds the mouse down for 1 s: one log goes in the pack (max 2, only if the pack holds no clay or pots).
2. At the kiln, clicking with logs held moves them into the kiln's wood slots (max 3 in all), shown in the Kiln HUD row. A dried pot goes in as before. Pot and wood can go in in either order, and nothing starts yet.
3. With a pot and at least 1 log in, the fox walks to the torch beside the kiln and clicks it. Firing starts, the logs are used up, and the fire level is the log count (1 low, 2 mid, 3 high).
4. Firing, cooling and collecting then work as before.

**Requirements**
1. Forest square at x 5, y 350, 525×307 (covers fox positions (5,350) to (370,555), the corners logged in game). Holding on it for `LOG_CHOP_MS` (1000) while the fox overlaps it adds `{type: "log"}`; releasing or the fox leaving cancels. If the pack is full or holds something else, a status message shows and nothing is added. Unlimited logs.
2. `Kiln.woodInventory`: capacity `KILN_WOOD_CAPACITY` (3), accepts only logs. Wood can be added at any time, including during firing, cooling or ready, for the next firing.
3. Clicking the kiln with logs selected moves as many as fit; with no room, status "The kiln is full of wood".
4. Loading a dried pot no longer starts firing. It sits in the kiln (state "loaded") until lit.
5. The torch is a 40×60 box at x 1850, y 615, beside the kiln and not overlapping it. The kiln zone shrinks to x 1605, y 527, 240×232 (right edge 1845). Clicking the torch while the fox overlaps it lights the kiln only if a pot is loaded, it is not already firing, cooling or ready, and there is at least 1 log. Otherwise a status says what is missing ("Put a pot in the kiln", "Put wood in the kiln", "The kiln is already lit").
6. Lighting consumes all wood and sets `fireLevel` = "low"/"mid"/"high" on the kiln and on the pot (`pot.fireLevel`), kept for the later cracking work.
7. Logs show in the HUD as `LOG_COLOR` long, thin-sided brown rectangles (wider than tall); dropping one says "Dropped a log". Logs do not slow the fox.
8. The Kiln HUD row shows the 3 wood slots after the pot slot.
9. New run: empty wood, no leftovers (kiln is created per scene).
10. Added later: the kiln holds `KILN_CAPACITY` (4) pots, fired together with one fire level. Pots go in only while empty or loaded, one per click; once cooled, each click takes one out. The kiln is empty again when all are out.

**Acceptance criteria**
- [x] Holding on the forest for about 1 s puts a log in the HUD; releasing early or clicking from outside does nothing; a third log shows a message.
- [x] At the kiln, held logs go into the Kiln row's wood slots and the fox's slots empty. A pot can go in before or after the wood.
- [x] The kiln square no longer overlaps the torch; the fox at (1850, 615) overlaps the torch but not the kiln square.
- [x] A pot alone, or wood alone, does not light when the torch is clicked; a message says what is missing. Loading a pot does not start firing by itself.
- [x] With 1, 2, then 3 logs and a pot, clicking the torch starts firing, empties the wood slots, and `kiln.fireLevel` reads low, mid, high (console).
- [x] The torch does nothing while firing, cooling or ready. Wood can still be added then.
- [x] Fired pot collection, SPACE drop, owl, clay, timer behave as before.

**Constraints** — Crafty 0.9.0, no new dependencies. Edits in `components/kiln.js`, `components/inventory.js` (`itemColor`), `components/fox.js` (drop message), `components/game_hud.js`, `scenes/game.js`, `constants.js`; forest and torch are plain coloured boxes (a small `Forest` component or inline in `game.js`).

**Open questions** — None.

**Tasks**
- [x] Constants: `KILN_WOOD_CAPACITY`, `LOG_CHOP_MS`, `LOG_COLOR`, `FOREST_COLOR`, `TORCH_COLOR`, log in `ITEM_SHAPES` (wide rectangle), fire level names
- [x] `log` item support: `itemColor`, drop message
- [x] Kiln `woodInventory`, "loaded" state, `light()` that checks pot + wood and sets `fireLevel`
- [x] Forest hold-to-collect and torch click in `game.js`; kiln click moves logs
- [x] Kiln HUD row shows wood slots
- [x] Verify the acceptance criteria in the browser

## Decisions
1. Start trigger → a torch on the kiln, clicked after pot and wood are in; loading the pot does not start firing.
2. Wood timing → wood can be added any time; lighting needs the kiln not firing, cooling or ready.
3. Log collecting → hold 1 s.
4. Pack size → stays 2 logs; high fire takes two trips.
5. Order → pot and wood can go in either order; lighting needs both.
6. Torch → at x 1850, y 615, the kiln zone narrowed to 240 wide so they do not overlap; the fox must stand on the torch to light.
7. HUD → 3 wood slots; a log is a long brown rectangle, pots are tall.
