import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, formatBytes, passwordStrength, sanitizeCode } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, FORM_FX, registerFormPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { FORM_FX as FORM, shakeFrames } from '../src/components/fx2';

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

describe('7.7 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.7'])).toEqual(["usa-field", "usa-otp", "usa-upload-progress"]);
    for (const t of Object.keys(WIDGETS['7.7'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerFormPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of FORM_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['form']).toBe(FORM_FX);
    expect(COMPONENT_ENTRIES['fx-form']).toBe('fx2/form');
    expect(pkg.exports['./fx/form'].import.default).toBe('./dist/components/fx-form.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.7'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.7');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-field')).esm).toContain("from 'motionary/components/fx-form'");
    for (const id of ["field", "otp", "upload-progress", "fx-field", "fx-form-in"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-field", "<usa-otp", "<usa-upload-progress", "motionary/fx/form"]) expect(doc).toContain(s);
  });
});


describe('7.7 widgets behave', () => {
  it('field: floating label, native validation, events, password strength', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(passwordStrength('').score).toBe(0);
    expect(passwordStrength('abc1').score).toBe(1);
    expect(passwordStrength('Motion!2026x').score).toBe(4);
    expect(passwordStrength('Motion!2026x').label).toBe('Strong');
    const f = mount<any>('<usa-field label="Email &lt;x&gt;" type="email" name="email" required error="Enter an email"></usa-field>');
    const input = f.querySelector('input');
    expect(f.querySelector('label').textContent).toBe('Email <x>');
    expect(f.querySelector('label').getAttribute('for')).toBe(input.id);
    expect(input.name).toBe('email');
    expect(input.required).toBe(true);
    const bad = vi.fn();
    const good = vi.fn();
    f.addEventListener('usa:invalid', bad);
    f.addEventListener('usa:valid', good);
    expect(f.validate()).toBe(false);
    expect(f.hasAttribute('data-invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(f.querySelector('.usa-fld-msg').textContent).toBe('Enter an email');
    expect(bad).toHaveBeenCalledTimes(1);
    f.value = 'a@b.co';
    expect(f.hasAttribute('data-filled')).toBe(true);
    expect(f.validate()).toBe(true);
    expect(f.hasAttribute('data-valid')).toBe(true);
    expect(good.mock.calls[0][0].detail).toEqual({ value: 'a@b.co' });
    const p = mount<any>('<usa-field label="Password" type="password" strength value="Motion!2026x"></usa-field>');
    expect(p.querySelector('.usa-fld-meter').getAttribute('data-score')).toBe('4');
    expect(p.querySelector('.usa-fld-msg').textContent).toBe('Strength: Strong');
  });
  it('otp: boxes, auto-advance, paste, complete, error clears, success', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(sanitizeCode('12-3 4a')).toBe('1234');
    expect(sanitizeCode('ab-3c', 'alnum')).toBe('AB3C');
    const o = mount<any>('<usa-otp length="4"></usa-otp>');
    const boxes = o.querySelectorAll('input');
    expect(boxes.length).toBe(4);
    expect(o.querySelector('[role=group]').getAttribute('aria-label')).toBe('Verification code');
    expect(boxes[0].getAttribute('autocomplete')).toBe('one-time-code');
    const done = vi.fn();
    o.addEventListener('usa:complete', done);
    boxes[0].value = '7';
    boxes[0].dispatchEvent(new Event('input'));
    expect(document.activeElement).toBe(boxes[1]);
    boxes[1].value = '981';
    boxes[1].dispatchEvent(new Event('input'));
    expect(o.value).toBe('7981');
    expect(done.mock.calls[0][0].detail).toEqual({ code: '7981' });
    o.error();
    expect(o.getAttribute('data-state')).toBe('error');
    expect(o.value).toBe('');
    o.fillCode('12x34');
    expect(o.value).toBe('1234');
    o.success();
    expect(o.getAttribute('data-state')).toBe('success');
    const init = mount<any>('<usa-otp length="6" value="48"></usa-otp>');
    expect(init.value).toBe('48');
  });
  it('upload progress: bytes, progressbar values, done and error events', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(48500000)).toBe('46 MB');
    const r = mount<any>('<usa-upload-progress name="a.pdf" size="2400000" value="40"></usa-upload-progress>');
    const bar = r.querySelector('[role=progressbar]');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(r.querySelector('.usa-up-size').textContent).toBe('2.3 MB');
    expect(r.querySelector('.usa-up-icon').textContent).toBe('PDF');
    expect(r.status).toBe('uploading');
    const done = vi.fn();
    const err = vi.fn();
    const retry = vi.fn();
    r.addEventListener('usa:done', done);
    r.addEventListener('usa:error', err);
    r.addEventListener('usa:retry', retry);
    r.value = 100;
    expect(r.getAttribute('data-state')).toBe('done');
    expect(bar.getAttribute('aria-valuetext')).toBe('Complete');
    expect(done).toHaveBeenCalledTimes(1);
    r.status = 'error';
    r.setAttribute('message', 'Lost');
    expect(err).toHaveBeenCalledTimes(1);
    expect(r.querySelector('.usa-up-msg').textContent).toBe('Lost');
    r.querySelector('.usa-up-retry').click();
    expect(retry).toHaveBeenCalledTimes(1);
  });
  it('form pack: names, kinds, shake frames, cascade staggers, reduced paths', async () => {
    expect(FORM.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['field-shake:attention', 'field-success:attention', 'label-float:enter', 'form-cascade:enter']);
    const f = shakeFrames(10, 4);
    expect(f.length).toBe(6);
    expect(f[1]).toEqual({ transform: 'translateX(-10px)' });
    expect(f[5]).toEqual({ transform: 'none' });
    const el = document.createElement('form');
    el.innerHTML = '<label>A</label><input><label>B</label>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await FORM[3].run(el, { stagger: 50, distance: 10, duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(3);
    expect(ctx.animate.mock.calls[2][2].delay).toBe(100);
    const lctx: any = { ...ctx, animate: vi.fn(() => null) };
    await FORM[2].run(el, { stagger: 80, duration: 100 }, lctx);
    expect(lctx.animate).toHaveBeenCalledTimes(2);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await FORM[1].run(el, { color: 'green', duration: 100 }, rctx);
    expect(rctx.animate).toHaveBeenCalledTimes(1);
    expect(el.querySelectorAll('span').length).toBe(0);
  });
});
