# PRD: Sound coverage audit

**Goal** — Every file in `assets/sounds/Sounds/` is either played by a named entity/event or listed as intentionally skipped. Kiln sound timing is being fixed by another engineer: do not touch it.

**Context**
- Playback goes `assets.js` `audio{}` -> `GameSounds` (`components/game_sounds.js`, event -> name) -> `audioController`. Gameplay only fires events.
- All kiln sound work (`kilnLoad`/fire 4, `kiln.js`, the kiln branch of `GameSounds.onItemMoved`, kiln fire sounds) is owned by someone else: leave as is.
- `bgMusic` (`MUSIC_TRACK`, used by Start/End scenes) is not registered in `assets.js`, so those scenes warn and play nothing.

## Inventory (✅ used today, ❌ unused)

| File(s) | Entity | When | |
|---|---|---|---|
| Workshop LOOP / Forest LOOP | Ambient (GameSounds) | Fox inside (x<0) / outside | ✅ |
| wedging clay 2,3,4 | Workbench | Holding to wedge blue / red / brown clay | ✅ |
| pickup / putdown wet clay 2,3,4 | Fox, shelf, owl (via `ItemMoved`) | Wet pot taken / released, by clay | ✅ |
| pickup pot 1,2,3 | same | Bone dry / bisque / glazed pot taken | ✅ |
| putdown pot 1,3,2 | same, Owl | Bone dry / bisque / glazed pot released; owl finishing a pot | ✅ |
| putdown pot 1 (again) | Fox | `Stumbled` (placeholder) | ✅ |
| fire 4 | Kiln | `kilnLoad` (other engineer's area, untouched) | ✅ |
| glaze dipping 3 / 4 | Glaze station | First / later dip | ✅ |
| pottery kick wheel LOOP | Owl | While he works | ✅ |
| pots crack big 2 | Pot | Any crack/destroy | ✅ |
| wedging clay 1, wedging LOOP, pickup/putdown wet clay 1, pickup/putdown pot 4, pots crack big 1,3,4 | — | spare takes | ❌ |
| pots crack small 1-4 | — | no small-crack event | ❌ |
| fire 1-3,5-7, fire LOOP | Kiln | other engineer's area: not covered here | ➖ |
| glaze dipping 1,2, glaze dipping END 1-4 | Glaze station | spare dips / end-of-dip | ❌ |
| dig 1-3 | Clay node | `ClayDug` | ❌ |
| door 1-3 | Doors | teleport in/out | ❌ |
| harvest wood 1-3, drop wood 1-3 | Trees / kiln wood | cut a log / put wood in kiln | ❌ |
| weigh scale 1-3 | Weighing station | weighing clay | ❌ |
| order succes, 2-4 | Orders / completed shelf | order completed | ❌ |
| owl 1-4, fox 1-2 | Owl / Fox | greeting / grunt | ❌ |
| UI back/confirm/hover/select | Buttons | UI click/hover | ❌ |
| music/ (3 .ogg) | Start/End scenes | `bgMusic` | ❌ |
| pottery kick wheel LOOP.wav.asd | — | DAW junk | ❌ |

**Scope** — (1) Register + bind the proposed sounds below. (2) Record skipped files in `assets/sounds/README.md`. **Out of scope** — anything kiln (all `fire *` files, `kiln.js`, kiln code in `GameSounds`); new recordings, converting `.wav`, changing existing mappings.

**Proposed bindings (default, change in Q1):** dig 1 -> `ClayDug`; door 1 -> door teleport; weigh scale 1 -> weigh done; order succes -> `OrderComplete`; UI sounds -> `UIButton` hover/click; harvest/drop wood 1 -> wood events; `bgMusic` -> `music/theme test 1 ld60 LOOP.ogg`. **Skipped on purpose:** extra numbered takes, crack small, glaze END, owl/fox voices, `.asd`.

**Requirements**
1. Every non-kiln file is bound or listed under "Skipped" in the README with a reason; `fire *` files are noted as the other engineer's.
2. No "not in gameAssets" console warnings, including Start/End scenes.

**Acceptance criteria**
- [ ] Diff contains no kiln changes.
- [ ] Each newly bound sound plays on its event; mute silences it.
- [ ] README lists every skipped file; `ls` minus bound minus skipped = empty.
- [ ] Console clean through Start -> Game -> End.

**Constraints** — `assets.js`, `components/game_sounds.js` (not its kiln code), event sites, `assets/sounds/README.md`. No sound calls in gameplay code.

**Open questions**
1. Approve the proposed bind/skip split above (esp. UI, music)?

**Tasks**
- [ ] Register `bgMusic` and approved sounds in `assets.js`
- [ ] Add events/binds per approved entity
- [ ] Write Skipped list in sounds README
- [ ] Verify in browser, console clean
