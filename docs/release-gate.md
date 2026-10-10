# Release gate (13.2)

A Motionary release reaches npm only from a pull request whose **head commit passed every required CI check**. The checks
already exist; this page is about making sure nothing on the way to `npm publish` can skip them.

## What is checked

The required checks are listed in [`.github/required-checks.json`](../.github/required-checks.json). A unit test keeps that
list equal to the jobs in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), so a new CI job cannot be left out.

| Required check | What it runs |
|---|---|
| `Node 20` | typecheck, unit tests, build, exports, tree-shaking, runtime tiers, component contract (`check:contract`), prerequisite docs, docs and contract consistency (`check:docs`) |
| `Node 22` | the same, plus package lint, `npm pack` contents, package size (`check:pack`), bundle size budgets (`size:check`), the component playground in headless Chrome (`check:playground`) and the performance budgets (`perf`) |
| `Node 24` | the same as Node 20 |
| `Browser (chromium)` | the real-browser suite (`test/browser`): lifecycle, keyboard / ARIA, motion sensitivity, resource release, complex-page performance — [browser-matrix.md](./browser-matrix.md) |
| `Browser (firefox)` | the same in Firefox |
| `Browser (webkit)` | the same in WebKit |

Every step runs in `bash` with `-eo pipefail` (`defaults.run.shell: bash` in the workflows): a check piped into
`tee -a "$GITHUB_STEP_SUMMARY"` fails its job when the check fails. No step uses `continue-on-error`.

## The gate in the release flow

```bash
node scripts/release-gate.mjs --pr 136          # npm run release:gate -- --pr 136
```

It reads the pull request and the check runs of its head commit from the GitHub API and refuses (exit code 1) when:

- the PR is closed, merged or a draft;
- a required check is missing on the head commit, still queued or running, or concluded anything but `success`
  (the newest run of a check counts, so a failed re-run closes the gate again);
- any other check on the head commit failed, was cancelled or timed out.

When the gate is open it prints `head=<sha>`. The release script then merges with that exact sha (the merge API's `sha`
parameter refuses the merge if someone pushed after the checks ran), creates the GitHub release from the merge commit, and
publishes from a checkout of that merge commit only after checking that its `package.json` version is the one being
released. `motionary` and `use-scroll-animate` are published from the same checkout. The npm dist-tag follows
[versions.md](./versions.md): `latest` for a major and its patches, `v<major>-<minor>` for a minor.

## Required checks in the branch settings

The gate in the script protects the release flow; branch protection protects `main` itself. Set it once per repository:

1. **Settings → Branches → Add branch protection rule** (or **Settings → Rules → Rulesets → New branch ruleset**, target
   `main`).
2. Enable **Require a pull request before merging**.
3. Enable **Require status checks to pass before merging** and **Require branches to be up to date before merging**.
4. Add the six checks by name — they appear in the search box after one CI run:
   `Node 20`, `Node 22`, `Node 24`, `Browser (chromium)`, `Browser (firefox)`, `Browser (webkit)`.
   Matrix jobs report one check per entry, so add each name; the workflow name (`CI`) is not part of it.
5. Enable **Do not allow bypassing the above settings** (rulesets: leave the bypass list empty), so administrators go
   through the same checks.
6. Optional: **Require linear history** (releases are squash-merged).

When a CI job is renamed or added, update `.github/required-checks.json` (the unit test fails until you do) and the
required checks in the branch settings in the same pull request.
