# PRD: Owl makes pots, fox picks them up

**Goal** — The owl throws a pot every 8 seconds whenever his hands are free, and the fox can collect it to carry.

**Context**
- The owl is a static sprite inside the house (`scenes/game.js`); the fox walks with Fourway and clicks things it is touching (see doors).
- There's no inventory yet. The design doc says the fox carries one thing at a time.
- Another engineer owns clay delivery. The kiln isn't built yet.

**Scope** — A `Potter` component for the owl (clay, pot timer, pot indicator). The fox's one-slot inventory in `gameState`. Click the owl to pick up a pot. A HUD inventory slot.
**Out of scope** — Clay delivery (another engineer's area), the kiln and firing, dropping or placing pots, pot types and quality, sounds, a progress bar for the 8 seconds.

**Flow**
1. The game starts. The owl has 1 clay and no pot, so he starts a pot straight away. Clay drops to 0, and the placeholder refill puts it back to 1.
2. 8 seconds later he has a pot, shown as a light brown box on him. He stops making pots.
3. The fox walks to the owl and clicks him while touching him. The pot moves to the fox.
4. The HUD inventory slot shows the pot. The owl's box disappears and he starts the next pot (back to step 1).
5. If the fox is already holding something, clicking the owl does nothing and the owl keeps his pot.

**Requirements**
1. When the owl has no pot and at least 1 clay, he uses 1 clay and finishes a pot 8 s later.
2. The owl holds at most one pot. He makes nothing while he holds one.
3. Placeholder: the owl's clay goes back to 1 as soon as he starts a pot. Clay is a plain `clay` count the clay engineer can take over.
4. While the owl holds a pot, a light brown box shows on him. Otherwise it's hidden.
5. Clicking the owl while the fox touches him, the owl has a pot and the fox's hands are empty moves the pot to `gameState.heldItem = "pot"`.
6. Clicking the owl from a distance, with no pot ready, or while holding something does nothing.
7. A HUD slot (top-left, below the mute button) shows what the fox holds: a pot icon (light brown box) or an empty slot.
8. Inventory resets on a new run through `resetGameState()`.

**Acceptance criteria**
- [ ] About 8 s after the scene starts, the box appears on the owl and stays there while I wait.
- [ ] Clicking the owl from far away does nothing. Clicking him while touching moves the pot to the HUD slot and clears his box.
- [ ] About 8 s after pickup, a new box appears on the owl, with no clay delivered.
- [ ] Clicking him again while holding a pot leaves both pots where they are.
- [ ] Works with the mouse and with a tap. The doors, clay patches and timer still behave as before.
- [ ] Play Again starts with empty hands.

**Constraints** — Crafty 0.9.0, no new dependencies. New component in `components/potter.js` (added to `index.html`), wiring in `scenes/game.js`, state in `game_state.js`. Placeholder art uses coloured boxes.

**Open questions** — None. Assumed: the HUD slot is the inventory indicator, not a pot drawn on the fox. The 8 s timer runs on game time, so it pauses if the game pauses.

**Tasks**
- [ ] Add `heldItem: null` to `gameState`
- [ ] `Potter` component: clay, pot timer, light brown box indicator, `takePot()`
- [ ] Give the owl `Potter` and `Mouse`, and click-to-pickup with the touch check in `game.js`
- [ ] HUD inventory slot that follows `gameState.heldItem`
- [ ] Verify the acceptance criteria in the browser
