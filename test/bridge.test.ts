import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { detectNativeHost, postToNative, parseNativeSettings, applyNativeSettings, connectNativeShell, BRIDGE_PROTOCOL_VERSION } from '../src/components/bridge';
import { configureComponents, prefersReducedMotion, getMotionSensitivity } from '../src/components/base';

const w = window as any;
const root = resolve(__dirname, '..');

describe('native shell bridge (4.7)', () => {
  afterEach(() => {
    delete w.chrome;
    delete w.HybridWebView;
    delete w.UsaBridge;
    delete w.flutter_inappwebview;
    delete w.usaNative;
    configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' });
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-usa-contrast');
    document.documentElement.removeAttribute('style');
  });

  it('detects WebView2, MAUI, Flutter and plain browsers', () => {
    expect(detectNativeHost()).toBe('browser');
    w.UsaBridge = { postMessage: vi.fn() };
    expect(detectNativeHost()).toBe('flutter');
    w.HybridWebView = { SendRawMessage: vi.fn() };
    expect(detectNativeHost()).toBe('maui');
    w.chrome = { webview: { postMessage: vi.fn() } };
    expect(detectNativeHost()).toBe('webview2');
  });

  it('posts JSON through the host transport', () => {
    expect(postToNative({ type: 'x' })).toBe(false);
    w.UsaBridge = { postMessage: vi.fn() };
    expect(postToNative({ type: 'usa:ready' })).toBe(true);
    expect(w.UsaBridge.postMessage).toHaveBeenCalledWith('{"type":"usa:ready"}');
    w.chrome = { webview: { postMessage: vi.fn() } };
    postToNative({ type: 'usa:ready' });
    expect(w.chrome.webview.postMessage).toHaveBeenCalledWith({ type: 'usa:ready' });
  });

  it('validates incoming settings and drops anything unexpected', () => {
    expect(parseNativeSettings('{"type":"usa:settings","reducedMotion":true,"theme":"dark","accent":"#0078d4","sensitivity":"gentle","evil":"<script>"}')).toEqual({ reducedMotion: true, theme: 'dark', accent: '#0078d4', sensitivity: 'gentle' });
    expect(parseNativeSettings({ type: 'usa:settings', theme: 'purple', accent: 'url(javascript:alert(1))', reducedMotion: 'yes' })).toEqual({});
    expect(parseNativeSettings({ type: 'other' })).toBeNull();
    expect(parseNativeSettings('not json')).toBeNull();
  });

  it('applies reduce motion, theme, high contrast and accent', () => {
    const seen: any[] = [];
    document.addEventListener('usa:native-settings', (e: any) => seen.push(e.detail), { once: true });
    applyNativeSettings({ reducedMotion: true, theme: 'high-contrast', accent: '#ff0000' });
    const html = document.documentElement;
    expect(prefersReducedMotion()).toBe(true);
    expect(html.getAttribute('data-theme')).toBe('dark');
    expect(html.hasAttribute('data-usa-contrast')).toBe(true);
    expect(html.style.getPropertyValue('--usa-accent')).toBe('#ff0000');
    applyNativeSettings({ reducedMotion: false, theme: 'light', sensitivity: 'minimal' });
    expect(html.style.colorScheme).toBe('light');
    expect(getMotionSensitivity()).toBe('minimal');
    expect(seen).toHaveLength(1);
  });

  it('connectNativeShell: announces ready, applies WebView2 messages and window.usaNative.apply', () => {
    let listener: any = null;
    w.chrome = { webview: { postMessage: vi.fn(), addEventListener: (_: string, fn: any) => (listener = fn), removeEventListener: vi.fn() } };
    const onSettings = vi.fn();
    const { host, disconnect } = connectNativeShell({ onSettings });
    expect(host).toBe('webview2');
    expect(w.chrome.webview.postMessage).toHaveBeenCalledWith({ type: 'usa:ready', version: BRIDGE_PROTOCOL_VERSION });
    expect(w.chrome.webview.postMessage).toHaveBeenCalledWith({ type: 'usa:request-settings' });
    listener({ data: { type: 'usa:settings', theme: 'dark' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    w.usaNative.apply({ reducedMotion: true });
    expect(prefersReducedMotion()).toBe(true);
    expect(onSettings).toHaveBeenCalledTimes(2);
    disconnect();
    expect(w.usaNative).toBeUndefined();
  });

  it('ships WinUI 3, MAUI and Flutter samples that speak the protocol', () => {
    const f = (p: string) => readFileSync(resolve(root, 'examples/native', p), 'utf8');
    expect(f('winui3/MainWindow.xaml.cs')).toMatch(/PostWebMessageAsJson[\s\S]*AnimationsEnabled|AnimationsEnabled[\s\S]*PostWebMessageAsJson/);
    expect(f('maui/MainPage.xaml.cs')).toContain('window.usaNative.apply');
    expect(f('flutter/lib/main.dart')).toContain("addJavaScriptChannel('UsaBridge'");
    expect(f('flutter/lib/main.dart')).toContain('disableAnimations');
    expect(f('web/index.html')).toContain('connectNativeShell');
    expect(existsSync(resolve(root, 'examples/native/README.md'))).toBe(true);
  });
});
