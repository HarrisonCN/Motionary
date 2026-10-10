# Phones and tablets (13.3.0)

Motionary runs on mobile browsers and in app web views (Android WebView, WKWebView, MAUI, Flutter). This page lists
what the components do for touch, the soft keyboard and screen rotation, how that is tested, and what is **not**
verified.

## Soft keyboard

On iOS Safari and on Chrome for Android (108+), opening the on-screen keyboard shrinks the **visual** viewport but not
the layout viewport, so `position: fixed; bottom: 0` ends up behind the keyboard. Motionary reads
[`window.visualViewport`](https://developer.mozilla.org/docs/Web/API/VisualViewport) and, while a component needs it,
sets two CSS variables on `<html>`:

| Variable | Meaning |
|---|---|
| `--usa-kb` | Height (px) the keyboard covers at the bottom of the layout viewport: `innerHeight − visualViewport.height − visualViewport.offsetTop`. `0px` while pinch-zoomed (a zoom is not a keyboard). |
| `--usa-vvh` | Height (px) of the visible area. |

Both are removed when the last component that needs them closes or disconnects. Components that use them:

| Component | On phones |
|---|---|
| `<usa-bottom-sheet>`, `<usa-drawer>` | Sit on top of the keyboard (`bottom: var(--usa-kb)`); the sheet's height and snap points are fractions of the **visible** height, so a focused input stays in view. |
| `<usa-sheet side="bottom">` | Sits on top of the keyboard; `max-height` is 85 % of the visible height. |
| `<usa-modal>` | Centres in the area the keyboard leaves visible; `max-height` follows the visible height. |
| `<usa-toast-stack position="bottom-…">` | Moves up above the keyboard. |

Use the same variables in your own CSS — `bottom: var(--usa-kb, 0px)` — and start the watcher yourself when no
component does:

```js
import { watchViewport } from 'motionary/components/widgets';

const stop = watchViewport(() => console.log('keyboard or rotation changed'));
// … later
stop();
```

`watchViewport(fn?)` is shared and reference-counted (one set of listeners for the page): listeners are added
while at least one overlay is open (or a `<usa-pagination>` is mounted) and removed with the last one. The lite bundle
stays within its 70 KB budget.

## Rotation

`resize`, `orientationchange` and `visualViewport` `resize` all trigger the same update. What follows rotation:

- An open `<usa-bottom-sheet>` stays on the snap point it was on (its height and offset are recomputed for the new
  viewport); an open `<usa-drawer>` re-measures.
- `<usa-pagination>` re-places its ink on the current page (its buttons change size at the 420 px breakpoint).
- `<usa-gl-model>` now gets the same box styles as `<usa-gl-scene>`. Before, its canvas had no CSS width, so on a
  device with `devicePixelRatio` > 1 every resize made the canvas — and the element — wider (19 200 px wide at DPR 2.625
  in the mobile Chrome emulation), allocating ever larger GPU buffers.

## Touch

- Components use Pointer Events. A gesture the browser takes over ends with `pointercancel`: the browser suite checks
  that a cancelled touch on `<usa-bottom-sheet>` springs back to its snap point, and that a cancelled touch drag on every
  component leaves no uncaught error.
- `touch-action`: a bottom sheet whose content is longer than the sheet scrolls with a finger (`data-scrollable` →
  `touch-action: pan-y`), and the grab handle keeps the drag (`touch-action: none`); a sheet whose content fits keeps
  drag-anywhere. The `<usa-sheet side="bottom">` body scrolls with a finger; only its grab handle (`.usa-ov-grab` /
  `[data-handle]`) captures the gesture. (Before 13.3.0 both sheets set `touch-action: none` on the whole body, so long
  content could not be scrolled by touch.)
- Hover effects such as `<usa-cursor>`, `<usa-magnetic>` and the ripple / press handlers check `pointerType` and skip
  hover-only behaviour for touch.

## Native bridge security

`connectNativeShell()` (`motionary/components/bridge`) applies `usa:settings` messages from the host app. Since 13.3.0
a `window` `message` is accepted only when

- it comes from **this window** (script the host injected that calls `window.postMessage`), or
- it has **no source window** (native code, e.g. Android `postWebMessage`), or
- its exact origin is listed in `allowedOrigins`.

Messages from any other window — a cross-origin iframe, the opener, an embedding parent — are dropped. WebView2 host
messages arrive on `chrome.webview` and are not affected; `window.usaNative.apply()` (the recommended path for MAUI and
Flutter) is unchanged. String payloads over 8 KB are rejected before `JSON.parse`, and every field is still validated
(unknown fields dropped, colors / themes / levels checked).

```js
import { connectNativeShell, isTrustedMessage } from 'motionary/components/bridge';

// a page embedded by your own app shell at https://app.example
connectNativeShell({ allowedOrigins: ['https://app.example'] });

// the same rule for your own listeners
addEventListener('message', (e) => {
  if (!isTrustedMessage(e, ['https://app.example'])) return;
  // …
});
```

Opaque origins (`"null"`: sandboxed iframes, `file:` documents in some engines) never match an entry; `'*'` trusts
every window and is only for setups where every frame is yours. The Figma plugin UI likewise accepts messages only from
its parent (Figma) and escapes layer names and tags; the component playground already checked that messages come from its
own preview frame.

## How this is tested

- **Unit** (`test/mobile-security-13-3.test.ts`, jsdom): the watcher (variables, keyboard inset, pinch-zoom, reference
  counting, cleanup, no `visualViewport`), sheets on rotation and with the keyboard, the overlay / toast CSS, pagination,
  the bridge origin rules, and a scan that every `window` `message` listener in shipped code checks the sender.
- **Browser** (`test/browser/mobile.spec.mjs`, Playwright device emulation, CI jobs `Browser (chromium)` and
  `Browser (webkit)`):
  - `mobile-chrome` — Pixel 7 profile on Chromium: touch, `isMobile`, DPR 2.625, 412 × 839.
  - `mobile-safari` — iPhone 14 profile on **WebKit** (Playwright's WebKit build, the engine of iOS Safari): touch,
    `isMobile`, DPR 3, 390 × 664.
  - Covered: phone environment (coarse pointer, touch, DPR), tap, touch drag + `pointercancel` on the bottom sheet,
    `touch-action` of the sheets, rotation of an open sheet / pagination / every canvas component (no canvas or element
    growing past the screen under DPR > 1), the soft keyboard for `<usa-bottom-sheet>`, `<usa-sheet>`, `<usa-modal>` and
    bottom toasts, the bridge origin rules in a real engine (a sandboxed cross-origin iframe cannot change settings), and
    a sweep that mounts every manifest component on the phone, rotates it twice and cancels a touch drag on it without an
    uncaught error.

## Not verified

- **Real devices.** No physical Android or iOS device and no device cloud (BrowserStack / Sauce Labs / LambdaTest /
  AWS Device Farm need paid accounts) were used. Emulation gives the mobile viewport, DPR, touch events, `isMobile` and the
  mobile user agent, but **not** the real browsers' UI (address bar collapse), a real on-screen keyboard, real
  `orientationchange` timing, hardware GPUs, or iOS Safari itself — Playwright's WebKit is the same engine but not the
  shipped Safari app, and the Chromium build is desktop Chromium in mobile emulation, not Chrome for Android.
- **The soft keyboard** is simulated: the browser spec replaces `window.visualViewport` with a controllable one before
  the page loads. The arithmetic (`innerHeight − height − offsetTop`) matches what iOS Safari and Chrome for Android
  report, but the real keyboard was not opened.
- **Native hosts** (WebView2, MAUI, Flutter, Android WebView `postWebMessage`, WKWebView) were not run; the bridge rules
  are tested with the message shapes those hosts produce. The Figma plugin's `e.source === parent` check was not run
  inside Figma.
- Firefox for Android: Playwright has no Firefox mobile emulation; desktop Firefox runs the rest of the browser suite.
- **WebKit emulation quirks.** Playwright's WebKit reports `navigator.maxTouchPoints = 0` with touch enabled (touch events
  and `pointer: coarse` work), so that one check runs on mobile Chrome only. When a rotation resizes every component at
  once, WebKit reports "ResizeObserver loop completed with undelivered notifications." as a page error; the spec delivers
  those notifications in the next frame, so the every-component sweep ignores exactly that message. Which component's
  resize callback triggers it was not narrowed down.
