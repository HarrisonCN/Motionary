import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, mount, tick } from './components-setup';
import { defineClickComponents, burst, confetti, shake, haptic, morphPath, MORPH_ICONS, BUTTON_DEFORMS } from '../src/components/click';
import { configureComponents } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineClickComponents();
});
afterEach(() => vi.useRealTimers());

const pointer = (type: string, init: Record<string, unknown> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: 10, clientY: 10, ...init } as MouseEventInit);
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  if (init.timeStamp !== undefined) Object.defineProperty(e, 'timeStamp', { value: init.timeStamp });
  return e;
};
const rect = (el: Element, r: Partial<DOMRect> = {}) => (el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40, ...r }) as DOMRect);
const layerKids = () => document.querySelector('.usa-fx-layer')?.children.length ?? 0;

describe('click fx helpers', () => {
  it('burst() and confetti() spawn particles that remove themselves', () => {
    expect(burst(10, 10, { count: 5, shape: 'star' })).toBe(5);
    expect(layerKids()).toBe(5);
    expect(document.querySelector('.usa-fx-layer span')!.textContent).toBe('★');
    anims.forEach((a) => a.finish());
    expect(layerKids()).toBe(0);
    expect(confetti({ count: 7 })).toBe(7);
    expect(anims.slice(-7).every((a) => a.keyframes.length === 9)).toBe(true);
  });

  it('reduced motion: no particles; shake flashes an outline', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(burst(0, 0)).toBe(0);
    expect(confetti()).toBe(0);
    const el = document.createElement('div');
    shake(el);
    expect(anims[0].keyframes[0]).toHaveProperty('outline');
  });

  it('shake() oscillates; haptic() uses navigator.vibrate when present', () => {
    const el = document.createElement('div');
    shake(el, 10);
    expect(anims[0].keyframes.map((k) => k.transform)).toContain('translateX(-10px)');
    expect(haptic()).toBe(false);
    const vib = vi.fn(() => true);
    (navigator as any).vibrate = vib;
    expect(haptic([5, 5])).toBe(true);
    expect(vib).toHaveBeenCalledWith([5, 5]);
    delete (navigator as any).vibrate;
  });
});

describe('<usa-click>', () => {
  it('ripples, bursts and press-springs on pointer and keyboard', () => {
    const el = mount<any>('<usa-click effect="ripple burst press-spring" count="4"><button>x</button></usa-click>');
    rect(el);
    const fired = vi.fn();
    el.addEventListener('usa:click-effect', fired);
    el.dispatchEvent(pointer('pointerdown'));
    expect(el.querySelector('.usa-click-wave')).toBeTruthy();
    expect(el.hasAttribute('data-pressed')).toBe(true);
    el.dispatchEvent(pointer('pointerup'));
    expect(el.hasAttribute('data-pressed')).toBe(false);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5, detail: 1 }));
    expect(layerKids()).toBe(4);
    expect(fired.mock.calls[0][0].detail).toMatchObject({ x: 5, y: 5 });
    // keyboard click (detail 0) fires from the centre
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(fired.mock.calls[1][0].detail).toMatchObject({ x: 50, y: 20 });
  });

  it('shakes on invalid form fields and stays still under reduced motion', () => {
    const el = mount<any>('<usa-click effect="shake"><input required></usa-click>');
    el.querySelector('input')!.dispatchEvent(new Event('invalid'));
    expect(anims.some((a) => a.el === el && String(a.keyframes[1].transform).includes('translateX'))).toBe(true);
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-click effect="squish"><button>x</button></usa-click>');
    r.dispatchEvent(pointer('pointerdown'));
    expect(anims[0].keyframes[1]).toEqual({ opacity: 0.75 });
  });
});

describe('<usa-button> (button click deformation)', () => {
  it('lists the deformations and squashes on press, springing back on release', () => {
    expect(BUTTON_DEFORMS).toEqual(['squash', 'wobble', 'gooey', 'dent']);
    const el = mount<any>('<usa-button deform="squash dent"><button>Go</button></usa-button>');
    const b = el.querySelector('button')!;
    expect(el.target).toBe(b);
    expect(b.classList.contains('usa-button-face')).toBe(true);
    rect(b);
    b.dispatchEvent(pointer('pointerdown', { clientX: 100, clientY: 0 }));
    expect(b.style.getPropertyValue('--usa-dent-x')).toBe('100.0%');
    const press = anims[anims.length - 1];
    expect(String(press.keyframes[1].transform)).toContain('scale(1.12, 0.84)');
    expect(String(press.keyframes[1].transform)).toContain('rotateY(7.00deg)');
    (press as any).effect.getKeyframes = () => press.keyframes;
    b.dispatchEvent(pointer('pointerup'));
    const back = anims[anims.length - 1];
    expect(back.keyframes[1]).toEqual({ transform: 'none' });
  });

  it('wobbles the border radius on click and squeezes gooey droplets', () => {
    const el = mount<any>('<usa-button deform="wobble gooey"><button>Go</button></usa-button>');
    const b = el.querySelector('button')!;
    rect(b);
    b.dispatchEvent(pointer('pointerdown'));
    expect(el.querySelector('.usa-button-goo')!.children).toHaveLength(4);
    expect(document.getElementById('usa-goo')).toBeTruthy();
    b.click();
    expect(anims.some((a) => a.el === b && a.keyframes.some((k) => String(k.borderRadius).includes('%')))).toBe(true);
  });

  it('becomes a button itself without a native child, and morphs its shape', async () => {
    const el = mount<any>('<usa-button shape="pill"><span data-label>Hi</span></usa-button>');
    expect(el.getAttribute('role')).toBe('button');
    expect(el.tabIndex).toBe(0);
    let w = 120;
    el.getBoundingClientRect = () => ({ width: w, height: 40, left: 0, top: 0 }) as DOMRect;
    const p = el.morphTo('circle');
    w = 40;
    expect(el.getAttribute('data-shape')).toBe('circle');
    expect(el.shape).toBe('circle');
    await finishAll();
    await p;
  });

  it('submit morph: loading → success → idle, with aria-busy and a live status', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-button morph="submit" reset="500"><button>Pay</button></usa-button>');
    const b = el.querySelector('button')!;
    expect(b.querySelector('.usa-button-status svg')).toBeTruthy();
    let done: any;
    el.addEventListener('usa:submit', (e: any) => (done = e.detail.done));
    b.click();
    expect(el.state).toBe('loading');
    expect(b.getAttribute('aria-busy')).toBe('true');
    expect(b.getAttribute('data-shape')).toBe('circle');
    expect(el.querySelector('[role=status]')!.textContent).toBe('Loading…');
    b.click(); // ignored while loading
    done(true);
    expect(el.state).toBe('success');
    expect(b.hasAttribute('aria-busy')).toBe(false);
    expect(el.querySelector('[role=status]')!.textContent).toBe('Done');
    await vi.advanceTimersByTimeAsync(600);
    expect(el.state).toBe('idle');
    expect(b.getAttribute('data-shape')).toBe('pill');
    el.state = 'error';
    expect(anims.some((a) => a.el === b && String(a.keyframes[1]?.transform).includes('translateX'))).toBe(true);
  });

  it('no deformation under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-button deform="squash"><button>Go</button></usa-button>');
    el.querySelector('button')!.dispatchEvent(pointer('pointerdown'));
    expect(anims).toHaveLength(0);
  });
});

describe('<usa-icon-morph>', () => {
  it('every icon has the same structure so any pair can morph', () => {
    for (const q of Object.values(MORPH_ICONS)) expect(q.map((x) => x.length)).toEqual([4, 4, 4]);
    expect(morphPath('play')).toMatch(/^M7.00 5.00L/);
    expect(morphPath('play', 'pause', 1)).toBe(morphPath('pause'));
    expect(morphPath('play', 'pause', 0.5)).not.toBe(morphPath('play'));
  });

  it('toggles between icons with labels and a spring', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-icon-morph icons="play,pause" labels="Play,Pause" toggle></usa-icon-morph>');
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('aria-label')).toBe('Play');
    expect(el.querySelector('path')!.getAttribute('d')).toBe(morphPath('play'));
    el.click();
    expect(el.icon).toBe('pause');
    expect(el.getAttribute('aria-label')).toBe('Pause');
    await vi.advanceTimersByTimeAsync(3000);
    expect(el.querySelector('path')!.getAttribute('d')).toBe(morphPath('pause'));
  });

  it('is decorative without toggle/labels and switches instantly under reduced motion', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<any>('<usa-icon-morph icons="menu,close"></usa-icon-morph>');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    el.show('close');
    expect(el.querySelector('path')!.getAttribute('d')).toBe(morphPath('menu', 'close', 1));
  });
});

describe('<usa-like>, <usa-hold>, <usa-double-tap>, <usa-checkbox>', () => {
  it('like toggles aria-pressed and count, bursting when liked', () => {
    const el = mount<any>('<usa-like count="9"></usa-like>');
    expect(el.getAttribute('aria-pressed')).toBe('false');
    expect(el.getAttribute('aria-label')).toBe('Like (9)');
    const change = vi.fn();
    el.addEventListener('usa:change', change);
    el.click();
    expect(el.liked).toBe(true);
    expect(el.count).toBe(10);
    expect(el.querySelector('.usa-like-count')!.textContent).toBe('10');
    expect(layerKids()).toBeGreaterThan(0);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(change.mock.calls[1][0].detail).toEqual({ liked: false, count: 9 });
  });

  it('hold confirms after the duration and rewinds when released early', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-hold duration="500" label="Delete"></usa-hold>');
    expect(el.getAttribute('aria-label')).toBe('Delete');
    const confirm = vi.fn();
    const cancel = vi.fn();
    el.addEventListener('usa:confirm', confirm);
    el.addEventListener('usa:cancel', cancel);
    el.dispatchEvent(pointer('pointerdown'));
    await vi.advanceTimersByTimeAsync(200);
    el.dispatchEvent(pointer('pointerup'));
    expect(cancel).toHaveBeenCalled();
    expect(el.progress).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(400);
    expect(el.progress).toBe(0);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await vi.advanceTimersByTimeAsync(700);
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('double tap pops an icon at the tap point', () => {
    const el = mount<any>('<usa-double-tap icon="🔥"><div>photo</div></usa-double-tap>');
    rect(el, { width: 200, height: 200 });
    const hit = vi.fn();
    el.addEventListener('usa:double-tap', hit);
    el.dispatchEvent(pointer('pointerup', { clientX: 50, clientY: 60, timeStamp: 1000 }));
    el.dispatchEvent(pointer('pointerup', { clientX: 52, clientY: 61, timeStamp: 1200 }));
    expect(hit.mock.calls[0][0].detail).toEqual({ x: 52, y: 61 });
    expect(el.querySelector('.usa-double-tap-icon')!.textContent).toBe('🔥');
    el.dispatchEvent(pointer('pointerup', { clientX: 50, clientY: 60, timeStamp: 3000 }));
    expect(hit).toHaveBeenCalledTimes(1);
  });

  it('checkbox is an accessible, springy toggle with an indeterminate state', () => {
    const el = mount<any>('<usa-checkbox indeterminate label="All"></usa-checkbox>');
    expect(el.getAttribute('role')).toBe('checkbox');
    expect(el.getAttribute('aria-checked')).toBe('mixed');
    el.click();
    expect(el.checked).toBe(true);
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(anims.some((a) => a.el === el.querySelector('.usa-checkbox-box'))).toBe(true);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(el.checked).toBe(false);
  });
});
