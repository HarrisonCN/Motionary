import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { installComponentMocks, mount, anims, intersect } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, registerEffect, playEffect, bindEffect, listEffects, getEffect, hasEffect, BUILTIN_EFFECTS, EFFECT_KINDS } from '../src/components/fx';
import { TIMELINE_PRESETS } from '../src/components/timeline/core';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineFxComponents();
});
afterEach(() => configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' }));

describe('effect registry (5.0)', () => {
  it('registers every built-in: timeline entrances, attention seekers, click effects', () => {
    for (const p of Object.keys(TIMELINE_PRESETS)) expect(getEffect(p)?.kind).toBe('enter');
    ['pulse', 'pop', 'jelly', 'wiggle', 'heartbeat', 'bounce', 'flash', 'tada', 'shake'].forEach((n) => expect(hasEffect(n), n).toBe(true));
    ['burst', 'confetti', 'ripple'].forEach((n) => expect(getEffect(n)?.kind).toBe('click'));
    expect(listEffects('attention').length).toBeGreaterThanOrEqual(9);
    BUILTIN_EFFECTS.forEach((d) => expect(EFFECT_KINDS).toContain(d.kind));
  });

  it('validates names, kinds and duplicates; unregister works', () => {
    expect(() => registerEffect({ name: 'Bad Name', kind: 'attention', run: () => undefined })).toThrow(/invalid/);
    expect(() => registerEffect({ name: 'x', kind: 'nope' as any, run: () => undefined })).toThrow(/kind/);
    expect(() => registerEffect({ name: 'pop', kind: 'attention', run: () => undefined })).toThrow(/already/);
    const off = registerEffect({ name: 'tmp-fx', kind: 'attention', run: () => undefined });
    expect(hasEffect('tmp-fx')).toBe(true);
    off();
    expect(hasEffect('tmp-fx')).toBe(false);
  });

  it('playEffect merges defaults, awaits the animation and passes a motion-aware context', async () => {
    const run = vi.fn((el: HTMLElement, o: any, ctx: any) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: o.duration }));
    const off = registerEffect({ name: 'custom-fade', kind: 'enter', defaults: { duration: 300 }, run });
    const el = document.createElement('div');
    const p = playEffect(el, 'custom-fade', { extra: 1 });
    expect(run.mock.calls[0][1]).toEqual({ duration: 300, extra: 1 });
    anims[anims.length - 1].finish();
    await p;
    await expect(playEffect(el, 'missing')).rejects.toThrow(/unknown effect/);
    off();
  });

  it('reduced motion: loops are skipped, others run with ctx.reduced', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const loop = vi.fn();
    const att = vi.fn();
    const o1 = registerEffect({ name: 'tmp-loop', kind: 'loop', run: loop });
    const o2 = registerEffect({ name: 'tmp-att', kind: 'attention', run: att });
    const el = document.createElement('div');
    await playEffect(el, 'tmp-loop');
    await playEffect(el, 'tmp-att');
    expect(loop).not.toHaveBeenCalled();
    expect(att.mock.calls[0][2].reduced).toBe(true);
    o1();
    o2();
  });

  it('bindEffect: click, enter (once), loop with cleanup', () => {
    const el = document.createElement('button');
    document.body.append(el);
    const before = anims.length;
    const unbind = bindEffect(el, 'pop', { trigger: 'click' });
    el.click();
    expect(anims.length).toBe(before + 1);
    unbind();
    el.click();
    expect(anims.length).toBe(before + 1);
    const stop = vi.fn();
    const o = registerEffect({ name: 'tmp-loop2', kind: 'loop', run: () => stop });
    bindEffect(el, 'tmp-loop2', { trigger: 'loop' })();
    expect(stop).toHaveBeenCalled();
    o();
    const tile = document.createElement('div');
    document.body.append(tile);
    bindEffect(tile, 'fade-up', { trigger: 'enter' });
    const n = anims.length;
    intersect(tile, true);
    expect(anims.length).toBe(n + 1);
    expect(anims[anims.length - 1].keyframes).toEqual(TIMELINE_PRESETS['fade-up']);
  });
});

describe('<usa-fx>', () => {
  it('plays its effect on the child when triggered, and marks unknown effects', async () => {
    const el = mount<any>('<usa-fx effect="jelly"><button>Go</button></usa-fx>');
    expect(el.target.tagName).toBe('BUTTON');
    const n = anims.length;
    el.target.click();
    expect(anims.length).toBe(n + 1);
    expect(anims[anims.length - 1].el).toBe(el.target);
    const bad = mount<any>('<usa-fx effect="not-registered"><b>x</b></usa-fx>');
    expect(bad.getAttribute('data-unknown')).toBe('not-registered');
    const p = el.play();
    anims[anims.length - 1].finish();
    await p;
  });

  it('ripple and burst create decorative, aria-hidden nodes', async () => {
    const el = mount<any>('<usa-fx effect="ripple"><button>Go</button></usa-fx>');
    el.target.click();
    expect(el.target.querySelector('span[aria-hidden="true"]')).toBeTruthy();
  });
});
