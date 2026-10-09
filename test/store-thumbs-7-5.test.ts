import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { COMPONENT_ITEMS, COMPONENT_CATEGORY } from '../showcase/catalog-components.js';
import { ITEMS, FRAMEWORK_ITEMS } from '../showcase/catalog.js';
import { findComponent } from '../showcase/components-catalog.js';

/**
 * 7.5 fix: Store cards in "Components 6.x–7.x" and "Frameworks" used to show a generic
 * purple tile with a bouncing emoji / letter. Every thumbnail is now a live demo.
 */
const app = readFileSync('showcase/app.js', 'utf8');
const css = readFileSync('showcase/styles.css', 'utf8');

describe('7.5 Store live thumbnails', () => {
  it('no Store item carries a glyph placeholder, and app.js never renders one', () => {
    for (const item of ITEMS as any[]) expect(item.glyph, item.id).toBeUndefined();
    expect(app).not.toMatch(/\.glyph\b|' glyph'/);
  });
  it('every component card maps to a gallery demo that thumb.html renders', () => {
    expect(COMPONENT_ITEMS.length).toBeGreaterThanOrEqual(90);
    for (const it of COMPONENT_ITEMS as any[]) {
      const g: any = findComponent(it.gallery);
      expect(g, it.id).toBeTruthy();
      expect(String(g.demo), it.id).toMatch(/<usa-/);
    }
    expect(existsSync('showcase/thumb.html')).toBe(true);
    const thumb = readFileSync('showcase/thumb.js', 'utf8');
    expect(thumb).toContain('findComponent');
    expect(thumb).toContain('WIRES');
    expect(readFileSync('showcase/thumb.html', 'utf8')).toContain('thumb.js');
  });
  it('component thumbnails mount lazily (IntersectionObserver) and are inert on cards', () => {
    expect(app).toMatch(/function liveComponent[\s\S]*IntersectionObserver/);
    expect(app).toMatch(/mode=\$\{interactive \? 'detail' : 'card'\}/);
    expect(css).toMatch(/\.card-stage \.live-thumb, \.mini-stage \.live-thumb \{ pointer-events: none; \}/);
  });
  it('framework cards: live scroll demo through the adapter + a code snippet', () => {
    expect(FRAMEWORK_ITEMS.length).toBe(5);
    for (const f of FRAMEWORK_ITEMS as any[]) {
      expect(f.thumbCode, f.id).toBeTruthy();
      expect(f.thumbCode.split('\n').length).toBeLessThanOrEqual(8);
    }
    expect(app).toMatch(/createReactHooks\(React\)/);
    expect(app).toMatch(/createVueComposables\(Vue\)/);
    expect(app).toMatch(/mod\.scrollAnimate\(tile, opts\)/);
  });
  it('the category is no longer labelled 6.x only', () => {
    expect(COMPONENT_CATEGORY.zh).toBe('组件 6.x–7.x');
  });
  it('showcase icon CSS does not shrink SVGs inside live demos (gauge/sparkline regression)', () => {
    expect(css).not.toMatch(/^svg:not\(\[width\]\) \{/m);
    expect(css).toMatch(/:where\(svg:not\(\[width\]\):not\(\.ccard-stage svg/);
  });
});
