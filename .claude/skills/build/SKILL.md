---
name: build
description: Implement an approved PRD in its own worktree, verify it in the browser, and hand back a localhost link to play the result. Use when the user says build it, implement the PRD, go ahead, or /build.
---

# Build a PRD

Work through an approved PRD's Tasks, then leave a running preview the user can open.

## 1. Check where you are
- Run `git rev-parse --git-dir`. It must contain `/worktrees/`, so this work stays on its own branch. If it doesn't, stop and tell the user to start a new session (each session gets its own worktree).
- If the branch is `main`, stop the same way.

## 2. Pick the PRD
- Use the PRD the user named, otherwise the one in `PRD/` this session wrote or discussed. If that's still unclear, list `PRD/*.md` and ask.
- If it has unresolved **Open questions**, ask them first; don't guess.
- Read the files its Constraints and Tasks name before editing.

## 3. Build
- Work through **Tasks** in order. Keep changes within the PRD's Scope and the files its Constraints list.
- Update the README's How to play section if the player-visible rules changed.

## 4. Verify
- Start the preview with `preview_start {name: "static"}` from `.claude/launch.json`. Never start it with Bash. If 8080 is taken, a free port is given; use whatever port the result reports.
- Check each **Acceptance criterion** in the browser: drive the game with `javascript_tool` (enter the scene, move the fox, trigger clicks/keys) and confirm the state and status messages. Check `read_console_messages` for errors. Take one screenshot as proof.
- Tick the criteria that passed. Leave any you couldn't verify unticked, with a short note why (e.g. "touch not device-tested").

## 5. Hand back
- Tick the Tasks, then commit the code and the PRD together, describing what changed and why. Don't push or open a PR unless asked.
- Leave the preview server running.
- End with:
  - **Play it:** `http://localhost:<port>` (the port from step 4).
  - What was verified, and what wasn't.
  - The branch name, so the user knows where the work is.
