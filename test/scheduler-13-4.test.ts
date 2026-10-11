// 13.4.0 — animation scheduling: frame budget, offscreen / hidden pause, release on disconnect, one shared rAF.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { raf, caf, now } from '../src/components/base';
import * as perf from '../src/components/perf';
import * as off from '../src/components/offscreen';
import * as tasks from '../src/components/perf/tasks';

describe('scheduler 13.4', () => {
  let queued: FrameRequestCallback[] = [];
  let ioCb: IntersectionObserverCallback | null = null;
  const observed = new Set<Element>();
  beforeEach(() => {
    queued = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => queued.push(cb));
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb: IntersectionObserverCallback) { ioCb = cb; }
      observe(el: Element) { observed.add(el); }
      unobserve(el: Element) { observed.delete(el); }
      disconnect() { observed.clear(); }
    });
  });
  afterEach(() => { vi.unstubAllGlobals(); (perf as any).setFrameBudget?.(8); });
  const frame = (t = now()) => queued.splice(0).forEach((cb) => cb(t));

  it('exports the 13.4 scheduling API from motionary/components/perf', () => {
    expect(typeof perf.setFrameBudget).toBe('function');
    for (const k of ['yieldToMain', 'shouldYield', 'runChunked']) expect(typeof (tasks as any)[k], k).toBe('function');
    for (const k of ['installOffscreenPause', 'raf', 'caf', 'onFrame']) expect(typeof (off as any)[k], k).toBe('function');
    const st = perf.schedulerStats() as any;
    for (const k of ['deferred', 'parked', 'budget']) expect(typeof st[k], k).toBe('number');
  });

  it('splits a frame once the budget is used: the rest run next frame, oldest first', () => {
    (perf as any).setFrameBudget(1);
    const seen: number[] = [];
    const busy = () => { const e = now() + 3; while (now() < e); };
    raf(() => (busy(), seen.push(1)));
    raf(() => seen.push(2));
    raf(() => seen.push(3));
    frame();
    expect(seen).toEqual([1]);
    expect((perf.schedulerStats() as any).deferred).toBeGreaterThan(0);
    raf(() => seen.push(4));
    frame();
    expect(seen).toEqual([1, 2, 3, 4]);
  });

  it('parks an owned callback / loop while its element is off screen and resumes it in view', () => {
    const el = document.createElement('div');
    document.body.append(el);
    const seen: string[] = [];
    let ticks = 0;
    const stop = off.onFrame(() => ticks++, el);
    off.raf(() => seen.push('cb'), el);
    expect(observed.has(el)).toBe(true);
    ioCb!([{ target: el, isIntersecting: false } as any], null as any);
    frame();
    expect(seen).toEqual([]);
    expect(ticks).toBe(0);
    expect((perf.schedulerStats() as any).parked).toBeGreaterThan(0);
    ioCb!([{ target: el, isIntersecting: true } as any], null as any);
    frame();
    expect(seen).toEqual(['cb']);
    expect(ticks).toBe(1);
    stop();
    el.remove();
  });

  it('pauses every loop while the document is hidden and resumes on visibilitychange', () => {
    const vis = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const hid = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    let ticks = 0;
    const stop = off.onFrame(() => ticks++);
    frame();
    expect(ticks).toBe(0);
    expect(queued.length).toBe(0); // no spinning while hidden
    vis.mockReturnValue('visible'); hid.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    frame();
    expect(ticks).toBe(1);
    stop(); vis.mockRestore(); hid.mockRestore();
    frame();
  });

  it('drops the callbacks of a detached owner instead of keeping them queued', () => {
    const el = document.createElement('div');
    document.body.append(el);
    const before = perf.schedulerStats().pending;
    let ran = 0;
    (raf as any)(() => ran++, el);
    el.remove();
    frame();
    expect(ran).toBe(0);
    expect(perf.schedulerStats().pending).toBe(before);
    const id = raf(() => ran++);
    caf(id);
    frame();
    expect(ran).toBe(0);
  });

  it('runChunked processes everything in budgeted slices and yields between them', async () => {
    const out: number[] = [];
    const r = await tasks.runChunked(Array.from({ length: 50 }, (_, i) => i), (x: number) => { const e = now() + 0.5; while (now() < e); out.push(x); }, { budget: 2 });
    expect(out.length).toBe(50);
    expect(r.done).toBe(50);
    expect(r.yields).toBeGreaterThan(3);
    const ac = new AbortController(); ac.abort();
    expect((await tasks.runChunked([1, 2], () => {}, { signal: ac.signal })).aborted).toBe(true);
  });

  it('yieldToMain prefers scheduler.yield, then falls back to a macrotask', async () => {
    const y = vi.fn(() => Promise.resolve());
    vi.stubGlobal('scheduler', { yield: y });
    await tasks.yieldToMain();
    expect(y).toHaveBeenCalledTimes(1);
    vi.stubGlobal('scheduler', undefined);
    await expect(tasks.yieldToMain()).resolves.toBeUndefined();
  });

  it('shouldYield honours navigator.scheduling.isInputPending, else the time slice', () => {
    const t = now();
    expect(tasks.shouldYield(t, 1000)).toBe(false);
    vi.stubGlobal('navigator', { ...navigator, scheduling: { isInputPending: () => true } });
    expect(tasks.shouldYield(t, 1000)).toBe(true);
  });

  it('lite keeps the frame budget and drop-on-detach but not the offscreen pause (plug-in only)', () => {
    const lite = ['src/components/index.ts', 'src/components/perf/index.ts', 'src/components/lite.ts'].map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(lite).not.toMatch(/offscreen|perf\/tasks|IntersectionObserver/);
    const base = readFileSync('src/components/base.ts', 'utf8');
    const sched = base.slice(base.indexOf('shared rAF scheduler'), base.indexOf('unified motion clock'));
    expect(sched).not.toMatch(/IntersectionObserver|visibilitychange/);
    expect(typeof (perf as any).setPauseHook).toBe('undefined'); // internal hook, not public API
  });

  it('uninstalling the plug-in stops parking: an off-screen owner runs again', () => {
    const el = document.createElement('div');
    document.body.append(el);
    let ran = 0;
    off.raf(() => ran++, el);
    ioCb!([{ target: el, isIntersecting: false } as any], null as any);
    frame();
    expect(ran).toBe(0);
    off.installOffscreenPause()(); // install is idempotent and returns the uninstaller
    frame();
    expect(ran).toBe(1);
    el.remove();
  });

  it('no component calls requestAnimationFrame directly — every loop goes through the shared scheduler', () => {
    const offenders: string[] = [];
    const walk = (d: string) => readdirSync(d).forEach((f) => {
      const p = join(d, f);
      if (statSync(p).isDirectory()) return walk(p);
      if (!p.endsWith('.ts') || /base\.ts$|perf3\.ts$/.test(p)) return; // perf3: code string run inside a Worker
      const s = readFileSync(p, 'utf8');
      if (/(?<![\w.$])(?:requestAnimationFrame|cancelAnimationFrame)\(/.test(s)) offenders.push(p);
    });
    walk('src/components');
    expect(offenders).toEqual([]);
  }, 60_000);

  it('connect / disconnect cycles leak no loops or queued callbacks', async () => {
    const { defineElement } = await import('../src/components/base');
    defineElement('usa-leak-134', (Base) => class extends Base {
      mount() {
        const stop = off.onFrame(() => {}, this);
        this.onCleanup(stop);
        off.raf(() => {}, this); // never cancelled: must be dropped once detached
      }
    });
    const s0 = perf.schedulerStats();
    for (let i = 0; i < 200; i++) {
      const el = document.createElement('usa-leak-134');
      document.body.append(el);
      el.remove();
    }
    frame();
    const s1 = perf.schedulerStats();
    expect(s1.loops).toBe(s0.loops);
    expect(s1.pending).toBe(s0.pending);
  });
});
