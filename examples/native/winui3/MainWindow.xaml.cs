// WinUI 3 + WebView2: sync "Animation effects" (Settings → Accessibility → Visual effects),
// light / dark / high-contrast theme and the accent color into the page (motionary 4.7+).
// MainWindow.xaml: <WebView2 x:Name="Web" />  — wwwroot = examples/native/web.
using System;
using System.IO;
using System.Text.Json;
using Microsoft.UI.Xaml;
using Microsoft.Web.WebView2.Core;
using Windows.UI.ViewManagement;

namespace UsaNativeSample;

public sealed partial class MainWindow : Window
{
    private readonly UISettings _ui = new();
    private readonly AccessibilitySettings _a11y = new();

    public MainWindow()
    {
        InitializeComponent();
        _ = InitAsync();
    }

    private async System.Threading.Tasks.Task InitAsync()
    {
        await Web.EnsureCoreWebView2Async();
        var root = Path.Combine(AppContext.BaseDirectory, "wwwroot");
        Web.CoreWebView2.SetVirtualHostNameToFolderMapping("app.local", root, CoreWebView2HostResourceAccessKind.DenyCors);

        // The page sends {"type":"usa:ready"} / {"type":"usa:request-settings"} on connect.
        Web.CoreWebView2.WebMessageReceived += (_, e) =>
        {
            using var doc = JsonDocument.Parse(e.WebMessageAsJson);
            var type = doc.RootElement.TryGetProperty("type", out var t) ? t.GetString() : null;
            if (type is "usa:ready" or "usa:request-settings") SendSettings();
        };
        // Re-send whenever Windows settings change.
        _ui.AnimationsEnabledChanged += (_, _) => DispatcherQueue.TryEnqueue(SendSettings);
        _ui.ColorValuesChanged += (_, _) => DispatcherQueue.TryEnqueue(SendSettings);
        _a11y.HighContrastChanged += (_, _) => DispatcherQueue.TryEnqueue(SendSettings);

        Web.Source = new Uri("https://app.local/index.html");
    }

    private void SendSettings()
    {
        var bg = _ui.GetColorValue(UIColorType.Background);
        var accent = _ui.GetColorValue(UIColorType.Accent);
        var theme = _a11y.HighContrast ? "high-contrast" : (bg.R < 128 ? "dark" : "light");
        var json = JsonSerializer.Serialize(new
        {
            type = "usa:settings",
            reducedMotion = !_ui.AnimationsEnabled,
            theme,
            accent = $"#{accent.R:x2}{accent.G:x2}{accent.B:x2}",
        });
        Web.CoreWebView2?.PostWebMessageAsJson(json);
    }
}
