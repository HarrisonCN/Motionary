// 15.3.0 — accessible & responsive motion. Tests first: fails before src/components/studio/a11y.ts and the tokens
// `gentle` mode exist. (Draft — copy into test/ of the 15.3 worktree, run, save failing-before.)
import { describe, it, expect } from 'vitest';
import { defineMotionTokens, withMode, GENTLE_MOTION_MODE, gentleMotionOverrides, motionTokenSetToCss } from '../src/components/tokens/set';
import { MOTION_SENSITIVITIES, applySensitivity, resolveVariant, variantsOf, validateVariants, STUDIO_A11Y_VERSION } from '../src/components/studio/a11y';
import { frameDigest } from '../src/components/studio/export';

const DOC = {
  format: 'motionary-scene', version: 2, name: 'Hero', duration: 800,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [
      { id: 't0', time: 0, props: { opacity: 0, transform: 'translateY(40px) scale(0.8) rotate(10deg)' }, easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' },
      { id: 't1', time: 800, props: { opacity: 1, transform: 'translateY(0px) scale(1) rotate(0deg)' } },
    ] },
    { id: 'bg', type: 'track', target: '.bg', keyframes: [
      { id: 'b0', time: 0, props: { transform: 'translateX(-200px)' } }, { id: 'b1', time: 800, props: { transform: 'translateX(0px)' } },
    ] },
  ],
  meta: { 'motionary:variants': [
    { id: 'phone', media: { maxWidth: 600 }, layers: { bg: { muted: true }, title: { distanceScale: 0.5 } } },
    { id: 'tablet', media: { minWidth: 600, maxWidth: 1024 }, layers: { bg: { distanceScale: 0.5 } } },
  ] },
} as const;

describe('15.3 tokens: built-in gentle mode', () => {
  it('gentle halves travel, caps durations at 300 ms, removes overshoot, keeps springs at least critically damped', () => {
    const set = defineMotionTokens({ duration: { slow: 600, fast: 120 }, distance: { md: 24, lg: 47 }, easing: { bouncy: 'cubic-bezier(0.3, 1.6, 0.5, 1)' } });
    const o = gentleMotionOverrides(set);
    expect(o.duration!.slow).toBe(300);
    expect(o.duration!.fast).toBeUndefined(); // unchanged values are not overridden
    expect(o.distance!.md).toBe(12);
    expect(o.distance!.lg).toBe(24); // rounded
    expect(o.easing!.bouncy).toBe('cubic-bezier(0.2, 0, 0, 1)');
    const g = withMode(set, GENTLE_MOTION_MODE);
    expect(g.distance.md).toBe(12);
    expect(GENTLE_MOTION_MODE).toBe('gentle');
  });
  it('the CSS has a gentle block under [data-usa-motion-mode~="gentle"] and never under a media query', () => {
    const css = motionTokenSetToCss(defineMotionTokens({}));
    expect(css).toMatch(/\[data-usa-motion-mode~="gentle"\] \{/);
    expect(css).not.toMatch(/@media[^{]*\{[^@]*gentle/);
  });
});

describe('15.3 studio/a11y: sensitivity', () => {
  it('levels, and full is the identity', () => {
    expect(STUDIO_A11Y_VERSION).toBe(1);
    expect(MOTION_SENSITIVITIES).toEqual(['full', 'gentle', 'reduced']);
    expect(applySensitivity(DOC, 'full')).toEqual(JSON.parse(JSON.stringify(DOC)));
  });
  it('gentle: translate / rotate × 0.5, scale halfway to 1, overshooting easing replaced; times unchanged under 600 ms', () => {
    const g: any = applySensitivity(DOC, 'gentle');
    expect(g.layers[0].keyframes[0].props.transform).toBe('translateY(20px) scale(0.9) rotate(5deg)');
    expect(g.layers[0].keyframes[0].easing).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(g.layers[1].keyframes[0].props.transform).toBe('translateX(-100px)');
    expect(g.layers[0].keyframes[1].time).toBe(600); // 800 ms → capped at 600, times scaled
    expect(g.duration).toBe(600);
  });
  it('reduced: no travel (translate 0, scale 1, rotate 0), opacity kept, whole timeline ≤ 150 ms', () => {
    const r: any = applySensitivity(DOC, 'reduced');
    expect(r.layers[0].keyframes[0].props.transform).toBe('translateY(0px) scale(1) rotate(0deg)');
    expect(r.layers[0].keyframes[0].props.opacity).toBe(0);
    expect(r.duration).toBe(150);
    expect(r.layers[0].keyframes[1].time).toBe(150);
  });
});

describe('15.3 studio/a11y: breakpoint variants', () => {
  it('variantsOf / validateVariants', () => {
    expect(variantsOf(DOC).map((v) => v.id)).toEqual(['phone', 'tablet']);
    expect(validateVariants(DOC)).toEqual([]);
    const bad = { ...DOC, meta: { 'motionary:variants': [{ id: 'x', media: { minWidth: 900, maxWidth: 100 }, layers: { nope: { muted: true } } }] } };
    expect(validateVariants(bad).join('\n')).toMatch(/minWidth.*maxWidth[\s\S]*unknown layer "nope"/);
  });
  it('min inclusive, max exclusive; first matching variant wins; no match = the document as is', () => {
    const at = (width: number) => (resolveVariant(DOC, { width }) as any);
    expect(at(599).layers.find((l: any) => l.id === 'bg').muted).toBe(true);
    expect(at(599).layers[0].keyframes[0].props.transform).toBe('translateY(20px) scale(0.8) rotate(10deg)');
    expect(at(600).layers.find((l: any) => l.id === 'bg').muted).toBeUndefined();
    expect(at(600).layers[1].keyframes[0].props.transform).toBe('translateX(-100px)');
    expect(at(1024)).toEqual(JSON.parse(JSON.stringify(DOC)));
    expect(at(599).meta['motionary:variant']).toBe('phone');
  });
  it('variant then sensitivity; the resolved document is plain Scene v2 that every exporter reads the same', () => {
    const r = resolveVariant(DOC, { width: 700, sensitivity: 'reduced' });
    expect((r as any).duration).toBe(150);
    expect(frameDigest(r)).toBe(frameDigest(JSON.parse(JSON.stringify(r))));
    expect(frameDigest(resolveVariant(DOC, { width: 700 }))).not.toBe(frameDigest(r));
  });
});
