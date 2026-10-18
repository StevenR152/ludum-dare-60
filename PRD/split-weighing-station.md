# PRD: Separate weighing station

**Goal** — Wedging and weighing happen at two different stations: the workbench wedges, a new WeighingStation (the purple rectangle) weighs.

**Context**
- `Workbench` does it all: wedge (hold), the clay pile (`pile`, `pileClay`, `weigh`, pile boxes) and a `Scales` sub-box with the slider panel; `game.js` has a bare purple rectangle placeholder (`#800080`, 280×70 at -2730, 467).
- Wedging today adds the kilo to a bench pile; weighing takes grams off that pile into the fox's pack.
- The workbench keeps the model spots, `acceptDrop` and `ModelReturned` (unchanged).

**Scope** — New `WeighingStation` component owning the pile, pile display, `weigh`, and the chooser/slider panel; attach it to the purple rectangle. Workbench only wedges (and keeps models). **Out of scope** — art, owl/potter, kiln, shelves, clay weights, the model spots.

**Flow**
1. Fox holds the workbench with dug clay selected for 3s: the kilo becomes wedged clay (state `wedged`, 1000 g) and stays in the pack.
2. Fox walks to the purple station and clicks it with wedged clay selected: the kilo joins that clay's pile there (same clay adds up; different clays sit side by side).
3. Clicking the station with anything else selected opens the panel (clay chooser, grams slider, Weigh); Weigh puts a weighed piece in the pack, the rest stays on the station.
4. Weighed clay + a model go to the owl as before.

**Requirements**
1. `components/weighing_station.js`: `WeighingStation` has `pile` (Inventory), `pileClay`, `weigh`, per-clay pile boxes inside the rectangle, and the panel code moved from `scales.js`; `scales.js` and its `Scales` entity are removed.
2. `Workbench` has no pile, pile boxes, `weigh` or `Scales`; `finishWedge` advances the selected clay to `wedged` in place.
3. Wedged clay clicked at the station is added to the pile; not touching the station shows "Walk up to the weighing station first".
4. The panel opens only at the station and closes when the fox walks off or the pile empties; no wedged clay and no pile says "Wedge some clay at the workbench first".
5. `game.js` creates the station on the purple rectangle (same position and size, keeps its colour); `index.html` swaps the script tag.
6. Weighing at the workbench is impossible; wedging at the station is impossible.

**Acceptance criteria**
- [ ] Workbench shows only the 3 models; holding it wedges a dug kilo into the pack (no pile appears there).
- [ ] Wedged kilo clicked at the purple station appears as a coloured pile box with its grams.
- [ ] Panel weighs 200 g off a 1000 g pile; 800 g remains; piece is in the pack; owl accepts it with a matching model.
- [ ] Two clays make two piles; the chooser lists both.
- [ ] Clicking the station while away says to walk up; no panel opens.
- [ ] No console errors through a full pot route.

**Constraints** — `components/{weighing_station,workbench}.js`, `components/scales.js` (delete), `scenes/game.js`, `index.html`, `README.md`. Plain Crafty/JS.

**Open questions** — Where wedged clay goes after wedging. Assumed: it stays in the pack as a wedged kilo that you carry to the station and click in (alternatives: auto-send to the station, or weigh straight from the pack).

**Tasks**
- [ ] Create `WeighingStation` (pile, boxes, weigh, panel) from workbench + scales code
- [ ] Strip pile/weigh/Scales from `Workbench`; wedge in place
- [ ] `game.js`: replace the placeholder rectangle; `index.html` script tag; delete `scales.js`
- [ ] README update
- [ ] Verify in browser (wedge, carry, deposit, weigh, owl accepts)
