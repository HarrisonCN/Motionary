import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMPONENT_CATEGORIES } from '../src/components';
// @ts-ignore - untyped .mjs
import { CATEGORIES } from '../scripts/categories.mjs';

const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

describe('component categories stay in sync', () => {
  it('scripts/categories.mjs lists the categories of src/components, in order', () => {
    expect(CATEGORIES).toEqual(Object.keys(COMPONENT_CATEGORIES));
  });

  it('every category has a source entry, a JS export and a CSS export', () => {
    for (const c of CATEGORIES) {
      expect(existsSync(resolve(root, `src/components/${c}/index.ts`)), c).toBe(true);
      expect(pkg.exports[`./components/${c}`], c).toBeTruthy();
      expect(pkg.exports[`./components/${c}.css`], c).toBe(`./dist/components/${c}.css`);
      expect(pkg.scripts['lint:package']).toContain(`./components/${c}.css`);
    }
  });

  it('tags are unique and prefixed usa-', () => {
    const tags = Object.values(COMPONENT_CATEGORIES).flat() as string[];
    expect(new Set(tags).size).toBe(tags.length);
    tags.forEach((t) => expect(t).toMatch(/^usa-[a-z0-9-]+$/));
  });
});
