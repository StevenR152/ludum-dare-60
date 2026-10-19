# PRD: Give to the master when pack is full

**Goal** — With a full pack and a finished pot waiting on the master, clicking him hands over what he can take (a pot to trim, or wedged clay + model) instead of failing to collect.

**Context**
- Owl click handler: `scenes/game.js` ~L75–84. If he has a finished pot it only tries `takePot`, else "You can't carry the pot: your pack is full". Giving (`Potter.receiveFrom`) only runs when he has no finished pot.
- `components/potter.js`: `receiveFrom` returns only a status string and only considers the *selected* pot; it's the only caller. Fox pack = 2 slots, master = 5.
- Same pattern as `PRD/kiln-deposit-when-pack-full.md`: give only when the pack is full.

**Scope** — Full pack + finished pot waiting: try giving first, else show why he refused. `receiveFrom` also gives an unselected trimmable pot. All owl-click lines reworded in the fox's first person. **Out of scope** — Job timers, capacities, HUD, art/sound, kiln, the "master trimmed/collapsed/cracked" result lines.

**Flow**
1. Pack full, master has a finished pot, fox touches him and clicks.
2. If he can take something, it moves to him (job starts); the fox has a free slot.
3. Next click, with nothing to give, takes the finished pot.
4. Pack not full: the first click collects the finished pot; a later click gives.

**Requirements**
1. Finished pot waiting + pack full + something giveable → give it, no collect attempt. Pick: selected trimmable pot, else any other trimmable pot in the pack, else wedged clay + model.
2. Finished pot waiting + pack full + nothing giveable → nothing moves; show the refusal reason (`receiveFrom`'s message).
3. Finished pot waiting + pack not full → collects, even if the fox holds something giveable.
4. No finished pot → `receiveFrom` path as before, plus the unselected-pot pick from req 1.
5. `receiveFrom` reports whether it gave anything (`{gave, status}`); the handler uses that.
6. Wrong clay weight: "Hmm, this is 300 g, but I need to give 450 g" (unit spaced like the game's other weight lines). Other refusals get a "Hmm, …" first-person line; successes "I gave the master …".

**Acceptance criteria**
- [ ] Full pack (right-weight wedged clay + model), finished pot waiting → both go to him, job starts.
- [ ] Full pack, log selected, trimmable pot unselected → pot goes to him.
- [ ] Full pack, selected pot cracked/trimmed, another pot trimmable → the trimmable one goes.
- [ ] Full pack, nothing giveable → refusal reason shown, nothing moves; wrong weight shows the 300 g / 450 g line.
- [ ] Two trimmable pots, full pack, finished pot waiting → one pot per click.
- [ ] Master full (5) + full pack → his-hands-full line, nothing moves.
- [ ] Free slot + finished pot waiting → collects; next click gives.
- [ ] No finished pot, unselected trimmable pot → given.
- [ ] No owl-click line is second person (check each in console/UI).

**Constraints** — `scenes/game.js`, `components/potter.js` only; no new dependencies, no art/sound changes.

**Open questions** — None.

## Decisions
- Unselected trimmable pot is given too; priority selected pot → other pot → clay + model.
- Free slot + finished pot: collect first, give on the next click.
- Full pack + nothing giveable: show why he refused; the old "can't carry the pot" line goes.
- Weight line: "Hmm, this is 300 g, but I need to give 450 g" (user's wording, game's "N g" unit format, no shape); other refusals prefixed "Hmm," (default).
- Refusal shows only its reason, no pack-full/waiting-pot mention (default).
- One item per click, except clay + model together (default).
- Reworded to first person: every line from clicking the master; his trim-result lines left alone (default).

**Tasks**
- [ ] Reproduce in browser (full pack, finished pot waiting)
- [ ] `Potter.receiveFrom` returns `{gave, status}`; add unselected-pot pick; reword lines; update the one caller
- [ ] Owl handler: finished pot + full pack → give first, else show the reason
- [ ] Verify all acceptance checks in the browser
