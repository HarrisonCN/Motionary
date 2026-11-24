import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, WIDGETS, safeImageUrl, sortKey, compareKeys, fanPose, jsonPath, velocityAmount, trackOffset, cleanPathData, stripClips, EMPTY_ICONS,
} from '../src/components/widgets';
import { formatNumber, list, dataNum } from '../src/components/widgets/kit';
import { components as kit } from '../showcase/catalog/kit.js';
import { installComponentMocks, finishAll } from './components-setup';
import { readFileSync } from 'node:fs';

const UI = ['sidebar', 'scrollspy', 'pricing', 'announcement-bar', 'sticky-cta', 'bento', 'empty-state'];
const PARTS = ['lightbox', 'data-table', 'filter-chips', 'hotspots', 'fan-carousel', 'expand-cards', 'json-viewer'];
const MOTION = ['scroll-velocity', 'horizontal-scroll', 'image-trail', 'hover-reveal-list', 'liquid-glass', 'path-motion', 'cut-reveal'];
const TAGS = [...UI, ...PARTS, ...MOTION];

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  defineWidgets('17.10');
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

describe('17.10 registration', () => {
  it('registers twenty-one widgets under 17.10 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.10']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every new widget in the showcase catalog and on the demo page', () => {
    expect(kit.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of kit as any[]) expect(c.since).toBe('17.10');
    const lab = readFileSync('showcase/kit.html', 'utf8');
    for (const name of TAGS) expect(lab).toContain(`<mo-${name}`);
  });

  it('remounts every catalog example cleanly: same structure after detach and reattach', () => {
    for (const c of kit as any[]) {
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
    const el = mount<HTMLElement>('<mo-sidebar><a href="#a">Alpha</a><a href="#b">Beta</a></mo-sidebar>');
    expect(el.querySelector('nav')).toBeTruthy();
    const host = el.parentElement!;
    el.remove();
    expect(el.children).toHaveLength(2);
    expect(Array.from(el.children).map((a) => a.textContent)).toEqual(['Alpha', 'Beta']);
    expect(el.querySelector('.usa-side-link')).toBeNull();
    host.append(el);
  });
});

describe('pure helpers', () => {
  it('safeImageUrl keeps http(s), data:image and relative paths only', () => {
    expect(safeImageUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(safeImageUrl('assets/a.jpg')).toBe('assets/a.jpg');
    expect(safeImageUrl('/a.jpg')).toBe('/a.jpg');
    expect(safeImageUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(safeImageUrl('javascript:alert(1)')).toBe('');
    expect(safeImageUrl('data:text/html,<b>x</b>')).toBe('');
  });
  it('sortKey reads numbers as numbers and compareKeys puts numbers first', () => {
    const td = (t: string, v?: string) => { const c = document.createElement('td'); c.textContent = t; if (v) c.dataset.value = v; return c; };
    expect(sortKey(td('1,234.5'))).toBe(1234.5);
    expect(sortKey(td('12%'))).toBe(12);
    expect(sortKey(td('Beta'))).toBe('beta');
    expect(sortKey(td('March', '3'))).toBe(3);
    expect(compareKeys(2, 10)).toBeLessThan(0);
    expect(compareKeys(5, 'a')).toBeLessThan(0);
    expect(compareKeys('item 2', 'item 10')).toBeLessThan(0);
  });
  it('fanPose is symmetric and clamps far cards', () => {
    const l = fanPose(-2, 9), r = fanPose(2, 9);
    expect(l.angle).toBe(-18);
    expect(r.angle).toBe(18);
    expect(l.y).toBe(r.y);
    expect(fanPose(0, 9)).toEqual({ angle: 0, x: 0, y: 0, scale: 1, z: 100 });
    expect(fanPose(9, 9).angle).toBe(36);
  });
  it('jsonPath writes dotted keys, quoted keys and indexes', () => {
    expect(jsonPath([])).toBe('$');
    expect(jsonPath(['a', 0, 'b c'])).toBe('$.a[0]["b c"]');
  });
  it('velocityAmount is signed, eased and bounded', () => {
    expect(velocityAmount(0)).toBe(0);
    expect(velocityAmount(40)).toBeCloseTo(Math.tanh(1));
    expect(velocityAmount(-4000)).toBeGreaterThanOrEqual(-1);
    expect(velocityAmount(-40)).toBeLessThan(0);
  });
  it('trackOffset clamps progress and ignores negative overflow', () => {
    expect(trackOffset(0.5, 1000)).toBe(-500);
    expect(trackOffset(2, 1000)).toBe(-1000);
    expect(trackOffset(0.5, -10)).toBe(-0);
  });
  it('cleanPathData keeps path data and drops anything else', () => {
    expect(cleanPathData('M0 0 L 10 10')).toBe('M0 0 L 10 10');
    expect(cleanPathData('M0 0" onload="x')).toBe('');
    expect(cleanPathData('L0 0')).toBe('');
  });
  it('stripClips cuts strips, halves and a shared tear', () => {
    expect(stripClips('slice', 4)).toHaveLength(4);
    expect(stripClips('slice', 2)[0]).toBe('inset(0.000% 0 50.000% 0)');
    expect(stripClips('shred', 2)[1]).toBe('inset(0 0.000% 0 50.000%)');
    expect(stripClips('split', 9)).toEqual(['inset(0 50% 0 0)', 'inset(0 0 0 50%)']);
    expect(stripClips('tear', 3)).toHaveLength(2);
  });
  it('small kit helpers', () => {
    expect(formatNumber(1234.5, 0, 'en-US')).toBe('1,235');
    expect(list(' a, ,b ,c', 2)).toEqual(['a', 'b']);
    const el = document.createElement('div');
    el.dataset.monthly = '12';
    el.dataset.bad = 'x';
    expect(dataNum(el, 'monthly', 0)).toBe(12);
    expect(dataNum(el, 'bad', 7)).toBe(7);
    expect(Object.keys(EMPTY_ICONS)).toEqual(expect.arrayContaining(['inbox', 'search', 'folder', 'cloud', 'bell', 'cart']));
  });
});

describe('UI blocks', () => {
  it('sidebar folds, keeps one current item and reports picks', () => {
    const el = mount<any>('<mo-sidebar label="Main"><a href="#a" data-icon="A">Alpha</a><a href="#b">Beta</a></mo-sidebar>');
    const toggles = events(el, 'toggle');
    const picks = events(el, 'select');
    const toggle = el.querySelector('.usa-side-toggle') as HTMLButtonElement;
    const links = el.querySelectorAll('a');
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(links[0].getAttribute('aria-current')).toBe('page');
    toggle.click();
    expect(el.collapsed).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggles).toEqual([{ collapsed: true }]);
    expect(links[1].title).toBe('Beta');
    (links[1] as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(links[1].getAttribute('aria-current')).toBe('page');
    expect(links[0].hasAttribute('aria-current')).toBe(false);
    expect(picks[0].index).toBe(1);
  });

  it('scrollspy builds links from headings in the target', () => {
    document.body.insertAdjacentHTML('beforeend', '<article id="doc"><h2 id="one">One</h2><h2>No id</h2><h2 id="two">Two <b>x</b></h2></article>');
    const el = mount<any>('<mo-scrollspy target="#doc" selector="h2[id]" label="Contents"></mo-scrollspy>');
    const links = Array.from(el.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#one', '#two']);
    expect(links[1].querySelector('b')).toBeNull();
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Contents');
  });

  it('pricing switches period, updates prices and reports picks', () => {
    const el = mount<any>('<mo-pricing currency="$"><div data-name="Pro" data-monthly="12" data-yearly="120" data-featured>Teams</div><div data-name="Free" data-monthly="0">Solo</div></mo-pricing>');
    const changes = events(el, 'change');
    const picks = events(el, 'select');
    const nums = () => Array.from(el.querySelectorAll('.usa-price-num')).map((n: any) => n.textContent);
    expect(nums()).toEqual(['12', '0']);
    expect(el.querySelector('.usa-price-badge')?.textContent).toBe('Popular');
    const yearly = el.querySelector('input[value="yearly"]') as HTMLInputElement;
    yearly.checked = true;
    yearly.dispatchEvent(new Event('change', { bubbles: true }));
    expect(changes).toEqual([{ period: 'yearly' }]);
    expect(el.period).toBe('yearly');
    expect(nums()).toEqual(['120', '0']);
    expect(el.querySelector('.usa-price-per')?.textContent).toBe('/yr');
    (el.querySelector('.usa-price-cta') as HTMLButtonElement).click();
    expect(picks).toEqual([{ plan: 'Pro', period: 'yearly', price: 120 }]);
  });

  it('announcement bar steps through messages and only offers a close button when dismissible', () => {
    const el = mount<any>('<mo-announcement-bar><span>One</span><span>Two</span></mo-announcement-bar>');
    const got = events(el, 'change');
    expect(el.querySelector('.usa-ann-close')).toBeNull();
    expect(el.querySelector('.usa-ann-pause')).toBeTruthy();
    el.next();
    expect(got).toEqual([{ index: 1 }]);
    const msgs = el.querySelectorAll('.usa-ann-msg');
    expect(msgs[0].hidden).toBe(true);
    expect(msgs[1].hidden).toBe(false);
    const closable = mount<any>('<mo-announcement-bar dismissible><span>Only</span></mo-announcement-bar>');
    const dismissed = events(closable, 'dismiss');
    expect(closable.querySelector('.usa-ann-pause')).toBeNull();
    (closable.querySelector('.usa-ann-close') as HTMLButtonElement).click();
    expect(closable.hidden).toBe(true);
    expect(dismissed).toHaveLength(1);
  });

  it('sticky call to action starts hidden and out of the tab order', () => {
    const el = mount<any>('<mo-sticky-cta offset="10000"><a href="#">Sign up</a></mo-sticky-cta>');
    const bar = el.querySelector('.usa-cta-bar') as HTMLElement;
    expect(el.shown).toBe(false);
    expect(bar.inert).toBe(true);
    expect(bar.getAttribute('aria-hidden')).toBe('true');
  });

  it('empty state renders the heading level, the text and a decorative icon', () => {
    const el = mount<any>('<mo-empty-state icon="search" heading="Nothing found" description="Try other words." heading-level="4"><button>Reset</button></mo-empty-state>');
    expect(el.querySelector('h4')?.textContent).toBe('Nothing found');
    expect(el.textContent).toContain('Try other words.');
    expect(el.querySelector('svg')?.closest('[aria-hidden="true"]')).toBeTruthy();
    expect(el.querySelector('button')?.textContent).toBe('Reset');
  });
});

describe('components', () => {
  it('data table sorts numerically, marks the header and filters rows', () => {
    const el = mount<any>('<mo-data-table filterable><table><thead><tr><th>Name</th><th>Size</th></tr></thead><tbody><tr><td>b</td><td>10</td></tr><tr><td>a</td><td>9</td></tr><tr><td>c</td><td>100</td></tr></tbody></table></mo-data-table>');
    const sorts = events(el, 'sort');
    const names = () => Array.from(el.querySelectorAll('tbody tr')).map((r: any) => r.cells[0].textContent);
    const ths = el.querySelectorAll('th');
    (ths[1].querySelector('button') as HTMLButtonElement).click();
    expect(names()).toEqual(['a', 'b', 'c']);
    expect(ths[1].getAttribute('aria-sort')).toBe('ascending');
    expect(sorts).toEqual([{ column: 1, direction: 'ascending' }]);
    el.sort(1, 'descending');
    expect(names()).toEqual(['c', 'b', 'a']);
    el.sort(1, 'none');
    expect(names()).toEqual(['b', 'a', 'c']);
    expect(el.filter('c')).toBe(1);
    expect(el.querySelector('.usa-dt-status')?.textContent).toBe('1 of 3 rows');
    expect(el.querySelector('input[type="search"]')).toBeTruthy();
  });

  it('filter chips hide items that do not match and report the count', () => {
    const box = document.createElement('div');
    box.innerHTML = '<mo-filter-chips options="Red, Blue" multiple></mo-filter-chips><ul><li data-tags="red">1</li><li data-tags="blue">2</li><li data-tags="red blue">3</li></ul>';
    document.body.append(box);
    const el = box.firstElementChild as any;
    const got = events(el, 'change');
    const items = Array.from(box.querySelectorAll('li')) as HTMLLIElement[];
    const chips = Array.from(el.querySelectorAll('.usa-fchip')) as HTMLButtonElement[];
    expect(chips.map((c) => c.textContent)).toEqual(['All', 'Red', 'Blue']);
    chips[1].click();
    expect(chips[1].getAttribute('aria-pressed')).toBe('true');
    expect(items.map((i) => i.hidden)).toEqual([false, true, false]);
    expect(got).toEqual([{ value: ['red'], count: 2 }]);
    chips[0].click();
    expect(items.every((i) => !i.hidden)).toBe(true);
  });

  it('hotspots open one note at a time and close with Escape', () => {
    const el = mount<any>('<mo-hotspots><img alt="Desk" src="a.jpg"><div data-x="20" data-y="30" data-title="Lamp">Warm</div><div data-x="60" data-y="70" data-title="Book">Paper</div></mo-hotspots>');
    const opened = events(el, 'open');
    const closed = events(el, 'close');
    const dots = Array.from(el.querySelectorAll('.usa-hot-dot')) as HTMLButtonElement[];
    expect(dots).toHaveLength(2);
    dots[1].click();
    expect(dots[1].getAttribute('aria-expanded')).toBe('true');
    expect(dots[0].getAttribute('aria-expanded')).toBe('false');
    expect(opened).toEqual([{ index: 1 }]);
    dots[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dots[1].getAttribute('aria-expanded')).toBe('false');
    expect(closed).toHaveLength(1);
  });

  it('fan carousel starts on the middle card and keeps back cards out of reach', () => {
    const el = mount<any>('<mo-fan-carousel><div>1</div><div>2</div><div>3</div></mo-fan-carousel>');
    const got = events(el, 'change');
    const slots = () => Array.from(el.querySelectorAll('.usa-fan-card')) as HTMLElement[];
    expect(el.index).toBe(1);
    expect(slots().map((s) => s.inert)).toEqual([true, false, true]);
    el.next();
    expect(got).toEqual([{ index: 2 }]);
    expect(slots()[2].getAttribute('aria-hidden')).toBe('false');
    el.next();
    expect(got).toHaveLength(1);
  });

  it('expand cards reports the chosen panel', () => {
    const el = mount<any>('<mo-expand-cards trigger="click"><div data-title="A">a</div><div data-title="B">b</div></mo-expand-cards>');
    const got = events(el, 'change');
    const buttons = Array.from(el.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    buttons[1].click();
    expect(got).toEqual([{ index: 1 }]);
  });

  it('json viewer is a tree that sets text, never markup', () => {
    const el = mount<any>(`<mo-json-viewer json='{"a":1,"b":{"c":"<img src=x onerror=alert(1)>"}}' label="Data"></mo-json-viewer>`);
    const tree = el.querySelector('[role="tree"]');
    expect(tree?.getAttribute('aria-label')).toBe('Data');
    expect(el.querySelector('[role="treeitem"]')?.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.usa-json-tree img')).toBeNull();
    const bad = mount<any>(`<mo-json-viewer json="{oops"></mo-json-viewer>`);
    expect(bad.querySelector('.usa-json-error')?.textContent).toMatch(/^Invalid JSON/);
  });

  it('lightbox marks thumbnails as dialog triggers', () => {
    const el = mount<any>('<mo-lightbox><img src="a.jpg" alt="A"><img src="b.jpg" alt="B" data-full="javascript:alert(1)"></mo-lightbox>');
    const thumbs = el.querySelectorAll('.usa-lb-thumb');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0].getAttribute('aria-haspopup')).toBe('dialog');
    expect(thumbs[0].getAttribute('role')).toBe('button');
    expect(el.querySelector('dialog')).toBeTruthy();
  });
});

describe('motion surfaces', () => {
  it('cut reveal plays without pieces under reduced motion and reports the direction', async () => {
    const el = mount<any>('<mo-cut-reveal trigger="manual"><p id="keep">Hello</p></mo-cut-reveal>');
    const got = events(el, 'done');
    const played = el.play('in');
    await finishAll();
    await played;
    expect(got).toEqual([{ direction: 'in' }]);
    expect(el.querySelectorAll('.usa-cut-piece')).toHaveLength(0);
    expect(el.querySelectorAll('#keep')).toHaveLength(1);
  });

  it('path motion rests at the end under reduced motion', () => {
    const el = mount<any>('<mo-path-motion><span>•</span></mo-path-motion>');
    expect(el.progress).toBe(1);
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('image trail adds no pictures and keeps its content under reduced motion', () => {
    const el = mount<any>('<mo-image-trail><img src="a.jpg" alt=""><p>Text</p></mo-image-trail>');
    el.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 10, clientY: 10 }));
    expect(el.querySelectorAll('.usa-trail-img')).toHaveLength(0);
    expect(el.textContent).toContain('Text');
  });

  it('liquid glass keeps its content and stays still under reduced motion', () => {
    const el = mount<any>('<mo-liquid-glass pressable><strong>Glass</strong></mo-liquid-glass>');
    const pane = el.querySelector('.usa-glass') as HTMLElement;
    expect(pane.hasAttribute('data-static')).toBe(true);
    expect(pane.hasAttribute('data-pressable')).toBe(true);
    expect(el.querySelector('strong')?.textContent).toBe('Glass');
  });
});
