# PRD: Separate weighing station (weigh, then wedge)

**Goal** — Clay is weighed at the purple WeighingStation, then wedged at the workbench; the wedged piece plus a model goes to the owl.

**Context**
- Today: dug → wedged → weighed. `Workbench` does it all: hold to wedge a kilo onto a bench pile, a `Scales` sub-box with the slider panel, `weigh`, pile boxes, plus the model spots. `game.js` has a bare purple rectangle placeholder (`#800080`, 280×70 at -2730, 467).
- `POTTERY_STATES`, `Pottery.weighOut`, `Potter.receiveFrom` (wants `weighed`) and `inventory.js` markBorder (white on `weighed`) encode the old order.

**Scope** — New `WeighingStation` component on the purple rectangle owns the pile of dug clay, pile boxes, `weigh` and the chooser/slider panel. State order becomes dug → weighed → wedged. Workbench wedges a carried weighed piece and keeps the models. **Out of scope** — art, kiln, shelves, drying, clay weights, model spots, SPACE handling.

**Flow**
1. Fox carries a dug kilo to the purple station and clicks it with the kilo selected: it joins that clay's pile (same clay adds up; clays sit side by side).
2. Clicking the station with anything else selected opens the panel (clay chooser, grams slider, Weigh): a weighed piece goes into the pack, the rest stays on the station.
3. Fox takes the weighed piece to the workbench and holds it for 3s with the piece selected: it becomes wedged (stays in the pack).
4. Fox clicks a model on the workbench to carry it, then clicks the owl: he takes wedged clay + model if the grams match the shape.

**Requirements**
1. `POTTERY_STATES` is dug, weighed, wedged, thrown…; `weighOut` takes grams off a `dug` pile as a `weighed` piece.
2. `components/weighing_station.js`: pile (Inventory), `pileClay`, `weigh`, pile boxes inside the rectangle, panel code from `scales.js`; `scales.js` and `Scales` removed.
3. `Workbench` loses pile, pile boxes, `weigh`, `Scales`; `startWedge`/`finishWedge` need a selected `weighed` piece and advance it in place to `wedged`.
4. Station and workbench require the fox touching them, else "Walk up to the weighing station/workbench first". Wedging a dug or already wedged piece says to weigh first / already wedged; weighing needs a pile.
5. `Potter.receiveFrom` takes `wedged` clay; its messages and `index.html` help text follow the new order; white border marks `wedged`.
6. `game.js` builds the station on the purple rectangle (same position, size, colour); `index.html` script tag swapped.

**Acceptance criteria**
- [x] Dug kilo clicked at the station becomes a coloured pile box with its grams; two clays make two piles.
- [x] Panel weighs 200 g off 1000 g; 800 g stays; piece in the pack.
- [x] Holding the weighed piece at the workbench for 3s wedges it; holding with dug clay refuses.
- [x] Owl refuses weighed-but-unwedged clay; accepts wedged clay + model with matching grams.
- [x] Away from either station: message, no panel/wedge. No console errors (checked through the owl accepting; the kiln/shelf route was not re-run).

**Constraints** — `constants.js`, `components/{weighing_station,workbench,pottery,potter,inventory}.js`, delete `components/scales.js`, `scenes/game.js`, `index.html`, `README.md`. Plain Crafty/JS.

**Open questions** — None (see defaults to confirm).

**Tasks**
- [x] Swap state order; `weighOut` from dug pile
- [x] Create `WeighingStation`; remove pile/weigh/Scales from `Workbench`
- [x] Workbench wedges a weighed piece; owl takes wedged; border, messages, help text
- [x] `game.js`, `index.html`, delete `scales.js`, README
- [x] Verify in browser (deposit, weigh, wedge, model, owl accept/refuse)
