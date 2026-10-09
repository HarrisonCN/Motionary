import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, fuzzyMatch, keyLabels, matchesKeys } from '../src/components/widgets';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { transform as codemod8 } from '../bin/usa-codemod-8.mjs';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('7.9 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.9'])).toEqual(["usa-command-palette", "usa-shortcut"]);
    for (const t of Object.keys(WIDGETS['7.9'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.9'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.9');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    for (const id of ["command-palette", "shortcut"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-command-palette", "<usa-shortcut"]) expect(doc).toContain(s);
  });
});


describe('7.9 widgets behave', () => {
  it('fuzzy matching, key labels and key matching', () => {
    expect(fuzzyMatch('nf', 'New file').score).toBeGreaterThan(0);
    expect(fuzzyMatch('nf', 'New file').hits).toEqual([0, 4]);
    expect(fuzzyMatch('zz', 'New file').score).toBe(-1);
    expect(fuzzyMatch('new', 'New file').score).toBeGreaterThan(fuzzyMatch('new', 'Renew wallet').score);
    expect(keyLabels('mod+shift+k', true)).toEqual(['⌘', '⇧', 'K']);
    expect(keyLabels('mod+shift+k', false)).toEqual(['Ctrl', 'Shift', 'K']);
    expect(matchesKeys(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }), 'mod+k', false)).toBe(true);
    expect(matchesKeys(new KeyboardEvent('keydown', { key: 'k', metaKey: true }), 'mod+k', true)).toBe(true);
    expect(matchesKeys(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true }), 'mod+k', false)).toBe(false);
    expect(matchesKeys(new KeyboardEvent('keydown', { key: 'Enter', altKey: true }), 'alt+enter', false)).toBe(true);
  });
  it('command palette: options, filter + highlight, arrows, Enter runs, close', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const p = mount<any>('<usa-command-palette hotkey="none"><option value="new" data-group="File" data-keys="mod+n">New file</option><option value="open" data-group="File">Open</option><option value="theme" data-group="View">Toggle theme</option></usa-command-palette>');
    expect(p.commands.map((c: any) => c.id)).toEqual(['new', 'open', 'theme']);
    expect(p.querySelectorAll('.usa-cp-group').length).toBe(2);
    expect(p.querySelectorAll('[role=option]').length).toBe(3);
    const open = vi.fn();
    const run = vi.fn();
    p.addEventListener('usa:open', open);
    p.addEventListener('usa:run', run);
    p.show();
    expect(p.opened).toBe(true);
    expect(open).toHaveBeenCalledTimes(1);
    const q = p.querySelector('.usa-cp-q');
    expect(q.getAttribute('role')).toBe('combobox');
    q.value = 'tt';
    q.dispatchEvent(new Event('input'));
    const opts = p.querySelectorAll('[role=option]');
    expect(opts.length).toBe(1);
    expect(opts[0].querySelectorAll('mark').length).toBe(2);
    q.value = '';
    q.dispatchEvent(new Event('input'));
    q.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(q.getAttribute('aria-activedescendant')).toBe(p.querySelectorAll('[role=option]')[1].id);
    expect(p.querySelectorAll('[role=option]')[1].getAttribute('aria-selected')).toBe('true');
    q.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(run.mock.calls[0][0].detail).toEqual({ id: 'open', label: 'Open' });
    expect(p.opened).toBe(false);
    p.setCommands([{ id: 'x', label: 'X <y>', keys: 'mod+x' }]);
    expect(p.querySelector('.usa-cp-label').textContent).toBe('X <y>');
    expect(p.querySelectorAll('kbd').length).toBe(2);
    const inl = mount<any>('<usa-command-palette inline hotkey="none"><option value="a">Alpha</option></usa-command-palette>');
    expect(inl.opened).toBe(true);
    const r2 = vi.fn();
    inl.addEventListener('usa:run', r2);
    inl.querySelector('.usa-cp-q').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(r2.mock.calls[0][0].detail.id).toBe('a');
    expect(inl.opened).toBe(true);
  });
  it('shortcut: keycaps, spoken label, hotkey press → usa:trigger + for', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const btn = mount<any>('<button id="go-btn">Go</button>');
    const clicked = vi.fn();
    btn.addEventListener('click', clicked);
    const s = mount<any>('<usa-shortcut keys="ctrl+shift+k" label="Search" for="go-btn"></usa-shortcut>');
    expect(Array.from(s.querySelectorAll('kbd')).map((k: any) => k.textContent)).toEqual(s.labels);
    expect(s.querySelector('[role=img]').getAttribute('aria-label')).toMatch(/K$/);
    expect(s.querySelector('.usa-sk-label').textContent).toBe('Search');
    const trig = vi.fn();
    s.addEventListener('usa:trigger', trig);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', ctrlKey: true, shiftKey: true, bubbles: true }));
    expect(trig).toHaveBeenCalledTimes(1);
    expect(clicked).toHaveBeenCalledTimes(1);
    const quiet = mount<any>('<usa-shortcut keys="ctrl+j" listen="false"></usa-shortcut>');
    const t2 = vi.fn();
    quiet.addEventListener('usa:trigger', t2);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, bubbles: true }));
    expect(t2).not.toHaveBeenCalled();
  });
  it('8.0 deprecations: <usa-rating> warns once; star-rating is a drop-in; codemod-8', async () => {
    const { defineRating } = await import('../src/components/ui');
    defineRating();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount('<usa-rating value="2"></usa-rating>');
    mount('<usa-rating value="3"></usa-rating>');
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('<usa-rating> is deprecated')).length).toBe(1);
    const sr = mount<any>('<usa-star-rating value="2" icon="♥" name="stars"></usa-star-rating>');
    expect((customElements.get('usa-star-rating') as any).formAssociated).toBe(true);
    expect(sr.querySelector('path').getAttribute('d')).toContain('M12 21s');
    const change = vi.fn();
    sr.addEventListener('change', change);
    sr.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(sr.value).toBe(3);
    expect(change).toHaveBeenCalledTimes(1);
    const r = codemod8('<usa-rating value="4" icon="♥" variant="x" style="--usa-rating-on:red"></usa-rating>\nimport { defineRating } from "x";');
    expect(r.code).toContain('<usa-star-rating value="4" icon="heart" style="--usa-star-on:red"></usa-star-rating>');
    expect(r.changes.length).toBe(2);
    expect(r.manual.some((m: string) => m.includes('defineStarRating'))).toBe(true);
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.bin['usa-codemod-8']).toBe('./bin/usa-codemod-8.mjs');
    expect(readFileSync('docs/upgrading-8.md', 'utf8')).toContain('usa-codemod-8');
  });
});
