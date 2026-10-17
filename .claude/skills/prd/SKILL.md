---
name: prd
description: Write a short, crisp PRD for the next feature before building it. Use when the user describes a feature and asks for a PRD, spec, plan, or "what you'll work through".
---

# Short PRD

Produce a one-screen PRD that you will then implement against. Crisp, not exhaustive.

## Before writing
1. Read the project's design doc / README / CLAUDE.md if present, and the files the feature touches.
2. Establish from the request + code (ask only if truly missing):
   - **Current state**: what exists today that this builds on.
   - **Ownership**: what is mine vs. someone else's — never plan changes to their area.
   - **Behaviour**: the player/user-visible flow, step by step.
   - **Edge details**: exact positions, timings, states the user called out (e.g. "arrive below the door, not touching").
   - **Constraints**: files, tech, style limits (e.g. "all in game.js").

## Output format
# PRD: <feature>
**Goal** — one sentence.
**Context** — current state, 2–3 bullets.
**Scope** — what I'm building. **Out of scope** — incl. other people's areas.
**Flow** — numbered user-visible steps, round-trip if applicable.
**Requirements** — numbered, each testable.
**Acceptance criteria** — checkboxes I'll verify in-app.
**Constraints** — files/tech limits.
**Open questions** — only real ones; otherwise "None".
**Tasks** — ordered checklist I'll work through.

## Save and commit
- Save the PRD to `PRD/<feature-slug>.md` at the repo root (kebab-case, e.g. `PRD/door-teleport.md`). Never leave a PRD only in chat.
- Commit just that file: `git add PRD/<feature-slug>.md && git commit -m "PRD: <feature>"`. Stage nothing else.
- When ticking off Tasks later, update the same file and commit it alongside the work.

## Rules
- Keep it under ~40 lines. No filler, no speculative features.
- Every requirement maps to an acceptance check.
- After presenting, suggest `/prd-confidence` to tighten the uncertain parts, then wait for go-ahead.
- Once approved, build it with the `build` skill (`/build`): it works through Tasks in order and hands back a preview link.
