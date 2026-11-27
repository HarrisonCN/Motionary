import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import {
  parseCorner, cornerPoint, pipCorner, cornerStep, islandShape, thumbMetrics, scrollForThumb, labelAt,
  slideOutcome, chainPath, linkSize, wrapOffset, cruise,
} from '../src/components/widgets/fling-kit-19';
import { components as cat } from '../showcase/catalog/fling.js';
import { COLLECTIONS } from '../showcase/home-collections.js';
import { RELEASE_COMPONENTS } from '../showcase/catalog-components.js';
import { installComponentMocks } from './components-setup';

const TAGS = ['spring-pip', 'spring-island', 'spring-peek', 'spring-scrollbar', 'slide-confirm', 'spring-chain', 'fling-marquee'];

const mount = <T extends HTMLElement>(html: string): T => {
  const box = document.createElement('div');
  box.innerHTML = html;
  document.body.append(box);
  return box.firstElementChild as T;
};
const events = (el: Element, type: string) => {
  const got: any[] = [];
  el.addEventListener(`usa:${type}`, (e) => got.push((e as CustomEvent).detail));
  return got;
};
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));
// jsdom has no PointerEvent: a MouseEvent with the pointer event's type reaches the same listeners
const pointer = (el: Element, type: string, init: MouseEventInit = {}, t?: number) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
  if (t !== undefined) Object.defineProperty(e, 'timeStamp', { value: t });
  return el.dispatchEvent(e);
};
const read = (f: string) => readFileSync(f, 'utf8');

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('17.19 fling helpers', () => {
  it('parseCorner reads names, short forms and words, with bottom-right as the default', () => {
    expect(parseCorner('top-left')).toBe('top-left');
    expect(parseCorner('TR')).toBe('top-right');
    expect(parseCorner('bottom left')).toBe('bottom-left');
    expect(parseCorner('top')).toBe('top-right');
    expect(parseCorner('left')).toBe('bottom-left');
    expect(parseCorner('')).toBe('bottom-right');
    expect(parseCorner(null)).toBe('bottom-right');
    expect(parseCorner('middle')).toBe('bottom-right');
  });

  it('cornerPoint docks the window inside the frame, inset from its edges', () => {
    expect(cornerPoint('top-left', 100, 60, 400, 300, 12)).toEqual({ x: 12, y: 12 });
    expect(cornerPoint('bottom-right', 100, 60, 400, 300, 12)).toEqual({ x: 288, y: 228 });
    expect(cornerPoint('top-right', 100, 60, 400, 300, 0)).toEqual({ x: 300, y: 0 });
    // a window wider than its frame stays at the inset
    expect(cornerPoint('bottom-right', 500, 60, 400, 300, 10).x).toBe(10);
  });

  it('pipCorner picks the corner the release speed points at', () => {
    // resting in the top-left quarter with no speed stays top-left
    expect(pipCorner(20, 20, 0, 0, 100, 60, 400, 300)).toBe('top-left');
    // a hard flick right and down from the same place carries it to the bottom-right
    expect(pipCorner(20, 20, 2000, 1500, 100, 60, 400, 300)).toBe('bottom-right');
    // a gentle push is not enough to cross the middle
    expect(pipCorner(20, 20, 200, 0, 100, 60, 400, 300)).toBe('top-left');
    expect(pipCorner(280, 220, -3000, 0, 100, 60, 400, 300)).toBe('bottom-left');
  });

  it('cornerStep moves to the neighbouring corner and stays put at an edge', () => {
    expect(cornerStep('bottom-right', 'ArrowUp')).toBe('top-right');
    expect(cornerStep('bottom-right', 'ArrowLeft')).toBe('bottom-left');
    expect(cornerStep('top-left', 'ArrowUp')).toBe('top-left');
    expect(cornerStep('top-left', 'Enter')).toBe('top-left');
  });

  it('islandShape mixes the sizes and keeps a pill while the box is short', () => {
    const small = { w: 120, h: 36 };
    const big = { w: 300, h: 160 };
    expect(islandShape(0, small, big)).toEqual({ width: 120, height: 36, radius: 18 });
    expect(islandShape(1, small, big)).toEqual({ width: 300, height: 160, radius: 28 });
    const mid = islandShape(0.5, small, big);
    expect(mid.width).toBe(210);
    expect(mid.height).toBe(98);
    // a spring can overshoot past the expanded size
    expect(islandShape(1.1, small, big).width).toBeGreaterThan(300);
    expect(islandShape(-0.5, small, big).width).toBeGreaterThanOrEqual(0);
  });

  it('thumbMetrics and scrollForThumb map scroll position and thumb offset both ways', () => {
    expect(thumbMetrics(0, 400, 400, 200)).toEqual({ size: 200, offset: 0 });
    expect(thumbMetrics(0, 1000, 250, 200)).toEqual({ size: 50, offset: 0 });
    expect(thumbMetrics(750, 1000, 250, 200)).toEqual({ size: 50, offset: 150 });
    // very long content keeps the thumb at its minimum size
    expect(thumbMetrics(0, 100000, 250, 200).size).toBe(28);
    expect(scrollForThumb(75, 50, 200, 1000, 250)).toBe(375);
    expect(scrollForThumb(999, 50, 200, 1000, 250)).toBe(750);
    expect(scrollForThumb(10, 200, 200, 400, 400)).toBe(0);
  });

  it('labelAt names the last section whose top has scrolled past, or -1 before the first', () => {
    const tops = [40, 300, 700];
    expect(labelAt(tops, 0)).toBe(-1);
    expect(labelAt(tops, 40)).toBe(0);
    expect(labelAt(tops, 295)).toBe(1);
    expect(labelAt(tops, 2000)).toBe(2);
    expect(labelAt([], 100)).toBe(-1);
  });

  it('slideOutcome confirms past the threshold or on a flick that would reach the end', () => {
    expect(slideOutcome(250, 0, 300)).toBe(true);
    expect(slideOutcome(100, 0, 300)).toBe(false);
    expect(slideOutcome(150, 2000, 300)).toBe(true);
    expect(slideOutcome(150, -2000, 300)).toBe(false);
    expect(slideOutcome(100, 0, 300, 0.3)).toBe(true);
    expect(slideOutcome(100, 0, 0)).toBe(false);
  });

  it('chainPath draws a smooth path through the links and linkSize tapers them', () => {
    expect(chainPath([])).toBe('');
    expect(chainPath([{ x: 1, y: 2 }])).toBe('M1 2');
    expect(chainPath([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }])).toBe('M0 0 Q10 10 15 5 L20 0');
    expect(linkSize(0, 10, 20)).toBe(20);
    expect(linkSize(9, 10, 20)).toBe(7);
    expect(linkSize(5, 10, 20)).toBeLessThan(linkSize(4, 10, 20));
  });

  it('wrapOffset folds into one period and cruise eases toward its target at any frame rate', () => {
    expect(wrapOffset(250, 100)).toBe(50);
    expect(wrapOffset(-30, 100)).toBe(70);
    expect(wrapOffset(5, 0)).toBe(0);
    const one = cruise(1000, 40, 32, 650);
    let two = cruise(1000, 40, 16, 650);
    two = cruise(two, 40, 16, 650);
    expect(one).toBeLessThan(1000);
    expect(one).toBeGreaterThan(40);
    expect(Math.abs(one - two)).toBeLessThan(1e-6);
    expect(cruise(40.005, 40, 16)).toBe(40);
    expect(cruise(1000, 40, 0)).toBe(1000);
  });
});

describe('17.19 fling parts', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.16');
    defineWidgets('17.19');
  });

  it('registers seven widgets under 17.19 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.19']).sort()).toEqual(TAGS.map((t) => `usa-${t}`).sort());
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every part in the catalog, the Store, the demo page, the home tab, the docs and the READMEs', () => {
    expect(cat.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of cat as any[]) expect(c.since).toBe('17.19');
    const store = new Set((RELEASE_COMPONENTS as any[]).map((c) => c.id));
    for (const name of TAGS) expect(store.has(name), name).toBe(true);
    const page = read('showcase/fling.html');
    for (const name of TAGS) expect(page).toContain(`<mo-${name}`);
    expect(page).toContain("defineWidgets('17.19')");
    expect(page).toContain('<script type="module" src="./code-drawer.js" data-auto></script>');
    expect(read('showcase/index.html')).toContain('./fling.html');
    const tab = (COLLECTIONS as any[])[0];
    expect(tab.id).toBe('fling');
    expect(tab.page).toBe('./fling.html');
    expect(tab.items.length).toBe(7);
    const doc = read('docs/fling-parts-17-19.md');
    for (const name of TAGS) expect(doc).toContain(`mo-${name}`);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('showcase/fling.html');
    expect(read('CHANGELOG.md')).toContain('17.19 fling parts');
    expect(read('skills/motionary/SKILL.md')).toContain('mo-spring-pip');
  });

  it('remounts every catalog example cleanly', () => {
    for (const c of cat as any[]) {
      const box = document.createElement('div');
      box.innerHTML = c.usage;
      document.body.append(box);
      const el = box.querySelector(`mo-${c.id}`) as HTMLElement;
      expect(el, c.id).toBeTruthy();
      const count = el.querySelectorAll('*').length;
      const text = el.textContent;
      el.remove();
      box.prepend(el);
      expect(el.querySelectorAll('*').length, c.id).toBe(count);
      expect(el.textContent, c.id).toBe(text);
      box.remove();
    }
  });

  it('spring-pip puts its data-pip child in a focusable window that arrow keys send round the corners', () => {
    const el = mount<any>('<mo-spring-pip corner="top-left" label="Now playing"><p>Page</p><div data-pip>Video</div></mo-spring-pip>');
    const got = events(el, 'corner');
    const win = el.querySelector('.usa-pip-win') as HTMLElement;
    expect(win.getAttribute('role')).toBe('group');
    expect(win.getAttribute('aria-label')).toBe('Now playing');
    expect(win.tabIndex).toBe(0);
    expect(win.textContent).toBe('Video');
    expect(el.querySelector('.usa-pip-page')!.textContent).toBe('Page');
    expect(el.corner).toBe('top-left');
    expect(win.dataset.corner).toBe('top-left');
    key(win, 'ArrowRight');
    expect(el.corner).toBe('top-right');
    key(win, 'ArrowDown');
    expect(el.corner).toBe('bottom-right');
    // a key toward an edge it is already at changes nothing
    key(win, 'ArrowDown');
    el.corner = 'bl';
    expect(el.corner).toBe('bottom-left');
    expect(win.dataset.corner).toBe('bottom-left');
    expect(got).toEqual([{ corner: 'top-right' }, { corner: 'bottom-right' }, { corner: 'bottom-left' }]);
    expect(mount<any>('<mo-spring-pip><div data-pip>x</div></mo-spring-pip>').corner).toBe('bottom-right');
  });

  it('spring-island expands from its pill and collapses on Escape, its close button and a press outside', () => {
    const el = mount<any>('<mo-spring-island label="Timer" close="Fold"><span data-compact>04:12</span><p>Focus session</p></mo-spring-island>');
    const got = events(el, 'toggle');
    const face = el.querySelector('.usa-island-compact') as HTMLButtonElement;
    const panel = el.querySelector('.usa-island-panel') as HTMLElement;
    const shut = el.querySelector('.usa-island-close') as HTMLButtonElement;
    expect(face.textContent).toBe('04:12');
    expect(face.getAttribute('aria-expanded')).toBe('false');
    expect(face.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-label')).toBe('Timer');
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(shut.getAttribute('aria-label')).toBe('Fold');
    face.click();
    expect(el.expanded).toBe(true);
    expect(face.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(shut);
    key(shut, 'Escape');
    expect(el.expanded).toBe(false);
    expect(document.activeElement).toBe(face);
    el.expand();
    shut.click();
    expect(el.expanded).toBe(false);
    el.toggle();
    pointer(el.querySelector('p')!, 'pointerdown');
    expect(el.expanded).toBe(true);
    pointer(document.body, 'pointerdown');
    expect(el.expanded).toBe(false);
    expect(got.map((d) => d.expanded)).toEqual([true, false, true, false, true, false]);
    el.pulse();
    expect(mount<any>('<mo-spring-island expanded><span data-compact>a</span><p>b</p></mo-spring-island>').expanded).toBe(true);
  });

  it('spring-peek opens its preview from the keyboard and a held press, reports a tap, and closes', () => {
    vi.useFakeTimers();
    const el = mount<any>('<mo-spring-peek label="Article" delay="300"><strong>Card</strong><div data-peek><p>Preview</p></div></mo-spring-peek>');
    const got = events(el, 'toggle');
    const taps = events(el, 'tap');
    const card = el.querySelector('.usa-peek-card') as HTMLElement;
    const dialog = el.querySelector('dialog') as HTMLDialogElement;
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('aria-haspopup')).toBe('dialog');
    expect(card.getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.getAttribute('aria-label')).toBe('Article');
    expect(card.textContent).toBe('Card');
    expect(dialog.textContent).toContain('Preview');
    expect(dialog.hasAttribute('open')).toBe(false);
    key(card, 'Enter');
    expect(el.open).toBe(true);
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(card.getAttribute('aria-expanded')).toBe('true');
    key(dialog, 'Escape');
    expect(el.open).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.activeElement).toBe(card);
    key(card, 'F10', { shiftKey: true });
    expect(el.open).toBe(true);
    (el.querySelector('.usa-peek-close') as HTMLButtonElement).click();
    expect(el.open).toBe(false);
    // a short press is a tap
    pointer(card, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(card, 'pointerup', { clientX: 10, clientY: 10 });
    expect(taps).toHaveLength(1);
    expect(el.open).toBe(false);
    // a held press opens it
    pointer(card, 'pointerdown', { clientX: 10, clientY: 10 });
    vi.advanceTimersByTime(320);
    expect(el.open).toBe(true);
    pointer(card, 'pointerup', { clientX: 10, clientY: 10 });
    expect(taps).toHaveLength(1);
    (el.querySelector('.usa-peek-dim') as HTMLElement).click();
    expect(el.open).toBe(false);
    // moving away while holding cancels the hold
    pointer(card, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(card, 'pointermove', { clientX: 60, clientY: 10 });
    vi.advanceTimersByTime(400);
    expect(el.open).toBe(false);
    expect(got.map((d) => d.open)).toEqual([true, false, true, false, true, false]);
  });

  it('spring-scrollbar keeps a native, labelled scroll area with a hidden thumb track', () => {
    const el = mount<any>('<mo-spring-scrollbar height="200" label="Notes"><section data-label="One"><p>a</p></section><section data-label="Two"><p>b</p></section></mo-spring-scrollbar>');
    const box = el.scroller as HTMLElement;
    expect(box.getAttribute('role')).toBe('region');
    expect(box.getAttribute('aria-label')).toBe('Notes');
    expect(box.tabIndex).toBe(0);
    expect(box.style.height).toBe('200px');
    expect(box.querySelector('.usa-sbar-content')!.textContent).toContain('b');
    const track = el.querySelector('.usa-sbar-track') as HTMLElement;
    expect(track.getAttribute('aria-hidden')).toBe('true');
    expect(track.querySelector('.usa-sbar-thumb')).toBeTruthy();
    // jsdom lays nothing out, so every section top is 0: the last one is under the top
    expect(el.section).toBe(1);
    expect(track.querySelector('.usa-sbar-bubble')!.textContent).toBe('Two');
    box.dispatchEvent(new Event('scroll'));
    expect(el.querySelector('.usa-sbar')!.hasAttribute('data-active')).toBe(true);
    expect(mount<any>('<mo-spring-scrollbar height="12rem"><h3>A</h3></mo-spring-scrollbar>').scroller.style.height).toBe('12rem');
  });

  it('slide-confirm confirms from the keyboard and a long slide, springs back from a short one and resets', () => {
    const el = mount<any>('<mo-slide-confirm label="Slide to pay" done="Paid"></mo-slide-confirm>');
    const got = events(el, 'confirm');
    const resets = events(el, 'reset');
    const knob = el.querySelector('.usa-slide-knob') as HTMLButtonElement;
    const status = el.querySelector('[role="status"]') as HTMLElement;
    expect(knob.getAttribute('aria-label')).toBe('Slide to pay');
    expect(el.querySelector('.usa-slide-text')!.textContent).toBe('Slide to pay');
    // a click from Enter or Space has no pointer behind it
    knob.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(el.confirmed).toBe(true);
    expect(knob.getAttribute('aria-label')).toBe('Paid');
    expect(status.textContent).toBe('Paid');
    expect(el.querySelector('.usa-slide')!.hasAttribute('data-confirmed')).toBe(true);
    el.reset();
    expect(el.confirmed).toBe(false);
    expect(status.textContent).toBe('');
    // a pointer click on its own is the start of a slide, not a confirm
    knob.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(el.confirmed).toBe(false);
    // jsdom has no layout: the track is 300 px with a 48 px knob, so the slide is 244 px long
    // a slow, short slide springs back
    pointer(knob, 'pointerdown', { clientX: 0 }, 1000);
    pointer(knob, 'pointermove', { clientX: 60 }, 2000);
    pointer(knob, 'pointerup', { clientX: 60 }, 2100);
    expect(el.confirmed).toBe(false);
    // a slow, long one confirms
    pointer(knob, 'pointerdown', { clientX: 0 }, 3000);
    pointer(knob, 'pointermove', { clientX: 120 }, 4000);
    pointer(knob, 'pointermove', { clientX: 240 }, 5000);
    pointer(knob, 'pointerup', { clientX: 240 }, 5100);
    expect(el.confirmed).toBe(true);
    el.reset();
    // a short one flicked hard confirms too
    pointer(knob, 'pointerdown', { clientX: 0 }, 6000);
    pointer(knob, 'pointermove', { clientX: 40 }, 6016);
    pointer(knob, 'pointermove', { clientX: 90 }, 6032);
    pointer(knob, 'pointerup', { clientX: 90 }, 6040);
    expect(el.confirmed).toBe(true);
    expect(got).toHaveLength(3);
    expect(resets).toHaveLength(2);
    const off = mount<any>('<mo-slide-confirm disabled></mo-slide-confirm>');
    off.confirm();
    expect(off.confirmed).toBe(false);
    expect(off.querySelector('button')!.disabled).toBe(true);
    expect(mount<any>('<mo-slide-confirm confirmed></mo-slide-confirm>').confirmed).toBe(true);
  });

  it('spring-chain draws a labelled picture of links that stands still under reduced motion', () => {
    const el = mount<any>('<mo-spring-chain links="5" size="20" label="Rope"></mo-spring-chain>');
    const root = el.querySelector('.usa-chain') as HTMLElement;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('Rope');
    const links = el.querySelectorAll('circle');
    expect(links).toHaveLength(5);
    expect(el.querySelector('path')!.getAttribute('d')).toMatch(/^M/);
    const before = [...links].map((c) => c.getAttribute('cx'));
    el.pluck();
    expect([...links].map((c) => c.getAttribute('cx'))).toEqual(before);
    expect(mount<any>('<mo-spring-chain links="99"></mo-spring-chain>').querySelectorAll('circle')).toHaveLength(40);
    expect(mount<any>('<mo-spring-chain links="1"></mo-spring-chain>').querySelectorAll('circle')).toHaveLength(3);
  });

  it('fling-marquee becomes a plain scroller under reduced motion and keeps its items once', () => {
    const el = mount<any>('<mo-fling-marquee label="Partners"><span>A</span><span>B</span></mo-fling-marquee>');
    const root = el.querySelector('.usa-fmq') as HTMLElement;
    expect(root.hasAttribute('data-static')).toBe(true);
    const view = el.querySelector('.usa-fmq-view') as HTMLElement;
    expect(view.getAttribute('role')).toBe('region');
    expect(view.getAttribute('aria-label')).toBe('Partners');
    expect(view.textContent).toBe('AB');
    expect(el.querySelector('.usa-fmq-toggle')).toBeNull();
    el.paused = true;
    expect(el.paused).toBe(true);
  });
});

describe('17.19 fling marquee in motion', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: false });
    defineWidgets('17.19');
  });

  it('has a pause button, hides its copies from assistive tech and takes a fling', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(500);
    const el = mount<any>('<mo-fling-marquee speed="50" label="Logos"><span>A</span><span>B</span></mo-fling-marquee>');
    const got = events(el, 'pause');
    const toggle = el.querySelector('.usa-fmq-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Pause');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    const runs = [...el.querySelectorAll('.usa-fmq-run')];
    expect(runs.length).toBeGreaterThanOrEqual(4);
    expect(runs[0].hasAttribute('aria-hidden')).toBe(false);
    for (const copy of runs.slice(1)) {
      expect(copy.getAttribute('aria-hidden')).toBe('true');
      expect(copy.hasAttribute('inert')).toBe(true);
    }
    toggle.click();
    expect(el.paused).toBe(true);
    expect(toggle.getAttribute('aria-label')).toBe('Play');
    el.paused = false;
    expect(got).toEqual([{ paused: true }, { paused: false }]);
    expect(() => el.fling(1200)).not.toThrow();
    expect(mount<any>('<mo-fling-marquee paused><span>x</span></mo-fling-marquee>').paused).toBe(true);
  });
});
