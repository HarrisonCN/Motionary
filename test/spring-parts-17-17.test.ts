import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import {
  burstPoints, compactCount, ratingAt, starFill, parseTags, addTags, codeChars, moveItem, slotAt, shiftFor, swipeOpen, stackLayout,
  counterText, alignDigits, openSet,
} from '../src/components/widgets/spring-kit-17';
import { components as cat } from '../showcase/catalog/springs.js';
import { COLLECTIONS } from '../showcase/home-collections.js';
import { installComponentMocks } from './components-setup';

const TAGS = ['spring-like', 'spring-rating', 'spring-copy', 'spring-tags', 'spring-code', 'spring-list', 'spring-swipe', 'spring-toasts', 'spring-accordion', 'spring-counter'];

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

describe('17.17 spring helpers', () => {
  it('burstPoints rings the centre, first dot straight up, clamped count', () => {
    const p = burstPoints(8, 20);
    expect(p).toHaveLength(8);
    expect(p[0]).toEqual({ x: 0, y: -20 });
    expect(Math.hypot(p[1].x, p[1].y)).toBeCloseTo(16.4, 0);
    expect(burstPoints(-3)).toEqual([]);
    expect(burstPoints(99)).toHaveLength(24);
    expect(burstPoints(NaN)).toEqual([]);
  });

  it('compactCount shortens big numbers without rounding up', () => {
    expect([0, 999, 1000, 1299, 12800, 999999, 1250000, -5].map(compactCount)).toEqual(['0', '999', '1k', '1.2k', '12k', '999k', '1.2M', '0']);
  });

  it('ratingAt maps a pointer to whole or half stars, starFill fills them', () => {
    expect(ratingAt(0, 100, 5)).toBe(1);
    expect(ratingAt(41, 100, 5)).toBe(3);
    expect(ratingAt(100, 100, 5)).toBe(5);
    expect(ratingAt(500, 100, 5)).toBe(5);
    expect(ratingAt(25, 100, 5, true)).toBe(1.5);
    expect(ratingAt(10, 0, 5)).toBe(1);
    expect([0, 1, 2, 3].map((i) => starFill(2.5, i))).toEqual([1, 1, 0.5, 0]);
  });

  it('parseTags and addTags split, trim and refuse duplicates and overflow', () => {
    expect(parseTags(' a, b ,,c\nd，e  f ')).toEqual(['a', 'b', 'c', 'd', 'e f']);
    const r = addTags(['Design'], 'motion, design, a11y', 3);
    expect(r.tags).toEqual(['Design', 'motion', 'a11y']);
    expect(r.added).toEqual(['motion', 'a11y']);
    expect(r.duplicate).toBe(0);
    expect(r.full).toBe(false);
    const full = addTags(['a', 'b'], 'c, d', 3);
    expect(full.tags).toEqual(['a', 'b', 'c']);
    expect(full.full).toBe(true);
    expect(addTags([], 'abcdefgh', Infinity, 3).tags).toEqual(['abc']);
  });

  it('codeChars keeps digits or upper-cased letters and digits, up to the length', () => {
    expect(codeChars('12-34 56 78', 'numeric', 6)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(codeChars('ab-9z', 'alphanumeric', 4)).toEqual(['A', 'B', '9', 'Z']);
    expect(codeChars('', 'numeric')).toEqual([]);
  });

  it('moveItem, slotAt and shiftFor describe a reorder', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c'], 2, -5)).toEqual(['c', 'a', 'b']);
    expect(moveItem([], 0, 1)).toEqual([]);
    const tops = [0, 50, 100, 150];
    const hs = [40, 40, 40, 40];
    expect(slotAt(-10, tops, hs)).toBe(0);
    expect(slotAt(75, tops, hs)).toBe(1);
    expect(slotAt(125, tops, hs)).toBe(2);
    expect(slotAt(999, tops, hs)).toBe(3);
    expect([0, 1, 2, 3].map((i) => shiftFor(i, 0, 2, 50))).toEqual([0, -50, -50, 0]);
    expect([0, 1, 2, 3].map((i) => shiftFor(i, 3, 1, 50))).toEqual([0, 50, 50, 0]);
  });

  it('swipeOpen goes by distance unless flicked', () => {
    expect(swipeOpen(70, 160)).toBe(false);
    expect(swipeOpen(80, 160)).toBe(true);
    expect(swipeOpen(20, 160, 900)).toBe(true);
    expect(swipeOpen(150, 160, -900)).toBe(false);
    expect(swipeOpen(10, 0)).toBe(false);
  });

  it('stackLayout piles collapsed toasts and spreads expanded ones', () => {
    expect(stackLayout(0, [50, 60], false)).toEqual({ y: 0, scale: 1, opacity: 1 });
    const second = stackLayout(1, [50, 60], false);
    expect(second.y).toBe(10);
    expect(second.scale).toBeCloseTo(0.95);
    expect(stackLayout(3, [], false).opacity).toBe(0);
    expect(stackLayout(2, [50, 60, 70], true, 8)).toEqual({ y: 126, scale: 1, opacity: 1 });
  });

  it('counterText formats and alignDigits lines up place values', () => {
    expect(counterText(1234567, 0, ',')).toBe('1,234,567');
    expect(counterText(3.14159, 2)).toBe('3.14');
    expect(counterText(-0.001, 1)).toBe('0.0');
    expect(counterText(-42)).toBe('-42');
    expect(counterText(NaN)).toBe('0');
    expect(alignDigits('99', '100')).toEqual([['', '1'], ['9', '0'], ['9', '0']]);
    expect(alignDigits('120', '8')).toEqual([['1', ''], ['2', ''], ['0', '8']]);
  });

  it('openSet reads indexes, ignores junk and keeps one unless multiple', () => {
    expect(openSet('2, 0, 9, x, 2', 3, true)).toEqual([2, 0]);
    expect(openSet('2, 0', 3)).toEqual([2]);
    expect(openSet('', 3)).toEqual([]);
  });
});

describe('17.17 spring parts', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.17');
  });

  it('registers ten widgets under 17.17 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.17']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every part in the catalog, the demo page, the home tab, the docs and the READMEs', () => {
    expect(cat.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of cat as any[]) expect(c.since).toBe('17.17');
    const page = read('showcase/springs.html');
    for (const name of TAGS) expect(page).toContain(`<mo-${name}`);
    expect(page).toContain("defineWidgets('17.17')");
    expect(read('showcase/index.html')).toContain('./springs.html');
    expect((COLLECTIONS as any[])[0].id).toBe('springs');
    expect((COLLECTIONS as any[])[0].items.length).toBeGreaterThanOrEqual(6);
    const doc = read('docs/spring-parts-17-17.md');
    for (const name of TAGS) expect(doc).toContain(`mo-${name}`);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('spring-parts-17-17.md');
    expect(read('CHANGELOG.md')).toContain('17.17 spring parts');
    expect(read('skills/motionary/SKILL.md')).toContain('mo-spring-toasts');
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

  it('spring-like toggles, counts and announces', () => {
    const el = mount<any>('<mo-spring-like count="9" label="Like"></mo-spring-like>');
    const got = events(el, 'change');
    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    btn.click();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.usa-slike-count')!.textContent).toBe('10');
    expect(got).toEqual([{ liked: true, count: 10 }]);
    expect(el.querySelector('[aria-live]')!.textContent).toContain('Liked');
    el.toggle(false);
    expect(el.liked).toBe(false);
    expect(el.count).toBe(9);
    const plain = mount<any>('<mo-spring-like liked></mo-spring-like>');
    expect(plain.querySelector('.usa-slike-count')).toBeNull();
    expect(plain.liked).toBe(true);
  });

  it('spring-rating works as a slider by keyboard and clears on a repeat click when clearable', () => {
    const el = mount<any>('<mo-spring-rating value="2" label="Rate"></mo-spring-rating>');
    const got = events(el, 'change');
    const root = el.querySelector('[role="slider"]')!;
    expect(root.getAttribute('aria-valuenow')).toBe('2');
    key(root, 'ArrowRight');
    expect(el.value).toBe(3);
    key(root, 'End');
    expect(el.value).toBe(5);
    key(root, 'ArrowRight');
    expect(el.value).toBe(5);
    key(root, 'Home');
    expect(el.value).toBe(0);
    expect(root.getAttribute('aria-valuetext')).toBe('No rating');
    expect(got.map((d) => d.value)).toEqual([3, 5, 0]);
    const half = mount<any>('<mo-spring-rating half value="2.6"></mo-spring-rating>');
    expect(half.value).toBe(2.5);
    const ro = mount<any>('<mo-spring-rating readonly value="4"></mo-spring-rating>');
    expect(ro.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Rating: 4 of 5');
  });

  it('spring-copy reports success and failure', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const el = mount<any>('<mo-spring-copy text="hello"></mo-spring-copy>');
    const got = events(el, 'copy');
    expect(await el.copy()).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(el.querySelector('button')!.dataset.state).toBe('ok');
    writeText.mockRejectedValueOnce(new Error('denied'));
    expect(await el.copy()).toBe(false);
    expect(got).toEqual([{ ok: true, text: 'hello' }, { ok: false, text: 'hello' }]);
    const src = document.createElement('input');
    src.id = 'copy-src';
    src.value = 'from input';
    document.body.append(src);
    const linked = mount<any>('<mo-spring-copy for="copy-src"></mo-spring-copy>');
    await linked.copy();
    expect(writeText).toHaveBeenLastCalledWith('from input');
  });

  it('spring-tags adds, refuses duplicates and removes with the keyboard', () => {
    const el = mount<any>('<mo-spring-tags value="one" max="3"></mo-spring-tags>');
    const changes = events(el, 'change');
    const rejects = events(el, 'reject');
    const input = el.querySelector('input')!;
    input.value = 'two, three';
    key(input, 'Enter');
    expect(el.tags).toEqual(['one', 'two', 'three']);
    expect(input.value).toBe('');
    input.value = 'ONE';
    key(input, 'Enter');
    expect(rejects[0]).toEqual({ text: 'ONE', reason: 'duplicate' });
    expect(input.value).toBe('ONE');
    input.value = '';
    el.removeTag(2);
    expect(el.tags).toEqual(['one', 'two']);
    key(input, 'Backspace');
    expect(el.tags).toHaveLength(2);
    key(input, 'Backspace');
    expect(el.tags).toEqual(['one']);
    el.querySelector<HTMLButtonElement>('.usa-stags-x')!.click();
    expect(el.tags).toEqual([]);
    expect(changes.at(-1)).toEqual({ tags: [], added: [], removed: ['one'] });
    expect(el.addTag('a, b, c, d')).toEqual(['a', 'b', 'c']);
    expect(rejects.at(-1).reason).toBe('full');
  });

  it('spring-code fills from typing and paste, completes and resets on reject', () => {
    const el = mount<any>('<mo-spring-code length="4"></mo-spring-code>');
    const done = events(el, 'complete');
    const boxes = el.querySelectorAll('input');
    expect(boxes).toHaveLength(4);
    expect(boxes[0].autocomplete).toBe('one-time-code');
    boxes[0].value = '7';
    boxes[0].dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).toBe('7');
    boxes[1].value = 'x';
    boxes[1].dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).toBe('7');
    boxes[1].value = '123';
    boxes[1].dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).toBe('7123');
    expect(done).toEqual([{ value: '7123' }]);
    el.reject();
    expect(el.value).toBe('');
    expect(el.querySelector('[role="group"]')!.getAttribute('data-state')).toBe('bad');
    el.value = '98';
    expect(el.value).toBe('98');
    el.accept();
    expect(el.querySelector('[role="group"]')!.getAttribute('data-state')).toBe('ok');
  });

  it('spring-list reorders with the keyboard and the API', () => {
    const el = mount<any>('<mo-spring-list><div>A</div><div>B</div><div>C</div></mo-spring-list>');
    const got = events(el, 'reorder');
    const names = () => [...el.querySelectorAll('.usa-slist-text')].map((n: any) => n.textContent);
    expect(names()).toEqual(['A', 'B', 'C']);
    const handleA = el.querySelector('.usa-slist-handle')!;
    key(handleA, ' ');
    expect(handleA.closest('li')!.hasAttribute('data-grabbed')).toBe(true);
    key(handleA, 'ArrowDown');
    key(handleA, 'ArrowDown');
    expect(names()).toEqual(['B', 'C', 'A']);
    key(handleA, 'Escape');
    expect(names()).toEqual(['A', 'B', 'C']);
    el.move(2, 0);
    expect(names()).toEqual(['C', 'A', 'B']);
    expect(el.order).toEqual([2, 0, 1]);
    expect(got.at(-1)).toEqual({ from: 2, to: 0, order: [2, 0, 1] });
    const listed = mount<any>('<mo-spring-list items="x|y"></mo-spring-list>');
    expect(listed.querySelectorAll('li')).toHaveLength(2);
  });

  it('spring-swipe opens from its button, runs an action and closes', () => {
    const el = mount<any>('<mo-spring-swipe actions="Keep:ok|Drop:danger">Row</mo-spring-swipe>');
    const acts = events(el, 'action');
    const toggles = events(el, 'toggle');
    const more = el.querySelector('.usa-sswipe-more')!;
    expect(more.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.usa-sswipe-actions')!.hasAttribute('inert')).toBe(true);
    (more as HTMLButtonElement).click();
    expect(el.open).toBe(true);
    expect(el.querySelector('.usa-sswipe-act[data-tone="danger"]')!.textContent).toBe('Drop');
    el.querySelectorAll<HTMLButtonElement>('.usa-sswipe-act')[1].click();
    expect(acts).toEqual([{ index: 1, label: 'Drop' }]);
    expect(el.open).toBe(false);
    expect(toggles).toEqual([{ open: true }, { open: false }]);
    el.open = true;
    key(el.querySelector('.usa-sswipe')!, 'Escape');
    expect(el.open).toBe(false);
  });

  it('spring-toasts shows, caps, times out and dismisses', () => {
    vi.useFakeTimers();
    const el = mount<any>('<mo-spring-toasts max="2" duration="1000"></mo-spring-toasts>');
    const shown = events(el, 'show');
    const gone = events(el, 'dismiss');
    const a = el.show('First');
    el.show('Saved', { tone: 'success', duration: 0 });
    expect(shown.map((d) => d.text)).toEqual(['First', 'Saved']);
    expect(el.querySelector('[aria-live="polite"]')!.textContent).toBe('Saved');
    el.show('Failed', { tone: 'error', duration: 0 });
    expect(el.querySelector('[aria-live="assertive"]')!.textContent).toBe('Failed');
    expect(gone).toEqual([{ id: a, reason: 'overflow' }]);
    el.querySelector<HTMLButtonElement>('.usa-stoasts-item .usa-stoasts-x')!.click();
    expect(gone.at(-1).reason).toBe('close');
    el.clear();
    expect(gone.at(-1).reason).toBe('clear');
    el.show('Bye');
    vi.advanceTimersByTime(1100);
    expect(gone.at(-1).reason).toBe('timeout');
  });

  it('spring-accordion opens one panel at a time unless multiple', () => {
    const el = mount<any>('<mo-spring-accordion open="1"><section data-title="A"><p>a</p></section><section><h3>B</h3><p>b</p></section><section data-title="C">c</section></mo-spring-accordion>');
    const got = events(el, 'toggle');
    const heads = el.querySelectorAll('.usa-sacc-head');
    expect([...heads].map((h: any) => h.textContent)).toEqual(['A', 'B', 'C']);
    expect(heads[1].getAttribute('aria-expanded')).toBe('true');
    (heads[0] as HTMLButtonElement).click();
    expect(el.openIndexes).toEqual([0]);
    expect(got).toEqual([{ index: 1, open: false }, { index: 0, open: true }]);
    key(heads[0], 'End');
    expect(document.activeElement).toBe(heads[2]);
    const multi = mount<any>('<mo-spring-accordion multiple open="0,2"><div data-title="x">1</div><div data-title="y">2</div><div data-title="z">3</div></mo-spring-accordion>');
    expect(multi.openIndexes).toEqual([0, 2]);
    multi.toggle(1);
    expect(multi.openIndexes).toEqual([0, 2, 1]);
  });

  it('spring-counter shows the number, rolls to new values and announces the plain text', () => {
    const el = mount<any>('<mo-spring-counter value="1280" group="," prefix="$"></mo-spring-counter>');
    const got = events(el, 'change');
    expect(el.querySelector('[role="status"]')!.textContent).toContain('$1,280');
    expect(el.querySelectorAll('.usa-scount-col')).toHaveLength(5);
    el.value = 99;
    expect(el.querySelectorAll('.usa-scount-col')).toHaveLength(2);
    expect(el.querySelector('.usa-skit-sr')!.textContent).toBe('$99');
    expect(got).toEqual([{ value: 99 }]);
    el.setAttribute('value', '12345');
    expect(el.querySelector('.usa-skit-sr')!.textContent).toBe('$12,345');
  });
});
