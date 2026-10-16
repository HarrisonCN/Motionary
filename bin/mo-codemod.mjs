#!/usr/bin/env node
// 17.0: `mo-codemod` — the Motionary-named alias of the usa-codemod tools (same runner as `npx motionary codemod`).
//   npx -p motionary mo-codemod <11–13> [--write] [paths…]
// The usa-codemod-<n> bins keep working; usa-* names are deprecated in favour of mo-* (docs/deprecations-v17.md#mo-names),
// removal not before a future major.
import { runCodemod } from './motionary.mjs';

Promise.resolve(runCodemod(process.argv.slice(2))).then((c) => { process.exitCode = c; });
