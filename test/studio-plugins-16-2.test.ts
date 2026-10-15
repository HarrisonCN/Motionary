// 16.2.0 — Studio plugin API (preview) (tests first; failing-before: v16.2.0/failing-before.txt).
// motionary/studio/plugins: a manifest with explicit permissions, a host that answers plugin calls only for granted
// permissions (every call audited), proposals that never write the project themselves, exporters with path rules,
// and crash isolation (throw / timeout / message flood → that plugin is 'crashed', the host and other plugins go on).
// Unit tests use the in-process transport; test/browser/studio-plugins.spec.mjs covers the Worker and iframe sandboxes.
import { describe, it, expect, vi } from 'vitest';
import * as P from '../src/components/studio/plugins';

const project = () => ({ format: 'motionary-studio', version: 2, scene: { version: 3, duration: 1000, layers: [{ id: 'a', type: 'track', target: '.a', keyframes: [{ time: 0, props: { opacity: 0 } }, { time: 1000, props: { opacity: 1 } }] }] } });
const manifest = (permissions: string[], id = 'com.example.tool') => ({ id, name: 'Tool', version: '1.0.0', api: 1, permissions });
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const until = async (f: () => boolean, ms = 1500) => { const t = Date.now(); while (!f()) { if (Date.now() - t > ms) throw new Error('timeout'); await tick(5); } };

describe('16.2 parsePluginManifest', () => {
  it('accepts a valid manifest (object or JSON text) and keeps only known fields', () => {
    const m = P.parsePluginManifest(JSON.stringify({ ...manifest(['project:read', 'panel']), extra: 1 }));
    expect(m).toEqual({ id: 'com.example.tool', name: 'Tool', version: '1.0.0', api: 1, permissions: ['project:read', 'panel'] });
    expect(P.PLUGIN_PERMISSIONS).toEqual(['project:read', 'project:propose', 'panel', 'exporter']);
  });
  it('refuses unknown permissions, bad ids, other api versions, bad semver and oversized manifests', () => {
    expect(() => P.parsePluginManifest(manifest(['fs:write']))).toThrow(/permission/);
    expect(() => P.parsePluginManifest(manifest([], 'Bad Id!'))).toThrow(/id/);
    expect(() => P.parsePluginManifest({ ...manifest([]), api: 2 })).toThrow(/api/);
    expect(() => P.parsePluginManifest({ ...manifest([]), version: 'one' })).toThrow(/version/);
    expect(() => P.parsePluginManifest({ ...manifest([]), name: 'x'.repeat(20000) })).toThrow(/large/);
    expect(() => P.parsePluginManifest('{')).toThrow();
  });
});

describe('16.2 createPluginHost — permissions, audit, proposals', () => {
  it('project:read gives a copy of the project; a missing permission is refused and audited', async () => {
    const src = project();
    const host = P.createPluginHost({ getProject: () => src });
    let got: any, err: any;
    const r = host.load(manifest(['project:read']), P.createLocalTransport(async (mo) => {
      got = await mo.getProject();
      got.scene.layers.length = 0; // the plugin's copy only
      try { await mo.propose({ ...got }, 'x'); } catch (e) { err = e; }
    }));
    expect(r.ok).toBe(true);
    await until(() => err !== undefined);
    expect(got.scene.layers).toEqual([]);
    expect(src.scene.layers).toHaveLength(1);
    expect(String(err.message)).toMatch(/permission "project:propose"/);
    expect(host.audit.map((a) => [a.plugin, a.method, a.allowed])).toEqual([['com.example.tool', 'project.get', true], ['com.example.tool', 'project.propose', false]]);
  });
  it('propose hands a copy to the host with the plugin id + note and returns the host decision; it never writes', async () => {
    const src = project();
    const before = JSON.stringify(src);
    const propose = vi.fn(() => Promise.resolve(false));
    const host = P.createPluginHost({ getProject: () => src, propose });
    let answer: any;
    host.load(manifest(['project:read', 'project:propose']), P.createLocalTransport(async (mo) => {
      const p: any = await mo.getProject();
      p.scene.duration = 2000;
      answer = await mo.propose(p, 'longer');
    }));
    await until(() => answer !== undefined);
    expect(answer).toBe(false);
    expect(propose).toHaveBeenCalledTimes(1);
    const [doc, meta] = propose.mock.calls[0] as any[];
    expect(doc.scene.duration).toBe(2000);
    expect(meta).toEqual({ plugin: 'com.example.tool', note: 'longer' });
    expect(JSON.stringify(src)).toBe(before);
  });
  it('panel.set stores text only (no HTML rendering), with a size limit', async () => {
    const host = P.createPluginHost({ getProject: project });
    let big: any;
    host.load(manifest(['panel']), P.createLocalTransport(async (mo) => {
      await mo.setPanel({ title: 'Stats', text: '<b>3 layers</b>' });
      try { await mo.setPanel({ text: 'x'.repeat(20000) }); } catch (e) { big = e; }
    }));
    await until(() => big !== undefined);
    expect(host.panels()).toEqual([{ plugin: 'com.example.tool', title: 'Stats', text: '<b>3 layers</b>' }]);
    expect(String(big.message)).toMatch(/large/);
  });
  it('a duplicate plugin id or a bad manifest is refused without throwing', () => {
    const host = P.createPluginHost({ getProject: project });
    expect(host.load(manifest([]), P.createLocalTransport(() => {})).ok).toBe(true);
    const dup = host.load(manifest([]), P.createLocalTransport(() => {}));
    expect(dup.ok).toBe(false);
    expect(dup.error).toMatch(/loaded/);
    const bad = host.load({ id: 'x' } as any, P.createLocalTransport(() => {}));
    expect(bad.ok).toBe(false);
  });
});

describe('16.2 createPluginHost — exporters', () => {
  it('runs a registered exporter and returns its files', async () => {
    const host = P.createPluginHost({ getProject: project });
    host.load(manifest(['exporter']), P.createLocalTransport(async (mo) => {
      await mo.onExport((p: any) => ({ 'scene.txt': `${p.scene.layers.length} layer`, 'css/a.css': '.a{}' }));
    }));
    await until(() => host.plugins()[0].exporter === true);
    const r = await host.runExporter('com.example.tool');
    expect(r).toEqual({ ok: true, value: { files: { 'scene.txt': '1 layer', 'css/a.css': '.a{}' } } });
  });
  it('refuses unsafe paths and non-string files (plugin stays running)', async () => {
    const host = P.createPluginHost({ getProject: project });
    let n = 0;
    host.load(manifest(['exporter']), P.createLocalTransport(async (mo) => {
      await mo.onExport(() => (n++ === 0 ? { '../etc/passwd': 'x' } : { 'a.bin': 1 }));
    }));
    await until(() => host.plugins()[0].exporter === true);
    const a = await host.runExporter('com.example.tool');
    expect(a.ok).toBe(false);
    expect(a.error).toMatch(/path/);
    const b = await host.runExporter('com.example.tool');
    expect(b.ok).toBe(false);
    expect(host.plugins()[0].status).toBe('running');
  });
  it('an exporter without the permission or registration is refused', async () => {
    const host = P.createPluginHost({ getProject: project });
    host.load(manifest(['project:read']), P.createLocalTransport(async (mo) => { await mo.onExport(() => ({})).catch(() => {}); }));
    await tick(20);
    const r = await host.runExporter('com.example.tool');
    expect(r.ok).toBe(false);
    expect((await host.runExporter('nope')).ok).toBe(false);
  });
});

describe('16.2 createPluginHost — crash isolation', () => {
  it('a throwing plugin is marked crashed; the host and other plugins keep working', async () => {
    const onCrash = vi.fn();
    const host = P.createPluginHost({ getProject: project, onCrash });
    host.load(manifest([], 'com.example.bad'), P.createLocalTransport(() => { throw new Error('boom'); }));
    let ok: any;
    host.load(manifest(['project:read'], 'com.example.good'), P.createLocalTransport(async (mo) => { await tick(20); ok = await mo.getProject(); }));
    await until(() => ok !== undefined);
    const bad = host.plugins().find((p) => p.id === 'com.example.bad')!;
    expect(bad.status).toBe('crashed');
    expect(bad.error).toMatch(/boom/);
    expect(onCrash).toHaveBeenCalledWith('com.example.bad', expect.stringMatching(/boom/));
    expect(host.plugins().find((p) => p.id === 'com.example.good')!.status).toBe('running');
  });
  it('an exporter that never answers times out and is crashed (and terminated)', async () => {
    const host = P.createPluginHost({ getProject: project, timeoutMs: 50 });
    const t = P.createLocalTransport(async (mo) => { await mo.onExport(() => new Promise(() => {})); });
    const term = vi.spyOn(t, 'terminate');
    host.load(manifest(['exporter']), t);
    await until(() => host.plugins()[0].exporter === true);
    const r = await host.runExporter('com.example.tool');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/timeout/);
    expect(host.plugins()[0].status).toBe('crashed');
    expect(term).toHaveBeenCalled();
  });
  it('a message flood crashes the plugin', async () => {
    const host = P.createPluginHost({ getProject: project, maxMessages: 20 });
    host.load(manifest(['project:read']), P.createLocalTransport((mo) => { for (let i = 0; i < 100; i++) mo.getProject().catch(() => {}); }));
    await until(() => host.plugins()[0].status === 'crashed');
    expect(host.plugins()[0].error).toMatch(/flood/);
  });
  it('a crashing onCrash / propose callback never throws into the host', async () => {
    const host = P.createPluginHost({ getProject: project, propose: () => { throw new Error('studio bug'); }, onCrash: () => { throw new Error('x'); } });
    let err: any;
    host.load(manifest(['project:read', 'project:propose']), P.createLocalTransport(async (mo) => { try { await mo.propose({}, ''); } catch (e) { err = e; } throw new Error('later'); }));
    await until(() => host.plugins()[0].status === 'crashed');
    expect(String(err.message)).toMatch(/studio bug/);
  });
  it('stop() terminates a plugin', () => {
    const host = P.createPluginHost({ getProject: project });
    const t = P.createLocalTransport(() => {});
    const term = vi.spyOn(t, 'terminate');
    host.load(manifest([]), t);
    host.stop('com.example.tool');
    expect(term).toHaveBeenCalled();
    expect(host.plugins()[0].status).toBe('stopped');
  });
});

describe('16.2 sandbox transports', () => {
  it('the Worker / iframe sources wrap the plugin with the runtime and parse as JavaScript', () => {
    const w = P.pluginWorkerSource('motionary.setPanel({ text: "hi" });');
    expect(w).toContain('motionary.setPanel');
    expect(() => new Function(w)).not.toThrow();
    const html = P.pluginFrameSource('const s = "</script>";');
    expect(html).toContain('sandbox-csp');
    expect(html).toMatch(/default-src 'none'/);
    expect(html).not.toMatch(/"<\/script>"/);
  });
  it('without Worker support, loading through the default transport fails cleanly', () => {
    const host = P.createPluginHost({ getProject: project });
    const r = host.load(manifest([]), 'motionary.setPanel({ text: "x" })');
    expect(r.ok).toBe(typeof Worker === 'function');
  });
});
