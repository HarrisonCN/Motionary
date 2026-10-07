import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, intersect, mount, tick } from './components-setup';
import {
  definePhysicsComponents,
  SPRING_PRESETS,
  resolveSpring,
  springSamples,
  springEasing,
  linearEasing,
  spring,
  createSpring,
  projectInertia,
  snapTo,
  rubberBand,
  springEffectKeyframes,
} from '../src/components/physics';
import { configureComponents } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  definePhysicsComponents();
});
afterEach(() => {
  vi.useRealTimers();
  delete (globalThis as any).CSS;
});

const pointer = (type: string, init: Record<string, unknown> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: 0, clientY: 0, ...init } as MouseEventInit);
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  if (init.timeStamp !== undefined) Object.defineProperty(e, 'timeStamp', { value: init.timeStamp });
  return e;
};

describe('spring physics core', () => {
  it('resolves presets and partial configs', () => {
    expect(resolveSpring('bouncy')).toMatchObject(SPRING_PRESETS.bouncy);
    expect(resolveSpring({ stiffness: 400 })).toMatchObject({ stiffness: 400, damping: 26, mass: 1 });
    expect(resolveSpring('nope')).toMatchObject(SPRING_PRESETS.default);
    expect(resolveSpring({ mass: -1 }).mass).toBe(1);
  });

  it('settles at 1; bouncy springs overshoot, heavily damped ones do not', () => {
    const b = springSamples('bouncy');
    expect(b.values[b.values.length - 1]).toBe(1);
    expect(Math.max(...b.values)).toBeGreaterThan(1.2);
    const m = springSamples('molasses');
    expect(Math.max(...m.values)).toBeLessThanOrEqual(1.0001);
    expect(m.duration).toBeGreaterThan(springSamples('stiff').duration / 2);
    // heavier = slower
    expect(springSamples({ mass: 3 }).duration).toBeGreaterThan(springSamples({ mass: 1 }).duration);
  });

  it('builds CSS linear() easings, with a cubic-bezier fallback', () => {
    expect(linearEasing([0, 0.5, 1.2, 1], 48)).toBe('linear(0, 0.5, 1.2, 1)');
    expect(springEasing('bouncy').easing).toMatch(/^cubic-bezier/);
    (globalThis as any).CSS = { supports: () => true };
    const e = springEasing('bouncy', 20);
    expect(e.easing).toMatch(/^linear\(0, /);
    expect(e.easing.split(',').length).toBeLessThanOrEqual(21);
    expect(e.duration).toBeGreaterThan(300);
  });

  it('spring() animates with spring timing and jumps to the end under reduced motion', () => {
    const el = document.createElement('div');
    spring(el, [{ opacity: 0 }, { opacity: 1 }], 'gentle');
    expect(anims[0].timing.duration).toBe(springEasing('gentle').duration);
    configureComponents({ reducedMotion: 'reduce' });
    const el2 = document.createElement('div');
    expect(spring(el2, [{ opacity: 0 }, { opacity: '0.5' }])).toBeNull();
    expect(el2.style.opacity).toBe('0.5');
  });

  it('createSpring() animates to its target, keeps velocity and reports rest', async () => {
    vi.useFakeTimers();
    const updates: number[] = [];
    const rest = vi.fn();
    const s = createSpring({ spring: 'stiff', onUpdate: (v) => updates.push(v), onRest: rest });
    s.set(100, 50);
    expect(s.animating).toBe(true);
    expect(s.velocity).toBe(50);
    await vi.advanceTimersByTimeAsync(3000);
    expect(rest).toHaveBeenCalledWith(100);
    expect(s.value).toBe(100);
    expect(Math.max(...updates)).toBeGreaterThan(100); // underdamped overshoot
    s.jump(5);
    expect(s.value).toBe(5);
    expect(s.animating).toBe(false);
  });

  it('createSpring() jumps under reduced motion', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const rest = vi.fn();
    const s = createSpring({ onRest: rest });
    s.set(42);
    expect(s.value).toBe(42);
    expect(rest).toHaveBeenCalledWith(42);
  });

  it('inertia, snapping and rubber-banding', () => {
    expect(projectInertia(0, 1000)).toBeCloseTo(325);
    expect(snapTo(57, 40)).toBe(40);
    expect(snapTo(61, 40)).toBe(80);
    expect(snapTo(130, [0, 120, 240])).toBe(120);
    expect(snapTo(13, null)).toBe(13);
    expect(rubberBand(100, 200)).toBeGreaterThan(0);
    expect(rubberBand(100, 200)).toBeLessThan(100);
    expect(rubberBand(-100, 200)).toBeCloseTo(-rubberBand(100, 200));
    expect(rubberBand(1e6, 200)).toBeLessThan(200);
  });
});

describe('<usa-spring>', () => {
  it('starts hidden and bounces in with spring timing when it enters the view', async () => {
    const el = mount<any>('<usa-spring effect="bounce-in"><b>Hi</b></usa-spring>');
    expect(el.getAttribute('data-state')).toBe('hidden');
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    intersect(el);
    expect(el.getAttribute('data-state')).toBe('playing');
    expect(anims[0].keyframes[0]).toMatchObject({ opacity: 0, transform: 'scale(0.3)' });
    expect(anims[0].timing.duration).toBe(springEasing('bouncy').duration);
    await finishAll();
    expect(el.getAttribute('data-state')).toBe('done');
    expect(done).toHaveBeenCalled();
  });

  it('attention effects play on click / Enter and never hide the content', () => {
    const el = mount<any>('<usa-spring effect="jelly" trigger="click"><button>x</button></usa-spring>');
    expect(el.hasAttribute('data-state')).toBe(false);
    el.click();
    expect(anims).toHaveLength(1);
    expect(anims[0].keyframes.length).toBe(7);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(anims).toHaveLength(2);
    expect(springEffectKeyframes('rubber-band')[1].transform).toContain('scale3d(1.3');
  });

  it('honours custom stiffness/damping and reduced motion', () => {
    const el = mount<any>('<usa-spring effect="pop" trigger="manual" stiffness="500" damping="30"></usa-spring>');
    el.play();
    expect(anims[0].timing.duration).toBe(springEasing({ stiffness: 500, damping: 30, mass: 1 }).duration);
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-spring effect="drop" trigger="manual"></usa-spring>');
    r.play();
    expect(anims[0].keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
  });
});

describe('<usa-draggable>', () => {
  it('follows the pointer and springs back home with spring-back', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-draggable spring-back><div>drag</div></usa-draggable>');
    expect(el.tabIndex).toBe(0);
    expect(el.getAttribute('aria-roledescription')).toBe('draggable');
    const end = vi.fn();
    const settle = vi.fn();
    el.addEventListener('usa:drag-end', end);
    el.addEventListener('usa:settle', settle);
    el.dispatchEvent(pointer('pointerdown', { clientX: 10, clientY: 10, timeStamp: 0 }));
    el.dispatchEvent(pointer('pointermove', { clientX: 60, clientY: 30, timeStamp: 50 }));
    expect(el.x).toBe(50);
    expect(el.y).toBe(20);
    expect(el.style.transform).toBe('translate3d(50px, 20px, 0)');
    expect(el.hasAttribute('data-dragging')).toBe(true);
    el.dispatchEvent(pointer('pointerup', { clientX: 60, clientY: 30, timeStamp: 60 }));
    expect(end.mock.calls[0][0].detail).toMatchObject({ x: 0, y: 0 });
    await vi.advanceTimersByTimeAsync(4000);
    expect(el.x).toBe(0);
    expect(el.y).toBe(0);
    expect(settle).toHaveBeenCalled();
  });

  it('locks to an axis and snaps to the grid on release', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-draggable axis="x" snap="40"></usa-draggable>');
    el.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 }));
    el.dispatchEvent(pointer('pointermove', { clientX: 55, clientY: 90, timeStamp: 400 }));
    expect(el.y).toBe(0);
    el.dispatchEvent(pointer('pointerup', { clientX: 55, clientY: 90, timeStamp: 900 }));
    await vi.advanceTimersByTimeAsync(4000);
    expect(el.x).toBe(40);
  });

  it('inertia projects a flick forward; arrow keys move by the snap step; Home resets', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-draggable inertia></usa-draggable>');
    const end = vi.fn();
    el.addEventListener('usa:drag-end', end);
    el.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 }));
    el.dispatchEvent(pointer('pointermove', { clientX: 50, clientY: 0, timeStamp: 50 }));
    el.dispatchEvent(pointer('pointerup', { clientX: 50, clientY: 0, timeStamp: 50 }));
    expect(end.mock.calls[0][0].detail.x).toBeCloseTo(50 + 1000 * 0.325);
    const k = mount<any>('<usa-draggable snap="25"></usa-draggable>');
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await vi.advanceTimersByTimeAsync(3000);
    expect([k.x, k.y]).toEqual([25, 25]);
    k.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await vi.advanceTimersByTimeAsync(3000);
    expect([k.x, k.y]).toEqual([0, 0]);
  });

  it('moves instantly under reduced motion and ignores input when disabled', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<any>('<usa-draggable></usa-draggable>');
    el.moveTo(30, 10);
    expect([el.x, el.y]).toEqual([30, 10]);
    el.setAttribute('disabled', '');
    el.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
    expect(el.dragging).toBe(false);
  });
});

describe('<usa-overscroll>', () => {
  const scroller = (html = '<usa-overscroll><div style="height:900px">x</div></usa-overscroll>') => {
    const el = mount<any>(html);
    Object.defineProperty(el, 'scrollHeight', { value: 900, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
    return el;
  };

  it('stretches past the top edge on wheel and springs back', async () => {
    vi.useFakeTimers();
    const el = scroller();
    el.scrollTop = 0;
    el.dispatchEvent(new WheelEvent('wheel', { deltaY: -60 }));
    expect(el.offset).toBeGreaterThan(0);
    expect(el.offset).toBeLessThan(60);
    expect(el.style.getPropertyValue('--usa-overscroll')).toMatch(/px$/);
    expect(el.hasAttribute('data-stretched')).toBe(true);
    await vi.advanceTimersByTimeAsync(3000);
    expect(el.offset).toBe(0);
  });

  it('does nothing mid-scroll, when disabled or under reduced motion', () => {
    const el = scroller();
    el.scrollTop = 300;
    el.dispatchEvent(new WheelEvent('wheel', { deltaY: -60 }));
    expect(el.offset).toBe(0);
    installComponentMocks({ reducedMotion: true });
    const r = scroller();
    r.dispatchEvent(new WheelEvent('wheel', { deltaY: -60 }));
    expect(r.offset).toBe(0);
  });
});

describe('physics registration', () => {
  it('registers every element once', async () => {
    definePhysicsComponents();
    for (const t of ['usa-spring', 'usa-draggable', 'usa-overscroll']) expect(customElements.get(t)).toBeTruthy();
    await tick();
  });
});
