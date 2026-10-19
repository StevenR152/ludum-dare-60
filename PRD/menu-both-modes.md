# PRD: Menu with both flows: Play (progressive) and Levels (separate)

**Goal** — One build where Start offers "Play" (the continuous 3-stage run) and "Levels" (pick any level, each a standalone scene).

**Context**
- `progressive-single-level` is 2 commits ahead of `multiplelevels` (merge is a fast-forward). It replaced the standalone flow with one `Game` scene rebuilt per stage (`scenes/levels.js`), and removed `LevelSelect`, `LevelComplete`, Menu button, unlock saving, `UNLOCK_ALL_LEVELS`.
- `multiplelevels` (commit `d0118c0`) has those pieces: `scenes/level_select.js`, `level_complete.js`, `levelsDone`/`markLevelDone`/`levelUnlocked`, Menu button, scenes `Level1`–`Level3`.
- Both flows share the `LEVELS` table and `buildWorld`; only what happens on completion and Restart differs.

**Scope** — Merge into `multiplelevels`; one `Game` scene with a `mode` option (`"progressive"` default, `"single"`); restore the removed menu pieces from `d0118c0`; Start gets two buttons.
**Out of scope** — New levels/art, changing stage content, merging to `main`, deciding which flow wins.

**Flow**
1. Start → **Play**: stage 1 → … → stage 3 → `End` (unchanged: fox keeps its place, time carries, empty pack/kiln).
2. Start → **Levels**: `LevelSelect` lists levels 1–3 (locked ones greyed); pick one → `Game` in `single` mode for that level.
3. Single mode: finishing the level → 1.5 s → `LevelComplete` ("Next level" if any, "Level select"); Restart rebuilds that level; Menu → `LevelSelect`.
4. `LevelSelect` Back → Start.

**Requirements**
1. `Game` options: `{stage, mode, seconds, at}`; Restart and stage changes keep the current `mode`.
2. Progressive mode: today's behaviour, with Restart (current stage) and a Menu button (back to Start, abandoning the run); ends at `End`. Play always starts at stage 1.
3. Single mode: starts at the fox default spot with time 0 (each level timed alone); completion → `LevelComplete(index)`; "Next level" starts that level alone; Menu → `LevelSelect`.
4. Completing a level or stage (either mode) records progress (`localStorage`, guarded) so Levels unlocks the next level; `UNLOCK_ALL_LEVELS` (true while developing) opens all.
5. Start shows "Play" and "Levels"; `End` has "Play again" (progressive) and "Menu" (Start). Locked levels are greyed with "(locked)" and ignore clicks.
6. `TouchControls` scene list and `index.html` include the restored scenes.

**Acceptance criteria**
- [x] Start shows Play and Levels.
- [x] Play runs stage 1→3 with Restart and Menu buttons (Menu → Start), ending at `End`.
- [x] Levels → level 2 opens the black-cup level alone with the fox at the start; finishing shows `LevelComplete` with Next level / Level select.
- [x] Restart keeps the mode in both flows; Menu and Back navigate correctly.
- [x] With `UNLOCK_ALL_LEVELS` false, a fresh browser shows levels 2–3 locked; finishing level 1 (either flow) unlocks 2.
- [x] No console errors. (verified by driving scenes and deliveries with simulated frames; no hands-on play-through or touch test)

**Constraints** — Crafty 0.9.0; files: `scenes/levels.js`, `scenes/start.js`, restored `level_select.js`/`level_complete.js`, `main.js`, `index.html`, `constants.js`, README.

**Open questions** — None.

**Tasks**
- [ ] Commit/merge progressive work into `multiplelevels` (user's call; no commits by me)
- [x] Restore `level_select.js`, `level_complete.js`, progress helpers, `UNLOCK_ALL_LEVELS`
- [x] Add `mode` to `Game`; branch completion and Restart/Menu on it
- [x] Start buttons Play / Levels; `End` Play again; touch list, `index.html`
- [x] README; verify acceptance criteria in the browser

## Decisions
1. Progress → shared: stages finished in Play unlock levels; Play ignores saved progress (default).
2. Next level (single) → starts alone, fox at default, clean state (default).
3. Single-level time → starts at 0 per level (default).
4. `End` → "Play again" + "Menu" (default).
5. Locked levels → greyed "(locked)", unclickable (default).
6. Play has Restart and Menu buttons (Menu → Start).
