import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { readFileSync } from 'node:fs';
import * as rt from '../src/runtime';
import { registry } from '../src/runtime/registry';
import { text, segment, splitText } from '../src/runtime/text';
import { formatSprite, parseSpriteSheet, gridSheet, frameOrder, spritePlayer, imageSequence, sequencePlayer, drawFrame } from '../src/runtime/format-sprite';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const fx = (f: string) => JSON.parse(readFileSync(`test/fixtures/formats/${f}`, 'utf8'));

describe('10.3 runtime tween: strings with numbers + discrete values', () => {
  it('interpolates numbers inside CSS strings (filter, box-shadow) and switches keywords at 50 %', () => {
    const el = document.createElement('div');
    const t = rt.tween(el, { from: { filter: 'blur(8px) saturate(0%)', boxShadow: '0px 0px 0px rgba(0,0,0,0)', display: 'none' }, to: { filter: 'blur(0px) saturate(100%)', boxShadow: '0px 10px 20px rgba(0,0,0,0.5)', display: 'block' }, duration: 100, ease: 'linear', paused: true });
    t.seek(25);
    expect(el.style.filter).toBe('blur(6px) saturate(25%)');
    expect(el.style.display).toBe('none');
    t.seek(50);
    expect(el.style.boxShadow).toContain('5px 10px');
    expect(el.style.display).toBe('block');
    expect(() => rt.tween(el, { to: { x: 'left' }, duration: 10, paused: true }).seek(10)).toThrow(/x needs a number/);
  });
});

describe('10.3 motionary/runtime/text', () => {
  it('segment(): graphemes (emoji / combining marks / CJK) and words', () => {
    expect(segment('héllo')).toHaveLength(5);
    expect(segment('👍🏽ok')).toEqual(['👍🏽', 'o', 'k']);
    expect(segment('动效 库')).toEqual(['动', '效', ' ', '库']);
    expect(segment('Motion, made  simple', 'words')).toEqual(['Motion,', ' ', 'made', '  ', 'simple']);
  });
  it('splitText(): chars inside words, nested markup kept, accessible, revert()', () => {
    document.body.innerHTML = '<h1 id="h">Hi <em>there</em> 👋</h1>';
    const el = document.getElementById('h')!;
    const r = splitText(el, { type: 'chars,words' });
    expect(r.words.map((w) => w.textContent)).toEqual(['Hi', 'there', '👋']);
    expect(r.chars.map((c) => c.textContent).join('')).toBe('Hithere👋');
    expect(el.querySelector('em .usa-split-word')).toBeTruthy();
    expect(el.getAttribute('aria-label')).toBe('Hi there 👋');
    expect(r.chars.every((c) => c.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(r.chars[3].style.getPropertyValue('--i')).toBe('3');
    r.revert();
    expect(el.innerHTML).toBe('Hi <em>there</em> 👋');
    expect(el.hasAttribute('aria-label')).toBe(false);
  });
  it('splitText(): lines grouped by rendered position', () => {
    document.body.innerHTML = '<p id="p">one two three four</p>';
    const el = document.getElementById('p')!;
    const tops = [0, 0, 20, 20];
    let i = 0;
    const orig = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop');
    Object.defineProperty(HTMLElement.prototype, 'offsetTop', { configurable: true, get() { return (this as HTMLElement).classList.contains('usa-split-word') ? tops[i++ % 4] : 0; } });
    try {
      const r = splitText(el, { type: 'words,lines' });
      expect(r.lines.map((l) => l.textContent)).toEqual(['one two', 'three four']);
      expect(r.lines[0].className).toBe('usa-split-line');
    } finally {
      if (orig) Object.defineProperty(HTMLElement.prototype, 'offsetTop', orig);
    }
    rt.use(text);
    expect(rt.requireModule<any>('text').splitText).toBe(splitText);
  });
});

describe('10.3 motionary/runtime/format-sprite (real TexturePacker / Aseprite exports)', () => {
  it('TexturePacker hash: numeric name order, trimmed + rotated frames', () => {
    const s = parseSpriteSheet(fx('texturepacker-hash.json'));
    expect(s.format).toBe('texturepacker');
    expect(s.frames.map((f) => f.name)).toEqual(['jump.png', 'walk_1.png', 'walk_2.png', 'walk_10.png']);
    const jump = s.frames[0];
    expect(jump).toMatchObject({ rotated: true, w: 40, h: 64, offsetX: 12, sourceW: 64 });
    expect(s.frames[3]).toMatchObject({ offsetX: 2, w: 60, sourceW: 64 });
    expect(s.image).toBe('hero.png');
  });
  it('TexturePacker array + Aseprite (durations, frameTags with directions)', () => {
    const a = parseSpriteSheet(JSON.stringify(fx('texturepacker-array.json')));
    expect(a.frames.map((f) => f.name)).toEqual(['coin_0', 'coin_1', 'coin_2']);
    const s = parseSpriteSheet(fx('aseprite.json'));
    expect(s.format).toBe('aseprite');
    expect(s.frames.map((f) => f.duration)).toEqual([100, 100, 200, 100, 150]);
    expect(s.tags.map((t) => t.name)).toEqual(['idle', 'bounce', 'back']);
    expect(frameOrder(s, 'idle')).toEqual([0, 1]);
    expect(frameOrder(s, 'bounce')).toEqual([1, 2, 3, 4, 3, 2]);
    expect(frameOrder(s, 'back')).toEqual([4, 3, 2]);
    expect(() => frameOrder(s, 'run')).toThrow(/unknown tag "run"/);
    expect(() => parseSpriteSheet({})).toThrow(/no "frames"/);
  });
  it('spritePlayer: per-frame durations on the timeline, element background mode, seekable', () => {
    const s = parseSpriteSheet(fx('aseprite.json'));
    const el = document.createElement('div');
    const p = spritePlayer(el, s, 'slime.png', { tag: 'bounce', paused: true });
    expect(p.duration).toBe(100 + 200 + 100 + 150 + 100 + 200);
    p.seek(0);
    expect(el.style.backgroundPosition).toBe('-32px 0px');
    p.seek(150);
    expect(el.style.backgroundPosition).toBe('-64px 0px');
    p.seek(450);
    expect(p.frame).toBe(4);
    expect(el.style.width).toBe('32px');
  });
  it('canvas drawing honours trim offsets and rotation; grid sheets; image sequences', () => {
    const calls: any[] = [];
    const ctx: any = { save() {}, restore() {}, translate: (x: number, y: number) => calls.push(['t', x, y]), rotate: (r: number) => calls.push(['r', r]), drawImage: (...a: any[]) => calls.push(['d', ...a.slice(1)]), clearRect() {} };
    const s = parseSpriteSheet(fx('texturepacker-hash.json'));
    drawFrame(ctx, {} as any, s.frames[3], 0, 0, 1);
    expect(calls).toEqual([['t', 2, 0], ['d', 130, 0, 60, 64, 0, 0, 60, 64]]);
    calls.length = 0;
    drawFrame(ctx, {} as any, s.frames[0]);
    expect(calls[1]).toEqual(['r', -Math.PI / 2]);
    expect(gridSheet(4, 2, 10, 20, 6).frames[5]).toMatchObject({ x: 10, y: 20 });
    expect(imageSequence('img/frame_{0001}.webp', { start: 8, end: 11 })).toEqual(['img/frame_0008.webp', 'img/frame_0009.webp', 'img/frame_0010.webp', 'img/frame_0011.webp']);
    expect(() => imageSequence('x.png', { end: 3 })).toThrow(/placeholder/);
    const canvas: any = { width: 100, height: 50, getContext: () => ({ clearRect() {}, drawImage: (...a: any[]) => calls.push(['seq', a[0].id]) }) };
    const imgs = [{ id: 0, width: 100, height: 50 }, { id: 1, width: 100, height: 50 }, { id: 2, width: 100, height: 50 }] as any[];
    const sp = sequencePlayer(canvas, imgs, { fps: 10, paused: true });
    sp.progress = 0.5;
    expect(calls.at(-1)).toEqual(['seq', 1]);
    rt.use(formatSprite);
    expect(rt.hasModule('format-sprite')).toBe(true);
  });
});

describe('10.3 widgets', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['10.3'])).toEqual(['usa-route-transition', 'usa-text-splitter']);
    for (const t of Object.keys(WIDGETS['10.3'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('<usa-text-splitter> needs motionary/runtime/text; with it, splits and staggers in', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = '<usa-text-splitter>Hi</usa-text-splitter>';
    expect(document.querySelector('.usa-rt-missing')!.textContent).toContain("import { text } from 'motionary/runtime/text'");
    document.body.innerHTML = '';
    rt.use(text);
    document.body.innerHTML = '<usa-text-splitter split="chars" effect="fade" stagger="50" trigger="load">Hey you</usa-text-splitter>';
    const el = document.querySelector('usa-text-splitter') as any;
    expect(el.pieces()).toHaveLength(6);
    expect(el.getAttribute('aria-label')).toBe('Hey you');
    rt.getTicker().step(60);
    const ops = el.pieces().map((p: HTMLElement) => Number(p.style.opacity));
    expect(ops[0]).toBeGreaterThan(ops[5]);
    el.remove();
    expect(el.textContent).toBe('Hey you');
  });
  it('<usa-route-transition> swaps inline template routes (waapi engine), keeps templates, marks shared elements', async () => {
    document.body.innerHTML = '<usa-route-transition engine="waapi" history="off"><button data-to="b">B</button><h4 data-shared="t">A</h4><template data-route="b"><button data-to="a">A</button><h4 data-shared="t">B</h4></template><template data-route="a"><h4 data-shared="t">A</h4></template></usa-route-transition>';
    const el = document.querySelector('usa-route-transition') as any;
    expect((el.querySelector('h4') as any).style.viewTransitionName).toBe('usa-t');
    const seen: string[] = [];
    el.addEventListener('usa:navigated', (e: any) => seen.push(e.detail.url));
    expect(await el.navigate('b', { history: 'off' })).toBe(true);
    expect(el.querySelector('h4').textContent).toBe('B');
    expect(el.querySelectorAll('template[data-route]')).toHaveLength(2);
    expect(el.current).toBe('b');
    el.addEventListener('usa:navigate', (e: Event) => e.preventDefault(), { once: true });
    expect(await el.navigate('a', { history: 'off' })).toBe(false);
    expect(seen).toEqual(['b']);
  });
  it('<usa-route-transition> fetches same-origin pages, takes the matching element, uses startViewTransition when present', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => '<title>About</title><main id="app"><h1>About us</h1></main>' })));
    const vt = vi.fn((cb: () => void) => { cb(); return { finished: Promise.resolve() }; });
    (document as any).startViewTransition = vt;
    document.body.innerHTML = '<usa-route-transition id="app" cross-document history="off"><a href="/about">About</a></usa-route-transition>';
    const el = document.querySelector('usa-route-transition') as any;
    expect(await el.navigate('/about')).toBe(true);
    expect(vt).toHaveBeenCalled();
    expect(el.querySelector('h1').textContent).toBe('About us');
    expect(document.title).toBe('About');
    expect(document.head.querySelector('style[data-usa-route]')!.textContent).toBe('@view-transition{navigation:auto}');
    delete (document as any).startViewTransition;
  });
  it('cards, Store badge and snippets carry the text prerequisite', () => {
    const card: any = COMPONENTS.find((c: any) => c.tag === 'usa-text-splitter');
    expect(card.requires).toEqual(['text']);
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'text-splitter').requiresBadge).toBe('Requires: motionary/runtime/text');
    expect(componentSnippets(card).esm).toContain('use(text);');
    expect(readFileSync('docs/runtime/format-sprite.md', 'utf8')).toContain('Aseprite');
    expect(readFileSync('test/fixtures/formats/CREDITS.md', 'utf8')).toContain('MIT');
  });
});
