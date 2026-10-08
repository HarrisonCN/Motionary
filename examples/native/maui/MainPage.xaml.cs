// .NET MAUI (Windows, Android, iOS, macOS) + WebView: sync reduce motion, theme and accent
// into the page (motionary 4.7+). MainPage.xaml: <WebView x:Name="Web" Source="index.html" />
// with examples/native/web/* in Resources/Raw.
using System.Text.Json;

namespace UsaNativeSample;

public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
        Web.Navigated += async (_, _) => await SendSettingsAsync();
        Application.Current!.RequestedThemeChanged += async (_, _) => await SendSettingsAsync();
    }

    private static bool ReduceMotion()
    {
#if ANDROID
        var resolver = Android.App.Application.Context.ContentResolver;
        return Android.Provider.Settings.Global.GetFloat(resolver, Android.Provider.Settings.Global.AnimatorDurationScale, 1f) == 0f;
#elif IOS || MACCATALYST
        return UIKit.UIAccessibility.IsReduceMotionEnabled;
#elif WINDOWS
        return !new Windows.UI.ViewManagement.UISettings().AnimationsEnabled;
#else
        return false;
#endif
    }

    private async Task SendSettingsAsync()
    {
        var theme = Application.Current!.RequestedTheme == AppTheme.Dark ? "dark" : "light";
        var json = JsonSerializer.Serialize(new { reducedMotion = ReduceMotion(), theme, accent = "#512bd4" });
        // window.usaNative is installed by connectNativeShell(); script injection works on every MAUI platform.
        await Web.EvaluateJavaScriptAsync($"window.usaNative && window.usaNative.apply({json})");
    }
}
