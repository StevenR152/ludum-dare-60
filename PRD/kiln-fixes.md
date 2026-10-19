# PRD: Kiln bug fixes

Shared context: kiln click handler is in `scenes/game.js` (~L118); kiln state/firing in `components/kiln.js`. Kiln states: empty -> loaded -> firing -> cooling -> ready -> empty.

## Bug 1 — Can't take a pot or wood back out before firing
**Goal** — The fox can retrieve a pot or logs from the kiln until it is lit.
- Today `releases` only allows pots once `ready`, and wood has no way out (click handler only moves items in).
- Click the kiln with an empty pack while it is `empty`/`loaded`: takes the pot out first, else one log, one item per click.
- Only before firing: during firing/cooling nothing comes out; the kiln stays "busy"/"hands off".
- When the last pot leaves a `loaded` kiln, state returns to `empty`.
- Status: "Took the pot out of the kiln" / "Took a log out of the kiln"; the pack's normal rules apply (clay/pots vs logs).
- [x] Load a pot, click with empty hands: pot returns to the pack, kiln state `empty`.
- [x] Load 2 logs, click twice: both return one at a time; pack full shows a message, nothing lost.
- [x] Pot or log cannot be taken while firing or cooling; fired pots still collect as before.

## Bug 2 — Can't fire the kiln without a pot
**Goal** — Lighting the torch works with wood alone.
- Today `Kiln.light()` refuses when state is `empty` ("Put a pot in the kiln first").
- Remove that check: wood is the only requirement ("Put wood in the kiln first" stays).
- An empty kiln fires and cools through the normal timers (lit art, fire level, `KilnLit` sound), burning the wood.
- When cooling ends with no pots, the kiln returns straight to `empty` instead of sitting `ready` with nothing to take.
- [x] Wood only + torch: kiln lights, wood slots empty, fire level set.
- [x] After the cool time the kiln is `empty` and accepts a pot and wood again.
- [x] No wood: torch still says "Put wood in the kiln first".

## Bug 3 — Two logs drop into the kiln per click
**Goal** — One click moves exactly one log.
- The kiln click handler loops `transferItem` until the pack or kiln is full, so carrying two logs drops both.
- Replace the loop with a single `transferItem` call; the other log stays selected in the pack.
- Status "Wood loaded into the kiln" on success, "The kiln is full of wood" when it can't take one.
- [x] Carry 2 logs, click the kiln once: 1 log in the kiln row, 1 left in the Fox row.
- [x] Second click moves the second log; a fourth log (kiln has 3) shows "The kiln is full of wood".
- [x] Pot loading and fired-pot collection unchanged.

## Constraints / Tasks
Edit `scenes/game.js` and `components/kiln.js` only; no new dependencies.
- [x] Bug 3: single transfer per click
- [x] Bug 2: drop empty-kiln check in `light()`; `finishPot` returns to `empty` with no pots
- [x] Bug 1: take-back on empty-handed click; kiln state returns to `empty` when emptied
- [x] Verify all acceptance checks in the browser

**Open questions** — None (take-back order: pot first, then logs).
