// 14.0.0 — Scene Format v2 is the official motion document: `motionary/scene` (the 13.9 `components/scene-v2`
// entry stays as an alias), the validator is kept, `<usa-player>` plays scene v2 natively and reads v1 documents
// (timeline v1, animation JSON v1) through auto-migration, and the Timeline editor reads and writes v2.
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { SCENE_V2_STATUS, validateSceneV2, sceneV2FromTimeline, migrateToSceneV2 } from '../src/components/scene/index';
import { createPlayer, definePlayer } from '../src/components/effects/player';
import { timelineDocToScene, timelineDocFromScene, loadMotionDoc, normalizeTimelineDoc } from '../src/components/timeline/editor/index';
import { MOTION_TOKENS } from '../src/components/tokens/index';

const fx = (n: string) => JSON.parse(readFileSync(`test/fixtures/scene-v2/${n}`, 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

function fakeWaapi() {
  const made: any[] = [];
  (Element.prototype as any).animate = function (frames: any, timing: any) {
    const a: any = { frames, timing, el: this, currentTime: 0, pause() {}, cancel() {}, play() {} };
    made.push(a);
    return a;
  };
  return made;
}
afterEach(() => { delete (Element.prototype as any).animate; document.body.innerHTML = ''; });

const root = () => {
  const r = document.createElement('div');
  r.innerHTML = '<h1 class="title"></h1><div class="glow"></div><div class="logo"></div><div class="bar"></div>';
  document.body.append(r);
  return r;
};

describe('14.0 Scene Format v2: official', () => {
  it('is stable and has the official entry motionary/scene (components/scene-v2 kept as an alias)', () => {
    expect(SCENE_V2_STATUS).toBe('stable');
    expect(pkg.exports['./scene']).toBeTruthy();
    expect(pkg.exports['./scene']).toEqual(pkg.exports['./components/scene-v2']);
  });
  it('docs: scene-v2.md is no longer a draft and names the official entry', () => {
    const d = readFileSync('docs/scene-v2.md', 'utf8');
    expect(d).not.toMatch(/\(draft\)|DRAFT/);
    expect(d).toMatch(/motionary\/scene/);
  });
  it('the validator is kept (never throws)', () => {
    expect(validateSceneV2(fx('timeline-basic.scene.json'))).toEqual([]);
    expect(validateSceneV2('{').length).toBe(1);
  });
});

describe('14.0 <usa-player> reads scene v2 natively', () => {
  it('plays a scene v2 document: one WAAPI animation per track element, absolute keyframe times → delay / duration / offsets', () => {
    const made = fakeWaapi();
    const p = createPlayer(root(), fx('timeline-basic.scene.json'));
    expect(made).toHaveLength(2);
    const [title, glow] = made;
    expect(title.el.className).toBe('title');
    expect(title.timing).toMatchObject({ delay: 0, duration: 600 });
    expect(title.frames[0]).toMatchObject({ opacity: 0, offset: 0, easing: 'ease-out' });
    expect(title.frames[1]).toMatchObject({ opacity: 1, offset: 1 });
    expect(glow.timing).toMatchObject({ delay: 200, duration: 1000 });
    expect(p.duration).toBe(1200);
    p.destroy();
  });
  it('resolves token references, skips muted layers and honours solo', () => {
    const made = fakeWaapi();
    const scene = {
      format: 'motionary-scene', version: 2, tokens: { duration: { hero: 900 } },
      layers: [
        { id: 'a', type: 'track', target: '.logo', start: 0, duration: '{duration.hero}', preset: 'fade-up', easing: '{easing.standard}' },
        { id: 'b', type: 'track', target: '.bar', muted: true, keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 100, props: { opacity: 1 } }] },
      ],
    };
    // duration as a token ref is not valid scene v2 (numbers only) — use a valid doc for the player
    (scene.layers[0] as any).duration = 900;
    const p = createPlayer(root(), scene as any);
    expect(made).toHaveLength(1);
    expect(made[0].timing.easing).toBe(MOTION_TOKENS.easing.standard);
    expect(made[0].timing.duration).toBe(900);
    p.destroy();
    const made2 = fakeWaapi();
    createPlayer(root(), { ...scene, layers: [{ ...scene.layers[0], solo: true }, { ...scene.layers[1], muted: false }] } as any).destroy();
    expect(made2).toHaveLength(1);
  });
  it('reads timeline v1 through auto-migration (same animations as its scene v2 form)', () => {
    const a = fakeWaapi();
    createPlayer(root(), fx('timeline-basic.json')).destroy();
    const b = fakeWaapi();
    createPlayer(root(), sceneV2FromTimeline(fx('timeline-basic.json'))).destroy();
    expect(a.map((x) => [x.timing, x.frames])).toEqual(b.map((x) => [x.timing, x.frames]));
  });
  it('still plays animation JSON v1 (with format / version)', () => {
    const made = fakeWaapi();
    const p = createPlayer(root(), fx('player-keyframes.json'));
    expect(made).toHaveLength(2);
    expect(p.duration).toBe(2000);
    p.destroy();
  });
  it('invalid scene v2 is rejected with the validator message', () => {
    expect(() => createPlayer(root(), { format: 'motionary-scene', version: 2, layers: 'x' } as any)).toThrow(/layers/);
    expect(() => createPlayer(root(), { format: 'motionary-scene', version: 3, layers: [] } as any)).toThrow(/newer motionary/);
  });
  it('without the compat layer, the removed 13.x formats fail with a pointer to migrate / motionary/compat-v13', () => {
    expect(() => createPlayer(root(), fx('playground.json'))).toThrow(/removed in 14\.0.*(motionary migrate|compat-v13)/s);
    expect(() => createPlayer(root(), fx('player-unversioned.json'))).toThrow(/removed in 14\.0.*(motionary migrate|compat-v13)/s);
  });
  it('<usa-player> loads an inline scene v2 document', () => {
    fakeWaapi();
    definePlayer('usa-player-v14');
    const el = document.createElement('usa-player-v14') as any;
    el.setAttribute('trigger', 'manual');
    el.innerHTML = `<h1 class="title"></h1><div class="glow"></div><script type="application/json">${JSON.stringify(fx('timeline-basic.scene.json'))}</script>`;
    document.body.append(el);
    expect(el.getAttribute('data-error')).toBeNull();
    expect(el.player?.duration).toBe(1200);
  });
});

describe('14.0 Timeline editor reads and writes scene v2', () => {
  it('timelineDocToScene writes a valid scene v2 document, lossless back through timelineDocFromScene', () => {
    const doc = normalizeTimelineDoc(fx('timeline-groups.json'));
    const scene = timelineDocToScene(doc);
    expect(scene.format).toBe('motionary-scene');
    expect(scene.version).toBe(2);
    expect(validateSceneV2(scene)).toEqual([]);
    const back = timelineDocFromScene(scene);
    expect(back.lost).toEqual([]);
    expect(back.doc).toEqual(doc);
  });
  it('matches the scene module converter (one mapping)', () => {
    const doc = fx('timeline-basic.json');
    expect(validateSceneV2(timelineDocToScene(doc))).toEqual([]);
    expect(timelineDocFromScene(sceneV2FromTimeline(doc)).doc).toEqual(normalizeTimelineDoc(doc));
  });
  it('timelineDocFromScene resolves tokens and reports what timeline v1 cannot hold', () => {
    const { doc, lost } = timelineDocFromScene(migrateToSceneV2(fx('player-presets-effects.json')).doc!);
    expect(doc.format).toBe('motionary-timeline');
    expect(lost.length).toBeGreaterThan(0);
    expect(lost.map((l) => l.message).join(' ')).toMatch(/preset|effect/);
  });
  it('loadMotionDoc opens any motion document in the editor (scene v2, timeline v1, animation JSON v1)', () => {
    expect(loadMotionDoc(fx('timeline-basic.json')).doc).toEqual(normalizeTimelineDoc(fx('timeline-basic.json')));
    expect(loadMotionDoc(JSON.stringify(fx('timeline-basic.scene.json'))).doc).toEqual(normalizeTimelineDoc(fx('timeline-basic.json')));
    const anim = loadMotionDoc(fx('player-keyframes.json'));
    expect(anim.doc.layers.length).toBe(2);
    expect(() => loadMotionDoc({ nope: 1 })).toThrow();
  });
});
