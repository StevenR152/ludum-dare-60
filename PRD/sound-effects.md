# PRD: Sound effects and ambience

**Goal** — Play the 45 recorded sounds in `assets/sounds/Sounds` at the moments they fit, using the existing `audioController`.

**Context**
- `AudioController` (`components/audio_controller.js`) has `playMusic` (looped, one track), `playSfx(name, volume)` and one global mute. It waits for the first click or key press before playing.
- `gameAssets.audio` in `assets.js` is empty, and `MUSIC_TRACK = "bgMusic"` points at nothing, so the game is silent today.
- Scenes: `Level1` (Outside only), `Level2` and `Game` (Inside + Outside). Pots crack in `Pottery.advance("cooled")` (kiln) and `Potter.finishTrim`.

**Scope** — register every sound in `assets.js`. Add `playSfx` variation (random pick from a numbered set) and a looping ambience/loop channel to `AudioController`. Hook the sounds into the components below. Add the `.asd` file to `.gitignore` (it is an Ableton cache, not audio).
**Out of scope** — new art, volume sliders, music composition, mobile-specific mixing.

**Placement by track** (`*` = pick a random variant each time)
| Track | Where |
|---|---|
| `Forest LOOP` | Ambience Outside (all of Level1; Outside of Level2/Game). Crossfade to `Workshop LOOP` on the door teleport. |
| `Workshop LOOP` | Ambience Inside. |
| `fire LOOP` | While the kiln is `firing` or `cooling`. Starts when `startFiring` runs, stops at `ready`. |
| `fire 1–7`* | One-shot when the torch lights the kiln (`startFiring`), and when logs are loaded. |
| `pottery kick wheel LOOP` | While the owl has a throwing job (8 s `Potter` make). Stops on `finishMake`. |
| `wedging clay 1–4`* | Looped by chaining while the player holds the workbench wedge (3 s hold); stops on release or finish. |
| `pickup wet clay 1–4`* | Digging finishes (Clay → inventory) and a weighed piece is taken off the bench. |
| `putdown wet clay 1–4`* | Clay or weighed piece goes onto the bench or to the owl, or `SPACE` drops clay. |
| `pickup pot 1–4`* | A pot is taken from the owl, the drying shelf, the kiln or the completed shelf. |
| `putdown pot 1–4`* | A pot goes into the kiln, onto the drying shelf or the completed shelf, or to the owl for trimming. |
| `glaze dipping 1–4`* | A dip succeeds (`dipPot`). |
| `glaze dipping END 1–4`* | Played ~0.3 s after the dip, as the pot comes out. |
| `pots crack big 1–4`* | A pot cracks at firing finish (wrong level or not bone dry), or when the owl trims a bone-dry pot. |
| `pots crack small 1–4`* | A pot collapses while wet at trim, and a cracked pot is refused by the shelf. |
| `UI/hover` | `UIButton` and `MuteButton` mouse-over. |
| `UI/select` | Any button click on Start/End. |
| `UI/confirm` | Order accepted by the owl, a pot placed on the completed shelf, game won. |
| `UI/back` | A refused action (`showStatus` warnings such as "Put wood in the kiln first"). |

**Flow**
1. First click or key press unlocks audio; the Outside ambience starts and loops.
2. Fox digs, carries, wedges, weighs and drops clay. Each step plays its wet clay sound.
3. Entering a door swaps Forest for Workshop. The owl's wheel runs for the 8 s throw.
4. Pots move around with pickup/putdown pot sounds. Lighting the kiln plays a fire one-shot, then the fire loop runs until the pots are ready.
5. A cracking pot plays a crack, big or small by cause. Dipping plays dip then END.
6. Mute silences everything, as it does now.

**Requirements**
1. All 45 `.wav` files are in `gameAssets.audio` under stable keys (e.g. `forest`, `pickupPot1`) and preload on the Loading scene.
2. `audioController.playSfxSet("pickupPot")` plays a random numbered variant, never the same one twice running.
3. `audioController.playLoop(name)` / `stopLoop(name)` give each loop its own channel, so an ambience and a fire loop can play together. `playMusic` stays for music.
4. Ambience follows the player's area and the scene (stops at scene change, no double playback).
5. The fire loop and wheel loop start and stop with the kiln and owl states and never leak past a scene change.
6. Each track in the table above is triggered at the stated moment, and only there.
7. Mute and unmute silence and resume all loops. Nothing plays before the first interaction.
8. The forest and workshop loops replace `bgMusic`; scenes stop calling `playMusic(MUSIC_TRACK)`.
9. World loops (fire, wheel, wedging) play at full volume in the fox's area and about 30% in the other.
10. `UI/back` plays on each `showStatus` warning, at most once per 400 ms.
11. Pot and clay sounds come from player-action handlers, not a generic `InventoryChanged` listener, so scene setup is silent. A winning shelf placement plays `UI/confirm` once, without the putdown sound.
12. Each `playSfx`/`playLoop` call logs `audio: <name>` to the console, gated behind a debug flag.

**Acceptance criteria**
- [ ] Console has no "Audio track not in gameAssets" warnings during a full run.
- [ ] Forest loop Outside, Workshop loop Inside, and they swap on the door.
- [ ] Lighting the kiln plays a fire one-shot, then the loop until pots are ready, then silence.
- [ ] Owl throwing plays the wheel for exactly the throw.
- [ ] Wedging sounds play only while holding the bench.
- [ ] Dig, drop, pickup and putdown sounds vary between presses.
- [ ] A wet-trim collapse is a small crack; a bone-dry crack or a kiln crack is a big one.
- [ ] Glaze dip then END sound. Button hover/select/confirm/back fire as listed.
- [ ] Mute silences all, unmute resumes the loops. Restarting a scene doesn't stack loops.
- [ ] Fire loop is quieter Inside than Outside; Level1 start and scene load are silent.
- [ ] Spamming a refused action plays `UI/back` at most every 400 ms.
- [ ] The console `audio:` log shows the expected sequence (fire one-shot, then loop; dip, then END).

**Constraints** — CraftyJS 0.9 `Crafty.audio` and the existing `AudioController`. No new dependencies. Hook via existing events (`InventoryChanged`, `Kiln` states, `TimeClicked`), not by editing every call site. The loops (Forest, Workshop, fire, wheel) are converted to mp3 and listed with their wav as a fallback; one-shots stay wav.

**Open questions**
None

**Tasks**
- [ ] Convert the 4 loops to mp3; register audio in `assets.js`; add `.asd` to `.gitignore`.
- [ ] Add `playSfxSet`, `playLoop`, `stopLoop` to `AudioController`.
- [ ] Ambience swap in Level1/Level2/Game and the door.
- [ ] Kiln: fire one-shot, fire loop, crack sounds.
- [ ] Potter: wheel loop, trim crack sounds.
- [ ] Clay, workbench, scales and inventory pickup/putdown/wedge sounds.
- [ ] Glaze dip + END.
- [ ] UI sounds on `UIButton`, `MuteButton`, refusals, order accepted, shelf placement.
- [ ] Update README layout notes; verify in browser.

## Decisions
- Convert audio? → loops to mp3 with wav fallback, one-shots stay wav (confirmed)
- Replace `bgMusic`? → yes (default)
- Fire loop when Inside → ~30% volume (default)
- Wheel/wedge when Outside → ~30% volume (default)
- `UI/back` spam → once per 400 ms (default)
- Pot sounds on scene setup → silent, from action handlers (default)
- Winning placement → confirm once, no putdown (default)
- Verify timing by console log → yes, debug-gated (default)
