# PRD: One continuous level that unlocks stations in stages

**Goal** — Replace separate level scenes with one world where finishing each stage reveals the next set of stations (door → house → glaze).

**Context**
- `multiplelevels` (uncommitted) already has `buildWorld(config)`, `LEVELS` (`scenes/levels.js`: description, steps, fixed orders, `world` flags), fixed-order `OrderPanel`, Goal panel, Restart/Menu, `LevelSelect`/`LevelComplete`. See `PRD/levels-1-3.md` for the stage rules.
- Today each level rebuilds a fresh scene with parts switched off; the door and Inside only exist if `inside: true`.
- Stage content is reused unchanged: S1 = L1, S2 = L2, S3 = L3.

**Scope** — One scene (`Game`) built once with everything; stations hidden/disabled until their stage. Stage manager replaces scene switching: on stage complete, reveal new stations, swap orders + Goal panel. Play goes straight to the game.
**Out of scope** — Level select, per-level LevelComplete screen, unlock persistence, levels 4+, new art/sound, changing stage orders/goals from `levels-1-3.md`.

**Flow**
1. Play → fox Outside. Stage 1: kiln, torch, forest, 3 floor pots; no door, no clay patches. Goal = L1.
2. 3rd matching glaze-fired pot leaves the kiln → short "Stage complete" message; the door appears.
3. Fox enters the door → Inside shows owl, weighing, workbench (Cup), drying + completed shelf; black clay patch appears Outside. Stage 2 orders/Goal (L2) replace stage 1's.
4. Black cup delivered → glaze station appears Inside, red + white clay patches Outside, orders/Goal = L3 (one dip max).
5. 4th cup delivered → `End` scene.

**Requirements**
1. A `STAGES` table (reusing `LEVELS` entries) lists per stage: orders, Goal text, `reveal` (door, inside stations, glaze, clay keys, models), `maxGlazeDips`.
2. Unrevealed stations are not rendered and not clickable/collidable; the door neither draws nor teleports until stage 1 completes.
3. Stage completion = existing rule (S1: 3rd kiln removal; S2/S3: all fixed orders delivered), checked by one handler, then reveal and swap orders + Goal panel.
4. Stage 2 and 3 start with an empty order list swap; stage 1 floor pots are consumed/left as is (no respawn).
5. Restart resets to the start of the **current** stage (state + that stage's orders; earlier reveals kept); cracked-pot hint pulses it. Menu button removed.
6. `Start` Play → `Game`; `Game` no longer runs random/timed orders; level scenes, `LevelSelect`, `LevelComplete` unused (files removed from `index.html`).

**Acceptance criteria**
- [ ] New game: no door, no Inside stations, no clay patches visible; Goal shows stage 1.
- [ ] Completing S1 shows the door; walking in works; Inside has owl/weighing/bench/shelves but no glaze station.
- [ ] Completing S2 reveals glaze station + red/white clay; second dip refused.
- [ ] Completing S3 goes to `End`; Goal/orders swap correctly at each stage.
- [ ] Cracked pot → Restart returns to the current stage start with earlier stations still shown.
- [ ] Console free of errors; touch controls still work.

**Constraints** — Crafty 0.9.0, no new deps; refactor `scenes/game.js`/`levels.js` (stage manager in `levels.js`); keep `buildWorld` as the single builder.

**Open questions**
1. Restart granularity: current stage (assumed) vs. whole game?
2. Stage 2/3 start: should stage-1 leftovers (kiln, logs, fired pots) stay as-is (assumed yes)?

**Tasks**
- [ ] `STAGES` table + `revealStage(n)` that builds/shows station entities (gate by `visible`/removed colliders)
- [ ] Build door lazily; hide Inside stations until stage 2
- [ ] Single stage-complete handler → message, reveal, swap orders (`OrderPanel.start`) and Goal panel
- [ ] Clay patches + glaze station gated per stage; `maxGlazeDips` per stage
- [ ] Restart to current stage; remove Menu/LevelSelect/LevelComplete wiring; Start → `Game`; final stage → `End`
- [ ] Verify acceptance criteria in the browser
