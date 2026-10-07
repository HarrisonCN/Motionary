import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockIO, installMocks, animations, fireAll } from './setup';

// Every instance created in a test is destroyed afterwards, so watchers on
// `document` from one test never see the DOM of the next.
const created: Array<{ destroy(): void }> = [];
async function load(opts: { reducedMotion?: boolean } = {}) {
  vi.resetModules();
  installMocks(opts);
  const mod = await import('../src/index');
  const createScrollAnimate: typeof mod.createScrollAnimate = (config) => {
    const sa = mod.createScrollAnimate(config);
    created.push(sa);
    return sa;
  };
  return { ...mod, createScrollAnimate };
}
afterEach(() => created.splice(0).forEach((sa) => sa.destroy()));

const flush = () => new Promise((r) => setTimeout(r, 0));
const observed = (sa: { getObservedElements(): Array<{ element: Element }> }) => sa.getObservedElements().map((r) => r.element);

function add(html: string, parent: Element = document.body): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild as HTMLElement;
  parent.appendChild(node);
  return node;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('watch()', () => {
  it('observes existing [data-sa] elements right away, like init()', async () => {
    const { createScrollAnimate } = await load();
    const node = add('<div data-sa></div>');
    const sa = createScrollAnimate();
    sa.watch();
    expect(observed(sa)).toEqual([node]);
    expect(node.style.opacity).toBe('0');
  });

  it('observes [data-sa] elements added later, including nested ones, with their data attributes', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    sa.watch();
    const direct = add('<div data-sa data-sa-duration="900"></div>');
    const section = add('<section><p>no</p><div><span data-sa data-sa-animation="zoom-in"></span></div></section>');
    await flush();
    const nested = section.querySelector('span')!;
    expect(observed(sa)).toEqual([direct, nested]);
    expect(sa.getObservedElements()[0].options.duration).toBe(900);
    fireAll([nested], true);
    expect(animations).toHaveLength(1);
  });

  it('picks up elements that gain the data-sa attribute', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = add('<div></div>');
    sa.watch();
    expect(observed(sa)).toEqual([]);
    node.setAttribute('data-sa', '');
    await flush();
    expect(observed(sa)).toEqual([node]);
  });

  it('releases elements that are removed from the DOM', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const wrap = add('<div><div data-sa></div><div data-sa></div></div>');
    sa.watch();
    const [a, b] = Array.from(wrap.children);
    a.remove();
    await flush();
    expect(observed(sa)).toEqual([b]);
    expect(MockIO.instances.every((io) => !io.targets.has(a))).toBe(true);
  });

  it('keeps elements that are moved within the watched tree', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const from = add('<div><div data-sa></div></div>');
    const to = add('<div></div>');
    sa.watch();
    const node = from.firstElementChild!;
    to.appendChild(node);
    await flush();
    expect(observed(sa)).toEqual([node]);
  });

  it('does not replay finished once-elements that are re-inserted', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = add('<div data-sa></div>');
    sa.watch();
    fireAll([node], true);
    animations[0].finish();
    node.style.opacity = '1';
    node.remove();
    await flush();
    document.body.appendChild(node);
    await flush();
    expect(node.style.opacity).toBe('1');
    expect(animations).toHaveLength(1);
  });

  it('is scoped to the given root', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const scope = add('<main></main>');
    sa.watch(scope);
    const inside = add('<div data-sa></div>', scope);
    const outside = add('<div data-sa></div>');
    await flush();
    expect(observed(sa)).toEqual([inside]);
    expect(outside.style.opacity).toBe('');
  });

  it('the returned function stops watching; destroy() stops every watcher', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const stop = sa.watch();
    stop();
    add('<div data-sa></div>');
    await flush();
    expect(observed(sa)).toEqual([]);

    sa.watch();
    sa.destroy();
    const late = add('<div data-sa></div>');
    await flush();
    expect(observed(sa)).toEqual([]);
    expect(late.style.opacity).toBe('');
  });

  it('reduced motion: watched elements are never hidden', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const sa = createScrollAnimate();
    sa.watch();
    const node = add('<div data-sa></div>');
    await flush();
    expect(observed(sa)).toEqual([node]);
    expect(node.style.opacity).toBe('');
  });

  it('is a no-op without MutationObserver', async () => {
    const { createScrollAnimate } = await load();
    const MO = globalThis.MutationObserver;
    (globalThis as any).MutationObserver = undefined;
    try {
      const sa = createScrollAnimate();
      const stop = sa.watch();
      expect(typeof stop).toBe('function');
      expect(() => stop()).not.toThrow();
    } finally {
      (globalThis as any).MutationObserver = MO;
    }
  });
});
