import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { createDrawer, mountCodeDrawers, snippetsFor, cleanMarkup, lookSnippets, LOOK_TABS } from '../showcase/code-drawer.js';
import { COMPONENT_ITEMS, RELEASE_COMPONENTS } from '../showcase/catalog-components.js';
import { ITEMS } from '../showcase/catalog.js';
import { generate } from '../showcase/codegen.js';
import { CODE_TABS, toJsx } from '../showcase/components-catalog.js';
import { COLLECTIONS } from '../showcase/home-collections.js';

const read = (f: string) => readFileSync(f, 'utf8');

/**
 * 17.17 fix: the parts added from 17.4 on could not be opened into code tabs and copied the way the older
 * ones could (component gallery card → "</> Code", Store card → detail with code tabs). Every one of them
 * now has the same drawer, on its own page, in the home Collections and as a Store card.
 */
describe('17.17 code drawers', () => {
  beforeEach(() => {
    document.documentElement.lang = 'zh-CN';
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('every release part from 17.4 to 17.17 is a Store card with every code tab', () => {
    const ids = new Set(COMPONENT_ITEMS.map((i: any) => i.gallery));
    for (const c of COLLECTIONS as any[]) for (const item of c.items) expect(ids.has(item.id), `${c.id}: ${item.id}`).toBe(true);
    for (const id of ['spring-like', 'spring-toasts', 'micro', 'micro-switch', 'icon-picker', 'icon', 'bar-race', 'luminous-switch']) expect(ids.has(id), id).toBe(true);
    expect(RELEASE_COMPONENTS.length).toBeGreaterThanOrEqual(200);
    expect(new Set(ITEMS.map((i: any) => i.id)).size).toBe(ITEMS.length);
    for (const it of COMPONENT_ITEMS.filter((i: any) => RELEASE_COMPONENTS.some((c: any) => c.id === i.gallery)) as any[]) {
      const tabs = generate(it, {}, {});
      for (const k of ['vanilla', 'react', 'vue', 'svelte', 'solid', 'element', 'cdn']) expect(tabs[k], `${it.id}:${k}`).toBeTruthy();
      expect(tabs.vanilla, it.id).toContain('motionary/components/widgets');
    }
  });

  it('writes the snippets for the markup a page wrote, with every element it uses defined', () => {
    const s = snippetsFor('micro', '<mo-micro fx="press" feel="bouncy" id="target" style="border-radius:14px">\n  <button type="button"><mo-icon name="cat"></mo-icon></button>\n</mo-micro>')!;
    for (const tab of CODE_TABS) expect(s[tab.id], tab.id).toBeTruthy();
    expect(s.html).toContain('<mo-micro fx="press" feel="bouncy" style="border-radius:14px">');
    expect(s.html).not.toContain('id="target"');
    expect(s.esm).toContain("import { defineMicro, defineIcon } from 'motionary/components/widgets';");
    expect(s.esm).toMatch(/defineMicro\(\);[^\n]*\ndefineIcon\(\); \/\/ registers <mo-icon>/);
    expect(s.react).toContain("style={{ borderRadius: '14px' }}");
    expect(s.desktop).toContain('defineIcon();');
    expect(snippetsFor('no-such-part')).toBeNull();
    expect(cleanMarkup('<mo-x id="a" data-log="b">\n\n</mo-x>')).toBe('<mo-x>\n</mo-x>');
    expect(toJsx('<b data-style="x" style="--a: 1; margin-top: 2px">')).toBe(`<b data-style="x" style={{ '--a': '1', marginTop: '2px' }}>`);
  });

  it('opens into one code box per flavour and copies the one shown', async () => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => { copied = t; } } });
    const d = createDrawer({ id: 'spring-like', markup: '<mo-spring-like count="128" label="点赞"></mo-spring-like>' })!;
    document.body.append(d.el);
    expect(d.el.localName).toBe('details');
    expect(d.el.querySelector('summary')!.textContent).toContain('代码');
    const buttons = [...d.el.querySelectorAll<HTMLButtonElement>('.mo-code-tabs button')];
    expect(buttons.map((b) => b.textContent)).toEqual(CODE_TABS.map((t) => t.zh));
    d.el.open = true;
    d.el.dispatchEvent(new Event('toggle'));
    buttons[2].click();
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
    expect(d.el.querySelector('pre')!.textContent).toContain('export function Demo()');
    const copy = d.el.querySelector<HTMLButtonElement>('.mo-code-copy')!;
    expect(copy.textContent).toBe('复制代码');
    copy.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(copied).toContain('import { defineSpringLike }');
    expect(copied).toContain('<mo-spring-like count="128" label="点赞"></mo-spring-like>');
    expect(copy.dataset.state).toBe('ok');
    d.update('<mo-spring-like count="7"></mo-spring-like>');
    expect(d.code).toContain('count="7"');
    document.documentElement.lang = 'en';
    d.relabel();
    expect(d.el.querySelector('summary')!.textContent).toContain('Code');
  });

  it('mounts one drawer per card that holds a known part, reading the markup before it upgrades', () => {
    document.body.innerHTML = '<main><article><div><mo-spring-like count="1" id="a"></mo-spring-like><mo-spring-like count="2"></mo-spring-like></div><p>x</p></article><article><p>no part</p></article></main>';
    const made = mountCodeDrawers(document);
    expect(made).toHaveLength(1);
    const cards = document.querySelectorAll('article');
    expect(cards[0].lastElementChild!.classList.contains('mo-code')).toBe(true);
    expect(cards[1].querySelector('.mo-code')).toBeNull();
    expect(made[0].code).toContain('<mo-spring-like count="1"></mo-spring-like>\n<mo-spring-like count="2"></mo-spring-like>');
    expect(mountCodeDrawers(document)).toHaveLength(0);
    document.body.innerHTML = '<main><article data-mo-code="spring-toasts"><button>show</button></article></main><mo-spring-toasts position="bottom-end" id="t"></mo-spring-toasts>';
    const [toasts] = mountCodeDrawers(document);
    expect(toasts.code).toContain('<mo-spring-toasts position="bottom-end"></mo-spring-toasts>');
  });

  it('gives a look ES module, React, Vue and CSS-variable code', () => {
    const s = lookSnippets({ name: 'clay-cherry', info: { family: 'parts', feel: 'playful' }, tokens: { '--mo-kit-ink': '#222', '--mo-kit-radius': '18px' }, count: 680 });
    expect(Object.keys(s)).toEqual(LOOK_TABS.map((t) => t.id));
    expect(s.esm).toContain("adoptLooks('parts')");
    expect(s.esm).toContain('<section data-mo-look="clay-cherry">');
    expect(s.esm).toContain('"playful"');
    expect(s.css).toContain('[data-mo-look="clay-cherry"] {\n  --mo-kit-ink: #222;\n  --mo-kit-radius: 18px;\n}');
    const d = createDrawer({ tabs: LOOK_TABS, snippets: s })!;
    expect([...d.el.querySelectorAll('.mo-code-tabs button')].map((b) => b.textContent)).toEqual(['ES 模块', 'React', 'Vue', 'CSS 变量']);
  });

  it('is wired into the new pages and the home Collections', () => {
    for (const f of ['showcase/springs.html', 'showcase/micro.html']) {
      const page = read(f);
      const auto = page.indexOf('<script type="module" src="./code-drawer.js" data-auto></script>');
      expect(auto, f).toBeGreaterThan(0);
      expect(auto, f).toBeLessThan(page.lastIndexOf('<script type="module">'));
    }
    expect(read('showcase/icons.html')).toContain("createDrawer({ id: 'icon-picker'");
    expect(read('showcase/icons.html')).toContain('iconDrawer.update(code.textContent)');
    expect(read('showcase/looks.html')).toContain('lookDrawer.update(lookCode(name))');
    const home = read('showcase/home-collections.js');
    expect(home).toContain("createDrawer({ id: item.id })");
    expect(home).toContain('createDrawer({ tabs: LOOK_TABS');
    expect(read('showcase/styles.css')).toContain('.col-card:has(> .col-meta > .mo-code[open])');
    expect(read('CHANGELOG.md')).toContain('17.17 showcase: the code drawer is back on every new part');
  });
});
