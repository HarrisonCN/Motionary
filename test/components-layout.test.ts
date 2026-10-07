import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks, anims, mount } from './components-setup';
import { defineLayoutComponents, autoAnimate, masonryLayout, sharedTransition, flipFrames } from '../src/components/layout';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineLayoutComponents();
});

const flush = () => new Promise((r) => setTimeout(r, 0));
const boxAt = (el: Element, b: { left: number; top: number; width?: number; height?: number }) =>
  ((el as any).getBoundingClientRect = () => ({ width: 100, height: 40, ...b }) as DOMRect);

describe('layout math', () => {
  it('flipFrames inverts position and size', () => {
    const [a, b] = flipFrames({ left: 10, top: 20, width: 50, height: 20 }, { left: 0, top: 0, width: 100, height: 40 });
    expect(a.transform).toBe('translate(10px, 20px) scale(0.5, 0.5)');
    expect(b.transform).toBe('none');
    expect(flipFrames({ left: 0, top: 0, width: 50, height: 20 }, { left: 0, top: 0, width: 100, height: 40 }, false)[0].transform).toContain('scale(1, 1)');
  });
  it('masonryLayout fills the shortest column first', () => {
    const p = masonryLayout([100, 50, 80, 30], 2, 200, 10);
    expect(p.slice(0, 4)).toEqual([{ x: 0, y: 0 }, { x: 210, y: 0 }, { x: 210, y: 60 }, { x: 0, y: 110 }]);
    expect(p.height).toBe(140);
  });
});

describe('autoAnimate()', () => {
  it('animates added children in and moved ones with FLIP', async () => {
    const ul = mount('<ul><li>a</li><li>b</li></ul>');
    const [a, b] = Array.from(ul.children);
    boxAt(ul, { left: 0, top: 0 });
    boxAt(a, { left: 0, top: 0 });
    boxAt(b, { left: 0, top: 40 });
    const ctl = autoAnimate(ul as HTMLElement, { duration: 200 });
    const c = document.createElement('li');
    boxAt(c, { left: 0, top: 0 });
    boxAt(a, { left: 0, top: 40 });
    boxAt(b, { left: 0, top: 80 });
    ul.prepend(c);
    await flush();
    const forC = anims.find((x) => x.el === c)!;
    expect(forC.keyframes[0]).toMatchObject({ opacity: 0 });
    const forA = anims.find((x) => x.el === a)!;
    expect(forA.keyframes[0].transform).toBe('translate(0px, -40px) scale(1, 1)');
    ctl.stop();
  });
  it('keeps removed children as fading ghosts, and is instant under reduced motion', async () => {
    const ul = mount('<ul><li>a</li><li>b</li></ul>');
    const [a] = Array.from(ul.children) as HTMLElement[];
    autoAnimate(ul as HTMLElement);
    a.remove();
    await flush();
    expect(a.isConnected).toBe(true);
    expect(a.style.position).toBe('absolute');
    expect(anims.find((x) => x.el === a)!.keyframes[1]).toMatchObject({ opacity: 0 });
    installComponentMocks({ reducedMotion: true });
    const ul2 = mount('<ul><li>x</li></ul>');
    autoAnimate(ul2 as HTMLElement);
    ul2.append(document.createElement('li'));
    await flush();
    expect(anims).toHaveLength(0);
  });
});

describe('sharedTransition()', () => {
  it('FLIPs elements with the same data-shared id (no View Transitions API)', async () => {
    document.body.innerHTML = '<div id="list"><img data-shared="p1" alt=""></div><div id="detail" hidden></div>';
    const thumb = document.querySelector('img')!;
    boxAt(thumb, { left: 10, top: 10, width: 50, height: 50 });
    const done = (async () => {
      for (let i = 0; i < 20 && !anims.length; i++) await flush();
      anims.forEach((a) => a.finish());
    })();
    const run = sharedTransition(() => {
      const big = document.createElement('img');
      big.dataset.shared = 'p1';
      boxAt(big, { left: 0, top: 100, width: 200, height: 200 });
      thumb.remove();
      document.getElementById('detail')!.append(big);
      document.getElementById('detail')!.hidden = false;
    });
    await done;
    await run;
    expect(anims).toHaveLength(1);
    expect(anims[0].keyframes[0].transform).toBe('translate(10px, -90px) scale(0.25, 0.25)');
  });
  it('uses document.startViewTransition and names shared elements', async () => {
    document.body.innerHTML = '<p data-shared="t">x</p>';
    const names: string[] = [];
    (document as any).startViewTransition = (cb: () => Promise<void>) => {
      names.push((document.querySelector('[data-shared]') as HTMLElement).style.viewTransitionName);
      return { finished: cb() };
    };
    const update = vi.fn();
    await sharedTransition(update);
    expect(update).toHaveBeenCalled();
    expect(names).toEqual(['usa-t']);
    expect((document.querySelector('[data-shared]') as HTMLElement).style.viewTransitionName).toBe('');
    delete (document as any).startViewTransition;
  });
});

describe('elements', () => {
  it('<usa-masonry> positions children in columns', () => {
    const el = mount<any>('<usa-masonry columns="2" gap="10"><div>1</div><div>2</div><div>3</div></usa-masonry>');
    Object.defineProperty(el, 'clientWidth', { value: 410 });
    const kids = Array.from(el.children) as HTMLElement[];
    [100, 50, 80].forEach((h, i) => Object.defineProperty(kids[i], 'offsetHeight', { value: h }));
    el.layout();
    expect(kids[0].style.width).toBe('200px');
    expect(kids[2].style.transform).toBe('translate(210px, 60px)');
    expect(el.style.height).toBe('140px');
    expect(el.hasAttribute('data-js')).toBe(true);
  });
  it('<usa-auto-animate> animates its own children', async () => {
    const el = mount<any>('<usa-auto-animate><p>a</p></usa-auto-animate>');
    el.append(document.createElement('p'));
    await flush();
    expect(anims).toHaveLength(1);
    el.disable();
    el.append(document.createElement('p'));
    await flush();
    expect(anims).toHaveLength(1);
  });
});
