import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, NAV_INDICATORS, TOGGLE_VARIANTS, TIP_PLACEMENTS } from '../src/components/widgets';
import { MORPH2_FX, registerMorphPack, registerEffectPacks, EFFECT_PACKS, pointsToPath, samplePath } from '../src/components/fx2';
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

describe('6.6 widgets', () => {
  it('ships dock, nav morph, menu toggle and tip', () => {
    expect(Object.keys(WIDGETS['6.6'])).toEqual(['usa-dock', 'usa-nav-morph', 'usa-menu-toggle', 'usa-tip']);
    for (const t of Object.keys(WIDGETS['6.6'])) expect(customElements.get(t)).toBeTruthy();
    expect(NAV_INDICATORS).toEqual(['underline', 'pill', 'blob', 'dot']);
    expect(TOGGLE_VARIANTS).toEqual(['cross', 'arrow', 'minus', 'plus-x']);
    expect(TIP_PLACEMENTS).toEqual(['top', 'bottom', 'left', 'right']);
  });
});

describe('<usa-dock>', () => {
  it('is a toolbar; items magnify by distance and reset on leave', () => {
    const d = mount<any>('<usa-dock magnify="2" range="100"><button data-label="A">A</button><button data-label="B">B</button><button data-label="C">C</button></usa-dock>');
    expect(d.getAttribute('role')).toBe('toolbar');
    const items = d.items as HTMLElement[];
    items.forEach((it, i) => (it.getBoundingClientRect = () => ({ left: i * 50, width: 40, top: 0, height: 40, right: i * 50 + 40, bottom: 40, x: 0, y: 0, toJSON() {} }) as DOMRect));
    d.magnifyAt(20);
    expect(items[0].style.getPropertyValue('--usa-dock-s')).toBe('2.000');
    const s1 = Number(items[1].style.getPropertyValue('--usa-dock-s'));
    expect(s1).toBeGreaterThan(1);
    expect(s1).toBeLessThan(2);
    expect(items[2].style.getPropertyValue('--usa-dock-s')).toBe('1.000');
    expect(items[0].hasAttribute('data-near')).toBe(true);
    d.magnifyAt(null);
    expect(items[0].style.getPropertyValue('--usa-dock-s')).toBe('1.000');
  });
  it('bounce on click; reduced motion = no magnification', () => {
    const d = mount<any>('<usa-dock bounce><button>A</button></usa-dock>');
    anims.length = 0;
    d.items[0].click();
    expect(anims).toHaveLength(1);
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-dock><button>A</button></usa-dock>');
    r.magnifyAt(0);
    expect(r.items[0].style.getPropertyValue('--usa-dock-s')).toBe('1.000');
  });
});

describe('<usa-nav-morph>', () => {
  it('marks the current page, moves the indicator with a stretch and emits usa:change on click', () => {
    const n = mount<any>('<usa-nav-morph><a href="#a">A</a><a href="#b" aria-current="page">B</a><a href="#c">C</a></usa-nav-morph>');
    expect(n.getAttribute('role')).toBe('navigation');
    expect(n.active).toBe(1);
    expect(n.querySelector('.usa-nm-ink')).toBeTruthy();
    const links = n.querySelectorAll('a');
    const seen: number[] = [];
    n.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail.index));
    anims.length = 0;
    links[2].dispatchEvent(new Event('pointerenter'));
    expect(anims.length).toBe(1);
    links[2].click();
    expect(seen).toEqual([2]);
    expect(links[2].getAttribute('aria-current')).toBe('page');
    expect(links[1].hasAttribute('aria-current')).toBe(false);
    links[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(document.activeElement).toBe(links[0]);
  });
});

describe('<usa-menu-toggle>', () => {
  it('toggles aria-expanded and the controlled element', () => {
    document.body.innerHTML = '<usa-menu-toggle for="m" variant="arrow"></usa-menu-toggle><nav id="m" hidden>menu</nav>';
    const t = document.querySelector('usa-menu-toggle') as any;
    const nav = document.getElementById('m')!;
    expect(t.getAttribute('role')).toBe('button');
    expect(t.getAttribute('aria-controls')).toBe('m');
    expect(t.getAttribute('aria-label')).toBe('Menu');
    expect(t.querySelectorAll('.usa-mt-bar')).toHaveLength(3);
    const seen: boolean[] = [];
    t.addEventListener('usa:toggle', (e: CustomEvent) => seen.push(e.detail.open));
    t.click();
    expect(t.getAttribute('aria-expanded')).toBe('true');
    expect(t.hasAttribute('data-animate')).toBe(true);
    expect(nav.hidden).toBe(false);
    t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(nav.hidden).toBe(true);
    expect(seen).toEqual([true, false]);
  });
  it('reduced motion: no morph transition', () => {
    installComponentMocks({ reducedMotion: true });
    const t = mount<any>('<usa-menu-toggle></usa-menu-toggle>');
    t.open = true;
    expect(t.hasAttribute('data-open')).toBe(true);
    expect(t.hasAttribute('data-animate')).toBe(false);
  });
});

describe('<usa-tip>', () => {
  it('hover tip: role=tooltip linked by aria-describedby, opens on focus and closes on Esc', () => {
    const t = mount<any>('<usa-tip text="Hello"><button>Btn</button></usa-tip>');
    const b = t.querySelector('.usa-tip-bubble');
    const btn = t.querySelector('button');
    expect(b.getAttribute('role')).toBe('tooltip');
    expect(btn.getAttribute('aria-describedby')).toBe(b.id);
    expect(b.hidden).toBe(true);
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(t.opened).toBe(true);
    expect(b.hidden).toBe(false);
    expect(b.dataset.placement).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(t.opened).toBe(false);
  });
  it('click popover with rich content toggles aria-expanded', () => {
    const t = mount<any>('<usa-tip trigger="click"><button>More</button><div slot="tip"><b>Rich</b></div></usa-tip>');
    const btn = t.querySelector('button');
    const b = t.querySelector('[slot="tip"]');
    expect(b.getAttribute('role')).toBe('dialog');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(b.querySelector('.usa-tip-arrow')).toBeTruthy();
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('6.6 morph & SVG effects', () => {
  it('registers 5 effects in motionary/components/fx-morph', () => {
    registerMorphPack();
    registerEffectPacks();
    expect(MORPH2_FX.map((d) => d.name)).toEqual(['path-morph', 'blob-button', 'stroke-draw', 'noise-reveal', 'icon-swap']);
    for (const d of MORPH2_FX) expect(getEffect(d.name)).toBe(d);
    expect(EFFECT_PACKS.morph).toBe(MORPH2_FX);
    expect(COMPONENT_ENTRIES['fx-morph']).toBe('fx2/morph2');
  });
  it('pointsToPath builds a closed path; samplePath needs SVG geometry (null in jsdom)', () => {
    expect(pointsToPath([[0, 0], [10, 0], [10, 10]])).toBe('M0.00 0.00L10.00 0.00L10.00 10.00Z');
    expect(samplePath('M0 0 L10 0')).toBeNull();
  });
  it('path-morph with sampled shapes interpolates the d attribute and restores it', () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => frames.push(f));
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    const proto = (window as any).SVGElement.prototype;
    proto.getTotalLength = function () { return 40; };
    proto.getPointAtLength = function (l: number) { const big = (this.getAttribute('d') || '').includes('20'); return { x: big ? l : l / 2, y: 0 }; };
    const el = mount<HTMLElement>('<div><svg><path d="M0 0 L10 0"/></svg></div>');
    const def = getEffect('path-morph') || (registerMorphPack(), getEffect('path-morph'))!;
    const stop = def.run(el, { ...def.defaults, paths: ['M0 0 L20 0'], duration: 100, hold: 0, points: 4 }, ctx()) as () => void;
    expect(frames.length).toBe(1);
    frames.shift()!(performance.now() + 50);
    const d = el.querySelector('path')!.getAttribute('d')!;
    expect(d.startsWith('M')).toBe(true);
    expect(d).not.toBe('M0 0 L10 0');
    stop();
    expect(el.querySelector('path')!.getAttribute('d')).toBe('M0 0 L10 0');
    delete proto.getTotalLength;
    delete proto.getPointAtLength;
  });
  it('blob-button adds a blob path behind the element and cleans up', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    registerMorphPack();
    const el = mount<HTMLElement>('<button>Go</button>');
    const def = getEffect('blob-button')!;
    const stop = def.run(el, { ...def.defaults }, ctx()) as () => void;
    const p = el.querySelector('svg path')!;
    expect(p.getAttribute('d')).toMatch(/^M.*C.*Z$/);
    stop();
    expect(el.querySelector('svg')).toBeNull();
  });
  it('stroke-draw animates every shape; noise-reveal fades under reduced motion; icon-swap cycles icons', async () => {
    registerMorphPack();
    const svg = mount<HTMLElement>('<div><svg><path d="M0 0L5 5"/><circle r="3"/></svg></div>');
    anims.length = 0;
    playEffect(svg, 'stroke-draw');
    expect(anims).toHaveLength(2);
    const sw = mount<HTMLElement>('<button><span>☀</span><span>☾</span></button>');
    anims.length = 0;
    playEffect(sw, 'icon-swap');
    expect(sw.children[0].getAttribute('aria-hidden')).toBe('true');
    expect(sw.children[1].getAttribute('aria-hidden')).toBe('false');
    expect(anims).toHaveLength(2);
    playEffect(sw, 'icon-swap');
    expect(sw.dataset.usaSwap).toBe('0');
    installComponentMocks({ reducedMotion: true });
    const n = mount<HTMLElement>('<div>x</div>');
    anims.length = 0;
    playEffect(n, 'noise-reveal');
    expect(anims).toHaveLength(1);
    expect(n.style.filter).toBe('');
  });
});

describe('6.6 showcase + Store + docs', () => {
  it('gallery cards and Store entries for every 6.6 widget and pack', () => {
    for (const tag of Object.keys(WIDGETS['6.6'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.6');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-morph')).esm).toContain("from 'motionary/components/fx-morph'");
    for (const id of ['dock', 'nav-morph', 'menu-toggle', 'tip', 'fx-morph', 'fx-blob', 'fx-noise']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-dock', '<usa-nav-morph', '<usa-menu-toggle', '<usa-tip', 'fx-morph', 'path-morph']) expect(doc).toContain(s);
  });
});
