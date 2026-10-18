---
name: prd-confidence
description: Raise confidence in an existing PRD by finding the parts Claude is least sure about and asking the user 3–8 targeted questions, then folding the answers back into the PRD. Use when the user asks to review, clarify, de-risk, sanity-check, or "add confidence" to a PRD.
---

# PRD confidence pass

Find where the PRD could be built wrong, ask about exactly those spots, and update the PRD with the answers.

## 1. Pick the PRD
- Use the PRD the user named. If they didn't name one, use the one in `PRD/` most recently discussed or modified. If it's still unclear, list `PRD/*.md` and ask.
- Read it, plus the design doc and the code it touches, so you don't ask anything the repo already answers.

## 2. Find the least-certain parts
Go through each requirement, flow step, and acceptance check and ask: *could two reasonable engineers build this differently?* Typical weak spots:
- Vague behaviour ("teleport", "feels responsive"): exact positions, timings, triggers.
- Unstated edge cases: re-entry, spam input, overlapping states, what happens mid-transition.
- Ownership seams: where this touches someone else's area and what the contract is.
- Acceptance checks that can't actually be verified.
- Scope creep or missing non-goals.

Rank them by **impact if wrong × how unsure you are**. Drop anything you can settle from the code yourself.

## 3. Ask 3–8 questions
Scale the count to the task's complexity: **3** for a small, contained feature; **5–6** for multi-step or cross-system work; **8** only for large or ambiguous features. Never pad to reach a number.

Ask them all in one message, numbered, highest-impact first. For each:
- Quote or name the PRD line it's about.
- Ask one concrete question.
- Give your default assumption, so the user can answer just "yes" or "default".

Format:
```
1. **<PRD section / line>** — <question>
   _Default if unanswered:_ <your assumption>
```
Then stop and wait for answers.

## 4. Fold answers back in
- Edit the PRD in place: tighten the affected requirements, flow steps, and acceptance checks, and resolve or remove any **Open questions**.
- Add a short `## Decisions` section at the end: one line per question → answer (mark taken defaults as "(default)").
- Keep the PRD crisp. Rewrite lines rather than adding new paragraphs.
- Don't commit; leave the edited PRD uncommitted for the user.
- Summarise what changed in 2–3 lines. If an answer revealed new major uncertainty, offer one more short round.
