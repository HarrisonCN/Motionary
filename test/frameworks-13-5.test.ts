// 13.5.0: framework adaptation — lazy-property upgrade, React wrapper coverage, base.ts trims stay behavior-preserving.
import { describe, it, expect, vi } from 'vitest';
import { defineElement, adaptKeyframes } from '../src/components/base';
import { createUsaComponents, kebab, pascal } from '../src/components/frameworks/react';

let n = 0;
const uniq = (p: string) => `x135-${p}-${++n}`;

function defineToggle(tag: string) {
  return defineElement(tag, (Base) => class extends Base {
    _checked = false;
    sets = 0;
    get checked(): boolean { return this._checked; }
    set checked(v: boolean) { this.sets++; this._checked = !!v; this.setFlag('data-on', !!v); }
  });
}

describe('13.5.0: a property set before the element is defined goes through the setter', () => {
  it('own `checked` set before define (Vue .prop / Solid prop: / React 18 wrapper / Angular [prop]) reaches the accessor', () => {
    const tag = uniq('toggle');
    const el = document.createElement(tag) as any;
    el.checked = true; // plain own data property — the class does not exist yet
    expect(Object.prototype.hasOwnProperty.call(el, 'checked')).toBe(true);
    defineToggle(tag);
    document.body.appendChild(el); // upgrade + connect
    expect(Object.prototype.hasOwnProperty.call(el, 'checked')).toBe(false); // no longer shadows the accessor
    expect(el.sets).toBe(1);
    expect(el.checked).toBe(true);
    expect(el.hasAttribute('data-on')).toBe(true);
    el.checked = false; // later writes hit the setter, not a stale own property
    expect(el.sets).toBe(2);
    expect(el.hasAttribute('data-on')).toBe(false);
    el.remove();
  });
  it('own properties that are not class members are left alone', () => {
    const tag = uniq('plain');
    const el = document.createElement(tag) as any;
    el.custom = 42;
    defineToggle(tag);
    document.body.appendChild(el);
    expect(Object.prototype.hasOwnProperty.call(el, 'custom')).toBe(true);
    expect(el.custom).toBe(42);
    el.remove();
  });
  it('elements created after define are unaffected (no own copies, setter not called on connect)', () => {
    const tag = uniq('after');
    defineToggle(tag);
    const el = document.createElement(tag) as any;
    document.body.appendChild(el);
    expect(el.sets).toBe(0);
    el.checked = true;
    expect(el.sets).toBe(1);
    el.remove();
  });
});

describe('13.5.0: base.ts trims are behavior-preserving', () => {
  it('adaptKeyframes keeps timing keys and filters per level as before', () => {
    const f = [{ opacity: 0, transform: 'rotate(10deg)', rotate: '5deg', scale: '2', translate: '1px', offset: 0, easing: 'ease', composite: 'add' as const }];
    expect(adaptKeyframes(f as any, 'gentle')).toEqual([{ opacity: 0, translate: '1px', offset: 0, easing: 'ease', composite: 'add' }]);
    expect(adaptKeyframes(f as any, 'minimal')).toEqual([{ opacity: 0, offset: 0, easing: 'ease', composite: 'add' }]);
    expect(adaptKeyframes([{ transform: 'translateX(4px)' }], 'gentle')).toEqual([{ transform: 'translateX(4px)' }]);
    expect(adaptKeyframes(f as any, 'full')).toBe(f);
  });
});

describe('13.5.0: React wrappers cover every Usa* tag', () => {
  const React = {
    forwardRef: (fn: any) => ({ render: fn }),
    useRef: () => ({ current: null }),
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    createElement: vi.fn(),
  };
  it('widget wrappers (UsaSwitch, UsaPricing) exist and are cached; non-Usa keys are undefined', () => {
    const C = createUsaComponents(React as any);
    expect(C.UsaSwitch).toBeTruthy();
    expect(C.UsaSwitch).toBe(C.UsaSwitch);
    expect(C.UsaSwitch.displayName).toBe('UsaSwitch');
    expect(C.UsaPricing.displayName).toBe('UsaPricing');
    expect((C as any).Foo).toBeUndefined();
    expect((C as any).then).toBeUndefined(); // not thenable
  });
  it('kebab() is the inverse of pascal() for every shipped tag', async () => {
    const m = JSON.parse((await import('node:fs')).readFileSync('dist/manifest.json', 'utf8'));
    const tags: string[] = [...new Set<string>(JSON.stringify(m).match(/usa-[a-z0-9]+(?:-[a-z0-9]+)*/g) || [])].filter((t) => !/-$/.test(t));
    expect(tags.length).toBeGreaterThan(100);
    for (const t of tags) if (!/[a-z]\d/.test(t.replace(/-\d/g, ''))) expect(kebab(pascal(t))).toBe(t);
    for (const t of ['usa-switch', 'usa-auto-animate', 'usa-carousel-3d', 'usa-reveal']) expect(kebab(pascal(t))).toBe(t);
  });
});
