import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, WIDGETS, radialSpots, timeParts, formatTime, stepTime, hour12, luminance, inkOn, parseDay, dayText,
  weekStartOf, rowDiffers, cellMark, arcDash, raceRanks, frameValues, spreadLabels, signedNumbers, relativeChange,
} from '../src/components/widgets';
import { components as toolkit } from '../showcase/catalog/toolkit.js';
import { installComponentMocks, intersect } from './components-setup';
import { readFileSync } from 'node:fs';

const UI = ['radial-menu', 'hover-card', 'toggle-group', 'time-picker', 'color-swatches', 'calendar-strip', 'comparison-table'];
const DATA = ['radial-bars', 'bar-race', 'bullet-chart', 'slope-chart', 'dot-plot'];
const TAGS = [...UI, ...DATA];
const read = (f: string) => readFileSync(f, 'utf8');

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  defineWidgets('17.15');
});
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
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
const click = (el: Element | null | undefined) => (el as HTMLElement).click();

describe('17.15 registration', () => {
  it('registers twelve widgets under 17.15 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.15']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name), name).toBeTruthy();
      expect(customElements.get('usa-' + name), name).toBeTruthy();
    }
  });

  it('lists every new widget in the showcase catalog, on the demo page, on the home page and in the docs', async () => {
    expect(toolkit.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of toolkit as any[]) expect(c.since).toBe('17.15');
    const lab = read('showcase/toolkit.html');
    for (const name of TAGS) expect(lab).toContain(`<mo-${name}`);
    expect(read('showcase/index.html')).toContain('./toolkit.html');
    const { COLLECTIONS } = await import('../showcase/home-collections.js');
    const tab = (COLLECTIONS as any[])[0];
    expect(tab.id).toBe('toolkit');
    expect(tab.since).toBe('17.15');
    expect(tab.items.map((i: any) => i.id).sort()).toEqual([...TAGS].sort());
    expect(tab.total).toBe(TAGS.length);
    const doc = read('docs/toolkit-17-15.md');
    for (const name of TAGS) expect(doc, name).toContain(`\`mo-${name}\``);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('toolkit-17-15.md');
    expect(read('CHANGELOG.md')).toContain('17.15 toolkit');
    for (const name of TAGS) expect(read('skills/motionary/SKILL.md'), name).toContain(`<mo-${name}>`);
  });

  it('remounts every catalog example cleanly: same structure after detach and reattach', () => {
    for (const c of toolkit as any[]) {
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
    const menuHtml = '<button aria-label="Copy">C</button><a href="#x">Link</a>';
    const menu = mount<HTMLElement>(`<mo-radial-menu>${menuHtml}</mo-radial-menu>`);
    expect(menu.querySelector('.usa-rmenu-ring button')).toBeTruthy();
    menu.remove();
    expect(menu.innerHTML).toBe(menuHtml);
    const tableHtml = '<table><thead><tr><th>F</th><th>A</th><th>B</th></tr></thead><tbody><tr><td>X</td><td>yes</td><td>no</td></tr><tr><td>Y</td><td>1</td><td>1</td></tr></tbody></table>';
    const table = mount<HTMLElement>(`<mo-comparison-table highlight="1" differences="">${tableHtml}</mo-comparison-table>`);
    expect(table.querySelector('.usa-ctable')).toBeTruthy();
    table.remove();
    expect(table.innerHTML).toBe(tableHtml);
    const cardHtml = '<a data-trigger="" href="#">@mei</a><div data-card="">Hello</div>';
    const card = mount<HTMLElement>(`<mo-hover-card>${cardHtml}</mo-hover-card>`);
    expect(card.querySelector('[data-trigger]')!.getAttribute('aria-describedby')).toBeTruthy();
    card.remove();
    expect(card.innerHTML).toBe(cardHtml);
    expect(card.className).toBe('');
  });
});

describe('pure helpers', () => {
  it('radialSpots spaces a full circle evenly and puts a part circle on both ends', () => {
    expect(radialSpots(4, 100)).toEqual([
      { x: 0, y: -100, angle: -90 },
      { x: 100, y: 0, angle: 0 },
      { x: 0, y: 100, angle: 90 },
      { x: -100, y: 0, angle: 180 },
    ]);
    expect(radialSpots(3, 50, -180, 180).map(({ x, y }) => [x, y])).toEqual([[-50, 0], [0, -50], [50, 0]]);
    expect(radialSpots(1, 40, 0, 90)).toEqual([{ x: 40, y: 0, angle: 0 }]);
    expect(radialSpots(0)).toEqual([]);
    expect(radialSpots(NaN)).toEqual([]);
  });

  it('timeParts, formatTime, stepTime and hour12', () => {
    expect(timeParts('9:05')).toEqual({ h: 9, m: 5 });
    expect(timeParts('24:00')).toBeNull();
    expect(timeParts('12:60')).toBeNull();
    expect(timeParts('noon')).toBeNull();
    expect(formatTime(-30)).toBe('23:30');
    expect(formatTime(1440)).toBe('00:00');
    expect(stepTime('10:07', 'm', 1, 5)).toBe('10:10');
    expect(stepTime('10:07', 'm', -1, 5)).toBe('10:05');
    expect(stepTime('10:10', 'm', -1, 5)).toBe('10:05');
    expect(stepTime('10:55', 'm', 1, 5)).toBe('10:00');
    expect(stepTime('23:30', 'h', 1)).toBe('00:30');
    expect(stepTime('00:10', 'h', -1)).toBe('23:10');
    expect(stepTime('bad', 'm', 1, 15)).toBe('00:15');
    expect(hour12(0)).toEqual({ hour: 12, pm: false });
    expect(hour12(12)).toEqual({ hour: 12, pm: true });
    expect(hour12(13)).toEqual({ hour: 1, pm: true });
  });

  it('luminance and inkOn pick black or white for readability', () => {
    expect(luminance('#fff')).toBe(1);
    expect(luminance('#000000')).toBe(0);
    expect(luminance('nope')).toBeNaN();
    expect(inkOn('#ffffff')).toBe('#000000');
    expect(inkOn('#f59e0b')).toBe('#000000');
    expect(inkOn('#000')).toBe('#ffffff');
    expect(inkOn('#2563eb')).toBe('#ffffff');
    expect(inkOn('red')).toBe('#ffffff');
  });

  it('parseDay, dayText and weekStartOf work in UTC days', () => {
    const d = parseDay('2026-03-11');
    expect(d).toBe(20523);
    expect(dayText(d)).toBe('2026-03-11');
    expect(parseDay('2026-02-30')).toBeNaN();
    expect(parseDay('11/03/2026')).toBeNaN();
    expect(dayText(weekStartOf(d))).toBe('2026-03-09');
    expect(dayText(weekStartOf(d, 0))).toBe('2026-03-08');
    expect(dayText(weekStartOf(parseDay('2026-03-09')))).toBe('2026-03-09');
  });

  it('rowDiffers and cellMark read comparison rows', () => {
    expect(rowDiffers(['Export', 'yes', 'yes'])).toBe(false);
    expect(rowDiffers(['Seats', 'no', 'yes'])).toBe(true);
    expect(rowDiffers(['Case', 'A ', ' a'])).toBe(false);
    expect(rowDiffers(['Only', '1'])).toBe(false);
    expect(cellMark('✓')).toBe('yes');
    expect(cellMark(' No ')).toBe('no');
    expect(cellMark('是')).toBe('yes');
    expect(cellMark('—')).toBe('no');
    expect(cellMark('3')).toBe('');
  });

  it('arcDash, raceRanks and frameValues', () => {
    expect(arcDash(0.5, 100)).toEqual({ on: 235.62, track: 471.24, circumference: 628.32 });
    expect(arcDash(2, 10).on).toBe(arcDash(2, 10).track);
    expect(arcDash(NaN, 10).on).toBe(0);
    expect(raceRanks([5, 9, 9, 1], 3)).toEqual([
      { index: 1, value: 9, place: 0 },
      { index: 2, value: 9, place: 1 },
      { index: 0, value: 5, place: 2 },
    ]);
    expect(frameValues('1,2; 3 x 4 ;; ')).toEqual([[1, 2], [3, 0, 4]]);
  });

  it('spreadLabels, signedNumbers and relativeChange', () => {
    expect(spreadLabels([10, 12, 50], 14, 0, 100)).toEqual([10, 24, 50]);
    expect(spreadLabels([95, 98, 99], 10, 0, 100)).toEqual([80, 90, 100]);
    expect(spreadLabels([30, 10], 14)).toEqual([30, 10]);
    expect(signedNumbers('-2, 3 x')).toEqual([-2, 3, 0]);
    expect(relativeChange(40, 50)).toBe(0.25);
    expect(relativeChange(0, 5)).toBe(0);
    expect(relativeChange(-10, -5)).toBe(0.5);
  });
});

describe('UI parts', () => {
  it('radial-menu opens from its toggle, picks an item and closes with Escape', () => {
    const el = mount<any>('<mo-radial-menu label="Share"><button aria-label="Copy">C</button><button aria-label="Mail">M</button><button aria-label="Save">S</button></mo-radial-menu>');
    const toggles = events(el, 'toggle');
    const picks = events(el, 'select');
    const toggle = el.querySelector('.usa-rmenu-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelectorAll('.usa-rmenu-item')).toHaveLength(3);
    click(toggle);
    expect(el.open).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggles).toEqual([{ open: true }]);
    const items = el.querySelectorAll('.usa-rmenu-item button');
    (items[0] as HTMLElement).focus();
    key(items[0], 'ArrowRight');
    expect(document.activeElement).toBe(items[1]);
    key(items[1], 'End');
    expect(document.activeElement).toBe(items[2]);
    click(items[1]);
    expect(picks).toEqual([{ index: 1, label: 'Mail' }]);
    expect(el.open).toBe(false);
    el.toggle(true);
    key(items[0], 'Escape');
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('hover-card opens after its delay on focus, stays while focus is inside and closes with Escape', () => {
    vi.useFakeTimers();
    const el = mount<any>('<mo-hover-card open-delay="300" close-delay="100"><a data-trigger href="#">@mei</a><div data-card><a href="#p">Profile</a></div></mo-hover-card>');
    const got = events(el, 'toggle');
    const trigger = el.querySelector('[data-trigger]') as HTMLElement;
    const card = el.querySelector('[data-card]') as HTMLElement;
    expect(card.hidden).toBe(true);
    expect(trigger.getAttribute('aria-describedby')).toBe(card.id);
    trigger.focus();
    vi.advanceTimersByTime(200);
    expect(card.hidden).toBe(true);
    vi.advanceTimersByTime(150);
    expect(card.hidden).toBe(false);
    expect(el.open).toBe(true);
    (card.querySelector('a') as HTMLElement).focus();
    vi.advanceTimersByTime(500);
    expect(card.hidden).toBe(false);
    key(card, 'Escape');
    expect(card.hidden).toBe(true);
    expect(got).toEqual([{ open: true }, { open: false }]);
    el.show();
    expect(el.open).toBe(true);
    el.hide();
    expect(el.open).toBe(false);
  });

  it('toggle-group presses one or several and keeps one with required', () => {
    const one = mount<any>('<mo-toggle-group options="Day,Week,Month" values="d,w,m" value="w" required name="range"></mo-toggle-group>');
    const got = events(one, 'change');
    const b = one.querySelectorAll('.usa-tgroup-btn');
    expect(Array.from(b).map((x: any) => x.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    expect((one.querySelector('input[type=hidden]') as HTMLInputElement).value).toBe('w');
    click(b[1]);
    expect(got).toEqual([]);
    click(b[2]);
    expect(one.value).toEqual(['m']);
    expect(got).toEqual([{ value: ['m'], index: 2 }]);
    (b[2] as HTMLElement).focus();
    key(b[2], 'ArrowRight');
    expect(document.activeElement).toBe(b[0]);
    expect((b[0] as HTMLElement).tabIndex).toBe(0);
    const many = mount<any>('<mo-toggle-group options="B,I,U" multiple></mo-toggle-group>');
    const mb = many.querySelectorAll('.usa-tgroup-btn');
    click(mb[2]);
    click(mb[0]);
    expect(many.value).toEqual(['B', 'U']);
    click(mb[2]);
    expect(many.value).toEqual(['B']);
  });

  it('time-picker steps, snaps, takes typed digits and switches AM / PM', () => {
    const el = mount<any>('<mo-time-picker value="10:07" step="5" name="t"></mo-time-picker>');
    const got = events(el, 'change');
    const [hh, mm] = Array.from(el.querySelectorAll('[role=spinbutton]')) as HTMLElement[];
    expect(hh.textContent).toBe('10');
    expect(mm.getAttribute('aria-valuenow')).toBe('7');
    key(mm, 'ArrowUp');
    expect(el.value).toBe('10:10');
    key(mm, 'ArrowDown');
    key(mm, 'ArrowDown');
    expect(el.value).toBe('10:00');
    key(hh, 'PageDown');
    expect(el.value).toBe('09:00');
    key(hh, '1');
    key(hh, '4');
    expect(el.value).toBe('14:00');
    expect((el.querySelector('input[type=hidden]') as HTMLInputElement).value).toBe('14:00');
    expect(got.map((d) => d.value)).toEqual(['10:10', '10:05', '10:00', '09:00', '01:00', '14:00']);
    const twelve = mount<any>('<mo-time-picker value="13:30" hour12 am-label="AM" pm-label="PM"></mo-time-picker>');
    const h = twelve.querySelector('[role=spinbutton]') as HTMLElement;
    expect(h.textContent).toBe('01');
    expect(h.getAttribute('aria-valuetext')).toBe('1 PM');
    const ampm = twelve.querySelector('.usa-time-ampm') as HTMLButtonElement;
    expect(ampm.textContent).toBe('PM');
    click(ampm);
    expect(twelve.value).toBe('01:30');
    expect(ampm.textContent).toBe('AM');
  });

  it('color-swatches is a radio group that picks with arrows and chooses a readable check', () => {
    const el = mount<any>('<mo-color-swatches colors="#ffffff,#111111,#2563eb" names="White,Black,Blue" value="#111111"></mo-color-swatches>');
    const got = events(el, 'change');
    const b = Array.from(el.querySelectorAll('[role=radio]')) as HTMLElement[];
    expect(el.querySelector('[role=radiogroup]')).toBeTruthy();
    expect(b.map((x) => x.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(b[0].style.getPropertyValue('--ink')).toBe('#000000');
    expect(b[1].style.getPropertyValue('--ink')).toBe('#ffffff');
    expect(el.querySelector('.usa-swatch-name')!.textContent).toBe('Black');
    b[1].focus();
    key(b[1], 'ArrowRight');
    expect(el.value).toBe('#2563eb');
    expect(document.activeElement).toBe(b[2]);
    expect(got).toEqual([{ value: '#2563eb', index: 2, name: 'Blue' }]);
    click(b[0]);
    expect(el.querySelector('.usa-swatch-name')!.textContent).toBe('White');
  });

  it('calendar-strip shows the week of its value, picks a day and pages past the ends', () => {
    const el = mount<any>('<mo-calendar-strip value="2026-03-11" marks="2026-03-13" min="2026-03-02" locale="en-US"></mo-calendar-strip>');
    const changes = events(el, 'change');
    const pages = events(el, 'page');
    let days = Array.from(el.querySelectorAll('.usa-cstrip-day')) as HTMLButtonElement[];
    expect(days.map((d) => d.dataset.day)).toEqual(['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15']);
    expect(days[2].getAttribute('aria-pressed')).toBe('true');
    expect(days[2].tabIndex).toBe(0);
    expect(days[4].querySelector('.usa-cstrip-dot')).toBeTruthy();
    expect(days[2].getAttribute('aria-label')).toContain('March 11');
    click(days[4]);
    expect(changes).toEqual([{ value: '2026-03-13' }]);
    expect(el.value).toBe('2026-03-13');
    const [prev, next] = Array.from(el.querySelectorAll('.usa-cstrip-nav')) as HTMLButtonElement[];
    click(next);
    expect(pages).toEqual([{ start: '2026-03-16' }]);
    days = Array.from(el.querySelectorAll('.usa-cstrip-day')) as HTMLButtonElement[];
    days[0].focus();
    key(days[0], 'ArrowLeft');
    expect(el.start).toBe('2026-03-09');
    expect((document.activeElement as HTMLElement).dataset.day).toBe('2026-03-15');
    click(prev);
    expect(el.start).toBe('2026-03-02');
    expect(prev.disabled).toBe(true);
  });

  it('comparison-table marks yes / no cells, highlights a column and hides rows that do not differ', () => {
    const el = mount<any>('<mo-comparison-table highlight="2" badge-label="Popular"><table><thead><tr><th>F</th><th>Free</th><th>Pro</th></tr></thead><tbody><tr><td>Export</td><td>yes</td><td>yes</td></tr><tr><td>Seats</td><td>no</td><td>yes</td></tr><tr><td>Projects</td><td>3</td><td>Unlimited</td></tr></tbody></table></mo-comparison-table>');
    const got = events(el, 'filter');
    expect(el.querySelectorAll('td[data-mark=yes]')).toHaveLength(3);
    expect(el.querySelectorAll('td[data-mark=no]')).toHaveLength(1);
    expect(el.querySelector('td[data-mark=no] .usa-kit-sr')!.textContent).toBe('no');
    expect(el.querySelectorAll('[data-highlight]')).toHaveLength(4);
    expect(el.querySelector('thead th[data-highlight] .usa-ctable-badge')!.textContent).toBe('Popular');
    expect(el.querySelector('.usa-ctable-scroll')!.getAttribute('role')).toBe('region');
    const toggle = el.querySelector('.usa-ctable-diff') as HTMLButtonElement;
    click(toggle);
    const rows = Array.from(el.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
    expect(rows.map((r) => r.hidden)).toEqual([true, false, false]);
    expect(got).toEqual([{ differences: true, hidden: 1 }]);
    expect(el.differences).toBe(true);
    click(toggle);
    expect(rows.map((r) => r.hidden)).toEqual([false, false, false]);
  });
});

describe('data charts', () => {
  it('radial-bars draws a track and an arc per value and picks a ring from the legend', () => {
    const el = mount<HTMLElement>('<mo-radial-bars values="50,25" max="100" labels="Move,Stand" unit="%"></mo-radial-bars>');
    const got = events(el, 'select');
    expect(el.querySelectorAll('.usa-rbars-arc')).toHaveLength(2);
    expect(el.querySelectorAll('.usa-rbars-track')).toHaveLength(2);
    expect(el.querySelector('svg')!.getAttribute('aria-label')).toContain('Move 50 % / 100');
    const keys = el.querySelectorAll('.usa-rbars-key');
    expect(keys[1].textContent).toContain('25%');
    click(keys[1]);
    expect(got).toEqual([{ index: 1, value: 25, max: 100 }]);
    expect(keys[1].getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.usa-rbars-ring')!.hasAttribute('data-dim')).toBe(true);
    intersect(el);
    expect(el.querySelector('.usa-rbars')!.hasAttribute('data-in')).toBe(true);
  });

  it('bar-race ranks each frame, writes it out as text and steps with go() and the slider', () => {
    const el = mount<any>('<mo-bar-race labels="A,B,C" frames="2023|2024" values="1,5,3; 6,2,4" top="2"></mo-bar-race>');
    const got = events(el, 'frame');
    const rows = Array.from(el.querySelectorAll('.usa-race-row')) as HTMLElement[];
    expect(rows.map((r) => r.style.getPropertyValue('--place'))).toEqual(['2', '0', '1']);
    expect(rows[0].hasAttribute('data-out')).toBe(true);
    expect(el.querySelector('.usa-kit-sr')!.textContent).toBe('2023: 1. B 5, 2. C 3');
    expect(el.querySelector('.usa-race-stage')!.getAttribute('aria-hidden')).toBe('true');
    el.go(1);
    expect(got).toEqual([{ index: 1, name: '2024', leader: 'A' }]);
    expect(rows[0].style.getPropertyValue('--place')).toBe('0');
    const slider = el.querySelector('.usa-race-slider') as HTMLInputElement;
    expect(slider.value).toBe('1');
    slider.value = '0';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.frame).toBe(0);
    // reduced motion: nothing plays by itself
    intersect(el);
    expect(el.querySelector('.usa-race-play')!.getAttribute('aria-pressed')).toBe('false');
  });

  it('bullet-chart reports value, target and whether it was met', () => {
    const el = mount<HTMLElement>('<mo-bullet-chart values="80,40" targets="70,60" labels="Revenue,Profit" max="100"></mo-bullet-chart>');
    const got = events(el, 'select');
    const rows = el.querySelectorAll('.usa-bullet-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector('.usa-bullet-met')).toBeTruthy();
    expect(rows[1].querySelector('.usa-bullet-met')).toBeNull();
    expect(rows[1].getAttribute('aria-label')).toBe('Profit: 40, target 60, below target');
    expect(rows[0].querySelectorAll('.usa-bullet-band')).toHaveLength(3);
    click(rows[0]);
    expect(got).toEqual([{ index: 0, value: 80, target: 70, met: true }]);
  });

  it('slope-chart colours lines by direction and reports the change', () => {
    const el = mount<HTMLElement>('<mo-slope-chart before="40,30,20" after="50,30,10" labels="A,B,C"></mo-slope-chart>');
    const got = events(el, 'select');
    expect(Array.from(el.querySelectorAll('.usa-slope-item')).map((g) => g.getAttribute('data-dir'))).toEqual(['up', 'flat', 'down']);
    const keys = el.querySelectorAll('.usa-slope-key');
    expect(keys[0].textContent).toContain('+25%');
    expect(keys[2].textContent).toContain('-50%');
    click(keys[2]);
    expect(got).toEqual([{ index: 2, before: 20, after: 10, change: -0.5 }]);
    expect(el.querySelector('.usa-slope')!.hasAttribute('data-focus')).toBe(true);
  });

  it('dot-plot places dots on a shared scale and joins two series into dumbbells', () => {
    const single = mount<HTMLElement>('<mo-dot-plot values="10,40" labels="A,B"></mo-dot-plot>');
    const got = events(single, 'select');
    expect(single.querySelectorAll('.usa-dots-gap')).toHaveLength(0);
    expect(single.querySelectorAll('.usa-dots-tick').length).toBeGreaterThanOrEqual(3);
    click(single.querySelectorAll('.usa-dots-row')[1]);
    expect(got).toEqual([{ index: 1, value: 40, compare: null }]);
    const pair = mount<HTMLElement>('<mo-dot-plot values="50,60" compare="70,55" labels="North,South" series="2024,2025"></mo-dot-plot>');
    expect(pair.querySelectorAll('.usa-dots-gap')).toHaveLength(2);
    expect(pair.querySelectorAll('.usa-dots-dot-b')).toHaveLength(2);
    expect(pair.querySelector('.usa-dots-row')!.getAttribute('aria-label')).toBe('North: 2024 50, 2025 70');
  });
});
