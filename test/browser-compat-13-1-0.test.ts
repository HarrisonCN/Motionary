// 13.1.0: unit-level guards for the bugs the real-browser suite (test/browser, Playwright) found. The browser specs are
// the authority; these keep the pure logic covered in the fast jsdom run as well.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { queryAttr } from '../src/components/base';
import { localeAttr } from '../src/components/widgets/shared';
import { scrollScene, killScenes, allScenes } from '../src/runtime/scroll';

describe('13.1.0 invalid attribute values fall back instead of throwing', () => {
  it('queryAttr: invalid selector → null, valid → element, empty → null', () => {
    document.body.innerHTML = '<div id="a"></div>';
    expect(queryAttr('x-invalid-%')).toBeNull();
    expect(queryAttr('#a')?.id).toBe('a');
    expect(queryAttr('')).toBeNull();
    expect(queryAttr(null)).toBeNull();
  });
  it('localeAttr: invalid tag → undefined (user locale), valid → canonical', () => {
    expect(localeAttr('x-invalid-%')).toBeUndefined();
    expect(localeAttr('')).toBeUndefined();
    expect(localeAttr('de-de')).toBe('de-DE');
  });
});

describe('13.1.0 runtime scrollScene: a bad edge throws before anything is registered', () => {
  afterEach(() => killScenes());
  it('no scene, no listener left behind', () => {
    document.body.innerHTML = '<section id="s" style="height:200px"></section>';
    const add = vi.spyOn(window, 'addEventListener');
    expect(() => scrollScene({ trigger: '#s', start: 'x-invalid-% 80%' })).toThrow(/\[motionary\] scroll: bad edge/);
    expect(() => scrollScene({ trigger: '#s', end: 'bottom nowhere' })).toThrow(/\[motionary\] scroll: bad edge/);
    expect(allScenes()).toHaveLength(0);
    expect(add.mock.calls.filter(([t]) => t === 'resize')).toHaveLength(0);
    add.mockRestore();
    const ok = scrollScene({ trigger: '#s', start: 'top 80%', end: '+=300' });
    expect(allScenes()).toEqual([ok]);
  });
});
