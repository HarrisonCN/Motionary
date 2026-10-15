# CDN in production: exact version + SRI (16.3)

The README's CDN examples pin a **major** (`motionary@16`) so they keep working as minors ship. For production, pin the
**exact version** and add **Subresource Integrity** (`integrity` + `crossorigin`), so the browser refuses a file whose
bytes differ from the release you tested:

- a major pin (`@16`) changes under you when a minor ships — fine for prototypes, not for production;
- an exact pin (`@16.3.0`) never changes, and with `integrity` the browser also verifies it was not altered on the CDN.

## Hashes for this version

<!-- sri:start -->
<!-- sri:end -->

These hashes belong to exactly one version. When you upgrade, take the table from that version's `docs/cdn-sri.md`
(on npm: `node_modules/motionary/docs/cdn-sri.md`; on GitHub: the release tag), or compute it yourself:

```bash
curl -sL https://cdn.jsdelivr.net/npm/motionary@16.3.0/dist/index.umd.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Both unpkg and jsDelivr serve the npm tarball byte for byte, so the same hash works on either.

## Bundlers

With npm + a bundler you do not need SRI for Motionary: `package-lock.json` already pins the exact version and its
`integrity` (sha512 of the tarball). Use `npm ci` in CI.
