import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { DEPTH3_FX, register3dPack, registerAllPlugins, EFFECT_PACKS } from '../src/components/fx2';
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });

describe('6.5 widgets', () => {
  it('ships milestones, masonry flow, compare and cube gallery', () => {
    expect(Object.keys(WIDGETS['6.5'])).toEqual(['usa-milestones', 'usa-masonry-flow', 'usa-compare', 'usa-cube-gallery']);
    for (const t of Object.keys(WIDGETS['6.5'])) expect(customElements.get(t)).toBeTruthy();
  });
});

describe('<usa-milestones>', () => {
  it('builds a list with a rail, dots and dates; reaching a milestone animates it', () => {
    const m = mount<any>('<usa-milestones><div data-date="2024"><h4>Idea</h4></div><div data-date="2025"><h4>Launch</h4></div></usa-milestones>');
    expect(m.getAttribute('role')).toBe('list');
    expect(m.querySelector('.usa-ms-rail .usa-ms-fill')).toBeTruthy();
    const items = m.querySelectorAll('.usa-ms-item');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute('role')).toBe('listitem');
    expect(items[0].dataset.side).toBe('right');
    expect(items[1].dataset.side).toBe('left');
    expect(items[1].querySelector('.usa-ms-date').textContent).toBe('2025');
    // jsdom: every rect is at 0 → above the 60 % line → all reached
    expect(m.reached).toBe(1);
    expect(items[0].hasAttribute('data-reached')).toBe(true);
    expect(anims.some((a) => a.el.classList.contains('usa-ms-dot'))).toBe(true);
  });
  it('layout="left" keeps one side; reduced motion shows everything without animation', () => {
    installComponentMocks({ reducedMotion: true });
    anims.length = 0;
    const m = mount<any>('<usa-milestones layout="left"><p>a</p><p>b</p></usa-milestones>');
    expect([...m.querySelectorAll('.usa-ms-item')].map((i: any) => i.dataset.side)).toEqual(['right', 'right']);
    expect(m.querySelector('.usa-ms-fill').style.transform).toBe('scaleY(1)');
    expect(anims).toHaveLength(0);
  });
});

describe('<usa-masonry-flow>', () => {
  it('positions items in columns and FLIP-animates moves on shuffle / filter', () => {
    const m = mount<any>('<usa-masonry-flow min="100" gap="10"><div class="a">1</div><div class="b">2</div><div class="a">3</div></usa-masonry-flow>');
    Object.defineProperty(m, 'clientWidth', { value: 320, configurable: true });
    m.querySelectorAll('div').forEach((d: any, i: number) => Object.defineProperty(d, 'offsetHeight', { value: 50 + i * 20, configurable: true }));
    m.layout(false);
    expect(m.columns).toBe(3);
    const first = m.querySelector('div') as HTMLElement;
    expect(first.style.transform).toBe('translate(0.0px,0.0px)');
    expect(first.style.width).toBe('100px');
    anims.length = 0;
    m.sort((a: HTMLElement, b: HTMLElement) => Number(b.textContent) - Number(a.textContent));
    expect(anims.length).toBeGreaterThan(0);
    m.filter('.a');
    expect(m.querySelector('.b').hasAttribute('data-hidden')).toBe(true);
    m.filter(null);
    expect(m.querySelector('.b').hasAttribute('data-hidden')).toBe(false);
  });
});

describe('<usa-compare>', () => {
  it('is a slider that clips the after layer; keyboard moves it', () => {
    const c = mount<any>('<usa-compare position="30" labels="Before,After"><img alt="b"><img alt="a"></usa-compare>');
    expect(c.getAttribute('role')).toBe('slider');
    expect(c.getAttribute('aria-valuenow')).toBe('30');
    const after = c.querySelector('.usa-cmp-after') as HTMLElement;
    expect(after.style.clipPath).toBe('inset(0 0 0 30%)');
    expect(c.querySelectorAll('.usa-cmp-label')).toHaveLength(2);
    const seen: number[] = [];
    c.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail.position));
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(seen).toEqual([32, 100]);
    expect(c.position).toBe(100);
    c.position = 10;
    expect(after.style.clipPath).toBe('inset(0 0 0 10%)');
  });
  it('vertical orientation clips from the top', () => {
    const c = mount<any>('<usa-compare orientation="vertical"><div>b</div><div>a</div></usa-compare>');
    expect(c.getAttribute('aria-orientation')).toBe('vertical');
    expect((c.querySelector('.usa-cmp-after') as HTMLElement).style.clipPath).toBe('inset(50% 0 0 0)');
  });
});

describe('<usa-cube-gallery>', () => {
  it('turns the cube to the next face and emits usa:change', async () => {
    const g = mount<any>('<usa-cube-gallery><div>A</div><div>B</div><div>C</div></usa-cube-gallery>');
    expect(g.getAttribute('aria-roledescription')).toBe('carousel');
    const faces = g.querySelectorAll('.usa-cube-face');
    expect(faces).toHaveLength(3);
    expect(faces[0].hasAttribute('data-active')).toBe(true);
    const seen: number[] = [];
    g.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail.index));
    anims.length = 0;
    g.next();
    expect(anims.some((a) => a.el.classList.contains('usa-cube-stage'))).toBe(true);
    anims.forEach((a) => a.finish());
    await Promise.resolve();
    await Promise.resolve();
    expect(g.index).toBe(1);
    expect(faces[1].hasAttribute('data-active')).toBe(true);
    expect(faces[0].inert).toBe(true);
    g.prev();
    anims.forEach((a) => a.finish());
    await Promise.resolve();
    await Promise.resolve();
    g.prev();
    expect(seen).toEqual([1, 0, 2]);
  });
  it('reduced motion: fade instead of turning', () => {
    installComponentMocks({ reducedMotion: true });
    const g = mount<any>('<usa-cube-gallery><div>A</div><div>B</div></usa-cube-gallery>');
    anims.length = 0;
    g.querySelector('.usa-cube-next').click();
    expect(g.index).toBe(1);
    expect(anims.every((a) => !JSON.stringify(a.keyframes).includes('rotate'))).toBe(true);
  });
});

describe('6.5 3D effects', () => {
  it('registers 5 effects in motionary/components/fx-3d', () => {
    register3dPack();
    registerAllPlugins();
    expect(DEPTH3_FX.map((d) => d.name)).toEqual(['depth-stack', 'product-spin', 'card-flip-3d', 'origami', 'orbit-camera']);
    for (const d of DEPTH3_FX) expect(getEffect(d.name)).toBe(d);
    expect(EFFECT_PACKS.depth).toBe(DEPTH3_FX);
    expect(COMPONENT_ENTRIES['fx-3d']).toBe('fx2/depth3');
  });
  it('depth-stack lifts the layers; product-spin and orbit-camera set a 3D transform and clean up', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    const el = mount<HTMLElement>('<div><span>a</span><span data-depth="3">b</span></div>');
    const d = getEffect('depth-stack')!;
    const stop = d.run(el, { ...d.defaults }, ctx()) as () => void;
    expect(el.style.transformStyle).toBe('preserve-3d');
    expect((el.querySelector('[data-depth]') as HTMLElement).style.transform).toContain('translateZ(42');
    stop();
    expect(el.style.transformStyle).toBe('');
    const sp = getEffect('product-spin')!;
    const s2 = sp.run(el, { ...sp.defaults }, ctx()) as () => void;
    expect(el.style.transform).toContain('rotateY(0.00deg)');
    s2();
    const oc = getEffect('orbit-camera')!;
    const s3 = oc.run(el, { ...oc.defaults }, ctx()) as () => void;
    expect(el.style.transform).toContain('rotateY');
    expect(el.style.getPropertyValue('--usa-orbit')).not.toBe('');
    s3();
    expect(el.style.transform).toBe('');
  });
  it('card-flip-3d flips to the back face and back, swapping aria-hidden', () => {
    register3dPack();
    const el = mount<HTMLElement>('<div><div>front</div><div>back</div></div>');
    anims.length = 0;
    playEffect(el, 'card-flip-3d');
    expect(el.dataset.usaFlip).toBe('back');
    expect(el.children[0].getAttribute('aria-hidden')).toBe('true');
    expect(el.children[1].getAttribute('aria-hidden')).toBe('false');
    expect(JSON.stringify(anims[0].keyframes)).toContain('rotateY(90deg)');
    playEffect(el, 'card-flip-3d');
    expect(el.dataset.usaFlip).toBe('front');
  });
  it('origami folds clipped copies in and restores the element; skipped under reduced motion', async () => {
    register3dPack();
    const el = mount<HTMLElement>('<div id="x"><p>Paper</p></div>');
    anims.length = 0;
    const p = playEffect(el, 'origami', { panels: 3 });
    expect(anims).toHaveLength(3);
    expect(el.style.visibility).toBe('hidden');
    expect(el.querySelectorAll('[id="x"]')).toHaveLength(0);
    anims.forEach((a) => a.finish());
    await p;
    expect(el.style.visibility).toBe('');
    expect(el.children).toHaveLength(1);
    installComponentMocks({ reducedMotion: true });
    anims.length = 0;
    await playEffect(el, 'origami');
    expect(anims).toHaveLength(0);
  });
});

describe('6.5 showcase + Store + docs', () => {
  it('gallery cards and Store entries for every 6.5 widget and pack', () => {
    for (const tag of Object.keys(WIDGETS['6.5'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.5');
      expect(componentSnippets(card).html).toContain('widgets.umd.js');
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-depth')).esm).toContain("from 'motionary/components/fx-3d'");
    for (const id of ['milestones', 'masonry-flow', 'compare', 'cube-gallery', 'fx-depth', 'fx-depth-flip', 'fx-origami']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-milestones', '<usa-masonry-flow', '<usa-compare', '<usa-cube-gallery', 'fx-3d', 'orbit-camera']) expect(doc).toContain(s);
  });
});
