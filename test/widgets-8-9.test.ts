import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, describeComponent, exportComponent, parseProps } from '../src/components/widgets';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { transform as codemod9 } from '../bin/usa-codemod-9.mjs';
import { applyTheme, applyMotionTheme, MOTION_THEMES, THEMES, defineMotionTheme } from '../src/components/effects';

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

describe('8.9 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.9'])).toEqual(["usa-code-export", "usa-prop-panel"]);
    for (const t of Object.keys(WIDGETS['8.9'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.9'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.9');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    for (const id of ["code-export", "prop-panel"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-code-export", "<usa-prop-panel"]) expect(doc).toContain(s);
  });
});


describe('8.9 low-code export + 9.0 deprecations', () => {
  it('describeComponent strips runtime parts; exportComponent formats', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const r = mount<any>('<usa-hud-panel title="CORE" class="x usa-y"><p data-value="40">Fuel</p></usa-hud-panel>');
    const d = describeComponent(r);
    expect(d.tag).toBe('usa-hud-panel');
    expect(d.attrs).toEqual({ title: 'CORE', class: 'x' });
    expect(JSON.stringify(d.children)).not.toContain('usa-hud'); // generated HUD parts are stripped (the tag itself is usa-hud-panel)
    expect(JSON.stringify(d)).not.toContain('%');
    expect((d.children[0] as any).attrs).toEqual({ 'data-value': '40' });
    const html = exportComponent(r, 'html');
    expect(html).toContain('<usa-hud-panel title="CORE" class="x">');
    expect(html).toContain("import { defineWidgets } from 'https://cdn.jsdelivr.net/npm/motionary/dist/components/widgets.js'");
    expect(exportComponent(r, 'react')).toContain('className="x"');
    expect(exportComponent(r, 'vue')).toContain('<template>');
    expect(JSON.parse(exportComponent(r, 'json')).$schema).toBe('motionary/component@1');
  });
  it('code export: tabs, follows attribute changes, copy', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-code-export formats="html,react,bogus"><usa-radar targets="A:10,0.5"></usa-radar></usa-code-export>');
    const tabs = c.querySelectorAll('[role=tab]');
    expect([...tabs].map((t: any) => t.textContent)).toEqual(['HTML', 'React']);
    expect(c.querySelector('code').textContent).toContain('<usa-radar targets="A:10,0.5"></usa-radar>');
    tabs[1].click();
    expect(c.format).toBe('react');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    c.querySelector('usa-radar').setAttribute('speed', '2');
    await new Promise((r) => setTimeout(r, 0));
    expect(c.querySelector('code').textContent).toContain('speed="2"');
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const ev = vi.fn();
    c.addEventListener('usa:copy', ev);
    expect(await c.copy()).toBe(true);
    expect(writeText.mock.calls[0][0]).toContain('useEffect');
    expect(ev.mock.calls[0][0].detail).toEqual({ format: 'react', ok: true });
  });
  it('prop panel: parseProps, typed fields drive attributes, reset', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(parseProps('value:number:0:5, icon:select:star|heart, on:boolean, 9bad, label')).toEqual([
      { name: 'value', type: 'number', options: ['0', '5'] },
      { name: 'icon', type: 'select', options: ['star', 'heart'] },
      { name: 'on', type: 'boolean', options: [] },
      { name: 'label', type: 'text', options: [] },
    ]);
    const box = document.createElement('div');
    box.innerHTML = '<usa-radar id="rd" rings="3"></usa-radar><usa-prop-panel for="previous" props="rings:number:1:8, label:text, flag:boolean, speed:select:2|4"></usa-prop-panel>';
    document.body.append(box);
    const t = box.querySelector<any>('usa-radar');
    const p = box.querySelector<any>('usa-prop-panel');
    expect(p.querySelector('form').getAttribute('aria-label')).toBe('Properties');
    const rings = p.querySelector('[data-p=rings]');
    expect(rings.type).toBe('range');
    expect(rings.value).toBe('3');
    const ev = vi.fn();
    p.addEventListener('usa:prop', ev);
    rings.value = '6';
    rings.dispatchEvent(new Event('input', { bubbles: true }));
    expect(t.getAttribute('rings')).toBe('6');
    expect(t.querySelectorAll('.usa-rd-ring').length).toBe(6);
    const flag = p.querySelector('[data-p=flag]');
    flag.checked = true;
    flag.dispatchEvent(new Event('change', { bubbles: true }));
    expect(t.getAttribute('flag')).toBe('');
    expect(ev.mock.calls.map((c: any) => c[0].detail.name)).toEqual(['rings', 'flag']);
    p.reset();
    expect(t.getAttribute('rings')).toBe('3');
    expect(t.hasAttribute('flag')).toBe(false);
    expect(p.querySelector('[data-p=rings]').value).toBe('3');
  });
  it('9.0 deprecations: motion-theme renames warn once; codemod-9; docs + bin', () => {
    expect(MOTION_THEMES).toBe(THEMES);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const box = document.createElement('div');
    document.body.append(box);
    applyMotionTheme('retro', box)();
    expect(warn).not.toHaveBeenCalled();
    applyTheme('retro', box)();
    applyTheme('neon', box)();
    expect(warn.mock.calls.filter((c: any) => String(c[0]).includes('applyMotionTheme')).length).toBe(1);
    defineMotionTheme();
    expect(customElements.get('usa-motion-theme')).toBeTruthy();
    const r = codemod9('import { applyTheme, THEMES, THEME_NAMES, SURFACE_THEMES, applySurfaceTheme } from "motionary/components/effects";\n<usa-theme name="neon"><usa-theme-switcher></usa-theme-switcher></usa-theme>\nx.applyTheme;');
    expect(r.code).toContain('import { applyMotionTheme, MOTION_THEMES, MOTION_THEME_NAMES, SURFACE_THEMES, applySurfaceTheme }');
    expect(r.code).toContain('<usa-motion-theme name="neon"><usa-theme-switcher></usa-theme-switcher></usa-motion-theme>');
    expect(r.code).toContain('x.applyTheme;');
    expect(codemod9(r.code).changes).toEqual([]);
    expect(codemod9("document.createElement('usa-theme')").manual.length).toBe(1);
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.bin['usa-codemod-9']).toBe('./bin/usa-codemod-9.mjs');
    expect(readFileSync('docs/upgrading-9.md', 'utf8')).toContain('usa-codemod-9');
    expect(readFileSync('docs/deprecations.md', 'utf8')).toContain('Deprecated in 8.9, removed in 9.0');
  });
});
