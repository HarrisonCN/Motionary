import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, monthGrid, parseISODate, hsvToHex, hexToHsv } from '../src/components/widgets';
import * as fx2 from '../src/components/fx2';
import { defineComponents } from '../src/components';
import { FOCUS_FX, registerFocusPack, registerEffectPacks, EFFECT_PACKS, packManifest, validateManifest, loadEffectPack, EFFECT_PACK_FORMAT } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
// @ts-ignore — plain ESM bin
import { transform } from '../bin/usa-codemod-7.mjs';
import { readFileSync } from 'node:fs';

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

describe('6.9 widgets', () => {
  it('ships date picker, color picker, file drop and keyframe editor', () => {
    expect(Object.keys(WIDGETS['6.9'])).toEqual(['usa-date-picker', 'usa-color-picker', 'usa-file-drop', 'usa-keyframe-editor']);
    for (const t of Object.keys(WIDGETS['6.9'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('date helpers', () => {
    expect(parseISODate('2026-02-30')).toBeNull();
    expect(parseISODate('2026-10-08')!.getDate()).toBe(8);
    const g = monthGrid(2026, 9, 1);
    expect(g).toHaveLength(42);
    expect(g[0].getDay()).toBe(1);
    expect(g.some((d) => d.getMonth() === 9 && d.getDate() === 1)).toBe(true);
  });
  it('date picker: grid, selection, keyboard, min / max, month change', () => {
    const p = mount<any>('<usa-date-picker value="2026-10-08" min="2026-10-03"></usa-date-picker>');
    expect(p.querySelector('[role=grid]')).toBeTruthy();
    expect(p.querySelector('[aria-selected="true"]').dataset.date).toBe('2026-10-08');
    expect(p.querySelector('[data-date="2026-10-02"]').getAttribute('aria-disabled')).toBe('true');
    let v = '';
    p.addEventListener('usa:change', (e: CustomEvent) => (v = e.detail.value));
    (p.querySelector('[data-date="2026-10-15"]') as HTMLElement).click();
    expect(v).toBe('2026-10-15');
    (p.querySelector('[data-date="2026-10-02"]') as HTMLElement).click();
    expect(v).toBe('2026-10-15');
    const cell = p.querySelector('[tabindex="0"]') as HTMLElement;
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    (p.querySelector('[tabindex="0"]') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(v).toBe('2026-10-22');
    p.showMonth(1);
    expect(p.month).toBe('2026-11');
  });
  it('color conversions and picker value / keyboard / swatches', () => {
    expect(hsvToHex(0, 1, 1)).toBe('#ff0000');
    expect(hsvToHex(120, 1, 0.5)).toBe('#008000');
    const [h, s, v] = hexToHsv('#7c5cff')!;
    expect(hsvToHex(h, s, v)).toBe('#7c5cff');
    expect(hexToHsv('nope')).toBeNull();
    const c = mount<any>('<usa-color-picker value="#ff0000" swatches="#00ff00,bad"></usa-color-picker>');
    expect(c.value).toBe('#ff0000');
    expect(c.querySelectorAll('.usa-cp-sw')).toHaveLength(1);
    let got = '';
    c.addEventListener('usa:change', (e: CustomEvent) => (got = e.detail.value));
    (c.querySelector('.usa-cp-sw') as HTMLElement).click();
    expect(got).toBe('#00ff00');
    const hue = c.querySelector('.usa-cp-hue') as HTMLElement;
    hue.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
    expect(Number(hue.getAttribute('aria-valuenow'))).toBe(156);
  });
  it('file drop: list, progress, check, events', () => {
    const d = mount<any>('<usa-file-drop multiple></usa-file-drop>');
    expect(d.querySelector('input[type=file]').multiple).toBe(true);
    let n = 0;
    d.addEventListener('usa:files', (e: CustomEvent) => (n = e.detail.files.length));
    d.addFiles([new File(['abc'], 'a.txt'), new File(['x'.repeat(5000)], 'b.png')]);
    expect(n).toBe(2);
    expect(d.files).toHaveLength(2);
    const items = d.querySelectorAll('.usa-fd-item');
    expect(items[1].querySelector('.usa-fd-size').textContent).toBe('4.9 KB');
    d.setProgress(0, 1);
    expect(items[0].hasAttribute('data-done')).toBe(true);
    expect(items[0].getAttribute('aria-label')).toBe('a.txt, 100%');
    d.clear();
    expect(d.files).toHaveLength(0);
  });
  it('keyframe editor: renders tracks, keyboard edits, JSON round-trip', () => {
    document.body.innerHTML = '<div id="s"><b>A</b><i>B</i></div>';
    const e = mount<any>('<usa-keyframe-editor for="s"></usa-keyframe-editor>');
    expect(e.querySelectorAll('.usa-ke-row')).toHaveLength(3);
    e.animation = { name: 'x', tracks: [{ target: 'b', start: 0, duration: 400, preset: 'fade-up' }] };
    expect(e.querySelectorAll('.usa-ke-clip')).toHaveLength(1);
    let out: any = null;
    e.addEventListener('usa:change', (ev: CustomEvent) => (out = ev.detail.animation));
    const clip = e.querySelector('.usa-ke-clip') as HTMLElement;
    clip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(out.tracks[0].start).toBe(50);
    (e.querySelector('.usa-ke-clip') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
    expect(out.tracks[0].duration).toBe(450);
    expect(out.format).toBe('use-scroll-animate/animation');
    expect(e.toJSON().duration).toBe(500);
    e.seek(250);
    expect(e.querySelector('.usa-ke-time').textContent).toBe('250 ms');
  });
});

describe('focus pack + marketplace', () => {
  it('registers the focus pack (also via registerEffectPacks)', () => {
    registerFocusPack();
    registerEffectPacks();
    expect(FOCUS_FX.map((d) => d.name)).toEqual(['focus-draw', 'marching-ants', 'success-check', 'highlight-sweep']);
    for (const d of FOCUS_FX) expect(getEffect(d.name)).toBe(d);
    expect(EFFECT_PACKS.focus).toBe(FOCUS_FX);
    expect(COMPONENT_ENTRIES['fx-focus']).toBe('fx2/focus');
    expect(COMPONENT_ENTRIES.marketplace).toBe('fx2/manifest');
  });
  it('focus effects add aria-hidden overlays and remove them', async () => {
    registerFocusPack();
    const el = mount<HTMLElement>('<button>Save</button>');
    anims.length = 0;
    playEffect(el, 'success-check');
    expect(el.querySelector('[data-usa-fx-layer] path')).toBeTruthy();
    expect(anims.length).toBe(3);
    anims.forEach((a: any) => a.finish?.());
    await new Promise((r) => setTimeout(r, 0));
    expect(el.querySelector('[data-usa-fx-layer]')).toBeNull();
    playEffect(el, 'focus-draw');
    expect(el.querySelector('rect')).toBeTruthy();
  });
  it('packManifest / validateManifest / loadEffectPack', async () => {
    const effects = [{ name: 'acme-glow', kind: 'hover', description: 'Glow', defaults: { a: 1 }, run: () => undefined }] as any;
    const m = packManifest('@acme/glow', '1.0.0', effects, { license: 'MIT' });
    expect(m.format).toBe(EFFECT_PACK_FORMAT);
    expect(validateManifest(m, effects)).toEqual({ ok: true, errors: [] });
    const bad = validateManifest({ ...m, packVersion: 'x', effects: [{ name: 'Bad', kind: 'nope' }] }, effects);
    expect(bad.ok).toBe(false);
    expect(bad.errors.join()).toMatch(/semver/);
    expect(bad.errors.join()).toMatch(/unknown kind/);
    expect(bad.errors.join()).toMatch(/missing from the manifest/);
    expect(await loadEffectPack({ effects, manifest: m })).toEqual(['acme-glow']);
    expect(getEffect('acme-glow')).toBe(effects[0]);
    await expect(loadEffectPack({ effects, manifest: m })).rejects.toThrow(/override/);
    await expect(loadEffectPack({ effects: [], manifest: m })).rejects.toThrow(/invalid effect pack/);
  });
});

describe('7.0 deprecations', () => {
  it('7.0 removed the deprecated registrars and tags', () => {
    const m = fx2 as Record<string, unknown>;
    for (const n of ['registerFx2', 'FX2_PACKS', 'registerGpuEffects', 'registerTextEffects3', 'registerLightEffects', 'register3dEffects', 'registerMorphEffects2', 'registerTransitionEffects2', 'registerWeatherEffects', 'registerPhysicsEffects2']) expect(m[n], n).toBeUndefined();
    defineComponents();
    expect(customElements.get('usa-tooltip')).toBeUndefined();
    expect(customElements.get('usa-toggle')).toBeUndefined();
    expect(customElements.get('usa-tip')).toBeTruthy();
    expect(customElements.get('usa-switch')).toBeTruthy();
  });
  it('usa-codemod-7 rewrites registrars and tags, reports manual work', () => {
    const src = "import { registerFx2, registerTextEffects3 } from 'motionary/components/fx2';\nregisterFx2(); registerTextEffects3();\nconst p = FX2_PACKS;\n<usa-tooltip text=\"Hi\"><b>x</b></usa-tooltip><usa-toggle checked></usa-toggle><usa-toggle-knob></usa-toggle-knob>\ndefineTooltip();";
    const { code, changes, manual } = transform(src);
    expect(code).toContain('import { registerEffectPacks, registerTextPack }');
    expect(code).toContain('registerEffectPacks(); registerTextPack();');
    expect(code).toContain('EFFECT_PACKS');
    expect(code).toContain('<usa-tip text="Hi"><b>x</b></usa-tip><usa-switch checked></usa-switch>');
    expect(code).toContain('<usa-toggle-knob>');
    expect(changes.length).toBeGreaterThanOrEqual(5);
    expect(manual.join()).toMatch(/defineTooltip/);
    expect(transform('nothing here').changes).toHaveLength(0);
  });
  it('documents the 7.0 removals', () => {
    const up = readFileSync('docs/upgrading-7.md', 'utf8');
    for (const s of ['registerFx2', 'registerEffectPacks', '<usa-tooltip', '<usa-toggle', 'usa-codemod-7']) expect(up).toContain(s);
    expect(JSON.parse(readFileSync('package.json', 'utf8')).bin['usa-codemod-7']).toBe('./bin/usa-codemod-7.mjs');
    expect(readFileSync('docs/deprecations.md', 'utf8')).toContain('Deprecated in 6.9, removed in 7.0');
  });
});

describe('6.9 showcase + Store + docs', () => {
  it('gallery cards and Store entries for every 6.9 widget and pack', () => {
    for (const tag of Object.keys(WIDGETS['6.9'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.9');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-focus')).esm).toContain("from 'motionary/components/fx-focus'");
    for (const id of ['date-picker', 'color-picker', 'file-drop', 'keyframe-editor', 'fx-focus', 'fx-success']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-date-picker', '<usa-color-picker', '<usa-file-drop', '<usa-keyframe-editor', 'fx-focus', 'loadEffectPack']) expect(doc).toContain(s);
  });
});
