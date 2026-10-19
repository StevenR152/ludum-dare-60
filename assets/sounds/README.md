Directory for sound files. Registered in `assets.js` (`audio{}`), played by `components/game_sounds.js`.

Numbered takes: the lowest number is used; the others are spare.

## Not played yet (no entity/event for them)
- `order succes 2`, `order succes 4`: only one success and one failed sound are needed.
- `pots crack small 1-4`: no small-crack event (every crack plays `pots crack big 2`).
- `glaze dipping 1-2`, `glaze dipping END 1-4`: no end-of-dip event.
- `owl 1-4`, `fox 1-2`: no voice/greeting event.
- `fire 1-3`, `fire 5-7`: the kiln has no stage events beyond lit (fire 4) and firing (fire LOOP).
- Spare takes: `wedging clay 1`, `wedging LOOP`, `pickup/putdown wet clay 1`, `pickup/putdown pot 4`,
  `pots crack big 1,3,4`, `dig 2-3`, `door 2-3`, `harvest wood 2-3`, `drop wood 2-3`, `weigh scale 2-3`.
- `music/ld60 test 2 LOOP.ogg`, `music/too dramatic LOOP.ogg`: spare tracks (`theme test 1` is `bgMusic`).
- `pottery kick wheel LOOP.wav.asd`: DAW file, not audio.
