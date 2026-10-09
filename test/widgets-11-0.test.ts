import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { defineWidgets, WIDGETS, WORKER_SCENES, WORKER_SCENE_FNS } from '../src/components/widgets';
import * as widgets from '../src/components/widgets';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { RUNTIME_CDN, RUNTIME_VERSION } from '../src/runtime/registry';
import { offscreenRender } from '../src/components/fx2/perf3';
import { deflateRawSync } from 'node:zlib';
import { unzipEntries, parseDotLottie, inflateEntry, ZIP_LIMITS } from '../src/runtime/vector';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});

const read = (f: string) => readFileSync(f, 'utf8');

describe('11.0: the 10.9 deprecations are removed', () => {
  it('<usa-three-scene> / defineThreeScene / motionary/widgets/three-scene are gone', () => {
    expect((widgets as any).defineThreeScene).toBeUndefined();
    expect(Object.values(WIDGETS).some((m: any) => 'usa-three-scene' in m)).toBe(false);
    expect(customElements.get('usa-three-scene')).toBeUndefined();
    expect(customElements.get('usa-gl-scene')).toBeTruthy();
    const entries = JSON.parse(read('scripts/entries.json'));
    expect(entries.some((e: any) => e.name === 'three-scene')).toBe(false);
    expect(entries.some((e: any) => e.name === 'gl-scene')).toBe(true);
    expect(existsSync('src/entries/widgets/three-scene.ts')).toBe(false);
    expect(JSON.parse(read('package.json')).exports['./widgets/three-scene']).toBeUndefined();
    expect(JSON.parse(read('size-budget.json')).some((b: any) => /three-scene/.test(b.name))).toBe(false);
    expect(read('docs/deprecations.md')).toMatch(/Removed in 11\.0\.0/);
  });
  it('string programs never run on the main thread; built-in scenes fall back to their function versions', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calls: string[] = [];
    const ctx: any = new Proxy({}, { get: (_t, k) => (typeof k === 'string' && !['fillStyle', 'strokeStyle'].includes(k) ? (...a: unknown[]) => calls.push(k) : undefined), set: () => true });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    const fn = vi.fn();
    const c = document.createElement('canvas');
    expect(offscreenRender(c, 'ctx => ctx.fillRect(0,0,1,1)', { worker: false, paused: true }).backend).toBe('none');
    expect(offscreenRender(c, 'ctx => 1', { worker: false, paused: true, fallback: fn }).backend).toBe('main');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(read('src/components/fx2/perf3.ts')).not.toMatch(/new Function\(/);
    expect(err).toHaveBeenCalledTimes(1);
    expect(Object.keys(WORKER_SCENE_FNS).sort()).toEqual(Object.keys(WORKER_SCENES).sort());
    for (const k of Object.keys(WORKER_SCENE_FNS)) {
      calls.length = 0;
      WORKER_SCENE_FNS[k](ctx, 500, 300, 160, {});
      expect(calls, k).toContain('fillRect');
    }
    document.body.innerHTML = '<usa-worker-canvas scene="orbits" label="Orbits"></usa-worker-canvas>';
    const el = document.querySelector('usa-worker-canvas') as any;
    expect(el.backend).toBe('main'); // jsdom: no Worker → the function version, no new Function
    expect(err).toHaveBeenCalledTimes(1);
  });
});

describe('11.0: stable surfaces', () => {
  it('manifest schema v2 is frozen and stable, with nothing deprecated', () => {
    const m = JSON.parse(execFileSync(process.execPath, ['scripts/gen-manifest.mjs', '--stdout'], { maxBuffer: 64 << 20 }).toString());
    expect(m.schemaVersion).toBe(2);
    expect(m.stability).toBe('stable');
    expect(m.components.filter((c: any) => c.deprecated)).toEqual([]);
    expect(m.components.find((c: any) => c.tag === 'usa-three-scene')).toBeUndefined();
    expect(JSON.stringify(m.cdn)).toMatch(/motionary@11\//);
  });
  it('version 11, CDN major @11 everywhere a URL is copied', () => {
    expect(JSON.parse(read('package.json')).version).toMatch(/^11\./);
    expect(RUNTIME_VERSION).toMatch(/^11\./);
    expect(RUNTIME_CDN).toBe('https://cdn.jsdelivr.net/npm/motionary@11/dist/');
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md', 'AGENTS.md', 'docs/ROADMAP.md', 'showcase/catalog/prereqs.js', 'showcase/catalog/widgets.js', 'src/components/widgets/install-button.ts', 'docs/runtime/core.md', 'docs/components/usa-gl-scene.md'])
      expect(read(f), f).not.toMatch(/motionary@(6|10)\//);
    expect(read('README.md')).toMatch(/motionary@11\/dist\/runtime\.iife\.js/);
  });
  it('the compatibility matrix is generated, frozen and linked from the README "Stable API" section', () => {
    const cm = read('docs/compat-matrix.md');
    expect(cm).toMatch(/^# Compatibility matrix \(frozen in 11\.0\)/);
    expect(cm).toMatch(/motionary\/runtime\/format-gif/);
    expect(cm).toMatch(/@rive-app\/canvas/);
    const r = read('README.md');
    expect(r).toMatch(/## Stable API \(11\.x\) & compatibility matrix/);
    expect(r).toMatch(/docs\/compat-matrix\.md/);
    expect(r).toMatch(/motionary-mcp` \*\*2\.x\*\*/);
    expect(r).toMatch(/upgrading-11\.md/);
    expect(() => execFileSync(process.execPath, ['scripts/gen-runtime-docs.mjs', '--check'])).not.toThrow();
  });
  it('ROADMAP: 11.0 shipped, motionary-mcp 2.x stable (server 2.0.0), cross-platform moved past 11.0', () => {
    const r = read('docs/ROADMAP.md');
    expect(r).toMatch(/✅ \*\*v11\.0\*\*/);
    expect(r).toMatch(/motionary-mcp` 2\.x 稳定版/);
    expect(r).toMatch(/## 11\.0 之后[\s\S]*小程序适配[\s\S]*鸿蒙 ArkTS/);
    expect(r).not.toMatch(/motionary-mcp` 1\.0 稳定版/);
    expect(read('bin/motionary-mcp.mjs')).toMatch(/version: '2\.0\.0'/);
  });
});

/** A zip built at test time: entries [name, bytes, store?]; `lie` overrides the declared uncompressed size. */
function zip(files: [string, Uint8Array, boolean?][], lie?: number): Uint8Array {
  const parts: Buffer[] = [], cd: Buffer[] = [];
  let off = 0;
  for (const [name, raw, store] of files) {
    const data = store ? Buffer.from(raw) : deflateRawSync(raw);
    const n = Buffer.from(name);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(store ? 0 : 8, 8); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(lie ?? raw.length, 22); lh.writeUInt16LE(n.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(store ? 0 : 8, 10); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(lie ?? raw.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    parts.push(lh, n, data); cd.push(ch, n); off += 30 + n.length + data.length;
  }
  const c = Buffer.concat(cd), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10); e.writeUInt32LE(c.length, 12); e.writeUInt32LE(off, 16);
  return new Uint8Array(Buffer.concat([...parts, c, e]));
}
const anim = new TextEncoder().encode(JSON.stringify({ v: '5.7.0', fr: 30, ip: 0, op: 30, w: 10, h: 10, layers: [] }));

describe('11.0: zip-bomb limits for dotLottie / zip decoding', () => {
  it('a normal .lottie still parses with the default limits', async () => {
    const dl = await parseDotLottie(zip([['manifest.json', new TextEncoder().encode('{"animations":[{"id":"a"}]}')], ['animations/a.json', anim]]));
    expect(Object.keys(dl.animations)).toEqual(['a']);
    expect(ZIP_LIMITS).toMatchObject({ maxEntries: 1000, maxRatio: 100 });
  });
  it('a high-ratio bomb (24 MB of zeros, declared size lies) is aborted while inflating', async () => {
    const bomb = zip([['animations/a.json', new Uint8Array(24 << 20)]], 10);
    expect(bomb.length).toBeLessThan(64 << 10);
    await expect(parseDotLottie(bomb)).rejects.toThrow(/zip limit exceeded.*ratio/);
  });
  it('per-entry, total-size and entry-count limits are configurable and enforced', async () => {
    const two = zip([['animations/a.json', new Uint8Array(300_000).fill(65)], ['animations/b.json', new Uint8Array(300_000).fill(66)]]);
    await expect(parseDotLottie(two, { limits: { maxEntryBytes: 100_000 } })).rejects.toThrow(/maxEntryBytes/);
    await expect(parseDotLottie(two, { limits: { maxTotalBytes: 500_000 } })).rejects.toThrow(/maxTotalBytes/);
    const many = zip(Array.from({ length: 30 }, (_, i) => [`i/${i}.png`, new Uint8Array(4), true] as [string, Uint8Array, boolean]));
    expect(() => unzipEntries(many, { maxEntries: 20 })).toThrow(/maxEntries/);
    expect(unzipEntries(many).length).toBe(30);
    const declared = zip([['animations/a.json', anim]], 1 << 30);
    expect(() => unzipEntries(declared)).toThrow(/maxEntryBytes/);
    const stored = zip([['i/x.png', new Uint8Array(2000), true]]);
    await expect(inflateEntry(unzipEntries(stored)[0], { maxEntryBytes: 1000 })).rejects.toThrow(/maxEntryBytes/);
  });
});
