# The component contract (12.0)

Every `<usa-*>` element follows the same six rules. 11.7 measured them (report only), 11.8 fixed the non-breaking findings,
**12.0 makes the contract blocking**: `npm run check:contract` (CI) fails on any finding, and every intended exception is
written next to the code as `// contract-exempt: <rule> — <reason>` and listed in [contract-report.md](./contract-report.md).

| Part | Rule | Audit rule ids |
|---|---|---|
| **Attributes** | kebab-case; every attribute the element reads is in `observedAttributes`, so changing it later re-renders; boolean attributes are presence-based; invalid values fall back to the documented default. State the element reflects itself (`checked`, `value`, `open` …) is set through the property. | `attr-unobserved` |
| **Events** | `usa:<name>` `CustomEvent`s that bubble and are composed, with a `detail` object — always through `this.emit()`. The legacy names (`usa:beat`, `usa:audio-error`, `usa:ready`, `usa:finish`, `usa:step`) are gone in 12.0. | `event-prefix`, `event-bubbles` |
| **Keyboard** | anything that reacts to click / pointer input on the host is reachable by keyboard: focusable with Enter / Space (or Arrow keys for value controls), or delegated to a native `<button>` / `<input>` / `<summary>` / `<dialog>` inside. | `keyboard-click-only` |
| **Lifecycle** | mount on connect; full teardown on disconnect (listeners through `this.listen()`, timers and observers through `onCleanup()`); re-mount on an observed attribute change; importing never defines or touches the DOM. | `lifecycle-global-listener`, `lifecycle-timer` |
| **Reduced motion** | honour `prefers-reduced-motion` and `configureComponents({ motionSensitivity })`: jump to the end state (`this.reduced`, `this.motion()`, `animateWithMotion()`). | `reduced-motion` |
| **Errors** | messages start with `[motionary]`, name the element or function and say how to fix it; a missing runtime module fires `usa:runtime-missing`. | `error-prefix` |

History: 11.7 audit (report only) · 11.8 fixed the non-breaking findings (observed attributes, `usa:*` events next to legacy names,
keyboard-reachable click hosts via `keyClick()`, reduced motion for `<usa-player>`, `[motionary]` errors) · 12.0 legacy
event names removed, every element without an `observedAttributes` list got one, blocking check. Migrating:
[upgrading-12.md](./upgrading-12.md) · `npx usa-codemod-12 --write`.

The audit is a static scan of `src/components` (one row per element, keyed by its default tag).
