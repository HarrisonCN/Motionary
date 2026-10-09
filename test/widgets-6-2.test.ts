import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, finishAll } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, WIDGET_TAGS, CAROUSEL_EFFECTS, TAB_INDICATORS } from '../src/components/widgets';
import { GPU_FX, registerGpuPack, registerAllPlugins, EFFECT_PACKS, supportsWebGL2, fieldFallback } from '../src/components/fx2';
import { getEffect, playEffect, registerEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { ITEMS, CATEGORIES } from '../showcase/catalog.js';
import { generate } from '../showcase/codegen.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { CATEGORIES as BUILD_CATS, COMPONENT_ENTRIES } from '../scripts/categories.mjs';
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

describe('6.2 widgets entry', () => {
  it('ships carousel, tab bar, accordion 2.0 and stories in motionary/components/widgets', () => {
    expect(Object.keys(WIDGETS['6.2'])).toEqual(['usa-carousel', 'usa-tab-bar', 'usa-disclosure', 'usa-stories']);
    for (const t of WIDGET_TAGS) expect(customElements.get(t)).toBeTruthy();
    expect(COMPONENT_ENTRIES.widgets).toBe('widgets/index');
    expect(COMPONENT_ENTRIES['fx-gpu']).toBe('fx2/gpu');
    expect(BUILD_CATS).not.toContain('widgets'); // own entry, not in components / lite
    const lite = readFileSync('src/components/lite.ts', 'utf8') + readFileSync('src/components/index.ts', 'utf8');
    expect(lite).not.toMatch(/widgets|fx2/);
  });
});

describe('<usa-carousel>', () => {
  const html = '<usa-carousel effect="slide"><div>A</div><div>B</div><div>C</div></usa-carousel>';
  it('wraps slides, labels them and adds controls + dots', () => {
    const c = mount<any>(html);
    expect(c.getAttribute('aria-roledescription')).toBe('carousel');
    expect(c.length).toBe(3);
    const slides = c.querySelectorAll('.usa-carousel-track > div');
    expect(slides).toHaveLength(3);
    expect(slides[1].getAttribute('aria-label')).toBe('2 of 3');
    expect(c.querySelectorAll('.usa-carousel-dot')).toHaveLength(3);
    expect(slides[1].inert).toBe(true);
  });
  it('next / prev / goTo move the track and emit usa:change; wraps around', () => {
    const c = mount<any>(html);
    const seen: number[] = [];
    c.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail.index));
    c.next();
    expect(c.querySelector('.usa-carousel-track').style.transform).toBe('translateX(-100%)');
    c.goTo(2);
    c.next();
    c.prev();
    expect(seen).toEqual([1, 2, 0, 2]);
    expect(c.querySelectorAll('.usa-carousel-dot')[2].getAttribute('aria-current')).toBe('true');
  });
  it('arrow keys navigate; the cards effect lays out a 3D stack', () => {
    const c = mount<any>(html.replace('slide', 'cards'));
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(c.index).toBe(1);
    const s = c.querySelectorAll('.usa-carousel-track > div');
    expect(s[0].style.transform).toContain('rotateY');
    expect(s[1].style.transform).toContain('translateX(0%)');
    expect(CAROUSEL_EFFECTS).toEqual(['slide', 'fade', 'scale', 'cards']);
  });
  it('re-mounting on an attribute change keeps the slides', () => {
    const c = mount<any>(html);
    c.setAttribute('effect', 'fade');
    expect(c.length).toBe(3);
    expect(c.querySelectorAll('.usa-carousel-viewport')).toHaveLength(1);
  });
  it('autoplay is off under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const spy = vi.spyOn(window, 'setInterval');
    const c = mount<any>(html.replace('effect="slide"', 'autoplay="2000"'));
    expect(c.hasAttribute('data-reduced')).toBe(true);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('<usa-tab-bar>', () => {
  const html = '<usa-tab-bar><button>A</button><button>B</button><button>C</button><div data-panel>1</div><div data-panel>2</div><div data-panel>3</div></usa-tab-bar>';
  it('builds an accessible tablist with panels', () => {
    const t = mount<any>(html);
    const tabs = t.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
    expect(t.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    const panels = t.querySelectorAll('[role="tabpanel"]');
    expect(panels[1].hidden).toBe(true);
    expect(tabs[1].getAttribute('aria-controls')).toBe(panels[1].id);
    expect(t.dataset.indicator).toBe('pill');
  });
  it('select() stretches the indicator and slides the panel in', () => {
    const t = mount<any>(html);
    anims.length = 0;
    const seen: any[] = [];
    t.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail));
    t.querySelectorAll('[role="tab"]')[2].click();
    expect(t.selected).toBe(2);
    expect(seen).toEqual([{ index: 2, from: 0 }]);
    expect(anims.some((a) => a.el.classList.contains('usa-tab-bar-ink') && a.keyframes.length === 3)).toBe(true);
    expect(anims.some((a) => (a.el as HTMLElement).getAttribute('role') === 'tabpanel')).toBe(true);
  });
  it('arrow keys move the selection; reduced motion skips the stretch', () => {
    installComponentMocks({ reducedMotion: true });
    const t = mount<any>(html);
    anims.length = 0;
    t.querySelector('[role="tablist"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(t.selected).toBe(2);
    expect(anims.filter((a) => a.playState === 'running')).toHaveLength(0);
    expect(TAB_INDICATORS).toContain('gooey');
  });
});

describe('<usa-disclosure>', () => {
  const html = '<usa-disclosure><details><summary>A</summary><p>a</p></details><details><summary>B</summary><p>b</p></details></usa-disclosure>';
  it('springs a panel open and closes the others (single mode)', async () => {
    const d = mount<any>(html);
    const [a, b] = d.querySelectorAll('details');
    a.querySelector('summary').click();
    expect(a.open).toBe(true);
    expect(anims.some((x) => x.el === a && 'height' in x.keyframes[0])).toBe(true);
    b.querySelector('summary').click();
    await finishAll();
    expect(b.open).toBe(true);
    expect(a.open).toBe(false);
  });
  it('multiple keeps several open; toggle() + usa:toggle', async () => {
    const d = mount<any>(html.replace('<usa-disclosure>', '<usa-disclosure multiple>'));
    const ev: any[] = [];
    d.addEventListener('usa:toggle', (e: CustomEvent) => ev.push(e.detail));
    d.toggle(0);
    d.toggle(1);
    await finishAll();
    expect([...d.querySelectorAll('details')].every((x: any) => x.open)).toBe(true);
    expect(ev).toEqual([{ index: 0, open: true }, { index: 1, open: true }]);
  });
  it('reduced motion: instant', () => {
    installComponentMocks({ reducedMotion: true });
    const d = mount<any>(html);
    d.toggle(0);
    expect(d.querySelector('details').open).toBe(true);
    expect(anims).toHaveLength(0);
  });
});

describe('<usa-stories>', () => {
  const html = '<usa-stories duration="1000"><div>1</div><div>2</div><div>3</div></usa-stories>';
  it('renders one bar per story and auto-advances when the bar fills', () => {
    const s = mount<any>(html);
    expect(s.querySelectorAll('.usa-stories-bar')).toHaveLength(3);
    expect(s.children[0].hasAttribute('data-active')).toBe(true);
    const fill = anims[anims.length - 1];
    fill.finish();
    expect(s.index).toBe(1);
    expect(s.querySelectorAll('.usa-stories-bar')[0].hasAttribute('data-done')).toBe(true);
  });
  it('pause button + keyboard; end without loop emits usa:end', () => {
    const s = mount<any>(html);
    const btn = s.querySelector('.usa-stories-toggle');
    btn.click();
    expect(s.hasAttribute('paused')).toBe(true);
    expect(btn.getAttribute('aria-label')).toBe('Play stories');
    const end = vi.fn();
    s.addEventListener('usa:end', end);
    s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    s.next();
    s.next();
    expect(end).toHaveBeenCalled();
  });
  it('reduced motion starts paused (no auto-advance)', () => {
    installComponentMocks({ reducedMotion: true });
    const s = mount<any>(html);
    expect(s.hasAttribute('paused')).toBe(true);
  });
});

describe('6.2 GPU effect pack', () => {
  it('registers 8 effects: 5 shaders, 2 particle backgrounds, 1 click', () => {
    registerGpuPack();
    registerAllPlugins();
    expect(GPU_FX.map((d) => d.name)).toEqual(['fluid', 'smoke', 'fire', 'ink', 'fireflies', 'sakura', 'leaves', 'splash']);
    for (const d of GPU_FX) expect(getEffect(d.name)).toBe(d);
    expect(GPU_FX.filter((d) => d.kind === 'background')).toHaveLength(7);
    expect(getEffect('splash')!.kind).toBe('click');
    expect(EFFECT_PACKS.gpu).toBe(GPU_FX);
  });
  it('the registry is shared through Symbol.for (several bundles on one page)', () => {
    registerEffect({ name: 'zz-shared-62', kind: 'attention', run: () => undefined });
    const table = (globalThis as any)[Symbol.for('use-scroll-animate.effects')] as Map<string, unknown>;
    expect(table.has('zz-shared-62')).toBe(true);
  });
  it('falls back to Canvas 2D without WebGL2 and cleans up', async () => {
    registerGpuPack();
    const calls: string[] = [];
    (HTMLCanvasElement.prototype as any).getContext = (k: string) =>
      k === '2d' ? new Proxy({}, { get: (_t, p: string) => (p === 'createImageData' ? (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }) : p === 'createRadialGradient' ? () => ({ addColorStop() {} }) : (...a: unknown[]) => void calls.push(p)), set: () => true }) : null;
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    expect(supportsWebGL2()).toBe(false);
    const el = mount('<div style="width:100px;height:80px"></div>');
    const stop = await playEffect(el, 'fire');
    expect(el.dataset.usaBackend).toBe('canvas');
    expect(el.querySelector('canvas[data-usa-fx-canvas]')).toBeTruthy();
    expect(calls).toContain('putImageData');
    (stop as any)?.();
  });
  it('fieldFallback samples a coarse grid', () => {
    const spec = fieldFallback(() => [255, 0, 0], 10);
    expect(typeof spec.draw).toBe('function');
  });
  it('splash spawns droplets at the pointer; reduced motion = one soft dot', async () => {
    registerGpuPack();
    const btn = mount('<button>x</button>');
    anims.length = 0;
    playEffect(btn, 'splash', { count: 6 });
    expect(anims.length).toBe(7);
    installComponentMocks({ reducedMotion: true });
    registerGpuPack();
    playEffect(btn, 'splash');
    expect(anims.length).toBe(1);
  });
});

describe('6.2 showcase + Store', () => {
  it('gallery cards for every 6.2 widget and pack, with widgets.umd.js in the HTML tab', () => {
    for (const tag of Object.keys(WIDGETS['6.2'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.entry).toBe('widgets');
      const s = componentSnippets(card);
      expect(s.html).toContain('widgets.umd.js');
      expect(s.esm).toContain("from 'motionary/components/widgets'");
    }
    const gpu: any = COMPONENTS.find((c: any) => c.id === 'fx-gpu');
    expect(componentSnippets(gpu).esm).toContain("import { registerGpuPack } from 'motionary/components/fx-gpu'");
  });
  it('Store: one Components 6.x entry per card, with snippets for every tab', () => {
    expect(CATEGORIES.some((c: any) => c.id === 'components')).toBe(true);
    expect(COMPONENT_ITEMS.length).toBeGreaterThanOrEqual(7);
    for (const it of COMPONENT_ITEMS as any[]) {
      expect(ITEMS).toContain(it);
      const tabs = generate(it, {}, {});
      for (const k of ['vanilla', 'react', 'vue', 'svelte', 'solid', 'element', 'cdn']) expect(tabs[k], `${it.id}:${k}`).toBeTruthy();
    }
    expect(new Set(ITEMS.map((i: any) => i.id)).size).toBe(ITEMS.length);
  });
});
