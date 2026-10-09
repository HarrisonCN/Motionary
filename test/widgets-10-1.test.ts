import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { PREREQS, prereqFor, requiresLabel } from '../showcase/catalog/prereqs.js';
import { readFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import * as rt from '../src/runtime';
import { formatCss, parseKeyframes, fromWaapi, toWaapi, playKeyframes, fromCssRule } from '../src/runtime/format-css';
import { formatMotion, fromMotion, playMotion, springEase, motionEase } from '../src/runtime/format-motion';
import { registry } from '../src/runtime/registry';
import { pluginIntegrity, verifyPlugin, satisfies, checkCompat } from '../src/components/marketplace';

const step = (ms: number, n = 1) => { for (let i = 0; i < n; i++) rt.getTicker().step(ms); };
const resetRegistry = () => registry().modules.clear();

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  resetRegistry();
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

describe('10.1 motionary/runtime — registry', () => {
  it('use() registers the core and modules; requireModule returns their API', () => {
    expect(rt.hasModule('core')).toBe(false);
    rt.use(formatCss, formatMotion);
    expect(rt.registeredModules()).toEqual(['core', 'format-css', 'format-motion']);
    expect(rt.requireModule<any>('format-css').parseKeyframes).toBe(parseKeyframes);
    expect(rt.requireModule<any>('core').version).toBe(rt.RUNTIME_VERSION);
  });
  it('a missing module throws a RuntimeModuleError with install, import, registration and CDN instructions', () => {
    let err: any;
    try { rt.requireModule('format-css', '<usa-demo>'); } catch (e) { err = e; }
    expect(err).toBeInstanceOf(rt.RuntimeModuleError);
    expect(err.module).toBe('format-css');
    for (const s of ['<usa-demo> requires motionary/runtime/format-css', 'npm i motionary', "import { formatCss } from 'motionary/runtime/format-css'", 'use(formatCss)', 'runtime.iife.js', 'runtime/format-css.iife.js', 'docs/runtime/format-css.md']) expect(err.message).toContain(s);
  });
  it('a module whose dependency is missing is refused clearly; non-modules are rejected', async () => {
    const { register } = await import('../src/runtime/registry');
    expect(() => register(formatCss)).toThrow(/requires motionary\/runtime/);
    expect(() => rt.use({} as any)).toThrow(/not a runtime module/);
  });
  it('one registry per page (globalThis), shared by every copy of the runtime', () => {
    rt.use();
    expect((globalThis as any)[Symbol.for('motionary.runtime')].modules.has('core')).toBe(true);
    expect(rt.getTicker()).toBe(rt.getTicker());
  });
  it('the runtime source never touches window/document at import (SSR / workers)', () => {
    for (const f of ['index', 'registry', 'ticker', 'tween', 'ease', 'keyframes', 'format-css', 'format-motion']) {
      const s = readFileSync(`src/runtime/${f}.ts`, 'utf8');
      const top = s.split('\n').filter((l) => !/^\s/.test(l) && !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
      expect(top, f).not.toMatch(/\b(window|document)\b[.[]/);
      expect(s, f).not.toMatch(/from '(gsap|three|lottie-web|matter-js|@rive-app)/);
    }
  });
});

describe('10.1 motionary/runtime — ticker, easing, tween, timeline', () => {
  it('ticker: listeners, timeScale and lag smoothing', () => {
    const t = rt.getTicker();
    const seen: number[] = [];
    const off = t.add((_, d) => seen.push(d));
    t.step(16);
    t.timeScale = 0.5;
    t.step(16);
    t.timeScale = 1;
    off();
    t.step(16);
    expect(seen).toEqual([16, 8]);
    expect(t.size).toBe(0);
  });
  it('easing: named curves, cubic-bezier, steps; unknown names throw', () => {
    expect(rt.EASES.linear(0.3)).toBeCloseTo(0.3);
    expect(rt.EASES['cubic-out'](0.5)).toBeCloseTo(0.875);
    expect(rt.EASES['quad-in-out'](0.25)).toBeCloseTo(0.125);
    expect(rt.EASES['bounce-out'](1)).toBeCloseTo(1);
    const ease = rt.cubicBezier(0.42, 0, 0.58, 1);
    expect(ease(0.5)).toBeCloseTo(0.5, 3);
    expect(rt.parseEase('cubic-bezier(0, 0, 1, 1)')(0.37)).toBeCloseTo(0.37, 3);
    expect(rt.parseEase('steps(4)')(0.3)).toBe(0.25);
    expect(rt.parseEase('steps(4, start)')(0.3)).toBe(0.5);
    expect(() => rt.parseEase('wobbly')).toThrow(/unknown ease/);
  });
  it('tween: plain objects, ease, onUpdate, completion promise', async () => {
    const o = { x: 0, y: 10 };
    const ups: number[] = [];
    const t = rt.tween(o, { to: { x: 100, y: 0 }, duration: 1000, ease: 'linear', onUpdate: (p) => ups.push(p) });
    step(250);
    expect(o.x).toBeCloseTo(25);
    expect(o.y).toBeCloseTo(7.5);
    step(1000);
    expect(o.x).toBe(100);
    await t;
    expect(ups.at(-1)).toBe(1);
    expect(t.isActive).toBe(false);
  });
  it('tween: elements — transform shorthands, colours, units, custom properties', () => {
    const el = document.createElement('div');
    document.body.append(el);
    const t = rt.tween(el, { from: { x: 0, rotate: 0, opacity: 0, backgroundColor: '#000000', width: '10px', '--glow': '0px' }, to: { x: 100, rotate: 90, opacity: 1, backgroundColor: '#ffffff', width: '50%', '--glow': '8px' }, duration: 100, ease: 'linear', paused: true });
    t.seek(50);
    expect(el.style.transform).toBe('translate(50px, 0px) rotate(45deg)');
    expect(el.style.opacity).toBe('0.5');
    expect(el.style.backgroundColor).toMatch(/128, 128, 128|rgba\(128/);
    expect(el.style.getPropertyValue('--glow')).toBe('4px');
    t.seek(100);
    expect(el.style.width).toBe('50%');
  });
  it('tween: repeat + yoyo, reverse(), several targets with stagger, selector targets', async () => {
    const o = { v: 0 };
    const t = rt.tween(o, { to: { v: 10 }, duration: 100, ease: 'linear', repeat: 1, yoyo: true, paused: true });
    expect(t.totalDuration).toBe(200);
    t.seek(150);
    expect(o.v).toBeCloseTo(5);
    t.seek(200);
    expect(o.v).toBe(0);
    t.reverse();
    step(250);
    await t.finished;
    const list = [{ a: 0 }, { a: 0 }, { a: 0 }];
    const g = rt.tween(list, { to: { a: 1 }, duration: 100, stagger: 50, ease: 'linear', paused: true });
    g.seek(100);
    expect(list.map((x) => +x.a.toFixed(2))).toEqual([1, 0.5, 0]);
    document.body.innerHTML = '<i class="q"></i><i class="q"></i>';
    const s = rt.tween('.q', { to: { opacity: 0 }, duration: 10, paused: true });
    expect((s as rt.Timeline).getChildren()).toHaveLength(2);
  });
  it('timeline: positions (>, <, +=, -=, labels), callbacks, seek both ways', () => {
    const a = { v: 0 }, b = { v: 0 }, c = { v: 0 };
    const calls: string[] = [];
    const tl = rt.timeline({ paused: true, defaults: { ease: 'linear', duration: 100 } })
      .to(a, { to: { v: 1 } })
      .label('mid')
      .to(b, { to: { v: 1 } }, '<+=50')
      .call(() => calls.push('cb'), 'mid')
      .to(c, { to: { v: 1 } }, 'mid+=100');
    expect(tl.labelTime('mid')).toBe(100);
    expect(tl.duration).toBe(300);
    tl.seek(75);
    expect([a.v, b.v, c.v].map((x) => +x.toFixed(2))).toEqual([0.75, 0.25, 0]);
    tl.seek(250);
    expect(calls).toEqual(['cb']);
    expect([a.v, b.v, +c.v.toFixed(2)]).toEqual([1, 1, 0.5]);
    tl.seek(0);
    expect([a.v, b.v, c.v]).toEqual([0, 0, 0]);
    expect(() => tl.to(a, { to: { v: 2 } }, 'nope')).toThrow(/unknown timeline label/);
  });
  it('timeline: nested timelines, repeat, progress setter', () => {
    const o = { v: 0 };
    const inner = new rt.Timeline({}).to(o, { to: { v: 10 }, duration: 100, ease: 'linear' });
    const tl = rt.timeline({ paused: true, repeat: 1 }).add(inner, 50);
    expect(tl.totalDuration).toBe(300);
    tl.progress = 0.25;
    expect(o.v).toBeCloseTo(2.5);
    tl.seek(275);
    expect(o.v).toBeCloseTo(7.5);
    tl.seek(300);
    expect(o.v).toBe(10);
  });
});

const CSS = readFileSync('test/fixtures/formats/sample-keyframes.css', 'utf8');
describe('10.1 format-css: CSS @keyframes + WAAPI keyframes', () => {
  it('parses a real stylesheet: prefixed + quoted names, selector lists, @media nesting, comments, !important', () => {
    const defs = parseKeyframes(CSS);
    expect(defs.map((d) => d.name)).toEqual(['heartbeat', 'heartbeat', 'slide-in-up', 'glow', 'wobble']);
    const hb = defs[1];
    expect(hb.frames.map((f) => f.offset)).toEqual([0, 0.14, 0.28, 0.42, 0.7]);
    expect(hb.frames[1].props.transform).toBe('scale(1.3)');
    const up = defs[2];
    expect(up.frames[0].easing).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
    expect(up.frames[1].props.opacity).toBe('1');
    const glow = defs[3];
    expect(glow.frames[1].props).toMatchObject({ backgroundColor: 'rgb(255 0 128 / 0.5)', '--spread': '12px' });
    expect(glow.frames[1].easing).toBe('steps(4, end)');
  });
  it('plays keyframes on an element: transforms as shorthands, per-frame easing, 3D transforms switch discretely', () => {
    const el = document.createElement('div');
    const [, hb] = parseKeyframes(CSS);
    const tl = playKeyframes(el, hb, { duration: 1000, paused: true });
    tl.seek(70);
    expect(el.style.transform).toMatch(/scale\(1\.15\)/);
    const up = parseKeyframes(CSS)[2];
    const el2 = document.createElement('div');
    const t2 = playKeyframes(el2, up, { duration: 1000, paused: true });
    t2.seek(1000);
    expect(el2.style.opacity).toBe('1');
    expect(el2.style.transform).toBe('translate(0px, 0px)'); // translate3d(0, 40px, 0) → translateY(0)
    t2.seek(0);
    expect(el2.style.transform).toBe('translate(0px, 40px)');
    const el3 = document.createElement('div');
    playKeyframes(el3, parseKeyframes('@keyframes m { from { transform: matrix(1,0,0,1,0,0) } to { transform: matrix(2,0,0,2,0,0) } }')[0], { duration: 100, paused: true }).seek(100);
    expect(el3.style.transform).toBe('matrix(2,0,0,2,0,0)');
  });
  it('fromCssRule() reads a live CSSKeyframesRule', () => {
    const def = fromCssRule({ name: 'fade', cssText: '@keyframes fade { 0% { opacity: 0; } 100% { opacity: 1; } }' });
    expect(def).toEqual({ name: 'fade', frames: [{ offset: 0, props: { opacity: '0' } }, { offset: 1, props: { opacity: '1' } }] });
  });
  it('WAAPI keyframes: array form with partial offsets and property-indexed form', () => {
    const a = fromWaapi([{ opacity: 0 }, { opacity: 0.8, offset: 0.8, easing: 'ease-in' }, { opacity: 1 }, { opacity: 0.5 }]);
    expect(a.map((f) => +f.offset.toFixed(3))).toEqual([0, 0.8, 0.9, 1]);
    expect(a[1].easing).toBe('ease-in');
    const b = fromWaapi({ transform: ['translateX(0)', 'translateX(100px)'], opacity: [0, 1], easing: 'ease-out', composite: 'add' });
    expect(b).toHaveLength(2);
    expect(b[1].props).toEqual({ transform: 'translateX(100px)', opacity: 1 });
    expect(toWaapi(b)[0]).toMatchObject({ offset: 0, opacity: 0, easing: 'ease-out' });
    const o = { opacity: 0 };
    const tl = playKeyframes(o, fromWaapi({ opacity: [0, 1] }), { duration: 100, paused: true });
    tl.seek(50);
    expect(o.opacity).toBeCloseTo(0.5);
  });
});

const MOTION = JSON.parse(readFileSync('test/fixtures/formats/sample-motion.json', 'utf8'));
describe('10.1 format-motion: Motion / Framer keyframe JSON', () => {
  it('groups per-property transitions and keeps times / array keyframes', () => {
    const g = fromMotion(MOTION);
    expect(g.map((x) => x.props)).toEqual([['opacity', 'y'], ['scale'], ['backgroundColor']]);
    expect(g[0].frames.map((f) => f.offset)).toEqual([0, 0.7, 1]);
    expect(g[0].frames.map((f) => f.props.y)).toEqual([40, -8, 0]);
    expect(g[2].transition).toMatchObject({ duration: 0.3, repeat: 1, repeatType: 'reverse' });
  });
  it('springs are simulated into an easing that overshoots and settles at 1', () => {
    const [ease, ms] = springEase({ stiffness: 220, damping: 12 });
    expect(ms).toBeGreaterThan(300);
    const peak = Math.max(...Array.from({ length: 100 }, (_, i) => ease(i / 100)));
    expect(peak).toBeGreaterThan(1.05);
    expect(ease(1)).toBe(1);
    expect(motionEase([0.4, 0, 0.2, 1])(1)).toBe(1);
    expect(() => motionEase('wiggle')).toThrow(/unknown ease/);
  });
  it('playMotion applies initial immediately and animates to the targets', () => {
    const el = document.createElement('div');
    const tl = playMotion(el, MOTION, { paused: true });
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('translate(0px, 40px)');
    tl.seek(tl.duration);
    expect(el.style.opacity).toBe('1');
    expect(el.style.transform).toContain('scale(1)');
  });
});

describe('10.1 plugin ecosystem: integrity, semver, scaffold', () => {
  it('pluginIntegrity / verifyPlugin (SRI sha256)', async () => {
    expect(await pluginIntegrity('abc')).toBe('sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=');
    expect(await verifyPlugin('abc', 'sha384-nope sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=')).toBe(true);
    expect(await verifyPlugin('abd', 'sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=')).toBe(false);
  });
  it('satisfies() semver ranges + checkCompat()', () => {
    const t: [string, string, boolean][] = [['10.1.0', '^10.0.0', true], ['11.0.0', '^10.0.0', false], ['10.1.0', '~10.1.0', true], ['10.2.0', '~10.1', false], ['10.1.0', '>=10 <11', true], ['9.9.0', '>=10.0.0', false], ['10.1.0', '10.x', true], ['10.1.0', '9.x || 10.x', true], ['0.2.5', '^0.2.1', true], ['0.3.0', '^0.2.1', false], ['10.1.0', '10.0.0 - 10.2.0', true], ['10.1.0', '*', true], ['10.1.0', '>10', false]];
    for (const [v, r, ok] of t) expect(satisfies(v, r), `${v} ${r}`).toBe(ok);
    expect(checkCompat({ name: 'x', engines: { motionary: '>=11' } }, '10.1.0')).toMatchObject({ ok: false, range: '>=11' });
  });
  it('create-motionary-plugin scaffolds a working plugin', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mp-'));
    try {
      execFileSync(process.execPath, ['bin/create-motionary-plugin.mjs', 'motionary-plugin-sparkle', '--dir', join(dir, 'p')], { stdio: 'pipe' });
      for (const f of ['package.json', 'src/index.js', 'test/plugin.test.mjs', 'scripts/sign.mjs', 'README.md']) expect(existsSync(join(dir, 'p', f)), f).toBe(true);
      const pkg = JSON.parse(readFileSync(join(dir, 'p/package.json'), 'utf8'));
      expect(pkg.engines.motionary).toMatch(/^>=10/);
      execFileSync(process.execPath, ['--test', 'test/plugin.test.mjs'], { cwd: join(dir, 'p'), stdio: 'pipe' });
      expect(() => execFileSync(process.execPath, ['bin/create-motionary-plugin.mjs', 'Bad Name'], { stdio: 'pipe' })).toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 30000);
});

describe('10.1 widgets', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['10.1'])).toEqual(['usa-plugin-card', 'usa-install-button']);
    for (const t of Object.keys(WIDGETS['10.1'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('<usa-plugin-card> without the runtime: visible clear error, logged once, usa:runtime-missing', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const seen: any[] = [];
    document.addEventListener('usa:runtime-missing', (e: any) => seen.push(e.detail), { once: true });
    document.body.innerHTML = '<usa-plugin-card name="retro" version="1.0.0" downloads="5000"><p>x</p></usa-plugin-card>';
    const el = document.querySelector('usa-plugin-card') as any;
    const msg = el.querySelector('.usa-rt-missing');
    expect(msg?.getAttribute('role')).toBe('alert');
    expect(msg?.textContent).toContain('<usa-plugin-card> requires motionary/runtime');
    expect(msg?.textContent).toContain('npm i motionary');
    expect(err).toHaveBeenCalledTimes(1);
    expect(seen[0].module).toBe('core');
    expect(el.querySelector('.usa-pc-dl b').textContent).toBe('5.0k');
  });
  it('<usa-plugin-card> with the runtime: compat badge, toggle, details', () => {
    rt.use();
    document.body.innerHTML = '<usa-plugin-card name="retro" title="Retro" version="1.2.0" author="Motionary" engine="^10.0.0" downloads="12400"><p>Details</p></usa-plugin-card><usa-plugin-card name="next" engine=">=11"></usa-plugin-card>';
    const [a, b] = Array.from(document.querySelectorAll('usa-plugin-card')) as any[];
    expect(a.querySelector('.usa-rt-missing')).toBeNull();
    expect(a.querySelector('.usa-pc-name').textContent).toBe('Retro');
    expect(a.querySelector('.usa-pc-sub').textContent).toBe('v1.2.0 · Motionary');
    expect(a.querySelector('.usa-pc-compat').dataset.ok).toBe('true');
    expect(b.compat().ok).toBe(false);
    expect(b.querySelector('.usa-pc-compat').textContent).toContain('needs >=11');
    expect(a.querySelector('.usa-pc-details p').textContent).toBe('Details');
    const ev: any[] = [];
    a.addEventListener('usa:toggle', (e: any) => ev.push(e.detail.open));
    a.toggle(true);
    expect(a.querySelector('.usa-pc-more').getAttribute('aria-expanded')).toBe('true');
    expect(a.querySelector('.usa-pc-details').hidden).toBe(false);
    expect(ev).toEqual([true]);
  });
  it('<usa-plugin-card> verifies a signature against the code at src', async () => {
    rt.use();
    vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => 'abc' })));
    document.body.innerHTML = '<usa-plugin-card name="p" integrity="sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=" src="/p.js"></usa-plugin-card>';
    const el = document.querySelector('usa-plugin-card') as any;
    expect(await el.verify()).toBe(true);
    expect(el.querySelector('.usa-pc-sig').dataset.state).toBe('ok');
  });
  it('<usa-install-button>: manager tabs, commands, copy + usa:copy', async () => {
    const write = vi.fn(async () => {});
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: write } });
    document.body.innerHTML = '<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></usa-install-button>';
    const el = document.querySelector('usa-install-button') as any;
    expect(el.querySelectorAll('[role=tab]')).toHaveLength(5);
    expect(el.command('npm')).toBe('npm i motionary');
    expect(el.command('pnpm')).toBe('pnpm add motionary');
    expect(el.command('bun')).toBe('bun add motionary');
    expect(el.command('cdn')).toBe('<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>');
    (el.querySelector('[data-m=yarn]') as HTMLElement).click();
    expect(el.querySelector('code').textContent).toBe('yarn add motionary');
    const got: any[] = [];
    el.addEventListener('usa:copy', (e: any) => got.push(e.detail));
    expect(await el.copy()).toBe('yarn add motionary');
    expect(write).toHaveBeenCalledWith('yarn add motionary');
    expect(got[0]).toEqual({ text: 'yarn add motionary', manager: 'yarn' });
    expect(el.querySelector('.usa-ib-copy').textContent).toBe('✓ Copied');
  });
});

describe('10.1 prerequisites in the gallery, Store, docs, README and AI manifest', () => {
  it('cards declare requires; Store items carry the badge + prereq; snippets start with the prerequisites', () => {
    const card: any = COMPONENTS.find((c: any) => c.tag === 'usa-plugin-card');
    expect(card.requires).toEqual(['core']);
    expect(card.since).toBe('10.1');
    const item: any = COMPONENT_ITEMS.find((i: any) => i.gallery === 'plugin-card');
    expect(item.requiresBadge).toBe('Requires: motionary/runtime');
    expect(item.prereq.install).toBe('npm i motionary');
    expect(item.prereq.importAndRegister).toContain("import { use } from 'motionary/runtime';");
    expect(item.prereq.importAndRegister).toContain('use();');
    expect(item.prereq.cdn).toContain('runtime.iife.js');
    const s = componentSnippets(card);
    expect(s.esm.indexOf('use();')).toBeLessThan(s.esm.indexOf('definePluginCard();'));
    expect(s.html).toContain('runtime.iife.js');
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'install-button').requiresBadge).toBe('');
    expect(requiresLabel(['core', 'format-css'])).toBe('Requires: motionary/runtime + motionary/runtime/format-css');
    expect(() => prereqFor({ tag: 'x', requires: ['nope'] })).toThrow(/unknown prerequisite/);
  });
  it('docs: one page per module with a compatibility table; README + components.md prerequisite blocks are current', async () => {
    const { generate } = await import('../scripts/gen-runtime-docs.mjs');
    const files = generate();
    for (const [f, s] of Object.entries(files)) expect(readFileSync(f, 'utf8'), f).toBe(s);
    for (const p of Object.values(PREREQS) as any[]) {
      const d = readFileSync(p.docs, 'utf8');
      expect(d).toContain('## Compatibility');
      expect(d).toContain(p.cdn.split('\n').pop());
    }
    expect(readFileSync('README.md', 'utf8')).toContain('`<usa-plugin-card>` — Requires: motionary/runtime');
  });
  it('AI manifest: schema fields, source-derived attributes / events / methods, prerequisites, llms.txt', async () => {
    const { buildManifest, llms, llmsFull } = await import('../scripts/gen-manifest.mjs');
    const m = buildManifest();
    const schema = JSON.parse(readFileSync('scripts/manifest.schema.json', 'utf8'));
    for (const k of schema.required) expect(m, k).toHaveProperty(k);
    expect(m.runtimeModules.map((r: any) => r.id)).toEqual(expect.arrayContaining(['core', 'format-css', 'format-motion']));
    const tags = m.components.map((c: any) => c.tag);
    expect(new Set(tags).size).toBe(tags.length);
    for (const c of m.components) for (const k of schema.$defs.component.required) expect(c, `${c.tag}.${k}`).toHaveProperty(k);
    const pc = m.components.find((c: any) => c.tag === 'usa-plugin-card');
    expect(pc.attributes).toEqual(['name', 'title', 'version', 'author', 'engine', 'downloads', 'integrity', 'src']);
    expect(pc.events).toEqual(expect.arrayContaining(['usa:toggle', 'usa:verified', 'usa:runtime-missing']));
    expect(pc.methods).toEqual(['toggle', 'verify', 'compat']);
    expect(pc.import).toEqual({ path: 'motionary/components/widgets', define: 'definePluginCard', register: 'definePluginCard();' });
    expect(pc.prerequisites.badge).toBe('Requires: motionary/runtime');
    const card = m.components.find((c: any) => c.tag === 'usa-card');
    expect(card.attributes.length).toBeGreaterThan(0);
    expect(llms(m)).toContain('`<usa-plugin-card>` (motionary/components/widgets; requires motionary/runtime)');
    expect(llmsFull(m)).toContain('### <usa-install-button> — Install button');
  });
  it('package wiring: runtime subpath exports, CDN builds, CI check, Pages files', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const k of ['./runtime', './runtime/format-css', './runtime/format-motion', './manifest.json']) expect(pkg.exports[k], k).toBeTruthy();
    expect(pkg.bin['create-motionary-plugin']).toBe('./bin/create-motionary-plugin.mjs');
    expect(pkg.scripts['check:peer-docs']).toBeTruthy();
    expect(pkg.peerDependencies).not.toHaveProperty('gsap');
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).toContain('npm run check:peer-docs');
    expect(readFileSync('.github/workflows/pages.yml', 'utf8')).toContain('_site/components.json');
    const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')).map((b: any) => b.name).join('\n');
    for (const n of ["import 'motionary/runtime'", "import 'motionary/runtime/format-css'", "import 'motionary/runtime/format-motion'", 'dist/runtime.iife.js']) expect(budgets).toContain(n);
    const road = readFileSync('docs/ROADMAP.md', 'utf8');
    expect(road).toContain('✅ **v10.1**');
    expect(road).toContain('@rive-app/canvas');
  });
});
