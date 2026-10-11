// 14.0.0 — Motion Engine v2 (`motionary/motion`): one composable animation API — animate / sequence / parallel /
// stagger / spring / timeline — and ONE controller interface for all of them (play / pause / seek / reverse /
// finished / cancel / finish, currentTime / progress / duration / playbackRate / playState), driven by the shared
// 13.4 frame scheduler and the 8.0 motion clock, reusing the timeline runtime's position grammar and presets.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { animate, sequence, parallel, stagger, spring, timeline, cubicBezier, toEasingFn, MOTION_ENGINE_VERSION } from '../src/components/motion/index';
import { setClock } from '../src/components/base';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; limit: number }[];

/** A recorder target: `animate(fn, opts)` calls fn(easedProgress). */
const rec = () => {
  const calls: number[] = [];
  const fn = (p: number) => { calls.push(Math.round(p * 1000) / 1000); };
  return { calls, fn, last: () => calls[calls.length - 1] };
};

/** Minimal WAAPI stand-in so DOM leaves can be inspected in jsdom. */
function fakeWaapi() {
  const made: any[] = [];
  (Element.prototype as any).animate = function (frames: any, timing: any) {
    const a: any = { frames, timing, el: this, currentTime: 0, cancelled: false, playState: 'running', pause() { this.playState = 'paused'; }, cancel() { this.cancelled = true; }, play() { this.playState = 'running'; } };
    made.push(a);
    return a;
  };
  return made;
}

beforeEach(() => { vi.useFakeTimers(); setClock({ rate: 1, paused: false }); });
afterEach(() => { vi.useRealTimers(); delete (Element.prototype as any).animate; setClock({ rate: 1, paused: false }); });

describe('14.0 Motion Engine v2: entry and packaging', () => {
  it('is its own opt-in entry (motionary/motion = motionary/components/motion), not part of lite', () => {
    expect(pkg.exports['./motion']).toBeTruthy();
    expect(pkg.exports['./components/motion']).toBeTruthy();
    expect(pkg.exports['./motion']).toEqual(pkg.exports['./components/motion']);
    expect(readFileSync('src/components/lite.ts', 'utf8')).not.toMatch(/motion\/index|from '\.\/motion'/);
    expect(readFileSync('src/components/index.ts', 'utf8')).not.toMatch(/from '\.\/motion(\/index)?'/);
    expect(MOTION_ENGINE_VERSION).toBe(2);
  });
  it('has its own size budget line, and the lite budget is still 70 KB', () => {
    const own = budgets.find((b) => b.import && /pkg\/components\/motion'/.test(b.import));
    expect(own, 'budget line for motionary/components/motion').toBeTruthy();
    expect(own!.limit).toBeLessThanOrEqual(6 * 1024);
    expect(budgets.find((b) => /components\/lite'/.test(b.import || ''))!.limit).toBe(71680);
  });
  it('is built on the shared scheduler and the timeline runtime (no own requestAnimationFrame loop)', () => {
    const src = readFileSync('src/components/motion/index.ts', 'utf8') + readFileSync('src/components/motion/controls.ts', 'utf8');
    expect(src).toMatch(/from '\.\.\/base'/);
    expect(src).toMatch(/onFrame/);
    expect(src).toMatch(/resolvePosition/);
    expect(src).not.toMatch(/requestAnimationFrame\(/);
  });
});

describe('14.0 Motion Engine v2: one controller interface', () => {
  it('animate(fn) plays on the shared scheduler and resolves finished', async () => {
    const r = rec();
    const c = animate(r.fn, { duration: 200 });
    expect(c.playState).toBe('running');
    expect(c.duration).toBe(200);
    vi.advanceTimersByTime(400);
    await expect(c.finished).resolves.toBe(c);
    expect(c.playState).toBe('finished');
    expect(r.last()).toBe(1);
    expect(c.progress).toBe(1);
  });
  it('autoplay:false stays idle; seek renders that exact time; pause holds it', () => {
    const r = rec();
    const c = animate(r.fn, { duration: 1000, autoplay: false });
    expect(c.playState).toBe('idle');
    c.seek(250);
    expect(c.currentTime).toBe(250);
    expect(r.last()).toBe(0.25);
    c.play();
    vi.advanceTimersByTime(100);
    c.pause();
    const held = c.currentTime;
    expect(held).toBeGreaterThan(250);
    vi.advanceTimersByTime(300);
    expect(c.currentTime).toBe(held);
    expect(c.playState).toBe('paused');
  });
  it('currentTime and progress are settable (= seek) and clamp to the duration', () => {
    const r = rec();
    const c = animate(r.fn, { duration: 400, autoplay: false });
    c.currentTime = 100;
    expect(r.last()).toBe(0.25);
    c.progress = 0.5;
    expect(c.currentTime).toBe(200);
    c.seek(10_000);
    expect(c.currentTime).toBe(400);
    c.seek(-5);
    expect(c.currentTime).toBe(0);
  });
  it('reverse() plays back to 0 and resolves finished there', async () => {
    const r = rec();
    const c = animate(r.fn, { duration: 300, autoplay: false });
    c.seek(300);
    c.reverse();
    expect(c.playbackRate).toBe(-1);
    expect(c.playState).toBe('running');
    vi.advanceTimersByTime(600);
    await c.finished;
    expect(c.currentTime).toBe(0);
    expect(r.last()).toBe(0);
  });
  it('cancel() rejects finished with an AbortError and goes idle; finish() jumps to the end', async () => {
    const r = rec();
    const a = animate(r.fn, { duration: 500 });
    const p = a.finished;
    a.cancel();
    await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    expect(a.playState).toBe('idle');
    const b = animate(r.fn, { duration: 500 });
    b.finish();
    await expect(b.finished).resolves.toBe(b);
    expect(r.last()).toBe(1);
  });
  it('playbackRate scales time; the motion clock pause / rate apply too', () => {
    const r = rec();
    const c = animate(r.fn, { duration: 1000, playbackRate: 2 });
    vi.advanceTimersByTime(200);
    expect(c.currentTime).toBeGreaterThanOrEqual(350);
    setClock({ paused: true });
    const t = c.currentTime;
    vi.advanceTimersByTime(300);
    expect(c.currentTime).toBe(t);
    setClock({ paused: false });
    c.cancel();
    c.finished.catch(() => {});
  });
  it('delay, easing (CSS string, token or function), repeat and alternate', () => {
    const r = rec();
    const c = animate(r.fn, { duration: 100, delay: 50, easing: 'ease-in', repeat: 2, alternate: true, autoplay: false });
    expect(c.duration).toBe(450);
    c.seek(25);
    expect(r.calls.length === 0 || r.last() === 0).toBe(true);
    c.seek(100);
    expect(r.last()).toBeGreaterThan(0);
    expect(r.last()).toBeLessThan(0.5);
    c.seek(250); // second iteration (alternate) at its midpoint, running backwards
    const mid = r.last();
    c.seek(450);
    expect(r.last()).toBe(1);
    expect(mid).toBeGreaterThan(0);
    const t = rec();
    animate(t.fn, { duration: '{duration.fast}' as any, autoplay: false }).seek(1e6);
    expect(t.last()).toBe(1);
    const f = rec();
    animate(f.fn, { duration: 100, easing: (p: number) => p * p, autoplay: false }).seek(50);
    expect(f.last()).toBe(0.25);
  });
  it('reduced motion jumps straight to the end state (unless reducedMotion: "ignore")', async () => {
    const mm = vi.spyOn(window, 'matchMedia' as any).mockImplementation(((q: string) => ({ matches: /reduce/.test(q), media: q, addEventListener() {}, removeEventListener() {} })) as any);
    const r = rec();
    const c = animate(r.fn, { duration: 1000 });
    await c.finished;
    expect(r.last()).toBe(1);
    const k = rec();
    const d = animate(k.fn, { duration: 1000, reducedMotion: 'ignore' });
    expect(d.playState).toBe('running');
    d.cancel();
    d.finished.catch(() => {});
    mm.mockRestore();
  });
});

describe('14.0 Motion Engine v2: targets', () => {
  it('DOM targets run as paused WAAPI animations driven by the controller (fill forwards, presets, tokens)', () => {
    const made = fakeWaapi();
    document.body.innerHTML = '<i class="a"></i><i class="a"></i>';
    const c = animate('.a', 'fade-up', { duration: 400, autoplay: false });
    c.seek(100);
    expect(made).toHaveLength(2);
    expect(made[0].timing).toMatchObject({ duration: 400, fill: 'forwards' });
    expect(made[0].frames[0]).toMatchObject({ opacity: 0 });
    expect(made.every((a) => a.playState === 'paused' && a.currentTime === 100)).toBe(true);
    c.cancel();
    c.finished.catch(() => {});
    expect(made.every((a) => a.cancelled)).toBe(true);
  });
  it('without WAAPI, DOM targets still reach the end frame', () => {
    const el = document.createElement('div');
    document.body.append(el);
    animate(el, [{ opacity: 0 }, { opacity: 0.5 }], { duration: 100, autoplay: false }).finish();
    expect(el.style.opacity).toBe('0.5');
  });
  it('plain objects tween numeric properties', () => {
    const o = { x: 0, y: 10 };
    const c = animate(o, { x: 100, y: [20, 40] } as any, { duration: 100, autoplay: false });
    c.seek(50);
    expect(o.x).toBe(50);
    expect(o.y).toBe(30);
    c.seek(100);
    expect(o).toEqual({ x: 100, y: 40 });
  });
});

describe('14.0 Motion Engine v2: composition', () => {
  it('sequence() chains children (gap option); children are driven by the parent', () => {
    const a = rec(), b = rec();
    const s = sequence([animate(a.fn, { duration: 100 }), animate(b.fn, { duration: 200 })], { gap: 50, autoplay: false });
    expect(s.duration).toBe(350);
    s.seek(50);
    expect(a.last()).toBe(0.5);
    expect(b.calls).toHaveLength(0);
    s.seek(250);
    expect(a.last()).toBe(1);
    expect(b.last()).toBe(0.5);
    vi.advanceTimersByTime(1000); // children no longer run on their own clock
    expect(s.currentTime).toBe(250);
  });
  it('parallel() runs children together; duration is the longest', () => {
    const a = rec(), b = rec();
    const p = parallel([animate(a.fn, { duration: 100 }), animate(b.fn, { duration: 400 })], { autoplay: false });
    expect(p.duration).toBe(400);
    p.seek(200);
    expect(a.last()).toBe(1);
    expect(b.last()).toBe(0.5);
  });
  it('stagger() offsets each target (each, from: first | last | center | index) and composes controllers too', () => {
    const made = fakeWaapi();
    document.body.innerHTML = '<b></b><b></b><b></b>';
    const s = stagger('b', [{ opacity: 0 }, { opacity: 1 }], { duration: 100, each: 50, autoplay: false });
    expect(s.duration).toBe(200);
    s.seek(60);
    expect(made.map((a) => a.currentTime)).toEqual([60, 10, -40]);
    const c = stagger('b', [{ opacity: 0 }, { opacity: 1 }], { duration: 100, each: 50, from: 'center', autoplay: false });
    c.seek(0);
    expect(made.slice(3).map((a) => a.currentTime)).toEqual([-50, 0, -50]);
    const x = rec(), y = rec();
    const k = stagger([animate(x.fn, { duration: 100 }), animate(y.fn, { duration: 100 })], { each: 100, autoplay: false });
    expect(k.duration).toBe(200);
  });
  it('spring() derives duration + easing from spring physics (presets, configs, motion tokens) and can overshoot', () => {
    const r = rec();
    const s = spring(r.fn, { stiffness: 300, damping: 10 }, { autoplay: false });
    expect(s.duration).toBeGreaterThan(300);
    let peak = 0;
    for (let t = 0; t <= s.duration; t += 10) { s.seek(t); peak = Math.max(peak, r.last()); }
    expect(peak).toBeGreaterThan(1);
    s.seek(s.duration);
    expect(r.last()).toBe(1);
    const made = fakeWaapi();
    const el = document.createElement('div');
    spring(el, [{ transform: 'scale(0)' }, { transform: 'none' }], 'bouncy', { autoplay: false }).seek(10);
    expect(String(made[0].timing.easing)).toMatch(/^(linear\(|cubic-bezier)/);
  });
  it('timeline() places children with the 3.1 position grammar (ms, >, <, +=, -=, labels) and nests', () => {
    const a = rec(), b = rec(), c = rec(), d = rec();
    const tl = timeline({ autoplay: false })
      .add(animate(a.fn, { duration: 100 }))
      .label('mid')
      .add(animate(b.fn, { duration: 100 }), '-=50')
      .add(animate(c.fn, { duration: 100 }), '<')
      .add(sequence([animate(d.fn, { duration: 100 })]), 'mid+=200');
    expect(tl.duration).toBe(400);
    tl.seek(75);
    expect(a.last()).toBe(0.75);
    expect(b.last()).toBe(0.25);
    expect(c.last()).toBe(0.25);
    expect(d.calls).toHaveLength(0);
    tl.seek(350);
    expect(d.last()).toBe(0.5);
    expect(timeline([[animate(rec().fn, { duration: 100 }), 300]], { autoplay: false }).duration).toBe(400);
  });
  it('a composition is a controller like any other: reverse, finished, cancel cascade', async () => {
    const made = fakeWaapi();
    const el = document.createElement('div');
    const s = sequence([animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 }), animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 100 })]);
    vi.advanceTimersByTime(400);
    await s.finished;
    s.reverse();
    vi.advanceTimersByTime(400);
    await s.finished;
    expect(s.currentTime).toBe(0);
    s.cancel();
    expect(made.every((a) => a.cancelled)).toBe(true);
  });
  it('infinite repeat cannot be composed (clear error)', () => {
    expect(() => sequence([animate(rec().fn, { duration: 10, repeat: Infinity })])).toThrow(/infinite/i);
  });
});

describe('14.0 Motion Engine v2: easing helpers', () => {
  it('cubicBezier / toEasingFn match CSS keywords', () => {
    expect(toEasingFn('linear')(0.3)).toBeCloseTo(0.3);
    expect(cubicBezier(0.25, 0.1, 0.25, 1)(0.5)).toBeCloseTo(toEasingFn('ease')(0.5), 5);
    expect(toEasingFn('ease-in-out')(0.5)).toBeCloseTo(0.5, 3);
    expect(toEasingFn('linear(0, 0.25, 1)')(0.5)).toBeCloseTo(0.25);
    expect(toEasingFn('steps(4)')(0.3)).toBeCloseTo(0.25);
  });
});
