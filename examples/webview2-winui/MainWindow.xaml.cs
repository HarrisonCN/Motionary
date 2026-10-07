using System;
using System.IO;
using Microsoft.UI.Xaml;
using Microsoft.Web.WebView2.Core;

namespace UsaDemo;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        ExtendsContentIntoTitleBar = true;
        _ = InitAsync();
    }

    private async System.Threading.Tasks.Task InitAsync()
    {
        await Web.EnsureCoreWebView2Async();
        // Let the Mica backdrop show through the page.
        Web.DefaultBackgroundColor = Microsoft.UI.Colors.Transparent;
        var root = Path.Combine(AppContext.BaseDirectory, "wwwroot");
        // Serve wwwroot from a real origin: https://app.local/
        Web.CoreWebView2.SetVirtualHostNameToFolderMapping("app.local", root, CoreWebView2HostResourceAccessKind.DenyCors);
        Web.CoreWebView2.Settings.AreDevToolsEnabled = true;
        Web.Source = new Uri("https://app.local/index.html");
    }
}
