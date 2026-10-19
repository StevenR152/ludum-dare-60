# PRD: Status messages above the player
**Goal** — "You can't do that" feedback appears above the fox's head, in smaller text, instead of at the bottom of the screen.

**Context**
- `showStatus(msg)` (`components/status_message.js`) triggers `StatusText`; a screen-fixed `StatusMessage` entity (HUD, bottom-centre, 20px) shows it every time. ~75 call sites, all via `showStatus`.
- `PlayerNotification` (`components/player_notification.js`) already floats above the fox (24px, once per message via `InstructionText`).

**Scope** — `PlayerNotification` also listens to `StatusText`, shows it above the fox at a smaller size; `StatusMessage` entity removed. `showStatus` stays as the API.
**Out of scope** — changing message wording, call sites, tutorial/instruction text style (stays 24px, once per run), HUD.

**Flow**
1. Fox does something disallowed (e.g. pack full): small text fades in above its head and follows it as it walks.
2. It fades after a delay; repeating the mistake shows it again.
3. A tutorial hint ("Arrow keys to move") still shows once, at its normal size.

**Requirements**
1. `showStatus` text renders in `PlayerNotification` at 16px (instructions stay 24px), centred above the fox.
2. Status messages show every time (no once-per-run dedupe); instructions keep dedupe.
3. A newer message replaces the current one and restarts the fade; size follows the message type.
4. Nothing renders at the bottom of the screen; `showStatus` still logs to console.
5. Each scene has exactly one notification entity (no leftover `StatusMessage`).

**Acceptance criteria**
- [x] Trigger a status (e.g. "Nothing to drop" with D): text above fox, ~16px, none at screen bottom.
- [x] Same message twice in a row shows both times.
- [ ] Text follows the fox while walking, in both Outside and Inside scenes. (attached to fox; Inside scene and walking not driven)
- [x] "Arrow keys to move" is still 24px and appears once.
- [x] Longest status message is readable and not hidden behind/over the fox.
- [x] No console errors on scene start.

**Constraints** — `components/player_notification.js`, `components/status_message.js`, `scenes/game.js` (remove `Crafty.e("StatusMessage")`); no new files; Crafty 0.9.0.
**Open questions** — None (a long status wraps within the 400px box; will widen if the longest clips).

**Tasks**
- [x] `player_notification.js`: bind `StatusText`, size per type, skip dedupe for status
- [x] `status_message.js`: drop the `StatusMessage` component, keep `showStatus`; update comments
- [x] `game.js`: remove `Crafty.e("StatusMessage")`
- [x] Verify each acceptance item in-app
