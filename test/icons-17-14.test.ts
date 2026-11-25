import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, WIDGETS, ICONS, ICON_GROUPS, ICON_CATEGORIES, ICON_MOTIONS, ICON_TRIGGERS, iconNames, iconCategory,
  iconParts, iconSvg, searchIcons, iconElement, iconCopyText, gridStep,
} from '../src/components/widgets';
import { components as icons } from '../showcase/catalog/icons.js';
import { installComponentMocks, intersect } from './components-setup';
import { readFileSync } from 'node:fs';

const read = (f: string) => readFileSync(f, 'utf8');

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
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('17.14 icon set', () => {
  it('has 503 icons in 24 categories (253 from 17.14, 250 from 17.15), each name unique and every drawing different', () => {
    expect(ICON_CATEGORIES.map((c) => c.id)).toEqual(Object.keys(ICON_GROUPS));
    expect(ICON_CATEGORIES).toHaveLength(24);
    const names = Object.values(ICON_GROUPS).flatMap((g) => Object.keys(g));
    expect(names).toHaveLength(503);
    expect(new Set(names).size).toBe(503);
    expect(Object.keys(ICONS)).toEqual(names);
    expect(iconNames()).toEqual(names);
    expect(new Set(Object.values(ICONS)).size).toBe(503);
    for (const c of ICON_CATEGORIES) {
      expect(c.en && c.zh, c.id).toBeTruthy();
      expect(iconNames(c.id).length, c.id).toBeGreaterThanOrEqual(8);
      for (const n of iconNames(c.id)) expect(iconCategory(n)).toBe(c.id);
    }
    expect(iconNames('nope')).toEqual([]);
    expect(iconCategory('nope')).toBeUndefined();
  });

  it('names are lower-case kebab words', () => {
    for (const n of iconNames()) expect(n).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('every shape is a circle, a rectangle or path data on the 24 grid', () => {
    for (const name of iconNames()) {
      const parts = iconParts(name);
      expect(parts.length, name).toBeGreaterThan(0);
      for (const p of parts) {
        if (p.tag === 'circle') {
          const [cx, cy, r] = ['cx', 'cy', 'r'].map((k) => Number(p.attrs[k]));
          expect(r, name).toBeGreaterThan(0);
          expect(cx - r >= 0 && cx + r <= 24 && cy - r >= 0 && cy + r <= 24, `${name} circle`).toBe(true);
        } else if (p.tag === 'rect') {
          const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((k) => Number(p.attrs[k]));
          expect(w > 0 && h > 0, name).toBe(true);
          expect(x >= 0 && y >= 0 && x + w <= 24 && y + h <= 24, `${name} rect`).toBe(true);
        } else {
          expect(p.attrs.d, name).toMatch(/^M[-\d.]/);
          expect(p.attrs.d, name).toMatch(/^[MmLlHhVvCcSsQqAaZz\d.,\s-]+$/);
          // absolute coordinates right after M stay on the grid
          for (const m of p.attrs.d.matchAll(/M\s*(-?\d*\.?\d+)[\s,]+(-?\d*\.?\d+)/g)) {
            const [x, y] = [Number(m[1]), Number(m[2])];
            expect(x >= 0 && x <= 24 && y >= 0 && y <= 24, `${name} ${m[0]}`).toBe(true);
          }
        }
      }
    }
    expect(iconParts('missing')).toEqual([]);
  });

  it('iconSvg gives decorative or labelled markup and escapes the label', () => {
    const svg = iconSvg('heart');
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"')).toBe(true);
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('<path d="M12 20s');
    const big = iconSvg('search', { size: 48, stroke: 1.5, label: 'Find "it" <now>' });
    expect(big).toContain('width="48"');
    expect(big).toContain('stroke-width="1.5"');
    expect(big).toContain('role="img" aria-label="Find &quot;it&quot; &lt;now>"');
    expect(big).toContain('<circle cx="11" cy="11" r="7"/>');
    expect(iconSvg('grid')).toContain('<rect x="4" y="4" width="6" height="6" rx="1"/>');
    expect(iconSvg('nope')).toBe('');
    expect(iconSvg('plus', { size: 9999, stroke: 99 })).toContain('width="512"');
    expect(iconSvg('plus', { size: 9999, stroke: 99 })).toContain('stroke-width="4"');
  });

  it('searchIcons matches every word against names and category names, in either language', () => {
    expect(searchIcons('')).toHaveLength(503);
    // a category name counts as a word of every icon in it, so 'arrow' keeps the chevrons
    expect(searchIcons('arrow up')).toEqual(['arrow-up', 'arrow-up-right', 'arrow-up-left', 'chevron-up', 'chevrons-up']);
    expect(searchIcons('cloud')).toEqual(['cloud', 'cloud-rain', 'cloud-snow', 'cloud-lightning', 'cloud-drizzle', 'cloud-sun']);
    expect(searchIcons('天气')).toEqual(iconNames('weather'));
    expect(searchIcons('Weather sun')).toEqual(['sun', 'cloud-sun', 'sunrise', 'sunset']);
    expect(searchIcons('code')).toEqual(['file-code', 'barcode', 'code']);
    expect(searchIcons('plus', 'files')).toEqual(['file-plus', 'folder-plus']);
    expect(searchIcons('', 'time')).toEqual(iconNames('time'));
    expect(searchIcons('zzz')).toEqual([]);
  });

  it('iconCopyText and gridStep', () => {
    expect(iconCopyText('bell', 'name')).toBe('bell');
    expect(iconCopyText('bell', 'tag')).toBe('<mo-icon name="bell"></mo-icon>');
    expect(iconCopyText('bell', 'svg')).toBe(iconSvg('bell'));
    expect(iconCopyText('bell', '')).toBe('');
    expect(gridStep(0, 'ArrowRight', 10, 4)).toBe(1);
    expect(gridStep(0, 'ArrowLeft', 10, 4)).toBe(0);
    expect(gridStep(1, 'ArrowDown', 10, 4)).toBe(5);
    expect(gridStep(8, 'ArrowDown', 10, 4)).toBe(9);
    expect(gridStep(5, 'ArrowUp', 10, 4)).toBe(1);
    expect(gridStep(5, 'Home', 10, 4)).toBe(0);
    expect(gridStep(5, 'End', 10, 4)).toBe(9);
    expect(gridStep(3, 'Tab', 10, 4)).toBe(3);
    expect(gridStep(0, 'ArrowRight', 0, 4)).toBe(-1);
  });
});

describe('17.14 <mo-icon>', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: false });
    defineWidgets('17.14');
  });

  it('registers the icon and the picker under 17.14 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.14'])).toEqual(['usa-icon', 'usa-icon-picker']);
    for (const t of ['icon', 'icon-picker']) {
      expect(customElements.get('mo-' + t)).toBeTruthy();
      expect(customElements.get('usa-' + t)).toBeTruthy();
    }
    expect(ICON_MOTIONS).toHaveLength(12);
    expect(ICON_TRIGGERS).toEqual(['loop', 'hover', 'click', 'view']);
  });

  it('draws the named icon, decorative by default, labelled when asked', () => {
    const el = mount<HTMLElement>('<mo-icon name="bell"></mo-icon>');
    const svg = el.querySelector('svg')!;
    expect(svg.classList.contains('usa-icon')).toBe(true);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.children).toHaveLength(2);
    for (const s of svg.children) expect(s.getAttribute('pathLength')).toBe('1');
    const named = mount<HTMLElement>('<mo-icon name="mail" label="Inbox" size="40" stroke="1.5" color="#e11d48"></mo-icon>');
    const s2 = named.querySelector('svg')!;
    expect(s2.getAttribute('role')).toBe('img');
    expect(s2.getAttribute('aria-label')).toBe('Inbox');
    expect(s2.getAttribute('width')).toBe('40');
    expect(s2.getAttribute('stroke-width')).toBe('1.5');
    expect(s2.querySelector('rect')).toBeTruthy();
    named.setAttribute('name', 'phone');
    expect(named.querySelectorAll('svg')).toHaveLength(1);
    expect(named.querySelector('svg')!.dataset.name).toBe('phone');
    expect(iconElement('nope').children).toHaveLength(0);
  });

  it('loops, or plays once on hover, click or view, and announces each start', () => {
    const loop = mount<HTMLElement>('<mo-icon name="refresh" motion="spin" trigger="loop"></mo-icon>');
    expect(loop.querySelector('svg')!.dataset.run).toBe('loop');
    expect(loop.querySelector('svg')!.style.getPropertyValue('--usa-icon-dur')).toBe('1200ms');

    const btn = mount<HTMLButtonElement>('<button type="button"><mo-icon name="bell" motion="ring"></mo-icon> Alerts</button>');
    const icon = btn.querySelector('mo-icon')!;
    const got = events(icon, 'play');
    btn.dispatchEvent(new Event('pointerenter'));
    const svg = icon.querySelector('svg')!;
    expect(svg.dataset.run).toBe('once');
    expect(got).toEqual([{ name: 'bell', motion: 'ring' }]);
    btn.dispatchEvent(new Event('pointerenter'));
    expect(got).toHaveLength(1);
    svg.dispatchEvent(new Event('animationend'));
    expect(svg.dataset.run).toBeUndefined();
    btn.dispatchEvent(new FocusEvent('focusin'));
    expect(got).toHaveLength(2);

    const clicky = mount<HTMLElement>('<mo-icon name="heart" motion="beat" trigger="click" duration="400"></mo-icon>');
    const cg = events(clicky, 'play');
    clicky.click();
    expect(cg).toEqual([{ name: 'heart', motion: 'beat' }]);
    expect(clicky.querySelector('svg')!.style.getPropertyValue('--usa-icon-dur')).toBe('400ms');

    const view = mount<HTMLElement>('<mo-icon name="star" motion="draw" trigger="view"></mo-icon>');
    const vg = events(view, 'play');
    intersect(view, true);
    intersect(view, false);
    intersect(view, true);
    expect(vg).toHaveLength(1);
    // draw ends with the last shape's animation
    const vs = view.querySelector('svg')!;
    vs.lastElementChild!.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(vs.dataset.run).toBeUndefined();

    const manual = mount<any>('<mo-icon name="check" motion="pop" trigger="click"></mo-icon>');
    const mg = events(manual, 'play');
    manual.play();
    expect(mg).toHaveLength(1);
  });

  it('ignores an unknown motion or trigger', () => {
    const el = mount<HTMLElement>('<mo-icon name="sun" motion="explode" trigger="loop"></mo-icon>');
    expect(el.querySelector('svg')!.dataset.motion).toBeUndefined();
    const odd = mount<HTMLElement>('<mo-icon name="sun" motion="spin" trigger="sometimes"></mo-icon>');
    odd.dispatchEvent(new Event('pointerenter'));
    expect(odd.querySelector('svg')!.dataset.run).toBe('once');
  });
});

describe('17.14 <mo-icon> under reduced motion', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.14');
  });
  it('never runs a motion', () => {
    const el = mount<any>('<mo-icon name="refresh" motion="spin" trigger="loop"></mo-icon>');
    expect(el.querySelector('svg').dataset.run).toBeUndefined();
    el.play();
    expect(el.querySelector('svg').dataset.run).toBeUndefined();
  });
});

describe('17.14 <mo-icon-picker>', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.14');
  });

  it('shows every icon with a count, filters by search and category, and says when nothing matches', () => {
    const el = mount<any>('<mo-icon-picker></mo-icon-picker>');
    const btns = () => Array.from(el.querySelectorAll('.usa-ipick-btn')).filter((b: any) => !b.hidden) as HTMLButtonElement[];
    expect(btns()).toHaveLength(503);
    expect(el.querySelector('.usa-ipick-count').textContent).toBe('503 icons');
    expect(el.querySelectorAll('.usa-ipick-cat')).toHaveLength(25);
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Search icons');
    input.value = 'arrow';
    input.dispatchEvent(new Event('input'));
    expect(btns().map((b) => b.dataset.icon)).toEqual(searchIcons('arrow'));
    expect(btns().filter((b) => b.tabIndex === 0)).toHaveLength(1);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    (el.querySelector('[data-category="weather"]') as HTMLButtonElement).click();
    expect(btns()).toHaveLength(iconNames('weather').length);
    expect(el.querySelector('[data-category="weather"]').getAttribute('aria-pressed')).toBe('true');
    el.search('qqq');
    expect(btns()).toHaveLength(0);
    expect(el.querySelector('.usa-ipick-empty').hidden).toBe(false);
    expect(el.querySelector('.usa-ipick-count').textContent).toBe('0 icons');
  });

  it('picks with a click, fills the form field, copies and emits', () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const form = mount<HTMLFormElement>('<form><mo-icon-picker name="icon" value="bell" copy="tag"></mo-icon-picker></form>');
    const el = form.querySelector('mo-icon-picker') as any;
    expect(el.value).toBe('bell');
    expect(el.querySelector('[data-icon="bell"]').getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('[data-icon="bell"]').tabIndex).toBe(0);
    const got = events(el, 'pick');
    (el.querySelector('[data-icon="send"]') as HTMLButtonElement).click();
    expect(el.value).toBe('send');
    expect(got).toEqual([{ name: 'send', category: 'communication', copied: true }]);
    expect(writeText).toHaveBeenCalledWith('<mo-icon name="send"></mo-icon>');
    expect(new FormData(form).get('icon')).toBe('send');
    expect(el.querySelector('[data-icon="bell"]').getAttribute('aria-pressed')).toBe('false');
    // another attribute rebuilds the grid and keeps the pick; a new value replaces it
    el.setAttribute('size', '32');
    expect(el.value).toBe('send');
    expect(el.querySelector('[data-icon="send"]').getAttribute('aria-pressed')).toBe('true');
    el.setAttribute('value', 'heart');
    expect(el.value).toBe('heart');
    expect(el.querySelector('[data-icon="heart"]').getAttribute('aria-pressed')).toBe('true');
    expect(new FormData(form).get('icon')).toBe('heart');
  });

  it('walks the grid with arrow keys, Home and End, and goes into it from the search field', () => {
    const el = mount<any>('<mo-icon-picker categories="time,shapes" compact></mo-icon-picker>');
    const all = Array.from(el.querySelectorAll('.usa-ipick-btn')) as HTMLButtonElement[];
    expect(all.map((b) => b.dataset.icon)).toEqual([...iconNames('shapes'), ...iconNames('time')]);
    expect(el.querySelectorAll('.usa-ipick-cat')).toHaveLength(3);
    expect(el.querySelector('.usa-ipick').hasAttribute('data-compact')).toBe(true);
    key(el.querySelector('input'), 'ArrowDown');
    expect(document.activeElement).toBe(all[0]);
    key(all[0], 'ArrowRight');
    expect(document.activeElement).toBe(all[1]);
    expect(all[1].tabIndex).toBe(0);
    expect(all[0].tabIndex).toBe(-1);
    key(all[1], 'End');
    expect(document.activeElement).toBe(all[all.length - 1]);
    key(all[all.length - 1], 'Home');
    expect(document.activeElement).toBe(all[0]);
  });

  it('takes Chinese labels', () => {
    const el = mount<any>('<mo-icon-picker label="图标" all-label="全部" count-label="{n} 个图标" category-labels="箭头,界面" categories="interface"></mo-icon-picker>');
    expect(el.querySelector('.usa-ipick').getAttribute('aria-label')).toBe('图标');
    expect(Array.from(el.querySelectorAll('.usa-ipick-cat')).map((b: any) => b.textContent)).toEqual(['全部', '界面']);
    expect(el.querySelector('.usa-ipick-count').textContent).toBe(`${iconNames('interface').length} 个图标`);
  });

  it('cleans up after itself', () => {
    const el = mount<HTMLElement>('<mo-icon-picker></mo-icon-picker>');
    el.remove();
    expect(el.children).toHaveLength(0);
  });
});

describe('17.14 icons: showcase and docs', () => {
  it('lists both elements in the catalog, the icons page and the home Collections', async () => {
    expect(icons.map((c: any) => c.id)).toEqual(['icon-picker', 'icon']);
    for (const c of icons as any[]) expect(c.since).toBe('17.14');
    const page = read('showcase/icons.html');
    expect(page).toContain('<mo-icon-picker');
    expect(page).toContain("defineWidgets('17.14')");
    expect(page).toContain('503');
    expect(read('showcase/index.html')).toContain('./icons.html');
    const { COLLECTIONS } = await import('../showcase/home-collections.js');
    const tab = (COLLECTIONS as any[])[0];
    expect(tab.id).toBe('icons');
    expect(tab.since).toBe('17.14');
    expect(tab.items.map((i: any) => i.id)).toEqual(['icon-picker', 'icon']);
  });

  it('names every icon and motion in the docs, and counts them in the READMEs and changelog', () => {
    const doc = read('docs/icons-17-14.md');
    for (const n of iconNames()) expect(doc, n).toContain(`\`${n}\``);
    for (const m of ICON_MOTIONS) expect(doc, m).toContain(`\`${m}\``);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('503');
    expect(read('CHANGELOG.md')).toContain('503 icons');
  });
});
