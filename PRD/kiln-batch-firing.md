# PRD: Kiln fires 4 pots at once

**Goal** — The kiln holds and fires up to 4 pots as one batch at one fire level, using the clay firing-level hook, so pots whose clay needs another level crack.

**Context**
- `kiln.js` (wood/torch PRD, built) already holds `KILN_CAPACITY` (4) pots, advances every pot together, and shows one `potBox` per pot. Loading never starts firing; the fox clicks the torch with a pot and at least 1 log in. Logs fix the level: 1 low, 2 mid, 3 high (`KILN_FIRE_LEVELS`).
- Gap: `startFiring` sets `pot.fireLevel` directly and never calls `Pottery.setFireLevel`, and `showPots` never calls `markCracked`, so cracking is not applied or shown in the kiln.
- `PRD/clay-firing-levels.md` (built): `pottery.setFireLevel(level)` (needs state `dried`) then `advance("firing")`; a mismatch with the clay's level (`CLAY_TYPES`: brown low, red mid, blue high) cracks at `cooled`; `markCracked(box, pot)` draws the black cross.

**Scope** — Use `setFireLevel` for every pot at lighting, `markCracked` on every box when ready, status messages for refused pots, and the empty/ready rules for a partial take.
**Out of scope** — Logs and the wood inventory (see `PRD/kiln-wood.md`), a dedicated fire level UI, per-pot levels, changing `Pottery`, the trash bin, orders, sounds.

**Flow**
1. The fox loads dried pots one per click, up to 4, and logs, in either order.
2. The fox clicks the torch. Firing starts for all pots at the level of the logs loaded (1 to 4 pots allowed).
3. Every pot fires for `KILN_FIRE_MS` and cools for `KILN_COOL_MS` together.
4. When ready, each pot shows as its own box, crossed out if it cracked. The fox takes them one per click (its pack holds 2, so two trips for 4).
5. The kiln is empty and loadable again once the last pot is out.

**Requirements**
1. Pots go in only while the kiln is `empty` or `loaded`, only if `dried`, one per click, up to `KILN_CAPACITY` (4). Refusals show a status: "The kiln is full" (5th pot), "The kiln is busy" (firing or cooling). While `ready`, a click collects a pot instead, so new pots wait until the kiln is empty, "The pot needs to dry first" (existing).
2. At lighting, for every pot in the kiln: `pot.setFireLevel(level)` (not a direct field write), then `pot.advance("firing")`. Zero logs or zero pots can't light (existing status messages).
3. After `KILN_FIRE_MS` every pot advances to `cooling`; after `KILN_COOL_MS` every pot advances to `cooled` and the kiln becomes `ready`.
4. The kiln releases a pot only when `ready` and the pot is `cooled`, one per click. It returns to `empty` only when its inventory is empty, not after the first take. A full pack shows the existing "pack is full" message.
5. One pot box per pot (up to 4), at its own spot in the square, each coloured by `itemColor`; `markCracked(box, pot)` is called on each when ready and again after each take. A taken pot's box is hidden.
6. A batch of mixed clay types fires at one level; the pots whose clay needs another level crack. No special handling.

**Acceptance criteria** (clay levels: brown low, red mid, blue high)
- [x] The kiln accepts 4 dried pots and refuses a 5th ("full"), an undried pot, and any pot once lit or while pots wait to be taken ("busy").
- [x] One run per log count with a brown, a red and a blue pot: 1 log leaves brown sound, red and blue crossed; 2 logs leaves red sound; 3 logs leaves blue sound.
- [x] Batches of 1, 2 and 4 pots all fire and cool on the same timer (`KILN_FIRE_MS`, then `KILN_COOL_MS`); none is takeable before `ready`.
- [x] 4 boxes show when ready, crossed where cracked, and fit inside the 240px square; taking one hides only its box; the kiln stays `ready` until the last is out, then `empty`.
- [x] A second batch can be loaded and fired after the first is emptied.
- [x] No console warnings from `setFireLevel` or `advance`; lighting with zero logs or zero pots is refused.

**Constraints** — Crafty 0.9.0, no new deps. Edit `kiln.js` (including its header comment and `NOTE`), `scenes/game.js` only for the refusal statuses. Do not edit `pottery.js`. Update the README kiln line.

**Open questions** — None.

**Tasks**
- [x] `startFiring`: `setFireLevel` then `advance("firing")` for every pot
- [x] `markCracked` on each box in `showPots` (ready and after each take)
- [x] Refusal statuses: full, busy
- [x] Rewrite the kiln header comment and README kiln line to match
- [x] Verify in the browser (one run per log count, a 4-pot batch, a second batch)

## Decisions
1. Capacity → 4 pots, not 3.
2. Start trigger → the torch, with 1 to 4 pots (default).
3. Cracking → kiln must use `setFireLevel` and `markCracked` (default).
4. Loading → only while `empty` or `loaded`; refusals show a status.
5. Taking → one pot per click while others wait; new pots refused until the kiln is empty.
6. Acceptance → one run per log count, with exact clay-to-level mapping.
7. Question 7 was blank in the reply → no change.
