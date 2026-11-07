import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { anims, installComponentMocks, mount } from './components-setup';
import { defineLiquidNav, type UsaLiquidNavElement } from '../src/components/widgets/liquid-nav';

beforeEach(() => {
  document.body.replaceChildren();
  installComponentMocks();
  defineLiquidNav();
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const markup = '<usa-liquid-nav><button>A</button><button disabled>B</button><button>C</button></usa-liquid-nav>';
const key = (el: Element, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('liquid navigation', () => {
  it('honours value attributes after mount, synchronises clicks and preserves selection on reconnect', () => {
    const nav = mount<UsaLiquidNavElement>(markup);
    const change = vi.fn();
    nav.addEventListener('usa:change', change);
    nav.setAttribute('value', '2');
    expect(nav.value).toBe(2);
    expect(nav.querySelectorAll('button')[2].getAttribute('aria-current')).toBe('page');
    expect(change).not.toHaveBeenCalled();
    nav.querySelector('button')!.click();
    expect(nav.getAttribute('value')).toBe('0');
    expect(change).toHaveBeenCalledTimes(1);
    nav.value = 2;
    nav.remove();
    document.body.append(nav);
    expect(nav.value).toBe(2);
    expect(nav.querySelectorAll('[data-usa-part]')).toHaveLength(2);
  });

  it('uses vertical and RTL arrow keys, skips disabled items and supports Home/End', () => {
    const nav = mount<UsaLiquidNavElement>(markup);
    const items = nav.querySelectorAll('button');
    nav.style.direction = 'rtl';
    items[0].focus();
    key(items[0], 'ArrowLeft');
    expect(document.activeElement).toBe(items[2]);
    key(items[2], 'Home');
    expect(document.activeElement).toBe(items[0]);
    nav.setAttribute('orientation', 'vertical');
    expect(nav.dataset.orientation).toBe('vertical');
    key(items[0], 'ArrowDown');
    expect(document.activeElement).toBe(items[2]);
    key(items[2], 'ArrowDown');
    expect(document.activeElement).toBe(items[0]);
    key(items[0], 'End');
    expect(document.activeElement).toBe(items[2]);
    expect(nav.value).toBe(0); // Focusing a link does not navigate.
  });

  it('cancels superseded animations and releases animations and observers on disconnect', () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      observe = observe;
      disconnect = disconnect;
    });
    const nav = mount<UsaLiquidNavElement>(markup);
    const items = nav.querySelectorAll('button');
    Object.defineProperty(items[2], 'offsetLeft', { value: 100 });
    items[2].click();
    const first = anims.slice();
    expect(first).toHaveLength(2);
    items[0].click();
    expect(first.every((a) => a.cancelled)).toBe(true);
    expect(anims).toHaveLength(4);
    nav.remove();
    expect(anims.every((a) => a.cancelled)).toBe(true);
    expect(observe).toHaveBeenCalledTimes(4);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('jumps without animation under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const nav = mount<UsaLiquidNavElement>(markup);
    const last = nav.querySelectorAll('button')[2];
    Object.defineProperty(last, 'offsetLeft', { value: 120 });
    last.click();
    expect(nav.value).toBe(2);
    expect(anims).toHaveLength(0);
    expect(nav.querySelector<HTMLElement>('.usa-lq-drop')!.style.transform).toBe('translateX(120px)');
  });
});
