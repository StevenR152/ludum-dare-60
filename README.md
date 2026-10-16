# Ludum Dare 60
Theme: TBC

Built with [CraftyJS](http://craftyjs.com/api/) 0.9.0 (loaded from cdnjs).

## Run locally
Serve the folder over HTTP (asset loading fails from `file://`):

```
py -m http.server 8000
```

(`py` is the Windows launcher; use `python3` elsewhere.)

Then open http://localhost:8000.

## Layout
- `constants.js`: screen size, music track, credits list
- `game_state.js`: per-run state, reset with `resetGameState()`
- `assets.js`: sprites and audio preloaded by the Loading scene
- `scenes/`: Loading, Start, Game (placeholder: reach the green square), End
- `components/`: `AudioController` (global `audioController`), `MuteButton`, `GameTimer`, `PlayerNotification` (`Crafty.trigger("InstructionText", msg)`), `Button`, `CreditsText`
- `camera.js`: `makeCameraTrackEntity(entity, yOffset)`
- `analytics.js`: `track(event, params)`, a no-op until the GA4 snippet in `index.html` is enabled

Give an entity the `HUD` component to keep it fixed on screen while the camera moves.

## Deploy
Every push is synced by CircleCI to `s3://ludum-dare-60/<branch>/`, so `main` is served at `/main/index.html`.

CircleCI needs `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION` set on the project, and the `ludum-dare-60` bucket must exist with public static hosting.

## Useful links
- [https://codeshack.io/images-sprite-sheet-generator/](https://codeshack.io/images-sprite-sheet-generator/)
