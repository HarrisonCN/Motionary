import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, intersect, mount, tick } from './components-setup';
import { defineInteractionComponents } from '../src/components/interaction';
import { defineFeedbackComponents, toast, SPINNER_VARIANTS } from '../src/components/feedback';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineInteractionComponents();
  defineFeedbackComponents();
});
afterEach(() => vi.useRealTimers());

const pointer = (type: string, init: Record<string, unknown> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: 10, clientY: 10, ...init } as MouseEventInit);
  Object.defineProperty(e, 'pointerType', { value: (init.pointerType as string) || 'mouse' });
  return e;
};
const key = (type: string, k: string) => new KeyboardEvent(type, { key: k, bubbles: true });
const rect = (el: Element, r: Partial<DOMRect>) => (el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40, ...r }) as DOMRect);

describe('<usa-ripple>', () => {
  it('spawns a wave at the pointer that is removed when it finishes', () => {
    const el = mount('<usa-ripple><button>Go</button></usa-ripple>');
    rect(el, {});
    el.dispatchEvent(pointer('pointerdown', { clientX: 20, clientY: 10 }));
    const wave = el.querySelector<HTMLElement>('.usa-ripple-wave')!;
    expect(wave).toBeTruthy();
    expect(wave.getAttribute('aria-hidden')).toBe('true');
    expect(wave.style.left).toBe(`${20 - Math.hypot(80, 30)}px`);
    const a = anims.find((x) => x.el === wave)!;
    expect(a.keyframes[0]).toMatchObject({ transform: 'scale(0)' });
    a.finish();
    expect(el.querySelector('.usa-ripple-wave')).toBeNull();
  });

  it('keyboard presses ripple from the centre; disabled does nothing; reduced motion only fades', () => {
    const el = mount('<usa-ripple><button>Go</button></usa-ripple>');
    rect(el, {});
    el.querySelector('button')!.dispatchEvent(key('keydown', 'Enter'));
    expect(el.querySelector<HTMLElement>('.usa-ripple-wave')!.style.left).toBe(`${50 - Math.hypot(50, 20)}px`);
    el.setAttribute('disabled', '');
    el.dispatchEvent(pointer('pointerdown'));
    expect(el.querySelectorAll('.usa-ripple-wave')).toHaveLength(1);
    installComponentMocks({ reducedMotion: true });
    const r = mount('<usa-ripple>x</usa-ripple>');
    rect(r, {});
    r.dispatchEvent(pointer('pointerdown'));
    expect(anims[0].keyframes.every((k) => !('transform' in k))).toBe(true);
  });
});

describe('<usa-toggle>', () => {
  it('is an accessible switch toggled by click, Space and Enter', () => {
    const el = mount<any>('<usa-toggle label="Wi-Fi"></usa-toggle>');
    expect(el.getAttribute('role')).toBe('switch');
    expect(el.getAttribute('aria-checked')).toBe('false');
    expect(el.getAttribute('aria-label')).toBe('Wi-Fi');
    expect(el.tabIndex).toBe(0);
    const change = vi.fn();
    el.addEventListener('change', change);
    el.click();
    expect(el.checked).toBe(true);
    expect(el.getAttribute('aria-checked')).toBe('true');
    el.dispatchEvent(key('keydown', ' '));
    expect(el.checked).toBe(false);
    el.dispatchEvent(key('keydown', 'Enter'));
    expect(el.checked).toBe(true);
    expect(change).toHaveBeenCalledTimes(3);
  });

  it('disabled ignores input; the checked attribute syncs aria', () => {
    const el = mount<any>('<usa-toggle disabled></usa-toggle>');
    el.click();
    expect(el.checked).toBe(false);
    expect(el.tabIndex).toBe(-1);
    el.disabled = false;
    el.setAttribute('checked', '');
    expect(el.getAttribute('aria-checked')).toBe('true');
    el.toggle(false);
    expect(el.hasAttribute('checked')).toBe(false);
  });
});

describe('<usa-press>, <usa-magnetic>, <usa-tilt>, <usa-spotlight>', () => {
  it('press scales down on pointerdown and springs back on release', () => {
    const el = mount<any>('<usa-press scale="0.9"><button>x</button></usa-press>');
    el.dispatchEvent(pointer('pointerdown'));
    expect(el.pressed).toBe(true);
    expect(anims.at(-1)!.keyframes.at(-1)).toEqual({ transform: 'scale(0.9)' });
    el.dispatchEvent(pointer('pointerup'));
    expect(el.pressed).toBe(false);
    expect(anims.at(-1)!.keyframes.at(-1)).toEqual({ transform: 'scale(1)' });
  });

  it('magnetic follows the pointer near it and is off under reduced motion', async () => {
    const el = mount('<usa-magnetic strength="0.5"><button>x</button></usa-magnetic>');
    rect(el, { left: 0, top: 0, width: 100, height: 40 });
    document.dispatchEvent(pointer('pointermove', { clientX: 70, clientY: 20 }));
    await new Promise((r) => setTimeout(r, 40));
    expect(el.style.getPropertyValue('--usa-mx')).toBe('10.00px');
    expect(el.hasAttribute('data-active')).toBe(true);
    document.dispatchEvent(pointer('pointermove', { clientX: 900, clientY: 900 }));
    await new Promise((r) => setTimeout(r, 40));
    expect(el.hasAttribute('data-active')).toBe(false);
    installComponentMocks({ reducedMotion: true });
    const r = mount('<usa-magnetic><button>x</button></usa-magnetic>');
    rect(r, {});
    document.dispatchEvent(pointer('pointermove', { clientX: 50, clientY: 20 }));
    await new Promise((res) => setTimeout(res, 40));
    expect(r.style.getPropertyValue('--usa-mx')).toBe('');
  });

  it('tilt rotates toward the pointer and resets on leave; glare is added', async () => {
    const el = mount('<usa-tilt max="10" glare>card</usa-tilt>');
    rect(el, { width: 200, height: 100 });
    expect(el.querySelector('.usa-tilt-glare')).toBeTruthy();
    el.dispatchEvent(pointer('pointerenter'));
    el.dispatchEvent(pointer('pointermove', { clientX: 200, clientY: 50 }));
    await new Promise((r) => setTimeout(r, 40));
    expect(el.style.transform).toContain('rotateY(10.00deg)');
    expect(el.style.getPropertyValue('--usa-tilt-x')).toBe('1.000');
    el.dispatchEvent(pointer('pointerleave'));
    expect(el.style.transform).toBe('');
  });

  it('spotlight positions the light on every item relative to it', async () => {
    const el = mount('<usa-spotlight size="120"><button>a</button><button>b</button></usa-spotlight>');
    const [a, b] = Array.from(el.children);
    rect(a, { left: 0, top: 0 });
    rect(b, { left: 110, top: 0 });
    el.dispatchEvent(pointer('pointerenter'));
    el.dispatchEvent(pointer('pointermove', { clientX: 130, clientY: 12 }));
    await new Promise((r) => setTimeout(r, 40));
    expect(a.classList.contains('usa-spotlight-item')).toBe(true);
    expect((a as HTMLElement).style.getPropertyValue('--usa-spot-x')).toBe('130.0px');
    expect((b as HTMLElement).style.getPropertyValue('--usa-spot-x')).toBe('20.0px');
    expect(el.style.getPropertyValue('--usa-spot-size')).toBe('120px');
    expect(el.hasAttribute('data-lit')).toBe(true);
  });
});

describe('<usa-spinner>', () => {
  it('renders every variant as an indeterminate progressbar', () => {
    for (const v of SPINNER_VARIANTS) {
      const el = mount<any>(`<usa-spinner kind="${v}" size="20"></usa-spinner>`);
      expect(el.getAttribute('role')).toBe('progressbar');
      expect(el.getAttribute('aria-label')).toBe('Loading');
      expect(el.hasAttribute('aria-valuenow')).toBe(false);
      expect(el.getAttribute('data-kind')).toBe(v);
      expect(el.children.length).toBeGreaterThan(0);
      expect(el.style.getPropertyValue('--usa-spinner-size')).toBe('20px');
    }
    const w = mount('<usa-spinner kind="windows"></usa-spinner>');
    expect(w.querySelectorAll('i')).toHaveLength(5);
    expect(mount('<usa-spinner kind="nope"></usa-spinner>').querySelector('svg')).toBeTruthy();
  });
});

describe('<usa-skeleton>', () => {
  it('shows placeholders while loading and fades content in afterwards', () => {
    const el = mount<any>('<usa-skeleton loading lines="4" avatar><p>Real</p></usa-skeleton>');
    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelectorAll('.usa-bone-lines .usa-bone')).toHaveLength(4);
    expect(el.querySelector('.usa-bone-avatar')).toBeTruthy();
    const loaded = vi.fn();
    el.addEventListener('usa:loaded', loaded);
    el.loading = false;
    expect(el.querySelector('.usa-skeleton-ph')).toBeNull();
    expect(el.getAttribute('aria-busy')).toBe('false');
    expect(anims.find((a) => a.el.tagName === 'P')).toBeTruthy();
    expect(loaded).toHaveBeenCalled();
  });
});

describe('<usa-progress>', () => {
  it('reflects value/max to aria and scaleX, and is indeterminate without a value', () => {
    const el = mount<any>('<usa-progress value="30" max="60" label="Upload"></usa-progress>');
    const bar = el.querySelector('.usa-progress-bar') as HTMLElement;
    expect(el.getAttribute('aria-valuenow')).toBe('30');
    expect(el.getAttribute('aria-valuemax')).toBe('60');
    expect(el.getAttribute('aria-label')).toBe('Upload');
    expect(bar.style.transform).toBe('scaleX(0.5)');
    expect(el.ratio).toBe(0.5);
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    el.value = 60;
    expect(done).toHaveBeenCalledOnce();
    el.value = null;
    expect(el.hasAttribute('data-indeterminate')).toBe(true);
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.ratio).toBeNull();
  });
});

describe('toast() / <usa-toaster>', () => {
  it('creates a toaster region and a status toast that closes itself', async () => {
    vi.useFakeTimers();
    const h = toast('Saved', { type: 'success', duration: 1000 })!;
    const host = document.querySelector('usa-toaster')!;
    expect(host.getAttribute('role')).toBe('region');
    expect(h.element.getAttribute('role')).toBe('status');
    expect(h.element.textContent).toContain('Saved');
    expect(h.element.getAttribute('data-type')).toBe('success');
    vi.advanceTimersByTime(1000);
    expect(h.element.hasAttribute('data-leaving')).toBe(true);
    anims.filter((a) => a.el === h.element).forEach((a) => a.finish());
    expect(h.element.isConnected).toBe(false);
  });

  it('errors are alerts; action and close buttons work; max trims the stack', () => {
    const onClick = vi.fn();
    const h = toast('Failed', { type: 'error', duration: 0, action: { label: 'Retry', onClick } })!;
    expect(h.element.getAttribute('role')).toBe('alert');
    (h.element.querySelector('.usa-toast-action') as HTMLButtonElement).click();
    expect(onClick).toHaveBeenCalled();
    expect(h.element.hasAttribute('data-leaving')).toBe(true);
    const host = document.querySelector<any>('usa-toaster');
    host.setAttribute('max', '2');
    const t = [1, 2, 3].map((i) => toast(`t${i}`, { duration: 0 })!);
    expect(t[0].element.hasAttribute('data-leaving')).toBe(true);
    expect(t[2].element.hasAttribute('data-leaving')).toBe(false);
    (t[2].element.querySelector('.usa-toast-close') as HTMLButtonElement).click();
    expect(t[2].element.hasAttribute('data-leaving')).toBe(true);
  });
});

describe('<usa-check>', () => {
  it('draws the circle then the mark when visible', async () => {
    const el = mount<any>('<usa-check kind="error" label="Failed"></usa-check>');
    expect(el.getAttribute('data-state')).toBe('idle');
    expect(el.getAttribute('role')).toBe('img');
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    intersect(el, true);
    expect(el.getAttribute('data-state')).toBe('done');
    expect(anims).toHaveLength(3);
    expect(anims[1].timing.delay).toBe(420);
    await finishAll();
    expect(done).toHaveBeenCalledOnce();
    expect(el.querySelector('path')!.getAttribute('d')).toContain('M18 18');
  });

  it('is drawn instantly under reduced motion', async () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount('<usa-check></usa-check>');
    await tick();
    expect(el.getAttribute('data-state')).toBe('done');
    expect(anims).toHaveLength(0);
  });
});
