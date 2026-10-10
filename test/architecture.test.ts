// 11.0: layer import rules of docs/architecture.md — Public API → Components · Motion Core · Runtime → Tooling.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

type Layer = 'api' | 'core' | 'runtime' | 'components' | 'tooling';
const ROOT = process.cwd();
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|js|mjs)$/.test(f) && !f.endsWith('.d.ts') ? [p] : []; });
const CORE = new Set(['index', 'registry', 'ticker', 'tween', 'ease', 'keyframes']);

export function layerOf(file: string): Layer {
  const f = relative(ROOT, file).split('\\').join('/');
  if (f.startsWith('src/runtime/iife/')) return 'api';
  if (f.startsWith('src/runtime/')) return CORE.has(f.slice(12).replace(/\.ts$/, '')) ? 'core' : 'runtime';
  if (f.startsWith('src/components/core/')) return 'core';
  if (f.startsWith('src/components/ai/')) return 'tooling';
  if (f.startsWith('src/components/frameworks/') || f.startsWith('src/entries/')) return 'api';
  if (f.startsWith('src/components/')) return 'components';
  return 'api'; // src/*.ts: the HTML data-attribute API + React / Vue / Svelte / Solid wrappers
}
const ALLOWED: Record<Layer, Layer[]> = {
  core: ['core'],
  runtime: ['core', 'runtime'],
  components: ['core', 'components'],
  tooling: ['core', 'tooling'],
  api: ['api', 'core', 'runtime', 'components'],
};
/** Known exceptions — may only shrink (each must still exist; remove the line when it is fixed). */
const EXCEPTIONS = new Set<string>([]); // 11.6: the last one (motion-prompt → ai) is gone

function edges() {
  const out: { from: string; to: string; a: Layer; b: Layer }[] = [];
  const outside: string[] = [];
  for (const f of walk(join(ROOT, 'src'))) {
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/^\s*(?:import|export)\s+(type\s+)?(?:[^'";]*?\s+from\s+)?['"](\.[^'"]+)['"]/gm)) {
      if (m[1]) continue;
      const t = resolve(dirname(f), m[2].replace(/\?raw$/, ''));
      const rel = relative(ROOT, t).split('\\').join('/');
      if (/^(scripts|bin|figma-plugin)\//.test(rel)) outside.push(`${relative(ROOT, f)} -> ${rel}`);
      const c = [t, t + '.ts', join(t, 'index.ts'), t.replace(/\.js$/, '.ts')].find((x) => existsSync(x) && statSync(x).isFile());
      if (!c || !c.startsWith(join(ROOT, 'src'))) continue;
      out.push({ from: relative(ROOT, f), to: relative(ROOT, c), a: layerOf(f), b: layerOf(c) });
    }
  }
  return { out, outside };
}

describe('architecture: layer import rules (docs/architecture.md)', () => {
  const { out, outside } = edges();
  it('scans the source', () => {
    expect(out.length).toBeGreaterThan(500);
    expect(layerOf(join(ROOT, 'src/runtime/ticker.ts'))).toBe('core');
    expect(layerOf(join(ROOT, 'src/runtime/gl.ts'))).toBe('runtime');
    expect(layerOf(join(ROOT, 'src/components/widgets/gl-scene.ts'))).toBe('components');
    expect(layerOf(join(ROOT, 'src/components/frameworks/angular.ts'))).toBe('api');
  });
  it('Motion Core depends on nothing; Runtime and Components on Core only; Public API wraps them; Tooling is not imported by the library', () => {
    const bad = out.filter((e) => !ALLOWED[e.a].includes(e.b)).map((e) => `${e.from} -> ${e.to}`);
    expect(bad.filter((x) => !EXCEPTIONS.has(x)), 'new layer violations').toEqual([]);
    for (const x of EXCEPTIONS) expect(bad, `exception fixed — remove it from EXCEPTIONS: ${x}`).toContain(x);
  });
  it('src/ never imports scripts/, bin/ or figma-plugin/', () => {
    expect(outside).toEqual([]);
  });
  it('the core stays free of direct runtime dependencies', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(Object.keys(pkg.dependencies || {})).toEqual([]);
    for (const k of Object.keys(pkg.peerDependencies || {})) expect(pkg.peerDependenciesMeta?.[k]?.optional, k).toBe(true);
  });
  it('the architecture doc is linked from the README and the ROADMAP', () => {
    expect(readFileSync('docs/architecture.md', 'utf8')).toMatch(/Motion Intelligence & Tooling/);
    expect(readFileSync('README.md', 'utf8')).toMatch(/docs\/architecture\.md/);
    expect(readFileSync('docs/ROADMAP.md', 'utf8')).toMatch(/architecture\.md/);
  });
});
