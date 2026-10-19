# PRD: Timer bars and "you stopped" messages

**Goal** — Show a filling bar above whoever is doing a timed action, and tell the player when they let go of a hold instead of leaving "keep holding" on screen.

**Context**
- Three player actions are holds: dig (`CLAY_DIG_MS` 2s, `Clay`), chop (`LOG_CHOP_MS` 2s, repeating while held, `Forest`), wedge (`WEDGE_MS` 3s, `Workbench`). Each starts a `Delay` on MouseDown and cancels it on MouseUp/MouseOut.
- Two more actions run on a timer unattended: the owl throws (`POT_MAKE_MS` 8s) or trims (`POT_TRIM_MS` 5s) between `PotterWorking` and `PotterDone`; the kiln fires (`KILN_FIRE_MS`) then cools (`KILN_COOL_MS`), each announced by `KilnStateChanged`.
- `Clay.cancelDig` already says "You stopped digging". `Forest.cancelChop` and `Workbench.cancelWedge` are silent, so their "keep holding" line just sits there until it fades. Nothing anywhere shows progress; `DryBar` is the house pattern for a small filling bar.

**Scope** — One `TimerBar` component, placed above the fox (dig, chop, wedge), the owl (throw, trim) and the kiln (fire, cool), plus cancel messages for chop and wedge.
**Out of scope** — Changing any duration. "Finish in time / hold for just the right length" as a skill mechanic: this is a progress readout only, so the itch page's "Timer bars" line stays Coming soon. The wedge walk-off bug below.

**Noted for later** — Walking out of reach mid-wedge still runs the 3s delay to completion, then `finishWedge` finds no clay and returns silently. Deliberately left alone here; worth its own fix.

**Flow**
1. Player holds on a tree, clay patch or the workbench while in reach. The action's status line shows as it does today.
2. A bar appears above the fox's head and fills from empty over that action's duration.
3. On completion the bar vanishes and the normal success line shows. Chopping immediately starts a fresh bar for the next log.
4. If the player releases early the bar vanishes at once and a line says they stopped.
5. Separately: while the owl throws or trims, a bar fills above him; while the kiln fires then cools, a bar fills above it, once per phase.

**Requirements**
1. `TimerBar` attaches above a given entity, stays hidden until started, tracks that entity as it moves, and fills from empty over a duration it is given.
2. `Crafty.trigger("HoldStarted", {ms})` starts the fox's bar; `Crafty.trigger("HoldEnded")` hides it; a second `HoldStarted` restarts the fill. Dig, chop and wedge each fire both at the right moments.
3. A repeating chop refills the bar for each log with no gap or flicker.
4. The owl's bar runs on `PotterWorking` for `POT_MAKE_MS` or `POT_TRIM_MS` by job kind, and hides on `PotterDone`.
5. The kiln's bar runs for `KILN_FIRE_MS` on entering `firing` and `KILN_COOL_MS` on entering `cooling`, and hides in every other state.
6. `Forest` and `Workbench` each gain an in-progress flag and say "You stopped chopping" / "You stopped wedging" **only on a real release** (MouseUp, which covers touch and the SPACE key), never on `MouseOut` and never on a press that was refused or on a cancel that already explained itself (e.g. "Backpack full").
7. No bar overlaps the status text above the fox.

**Acceptance criteria**
- [x] Holding on a tree shows the bar and a log refills it (fill resets to 0 with the bar still visible). Fill maths checked pointwise over 2s: 0 / 14 / 28 / 42 / 56 / 56 px at 0 / 0.5 / 1 / 1.5 / 2 / 3 s.
- [x] Digging and wedging both show the bar on press and hide it on release.
- [x] Releasing part-way hides the bar at once and shows "You stopped chopping" / "You stopped digging" / "You stopped wedging".
- [x] Moving the cursor off mid-action stops it **silently** on all three stations — no "you stopped" line.
- [x] Filling the pack on a chop says only "Chopped a log" then "Backpack full...", never "You stopped chopping".
- [x] A refused press (tree out of reach, bench with nothing weighed) shows neither a bar nor a "you stopped" line.
- [x] The owl's bar runs for 8000 ms on a throw and 5000 ms on a trim and hides on `PotterDone`; the kiln's shows on `firing` and `cooling` and hides on `ready` and `empty`.
- [x] The bar stays centred on the fox, moves with it exactly, and its bottom (566) sits clear of the status text's top (573).
- [x] No console errors across all actions.
- [ ] **Not verified:** the bar visibly animating in real time. The preview pane runs its frame loop at 0 fps while hidden, so `UpdateFrame` never fired; the fill function was driven by hand instead. Worth a glance in a real window.

**Constraints** — New `components/timer_bar.js` (+ its script tag in `index.html`), plus `clay.js`, `forest.js`, `workbench.js`, `scenes/game.js` for placement, and bar constants in `constants.js`. ES5, no build step, match existing style.

**Open questions** — None.

**Tasks**
- [x] Add `TimerBar` constants (size, colours, offset above an entity) to `constants.js`.
- [x] Write `components/timer_bar.js` and register it in `index.html`.
- [x] Create the fox, owl and kiln bars in `buildWorld`, wired to their events.
- [x] Fire `HoldStarted`/`HoldEnded` from `Clay`, `Forest` and `Workbench`.
- [x] Add the in-progress flag and release-only cancel message to `Forest` and `Workbench` — and to `Clay`, which already had the flag but spoke on `MouseOut` too.
- [x] Verify every action, plus refused presses, MouseOut and the pack-full path, in the browser.

## Decisions
1. Cancel message — spoken only on a real release (MouseUp, which Crafty also gives for touch and which the SPACE key path triggers). `MouseOut` still cancels the action, silently.
2. Double messaging — a cancel that already explained itself (pack full, out of reach) does not also say "You stopped".
3. Placement — bars go above whoever is doing the work: the fox for digging, chopping **and wedging** (a fox-driven hold), the owl for throwing and trimming, the kiln for firing and cooling.
4. Wedge walk-off — left as it is and recorded under "Noted for later" rather than fixed here.
