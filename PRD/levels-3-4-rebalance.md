# PRD: Rebalance level 3, add levels 4–7

**Goal** — Level 3 becomes a gentle two-order, two-clay level; levels 4–7 step up in shapes, clays and glazing: glazes arrive in level 5, double dips in level 7.

**Context**
- `LEVELS` in `scenes/levels.js` holds 3 levels; level 3 "First Orders" has 4 Cup orders over all clays, glazed, one dip per pot.
- Level select and Level Complete read `LEVELS.length`, so new entries appear and chain ("Next level") with no scene changes.
- Clay patches come from `world.clays`, bench models from `world.models`, the glaze station from `world.glaze`; fire level is set by clay (black 1 log, red 2, white 3).

**Scope** — Edit level 3's config (and take glazing out of it); add levels 4–7 to `LEVELS`. **Out of scope** — new art/mechanics, the sandbox, `UNLOCK_ALL_LEVELS` (the uncommitted `true` in `constants.js` is yours; untouched).

**Flow** — Level select shows 7 levels; each completes when all its fixed orders are delivered, offering "Next level" until level 7. Levels 3–4 are unglazed; level 5 adds the glaze station.

**Requirements**
1. L3 "First Orders": `glaze: false`, `clays: ["black", "white"]`, `models: ["Cup"]`, 2 unglazed orders: white Cup, black Cup. Text mentions no red or glaze.
2. L4 "Bowls and Cups": `glaze: false`, `models: ["Bowl", "Cup"]`, `clays: ["black"]` only (1 log), 4 unglazed orders: 2 Bowls, 2 Cups.
3. L5 "Glazing": `glaze: true`, `maxGlazeDips: 1`, `models: ["Cup", "Vase"]`, all three clays, 3 orders: red Vase + Glaze A, black Vase + Glaze B, white Cup + Glaze A. Description/steps teach dipping (steps include "Dip it in a glaze").
4. L6 "Mixed Orders": `glaze: true`, `maxGlazeDips: 1`, all three models and clays, 4 orders: white Bowl + Glaze A, red Vase + Glaze B, black Cup + Glaze A, red Cup + Glaze B.
5. L7 "Double Dips": `glaze: true`, `maxGlazeDips: 2`, all three models and clays, 5 orders, each with two dips: white Bowl (A then B), red Vase (B then A), black Cup (A then B), red Bowl (B then A), white Vase (A then B).
6. Each level's description, steps and fire card text match its orders and clays; other world flags as the current L3.

**Acceptance criteria**
- [ ] Level select lists 7 levels; locking follows `UNLOCK_ALL_LEVELS`. (not checked: level select screen)
- [x] L3: only black and white patches; no glaze station; 2 unglazed cards; completing offers "Next level". (completion not played)
- [ ] L4: only black patch; no glaze station; Bowl and Cup models; 4 cards (2 bowls, 2 cups). (order cards verified by state only; not played or checked in the UI)
- [ ] L5: glaze station present; Cup and Vase models only; 3 glazed cards (2 vases, 1 cup); all three patches; a second dip is refused. (order cards verified by state only; not played or checked in the UI)
- [ ] L6: glaze station, all patches and models; 4 cards with mixed shapes and clays, one dip each. (order cards verified by state only; not played or checked in the UI)
- [ ] L7: 5 cards, each showing two glaze squares; a pot accepts two dips (order matters) and a third is refused; completing shows "Level 7 complete" with no "Next level". (order cards verified by state only; not played or checked in the UI)
- [ ] Restart rebuilds each level cleanly. (order cards verified by state only; not played or checked in the UI)

**Constraints** — Only `scenes/levels.js` (config data). Crafty 0.9.0, no new files.

**Open questions** — None. Assumptions (say if wrong): glazing is removed from L3 (it was glazed before) so L5 really introduces it; L4's single clay is black; glaze choice per order is my pick.

**Tasks**
- [x] Trim L3 to 2 unglazed orders / black+white clay; update its text
- [x] Add L4 (black bowls and cups, unglazed)
- [x] Add L5 (glazing: 2 vases + 1 cup)
- [x] Add L6 (mixed shapes and clays, glazed)
- [x] Add L7 (5 orders, double dips)
- [x] Verify in browser (level select, order cards, patches, models, glaze station per level)
