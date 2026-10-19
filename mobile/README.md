# TouchControls for Crafty

Gesture controls for [Crafty](http://craftyjs.com/) 0.9 games on phones. Taps, swipes and touch-and-hold become Crafty key presses, so a keyboard game plays on a touch screen without changing its movement or input code. There are no on-screen pads or buttons.

It runs only on touch screens (`(pointer: coarse)`, or on the first touch). Desktop players get the page exactly as before. Add `?touch=1` to the URL to try it with a mouse.

## Use

Load the files after Crafty, then call `init` once after `Crafty.init`:

```html
<link rel="stylesheet" href="mobile/touch-controls.css">
<script src="mobile/touch-controls.js"></script>
```

```js
// Top-down: walk toward the finger, tap for an action.
TouchControls.init({
    holdToward: {},
    tap: "SPACE",
    scenes: ["Game"]
});
// In the scene that creates the player:
TouchControls.follow(player);

// Platformer: hold a side to run, tap to jump.
TouchControls.init({
    holdSides: { left: "LEFT_ARROW", right: "RIGHT_ARROW" },
    tap: "UP_ARROW"
});
```

Give page chrome that only makes sense with a keyboard (titles, "Arrow keys to move") the class `touch-hide`, and it is hidden on touch screens.

## Options

Key names are [`Crafty.keys`](http://craftyjs.com/api/Crafty-keys.html) names, so a gesture maps to whatever key the game already reads. Several gestures can be on at once.

| Option | Gesture | Default |
| --- | --- | --- |
| `tap: "SPACE"` | A touch under 250 ms that moves under 10 px presses and releases the key once | off |
| `swipe: {up, down, left, right}` | A touch that moves 30 px within 300 ms presses the key for its larger axis once | off |
| `holdSides: {left, right}` | Holds the key while a finger is down on that half of the screen | off |
| `holdToward: {entity, keys, deadZone}` | Holds the keys pointing from the entity's centre to the first finger down, in 8 directions, until the finger lifts or the entity is within `deadZone` px | arrow keys, 10 px |
| `scenes: ["Game"]` | Scenes gestures run on; `null` for every scene | `["Game"]` |
| `fitPage: true` | Locks the page for touch (below) | `true` |

Each finger is tracked on its own, so gestures combine: hold to move with one thumb and tap with the other. Only the first finger down steers hold-toward.

Pressed keys are released when the finger lifts, the browser cancels the touch, the page is hidden, the window loses focus, the game pauses or the scene changes. A tap or swipe keeps its key down for one frame, so games that poll `isKeyDown` see it as well as `KeyDown` bindings.

Touches that start on a `Mouse` entity (menus, mute buttons) or on a link or form field are left alone, so Crafty's own tap-to-click keeps working.

## API

| Call | Does |
| --- | --- |
| `TouchControls.init(options)` | Turns on the chosen gestures, and the page fitting on touch screens |
| `TouchControls.isActive()` | `true` once the touch layer is on, e.g. to show "Touch and hold to move" |
| `TouchControls.follow(entity)` | Points hold-toward at a new entity |
| `TouchControls.enable()` / `.disable()` | Turns gestures on or off in the current scene, until the scene changes |

`TouchControls` is an alias for the Crafty system `Crafty.s("TouchControls")`.

### Events

| Event | Data |
| --- | --- |
| `TouchTap` | `{clientX, clientY}` |
| `TouchSwipe` | `{direction, clientX, clientY}`, `direction` is `"up"`, `"down"`, `"left"` or `"right"` |

## Page fitting

With `fitPage` on, a touch screen gets:

- **Scaling is the game's job.** TouchControls doesn't zoom the page. Fit the stage with `Crafty.viewport.scale` and a resize handler (LD60: `fitScreenToWindow` in `camera.js`), with `<meta name="viewport" content="width=device-width, initial-scale=1">` in the page. A viewport meta rewrite would be ignored inside iframes such as itch.io's, and CSS transforms would put taps in the wrong place, because Crafty doesn't account for them. On resize TouchControls re-measures the stage and resizes the touch rings.
- **No scrolling or zooming:** `touch-action: none`, no text selection or long-press menu.
- **Safe areas:** no `viewport-fit=cover`, so the browser keeps the page clear of notches and home bars itself.
- **Whole page as touch area**, including the letterboxed space around the game.

## Tests and demo

- `tests/index.html`: QUnit tests that send fake pointer events and check `isKeyDown`. Serve this folder over HTTP and open it.
- `demo.html`: a small platformer using hold-a-side and tap.

## Licence

MIT, Copyright (c) 2026 Steven Rutherford.
