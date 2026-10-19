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
3. Restart rebuilds the level with the timer back at 0; Menu → `LevelSelect`; Back on `LevelSelect` → Start.

**Requirements**
1. `Game` modes are `single` (default) and `sandbox`; no `progressive`, and no `at` option (fox always starts at the default spot).
2. Start shows Play (→ `LevelSelect`) and, in DEV_MODE, Sandbox; no separate Levels button.
3. Level complete always goes to `LevelComplete`; `Crafty.scene("Game")` with no options plays level 1 alone.
4. Menu in a level goes to `LevelSelect` (sandbox: Start, as today).
5. Nothing reaches the `End` scene any more; the scene and `scenes/end.js` are kept as unused code.
7. Restart resets the level timer to 0 (no `seconds` carried over).
6. Comments, README (scenes list, how-to-play) and `levels.js` header describe levels only.

**Acceptance criteria**
- [x] Start: Play (and Sandbox with DEV_MODE); Play opens the level select.
- [x] Each of levels 1–3 starts alone with the fox at the start and the timer at 0; finishing shows `LevelComplete`; level 3 offers only Level select.
- [x] Restart resets the timer to 0; Menu and Back behave as above; Sandbox still loads and Menu returns to Start.
- [ ] With `UNLOCK_ALL_LEVELS` false, a fresh browser has levels 2–3 locked; finishing 1 unlocks 2. (not run: lock logic untouched)
- [x] `grep -ri "progressive\|\"End\"" --include=*.js --include=*.html .` finds nothing live; console free of errors.

**Constraints** — Crafty 0.9.0, no new deps; files: `scenes/levels.js`, `scenes/start.js`, `scenes/game.js` only if `start` option becomes unused, README.

**Open questions** — None (Start keeps one "Play" button; the old Levels label is dropped. The 3 stage-reveal wording in older PRDs stays as history).

**Tasks**
- [x] `levels.js`: drop progressive branch, `at`, `Start` Menu target; default mode `single`; Restart resets timer; update header comments
- [x] `start.js`: single Play → `LevelSelect`; remove Levels button
- [x] Remove now-unused `start`/`at` handling in `buildWorld` if nothing else uses it
- [x] README updates
- [x] Verify acceptance criteria in the browser

## Decisions
1. Start → one "Play" button to the level select (default).
2. After level 3 → `LevelComplete` with Level select only (default).
3. `UNLOCK_ALL_LEVELS` stays `true`; lock check done by flipping it temporarily (default).
4. Restart → timer resets to 0.
5. `End` scene and `end.js` → kept, unused.
6. Remove `at`/`start` fox placement if unused (default).
