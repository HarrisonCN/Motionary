# Hybrid & desktop apps: MAUI, Flutter WebView, Electron, Tauri

`<usa-*>` components are plain Web Components (Custom Elements + CSS + Web Animations): anything that hosts a modern web view can run them, with **no bundler** if you want — copy `dist/components.umd.js` (and optionally `dist/components.css`) next to your HTML. For WinUI 3 / WPF / WinForms with WebView2 see [windows-apps.md](./windows-apps.md).

General rules for every host:

- **Load locally, not from a CDN**, so the app works offline and passes store review: ship `components.umd.js` as an asset and reference it with a relative URL.
- **Strict CSP is fine**: styles are adopted as constructable stylesheets. If you load `components.css` yourself, call `configureComponents({ injectStyles: false })`.
- **Reduced motion follows the OS** (`prefers-reduced-motion`) inside every web view listed here. To mirror an in-app setting, call `setMotionIntensity('off' | 'low' | 'normal' | 'high')` (or `configureComponents({ reducedMotion: 'reduce' })`) from the native side.
- **Performance**: canvas / WebGL effects (`<usa-shader>`, `<usa-liquid>`, backgrounds) render only while visible and cap DPR at 2; they fall back to CSS where WebGL is unavailable (some Android web views).
- **Native ↔ web**: listen to `usa:*` events in JS and forward them over the host bridge (examples below).

## .NET MAUI

MAUI 9+ has `HybridWebView` (raw HTML + JS bridge); `BlazorWebView` also works (Razor renders the tags; enable the elements in `wwwroot/index.html`).

```text
Resources/Raw/wwwroot/
  index.html
  components.umd.js     ← copied from node_modules/motionary/dist/
```

```xml
<!-- MainPage.xaml -->
<HybridWebView x:Name="Web" DefaultFile="index.html" RawMessageReceived="OnMessage" />
```

```html
<!-- Resources/Raw/wwwroot/index.html -->
<script src="components.umd.js"></script>
<script src="_framework/hybridwebview.js"></script>
<usa-switch id="t"></usa-switch>
<script>
  document.getElementById('t').addEventListener('usa:change', (e) =>
    window.HybridWebView.SendRawMessage(JSON.stringify({ checked: e.detail.checked })));
</script>
```

```csharp
void OnMessage(object s, HybridWebViewRawMessageReceivedEventArgs e) => Debug.WriteLine(e.Message);
// native → web
await Web.EvaluateJavaScriptAsync("UsaComponents.setMotionIntensity('low')");
```

Notes: Android uses the system WebView (Chromium) — keep it updated; iOS / Mac Catalyst use WKWebView (Safari engine), where `linear()` spring easings fall back to cubic-bezier automatically.

## Flutter (webview_flutter / flutter_inappwebview)

```yaml
# pubspec.yaml
dependencies:
  webview_flutter: ^4.10.0
flutter:
  assets:
    - assets/web/index.html
    - assets/web/components.umd.js
```

```dart
final controller = WebViewController()
  ..setJavaScriptMode(JavaScriptMode.unrestricted)
  ..addJavaScriptChannel('Usa', onMessageReceived: (m) => debugPrint(m.message))
  ..loadFlutterAsset('assets/web/index.html');

// native → web (e.g. follow the platform's "reduce motion" setting)
final reduce = MediaQuery.of(context).disableAnimations;
controller.runJavaScript("UsaComponents.setMotionIntensity('${reduce ? 'off' : 'normal'}')");
```

```html
<!-- assets/web/index.html -->
<script src="components.umd.js"></script>
<usa-like id="like"></usa-like>
<script>
  document.getElementById('like').addEventListener('usa:change', (e) => Usa.postMessage(JSON.stringify(e.detail)));
</script>
```

`loadFlutterAsset` serves from a `file://`-like origin; ES-module builds (`components.js`) need an HTTP origin, so prefer the UMD file here. On Flutter Web you can use the components directly in `web/index.html` via `HtmlElementView`.

## Electron

The renderer is Chromium — use the npm package with your bundler, or the UMD file without one.

```js
// renderer.js (bundled)
import { defineComponents, configureComponents } from 'motionary/components';
configureComponents({ injectStyles: true });
defineComponents();
```

```js
// main.js — keep contextIsolation on; expose only what you need
new BrowserWindow({ webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true } });
```

```js
// preload.js — forward component events to the main process
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('usaBridge', { send: (type, detail) => ipcRenderer.send('usa', type, detail) });
```

Imports are SSR-safe (no `window` access at import time), so the same modules can be imported in preload scripts.

## Tauri (v2)

```js
// src/main.js (Vite)
import { defineComponents } from 'motionary/components';
import { invoke } from '@tauri-apps/api/core';
defineComponents();
document.querySelector('usa-switch').addEventListener('usa:change', (e) => invoke('set_setting', { on: e.detail.checked }));
```

```json
// tauri.conf.json — a strict CSP works (constructable stylesheets)
{ "app": { "security": { "csp": "default-src 'self'; style-src 'self'; script-src 'self'" } } }
```

Tauri uses WebView2 on Windows, WKWebView on macOS / iOS and WebKitGTK on Linux. WebKitGTK may disable WebGL on some drivers: WebGL components then set `data-fallback="webgl"` and show their CSS fallback.

## Native shell bridge (4.7)

`motionary/components/bridge` keeps the page in sync with the host app's **system settings** — reduce motion, light / dark / high-contrast theme, accent color — on WinUI 3 / WPF (WebView2), .NET MAUI and Flutter:

```js
import { connectNativeShell } from 'motionary/components/bridge';
const { host } = connectNativeShell();   // 'webview2' | 'maui' | 'flutter' | 'electron' | 'tauri' | 'browser'
```

Protocol (JSON): the page sends `{"type":"usa:ready","version":1}` and `{"type":"usa:request-settings"}`; the host answers (and re-sends on every system change) with `{"type":"usa:settings","reducedMotion":true,"theme":"dark","accent":"#0078d4","sensitivity":"gentle"}` — via `PostWebMessageAsJson` (WebView2), `window.postMessage`, or by running `window.usaNative.apply({...})`. Incoming values are validated (unknown fields and non-color accents are dropped); settings only affect presentation.

Complete samples: [examples/native](../examples/native/) — `winui3/MainWindow.xaml.cs` (`UISettings.AnimationsEnabled`, accent, high contrast), `maui/MainPage.xaml.cs` (Android animator scale, iOS Reduce Motion, Windows `UISettings`, `RequestedThemeChanged`), `flutter/lib/main.dart` (`MediaQuery.disableAnimations`, brightness, high contrast via a `UsaBridge` JavaScriptChannel).

Helpers: `detectNativeHost()`, `postToNative(msg)`, `parseNativeSettings(data)`, `applyNativeSettings(settings)`; event `usa:native-settings` on `document`.

## Framework wrappers

| Framework | Entry | What it gives you |
|---|---|---|
| React | `motionary/components/react` | `createUsaComponents(React)` typed wrappers |
| Vue | `motionary/components/vue` | `UsaPlugin`, `isUsaElement` |
| Svelte | `motionary/components/svelte` | `use:usa={{ props, on }}` action, `defineUsa()` |
| Solid | `motionary/components/solid` | `use:usa` directive, `defineUsa()`, JSX types |
| Angular | `motionary/components/angular` | `usaInitializer()` for `APP_INITIALIZER`, `usaDetail()`; use `CUSTOM_ELEMENTS_SCHEMA` |
