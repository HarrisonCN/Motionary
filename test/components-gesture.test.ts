import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { defineGestureComponents, gesture, swipeDirection, pinchScale } from '../src/components/gesture';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineGestureComponents();
});

const ev = (type: string, x: number, y: number, id = 1, timeStamp = 0) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(e, 'pointerId', { value: id });
  Object.defineProperty(e, 'pointerType', { value: 'touch' });
  Object.defineProperty(e, 'timeStamp', { value: timeStamp });
  return e;
};
const drag = (el: Element, pts: [number, number, number][]) => {
  const [first, ...rest] = pts;
  el.dispatchEvent(ev('pointerdown', first[0], first[1], 1, first[2]));
  rest.slice(0, -1).forEach((p) => el.dispatchEvent(ev('pointermove', p[0], p[1], 1, p[2])));
  const l = rest[rest.length - 1];
  el.dispatchEvent(ev('pointermove', l[0], l[1], 1, l[2]));
  el.dispatchEvent(ev('pointerup', l[0], l[1], 1, l[2]));
};

describe('gesture math', () => {
  it('classifies swipes by distance / velocity and axis', () => {
    expect(swipeDirection(120, 5, 900, 0)?.direction).toBe('right');
    expect(swipeDirection(-80, 10, -600, 0)?.direction).toBe('left');
    expect(swipeDirection(4, -90, 0, -800)?.direction).toBe('up');
    expect(swipeDirection(10, 3, 50, 0)).toBeNull();
    expect(swipeDirection(60, 200, 700, 900, { axis: 'x' })?.direction).toBe('right');
  });
  it('pinch scale is relative and clamped', () => {
    expect(pinchScale(100, 200)).toBe(2);
    expect(pinchScale(100, 1000)).toBe(4);
    expect(pinchScale(100, 10)).toBe(0.5);
    expect(pinchScale(0, 10, 1.5)).toBe(1.5);
  });
});

describe('gesture()', () => {
  it('reports pan with first/last and a velocity, then a swipe', () => {
    const el = mount('<div></div>');
    const pans: any[] = [];
    const onSwipe = vi.fn();
    const off = gesture(el, { onPan: (s) => pans.push(s), onSwipe }, { axis: 'x' });
    drag(el, [[0, 0, 0], [20, 0, 16], [60, 0, 32], [140, 2, 48]]);
    expect(pans[0].first).toBe(true);
    expect(pans[pans.length - 1]).toMatchObject({ last: true, dx: 140, dy: 0 });
    expect(pans[pans.length - 1].vx).toBeGreaterThan(1000);
    expect(onSwipe).toHaveBeenCalledWith(expect.objectContaining({ direction: 'right' }));
    expect(el.style.touchAction).toBe('pan-y');
    off();
  });

  it('tap, double tap and long press', () => {
    vi.useFakeTimers();
    const el = mount('<div></div>');
    const onTap = vi.fn();
    const onDoubleTap = vi.fn();
    const onLongPress = vi.fn();
    gesture(el, { onTap, onDoubleTap, onLongPress });
    el.dispatchEvent(ev('pointerdown', 5, 5, 1, 0));
    el.dispatchEvent(ev('pointerup', 5, 5, 1, 50));
    el.dispatchEvent(ev('pointerdown', 5, 5, 1, 150));
    el.dispatchEvent(ev('pointerup', 5, 5, 1, 200));
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    el.dispatchEvent(ev('pointerdown', 5, 5, 1, 1000));
    vi.advanceTimersByTime(600);
    el.dispatchEvent(ev('pointerup', 5, 5, 1, 1600));
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('two pointers pinch; ctrl + wheel pinches too', () => {
    const el = mount('<div></div>');
    const s: number[] = [];
    gesture(el, { onPinch: (p) => s.push(p.scale) });
    el.dispatchEvent(ev('pointerdown', 0, 0, 1));
    el.dispatchEvent(ev('pointerdown', 100, 0, 2));
    el.dispatchEvent(ev('pointermove', 200, 0, 2));
    el.dispatchEvent(ev('pointerup', 200, 0, 2));
    expect(s[0]).toBe(2);
    const w = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, cancelable: true });
    el.dispatchEvent(w);
    expect(s[s.length - 1]).toBeCloseTo(Math.E);
    expect(w.defaultPrevented).toBe(true);
  });
});

describe('<usa-swipeable>', () => {
  it('follows the finger and dismisses past the distance', async () => {
    const el = mount<any>('<usa-swipeable distance="100" dismiss><div>Card</div></usa-swipeable>');
    const swipe = vi.fn();
    el.addEventListener('usa:swipe', swipe);
    el.dispatchEvent(ev('pointerdown', 0, 0, 1, 0));
    el.dispatchEvent(ev('pointermove', 50, 0, 1, 300));
    el.dispatchEvent(ev('pointermove', 60, 0, 1, 600));
    expect(el.offset).toBe(60);
    el.dispatchEvent(ev('pointermove', 180, 0, 1, 900));
    el.dispatchEvent(ev('pointerup', 180, 0, 1, 1200));
    expect(swipe).toHaveBeenCalledWith(expect.objectContaining({ detail: { direction: 'right' } }));
    expect(el.hasAttribute('data-gone')).toBe(true);
  });

  it('keyboard dismiss is instant under reduced motion; cancelable', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-swipeable dismiss><div>Card</div></usa-swipeable>');
    const dismissed = vi.fn();
    el.addEventListener('usa:dismiss', dismissed);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(dismissed).toHaveBeenCalled();
    expect(el.isConnected).toBe(false);
    const el2 = mount<any>('<usa-swipeable><div>Card</div></usa-swipeable>');
    el2.addEventListener('usa:swipe', (e: Event) => e.preventDefault());
    const d2 = vi.fn();
    el2.addEventListener('usa:dismiss', d2);
    el2.swipe('left');
    expect(d2).not.toHaveBeenCalled();
  });
});

describe('<usa-pinch-zoom>', () => {
  it('zooms with keyboard and clamps to min/max', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-pinch-zoom max="3"><img alt="x"></usa-pinch-zoom>');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));
    expect(el.scale).toBeCloseTo(1.25);
    el.zoomTo(10);
    expect(el.scale).toBe(3);
    expect(el.hasAttribute('data-zoomed')).toBe(true);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }));
    expect(el.scale).toBe(1);
    expect(el.style.getPropertyValue('--usa-zoom')).toBe('1');
  });
});
