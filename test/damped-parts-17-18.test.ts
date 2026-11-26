import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { parseSnaps, sheetRest, pageAfter, dampedAt, pilePose, linesHeight } from '../src/components/widgets/damped-kit-18';
import { components as cat } from '../showcase/catalog/damped.js';
import { COLLECTIONS } from '../showcase/home-collections.js';
import { RELEASE_COMPONENTS } from '../showcase/catalog-components.js';
import { installComponentMocks } from './components-setup';

const TAGS = ['spring-collapse', 'read-more', 'spring-sheet', 'spring-pager', 'elastic-scroll', 'spring-stack'];

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
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const read = (f: string) => readFileSync(f, 'utf8');

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('17.18 damped helpers', () => {
  it('parseSnaps reads fractions and percentages, sorted and deduplicated, with a fallback', () => {
    expect(parseSnaps('0.9, 0.4')).toEqual([0.4, 0.9]);
    expect(parseSnaps('40% 90% 40%')).toEqual([0.4, 0.9]);
    expect(parseSnaps('2, 0.5')).toEqual([0.5, 1]);
    expect(parseSnaps('')).toEqual([0.5, 1]);
    expect(parseSnaps('nope, -1')).toEqual([0.5, 1]);
    expect(parseSnaps(null)).toEqual([0.5, 1]);
  });

  it('sheetRest lands on the snap the release is carried to, or closes on a downward flick', () => {
    const snaps = [0.45, 0.9];
    expect(sheetRest(0.5, 0, snaps)).toBe(0);
    expect(sheetRest(0.8, 0, snaps)).toBe(1);
    // a flick up from the low snap carries it to the high one
    expect(sheetRest(0.5, 2.5, snaps)).toBe(1);
    // a flick down from the low snap closes it
    expect(sheetRest(0.4, -2, snaps)).toBe(-1);
    // unless it may not close
    expect(sheetRest(0.4, -2, snaps, false)).toBe(0);
    expect(sheetRest(0.1, 0, [])).toBe(-1);
  });

  it('pageAfter turns at most one page per release and stays in range', () => {
    expect(pageAfter(0, 0, 300, 4, 0)).toBe(0);
    expect(pageAfter(160, 0, 300, 4, 0)).toBe(1);
    expect(pageAfter(60, 1200, 300, 4, 0)).toBe(1);
    expect(pageAfter(60, 99999, 300, 4, 0)).toBe(1);
    expect(pageAfter(560, -1500, 300, 4, 2)).toBe(1);
    expect(pageAfter(-80, -900, 300, 4, 0)).toBe(0);
    expect(pageAfter(950, 900, 300, 4, 3)).toBe(3);
    expect(pageAfter(100, 0, 0, 4, 2)).toBe(2);
  });

  it('dampedAt follows inside the range and resists past its ends', () => {
    expect(dampedAt(50, 0, 100, 100)).toBe(50);
    const past = dampedAt(160, 0, 100, 100);
    expect(past).toBeGreaterThan(100);
    expect(past).toBeLessThan(160);
    const further = dampedAt(400, 0, 100, 100);
    expect(further - 100).toBeLessThan(100);
    expect(further).toBeGreaterThan(past);
    expect(dampedAt(-60, 0, 100, 100)).toBeLessThan(0);
    expect(dampedAt(-60, 0, 100, 100)).toBeGreaterThan(-60);
  });

  it('pilePose tucks cards behind the first when closed and lays them out when open', () => {
    const h = [60, 80, 40, 50, 50];
    expect(pilePose(0, h, 0)).toEqual({ y: 0, scale: 1, opacity: 1 });
    expect(pilePose(1, h, 0, 10)).toEqual({ y: 10, scale: 0.95, opacity: 0.82 });
    expect(pilePose(4, h, 0, 10).opacity).toBe(0);
    expect(pilePose(2, h, 1, 10, 10)).toEqual({ y: 160, scale: 1, opacity: 1 });
    const mid = pilePose(2, h, 0.5, 10, 10);
    expect(mid.y).toBeGreaterThan(20);
    expect(mid.y).toBeLessThan(160);
  });

  it('linesHeight is lines × line height, at least one line', () => {
    expect(linesHeight(3, 24)).toBe(72);
    expect(linesHeight(0, 24)).toBe(24);
    expect(linesHeight(NaN, 20)).toBe(60);
  });
});

describe('17.18 damped parts', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.16');
    defineWidgets('17.18');
  });

  it('registers six widgets under 17.18 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.18']).sort()).toEqual(TAGS.map((t) => `usa-${t}`).sort());
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every part in the catalog, the Store, the demo page, the home tab, the docs and the READMEs', () => {
    expect(cat.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of cat as any[]) expect(c.since).toBe('17.18');
    const store = new Set((RELEASE_COMPONENTS as any[]).map((c) => c.id));
    for (const name of TAGS) expect(store.has(name), name).toBe(true);
    const page = read('showcase/damped.html');
    for (const name of TAGS) expect(page).toContain(`<mo-${name}`);
    expect(page).toContain("defineWidgets('17.18')");
    expect(page).toContain('<script type="module" src="./code-drawer.js" data-auto></script>');
    expect(read('showcase/index.html')).toContain('./damped.html');
    const tab = (COLLECTIONS as any[])[0];
    expect(tab.id).toBe('damped');
    expect(tab.page).toBe('./damped.html');
    expect(tab.items.length).toBeGreaterThanOrEqual(6);
    const doc = read('docs/damped-motion-17-18.md');
    for (const name of TAGS) expect(doc).toContain(`mo-${name}`);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('showcase/damped.html');
    expect(read('CHANGELOG.md')).toContain('17.18 damped parts');
    expect(read('skills/motionary/SKILL.md')).toContain('mo-spring-sheet');
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

  it('spring-collapse opens and closes from its button and the property', () => {
    const el = mount<any>('<mo-spring-collapse label="More"><p>Body</p></mo-spring-collapse>');
    const got = events(el, 'toggle');
    const head = el.querySelector('button')!;
    const panel = el.querySelector('.usa-dcol-panel') as HTMLElement;
    expect(head.textContent).toBe('More');
    expect(head.getAttribute('aria-expanded')).toBe('false');
    expect(head.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.hidden).toBe(true);
    head.click();
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(el.open).toBe(true);
    el.open = false;
    expect(panel.hidden).toBe(true);
    expect(got).toEqual([{ open: true }, { open: false }]);
    const off = mount<any>('<mo-spring-collapse disabled><p>x</p></mo-spring-collapse>');
    off.querySelector('button')!.click();
    expect(off.open).toBe(false);
    expect(mount<any>('<mo-spring-collapse open><p>x</p></mo-spring-collapse>').querySelector('.usa-dcol-panel')!.hidden).toBe(false);
  });

  it('read-more shows a button only when the text is longer than the clamp', () => {
    const short = mount<any>('<mo-read-more lines="3"><p>Short</p></mo-read-more>');
    expect(short.clamped).toBe(false);
    expect(short.querySelector('button')!.hidden).toBe(true);

    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400);
    const el = mount<any>('<mo-read-more lines="2" more="More" less="Less"><p>Long text</p></mo-read-more>');
    const got = events(el, 'toggle');
    const btn = el.querySelector('button')!;
    const clip = el.querySelector('.usa-rmore-clip') as HTMLElement;
    expect(el.clamped).toBe(true);
    expect(btn.hidden).toBe(false);
    expect(btn.textContent).toBe('More');
    expect(btn.getAttribute('aria-controls')).toBe(clip.id);
    expect(parseFloat(clip.style.height)).toBeGreaterThan(0);
    btn.click();
    expect(btn.textContent).toBe('Less');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(clip.style.height).toBe('');
    el.open = false;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(got).toEqual([{ open: true }, { open: false }]);
  });

  it('spring-sheet opens from its trigger, steps through snaps and closes with Escape', () => {
    const el = mount<any>('<mo-spring-sheet snaps="0.4, 0.9" trigger="Filters" label="Filter sheet"><p>Page</p><div data-sheet><p>Inside</p></div></mo-spring-sheet>');
    const got = events(el, 'snap');
    const trigger = el.querySelector('.usa-dsheet-trigger') as HTMLButtonElement;
    const sheet = el.querySelector('[role="dialog"]') as HTMLElement;
    const grab = el.querySelector('.usa-dsheet-grab') as HTMLButtonElement;
    expect(trigger.textContent).toBe('Filters');
    expect(sheet.getAttribute('aria-label')).toBe('Filter sheet');
    expect(sheet.textContent).toContain('Inside');
    expect(el.querySelector('.usa-dsheet-page')!.textContent).toContain('Page');
    expect(el.snap).toBe(-1);
    expect(sheet.hasAttribute('inert')).toBe(true);
    trigger.click();
    expect(el.snap).toBe(0);
    expect(sheet.hasAttribute('inert')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(grab);
    grab.click();
    expect(el.snap).toBe(1);
    key(grab, 'ArrowDown');
    expect(el.snap).toBe(0);
    key(grab, 'Escape');
    expect(el.snap).toBe(-1);
    expect(document.activeElement).toBe(trigger);
    expect(got).toEqual([{ index: 0 }, { index: 1 }, { index: 0 }, { index: -1 }]);
    el.show(1);
    expect(el.snap).toBe(1);
    el.close();
    expect(el.snap).toBe(-1);
    expect(mount<any>('<mo-spring-sheet open="1"><div data-sheet>x</div></mo-spring-sheet>').snap).toBe(1);
  });

  it('spring-pager turns pages by buttons, dots and keys, and keeps hidden pages inert', () => {
    const el = mount<any>('<mo-spring-pager label="Tips"><div>A</div><div>B</div><div>C</div></mo-spring-pager>');
    const got = events(el, 'change');
    const region = el.querySelector('[role="region"]')!;
    const pages = [...el.querySelectorAll('.usa-dpager-page')];
    const [prev, next] = [...el.querySelectorAll('.usa-dpager-arrow')] as HTMLButtonElement[];
    expect(region.getAttribute('aria-label')).toBe('Tips');
    expect(el.count).toBe(3);
    expect(prev.disabled).toBe(true);
    expect(pages.map((p) => p.hasAttribute('inert'))).toEqual([false, true, true]);
    next.click();
    expect(el.index).toBe(1);
    (el.querySelectorAll('.usa-dpager-dot')[2] as HTMLElement).click();
    expect(el.index).toBe(2);
    expect(next.disabled).toBe(true);
    expect(el.querySelectorAll('.usa-dpager-dot')[2].getAttribute('aria-current')).toBe('true');
    key(region, 'Home');
    expect(el.index).toBe(0);
    key(region, 'ArrowRight');
    expect(el.index).toBe(1);
    key(region, 'End');
    expect(pages.map((p) => p.hasAttribute('inert'))).toEqual([true, true, false]);
    expect(got.map((d) => d.index)).toEqual([1, 2, 0, 1, 2]);
    el.index = 9;
    expect(el.index).toBe(2);
    expect(mount<any>('<mo-spring-pager index="1"><div>A</div><div>B</div></mo-spring-pager>').index).toBe(1);
  });

  it('elastic-scroll keeps native scrolling, is a labelled region and reports a pull past an end', () => {
    const el = mount<any>('<mo-elastic-scroll height="200px" label="Feed"><p>1</p><p>2</p></mo-elastic-scroll>');
    const got = events(el, 'edge');
    const box = el.scroller as HTMLElement;
    expect(box.getAttribute('role')).toBe('region');
    expect(box.getAttribute('aria-label')).toBe('Feed');
    expect(box.tabIndex).toBe(0);
    expect(box.style.height).toBe('200px');
    expect(box.textContent).toContain('2');
    box.dispatchEvent(new WheelEvent('wheel', { deltaY: -40, bubbles: true }));
    expect(got).toEqual([]);
    box.dispatchEvent(new WheelEvent('wheel', { deltaY: -300, bubbles: true }));
    expect(got).toEqual([{ edge: 'top' }]);
  });

  it('spring-stack opens into a list from its button or a click on the pile and closes with Escape', () => {
    const el = mount<any>('<mo-spring-stack more="All" less="Fewer"><div>One</div><div>Two</div><div>Three</div></mo-spring-stack>');
    const got = events(el, 'toggle');
    const btn = el.querySelector('.usa-dstack-toggle') as HTMLButtonElement;
    const cards = [...el.querySelectorAll('[role="listitem"]')];
    expect(cards).toHaveLength(3);
    expect(btn.textContent).toBe('All (3)');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(cards.map((c) => c.hasAttribute('inert'))).toEqual([false, true, true]);
    btn.click();
    expect(el.open).toBe(true);
    expect(btn.textContent).toBe('Fewer');
    expect(cards.map((c) => c.hasAttribute('inert'))).toEqual([false, false, false]);
    key(cards[1], 'Escape');
    expect(el.open).toBe(false);
    (cards[0] as HTMLElement).click();
    expect(el.open).toBe(true);
    expect(got).toEqual([{ open: true }, { open: false }, { open: true }]);
    expect(mount<any>('<mo-spring-stack><div>Only</div></mo-spring-stack>').querySelector('button')!.hidden).toBe(true);
  });
});
