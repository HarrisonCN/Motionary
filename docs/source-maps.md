# Source maps (11.2)

Source maps are still generated for every build (ESM, CommonJS, UMD, runtime IIFE), but since 11.2 they are **not
published to npm**.

## Measurements

`npm pack --dry-run` of `motionary@11.0.0`, with and without the `.map` files:

| | with `.map` (≤ 11.1) | without `.map` (11.2+) | |
|---|---|---|---|
| tarball (download) | 6.33 MB | 3.28 MB | −48 % |
| unpacked (`node_modules`) | 27.08 MB | 12.02 MB | −56 % |
| files | 2869 | 1955 | −914 maps |

Source maps were more than half of what every install downloaded and unpacked, and almost nobody uses them from
`node_modules`.

## Where the maps are

`dist/` (maps included) is committed with every release, so the maps of version `X.Y.Z` live in the git tag `vX.Y.Z`.
The last build step (`scripts/sourcemap-urls.mjs`) rewrites each file's `//# sourceMappingURL=` comment to that
permanent URL:

```
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/chunks/base-….js.map
```

- **DevTools** (Chrome, Firefox, Safari) only fetch a map when DevTools is open, and resolve it from that URL — for
  files loaded from npm, jsDelivr / unpkg or your own bundle output.
- **Bundlers** (Vite, webpack, Rollup, esbuild) do not download remote maps; you debug your own code with your own
  maps, and Motionary's ESM / CommonJS output is not minified, so it is readable without maps.
- Need the maps locally? `git clone --branch vX.Y.Z --depth 1 https://github.com/HarrisonCN/Motionary` and use
  `dist/`, or download the release's source archive from GitHub Releases.

Alternatives considered: a separate `motionary-sourcemaps` package (another package to publish and version in
lock-step for no extra benefit), and release-asset tarballs (needs an extra upload step; the tag already holds the
same files).

## Checks

- `package.json` `files` contains `!dist/**/*.map`.
- `npm run check:pack` (CI, Node 22): the dry-run package contains no `.map` file and stays within fixed limits —
  4.0 MB packed, 14 MB unpacked, 2300 files. Limits are not raised automatically.
