// 11.4: runtime tiers basic / standard / advanced (docs/runtime-tiers.md).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { RUNTIME_TIERS, TIER_ORDER, tierOf, maxTier } from '../src/runtime/registry';
import * as runtime from '../src/runtime/index';
import { PREREQS, PREREQ_TIERS, tierFor } from '../showcase/catalog/prereqs.js';
import { RUNTIME_ENTRIES } from '../scripts/categories.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const camel = (id: string) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const moduleIds = Object.values(RUNTIME_ENTRIES as Record<string, string>).map((m) => (m === 'index' ? 'core' : m));

describe('11.4: every runtime module has a tier', () => {
  it('RUNTIME_TIERS covers every module and official runtime, with the roadmap split', () => {
    expect(TIER_ORDER).toEqual(['basic', 'standard', 'advanced']);
    for (const id of moduleIds) expect(RUNTIME_TIERS[id], id).toMatch(/^(basic|standard|advanced)$/);
    for (const id of Object.keys(PREREQS)) expect(RUNTIME_TIERS[id], id).toBeTruthy();
    for (const id of ['core', 'scroll', 'text', 'format-css']) expect(tierOf(id), id).toBe('basic');
    for (const id of ['smooth', 'drag-snap', 'format-svg', 'format-sprite', 'format-gif', 'format-apng', 'format-webp', 'vector']) expect(tierOf(id), id).toBe('standard');
    for (const id of ['gl', 'format-gltf', 'format-obj', 'gltf-decoders', 'physics']) expect(tierOf(id), id).toBe('advanced');
    expect(tierOf('nope')).toBeUndefined();
  });
  it('module objects declare the same tier, and depend only on their tier or below', async () => {
    for (const id of moduleIds) {
      const mod = id === 'core' ? (runtime as any).core : (await import(`../src/runtime/${id}.ts`))[camel(id)];
      expect(mod?.tier, id).toBe(RUNTIME_TIERS[id]);
      for (const dep of mod.requires || []) expect(TIER_ORDER.indexOf(RUNTIME_TIERS[dep]), `${id} → ${dep}`).toBeLessThanOrEqual(TIER_ORDER.indexOf(mod.tier));
    }
  });
  it('maxTier / tierFor give a component its tier', () => {
    expect(maxTier()).toBe('basic');
    expect(maxTier(['scroll', 'text'])).toBe('basic');
    expect(maxTier(['scroll', 'vector'])).toBe('standard');
    expect(maxTier(['core', 'gl', 'format-gltf'])).toBe('advanced');
    expect(tierFor([])).toBe('basic');
    expect(tierFor(['core', 'rive'])).toBe('standard');
    expect(tierFor(['core', 'gl'])).toBe('advanced');
    expect(runtime.tierOf).toBe(tierOf);
  });
  it('the showcase table equals the runtime table', () => {
    expect(PREREQ_TIERS).toEqual({ ...RUNTIME_TIERS });
    for (const [id, p] of Object.entries(PREREQS as Record<string, any>)) expect(p.tier, id).toBe(RUNTIME_TIERS[id]);
  });
});

describe('11.4: manifest, Store, docs, CI', () => {
  it('the manifest generator and schema carry tier', () => {
    const g = read('scripts/gen-manifest.mjs');
    expect(g).toMatch(/tier: tierFor\(requires\)/);
    const sch = JSON.parse(read('scripts/manifest.schema.json'));
    expect(sch.$defs.component.properties.tier.enum).toEqual(['basic', 'standard', 'advanced']);
    expect(sch.$defs.prerequisite.properties.tier.enum).toEqual(['basic', 'standard', 'advanced']);
    expect(sch.$defs.component.required).not.toContain('tier'); // optional: schema v2 stays compatible
  });
  it('Store badge and gallery prerequisites name the tier', () => {
    expect(read('showcase/app.js')).toMatch(/tier-badge tier-/);
    expect(read('showcase/catalog-components.js')).toMatch(/tier: c\.requires\?\.length \? tierFor\(c\.requires\) : null/);
    expect(read('showcase/gallery.js')).toMatch(/tierFor\(item\.requires\)} tier/);
    expect(read('showcase/styles.css')).toMatch(/\.tier-badge\.tier-advanced/);
  });
  it('runtime docs state the tier; docs page, README, ROADMAP', () => {
    for (const id of ['scroll', 'vector', 'gl']) expect(read(`docs/runtime/${id}.md`), id).toContain(`**Runtime tier:** ${RUNTIME_TIERS[id]}`);
    expect(read('docs/runtime-tiers.md')).toMatch(/12 KB/);
    expect(read('README.md')).toMatch(/docs\/runtime-tiers\.md/);
    expect(read('docs/ROADMAP.md')).toMatch(/✅ \*\*v11\.4 — /);
  });
  it('check:tiers runs in CI with fixed budgets', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['check:tiers']).toBe('node scripts/check-tiers.mjs');
    expect(read('.github/workflows/ci.yml')).toMatch(/npm run check:tiers/);
    expect(read('scripts/check-tiers.mjs')).toMatch(/TIER_BUDGETS = \{ basic: 12 \* 1024, standard: 37 \* 1024, advanced: 60 \* 1024 \}/);
    expect(existsSync('scripts/check-tiers.mjs')).toBe(true);
  });
});
