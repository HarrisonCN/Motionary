import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, parseScrub } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { PREREQS } from '../showcase/catalog/prereqs.js';
import { readFileSync, existsSync } from 'node:fs';
import * as rt from '../src/runtime';
import { registry } from '../src/runtime/registry';
import { scroll, scrollScene, parseEdge, resolveRule, killScenes, allScenes } from '../src/runtime/scroll';
import { formatSvg, parsePath, pathLength, pointAtLength, samplePath, morphPath, readSmil, playSmil, smilTime, flattenPath } from '../src/runtime/format-svg';
import { createMotion, parseMotionAttr, applyMotionAttributes } from '../src/components/core';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineWidgets();
});
afterEach(() => {
  killScenes();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

/** jsdom has no layout: give an element a box at document offset `top`. */
function box(el: Element, top: number, height: number) {
  (el as any).getBoundingClientRect = () => ({ top: top - window.scrollY, bottom: top - window.scrollY + height, left: 0, right: 300, width: 300, height, x: 0, y: top - window.scrollY });
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: height });
}
function scrollTo(y: number) {
  (window as any).scrollY = y;
  window.dispatchEvent(new Event('scroll'));
}

describe('10.2 motionary/runtime/scroll', () => {
  it('rules: keywords, percentages, pixels and +=/-= offsets', () => {
    expect(parseEdge('top', 500)).toBe(0);
    expect(parseEdge('center', 500)).toBe(250);
    expect(parseEdge('80%', 500)).toBe(400);
    expect(parseEdge('120px', 500)).toBe(120);
    expect(parseEdge('top+=80', 500)).toBe(80);
    expect(parseEdge('bottom-=10%', 500)).toBe(450);
    expect(() => parseEdge('middle', 500)).toThrow(/bad edge/);
    // trigger at 1000 (200 tall), viewport 800: "top 80%" → 1000 - 640
    expect(resolveRule('top 80%', 1000, 200, 800)).toBe(360);
    expect(resolveRule('bottom top', 1000, 200, 800)).toBe(1200);
    expect(resolveRule('center center+=100', 1000, 200, 800)).toBe(1000 + 100 - 500);
  });
  it('a scene measures start / end, reports progress and fires enter / leave / back callbacks', () => {
    rt.use(scroll);
    vi.stubGlobal('innerHeight', 800);
    const el = document.createElement('section');
    document.body.append(el);
    box(el, 1000, 200);
    scrollTo(0);
    const seen: string[] = [];
    const s = scrollScene({ trigger: el, start: 'top bottom', end: 'bottom top', onEnter: () => seen.push('enter'), onLeave: () => seen.push('leave'), onEnterBack: () => seen.push('enterBack'), onLeaveBack: () => seen.push('leaveBack'), toggleClass: 'on' });
    expect([s.start, s.end]).toEqual([200, 1200]);
    scrollTo(700);
    expect(s.progress).toBeCloseTo(0.5);
    expect(s.isActive).toBe(true);
    expect(el.classList.contains('on')).toBe(true);
    scrollTo(1500);
    scrollTo(1000);
    scrollTo(0);
    expect(seen).toEqual(['enter', 'leave', 'enterBack', 'leaveBack']);
    expect(el.classList.contains('on')).toBe(false);
    expect(allScenes()).toContain(s);
  });
  it('scrub drives a runtime timeline directly; actions play / reverse without scrub', () => {
    rt.use(scroll);
    vi.stubGlobal('innerHeight', 800);
    const el = document.createElement('div');
    document.body.append(el);
    box(el, 1000, 200);
    scrollTo(0);
    const o = { v: 0 };
    const tl = rt.timeline({ paused: true }).to(o, { to: { v: 100 }, duration: 1000, ease: 'linear' });
    scrollScene({ trigger: el, start: 'top bottom', end: '+=1000', scrub: true, animation: tl });
    scrollTo(450);
    expect(o.v).toBeCloseTo(25);
    const o2 = { v: 0 };
    const t2 = rt.tween(o2, { to: { v: 1 }, duration: 100, paused: true });
    const play = vi.spyOn(t2, 'play');
    const rev = vi.spyOn(t2, 'reverse');
    scrollScene({ trigger: el, start: 'top bottom', end: 'bottom top', animation: t2 });
    scrollTo(800);
    expect(play).toHaveBeenCalled();
    scrollTo(0);
    expect(rev).toHaveBeenCalled();
  });
  it('smoothed scrub eases toward the scroll position on the ticker', () => {
    rt.use(scroll);
    vi.stubGlobal('innerHeight', 800);
    const el = document.createElement('div');
    document.body.append(el);
    box(el, 1000, 200);
    scrollTo(0);
    const o = { v: 0 };
    const tl = rt.timeline({ paused: true }).to(o, { to: { v: 100 }, duration: 1000, ease: 'linear' });
    scrollScene({ trigger: el, start: 'top bottom', end: '+=1000', scrub: 100, animation: tl });
    scrollTo(1200);
    rt.getTicker().step(50);
    expect(o.v).toBeGreaterThan(10);
    expect(o.v).toBeLessThan(100);
    for (let i = 0; i < 40; i++) rt.getTicker().step(50);
    expect(o.v).toBeCloseTo(100, 0);
  });
  it('pin wraps the element in a spacer, fixes it while active, markers draw, kill restores the DOM', () => {
    rt.use(scroll);
    vi.stubGlobal('innerHeight', 800);
    document.body.innerHTML = '<main><section id="p">Pinned</section></main>';
    const el = document.getElementById('p')!;
    box(el, 1000, 200);
    scrollTo(0);
    const s = scrollScene({ trigger: el, start: 'top top', end: '+=500', pin: true, markers: true });
    const sp = el.parentElement!;
    expect(sp.className).toBe('usa-pin-spacer');
    box(sp, 1000, 200);
    s.refresh();
    expect(sp.style.paddingBottom).toBe('500px');
    expect(document.querySelectorAll('.usa-scroll-marker').length).toBe(3);
    scrollTo(1200);
    expect(el.style.position).toBe('fixed');
    scrollTo(1600);
    expect(el.style.position).toBe('');
    expect(el.style.transform).toBe('translateY(500px)');
    s.kill();
    expect(el.parentElement!.localName).toBe('main');
    expect(document.querySelectorAll('.usa-pin-spacer, .usa-scroll-marker').length).toBe(0);
  });
});

const SVG = readFileSync('test/fixtures/formats/sample-smil.svg', 'utf8');
describe('10.2 motionary/runtime/format-svg', () => {
  it('parses every path command (relative, H/V, S/T reflections, arcs) without the DOM', () => {
    expect(parsePath('m10 10 h20 v20 h-20 z')).toEqual([['M', 10, 10], ['L', 30, 10], ['L', 30, 30], ['L', 10, 30], ['Z']]);
    expect(parsePath('M0 0 C 10 0 20 10 20 20 S 30 40 40 40')[2]).toEqual(['C', 20, 30, 30, 40, 40, 40]);
    expect(parsePath('M0 0 Q 10 10 20 0 T 40 0')[2]).toEqual(['Q', 30, -10, 40, 0]);
    expect(parsePath('M0 0 L10 0 20 0')).toEqual([['M', 0, 0], ['L', 10, 0], ['L', 20, 0]]);
    expect(() => parsePath('10 10')).toThrow(/must start with a command/);
  });
  it('measures: lines, squares and arcs; points along the path; resampling', () => {
    expect(pathLength('M0 0 L100 0')).toBeCloseTo(100);
    expect(pathLength('M0 0 h10 v10 h-10 z')).toBeCloseTo(40);
    expect(pathLength('M0 0 A50 50 0 0 1 100 0')).toBeCloseTo(Math.PI * 50, 0);
    expect(pointAtLength('M0 0 L100 0', 25)).toMatchObject({ x: 25, y: 0, angle: 0 });
    expect(pointAtLength('M0 0 L0 100', 50).angle).toBe(90);
    expect(samplePath('M0 0 L90 0', 10).map((p) => Math.round(p[0]))).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    expect(flattenPath('M0 0 L1 1 M5 5 L6 6')).toHaveLength(2);
  });
  it('morphs between paths of different shapes and point counts', () => {
    const f = morphPath('M0 0 L100 0 L50 80 Z', 'M50 10 A40 40 0 1 1 49.9 10 Z', { points: 32 });
    expect(f(0)).toBe('M0 0 L100 0 L50 80 Z');
    expect(f(1)).toBe('M50 10 A40 40 0 1 1 49.9 10 Z');
    const mid = f(0.5);
    expect(mid.startsWith('M')).toBe(true);
    expect(mid.endsWith('Z')).toBe(true);
    expect(mid.split('L')).toHaveLength(32);
    expect(smilTime('1.5s')).toBe(1500);
    expect(smilTime('250ms')).toBe(250);
    expect(smilTime('00:01.5')).toBe(1500);
    expect(Number.isNaN(smilTime('indefinite'))).toBe(true);
  });
  it('reads every SMIL element of a real SVG', () => {
    document.body.innerHTML = SVG;
    const a = readSmil(document.querySelector('svg')!);
    expect(a.map((x) => `${x.kind}:${x.attribute}`)).toEqual(['animate:cx', 'animate:fill', 'animate:r', 'animateTransform:transform', 'set:opacity', 'animateMotion:transform', 'animate:d', 'animate:x']);
    expect(a[0]).toMatchObject({ dur: 2000, repeat: -1, keyTimes: [0, 0.5, 1], values: ['20', '180', '20'] });
    expect(a[1]).toMatchObject({ begin: 500, freeze: true, values: ['#6366f1', '#ec4899'] });
    expect(a[3]).toMatchObject({ type: 'rotate', repeat: 1 });
    expect(a[5].values[0]).toContain('C 60 10');
  });
  it('replays SMIL on the runtime timeline (seekable) and restores the original elements', () => {
    document.body.innerHTML = SVG;
    const svg = document.querySelector('svg')!;
    const player = playSmil(svg, { paused: true });
    expect(svg.querySelectorAll('animate, set, animateTransform, animateMotion')).toHaveLength(0);
    const tl = player.timeline;
    tl.seek(500);
    expect(document.getElementById('dot')!.getAttribute('cx')).toBe('100');
    tl.seek(1500);
    expect(document.getElementById('dot')!.getAttribute('fill')).toBe('rgba(236,72,153,1)');
    expect(document.getElementById('box')!.getAttribute('transform')).toBe('rotate(180 100 60)');
    expect(document.getElementById('box')!.getAttribute('opacity')).toBe('0.5');
    expect(document.getElementById('ship')!.getAttribute('transform')).toMatch(/^translate\([\d.]+ [\d.]+\) rotate\(-?[\d.]+\)$/);
    expect(document.getElementById('blob')!.getAttribute('d')).toBe('M70 15 A12 12 0 1 1 69.9 15 Z');
    expect(document.getElementById('label')!.getAttribute('x')).toBe('40');
    tl.seek(250);
    const r = Number(document.getElementById('dot')!.getAttribute('r'));
    expect(r).toBeGreaterThan(8);
    expect(r).toBeLessThan(14);
    player.restore();
    expect(svg.querySelectorAll('animate, set, animateTransform, animateMotion')).toHaveLength(8);
    rt.use(formatSvg);
    expect(rt.requireModule<any>('format-svg').playSmil).toBe(playSmil);
  });
});

describe('10.2 data-motion in motionary/core', () => {
  it('parses rules: trigger, effect, duration, delay, stagger, ease, once', () => {
    expect(parseMotionAttr('enter: fade-up 600ms delay 0.1s stagger 80ms ease-out; click: pop once')).toEqual([
      { trigger: 'enter', effect: 'fade-up', duration: 600, delay: 100, stagger: 80, easing: 'ease-out' },
      { trigger: 'click', effect: 'pop', once: true },
    ]);
    expect(() => parseMotionAttr('scroll: spin')).toThrow(/bad rule/);
  });
  it('wires [data-motion] elements (enter presets reveal, other triggers bind), observes new nodes, unbinds', async () => {
    const m = createMotion();
    m.use({ name: 'demo', effects: [{ name: 'pop', kind: 'click', run: (el: HTMLElement, _o: any, c: any) => c.animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], { duration: 100 }) }] });
    document.body.innerHTML = '<ul id="l" data-motion="enter: fade-up 500ms stagger 80ms"><li>a</li><li>b</li></ul><button id="b" data-motion="click: pop">x</button>';
    const stop = applyMotionAttributes(m, document, { observe: true });
    expect(document.getElementById('l')!.hasAttribute('data-motion-ready')).toBe(true);
    expect((document.querySelector('#l li') as HTMLElement).style.opacity).toBe('0');
    const spy = vi.spyOn(m, 'play');
    void spy;
    document.getElementById('b')!.click();
    const late = document.createElement('p');
    late.setAttribute('data-motion', 'click: pop');
    document.body.append(late);
    await new Promise((r) => setTimeout(r, 0));
    expect(late.hasAttribute('data-motion-ready')).toBe(true);
    stop();
    expect(document.querySelector('[data-motion-ready]')).toBeNull();
    document.body.innerHTML = '<i data-motion="click: nope"></i>';
    expect(() => applyMotionAttributes(m)).toThrow(/unknown effect "nope"/);
  });
});

describe('10.2 widgets', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['10.2'])).toEqual(['usa-scroll-scene', 'usa-motion-inspector']);
    for (const t of Object.keys(WIDGETS['10.2'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('parseScrub reads "prop: from -> to" lists', () => {
    expect(parseScrub('opacity: 0 -> 1; x: -80 -> 0; background-color: #000 -> #fff')).toEqual({ from: { opacity: '0', x: '-80', backgroundColor: '#000' }, to: { opacity: '1', x: '0', backgroundColor: '#fff' } });
  });
  it('<usa-scroll-scene> without motionary/runtime/scroll shows the exact fix', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = '<usa-scroll-scene><p data-scrub="opacity: 0 -> 1">x</p></usa-scroll-scene>';
    const msg = document.querySelector('usa-scroll-scene .usa-rt-missing')!.textContent!;
    for (const s of ['requires motionary/runtime/scroll', 'npm i motionary', "import { scroll } from 'motionary/runtime/scroll'", 'use(scroll)', 'runtime/scroll.iife.js']) expect(msg).toContain(s);
  });
  it('<usa-scroll-scene> with the module: one tween per [data-scrub] child; preview loops when the page cannot scroll', () => {
    rt.use(scroll);
    document.body.innerHTML = '<usa-scroll-scene preview stagger="100"><p data-scrub="opacity: 0 -> 1">a</p><p data-scrub="x: -50 -> 0">b</p></usa-scroll-scene>';
    const el = document.querySelector('usa-scroll-scene') as any;
    expect(el.timeline().getChildren()).toHaveLength(2);
    expect(el.hasAttribute('data-preview')).toBe(true);
    expect((el.querySelector('p') as HTMLElement).style.opacity).toBe('0');
    rt.getTicker().step(500);
    expect(Number((el.querySelector('p') as HTMLElement).style.opacity)).toBeGreaterThan(0);
  });
  it('<usa-motion-inspector> lists animations, pauses / plays them and sets the slow-motion rate', () => {
    const a = { playState: 'running', pause: vi.fn(), play: vi.fn(), playbackRate: 1, id: '', effect: { target: document.body, getComputedTiming: () => ({ progress: 0.4, duration: 1000 }) } };
    (document as any).getAnimations = () => [a];
    rt.use();
    document.body.innerHTML = '<usa-motion-inspector></usa-motion-inspector>';
    const el = document.querySelector('usa-motion-inspector') as any;
    expect(el.querySelectorAll('.usa-mi-list li')).toHaveLength(1);
    expect(el.querySelector('.usa-mi-name').textContent).toContain('body');
    expect(el.querySelector('input[type=range]').value).toBe('40');
    expect(el.querySelector('.usa-mi-rt').textContent).toMatch(/runtime \d+ fps/);
    (el.querySelector('[data-act=pause]') as HTMLElement).click();
    expect(a.pause).toHaveBeenCalled();
    el.playAll();
    expect(a.play).toHaveBeenCalled();
    el.setRate(0.25);
    expect(a.playbackRate).toBe(0.25);
    expect(rt.getTicker().timeScale).toBe(0.25);
    el.setRate(1);
    delete (document as any).getAnimations;
  });
});

describe('10.2 AI docs: per-component Markdown, AGENTS.md, prompt guide, prerequisites', () => {
  it('scroll-scene carries Requires: motionary/runtime/scroll in the Store, snippets and manifest', async () => {
    const card: any = COMPONENTS.find((c: any) => c.tag === 'usa-scroll-scene');
    expect(card.requires).toEqual(['scroll']);
    const item: any = COMPONENT_ITEMS.find((i: any) => i.gallery === 'scroll-scene');
    expect(item.requiresBadge).toBe('Requires: motionary/runtime/scroll');
    expect(componentSnippets(card).esm).toContain('use(scroll);');
    expect(Object.keys(PREREQS)).toEqual(expect.arrayContaining(['scroll', 'format-svg']));
    const { buildManifest } = await import('../scripts/gen-manifest.mjs');
    const m = buildManifest();
    expect(m.runtimeModules.map((r: any) => r.id)).toEqual(expect.arrayContaining(['scroll', 'format-svg']));
    expect(m.components.find((c: any) => c.tag === 'usa-scroll-scene').prerequisites.cdn).toContain('runtime/scroll.iife.js');
  });
  it('docs/components/<tag>.md for every component, current with the source', async () => {
    const { generateComponentDocs } = await import('../scripts/gen-component-docs.mjs');
    const files = generateComponentDocs();
    expect(Object.keys(files).length).toBeGreaterThan(190);
    for (const [f, s] of Object.entries(files)) expect(readFileSync(f, 'utf8'), f).toBe(s);
    const page = readFileSync('docs/components/usa-scroll-scene.md', 'utf8');
    for (const s of ['## Prerequisites — Requires: motionary/runtime/scroll', 'npm i motionary', 'use(scroll);', '## Minimal example', '`scrub`']) expect(page).toContain(s);
  });
  it('AGENTS.md + prompt guide point at the generated sources', () => {
    const a = readFileSync('AGENTS.md', 'utf8');
    for (const s of ['components.json', 'llms.txt', 'llms-full.txt', 'docs/components/', 'use(scroll)']) expect(a).toContain(s);
    expect(existsSync('docs/ai-prompt-guide.md')).toBe(true);
    expect(JSON.parse(readFileSync('package.json', 'utf8')).files).toContain('AGENTS.md');
    expect(readFileSync('docs/runtime/format-svg.md', 'utf8')).toContain('## Compatibility');
  });
});
