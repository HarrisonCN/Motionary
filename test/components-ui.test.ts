import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, mount, tick } from './components-setup';
import { defineUiComponents, VARIANTS, setVariant } from '../src/components/ui';
import { configureComponents } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineUiComponents();
});
afterEach(() => vi.useRealTimers());

const pointer = (type: string, init: Record<string, unknown> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: 0, clientY: 0, ...init } as MouseEventInit);
  Object.defineProperty(e, 'pointerType', { value: 'touch' });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  Object.defineProperty(e, 'timeStamp', { value: (init.timeStamp as number) ?? 0 });
  return e;
};
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
const rect = (el: Element, r: Partial<DOMRect> = {}) => (el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 40, right: 200, bottom: 40, ...r }) as DOMRect);

describe('style variants', () => {
  it('six variants; setVariant() marks the root and injects the token sheet', () => {
    expect(VARIANTS).toEqual(['minimal', 'neon', 'glass', 'brutalist', 'fluent', 'material']);
    setVariant('neon');
    expect(document.documentElement.getAttribute('data-usa-variant')).toBe('neon');
    const sheets = (document as any).adoptedStyleSheets as CSSStyleSheet[] | undefined;
    const css = sheets ? sheets.map((s) => Array.from(s.cssRules).map((r) => r.cssText).join('')).join('') : document.head.innerHTML;
    expect(css).toContain('--usa-accent');
    setVariant(null);
    expect(document.documentElement.hasAttribute('data-usa-variant')).toBe(false);
  });
});

describe('<usa-tabs>', () => {
  it('wires roles, roving tabindex, keyboard and the indicator', () => {
    const el = mount<any>('<usa-tabs><nav><button data-tab>A</button><button data-tab>B</button><button data-tab>C</button></nav><section data-panel>1</section><section data-panel>2</section><section data-panel>3</section></usa-tabs>');
    const tabs = el.querySelectorAll('[data-tab]');
    expect(el.querySelector('nav').getAttribute('role')).toBe('tablist');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].tabIndex).toBe(-1);
    expect(el.querySelectorAll('[data-panel]')[1].hidden).toBe(true);
    expect(tabs[0].getAttribute('aria-controls')).toBe(el.querySelectorAll('[data-panel]')[0].id);
    expect(el.querySelector('.usa-tabs-indicator')).toBeTruthy();
    const change = vi.fn();
    el.addEventListener('usa:change', change);
    key(tabs[0], 'ArrowLeft');
    expect(el.selected).toBe(2);
    expect(document.activeElement).toBe(tabs[2]);
    tabs[1].click();
    expect(el.selected).toBe(1);
    expect(el.querySelectorAll('[data-panel]')[1].hidden).toBe(false);
    expect(change).toHaveBeenCalledTimes(2);
  });
});

describe('<usa-drawer> / <usa-bottom-sheet>', () => {
  it('drawer opens with a backdrop, closes on Esc and restores focus', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const btn = mount<HTMLButtonElement>('<button>open</button>');
    btn.focus();
    const d = mount<any>('<usa-drawer label="Nav"><a href="#">x</a><button data-close>c</button></usa-drawer>');
    expect(d.hidden).toBe(true);
    expect(d.getAttribute('role')).toBe('dialog');
    d.open = true;
    await tick();
    expect(d.hidden).toBe(false);
    expect(document.querySelector('.usa-panel-backdrop')).toBeTruthy();
    expect(d.getAttribute('aria-modal')).toBe('true');
    key(document.body, 'Escape');
    await tick();
    expect(d.open).toBe(false);
    expect(d.hidden).toBe(true);
    expect(document.querySelector('.usa-panel-backdrop')).toBeNull();
    expect(document.activeElement).toBe(btn);
    d.open = true;
    await tick();
    d.querySelector('[data-close]').click();
    await tick();
    expect(d.hidden).toBe(true);
  });

  it('bottom sheet snaps between points and closes when dragged down', async () => {
    vi.useFakeTimers();
    (window as any).innerHeight = 1000;
    const s = mount<any>('<usa-bottom-sheet snap="0.4,0.8" start="0"><p>x</p></usa-bottom-sheet>');
    expect(s.querySelector('.usa-sheet-handle')).toBeTruthy();
    s.open = true;
    await vi.advanceTimersByTimeAsync(3000);
    // fully open = 800px tall; snap at 0.4 => offset 400
    expect(s.style.transform).toBe('translateY(400.0px)');
    const h = s.querySelector('.usa-sheet-handle');
    h.dispatchEvent(pointer('pointerdown', { clientY: 600, timeStamp: 0 }));
    s.dispatchEvent(pointer('pointermove', { clientY: 300, timeStamp: 400 }));
    s.dispatchEvent(pointer('pointerup', { clientY: 300, timeStamp: 800 }));
    await vi.advanceTimersByTimeAsync(3000);
    expect(s.style.transform).toBe('translateY(0.0px)');
    h.dispatchEvent(pointer('pointerdown', { clientY: 200, timeStamp: 1000 }));
    s.dispatchEvent(pointer('pointermove', { clientY: 1000, timeStamp: 1400 }));
    s.dispatchEvent(pointer('pointerup', { clientY: 1000, timeStamp: 1800 }));
    await vi.advanceTimersByTimeAsync(3000);
    expect(s.open).toBe(false);
    expect(s.hidden).toBe(true);
  });
});

describe('<usa-pull-refresh>', () => {
  it('fires usa:refresh past the threshold and finishes on done()', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-pull-refresh threshold="40"><ul><li>a</li></ul></usa-pull-refresh>');
    let done: any;
    el.addEventListener('usa:refresh', (e: any) => (done = e.detail.done));
    el.dispatchEvent(pointer('pointerdown', { clientY: 0 }));
    el.dispatchEvent(pointer('pointermove', { clientY: 200 }));
    expect(el.hasAttribute('data-armed')).toBe(true);
    el.dispatchEvent(pointer('pointerup', { clientY: 200 }));
    expect(el.refreshing).toBe(true);
    expect(el.getAttribute('aria-busy')).toBe('true');
    done();
    expect(el.refreshing).toBe(false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(el.style.getPropertyValue('--usa-pull')).toBe('0.0px');
  });
});

describe('<usa-fab>, <usa-navbar>', () => {
  it('fab fans actions out and hides them from AT when closed', () => {
    const el = mount<any>('<usa-fab direction="up" gap="50"><button>+</button><button>a</button><button>b</button></usa-fab>');
    const [main, a, b] = Array.from(el.children) as HTMLElement[];
    expect(main.getAttribute('aria-expanded')).toBe('false');
    expect(a.hasAttribute('inert')).toBe(true);
    main.click();
    expect(el.open).toBe(true);
    expect(a.style.transform).toBe('translate(0.0px, -50.0px) scale(1)');
    expect(b.style.transform).toBe('translate(0.0px, -100.0px) scale(1)');
    expect(anims.find((x) => x.el === b)!.timing.delay).toBe(35);
    key(document.body, 'Escape');
    expect(el.open).toBe(false);
  });

  it('navbar hides on scroll down and shows on scroll up', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-navbar threshold="10"><b>bar</b></usa-navbar>');
    const scrollTo = async (y: number) => {
      (window as any).scrollY = y;
      window.dispatchEvent(new Event('scroll'));
      await vi.advanceTimersByTimeAsync(20);
    };
    await scrollTo(100);
    expect(el.hiddenByScroll).toBe(true);
    expect(el.hasAttribute('data-scrolled')).toBe(true);
    await scrollTo(80);
    expect(el.hiddenByScroll).toBe(false);
    (window as any).scrollY = 0;
  });
});

describe('<usa-slider>', () => {
  it('slider: role, keyboard, pointer, events', () => {
    const el = mount<any>('<usa-slider min="0" max="10" step="2" value="4" label="Vol"></usa-slider>');
    expect(el.getAttribute('role')).toBe('slider');
    expect(el.getAttribute('aria-valuenow')).toBe('4');
    const input = vi.fn();
    const change = vi.fn();
    el.addEventListener('usa:input', input);
    el.addEventListener('usa:change', change);
    key(el, 'ArrowRight');
    expect(el.value).toBe(6);
    key(el, 'End');
    expect(el.value).toBe(10);
    rect(el, { width: 100 });
    el.dispatchEvent(pointer('pointerdown', { clientX: 31 }));
    expect(el.value).toBe(4);
    el.dispatchEvent(pointer('pointerup', { clientX: 31 }));
    expect(input).toHaveBeenCalledTimes(3);
    expect(change).toHaveBeenCalledTimes(3);
  });

});

describe('<usa-popover>, <usa-badge>, <usa-avatar-stack>', () => {
  it('popover toggles with aria-expanded and closes on outside click', () => {
    const el = mount<any>('<usa-popover><button>Share</button><div data-popover>menu</div></usa-popover>');
    const [btn, panel] = [el.querySelector('button'), el.querySelector('[data-popover]')];
    expect(btn.getAttribute('aria-controls')).toBe(panel.id);
    btn.click();
    expect(el.open).toBe(true);
    expect(panel.hidden).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    document.body.dispatchEvent(pointer('pointerdown'));
    expect(el.open).toBe(false);
  });

  it('badge caps at max, hides at zero and bumps on change', () => {
    const el = mount<any>('<usa-badge value="0"><button>x</button></usa-badge>');
    const c = el.querySelector('.usa-badge-count');
    expect(c.hidden).toBe(true);
    el.value = '150';
    expect(c.textContent).toBe('99+');
    expect(c.hidden).toBe(false);
    expect(anims.some((a) => a.el === c)).toBe(true);
  });

  it('avatar stack collapses extras into +N', () => {
    const el = mount<any>('<usa-avatar-stack max="2"><img alt="a"><img alt="b"><img alt="c"><img alt="d"></usa-avatar-stack>');
    expect(el.querySelector('.usa-avatar-more').textContent).toBe('+2');
    expect((el.children[2] as HTMLElement).hidden).toBe(true);
    expect(el.getAttribute('role')).toBe('group');
  });
});
