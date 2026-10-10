import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, registerEffect, playEffect } from '../src/components/fx';
import { registerAllEffects, createPlayer, normalizeAnimation, definePlayer, ANIMATION_FORMAT } from '../src/components/effects';
import * as click from '../src/components/click';
import { defineCursor } from '../src/components/page';
// @ts-expect-error — plain ESM bin script
import { transform, splitArgs } from '../bin/usa-codemod-6.mjs';
// @ts-expect-error — plain JS showcase module
import * as pg from '../showcase/playground-core.js';

let rafs: FrameRequestCallback[] = [];
const tick = (t: number) => rafs.splice(0).forEach((cb) => cb(t));

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  rafs = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => rafs.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  configureComponents({ reducedMotion: 'user' });
});

const ANIM = {
  format: ANIMATION_FORMAT,
  version: 1,
  name: 'hero',
  tracks: [
    { target: 'h1', start: 0, duration: 600, preset: 'fade-up' },
    { target: '.cta', start: 400, duration: 400, keyframes: [{ opacity: 0 }, { opacity: 1 }], easing: 'linear' },
    { target: '.cta', start: 900, effect: 'p-test', options: { k: 1 } },
  ],
};

describe('animation JSON (5.9)', () => {
  it('normalizes tracks, computes the duration, rejects bad input', () => {
    const a = normalizeAnimation(JSON.stringify(ANIM));
    expect(a.duration).toBe(900);
    expect(a.tracks.length).toBe(3);
    expect(a.tracks[2].duration).toBe(0);
    expect(normalizeAnimation({ tracks: [{ preset: 'fade' }], duration: 2000 }).duration).toBe(2000);
    expect(normalizeAnimation({ tracks: [{ preset: 'fade' }] }).tracks[0].target).toBe(':scope');
    expect(() => normalizeAnimation({})).toThrow(/tracks/);
    expect(() => normalizeAnimation({ format: 'lottie', tracks: [] })).toThrow(/unknown format/);
    expect(() => normalizeAnimation({ format: ANIMATION_FORMAT, version: 2, tracks: [] })).toThrow(/newer/);
    expect(() => normalizeAnimation('{nope')).toThrow();
  });

  it('accepts playground presets and the playground exports <usa-player> JSON', () => {
    const json = pg.presetToJSON('demo', { ...pg.DEFAULT_STATE, tracks: pg.DEFAULT_TRACKS });
    const a = normalizeAnimation(json);
    expect(a.tracks.map((t) => t.preset)).toEqual(['fade-up', 'fade-left', 'scale']);
    expect(a.tracks[1].target).toBe(':scope > :nth-child(2)');
    const doc = pg.tracksToAnimation(pg.DEFAULT_TRACKS);
    expect(normalizeAnimation(doc).duration).toBe(1200);
    expect(pg.playgroundSnippets({ ...pg.DEFAULT_STATE, tracks: pg.DEFAULT_TRACKS }).player).toMatch(/<usa-player trigger="view">[\s\S]*application\/json[\s\S]*"format": "use-scroll-animate\/animation"/);
    expect(pg.PLAYGROUND_TABS.map((t: any) => t.id)).toContain('player');
  });
});

describe('5.9 createPlayer', () => {
  function setup() {
    const run = vi.fn();
    registerEffect({ name: 'p-test', kind: 'attention', run }, { override: true });
    const root = mount<HTMLElement>('<div><h1>Hi</h1><button class="cta">Go</button></div>');
    return { root, run };
  }

  it('builds paused WAAPI animations and drives them with one clock; effects fire at their start', async () => {
    const { root, run } = setup();
    const p = createPlayer(root, ANIM);
    expect(anims.length).toBe(2);
    expect(anims[0].el).toBe(root.querySelector('h1'));
    expect(anims[0].timing).toMatchObject({ duration: 600, delay: 0, fill: 'both' });
    expect(anims[1].timing).toMatchObject({ delay: 400, easing: 'linear' });
    expect(anims.every((a) => a.playState === 'paused')).toBe(true);
    p.play();
    expect(p.playing).toBe(true);
    const t0 = performance.now();
    tick(t0 + 500);
    expect(p.currentTime).toBeGreaterThan(400);
    expect(anims[0].currentTime).toBe(p.currentTime);
    expect(run).not.toHaveBeenCalled();
    const done = vi.fn();
    void p.finished.then(done);
    tick(t0 + 1000);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][1]).toMatchObject({ k: 1 });
    expect(p.playing).toBe(false);
    expect(p.currentTime).toBe(900);
    await Promise.resolve();
    expect(done).toHaveBeenCalled();
  });

  it('pause / seek / rate / loop', () => {
    const { root, run } = setup();
    const p = createPlayer(root, ANIM, { loop: true, rate: 2 });
    p.seek(300);
    expect(anims[1].currentTime).toBe(300);
    p.seek(5000);
    expect(p.currentTime).toBe(900);
    p.seek(0);
    p.play();
    const t0 = performance.now();
    tick(t0 + 250); // ×2 → 500
    expect(p.currentTime).toBeGreaterThanOrEqual(480);
    p.pause();
    tick(t0 + 1000);
    expect(p.currentTime).toBeLessThan(600);
    p.play();
    const t1 = performance.now();
    tick(t1 + 300); // passes the end → loops back to 0, effect fired once
    expect(run).toHaveBeenCalledTimes(1);
    expect(p.playing).toBe(true);
    expect(p.currentTime).toBe(0);
    p.destroy();
    expect(anims.every((a) => a.cancelled)).toBe(true);
  });

  it('reduced motion: play jumps to the end, effects skipped', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const { root, run } = setup();
    const p = createPlayer(root, ANIM);
    p.play();
    expect(p.currentTime).toBe(900);
    expect(p.playing).toBe(false);
    expect(run).not.toHaveBeenCalled();
    expect(rafs.length).toBe(0);
  });
});

describe('5.9 <usa-player>', () => {
  it('reads inline JSON, plays on load, emits ready / finish', () => {
    definePlayer();
    const ready = vi.fn();
    document.addEventListener('usa:ready', ready, { once: true });
    const el = mount<any>(`<usa-player trigger="load"><h1>Hi</h1><button class="cta">Go</button><script type="application/json">${JSON.stringify(ANIM)}</script></usa-player>`);
    expect(ready).toHaveBeenCalled();
    expect(el.player.duration).toBe(900);
    expect(el.player.playing).toBe(true);
    const fin = vi.fn();
    el.addEventListener('usa:finish', fin);
    tick(performance.now() + 2000);
    expect(fin).toHaveBeenCalledTimes(1);
  });

  it('flags a broken animation with data-error; load() replaces it; controls toggle', () => {
    definePlayer();
    const el = mount<any>('<usa-player trigger="manual" controls><script type="application/json">{"oops":1}</script><p>x</p></usa-player>');
    expect(el.getAttribute('data-error')).toMatch(/tracks/);
    el.load({ tracks: [{ target: 'p', preset: 'fade', duration: 300 }] });
    expect(el.hasAttribute('data-error')).toBe(false);
    expect(el.player.duration).toBe(300);
    const b = el.querySelector('[data-player-toggle]');
    expect(b).not.toBeNull();
    b.click();
    expect(el.player.playing).toBe(true);
    expect(b.getAttribute('aria-pressed')).toBe('true');
  });

  it('fetches src', async () => {
    definePlayer();
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => JSON.stringify(ANIM) }));
    vi.stubGlobal('fetch', fetchMock);
    const el = mount<any>('<usa-player src="/hero.json" trigger="manual"><h1>x</h1><i class="cta"></i></usa-player>');
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledWith('/hero.json');
    expect(el.player?.duration).toBe(900);
  });
});

describe('6.0 removals (deprecated in 5.9)', () => {
  it('burst() / confetti() / shake() are gone from the click and root entries; haptic() stays', async () => {
    expect((click as any).burst).toBeUndefined();
    expect((click as any).confetti).toBeUndefined();
    expect((click as any).shake).toBeUndefined();
    expect(typeof click.haptic).toBe('function');
    const root: any = await import('../src/components');
    expect(root.burst).toBeUndefined();
    expect(root.confetti).toBeUndefined();
    expect(root.shake).toBeUndefined();
    expect(typeof root.playEffect).toBe('function');
  });

  it('the registered effects replace them without warnings; burst accepts x / y', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const el = mount<HTMLElement>('<button></button>');
    const n = document.body.querySelectorAll('*').length;
    await playEffect(el, 'burst', { x: 5, y: 5, count: 4 });
    await playEffect(document.body, 'confetti', { x: 5, y: 5, count: 3 });
    void playEffect(el, 'shake');
    expect(warn).not.toHaveBeenCalled();
    expect(document.body.querySelectorAll('*').length).toBeGreaterThan(n);
  });

  it('<usa-cursor mode="trail"> is removed: renders as dot, no warning; CURSOR_MODES lists dot / magnetic / glow', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    defineCursor();
    const el = mount('<usa-cursor mode="trail"></usa-cursor>');
    expect(el.querySelectorAll('.usa-cursor-ring').length).toBe(1);
    expect(warn).not.toHaveBeenCalled();
    const { CURSOR_MODES } = await import('../src/components/page');
    expect([...CURSOR_MODES]).toEqual(['dot', 'magnetic', 'glow']);
  });
});

describe('usa-codemod-6', () => {
  it('splitArgs respects nesting and strings', () => {
    expect(splitArgs("a, f(b, c), { d: [1, 2] }, 'x,y'")).toEqual(['a', 'f(b, c)', '{ d: [1, 2] }', "'x,y'"]);
  });

  it('rewrites helper calls and imports (aliases included); leaves other code alone', () => {
    const src = [
      "import { confetti, burst, shake as sh, haptic } from 'use-scroll-animate/components/click';",
      "btn.onclick = (e) => { confetti({ count: 120 }); burst(e.clientX, e.clientY, { shape: '★' }); burst(x, y, opts); sh(form, 10); haptic(5); };",
      'confetti();',
      'myburst(1, 2); obj.shake(3);',
    ].join('\n');
    const { code, changes, manual } = transform(src);
    expect(code).toContain("import { haptic } from 'use-scroll-animate/components/click';\nimport { playEffect } from 'use-scroll-animate/components/fx';");
    expect(code).toContain("playEffect(document.body, 'confetti', { count: 120 })");
    expect(code).toContain("playEffect(document.body, 'burst', { x: e.clientX, y: e.clientY, shape: '★' })");
    expect(code).toContain("playEffect(document.body, 'burst', { x, y, ...opts })");
    expect(code).toContain("playEffect(form, 'shake', { intensity: 10 })");
    expect(code).toContain("playEffect(document.body, 'confetti');");
    expect(code).toContain('myburst(1, 2); obj.shake(3);');
    expect(changes.length).toBe(6);
    expect(manual).toEqual([]);
  });

  it('handles the UMD global and reports <usa-cursor mode="trail"> as manual', () => {
    const { code, manual } = transform('UsaComponents.shake(el);\n<usa-cursor mode="trail" size="20"></usa-cursor>');
    expect(code).toContain("UsaComponents.playEffect(el, 'shake')");
    expect(manual[0]).toMatch(/comet-trail/);
  });

  it('files without the old helpers are untouched', () => {
    const src = "import { playEffect } from 'use-scroll-animate/components/fx';\nshake(el);";
    expect(transform(src)).toMatchObject({ code: src, changes: [] });
  });
});
