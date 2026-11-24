import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, WIDGETS, rovingIndex, seeded, moveItem, numbers, shareUrl, SHARE_TARGETS, tagSize, heatLevel, donutArcs,
  dropIndex, lensOffset, ratingSummary, ringDash, meteorAt, orbitAngle, beamPath, rippleAt,
} from '../src/components/widgets';
import { components as parts } from '../showcase/catalog/parts.js';
import { installComponentMocks, intersect } from './components-setup';
import { readFileSync } from 'node:fs';

const UI = ['progress-tabs', 'code-tabs', 'helpful-vote', 'share-button', 'inline-edit', 'tag-cloud'];
const DATA = ['heatmap', 'donut-chart', 'sortable-list', 'zoom-lens', 'rating-bars', 'checklist'];
const MOTION = ['meteors', 'connect-beam', 'retro-grid', 'orbit-rings', 'letter-swap', 'ripple-grid'];
const TAGS = [...UI, ...DATA, ...MOTION];

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  defineWidgets('17.12');
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

describe('17.12 registration', () => {
  it('registers eighteen widgets under 17.12 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.12']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name), name).toBeTruthy();
      expect(customElements.get('usa-' + name), name).toBeTruthy();
    }
  });

  it('lists every new widget in the showcase catalog and on the demo page', () => {
    expect(parts.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of parts as any[]) expect(c.since).toBe('17.12');
    const lab = readFileSync('showcase/parts.html', 'utf8');
    for (const name of TAGS) expect(lab).toContain(`<mo-${name}`);
    expect(readFileSync('showcase/index.html', 'utf8')).toContain('./parts.html');
  });

  it('remounts every catalog example cleanly: same structure after detach and reattach', () => {
    for (const c of parts as any[]) {
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
    const el = mount<HTMLElement>('<mo-checklist><span>One</span><span>Two</span></mo-checklist>');
    expect(el.querySelectorAll('input[type="checkbox"]').length).toBe(2);
    el.remove();
    expect(Array.from(el.children).map((c) => c.textContent)).toEqual(['One', 'Two']);
    expect(el.querySelector('.usa-check')).toBeNull();
  });
});

describe('pure helpers', () => {
  it('rovingIndex wraps, jumps to the ends and ignores other keys', () => {
    expect(rovingIndex('ArrowRight', 2, 3)).toBe(0);
    expect(rovingIndex('ArrowLeft', 0, 3)).toBe(2);
    expect(rovingIndex('ArrowDown', 0, 3)).toBe(1);
    expect(rovingIndex('Home', 2, 3)).toBe(0);
    expect(rovingIndex('End', 0, 3)).toBe(2);
    expect(rovingIndex('ArrowRight', 0, 3, true)).toBe(2);
    expect(rovingIndex('a', 0, 3)).toBe(-1);
  });

  it('seeded is stable and in range; moveItem moves without mutating', () => {
    expect(seeded(4, 2)).toBe(seeded(4, 2));
    for (let i = 0; i < 50; i++) { const v = seeded(i, 3); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
    const list = ['a', 'b', 'c', 'd'];
    expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(list).toEqual(['a', 'b', 'c', 'd']);
  });

  it('numbers reads positive numbers and turns the rest into 0', () => {
    expect(numbers('1, 2.5, x, -3, 4')).toEqual([1, 2.5, 0, 0, 4]);
    expect(numbers('')).toEqual([]);
    expect(numbers('1,1,1,1', 2)).toHaveLength(2);
  });

  it('shareUrl builds share links only for http(s) pages', () => {
    expect(SHARE_TARGETS).toContain('copy');
    expect(shareUrl('x', 'https://a.dev/p', 'Hi there')).toBe('https://x.com/intent/post?url=https%3A%2F%2Fa.dev%2Fp&text=Hi%20there');
    expect(shareUrl('linkedin', 'https://a.dev/p')).toContain('linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fa.dev%2Fp');
    expect(shareUrl('email', 'https://a.dev/p', 'T')).toBe('mailto:?subject=T&body=https%3A%2F%2Fa.dev%2Fp');
    expect(shareUrl('copy', 'https://a.dev/p')).toBe('');
    expect(shareUrl('x', 'javascript:alert(1)')).toBe('');
  });

  it('tagSize, heatLevel and ringDash map values onto their scales', () => {
    expect(tagSize(1)).toBe(14);
    expect(tagSize(10)).toBe(40);
    expect(tagSize(99, 10, 20)).toBe(20);
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(1, 10)).toBe(1);
    expect(heatLevel(10, 10)).toBe(4);
    expect(heatLevel(5, 0)).toBe(0);
    const empty = ringDash(0, 4), full = ringDash(4, 4);
    expect(empty.offset).toBe(empty.length);
    expect(full.offset).toBe(0);
    expect(ringDash(2, 4).offset).toBeCloseTo(empty.length / 2, 2);
  });

  it('donutArcs splits the ring in order with small gaps', () => {
    const arcs = donutArcs([1, 1, 2]);
    expect(arcs[0].start).toBe(0);
    expect(arcs[1].start).toBeCloseTo(0.25);
    expect(arcs[2].start).toBeCloseTo(0.5);
    expect(arcs[2].length).toBeCloseTo(0.495);
    expect(donutArcs([5])).toEqual([{ start: 0, length: 1 }]);
    expect(donutArcs([0, 0])).toEqual([{ start: 0, length: 0 }, { start: 0, length: 0 }]);
  });

  it('dropIndex, lensOffset and ratingSummary', () => {
    expect(dropIndex(5, [10, 30, 50])).toBe(0);
    expect(dropIndex(35, [10, 30, 50])).toBe(2);
    expect(dropIndex(99, [10, 30, 50])).toBe(3);
    expect(lensOffset(50, 20, 100, 40, 2, 100)).toEqual({ x: -50, y: 10 });
    expect(lensOffset(-10, 99, 100, 40, 2, 100)).toEqual({ x: 50, y: -30 });
    expect(ratingSummary([3, 0, 0, 0, 1])).toEqual({ total: 4, average: 4 });
    expect(ratingSummary([0, 0, 0])).toEqual({ total: 0, average: 0 });
  });

  it('meteorAt, orbitAngle, beamPath and rippleAt are deterministic', () => {
    expect(meteorAt(3)).toEqual(meteorAt(3));
    const m = meteorAt(7);
    expect(m.duration).toBeGreaterThanOrEqual(2.2);
    expect(m.duration).toBeLessThanOrEqual(5.8);
    expect(orbitAngle(1, 4)).toBe(90);
    expect(orbitAngle(0, 4, 2)).toBe(45);
    expect(orbitAngle(0, 0)).toBe(0);
    expect(beamPath(0, 0, 100, 0, 0)).toBe('M0,0 Q50,0 100,0');
    expect(beamPath(0, 0, 100, 0, 0.2)).toBe('M0,0 Q50,20 100,0');
    expect(rippleAt(1000, 0)).toBe(0);
    expect(rippleAt(0, 99999)).toBe(0);
  });
});

describe('UI parts', () => {
  it('progress tabs follow the tab pattern and do not autoplay under reduced motion', () => {
    const el = mount<any>('<mo-progress-tabs interval="3000"><section data-tab="A">a</section><section data-tab="B">b</section><section data-tab="C">c</section></mo-progress-tabs>');
    const got = events(el, 'change');
    const tabs = el.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(el.querySelectorAll('[role="tabpanel"]:not([hidden])')).toHaveLength(1);
    expect(el.querySelector('.usa-ptabs-toggle')).toBeNull();
    expect(el.playing).toBe(false);
    key(tabs[0], 'ArrowRight');
    expect(got).toEqual([{ index: 1 }]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
    key(tabs[1], 'End');
    expect(el.index).toBe(2);
    (tabs[0] as HTMLElement).click();
    expect(el.index).toBe(0);
    expect(got.map((d) => d.index)).toEqual([1, 2, 0]);
  });

  it('code tabs switch together within a group and copy the visible block', async () => {
    const a = mount<any>('<mo-code-tabs group="pm"><pre data-tab="npm">npm i x</pre><pre data-tab="pnpm">pnpm add x</pre></mo-code-tabs>');
    const b = mount<any>('<mo-code-tabs group="pm"><pre data-tab="npm">npm run</pre><pre data-tab="pnpm">pnpm run</pre></mo-code-tabs>');
    const got = events(b, 'change');
    (a.querySelectorAll('[role="tab"]')[1] as HTMLElement).click();
    expect(a.index).toBe(1);
    expect(b.index).toBe(1);
    expect(got).toEqual([{ index: 1, label: 'pnpm' }]);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const copies = events(a, 'copy');
    expect(await a.copy()).toBe(true);
    expect(writeText).toHaveBeenCalledWith('pnpm add x');
    expect(copies).toEqual([{ index: 1 }]);
    expect(a.querySelector('.usa-ctabs-copy')!.hasAttribute('data-done')).toBe(true);
  });

  it('helpful vote reports the vote and, with ask-why, the text', () => {
    const el = mount<any>('<mo-helpful-vote ask-why></mo-helpful-vote>');
    const votes = events(el, 'vote');
    const notes = events(el, 'feedback');
    (el.querySelector('.usa-vote-no') as HTMLButtonElement).click();
    expect(votes).toEqual([{ vote: 'no' }]);
    expect((el.querySelector('.usa-vote-yes') as HTMLButtonElement).disabled).toBe(true);
    const form = el.querySelector('form') as HTMLFormElement;
    expect(form.hidden).toBe(false);
    (form.querySelector('textarea') as HTMLTextAreaElement).value = '  More examples  ';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(notes).toEqual([{ vote: 'no', text: 'More examples' }]);
    expect(el.querySelector('[role="status"]')!.textContent).toBe('Thanks for the feedback!');
    expect(el.vote).toBe('no');
  });

  it('share button opens a row of real links and closes with Escape', () => {
    const el = mount<any>('<mo-share-button url="https://a.dev/p" share-title="Post" targets="copy, x, email"></mo-share-button>');
    const main = el.querySelector('.usa-share-main') as HTMLButtonElement;
    const items = el.querySelectorAll('.usa-share-item');
    expect(items).toHaveLength(3);
    expect(items[0].tagName).toBe('BUTTON');
    expect((items[1] as HTMLAnchorElement).href).toContain('x.com/intent/post');
    expect((items[1] as HTMLAnchorElement).rel).toBe('noopener noreferrer');
    expect((items[2] as HTMLAnchorElement).href).toMatch(/^mailto:/);
    expect((items[1] as HTMLElement).tabIndex).toBe(-1);
    const opened = events(el, 'open');
    main.click();
    expect(el.open).toBe(true);
    expect(opened).toHaveLength(1);
    expect(main.getAttribute('aria-expanded')).toBe('true');
    expect((items[1] as HTMLElement).tabIndex).toBe(0);
    key(items[1], 'Escape');
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(main);
  });

  it('inline edit saves on Enter, cancels on Escape and refuses empty text', () => {
    const el = mount<any>('<mo-inline-edit label="Name">Draft</mo-inline-edit>');
    const changes = events(el, 'change');
    const cancels = events(el, 'cancel');
    const show = el.querySelector('.usa-iedit-show') as HTMLButtonElement;
    const field = el.querySelector('.usa-iedit-field') as HTMLInputElement;
    expect(show.textContent).toContain('Draft');
    show.click();
    expect(field.hidden).toBe(false);
    field.value = 'Final';
    key(field, 'Enter');
    expect(changes).toEqual([{ value: 'Final', previous: 'Draft' }]);
    expect(el.value).toBe('Final');
    el.edit();
    field.value = 'Other';
    key(field, 'Escape');
    expect(cancels).toHaveLength(1);
    expect(el.value).toBe('Final');
    el.edit();
    field.value = '   ';
    key(field, 'Enter');
    expect(el.value).toBe('Final');
    expect(changes).toHaveLength(1);
  });

  it('tag cloud sizes tags by weight and keeps them in reading order', () => {
    const el = mount<HTMLElement>('<mo-tag-cloud><a href="#a" data-weight="10">A</a><a href="#b" data-weight="1">B</a></mo-tag-cloud>');
    const items = el.querySelectorAll<HTMLElement>('.usa-tags-item');
    expect(items).toHaveLength(2);
    expect(items[0].style.getPropertyValue('--size')).toBe('40px');
    expect(items[1].style.getPropertyValue('--size')).toBe('14px');
    expect(Array.from(el.querySelectorAll('a')).map((a) => a.textContent)).toEqual(['A', 'B']);
  });
});

describe('data and interaction', () => {
  it('heatmap is a grid with one tab stop that moves by days and weeks', () => {
    const el = mount<HTMLElement>('<mo-heatmap values="0,1,2,3,4,5,6,7,8,9" unit="pushes"></mo-heatmap>');
    const got = events(el, 'select');
    const cells = el.querySelectorAll<HTMLElement>('[role="gridcell"]:not([aria-hidden])');
    expect(cells).toHaveLength(10);
    expect(el.querySelectorAll('[role="row"]')).toHaveLength(7);
    expect(el.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    const first = el.querySelector<HTMLElement>('[aria-label="#1: 0 pushes"]')!;
    expect(first.dataset.level).toBe('0');
    expect(el.querySelector<HTMLElement>('[aria-label="#10: 9 pushes"]')!.dataset.level).toBe('4');
    first.focus();
    key(first, 'ArrowRight');
    expect(document.activeElement!.getAttribute('aria-label')).toBe('#8: 7 pushes');
    key(document.activeElement!, 'ArrowUp');
    expect(document.activeElement!.getAttribute('aria-label')).toBe('#7: 6 pushes');
    key(document.activeElement!, 'Enter');
    expect(got).toEqual([{ index: 6, value: 6 }]);
  });

  it('donut chart lists every slice as a button and reports picks', () => {
    const el = mount<HTMLElement>('<mo-donut-chart values="3,1" labels="Yes,No"></mo-donut-chart>');
    const got = events(el, 'select');
    expect(el.querySelectorAll('.usa-donut-slice')).toHaveLength(2);
    const keys = el.querySelectorAll<HTMLButtonElement>('.usa-donut-key');
    expect(keys[0].textContent).toContain('Yes');
    expect(keys[0].textContent).toContain('75%');
    intersect(el);
    expect(el.querySelector('.usa-donut-big')!.textContent).toBe('4');
    keys[1].click();
    expect(got).toEqual([{ index: 1, value: 1 }]);
  });

  it('sortable list reorders by keyboard and puts an item back with Escape', () => {
    const el = mount<any>('<mo-sortable-list><ul><li>A</li><li>B</li><li>C</li></ul></mo-sortable-list>');
    const got = events(el, 'sort');
    const text = () => Array.from(el.querySelectorAll('li')).map((li: any) => li.textContent.trim());
    const grips = el.querySelectorAll('.usa-sort-grip');
    expect(grips).toHaveLength(3);
    key(grips[0], ' ');
    key(grips[0], 'ArrowDown');
    key(grips[0], 'ArrowDown');
    expect(text()).toEqual(['B', 'C', 'A']);
    key(grips[0], ' ');
    expect(got).toEqual([{ from: 0, to: 2 }]);
    expect(el.order).toEqual([1, 2, 0]);
    key(grips[1], 'Enter');
    key(grips[1], 'ArrowUp');
    expect(text()).toEqual(['B', 'C', 'A']);
    key(grips[2], 'Enter');
    key(grips[2], 'Home');
    expect(text()).toEqual(['C', 'B', 'A']);
    key(grips[2], 'Escape');
    expect(text()).toEqual(['B', 'C', 'A']);
    expect(got).toHaveLength(1);
  });

  it('zoom lens wraps the image, changes zoom by keys and gives the image back', () => {
    const el = mount<any>('<mo-zoom-lens><img src="https://example.com/p.jpg" alt="Shoe"></mo-zoom-lens>');
    const got = events(el, 'zoom');
    const root = el.querySelector('.usa-lens') as HTMLElement;
    expect(root.querySelector('img')).toBeTruthy();
    expect(root.tabIndex).toBe(0);
    expect(root.getAttribute('aria-label')).toBe('Zoom: Shoe');
    key(root, '+');
    expect(got).toEqual([{ zoom: 3 }]);
    expect(el.zoom).toBe(3);
    el.remove();
    expect(el.firstElementChild!.tagName).toBe('IMG');
  });

  it('rating bars summarise the counts and filter by star level', () => {
    const el = mount<any>('<mo-rating-bars values="3,0,0,0,1"></mo-rating-bars>');
    const got = events(el, 'select');
    expect(el.average).toBe(4);
    const rows = el.querySelectorAll('.usa-rate-row');
    expect(rows).toHaveLength(5);
    expect(rows[0].getAttribute('aria-label')).toBe('5 stars: 3 reviews, 75%');
    intersect(el);
    expect(el.querySelector('.usa-rate-score')!.textContent).toBe('4');
    (rows[4] as HTMLButtonElement).click();
    expect(got).toEqual([{ stars: 1 }]);
  });

  it('checklist counts ticks and fires complete once', () => {
    const el = mount<any>('<mo-checklist done-label="Done!"><span>One</span><span>Two</span></mo-checklist>');
    const changes = events(el, 'change');
    const complete = events(el, 'complete');
    const boxes = el.querySelectorAll('input[type="checkbox"]');
    (boxes[0] as HTMLInputElement).click();
    expect(changes).toEqual([{ index: 0, checked: true, done: 1, total: 2 }]);
    expect(el.querySelector('.usa-check-count')!.textContent).toBe('1 / 2');
    (boxes[1] as HTMLInputElement).click();
    expect(complete).toHaveLength(1);
    expect(el.querySelector('.usa-check-title')!.textContent).toBe('Done!');
    (boxes[1] as HTMLInputElement).click();
    (boxes[1] as HTMLInputElement).click();
    expect(complete).toHaveLength(2);
    expect(el.done).toBe(2);
  });
});

describe('motion', () => {
  it('meteors, retro grid and orbit rings keep their content and stand still under reduced motion', () => {
    const m = mount<HTMLElement>('<mo-meteors count="5"><h3>Sky</h3></mo-meteors>');
    expect(m.querySelectorAll('.usa-meteor')).toHaveLength(0);
    expect(m.querySelector('.usa-meteors-body h3')!.textContent).toBe('Sky');
    expect(m.querySelector('.usa-meteors')!.hasAttribute('data-static')).toBe(true);
    const r = mount<HTMLElement>('<mo-retro-grid sun><h3>1986</h3></mo-retro-grid>');
    expect(r.querySelector('.usa-retro-sun')).toBeTruthy();
    expect(r.querySelector('.usa-retro-scene')!.getAttribute('aria-hidden')).toBe('true');
    const o = mount<HTMLElement>('<mo-orbit-rings label="Stack"><b data-center>Core</b><i>a</i><i>b</i><i data-ring="2">c</i></mo-orbit-rings>');
    expect(o.querySelectorAll('.usa-rings-orbit')).toHaveLength(2);
    expect(o.querySelector('.usa-rings-center b')!.textContent).toBe('Core');
    expect(o.querySelector('.usa-rings')!.getAttribute('aria-label')).toBe('Stack');
  });

  it('letter swap leaves the text alone under reduced motion', () => {
    const el = mount<HTMLElement>('<mo-letter-swap><a href="#">Go</a></mo-letter-swap>');
    expect(el.querySelector('.usa-swap')).toBeNull();
    expect(el.querySelector('a')!.textContent).toBe('Go');
  });

  it('connect beam draws a line per link it can resolve and keeps the nodes', () => {
    const el = mount<HTMLElement>('<mo-connect-beam links="a>b, b>missing"><div><b data-node="a">A</b><b data-node="b">B</b></div></mo-connect-beam>');
    const svg = el.querySelector('svg.usa-beams')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('.usa-beam-line')).toHaveLength(1);
    expect(el.querySelectorAll('[data-node]')).toHaveLength(2);
    el.remove();
    expect(el.querySelector('svg.usa-beams')).toBeNull();
  });

  it('ripple grid takes Enter as a ripple at the centre', () => {
    const el = mount<any>('<mo-ripple-grid label="Ripples"><p>Hi</p></mo-ripple-grid>');
    const got = events(el, 'ripple');
    const root = el.querySelector('.usa-ripple') as HTMLElement;
    expect(root.tabIndex).toBe(0);
    expect(root.querySelector('.usa-ripple-body p')!.textContent).toBe('Hi');
    key(root, 'Enter');
    expect(got).toHaveLength(1);
    expect(Object.keys(got[0]).sort()).toEqual(['x', 'y']);
  });
});

describe('home page collections', () => {
  const html = readFileSync('showcase/index.html', 'utf8');
  const js = readFileSync('showcase/home-collections.js', 'utf8');

  it('puts the release pages on the home page as tabs and keeps every page as a deep link', async () => {
    expect(html).toContain('id="collections"');
    expect(html).toContain('<script type="module" src="./home-collections.js"></script>');
    for (const page of ['parts', 'blocks', 'looks', 'kit', 'moments', 'instruments', 'forms', 'matter', 'activity', 'luminous', 'styles'])
      expect(html, page).toContain(`href="./${page}.html"`);
    expect(html).not.toContain('position:fixed');
    const { COLLECTIONS } = await import('../showcase/home-collections.js');
    expect(COLLECTIONS.map((c: any) => c.id)).toEqual(['parts', 'blocks', 'looks', 'kit', 'moments', 'forms', 'matter', 'activity', 'luminous']);
    for (const c of COLLECTIONS as any[]) {
      expect(html, c.page).toContain(`href="${c.page}"`);
      expect(c.title.en && c.title.zh, c.id).toBeTruthy();
      if (c.id !== 'looks') expect(c.items.length, c.id).toBeGreaterThanOrEqual(6);
      for (const item of c.items) expect(item.define, item.id).toMatch(/^define[A-Z]/);
    }
  });

  it('loads widgets only when the section is near, from dist with a CDN fallback', () => {
    expect(js).toContain("new URL('../dist/', import.meta.url)");
    expect(js).toContain('https://unpkg.com/motionary@17/dist/');
    expect(js).toContain('IntersectionObserver');
    expect(js).toContain("rootMargin: '400px 0px'");
    expect(js).toContain('shortcut="none"');
  });
});
