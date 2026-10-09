import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { parseMotion, serializeMotion, motion, bindMotion, applyMotion, createComponent } from '../src/components/dsl';
import { MARKETPLACE, searchPlugins, installPlugin, installedPlugins, fetchMarketplace, validateManifest } from '../src/components/marketplace';
import { registerEffect, hasEffect } from '../src/components/fx/registry';
import { registerBuiltinEffects } from '../src/components/fx';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('9.0 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.0'])).toEqual(["usa-motion", "usa-plugin-store"]);
    for (const t of Object.keys(WIDGETS['9.0'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.0'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.0');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    for (const id of ["motion", "plugin-store"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-motion", "<usa-plugin-store"]) expect(doc).toContain(s);
  });
});


describe('9.0 DSL + marketplace', () => {
  it('parseMotion / serializeMotion round-trip and errors', () => {
    const p = parseMotion('enter: fade-up 600ms ease-out delay 100ms stagger 80ms; click: confetti count=40 spread=true; hover: pop 0.3s cubic-bezier(.2, .8, .2, 1) once; bogus: x; enter: fade wat');
    expect(p.rules[0]).toEqual({ trigger: 'enter', effect: 'fade-up', duration: 600, easing: 'ease-out', delay: 100, stagger: 80, options: {} });
    expect(p.rules[1].options).toEqual({ count: 40, spread: true });
    expect(p.rules[2]).toMatchObject({ trigger: 'hover', effect: 'pop', duration: 300, easing: 'cubic-bezier(.2, .8, .2, 1)', once: true });
    expect(p.errors.length).toBe(2);
    expect(p.errors[0]).toContain('unknown trigger');
    expect(p.errors[1]).toContain('"wat"');
    const s = serializeMotion(p.rules.slice(0, 3));
    expect(s).toBe('enter: fade-up 600ms ease-out delay 100ms stagger 80ms; click: confetti count=40 spread=true; hover: pop 300ms cubic-bezier(.2, .8, .2, 1) once');
    expect(parseMotion(s).rules).toEqual(p.rules.slice(0, 3));
    expect(motion`enter:   fade-up ${450}ms`).toBe('enter: fade-up 450ms');
  });
  it('bindMotion / applyMotion bind effects with stagger, report unknown effects, observe, cleanup', async () => {
    registerBuiltinEffects();
    const run = vi.fn();
    registerEffect({ name: 'dsl-probe', kind: 'attention', description: 'probe', defaults: {}, run: (el: HTMLElement, o: any) => run(el, o) } as any, { override: true });
    const root = document.createElement('div');
    root.innerHTML = '<div id="a" data-motion="click: dsl-probe 200ms k=2; click: nope"><i></i></div><ul data-motion="click: dsl-probe stagger 50ms delay 10ms"><li>1</li><li>2</li></ul>';
    document.body.append(root);
    const { errors, cleanup } = applyMotion(root, { observe: true });
    expect(errors.some((e) => e.includes('"nope"'))).toBe(true);
    (root.querySelector('#a') as HTMLElement).click();
    await tick();
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][1]).toMatchObject({ duration: 200, k: 2 });
    const lis = root.querySelectorAll('li');
    (lis[1] as HTMLElement).click();
    await tick();
    expect(run.mock.calls[1][1].delay).toBe(60);
    const late = document.createElement('p');
    late.setAttribute('data-motion', 'click: dsl-probe');
    root.append(late);
    await tick();
    late.click();
    await tick();
    expect(run).toHaveBeenCalledTimes(3);
    cleanup();
    (root.querySelector('#a') as HTMLElement).click();
    await tick();
    expect(run).toHaveBeenCalledTimes(3);
    const errs: string[] = [];
    bindMotion(document.createElement('div'), 'zap: x', (m) => errs.push(m))();
    expect(errs[0]).toContain('unknown trigger');
  });
  it('createComponent builds markup from component JSON, refusing scripts and handlers', () => {
    const el = createComponent('{"$schema":"motionary/component@1","tag":"usa-radar","attrs":{"targets":"A:10,0.5","onclick":"x()"},"children":["hi",{"tag":"b","children":["x"]}]}');
    expect(el.outerHTML).toBe('<usa-radar targets="A:10,0.5">hi<b>x</b></usa-radar>');
    expect(() => createComponent({ tag: 'script' })).toThrow();
    expect(() => createComponent({ tag: '<img>' } as any)).toThrow();
  });
  it('marketplace: catalogue, search, install first-party + third-party, index fetch', async () => {
    expect(MARKETPLACE.length).toBeGreaterThanOrEqual(8);
    expect(new Set(MARKETPLACE.map((p) => p.name)).size).toBe(MARKETPLACE.length);
    expect(searchPlugins('glitch')[0].name).toBe('motionary/fx/cyber');
    expect(searchPlugins('neon')[0].name).toBe('motionary/fx/surface');
    expect(searchPlugins('zzz-nothing')).toEqual([]);
    expect(searchPlugins('').length).toBe(MARKETPLACE.length);
    const reg = vi.fn();
    const p = MARKETPLACE.find((x) => x.name === 'motionary/fx/retro')!;
    const load = vi.fn(async () => ({ registerRetroPack: reg }));
    expect(await installPlugin(p, { load })).toEqual(p.effects);
    expect(reg).toHaveBeenCalledTimes(1);
    await installPlugin(p, { load });
    expect(load).toHaveBeenCalledTimes(1);
    const effects = [{ name: 'acme-frost', kind: 'enter', description: 'frost', defaults: {}, run: () => undefined }];
    const manifest = { format: 'motionary/effect-pack', version: 1, name: '@acme/frost', packVersion: '1.0.0', effects: [{ name: 'acme-frost', kind: 'enter' }] };
    expect(validateManifest(manifest, effects as any).ok).toBe(true);
    expect(await installPlugin('https://cdn.example/frost.js', { load: async () => ({ effects, manifest }) })).toEqual(['acme-frost']);
    expect(hasEffect('acme-frost')).toBe(true);
    expect(Object.keys(installedPlugins())).toEqual(['motionary/fx/retro', 'https://cdn.example/frost.js']);
    const f: any = async () => ({ json: async () => ({ format: 'motionary/marketplace', version: 1, plugins: [{ name: 'x', entry: 'y' }, { bad: 1 }] }) });
    expect((await fetchMarketplace('u', f)).map((x) => x.name)).toEqual(['x']);
    const g: any = async () => ({ json: async () => ({ format: 'nope' }) });
    await expect(fetchMarketplace('u', g)).rejects.toThrow();
  });
  it('<usa-motion> and <usa-plugin-store>', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const m = mount<any>('<usa-motion rules="click: pop; hover: nonexistent-fx; wat"><b>x</b></usa-motion>');
    expect(m.parsed.map((r: any) => r.effect)).toEqual(['pop', 'nonexistent-fx']);
    expect(m.errors.length).toBe(2);
    const s = mount<any>('<usa-plugin-store query="paper"></usa-plugin-store>');
    expect(s.getAttribute('role')).toBe('search');
    expect(s.querySelectorAll('.usa-ps-card').length).toBe(1);
    expect(s.querySelector('.usa-ps-count').textContent).toBe('1 plugin');
    expect(s.search('').length).toBe(MARKETPLACE.length);
    const ev = vi.fn();
    s.addEventListener('usa:install', ev);
    s.loader = async () => ({ registerPaperPack: () => undefined });
    s.search('paper');
    await s.install('motionary/fx/paper');
    expect(ev.mock.calls[0][0].detail.name).toBe('motionary/fx/paper');
    const b = s.querySelector('.usa-ps-install');
    expect(b.disabled).toBe(true);
    expect(b.textContent).toBe('Installed ✓');
    const err = vi.fn();
    s.addEventListener('usa:install-error', err);
    s.loader = async () => {
      throw new Error('offline');
    };
    s.search('spatial');
    await s.install('motionary/fx/spatial');
    expect(err.mock.calls[0][0].detail.message).toBe('offline');
    expect(s.querySelector('.usa-ps-install').textContent).toBe('Retry');
  });
});
