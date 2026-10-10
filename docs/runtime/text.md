# motionary/runtime/text — Text splitting

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Split text into characters (grapheme-aware), words and lines for animation while keeping it accessible (aria-label with the full text, pieces hidden from assistive tech).

**Runtime tier:** basic — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **2.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/text`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/text.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/text.js`

4. **Import order & registration:** Register the core first, then the module: use(text) also registers the core. CDN: load runtime.iife.js, then runtime/text.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { text } from 'motionary/runtime/text';
use(text);
```

## Example

```js
import { use, tween } from 'motionary/runtime';
import { text, splitText } from 'motionary/runtime/text';
use(text);
const { chars } = splitText(document.querySelector('h1'), { type: 'chars,words' });
tween(chars, { from: { y: '1em', opacity: 0 }, to: { y: '0em', opacity: 1 }, stagger: 30 });
```

## Exports

`text` · `splitText` · `segment`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| chars (grapheme clusters: emoji, combining marks, CJK) | ✅ yes | Intl.Segmenter when available, code points otherwise |
| words, whitespace preserved | ✅ yes |  |
| lines (grouped by rendered position) | ✅ yes | wrapped in line spans for flat text; data-line on words inside nested markup |
| nested inline markup (a, em, strong…) kept | ✅ yes |  |
| accessibility: aria-label + aria-hidden pieces, revert() | ✅ yes |  |
| --i index custom property for CSS staggers | ✅ yes |  |
| SSR / workers | ◐ partial | segment() is pure; splitText() needs a DOM |
| right-to-left line detection | ◐ partial | lines by vertical position (works for RTL; bidi runs not reordered) |

## Components that need it

- `<usa-text-splitter>` — Text splitter
