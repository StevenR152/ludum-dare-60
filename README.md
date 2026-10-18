# Blind Master's Kiln (Ludum Dare 60)
Theme: Old Tech.

You're a young fox helping an old owl master potter who can't see anymore. He throws the pots; you do everything else. See the [game design doc](<Blind Master's Kiln — Game Design Doc (LD60).md>) for the full plan.

Built with [CraftyJS](http://craftyjs.com/api/) 0.9.0 (loaded from cdnjs).

## How to play
- Arrow keys or WASD walk the fox. On phones, touch and hold to walk toward your finger.
- Click a door you're standing at to move between Inside and Outside.
- Hold-click a clay square (Outside) while standing on it to dig a kilo (1000 g) into your inventory (2 slots, HUD top left). You carry any 2 items in any mix (2 dug clays, a weighed piece and a model, 2 pots...). E picks a slot.
- Hold-click the workbench (Inside) for 3s while standing on it to wedge the selected kilo onto the bench. Kilos of the same clay add up in one pile; different clays sit side by side (e.g. 1000 g blue and 800 g red).
- Click the scales on the workbench to open a panel, choose a clay and the grams (up to what's in that pile) and press Weigh. A piece is always one clay. The weighed piece (white outline) goes in your pack; the rest stays on the bench.
- Click a model on the workbench (Small/Medium/Large Bowl, Cup or Vase) to carry it.
- Click the owl (Inside) with weighed clay and a model. He takes them only when the clay weighs what the order list says that shape and size needs, and throws that pot in 8s. The model goes back to the bench. Click him again to take the finished pot. He holds up to 5 things (clay, models, pots) and does one job at a time, the first given first.
- A thrown pot is wet. It dries to leather hard (LH) and then bone dry, fastest on the drying shelf and 3x slower anywhere else (not at all in the kiln). Heavier pots take longer: on the shelf a 200 g cup is leather hard after 18 s and bone dry after 3 minutes, a 1500 g vase after 50 s and 8 min 25 s. A bar under the pot (shelf and HUD) shows how far it has got.
- Click the drying shelf (Inside) to put the selected unfired pot on it (3 places), or to take the driest pot off, at any stage.
- Give the owl a leather-hard pot to trim it (5s). A wet pot collapses and a bone-dry one cracks. A trimmed pot has a solid green border and an untrimmed one a dashed orange border (in your pack, on the shelf, on the owl and in the kiln); untrimmed pots can still be fired.
- Click the kiln (Outside) to load an unfired pot. Only a bone-dry pot survives the firing; any other cracks, which you see when it has cooled.
- Optionally click the glaze buckets (Inside) to dip a fired pot: yellow, red, or both in either order, once each.
- Every pot, glazed or not, goes back in the kiln for a second (glaze) firing.
- Click the completed shelf (Inside) to put a twice-fired pot on it. Three completed pots end the game.
- Each clay needs its own firing level: brown low, red mid, blue high. A pot fired at any other level cracks when it cools. Every spoilt pot (too wet or too dry to trim, not bone dry in the kiln, wrong level) is cracked and drawn with a black cross.
- Click the completed shelf (Inside) to put a fired pot on it. Cracked pots are refused. Three completed pots end the game.
- Hold on the forest (Outside, left) for 1s to chop a log (carry 2). Click the kiln to load logs (it holds 3) and pots (it fires up to 4 at once), in either order, then click the torch beside the kiln: 1, 2 or 3 logs make a low, mid or high fire. It fires for 10s and cools for 10s; then click the kiln again to collect the fired pots, one per click. The pots fire together at one level, so a mixed batch cracks the pots whose clay needs another level. Clicking with a pot when the kiln is full or lit says so.
- Click the completed shelf (Inside) to put a fired pot on it. Three completed pots end the game.
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
  - Gameplay: `Potter` (the owl throwing and trimming pots, one job at a time), `Kiln` (empty, firing, cooling, ready; a bisque and a glaze firing per pot), `Pottery` (plain class: clay from dig to shelf, with `clay`, `pot` and a `state` that only advances along `POTTERY_STATES`; `advance(to)` refuses skips unless the states skipped are `optional`; `weighOut(grams)` splits weighed clay off a wedged pile), `Inventory` (plain class: fixed capacity, one item type at a time unless a `fits` rule says otherwise, `transferItem(from, to)` moves items; fox, owl and kiln each own one and every change triggers `InventoryChanged`), `GameHud` (owns the whole Game HUD: panel, music button, timer and inventory rows; `enable(false)` hides it all), `InventoryHud` (HUD row: a label and the slots of the inventories it shows; the game has Fox, Master and Kiln rows), `Workbench` (hold to wedge clay onto its pile; holds the `Scales` with their weighing slider and the models), `Shelf` (base: a zone square with an inventory and a box per slot), `DryingShelf` and `CompletedShelf` (built on it), `PotDrier` (dries unfired pots by where they are), `DryBar` (the wet—LH—dry bar), `TimeClickable` (measures how long it's held, then fires `TimeClicked`)
  - Gameplay: `OrderPanel` (customer orders in the top right, one every 2 min), `GlazeStation` (glaze buckets: click to dip a fired pot), `Potter` (the owl throwing pots), `Kiln` (empty, firing, cooling, ready), `InventorySlot` (HUD view of `gameState.heldItem`, refreshed by `Crafty.trigger("InventoryChanged")`), `TimeClickable` (measures how long it's held, then fires `TimeClicked`)
  - Shared: `AudioController` (global `audioController`; music, one-shot and looped effects, mute), `GameSounds` (Game scene: maps `ItemMoved`, `PotGlazed` and `PotCracked` events to sounds), `MuteButton`, `GameTimer`, `PlayerNotification` (`Crafty.trigger("InstructionText", msg)`), `UIButton` (named so it doesn't replace Crafty's built-in `Button`), `CreditsText`
- `camera.js`: `makeCameraTrackEntity(entity, yOffset)`
- `mobile/`: `TouchControls`, gesture controls for phones (touch and hold to walk toward the finger, tap for SPACE); see `mobile/README.md`
- `PRD/`: product requirement docs, one per feature (door teleport, owl pottery, kiln firing, mobile controls, customer orders)
- `analytics.js`: `track(event, params)`, a no-op until the GA4 snippet in `index.html` is enabled

Give an entity the `HUD` component to keep it fixed on screen while the camera moves.

## Deploy
Every push is synced by CircleCI to `s3://ludum-dare-60/<branch>/`, so `main` is served at `/main/index.html`.

CircleCI needs `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION` set on the project, and the `ludum-dare-60` bucket must exist with public static hosting.

## Useful links
- [https://codeshack.io/images-sprite-sheet-generator/](https://codeshack.io/images-sprite-sheet-generator/)
