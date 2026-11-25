import { afterEach, describe, expect, it } from 'vitest';
import { defineWidgets, ICON_CATEGORIES, ICONS, iconNames, iconCategory, iconParts, iconSvg, searchIcons } from '../src/components/widgets';
import { installComponentMocks } from './components-setup';
import { readFileSync } from 'node:fs';

const read = (f: string) => readFileSync(f, 'utf8');
const NEW = ['animals', 'music', 'gaming', 'transport', 'office', 'science', 'buildings', 'celebration', 'clothing', 'gestures'];
const ZH = ['动物', '音乐', '游戏', '交通', '办公', '科学', '建筑', '节庆', '服饰', '手势'];
const names = () => NEW.flatMap((id) => iconNames(id));

afterEach(() => document.body.replaceChildren());

describe('17.17 icons', () => {
  it('adds ten categories of 25 icons after the first twenty-four', () => {
    expect(ICON_CATEGORIES.slice(24).map((c) => c.id)).toEqual(NEW);
    expect(ICON_CATEGORIES.slice(24).map((c) => c.zh)).toEqual(ZH);
    for (const id of NEW) expect(iconNames(id), id).toHaveLength(25);
    expect(names()).toHaveLength(250);
    expect(new Set(names().map((n) => ICONS[n])).size).toBe(250);
    expect(iconCategory('cat')).toBe('animals');
    expect(iconCategory('guitar')).toBe('music');
    expect(iconCategory('chess-knight')).toBe('gaming');
    expect(iconCategory('red-envelope')).toBe('celebration');
    expect(iconCategory('swipe-left')).toBe('gestures');
  });

  it('finds the new icons by name and by category, in English or Chinese', () => {
    expect(searchIcons('动物')).toEqual(iconNames('animals'));
    expect(searchIcons('手势')).toEqual(iconNames('gestures'));
    expect(searchIcons('chess')).toEqual(['chess-knight', 'chess-pawn', 'chess-rook', 'chess-king']);
    expect(searchIcons('swipe')).toEqual(['swipe-left', 'swipe-right', 'swipe-up', 'swipe-down']);
    expect(searchIcons('music')).toEqual(['music', ...iconNames('music')]);
    expect(searchIcons('games dice')).toEqual(['dice', 'dice-pair']);
    expect(searchIcons('', 'clothing')).toEqual(iconNames('clothing'));
  });

  it('draws every new icon inside the 24 grid', () => {
    for (const n of names()) {
      const parts = iconParts(n);
      expect(parts.length, n).toBeGreaterThan(0);
      expect(iconSvg(n), n).toMatch(/^<svg [^>]*viewBox="0 0 24 24"/);
      for (const p of parts) {
        const a = Object.fromEntries(Object.entries(p.attrs).map(([k, v]) => [k, Number(v)]));
        if (p.tag === 'circle') {
          expect(a.cx - a.r, n).toBeGreaterThanOrEqual(0);
          expect(a.cy + a.r, n).toBeLessThanOrEqual(24);
        } else if (p.tag === 'rect') {
          expect(a.x + a.width, n).toBeLessThanOrEqual(24);
          expect(a.y + a.height, n).toBeLessThanOrEqual(24);
        } else {
          expect(p.attrs.d, n).toMatch(/^M[MmLlHhVvCcSsQqAaZz\d.,\s-]+$/);
        }
      }
    }
  });

  it('shows the new categories as picker chips with their Chinese labels', () => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.14');
    const box = document.createElement('div');
    box.innerHTML = `<mo-icon-picker category-labels="${ICON_CATEGORIES.map((c) => c.zh).join(',')}"></mo-icon-picker>`;
    document.body.append(box);
    const el = box.firstElementChild as any;
    expect(el.querySelectorAll('.usa-ipick-cat')).toHaveLength(35);
    expect(el.querySelector('[data-category="gestures"]').textContent).toBe('手势');
    (el.querySelector('[data-category="animals"]') as HTMLButtonElement).click();
    const shown = Array.from(el.querySelectorAll('.usa-ipick-btn')).filter((b: any) => !b.hidden) as HTMLElement[];
    expect(shown.map((b) => b.dataset.icon)).toEqual(iconNames('animals'));
  });

  it('is counted in the docs, the icons page, the READMEs and the changelog', async () => {
    const doc = read('docs/icons-17-14.md');
    expect(doc).toContain('## All 753 icons');
    for (const id of NEW) expect(doc, id).toContain(`(\`${id}\``);
    for (const n of names()) expect(doc, n).toContain(`\`${n}\``);
    const page = read('showcase/icons.html');
    expect(page).toContain(ZH.join(','));
    expect(page).toContain('data-spring-row');
    expect(page).toContain("defineWidgets('17.16')");
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) {
      expect(read(f), f).toContain('17.14–17.17');
      expect(read(f), f).toContain('753');
    }
    expect(read('CHANGELOG.md')).toContain('17.17 icons: the icon section grows from 503 to 753 icons');
    const { COLLECTIONS } = await import('../showcase/home-collections.js');
    expect((COLLECTIONS as any[]).find((c) => c.id === 'icons').title.en).toBe('753 icons');
  });
});
