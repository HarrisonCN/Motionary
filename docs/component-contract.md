# The component contract (12.0)

Every `<usa-*>` element follows the same six rules. 11.7 measured them (report only), 11.8 fixed the non-breaking findings,
**12.0 makes the contract blocking**: `npm run check:contract` (CI) fails on any finding, and every intended exception is
written next to the code as `// contract-exempt: <rule> — <reason>` and listed in [contract-report.md](./contract-report.md).

| Part | Rule | Audit rule ids |
|---|---|---|
| **Attributes** | kebab-case; every attribute the element reads is in `observedAttributes`, so changing it later re-renders; boolean attributes are presence-based; invalid values fall back to the documented default. State the element reflects itself (`checked`, `value`, `open` …) is set through the property. | `attr-unobserved` |
| **Events** | `usa:<name>` `CustomEvent`s that bubble and are composed, with a `detail` object (events that carry no data dispatch `detail: null`; every event's shape is specified in `test/fixtures/event-details-13.json`) — always through `this.emit()`. `composed: true` since 13.0.1 (documented since 12.0, missing in `emit()` until then), so a `usa:*` event fired inside a shadow root reaches listeners outside it. The legacy names (`usa:beat`, `usa:audio-error`, `usa:ready`, `usa:finish`, `usa:step`) are gone in 12.0. | `event-prefix`, `event-bubbles`, `event-composed` |
| **Keyboard** | anything that reacts to click / pointer input on the host is reachable by keyboard: focusable with Enter / Space (or Arrow keys for value controls), or delegated to a native `<button>` / `<input>` / `<summary>` / `<dialog>` inside. | `keyboard-click-only` |
| **Lifecycle** | mount on connect; full teardown on disconnect (listeners through `this.listen()`, timers and observers through `onCleanup()`); re-mount on an observed attribute change; importing never defines or touches the DOM. | `lifecycle-global-listener`, `lifecycle-timer` |
| **Reduced motion** | honour `prefers-reduced-motion` and `configureComponents({ motionSensitivity })`: jump to the end state (`this.reduced`, `this.motion()`, `animateWithMotion()`). | `reduced-motion` |
| **Errors** | messages start with `[motionary]`, name the element or function and say how to fix it; a missing runtime module fires `usa:runtime-missing`. | `error-prefix` |

History: 11.7 audit (report only) · 11.8 fixed the non-breaking findings (observed attributes, `usa:*` events next to legacy names,
keyboard-reachable click hosts via `keyClick()`, reduced motion for `<usa-player>`, `[motionary]` errors) · 12.0 legacy
event names removed, every element without an `observedAttributes` list got one, blocking check. Migrating:
[upgrading-12.md](./upgrading-12.md) · `npx usa-codemod-12 --write`.

The audit is a static scan of `src/components` (one row per element, keyed by its default tag). Comments are ignored by the
rules (13.0.1). Both define forms are recognised: `export function defineX(tag = 'usa-x')` and `export const defineX = (tag =
'usa-x') => helper(tag, …)` (the helper's body is audited, e.g. `<usa-modal>` / `<usa-sheet>`). **Coverage (13.0.1):** the
audited tag set must equal the AI manifest's public components — `check:contract` fails when a component is in the manifest but
not audited, or the other way round.

**Exemptions (13.0.1):** `// contract-exempt: <rule>(<item>, …) — <reason>` inside the element's own source. Rules whose
findings name an item (`attr-unobserved`, `event-*`, `lifecycle-global-listener`, `error-prefix`) must list the items, and the
exemption masks only those (`exempt-unscoped` otherwise); an exemption, or an item of one, that masks nothing is reported as
`exempt-unused`, so a stale exemption cannot hide a future finding. An exemption applies only to the element whose source it
is in.
