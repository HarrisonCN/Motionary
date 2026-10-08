import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, PROGRESS_VARIANTS, SKELETON_VARIANTS } from '../src/components/widgets';
import { LIGHT_FX, registerLightEffects, registerFx2, FX2_PACKS, trackPointer } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });

describe('6.4 widgets', () => {
  it('ships progress ring, odometer, skeleton reveal and star rating', () => {
    expect(Object.keys(WIDGETS['6.4'])).toEqual(['usa-progress-ring', 'usa-odometer', 'usa-skeleton-reveal', 'usa-star-rating']);
    for (const t of Object.keys(WIDGETS['6.4'])) expect(customElements.get(t)).toBeTruthy();
    expect(PROGRESS_VARIANTS).toEqual(['ring', 'bar', 'semi']);
    expect(SKELETON_VARIANTS).toEqual(['wave', 'pulse', 'glow']);
  });
});

describe('<usa-progress-ring>', () => {
  it('is a progressbar; the arc follows value (reduced motion = instant)', () => {
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-progress-ring value="25"></usa-progress-ring>');
    expect(r.getAttribute('role')).toBe('progressbar');
    expect(r.getAttribute('aria-valuenow')).toBe('25');
    const arc = r.querySelector('.usa-pr-arc') as SVGPathElement;
    const len = Math.PI * 2 * 42;
    expect(parseFloat(arc.style.strokeDashoffset)).toBeCloseTo(len * 0.75, 1);
    expect(r.querySelector('.usa-pr-label').textContent).toBe('25%');
    const done = vi.fn();
    r.addEventListener('usa:complete', done);
    r.value = 100;
    expect(parseFloat(arc.style.strokeDashoffset)).toBeCloseTo(0, 1);
    expect(done).toHaveBeenCalled();
  });
  it('animates with requestAnimationFrame; bar + semi variants; indeterminate without value', () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => frames.push(f));
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    const r = mount<any>('<usa-progress-ring variant="bar" value="50" duration="100"></usa-progress-ring>');
    expect(frames.length).toBeGreaterThan(0);
    frames.splice(0).forEach((f) => f(performance.now() + 1000));
    expect(r.querySelector('.usa-pr-fill').style.transform).toBe('scaleX(0.5)');
    const s = mount<any>('<usa-progress-ring variant="semi" value="10"></usa-progress-ring>');
    expect(s.querySelector('svg').getAttribute('viewBox')).toBe('0 0 100 56');
    const i = mount<any>('<usa-progress-ring></usa-progress-ring>');
    expect(i.hasAttribute('data-indeterminate')).toBe(true);
    expect(i.hasAttribute('aria-valuenow')).toBe(false);
  });
});

describe('<usa-odometer>', () => {
  it('renders one wheel per digit with the formatted value as its name', () => {
    const o = mount<any>('<usa-odometer value="1284" locale="en-US" prefix="$"></usa-odometer>');
    expect(o.getAttribute('aria-label')).toBe('$1,284');
    expect(o.querySelectorAll('.usa-odo-col')).toHaveLength(4);
    expect(o.querySelectorAll('.usa-odo-sym')).toHaveLength(2);
    expect((o.querySelector('.usa-odo-col .usa-odo-strip') as HTMLElement).style.transform).toBe('translateY(-5%)');
  });
  it('rolls changed digits forward and slides new columns in', () => {
    const o = mount<any>('<usa-odometer value="98" locale="en-US"></usa-odometer>');
    anims.length = 0;
    o.value = 105;
    expect(o.text).toBe('105');
    expect(o.querySelectorAll('.usa-odo-col')).toHaveLength(3);
    const rolls = anims.filter((a) => a.el.classList.contains('usa-odo-strip'));
    expect(rolls.length).toBe(2);
    // 9 -> 0 and 8 -> 5 roll forward through the repeated strip (end below -50%)
    for (const a of rolls) expect(parseFloat(String((a.keyframes[1] as any).transform).replace('translateY(', ''))).toBeLessThan(-20);
    expect(anims.some((a) => a.el.classList.contains('usa-odo-col'))).toBe(true);
  });
  it('reduced motion: digits switch without animation', () => {
    installComponentMocks({ reducedMotion: true });
    const o = mount<any>('<usa-odometer value="1"></usa-odometer>');
    anims.length = 0;
    o.value = 7;
    expect(anims).toHaveLength(0);
    expect(o.getAttribute('aria-label')).toBe('7');
  });
});

describe('<usa-skeleton-reveal>', () => {
  it('covers the content while loading (aria-busy) and reveals it', async () => {
    const s = mount<any>('<usa-skeleton-reveal loading><span data-skeleton="circle" style="display:block;width:40px;height:40px"></span><p>Hello</p></usa-skeleton-reveal>');
    expect(s.getAttribute('aria-busy')).toBe('true');
    expect(s.hasAttribute('data-loading')).toBe(true);
    expect(s.querySelector('.usa-sk-layer')).toBeTruthy();
    expect(s.dataset.variant).toBe('wave');
    const done = vi.fn();
    s.addEventListener('usa:reveal', done);
    const p = s.reveal();
    expect(s.hasAttribute('aria-busy')).toBe(false);
    expect(s.hasAttribute('data-loading')).toBe(false);
    anims.forEach((a) => a.finish());
    await p;
    expect(s.querySelector('.usa-sk-layer')).toBeNull();
    expect(done).toHaveBeenCalled();
    s.loading = true;
    expect(s.querySelector('.usa-sk-layer')).toBeTruthy();
  });
});

describe('<usa-star-rating>', () => {
  it('is a slider; keyboard and click set the value and emit usa:change', () => {
    const r = mount<any>('<usa-star-rating value="2" step="0.5"></usa-star-rating>');
    expect(r.getAttribute('role')).toBe('slider');
    expect(r.querySelectorAll('.usa-star')).toHaveLength(5);
    expect(r.querySelectorAll('.usa-star')[1].style.getPropertyValue('--usa-star-fill')).toBe('100%');
    const seen: number[] = [];
    r.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail.value));
    anims.length = 0;
    r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(r.value).toBe(2.5);
    expect(r.getAttribute('aria-valuenow')).toBe('2.5');
    expect(r.querySelectorAll('.usa-star')[2].style.getPropertyValue('--usa-star-fill')).toBe('50%');
    expect(anims.length).toBeGreaterThan(8); // pop + ripple + sparks
    r.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(seen).toEqual([2.5, 5]);
  });
  it('readonly is an image with a spoken value; reduced motion = no pop', () => {
    const r = mount<any>('<usa-star-rating value="4" readonly label="Score"></usa-star-rating>');
    expect(r.getAttribute('role')).toBe('img');
    expect(r.getAttribute('aria-label')).toBe('Score: 4 of 5');
    installComponentMocks({ reducedMotion: true });
    const k = mount<any>('<usa-star-rating icon="heart"></usa-star-rating>');
    anims.length = 0;
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(k.value).toBe(1);
    expect(anims).toHaveLength(0);
  });
});

describe('6.4 light & materials', () => {
  it('registers 6 effects in motionary/components/fx-light', () => {
    registerLightEffects();
    registerFx2();
    expect(LIGHT_FX.map((d) => d.name)).toEqual(['light-follow', 'refraction', 'brushed-metal', 'pearlescent', 'god-rays', 'pointer-shadow']);
    for (const d of LIGHT_FX) expect(getEffect(d.name)).toBe(d);
    expect(FX2_PACKS.light).toBe(LIGHT_FX);
    expect(COMPONENT_ENTRIES['fx-light']).toBe('fx2/light');
  });
  it('trackPointer reports 0–1 coordinates and stops under reduced motion', () => {
    const el = mount<HTMLElement>('<div></div>');
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} }) as DOMRect;
    vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => (f(0), 1));
    const seen: number[][] = [];
    const stop = trackPointer(el, ctx(), (x, y, i) => seen.push([x, y, +i]));
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 50, clientY: 75 }) as any);
    expect(seen[seen.length - 1]).toEqual([0.25, 0.75, 1]);
    stop();
    const s2: number[][] = [];
    trackPointer(el, ctx(true), (x, y) => s2.push([x, y]));
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }) as any);
    expect(s2).toHaveLength(1);
  });
  it('surface effects add overlays / lens / shadow and clean up', () => {
    registerLightEffects();
    const el = mount<HTMLElement>('<div style="width:100px;height:80px"></div>');
    for (const n of ['light-follow', 'brushed-metal', 'pearlescent']) {
      const d = getEffect(n)!;
      const stop = d.run(el, { ...d.defaults }, ctx()) as () => void;
      expect(el.querySelectorAll('span[aria-hidden]').length, n).toBe(2);
      stop();
      expect(el.querySelectorAll('span[aria-hidden]').length, n).toBe(0);
    }
    const lens = getEffect('refraction')!;
    const st = lens.run(el, { ...lens.defaults }, ctx()) as () => void;
    expect((el.lastElementChild as HTMLElement).style.borderRadius).toBe('50%');
    st();
    const sh = getEffect('pointer-shadow')!;
    const st2 = sh.run(el, { ...sh.defaults }, ctx()) as () => void;
    expect(el.style.filter).toContain('drop-shadow');
    st2();
    expect(el.style.filter).toBe('');
  });
  it('god-rays draws on a canvas behind the content', async () => {
    registerLightEffects();
    const calls: string[] = [];
    (HTMLCanvasElement.prototype as any).getContext = () => new Proxy({}, { get: (_t, p: string) => (p === 'createLinearGradient' || p === 'createRadialGradient' ? () => ({ addColorStop() {} }) : (...a: unknown[]) => void calls.push(p)), set: () => true });
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    const el = mount<HTMLElement>('<div></div>');
    await playEffect(el, 'god-rays');
    expect(el.querySelector('canvas[data-usa-fx-canvas]')).toBeTruthy();
    expect(calls).toContain('fill');
  });
});

describe('6.4 showcase + Store + docs', () => {
  it('gallery cards and Store entries for every 6.4 widget and pack', () => {
    for (const tag of Object.keys(WIDGETS['6.4'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.4');
      expect(componentSnippets(card).vue).toContain('defineWidgets'.slice(0, 0) + card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-light')).esm).toContain("from 'motionary/components/fx-light'");
    for (const id of ['progress-ring', 'odometer', 'skeleton-reveal', 'star-rating', 'fx-light', 'fx-materials', 'fx-god-rays']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-progress-ring', '<usa-odometer', '<usa-skeleton-reveal', '<usa-star-rating', 'fx-light', 'god-rays']) expect(doc).toContain(s);
  });
});
