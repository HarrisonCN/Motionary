// 13.4.0 — animation scheduling: frame budget, offscreen / hidden pause, release on disconnect, one shared rAF.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { raf, caf, now } from '../src/components/base';
import * as perf from '../src/components/perf';

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
    for (const k of ['setFrameBudget', 'yieldToMain', 'shouldYield', 'runChunked', 'raf', 'caf']) expect(typeof (perf as any)[k], k).toBe('function');
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
    const stop = perf.onFrame(() => ticks++, el as any);
    (raf as any)(() => seen.push('cb'), el);
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
    const stop = perf.onFrame(() => ticks++);
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
    const r = await (perf as any).runChunked(Array.from({ length: 50 }, (_, i) => i), (x: number) => { const e = now() + 0.5; while (now() < e); out.push(x); }, { budget: 2 });
    expect(out.length).toBe(50);
    expect(r.done).toBe(50);
    expect(r.yields).toBeGreaterThan(3);
    const ac = new AbortController(); ac.abort();
    expect((await (perf as any).runChunked([1, 2], () => {}, { signal: ac.signal })).aborted).toBe(true);
  });

  it('yieldToMain prefers scheduler.yield, then falls back to a macrotask', async () => {
    const y = vi.fn(() => Promise.resolve());
    vi.stubGlobal('scheduler', { yield: y });
    await (perf as any).yieldToMain();
    expect(y).toHaveBeenCalledTimes(1);
    vi.stubGlobal('scheduler', undefined);
    await expect((perf as any).yieldToMain()).resolves.toBeUndefined();
  });

  it('shouldYield honours navigator.scheduling.isInputPending, else the time slice', () => {
    const t = now();
    expect((perf as any).shouldYield(t, 1000)).toBe(false);
    vi.stubGlobal('navigator', { ...navigator, scheduling: { isInputPending: () => true } });
    expect((perf as any).shouldYield(t, 1000)).toBe(true);
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
  });
});
