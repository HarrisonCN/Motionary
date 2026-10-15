// 15.9.0 — v16 preparation (P0): Scene Format v3 draft + migrator preview (motionary/scene/v3-preview).
// Tests first: fails before src/components/scene/v3.ts exists (failing-before: module missing).
// - v3 draft: nested compositions (`type: "comp"` with own layers + time remap), components as layers
//   (`type: "component"`, `ref` + overrides into `components`), breakpoint variants as a first-class `variants` array;
// - migrateToSceneV3(v2 | v1 input, { dryRun }) is a preview: never mutates its input, never throws, and reports
//   { lossless, changes[], lost[] }; v2 → v3 → v2 is equal (deep) for the corpus, so frame fingerprints match;
// - sceneV3ToV2 reads v3 back for 15.x consumers and names everything v2 cannot express.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  SCENE_V3_FORMAT, SCENE_V3_VERSION, SCENE_V3_STATUS, SCENE_V3_LIMITS, DEPRECATIONS_V16,
  validateSceneV3, migrateToSceneV3, sceneV3ToV2, normalizeSceneV3, serializeSceneV3, isSceneV3,
} from '../src/components/scene/v3';
import { normalizeSceneV2, validateSceneV2 } from '../src/components/scene/v2';
import { frameDigest } from '../src/components/studio/export';

const ROOT = join(__dirname, '..');
const A11Y_DOC = {
  format: 'motionary-scene', version: 2, name: 'Hero', duration: 800,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [
      { id: 't0', time: 0, props: { opacity: 0, transform: 'translateY(40px)' }, easing: 'ease-out' },
      { id: 't1', time: 800, props: { opacity: 1, transform: 'translateY(0px)' } },
    ] },
    { id: 'bg', type: 'track', target: '.bg', keyframes: [
      { id: 'b0', time: 0, props: { transform: 'translateX(-200px)' } }, { id: 'b1', time: 800, props: { transform: 'translateX(0px)' } },
    ] },
  ],
  meta: { author: 'w', 'motionary:variants': [
    { id: 'phone', media: { maxWidth: 600 }, layers: { bg: { muted: true } } },
  ] },
};
const GROUPED = {
  format: 'motionary-scene', version: 2, seed: 7, loop: true, tokens: { duration: { hero: 640 } },
  layers: [
    { id: 'g', type: 'group', name: 'Cards' },
    { id: 'c1', type: 'track', parent: 'g', target: '.c1', component: { tag: 'usa-fade-up', props: { duration: '{duration.hero}' } }, keyframes: [{ id: 'k', time: 100, props: { opacity: 1 } }] },
    { id: 'p', type: 'track', target: '#p', preset: 'fade-up', start: 200, duration: 400, muted: true },
  ],
};
const templateScenes = () => readdirSync(join(ROOT, 'templates')).filter((f) => f.endsWith('.motionary-template.json'))
  .map((f) => JSON.parse(JSON.parse(readFileSync(join(ROOT, 'templates', f), 'utf8')).pack).project.scene);
const CORPUS = () => [A11Y_DOC, GROUPED, ...templateScenes()];
const copy = (x: any) => JSON.parse(JSON.stringify(x));

describe('15.9 Scene v3 draft: constants and deprecation list', () => {
  it('format / version / status (draft until 16.0) and limits', () => {
    expect(SCENE_V3_FORMAT).toBe('motionary-scene');
    expect(SCENE_V3_VERSION).toBe(3);
    expect(SCENE_V3_STATUS).toBe('draft');
    expect(SCENE_V3_LIMITS.compDepth).toBeGreaterThanOrEqual(4);
  });
  it('DEPRECATIONS_V16 names every 16.0 change with removedIn 16.0, a fix and a doc anchor', () => {
    const ids = DEPRECATIONS_V16.map((d) => d.id).sort();
    expect(ids).toEqual(['mcp-check-compat', 'mcp-scene-text', 'mcp-snippet-scene', 'scene-v2-write', 'variants-meta'].sort());
    for (const d of DEPRECATIONS_V16) {
      expect(d.removedIn).toBe('16.0');
      expect(d.fix.length).toBeGreaterThan(10);
      expect(d.doc).toBe(`docs/deprecations-v16.md#${d.id}`);
    }
  });
});

describe('migrateToSceneV3 (preview)', () => {
  it('v2 → v3: version 3, variants promoted from meta to `variants`, other meta kept, lossless', () => {
    const r = migrateToSceneV3(A11Y_DOC);
    expect(r.ok).toBe(true);
    expect(r.dryRun).toBe(true);
    expect(r.doc!.format).toBe('motionary-scene');
    expect(r.doc!.version).toBe(3);
    expect(r.doc!.variants!.map((v: any) => v.id)).toEqual(['phone']);
    expect(r.doc!.meta).toEqual({ author: 'w' });
    expect(r.report.from).toBe('motionary-scene@2');
    expect(r.report.lossless).toBe(true);
    expect(r.report.lost).toEqual([]);
    expect(r.report.changes.join('\n')).toMatch(/version 2 → 3/);
    expect(r.report.changes.join('\n')).toMatch(/variants/);
    expect(validateSceneV3(r.doc)).toEqual([]);
  });
  it('an empty meta after promotion is dropped; groups, tokens, seed, loop, component bindings carry over', () => {
    const d = copy(GROUPED); d.meta = { 'motionary:variants': [] };
    const r = migrateToSceneV3(d);
    expect(r.ok).toBe(true);
    expect('meta' in r.doc!).toBe(false);
    expect(r.doc!.variants).toEqual([]);
    expect(r.doc!.seed).toBe(7);
    expect(r.doc!.loop).toBe(true);
    expect(r.doc!.layers.map((l: any) => l.type)).toEqual(['group', 'track', 'track']);
    expect((r.doc!.layers[1] as any).component.tag).toBe('usa-fade-up');
  });
  it('never mutates the input (object or text), dryRun stays true in 15.9', () => {
    const d = copy(A11Y_DOC), before = JSON.stringify(d);
    const r = migrateToSceneV3(d, { dryRun: false });
    expect(JSON.stringify(d)).toBe(before);
    expect(r.dryRun).toBe(true);
    expect(migrateToSceneV3(JSON.stringify(A11Y_DOC)).ok).toBe(true);
  });
  it('v1 inputs go through the v2 migration first (report.from, v2 changes kept)', () => {
    const anim = { format: 'use-scroll-animate/animation', version: 1, tracks: [{ target: '#a', preset: 'fade-up', start: 0, duration: 400 }] };
    const r = migrateToSceneV3(anim);
    expect(r.ok).toBe(true);
    expect(r.report.from).toBe('animation@1');
    expect(r.doc!.version).toBe(3);
    expect(r.report.changes.length).toBeGreaterThanOrEqual(2);
  });
  it('a non-array variants value is reported as lost (lossless false) and left in meta', () => {
    const d = copy(A11Y_DOC); d.meta['motionary:variants'] = { phone: 1 };
    const r = migrateToSceneV3(d);
    expect(r.ok).toBe(true);
    expect(r.report.lossless).toBe(false);
    expect(r.report.lost[0].path).toMatch(/motionary:variants/);
    expect('variants' in r.doc!).toBe(false);
  });
  it('bad input → ok false with problems, never throws (garbage text, circular, wrong format, invalid v2)', () => {
    expect(migrateToSceneV3('{nope').ok).toBe(false);
    const c: any = { format: 'motionary-scene', version: 2, layers: [] }; c.self = c;
    expect(migrateToSceneV3(c).ok).toBe(false);
    expect(migrateToSceneV3({ format: 'other' }).problems.length).toBeGreaterThan(0);
    expect(migrateToSceneV3({ format: 'motionary-scene', version: 2, layers: [{ id: 'x', type: 'blob' }] }).ok).toBe(false);
    expect(migrateToSceneV3(null).ok).toBe(false);
  });
  it('a v3 input is validated and normalized only', () => {
    const v3 = migrateToSceneV3(A11Y_DOC).doc!;
    const r = migrateToSceneV3(v3);
    expect(r.ok).toBe(true);
    expect(r.report.from).toBe('motionary-scene@3');
    expect(r.doc).toEqual(v3);
  });
});

describe('corpus: v2 → v3 → v2 round trip', () => {
  it('every corpus document migrates losslessly and reads back equal (deep) to its canonical v2 form', () => {
    for (const d of CORPUS()) {
      expect(validateSceneV2(d), d.name).toEqual([]);
      const r = migrateToSceneV3(d);
      expect(r.ok, d.name).toBe(true);
      expect(r.report.lossless, d.name).toBe(true);
      const back = sceneV3ToV2(r.doc!);
      expect(back.lost, d.name).toEqual([]);
      expect(back.doc, d.name).toEqual(normalizeSceneV2(d as any));
    }
  });
  it('frame fingerprints (14.7 frameDigest) of v2 and v3 → v2 are identical', () => {
    for (const d of CORPUS()) {
      const back = sceneV3ToV2(migrateToSceneV3(d).doc!).doc;
      expect(frameDigest(back as any, { fps: 30 }), d.name).toBe(frameDigest(d as any, { fps: 30 }));
    }
  });
  it('serializeSceneV3 is canonical: same text for a shuffled key order', () => {
    const v3 = migrateToSceneV3(A11Y_DOC).doc!;
    const shuffled: any = {}; for (const k of Object.keys(v3).reverse()) shuffled[k] = (v3 as any)[k];
    expect(serializeSceneV3(shuffled)).toBe(serializeSceneV3(v3));
    expect(normalizeSceneV3(v3)).toEqual(v3);
  });
});

const COMP_DOC = () => ({
  format: 'motionary-scene', version: 3, name: 'nested',
  components: { card: { name: 'Card', layers: [
    { id: 'face', type: 'track', target: '.face', keyframes: [{ id: 'f0', time: 0, props: { opacity: 0 } }, { id: 'f1', time: 300, props: { opacity: 1 } }] },
  ] } },
  layers: [
    { id: 'intro', type: 'comp', start: 100, layers: [
      { id: 'title', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 200, props: { opacity: 1 } }] },
    ] },
    { id: 'card1', type: 'component', ref: 'card', start: 50, target: '#card1', overrides: { face: { muted: true } } },
  ],
  variants: [{ id: 'phone', media: { maxWidth: 600 }, layers: { intro: { muted: true } } }],
});

describe('validateSceneV3', () => {
  it('accepts nested comps, component layers with overrides and first-class variants', () => {
    expect(validateSceneV3(COMP_DOC())).toEqual([]);
    expect(isSceneV3(COMP_DOC())).toBe(true);
  });
  it('reports wrong version, unknown keys, unknown refs, unknown override layers, duplicate ids across nesting', () => {
    const msg = (d: any) => validateSceneV3(d).map((p) => `${p.path}: ${p.message}`).join('\n');
    expect(msg({ ...COMP_DOC(), version: 2 })).toMatch(/version/);
    expect(msg({ ...COMP_DOC(), extra: 1 })).toMatch(/extra: unknown key/);
    const d1: any = COMP_DOC(); d1.layers[1].ref = 'nope';
    expect(msg(d1)).toMatch(/unknown component "nope"/);
    const d2: any = COMP_DOC(); d2.layers[1].overrides = { ghost: { muted: true } };
    expect(msg(d2)).toMatch(/ghost/);
    const d3: any = COMP_DOC(); d3.layers[0].layers[0].id = 'card1';
    expect(msg(d3)).toMatch(/duplicate layer id "card1"/);
    const d4: any = COMP_DOC(); d4.layers[0].timeRemap = { rate: 0 };
    expect(msg(d4)).toMatch(/timeRemap/);
    const d5: any = COMP_DOC(); d5.variants[0].layers = { missing: { muted: true } };
    expect(msg(d5)).toMatch(/missing/);
  });
  it('refuses component cycles and comps nested deeper than the limit; never throws on junk', () => {
    const cyc: any = COMP_DOC(); cyc.components.card.layers.push({ id: 'inner', type: 'component', ref: 'card' });
    expect(validateSceneV3(cyc).map((p) => p.message).join('\n')).toMatch(/cycle/);
    let l: any = { id: 'leaf', type: 'track', target: '#x', keyframes: [] };
    for (let i = 0; i <= SCENE_V3_LIMITS.compDepth; i++) l = { id: `c${i}`, type: 'comp', layers: [l] };
    expect(validateSceneV3({ format: 'motionary-scene', version: 3, layers: [l] }).map((p) => p.message).join('\n')).toMatch(/nested deeper/);
    for (const junk of [null, 1, 'x', [], { format: 'motionary-scene', version: 3, layers: 'no' }]) expect(() => validateSceneV3(junk)).not.toThrow();
  });
});

describe('sceneV3ToV2 (read v3 in 15.x)', () => {
  it('flattens comps into groups (times shifted by start) and expands component instances, naming each loss', () => {
    const r = sceneV3ToV2(COMP_DOC() as any);
    expect(validateSceneV2(r.doc)).toEqual([]);
    const ids = r.doc.layers.map((l) => l.id);
    expect(ids).toEqual(['intro', 'title', 'card1', 'card1/face']);
    expect(r.doc.layers[0].type).toBe('group');
    expect(r.doc.layers[1].parent).toBe('intro');
    expect(r.doc.layers[1].keyframes!.map((k) => k.time)).toEqual([100, 300]);
    const face = r.doc.layers[3];
    expect(face.parent).toBe('card1');
    expect(face.muted).toBe(true);
    expect(face.target).toBe('#card1 .face');
    expect(face.keyframes!.map((k) => k.time)).toEqual([50, 350]);
    expect((r.doc.meta as any)['motionary:variants'][0].id).toBe('phone');
    expect(r.lost.map((x) => x.path)).toEqual(expect.arrayContaining(['layers[0]', 'layers[1]']));
  });
  it('timeRemap offset / rate are baked into keyframe times', () => {
    const d: any = COMP_DOC(); d.layers[0].timeRemap = { offset: 100, rate: 2 };
    const r = sceneV3ToV2(d);
    // content time t plays at start + (t - offset) / rate: 0 → 100 + (0-100)/2 = 50, 200 → 150
    expect(r.doc.layers[1].keyframes!.map((k) => k.time)).toEqual([50, 150]);
  });
});
