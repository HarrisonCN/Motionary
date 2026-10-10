// 12.5: version compatibility — since / changed in the manifest, version-aware MCP, motionary compat.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseVer, cmpVer, releases, mentions, componentPattern, modulePattern, historyFor, compatAt } from '../bin/compat-history.mjs';
import { callTool, checkCompat, TOOLS } from '../bin/motionary-mcp.mjs';
import { main } from '../bin/motionary.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const { buildManifest } = await import('../scripts/gen-manifest.mjs');
const m = buildManifest();
const CL = `# Changelog\n\n## [Unreleased]\n\n## [11.2.0] - x\n- \`<usa-tilt>\` gets glare; motionary/runtime/gl faster\n\n## [11.0.0] - x\n- new <usa-tilt max> and motionary/runtime core\n\n## [10.9.0] - x\n- motionary/runtime/gltf-anim only\n`;

describe('12.5 history helpers', () => {
  it('versions', () => {
    expect(parseVer('v11.8')).toEqual([11, 8, 0]);
    expect(cmpVer('11.10', '11.9.3')).toBe(1);
    expect(cmpVer('12.0.0', '12')).toBe(0);
  });
  it('changelog → releases → mentions', () => {
    expect(releases(CL).map((r: any) => r.version)).toEqual(['10.9.0', '11.0.0', '11.2.0']);
    const h = mentions(CL, { 'usa-tilt': componentPattern('usa-tilt'), gl: modulePattern('gl'), core: modulePattern('core'), 'gltf-anim': modulePattern('gltf-anim') });
    expect(h['usa-tilt']).toEqual(['11.0', '11.2']);
    expect(h.gl).toEqual(['11.2']);
    expect(h.core).toEqual(['11.0']); // motionary/runtime/gltf-anim is not the core
    expect(historyFor(h['usa-tilt'])).toEqual({ since: '11.0', changed: ['11.2'] });
    expect(historyFor(h['usa-tilt'], '7.3')).toEqual({ since: '7.3', changed: ['11.0', '11.2'] });
    expect(compatAt({ since: '11.0', changed: ['11.2'] }, '10.9.0')).toEqual({ available: false, since: '11.0', changedAfter: ['11.2'] });
    expect(compatAt({ since: '11.0', changed: ['11.2'] }, '11.2.4')).toEqual({ available: true, since: '11.0', changedAfter: [] });
  });
});

describe('12.5 manifest + MCP + CLI', () => {
  it('every component and runtime module has since + changed; schema allows them', () => {
    for (const c of m.components) expect(Array.isArray(c.changed), c.tag).toBe(true);
    expect(m.components.filter((c: any) => c.since).length).toBeGreaterThan(m.components.length * 0.8);
    for (const r of m.runtimeModules) expect(Array.isArray(r.changed), r.id).toBe(true);
    expect(m.runtimeModules.find((r: any) => r.id === 'drag-snap').since).toBe('10.8');
    const sch = JSON.parse(read('scripts/manifest.schema.json'));
    expect(sch.$defs.component.properties.changed.type).toBe('array');
    expect(sch.$defs.prerequisite.properties.since.type).toBe('string');
    expect(sch.$defs.component.required).not.toContain('changed');
  });
  it('MCP: version filter, compat on get_component, check_compat', () => {
    expect(TOOLS.map((t) => t.name).slice(-2)).toEqual(['validate_snippet', 'check_compat']);
    const all = callTool(m, 'list_components', { limit: 1000 }).structuredContent as any;
    const old = callTool(m, 'list_components', { version: '10.0.0', limit: 1000 }).structuredContent as any;
    expect(old.count).toBeLessThan(all.count);
    expect(old.components.find((c: any) => c.tag === 'usa-snap-carousel')).toBeUndefined();
    const g = callTool(m, 'get_component', { tag: 'usa-snap-carousel', version: '10.0.0' }).structuredContent as any;
    expect(g.compat).toMatchObject({ installed: '10.0.0', available: false, since: g.since });
    const cc = checkCompat(m, '10.0.0', ['usa-snap-carousel']);
    expect(cc.behind).toBe(true);
    expect(cc.components[0]).toMatchObject({ tag: 'usa-snap-carousel', available: false });
    expect(cc.modules[0].module).toBe('motionary/runtime/drag-snap');
    expect(cc.upgrade).toContain(`npm i motionary@${m.version}`);
    expect(() => checkCompat(m, '10.0.0', ['usa-nope'])).toThrow(/unknown component/);
  });
  it('CLI: motionary compat', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      expect(await main(['compat', '10.0.0'], { manifest: m })).toBe(0);
      const out = log.mock.calls.flat().join('\n');
      expect(out).toContain('checked for 10.0.0');
      expect(out).toContain('<usa-snap-carousel>  since');
    } finally {
      log.mockRestore();
    }
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(main(['compat'])).toBe(2);
    err.mockRestore();
  });
  it('docs', () => {
    expect(read('docs/version-compat.md')).toContain('check_compat');
    expect(read('docs/mcp.md')).toContain('## Version-aware answers (12.5)');
    expect(read('README.md')).toContain('docs/version-compat.md');
  });
});
