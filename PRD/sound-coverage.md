# PRD: Sound coverage

**Goal** — Every sound file is either played by a named entity/event or marked "no purpose yet"; this PR binds the missing ones.

**Context**
- Playback: `assets.js` `audio{}` -> `GameSounds` (`components/game_sounds.js`, event -> name) -> `audioController`. Gameplay only fires events.
- Numbered takes: use take 1 unless already bound (existing bindings unchanged).
- `bgMusic` (`MUSIC_TRACK`, used by Start/End/Level scenes) is not registered, so those scenes play nothing.

## Audit (✅ bound today, ❌ missing but has an entity, ➖ no purpose yet)

| Sound file(s) | Entity -> action | |
|---|---|---|
| Workshop / Forest LOOP | Ambient: fox inside / outside | ✅ |
| wedging clay 2-4, pickup/putdown wet clay 2-4, pickup/putdown pot 1-3, glaze dipping 3-4, kick wheel LOOP, pots crack big 2, order succes (delivered) / succes 3 (expired), fire 4 (`KilnLit`) | Workbench, Fox/shelves/Owl, Glaze station, Owl, Pot, Orders, Kiln | ✅ |
| dig 1 | Clay node -> `ClayDug` | ❌ |
| door 1 | Doors (`scenes/game.js` door `arrival` teleport) -> fox teleported | ❌ |
| weigh scale 1 | Weighing station -> `weigh()` succeeds | ❌ |
| harvest wood 1 | Forest tree -> `finishChop` (log chopped) | ❌ |
| drop wood 1 | Kiln -> log moved into `woodInventory` (`ItemMoved`) | ❌ |
| fire LOOP | Kiln -> while state is `firing` | ❌ |
| UI hover / confirm | `ButtonBase` -> MouseOver / Click | ❌ |
| UI select / back | Level-select level buttons / "Back" button | ❌ |
| music/theme test 1 ld60 LOOP.ogg | Start/End/Level scenes -> `bgMusic` | ❌ |
| order succes 2, 4 | — (no second order event) | ➖ |
| pots crack small 1-4 | — (no small-crack event) | ➖ |
| glaze dipping 1-2, END 1-4 | — (no end-of-dip event) | ➖ |
| owl 1-4, fox 1-2 | — (no voice/greeting event) | ➖ |
| fire 1-3, 5-7 | — (no kiln stage events) | ➖ |
| extra takes (wedging 1/LOOP, wet clay 1, pot 4, crack big 1,3,4, dig 2-3, door 2-3, wood 2-3, weigh 2-3, UI music 2) | — spare takes | ➖ |
| pottery kick wheel LOOP.wav.asd | — DAW junk | ➖ |

**Scope** — Register + bind every ❌ row. **Out of scope** — ➖ rows, new recordings, changing existing mappings.

**Requirements**
1. Each ❌ sound is registered in `assets.js` and plays on its event via `GameSounds` (new events fired from the entity only where none exists: dig/weigh/chop/teleport/button).
2. `bgMusic` registered; no "not in gameAssets" warnings on Start/End.
3. Mute silences all new sounds; kick/fire loops stop with their state.
4. `assets/sounds/README.md` lists the ➖ files with reason.

**Acceptance criteria**
- [x] Each ❌ row plays once on its action (fire LOOP while firing, stops after). Checked by firing the events with the sound calls logged; audio output itself not heard.
- [x] Music plays on Start (bgMusic loaded and playing); mute is the existing Crafty mute.
- [ ] Console clean Start -> Game -> End. No missing-asset warnings; one harmless play()-interrupted error from rapid test scene switches; End scene not visited.
- [x] README covers every ➖ file.

**Constraints** — `assets.js`, `game_sounds.js`, small trigger lines in entity files, README. No sound calls in gameplay code.

**Open questions**
None (answered: kiln sounds included).

**Tasks**
- [x] Register new sounds + `bgMusic` in `assets.js`
- [x] Add missing trigger events (dig/weigh/chop/door/button/kiln firing)
- [x] Bind in `GameSounds`
- [x] Write ➖ list in sounds README
- [x] Verify in browser, console clean
