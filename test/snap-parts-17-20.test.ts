import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import {
  stepDecimals, rulerRange, rulerValue, rulerIndex, rulerRest, RULER_MAX_STEPS, parseDialOptions, dialAngle, dialDelta,
  detentAt, detentRotation, dialRest, gridSlot, slotAtPoint, slotStep, gridReorder, headRest, magnetPull, indicatorAt,
  pendulumStep, swingImpulse, pendulumAtRest,
} from '../src/components/widgets/snap-kit-20';
import { components as cat } from '../showcase/catalog/snap.js';
import { COLLECTIONS } from '../showcase/home-collections.js';
import { RELEASE_COMPONENTS } from '../showcase/catalog-components.js';
import { installComponentMocks } from './components-setup';

const TAGS = ['fling-ruler', 'fling-dial', 'spring-grid', 'chat-head', 'fling-tabs', 'swing-sign'];

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
const texts = (els: Iterable<Element>) => [...els].map((e) => e.textContent);

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('17.20 snap helpers', () => {
  it('rulerRange orders the ends, keeps a positive step and caps the number of steps', () => {
    expect(rulerRange(0, 100, 1)).toEqual({ min: 0, max: 100, step: 1, steps: 100 });
    expect(rulerRange(10, 0, 0.5)).toEqual({ min: 0, max: 10, step: 0.5, steps: 20 });
    expect(rulerRange(0, 10, -2)).toEqual({ min: 0, max: 10, step: 2, steps: 5 });
    const long = rulerRange(0, 100000, 1);
    expect(long.steps).toBe(RULER_MAX_STEPS);
    expect(long.step).toBe(50);
    expect(rulerRange(NaN, NaN, NaN)).toEqual({ min: 0, max: 100, step: 1, steps: 100 });
  });

  it('stepDecimals, rulerValue and rulerIndex convert between steps and values', () => {
    expect(stepDecimals(0.25)).toBe(2);
    expect(stepDecimals(0.5)).toBe(1);
    expect(stepDecimals(5)).toBe(0);
    expect(stepDecimals(1e-7)).toBe(7);
    expect(rulerValue(5, 30, 0.5, 240)).toBe(32.5);
    expect(rulerValue(-3, 30, 0.5, 240)).toBe(30);
    expect(rulerValue(999, 0, 1, 10)).toBe(10);
    expect(rulerValue(3, 0, 0.1, 100)).toBe(0.3);
    expect(rulerIndex(62.5, 30, 0.5, 240)).toBe(65);
    expect(rulerIndex(1000, 0, 1, 10)).toBe(10);
    expect(rulerIndex(-5, 0, 1, 10)).toBe(0);
  });

  it('rulerRest carries a flick forward and lands on a step inside the range', () => {
    expect(rulerRest(10, 0, 100)).toBe(10);
    expect(rulerRest(10.4, 0, 100)).toBe(10);
    expect(rulerRest(10, 20, 100)).toBe(16);
    expect(rulerRest(10, -20, 100)).toBe(4);
    expect(rulerRest(-5, 0, 100)).toBe(0);
    expect(rulerRest(98, 50, 100)).toBe(100);
  });

  it('parseDialOptions trims the list and falls back to the digits', () => {
    expect(parseDialOptions('A, B, ,C')).toEqual(['A', 'B', 'C']);
    expect(parseDialOptions('only')).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    expect(parseDialOptions(null)).toHaveLength(10);
    expect(parseDialOptions(Array.from({ length: 40 }, (_, i) => `o${i}`).join(','))).toHaveLength(36);
  });

  it('dialAngle measures clockwise from straight up and dialDelta takes the short way round', () => {
    expect(dialAngle(0, -10, 0, 0)).toBe(0);
    expect(dialAngle(10, 0, 0, 0)).toBeCloseTo(90);
    expect(dialAngle(0, 10, 0, 0)).toBeCloseTo(180);
    expect(dialAngle(-10, 0, 0, 0)).toBeCloseTo(270);
    expect(dialDelta(350, 10)).toBe(20);
    expect(dialDelta(10, 350)).toBe(-20);
    expect(dialDelta(0, 180)).toBe(180);
    expect(dialDelta(0, -180)).toBe(180);
  });

  it('detentAt, detentRotation and dialRest agree on where the options sit', () => {
    expect(detentAt(0, 6)).toBe(0);
    expect(detentAt(-60, 6)).toBe(1);
    expect(detentAt(60, 6)).toBe(5);
    expect(detentAt(-420, 6)).toBe(1);
    expect(detentRotation(1, 6, 0)).toBe(-60);
    // the nearest turn: a dial already spun twice stays near where it is
    expect(detentRotation(1, 6, 700)).toBe(660);
    for (let i = 0; i < 6; i++) expect(detentAt(detentRotation(i, 6, 1234), 6)).toBe(i);
    expect(dialRest(0, 0, 6)).toBe(0);
    expect(dialRest(20, 0, 6)).toBe(0);
    expect(dialRest(40, 0, 6)).toBe(60);
    expect(dialRest(0, 1000, 6)).toBe(300);
  });

  it('gridSlot, slotAtPoint and slotStep lay out and walk a grid', () => {
    expect(gridSlot(5, 4, 80, 10)).toEqual({ x: 90, y: 90 });
    expect(gridSlot(2, 4, 80, 10, 50)).toEqual({ x: 180, y: 0 });
    expect(slotAtPoint(95, 95, 4, 80, 10, 8)).toBe(5);
    expect(slotAtPoint(-40, -40, 4, 80, 10, 8)).toBe(0);
    // a point past the last tile of a short last row picks the last tile
    expect(slotAtPoint(1000, 1000, 4, 80, 10, 6)).toBe(5);
    expect(slotAtPoint(0, 0, 4, 80, 10, 0)).toBe(-1);
    expect(slotStep(5, 'ArrowUp', 4, 8)).toBe(1);
    expect(slotStep(1, 'ArrowUp', 4, 8)).toBe(1);
    expect(slotStep(0, 'ArrowLeft', 4, 8)).toBe(0);
    expect(slotStep(3, 'ArrowRight', 4, 8)).toBe(4);
    expect(slotStep(5, 'Home', 4, 8)).toBe(0);
    expect(slotStep(5, 'End', 4, 8)).toBe(7);
    expect(slotStep(5, 'Enter', 4, 8)).toBe(5);
  });

  it('gridReorder moves one item and keeps the rest in order', () => {
    expect(gridReorder(4, 0, 2)).toEqual([1, 2, 0, 3]);
    expect(gridReorder(4, 3, 0)).toEqual([3, 0, 1, 2]);
    expect(gridReorder(4, 1, 1)).toEqual([0, 1, 2, 3]);
    expect(gridReorder(0, 0, 1)).toEqual([]);
  });

  it('headRest docks to the side the momentum points at, within the frame', () => {
    expect(headRest(100, 50, 0, 0, 56, 400, 300, 10)).toEqual({ side: 'left', x: 10, y: 50 });
    expect(headRest(100, 50, 2000, 0, 56, 400, 300, 10)).toEqual({ side: 'right', x: 334, y: 50 });
    expect(headRest(300, 50, -2000, 0, 56, 400, 300, 10).side).toBe('left');
    expect(headRest(100, 50, 0, 9000, 56, 400, 300, 10).y).toBe(234);
    expect(headRest(100, -80, 0, 0, 56, 400, 300, 10).y).toBe(10);
  });

  it('magnetPull rises smoothly from the edge of its radius to the target', () => {
    expect(magnetPull(0, 0, 0, 0, 80)).toBe(1);
    expect(magnetPull(80, 0, 0, 0, 80)).toBe(0);
    expect(magnetPull(200, 0, 0, 0, 80)).toBe(0);
    expect(magnetPull(40, 0, 0, 0, 80)).toBe(0.5);
    expect(magnetPull(20, 0, 0, 0, 80)).toBeGreaterThan(magnetPull(60, 0, 0, 0, 80));
  });

  it('indicatorAt matches a tab at rest, stretches between two and squashes past the ends', () => {
    const rects = [{ x: 0, w: 50 }, { x: 60, w: 100 }];
    expect(indicatorAt(0, rects)).toEqual({ x: 0, w: 50 });
    expect(indicatorAt(1, rects)).toEqual({ x: 60, w: 100 });
    // halfway the leading edge is further on than the trailing one, so the pill is wider than either tab
    expect(indicatorAt(0.5, rects)).toEqual({ x: 15, w: 117.5 });
    expect(indicatorAt(-1, rects)).toEqual({ x: 0, w: 37.5 });
    expect(indicatorAt(2, rects)).toEqual({ x: 85, w: 75 });
    expect(indicatorAt(0, [])).toEqual({ x: 0, w: 0 });
  });

  it('pendulumStep swings back toward the middle and comes to rest', () => {
    const one = pendulumStep(0.5, 0, 16, 120);
    expect(one.velocity).toBeLessThan(0);
    expect(one.angle).toBeLessThan(0.5);
    let s = { angle: 0.5, velocity: 0 };
    let crossed = false;
    for (let i = 0; i < 1000; i++) {
      s = pendulumStep(s.angle, s.velocity, 16, 120);
      if (s.angle < 0) crossed = true;
    }
    expect(crossed).toBe(true);
    expect(pendulumAtRest(s.angle, s.velocity)).toBe(true);
    expect(pendulumStep(5, 0, 0, 120).angle).toBe(1.2);
    expect(pendulumStep(NaN, NaN, 16, 120)).toEqual({ angle: 0, velocity: 0 });
  });

  it('swingImpulse turns a push into a capped spin and pendulumAtRest spots a still sign', () => {
    expect(swingImpulse(-240, 120)).toBe(-2);
    expect(swingImpulse(1200, 120)).toBe(9);
    expect(swingImpulse(0, 120)).toBe(0);
    expect(pendulumAtRest(0.001, 0.003)).toBe(true);
    expect(pendulumAtRest(0.01, 0)).toBe(false);
    expect(pendulumAtRest(0, 0.1)).toBe(false);
  });
});

describe('17.20 snap parts', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.16');
    defineWidgets('17.20');
  });

  it('registers six widgets under 17.20 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.20']).sort()).toEqual(TAGS.map((t) => `usa-${t}`).sort());
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every part in the catalog, the Store, the demo page, the home tab, the docs and the READMEs', () => {
    expect(cat.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of cat as any[]) expect(c.since).toBe('17.20');
    const store = new Set((RELEASE_COMPONENTS as any[]).map((c) => c.id));
    for (const name of TAGS) expect(store.has(name), name).toBe(true);
    const page = read('showcase/snap.html');
    for (const name of TAGS) expect(page).toContain(`<mo-${name}`);
    expect(page).toContain("defineWidgets('17.20')");
    expect(page).toContain('<script type="module" src="./code-drawer.js" data-auto></script>');
    expect(read('showcase/index.html')).toContain('./snap.html');
    const tab = (COLLECTIONS as any[]).find((c) => c.id === 'snap');
    expect((COLLECTIONS as any[])[0]).toBe(tab);
    expect(tab.page).toBe('./snap.html');
    expect(tab.title.zh).toBe('吸附与摆动');
    expect(tab.items.length).toBe(6);
    const doc = read('docs/snap-parts-17-20.md');
    for (const name of TAGS) expect(doc).toContain(`mo-${name}`);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('showcase/snap.html');
    expect(read('CHANGELOG.md')).toContain('17.20 snap parts');
    expect(read('skills/motionary/SKILL.md')).toContain('mo-fling-ruler');
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

  it('fling-ruler is a labelled slider that steps by key, by property and by drag', () => {
    const el = mount<any>('<mo-fling-ruler min="0" max="10" step="0.5" value="2.5" unit="kg" label="Weight"></mo-fling-ruler>');
    const changes = events(el, 'change');
    const view = el.querySelector('.usa-ruler-view') as HTMLElement;
    expect(view.getAttribute('role')).toBe('slider');
    expect(view.getAttribute('aria-label')).toBe('Weight');
    expect(view.getAttribute('aria-valuemin')).toBe('0.0');
    expect(view.getAttribute('aria-valuemax')).toBe('10.0');
    expect(view.getAttribute('aria-valuenow')).toBe('2.5');
    expect(view.getAttribute('aria-valuetext')).toBe('2.5 kg');
    expect(view.tabIndex).toBe(0);
    expect(el.value).toBe(2.5);
    expect(el.querySelector('.usa-ruler-value')!.textContent).toBe('2.5kg');
    key(view, 'ArrowRight');
    key(view, 'PageUp');
    key(view, 'End');
    key(view, 'Home');
    el.value = 7.3;
    expect(changes.map((d) => d.value)).toEqual([3, 8, 10, 0, 7.5]);
    expect(view.getAttribute('aria-valuenow')).toBe('7.5');
    // a drag of 20 steps to the left (spacing 10px) moves the scale on by 20 steps
    const inputs = events(el, 'input');
    el.value = 2.5;
    changes.length = 0;
    pointer(view, 'pointerdown', { clientX: 300, clientY: 50 }, 0);
    pointer(view, 'pointermove', { clientX: 250, clientY: 50 }, 100);
    pointer(view, 'pointerup', { clientX: 250, clientY: 50 }, 400);
    expect(inputs).toEqual([{ value: 5 }]);
    expect(changes).toEqual([{ value: 5 }]);
    expect(el.value).toBe(5);
    // a value set before it is defined is kept, and attributes remount it
    el.setAttribute('max', '4');
    expect(el.value).toBe(4);
    const off = mount<any>('<mo-fling-ruler disabled></mo-fling-ruler>');
    const view2 = off.querySelector('.usa-ruler-view') as HTMLElement;
    expect(view2.tabIndex).toBe(-1);
    expect(view2.getAttribute('aria-disabled')).toBe('true');
    const none = events(off, 'change');
    key(view2, 'ArrowRight');
    expect(none).toEqual([]);
  });

  it('fling-dial turns one detent per key, wraps round and takes a value', () => {
    const el = mount<any>('<mo-fling-dial options="XS, S, M, L" value="M" label="Size"></mo-fling-dial>');
    const changes = events(el, 'change');
    const wheel = el.querySelector('.usa-fdial-wheel') as HTMLElement;
    expect(wheel.getAttribute('role')).toBe('slider');
    expect(wheel.getAttribute('aria-label')).toBe('Size');
    expect(wheel.getAttribute('aria-valuemax')).toBe('3');
    expect(wheel.getAttribute('aria-valuenow')).toBe('2');
    expect(wheel.getAttribute('aria-valuetext')).toBe('M');
    expect(el.querySelector('.usa-fdial-hub')!.textContent).toBe('M');
    expect(texts(el.querySelectorAll('.usa-fdial-opt'))).toEqual(['XS', 'S', 'M', 'L']);
    expect(el.options).toEqual(['XS', 'S', 'M', 'L']);
    expect(el.value).toBe('M');
    expect(el.index).toBe(2);
    key(wheel, 'ArrowRight');
    key(wheel, 'ArrowRight');
    key(wheel, 'ArrowLeft');
    key(wheel, 'Home');
    key(wheel, 'End');
    el.value = 'S';
    el.value = 'nope';
    expect(changes).toEqual([
      { value: 'L', index: 3 }, { value: 'XS', index: 0 }, { value: 'L', index: 3 },
      { value: 'XS', index: 0 }, { value: 'L', index: 3 }, { value: 'S', index: 1 },
    ]);
    expect(el.querySelector('.usa-fdial-opt[data-on]')!.textContent).toBe('S');
    expect(wheel.getAttribute('aria-valuetext')).toBe('S');
    // the face turns so that the chosen option is under the pointer
    const turn = parseFloat(/rotate\((-?[\d.]+)deg\)/.exec((el.querySelector('.usa-fdial-face') as HTMLElement).style.transform)![1]);
    expect(detentAt(turn, 4)).toBe(1);
    expect(mount<any>('<mo-fling-dial options="only"></mo-fling-dial>').options).toHaveLength(10);
  });

  it('spring-grid moves a tile from the keyboard, announces each step and cancels with Escape', () => {
    const el = mount<any>('<mo-spring-grid columns="2" label="Apps"><div data-key="a">A</div><div data-key="b">B</div><div data-key="c">C</div></mo-spring-grid>');
    const got = events(el, 'reorder');
    const root = el.querySelector('.usa-sgrid') as HTMLElement;
    const status = root.querySelector('[role="status"]') as HTMLElement;
    const items = [...el.querySelectorAll('.usa-sgrid-item')] as HTMLElement[];
    expect(root.getAttribute('role')).toBe('list');
    expect(root.getAttribute('aria-label')).toBe('Apps');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.getAttribute('role')).toBe('listitem');
      expect(item.tabIndex).toBe(0);
      expect(document.getElementById(item.getAttribute('aria-describedby')!)).toBeTruthy();
    }
    expect(el.order).toEqual(['a', 'b', 'c']);
    const [a, , c] = items;
    key(a, ' ');
    expect(a.hasAttribute('data-lifted')).toBe(true);
    expect(root.hasAttribute('data-editing')).toBe(true);
    expect(status.textContent).toBe('A picked up, position 1 of 3.');
    key(a, 'ArrowRight');
    expect(status.textContent).toBe('Position 2 of 3.');
    // down from the second slot of a two-column grid of three is off the grid: it stays
    key(a, 'ArrowDown');
    expect(status.textContent).toBe('Position 2 of 3.');
    key(a, 'Enter');
    expect(a.hasAttribute('data-lifted')).toBe(false);
    expect(root.hasAttribute('data-editing')).toBe(false);
    expect(status.textContent).toBe('A dropped at position 2 of 3.');
    expect(got).toEqual([{ from: 0, to: 1, order: ['b', 'a', 'c'] }]);
    expect(texts(root.querySelectorAll('.usa-sgrid-item'))).toEqual(['B', 'A', 'C']);
    key(c, 'Enter');
    key(c, 'ArrowUp');
    expect(el.order).toEqual(['c', 'b', 'a']);
    key(c, 'Escape');
    expect(status.textContent).toBe('C: move cancelled.');
    expect(el.order).toEqual(['b', 'a', 'c']);
    expect(got).toHaveLength(1);
    // the order survives a remount
    el.setAttribute('columns', '3');
    expect(texts(el.querySelectorAll('.usa-sgrid-item'))).toEqual(['B', 'A', 'C']);
  });

  it('chat-head docks by key, dismisses and restores, reports taps and catches a drag on its target', () => {
    const el = mount<any>('<mo-chat-head count="3" label="Ada"><p>Page</p><span data-head>AL</span></mo-chat-head>');
    const docks = events(el, 'dock');
    const gone = events(el, 'dismiss');
    const back = events(el, 'restore');
    const taps = events(el, 'tap');
    const btn = el.querySelector('.usa-chead-btn') as HTMLButtonElement;
    const status = el.querySelector('[role="status"]') as HTMLElement;
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('aria-label')).toBe('Ada, 3 new');
    expect(btn.textContent).toBe('AL3');
    expect(el.querySelector('.usa-chead-page')!.textContent).toBe('Page');
    expect(el.side).toBe('right');
    expect(btn.dataset.side).toBe('right');
    key(btn, 'ArrowLeft');
    expect(el.side).toBe('left');
    key(btn, 'ArrowUp');
    btn.click();
    expect(taps).toHaveLength(1);
    key(btn, 'Delete');
    expect(el.dismissed).toBe(true);
    expect(btn.hasAttribute('inert')).toBe(true);
    expect(el.querySelector('.usa-chead')!.hasAttribute('data-dismissed')).toBe(true);
    expect(status.textContent).toBe('Ada closed.');
    key(btn, 'ArrowRight');
    expect(el.side).toBe('left');
    el.restore();
    expect(el.dismissed).toBe(false);
    expect(status.textContent).toBe('Ada is back.');
    el.side = 'right';
    expect(docks).toEqual([{ side: 'left' }, { side: 'left' }, { side: 'right' }]);
    expect(back).toHaveLength(1);
    expect(gone).toHaveLength(1);
    // dragged onto the close target (bottom centre of a 320px frame) it is pulled in and dismissed on release
    const fresh = mount<any>('<mo-chat-head><p>x</p></mo-chat-head>');
    const freshGone = events(fresh, 'dismiss');
    const head = fresh.querySelector('.usa-chead-btn') as HTMLButtonElement;
    expect(head.getAttribute('aria-label')).toBe('Chat');
    expect(head.textContent).toBe('C');
    pointer(head, 'pointerdown', { clientX: 300, clientY: 30 }, 0);
    pointer(head, 'pointermove', { clientX: 178, clientY: 199 }, 50);
    expect(fresh.querySelector('.usa-chead')!.hasAttribute('data-dragging')).toBe(true);
    pointer(head, 'pointerup', { clientX: 178, clientY: 199 }, 300);
    expect(fresh.dismissed).toBe(true);
    expect(freshGone).toHaveLength(1);
    // a drag let go on the left half docks it on the left, and the click that follows the drag is not a tap
    const third = mount<any>('<mo-chat-head><p>x</p></mo-chat-head>');
    const thirdDocks = events(third, 'dock');
    const thirdTaps = events(third, 'tap');
    const h3 = third.querySelector('.usa-chead-btn') as HTMLButtonElement;
    pointer(h3, 'pointerdown', { clientX: 260, clientY: 80 }, 0);
    pointer(h3, 'pointermove', { clientX: 40, clientY: 100 }, 50);
    pointer(h3, 'pointerup', { clientX: 40, clientY: 100 }, 400);
    h3.click();
    expect(thirdDocks).toEqual([{ side: 'left' }]);
    expect(thirdTaps).toEqual([]);
    expect(third.side).toBe('left');
    expect(mount<any>('<mo-chat-head side="left"><p>x</p></mo-chat-head>').side).toBe('left');
  });

  it('fling-tabs is a tab list with roving focus whose panels swipe and stay inert out of view', () => {
    const el = mount<any>('<mo-fling-tabs label="Sections"><div data-tab="One"><p>1</p></div><div data-tab="Two"><p>2</p></div><div data-tab="Three"><p>3</p></div></mo-fling-tabs>');
    const changes = events(el, 'change');
    const bar = el.querySelector('.usa-ftabs-bar') as HTMLElement;
    const tabs = [...el.querySelectorAll('.usa-ftabs-tab')] as HTMLButtonElement[];
    const panels = [...el.querySelectorAll('.usa-ftabs-panel')] as HTMLElement[];
    expect(bar.getAttribute('role')).toBe('tablist');
    expect(bar.getAttribute('aria-label')).toBe('Sections');
    expect(texts(tabs)).toEqual(['One', 'Two', 'Three']);
    expect(el.count).toBe(3);
    tabs.forEach((t, i) => {
      expect(t.getAttribute('role')).toBe('tab');
      expect(t.getAttribute('aria-controls')).toBe(panels[i].id);
      expect(panels[i].getAttribute('role')).toBe('tabpanel');
      expect(panels[i].getAttribute('aria-labelledby')).toBe(t.id);
    });
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(panels.map((p) => p.hasAttribute('inert'))).toEqual([false, true, true]);
    expect(panels[0].querySelector('[data-tab]')).toBeNull();
    expect(panels[0].textContent).toBe('1');
    tabs[2].click();
    expect(panels.map((p) => p.hasAttribute('inert'))).toEqual([true, true, false]);
    key(tabs[2], 'ArrowRight');
    key(tabs[2], 'ArrowLeft');
    key(tabs[1], 'Home');
    key(tabs[0], 'End');
    expect(document.activeElement).toBe(tabs[2]);
    el.index = 1;
    expect(changes).toEqual([
      { index: 2, label: 'Three' }, { index: 1, label: 'Two' }, { index: 0, label: 'One' },
      { index: 2, label: 'Three' }, { index: 1, label: 'Two' },
    ]);
    // a long drag to the left goes on to the next tab
    const view = el.querySelector('.usa-ftabs-view') as HTMLElement;
    pointer(view, 'pointerdown', { clientX: 300, clientY: 20 }, 0);
    pointer(view, 'pointermove', { clientX: 100, clientY: 20 }, 100);
    pointer(view, 'pointerup', { clientX: 100, clientY: 20 }, 400);
    expect(el.index).toBe(2);
    expect(changes.at(-1)).toEqual({ index: 2, label: 'Three' });
    // the tab shown survives a remount; children without data-tab are numbered
    el.setAttribute('label', 'Parts');
    expect(el.querySelector('.usa-ftabs-tab[aria-selected="true"]')!.textContent).toBe('Three');
    const plain = mount<any>('<mo-fling-tabs><p>a</p><p>b</p></mo-fling-tabs>');
    expect(texts(plain.querySelectorAll('.usa-ftabs-tab'))).toEqual(['Tab 1', 'Tab 2']);
  });

  it('swing-sign is a toggle that turns to its back face, announces it and ignores the click after a drag', () => {
    const el = mount<any>('<mo-swing-sign label="Shop"><strong>OPEN</strong><strong data-back>CLOSED</strong></mo-swing-sign>');
    const flips = events(el, 'flip');
    const card = el.querySelector('.usa-swing-card') as HTMLElement;
    const [front, back] = [...el.querySelectorAll('.usa-swing-face')] as HTMLElement[];
    const status = el.querySelector('[role="status"]') as HTMLElement;
    expect(card.getAttribute('role')).toBe('button');
    expect(card.tabIndex).toBe(0);
    expect(card.getAttribute('aria-label')).toBe('Shop');
    expect(card.getAttribute('aria-pressed')).toBe('false');
    expect(front.textContent).toBe('OPEN');
    expect(back.textContent).toBe('CLOSED');
    expect(back.querySelector('[data-back]')).toBeNull();
    expect(back.getAttribute('aria-hidden')).toBe('true');
    expect(front.getAttribute('aria-hidden')).toBe('false');
    key(card, 'Enter');
    expect(el.flipped).toBe(true);
    expect(card.getAttribute('aria-pressed')).toBe('true');
    expect(front.getAttribute('aria-hidden')).toBe('true');
    expect(status.textContent).toBe('CLOSED');
    card.click();
    expect(el.flipped).toBe(false);
    expect(status.textContent).toBe('OPEN');
    key(card, ' ');
    // a drag is not a click
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 }, 0);
    pointer(card, 'pointermove', { clientX: 160, clientY: 100 }, 50);
    pointer(card, 'pointerup', { clientX: 160, clientY: 100 }, 300);
    card.click();
    expect(el.flipped).toBe(true);
    el.flipped = false;
    expect(flips).toEqual([{ flipped: true }, { flipped: false }, { flipped: true }, { flipped: false }]);
    // swing() does nothing under reduced motion, and a remount keeps the face
    expect(() => el.swing(1)).not.toThrow();
    el.flipped = true;
    el.setAttribute('length', '80');
    expect(el.querySelector('.usa-swing')!.getAttribute('data-flipped')).toBe('');
    expect((el.querySelector('.usa-swing') as HTMLElement).style.getPropertyValue('--usa-swing-length')).toBe('80px');
    expect(mount<any>('<mo-swing-sign flipped><b>a</b><b data-back>b</b></mo-swing-sign>').flipped).toBe(true);
  });
});
