# WinUI 3 + WebView2 sample — `<usa-*>` components in a Windows app

A minimal WinUI 3 (Windows App SDK) desktop app that hosts a local web UI in
**WebView2** and uses `use-scroll-animate/components` with the **Fluent preset**
(`fluentPreset()`: Fluent variant, Mica-style background, Acrylic, Reveal highlight).

```
webview2-winui/
├─ UsaDemo.csproj         Windows App SDK + WebView2 (net8.0-windows10.0.19041.0)
├─ App.xaml(.cs)          app entry
├─ MainWindow.xaml(.cs)   Mica backdrop + full-window WebView2, virtual host mapping
└─ wwwroot/index.html     the web UI (loads components.umd.js, no build step)
```

## Run

1. Windows 10 1809+ / Windows 11, Visual Studio 2022 with the *Windows App SDK* workload (or `dotnet` 8 SDK).
2. Copy `node_modules/use-scroll-animate/dist/components.umd.js` (or download it from unpkg) into `wwwroot/`.
3. `dotnet run` (or F5 in Visual Studio).

`MainWindow.xaml.cs` maps `https://app.local/` to the `wwwroot` folder with
`SetVirtualHostNameToFolderMapping`, so the page is served from disk with a
real origin (CSP, `localStorage` and View Transitions work). The window uses
the system **Mica** backdrop; the page sets `background: transparent` so it
shows through (`DefaultBackgroundColor = Transparent`).

Reduced motion follows Windows *Settings → Accessibility → Visual effects →
Animation effects* (WebView2 reports it as `prefers-reduced-motion`), and the
in-app `<usa-motion-switch>` lets users pick Off / Low / Normal / High.
