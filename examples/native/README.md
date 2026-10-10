# Native shell bridges (4.7)

One web page (`web/index.html`) + three hosts that keep it in sync with the operating system:

| Host | Reduce motion source | Theme / accent | Transport |
|---|---|---|---|
| **WinUI 3** (`winui3/`) | `UISettings.AnimationsEnabled` (+ change event) | `UISettings` colors, `AccessibilitySettings.HighContrast` | `CoreWebView2.PostWebMessageAsJson` ⇄ `chrome.webview.postMessage` |
| **.NET MAUI** (`maui/`) | Android `ANIMATOR_DURATION_SCALE`, iOS `UIAccessibility.IsReduceMotionEnabled`, Windows `UISettings` | `Application.RequestedTheme` (+ `RequestedThemeChanged`) | `WebView.EvaluateJavaScriptAsync("window.usaNative.apply(…)")` |
| **Flutter** (`flutter/`) | `MediaQuery.disableAnimations` (+ `didChangeAccessibilityFeatures`) | `platformBrightness`, `highContrast`, `colorScheme.primary` | `JavaScriptChannel('UsaBridge')` ⇄ `runJavaScript("window.usaNative.apply(…)")` |

The page calls `connectNativeShell()` from `motionary/components/bridge` (also on `UsaComponents` in the UMD build). It announces `{"type":"usa:ready"}`, then applies every `{"type":"usa:settings", reducedMotion, theme, accent, sensitivity}` it receives. See [docs/hybrid-apps.md](../../docs/hybrid-apps.md#native-shell-bridge-47).

Mini programs and native HarmonyOS ArkUI: see [../miniapp](../miniapp), [../harmony-arkts](../harmony-arkts) and [docs/cross-platform.md](../../docs/cross-platform.md).
