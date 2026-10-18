# PRD: Kiln fires 3 pots at once

**Goal** — The kiln holds and fires up to 3 pots as one batch at one fire level, using the clay firing-level hook.

**Context**
- `kiln.js` holds one pot (`KILN_CAPACITY` 1), starts firing as soon as it is loaded, and advances only `items[0]`. One `potBox` shows the ready pot.
- `PRD/clay-firing-levels.md` (built): `pottery.setFireLevel(level)` (needs state `dried`) then `advance("firing")`; a mismatch with the clay's level cracks at `cooled`; `markCracked(box, pot)` draws the black cross.
- The wood/log kiln change is another agent's: 1, 2 or 3 logs = low, mid, high fire. This PRD depends on it for the level and for when firing starts.

**Scope** — Kiln capacity 3, one level per batch applied to every pot, per-pot advance, one box per pot, and the empty/ready rules for a partial take.
**Out of scope** — Logs and the wood inventory, a dedicated fire level UI, per-pot levels, changing `Pottery`, the trash bin, orders, sounds.

**Flow**
1. The fox loads dried pots one at a time, up to 3 (click, as today).
2. Firing starts by the rule the log work already uses (fox clicks to fire, or the kiln is full: see Open questions). The logs loaded fix the level.
3. Every pot fires for `KILN_FIRE_MS` and cools for `KILN_COOL_MS` together.
4. When ready, each pot shows as its own box, crossed out if it cracked. The fox takes them one at a time (its pack holds 2, so two trips for 3).
5. The kiln is empty and loadable again once the last pot is out.

**Requirements**
1. `KILN_CAPACITY` is 3. Loading is allowed only in `empty` (loading) state, and only for `dried` pots. Once firing starts, no pot can be added.
2. When firing starts, for every pot in the kiln: `pot.setFireLevel(FIRE_LEVELS[logs - 1])`, then `pot.advance("firing")`. Zero logs can't start firing (status message).
3. After `KILN_FIRE_MS` every pot advances to `cooling`; after `KILN_COOL_MS` every pot advances to `cooled`, and the kiln state becomes `ready`.
4. The kiln releases a pot only when `ready` and the pot is `cooled`, as now. It returns to `empty` only when its inventory is empty, not after the first take.
5. One pot box per pot (up to 3), at its own spot in the square, each coloured by `itemColor`; `markCracked(box, pot)` is called on each when ready. A taken pot's box is hidden.
6. A batch of mixed clay types fires at one level, so the pots whose clay needs another level crack. No special handling.

**Acceptance criteria**
- [ ] The kiln accepts 3 dried pots and refuses a 4th, an unfired-wet pot, and any pot once firing started.
- [ ] 1 log: brown pots come out sound, red and blue crossed. 2 logs: red sound. 3 logs: blue sound.
- [ ] All 3 pots fire and cool on the same timer (about 10 s each); none is takeable before `ready`.
- [ ] 3 boxes show when ready, crossed where cracked; taking one hides only its box; the kiln stays `ready` until the last is out, then `empty`.
- [ ] A second batch can be loaded and fired after the first is emptied.
- [ ] No console errors; zero-log start is refused.

**Constraints** — Crafty 0.9.0, no new deps. Edit `kiln.js`, `constants.js` (`KILN_CAPACITY`), `scenes/game.js` only if the wiring needs it, and update the `NOTE` comment in `kiln.js`. Do not edit `pottery.js`.

**Open questions**
1. What starts firing: a click on the kiln when it holds at least one pot and logs, or automatically when full? Default: a fox click (so one or two pots can fire), which the log work should already provide.
2. May the fox take a pot out while other pots in the same batch are still `ready`? Default: yes, one at a time.

**Tasks**
- [ ] `KILN_CAPACITY` to 3; loading only while empty/not started
- [ ] Start firing: set level and advance every pot, refuse at 0 logs
- [ ] Advance every pot through cooling and cooled; `ready` state
- [ ] One pot box per pot with `markCracked`; hide on take; empty only when last out
- [ ] Update the kiln `NOTE` comment and README line
- [ ] Verify in the browser
