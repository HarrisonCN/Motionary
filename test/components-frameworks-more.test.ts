import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installComponentMocks, mount } from './components-setup';
import * as svelte from '../src/components/frameworks/svelte';
import * as solid from '../src/components/frameworks/solid';
import * as angular from '../src/components/frameworks/angular';
// @ts-ignore - untyped .mjs
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';

const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
});

describe('bindUsa()', () => {
  it('sets properties, maps short event names to usa:*, updates and destroys', () => {
    const el = mount('<div></div>') as any;
    const a = vi.fn();
    const b = vi.fn();
    const h = svelte.bindUsa(el, { props: { checked: true }, on: { change: a } });
    expect(el.checked).toBe(true);
    el.dispatchEvent(new CustomEvent('usa:change', { detail: 1 }));
    expect(a).toHaveBeenCalledTimes(1);
    h.update({ props: { checked: false }, on: { 'usa:change': b } });
    expect(el.checked).toBe(false);
    el.dispatchEvent(new CustomEvent('usa:change'));
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    h.destroy();
    el.dispatchEvent(new CustomEvent('usa:change'));
    expect(b).toHaveBeenCalledTimes(1);
    expect(svelte.usaEventName('flip')).toBe('usa:flip');
    expect(svelte.usaEventName('click:x')).toBe('click:x');
  });
});

describe('Svelte / Solid / Angular entries', () => {
  it('svelte: use:usa action and client-only defineUsa', () => {
    svelte.defineUsa(['click']);
    expect(customElements.get('usa-button')).toBeTruthy();
    const el = mount('<usa-toggle></usa-toggle>') as any;
    const fn = vi.fn();
    const act = svelte.usa(el, { on: { change: fn } });
    el.dispatchEvent(new CustomEvent('usa:change'));
    expect(fn).toHaveBeenCalled();
    act.destroy();
  });

  it('solid: directive reads the accessor and refreshes', () => {
    solid.defineUsa(['cards']);
    expect(customElements.get('usa-card')).toBeTruthy();
    const el = mount('<div></div>') as any;
    let v = 1;
    const d = solid.usa(el, () => ({ props: { index: v } }));
    expect(el.index).toBe(1);
    v = 2;
    d.refresh();
    expect(el.index).toBe(2);
  });

  it('angular: APP_INITIALIZER factory and usaDetail', () => {
    const init = angular.usaInitializer(['ui']);
    expect(typeof init).toBe('function');
    init()();
    expect(customElements.get('usa-tabs')).toBeTruthy();
    expect(angular.usaDetail(new CustomEvent('usa:change', { detail: { checked: true } }))).toEqual({ checked: true });
  });

  it('are published as entry points', () => {
    for (const n of ['svelte', 'solid', 'angular']) {
      expect(COMPONENT_ENTRIES[n]).toBe(`frameworks/${n}`);
      expect(pkg.exports[`./components/${n}`].import.default).toBe(`./dist/components/${n}.js`);
    }
  });

  it('hybrid-app docs cover MAUI, Flutter, Electron and Tauri', () => {
    const doc = readFileSync(resolve(root, 'docs/hybrid-apps.md'), 'utf8');
    for (const s of ['MAUI', 'HybridWebView', 'Flutter', 'webview_flutter', 'Electron', 'Tauri', 'prefers-reduced-motion', 'components.umd.js']) expect(doc, s).toContain(s);
  });
});
