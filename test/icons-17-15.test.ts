import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineWidgets, ICON_CATEGORIES, iconNames, iconCategory, iconParts, iconSvg, searchIcons } from '../src/components/widgets';
import { installComponentMocks } from './components-setup';
import { readFileSync } from 'node:fs';

const read = (f: string) => readFileSync(f, 'utf8');
const NEW = ['development', 'security', 'health', 'food', 'household', 'sports', 'education', 'finance', 'charts', 'tools'];

afterEach(() => document.body.replaceChildren());

describe('17.15 icons', () => {
  it('adds ten categories of 25 icons after the first fourteen', () => {
    const ids = ICON_CATEGORIES.map((c) => c.id);
    expect(ids.slice(14)).toEqual(NEW);
    expect(ICON_CATEGORIES.slice(14).map((c) => c.zh)).toEqual(['开发', '安全', '健康', '餐饮', '家居', '运动', '教育', '金融', '图表', '工具']);
    for (const id of NEW) expect(iconNames(id), id).toHaveLength(25);
    expect(NEW.flatMap((id) => iconNames(id))).toHaveLength(250);
    expect(iconCategory('coffee')).toBe('food');
    expect(iconCategory('git-branch')).toBe('development');
    expect(iconCategory('chart-candles')).toBe('charts');
    expect(iconCategory('hammer')).toBe('tools');
  });

  it('finds the new icons by name and by category, in English or Chinese', () => {
    expect(searchIcons('git')).toEqual(['git-branch', 'git-commit', 'git-merge', 'git-pull-request', 'git-fork', 'git-compare']);
    expect(searchIcons('shield')).toEqual(['shield', 'shield-check', 'shield-alert', 'shield-off', 'shield-plus', 'shield-x']);
    expect(searchIcons('chart')).toEqual(['bar-chart', ...iconNames('charts')]);
    expect(searchIcons('健康')).toEqual(iconNames('health'));
    expect(searchIcons('food cake')).toEqual(['cake']);
    expect(searchIcons('', 'tools')).toEqual(iconNames('tools'));
  });

  it('draws every new icon as markup on the 24 grid', () => {
    for (const n of NEW.flatMap((id) => iconNames(id))) {
      expect(iconParts(n).length, n).toBeGreaterThan(0);
      expect(iconSvg(n), n).toMatch(/^<svg [^>]*viewBox="0 0 24 24"/);
    }
  });

  it('shows the new categories as picker chips, with labels past the first twenty', () => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.14');
    const box = document.createElement('div');
    box.innerHTML = `<mo-icon-picker category-labels="${ICON_CATEGORIES.map((c) => c.zh).join(',')}"></mo-icon-picker>`;
    document.body.append(box);
    const el = box.firstElementChild as any;
    expect(el.querySelector('[data-category="tools"]').textContent).toBe('工具');
    (el.querySelector('[data-category="sports"]') as HTMLButtonElement).click();
    const shown = Array.from(el.querySelectorAll('.usa-ipick-btn')).filter((b: any) => !b.hidden) as HTMLElement[];
    expect(shown.map((b) => b.dataset.icon)).toEqual(iconNames('sports'));
    el.remove();
    const only = document.createElement('div');
    only.innerHTML = '<mo-icon-picker categories="arrows,interface,media,files,communication,devices,weather,commerce,editor,travel,people,nature,shapes,time,development,security,health,food,household,sports,education,finance,charts,tools"></mo-icon-picker>';
    document.body.append(only);
    expect(only.querySelectorAll('.usa-ipick-cat')).toHaveLength(25);
  });

  it('is counted in the docs, the icons page, the READMEs and the changelog', () => {
    const doc = read('docs/icons-17-14.md');
    expect(doc).toContain('## All 503 icons');
    for (const id of NEW) expect(doc, id).toContain(`(\`${id}\``);
    expect(read('showcase/icons.html')).toContain('开发,安全,健康,餐饮,家居,运动,教育,金融,图表,工具');
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) expect(read(f), f).toContain('17.14–17.15');
    expect(read('CHANGELOG.md')).toContain('17.15 icons: the icon section grows from 253 to 503 icons');
  });
});
