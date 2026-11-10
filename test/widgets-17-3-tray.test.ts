import { describe, it, expect } from 'vitest';
import { moName, toMo, encodeSelection, decodeSelection, selectionPrompt } from '../showcase/select-tray.js';
import { GALLERY, findComponent, componentSnippets } from '../showcase/components-catalog.js';
import { readFileSync } from 'node:fs';

describe('17.3 showcase selection tray (T5)', () => {
  it('names and snippets use mo-* tags; classes, attribute values and usa:* events stay', () => {
    expect(moName('usa-tabs')).toBe('mo-tabs');
    expect(moName('my-el')).toBe('my-el');
    const code = `<usa-tabs class="usa-sr" data-x="usa-tabs"></usa-tabs><script>document.querySelector('usa-tabs').addEventListener('usa:change', f)</script>`;
    expect(toMo(code)).toBe(`<mo-tabs class="usa-sr" data-x="usa-tabs"></mo-tabs><script>document.querySelector('mo-tabs').addEventListener('usa:change', f)</script>`);
  });
  it('share links keep order, drop duplicates / malformed / unknown ids and cap the list', () => {
    expect(encodeSelection(['mega-menu', 'tabs', 'mega-menu', 'Bad Id', '../x'])).toBe('#select=mega-menu,tabs');
    expect(encodeSelection([])).toBe('');
    expect(decodeSelection('#select=tabs,nope,mega-menu', (id) => id !== 'nope')).toEqual(['tabs', 'mega-menu']);
    expect(decodeSelection('#select=<script>', () => true)).toEqual([]);
    expect(decodeSelection('#cat-ui')).toEqual([]);
    expect(decodeSelection('#select=' + Array.from({ length: 40 }, (_, i) => 'c' + i).join(','))).toHaveLength(24);
  });
  it('copies a prompt with every picked component, its import lines, mo-* example and the note', () => {
    const items = ['mega-menu', 'breadcrumbs'].map((id) => findComponent(id));
    expect(items.every(Boolean)).toBe(true);
    const text = selectionPrompt(items.map((it: any) => ({ ...it, imports: componentSnippets(it).esm.split('\n\n').slice(0, 2).join('\n') })), 'en', { breadcrumbs: 'collapse after 3' });
    expect(text).toContain('1. <mo-mega-menu>');
    expect(text).toContain('2. <mo-breadcrumbs>');
    expect(text).toContain("import { defineMegaMenu } from 'motionary/components/widgets';");
    expect(text).toContain('defineMoAliases();');
    expect(text).toContain('Note: collapse after 3');
    expect(text).not.toMatch(/<usa-/);
    expect(selectionPrompt(items, 'zh')).toContain('请用 Motionary 实现');
  });
  it('the gallery wires a select button per card and the tray (status count, notes, copy prompt / link)', () => {
    const src = readFileSync('showcase/gallery.js', 'utf8');
    for (const s of ["'aria-pressed'", 'select-btn', "role: 'status'", 'tray.prompt', 'tray.link', 'decodeSelection(location.hash']) expect(src).toContain(s);
    expect(GALLERY.length).toBeGreaterThan(200);
  });
});
