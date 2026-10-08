import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, stackToast, TOAST_POSITIONS, MODAL_EFFECTS, SHEET_SIDES, MENU_EFFECTS } from '../src/components/widgets';
import { TEXT3_FX, registerTextPack, registerEffectPacks, EFFECT_PACKS, splitChars } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

describe('6.3 widgets', () => {
  it('ships toast stack, dialog, drawer and menu in the widgets entry', () => {
    expect(Object.keys(WIDGETS['6.3'])).toEqual(['usa-toast-stack', 'usa-modal', 'usa-sheet', 'usa-menu']);
    for (const t of Object.keys(WIDGETS['6.3'])) expect(customElements.get(t)).toBeTruthy();
    expect(TOAST_POSITIONS).toContain('top-center');
    expect(MODAL_EFFECTS).toEqual(['scale', 'slide-up', 'flip', 'origin']);
    expect(SHEET_SIDES).toEqual(['right', 'left', 'bottom', 'top']);
    expect(MENU_EFFECTS).toEqual(['scale', 'fold', 'slide']);
  });
});

describe('<usa-toast-stack>', () => {
  it('show() adds a toast to a polite live region, newest first; dismiss() removes it', async () => {
    const s = mount<any>('<usa-toast-stack duration="0"></usa-toast-stack>');
    expect(s.getAttribute('role')).toBe('region');
    expect(s.querySelector('.usa-tstack-list').getAttribute('aria-live')).toBe('polite');
    const seen: string[] = [];
    s.addEventListener('usa:dismiss', (e: CustomEvent) => seen.push(e.detail.reason));
    const a = s.show('First');
    const b = s.show({ title: 'Saved', message: 'Second', type: 'success' });
    expect(s.count).toBe(2);
    const items = s.querySelectorAll('.usa-tstack');
    expect(items[0].id).toBe(b);
    expect(items[0].classList.contains('usa-tstack-success')).toBe(true);
    expect(items[0].textContent).toContain('Saved');
    expect(items[1].hasAttribute('inert')).toBe(true); // collapsed: only the front toast is interactive
    s.dismiss(a);
    anims.forEach((x) => x.finish());
    await Promise.resolve();
    await Promise.resolve();
    expect(s.querySelector('#' + a)).toBeNull();
    expect(seen).toEqual(['api']);
  });
  it('auto-dismisses after duration and pauses while hovered', () => {
    vi.useFakeTimers();
    const s = mount<any>('<usa-toast-stack duration="1000"></usa-toast-stack>');
    const id = s.show('Bye');
    s.dispatchEvent(new Event('pointerenter'));
    expect(s.hasAttribute('data-expanded')).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(s.querySelector('#' + id).hasAttribute('data-leaving')).toBe(false);
    s.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(1100);
    expect(s.querySelector('#' + id).hasAttribute('data-leaving')).toBe(true);
  });
  it('action and close buttons; stackToast() helper and data-usa-toast triggers', () => {
    const onClick = vi.fn();
    const s = mount<any>('<usa-toast-stack id="ts" duration="0"></usa-toast-stack>');
    s.show({ message: 'Undo?', action: { label: 'Undo', onClick } });
    s.querySelector('.usa-tstack-action').click();
    expect(onClick).toHaveBeenCalled();
    stackToast('From helper');
    expect(s.textContent).toContain('From helper');
    const btn = document.createElement('button');
    btn.setAttribute('data-usa-toast', 'Clicked');
    btn.setAttribute('data-usa-target', 'ts');
    document.body.append(btn);
    btn.click();
    expect(s.textContent).toContain('Clicked');
  });
});

describe('<usa-modal> / <usa-sheet>', () => {
  it('wraps content in a native dialog, opens from a data-usa-open trigger and animates', () => {
    document.body.innerHTML = '<button id="t" data-usa-open="d">Open</button><usa-modal id="d" effect="origin" label="Hi"><p>Body</p><button data-usa-close="ok">OK</button></usa-modal>';
    const d = document.getElementById('d') as any;
    const dlg = d.querySelector('dialog.usa-ov');
    expect(dlg).toBeTruthy();
    expect(dlg.getAttribute('aria-label')).toBe('Hi');
    expect(dlg.querySelector('.usa-ov-body p').textContent).toBe('Body');
    const opened = vi.fn();
    d.addEventListener('usa:open', opened);
    anims.length = 0;
    document.getElementById('t')!.click();
    expect(d.opened).toBe(true);
    expect(dlg.open).toBe(true);
    expect(opened).toHaveBeenCalled();
    expect(anims.some((a) => a.el === dlg)).toBe(true);
  });
  it('close(value) via [data-usa-close] emits usa:close and returns focus', async () => {
    document.body.innerHTML = '<button id="t">Open</button><usa-modal id="d"><button data-usa-close="ok">OK</button></usa-modal>';
    const d = document.getElementById('d') as any;
    const t = document.getElementById('t')!;
    d.show(t);
    const closed = vi.fn();
    d.addEventListener('usa:close', (e: CustomEvent) => closed(e.detail.value));
    d.querySelector('[data-usa-close]').click();
    anims.forEach((a) => a.finish());
    await new Promise((r) => setTimeout(r, 0));
    expect(closed).toHaveBeenCalledWith('ok');
    expect(d.opened).toBe(false);
    expect(document.activeElement).toBe(t);
  });
  it('persistent ignores Esc (cancel); drawer sides and a bottom-sheet grab handle', () => {
    const d = mount<any>('<usa-modal persistent><p>x</p></usa-modal>');
    d.show();
    d.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(d.opened).toBe(true);
    const r = mount<any>('<usa-sheet side="bottom"><p>Sheet</p></usa-sheet>');
    expect(r.dataset.side).toBe('bottom');
    expect(r.querySelector('.usa-ov-grab[data-handle]')).toBeTruthy();
    const l = mount<any>('<usa-sheet side="nope"></usa-sheet>');
    expect(l.dataset.side).toBe('right');
  });
  it('reduced motion: fade only', () => {
    installComponentMocks({ reducedMotion: true });
    const d = mount<any>('<usa-sheet side="left"><p>x</p></usa-sheet>');
    anims.length = 0;
    d.show();
    const a = anims.find((x) => x.el === d.querySelector('dialog'))!;
    expect(JSON.stringify(a.keyframes)).not.toContain('translate');
  });
});

describe('<usa-menu>', () => {
  const html = '<usa-menu><button>Actions</button><button>Edit</button><button data-value="dup">Duplicate</button><hr><button>Delete</button></usa-menu>';
  it('builds an ARIA menu from its children and opens with a cascade', () => {
    const m = mount<any>(html);
    const btn = m.querySelector('button[aria-haspopup="menu"]');
    expect(btn.textContent).toBe('Actions');
    const list = m.querySelector('.usa-menu-list');
    expect(list.getAttribute('role')).toBe('menu');
    expect(list.hidden).toBe(true);
    expect(m.querySelectorAll('[role="menuitem"]')).toHaveLength(3);
    expect(m.querySelector('hr').getAttribute('role')).toBe('separator');
    anims.length = 0;
    btn.click();
    expect(m.opened).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(anims.length).toBe(4); // list + 3 items
    expect(document.activeElement?.textContent).toBe('Edit');
  });
  it('arrow keys move focus, Esc closes, selecting emits usa:select', () => {
    const m = mount<any>(html);
    m.open();
    const list = m.querySelector('.usa-menu-list');
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement?.textContent).toBe('Duplicate');
    const sel = vi.fn();
    m.addEventListener('usa:select', (e: CustomEvent) => sel(e.detail.value));
    (document.activeElement as HTMLElement).click();
    expect(sel).toHaveBeenCalledWith('dup');
    expect(m.opened).toBe(false);
    m.open();
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(m.opened).toBe(false);
  });
});

describe('6.3 text effects 3.0', () => {
  it('registers 7 effects in motionary/components/fx-text', () => {
    registerTextPack();
    registerEffectPacks();
    expect(TEXT3_FX.map((d) => d.name)).toEqual(['liquid-text', 'neon-write', 'particle-text', 'glitch-text', 'text-trail', 'font-breathe', 'flip-chars']);
    for (const d of TEXT3_FX) expect(getEffect(d.name)).toBe(d);
    expect(EFFECT_PACKS.text).toBe(TEXT3_FX);
    expect(COMPONENT_ENTRIES['fx-text']).toBe('fx2/text3');
  });
  it('splitChars keeps a screen-reader copy and is idempotent', () => {
    const h = mount<HTMLElement>('<h1>Hi you</h1>');
    const a = splitChars(h);
    expect(a).toHaveLength(6);
    expect(a.every((c) => c.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(h.querySelector('.usa-sr')!.textContent).toBe('Hi you');
    expect(splitChars(h)).toHaveLength(6);
  });
  it('flip-chars and neon-write animate every character; reduced motion = fade / static glow', () => {
    registerTextPack();
    const h = mount<HTMLElement>('<h1>Wow</h1>');
    anims.length = 0;
    playEffect(h, 'flip-chars');
    expect(anims).toHaveLength(3);
    expect(JSON.stringify(anims[0].keyframes)).toContain('rotateX');
    anims.length = 0;
    playEffect(h, 'neon-write');
    expect(anims).toHaveLength(3);
    expect(h.style.textShadow).toMatch(/ff4fd8|255, 79, 216/);
    installComponentMocks({ reducedMotion: true });
    anims.length = 0;
    playEffect(h, 'neon-write');
    expect(anims).toHaveLength(0);
    playEffect(h, 'flip-chars');
    expect(JSON.stringify(anims[0].keyframes)).not.toContain('rotate');
  });
  it('glitch-text adds two RGB clones; font-breathe loops and cleans up; liquid-text adds an SVG filter', async () => {
    registerTextPack();
    const h = mount<HTMLElement>('<h2>Glitch</h2>');
    anims.length = 0;
    playEffect(h, 'glitch-text');
    expect(h.querySelectorAll('span[aria-hidden]')).toHaveLength(2);
    expect(anims).toHaveLength(3);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    const def = getEffect('liquid-text')!;
    const ctx: any = { reduced: false, animate: () => null, onCleanup() {} };
    const stop = def.run(h, { ...def.defaults }, ctx) as () => void;
    expect(h.style.filter).toMatch(/url\(#usa-liquid-/);
    expect(document.querySelector('svg filter feDisplacementMap')).toBeTruthy();
    stop();
    expect(h.style.filter).toBe('');
    const b = mount<HTMLElement>('<p>ab</p>');
    anims.length = 0;
    const fb = getEffect('font-breathe')!;
    const stop2 = fb.run(b, { ...fb.defaults }, { ...ctx, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o) }) as () => void;
    expect(anims).toHaveLength(2);
    expect(anims[0].timing.iterations).toBe(Infinity);
    stop2();
    expect(anims.every((a) => a.cancelled)).toBe(true);
  });
  it('text-trail spawns letters on pointer moves and removes its listener', () => {
    registerTextPack();
    const def = getEffect('text-trail')!;
    const el = mount<HTMLElement>('<div></div>');
    anims.length = 0;
    const ctx: any = { reduced: false, animate: (n: Element, k: Keyframe[], o: any) => (n as any).animate(k, o), onCleanup() {} };
    const stop = def.run(el, { ...def.defaults, text: 'AB' }, ctx) as () => void;
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }) as any);
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 60, clientY: 10 }) as any);
    expect(anims.map((a) => a.el.textContent)).toEqual(['A', 'B']);
    stop();
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: 10 }) as any);
    expect(anims).toHaveLength(2);
  });
  it('particle-text is skipped under reduced motion', async () => {
    installComponentMocks({ reducedMotion: true });
    registerTextPack();
    const h = mount<HTMLElement>('<h1>P</h1>');
    await playEffect(h, 'particle-text');
    expect(h.dataset.usaChars).toBeUndefined();
  });
});

describe('6.3 showcase + Store', () => {
  it('gallery cards with copyable code for every 6.3 widget and the text pack', () => {
    for (const tag of Object.keys(WIDGETS['6.3'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.3');
      const s = componentSnippets(card);
      expect(s.html).toContain('widgets.umd.js');
      expect(s.react).toContain('export function Demo');
    }
    const fx: any = COMPONENTS.find((c: any) => c.id === 'fx-text');
    expect(componentSnippets(fx).esm).toContain("import { registerTextPack } from 'motionary/components/fx-text'");
    for (const id of ['toast-stack', 'modal', 'sheet', 'menu', 'fx-text', 'fx-text-loop', 'fx-text-trail']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
  });
  it('docs describe the 6.3 additions', () => {
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-toast-stack', '<usa-modal', '<usa-sheet', '<usa-menu', 'fx-text', 'particle-text']) expect(doc).toContain(s);
  });
});
