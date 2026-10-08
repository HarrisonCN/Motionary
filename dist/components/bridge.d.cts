type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';

/**
 * use-scroll-animate/components/bridge — native shell bridges (4.7).
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

type NativeHost = 'webview2' | 'maui' | 'flutter' | 'electron' | 'tauri' | 'browser';
type NativeTheme = 'light' | 'dark' | 'high-contrast';
interface NativeSettings {
    reducedMotion?: boolean;
    theme?: NativeTheme;
    /** CSS color (`#0078d4`, `rgb(…)`). */
    accent?: string;
    /** Optional finer level (4.4). */
    sensitivity?: MotionSensitivity;
}
interface NativeShellOptions {
    /** Element that gets `data-theme` / `color-scheme` / `--usa-accent` (default `<html>`). */
    root?: HTMLElement;
    /** Flutter JavaScriptChannel name (default `UsaBridge`). */
    channel?: string;
    /** Called after settings are applied. */
    onSettings?: (settings: NativeSettings, host: NativeHost) => void;
}
declare const BRIDGE_PROTOCOL_VERSION = 1;
/** Which native shell (if any) hosts this page. */
declare function detectNativeHost(channel?: string): NativeHost;
/** Send a JSON message to the native host (no-op in a plain browser). Returns whether it was sent. */
declare function postToNative(message: Record<string, unknown>, channel?: string): boolean;
/** Validate an incoming message (string or object); unknown fields are dropped. */
declare function parseNativeSettings(data: unknown): NativeSettings | null;
/**
 * Apply native settings: reduce motion → `configureComponents({ reducedMotion: 'reduce' })`
 * (`false` → follow the media query again); theme → `data-theme`, `data-usa-contrast`
 * and `color-scheme`; accent → `--usa-accent`; sensitivity → `motionSensitivity`.
 */
declare function applyNativeSettings(s: NativeSettings, root?: HTMLElement): void;
/**
 * Connect to the native shell: listens for `usa:settings` messages
 * (WebView2 `chrome.webview` messages, `window.postMessage`, or
 * `window.usaNative.apply()`), applies them, then announces `usa:ready` and
 * asks for the current settings. Returns `{ host, disconnect }`.
 */
declare function connectNativeShell(options?: NativeShellOptions): {
    host: NativeHost;
    disconnect: () => void;
};

export { BRIDGE_PROTOCOL_VERSION, applyNativeSettings, connectNativeShell, detectNativeHost, parseNativeSettings, postToNative };
export type { NativeHost, NativeSettings, NativeShellOptions, NativeTheme };
