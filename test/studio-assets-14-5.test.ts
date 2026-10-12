// 14.5.0 — project & asset workflow (`motionary/studio/assets` = `motionary/components/studio-assets`): image, SVG,
// font, video and audio references in a Studio project; relative path resolution confined to the project directory;
// an offline project pack (one JSON file with the project and every referenced asset); missing-asset reports and
// relinking after the project moved to another device. Nothing in a project or a pack is ever executed: script-like
// files are reported and never packed, unpacked or returned as loadable assets.
//
// Pure (no DOM, no fetch, no fs): callers pass bytes and file lists in, get bytes and reports out.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as A from '../src/components/studio/assets';
import {
  STUDIO_ASSETS_VERSION, ASSET_LIMITS, STUDIO_PACK_FORMAT, AssetPathError, assetKind, normalizeAssetPath, resolveAssetPath,
  isExternalAsset, collectAssetRefs, createAssetManifest, checkAssets, relinkAssets, packStudioProject, unpackStudioProject,
  crc32, toBase64, fromBase64,
} from '../src/components/studio/assets';
import { createTimelineDoc } from '../src/components/timeline/editor/index';
import { serializeStudioProject, parseStudioProject, sampleFrames } from '../src/components/studio/index';
import type { TimelineDoc } from '../src/components/timeline/editor/index';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; file?: string; limit: number }[];
const prevBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-4-0.json', 'utf8')) as typeof budgets;
const SRC = readFileSync('src/components/studio/assets.ts', 'utf8');
const enc = (s: string) => new TextEncoder().encode(s);

const doc0 = (): TimelineDoc => createTimelineDoc({
  name: 'poster',
  layers: [
    { id: 'bg', type: 'track', target: '#bg', keyframes: [
      { id: 'k1', time: 0, props: { 'background-image': 'url("img/sky.png")', opacity: 0 } },
      { id: 'k2', time: 400, props: { 'background-image': "url('img/sky.png')", opacity: 1 } },
    ] },
    { id: 'logo', type: 'track', target: '#logo', keyframes: [{ id: 'k3', time: 0, props: { '--src': 'svg/logo.svg', 'mask-image': 'url(svg/mask.svg)' } }] },
    { id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k4', time: 0, props: { '--font-src': 'fonts/Inter.woff2', opacity: 1 } }] },
    { id: 'clip', type: 'track', target: '#clip', keyframes: [{ id: 'k5', time: 0, props: { '--video-src': './media/../media/intro.mp4', '--poster-src': 'https://cdn.example.com/p.jpg' } }] },
    { id: 'inline', type: 'track', target: '#dot', keyframes: [{ id: 'k6', time: 0, props: { 'background-image': 'url(data:image/png;base64,iVBORw0KGgo=)', '--audio-src': 'sfx/pop.ogg' } }] },
  ],
});
const FILES = (): Record<string, Uint8Array> => ({
  'img/sky.png': enc('PNG-sky'), 'svg/logo.svg': enc('<svg/>'), 'svg/mask.svg': enc('<svg id="m"/>'),
  'fonts/Inter.woff2': enc('wOF2'), 'media/intro.mp4': enc('mp4-bytes'), 'sfx/pop.ogg': enc('OggS'),
});

describe('14.5 entry, version and budget', () => {
  it('ships 14.5.0 with motionary/studio/assets + motionary/components/studio-assets, zero runtime deps', () => {
    expect(pkg.version).toBe('14.5.0');
    expect(STUDIO_ASSETS_VERSION).toBe(1);
    for (const p of ['./studio/assets', './components/studio-assets']) expect(pkg.exports[p]?.import?.default).toBe('./dist/components/studio-assets.js');
    expect(pkg.dependencies ?? {}).toEqual({});
  });
  it('has its own budget line (≤ 12 KB; it includes the Studio project parser), never raises a 14.4.0 line and stays out of lite / core / motion / studio', () => {
    const line = budgets.find((b) => b.import?.includes("pkg/components/studio-assets'"));
    expect(line && line.limit).toBeLessThanOrEqual(12288);
    for (const b of prevBudgets) {
      const now = budgets.find((x) => x.name === b.name);
      expect(now, b.name).toBeTruthy();
      expect(now!.limit, b.name).toBeLessThanOrEqual(b.limit);
    }
    for (const f of ['lite', 'core/index', 'motion/index', 'studio/index']) expect(readFileSync(`src/components/${f}.ts`, 'utf8')).not.toMatch(/studio\/assets|from '\.\/assets'/);
  });
  it('never evaluates input and never touches the network or the file system', () => {
    expect(SRC).not.toMatch(/\beval\(|new Function|import\(|fetch\(|XMLHttpRequest|require\(|node:fs|document\.|createElement/);
  });
});

describe('asset kinds', () => {
  it('classifies by extension (case-insensitive, query / hash ignored)', () => {
    expect(assetKind('a/b.PNG')).toBe('image');
    expect(assetKind('a.webp?x=1#y')).toBe('image');
    expect(assetKind('logo.svg')).toBe('svg');
    expect(assetKind('f.woff2')).toBe('font');
    expect(assetKind('f.ttf')).toBe('font');
    expect(assetKind('v.mp4')).toBe('video');
    expect(assetKind('v.webm')).toBe('video');
    expect(assetKind('s.mp3')).toBe('audio');
    expect(assetKind('d.json')).toBe('data');
    expect(assetKind('x.bin')).toBe('other');
  });
  it('marks script-like files as script (never imported)', () => {
    for (const p of ['a.js', 'b.mjs', 'c.cjs', 'd.html', 'e.htm', 'f.wasm', 'g.sh', 'h.svgz.js']) expect(assetKind(p), p).toBe('script');
  });
});

describe('path normalization and confinement', () => {
  it('normalizes ./, inner .., duplicate slashes and Windows separators to a project-relative POSIX path', () => {
    expect(normalizeAssetPath('./img//sky.png')).toBe('img/sky.png');
    expect(normalizeAssetPath('media/../media/intro.mp4')).toBe('media/intro.mp4');
    expect(normalizeAssetPath('img\\sub\\a.png')).toBe('img/sub/a.png');
    expect(normalizeAssetPath('img/a%20b.png')).toBe('img/a b.png');
  });
  it('rejects paths that leave the project directory, absolute paths, schemes, control chars and encoded traversal', () => {
    const bad = ['../secret.png', 'img/../../x.png', '/etc/passwd', 'C:/Windows/a.png', 'C:\\a.png', '\\\\host\\share\\a.png', '//host/a.png',
      'file:///etc/passwd', 'javascript:alert(1)', 'img/%2e%2e/%2e%2e/x.png', 'img/..%2f..%2fx.png', 'a\u0000.png', 'a\n.png', '', '.', 'img/'];
    for (const p of bad) {
      expect(() => normalizeAssetPath(p), JSON.stringify(p)).toThrow(AssetPathError);
    }
    expect(() => normalizeAssetPath('a'.repeat(ASSET_LIMITS.pathLength + 1))).toThrow(AssetPathError);
    try { normalizeAssetPath('../x.png'); } catch (e) { expect((e as AssetPathError).reason).toBe('outside'); expect((e as AssetPathError).path).toBe('../x.png'); }
    try { normalizeAssetPath('/x.png'); } catch (e) { expect((e as AssetPathError).reason).toBe('absolute'); }
    try { normalizeAssetPath('file:///x.png'); } catch (e) { expect((e as AssetPathError).reason).toBe('scheme'); }
  });
  it('resolves a reference relative to the file that holds it, still confined to the project root', () => {
    expect(resolveAssetPath('../img/a.png', 'scenes/intro.json')).toBe('img/a.png');
    expect(resolveAssetPath('a.png', 'scenes/intro.json')).toBe('scenes/a.png');
    expect(resolveAssetPath('img/a.png')).toBe('img/a.png');
    expect(() => resolveAssetPath('../../a.png', 'scenes/intro.json')).toThrow(AssetPathError);
  });
  it('treats https: and data: references as external (not resolved, not packed); http: is rejected', () => {
    expect(isExternalAsset('https://cdn.example.com/a.png')).toBe(true);
    expect(isExternalAsset('data:image/png;base64,AAAA')).toBe(true);
    expect(isExternalAsset('img/a.png')).toBe(false);
    expect(() => normalizeAssetPath('http://x/a.png')).toThrow(AssetPathError);
  });
});

describe('collecting references from a document', () => {
  it('finds url(...) values and *src props, deduplicated with every use', () => {
    const refs = collectAssetRefs(doc0());
    expect(refs.map((r) => r.path)).toEqual(['fonts/Inter.woff2', 'img/sky.png', 'media/intro.mp4', 'sfx/pop.ogg', 'svg/logo.svg', 'svg/mask.svg']);
    const sky = refs.find((r) => r.path === 'img/sky.png')!;
    expect(sky.kind).toBe('image');
    expect(sky.uses).toEqual([{ layer: 'bg', keyframe: 'k1', prop: 'background-image' }, { layer: 'bg', keyframe: 'k2', prop: 'background-image' }]);
    expect(refs.find((r) => r.path === 'media/intro.mp4')!.uses[0]).toEqual({ layer: 'clip', keyframe: 'k5', prop: '--video-src' });
  });
  it('lists external and rejected references separately instead of resolving them', () => {
    const d = doc0();
    d.layers[0].keyframes![0].props['--x-src'] = '../../outside.png';
    const r = collectAssetRefs(d, { report: true });
    expect(r.external.map((e) => e.ref)).toEqual(['data:image/png;base64,iVBORw0KGgo=', 'https://cdn.example.com/p.jpg']);
    expect(r.rejected).toEqual([{ ref: '../../outside.png', reason: 'outside', layer: 'bg', keyframe: 'k1', prop: '--x-src' }]);
    expect(r.assets.map((a) => a.path)).not.toContain('outside.png');
  });
  it('ignores ordinary values (numbers, colors, transforms) and is a pure function of the document', () => {
    const d = createTimelineDoc({ layers: [{ id: 't', type: 'track', target: '#t', keyframes: [{ id: 'k', time: 0, props: { opacity: 1, color: 'red', transform: 'translateX(4px)' } }] }] });
    expect(collectAssetRefs(d)).toEqual([]);
    expect(collectAssetRefs(doc0())).toEqual(collectAssetRefs(doc0()));
  });
});

describe('manifest and missing-asset report', () => {
  it('builds a sorted manifest with sizes and CRC-32 from the files that exist', () => {
    const m = createAssetManifest(doc0(), FILES());
    expect(m.map((e) => e.path)).toEqual(['fonts/Inter.woff2', 'img/sky.png', 'media/intro.mp4', 'sfx/pop.ogg', 'svg/logo.svg', 'svg/mask.svg']);
    const sky = m.find((e) => e.path === 'img/sky.png')!;
    expect(sky).toEqual({ path: 'img/sky.png', kind: 'image', bytes: 7, crc32: crc32(enc('PNG-sky')) });
  });
  it('crc32 matches the standard check value', () => {
    expect(crc32(enc('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array(0))).toBe(0);
  });
  it('after a move to another device, lists exactly what is missing with where it is used', () => {
    const m = createAssetManifest(doc0(), FILES());
    const onNewDevice = ['img/sky.png', 'svg/logo.svg', 'fonts/Inter.woff2'];
    const r = checkAssets(m, onNewDevice);
    expect(r.ok).toBe(false);
    expect(r.found).toEqual(['fonts/Inter.woff2', 'img/sky.png', 'svg/logo.svg']);
    expect(r.missing.map((e) => e.path)).toEqual(['media/intro.mp4', 'sfx/pop.ogg', 'svg/mask.svg']);
    expect(r.messages[0]).toMatch(/media\/intro\.mp4/);
    expect(checkAssets(m, (p: string) => p in FILES()).ok).toBe(true);
  });
  it('checkAssets on a document collects references first and reports rejected ones too', () => {
    const d = doc0();
    d.layers[1].keyframes![0].props['--x-src'] = '/abs/a.png';
    const r = checkAssets(d, Object.keys(FILES()));
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual([]);
    expect(r.rejected.map((x) => x.reason)).toEqual(['absolute']);
  });
  it('flags a file whose content changed (size or CRC differs from the manifest)', () => {
    const m = createAssetManifest(doc0(), FILES());
    const files = FILES(); files['img/sky.png'] = enc('PNG-sky-v2');
    const r = checkAssets(m, files);
    expect(r.changed.map((e) => e.path)).toEqual(['img/sky.png']);
  });
});

describe('relinking', () => {
  it('suggests new locations by content (CRC + size) first, then by unique file name', () => {
    const m = createAssetManifest(doc0(), FILES());
    const moved: Record<string, Uint8Array> = {
      'assets/sky-renamed.png': enc('PNG-sky'),
      'assets/logo.svg': enc('<svg changed/>'),
      'other/mask.svg': enc('<svg id="m"/>'), 'other2/mask.svg': enc('<svg id="m"/>'),
    };
    const s = relinkAssets(m, moved);
    expect(s).toContainEqual({ from: 'img/sky.png', to: 'assets/sky-renamed.png', by: 'content' });
    expect(s).toContainEqual({ from: 'svg/logo.svg', to: 'assets/logo.svg', by: 'name' });
    // two identical candidates: ambiguous → no suggestion by content, and the name is not unique either
    expect(s.find((x) => x.from === 'svg/mask.svg')).toBeUndefined();
    expect(s.find((x) => x.from === 'fonts/Inter.woff2')).toBeUndefined();
  });
  it('never suggests a script or a path outside the project', () => {
    const m = createAssetManifest(doc0(), FILES());
    const s = relinkAssets(m, { 'x/sky.png.js': enc('PNG-sky'), '../sky.png': enc('PNG-sky') } as any);
    expect(s).toEqual([]);
  });
});

describe('offline project pack', () => {
  const projectText = () => serializeStudioProject(doc0(), { time: 120, fps: 30 });
  it('packs the project and every referenced local asset into one deterministic JSON file', () => {
    const p = packStudioProject(projectText(), FILES());
    expect(p.missing).toEqual([]);
    const j = JSON.parse(p.text);
    expect(j.format).toBe(STUDIO_PACK_FORMAT);
    expect(j.version).toBe(1);
    expect(j.files.map((f: any) => f.path)).toEqual(['fonts/Inter.woff2', 'img/sky.png', 'media/intro.mp4', 'sfx/pop.ogg', 'svg/logo.svg', 'svg/mask.svg']);
    expect(j.files[1]).toEqual({ path: 'img/sky.png', kind: 'image', bytes: 7, crc32: crc32(enc('PNG-sky')), data: toBase64(enc('PNG-sky')) });
    expect(packStudioProject(projectText(), FILES()).text).toBe(p.text);
  });
  it('leaves unreferenced files and external URLs out, and reports what it could not pack', () => {
    const files = FILES(); delete files['sfx/pop.ogg']; files['unused.png'] = enc('x');
    const p = packStudioProject(projectText(), files);
    expect(p.missing).toEqual(['sfx/pop.ogg']);
    expect(JSON.parse(p.text).files.map((f: any) => f.path)).not.toContain('unused.png');
    expect(JSON.parse(p.text).files.some((f: any) => /^(https?|data):/.test(f.path))).toBe(false);
  });
  it('refuses to pack script-like files even when the document references them', () => {
    const d = doc0(); d.layers[0].keyframes![0].props['--x-src'] = 'js/boot.js';
    const files = { ...FILES(), 'js/boot.js': enc('alert(1)') };
    const p = packStudioProject(serializeStudioProject(d), files);
    expect(p.skipped).toEqual([{ path: 'js/boot.js', reason: 'script' }]);
    expect(p.text).not.toContain(toBase64(enc('alert(1)')));
  });
  it('round-trips: unpack on another device gives the same project, the same bytes and the same frames', () => {
    const p = packStudioProject(projectText(), FILES());
    const u = unpackStudioProject(p.text);
    expect(u.problems).toEqual([]);
    expect([...u.files.keys()]).toEqual(Object.keys(FILES()).sort());
    for (const [k, v] of u.files) expect([...v]).toEqual([...FILES()[k]]);
    const before = parseStudioProject(projectText());
    expect(u.project.doc).toEqual(before.doc);
    expect(u.project.ui).toEqual({ time: 120, fps: 30 });
    expect(sampleFrames(u.project.doc, { fps: 30 })).toEqual(sampleFrames(before.doc, { fps: 30 }));
    expect(checkAssets(u.project.doc, u.files).ok).toBe(true);
  });
  it('rejects a tampered pack entry (CRC / size mismatch, bad base64, unsafe path, script) without failing the rest', () => {
    const j = JSON.parse(packStudioProject(projectText(), FILES()).text);
    j.files[0].crc32 = 1;
    j.files[1].data = '!!!';
    j.files[2].path = '../escape.mp4';
    j.files.push({ path: 'boot.js', kind: 'other', bytes: 1, crc32: crc32(enc('x')), data: toBase64(enc('x')) });
    const u = unpackStudioProject(JSON.stringify(j));
    expect(u.problems.map((x) => `${x.path}:${x.reason}`)).toEqual(['fonts/Inter.woff2:crc32', 'img/sky.png:data', '../escape.mp4:outside', 'boot.js:script']);
    expect([...u.files.keys()]).toEqual(['sfx/pop.ogg', 'svg/logo.svg', 'svg/mask.svg']);
  });
  it('rejects malformed packs and enforces limits', () => {
    expect(() => unpackStudioProject('{')).toThrow();
    expect(() => unpackStudioProject(JSON.stringify({ format: 'nope' }))).toThrow(/motionary-studio-pack/);
    expect(() => unpackStudioProject(JSON.stringify({ format: STUDIO_PACK_FORMAT, version: 2, project: {}, files: [] }))).toThrow(/version/);
    const many = { format: STUDIO_PACK_FORMAT, version: 1, project: JSON.parse(projectText()), files: Array.from({ length: ASSET_LIMITS.assets + 1 }, (_, i) => ({ path: `a${i}.png`, kind: 'image', bytes: 0, crc32: 0, data: '' })) };
    expect(() => unpackStudioProject(JSON.stringify(many))).toThrow(/assets/);
    const dup = JSON.parse(packStudioProject(projectText(), FILES()).text); dup.files.push({ ...dup.files[0] });
    expect(unpackStudioProject(JSON.stringify(dup)).problems.map((x) => x.reason)).toContain('duplicate');
    // prototype keys are never honoured
    const proto = JSON.parse(packStudioProject(projectText(), FILES()).text); proto.files.push({ path: '__proto__', kind: 'other', bytes: 0, crc32: 0, data: '' });
    const u = unpackStudioProject(JSON.stringify(proto));
    expect(({} as any).polluted).toBeUndefined();
    expect(u.files.has('__proto__')).toBe(false);
  });
});

describe('base64', () => {
  it('round-trips arbitrary bytes and matches the standard alphabet', () => {
    const b = new Uint8Array(256).map((_, i) => i);
    expect([...fromBase64(toBase64(b))]).toEqual([...b]);
    expect(toBase64(enc('Man'))).toBe('TWFu');
    expect(toBase64(enc('Ma'))).toBe('TWE=');
    expect(toBase64(enc('M'))).toBe('TQ==');
    expect(() => fromBase64('TW=u')).toThrow();
  });
});

describe('public surface', () => {
  it('exports exactly the documented names', () => {
    expect(Object.keys(A).sort()).toEqual(['ASSET_LIMITS', 'AssetPathError', 'STUDIO_ASSETS_VERSION', 'STUDIO_PACK_FORMAT', 'assetKind', 'checkAssets',
      'collectAssetRefs', 'crc32', 'createAssetManifest', 'fromBase64', 'isExternalAsset', 'normalizeAssetPath', 'packStudioProject', 'relinkAssets',
      'resolveAssetPath', 'toBase64', 'unpackStudioProject']);
  });
  it('is documented in docs/studio-assets.md with the move-to-another-device checklist', () => {
    const md = readFileSync('docs/studio-assets.md', 'utf8');
    for (const n of ['normalizeAssetPath', 'checkAssets', 'relinkAssets', 'packStudioProject', 'unpackStudioProject', 'motionary/studio/assets']) expect(md).toContain(n);
    expect(md).toMatch(/another device/i);
    expect(md).toMatch(/never executed|not executed/i);
  });
});
