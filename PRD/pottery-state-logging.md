# PRD: Pottery state-change logging

**Goal** — Every `Pottery.advance()` call prints one console line saying whether the state progressed or was rejected.

**Context**
- `components/pottery.js` `advance(to)` already `console.warn`s on rejection (message + the pottery object), but a successful advance is silent.
- Callers: potter, workbench, drying_shelf, kiln, completed_shelf.

**Scope** — Log in `Pottery.advance` only. **Out of scope** — callers, `canAdvance`, state rules, any on-screen UI.

**Flow**
1. Game code calls `pottery.advance(to)`.
2. Success: console shows `potterystate: advanced dug -> wedged`.
3. Rejection: console shows `potterystate: rejected dug -> firing` as a warning, plus the pottery object.

**Requirements**
1. A successful advance logs `potterystate: advanced <from> -> <to>` via `console.log`.
2. A rejected advance logs `potterystate: rejected <from> -> <to>` via `console.warn` with the pottery object.
3. Return values and state transitions are unchanged.

**Acceptance criteria**
- [ ] Playing dig -> wedge shows an "advanced" line per step in the console.
- [ ] `pottery.advance("firing")` from "dug" shows a "rejected" warning and returns false.
- [ ] Game behaviour is otherwise unchanged.

**Constraints** — Edit `components/pottery.js` only; plain `console` calls, no new flags.

**Open questions** — None.

**Tasks**
- [ ] Add the success log and reword the rejection log in `advance`.
- [ ] Verify in the browser console.
