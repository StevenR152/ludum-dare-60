# PRD: Remove progressive levels; levels only

**Goal** — The game is the three standalone levels from `PRD/levels-1-3.md`; the continuous "Play" run (`PRD/progressive-single-level.md`) goes away.

**Context**
- `scenes/levels.js` runs the `Game` scene in `progressive` (default), `single` or `sandbox` mode; progressive rebuilds the next level where the fox stands, keeps the timer, ends at `End`.
- Start has Play (progressive) and Levels (`LevelSelect`), plus Sandbox (DEV_MODE). `End` is only reached from progressive; Menu in progressive goes to Start.
- Progress (`levelsDone`, `markLevelDone`, `UNLOCK_ALL_LEVELS`), `LevelSelect` and `LevelComplete` already serve single mode.

**Scope** — Delete progressive mode and its leftovers; Start's Play opens the level select; levels become the only way to play (plus Sandbox).
**Out of scope** — Level content, orders, goals, art; sandbox behaviour; unlock rules; new modes.

**Flow**
1. Start → **Play** → `LevelSelect` (levels 1–3; locked ones greyed) → pick a level → `Game` for that level alone, timer from 0.
2. Finish a level → 1.5 s "Level N complete!" → `LevelComplete` (Next level / Level select). Level 3 has no Next.
3. Restart rebuilds the level; Menu → `LevelSelect`; Back on `LevelSelect` → Start.

**Requirements**
1. `Game` modes are `single` (default) and `sandbox`; no `progressive`, and no `at` option (fox always starts at the default spot).
2. Start shows Play (→ `LevelSelect`) and, in DEV_MODE, Sandbox; no separate Levels button.
3. Level complete always goes to `LevelComplete`; `Crafty.scene("Game")` with no options plays level 1 alone.
4. Menu in a level goes to `LevelSelect` (sandbox: Start, as today).
5. `End` scene, `scenes/end.js` and its `index.html` / `TouchControls` references are removed; no code reaches `End`.
6. Comments, README (scenes list, how-to-play) and `levels.js` header describe levels only.

**Acceptance criteria**
- [ ] Start: Play (and Sandbox with DEV_MODE); Play opens the level select.
- [ ] Each of levels 1–3 starts alone with the fox at the start and the timer at 0; finishing shows `LevelComplete`; level 3 offers only Level select.
- [ ] Restart and Menu behave as above; Sandbox still loads and Menu returns to Start.
- [ ] With `UNLOCK_ALL_LEVELS` false, a fresh browser has levels 2–3 locked; finishing 1 unlocks 2.
- [ ] `grep -ri "progressive\|\"End\"" --include=*.js --include=*.html .` finds nothing live; console free of errors.

**Constraints** — Crafty 0.9.0, no new deps; files: `scenes/levels.js`, `scenes/start.js`, `scenes/end.js` (delete), `index.html`, `main.js` / TouchControls scene list if they name `End`, `scenes/game.js` only if `start` option becomes unused, README.

**Open questions** — None (Start keeps one "Play" button; the old Levels label is dropped. The 3 stage-reveal wording in older PRDs stays as history).

**Tasks**
- [ ] `levels.js`: drop progressive branch, `at`, `Start` Menu target; default mode `single`; update header comments
- [ ] `start.js`: single Play → `LevelSelect`; remove Levels button
- [ ] Delete `scenes/end.js`; remove from `index.html` and any scene list
- [ ] Remove now-unused `start`/`at` handling in `buildWorld` if nothing else uses it
- [ ] README updates
- [ ] Verify acceptance criteria in the browser
