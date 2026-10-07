# Using the components in Windows desktop apps

The `<usa-*>` components are plain web platform code (Custom Elements v1, CSS, Web Animations API). Any Windows app whose UI is rendered by a modern web engine can use them unchanged:

| Stack | Engine on Windows | Works | Notes |
|---|---|---|---|
| **Electron** | Chromium (bundled) | ✅ | All features, incl. View Transitions. |
| **Tauri 1/2** | Microsoft Edge **WebView2** (Chromium) | ✅ | Same as Edge. |
| **WinUI 3 / WPF / WinForms + WebView2** | WebView2 | ✅ | Host a local HTML page (see below). |
| **.NET MAUI / Blazor Hybrid** | `BlazorWebView` → WebView2 | ✅ | Register in `wwwroot/index.html`. |
| **Installed PWA** (Edge / Chrome "Install app") | Edge / Chrome | ✅ | Runs in its own window with taskbar icon. |
| Neutralino, Wails, Flutter `webview_windows` | WebView2 | ✅ | Any WebView2-based shell. |
| Legacy MSHTML (`WebBrowser` control, IE11) | Trident | ❌ | No Custom Elements / WAAPI — migrate to WebView2. |

Requirements: Custom Elements, `IntersectionObserver` and `Element.animate()` — every Chromium ≥ 84 (all supported Electron/WebView2 versions). `viewTransition()` uses the View Transitions API (Chromium ≥ 111) and falls back to a cross-fade.

Every component respects the Windows setting **Settings → Accessibility → Visual effects → Animation effects** (exposed to web views as `prefers-reduced-motion`), and `<usa-acrylic>` turns solid when **Transparency effects** are off or a high-contrast theme is active (`prefers-reduced-transparency`, `forced-colors`).

## Electron

Bundle the renderer as usual (Vite, webpack, esbuild…):

```js
// renderer/main.js
import { defineComponents, toast } from 'use-scroll-animate/components';
defineComponents();

window.api?.onSaved?.(() => toast('Saved', { type: 'success' }));
```

```html
<!-- renderer/index.html -->
<usa-acrylic variant="mica" style="min-height:100vh">
  <usa-view-switch active="home">
    <section data-view="home"><usa-typewriter words="Welcome back"></usa-typewriter></section>
    <section data-view="settings"><usa-toggle checked>Start with Windows</usa-toggle></section>
  </usa-view-switch>
</usa-acrylic>
```

Without a bundler, copy `node_modules/use-scroll-animate/dist/components.umd.js` next to your HTML and use `<script src="components.umd.js"></script>` — no `nodeIntegration` needed, it works with `contextIsolation: true` and `sandbox: true`.

**Content-Security-Policy.** Components inject styles via constructable stylesheets (`document.adoptedStyleSheets`), which are allowed by `style-src 'self'` without `'unsafe-inline'`. If you prefer files:

```js
import 'use-scroll-animate/components.css';
import { configureComponents, defineComponents } from 'use-scroll-animate/components';
configureComponents({ injectStyles: false });
defineComponents();
```

`<usa-grain>` and `<usa-acrylic>` use `data:` SVG noise images — allow `img-src 'self' data:`.

**Real Windows materials.** Electron ≥ 24 can draw real Mica / Acrylic behind a transparent window (`new BrowserWindow({ backgroundMaterial: 'mica' })`). Set the page background to transparent and use `<usa-acrylic tint-opacity="0.2">` for in-page panels on top of it.

## Tauri

```ts
// src/main.ts (Vite template)
import { defineFeedbackComponents } from 'use-scroll-animate/components/feedback';
import { defineTransitionComponents } from 'use-scroll-animate/components/transitions';
defineFeedbackComponents();
defineTransitionComponents();
```

Nothing to configure in `tauri.conf.json`. For window-level Mica/Acrylic use Tauri's `windowEffects` (`"effects": ["mica"]`) with `"transparent": true`.

## WinUI 3 / WPF / WinForms with WebView2

1. Put your page and the bundle in a folder that is copied to the output, e.g. `wwwroot/index.html` and `wwwroot/components.umd.js` (from `node_modules/use-scroll-animate/dist/`, or download it from unpkg).
2. Map the folder to a virtual host and navigate to it:

```csharp
// WinUI 3 (C#)
await MyWebView.EnsureCoreWebView2Async();
MyWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
    "app.local", Path.Combine(AppContext.BaseDirectory, "wwwroot"),
    CoreWebView2HostResourceAccessKind.Allow);
MyWebView.Source = new Uri("https://app.local/index.html");
```

```html
<!-- wwwroot/index.html -->
<!doctype html>
<meta name="color-scheme" content="light dark">
<script src="components.umd.js"></script>
<usa-progress id="p" value="0" label="Installing"></usa-progress>
<usa-spinner variant="fluent"></usa-spinner>
<script>
  // messages from C#: CoreWebView2.PostWebMessageAsJson("{\"progress\":42}")
  chrome.webview.addEventListener('message', (e) => (p.value = e.data.progress));
</script>
```

Talk back to the host with `chrome.webview.postMessage(...)` from component events, e.g.
`dialog.addEventListener('usa:close', (e) => chrome.webview.postMessage({ closed: e.detail.returnValue }))`.

For a transparent WebView2 over a Mica window, set `DefaultBackgroundColor` to `Transparent` and keep the page background transparent.

## PWA

Link the bundle (or import it in your module graph) and install the site from Edge/Chrome. Add `"display": "standalone"` (or `"window-controls-overlay"` for a custom title bar) to the manifest; the components behave exactly as on the web.

## Performance checklist for desktop UIs

- Register only what you use (`define<Category>Components()` or single `define*()` calls) to keep start-up light.
- Background effects (`<usa-aurora>`, `<usa-particles>`, `<usa-marquee>`) stop animating when off-screen and when the window is hidden/minimised (`document.hidden`).
- All motion runs on the compositor (`transform` / `opacity`), so it stays smooth on integrated GPUs and in battery-saver mode; call `configureComponents({ reducedMotion: 'reduce' })` to force the calm variants (e.g. for a "Reduce animations" toggle in your app settings).
