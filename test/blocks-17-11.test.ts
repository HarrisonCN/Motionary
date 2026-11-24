import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, WIDGETS, matchSuggestions, isEmail, percentLabel, riseProgress, dividerPath, DIVIDER_SHAPES, CUE_KINDS,
  virtualWindow, placeMenu, clampSplit, clampWindow, stackPose, invertRect, zoomAt, cleanColor, sectionAt, tunnelPose,
  frontIndex, ringRadius, sagAt, swingStep, elasticPath,
} from '../src/components/widgets';
import { components as blocks } from '../showcase/catalog/blocks.js';
import { installComponentMocks } from './components-setup';
import { readFileSync } from 'node:fs';

const PAGE = ['search-bar', 'subscribe', 'download-button', 'reveal-footer', 'shape-divider', 'scroll-cue'];
const PARTS = ['virtual-list', 'infinite-scroll', 'context-menu', 'split-pane', 'desktop-windows', 'stack-slider', 'morph-card'];
const MOTION = ['scroll-zoom', 'scroll-bg', 'image-tunnel', 'orbit-gallery', 'clothesline', 'elastic-frame', 'border-beam'];
const TAGS = [...PAGE, ...PARTS, ...MOTION];

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  defineWidgets('17.11');
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

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
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

describe('17.11 registration', () => {
  it('registers twenty widgets under 17.11 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.11']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every new widget in the showcase catalog and on the demo page', () => {
    expect(blocks.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of blocks as any[]) expect(c.since).toBe('17.11');
    const lab = readFileSync('showcase/blocks.html', 'utf8');
    for (const name of TAGS) expect(lab).toContain(`<mo-${name}`);
    expect(readFileSync('showcase/index.html', 'utf8')).toContain('./blocks.html');
  });

  it('remounts every catalog example cleanly: same structure after detach and reattach', () => {
    for (const c of blocks as any[]) {
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

  it('gives the original children back when removed', () => {
    const el = mount<HTMLElement>('<mo-split-pane><div>Left</div><div>Right</div></mo-split-pane>');
    expect(el.querySelector('[role="separator"]')).toBeTruthy();
    el.remove();
    expect(Array.from(el.children).map((c) => c.textContent)).toEqual(['Left', 'Right']);
    expect(el.querySelector('.usa-split')).toBeNull();
  });
});

describe('pure helpers', () => {
  it('matchSuggestions finds case-insensitive matches, prefixes first', () => {
    const items = ['Split pane', 'Search bar', 'Scroll zoom', 'Subscribe'];
    expect(matchSuggestions(items, '')).toEqual([]);
    expect(matchSuggestions(items, 'S')).toEqual(['Split pane', 'Search bar', 'Scroll zoom', 'Subscribe']);
    expect(matchSuggestions(items, 'bar')).toEqual(['Search bar']);
    expect(matchSuggestions(['xa', 'ab'], 'a')).toEqual(['ab', 'xa']);
    expect(matchSuggestions(items, 's', 2)).toHaveLength(2);
  });
  it('isEmail takes ordinary addresses and refuses the rest', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('  first.last+tag@example.com ')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('a b@c.com')).toBe(false);
    expect(isEmail('a@@b.com')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
  it('percentLabel floors and clamps', () => {
    expect(percentLabel(42.9)).toBe('42%');
    expect(percentLabel(-5)).toBe('0%');
    expect(percentLabel(300)).toBe('100%');
    expect(percentLabel(NaN)).toBe('0%');
  });
  it('riseProgress goes from 0 below the screen to 1 fully in view', () => {
    expect(riseProgress(800, 200, 800)).toBe(0);
    expect(riseProgress(700, 200, 800)).toBe(0.5);
    expect(riseProgress(600, 200, 800)).toBe(1);
    expect(riseProgress(0, 0, 800)).toBe(1);
  });
  it('dividerPath draws a closed path for every shape', () => {
    expect([...DIVIDER_SHAPES]).toEqual(['wave', 'curve', 'tilt', 'arrow', 'zigzag', 'steps']);
    for (const s of DIVIDER_SHAPES) {
      const d = dividerPath(s, 1200, 100);
      expect(d.startsWith('M0 0H1200'), s).toBe(true);
      expect(d.endsWith('Z'), s).toBe(true);
    }
    expect(dividerPath('tilt', 1200, 100)).toBe('M0 0H1200V0L0 100Z');
    expect(dividerPath('nope', 100, 10)).toBe(dividerPath('wave', 100, 10));
    expect([...CUE_KINDS]).toEqual(['mouse', 'chevron', 'line']);
  });
  it('virtualWindow renders the visible rows plus overscan', () => {
    expect(virtualWindow(0, 400, 40, 1000, 4)).toEqual({ start: 0, end: 15, offset: 0 });
    expect(virtualWindow(4000, 400, 40, 1000, 4)).toEqual({ start: 96, end: 115, offset: 3840 });
    expect(virtualWindow(99999, 400, 40, 50, 4).end).toBe(50);
    expect(virtualWindow(0, 400, 40, 0)).toEqual({ start: 0, end: 0, offset: 0 });
  });
  it('placeMenu flips at the window edges and keeps a margin', () => {
    expect(placeMenu(10, 10, 200, 100, 1000, 800)).toEqual({ left: 10, top: 10, originX: 'left', originY: 'top' });
    expect(placeMenu(950, 750, 200, 100, 1000, 800)).toEqual({ left: 750, top: 650, originX: 'right', originY: 'bottom' });
    expect(placeMenu(0, 0, 200, 100, 1000, 800).left).toBe(8);
  });
  it('clampSplit, clampWindow and stackPose stay in range', () => {
    expect(clampSplit(5)).toBe(10);
    expect(clampSplit(95)).toBe(90);
    expect(clampSplit(33.333)).toBe(33.3);
    expect(clampSplit(NaN)).toBe(50);
    expect(clampWindow(-20, 999, 280, 600, 400)).toEqual({ x: 0, y: 360 });
    expect(clampWindow(1000, 10, 280, 600, 400)).toEqual({ x: 320, y: 10 });
    expect(stackPose(0)).toMatchObject({ scale: 1, opacity: 1, z: 100 });
    expect(Math.abs(stackPose(0).y)).toBe(0);
    expect(stackPose(1).scale).toBe(0.94);
    expect(stackPose(3, 3).opacity).toBe(0);
    expect(stackPose(-1).opacity).toBe(0);
  });
  it('invertRect maps the big box back onto the small one', () => {
    expect(invertRect({ left: 10, top: 20, width: 100, height: 50 }, { left: 0, top: 0, width: 400, height: 200 }))
      .toBe('translate(10px, 20px) scale(0.25, 0.25)');
    expect(invertRect({ left: 0, top: 0, width: 10, height: 10 }, { left: 0, top: 0, width: 0, height: 0 })).toBe('translate(0px, 0px) scale(1, 1)');
  });
  it('zoomAt grows to full size, then raises the caption', () => {
    expect(zoomAt(0)).toEqual({ scale: 0.45, radius: 28, caption: 0 });
    expect(zoomAt(0.7)).toEqual({ scale: 1, radius: 0, caption: 0 });
    expect(zoomAt(1).caption).toBe(1);
    expect(zoomAt(0.35).scale).toBeGreaterThan(0.45);
    expect(zoomAt(2, 0)).toEqual(zoomAt(1, 0.05));
  });
  it('cleanColor refuses anything but a color, sectionAt picks the last section above the line', () => {
    expect(cleanColor('#1b1b1a')).toBe('#1b1b1a');
    expect(cleanColor('url(x)')).toBe('');
    expect(cleanColor('red; background: url(x)')).toBe('');
    expect(cleanColor('')).toBe('');
    expect(sectionAt([0, 500, 1000], 400)).toBe(0);
    expect(sectionAt([-300, 200, 900], 400)).toBe(1);
    expect(sectionAt([], 400)).toBe(0);
  });
  it('tunnelPose brings each image from far to near and alternates sides', () => {
    const far = tunnelPose(0, 3, 4), here = tunnelPose(1, 3, 4);
    expect(far.z).toBeLessThan(here.z);
    expect(tunnelPose(0.5, 0, 4).x).toBe(-tunnelPose(0.5, 1, 4).x);
    expect(tunnelPose(0, 0, 4).opacity).toBeGreaterThan(0);
    expect(tunnelPose(1, 0, 4).opacity).toBe(0);
  });
  it('frontIndex and ringRadius describe the ring', () => {
    expect(frontIndex(0, 6)).toBe(0);
    expect(frontIndex(-60, 6)).toBe(1);
    expect(frontIndex(60, 6)).toBe(5);
    expect(frontIndex(-725, 6)).toBe(0);
    expect(frontIndex(10, 0)).toBe(0);
    expect(ringRadius(1, 180)).toBe(0);
    expect(ringRadius(6, 180, 24)).toBe(Math.round((6 * 204) / (2 * Math.PI)));
  });
  it('sagAt is a parabola and swingStep settles', () => {
    expect(sagAt(0, 24)).toBe(0);
    expect(sagAt(0.5, 24)).toBe(24);
    expect(sagAt(1, 24)).toBe(0);
    let a = 20, v = 0;
    for (let i = 0; i < 600; i++) [a, v] = swingStep(a, v, 1 / 60);
    expect(Math.abs(a)).toBeLessThan(0.5);
  });
  it('elasticPath bows the edges it is told to', () => {
    const still = elasticPath(100, 60, 10, { top: 0, right: 0, bottom: 0, left: 0 });
    expect(still.startsWith('M10 0Q50 0 90 0')).toBe(true);
    expect(elasticPath(100, 60, 10, { top: 5, right: 0, bottom: 0, left: 0 })).toContain('Q50 -10 90 0');
    expect(elasticPath(20, 10, 99, { top: 0, right: 0, bottom: 0, left: 0 }).startsWith('M5 0')).toBe(true);
  });
});

describe('page blocks', () => {
  it('search bar opens, suggests with the combobox pattern and reports searches', () => {
    const el = mount<any>('<mo-search-bar label="Search docs" suggestions="Split pane, Search bar, Scroll zoom"></mo-search-bar>');
    const toggles = events(el, 'toggle');
    const searches = events(el, 'search');
    const toggle = el.querySelector('.usa-sbar-toggle') as HTMLButtonElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    expect(el.querySelector('[role="search"]')).toBeTruthy();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    expect(el.expanded).toBe(true);
    expect(toggles).toEqual([{ expanded: true }]);
    input.value = 'sc';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const opts = el.querySelectorAll('[role="option"]');
    expect(Array.from(opts).map((o: any) => o.textContent)).toEqual(['Scroll zoom']);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    key(input, 'ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    key(input, 'Enter');
    expect(searches).toEqual([{ query: 'Scroll zoom' }]);
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('search bar opens from the shortcut key but not while typing elsewhere', () => {
    const el = mount<any>('<mo-search-bar></mo-search-bar>');
    const other = document.createElement('input');
    document.body.append(other);
    key(other, '/');
    expect(el.expanded).toBe(false);
    key(document.body, '/');
    expect(el.expanded).toBe(true);
    const none = mount<any>('<mo-search-bar shortcut="none"></mo-search-bar>');
    expect(none.querySelector('kbd')).toBeNull();
  });

  it('subscribe refuses a bad address and finishes when nobody cancels', () => {
    const el = mount<any>('<mo-subscribe></mo-subscribe>');
    const subs = events(el, 'subscribe');
    const form = el.querySelector('form') as HTMLFormElement;
    const input = el.querySelector('input[type="email"]') as HTMLInputElement;
    input.value = 'nope';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(el.state).toBe('error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('[role="status"]')?.textContent).toBe('Enter a valid email address');
    expect(subs).toHaveLength(0);
    input.value = 'me@example.com';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(subs).toEqual([{ email: 'me@example.com' }]);
    expect(el.state).toBe('done');
    expect((el.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('subscribe waits for the page when the event is cancelled', () => {
    const el = mount<any>('<mo-subscribe></mo-subscribe>');
    const errors = events(el, 'error');
    el.addEventListener('usa:subscribe', (e: Event) => e.preventDefault());
    (el.querySelector('input') as HTMLInputElement).value = 'me@example.com';
    el.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(el.state).toBe('sending');
    el.error('Server busy');
    expect(el.state).toBe('error');
    expect(errors).toEqual([{ message: 'Server busy' }]);
    el.reset();
    expect(el.state).toBe('idle');
  });

  it('download button follows progress set by the page and ends done', () => {
    const el = mount<any>('<mo-download-button></mo-download-button>');
    const starts = events(el, 'start');
    const dones = events(el, 'done');
    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toBe('Download');
    btn.click();
    expect(starts).toHaveLength(1);
    expect(el.state).toBe('busy');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    el.progress = 42;
    expect(btn.textContent).toBe('42%');
    expect(el.querySelector('[role="status"]')?.textContent).toBe('40%');
    el.progress = 100;
    expect(el.state).toBe('done');
    expect(dones).toHaveLength(1);
    expect(btn.textContent).toBe('Downloaded');
    const once = mount<any>('<mo-download-button once duration="500"></mo-download-button>');
    (once.querySelector('button') as HTMLButtonElement).click();
    expect(once.state).toBe('done');
    (once.querySelector('button') as HTMLButtonElement).click();
    expect(once.state).toBe('done');
  });

  it('reveal footer wraps its content in a footer and divider and cue are decorative / real buttons', () => {
    const foot = mount<any>('<mo-reveal-footer><a href="#">Top</a></mo-reveal-footer>');
    expect(foot.querySelector('footer a')?.textContent).toBe('Top');
    expect(foot.progress).toBe(1);
    expect(mount<any>('<mo-reveal-footer landmark="false"><p>x</p></mo-reveal-footer>').querySelector('footer')).toBeNull();
    const div = mount<any>('<mo-shape-divider shape="steps" layers="3"></mo-shape-divider>');
    expect(div.querySelector('[aria-hidden="true"] svg')).toBeTruthy();
    expect(div.querySelectorAll('path')).toHaveLength(1);
    expect(mount<any>('<mo-shape-divider layers="3"></mo-shape-divider>').querySelectorAll('path')).toHaveLength(3);
    const cue = mount<any>('<mo-scroll-cue kind="chevron" text="Scroll"></mo-scroll-cue>');
    const btn = cue.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Scroll down');
    expect(btn.querySelectorAll('.usa-cue-chevron i')).toHaveLength(2);
    expect(cue.away).toBe(false);
  });
});

describe('interface parts', () => {
  it('virtual list renders only a window of rows and says where each sits', () => {
    const el = mount<any>('<mo-virtual-list label="Items" row-height="40"></mo-virtual-list>');
    el.items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
    const rows = el.querySelectorAll('[role="list"] > li');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(40);
    expect(rows[0].getAttribute('aria-setsize')).toBe('10000');
    expect(rows[0].getAttribute('aria-posinset')).toBe('1');
    expect(rows[0].textContent).toBe('Item 1');
    expect(el.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Items');
    el.render = (item: any, i: number) => `#${i}: ${item}`;
    expect(el.querySelector('[role="list"] > li')?.textContent).toBe('#0: Item 1');
    const fromLis = mount<any>('<mo-virtual-list><ul><li>A</li><li>B</li></ul></mo-virtual-list>');
    expect(fromLis.items).toEqual(['A', 'B']);
    expect(fromLis.querySelector('ul:not(.usa-vlist-rows)')?.hidden).toBe(true);
  });

  it('infinite scroll asks for the next page from its button and stops at the end', () => {
    const el = mount<any>('<mo-infinite-scroll auto="false"><ul><li>1</li><li>2</li></ul></mo-infinite-scroll>');
    const loads = events(el, 'load');
    const ends = events(el, 'end');
    const more = el.querySelector('.usa-inf-more') as HTMLButtonElement;
    more.click();
    expect(loads).toEqual([{ page: 2 }]);
    expect(el.loading).toBe(true);
    expect(el.getAttribute('aria-busy')).toBe('true');
    more.click();
    expect(loads).toHaveLength(1);
    el.querySelector('ul').insertAdjacentHTML('beforeend', '<li>3</li><li>4</li>');
    el.done();
    expect(el.page).toBe(2);
    expect(el.loading).toBe(false);
    expect(el.querySelector('[role="status"]')?.textContent).toBe('2 more');
    more.click();
    el.end();
    expect(ends).toHaveLength(1);
    expect(more.disabled).toBe(true);
    expect(el.querySelector('.usa-inf-end')?.textContent).toBe('You have reached the end');
  });

  it('context menu opens from the keyboard, moves by arrows and reports the pick', () => {
    const el = mount<any>('<mo-context-menu><div>Area</div><menu><button type="button">Copy</button><hr><button type="button" aria-disabled="true">Paste</button><button type="button">Delete</button></menu></mo-context-menu>');
    const opens = events(el, 'open');
    const picks = events(el, 'select');
    const area = el.firstElementChild as HTMLElement;
    const menu = el.querySelector('menu') as HTMLElement;
    expect(area.getAttribute('aria-haspopup')).toBe('menu');
    expect(area.tabIndex).toBe(0);
    expect(menu.hidden).toBe(true);
    key(area, 'F10', { shiftKey: true });
    expect(el.open).toBe(true);
    expect(opens).toHaveLength(1);
    expect(menu.getAttribute('role')).toBe('menu');
    const items = menu.querySelectorAll('[role="menuitem"]');
    expect(items).toHaveLength(3);
    expect(menu.querySelector('hr')?.getAttribute('role')).toBe('separator');
    expect(document.activeElement).toBe(items[0]);
    key(menu, 'ArrowDown');
    expect(document.activeElement).toBe(items[2]);
    key(menu, 'Enter');
    expect(picks).toEqual([{ index: 2, label: 'Delete' }]);
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(area);
    area.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 50 }));
    expect(opens[1]).toEqual({ x: 40, y: 50 });
    key(menu, 'Escape');
    expect(el.open).toBe(false);
    el.remove();
    expect(menu.hasAttribute('role')).toBe(false);
    expect(area.hasAttribute('aria-haspopup')).toBe(false);
    expect(area.hasAttribute('tabindex')).toBe(false);
  });

  it('split pane moves by keys, folds with Enter and springs back on double click', () => {
    const el = mount<any>('<mo-split-pane position="40"><div>A</div><div>B</div></mo-split-pane>');
    const changes = events(el, 'change');
    const bar = el.querySelector('[role="separator"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-controls')).toBe(el.querySelector('.usa-split-pane')?.id);
    key(bar, 'ArrowRight');
    expect(el.position).toBe(45);
    key(bar, 'ArrowLeft', { shiftKey: true });
    expect(el.position).toBe(30);
    key(bar, 'Enter');
    expect(el.position).toBe(10);
    key(bar, 'Enter');
    expect(el.position).toBe(30);
    key(bar, 'End');
    expect(bar.getAttribute('aria-valuenow')).toBe('90');
    bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(el.position).toBe(40);
    expect(changes.map((c) => c.position)).toEqual([45, 30, 10, 30, 90, 40]);
  });

  it('desktop windows move by keys, close to the dock and open again', () => {
    const el = mount<any>('<mo-desktop-windows><div data-title="Notes">n</div><div data-title="Music">m</div></mo-desktop-windows>');
    const moves = events(el, 'move');
    const closes = events(el, 'close');
    const opens = events(el, 'open');
    const wins = el.querySelectorAll('.usa-win');
    const tasks = el.querySelectorAll('.usa-desk-task');
    expect(wins).toHaveLength(2);
    expect(wins[0].getAttribute('aria-labelledby')).toBe(wins[0].querySelector('h3')?.id);
    expect(tasks[0].getAttribute('aria-pressed')).toBe('true');
    const bar = wins[0].querySelector('.usa-win-bar') as HTMLElement;
    key(bar, 'ArrowRight');
    expect(moves).toEqual([{ index: 0, x: 34, y: 18 }]);
    key(bar, 'Escape');
    expect(closes).toEqual([{ index: 0 }]);
    expect((wins[0] as HTMLElement).hidden).toBe(true);
    expect(el.active).toBe(1);
    (tasks[0] as HTMLButtonElement).click();
    expect(opens).toEqual([{ index: 0 }]);
    expect((wins[0] as HTMLElement).hidden).toBe(false);
    expect(el.active).toBe(0);
  });

  it('stack slider keeps back cards inert and steps through the cards', () => {
    const el = mount<any>('<mo-stack-slider><div>1</div><div>2</div><div>3</div></mo-stack-slider>');
    const got = events(el, 'change');
    const cards = () => Array.from(el.querySelectorAll('.usa-stack-card')) as HTMLElement[];
    const [prev, next] = Array.from(el.querySelectorAll('.usa-stack-btn')) as HTMLButtonElement[];
    expect(cards().map((c) => c.inert)).toEqual([false, true, true]);
    expect(prev.disabled).toBe(true);
    expect(el.querySelector('.usa-stack-count')?.textContent).toBe('1 / 3');
    next.click();
    expect(got).toEqual([{ index: 1 }]);
    expect(cards().map((c) => c.inert)).toEqual([true, false, true]);
    key(el.querySelector('.usa-stack'), 'ArrowRight');
    expect(el.index).toBe(2);
    expect(next.disabled).toBe(true);
    el.next();
    expect(got).toHaveLength(2);
  });

  it('morph card opens its detail as a dialog and closes back', () => {
    const el = mount<any>('<mo-morph-card><div>Open me</div><div data-detail hidden><h3>Details</h3><p>More</p></div></mo-morph-card>');
    const opens = events(el, 'open');
    const closes = events(el, 'close');
    const trigger = el.querySelector('.usa-morph-open') as HTMLButtonElement;
    const dialog = el.querySelector('dialog') as HTMLDialogElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h3')?.id);
    trigger.click();
    expect(el.open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(opens).toHaveLength(1);
    (dialog.querySelector('.usa-morph-close') as HTMLButtonElement).click();
    expect(el.open).toBe(false);
    expect(closes).toHaveLength(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    el.remove();
    expect((el.lastElementChild as HTMLElement).hidden).toBe(true);
    expect(el.querySelector('h3')?.hasAttribute('id')).toBe(false);
  });
});

describe('motion and depth', () => {
  it('scroll zoom and image tunnel fall back to plain layouts under reduced motion', () => {
    const zoom = mount<any>('<mo-scroll-zoom><img alt="Coast" src="a.jpg"><h2>Caption</h2></mo-scroll-zoom>');
    expect(zoom.querySelector('.usa-szoom')?.hasAttribute('data-pinned')).toBe(false);
    expect(zoom.querySelector('.usa-szoom-caption h2')?.textContent).toBe('Caption');
    expect(zoom.progress).toBe(1);
    const tunnel = mount<any>('<mo-image-tunnel><img alt="1" src="a.jpg"><img alt="2" src="b.jpg"></mo-image-tunnel>');
    expect(tunnel.querySelector('.usa-tunnel')?.hasAttribute('data-pinned')).toBe(false);
    expect(tunnel.querySelectorAll('.usa-tunnel-item')).toHaveLength(2);
    expect(tunnel.querySelector('.usa-tunnel-item[inert]')).toBeNull();
  });

  it('scroll background sets the section colors and gives the target back', () => {
    const el = mount<any>('<mo-scroll-bg><section data-bg="#ffffff">One</section><section data-bg="#000000" data-fg="#ffffff">Two</section></mo-scroll-bg>');
    expect(el.classList.contains('usa-sbg')).toBe(true);
    expect(el.hasAttribute('data-sbg-static')).toBe(true);
    expect(el.index).toBe(1);
    expect(el.style.backgroundColor).not.toBe('');
    el.remove();
    expect(el.hasAttribute('class')).toBe(false);
    expect(el.hasAttribute('style')).toBe(false);
  });

  it('orbit gallery turns by arrow keys and selects the front picture', () => {
    const el = mount<any>('<mo-orbit-gallery><img alt="A" src="a.jpg"><img alt="B" src="b.jpg"><img alt="C" src="c.jpg"><img alt="D" src="d.jpg"></mo-orbit-gallery>');
    const changes = events(el, 'change');
    const picks = events(el, 'select');
    const items = Array.from(el.querySelectorAll('.usa-orbit-item')) as HTMLButtonElement[];
    expect(items.map((b) => b.getAttribute('aria-label'))).toEqual(['A', 'B', 'C', 'D']);
    expect(items.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1]);
    expect((el.querySelector('.usa-kit-pause') as HTMLElement).hidden).toBe(true);
    key(el.querySelector('.usa-orbit'), 'ArrowRight');
    expect(changes).toEqual([{ index: 1 }]);
    expect(items[1].tabIndex).toBe(0);
    items[1].click();
    expect(picks).toEqual([{ index: 1 }]);
  });

  it('clothesline, elastic frame and border beam keep their content and stand still', () => {
    const line = mount<any>('<mo-clothesline label="Photos"><figure>1</figure><figure>2</figure></mo-clothesline>');
    const swings = events(line, 'swing');
    expect(line.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Photos');
    expect(line.querySelectorAll('.usa-line-item figure')).toHaveLength(2);
    line.swing(0);
    expect(swings).toHaveLength(0);
    const frame = mount<any>('<mo-elastic-frame fill="nope;"><h3>Hi</h3></mo-elastic-frame>');
    expect(frame.querySelector('.usa-eframe h3')?.textContent).toBe('Hi');
    expect(frame.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    const beam = mount<any>('<mo-border-beam glow colors="red, url(x)"><strong>New</strong></mo-border-beam>');
    const box = beam.querySelector('.usa-beam') as HTMLElement;
    expect(box.hasAttribute('data-static')).toBe(true);
    expect(box.hasAttribute('data-glow')).toBe(true);
    expect(box.style.getPropertyValue('--c2')).toBe('');
    expect(beam.querySelector('strong')?.textContent).toBe('New');
  });
});
