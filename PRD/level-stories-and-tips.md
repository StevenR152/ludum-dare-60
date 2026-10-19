# PRD: Story and Master tips for levels 3-7

**Goal** — Give levels 3-7 the same story and Master-tip structure levels 1-2 have, with every piece of prose left empty so Crystal can fill it in without touching logic.

**Context**
- `showGoalPanel` (`scenes/levels.js`) shows the level name + `story` + an optional italic `tip` when a level has a `story`, otherwise `Goal` + the one-line `description`. The tip is already guarded against being missing.
- `masterTips` is an optional `[{on, when, text}]` on a level; each entry fires once, the first time its event matches, via `showMasterTip` (hoot + status line). Only level 2 has any.
- Levels 1-3 have a `story`, 4-7 have none. Level 3 has no `tip`; 4-7 have no `tip` or `finish` either.

**Scope** — Add `story`, `tip`, `finish` and a wired-up `masterTips` skeleton to levels 3-7, and make empty prose behave exactly like a missing field so placeholders can never reach players.
**Out of scope** — Writing the prose itself (Crystal's). Levels 1-2. The Goal panel layout, the tip delay/sound, and the existing `description` lines.

**Flow**
1. Player starts any of levels 3-7. Until a field is filled, the panel looks exactly as it does today.
2. Crystal types a `story` → the header switches to title + story.
3. Crystal types a `tip` → the italic Master line appears beneath the story.
4. Player does a step that has a filled `masterTips` entry → the Master hoots and speaks, once.
5. Player delivers the last order → the `finish` line shows if filled, else today's "Level N complete!".

**Requirements**
1. A `story`, `tip` or `finish` that is absent, empty, or whitespace is treated as absent everywhere it is read.
2. A `masterTips` entry whose `text` is empty or whitespace never shows and never uses up its one-shot.
3. Levels 3-7 each gain `story: ""`, `tip: ""`, `finish: ""` and a `masterTips` array holding one `text: ""` entry per step that is new in that level, with `on`/`when` already wired to the right event.
4. The Goal panel's height matches the lines actually rendered, with no blank gap.
5. No level's on-screen appearance changes until prose is added.

**Acceptance criteria**
- [ ] Levels 1-7 all render exactly as they do now (compared against captured panel text from before the change).
- [ ] No "undefined", "TODO" or stray empty line appears in any level's panel.
- [ ] Filling level 4's `story` switches its header; also filling its `tip` adds the italic line.
- [ ] Filling one `masterTips.text` on level 5 makes it fire once, with the hoot, on its matching step.
- [ ] Levels 1 and 2 behave identically to before.

**Constraints** — `scenes/levels.js` only. ES5, no build step, match the file's existing comment and formatting style.

**Open questions** — None.

**Tasks**
- [ ] Add a small helper that returns a trimmed non-empty string or null, and use it for `story`/`tip` in `showGoalPanel` and for `finish` at its call site.
- [ ] Skip empty-`text` entries where `masterTips` is wired up in the Game scene.
- [ ] Add the field skeleton and `masterTips` slots to levels 3-7, one slot per newly-introduced step.
- [ ] Add a short comment above `LEVELS` telling Crystal which fields to fill and what each one does.
- [ ] Verify all seven levels in the browser, before and after filling one sample field.
