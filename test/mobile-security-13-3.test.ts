// 13.3.0 "移动端兼容与安全" — mobile viewport (soft keyboard via visualViewport, rotation), touch-friendly sheets,
// and native bridge message origin validation. Real-engine coverage: test/browser/mobile.spec.mjs (mobile Chrome /
// mobile Safari emulation). docs/mobile.md
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { installComponentMocks, mount, tick } from './components-setup';
import { defineUiComponents } from '../src/components/ui';
import * as base from '../src/components/base';
import * as bridge from '../src/components/bridge';
import * as components from '../src/components';
import { defineSheet, defineModal, defineToastStack } from '../src/components/widgets';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const w = window as any;
const html = () => document.documentElement.style;

/** A controllable stand-in for window.visualViewport (jsdom has none; real engines are covered by the browser spec). */
class FakeVV extends EventTarget {
  height = 800;
  width = 400;
  offsetTop = 0;
  offsetLeft = 0;
  scale = 1;
  set(o: Partial<{ height: number; offsetTop: number; scale: number }>) {
    Object.assign(this, o);
    this.dispatchEvent(new Event('resize'));
  }
}
let vv: FakeVV;

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  w.innerHeight = 800;
  vv = new FakeVV();
  w.visualViewport = vv;
  html().removeProperty('--usa-kb');
  html().removeProperty('--usa-vvh');
});
afterEach(() => {
  vi.useRealTimers();
  delete w.visualViewport;
  delete w.chrome;
  delete w.usaNative;
  base.configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' });
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
});

describe('watchViewport — soft keyboard and rotation (13.3.0)', () => {
  const watch = () => (base as any).watchViewport as (fn?: () => void) => () => void;

  it('is exported from base and from motionary/components', () => {
    expect(typeof (base as any).watchViewport).toBe('function');
    expect(typeof (components as any).watchViewport).toBe('function');
  });

  it('publishes the visible height and the keyboard inset as CSS variables on <html>', () => {
    const stop = watch()();
    expect(html().getPropertyValue('--usa-vvh')).toBe('800px');
    expect(html().getPropertyValue('--usa-kb')).toBe('0px');
    vv.set({ height: 500 }); // soft keyboard takes 300px of an 800px layout viewport
    expect(html().getPropertyValue('--usa-vvh')).toBe('500px');
    expect(html().getPropertyValue('--usa-kb')).toBe('300px');
    vv.set({ height: 500, offsetTop: 120 }); // iOS scrolls the visual viewport to keep the caret visible
    expect(html().getPropertyValue('--usa-kb')).toBe('180px');
    stop();
  });

  it('a pinch-zoom (scale > 1) is not mistaken for a keyboard', () => {
    const stop = watch()();
    vv.set({ height: 400, scale: 2 });
    expect(html().getPropertyValue('--usa-kb')).toBe('0px');
    stop();
  });

  it('calls subscribers on visualViewport resize, window resize and orientationchange', () => {
    const fn = vi.fn();
    const stop = watch()(fn);
    fn.mockClear();
    vv.set({ height: 600 });
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('orientationchange'));
    expect(fn).toHaveBeenCalledTimes(3);
    stop();
    window.dispatchEvent(new Event('orientationchange'));
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('is shared and reference-counted: the last unsubscribe removes every listener and both variables', () => {
    const addW = vi.spyOn(window, 'addEventListener'), remW = vi.spyOn(window, 'removeEventListener');
    const addV = vi.spyOn(vv, 'addEventListener'), remV = vi.spyOn(vv, 'removeEventListener');
    const a = watch()(), b = watch()();
    const added = addW.mock.calls.length + addV.mock.calls.length;
    expect(added).toBeGreaterThan(0);
    a();
    expect(html().getPropertyValue('--usa-vvh')).toBe('800px');
    b();
    expect(remW.mock.calls.length + remV.mock.calls.length).toBe(added);
    expect(html().getPropertyValue('--usa-vvh')).toBe('');
    expect(html().getPropertyValue('--usa-kb')).toBe('');
    b(); // idempotent
    addW.mockRestore(); remW.mockRestore();
  });

  it('works without visualViewport (older engines): falls back to innerHeight', () => {
    delete w.visualViewport;
    const stop = watch()();
    expect(html().getPropertyValue('--usa-vvh')).toBe('800px');
    expect(html().getPropertyValue('--usa-kb')).toBe('0px');
    stop();
  });
});

describe('<usa-bottom-sheet> / <usa-drawer> on phones (13.3.0)', () => {
  beforeEach(() => defineUiComponents());

  it('keeps its snap point when the screen rotates (height and offset follow the new viewport)', async () => {
    vi.useFakeTimers();
    w.innerHeight = 1000;
    vv.height = 1000;
    const s = mount<any>('<usa-bottom-sheet snap="0.4,0.8" start="0"><p>x</p></usa-bottom-sheet>');
    s.open = true;
    await vi.advanceTimersByTimeAsync(3000);
    expect(s.style.height).toBe('800px');
    expect(s.style.transform).toBe('translateY(400.0px)');
    // portrait → landscape
    w.innerHeight = 500;
    vv.height = 500;
    window.dispatchEvent(new Event('orientationchange'));
    await vi.advanceTimersByTimeAsync(100);
    expect(s.style.height).toBe('400px');
    expect(s.style.transform).toBe('translateY(200.0px)');
  });

  it('sizes to the visible area while the soft keyboard is open and sits on top of it', async () => {
    vi.useFakeTimers();
    w.innerHeight = 1000;
    vv.height = 1000;
    const s = mount<any>('<usa-bottom-sheet snap="0.4,0.8" start="1"><input></usa-bottom-sheet>');
    s.open = true;
    await vi.advanceTimersByTimeAsync(3000);
    expect(s.style.transform).toBe('translateY(0.0px)');
    vv.set({ height: 600 });
    await vi.advanceTimersByTimeAsync(100);
    expect(s.style.height).toBe('480px');
    expect(html().getPropertyValue('--usa-kb')).toBe('400px');
    expect(read('src/components/ui/sheet.css')).toMatch(/usa-bottom-sheet\s*\{[^}]*bottom:\s*var\(--usa-kb,\s*0px\)/);
  });

  it('a drawer stays above the keyboard too', () => {
    expect(read('src/components/ui/sheet.css')).toMatch(/usa-drawer\s*\{[^}]*bottom:\s*var\(--usa-kb,\s*0px\)/);
  });

  it('watches the viewport only while open', async () => {
    vi.useFakeTimers();
    base.configureComponents({ reducedMotion: 'reduce' });
    const s = mount<any>('<usa-bottom-sheet><p>x</p></usa-bottom-sheet>');
    await vi.advanceTimersByTimeAsync(100);
    expect(html().getPropertyValue('--usa-vvh')).toBe('');
    s.open = true;
    await vi.advanceTimersByTimeAsync(100);
    expect(html().getPropertyValue('--usa-vvh')).toBe('800px');
    s.open = false;
    await vi.advanceTimersByTimeAsync(3000);
    expect(s.hidden).toBe(true);
    expect(html().getPropertyValue('--usa-vvh')).toBe('');
    s.open = true;
    await vi.advanceTimersByTimeAsync(100);
    s.remove();
    expect(html().getPropertyValue('--usa-vvh')).toBe('');
  });

  it('touch: scrollable content can be scrolled with a finger; the handle still drags', async () => {
    vi.useFakeTimers();
    const s = mount<any>('<usa-bottom-sheet><div style="height:3000px">long</div></usa-bottom-sheet>');
    Object.defineProperty(s, 'scrollHeight', { configurable: true, get: () => 3000 });
    Object.defineProperty(s, 'clientHeight', { configurable: true, get: () => 700 });
    s.open = true;
    await vi.advanceTimersByTimeAsync(100);
    expect(s.hasAttribute('data-scrollable')).toBe(true);
    expect(read('src/components/ui/sheet.css')).toMatch(/usa-bottom-sheet\[data-scrollable\]\s*\{[^}]*touch-action:\s*pan-y/);
    expect(read('src/components/ui/sheet.css')).toMatch(/\.usa-sheet-handle\s*\{[^}]*touch-action:\s*none/);
  });

  it('touch: a sheet whose content fits keeps drag-anywhere (touch-action none from CSS)', async () => {
    vi.useFakeTimers();
    const s = mount<any>('<usa-bottom-sheet><p>short</p></usa-bottom-sheet>');
    s.open = true;
    await vi.advanceTimersByTimeAsync(100);
    expect(s.hasAttribute('data-scrollable')).toBe(false);
  });
});

describe('<usa-sheet> / <usa-modal> / <usa-toast-stack> on phones (13.3.0)', () => {
  const css = () => read('src/components/widgets/overlay.css');
  beforeEach(() => {
    defineSheet();
    defineModal();
    defineToastStack();
    (HTMLDialogElement.prototype as any).showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
  });

  it('bottom sheet sits on top of the soft keyboard and fits the visible height', () => {
    expect(css()).toMatch(/usa-sheet\[data-side="bottom"\] \.usa-sheet-panel\{[^}]*inset:auto 0 var\(--usa-kb,0px\) 0/);
    expect(css()).toMatch(/usa-sheet\[data-side="bottom"\] \.usa-sheet-panel\{[^}]*max-height:calc\(var\(--usa-vvh,100vh\) \* \.85\)/);
  });

  it('a modal centres in the area the keyboard leaves visible', () => {
    expect(css()).toMatch(/\.usa-ov\{[^}]*bottom:var\(--usa-kb,0px\)/);
    expect(css()).toMatch(/\.usa-ov-body\{[^}]*max-height:min\(88vh,calc\(var\(--usa-vvh,100vh\) - 24px\)\)/);
  });

  it('touch: the bottom sheet body scrolls with a finger (touch-action none only on the grab handle)', () => {
    expect(css()).not.toMatch(/usa-sheet\[data-side="bottom"\] \.usa-ov-body\{[^}]*touch-action:none/);
    expect(css()).toMatch(/(\.usa-ov-grab|\[data-handle\])[^{]*\{[^}]*touch-action:none/);
  });

  it('open overlays watch the viewport; closing releases it', async () => {
    const s = mount<any>('<usa-sheet side="bottom"><input></usa-sheet>');
    await tick();
    expect(html().getPropertyValue('--usa-vvh')).toBe('');
    s.show();
    expect(html().getPropertyValue('--usa-vvh')).toBe('800px');
    vv.set({ height: 450 });
    expect(html().getPropertyValue('--usa-kb')).toBe('350px');
    await s.close();
    expect(html().getPropertyValue('--usa-vvh')).toBe('');
  });

  it('toasts at the bottom move up above the keyboard', () => {
    expect(read('src/components/widgets/toast.css')).toMatch(/usa-toast-stack\[data-position\^="bottom"\]\{bottom:calc\(12px \+ var\(--usa-kb,0px\)\)\}/);
    const t = mount<any>('<usa-toast-stack></usa-toast-stack>');
    expect(html().getPropertyValue('--usa-kb')).toBe('0px');
    t.remove();
    expect(html().getPropertyValue('--usa-kb')).toBe('');
  });
});

describe('rotation: components that measure the viewport re-measure (13.3.0)', () => {
  it('<usa-pagination> re-places its ink when the viewport changes (its buttons shrink under 420 px)', async () => {
    const { definePagination } = await import('../src/components/widgets');
    definePagination();
    const p = mount<any>('<usa-pagination total="5" page="2"></usa-pagination>');
    const ink = p.querySelector('.usa-pg-ink') as HTMLElement;
    const cur = p.querySelector('[aria-current="page"]') as HTMLElement;
    Object.defineProperty(cur, 'offsetWidth', { configurable: true, get: () => 34 });
    Object.defineProperty(cur, 'offsetLeft', { configurable: true, get: () => 40 });
    window.dispatchEvent(new Event('orientationchange'));
    expect(ink.style.width).toBe('34px');
    expect(ink.style.transform).toBe('translateX(40px)');
    p.remove();
  });

  it('<usa-gl-model> gets the gl-scene box styles, so its canvas cannot grow by devicePixelRatio on every resize', () => {
    const css = read('src/components/widgets/gl-scene.css');
    expect(css).toMatch(/usa-gl-model/);
    expect(css).toMatch(/:is\(usa-gl-scene, ?usa-gl-model\) ?> ?canvas\{[^}]*width:100%/);
  });
});

describe('native bridge: message origin validation (13.3.0)', () => {
  const settings = { type: 'usa:settings', theme: 'dark' };
  const theme = () => document.documentElement.getAttribute('data-theme');
  const frameWindow = () => {
    const f = document.createElement('iframe');
    document.body.append(f);
    return f.contentWindow as Window;
  };
  const post = (data: unknown, init: MessageEventInit = {}) => window.dispatchEvent(new MessageEvent('message', { data, ...init }));

  it('rejects usa:settings posted by another window (iframe, opener, parent) by default', () => {
    const onSettings = vi.fn();
    const { disconnect } = bridge.connectNativeShell({ onSettings });
    post(settings, { source: frameWindow(), origin: 'https://evil.example' });
    expect(theme()).toBeNull();
    expect(onSettings).not.toHaveBeenCalled();
    disconnect();
  });

  it('accepts messages from the page itself (host-injected window.postMessage) and from native (no source)', () => {
    const onSettings = vi.fn();
    const { disconnect } = bridge.connectNativeShell({ onSettings });
    post(settings, { source: window, origin: location.origin });
    expect(theme()).toBe('dark');
    post({ ...settings, theme: 'light' }, { source: null, origin: '' }); // Android WebView postWebMessage / WKScriptMessage replies
    expect(theme()).toBe('light');
    expect(onSettings).toHaveBeenCalledTimes(2);
    disconnect();
  });

  it('allowedOrigins opts a trusted embedding window in — exact origins only', () => {
    const onSettings = vi.fn();
    const { disconnect } = (bridge.connectNativeShell as any)({ onSettings, allowedOrigins: ['https://app.example'] });
    const other = frameWindow();
    post(settings, { source: other, origin: 'https://app.example.evil.test' });
    post(settings, { source: other, origin: 'https://evil.example' });
    expect(onSettings).not.toHaveBeenCalled();
    post(settings, { source: other, origin: 'https://app.example' });
    expect(onSettings).toHaveBeenCalledTimes(1);
    disconnect();
  });

  it('isTrustedMessage(event, allowedOrigins) is exported for custom bridges', () => {
    const t = (bridge as any).isTrustedMessage as (e: MessageEvent, o?: string[]) => boolean;
    expect(typeof t).toBe('function');
    const other = frameWindow();
    expect(t(new MessageEvent('message', { source: window }))).toBe(true);
    expect(t(new MessageEvent('message', { source: null }))).toBe(true);
    expect(t(new MessageEvent('message', { source: other, origin: 'https://a.example' }))).toBe(false);
    expect(t(new MessageEvent('message', { source: other, origin: 'https://a.example' }), ['https://a.example'])).toBe(true);
    expect(t(new MessageEvent('message', { source: other, origin: 'null' }), ['null'])).toBe(false); // opaque origins are never trusted
    expect(t(new MessageEvent('message', { source: other, origin: 'https://a.example' }), ['*'])).toBe(true); // explicit wildcard only
  });

  it('WebView2 host messages (chrome.webview) are still applied', () => {
    let listener: any = null;
    w.chrome = { webview: { postMessage: vi.fn(), addEventListener: (_: string, fn: any) => (listener = fn), removeEventListener: vi.fn() } };
    const { disconnect } = bridge.connectNativeShell();
    listener({ data: settings, source: null });
    expect(theme()).toBe('dark');
    disconnect();
  });

  it('rejects oversized string payloads before parsing them', () => {
    expect(bridge.parseNativeSettings(JSON.stringify({ ...settings, pad: 'x'.repeat(20_000) }))).toBeNull();
    expect(bridge.parseNativeSettings(JSON.stringify(settings))).toEqual({ theme: 'dark' });
  });

  it('every window message listener in shipped code checks who sent the message', () => {
    const files: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(join(root, d))) {
        const p = join(d, n);
        if (n === 'node_modules' || n === 'dist') continue;
        if (statSync(join(root, p)).isDirectory()) walk(p);
        else if (/\.(ts|js|mjs|html)$/.test(n)) files.push(p);
      }
    };
    ['src', 'showcase', 'figma-plugin', 'examples'].forEach(walk);
    // Worker message handlers talk to a worker this code created itself (fx2/perf3.ts) — not a window channel.
    const WORKER_ONLY = ['src/components/fx2/perf3.ts'];
    const listeners = files.filter((f) => !WORKER_ONLY.includes(f) && /addEventListener\(\s*['"]message['"]|(^|[^.\w])onmessage\s*=/m.test(read(f)));
    expect(listeners.sort()).toEqual(['figma-plugin/ui.html', 'showcase/run.html', 'src/components/bridge/index.ts']);
    for (const f of listeners) expect(read(f), f).toMatch(/\.source\b|isTrustedMessage/);
  });

  it('Figma plugin UI accepts plugin messages only from Figma and escapes layer tags', () => {
    const ui = read('figma-plugin/ui.html');
    expect(ui).toMatch(/e\.source !== parent/);
    expect(ui).not.toMatch(/'&lt;' \+ r\.tag \+ '&gt;'/);
  });
});
