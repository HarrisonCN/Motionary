import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockIO, installMocks, fireAll } from './setup';

async function load(opts: { reducedMotion?: boolean } = {}) {
  vi.resetModules();
  installMocks(opts);
  return import('../src/index');
}

function el(html = '<div></div>'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild as HTMLElement;
  document.body.appendChild(node);
  return node;
}

function setRect(node: Element, top: number, height: number) {
  (node as any).getBoundingClientRect = () => ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top });
}

const ratioObserver = () =>
  MockIO.instances.find((i) => Array.isArray(i.options.threshold) && (i.options.threshold as number[]).length === 101)!;
const scrollObserver = () => MockIO.instances.find((i) => i.options.threshold === 0)!;

let rafQueue: FrameRequestCallback[] = [];
beforeEach(() => {
  document.body.innerHTML = '';
  rafQueue = [];
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => rafQueue.push(cb);
  (globalThis as any).cancelAnimationFrame = () => {
    rafQueue = [];
  };
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
});

describe('progressVar', () => {
  it('writes the visible ratio to the CSS custom property (no onProgress needed)', async () => {
    const { createScrollAnimate } = await load();
    const node = el();
    createScrollAnimate().observe(node, { progressVar: '--p' });
    ratioObserver().fire(node, true, 0.37);
    expect(node.style.getPropertyValue('--p')).toBe('0.37');
  });

  it("follows true scroll progress with progressMode: 'scroll'", async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { progressVar: '--sa-progress', progressMode: 'scroll' });
    setRect(node, 500, 3000);
    scrollObserver().fire(node, true);
    expect(node.style.getPropertyValue('--sa-progress')).toBe('0.125');
    setRect(node, -1000, 3000);
    window.dispatchEvent(new Event('scroll'));
    rafQueue.splice(0).forEach((cb) => cb(0));
    expect(node.style.getPropertyValue('--sa-progress')).toBe('0.5');
    sa.destroy();
  });

  it('adds the leading dashes when they are omitted', async () => {
    const { createScrollAnimate } = await load();
    const node = el();
    createScrollAnimate().observe(node, { progressVar: 'reveal' });
    ratioObserver().fire(node, true, 1);
    expect(node.style.getPropertyValue('--reveal')).toBe('1');
  });

  it('reads data-sa-progress-var (bare attribute uses --sa-progress) alongside data-sa-progress', async () => {
    const { createScrollAnimate } = await load();
    const bare = el('<div data-sa data-sa-progress-var></div>');
    const named = el('<div data-sa data-sa-progress-var="--hero" data-sa-progress="scroll"></div>');
    const sa = createScrollAnimate();
    sa.init();
    const [a, b] = sa.getObservedElements().map((r) => r.options);
    expect(a.progressVar).toBe('--sa-progress');
    expect(b.progressVar).toBe('--hero');
    expect(b.progressMode).toBe('scroll');
    ratioObserver().fire(bare, true, 0.5);
    expect(bare.style.getPropertyValue('--sa-progress')).toBe('0.5');
    setRect(named, 0, 1000);
    scrollObserver().fire(named, true);
    expect(named.style.getPropertyValue('--hero')).toBe('0.5');
    sa.destroy();
  });

  it('keeps updating after the once entrance animation (not auto-unregistered)', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { progressVar: '--p' });
    fireAll([node], true, 0.2);
    expect(sa.getObservedElements()).toHaveLength(1);
    ratioObserver().fire(node, true, 0.8);
    expect(node.style.getPropertyValue('--p')).toBe('0.8');
  });

  it('is off by default: no extra observer and no custom property', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node);
    expect(MockIO.instances).toHaveLength(1);
    expect(sa.getObservedElements()[0].options.progressVar).toBe('');
    fireAll([node], true, 0.5);
    expect(node.getAttribute('style')).not.toContain('--');
  });

  it('is still written under reduced motion (it is data, like onProgress)', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const node = el();
    createScrollAnimate().observe(node, { progressVar: '--p', parallax: { y: 50 } });
    ratioObserver().fire(node, true, 0.6);
    expect(node.style.getPropertyValue('--p')).toBe('0.6');
    expect(node.style.transform).toBe('');
  });
});
