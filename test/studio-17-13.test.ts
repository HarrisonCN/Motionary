import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, WIDGETS, clampTo, tourPlace, wheelIndex, wheelTilt, mentionQuery, matchNames, diffLines, changedSpan,
  niceTicks, linePath, funnelRows, squarify, dayNumber, ganttSpan, waffleCells, flapSteps, shuffleOrder, pressureAt,
  angleTo, strokeWidth, EMOJI, filterEmoji, replyCount, parseSeries, clearedShare, turnAngle, circlePath,
} from '../src/components/widgets';
import { components as studio } from '../showcase/catalog/studio.js';
import { installComponentMocks, intersect } from './components-setup';
import { readFileSync } from 'node:fs';

const UI = ['tour', 'signature-pad', 'wheel-picker', 'mention-input', 'emoji-picker', 'comment-thread', 'diff-viewer'];
const DATA = ['line-chart', 'funnel-chart', 'treemap', 'gantt', 'waffle-chart'];
const MOTION = ['split-flap', 'scratch-card', 'page-flip', 'circular-text', 'pixel-transition', 'magnet-lines', 'text-pressure', 'shuffle-grid'];
const TAGS = [...UI, ...DATA, ...MOTION];

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  defineWidgets('17.13');
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
const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const click = (el: Element | null) => (el as HTMLElement).click();

describe('17.13 registration', () => {
  it('registers twenty widgets under 17.13 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.13']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name), name).toBeTruthy();
      expect(customElements.get('usa-' + name), name).toBeTruthy();
    }
  });

  it('lists every new widget in the showcase catalog, on the demo page and on the home page', async () => {
    expect(studio.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of studio as any[]) expect(c.since).toBe('17.13');
    const lab = readFileSync('showcase/studio.html', 'utf8');
    for (const name of TAGS) expect(lab).toContain(`<mo-${name}`);
    expect(readFileSync('showcase/index.html', 'utf8')).toContain('./studio.html');
    const { COLLECTIONS } = await import('../showcase/home-collections.js');
    const tab = (COLLECTIONS as any[])[0];
    expect(tab.id).toBe('studio');
    expect(tab.since).toBe('17.13');
    expect(tab.items.length).toBeGreaterThanOrEqual(12);
    expect(tab.total).toBe(TAGS.length);
  });

  it('remounts every catalog example cleanly: same structure after detach and reattach', () => {
    for (const c of studio as any[]) {
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
    const el = mount<HTMLElement>('<mo-diff-viewer><pre data-before>a</pre><pre data-after>b</pre></mo-diff-viewer>');
    expect(el.querySelector('.usa-diff')).toBeTruthy();
    el.remove();
    expect(el.querySelector('.usa-diff')).toBeNull();
    expect(Array.from(el.querySelectorAll('pre')).map((p) => p.hidden)).toEqual([false, false]);
    const thread = mount<HTMLElement>('<mo-comment-thread><article data-author="Ann"><p>Hi</p></article></mo-comment-thread>');
    expect(thread.querySelector('.usa-cthread-like')).toBeTruthy();
    thread.remove();
    expect(thread.innerHTML).toBe('<article data-author="Ann"><p>Hi</p></article>');
  });
});

describe('pure helpers', () => {
  it('clampTo, wheelIndex and wheelTilt', () => {
    expect(clampTo(NaN, 1, 5)).toBe(1);
    expect(clampTo(9, 1, 5)).toBe(5);
    expect(wheelIndex(95, 40, 5)).toBe(2);
    expect(wheelIndex(-30, 40, 5)).toBe(0);
    expect(wheelIndex(999, 40, 5)).toBe(4);
    expect(wheelIndex(10, 0, 5)).toBe(0);
    expect(wheelTilt(1)).toBe(20);
    expect(wheelTilt(-9)).toBe(-80);
  });

  it('tourPlace puts the card below when it fits, above otherwise, and keeps it inside the view', () => {
    const view = { width: 800, height: 600 };
    expect(tourPlace({ top: 100, left: 100, width: 50, height: 20 }, { width: 200, height: 100 }, view)).toEqual({ top: 132, left: 25, side: 'below' });
    expect(tourPlace({ top: 520, left: 750, width: 40, height: 40 }, { width: 200, height: 100 }, view)).toEqual({ top: 408, left: 592, side: 'above' });
  });

  it('mentionQuery finds the mention before the caret; matchNames ranks prefix matches first', () => {
    expect(mentionQuery('hi @ad', 6)).toEqual({ start: 3, query: 'ad' });
    expect(mentionQuery('@', 1)).toEqual({ start: 0, query: '' });
    expect(mentionQuery('mail a@b', 8)).toBeNull();
    expect(mentionQuery('hi @ad x', 8)).toBeNull();
    expect(mentionQuery('hi @ad', 3)).toBeNull();
    expect(mentionQuery('ping #ro', 8, '#')).toEqual({ start: 5, query: 'ro' });
    expect(matchNames(['Ada', 'Alan', 'Grace', 'Linda', 'Bob'], 'a', 3)).toEqual(['Ada', 'Alan', 'Grace']);
    expect(matchNames(['Ada', 'Alan', 'Grace', 'Linda'], 'LIN')).toEqual(['Linda']);
    expect(matchNames(['Ada', 'Alan'], '')).toEqual(['Ada', 'Alan']);
  });

  it('diffLines and changedSpan', () => {
    expect(diffLines('a\nb\nc', 'a\nB\nc\nd')).toEqual([
      { type: 'same', text: 'a', a: 1, b: 1 },
      { type: 'del', text: 'b', a: 2 },
      { type: 'add', text: 'B', b: 2 },
      { type: 'same', text: 'c', a: 3, b: 3 },
      { type: 'add', text: 'd', b: 4 },
    ]);
    expect(diffLines('x', 'x')).toEqual([{ type: 'same', text: 'x', a: 1, b: 1 }]);
    expect(changedSpan('return a;', 'return ab;')).toEqual([8, 8, 9]);
    expect(changedSpan('same', 'same')).toEqual([4, 4, 4]);
  });

  it('niceTicks, linePath and parseSeries', () => {
    expect(niceTicks(0, 37)).toEqual([0, 10, 20, 30, 40]);
    expect(niceTicks(5, 5)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(niceTicks(0, 1)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(linePath([0, 10], 100, 50, 0, 10)).toBe('M0,50L100,0');
    expect(linePath([0, 5, 10], 100, 50, 0, 10, false)).toBe('M0,50L50,25L100,0');
    expect(linePath([], 100, 50, 0, 1)).toBe('');
    expect(linePath([3], 100, 50, 0, 10)).toBe('M50,35');
    const curve = linePath([0, 10, 0], 100, 50, 0, 10);
    expect(curve.startsWith('M0,50C')).toBe(true);
    expect(curve.endsWith(' 100,50')).toBe(true);
    expect(parseSeries('1,2 3|4, x')).toEqual([[1, 2, 3], [4, 0]]);
    expect(parseSeries('')).toEqual([]);
  });

  it('funnelRows, squarify, dayNumber, ganttSpan and waffleCells', () => {
    expect(funnelRows([200, 100, 25, 0])).toEqual([
      { share: 1, step: 1, overall: 1 },
      { share: 0.5, step: 0.5, overall: 0.5 },
      { share: 0.125, step: 0.25, overall: 0.125 },
      { share: 0, step: 0, overall: 0 },
    ]);
    const values = [6, 6, 4, 3, 2, 2, 1];
    const rects = squarify(values, 6, 4);
    rects.forEach((r, i) => {
      expect(r.w * r.h).toBeCloseTo(values[i], 1);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(6.01);
      expect(r.y + r.h).toBeLessThanOrEqual(4.01);
    });
    expect(squarify([1, 0, 3], 4, 1)[1]).toEqual({ x: 0, y: 0, w: 0, h: 0 });
    expect(dayNumber('1970-01-02')).toBe(1);
    expect(dayNumber('2026-02-30')).toBeNaN();
    expect(dayNumber('nope')).toBeNaN();
    expect(ganttSpan(0, 0, 0, 9)).toEqual({ left: 0, width: 10 });
    expect(ganttSpan(2, 4, 0, 9)).toEqual({ left: 20, width: 30 });
    expect(ganttSpan(-5, 20, 0, 9)).toEqual({ left: 0, width: 100 });
    expect(ganttSpan(NaN, 1, 0, 9)).toEqual({ left: 0, width: 0 });
    const count = (cells: number[], k: number) => cells.filter((c) => c === k).length;
    const thirds = waffleCells([1, 1, 1], 3);
    expect([count(thirds, 0), count(thirds, 1), count(thirds, 2)]).toEqual([34, 33, 33]);
    const part = waffleCells([30, 20]);
    expect([count(part, 0), count(part, 1), count(part, -1)]).toEqual([30, 20, 50]);
  });

  it('flapSteps, shuffleOrder, pressureAt, angleTo and strokeWidth', () => {
    expect(flapSteps('A', 'C', 'ABC')).toBe(2);
    expect(flapSteps('C', 'A', 'ABC')).toBe(1);
    expect(flapSteps('A', 'A', 'ABC')).toBe(0);
    expect(flapSteps('?', 'A', 'ABC')).toBe(1);
    expect(shuffleOrder(6, 3)).toEqual(shuffleOrder(6, 3));
    expect([...shuffleOrder(12, 5)].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, i) => i));
    expect(shuffleOrder(0)).toEqual([]);
    expect(pressureAt(0, 100)).toBe(1);
    expect(pressureAt(50, 100)).toBeCloseTo(0.5);
    expect(pressureAt(100, 100)).toBe(0);
    expect(pressureAt(500, 100)).toBe(0);
    expect(pressureAt(10, 0)).toBe(0);
    expect([angleTo(0, 0, 10, 0), angleTo(0, 0, 0, 10), angleTo(0, 0, -10, 0), angleTo(0, 0, 0, -10)]).toEqual([0, 90, 180, -90]);
    expect(strokeWidth(0)).toBeCloseTo(4);
    expect(strokeWidth(3)).toBeCloseTo(1.125);
    expect(strokeWidth(99)).toBeCloseTo(1.125);
    expect(strokeWidth(1, 2)).toBeCloseTo(2.4);
  });

  it('filterEmoji, replyCount, clearedShare, turnAngle and circlePath', () => {
    expect(EMOJI.length).toBeGreaterThan(60);
    expect(filterEmoji('pizza').map((e) => e.emoji)).toEqual(['🍕']);
    expect(filterEmoji('thumbs up').map((e) => e.emoji)).toEqual(['👍']);
    expect(filterEmoji('').length).toBe(EMOJI.length);
    expect(filterEmoji('zzzz')).toEqual([]);
    expect(replyCount(1)).toBe('1 reply');
    expect(replyCount(3)).toBe('3 replies');
    expect(replyCount(2, 'one', '{n} 条')).toBe('2 条');
    const data = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 255]);
    expect(clearedShare(data, 1)).toBeCloseTo(0.5);
    expect(turnAngle(0, 200)).toBeCloseTo(0);
    expect(turnAngle(-400, 200)).toBe(-180);
    expect(circlePath(40)).toBe('M50,10a40,40 0 1,1 0,80a40,40 0 1,1 0,-80');
  });
});

describe('collaboration and input', () => {
  it('tour: walks the steps, shows the count and ends with Done, giving focus back', () => {
    document.body.insertAdjacentHTML('beforeend', '<span id="t-a">A</span><span id="t-b">B</span>');
    const el = mount<any>('<mo-tour><button data-start>Go</button><div data-step data-target="#t-a" data-title="One">First</div><div data-step data-target="#t-b" data-title="Two">Second</div></mo-tour>');
    const steps = events(el, 'step'), ends = events(el, 'end');
    expect(el.querySelectorAll('[data-step]')[0].hidden).toBe(true);
    const start = el.querySelector('[data-start]') as HTMLButtonElement;
    start.focus();
    click(start);
    const card = el.querySelector('.usa-tour-card') as HTMLElement;
    expect(card.getAttribute('role')).toBe('dialog');
    expect(el.querySelector('.usa-tour-title').textContent).toBe('One');
    expect(el.querySelector('.usa-tour-count').textContent).toBe('1 of 2');
    expect((el.querySelector('.usa-tour-back') as HTMLElement).hidden).toBe(true);
    click(el.querySelector('.usa-tour-next'));
    expect(el.querySelector('.usa-tour-body').textContent).toBe('Second');
    expect(el.querySelector('.usa-tour-next').textContent).toBe('Done');
    click(el.querySelector('.usa-tour-next'));
    expect(steps).toEqual([{ index: 0 }, { index: 1 }]);
    expect(ends).toEqual([{ completed: true }]);
    expect((el.querySelector('.usa-tour') as HTMLElement).hidden).toBe(true);
    expect(document.activeElement).toBe(start);
  });

  it('tour: Escape ends it early', () => {
    const el = mount<any>('<mo-tour><div data-step data-title="Only">Hi</div></mo-tour>');
    const ends = events(el, 'end');
    el.start();
    expect(el.index).toBe(0);
    key(el.querySelector('.usa-tour-card'), 'Escape');
    expect(ends).toEqual([{ completed: false }]);
    expect(el.index).toBe(-1);
  });

  it('signature pad: a typed name counts as a signature; Clear empties it', () => {
    const el = mount<any>('<mo-signature-pad></mo-signature-pad>');
    const got = events(el, 'change');
    expect(el.empty).toBe(true);
    const field = el.querySelector('.usa-sign-field') as HTMLInputElement;
    field.value = 'Ada Lovelace';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.empty).toBe(false);
    expect(got.at(-1)).toEqual({ empty: false, strokes: 0, typed: true });
    click(el.querySelector('.usa-sign-clear'));
    expect(el.empty).toBe(true);
    expect(field.value).toBe('');
    expect(got.at(-1)).toEqual({ empty: true, strokes: 0, typed: false });
  });

  it('wheel picker: each select becomes a spinbutton that keeps the select in sync', () => {
    const el = mount<any>('<mo-wheel-picker><select aria-label="Hour"><option>07</option><option selected>08</option><option>09</option></select><select aria-label="Min"><option>00</option><option>30</option></select></mo-wheel-picker>');
    const got = events(el, 'change');
    const views = el.querySelectorAll('[role="spinbutton"]');
    expect(views.length).toBe(2);
    expect(views[0].getAttribute('aria-label')).toBe('Hour');
    expect(views[0].getAttribute('aria-valuetext')).toBe('08');
    const sel = el.querySelector('select') as HTMLSelectElement;
    let changes = 0;
    sel.addEventListener('change', () => changes++);
    key(views[0], 'ArrowDown');
    expect(sel.value).toBe('09');
    expect(changes).toBe(1);
    expect(got).toEqual([{ index: 0, values: ['09', '00'] }]);
    key(views[1], 'End');
    expect(el.values).toEqual(['09', '30']);
  });

  it('mention input: @ opens matching names and Enter inserts one', () => {
    const el = mount<any>('<mo-mention-input people="Ada Lovelace,Alan Turing,Grace Hopper"><textarea></textarea></mo-mention-input>');
    const got = events(el, 'mention');
    const ta = el.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.getAttribute('role')).toBe('combobox');
    ta.value = 'hi @a';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const opts = el.querySelectorAll('[role="option"]');
    expect(Array.from(opts).map((o) => o.textContent)).toEqual(['AAda Lovelace', 'AAlan Turing', 'GGrace Hopper']);
    expect(ta.getAttribute('aria-expanded')).toBe('true');
    key(ta, 'ArrowDown');
    expect(ta.getAttribute('aria-activedescendant')).toBe(opts[1].id);
    key(ta, 'Enter');
    expect(ta.value).toBe('hi @Alan Turing ');
    expect(got).toEqual([{ name: 'Alan Turing' }]);
    expect(el.mentions).toEqual(['Alan Turing']);
    expect(ta.getAttribute('aria-expanded')).toBe('false');
  });

  it('emoji picker: search narrows the grid and a pick types into the field', () => {
    document.body.insertAdjacentHTML('beforeend', '<input id="emo">');
    const el = mount<any>('<mo-emoji-picker for="#emo"></mo-emoji-picker>');
    const got = events(el, 'pick');
    expect(el.querySelectorAll('[role="tab"]').length).toBe(7);
    const search = el.querySelector('.usa-emoji-search') as HTMLInputElement;
    search.value = 'pizza';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const cells = el.querySelectorAll('.usa-emoji-cell');
    expect(cells.length).toBe(1);
    click(cells[0]);
    expect(got).toEqual([{ emoji: '🍕', name: 'pizza' }]);
    expect((document.getElementById('emo') as HTMLInputElement).value).toBe('🍕');
  });

  it('comment thread: likes count, replies fold away and a posted reply joins the thread', () => {
    const el = mount<any>('<mo-comment-thread you="Me"><article data-author="Ann" data-likes="2"><p>Hi</p><article data-author="Bo"><p>Hey</p></article></article></mo-comment-thread>');
    const likes = events(el, 'like'), toggles = events(el, 'toggle'), replies = events(el, 'reply');
    const top = el.querySelector('article') as HTMLElement;
    const like = top.querySelector('.usa-cthread-like') as HTMLButtonElement;
    click(like);
    expect(like.getAttribute('aria-pressed')).toBe('true');
    expect(likes).toEqual([{ index: 0, liked: true, likes: 3 }]);
    const toggle = top.querySelector('.usa-cthread-toggle') as HTMLButtonElement;
    expect(toggle.textContent).toBe('Hide replies');
    click(toggle);
    expect((top.querySelector('article') as HTMLElement).hidden).toBe(true);
    expect(toggle.textContent).toBe('1 reply');
    expect(toggles).toEqual([{ index: 0, open: false }]);
    click(top.querySelector('.usa-cthread-reply'));
    const form = top.querySelector('form') as HTMLFormElement;
    (form.querySelector('textarea') as HTMLTextAreaElement).value = 'Thanks!';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(replies).toEqual([{ index: 0, text: 'Thanks!' }]);
    const posted = top.querySelectorAll(':scope > article');
    expect(posted.length).toBe(2);
    expect(posted[1].getAttribute('data-author')).toBe('Me');
    expect(toggle.textContent).toBe('Hide replies');
  });

  it('diff viewer: unified and split views with counts', () => {
    const el = mount<any>('<mo-diff-viewer file="a.js"><pre data-before>one\ntwo\nend</pre><pre data-after>ONE\ntwo!\nend\nmore</pre></mo-diff-viewer>');
    const got = events(el, 'mode');
    expect(el.querySelector('.usa-diff-file').textContent).toBe('a.js');
    expect(el.querySelector('.usa-diff-plus').textContent).toBe('+3');
    expect(el.querySelector('.usa-diff-minus').textContent).toBe('−2');
    expect(el.querySelectorAll('.usa-diff-line.del').length).toBe(2);
    expect(el.querySelectorAll('.usa-diff-line.add').length).toBe(3);
    expect(el.querySelectorAll('.usa-diff-line.same').length).toBe(1);
    expect(el.querySelector('.usa-diff-line.add mark')?.textContent).toBe('!');
    click(el.querySelector('[data-mode="split"]'));
    expect(got).toEqual([{ mode: 'split' }]);
    expect(el.querySelectorAll('.usa-diff-line.pair').length).toBe(3);
    expect(el.querySelector('[data-mode="split"]').getAttribute('aria-checked')).toBe('true');
  });
});

describe('data charts', () => {
  it('line chart: one line per series, crosshair by keyboard and legend toggles', () => {
    const el = mount<any>('<mo-line-chart values="1,4,3|2,2,5" labels="a,b,c" series="X,Y"></mo-line-chart>');
    const points = events(el, 'point'), toggles = events(el, 'toggle');
    expect(el.querySelectorAll('.usa-lchart-line').length).toBe(2);
    expect(el.querySelector('.usa-lchart-line').getAttribute('d')).toMatch(/^M/);
    expect(el.querySelectorAll('table tr').length).toBe(4);
    const plot = el.querySelector('.usa-lchart-plot') as HTMLElement;
    plot.focus();
    expect(points.at(-1)).toEqual({ index: 2 });
    key(plot, 'ArrowLeft');
    expect(points.at(-1)).toEqual({ index: 1 });
    expect(el.querySelector('.usa-lchart-tip strong').textContent).toBe('b');
    const keys = el.querySelectorAll('.usa-lchart-key');
    click(keys[0]);
    expect(keys[0].getAttribute('aria-pressed')).toBe('false');
    expect(toggles).toEqual([{ series: 0, visible: false }]);
  });

  it('funnel chart: stages as an ordered list of buttons with conversion', () => {
    const el = mount<any>('<mo-funnel-chart values="200,100,50" labels="A,B,C"></mo-funnel-chart>');
    const got = events(el, 'select');
    const bars = el.querySelectorAll('ol .usa-funnel-bar');
    expect(bars.length).toBe(3);
    click(bars[2]);
    expect(got).toEqual([{ index: 2, value: 50, step: 0.5, overall: 0.25 }]);
  });

  it('treemap: one tile per positive value, one tab stop, arrow keys move', () => {
    const el = mount<any>('<mo-treemap values="5,3,2" labels="A,B,C"></mo-treemap>');
    const got = events(el, 'select');
    const tiles = Array.from(el.querySelectorAll('.usa-tmap-tile')) as HTMLButtonElement[];
    expect(tiles.length).toBe(3);
    expect(tiles.filter((t) => t.tabIndex === 0).length).toBe(1);
    tiles[0].focus();
    key(tiles[0], 'ArrowRight');
    expect(document.activeElement).toBe(tiles[1]);
    click(tiles[0]);
    expect(got[0].value).toBeGreaterThan(0);
    expect(got[0].share).toBeCloseTo(got[0].value / 10);
  });

  it('gantt: bars placed by date with progress and a pick event', () => {
    const el = mount<any>('<mo-gantt><ul><li data-start="2026-03-01" data-end="2026-03-05" data-progress="100">One</li><li data-start="2026-03-06" data-end="2026-03-10" data-after="1">Two</li></ul></mo-gantt>');
    const got = events(el, 'select');
    expect((el.querySelector('ul') as HTMLElement).hidden).toBe(true);
    const bars = el.querySelectorAll('.usa-gantt-bar') as NodeListOf<HTMLElement>;
    expect(bars.length).toBe(2);
    expect(bars[0].style.getPropertyValue('--l')).toBe('0%');
    expect(bars[0].style.getPropertyValue('--w')).toBe('50%');
    expect(bars[1].style.getPropertyValue('--l')).toBe('50%');
    expect(bars[0].hasAttribute('data-done')).toBe(true);
    expect(bars[0].getAttribute('aria-label')).toContain('One');
    click(bars[1]);
    expect(got).toEqual([{ index: 1 }]);
    el.remove();
    expect((el.querySelector('ul') as HTMLElement).hidden).toBe(false);
  });

  it('waffle chart: a hundred cells by share and a legend of buttons', () => {
    const el = mount<any>('<mo-waffle-chart values="60,40" labels="A,B"></mo-waffle-chart>');
    const got = events(el, 'select');
    expect(el.querySelectorAll('.usa-waffle-cell').length).toBe(100);
    expect(el.querySelectorAll('.usa-waffle-cell[data-k="0"]').length).toBe(60);
    const keys = el.querySelectorAll('.usa-waffle-key');
    click(keys[1]);
    expect(got).toEqual([{ index: 1, value: 40, cells: 40 }]);
  });
});

describe('playful motion', () => {
  it('split flap: shows the text at once under reduced motion and announces it', () => {
    const el = mount<any>('<mo-split-flap>Hi 5</mo-split-flap>');
    intersect(el);
    const tops = Array.from(el.querySelectorAll('.usa-flap-top')).map((t: any) => t.textContent);
    expect(tops).toEqual(['H', 'I', ' ', '5']);
    expect(el.querySelector('[aria-live]').textContent).toBe('Hi 5');
    el.remove();
    expect(el.textContent).toBe('Hi 5');
  });

  it('scratch card: the Reveal button uncovers it once', () => {
    const el = mount<any>('<mo-scratch-card><p>Prize</p></mo-scratch-card>');
    const got = events(el, 'reveal');
    expect(el.querySelector('.usa-scratch-prize').textContent).toBe('Prize');
    click(el.querySelector('.usa-scratch-btn'));
    el.reveal();
    expect(el.revealed).toBe(true);
    expect(el.querySelector('.usa-scratch').hasAttribute('data-revealed')).toBe(true);
    expect(got).toEqual([{ by: 'button' }]);
  });

  it('page flip: buttons turn pages and only the open page is exposed', () => {
    const el = mount<any>('<mo-page-flip><section>1</section><section>2</section><section>3</section></mo-page-flip>');
    const got = events(el, 'change');
    const pages = el.querySelectorAll('.usa-book-page');
    expect(pages.length).toBe(3);
    expect(el.querySelector('.usa-book-status').textContent).toBe('Page 1 of 3');
    expect((el.querySelector('.usa-book-prev') as HTMLButtonElement).disabled).toBe(true);
    click(el.querySelector('.usa-book-next'));
    expect(got).toEqual([{ index: 1 }]);
    expect(pages[0].hasAttribute('data-turned')).toBe(true);
    expect(pages[0].hasAttribute('inert')).toBe(true);
    expect(pages[1].hasAttribute('inert')).toBe(false);
    el.index = 2;
    expect(el.querySelector('.usa-book-status').textContent).toBe('Page 3 of 3');
    expect((el.querySelector('.usa-book-next') as HTMLButtonElement).disabled).toBe(true);
  });

  it('circular text: the ring is decorative and the text is read once', () => {
    const el = mount<any>('<mo-circular-text text="Hello"><a href="#">↓</a></mo-circular-text>');
    expect(el.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('textPath').textContent).toContain('Hello');
    expect(el.querySelector('.usa-kit-sr').textContent).toBe('Hello');
    expect(el.querySelector('.usa-ctext-mid a')).toBeTruthy();
  });

  it('pixel transition: toggling swaps which face is inert', () => {
    const el = mount<any>('<mo-pixel-transition><div>Front</div><div>Back</div></mo-pixel-transition>');
    const got = events(el, 'change');
    const faces = el.querySelectorAll('.usa-pixel-face');
    expect(faces[1].hasAttribute('inert')).toBe(true);
    el.toggle();
    expect(el.flipped).toBe(true);
    expect(faces[0].hasAttribute('inert')).toBe(true);
    expect(faces[1].hasAttribute('inert')).toBe(false);
    expect(got).toEqual([{ flipped: true }]);
    expect(el.querySelectorAll('.usa-pixel-grid i').length).toBe(144);
  });

  it('magnet lines, text pressure and shuffle grid build their parts', () => {
    const lines = mount<any>('<mo-magnet-lines rows="3" columns="4"><b>Hi</b></mo-magnet-lines>');
    expect(lines.querySelectorAll('.usa-mlines-field i').length).toBe(12);
    expect(lines.querySelector('.usa-mlines-body b')).toBeTruthy();
    const press = mount<any>('<mo-text-pressure>Go on</mo-text-pressure>');
    expect(press.querySelectorAll('.usa-press-ch').length).toBe(4);
    expect(press.querySelector('.usa-kit-sr').textContent).toBe('Go on');
    const grid = mount<any>('<mo-shuffle-grid><span>a</span><span>b</span><span>c</span></mo-shuffle-grid>');
    const got = events(grid, 'shuffle');
    expect(grid.querySelector('.usa-shuffle-toggle')).toBeNull();
    grid.shuffle();
    expect([...got[0].order].sort()).toEqual([0, 1, 2]);
    expect(Array.from(grid.querySelectorAll('span')).map((s: any) => s.textContent)).toEqual(['a', 'b', 'c']);
  });
});
