# PRD: Clay needs a firing level

**Goal** — Each clay type needs one firing level (low, mid or high); a pot fired at any other level comes out cracked.

**Context**
- Clay types live in `CLAY_TYPES` (`constants.js`); `Pottery` copies name/colour into `pottery.clay` and walks `POTTERY_STATES` (`pottery.js`). Nothing can crack yet.
- Another agent is changing the kiln: it gets a 3-log wood inventory and the player loads 1 log = low, 2 = mid, 3 = high fire. This PRD touches none of that.
- The kiln will report the level it fired at to the Pottery; this PRD defines that hook and what it does.

**Scope** — A fire level per clay type, a level recorded on the Pottery, and a cracked flag set when they differ.
**Out of scope** — The kiln, logs, wood, fire-level UI/timings (other agent); collecting logs; what the shelf, orders or score do with a cracked pot; cracked art/sounds; glaze firing; a second firing.

**Flow**
1. The fox digs clay. The pile's type says which level it needs (brown low, red mid, blue high).
2. The pot goes through the owl and drying shelf as today.
3. The kiln fires it and calls `pottery.setFireLevel(level)` before `advance("firing")`.
4. When the pot reaches `cooled`, it is `cracked` if the level differs from its clay's level, otherwise sound.

**Requirements**
1. `FIRE_LEVELS` in `constants.js` = `["low", "mid", "high"]` (the order is the log count minus one); each `CLAY_TYPES` entry gets `fireLevel`: brown `low`, red `mid`, blue `high`.
2. `new Pottery(clayType)` copies it to `clay.fireLevel`; the shared `CLAY_TYPES` is never mutated.
3. `pottery.setFireLevel(level)` stores `pot.fireLevel`. It returns false, warns and changes nothing for an unknown level, or unless the state is `dried` (before firing starts).
4. `pot` starts with `fireLevel: null, cracked: false`. On `advance("cooled")`, `pot.cracked = (pot.fireLevel !== clay.fireLevel)`. A pot reaching `firing` with no level set is cracked (treated as a mismatch).
5. A cracked pot continues through the states unchanged, so no station refuses or crashes on it.
6. `itemColor` shows a cracked pot in a new `CRACKED_POT_COLOR`, so the player can see it failed.

**Acceptance criteria**
- [ ] Console: brown fired `low` → `pot.cracked` false; brown fired `mid` or `high` → true; same for red (`mid`) and blue (`high`).
- [ ] Console: `setFireLevel("hot")` and a call on a `thrown` pot return false and warn; `CLAY_TYPES` unchanged afterwards.
- [ ] A pot fired with no level set ends up cracked.
- [ ] Cracked pots move to `shelved` without errors; HUD shows the cracked colour.
- [ ] Existing run (dig → wedge → owl → dry → kiln → shelf) still works.

**Constraints** — Crafty 0.9.0, no new deps. Edit only `constants.js`, `components/pottery.js`, `components/clay.js` if needed, and the colour mapping in `inventory.js`; README note. Do not edit `kiln.js`.

**Open questions**
1. Does a cracked pot still count toward the 3 shelved pots that end the game? Default: yes until the shelf owner decides.
2. Is under-fire vs over-fire distinguished (e.g. different crack looks)? Default: no, any mismatch cracks.

**Tasks**
- [ ] `FIRE_LEVELS`, `fireLevel` on `CLAY_TYPES`, `CRACKED_POT_COLOR`
- [ ] `Pottery`: copy `clay.fireLevel`, `setFireLevel`, `pot.fireLevel/cracked`, crack check on `cooled`
- [ ] Cracked colour in `itemColor`
- [ ] README note on the kiln hook
- [ ] Verify in the browser/console
