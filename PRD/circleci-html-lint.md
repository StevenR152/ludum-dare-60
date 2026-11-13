# PRD: CircleCI HTML lint

**Goal** — Every commit pushed runs a CircleCI job that lints `index.html` and fails the build on errors; work is pushed on a branch named `First-CI`.

**Context**
- CI today is `.circleci/config.yml` (v2.1): one `deploy` job (cimg/python, syncs the branch to S3) in workflow `build-deploy`. No lint step, no `package.json`.
- "The HTML file" = `index.html` (inline `<style>`/`<script>`, tab-indented `<title>`, commented-out GA block). `itch-description.html` also exists.
- First lint run must already pass on `index.html`, so existing violations get fixed or the rule set tuned.

**Scope** — Add a `lint-html` job (cimg/node, `npx htmlhint@<pinned> index.html`) to `.circleci/config.yml`; make `deploy` `requires: lint-html`; optional `.htmlhintrc`; minimal whitespace/attribute fixes to `index.html`; create + push branch `First-CI` from current `cloud-test` HEAD.
**Out of scope** — JS/CSS linting, `itch-description.html`, GitHub Actions, game behaviour, S3/AWS settings, CircleCI project/branch-protection setup.

**Flow**
1. Push `First-CI` → CircleCI starts workflow `build-deploy`.
2. `lint-html` checks out, runs HtmlHint on `index.html`.
3. Clean → green, then `deploy` runs as before; errors → red with file:line, deploy skipped.
4. Same on every later push, so the first commit is linted.

**Requirements**
1. `lint-html` job exists in the config and runs on all branches.
2. It lints `index.html` with a pinned HtmlHint version; non-zero exit on errors.
3. `deploy` runs only after `lint-html` succeeds.
4. `index.html` passes the same command locally.
5. `origin/First-CI` contains the change.

**Acceptance criteria**
- [x] `npx htmlhint index.html` exits 0 locally.
- [x] A deliberate break (unclosed tag) fails it locally, then reverted.
- [x] `.circleci/config.yml` parses as valid YAML with both jobs and `requires`.
- [ ] `origin/First-CI` exists; CircleCI run shows `lint-html` green.
- [x] No functional change to `index.html`.

**Constraints** — Edit only `.circleci/config.yml`, `index.html` (lint fixes), optional `.htmlhintrc`; no `package.json`.

**Open questions** — None. Assumed: lint gates deploy; branch cut from `cloud-test`, not `main` — say if you want otherwise.

**Tasks**
- [x] Run `npx htmlhint index.html`, note violations
- [x] Fix violations / add `.htmlhintrc`
- [x] Add `lint-html` job + `requires` on deploy
- [x] Verify pass and deliberate-fail locally
- [x] Create `First-CI`, commit, push
- [ ] Confirm CircleCI run is green
