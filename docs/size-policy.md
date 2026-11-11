# Component growth and size reporting

The maintainer removed component-count and artifact-size limits on 2026-11-11. There is no maximum component count, individual component size, aggregate bundle size, npm archive size, unpacked size or package file count. Visual fidelity, interaction quality and complete functionality guide implementation. Do not remove requested effects or split a usable component merely to meet an old byte threshold.

## What CI reports

- `npm run size:check` measures every configured entry in `size-budget.json`. The retained `limit` values are historical references only. Exceeding one is informational. Missing outputs, invalid imports and stale README measurements still fail.
- `npm run check:pack` reports compressed bytes, unpacked bytes and file count. `PACK_LIMITS` retains historical references for continuity; none are release caps. Source maps still belong in the tag and release asset, and their accidental inclusion in npm remains an error.
- `npm run check:treeshake` reports single-export bytes without caps while still rejecting unused-import side effects or unrelated component code.
- `npm run check:tiers` reports basic, standard and advanced gzip sizes. Historical `TIER_BUDGETS` are informational. A lower tier importing a higher-tier module still fails.

Component counts remain generated from code to keep documentation accurate; an exact-count consistency check is not a maximum. New entries should be added to the measurement inventory when they are introduced.

## Quality checks that remain

Keep individual imports, tree shaking, documented APIs, keyboard and touch interaction, reduced motion, browser/framework compatibility and resource cleanup. Performance checks measure the actual first-screen fixture, script time, GPU resources and frame stability. These checks protect responsiveness and isolation; they do not impose a global size or component-count cap. Consumer-configured Studio export budgets and untrusted-input limits are separate product behavior and remain available.
