# PRD: Sound effects and ambient loops

**Goal** — The fox hears the workshop or forest, and every wedge, pot pickup/putdown, kiln drop and glaze dip has its own sound.

**Context**
- `AudioController` (global `audioController`, `components/audio_controller.js`) already does your old pattern's job: `playMusic(track)` loops (`-1`), `playSfx(track, vol)` plays once, both wait for the first click/key (browser unlock) and mute via `toggleMute`. `assets.js` `audio: {}` is empty and `bgMusic` is not a real file.
- Files are in `assets/sounds/Sounds/` (44 MB of `.wav`). The game never plays anything today.
- Pot moves all pass through `transferItem` (`inventory.js`) or `Fox.dropSelected`; wedging ends in `Workbench.finishWedge`; dips in `dipPot` (`glaze_station.js`).

**How I bind it** — no sound calls scattered through gameplay. `assets.js` registers each file under a name; gameplay only fires events (`ItemMoved` from `transferItem`/drop, `PotGlazed` from `dipPot`, `PotCracked` from `Pottery.advance` and the owl's trim); the workbench loops/stops the wedge sound itself; one scene-owned `GameSounds` component (created in `Game`, dies with it) listens and calls `audioController.playSfx(name)`. `audioController` stays generic and gains `loopSfx(name)` and `stopSfx(name)`.

**Scope** — register the 21 used files; `GameSounds`; the event triggers; ambient loop switch Inside/Outside. **Out of scope** — other crack variants, fire LOOP, kick wheel, UI and unused variants; log/clay/model sounds; Start/End music; converting `.wav`.

**Flow**
1. Game starts Outside: Forest LOOP. Door to Inside: Workshop LOOP replaces it; back Outside swaps again.
2. Wedge held: the clay's wedging sound loops until release or completion. Pot picked up or put down: sound by pot stage/clay. Pot loaded into kiln: Fire 4. Dip: Glaze dipping 3 (first), 4 (second).

**Requirements**
1. Fox `x < 0` (Inside is at x ≈ -3200) loops Workshop, otherwise Forest; never both.
2. Wedge sound by clay (blue 2, red 3, brown 4) loops from the start of the hold, stops on release or when the wedge completes.
3. Pot = a `pot` item; clay, models and logs make no sound. Pickup = pot enters fox pack; putdown = leaves it (shelf, owl, kiln, or dropped with SPACE).
4. Wet or leather hard (unfired `thrown`, dryness < 1), by clay: pickup wet clay 2/3/4 and putdown wet clay 2/3/4 for blue/red/brown.
5. Bone dry (`thrown`, dryness 1): pickup pot 1, putdown pot 1.
6. Bisque (state `cooled`, or `glazed` = dipped but not yet fired): pickup pot 2, putdown pot 3.
7. Glazed (only `glazeCooled`, after leaving the glaze firing): pickup pot 3, putdown pot 2.
8. Pot into the kiln (bisque or glaze pass): Fire 4 only, no putdown sound.
9. Dip: pot's first glaze → glaze dipping 3; second → glaze dipping 4. Refused dips are silent.
10. A pot becoming cracked (kiln cooling finishes, or owl trim of a wet/bone-dry pot) plays pots crack big 2, once per pot, whatever the clay.
11. Mute button silences all; nothing plays before the first click/key.

**Acceptance criteria**
- [x] Forest loops Outside; door to Inside switches to Workshop and back, no overlap, no console "not in gameAssets" warnings.
- [x] Wedging blue/red/brown clay each plays a different sound.
- [x] Wet pot of each clay: pickup and putdown sounds differ by colour; bone dry, bisque and glazed each sound as listed.
- [x] Kiln load plays Fire 4 (bisque and glaze) and no putdown.
- [x] A pot cracking (wrong level, not bone dry, bad trim) plays crack big 2. (kiln path verified; owl-trim path is the same event, not run)
- [x] Wedge sound loops for the whole hold and stops on release.
- [x] A dipped, unfired pot still sounds bisque; only a glaze-fired pot sounds glazed.
- [x] Kick wheel loops while the owl works, then the putdown sound.
- [x] First dip 3, second dip 4; mute works.

12. While the owl throws or trims a pot the kick wheel loops; when he finishes it stops and the pot's putdown sound plays (a cracked trim also plays the crack).

**Constraints** — CraftyJS 0.9.0, plain scripts (add `components/game_sounds.js` to `index.html`); gameplay files only gain event triggers. Ambient volume `MUSIC_VOLUME`, sfx 1.0 (constants).

**Open questions** — None.

**Tasks**
- [x] Register the 21 files in `assets.js` (descriptive keys) and `index.html` script
- [x] Add `stopSfx`; add `ItemMoved` (transferItem + drop), `PotGlazed`, `PotCracked` triggers; workbench loops/stops wedge sound
- [x] Write `GameSounds` (item → sound-name maps, ambient switch) and create it in `Game`
- [x] Verify each acceptance check in the browser; update README Layout line

## Decisions
- Wedge sound → loops for the hold, start to finish.
- Format → keep `.wav`.
- Putdown bisque pot 3 / glazed pot 2 → as written.
- Owl handoffs, SPACE drop, kiln collect → all play pot sounds (default).
- Dipped-but-unfired pot → bisque sounds; glazed only after the glaze firing. Cracked pots use their stage's sound (default).
- Volumes → 0.25 loops, 1.0 sfx (default).
- Crack → pots crack big 2 for every cracked pot.
