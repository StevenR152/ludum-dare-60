# PRD: Drop onto stations

**Goal** — Pressing SPACE at a station puts the item back there instead of on the ground: models return to the workbench, matching clay shortens a clay node's respawn.

**Context**
- SPACE drops via `Fox.dropSelected` → `Fox.dropItem`, which makes a `DroppedItem` on the ground (`PRD/dropped-items.md`). Stumbles call `dropItem` directly.
- The workbench has model spots; `Workbench.returnModel(model)` already reseats a model. Stations count the fox as "at" them when it overlaps their square (`touchingFox`).
- A `Clay` node greys out when dug (`dug = true`) and `respawn()` makes it diggable again after `CLAY_RESPAWN_MS`; nothing speeds it up.

**Scope** — A station hook in `Fox.dropSelected` only; `Workbench` takes models, `Clay` takes matching clay and cuts its respawn timer.
**Out of scope** — Stumbles (always hit the ground), pots at the bench, logs, the bin, owl/kiln/shelves, new art or sounds, clay into the bench pile, taking items back off a node or the bench.

**Flow**
1. Fox carries a model and stands on the workbench square; presses SPACE: the model is back in its bench spot, nothing lands on the ground.
2. Fox carries clay of a node's colour (dug, wedged, weighed, or a thrown unfired pot of it) and stands on that dug node; presses SPACE: the clay is used up and the node's respawn timer drops by `CLAY_REFILL_PERCENT` of `CLAY_RESPAWN_MS`; if that finishes it, the node is full at once.
3. Anywhere else, or if the station won't take it, SPACE drops to the ground as before.

**Requirements**
1. `Fox.dropSelected` offers the taken item to each `Workbench` and `Clay` the fox overlaps via `acceptDrop(item, fox)`; the first returning true consumes it and no `DroppedItem` is made. `stumble` skips this.
2. `Workbench.acceptDrop` takes models only, triggering `ModelReturned`; status "Put the model back on the bench".
3. `Clay.acceptDrop` takes only while the node is `dug`, and only a `Pottery` whose `clay.name` is the node's type and whose state is `dug`, `wedged`, `weighed` or `thrown` (unfired).
4. On accept, the node's remaining respawn time falls by `CLAY_REFILL_PERCENT` (0.5, in `constants.js`) of `CLAY_RESPAWN_MS`; at 0 or less it respawns now, else the timer is rescheduled. Status says how the node reacted.
5. Anything else (other colour, full node, fired pots, logs) falls through to the ground drop.

**Acceptance criteria**
- [x] SPACE with a model on the bench square reseats it: no ground item, spot is home.
- [x] SPACE with a model elsewhere drops it on the ground.
- [x] Dug, wedged, weighed clay and a thrown unfired pot of the node's colour each cut the respawn by 50% of 20 s; a second one finishes it.
- [x] The original respawn doesn't fire later on a refilled node.
- [x] Other colour, full node, fired pot: ground drop.
- [x] A forced stumble at the bench or a node drops to the ground.

**Constraints** — Crafty 0.9.0, no deps. Edits to `fox.js`, `workbench.js`, `clay.js`, `constants.js`; README line on SPACE.

**Open questions** — None.

**Tasks**
- [x] `CLAY_REFILL_PERCENT`; `Fox.dropSelected` station hook
- [x] `Workbench.acceptDrop` (models)
- [x] `Clay.acceptDrop` (match, shorten/reschedule timer)
- [x] README
- [x] Verify in the browser (headless Chromium test page with the real components, not the full game)

## Decisions
1. Models only at the bench; pots still hit the ground (default).
2. Only clay of the node's own colour, in dug, wedged, weighed or thrown-unfired form.
3. Each drop cuts a percentage of the total respawn time, not an instant refill.
4. Stumbles always drop to the ground.
5. "Near" is overlapping the station's square (default).
6. A model carried back from the ground reseats like any other; no change needed (default).
