---
name: build
description: Implement an approved PRD in its own worktree, verify it in the browser, and hand back a localhost link to play the result. Use when the user says build it, implement the PRD, go ahead, or /build.
---

# Build a PRD

Work through an approved PRD's Tasks, then leave a running preview the user can open.

## 1. Pick the PRD
- Use the PRD the user named, otherwise the one in `PRD/` this session wrote or discussed. If that's still unclear, list `PRD/*.md` and ask.
- If it has unresolved **Open questions**, ask them first; don't guess.

## 2. Start a worktree named after the work
- Note the current branch (`git branch --show-current`). If it's `main`, that's fine; the new worktree still gets its own branch.
- Call `EnterWorktree` with `name` set to the PRD's file slug (e.g. `PRD/workbench-and-shelf.md` -> `workbench-and-shelf`). If a worktree with that name already exists, enter it with `path` instead of creating another.
- The new worktree branches from a fresh base, so the PRD may be missing. If `PRD/<slug>.md` isn't there, bring it over with `git checkout <previous-branch> -- PRD/<slug>.md`.
- Run everything below from the new worktree.
- Read the files the PRD's Constraints and Tasks name before editing.

## 3. Build
- Work through **Tasks** in order. Keep changes within the PRD's Scope and the files its Constraints list.
- Update the README's How to play section if the player-visible rules changed.

## 4. Verify
- Start the preview with `preview_start {name: "static"}` from `.claude/launch.json`. Never start it with Bash. If 8080 is taken, a free port is given; use whatever port the result reports.
- Check each **Acceptance criterion** in the browser: drive the game with `javascript_tool` (enter the scene, move the fox, trigger clicks/keys) and confirm the state and status messages. Check `read_console_messages` for errors. Take one screenshot as proof.
- Tick the criteria that passed. Leave any you couldn't verify unticked, with a short note why (e.g. "touch not device-tested").

## 5. Hand back
- Tick the Tasks, then commit the code and the PRD together, describing what changed and why.
- Push the branch (`git push -u origin HEAD`) and open a **draft** PR against `main` with `gh pr create --draft`. Title: the PRD title. Body: the PRD's Goal, then its acceptance criteria with ticks, noting any left unverified. Never mark it ready for review or enable auto-merge; the user does that.
- If the push or `gh` fails (no remote, not signed in), say so and leave the commit local.
- Leave the preview server running.
- End with:
  - The draft PR link.
  - **Play it:** `http://localhost:<port>` (the port from step 4).
  - What was verified, and what wasn't.
  - The worktree name and branch, so the user knows where the work is.
