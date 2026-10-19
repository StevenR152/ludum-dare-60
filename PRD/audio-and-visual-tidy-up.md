# PRD: Audio and visual tidy-up

*Written alongside the build from an itemised request; the Tasks below are implemented.*

**Goal** — Ship with release settings, make the fire badges readable on any pot, and fill the most obvious gaps in the game's sound.

**Context**
- `START_MUTED` was `true` with a TODO to flip it at launch, so players started with sound off. `UNLOCK_ALL_LEVELS` was `true` (a dev setting); `DEBUG_HITBOXES` and `DEV_MODE` were already `false`.
- The fire badges (`fire1x`, `fire2x`) are orange-red with a dark red "1x"/"2x", drawn straight onto the pot: they vanish on red clay and sink on black.
- `stumble` pointed at `putdown pot 1.wav`, the same file as `putdownBoneDry`; Crafty refuses to load one file under two keys, so tripping was silent.
- Every crack played `pots crack big 2`. Clay moving in and out of the pack was silent, as was a log dropped on the ground. Finishing a level played only the ordinary order jingle. Unused recordings exist for most of these (`fox 1/2`, `pots crack small`, `order succes 2/4`), but none for "the kiln is ready".

**Scope** — Release flags; a backing chip behind the fire badge; the stumble fix with a quiet yelp; crack by pot size; clay, dropped-log and level-complete sounds.
**Out of scope** — A kiln-ready cue (no recording exists for it; see Decisions). The firing and drying timings still marked "reduced for testing" (a balance call). Random takes for repeated sounds, and the unused music tracks.

**Flow**
1. The game starts with sound on; missions unlock one at a time.
2. A fired pot shows its "1x"/"2x" badge on a soft cream chip, legible on red, black and white clay.
3. The fox trips: a quiet yelp, then the dropped item's own landing sound.
4. A pot cracks: a small crack for a cup, a big one for a bowl or vase; a pot broken for good is always the big one.
5. Clay picked up or put down sounds wet, by colour; a log dropped on the ground lands with a thunk.
6. The last order of a level plays the level-complete jingle instead of the ordinary one.

**Requirements**
1. `START_MUTED` and `UNLOCK_ALL_LEVELS` are `false`; `DEBUG_HITBOXES` and `DEV_MODE` stay `false`.
2. The fire badge draws on a cream backing chip, behind the icon, in the bottom-left corner of the box.
3. Every audio key in `gameAssets` loads; no file is referenced by two keys.
4. `Stumbled` plays `foxYelp1` or `foxYelp2` at `STUMBLE_YELP_VOLUME` (0.3).
5. `PotCracked` plays `CRACK_SOUNDS[shape]` (Cup small, Bowl and Vase big); `PotDestroyed` plays the big crack.
6. Clay moving into the fox's pack plays `pickupWet<colour>`, and out of it `putdownWet<colour>`.
7. A log moving from the fox to the ground plays `dropLog`, as one going into the kiln already did.
8. `LevelFinished` (fired by the Game scene when the last order is delivered) stops `orderDelivered` and plays `levelComplete`.

**Acceptance criteria**
- [x] On a fresh load: sound is on, `UNLOCK_ALL_LEVELS`, `DEBUG_HITBOXES` and `DEV_MODE` are all `false`, and Missions shows 1 mission open and 6 locked.
- [x] All 40 audio keys report loaded (`audioController.isLoaded`), including the two yelps that replace the silent stumble.
- [x] A bisque red bowl, black vase and white cup each show the badge on its chip; it now stands out on black, where it used to sink.
- [x] A stumble plays `dropLog` for the dropped log, then a yelp at 0.3.
- [x] Cracking a cup plays `potCrackSmall`; a bowl and a vase `potCrack`; destroying a cup `potCrack`.
- [x] Clay dropped and picked back up plays `putdownWet…` / `pickupWet…` for red, black and white (white uses the existing "Blue" takes).
- [x] A log dropped on the ground plays `dropLog`.
- [x] A normal delivery plays `orderDelivered`; the level's last plays only `levelComplete`, then the Level complete screen. *(First run played both at once; see Decisions 6.)*
- [x] No console errors.
- [ ] **Not checked by ear:** whether the chosen takes (`order succes 2`, `fox 1/2`, `pots crack small 1`) actually suit their moments. I can confirm they play, not how they sound.

**Constraints** — `constants.js`, `assets.js`, `components/game_sounds.js`, `components/inventory.js`, `scenes/levels.js`, plus `README.md` and `itch-description.html`. ES5, no build step.

**Open questions** — None.

**Tasks**
- [x] Set `START_MUTED` and `UNLOCK_ALL_LEVELS` to `false`, with comments describing the release setting.
- [x] Add the cream backing chip to `fireBadgeLayer` and push both layers in `paintItem`.
- [x] Point the yelp at `fox 1`/`fox 2` and drop the duplicate stumble path.
- [x] Add `potCrackSmall` and `CRACK_SOUNDS`; pick the crack by shape.
- [x] Sound clay pickup/putdown by colour, and logs dropped on the ground.
- [x] Fire `LevelFinished` from the Game scene; swap in `levelComplete`.
- [x] Verify in the browser (playback spied on `audioController`; the walk-free events triggered directly).
- [x] README (Layout: `GameSounds`, `TimerBar`, `locked()`, `assets/fonts`, PRD list) and itch page (pick up from afar, fire badge, missions opening in order, the Coming-soon line reworded now progress bars exist) brought up to date.

## Decisions
1. **Kiln-ready cue left out.** No file was recorded for it. The six unused `fire` takes are fire sounds, not a chime, so using one would be a guess; a recorded cue is the right fix.
2. **Level-complete jingle is a guess.** No file is named for it; `order succes 2.wav` is an unused take of the order jingle. Worth a listen, and `"levelComplete"` in `assets.js` is the one line to change.
3. **Crack by pot size**, as asked: cup small, bowl and vase big. A destroyed pot is always the big crack, since it has shattered.
4. **Test timings left alone.** `KILN_FIRE_MS`, `KILN_COOL_MS` and the drying values are marked "reduced for testing", but they are balance, not debug flags. Restoring them (firing 2 s → 8 s) changes how the game plays and is the team's call.
5. **No image for the badge item.** The request mentioned an attached image that didn't come through, so the badge change is judged against the pots themselves: a backing that reads on any clay.
6. **Order jingle skipped on the last order.** The level's own `OrderDelivered` handler fires `LevelFinished` before `GameSounds` hears the order, so stopping the jingle came too early and both played. `GameSounds` now flags the finish and skips the order jingle; the stop stays for the other order.
