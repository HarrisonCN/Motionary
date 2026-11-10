import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { defineMegaMenu } from '../src/entries/widgets/mega-menu';
import { HOVER_FX, registerHoverPack } from '../src/components/fx2/hover';
import { EFFECT_PACKS } from '../src/components/fx2';
import { bindEffect, getEffect } from '../src/components/fx/registry';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { readFileSync } from 'node:fs';

const flush = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));
const pointer = (el: Element, type: string, init: Record<string, unknown> = {}) => {
  const e = new Event(type, { bubbles: type !== 'pointerenter' && type !== 'pointerleave', cancelable: true });
  Object.assign(e, { pointerType: 'mouse', clientX: 10, clientY: 10, ...init });
  el.dispatchEvent(e);
};

const NAV = (tag: string) => `<${tag} id="nav" label="Primary">
  <div><button id="t0">Products</button><div data-panel><a href="#a" id="a0">SDK</a><a href="#b">CLI</a></div></div>
  <div><button id="t1">Resources</button><div data-panel><a href="#c" id="a1">Docs</a></div></div>
  <a href="#p" id="t2">Pricing</a>
</${tag}>`;

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  document.documentElement.style.overflow = '';
  defineWidgets();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  configureComponents({ reducedMotion: 'user' });
});

describe('17.3 mo-* default names', () => {
  it('defineWidgets() registers the mo-* names next to the deprecated usa-* names', () => {
    for (const tag of Object.keys(WIDGETS['17.3'])) {
      expect(customElements.get(tag)).toBeTruthy();
      expect(customElements.get(tag.replace(/^usa-/, 'mo-'))).toBeTruthy();
    }
    expect(customElements.get('mo-carousel')).toBeTruthy(); // older widgets too: defineWidgets() turns on the aliases
  });
  it('the per-component entry of a 17.3 widget registers its mo-* name by itself', () => {
    defineMegaMenu();
    const mo = customElements.get('mo-mega-menu')!;
    const usa = customElements.get('usa-mega-menu')!;
    expect(Object.getPrototypeOf(mo) === usa || Object.getPrototypeOf(usa) === mo || mo === usa).toBe(true);
  });
  it('the source registers mo-* without the alias entry (no ../mo import in the 17.3 widgets)', () => {
    for (const f of ['nav-panels', 'fullscreen-menu', 'breadcrumbs']) {
      const src = readFileSync(`src/components/widgets/${f}.ts`, 'utf8');
      expect(src).toContain('defineMoName(tag, C)');
      expect(src).not.toMatch(/from '\.\.\/mo'/);
    }
  });
});

describe.each(['mo-mega-menu', 'mo-nav-flyout'])('17.3 <%s>', (tag) => {
  it('is a named navigation landmark with disclosure buttons and hidden panels', () => {
    document.body.innerHTML = NAV(tag);
    const nav = document.getElementById('nav')!;
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Primary');
    const t0 = document.getElementById('t0')!;
    const panel = document.getElementById(t0.getAttribute('aria-controls')!)!;
    expect(panel.hasAttribute('data-panel')).toBe(true);
    expect(t0.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    expect(document.getElementById('t2')!.hasAttribute('aria-expanded')).toBe(false);
    expect(nav.querySelector('.usa-np-bg')!.getAttribute('aria-hidden')).toBe('true');
  });
  it('click toggles and switches panels, emitting usa:open / usa:close with the index', () => {
    document.body.innerHTML = NAV(tag);
    const nav = document.getElementById('nav') as any;
    const log: string[] = [];
    nav.addEventListener('usa:open', (e: CustomEvent) => log.push('open' + e.detail.index));
    nav.addEventListener('usa:close', (e: CustomEvent) => log.push('close' + e.detail.index));
    document.getElementById('t0')!.click();
    expect(nav.openIndex).toBe(0);
    expect(document.getElementById('t0')!.getAttribute('aria-expanded')).toBe('true');
    document.getElementById('t1')!.click();
    expect(nav.openIndex).toBe(1);
    expect(document.getElementById('t0')!.getAttribute('aria-expanded')).toBe('false');
    document.getElementById('t1')!.click();
    expect(nav.openIndex).toBe(-1);
    expect(log).toEqual(['open0', 'open1', 'close1']);
  });
  it('keyboard: ←/→ / Home / End move between triggers, ↓ opens and focuses the panel, Esc closes and returns focus', () => {
    document.body.innerHTML = NAV(tag);
    const nav = document.getElementById('nav') as any;
    const t0 = document.getElementById('t0')!;
    t0.focus();
    key(t0, 'ArrowRight');
    expect(document.activeElement!.id).toBe('t1');
    key(document.activeElement!, 'End');
    expect(document.activeElement!.id).toBe('t2');
    key(document.activeElement!, 'ArrowRight');
    expect(document.activeElement!.id).toBe('t0');
    key(t0, 'ArrowDown');
    expect(nav.openIndex).toBe(0);
    expect(document.activeElement!.id).toBe('a0');
    key(document.activeElement!, 'Escape');
    expect(nav.openIndex).toBe(-1);
    expect(document.activeElement).toBe(t0);
  });
  it('hover intent: opens after the delay, closes after the pointer leaves; touch does not open on hover', () => {
    vi.useFakeTimers();
    document.body.innerHTML = NAV(tag);
    const nav = document.getElementById('nav') as any;
    pointer(document.getElementById('t0')!, 'pointerover', { pointerType: 'touch' });
    vi.advanceTimersByTime(500);
    expect(nav.openIndex).toBe(-1);
    pointer(document.getElementById('t0')!, 'pointerover');
    vi.advanceTimersByTime(60);
    expect(nav.openIndex).toBe(-1);
    vi.advanceTimersByTime(100);
    expect(nav.openIndex).toBe(0);
    pointer(document.getElementById('t1')!, 'pointerover');
    expect(nav.openIndex).toBe(1); // switching is immediate once a panel is open
    pointer(nav, 'pointerleave');
    vi.advanceTimersByTime(300);
    expect(nav.openIndex).toBe(-1);
  });
  it('closes when focus leaves the bar or on an outside pointerdown, and when disconnected', () => {
    document.body.innerHTML = NAV(tag) + '<button id="out">x</button>';
    const nav = document.getElementById('nav') as any;
    document.getElementById('t0')!.click();
    document.getElementById('t0')!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.getElementById('out') }));
    expect(nav.openIndex).toBe(-1);
    document.getElementById('t0')!.click();
    pointer(document.body, 'pointerdown');
    expect(nav.openIndex).toBe(-1);
    document.getElementById('t1')!.click();
    nav.remove();
    expect(nav.openIndex).toBe(-1);
  });
  it('reduced motion: panels switch without animating', () => {
    installComponentMocks({ reducedMotion: true });
    document.body.innerHTML = NAV(tag);
    anims.length = 0;
    document.getElementById('t0')!.click();
    document.getElementById('t1')!.click();
    expect(anims.length).toBe(0);
    expect((document.getElementById('nav') as any).openIndex).toBe(1);
  });
});

describe('17.3 <mo-fullscreen-menu>', () => {
  const html = '<mo-fullscreen-menu id="fm" label="Site menu"><a href="#h" id="l0" data-preview="/a.jpg">Home</a><a href="#w" id="l1" data-preview="javascript:alert(1)">Work</a></mo-fullscreen-menu><button id="after">after</button>';
  it('renders a button and a hidden modal dialog holding the links', () => {
    document.body.innerHTML = html;
    const fm = document.getElementById('fm')!;
    const btn = fm.querySelector('.usa-fm-toggle')!;
    const layer = fm.querySelector('.usa-fm-layer') as HTMLElement;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-controls')).toBe(layer.id);
    expect(btn.getAttribute('aria-label')).toBe('Site menu');
    expect(layer.getAttribute('role')).toBe('dialog');
    expect(layer.getAttribute('aria-modal')).toBe('true');
    expect(layer.hidden).toBe(true);
    expect(layer.querySelector('nav #l0')).toBeTruthy();
  });
  it('opens: focus to the first link, scroll lock, events; Esc closes and restores focus and scrolling', async () => {
    document.body.innerHTML = html;
    const fm = document.getElementById('fm') as any;
    const btn = fm.querySelector('.usa-fm-toggle') as HTMLButtonElement;
    const log: string[] = [];
    fm.addEventListener('usa:open', () => log.push('open'));
    fm.addEventListener('usa:close', () => log.push('close'));
    btn.click();
    expect(fm.open).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement!.id).toBe('l0');
    expect(document.documentElement.style.overflow).toBe('hidden');
    key(document.activeElement!, 'Escape');
    expect(fm.open).toBe(false);
    expect(document.activeElement).toBe(btn);
    expect(document.documentElement.style.overflow).toBe('');
    anims.forEach((a) => a.finish());
    await flush();
    expect((fm.querySelector('.usa-fm-layer') as HTMLElement).hidden).toBe(true);
    expect(log).toEqual(['open', 'close']);
  });
  it('keeps focus inside: Tab from the last link and Shift+Tab from the button wrap', () => {
    document.body.innerHTML = html;
    const fm = document.getElementById('fm') as any;
    const btn = fm.querySelector('.usa-fm-toggle') as HTMLButtonElement;
    fm.show();
    const last = document.getElementById('l1')!;
    last.focus();
    key(last, 'Tab');
    expect(document.activeElement).toBe(btn);
    key(btn, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(last);
    key(btn, 'Tab');
    expect(document.activeElement!.id).toBe('l0');
  });
  it('previews are image attributes only, and a link click closes the menu', () => {
    document.body.innerHTML = html;
    const fm = document.getElementById('fm') as any;
    fm.show();
    const img = fm.querySelector('.usa-fm-preview') as HTMLImageElement;
    pointer(document.getElementById('l1')!, 'pointerover');
    expect(img.getAttribute('src')).toBe('javascript:alert(1)'); // an <img> never runs it
    expect(img.hidden).toBe(false);
    expect(img.alt).toBe('');
    document.getElementById('l0')!.click();
    expect(fm.open).toBe(false);
  });
  it('curtain variant and reduced motion (no animation)', () => {
    installComponentMocks({ reducedMotion: true });
    document.body.innerHTML = html.replace('label="Site menu"', 'label="Site menu" variant="curtain"');
    const fm = document.getElementById('fm') as any;
    expect(fm.dataset.variant).toBe('curtain');
    anims.length = 0;
    fm.show();
    fm.hide();
    expect(anims.length).toBe(0);
    expect((fm.querySelector('.usa-fm-layer') as HTMLElement).hidden).toBe(true);
  });
  it('restores scrolling when removed while open', () => {
    document.body.innerHTML = html;
    const fm = document.getElementById('fm') as any;
    fm.show();
    fm.remove();
    expect(document.documentElement.style.overflow).toBe('');
  });
});

describe('17.3 <mo-breadcrumbs>', () => {
  const html = '<mo-breadcrumbs id="bc" max="3"><a href="/">Home</a><a href="/docs">Docs</a><a href="/docs/c">Components</a><a href="/docs/c/n">Navigation</a><span>Breadcrumbs</span></mo-breadcrumbs>';
  it('wraps crumbs in a list inside a navigation landmark, aria-current on the last one', () => {
    document.body.innerHTML = html.replace(' max="3"', ' max="9"');
    const bc = document.getElementById('bc') as any;
    expect(bc.getAttribute('role')).toBe('navigation');
    expect(bc.getAttribute('aria-label')).toBe('Breadcrumb');
    const lis = bc.querySelectorAll('ol > li');
    expect(lis.length).toBe(5);
    expect(lis[4].firstElementChild.getAttribute('aria-current')).toBe('page');
    expect(bc.items[0]).toEqual({ label: 'Home', href: '/' });
    expect(bc.items[4]).toEqual({ label: 'Breadcrumbs' });
  });
  it('collapses the middle into a "…" button and expands it with usa:expand', () => {
    document.body.innerHTML = html;
    const bc = document.getElementById('bc') as any;
    const more = bc.querySelector('.usa-bc-more button') as HTMLButtonElement;
    expect(more.getAttribute('aria-label')).toBe('Show 2 more');
    expect([...bc.querySelectorAll('ol > li:not(.usa-bc-more)')].filter((li: HTMLElement) => li.hidden).length).toBe(2);
    let hidden = 0;
    bc.addEventListener('usa:expand', (e: CustomEvent) => (hidden = e.detail.hidden));
    more.focus();
    more.click();
    expect(hidden).toBe(2);
    expect(bc.querySelector('.usa-bc-more')).toBeNull();
    expect(document.activeElement!.textContent).toBe('Docs');
  });
  it('set(items) keeps the shared prefix, slides changes and writes labels as text', async () => {
    document.body.innerHTML = html.replace(' max="3"', ' max="9"');
    const bc = document.getElementById('bc') as any;
    const keep = bc.querySelector('ol > li');
    bc.set([{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: '<img src=x onerror=alert(1)>' }]);
    anims.forEach((a) => a.finish());
    await flush();
    const lis = bc.querySelectorAll('ol > li');
    expect(lis.length).toBe(3);
    expect(lis[0]).toBe(keep);
    expect(lis[2].querySelector('img')).toBeNull();
    expect(lis[2].textContent).toBe('<img src=x onerror=alert(1)>');
    expect(lis[2].firstElementChild.getAttribute('aria-current')).toBe('page');
    expect(lis[1].firstElementChild.getAttribute('aria-current')).toBeNull();
  });
});

describe('17.3 fx/hover pack', () => {
  beforeEach(() => registerHoverPack());
  it('registers five hover effects in the hover pack', () => {
    expect(HOVER_FX.map((d) => d.name)).toEqual(['text-roll', 'image-swap', 'focus-reveal', 'grid-warp', 'googly-eyes']);
    expect(EFFECT_PACKS.hover).toBe(HOVER_FX);
    for (const d of HOVER_FX) expect(getEffect(d.name)?.kind).toBe('hover');
  });
  it('text-roll keeps a screen-reader copy, hides the letters, rolls on hover and restores on cleanup', () => {
    document.body.innerHTML = '<a id="l" href="#">View <b>work</b></a>';
    const el = document.getElementById('l')!;
    const before = el.innerHTML;
    const off = bindEffect(el, 'text-roll', { trigger: 'load' });
    expect(el.querySelector('.usa-sr')!.textContent).toBe('View work');
    expect(el.querySelector('[aria-hidden="true"]')!.children.length).toBe('View work'.length);
    anims.length = 0;
    pointer(el, 'pointerenter');
    expect(anims.length).toBe('View work'.length);
    off();
    expect(el.innerHTML).toBe(before);
  });
  it('image-swap uses the second <img>, opens from the pointer and closes on leave', () => {
    document.body.innerHTML = '<div id="c"><img src="a.jpg" alt="Front"><img src="b.jpg" alt=""></div>';
    const el = document.getElementById('c')!;
    const off = bindEffect(el, 'image-swap', { trigger: 'load' });
    const second = el.querySelectorAll('img')[1] as HTMLImageElement;
    anims.length = 0;
    pointer(el, 'pointerenter');
    expect(anims[0].el).toBe(second);
    expect(String(anims[0].keyframes[1].clipPath)).toContain('150%');
    pointer(el, 'pointerleave');
    expect(String(anims[1].keyframes[1].clipPath)).toContain('0%');
    off();
    expect(second.style.position).toBe('');
  });
  it('focus-reveal blurs words and sharpens them one by one; under reduced motion text stays plain', () => {
    document.body.innerHTML = '<p id="p">Sharp words here</p>';
    const el = document.getElementById('p')!;
    const off = bindEffect(el, 'focus-reveal', { trigger: 'load' });
    const words = el.querySelectorAll('[aria-hidden="true"] > span');
    expect(words.length).toBe(3);
    expect((words[0] as HTMLElement).style.filter).toContain('blur');
    pointer(el, 'pointerenter');
    expect(anims.filter((a) => a.keyframes.some((k: any) => k.filter === 'blur(0px)')).length).toBe(3);
    off();
    installComponentMocks({ reducedMotion: true });
    const off2 = bindEffect(el, 'focus-reveal', { trigger: 'load' });
    expect((el.querySelector('[aria-hidden="true"] > span') as HTMLElement).style.filter).toBe('');
    off2();
  });
  it('grid-warp and googly-eyes add aria-hidden layers, follow the pointer, clean up, and skip under reduced motion', async () => {
    document.body.innerHTML = '<div id="g">Card</div>';
    const el = document.getElementById('g')!;
    const offs = [bindEffect(el, 'grid-warp', { trigger: 'load' }), bindEffect(el, 'googly-eyes', { trigger: 'load' })];
    expect(el.querySelectorAll('[data-usa-fx-layer][aria-hidden="true"]').length).toBe(2);
    offs.forEach((f) => f());
    expect(el.querySelectorAll('[data-usa-fx-layer]').length).toBe(0);
    installComponentMocks({ reducedMotion: true });
    const off = bindEffect(el, 'googly-eyes', { trigger: 'load' });
    expect(el.querySelectorAll('[data-usa-fx-layer]').length).toBe(0);
    off();
  });
});

describe('17.3 showcase', () => {
  it('has a demo card for every 17.3 widget and the hover pack', () => {
    const ids = new Set(COMPONENT_ITEMS.map((c: any) => c.id));
    for (const id of ['mega-menu', 'nav-flyout', 'fullscreen-menu', 'breadcrumbs', 'fx-hover']) expect(ids.has('ui-' + id)).toBe(true);
  });
});
