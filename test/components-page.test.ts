import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, mount, tick } from './components-setup';
import { definePageComponents, pageTransition, themeTransition, enableMpaTransitions, smoothScroll, scrollToTarget, loadingBar, setMotionIntensity, setMotionLevel, restoreMotionIntensity, getMotionIntensity, PAGE_EFFECTS } from '../src/components/page';
import { configureComponents, motionScale, prefersReducedMotion } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  configureComponents({ motionIntensity: 'normal' });
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-usa-pt');
  definePageComponents();
});
afterEach(() => {
  vi.useRealTimers();
  configureComponents({ motionIntensity: 'normal' });
  delete (document as any).startViewTransition;
  try {
    localStorage.clear();
  } catch {
    /* */
  }
});

describe('motion intensity', () => {
  it('scales component animations and "off" acts as reduced motion', () => {
    setMotionIntensity('low');
    expect(getMotionIntensity()).toBe('low');
    expect(motionScale()).toBe(0.6);
    expect(document.documentElement.style.getPropertyValue('--usa-motion')).toBe('0.6');
    expect(document.documentElement.getAttribute('data-usa-motion')).toBe('low');
    const el = mount<any>('<usa-auto-skeleton loading></usa-auto-skeleton>');
    el.loading = false;
    expect(anims[anims.length - 1].timing.duration).toBeCloseTo(180);
    setMotionIntensity('off' as any); // 5.0: removed — ignored
    expect(getMotionIntensity()).toBe('low');
    setMotionLevel('off');
    expect(prefersReducedMotion()).toBe(true);
    setMotionLevel('normal');
    expect(prefersReducedMotion()).toBe(false);
  });

  it('persists and restores; <usa-motion-switch> is a radiogroup', () => {
    setMotionIntensity('high', true);
    configureComponents({ motionIntensity: 'normal' });
    expect(restoreMotionIntensity()).toBe('high');
    const sw = mount<any>('<usa-motion-switch></usa-motion-switch>');
    expect(sw.getAttribute('role')).toBe('radiogroup');
    expect(sw.querySelector('[aria-checked=true]').dataset.level).toBe('high');
    (sw.querySelector('[data-level=low]') as HTMLElement).click();
    expect(getMotionIntensity()).toBe('low');
    sw.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(getMotionIntensity()).toBe('normal');
  });
});

describe('page transitions', () => {
  it('uses View Transitions with the effect attribute and origin variables', async () => {
    let cb: any;
    (document as any).startViewTransition = vi.fn((fn: any) => {
      cb = fn;
      expect(document.documentElement.getAttribute('data-usa-pt')).toBe('circle');
      return { finished: Promise.resolve().then(() => cb()) };
    });
    const update = vi.fn();
    await pageTransition(update, { effect: 'circle', x: 10, y: 20 });
    expect(update).toHaveBeenCalled();
    expect(document.documentElement.style.getPropertyValue('--usa-pt-x')).toBe('10px');
    expect(document.documentElement.hasAttribute('data-usa-pt')).toBe(false);
    expect(PAGE_EFFECTS).toContain('blinds');
    expect(PAGE_EFFECTS).toContain('pixel');
  });

  it('falls back to a direct update without View Transitions / under reduced motion', async () => {
    const update = vi.fn();
    const box = document.createElement('div');
    const pending = pageTransition(update, { fallback: box });
    await tick();
    anims.forEach((a) => a.finish());
    await pending;
    expect(update).toHaveBeenCalledTimes(1);
    (document as any).startViewTransition = vi.fn();
    configureComponents({ reducedMotion: 'reduce' });
    await themeTransition(update);
    expect((document as any).startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('enableMpaTransitions marks the document', () => {
    enableMpaTransitions('slide');
    expect(document.documentElement.getAttribute('data-usa-pt')).toBe('slide');
  });
});

describe('scrolling', () => {
  it('smoothScroll eases wheel deltas and can be stopped', async () => {
    vi.useFakeTimers();
    const box = document.createElement('div');
    Object.defineProperty(box, 'scrollHeight', { value: 2000 });
    Object.defineProperty(box, 'clientHeight', { value: 200 });
    document.body.append(box);
    const stop = smoothScroll({ target: box, lerp: 0.5 });
    const e = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
    box.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    await vi.advanceTimersByTimeAsync(500);
    expect(box.scrollTop).toBeCloseTo(100, 0);
    stop();
    const e2 = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
    box.dispatchEvent(e2);
    expect(e2.defaultPrevented).toBe(false);
  });

  it('smoothScroll is a no-op under reduced motion; scrollToTarget jumps', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const box = document.createElement('div');
    document.body.append(box);
    smoothScroll({ target: box });
    const e = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
    box.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    await scrollToTarget(300);
    expect(spy).toHaveBeenCalledWith(0, 300);
  });
});

describe('page elements', () => {
  it('loading bar trickles, completes and hides; loadingBar creates one on demand', async () => {
    vi.useFakeTimers();
    loadingBar.start();
    const bar = document.querySelector<any>('usa-loading-bar');
    expect(bar).toBeTruthy();
    expect(bar.getAttribute('role')).toBe('progressbar');
    await vi.advanceTimersByTimeAsync(1000);
    expect(bar.progress).toBeGreaterThan(0.1);
    expect(bar.progress).toBeLessThan(0.9);
    loadingBar.done();
    expect(bar.progress).toBe(1);
    await vi.advanceTimersByTimeAsync(700);
    expect(bar.hasAttribute('data-active')).toBe(false);
  });

  it('back-to-top appears after the offset', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-back-to-top offset="100"></usa-back-to-top>');
    expect(el.querySelector('button').getAttribute('aria-label')).toBe('Back to top');
    expect(el.visible).toBe(false);
    (window as any).scrollY = 500;
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(20);
    expect(el.visible).toBe(true);
    (window as any).scrollY = 0;
  });

  it('cursor renders for fine pointers, not under reduced motion', () => {
    const el = mount<any>('<usa-cursor mode="trail"></usa-cursor>'); // 6.0: trail removed → renders as dot
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelectorAll('.usa-cursor-ring')).toHaveLength(1);
    expect(el.querySelector('.usa-cursor-dot')).not.toBeNull();
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 5 }));
    expect(el.active).toBe(true);
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-cursor></usa-cursor>');
    expect(r.children).toHaveLength(0);
  });

  it('fullpage pages with the keyboard and draws dot nav', () => {
    const el = mount<any>('<usa-fullpage dots><section>a</section><section>b</section><section>c</section></usa-fullpage>');
    const dots = el.querySelectorAll('.usa-fullpage-dots button');
    expect(dots).toHaveLength(3);
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    el.scrollTo = vi.fn();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(el.index).toBe(2);
    expect(dots[2].getAttribute('aria-current')).toBe('true');
  });

  it('splash leaves after min ms and clears aria-busy', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-splash manual min="300">logo</usa-splash>');
    expect(document.body.getAttribute('aria-busy')).toBe('true');
    const done = vi.fn();
    el.addEventListener('usa:done', done);
    const p = el.done();
    await vi.advanceTimersByTimeAsync(300);
    vi.useRealTimers();
    await finishAll();
    await p;
    expect(done).toHaveBeenCalled();
    expect(el.hidden).toBe(true);
    expect(document.body.hasAttribute('aria-busy')).toBe(false);
  });

  it('auto skeleton toggles aria-busy; ambient is decorative', () => {
    const s = mount<any>('<usa-auto-skeleton loading><p>x</p></usa-auto-skeleton>');
    expect(s.getAttribute('aria-busy')).toBe('true');
    s.loading = false;
    expect(s.hasAttribute('aria-busy')).toBe(false);
    const a = mount<any>('<usa-ambient effect="noise"></usa-ambient>');
    expect(a.getAttribute('aria-hidden')).toBe('true');
  });
});
