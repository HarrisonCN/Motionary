# `<usa-otp>` — OTP code input

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.7: one-time-code boxes that auto-advance, step back on Backspace and take a pasted code; digits pop in, error() shakes the row red, success() sends a green wave across it.

- **Category:** ui · **since** 7.7
- **Import:** `import { defineOtp } from 'motionary/components/widgets'` then `defineOtp();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `length`, `mode`, `label`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `fillCode()`, `clear()`, `error()`, `success()`
- **Source:** [src/components/widgets/otp.ts](../../src/components/widgets/otp.ts)

## Minimal example

```html
<usa-otp length="6"></usa-otp>
<script>otp.addEventListener('usa:complete', (e) => check(e.detail.code) ? otp.success() : otp.error());</script>
```

## ES module

```js
import { defineOtp } from 'motionary/components/widgets';

defineOtp(); // registers <usa-otp>

/* then use it in your HTML:
<usa-otp length="6"></usa-otp>
*/
```
