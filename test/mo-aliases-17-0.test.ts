// 17.0.0 — naming: `mo-*` aliases (owner review 2026-10-15, item 3). Tests first (failing-before:
// v17.0.0/failing-before-mo-aliases.txt).
// - every `<usa-*>` element registered through defineElement also gets a `<mo-*>` alias (a subclass, so both tags work
//   and behave the same); custom tags (defineX('my-tag')) get no alias.
// - the alias carries the component's light-DOM CSS with tag selectors renamed (adopted on first connect, so pages that
//   never use mo-* pay nothing); declarations, classes and custom properties are untouched.
// - tag lookups inside components accept both names (toaster, loading bar, cart drawer, lottie, lazy loading).
// - window.MotionaryComponents is the same object as window.UsaComponents (UMD footer); `mo-codemod` bin forwards to the
//   usa-codemod runner; usa-* keeps working and is documented as deprecated, removal not before a future major.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

describe('17.0 mo-* element aliases', () => {
  it('every defined usa-* component and widget has a mo-* alias', async () => {
    const base: any = await import('../src/components/base');
    const { defineComponents } = await import('../src/components/index');
    const { defineWidgets } = await import('../src/components/widgets/index');
    const { COMPONENT_CATEGORIES } = await import('../src/components/index-tags');
    defineComponents();
    defineWidgets();
    expect(base.aliasTag('usa-switch')).toBe('mo-switch');
    expect(base.aliasTag('my-switch')).toBeNull();
    const tags = Object.values(COMPONENT_CATEGORIES).flat() as string[];
    let n = 0;
    for (const t of tags) {
      if (!customElements.get(t)) continue;
      n++;
      const a = customElements.get('mo-' + t.slice(4));
      expect(a, t).toBeTruthy();
      expect(a!.prototype instanceof customElements.get(t)!, t).toBe(true);
    }
    expect(n).toBeGreaterThan(80);
    expect(customElements.get('mo-switch')).toBeTruthy();
  }, 60000);
  it('a <mo-switch> behaves like <usa-switch> (role, keyboard, usa:change) and gets renamed CSS on connect', async () => {
    const { defineSwitch } = await import('../src/components/widgets/switch');
    defineSwitch();
    const el: any = document.createElement('mo-switch');
    el.setAttribute('label', 'Wifi');
    document.body.appendChild(el);
    await new Promise((r) => setTimeout(r, 0));
    const seen: boolean[] = [];
    el.addEventListener('usa:change', (e: any) => seen.push(e.detail.checked));
    el.click(); // usa:change is for user input (click / Space / Enter), not for toggle() from code
    expect(el.checked).toBe(true);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.checked).toBe(false);
    expect(seen).toEqual([true, false]);
    expect(el.querySelector('[role="switch"]') || (el.getAttribute('role') === 'switch' ? el : null)).toBeTruthy();
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')
      + [...((document as any).adoptedStyleSheets || [])].map((s: any) => [...s.cssRules].map((r: any) => r.cssText).join('\n')).join('\n');
    expect(css).toMatch(/mo-switch\s*\{/);
    el.remove();
  });
  it('aliasCss renames tag selectors only', async () => {
    const { aliasCss } = await import('../src/components/base');
    const out = aliasCss('usa-tabs{--usa-x:1;animation:usa-spin 1s}usa-tabs>usa-tab .usa-ind,[data-usa-a] usa-tab:hover{color:red}@media (min-width:1px){usa-tab{top:0}}@keyframes usa-spin{to{opacity:1}}');
    expect(out).toContain('mo-tabs{--usa-x:1;animation:usa-spin 1s}');
    expect(out).toContain('mo-tabs>mo-tab .usa-ind,[data-usa-a] mo-tab:hover{');
    expect(out).toContain('{mo-tab{top:0}}');
    expect(out).toContain('@keyframes usa-spin{');
  });
  it('lookups inside components accept both names', async () => {
    const { categoryOfTag } = await import('../src/components/lazy');
    expect(categoryOfTag('mo-button')).toBe(categoryOfTag('usa-button'));
    expect(categoryOfTag('mo-button')).toBeTruthy();
    for (const f of ['src/components/feedback/toast.ts', 'src/components/page/loading-bar.ts', 'src/components/widgets/add-to-cart.ts', 'src/components/fx2/lottie.ts']) {
      const s = read(f);
      for (const m of s.matchAll(/(?:querySelector|closest|matches)\('(usa-[a-z-]+)'\)/g)) throw new Error(`${f}: ${m[0]} ignores the mo-* alias`);
    }
  });
});

describe('17.0 MotionaryComponents + mo-codemod + deprecation notice', () => {
  it('UMD build exposes window.MotionaryComponents as the same object as window.UsaComponents', () => {
    expect(read('rollup.config.mjs')).toContain('window.MotionaryComponents=window.UsaComponents');
  });
  it('mo-codemod bin forwards to the usa-codemod runner', async () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.bin['mo-codemod']).toBe('./bin/mo-codemod.mjs');
    expect(existsSync(join(ROOT, 'bin/mo-codemod.mjs'))).toBe(true);
    expect(read('bin/mo-codemod.mjs')).toContain('runCodemod');
    for (const k of Object.keys(pkg.bin).filter((k) => k.startsWith('usa-codemod'))) expect(pkg.bin[k]).toBeTruthy();
  });
  it('usa-* is documented as deprecated in favour of mo-*, removal not before a future major', () => {
    const d = read('docs/deprecations-v17.md');
    expect(d).toMatch(/mo-\*/);
    expect(d).toMatch(/usa-\*/);
    expect(d).toMatch(/not before|no earlier than/i);
    expect(d).toContain('MotionaryComponents');
    expect(d).toContain('mo-codemod');
  });
});
