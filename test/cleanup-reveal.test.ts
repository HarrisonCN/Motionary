import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installMocks, animations, fireAll } from './setup';

async function load() {
  vi.resetModules();
  installMocks();
  return import('../src/index');
}

function el(html = '<div></div>'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild as HTMLElement;
  document.body.appendChild(node);
  return node;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('cleanup never leaves content hidden', () => {
  it('staggerChildren: stopping before the container was revealed shows the children again', async () => {
    const { staggerChildren } = await load();
    const list = el('<ul><li></li><li></li></ul>');
    const stop = staggerChildren(list, { observeChildren: true });
    const added = document.createElement('li');
    list.appendChild(added);
    await flush();
    const children = Array.from(list.children) as HTMLElement[];
    expect(children.every((c) => c.style.opacity === '0')).toBe(true);
    stop();
    expect(children.every((c) => c.style.opacity === '')).toBe(true);
    fireAll([list], true);
    expect(animations).toHaveLength(0);
  });

  it('staggerChildren: stopping after the reveal does not interrupt running animations', async () => {
    const { staggerChildren } = await load();
    const list = el('<ul><li></li><li></li></ul>');
    const stop = staggerChildren(list);
    fireAll([list], true);
    expect(animations).toHaveLength(2);
    stop();
    expect(animations.some((a) => a.cancelled)).toBe(false);
  });

  it('useScrollStagger (React): unmounting before the reveal shows the children again', async () => {
    await load();
    const { createReactHooks } = await import('../src/react');
    const list = el('<ul><li></li></ul>');
    const cleanups: Array<() => void> = [];
    let first = true;
    const React = {
      useRef: (init: any) => (first ? ((first = false), { current: list }) : { current: init }),
      useEffect: (fn: () => any) => {
        const c = fn();
        if (c) cleanups.push(c);
      },
    };
    createReactHooks(React as any).useScrollStagger();
    expect((list.firstElementChild as HTMLElement).style.opacity).toBe('0');
    cleanups.forEach((c) => c());
    expect((list.firstElementChild as HTMLElement).style.opacity).toBe('');
  });
});
