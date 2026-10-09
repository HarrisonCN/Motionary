import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, RETRO_VARIANTS } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, RETRO_FX, registerRetroPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { RETRO_FX as RETRO, pixelSteps } from '../src/components/fx2';

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

describe('8.2 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.2'])).toEqual(["usa-terminal", "usa-retro-button"]);
    for (const t of Object.keys(WIDGETS['8.2'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerRetroPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of RETRO_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['retro']).toBe(RETRO_FX);
    expect(COMPONENT_ENTRIES['fx-retro']).toBe('fx2/retro2');
    expect(pkg.exports['./fx/retro'].import.default).toBe('./dist/components/fx-retro.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.2'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.2');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-crt')).esm).toContain("from 'motionary/components/fx-retro'");
    for (const id of ["terminal", "retro-button", "fx-crt", "fx-vhs"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-terminal", "<usa-retro-button", "motionary/fx/retro"]) expect(doc).toContain(s);
  });
});


describe('8.2 widgets behave', () => {
  it('terminal: lines parsed, log region, skip shows all, replay types, done event', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const t = mount<any>('<usa-terminal title="zsh" prompt="&gt;" theme="amber"><p data-cmd>npm i x</p><p>ok &lt;1&gt;</p></usa-terminal>');
    expect(t.getAttribute('data-theme')).toBe('amber');
    expect(t.querySelector('[role=log]').getAttribute('aria-label')).toBe('zsh');
    expect(t.querySelector('.usa-term-bar span').textContent).toBe('zsh');
    const done = vi.fn();
    t.addEventListener('usa:done', done);
    t.replay(); // reduced → skip
    expect(t.querySelector('.usa-term-cmd .usa-term-tx').textContent).toBe('npm i x');
    expect(t.querySelector('.usa-term-ps').textContent).toBe('> ');
    expect(t.querySelector('.usa-term-out').textContent).toBe('ok <1>');
    expect(done).toHaveBeenCalledTimes(1);
    configureComponents({ reducedMotion: 'user' });
    vi.useFakeTimers();
    try {
      t.replay();
      vi.advanceTimersByTime(5000);
      expect(t.querySelector('.usa-term-tx').textContent).toBe('npm i x');
      expect(t.querySelectorAll('.usa-term-cursor').length).toBe(1);
      expect(done).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
  it('retro button: wraps content in a real button, variants, attributes', () => {
    expect(RETRO_VARIANTS).toEqual(['pixel', 'crt', 'y2k', 'win95']);
    const b = mount<any>('<usa-retro-button variant="y2k" name="go" value="1">Go <b>now</b></usa-retro-button>');
    const btn = b.querySelector('button');
    expect(btn.innerHTML).toBe('Go <b>now</b>');
    expect(btn.type).toBe('button');
    expect(btn.name).toBe('go');
    expect(b.getAttribute('data-variant')).toBe('y2k');
    b.variant = 'zzz';
    expect(b.getAttribute('data-variant')).toBe('pixel');
    expect(b.querySelectorAll('button').length).toBe(1);
    b.setAttribute('disabled', '');
    expect(b.button.disabled).toBe(true);
    anims.length = 0;
    configureComponents({ reducedMotion: 'user' });
    b.removeAttribute('disabled');
    b.button.dispatchEvent(new Event('pointerdown'));
    expect(anims.length).toBe(1);
  });
  it('retro pack: names, kinds, pixel steps, glitch frames, shine cleanup', async () => {
    expect(RETRO.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['pixelate-in:enter', 'crt-power:enter', 'vhs-glitch:attention', 'y2k-shine:attention']);
    const s = pixelSteps(4);
    expect(s.length).toBe(5);
    expect(s[0].filter).toContain('blur(6.0px)');
    expect(s[4]).toMatchObject({ filter: 'none', opacity: 1, offset: 1 });
    const el = document.createElement('div');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await RETRO[2].run(el, { intensity: 5, duration: 100 }, ctx);
    expect(ctx.animate.mock.calls[0][1].length).toBe(9);
    await RETRO[3].run(el, { color: 'white', duration: 100 }, ctx);
    expect(el.querySelectorAll('span').length).toBe(0);
    expect(el.style.overflow).toBe('');
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await RETRO[2].run(el, { intensity: 5, duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
