# PRD: Dropped items

**Goal** — A dropped item lands in the world where the fox stands, can be walked into (slowing the fox, maybe damaging it) and picked up again.

**Context**
- `fox.dropSelected` (SPACE) takes the selected item and it vanishes; a dropped model goes back to the bench (`ModelReturned`).
- Fox speed is `updateSpeed` in `fox.js`, driven only by clay carried. Clickable things are zone squares the fox must overlap (kiln, shelves).
- Pot cook state is `Pottery.state`; `pot.cracked` exists, is drawn by `markCracked`, and blocks firing and shelving. `PotDrier` dries pots in the fox's pack at the off-shelf rate.
- This reworks the SPACE drop, so `PRD/trash-bin.md`'s removal of SPACE is superseded and that PRD needs its own update.

**Scope** — A `DroppedItem` entity left at the fox's feet by SPACE, a stacking slow, a first-contact damage roll on pots, a load-scaled stumble with a sound, click to pick up.
**Out of scope** — The bin, new art, anything owl/kiln/shelf-side, clay, logs and models taking damage.

**Flow**
1. SPACE: the selected item (any type) appears on the ground at the fox's position, drawn like its HUD box.
2. Fox walks away, then back into it: slowed while overlapping; a pot rolls to take damage on that first touch.
3. While carrying and moving the fox may stumble: a sound plays and a random carried item drops at its feet.
4. Fox overlaps a dropped item and clicks it: it goes back in the pack (if there's room).

**Requirements**
1. Dropping any item creates a `DroppedItem` at the fox's position holding the original item object (state, clay, pot data intact), drawn with `itemColor`/`ITEM_SHAPES`/`markCracked`/`markBorder`. Models no longer return to the bench on drop.
2. Fox speed is multiplied by `DROPPED_ITEM_SLOWDOWN` (0.5) for each dropped item it overlaps, on top of the clay-weight slowdown, restored on leaving.
3. On first contact only (re-arms once the fox has left), a pot rolls to break by state: unfired (`thrown`) 99%, bisque-fired (`cooled`, `glazed`) 75%, glaze-fired (`glazeCooled`, `shelved`) 50%. A hit adds `DAMAGE_PER_BREAK` (1) to `pot.damage`. Clay, logs, models never roll.
4. Damage thresholds are constants: `BREAK_DAMAGE` (1) sets `pot.cracked` and triggers `PotCracked`; `DESTROY_DAMAGE` (3) removes the item. Status lines say what happened. Every pot rolls, cracked or not.
5. A fox carrying anything and moving has a stumble chance per second of `STUMBLE_BASE` (0.5%) + `STUMBLE_PER_SLOW` (5%) × the fox's current slowdown fraction (1 − speed/`FOX_SPEED`, from clay weight and debris). A stumble plays a `stumble` sound and drops a random carried item; it doesn't roll damage until the fox leaves and re-enters.
6. Click on a dropped item while overlapping it moves it into `fox.inventory`; if full, status "Backpack full" and it stays.
7. A dropped unfired pot dries at the same rate as one in the fox's pack.
8. Dropped items persist for the whole run, Inside and Outside.

**Acceptance criteria**
- [x] SPACE with any item leaves a visible item on the ground and empties that slot; a dropped model stays on the ground.
- [x] Two overlapping items quarter the speed; speed returns once clear.
- [x] Forced rolls give ~99/75/50% hits; damage 1 cracks the pot, 3 removes it.
- [x] Staying overlapped doesn't re-roll; leaving and re-entering does.
- [x] Stumble chance rises with load (check the number at 0 g and 2 kg); forcing it to 1 drops an item with the sound.
- [x] Click picks up; full pack warns and it stays.
- [x] A dropped wet pot's dryness advances at the pack rate.

**Constraints** — Crafty 0.9.0, no deps. New `components/dropped_item.js` (script tag in `index.html`), constants in `constants.js`, edits to `fox.js`, `pottery.js` (`pot.damage`), `drying_shelf.js` (PotDrier), `game_sounds.js`/`assets.js` (stumble sound; reuse an existing clip as placeholder), README line on SPACE.

**Open questions** — None.

**Tasks**
- [x] Constants: slowdown, damage, break chances, stumble
- [x] `DroppedItem` component: draw, overlap, first-contact roll, damage, click pickup
- [x] `fox.js`: drop creates the entity, stacked speed factor, stumble and sound
- [x] `PotDrier`: dry dropped pots
- [x] Wire script tag, README
- [x] Verify in the browser (headless Chromium test page with the real components; not the full game)

## Decisions
1. Damage is a counter: break at 1 and destroy at 3 are constants, each hit adds 1.
2. Stumble chance scales with total slowdown; a sound plays.
3. SPACE stays as the drop and is reworked by this PRD.
4. Cook-state mapping as written (default); cracked pots also roll, so damage can reach destroy.
5. Dropped pots dry as they do in the fox's pack.
6. Slows from several overlapping items multiply.
7. Any item drops, only pots take damage.
