# Blind Master's Kiln (Ludum Dare 60)
Theme: Old Tech.

You're a young fox helping an old owl master potter who can't see anymore. He throws the pots; you do everything else. See the [game design doc](<Blind Master's Kiln — Game Design Doc (LD60).md>) for the full plan.

Built with [CraftyJS](http://craftyjs.com/api/) 0.9.0 (loaded from cdnjs).

## How to play
- Start offers two ways to play the same three levels. **Play** runs them as one game: each unlocking more of the world when its fixed orders are done. Stage 1 (Kiln Creations) is outside only: fire three pots lying by the kiln twice each (black low/1 log, red mid/2, white high/3); a pot taken out after its second firing fills its order, then the house door appears. Stage 2 (Pottery Craft) makes one black cup from digging to the completed shelf, then the glaze station and red and white clay appear. Stage 3 (First Orders) delivers four glazed cups, one dip per pot, then the game ends. between levels the fox stays where it is and the time keeps counting, but the pack, kiln and ground items start empty. **Levels** opens a list to play any one level alone (level 2 and 3 unlock when the one before is completed in either mode; `UNLOCK_ALL_LEVELS` in `constants.js` opens them all), ending on a Level complete screen. In both, a Goal box lists the steps, Restart rebuilds the current level, Menu leaves (to Start, or to the level list) (a cracked pot says so: restart), and pots lying on the ground take no damage.
- Arrow keys or WASD walk the fox. On phones, touch and hold to walk toward your finger.
- SPACE (a tap on phones) does what a click does on the thing the fox is touching, the nearest one first; hold it to dig, wedge or chop. BACKSPACE (swipe down on phones) drops the selected item.
- Click a door you're standing at to move between Inside and Outside.
- Click or tap the ground to walk there: the fox stops when its feet reach the spot, and the spot follows the cursor while you hold the button. Click a station that is out of reach (kiln, owl, shelves, clay...) to walk to it and stop where it touches; click again to use it. If you are still holding the button when the fox arrives, the station acts then (dig, wedge, chop), and a release before arrival does nothing. Arrow keys or WASD cancel the walk; a wall stops it at once. On phones touch-and-hold stays the way to walk.
- The fox can't walk onto ground painted out-of-bounds (the map's edges, walls, anything you paint on the masks): it stops, and slides along the edge if you keep pushing diagonally. Dropped items land on clear ground too.
- Things you click in the world (doors, owl, kiln, shelves...) act the moment you press the button or touch, not when you let go. Menu buttons still act on release.
- Hold-click a clay square (Outside) while standing on it to dig a kilo (1000 g) into your inventory (2 slots, HUD top left). You carry any 2 items in any mix (2 dug clays, a weighed piece and a model, 2 pots...). E picks a slot.
- Click the purple weighing station (Inside) with a dug kilo selected to put it on the scales. Kilos of the same clay add up in one pile; different clays sit side by side (e.g. 1000 g white and 800 g red).
- Click the weighing station with anything else selected to open a panel, choose a clay and the grams (up to what's in that pile) and press Weigh. A piece is always one clay. The weighed piece goes in your pack; the rest stays on the scales.
- Hold-click the workbench (Inside) for 3s while standing on it with the weighed piece selected to wedge it. Wedged clay has a white outline.
- Click a model on the workbench (Small/Medium/Large Bowl, Cup or Vase) to carry it.
- Click the owl (Inside) with wedged clay and a model. He takes them only when the clay is wedged and weighs what the order list says that shape needs, and throws that pot in 8s. The model goes back to the bench. Click him again to take the finished pot. He holds up to 5 things (clay, models, pots) and does one job at a time, the first given first.
- A thrown pot is wet. It dries to leather hard (LH) and then bone dry, fastest on the drying shelf and 3x slower anywhere else (not at all in the kiln). Heavier pots take longer: on the shelf a 200 g cup is leather hard after 1.2 s and bone dry after 12 s, a 500 g bowl or vase after 1.7 s and 17 s. A bar under the pot (shelf and HUD) shows how far it has got.
- Click the drying shelf (Inside) to put the selected unfired pot on it (3 places), or to take the driest pot off, at any stage.
- Give the owl a leather-hard pot to trim it (5s). A wet pot collapses and a bone-dry one cracks. A trimmed pot has a solid green border and an untrimmed one a dashed orange border (in your pack, on the shelf, on the owl and in the kiln); untrimmed pots can still be fired.
- Click the kiln (Outside) to load an unfired pot. Only a bone-dry pot survives the firing; any other cracks, which you see when it has cooled.
- Optionally click the glaze buckets (Inside) to dip a fired pot: orange, pink, or both in either order, once each.
- Every pot, glazed or not, goes back in the kiln for a second (glaze) firing.
- Click the completed shelf (Inside) to put a finished pot on it (3 places). A pot that matches an open order (shape, clay, glaze order) is delivered at once: the ticket turns green and scores 50 points (30 if more than half the order time has gone). Otherwise the pot waits; click the shelf with an empty pack to take one back. Orders that run out of time turn red and cost 10 (cup), 20 (vase) or 25 (bowl). Three delivered orders end the game.
- Each clay needs its own firing level for the first (bisque) firing: black low, red mid, white high. A pot bisque-fired at any other level cracks when it cools; the glaze firing can be at any level. Every spoilt pot (too wet or too dry to trim, not bone dry in the kiln, wrong level) is cracked and drawn with a black cross.
- Hold on the forest (Outside, left) for 1s to chop a log (carry 2). Click the kiln to load logs (it holds 3) and pots (it fires up to 4 at once), in either order, then click the torch beside the kiln: 1, 2 or 3 logs make a low, mid or high fire. It fires for 2s and cools for 2s; then click the kiln again to collect the fired pots, one per click. The pots fire together at one level, so a mixed batch cracks the pots whose clay needs another level. Clicking with a pot when the kiln is full or lit says so.
- BACKSPACE (swipe down on phones) at the workbench puts a carried model back on the bench; on a dug clay patch it uses up clay of that patch's colour (dug, wedged, weighed, or a thrown unfired pot of it) and cuts half of the patch's respawn time. Elsewhere it drops the selected item on the ground where the fox stands, and a heavy or slowed fox may stumble and drop one. Click a dropped item while touching it to pick it up. Each dropped item the fox overlaps halves its speed (they multiply). The first time the fox walks onto a dropped pot, it may take damage: 99% chance if unfired, 75% once fired, 50% once glaze-fired. One hit cracks it, three destroy it. Clay, logs and models never break. Dropped pots keep drying, as slowly as in your pack.

## Out-of-bounds masks
Each area has a mask picture, `assets/images/mask_outside.png` and `mask_inside.png`, the same shape as its background. Opaque pixels (alpha 128 or more) are blocked, transparent ones walkable, and anything outside both areas is blocked. Paint them in any image editor (any resolution with the same aspect ratio), save over the PNG and reload. Set `DEBUG_HITBOXES = true` in `constants.js` to see everything the game treats as blocked in red at a fixed 50% opacity (`DEBUG_MASK_ALPHA`, whatever opacity the PNGs are painted at) over the game, with the red outlines on top.
- The shipped masks are placeholders: a 12 px opaque border around each area.
- Only the fox's feet (`FOX_FEET_BOX`) are checked, so its head can overlap a wall.
- Where the fox appears after each door is `DOOR_DESTINATIONS` in `constants.js`. Pick spots on clear ground, away from both doors; the console warns if one is blocked or touches a door. An optional `facing: "right"` or `"left"` on a spot forces which way the fox looks on arrival (the one into Inside faces right). With `DEBUG_HITBOXES` on, each spot is drawn as a lime green box (`DEBUG_DESTINATION_COLOR`) the size of the fox, labelled "to inside" / "to outside".
- In code: `COLLISION_AREAS` and the other `COLLISION_*` constants in `constants.js`, `collisionMap` in `components/collision_map.js`, `Fox.keepInBounds`, `DroppedItem.dropFrom`.

## Clay and wood
Each clay needs its own fire level, and the fire level is set by how many logs go in the kiln (the torch burns them all):

| Clay  | Fire level | Logs (wood) |
|-------|------------|-------------|
| Black | low        | 1           |
| Red   | mid        | 2           |
| White | high       | 3           |

- The kiln holds at most 3 logs and the fox carries 2, so a high fire takes two trips to the forest.
- A pot fired at any other level than its clay's cracks when it cools. All pots in one firing share a level, so a mixed batch cracks the ones that need another level.
- Only the first (bisque) firing is checked against the clay. The glaze firing needs at least 1 log but any level is fine.
- In code: `fireLevel` per clay in `constants.js` (`CLAY_TYPES`), `KILN_FIRE_LEVELS` (index + 1 = logs), `KILN_WOOD_CAPACITY`.

## How drying works
A thrown pot has a dryness from 0 (wet) to 1 (bone dry). It is leather hard (LH) from 10% dryness, and only then can the owl trim it.

- Time to bone dry on the drying shelf: `DRY_BASE_MS` (8.7 s) + `DRY_MS_PER_GRAM` (0.017 s) per gram of clay. So a 200 g cup takes 12 s, a 500 g bowl or vase 17 s. Leather hard comes at 10% of that.
- Anywhere else (your pack, the owl's hands, the ground) it dries `OFF_SHELF_SLOWDOWN` (3x) slower.
- In the kiln it doesn't dry at all, so the dryness it goes in with is the dryness it fires at.
- Only a bone-dry pot survives its firing; a damper one cracks. A wet pot collapses if trimmed and a bone-dry one cracks.
- A bar under the pot (shelf and HUD) shows the progress, with a tick at leather hard.
- In code: `Pottery.dry()` in `components/pottery.js`, `PotDrier` in `components/drying_shelf.js`, constants in `constants.js`.

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
- `scenes/`: Loading, Start, LevelSelect and LevelComplete, Game (one scene, rebuilt per level, in progressive or single mode; `levels.js` holds the `LEVELS` table: each a `buildWorld` config plus fixed orders; `buildWorld(config)` is in `game.js`), End
- `components/`:
  - Gameplay: `Potter` (the owl throwing and trimming pots, one job at a time), `Kiln` (empty, firing, cooling, ready; a bisque and a glaze firing per pot), `Pottery` (plain class: clay from dig to shelf, with `clay`, `pot` and a `state` that only advances along `POTTERY_STATES`; `advance(to)` refuses skips unless the states skipped are `optional`; `weighOut(grams)` splits weighed clay off a dug pile), `Inventory` (plain class: fixed capacity, one item type at a time unless a `fits` rule says otherwise, `transferItem(from, to)` moves items; fox, owl and kiln each own one and every change triggers `InventoryChanged`), `GameHud` (owns the whole Game HUD: panel, music button, timer and inventory rows; `enable(false)` hides it all), `InventoryHud` (HUD row: a label and the slots of the inventories it shows; the game has Fox, Master and Kiln rows), `WeighingStation` (the purple rectangle: piles of dug clay and the weighing slider), `Workbench` (hold to wedge weighed clay; holds the models), `Shelf` (base: a zone square with an inventory and a box per slot), `DryingShelf` and `CompletedShelf` (built on it), `PotDrier` (dries unfired pots by where they are), `DryBar` (the wet—LH—dry bar), `TimeClickable` (measures how long it's held, then fires `TimeClicked`)
  - Gameplay: `OrderPanel` (customer orders in the top right, one every 2 min), `GlazeStation` (glaze buckets: click to dip a fired pot), `Potter` (the owl throwing pots), `Kiln` (empty, firing, cooling, ready), `InventorySlot` (HUD view of `gameState.heldItem`, refreshed by `Crafty.trigger("InventoryChanged")`), `TimeClickable` (measures how long it's held, then fires `TimeClicked`)
  - Shared: `AudioController` (global `audioController`; music, one-shot and looped effects, mute), `GameSounds` (Game scene: maps `ItemMoved`, `PotGlazed` and `PotCracked` events to sounds), `MuteButton`, `GameTimer`, `PlayerNotification` (shows `showStatus(msg)` above the fox), `UIButton` (named so it doesn't replace Crafty's built-in `Button`), `CreditsText`
- `components/collision_map.js`: `collisionMap`, the out-of-bounds lookup read from the mask PNGs in `assets/images/`
- `camera.js`: `makeCameraTrackEntity(entity, yOffset)`
- `mobile/`: `TouchControls`, gesture controls for phones (touch and hold to walk toward the finger, tap for SPACE, swipe down for BACKSPACE); see `mobile/README.md`
- `PRD/`: product requirement docs, one per feature (door teleport, owl pottery, kiln firing, mobile controls, customer orders)
- `analytics.js`: `track(event, params)`, a no-op until the GA4 snippet in `index.html` is enabled

Give an entity the `HUD` component to keep it fixed on screen while the camera moves.

## Deploy
Every push is synced by CircleCI to `s3://ludum-dare-60/<branch>/`, so `main` is served at `/main/index.html`.

CircleCI needs `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION` set on the project, and the `ludum-dare-60` bucket must exist with public static hosting.

## Useful links
- [https://codeshack.io/images-sprite-sheet-generator/](https://codeshack.io/images-sprite-sheet-generator/)
