# PRD: Owl makes pots, fox picks them up

**Goal** — The owl throws a pot every 8 seconds whenever his hands are free, and the fox can collect it to carry.

**Context**
- The owl is a static sprite inside the house (`scenes/game.js`); the fox walks with Fourway and clicks things it is touching (see doors).
- There's no inventory yet. The design doc says the fox carries one thing at a time.
- Another engineer owns clay delivery. The kiln isn't built yet.

**Scope** — A `Potter` component for the owl (clay, `ClayDelivered` event, pot timer, pot indicator). The fox's one-slot inventory in `gameState`. Click the owl to pick up a pot. A HUD inventory slot.
**Out of scope** — Clay delivery itself (another engineer's area), the kiln and firing, placing pots (SPACE just deletes the held item, a testing aid), pot types and quality, sounds, a progress bar for the 8 seconds.

**Flow**
1. The Game scene loads. The owl has 1 clay and no pot, so he starts a pot straight away. Clay drops to 0, and the placeholder refill puts it back to 1.
2. 8 seconds later he has a pot, shown as a light brown box on him. He stops making pots.
3. The fox walks to the owl and clicks him while touching him. The pot moves to the fox.
4. The HUD inventory slot shows the pot. The owl's box disappears and he starts the next pot (back to step 1).
5. If the fox is already holding something, clicking the owl does nothing and the owl keeps his pot.

**Requirements**
1. When the owl has no pot and at least 1 clay, he uses 1 clay and finishes a pot 8 s later.
2. The owl holds at most one pot. He makes nothing while he holds one.
3. Clay arrives through a `ClayDelivered` event on the owl, carrying the amount. It adds to `owl.clay` and starts a pot if his hands are free. Placeholder: when the owl starts a pot, he triggers `ClayDelivered` with 1 on himself. That's one marked line, so it's easy to delete.
4. While the owl holds a pot, a 40×40 light brown box shows low on the owl, centred across his width. Otherwise it's hidden.
5. Clicking the owl while the fox touches him, the owl has a pot and the fox's hands are empty moves the pot to `gameState.heldItem = {type: "pot"}`. It's an object so later steps (glaze, kiln) can add properties.
6. Clicking the owl from a distance, with no pot ready, or while holding something does nothing.
7. A HUD slot (top-left, below the mute button) shows what the fox holds: a pot icon (light brown box) or an empty slot.
8. Inventory resets on a new run through `resetGameState()`.

**Acceptance criteria**
- [x] About 8 s after the scene starts, the box appears on the owl and stays there while I wait.
- [x] Clicking the owl from far away does nothing. Clicking him while touching moves the pot to the HUD slot and clears his box.
- [x] About 8 s after pickup, a new box appears on the owl, with no clay delivered.
- [x] Clicking him again while holding a pot leaves both pots where they are.
- [x] Running `Crafty("Potter").trigger("ClayDelivered", 2)` in the console raises `owl.clay` by 2.
- [ ] Works with the mouse and with a tap (mouse verified; tap not yet tested on a device). The doors, clay patches and timer still behave as before.
- [x] Play Again starts with empty hands.

**Constraints** — Crafty 0.9.0, no new dependencies. New components `components/potter.js` and `components/inventory_slot.js` (added to `index.html`), timings in `constants.js`, wiring in `scenes/game.js`, state in `game_state.js`. Placeholder art uses coloured boxes.

**Open questions** — None.

**Tasks**
- [x] Add `heldItem: null` to `gameState`
- [x] `Potter` component: clay, `ClayDelivered` handler with the placeholder refill, pot timer, light brown box indicator, `takePot()`
- [x] Give the owl `Potter` and `Mouse`, and click-to-pickup with the touch check in `game.js`
- [x] HUD inventory slot that follows `gameState.heldItem`
- [x] Verify the acceptance criteria in the browser

## Decisions
1. Inventory indicator → only the HUD slot, no pot drawn on the fox (default).
2. Clay handoff → a `ClayDelivered` event on the owl with the amount. The placeholder refill goes through the same event.
3. Held item → the object `{type: "pot"}`, since pots will gain properties.
4. First pot → starts when the Game scene loads (default).
5. Owl's pot box → 40×40, low on the owl, centred (default).
