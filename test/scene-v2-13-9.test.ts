// 13.9.0 — v14 compatibility prep: Scene Format v2 draft (motionary-scene v2), JSON Schema + non-throwing
// validator, migration from motionary-timeline v1 / <usa-player> JSON / playground state, round trips on golden fixtures.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import * as S from '../src/components/scene/index';
import { parseTimelineDoc } from '../src/components/timeline/editor/format';
import { normalizeAnimation as normalizeRaw } from '../src/components/effects/player';

(globalThis as any).MOTIONARY_NO_DEPRECATION = true; // the canonPlayer helper calls the deprecated normalizeAnimation
const FIX = 'test/fixtures/scene-v2';
const fx = (f: string) => JSON.parse(readFileSync(`${FIX}/${f}`, 'utf8'));
/** player JSON in a comparable form: explicit offsets, defaults filled */
const canonPlayer = (a: any) => {
  const n = normalizeRaw(a) as any;
  return {
    name: n.name, loop: n.loop, duration: n.duration,
    tracks: n.tracks.map((t: any) => {
      const r: any = { target: t.target, start: t.start, duration: t.duration };
      for (const k of ['preset', 'effect', 'options', 'label', 'easing']) if (t[k] !== undefined) r[k] = t[k];
      if (t.keyframes) r.keyframes = t.keyframes.map((f: any, j: number, all: any[]) => ({ ...f, offset: typeof f.offset === 'number' ? f.offset : all.length > 1 ? j / (all.length - 1) : 0 }));
      return r;
    }),
  };
};

describe('13.9 scene v2: format constants, schema file, entry', () => {
  it('format / version / draft status', () => {
    expect(S.SCENE_V2_FORMAT).toBe('motionary-scene');
    expect(S.SCENE_V2_VERSION).toBe(2);
    expect(S.SCENE_V2_STATUS).toBe('draft');
  });
  it('docs/scene-v2.schema.json is the exported schema', () => {
    expect(JSON.parse(readFileSync('docs/scene-v2.schema.json', 'utf8'))).toEqual(JSON.parse(JSON.stringify(S.SCENE_V2_SCHEMA)));
    expect(S.SCENE_V2_SCHEMA.properties.version.const).toBe(2);
  });
  it('is its own opt-in entry, outside motionary/components and lite', () => {
    const cats = readFileSync('scripts/categories.mjs', 'utf8');
    expect(cats).toMatch(/'scene-v2': 'scene\/index'/);
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./components/scene-v2']).toBeTruthy();
    expect(readFileSync('src/components/index.ts', 'utf8')).not.toMatch(/scene\//);
    expect(readFileSync('src/components/lite.ts', 'utf8')).not.toMatch(/scene/);
    expect(pkg.dependencies || {}).toEqual({});
  });
});

describe('13.9 scene v2: validateSceneV2 never throws', () => {
  const good = () => S.migrateToSceneV2(fx('timeline-basic.json')).doc!;
  it('valid documents → []', () => {
    expect(S.validateSceneV2(good())).toEqual([]);
    expect(S.validateSceneV2(JSON.stringify(good()))).toEqual([]);
    expect(S.isSceneV2(good())).toBe(true);
  });
  it.each([
    ['null', null], ['number', 42], ['array', []], ['bad json', '{nope'], ['undefined', undefined], ['function', () => 1],
    ['v1 timeline', { format: 'motionary-timeline', version: 1, layers: [] }],
  ])('%s → problems, no throw', (_, v) => {
    let p: S.SceneProblem[] = [];
    expect(() => { p = S.validateSceneV2(v); }).not.toThrow();
    expect(p.length).toBeGreaterThan(0);
  });
  it('circular input → problem, no throw', () => {
    const d: any = good();
    d.meta = { self: null }; d.meta.self = d.meta;
    expect(() => S.validateSceneV2(d)).not.toThrow();
    expect(S.validateSceneV2(d).some((p) => /circular/.test(p.message))).toBe(true);
  });
  it('reports each kind of problem with a path', () => {
    const d: any = good();
    d.version = 1;
    d.extra = 1;
    d.layers[0].keyframes[0].easing = 'wobble(3)';
    d.layers[0].keyframes[1].props.opacity = '{duration.nope}';
    d.layers[1].preset = 'fade-up'; // keyframes + preset
    d.layers.push({ id: 'title', type: 'track' }); // duplicate id
    d.layers.push({ id: 'x', type: 'track', parent: 'title' }); // parent not a group
    d.layers.push({ id: 'g', type: 'group', target: '.a' });
    d.layers.push({ id: 'c', type: 'track', component: { tag: 'div', props: { duration: '{duration.fast}' } } });
    const paths = S.validateSceneV2(d).map((p) => p.path);
    expect(paths).toEqual(expect.arrayContaining(['version', 'extra', 'layers[0].keyframes[0].easing', 'layers[0].keyframes[1].props.opacity', 'layers[1]', 'layers[2].id', 'layers[3].parent', 'layers[4].target', 'layers[5].component.tag']));
    expect(S.validateSceneV2(d).find((p) => p.path === 'version')!.message).toMatch(/motionary migrate/);
  });
  it('token references resolve against scene tokens, then the built-in scale', () => {
    const d: any = good();
    d.tokens = { duration: { hero: 720 }, easing: { brand: 'cubic-bezier(0.3, 0, 0, 1)' } };
    d.layers[0].keyframes[0].easing = '{easing.brand}';
    d.layers.push({ id: 'cmp', type: 'track', target: '.c', component: { tag: 'usa-fade-up', props: { duration: '{duration.hero}', delay: '{duration.fast}', easing: '{easing.standard}' } } });
    expect(S.validateSceneV2(d)).toEqual([]);
    const r = S.resolveSceneTokens(d);
    expect(r.layers[0].keyframes![0].easing).toBe('cubic-bezier(0.3, 0, 0, 1)');
    expect(r.layers.at(-1)!.component!.props).toEqual({ delay: 150, duration: 720, easing: expect.stringMatching(/cubic-bezier/) });
  });
  it('detectMotionFormat', () => {
    expect(S.detectMotionFormat(fx('timeline-basic.json'))).toBe('motionary-timeline@1');
    expect(S.detectMotionFormat(fx('player-keyframes.json'))).toBe('animation@1');
    expect(S.detectMotionFormat(fx('player-unversioned.json'))).toBe('animation@1');
    expect(S.detectMotionFormat(fx('playground.json'))).toBe('playground');
    expect(S.detectMotionFormat(good())).toBe('motionary-scene@2');
    expect(S.detectMotionFormat('{x')).toBe('unknown');
    expect(S.detectMotionFormat({ foo: 1 })).toBe('unknown');
  });
});

describe('13.9 migrate: golden fixtures (test/fixtures/scene-v2/*.json → *.scene.json)', () => {
  const inputs = readdirSync(FIX).filter((f) => f.endsWith('.json') && !f.endsWith('.scene.json'));
  it('has fixtures for every source format', () => {
    expect(inputs.sort()).toEqual(['player-keyframes.json', 'player-presets-effects.json', 'player-unversioned.json', 'playground.json', 'timeline-basic.json', 'timeline-groups.json']);
  });
  it.each(inputs)('%s migrates to its golden scene, which validates', (f) => {
    const r = S.migrateToSceneV2(readFileSync(`${FIX}/${f}`, 'utf8'));
    expect(r.problems).toEqual([]);
    expect(r.ok).toBe(true);
    expect(S.validateSceneV2(r.doc)).toEqual([]);
    expect(S.serializeSceneV2(r.doc!)).toBe(readFileSync(`${FIX}/${f.replace(/\.json$/, '.scene.json')}`, 'utf8'));
  });
  it.each(inputs)('%s: migrating the scene again is a no-op (idempotent)', (f) => {
    const once = S.migrateToSceneV2(fx(f)).doc!;
    const twice = S.migrateToSceneV2(once);
    expect(twice.ok).toBe(true);
    expect(twice.doc).toEqual(once);
    expect(S.diffJson(once, twice.doc)).toEqual([]);
  });
});

describe('13.9 migrate: round trips', () => {
  it.each(['timeline-basic.json', 'timeline-groups.json'])('timeline v1 → scene v2 → timeline v1 is lossless (%s)', (f) => {
    const src = fx(f);
    const scene = S.migrateToSceneV2(src).doc!;
    const back = S.sceneV2ToTimeline(scene);
    expect(back.lost).toEqual([]);
    expect(back.doc).toEqual(parseTimelineDoc(src));
  });
  it.each(['player-keyframes.json', 'player-presets-effects.json', 'player-unversioned.json'])('player JSON → scene v2 → player JSON keeps every track (%s)', (f) => {
    const src = fx(f);
    const r = S.migrateToSceneV2(src);
    expect(r.report.lost).toEqual([]);
    const back = S.sceneV2ToAnimation(r.doc!);
    expect(back.lost).toEqual([]);
    expect(canonPlayer(back.animation)).toEqual(canonPlayer(src));
  });
  it('playground state → scene: one preset layer per track; plays the same tracks', () => {
    const r = S.migrateToSceneV2(fx('playground.json'));
    expect(r.ok).toBe(true);
    expect(r.doc!.layers.map((l) => [l.preset, l.start, l.duration, l.name])).toEqual([['fade-up', 0, 600, 'Title'], ['scale', 200, 400, 'Card']]);
    expect(canonPlayer(S.sceneV2ToAnimation(r.doc!).animation).tracks).toEqual(canonPlayer(fx('playground.json')).tracks);
    expect(r.report.changes.join(' ')).toMatch(/deprecated/);
  });
  it('scene → timeline lists what v1 cannot hold (presets, effects, loop)', () => {
    const scene = S.migrateToSceneV2(fx('player-presets-effects.json')).doc!;
    const { lost } = S.sceneV2ToTimeline({ ...scene, loop: true });
    expect(lost.map((l) => l.path)).toEqual(expect.arrayContaining(['loop', 'layers[0].preset', 'layers[2].effect']));
  });
  it('scene → player leaves out muted / non-solo layers and reports them', () => {
    const scene = S.migrateToSceneV2(fx('timeline-groups.json')).doc!;
    const { animation, lost } = S.sceneV2ToAnimation(scene);
    expect(animation.tracks.map((t) => t.target)).toEqual(['.card:nth-child(1)']);
    expect(lost.some((l) => /muted/.test(l.message))).toBe(true);
  });
});

describe('13.9 migrate: reports, options, failures', () => {
  it('unversioned animation JSON → warning about the 14.0 requirement', () => {
    const r = S.migrateToSceneV2(fx('player-unversioned.json'));
    expect(r.ok).toBe(true);
    expect(r.report.warnings.join(' ')).toMatch(/format.*version.*deprecated/);
  });
  it('tokenize: literal easings / component durations equal to tokens → references', () => {
    const doc = fx('timeline-basic.json');
    const r = S.migrateToSceneV2(doc, { tokenize: true });
    expect(r.ok).toBe(true);
    const layer = S.sceneV2ComponentLayer('c', 'usa-fade-up', { duration: 300, delay: 150, easing: 'linear', distance: 24 }, { tokenize: true, target: '.c' });
    expect(layer.component!.props).toEqual({ duration: '{duration.normal}', delay: '{duration.fast}', easing: expect.stringMatching(/^\{easing\.|^linear$/), distance: 24 });
    expect(S.validateSceneV2({ ...r.doc!, layers: [...r.doc!.layers, layer] })).toEqual([]);
  });
  it.each([
    ['garbage', 'not json'], ['unknown object', { hello: 1 }], ['invalid timeline', { format: 'motionary-timeline', version: 1, layers: [{ id: 'a', type: 'nope' }] }],
    ['future animation', { format: 'use-scroll-animate/animation', version: 9, tracks: [] }], ['bad playground', { format: 'use-scroll-animate/playground', state: '!!!' }],
  ])('%s → ok:false with problems, never throws', (_, v) => {
    let r!: S.MigrationResult;
    expect(() => { r = S.migrateToSceneV2(v); }).not.toThrow();
    expect(r.ok).toBe(false);
    expect(r.problems.length).toBeGreaterThan(0);
    expect(S.formatMigrationReport(r)).toMatch(/FAILED/);
  });
  it('tracks the player ignores are reported as lost', () => {
    const r = S.migrateToSceneV2({ format: 'use-scroll-animate/animation', version: 1, tracks: [{ target: '.a' }, { target: '.b', preset: 'fade' }] });
    expect(r.ok).toBe(true);
    expect(r.report.lost).toEqual([{ path: 'tracks[0]', message: expect.stringMatching(/ignores/) }]);
    expect(r.doc!.layers).toHaveLength(1);
  });
  it('diffJson: add / remove / change paths', () => {
    expect(S.diffJson({ a: 1, b: [1, 2], c: { d: 1 } }, { a: 2, b: [1], c: { d: 1, e: 3 } })).toEqual([
      { path: 'a', op: 'change', from: 1, to: 2 },
      { path: 'b[1]', op: 'remove', from: 2 },
      { path: 'c.e', op: 'add', to: 3 },
    ]);
  });
  it('formatMigrationReport summarises a success', () => {
    const t = S.formatMigrationReport(S.migrateToSceneV2(fx('timeline-basic.json')), 'hero.json');
    expect(t).toMatch(/^hero\.json: motionary-timeline@1 → motionary-scene v2 \(draft\)/);
    expect(t).toMatch(/2 layer\(s\), 4 keyframe\(s\)/);
  });
});
