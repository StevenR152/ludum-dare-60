# PRD: Kiln deposit when pack is full + hands off while firing/cooling

**Goal** — With a full pack and a non-full kiln holding pots, clicking the kiln deposits the selected item instead of failing to collect; and nothing can be put in or taken out of it while it fires or cools (except wood while cooling).

**Context**
- Click handler: `scenes/game.js` ~L120–173. Order: log → wood; else `transferItem(pack → kiln)` ("Kiln loaded"); else take-back/collect branches.
- `components/kiln.js`: pots only `accepts` in `empty`/`loaded`. In `ready` (fired pots waiting) deposits are refused, so the click falls to collect and says "You can't carry the pot: your pack is full or holds clay". Pack = 2 slots, kiln = 4.
- Typical case: kiln `ready`, fox holds a pot + a log, wants the fired pot. Loaded-state case may also occur (to reproduce).

**Scope** — Block kiln item changes while `firing` and `cooling`; deposit on click when the pack is full and the kiln accepts the selected item; let a `ready` kiln take fresh pots alongside fired ones without changing either's state.
**Out of scope** — Firing/cooling timers, wood rules, owl, HUD, art/sound assets, pack/kiln capacity.

**Flow**
1. Pack full, kiln has 1–3 pots, fox touches kiln, selects an item, clicks.
2. Selected item moves into the kiln; status "Kiln loaded"; no pack-full message.
3. Fox can then click again (pack now has a free slot, selecting nothing depositable) to collect a fired pot.

**Requirements**
1. Full pack + selected item the kiln can take → deposit, message "Kiln loaded" (+ existing `ItemMoved` sound).
2. `ready` kiln accepts pots that have a pass (`passFor`); deposited pot keeps its state, fired pots keep theirs (no re-firing, no un-firing).
3. Kiln tracks which pots finished this firing; it stays `ready` until those are taken, then becomes `loaded` (if pots remain) or `empty`, and can then be lit normally.
4. Non-full pack with a `ready` kiln still collects as today; deposits in `ready` only when the pack is full.
5. While `firing`, any click on the kiln (pot, log or empty hands) changes nothing and shows "I shouldn't reach into the kiln while it's burning". No item enters or leaves either kiln inventory.
   While `cooling`, no pot or log comes out and no pot goes in; a pot or empty-hands click shows "I'll wait, the kiln is still cooling down". A selected log still loads as wood ("Wood loaded into the kiln", or the full-wood message).
6. Collect order when taking out: a finished (fired) pot, then a fresh pot, then a log. The kiln HUD slot is outlined in white only when a click would actually take that item out (kiln not firing/cooling, fox pack not full, selected item doesn't trigger a deposit/wood load); otherwise no kiln slot is outlined.
7. The fox's selected inventory slot is always outlined, even with one item (Fox row only).
8. Torch on a `ready` kiln says "I need to take the finished pots out of the kiln first"; other torch messages unchanged.
9. Blocked clicks are silent (status line only); any non-log item during cooling, and any item during firing, gets the blocked line.
10. Anything the kiln can't take (cracked, finished glaze pot, kiln full 4/4) keeps its existing message; cold/wood/take-back unchanged.

**Acceptance criteria**
- [ ] Ready kiln (1–3 fired pots), full pack with pot selected → pot enters kiln, "Kiln loaded".
- [ ] Both pack slots tested as selected; deposited pot's state/stats and fired pots' states unchanged (inspect in console).
- [ ] Collect the fired pots, remaining unfired pot → kiln `loaded`; add wood + torch fires only it.
- [ ] While firing: click with a pot, a log, and empty hands → nothing moves in or out, burning message each time.
- [ ] While cooling: pot or empty hands → nothing moves, cooling message; log → loads as wood; nothing can be taken out.
- [ ] Log selected → wood path as before, even with a full pack (collect needs another item selected).
- [ ] Kiln outline sits on the fired pot, then the fresh pot, then a log as each would be taken; none while firing/cooling, with a full fox pack, or when the click would deposit.
- [ ] Fox's selected slot is outlined with 1 or 2 items.
- [ ] Torch on a ready kiln shows the new line; firing/cooling torch messages unchanged.
- [ ] Ready kiln with fired + fresh pot, empty hands → fired pot comes out first.
- [ ] Kiln 4/4 or cracked/finished pot → existing message; empty pack still collects; cooling → new cooling message.
- [ ] Loaded-state, full pack, pot selected → deposit works (or is fixed).

**Constraints** — `scenes/game.js`, `components/kiln.js`, `components/inventory_hud.js` (outline); no art changes; no new dependencies.

**Decisions**
- Kiln was usually `ready`; mixing fresh and fired pots is allowed if each pot's stats stay intact.
- Reuse the "Kiln loaded" message.
- Firing and cooling both block pots in/out and wood out; wood can still be added while cooling (not while firing). Firing uses the burning line, cooling a different one; both replace "The kiln is busy" / "Still cooling…".
- Deposit-before-collect only applies when the pack is full; a selected log goes to the wood path even then (user: correct flow).
- Status line (`showStatus`) for the burning message, not a pop-up (default confirmed).
- Torch: only the `ready` message changes, to "I need to take the finished pots out of the kiln first".
- Blocked clicks silent; clay etc. get the blocked line too (default).
- Collect order: fired pot → fresh pot → log, shown by a white outline on the kiln slot only when a click would take it; fox's selected slot always outlined.

**Open questions** — None.

**Tasks**
- [ ] Reproduce in browser (ready and loaded kiln, full pack)
- [ ] Kiln: accept pots in `ready`, track finished pots, state transition when they leave
- [ ] Kiln `nextOut()` helper + one shared "what would a click do" check; collect order; HUD outlines in `inventory_hud.js`
- [ ] Torch `ready` message in `kiln.js` `light()`
- [ ] Click handler: early block: `firing` blocks everything, `cooling` blocks all but logs-in (before the transfer paths); deposit when pack is full
- [ ] Verify all acceptance checks in the browser
