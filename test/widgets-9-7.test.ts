import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { figmaToMotion, framerComponent, motionToCss, easingPoints } from '../src/components/design';

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

describe('9.7 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.7'])).toEqual(["usa-motion-spec"]);
    for (const t of Object.keys(WIDGETS['9.7'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.7'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.7');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    for (const id of ["motion-spec"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-motion-spec"]) expect(doc).toContain(s);
  });
});


describe('9.7 design tool integration', () => {
  it('figmaToMotion maps reactions to DSL', () => {
    const s = figmaToMotion([
      { trigger: { type: 'ON_CLICK' }, action: { type: 'NODE', transition: { type: 'DISSOLVE', duration: 0.3, easing: { type: 'EASE_OUT' } } } },
      { trigger: { type: 'ON_HOVER' }, actions: [{ transition: { type: 'SMART_ANIMATE', duration: 0.2, easing: { type: 'CUSTOM_CUBIC_BEZIER', easingFunctionCubicBezier: { x1: 0.1, y1: 0.2, x2: 0.3, y2: 1 } } } }] },
      { trigger: { type: 'AFTER_TIMEOUT', timeout: 1.5 }, action: { transition: { type: 'MOVE_IN', direction: 'LEFT', duration: 0.5 } } },
      { trigger: { type: 'ON_KEY_DOWN' }, action: { transition: { type: 'DISSOLVE' } } },
      { trigger: { type: 'ON_CLICK' }, action: { type: 'URL' } },
    ]);
    expect(s).toBe('click: fade 300ms ease-out; hover: scale 200ms cubic-bezier(0.1, 0.2, 0.3, 1); load: fade-left 500ms delay 1500ms');
  });
  it('framerComponent, motionToCss, easingPoints', () => {
    const tsx = framerComponent({ tag: 'usa-star-rating', attrs: { value: '4', readonly: '', label: 'Rate' }, children: [] });
    expect(tsx).toContain('export default function StarRating(props)');
    expect(tsx).toContain('<usa-star-rating value={props.value} readonly={props.readonly} label={props.label}></usa-star-rating>');
    expect(tsx).toContain('value: { type: ControlType.Number, defaultValue: 4 }');
    expect(tsx).toContain('readonly: { type: ControlType.Boolean, defaultValue: true }');
    const css = motionToCss('enter: fade-up 500ms stagger 100ms; click: pop', '.cards');
    expect(css).toContain('@keyframes usa-fade-up');
    expect(css).toContain('.cards > * { animation: usa-fade-up 500ms');
    expect(css).toContain('.cards > :nth-child(3) { animation-delay: 200ms; }');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).not.toContain('pop');
    expect(easingPoints('ease-out')).toEqual([0, 0, 0.58, 1]);
    expect(easingPoints('cubic-bezier(.2, .8, .2, 1)')).toEqual([0.2, 0.8, 0.2, 1]);
    expect(easingPoints('weird')).toEqual([0.25, 0.1, 0.25, 1]);
  });
  it('<usa-motion-spec>: table rows, timing, copy CSS, play', async () => {
    configureComponents({ reducedMotion: 'user' });
    const m = mount<any>('<usa-motion-spec label="Spec" rules="enter: fade-up 600ms ease-out; hover: pop 300ms delay 100ms"></usa-motion-spec>');
    expect(m.querySelector('table').getAttribute('aria-label')).toBe('Spec');
    expect(m.querySelectorAll('tbody tr').length).toBe(2);
    expect(m.querySelectorAll('.usa-ms-curve').length).toBe(2);
    expect(m.querySelectorAll('tbody small')[2].textContent).toBe('100ms + 300ms');
    expect(m.css).toContain('@keyframes usa-fade-up');
    m.play();
    expect(anims.length).toBeGreaterThan(0);
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const ev = vi.fn();
    m.addEventListener('usa:copy', ev);
    m.querySelector('.usa-ms-copy').click();
    await tick();
    expect(writeText.mock.calls[0][0]).toBe(m.css);
    expect(ev.mock.calls[0][0].detail.ok).toBe(true);
  });
  it('figma plugin scaffold ships', () => {
    const man = JSON.parse(readFileSync('figma-plugin/manifest.json', 'utf8'));
    expect(man.main).toBe('code.js');
    expect(readFileSync('figma-plugin/code.js', 'utf8')).toContain('figma.showUI');
    expect(JSON.parse(readFileSync('package.json', 'utf8')).files).toContain('figma-plugin');
  });
});
