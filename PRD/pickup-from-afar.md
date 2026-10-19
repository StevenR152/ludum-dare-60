# PRD: Pick things up from afar; holds start only in reach

*Written after the build, to record the rules. Everything below is implemented and checked.*

**Goal** — A single-click action (picking something up) works from across the room, while a hold action (dig, chop, wedge) only starts once the fox is already there.

**Context**
- Clicking a station out of reach walks the fox to it (`Fox.handlePress` → `walkStep` → `arrive`). `arrive()` used to have one rule for everything: fire the station's `MouseDown` if the button was still held, otherwise do nothing.
- So a tap on an item on the ground walked the fox over and then did nothing, while holding through a walk to clay, a tree or the workbench started the dig, chop or wedge on arrival. That's the wrong way round for both.
- Model spots on the workbench route the walk to the bench (`reachVia`), so a held click on a model arrived and fired the *bench's* `MouseDown`, which started wedging instead of taking the model.

**Scope** — Split arrival into three rules by what was clicked; fix the model-spot routing; stop a misleading "I can't reach that" line on taps.
**Out of scope** — Which stations count as which kind beyond those listed. Kiln, owl and shelves behave as before. Pathfinding (slide-along-walls is separate, PR #59).

**Flow**
1. Tap or hold on a dropped item or a bench model out of reach → the fox walks over and takes it.
2. Tap or hold on clay, a tree or the workbench out of reach → the fox walks over, nothing starts, and it says how to use it (e.g. "Hold on a tree to chop a log").
3. Press again while there and hold → the dig, chop or wedge runs as normal.
4. Hold on the kiln, owl or a shelf out of reach → it acts on arrival, as before; a tap does nothing on arrival.

**Requirements**
1. A target with `actsOnArrival` (`DroppedItem`, workbench model spots) is triggered on arrival whether or not the press is held.
2. A station with `startsOnlyInReach` (`Clay`, `Forest`, `Workbench`) is never triggered on arrival; its `arrivalHint` is shown instead.
3. Every other station keeps the old rule: triggered on arrival only if the press is still held.
4. The walk remembers what was actually clicked (`walk.target`), so a model spot acts as itself, not as the bench.
5. A tap on a far station doesn't say "I can't reach that" while the fox is still walking there; it still says it if the walk ended at a wall first.
6. `DroppedItem` counts as in reach if the fox touches it right now, not only once the collision `HitOn` has landed, so an arrival pickup can't miss by a frame.

**Acceptance criteria**
- [x] A dropped log, tapped from afar: fox walks over, "Picked up the log", log in the pack.
- [x] The same log, held from afar: same result.
- [x] A tree, tapped or held from afar: fox arrives, "Hold on a tree to chop a log", no chop started.
- [x] Holding on a tree while already next to it: still chops.
- [x] The kiln, held through the walk: still loads the selected log on arrival.
- [x] A bench model, tapped from afar: model taken, no wedging started.
- [x] No "I can't reach that" line on any tap that ends in the fox reaching the target.
- [ ] **Not checked:** a walk to a station that ends at a wall still saying "I can't reach that" on release. The logic follows the old path, but I didn't set it up in the browser.

**Constraints** — `components/fox.js`, `dropped_item.js`, `clay.js`, `forest.js`, `workbench.js`, plus the README's how-to-play. ES5, no build step.

**Open questions** — None.

**Tasks**
- [x] Store the clicked target on the walk in `handlePress`.
- [x] Split `arrive()` into the three rules.
- [x] Flag `DroppedItem` and model spots `actsOnArrival`; `Clay`, `Forest`, `Workbench` `startsOnlyInReach` with an `arrivalHint`.
- [x] Drop the deferred "can't reach" line on release while a station walk is still under way.
- [x] Accept the fox touching a `DroppedItem` as in reach.
- [x] Update the README's click-to-move and pickup lines.
- [x] Verify in the browser (walk loop stepped by hand; the preview pane runs at 0 fps).

## Decisions
1. Both halves together: the request was framed as pickup-from-afar being the opposite of the hold stations, so I read it as wanting both, and flagged that reading when handing the work back.
2. Hint rather than silence when a hold station is reached, so the player knows the next step without guessing.
3. Kiln, owl and shelves left on the old rule: they weren't part of the request, and acting on a held arrival is still useful there.
