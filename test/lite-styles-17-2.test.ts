import { describe, it, expect } from 'vitest';
import { COMPONENT_CATEGORIES } from '../src/components/index-tags';
import { categoryOf, loadCategoryStyles, loadedStyles } from '../src/components/perf';

describe('lite category styles', () => {
  it.each(Object.entries(COMPONENT_CATEGORIES))('resolves both names in %s', (category, tags) => {
    for (const tag of tags) {
      expect(categoryOf(tag)).toBe(category);
      expect(categoryOf('mo-' + tag.slice(4))).toBe(category);
    }
  });

  it('leaves unknown names unmapped', () => {
    for (const name of ['example-card', 'mo-custom', 'constructor', '__proto__'])
      expect(categoryOf(name)).toBeUndefined();
  });

  it('shares a pending request, then retries a failed category without disturbing the replacement', () => {
    const first = loadCategoryStyles('cards', '/one')!;
    expect(loadCategoryStyles('cards', '/one')).toBeNull();
    first.dispatchEvent(new Event('error'));
    expect(loadedStyles()).not.toContain('cards');
    expect(first.isConnected).toBe(false);
    const retry = loadCategoryStyles('cards', '/two')!;
    expect(retry.getAttribute('href')).toBe('/two/components/cards.css');
    first.dispatchEvent(new Event('error'));
    expect(loadCategoryStyles('cards', '/two')).toBeNull();
    expect(loadedStyles()).toContain('cards');
  });
});
