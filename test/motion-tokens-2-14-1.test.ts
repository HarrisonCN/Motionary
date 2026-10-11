// 14.1.0 — Motion Tokens 2.0 (`motionary/tokens`): easing curves, durations, springs, spatial distances and motion
// semantics (enter / exit / emphasis / transition) as one token set, with modes (built-in reduced motion, compact),
// a W3C Design Tokens (DTCG 2025.10) importer / exporter, CSS custom properties (modes as media query + data
// attribute), Motion Engine v2 + Scene Format v2 integration, and a Figma Variables (REST API shapes) adapter + CLI.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as T from '../src/components/tokens/v2';
import {
  MOTION_TOKENS_2, SEMANTIC_KINDS, defineMotionTokens, withMode, resolveMotionToken, resolveSemantic, motionOptions,
  motionKeyframes, validateMotionTokens, motionTokenSetToDTCG, motionTokenSetFromDTCG, motionTokenSetToCss,
  motionTokenSetVars, applyMotionTokenSet, toSceneTokens, withSceneTokens, motionTokensToFigma, motionTokensFromFigma,
} from '../src/components/tokens/v2';
import { MOTION_TOKENS, getMotionTokens, importDesignTokens, motionToken } from '../src/components/tokens/index';
import { animate, spring } from '../src/components/motion/index';
import { validateSceneV2 } from '../src/components/scene/index';
import { setClock } from '../src/components/base';
import { main } from '../bin/motionary.mjs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; file?: string; limit: number }[];
// the 14.0.0 budget lines (snapshot of main at 9e842456; CI clones are shallow, so no `git show origin/main`)
const mainBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-0-0.json', 'utf8')) as typeof budgets;

describe('14.1 Motion Tokens 2.0: entry and packaging', () => {
  it('is its own opt-in entry motionary/tokens (= motionary/components/motion-tokens), not part of lite', () => {
    expect(pkg.exports['./tokens']).toBeTruthy();
    expect(pkg.exports['./tokens']).toEqual(pkg.exports['./components/motion-tokens']);
    expect(readFileSync('src/components/lite.ts', 'utf8')).not.toMatch(/tokens\/v2/);
  });
  it('has its own budget line and raises no existing budget (lite stays 70 KB)', () => {
    const own = budgets.find((b) => b.import && /pkg\/components\/motion-tokens'/.test(b.import));
    expect(own, 'budget line for motionary/components/motion-tokens').toBeTruthy();
    expect(own!.limit).toBeLessThanOrEqual(10 * 1024); // measured ~9.4 KB gz (esbuild) — set.ts ~60 %, figma.ts ~22 %
    for (const b of mainBudgets) {
      const now = budgets.find((x) => x.name === b.name);
      expect(now, `budget line kept: ${b.name}`).toBeTruthy();
      expect(now!.limit, `budget not raised: ${b.name}`).toBeLessThanOrEqual(b.limit);
    }
    expect(budgets.find((b) => /components\/lite'/.test(b.import || ''))!.limit).toBe(71680);
  });
  it('docs policy: from 14 on, minors of the current major move npm latest (13.x unchanged)', async () => {
    const V: any = await import('../scripts/check-versions.mjs');
    expect(V.policyLatest('## [14.1.0] - x\n## [14.0.0] - x\n## [13.9.0] - x\n', '14.1.0')).toBe('14.1.0');
    expect(V.policyLatest('## [13.1.0] - x\n## [13.0.2] - x\n## [13.0.0] - x\n', '13.1.0')).toBe('13.0.2');
    expect(V.checkVersions().findings).toEqual([]);
  });
  it('keeps zero runtime dependencies', () => {
    expect(pkg.dependencies || {}).toEqual({});
  });
  it('the 4.2 / 10.6 tokens API is unchanged (no breaking change)', async () => {
    const v1 = await import('../src/components/tokens/index');
    for (const k of ['MOTION_TOKENS', 'applyMotionTokens', 'importMotionTokens', 'motionTokensToCss', 'motionTokensToJSON', 'motionToken', 'motionVar', 'importDesignTokens', 'exportDesignTokens', 'validateDesignTokens', 'resolveTokenAliases'])
      expect(typeof (v1 as any)[k], k).not.toBe('undefined');
    expect(MOTION_TOKENS.duration.fast).toBe(150);
  });
});

describe('14.1 token set: structure and defaults', () => {
  it('has durations, easings, springs, distances and the four semantic kinds', () => {
    expect(T.MOTION_TOKENS_VERSION).toBe(2);
    expect(SEMANTIC_KINDS).toEqual(['enter', 'exit', 'emphasis', 'transition']);
    expect(MOTION_TOKENS_2.duration).toEqual(MOTION_TOKENS.duration);
    expect(MOTION_TOKENS_2.easing).toEqual(MOTION_TOKENS.easing);
    expect(MOTION_TOKENS_2.spring).toEqual(MOTION_TOKENS.spring);
    expect(MOTION_TOKENS_2.distance).toMatchObject({ none: 0, xs: 4, sm: 8, md: 16, lg: 32, xl: 64 });
    for (const k of SEMANTIC_KINDS) expect(MOTION_TOKENS_2.semantic[k].default, k).toBeTruthy();
    expect(MOTION_TOKENS_2.semantic.enter.default).toMatchObject({ duration: '{duration.normal}', easing: '{easing.decelerate}', distance: '{distance.md}' });
    expect(MOTION_TOKENS_2.modes!.compact).toBeTruthy();
  });
  it('the defaults validate clean', () => {
    expect(validateMotionTokens(MOTION_TOKENS_2)).toEqual([]);
  });
  it('defineMotionTokens merges partials deeply and never mutates the defaults', () => {
    const s = defineMotionTokens({ duration: { fast: 120, blink: 60 }, distance: { huge: 128 }, semantic: { enter: { hero: { duration: '{duration.slow}', easing: '{easing.emphasized}', distance: '{distance.huge}' } } } });
    expect(s.duration.fast).toBe(120);
    expect(s.duration.slow).toBe(600);
    expect(s.distance.huge).toBe(128);
    expect(s.semantic.enter.hero.distance).toBe('{distance.huge}');
    expect(s.semantic.enter.default).toBeTruthy();
    expect(MOTION_TOKENS_2.duration.fast).toBe(150);
    expect((MOTION_TOKENS_2.distance as any).huge).toBeUndefined();
  });
  it('resolves references with or without braces, including semantic composites', () => {
    expect(resolveMotionToken(MOTION_TOKENS_2, '{duration.fast}')).toBe(150);
    expect(resolveMotionToken(MOTION_TOKENS_2, 'distance.lg')).toBe(32);
    expect(resolveMotionToken(MOTION_TOKENS_2, '{spring.snappy}')).toEqual({ stiffness: 300, damping: 30, mass: 1 });
    expect(resolveMotionToken(MOTION_TOKENS_2, '{enter.default}')).toEqual({ duration: 300, delay: 0, easing: 'cubic-bezier(0, 0, 0, 1)', distance: 16 });
    expect(resolveMotionToken(MOTION_TOKENS_2, '{semantic.exit.default}')).toMatchObject({ duration: 150 });
    expect(resolveMotionToken(MOTION_TOKENS_2, '{duration.nope}')).toBeUndefined();
  });
  it('resolveSemantic falls back to default and resolves literal values', () => {
    const s = defineMotionTokens({ semantic: { emphasis: { pop: { duration: 220, easing: 'ease-out', distance: 6, spring: '{spring.bouncy}' } } } });
    expect(resolveSemantic(s, 'emphasis', 'pop')).toEqual({ duration: 220, delay: 0, easing: 'ease-out', distance: 6, spring: { stiffness: 260, damping: 12, mass: 1 } });
    expect(resolveSemantic(s, 'emphasis', 'missing')).toEqual(resolveSemantic(s, 'emphasis', 'default'));
  });
});

describe('14.1 modes: built-in reduced motion, compact, custom', () => {
  it('reduced motion is built in: no spatial movement, short durations, no overshoot', () => {
    const r = withMode(MOTION_TOKENS_2, 'reduced');
    for (const v of Object.values(r.distance)) expect(v).toBe(0);
    for (const [k, v] of Object.entries(r.duration)) expect(v, k).toBeLessThanOrEqual(150);
    expect(r.duration.instant).toBe(0);
    for (const [k, s] of Object.entries(r.spring)) expect(s.damping, k).toBeGreaterThanOrEqual(2 * Math.sqrt(s.stiffness * s.mass) - 1e-9);
    // overshooting curves (y outside 0–1) are replaced
    for (const k of ['spring', 'bounce']) expect(r.easing[k]).not.toMatch(/1\.5|-0\.55/);
    expect(resolveSemantic(MOTION_TOKENS_2, 'enter', 'default', 'reduced').distance).toBe(0);
    expect(r.modes).toBeUndefined();
  });
  it('reduced motion works for a set that declares no modes; explicit reduced overrides win', () => {
    const s = defineMotionTokens({ modes: { reduced: { duration: { fast: 80 } } } });
    expect(withMode(s, 'reduced').duration.fast).toBe(80);
    const bare = { ...MOTION_TOKENS_2, modes: undefined };
    expect(withMode(bare, 'reduced').distance.md).toBe(0);
  });
  it('compact mode shortens durations and distances', () => {
    const c = withMode(MOTION_TOKENS_2, 'compact');
    expect(c.duration.normal).toBeLessThan(300);
    expect(c.distance.md).toBeLessThan(16);
  });
  it('custom modes and stacked modes', () => {
    const s = defineMotionTokens({ modes: { cinematic: { duration: { normal: 500 }, distance: { md: 40 } } } });
    expect(withMode(s, 'cinematic').duration.normal).toBe(500);
    const both = withMode(s, ['cinematic', 'reduced']);
    expect(both.distance.md).toBe(0);
    expect(() => withMode(s, 'nope')).toThrow(/unknown mode "nope"/);
    expect(withMode(s).duration.normal).toBe(300);
  });
});

describe('14.1 validation', () => {
  it('reports malformed values, bad names, broken / wrong-group references and reduced-mode movement', () => {
    const bad: any = defineMotionTokens({
      duration: { neg: -5, nan: NaN as any },
      easing: { broken: 'cubic-bezier(2, 0, 0, 1)', junk: 'wobble' },
      spring: { flat: { stiffness: 0, damping: 10, mass: 1 } },
      distance: { 'bad name': 4, inf: Infinity },
      semantic: { enter: { x: { duration: '{easing.standard}', easing: '{easing.nope}', distance: '{distance.md}' } } },
      modes: { reduced: { distance: { md: 24 } } },
    });
    bad.semantic.wiggle = { default: { duration: 100 } };
    const p = validateMotionTokens(bad).join('\n');
    expect(p).toMatch(/duration\.neg/);
    expect(p).toMatch(/duration\.nan/);
    expect(p).toMatch(/easing\.broken/);
    expect(p).toMatch(/easing\.junk/);
    expect(p).toMatch(/spring\.flat/);
    expect(p).toMatch(/distance\.bad name.*name/);
    expect(p).toMatch(/distance\.inf/);
    expect(p).toMatch(/semantic\.enter\.x\.duration.*\{easing\.standard\}.*duration/);
    expect(p).toMatch(/semantic\.enter\.x\.easing.*unknown/);
    expect(p).toMatch(/semantic\.wiggle.*enter \| exit \| emphasis \| transition/);
    expect(p).toMatch(/modes\.reduced.*distance\.md/);
  });
  it('accepts steps(), linear() and keywords as easings', () => {
    expect(validateMotionTokens(defineMotionTokens({ easing: { s: 'steps(4, end)', l: 'linear(0, 0.5 40%, 1)', e: 'ease-in-out' } }))).toEqual([]);
  });
});

describe('14.1 W3C Design Tokens (DTCG 2025.10) export / import', () => {
  it('exports typed groups, semantic transitions with aliases, and modes in $extensions', () => {
    const d: any = motionTokenSetToDTCG(MOTION_TOKENS_2);
    expect(d.$schema).toMatch(/designtokens\.org\/schemas\/2025\.10/);
    expect(d.motion.duration.$type).toBe('duration');
    expect(d.motion.duration.fast.$value).toEqual({ value: 150, unit: 'ms' });
    expect(d.motion.easing.$type).toBe('cubicBezier');
    expect(d.motion.easing.standard.$value).toEqual([0.2, 0, 0, 1]);
    expect(d.motion.distance.$type).toBe('dimension');
    expect(d.motion.distance.md.$value).toEqual({ value: 16, unit: 'px' });
    expect(d.motion.spring.snappy.$extensions['org.motionary'].spring).toEqual({ stiffness: 300, damping: 30, mass: 1 });
    expect(d.motion.enter.$type).toBe('transition');
    expect(d.motion.enter.default.$value).toEqual({ duration: '{motion.duration.normal}', delay: { value: 0, unit: 'ms' }, timingFunction: '{motion.easing.decelerate}' });
    expect(d.motion.enter.default.$extensions['org.motionary'].distance).toBe('{motion.distance.md}');
    expect(d.$extensions['org.motionary'].version).toBe(2);
    expect(d.$extensions['org.motionary'].modes.compact).toBeTruthy();
  });
  it('the draft format writes "150ms" strings', () => {
    const d: any = motionTokenSetToDTCG(MOTION_TOKENS_2, { format: 'draft' });
    expect(d.motion.duration.fast.$value).toBe('150ms');
    expect(d.motion.distance.md.$value).toBe('16px');
  });
  it('round-trips losslessly (export → import → equal)', () => {
    const s = defineMotionTokens({ duration: { blink: 60 }, distance: { huge: 128 }, easing: { s: 'steps(3)' }, semantic: { emphasis: { pop: { duration: 220, easing: '{easing.spring}', spring: '{spring.bouncy}', distance: 6 } } }, modes: { cinematic: { duration: { normal: 500 } } } });
    const back = motionTokenSetFromDTCG(JSON.parse(JSON.stringify(motionTokenSetToDTCG(s))));
    expect(back).toEqual(s);
  });
  it('the export validates with the 10.6 DTCG validator and imports with the 10.6 importer', () => {
    const d = motionTokenSetToDTCG(MOTION_TOKENS_2);
    const v1 = importDesignTokens(d);
    expect(v1.duration.slow).toBe(600);
    expect(v1.spring.bouncy).toEqual({ stiffness: 260, damping: 12, mass: 1 });
  });
  it('imports a foreign DTCG file: inherited $type, aliases, rem distances, seconds', () => {
    const doc = {
      brand: {
        motion: {
          duration: { $type: 'duration', quick: { $value: { value: 0.12, unit: 's' } }, base: { $value: '{brand.motion.duration.quick}' } },
          easing: { out: { $type: 'cubicBezier', $value: [0, 0, 0.2, 1] } },
          distance: { $type: 'dimension', nudge: { $value: { value: 0.5, unit: 'rem' } } },
          enter: { $type: 'transition', card: { $value: { duration: '{brand.motion.duration.base}', delay: { value: 40, unit: 'ms' }, timingFunction: '{brand.motion.easing.out}' }, $extensions: { 'org.motionary': { distance: '{brand.motion.distance.nudge}' } } } },
        },
      },
    };
    const s = motionTokenSetFromDTCG(doc);
    expect(s.duration.quick).toBe(120);
    expect(s.duration.base).toBe(120);
    expect(s.easing.out).toBe('cubic-bezier(0, 0, 0.2, 1)');
    expect(s.distance.nudge).toBe(8);
    expect(resolveSemantic(s, 'enter', 'card')).toEqual({ duration: 120, delay: 40, easing: 'cubic-bezier(0, 0, 0.2, 1)', distance: 8 });
    expect(s.duration.fast).toBe(150); // merged over the defaults
  });
});

describe('14.1 CSS custom properties', () => {
  it('writes primitives, semantic vars that reference them, and modes', () => {
    const css = motionTokenSetToCss(MOTION_TOKENS_2);
    expect(css).toMatch(/:root \{[^}]*--usa-duration-fast: 150ms;/);
    expect(css).toMatch(/--usa-distance-md: 16px;/);
    expect(css).toMatch(/--usa-spring-snappy-stiffness: 300;/);
    expect(css).toMatch(/--usa-motion-enter-default-duration: var\(--usa-duration-normal\);/);
    expect(css).toMatch(/--usa-motion-enter-default-distance: var\(--usa-distance-md\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*:root \{[^}]*--usa-distance-md: 0px;/);
    expect(css).toMatch(/:root\[data-usa-motion-mode~="reduced"\] \{[^}]*--usa-distance-md: 0px;/);
    expect(css).toMatch(/:root\[data-usa-motion-mode~="compact"\] \{/);
    // a mode block only carries what changes
    const compact = /\[data-usa-motion-mode~="compact"\] \{([^}]*)\}/.exec(css)![1];
    expect(compact).not.toMatch(/--usa-easing-/);
  });
  it('options: prefix, selector, no modes; vars for one mode', () => {
    const css = motionTokenSetToCss(MOTION_TOKENS_2, { prefix: '--m', selector: '.app', modes: false });
    expect(css).toMatch(/^\.app \{/);
    expect(css).toMatch(/--m-duration-fast: 150ms/);
    expect(css).not.toMatch(/@media|data-usa-motion-mode/);
    expect(motionTokenSetVars(MOTION_TOKENS_2, { mode: 'reduced' })['--usa-distance-lg']).toBe('0px');
  });
});

describe('14.1 Motion Engine v2 + Scene Format v2 integration', () => {
  beforeEach(() => { vi.useFakeTimers(); setClock({ rate: 1, paused: false }); });
  afterEach(() => { vi.useRealTimers(); setClock({ rate: 1, paused: false }); });

  it('applyMotionTokenSet makes {duration.*}/{easing.*}/{spring.*} references in motionary/motion use the set; undo restores', () => {
    const undo = applyMotionTokenSet(defineMotionTokens({ duration: { fast: 90 }, spring: { snappy: { stiffness: 900, damping: 60, mass: 1 } } }), { root: document.documentElement });
    expect(getMotionTokens().duration.fast).toBe(90);
    expect(document.documentElement.style.getPropertyValue('--usa-distance-md')).toBe('16px');
    expect(animate(() => {}, { duration: '{duration.fast}', autoplay: false } as any).duration).toBe(90);
    const stiff = spring(() => {}, '{spring.snappy}', { autoplay: false } as any).duration;
    undo();
    const def = spring(() => {}, '{spring.snappy}', { autoplay: false } as any).duration;
    expect(stiff).toBeLessThan(def);
    expect(getMotionTokens().duration.fast).toBe(150);
    expect(document.documentElement.style.getPropertyValue('--usa-distance-md')).toBe('');
  });
  it('mode "auto" follows prefers-reduced-motion', () => {
    const mm = vi.fn().mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} });
    vi.stubGlobal('matchMedia', mm);
    const undo = applyMotionTokenSet(MOTION_TOKENS_2, { mode: 'auto' });
    expect(motionToken('duration', 'slow')).toBeLessThanOrEqual(150);
    undo();
    vi.unstubAllGlobals();
  });
  it('motionOptions / motionKeyframes feed animate() from a semantic token', () => {
    const o = motionOptions(MOTION_TOKENS_2, 'enter');
    expect(o).toEqual({ duration: 300, delay: 0, easing: 'cubic-bezier(0, 0, 0, 1)' });
    expect(motionKeyframes(MOTION_TOKENS_2, 'enter')).toEqual([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }]);
    expect(motionKeyframes(MOTION_TOKENS_2, 'exit', 'default', { axis: 'x' })[1]).toMatchObject({ opacity: 0 });
    expect(motionKeyframes(MOTION_TOKENS_2, 'enter', 'default', { mode: 'reduced' })).toEqual([{ opacity: 0, transform: 'none' }, { opacity: 1, transform: 'none' }]);
    const c = animate(() => {}, { ...o, autoplay: false } as any);
    expect(c.duration).toBe(300);
  });
  it('toSceneTokens / withSceneTokens: scene v2 token references validate against a custom set', () => {
    const s = defineMotionTokens({ duration: { hero: 1200 }, easing: { brand: 'cubic-bezier(0.3, 0, 0, 1)' } });
    const doc = { format: 'motionary-scene', version: 2, duration: 1200, layers: [{ id: 'a', type: 'track', target: '.a', easing: '{easing.brand}', component: { tag: 'usa-fade-up', props: { duration: '{duration.hero}' } }, keyframes: [{ id: 'k0', time: 0, props: { opacity: 0 } }, { id: 'k1', time: 1200, props: { opacity: 1 } }] }] };
    const before = validateSceneV2(doc as any);
    const withT = withSceneTokens(doc, s);
    expect((withT as any).tokens.duration.hero).toBe(1200);
    expect(toSceneTokens(s, 'reduced').duration.hero).toBeLessThanOrEqual(150);
    expect((doc as any).tokens).toBeUndefined();
    expect(validateSceneV2(withT as any)).toEqual([]);
    expect(JSON.stringify(before)).toMatch(/unknown token|unknown easing/);
  });
});

describe('14.1 Figma Variables adapter (REST API shapes, no network)', () => {
  it('exports a POST /v1/files/:key/variables body: collection, modes, typed variables, aliases', () => {
    const b: any = motionTokensToFigma(MOTION_TOKENS_2);
    expect(b.variableCollections).toEqual([{ action: 'CREATE', id: 'motion-collection', name: 'Motion', initialModeId: 'motion-mode-default' }]);
    expect(b.variableModes.map((m: any) => [m.action, m.name])).toEqual([['UPDATE', 'Default'], ['CREATE', 'Reduced motion'], ['CREATE', 'Compact']]);
    const v = (name: string) => b.variables.find((x: any) => x.name === name);
    expect(v('motion/duration/fast')).toMatchObject({ action: 'CREATE', resolvedType: 'FLOAT', variableCollectionId: 'motion-collection', codeSyntax: { WEB: 'var(--usa-duration-fast)' } });
    expect(v('motion/easing/standard').resolvedType).toBe('STRING');
    expect(v('motion/distance/md').resolvedType).toBe('FLOAT');
    expect(v('motion/spring/snappy/stiffness').resolvedType).toBe('FLOAT');
    expect(v('motion/enter/default/duration')).toBeTruthy();
    for (const x of b.variables) expect(x.name).not.toMatch(/[.{}]/);
    const val = (name: string, mode: string) => b.variableModeValues.find((x: any) => x.variableId === v(name).id && x.modeId === mode)?.value;
    expect(val('motion/duration/fast', 'motion-mode-default')).toBe(150);
    expect(val('motion/distance/md', 'motion-mode-reduced')).toBe(0);
    expect(val('motion/enter/default/duration', 'motion-mode-default')).toEqual({ type: 'VARIABLE_ALIAS', id: v('motion/duration/normal').id });
    // every value targets a declared variable and mode
    const ids = new Set(b.variables.map((x: any) => x.id)), modes = new Set(b.variableModes.map((m: any) => m.id));
    for (const x of b.variableModeValues) { expect(ids.has(x.variableId)).toBe(true); expect(modes.has(x.modeId)).toBe(true); }
  });
  it('options: collection name, chosen modes', () => {
    const b: any = motionTokensToFigma(MOTION_TOKENS_2, { collection: 'Brand motion', modes: ['reduced'] });
    expect(b.variableCollections[0].name).toBe('Brand motion');
    expect(b.variableModes.map((m: any) => m.name)).toEqual(['Default', 'Reduced motion']);
  });
  it('round-trips through the POST body', () => {
    const s = defineMotionTokens({ duration: { blink: 60 }, distance: { huge: 128 } });
    const back = motionTokensFromFigma(motionTokensToFigma(s));
    expect(back.duration).toEqual(s.duration);
    expect(back.distance).toEqual(s.distance);
    expect(back.spring).toEqual(s.spring);
    expect(back.semantic).toEqual(s.semantic);
    expect(withMode(back, 'reduced').distance.huge).toBe(0);
    expect(withMode(back, 'compact').duration.normal).toBe(withMode(s, 'compact').duration.normal);
  });
  it('imports a GET /v1/files/:key/variables/local response (ids, modes by name, aliases)', () => {
    const res = {
      status: 200, error: false,
      meta: {
        variableCollections: { 'VariableCollectionId:1:0': { id: 'VariableCollectionId:1:0', name: 'Motion', defaultModeId: '1:0', modes: [{ modeId: '1:0', name: 'Mode 1' }, { modeId: '1:1', name: 'Reduce motion' }, { modeId: '1:2', name: 'Dense UI' }] } },
        variables: {
          'VariableID:1:1': { id: 'VariableID:1:1', name: 'motion/duration/quick', resolvedType: 'FLOAT', variableCollectionId: 'VariableCollectionId:1:0', valuesByMode: { '1:0': 120, '1:1': 0, '1:2': 90 } },
          'VariableID:1:2': { id: 'VariableID:1:2', name: 'motion/easing/out', resolvedType: 'STRING', variableCollectionId: 'VariableCollectionId:1:0', valuesByMode: { '1:0': 'cubic-bezier(0, 0, 0.2, 1)', '1:1': 'cubic-bezier(0, 0, 0.2, 1)', '1:2': 'cubic-bezier(0, 0, 0.2, 1)' } },
          'VariableID:1:3': { id: 'VariableID:1:3', name: 'motion/distance/nudge', resolvedType: 'FLOAT', variableCollectionId: 'VariableCollectionId:1:0', valuesByMode: { '1:0': 12, '1:1': 0, '1:2': 6 } },
          'VariableID:1:4': { id: 'VariableID:1:4', name: 'motion/enter/card/duration', resolvedType: 'FLOAT', variableCollectionId: 'VariableCollectionId:1:0', valuesByMode: { '1:0': { type: 'VARIABLE_ALIAS', id: 'VariableID:1:1' } } },
          'VariableID:1:5': { id: 'VariableID:1:5', name: 'motion/enter/card/easing', resolvedType: 'STRING', variableCollectionId: 'VariableCollectionId:1:0', valuesByMode: { '1:0': { type: 'VARIABLE_ALIAS', id: 'VariableID:1:2' } } },
          'VariableID:9:9': { id: 'VariableID:9:9', name: 'color/brand', resolvedType: 'COLOR', variableCollectionId: 'VariableCollectionId:1:0', valuesByMode: { '1:0': { r: 1, g: 0, b: 0, a: 1 } } },
        },
      },
    };
    const s = motionTokensFromFigma(res);
    expect(s.duration.quick).toBe(120);
    expect(s.easing.out).toBe('cubic-bezier(0, 0, 0.2, 1)');
    expect(s.distance.nudge).toBe(12);
    expect(s.semantic.enter.card).toMatchObject({ duration: '{duration.quick}', easing: '{easing.out}' });
    expect(s.modes!.reduced).toMatchObject({ duration: { quick: 0 }, distance: { nudge: 0 } });
    expect(s.modes!['dense-ui']).toMatchObject({ duration: { quick: 90 }, distance: { nudge: 6 } });
    expect((s.modes!.reduced as any).easing).toBeUndefined();
    expect(validateMotionTokens(s)).toEqual([]);
  });
  it('the library makes no network calls', () => {
    const src = ['v2', 'set', 'figma'].map((f) => readFileSync(`src/components/tokens/${f}.ts`, 'utf8')).join('\n');
    expect(src).not.toMatch(/\bfetch\(|XMLHttpRequest|api\.figma\.com/);
  });
});

describe('14.1 CLI: motionary tokens', () => {
  let dir = '';
  let out: string[] = [];
  let err: string[] = [];
  const run = (...argv: string[]) => main(['tokens', ...argv], { motionTokens: T });
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tok-'));
    out = []; err = [];
    vi.spyOn(console, 'log').mockImplementation((...a) => { out.push(a.join(' ')); });
    vi.spyOn(console, 'error').mockImplementation((...a) => { err.push(a.join(' ')); });
    vi.spyOn(process.stdout, 'write').mockImplementation(((s: string) => { out.push(String(s)); return true; }) as any);
  });
  afterEach(() => { vi.restoreAllMocks(); rmSync(dir, { recursive: true, force: true }); });

  it('help lists the tokens commands; unknown subcommand → usage, exit 2', async () => {
    await main(['help'], {});
    expect(out.join('\n')).toMatch(/tokens import-figma <file>/);
    expect(out.join('\n')).toMatch(/tokens export-figma/);
    expect(await run('nope')).toBe(2);
    expect(err.join('\n')).toMatch(/usage: motionary tokens/);
  });
  it('export-figma (defaults) → import-figma → DTCG equal to the defaults', async () => {
    const fig = join(dir, 'figma.json'), dtcg = join(dir, 'tokens.json');
    expect(await run('export-figma', '--out', fig)).toBe(0);
    expect(JSON.parse(readFileSync(fig, 'utf8')).variables.length).toBeGreaterThan(30);
    expect(await run('import-figma', fig, '--out', dtcg)).toBe(0);
    const s = motionTokenSetFromDTCG(JSON.parse(readFileSync(dtcg, 'utf8')));
    expect(s.duration).toEqual(MOTION_TOKENS_2.duration);
    expect(s.semantic).toEqual(MOTION_TOKENS_2.semantic);
  });
  it('export-figma from a DTCG file with --collection / --modes; import-figma --css', async () => {
    const src = join(dir, 'in.json'), fig = join(dir, 'f.json'), css = join(dir, 't.css');
    writeFileSync(src, JSON.stringify(motionTokenSetToDTCG(defineMotionTokens({ duration: { blink: 60 } }))));
    expect(await run('export-figma', src, '--collection', 'Brand', '--modes', 'reduced', '--out', fig)).toBe(0);
    const b = JSON.parse(readFileSync(fig, 'utf8'));
    expect(b.variableCollections[0].name).toBe('Brand');
    expect(b.variables.some((v: any) => v.name === 'motion/duration/blink')).toBe(true);
    expect(await run('import-figma', fig, '--css', '--out', css)).toBe(0);
    expect(readFileSync(css, 'utf8')).toMatch(/--usa-duration-blink: 60ms/);
  });
  it('validate: exit 0 on a clean file, 1 with problems listed', async () => {
    const ok = join(dir, 'ok.json'), bad = join(dir, 'bad.json');
    writeFileSync(ok, JSON.stringify(motionTokenSetToDTCG(MOTION_TOKENS_2)));
    writeFileSync(bad, JSON.stringify({ motion: { duration: { $type: 'duration', x: { $value: '{motion.duration.nope}' } } } }));
    expect(await run('validate', ok)).toBe(0);
    expect(await run('validate', bad)).toBe(1);
    expect(err.join('\n') + out.join('\n')).toMatch(/nope/);
  });
  it('import-figma with a missing file → exit 2, nothing written', async () => {
    expect(await run('import-figma', join(dir, 'missing.json'), '--out', join(dir, 'x.json'))).toBe(2);
    expect(existsSync(join(dir, 'x.json'))).toBe(false);
  });
});
