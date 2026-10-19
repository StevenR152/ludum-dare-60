# PRD: Missing dialog lines
**Goal** — Every player interaction below says something on screen, in the same voice as the existing status lines.

**Context**
- "Dialog" is `showStatus(msg)` (`components/status_message.js`): bottom-centre text, 2.5 s, each call replaces the last.
- Silent today: clay dig start (in range) and end, kiln press, both door teleports, dropped-item pickup. Clay out-of-range already has a line.
- The owl's no-input line in `Potter.receiveFrom` ends "...or a pot to trim".

**Scope** — Add/change the lines below, and reword every existing out-of-range line to "I can't reach X from here": clay (x2) "I can't harvest the clay from here"; weighing station "I can't reach the weighing station from here"; workbench (x2) "I can't reach the workbench from here"; glaze bucket "I can't reach the glaze bucket from here"; forest "I can't reach the forest from here"; dropped item "I can't reach it from here". **Out of scope** — new UI, sounds, art, other existing lines, game logic, adding out-of-range lines to stations that are silent today (owl, shelves, torch).

**Flow** (new lines in bold)
1. Press on clay while on it: **"Digging clay..."**. Hold 2 s: **"Dug up red clay"** (clay name). Release early: **"You stopped digging"**.
2. Press the kiln out of range: **"I can't reach the kiln from here"**. In range, describe what the press did: pot loaded **"Kiln loaded"**; logs loaded **"Wood loaded into the kiln"**; pot collected **"Took the pot out of the kiln"**. If the press did nothing, describe the kiln by state: empty **"The kiln is cold and empty"**; loaded **"The kiln is loaded, add wood and light the torch"**; firing **"The fire is roaring, hands off"**; cooling **"Still cooling, give it a moment"**; ready **"The fired pots are ready to take out"**.
3. Outside door: **"Into the workshop we go"**; inside door: **"Back out into the fresh air"**.
4. Click a dropped item while touching it: **"Picked up the pot"** / **"Picked up 500 g of white clay"** / **"Picked up the Cup model"** / **"Picked up the log"**.
5. Owl with nothing useful: "...or a **dried** pot to trim".

**Requirements**
1. Clay press in range shows the start line; its out-of-range lines use the new wording.
2. A finished dig shows the end line with the clay name; letting go or leaving the patch with the cursor after a started dig shows "You stopped digging"; a release with no dig started (out of range, patch dug) shows nothing extra. Pack full at dig end shows only "Backpack full..."; fox walked off shows only the out-of-range line.
3. Kiln press shows the out-of-range line, else the line for what the press did (loaded/collected), else its state line; the kiln's existing failure lines ("busy", "full"...) still replace these.
4. Each door teleport shows its line once per crossing.
5. Successful pickup names the item; failed pickup keeps "Backpack full..." / "Walk up to it first".
6. Owl line reads "...or a dried pot to trim".
7. All 8 existing out-of-range lines listed in Scope use the "I can't reach X from here" wording; their conditions are unchanged.

**Acceptance criteria**
- [ ] On clay: start line; after 2 s end line; early release "You stopped digging"; away from clay only the existing line.
- [ ] Kiln: "Kiln loaded" / "Wood loaded into the kiln" / "Took the pot out of the kiln" on those actions; state line in each of its 5 states when nothing happens; out-of-range line; no stale text.
- [ ] Both doors show their line once, not every frame.
- [ ] Pickup line for clay, pot, model, log; none when the pack is full.
- [ ] Owl line says "dried pot to trim"; other owl lines unchanged.
- [ ] Pressing each of clay, weighing station, workbench (press and hold), glaze bucket, forest, dropped item from afar shows its "I can't reach X from here".

**Constraints** — Edit existing files only: `components/clay.js`, `scenes/game.js`, `components/dropped_item.js`, `components/potter.js`, `components/weighing_station.js`, `components/workbench.js`, `components/glaze_station.js`, `components/forest.js`. Crafty 0.9.0, use `showStatus`.

**Open questions** — None.

## Decisions
- Kiln lines describe what the press did ("Kiln loaded"); state lines only when nothing happened. The loaded-wood and collected-pot lines are my wording in that style.
- Dig end: "Dug up <clay> clay". Pickups: "Picked up ...". Doors keep the fox's voice.
- Dig ends other than finishing: pack full and walked-off keep their own lines (default); early release gets "You stopped digging".
- Pickup names: clay with grams and colour; others "the pot", "the Cup model", "the log" (default).

**Tasks**
- [x] `clay.js`: start line, end line, "stopped digging" (track a dig in progress)
- [x] `scenes/game.js`: kiln out-of-range, action and state lines; door lines in `useDoor`
- [x] `dropped_item.js`: pickup line in `onClick`
- [x] `potter.js`: "dried pot to trim"
- [x] Reword out-of-range lines in `weighing_station.js`, `workbench.js`, `glaze_station.js`, `forest.js` (and `clay.js`, `dropped_item.js` above)
- [x] README check: no change needed (rules unchanged)
- [ ] Verify each acceptance item in-app (not done: no server or shell on the user's computer; code only syntax-checked)
