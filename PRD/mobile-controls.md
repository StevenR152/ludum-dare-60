# Mobile Controls for Crafty Games (PRD)

Oct 16, 2026 · @Steve

## Problem

On a phone, any of these games that moves with arrow keys can't be played: there is no keyboard, and nothing on screen stands in for one. Players on itch.io and ldjam.com often open entries on their phones, so those visits end at the title screen.

Taps already work. Crafty 0.9 turns a single touch into mouse events, so Play, Mute and other clickable entities respond. What fails is **held input**: walking, jumping and anything read through `Fourway`, `Twoway`, `Multiway`, `isKeyDown` or a `KeyDown` binding.

The page also isn't built for phones. A 1152×768 game is shown at desktop size, the page scrolls and zooms under your fingers, and the title and instructions take up screen space.

LD45 got part of the way with tap zones and on-screen arrows. Those sent a game-specific `UserAction` event once per tap, which suits a step-per-tap puzzle but not held movement, and the code was tied to that one game.

## Goals and non-goals

**Goals**

- A keyboard game becomes playable on a phone without changing its movement or input code.
- Controls are gestures players already know from mobile games (tap, swipe, touch and hold), not on-screen pads or sticks.
- Works in portrait and landscape on current iPhone Safari and Android Chrome.
- Desktop players see and get exactly what they get today.
- Built as a standalone Crafty extension in `mobile/`, written so it can later move to its own repo, be published, and be offered to Crafty.
- LD60 is the only game wired up in this branch.

**Non-goals**

- On-screen d-pads, virtual joysticks and on-screen action buttons.
- Porting LD44–48. That can come later, once the extension has been proven on LD60.
- Tilt controls, gamepad support, a native app wrapper, or PWA install.
- Fullscreen mode. iPhone Safari doesn't allow it for page elements, so it can't be relied on.

## What mobile players expect

No single control scheme wins on mobile. Players expect controls that match the genre, and for 2D jam-sized games that means taps, swipes and touch-and-hold rather than an on-screen pad.

| Scheme | What the player does | Familiar from | Fits |
| --- | --- | --- | --- |
| Tap | Tap anywhere for one action | One-button and auto-runner games | Jump, fire, confirm |
| Tap on an object | Tap the thing to use it | Puzzle, strategy, point-and-click | Selecting, collecting, menus |
| Swipe | Flick up, down, left or right for one move | Endless runners (lane change, jump, slide), grid puzzles | Discrete steps and dodges |
| Hold a side | Hold the left or right half of the screen to run that way | Simplified platformers and auto-runners | Left/right movement |
| Hold toward a point | Keep a finger down and the character walks toward it | Casual top-down games, auto-pathing in RPGs | Free movement without a stick |

Genre fit is from a cross-platform controls guide ([source](https://www.abratabia.com/game-controls/best-mobile-controls.php)). It also notes that porting desktop controls by adding a virtual d-pad is the most common mobile web game mistake.

Apple's game guidelines point the same way ([source](https://developer.apple.com/design/human-interface-guidelines/game-controls)):

- Let players touch game elements directly, and use gestures instead of extra on-screen controls where possible.
- Players expect movement on the left side of the screen. Use as large an area as possible for it, not a fixed spot.
- Show a visible press state that can be seen even under the finger.
- Keep touch targets at least 44×44 pt.

The controls guide adds that feedback should land within one frame (about 16 ms), since 50 ms already feels slow. Swipes should stick to four directions and be recognised generously, so a sloppy diagonal still counts. The most successful games also offer more than one scheme, so a game here can turn on several at once.

## What Crafty 0.9 already handles

Crafty is missing one thing: a way to *hold* a key without a keyboard. Everything else this extension needs is already there, as I found by reading the 0.9.0 source.

| Area | Crafty 0.9 today | What it means for us |
| --- | --- | --- |
| Taps on entities | One finger's touch is turned into `mousedown` / `mouseup` / `click` on the stage | `Mouse` entities such as Play, Mute and menus already work on phones |
| Several fingers | Only with `Crafty.multitouch(true)`, and then entities need `Touch` instead of `Mouse`, which breaks existing click handlers | Leave it off. The gesture layer tracks its own fingers with Pointer Events, outside Crafty |
| Movement | `Fourway`, `Twoway` and `Multiway` read an internal direction state that only key events update | This is the gap |
| Fake key presses | `Crafty.s('Keyboard').triggerKey('KeyDown', {key: Crafty.keys.RIGHT_ARROW})`, documented and public | One call per press and release drives movement, `isKeyDown` and `KeyDown` bindings |
| Stuck keys | Held keys are released when the window loses focus or the game pauses | Virtual keys go through the same system, so they are released too |
| Phone detection | `Crafty.mobile` checks the browser name, and misses iPads that report as desktop Safari | Use the browser's touch-screen check instead |
| Page scrolling | Blocked only on the stage, and only when Crafty converts a touch | The page needs its own CSS to stop scrolling and zooming |
| Tap positions | Crafty works out where a tap landed from the stage's on-page position, ignoring CSS scaling | Don't shrink the game with CSS `transform`; fit it with the page's viewport setting |

One finding affects the baseline already on `main`. It defines a `Button` component, which silently replaces Crafty's own built-in `Button`. This branch renames ours to `UIButton`.

## Proposed design

*(The source doc has a diagram here: input paths, with the new controls joining the existing key path.)*

The extension, `TouchControls`, listens for touches anywhere on the page, recognises four familiar gestures, and turns each into Crafty key presses with `triggerKey`. The game can't tell a gesture from a key, so none of its code changes. There are no on-screen pads or buttons.

| Gesture | Option | Keys it presses | Example use |
| --- | --- | --- | --- |
| Tap | `tap: "SPACE"` | Pressed and released once | Jump, fire, confirm |
| Swipe | `swipe: {up: "UP_ARROW", down: …}` | Pressed and released once per swipe | Grid step, lane change |
| Hold a side | `holdSides: {left: "LEFT_ARROW", right: "RIGHT_ARROW"}` | Held while a finger is down on that half of the screen | Platformer running |
| Hold toward | `holdToward: {entity: player}` | Arrow keys pointing from the entity to the finger, held until the finger lifts or the entity arrives | Top-down movement (LD60) |

- **Fingers:** Pointer Events, each finger tracked separately, so gestures combine. For example, hold the left side to run while tapping with the other thumb to jump.
- **Recognition:** a touch shorter than 250 ms that moves less than 10 px is a tap. One that moves more than 30 px within 300 ms is a swipe, in the direction of its larger axis. These are starting values to tune on real phones.
- **Hold toward:** the direction is measured from the entity's on-screen centre to the finger, every frame, in 8 directions (a diagonal holds two arrows). It stops inside a small dead zone so the character doesn't jitter on arrival.
- **Release:** every key a finger holds is released when it lifts, the browser cancels the touch, the page is hidden or the scene changes. No key can stay stuck down.
- **UI stays clickable:** a touch that starts on a clickable Crafty entity, such as Mute, is left to Crafty. Gestures only run on the scenes listed in `init` (default `['Game']`).
- **Feedback:** a faint ring appears under each finger within the same frame, and a short arrow flashes on a swipe.
- **Whole screen:** the whole page is the touch area, including the space below the game in portrait.
- **Events too:** it also fires Crafty events (`TouchTap`, `TouchSwipe` with a `direction`) for games that want gestures without keys.
- **When it runs:** only on touch screens (`matchMedia('(pointer: coarse)')`, or on the first touch). Adding `?touch=1` to the URL forces it on, so it can be tried with a mouse.

## Integration API

A game opts in with a stylesheet, a script after Crafty, and one `init` call after `Crafty.init`:

```html
<link rel="stylesheet" href="mobile/touch-controls.css">
<script src="mobile/touch-controls.js"></script>
```

```js
// LD60: walk toward the finger, tap for an action.
TouchControls.init({
    holdToward: { entity: player },
    tap: "SPACE",
    scenes: ["Game"]
});

// A platformer instead: hold a side to run, tap to jump.
TouchControls.init({
    holdSides: { left: "LEFT_ARROW", right: "RIGHT_ARROW" },
    tap: "UP_ARROW"
});
```

| Call | Does |
| --- | --- |
| `TouchControls.init(options)` | Turns on the chosen gestures and the page fitting below |
| `TouchControls.isActive()` | `true` on touch devices, so a game can swap "Arrow keys to move" for "Touch and hold to move" |
| `TouchControls.follow(entity)` | Points hold-toward at a new entity, since each Game scene creates a new player |
| `TouchControls.enable()` / `.disable()` | Manual override for a game that switches modes inside one scene |

Key names are `Crafty.keys` names (`LEFT_ARROW`, `SPACE`, `Z`), so a gesture maps to whatever key the game already reads. Hold-toward presses the arrow keys by default; a WASD game passes `keys: {up: "W", left: "A", down: "S", right: "D"}`.

## Built to become a Crafty module

The folder is written so it can later move to its own repo, be published, and be offered to Crafty without a rewrite.

- **Crafty's own shape:** a Crafty system, `Crafty.s("TouchControls")`, with `TouchControls` as a short alias. Browser listeners go through `Crafty.addEvent`, and gestures are announced as Crafty events.
- **No game coupling:** nothing reads LD60's globals (`audioController`, `GAME_SCREEN_WIDTH`). Everything comes from `init` options, `Crafty.viewport` and `Crafty.stage`.
- **Crafty's code style:** ES5 (`var`, no arrow functions), matching Crafty's source and its jshint rules, with `/**@` doc comments in Crafty's API-doc format.
- **Tests:** QUnit tests in `mobile/tests/`, laid out like Crafty's own `tests/` folder, that send fake pointer events and check `isKeyDown`.
- **Self-contained:** one JS file and one CSS file, an MIT licence header, and a `README.md` with the options and a demo page.

Crafty's GitHub repository has had no commits since December 2018 ([source](https://github.com/craftyjs/Crafty)), so a pull request may sit unreviewed. The realistic route is to publish it on npm and list it as a Crafty community module, then open a pull request against Crafty's `develop` branch as well.

## Fitting the page to a phone

The game is fitted to the phone by the browser's own page zoom, not by CSS scaling. CSS `transform` would put taps in the wrong place, because Crafty doesn't account for it.

- **Viewport:** on touch devices the script sets the page's viewport `width` so the whole 1152×768 game is visible, and recomputes it on rotation. The browser scales the page down, and Crafty's tap positions stay correct because they are in page pixels.
- **Landscape:** the game fills the screen height, with the viewport width set to `max(game width, game height × screen aspect ratio)`.
- **Portrait:** the game spans the full screen width, about a third of the screen tall on a typical phone. The space below it stays part of the touch area, so thumbs play there without covering the game.
- **Notches and home bars:** the game is kept inside the phone's safe area using the browser's `safe-area-inset` values.
- **No scrolling or zooming:** `touch-action: none` on the page while touch controls are on, no double-tap zoom, no text selection, and no long-press callout menu.
- **Page chrome:** on touch devices the `<h2>` title and the instructions panel are hidden. The instructions stay for desktop.
- **Audio:** nothing new. The baseline's `AudioController` already starts music on the first `pointerdown`, and a touch on a phone sends one.

## Acceptance criteria and testing

| # | Criterion | How it's tested |
| --- | --- | --- |
| 1 | Desktop is unchanged: no touch layer, same layout, keys work | Browser pane at desktop size, keys driven by script |
| 2 | Holding a finger to one side of the LD60 player walks it that way, lifting stops it, and it doesn't jitter on arrival | Phone emulation in the browser pane, pointer events sent by script, player position and `isKeyDown` checked |
| 3 | A tap presses and releases the tap key once | Emulation, key events counted |
| 4 | A swipe in each of the four directions presses the matching key once, and a swipe 30° off axis still counts | QUnit tests |
| 5 | Holding a side holds its key until the finger lifts | QUnit tests (LD60 doesn't use this gesture) |
| 6 | Two fingers at once: hold to move and tap both register | Two pointer ids at once in emulation |
| 7 | Lifting, a browser-cancelled touch, hiding the page or changing scene releases every key | `pointercancel`, `visibilitychange` and a scene change sent in emulation |
| 8 | Taps on Play, Mute and Play again still work, and don't fire the tap key | Taps in emulation, scene changes and key events checked |
| 9 | The whole game is visible with no scrolling or zooming in both orientations | Screenshots at 390×844 portrait and 844×390 landscape |
| 10 | All QUnit tests in `mobile/tests/` pass | Test page opened in the browser pane |
| 11 | It plays well on real phones | You, on an iPhone and an Android phone, via the branch's deploy at `/mobile/index.html` |

Criterion 11 can only be checked by you. Emulation doesn't reproduce real Safari touch behaviour, and that is where these bugs usually show up. CircleCI deploys every branch, so the `mobile` branch gets its own phone-testable URL.

## Delivery plan, risks and open questions

All work happens on the `mobile` branch, created from `main` at `b5f7e47`. It is merged only after you've played it on a phone.

1. Rename the baseline's `Button` to `UIButton`, so it no longer replaces Crafty's built-in `Button`.
2. Build `mobile/touch-controls.js` and `.css`: finger tracking, the four gestures, key release, the touch ring and the Crafty events.
3. Add the page fitting: viewport for both orientations, safe areas, no scrolling and hidden page chrome.
4. Wire it into LD60: `init` with hold-toward and tap, `follow(player)` in the Game scene, and the hint switching to "Touch and hold to move" on phones.
5. Add QUnit tests and a demo page in `mobile/`, run criteria 1–10 in the browser pane, and write `mobile/README.md`.
6. Push the branch so CircleCI deploys `/mobile/`, then you test on real phones (criterion 11).

**Risks**

- **Gestures are invisible:** unlike buttons, players can't see them. The first Game scene shows "Touch and hold to move" through the existing `PlayerNotification`, and the touch ring confirms each touch.
- **iPhone Safari and the viewport:** changing the viewport width after the page loads isn't always applied straight away on iOS. Fallback: set the width before Crafty starts, and reload on rotation if needed.
- **Crafty's touch handling:** Crafty turns touches on the stage into mouse events and cancels the touch. Pointer Events fire before that, so gestures should be unaffected, and criterion 8 checks taps on UI still work.

**Open questions**

- LD60's placeholder has no action to tap for yet. Should tap be mapped to `SPACE` now, ready for the real game, or left off until there's an action?
- Should the published package be named `crafty-touch-controls`, with `TouchControls` as the in-game name?

## Sources

- [Game controls](https://developer.apple.com/design/human-interface-guidelines/game-controls), Apple Human Interface Guidelines (updated June 2025)
- [Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games), Apple Human Interface Guidelines
- [What Are the Best Mobile Game Controls?](https://www.abratabia.com/game-controls/best-mobile-controls.php), abratabia.com (updated June 2026)
- [craftyjs/Crafty](https://github.com/craftyjs/Crafty), GitHub repository, plus the Crafty 0.9.0 source from cdnjs
