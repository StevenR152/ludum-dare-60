---
name: build
description: Implement an approved PRD on its own branch in the current checkout, verify it in the browser, and hand back a localhost link to play the result. Use when the user ONLY uses /build. For an isolated git worktree instead, use /build-with-worktree.
---

# Build a PRD

Work through an approved PRD's Tasks on a branch, then leave a running preview the user can open.

## 1. Pick the PRD
- Use the PRD the user named, otherwise the one in `PRD/` this session wrote or discussed. If that's still unclear, list `PRD/*.md` and ask.
- If it has unresolved **Open questions**, ask them first; don't guess.

## 2. Switch to a branch named after the work
- Branch name is the PRD's file slug (e.g. `PRD/workbench-and-shelf.md` -> `workbench-and-shelf`). Work in the current checkout; do not create a worktree.
- Check `git branch --show-current` and `git status`. Uncommitted changes (including an untracked PRD) carry over to the new branch, so that's fine; if they look unrelated to this PRD, mention it to the user.
- If the branch doesn't exist, `git switch -c <slug>`. If it does, `git switch <slug>`.
- Read the files the PRD's Constraints and Tasks name before editing.

## 3. Build
- Work through **Tasks** in order. Keep changes within the PRD's Scope and the files its Constraints list.
- Update the README's How to play section if the player-visible rules changed.

## 4. Verify
- Start the preview with `preview_start {name: "static"}` from `.claude/launch.json`. Never start it with Bash. If 8080 is taken, a free port is given; use whatever port the result reports.
- Check each **Acceptance criterion** in the browser: drive the game with `javascript_tool` (enter the scene, move the fox, trigger clicks/keys) and confirm the state and status messages. Check `read_console_messages` for errors. Take one screenshot as proof.
- Tick the criteria that passed. Leave any you couldn't verify unticked, with a short note why (e.g. "touch not device-tested").

## 5. Hand back
- Tick the Tasks in the PRD.
- Do not commit, push, or open a PR; leave all changes uncommitted on the branch for the user to review and commit.
- Leave the preview server running.
- End with:
  - **Play it:** `http://localhost:<port>` (the port from step 4).
  - What was verified, and what wasn't.
  - The branch name, so the user knows where the work is.
