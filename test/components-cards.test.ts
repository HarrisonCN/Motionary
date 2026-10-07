import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, mount, tick } from './components-setup';
import { defineCardComponents, CARD_EFFECTS } from '../src/components/cards';
import { configureComponents } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineCardComponents();
});
afterEach(() => vi.useRealTimers());

const pointer = (type: string, init: Record<string, unknown> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: 0, clientY: 0, ...init } as MouseEventInit);
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  return e;
};
const rect = (el: Element, r: Partial<DOMRect>) => (el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, ...r }) as DOMRect);

describe('<usa-card>', () => {
  it('lists ten combinable effects', () => {
    expect(CARD_EFFECTS).toHaveLength(10);
    const el = mount<any>('<usa-card effect="lift sheen holo"></usa-card>');
    expect(el.effects).toEqual(['lift', 'sheen', 'holo']);
    expect(el.querySelector('.usa-card-sheen')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.usa-card-holo')).toBeTruthy();
  });

  it('tracks the pointer into CSS variables and parallax layers', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-card effect="spotlight parallax-layers" depth="20" color="#f00"><i data-depth="1"></i></usa-card>');
    expect(el.style.getPropertyValue('--usa-card-glow')).toBe('#f00');
    rect(el, {});
    el.dispatchEvent(pointer('pointerenter'));
    el.dispatchEvent(pointer('pointermove', { clientX: 200, clientY: 0 }));
    await vi.advanceTimersByTimeAsync(20);
    expect(el.style.getPropertyValue('--usa-card-x')).toBe('100.0%');
    expect(el.style.getPropertyValue('--usa-card-nx')).toBe('1.000');
    expect(el.style.getPropertyValue('--usa-card-ny')).toBe('-1.000');
    expect(el.querySelector('i')!.style.transform).toBe('translate3d(20.0px, -20.0px, 0)');
    expect(el.hasAttribute('data-hover')).toBe(true);
    el.dispatchEvent(pointer('pointerleave'));
    expect(el.hasAttribute('data-hover')).toBe(false);
  });

  it('does not track the pointer under reduced motion', async () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-card effect="spotlight"></usa-card>');
    rect(el, {});
    el.dispatchEvent(pointer('pointerenter'));
    expect(el.hasAttribute('data-hover')).toBe(false);
  });

  it('click flip is a toggle button with aria-pressed and hides the hidden face', () => {
    const el = mount<any>('<usa-card effect="flip" trigger="click"><div data-front>F</div><div data-back>B<a href="#">link</a></div></usa-card>');
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('aria-pressed')).toBe('false');
    expect(el.querySelector('[data-back]')!.getAttribute('aria-hidden')).toBe('true');
    const flip = vi.fn();
    el.addEventListener('usa:flip', flip);
    el.click();
    expect(el.flipped).toBe(true);
    expect(el.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('[data-front]')!.getAttribute('aria-hidden')).toBe('true');
    el.querySelector('a')!.click(); // links inside keep working, no flip
    expect(el.flipped).toBe(true);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.flipped).toBe(false);
    expect(flip).toHaveBeenCalledTimes(2);
  });

  it('expand grows into a detail view and collapses with Esc / data-close', async () => {
    const el = mount<any>('<usa-card effect="expand"><h3>T</h3><div data-detail><button data-close>x</button></div></usa-card>');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    let n = 0;
    el.getBoundingClientRect = () => (n++ === 0 ? { left: 10, top: 20, width: 100, height: 50 } : { left: 0, top: 0, width: 800, height: 600 }) as DOMRect;
    const opened = vi.fn();
    el.addEventListener('usa:expand', opened);
    const p = el.expand();
    expect(el.expanded).toBe(true);
    expect(el.previousElementSibling.className).toBe('usa-card-backdrop');
    expect(document.querySelector('.usa-card-spacer')).toBeTruthy();
    const flipAnim = anims.find((a) => a.el === el)!;
    expect(String(flipAnim.keyframes[0].transform)).toContain('translate(10px, 20px) scale(0.125, ');
    await finishAll();
    await p;
    expect(opened).toHaveBeenCalled();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await finishAll();
    expect(el.expanded).toBe(false);
    expect(document.querySelector('.usa-card-backdrop, .usa-card-spacer')).toBeNull();
    el.click();
    await finishAll();
    expect(el.expanded).toBe(true);
    el.querySelector('[data-close]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await finishAll();
    expect(el.expanded).toBe(false);
  });
});

describe('<usa-card-stack>', () => {
  it('fans cards out and swipes the top one away (keyboard), looping', async () => {
    const el = mount<any>('<usa-card-stack loop><div>1</div><div>2</div><div>3</div></usa-card-stack>');
    expect(el.getAttribute('aria-roledescription')).toBe('card stack');
    expect(el.top.textContent).toBe('1');
    expect(el.children[1].style.transform).toContain('translate3d(0, 10.0px, 0) scale(0.950)');
    expect(el.children[1].getAttribute('aria-hidden')).toBe('true');
    const swiped = vi.fn();
    el.addEventListener('usa:swipe', swiped);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await finishAll();
    await tick();
    expect(swiped.mock.calls[0][0].detail.direction).toBe('right');
    expect(el.top.textContent).toBe('2');
    expect(el.lastElementChild.textContent).toBe('1'); // looped
  });

  it('drag past the threshold dismisses; empties without loop', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-card-stack threshold="50"><div>1</div></usa-card-stack>');
    const empty = vi.fn();
    el.addEventListener('usa:empty', empty);
    const top = el.top;
    top.dispatchEvent(pointer('pointerdown', { clientX: 0 }));
    el.dispatchEvent(pointer('pointermove', { clientX: -30 }));
    expect(top.style.transform).toContain('translate3d(-30px');
    el.dispatchEvent(pointer('pointerup', { clientX: -30 }));
    await vi.advanceTimersByTimeAsync(2000);
    expect(el.top).toBe(top); // sprang back
    top.dispatchEvent(pointer('pointerdown', { clientX: 0 }));
    el.dispatchEvent(pointer('pointermove', { clientX: -80 }));
    el.dispatchEvent(pointer('pointerup', { clientX: -80 }));
    vi.useRealTimers();
    await finishAll();
    await tick();
    expect(el.top).toBeNull();
    expect(empty).toHaveBeenCalled();
  });
});

describe('<usa-sticky-stack>', () => {
  it('offsets cards and scales covered ones', () => {
    const el = mount<any>('<usa-sticky-stack top="50" gap="10"><div>a</div><div>b</div></usa-sticky-stack>');
    const [a, b] = Array.from(el.children) as HTMLElement[];
    expect(a.style.top).toBe('50px');
    expect(b.style.top).toBe('60px');
    rect(a, { top: 50, bottom: 250, height: 200 });
    rect(b, { top: 150, bottom: 350, height: 200 });
    el.update();
    expect(a.style.transform).toBe('scale(0.9700)');
    expect(b.style.transform).toBe('');
  });
});

describe('<usa-carousel-3d>', () => {
  it('places items on a ring and rotates with keys (shortest path), marking aria-current', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-carousel-3d radius="300"><div>1</div><div>2</div><div>3</div><div>4</div></usa-carousel-3d>');
    expect(el.children[1].style.transform).toBe('rotateY(90.00deg) translateZ(300px)');
    expect(el.children[0].getAttribute('aria-current')).toBe('true');
    const change = vi.fn();
    el.addEventListener('usa:change', change);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(el.index).toBe(3);
    expect(change.mock.calls[0][0].detail.index).toBe(3);
    await vi.advanceTimersByTimeAsync(4000);
    expect(el.children[3].style.transform).toBe('rotateY(0.00deg) translateZ(300px)');
    expect(el.children[3].getAttribute('aria-current')).toBe('true');
  });

  it('reduced motion: flat, instant', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<any>('<usa-carousel-3d><div>1</div><div>2</div></usa-carousel-3d>');
    el.next();
    expect(el.children[1].style.transform).toBe('');
    expect(el.children[1].style.opacity).toBe('1');
    expect(el.children[0].style.opacity).toBe('0');
  });
});
