import { c as configureComponents, M as MOTION_SENSITIVITY_LEVELS } from '../chunks/base-nzeN_ux7.js';

/**
 * motionary/components/bridge — native shell bridges (4.7).
 *
 * Keeps the web UI in sync with the host app's system settings when it runs
 * inside **WinUI 3 / WPF (WebView2)**, **.NET MAUI** (WebView / HybridWebView)
 * or **Flutter** (webview_flutter / flutter_inappwebview): the native side
 * sends "reduce motion", light / dark / high-contrast theme and accent color;
 * the page applies them to every `<usa-*>` component.
 *
 * Protocol (JSON, both directions):
 * - native → web `{ "type": "usa:settings", "reducedMotion": true, "theme": "dark", "accent": "#0078d4", "sensitivity": "gentle" }`
 * - web → native `{ "type": "usa:ready", "version": 1 }` on connect, `{ "type": "usa:request-settings" }`
 *
 * Hosts that can only run script call `window.usaNative.apply({...})`.
 * Samples: examples/native/{winui3,maui,flutter}.
 */
const BRIDGE_PROTOCOL_VERSION = 1;
const win = () => (typeof window === 'undefined' ? null : window);
/** Which native shell (if any) hosts this page. */
function detectNativeHost(channel = 'UsaBridge') {
    const w = win();
    if (!w)
        return 'browser';
    if (w.chrome?.webview?.postMessage)
        return 'webview2';
    if (w.HybridWebView?.SendRawMessage || w.HybridWebView?.SendRawMessageToDotNet || /\bMAUI\b/i.test(w.navigator?.userAgent || ''))
        return 'maui';
    if (w.flutter_inappwebview?.callHandler || w[channel]?.postMessage)
        return 'flutter';
    if (w.__TAURI__ || w.__TAURI_INTERNALS__)
        return 'tauri';
    if (w.process?.versions?.electron || /Electron\//.test(w.navigator?.userAgent || ''))
        return 'electron';
    return 'browser';
}
/** Send a JSON message to the native host (no-op in a plain browser). Returns whether it was sent. */
function postToNative(message, channel = 'UsaBridge') {
    const w = win();
    if (!w)
        return false;
    const json = JSON.stringify(message);
    try {
        if (w.chrome?.webview?.postMessage)
            return w.chrome.webview.postMessage(message), true;
        if (w.HybridWebView?.SendRawMessage)
            return w.HybridWebView.SendRawMessage(json), true;
        if (w.HybridWebView?.SendRawMessageToDotNet)
            return w.HybridWebView.SendRawMessageToDotNet(json), true;
        if (w.flutter_inappwebview?.callHandler)
            return w.flutter_inappwebview.callHandler(channel, json), true;
        if (w[channel]?.postMessage)
            return w[channel].postMessage(json), true;
    }
    catch {
        /* host went away */
    }
    return false;
}
const THEMES = ['light', 'dark', 'high-contrast'];
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i;
/** Validate an incoming message (string or object); unknown fields are dropped. */
function parseNativeSettings(data) {
    let d = data;
    if (typeof d === 'string') {
        try {
            d = JSON.parse(d);
        }
        catch {
            return null;
        }
    }
    if (!d || typeof d !== 'object' || d.type !== 'usa:settings')
        return null;
    const out = {};
    if (typeof d.reducedMotion === 'boolean')
        out.reducedMotion = d.reducedMotion;
    if (THEMES.includes(d.theme))
        out.theme = d.theme;
    if (typeof d.accent === 'string' && COLOR.test(d.accent.trim()))
        out.accent = d.accent.trim();
    if (MOTION_SENSITIVITY_LEVELS.includes(d.sensitivity))
        out.sensitivity = d.sensitivity;
    return out;
}
/**
 * Apply native settings: reduce motion → `configureComponents({ reducedMotion: 'reduce' })`
 * (`false` → follow the media query again); theme → `data-theme`, `data-usa-contrast`
 * and `color-scheme`; accent → `--usa-accent`; sensitivity → `motionSensitivity`.
 */
function applyNativeSettings(s, root) {
    if (s.reducedMotion !== undefined)
        configureComponents({ reducedMotion: s.reducedMotion ? 'reduce' : 'user' });
    if (s.sensitivity)
        configureComponents({ motionSensitivity: s.sensitivity });
    const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
    if (!el)
        return;
    if (s.theme) {
        el.setAttribute('data-theme', s.theme === 'high-contrast' ? 'dark' : s.theme);
        el.toggleAttribute('data-usa-contrast', s.theme === 'high-contrast');
        el.style.colorScheme = s.theme === 'light' ? 'light' : 'dark';
    }
    if (s.accent)
        el.style.setProperty('--usa-accent', s.accent);
    if (typeof document !== 'undefined')
        document.dispatchEvent(new CustomEvent('usa:native-settings', { detail: s }));
}
/**
 * Connect to the native shell: listens for `usa:settings` messages
 * (WebView2 `chrome.webview` messages, `window.postMessage`, or
 * `window.usaNative.apply()`), applies them, then announces `usa:ready` and
 * asks for the current settings. Returns `{ host, disconnect }`.
 */
function connectNativeShell(options = {}) {
    const w = win();
    const channel = options.channel || 'UsaBridge';
    const host = detectNativeHost(channel);
    if (!w)
        return { host, disconnect: () => undefined };
    const handle = (data) => {
        const s = parseNativeSettings(data);
        if (!s)
            return;
        applyNativeSettings(s, options.root);
        options.onSettings?.(s, host);
    };
    const onMessage = (e) => handle(e.data);
    w.chrome?.webview?.addEventListener?.('message', onMessage);
    w.addEventListener?.('message', onMessage);
    const prev = w.usaNative;
    w.usaNative = { apply: (s) => handle({ ...s, type: 'usa:settings' }), version: BRIDGE_PROTOCOL_VERSION, host };
    postToNative({ type: 'usa:ready', version: BRIDGE_PROTOCOL_VERSION }, channel);
    postToNative({ type: 'usa:request-settings' }, channel);
    return {
        host,
        disconnect: () => {
            w.chrome?.webview?.removeEventListener?.('message', onMessage);
            w.removeEventListener?.('message', onMessage);
            w.usaNative = prev;
        },
    };
}

export { BRIDGE_PROTOCOL_VERSION, applyNativeSettings, connectNativeShell, detectNativeHost, parseNativeSettings, postToNative };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/components/bridge.js.map