// Flutter + webview_flutter: sync MediaQuery.disableAnimations (reduce motion), brightness /
// high contrast and the accent color into the page (motionary 4.7+).
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const MaterialApp(home: UsaPage()));

class UsaPage extends StatefulWidget {
  const UsaPage({super.key});
  @override
  State<UsaPage> createState() => _UsaPageState();
}

class _UsaPageState extends State<UsaPage> with WidgetsBindingObserver {
  late final WebViewController _web;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      // The page posts {"type":"usa:ready"} / {"type":"usa:request-settings"} on this channel.
      ..addJavaScriptChannel('UsaBridge', onMessageReceived: (m) {
        final type = (jsonDecode(m.message) as Map)['type'];
        if (type == 'usa:ready' || type == 'usa:request-settings') {
          _ready = true;
          _sendSettings();
        }
      })
      ..loadFlutterAsset('assets/web/index.html');
  }

  // System accessibility / theme changed.
  @override
  void didChangeAccessibilityFeatures() => _sendSettings();
  @override
  void didChangePlatformBrightness() => _sendSettings();

  void _sendSettings() {
    if (!_ready || !mounted) return;
    final mq = MediaQuery.of(context);
    final settings = {
      'reducedMotion': mq.disableAnimations,
      'theme': mq.highContrast ? 'high-contrast' : (mq.platformBrightness == Brightness.dark ? 'dark' : 'light'),
      'accent': '#${Theme.of(context).colorScheme.primary.value.toRadixString(16).substring(2)}',
    };
    _web.runJavaScript('window.usaNative && window.usaNative.apply(${jsonEncode(settings)})');
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(body: SafeArea(child: WebViewWidget(controller: _web)));
}
