import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, SAFE_FX, registerSafePack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { SAFE_FX as SA, vestibularSafe, flashCount, isFlashSafe, applyMotionPreferences, loadMotionPreferences, MOTION_PREFS_KEY } from '../src/components/fx2';
import { getClock, setClock, getMotionSensitivity } from '../src/components/base';

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

describe('9.5 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.5'])).toEqual(["usa-motion-prefs", "usa-pause-all"]);
    for (const t of Object.keys(WIDGETS['9.5'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerSafePack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of SAFE_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['safe']).toBe(SAFE_FX);
    expect(COMPONENT_ENTRIES['fx-safe']).toBe('fx2/safemotion');
    expect(pkg.exports['./fx/safe'].import.default).toBe('./dist/components/fx-safe.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.5'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.5');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-safe')).esm).toContain("from 'motionary/components/fx-safe'");
    for (const id of ["motion-prefs", "pause-all", "fx-safe"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-motion-prefs", "<usa-pause-all", "motionary/fx/safe"]) expect(doc).toContain(s);
  });
});


describe('9.5 accessible motion', () => {
  afterEach(() => {
    setClock({ rate: 1, paused: false });
    configureComponents({ motionSensitivity: 'full' });
    localStorage.removeItem(MOTION_PREFS_KEY);
  });
  it('vestibularSafe, flash checks', () => {
    expect(vestibularSafe([{ opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px) saturate(2)', color: 'red' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }])).toEqual([{ opacity: 0, filter: 'saturate(2)', color: 'red' }, { opacity: 1 }]);
    const strobe = [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }];
    expect(flashCount(strobe)).toBe(3);
    expect(isFlashSafe(strobe, 200)).toBe(false);
    expect(isFlashSafe(strobe, 2000)).toBe(true);
    expect(isFlashSafe([{ opacity: 0 }, { opacity: 1 }], 50)).toBe(true);
  });
  it('applyMotionPreferences / loadMotionPreferences', () => {
    const p = applyMotionPreferences({ sensitivity: 'minimal', speed: 9, noParallax: true });
    expect(p).toEqual({ sensitivity: 'minimal', speed: 2, pauseAutoplay: false, noParallax: true });
    expect(getMotionSensitivity()).toBe('minimal');
    expect(getClock().rate).toBe(2);
    expect(document.documentElement.hasAttribute('data-usa-no-parallax')).toBe(true);
    expect(loadMotionPreferences().sensitivity).toBe('minimal');
    applyMotionPreferences({});
    expect(document.documentElement.hasAttribute('data-usa-no-parallax')).toBe(false);
  });
  it('<usa-motion-prefs>: form, level + speed change applies, reset', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const m = mount<any>('<usa-motion-prefs></usa-motion-prefs>');
    expect(m.querySelector('form').getAttribute('aria-label')).toBe('Motion preferences');
    expect(m.querySelectorAll('input[type=radio]').length).toBe(4);
    const ev = vi.fn();
    m.addEventListener('usa:change', ev);
    const gentle = m.querySelector('input[value=gentle]');
    gentle.checked = true;
    gentle.dispatchEvent(new Event('change', { bubbles: true }));
    expect(getMotionSensitivity()).toBe('gentle');
    const sp = m.querySelector('[data-k=speed]');
    sp.value = '0.5';
    sp.dispatchEvent(new Event('input', { bubbles: true }));
    expect(getClock().rate).toBe(0.5);
    expect(m.querySelector('output').textContent).toBe('0.5×');
    expect(m.prefs.sensitivity).toBe('gentle');
    m.querySelector('.usa-mp-reset').click();
    expect(m.prefs).toEqual({ sensitivity: 'full', speed: 1, pauseAutoplay: false, noParallax: false });
    expect(m.querySelector('input[value=full]').checked).toBe(true);
    expect(ev).toHaveBeenCalledTimes(3);
  });
  it('<usa-pause-all>: global clock pause/resume, aria-pressed; scoped leaves the clock alone', () => {
    const p = mount<any>('<usa-pause-all></usa-pause-all>');
    const b = p.querySelector('button');
    expect(b.getAttribute('aria-pressed')).toBe('false');
    const ev = vi.fn();
    p.addEventListener('usa:pause-all', ev);
    b.click();
    expect(getClock().paused).toBe(true);
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.textContent).toBe('Play animations');
    b.click();
    expect(getClock().paused).toBe(false);
    expect(ev.mock.calls.map((c: any) => c[0].detail.paused)).toEqual([true, false]);
    const box = document.createElement('div');
    box.className = 'zone';
    box.innerHTML = '<usa-pause-all scope=".zone"></usa-pause-all>';
    document.body.append(box);
    const s: any = box.firstElementChild;
    s.querySelector('button').click();
    expect(s.paused).toBe(true);
    expect(getClock().paused).toBe(false);
    expect(box.hasAttribute('data-usa-paused')).toBe(true);
    s.toggle();
    expect(box.hasAttribute('data-usa-paused')).toBe(false);
  });
  it('safe pack: names, kinds, run under reduced motion, never move', async () => {
    expect(SA.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['safe-fade:enter', 'focus-glow:attention', 'color-pulse:attention', 'underline-sweep:hover']);
    const el = document.createElement('a');
    document.body.append(el);
    const ctx: any = { reduced: true, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    for (const fx of SA.slice(0, 3)) await fx.run(el, { ...fx.defaults }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(3);
    for (const c of ctx.animate.mock.calls) for (const f of c[1]) expect(Object.keys(f).some((k) => /transform|translate|scale|rotate/.test(k))).toBe(false);
    await SA[3].run(el, { color: 'red', duration: 100 }, ctx);
    expect(el.style.backgroundSize).toBe('100% 2px');
  });
});
