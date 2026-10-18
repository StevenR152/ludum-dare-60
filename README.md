# Blind Master's Kiln (Ludum Dare 60)
Theme: Old Tech.

You're a young fox helping an old owl master potter who can't see anymore. He throws the pots; you do everything else. See the [game design doc](<Blind Master's Kiln — Game Design Doc (LD60).md>) for the full plan.

Built with [CraftyJS](http://craftyjs.com/api/) 0.9.0 (loaded from cdnjs).

## How to play
- Arrow keys or WASD walk the fox. On phones, touch and hold to walk toward your finger.
- Click a door you're standing at to move between Inside and Outside.
- Hold-click a clay square (Outside) while standing on it to dig a kilo into your inventory (2 slots, HUD top left). You carry clay or pots, never both. E picks a slot.
- Click the owl (Inside) to hand him the selected clay. He only takes it when he's idle, and throws a pot from it in 8s. Click him again to take the finished pot.
- Click the kiln (Outside) to load an unfired pot. It fires for 10s and cools for 10s; then click it again to collect the fired pot.
- SPACE (a tap on phones) drops the selected item. This is a testing aid.

## Run locally
Serve the folder over HTTP (asset loading fails from `file://`):

```
py -m http.server 8000
```

(`py` is the Windows launcher; use `python3` elsewhere.)

Then open http://localhost:8000.

## Layout
- `constants.js`: screen size, music track, credits list, pottery and kiln timings and colours
- `game_state.js`: per-run state (`seconds`), reset with `resetGameState()`
- `assets.js`: sprites and audio preloaded by the Loading scene
- `scenes/`: Loading, Start, Game (Inside and Outside areas with the owl, kiln, doors and clay), End
- `components/`:
  - Gameplay: `Potter` (the owl throwing pots), `Kiln` (empty, firing, cooling, ready), `Inventory` (plain class: fixed capacity, one item type at a time, `transferItem(from, to)` moves items; fox, owl and kiln each own one and every change triggers `InventoryChanged`), `InventoryHud` (HUD strip showing the fox's inventory), `TimeClickable` (measures how long it's held, then fires `TimeClicked`)
  - Shared: `AudioController` (global `audioController`), `MuteButton`, `GameTimer`, `PlayerNotification` (`Crafty.trigger("InstructionText", msg)`), `UIButton` (named so it doesn't replace Crafty's built-in `Button`), `CreditsText`
- `camera.js`: `makeCameraTrackEntity(entity, yOffset)`
- `mobile/`: `TouchControls`, gesture controls for phones (touch and hold to walk toward the finger, tap for SPACE); see `mobile/README.md`
- `PRD/`: product requirement docs, one per feature (door teleport, owl pottery, kiln firing, mobile controls)
- `analytics.js`: `track(event, params)`, a no-op until the GA4 snippet in `index.html` is enabled

Give an entity the `HUD` component to keep it fixed on screen while the camera moves.

## Deploy
Every push is synced by CircleCI to `s3://ludum-dare-60/<branch>/`, so `main` is served at `/main/index.html`.

CircleCI needs `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION` set on the project, and the `ludum-dare-60` bucket must exist with public static hosting.

## Useful links
- [https://codeshack.io/images-sprite-sheet-generator/](https://codeshack.io/images-sprite-sheet-generator/)
