import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, intersect, mount, tick } from './components-setup';
import { defineTextComponents } from '../src/components/text';
import { defineBackgroundComponents, fluentPreset } from '../src/components/background';
import { configureComponents } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineTextComponents();
  defineBackgroundComponents();
});
afterEach(() => vi.useRealTimers());

describe('v2.8 text effects', () => {
  it('wave text splits letters, keeps a screen-reader copy', () => {
    const el = mount<any>('<usa-wave-text amplitude="0.5">Hi you</usa-wave-text>');
    expect(el.querySelector('.usa-sr').textContent).toBe('Hi you');
    expect(el.querySelectorAll('.usa-char')).toHaveLength(5);
    expect(el.querySelector('[aria-hidden]')).toBeTruthy();
    expect(el.style.getPropertyValue('--usa-wave-a')).toBe('0.5em');
  });

  it('glitch mirrors its text for the RGB layers; gradient text builds a looping gradient', () => {
    const g = mount<any>('<usa-glitch intensity="5">ERR</usa-glitch>');
    expect(g.getAttribute('data-text')).toBe('ERR');
    expect(g.style.getPropertyValue('--usa-glitch-i')).toBe('5px');
    const t = mount<any>('<usa-gradient-text colors="red,blue">x</usa-gradient-text>');
    expect(t.style.getPropertyValue('--usa-grad')).toBe('linear-gradient(90deg, red, blue, red)');
  });

  it('handwriting draws when in view, completes; reduced motion shows it filled', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-handwriting text="Hello" duration="1000"></usa-handwriting>');
    expect(el.querySelector('text').textContent).toBe('Hello');
    expect(el.querySelector('.usa-sr').textContent).toBe('Hello');
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    intersect(el);
    expect(el.getAttribute('data-state')).toBe('drawing');
    await vi.advanceTimersByTimeAsync(1000);
    expect(el.getAttribute('data-state')).toBe('done');
    expect(done).toHaveBeenCalled();
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-handwriting text="x"></usa-handwriting>');
    expect(r.getAttribute('data-state')).toBe('done');
  });

  it('scroll highlight lights words by scroll progress; marker mode lights on enter', async () => {
    vi.useFakeTimers();
    (window as any).innerHeight = 1000;
    const el = mount<any>('<usa-scroll-highlight>one two three four</usa-scroll-highlight>');
    expect(el.querySelectorAll('.usa-hl-word')).toHaveLength(4);
    el.getBoundingClientRect = () => ({ top: 500, height: 100 }) as DOMRect;
    intersect(el);
    await vi.advanceTimersByTimeAsync(20);
    expect(el.progress).toBeGreaterThan(0);
    const lit = el.querySelectorAll('[data-on]').length;
    el.getBoundingClientRect = () => ({ top: -500, height: 100 }) as DOMRect;
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(20);
    expect(el.querySelectorAll('[data-on]').length).toBe(4);
    expect(lit).toBeLessThan(4);
    const m = mount<any>('<usa-scroll-highlight mode="marker">Important</usa-scroll-highlight>');
    intersect(m);
    expect(m.hasAttribute('data-lit')).toBe(true);
  });
});

describe('v2.8 backgrounds', () => {
  it('grid glow tracks the pointer (not under reduced motion)', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-grid-glow size="20"></usa-grid-glow>');
    expect(el.style.getPropertyValue('--usa-grid')).toBe('20px');
    el.getBoundingClientRect = () => ({ left: 10, top: 10, width: 100, height: 100 }) as DOMRect;
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 60, clientY: 30 }));
    await vi.advanceTimersByTimeAsync(20);
    expect(el.style.getPropertyValue('--usa-grid-x')).toBe('50px');
  });

  it('blobs render one decorative blob per colour', () => {
    const el = mount<any>('<usa-blobs colors="red,green,blue"></usa-blobs>');
    const layer = el.querySelector('.usa-blobs-layer');
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.children).toHaveLength(3);
  });

  it('canvas backgrounds degrade without a 2D context and skip work under reduced motion', () => {
    const w = mount<any>('<usa-water-ripple><p>x</p></usa-water-ripple>');
    expect(w.querySelector('canvas')).toBeTruthy();
    expect(() => w.drop(10, 10)).not.toThrow();
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-water-ripple></usa-water-ripple>');
    expect(r.querySelector('canvas')).toBeNull();
    const d = mount<any>('<usa-dot-network></usa-dot-network>');
    expect(d.querySelector('canvas').getAttribute('aria-hidden')).toBe('true');
  });
});

describe('fluentPreset()', () => {
  it('applies the fluent variant, Mica class and Reveal tracking, and removes them', async () => {
    vi.useFakeTimers();
    const off = fluentPreset();
    const root = document.documentElement;
    expect(root.getAttribute('data-usa-variant')).toBe('fluent');
    expect(root.classList.contains('usa-fluent')).toBe(true);
    expect(root.classList.contains('usa-fluent-mica')).toBe(true);
    const b = mount<HTMLButtonElement>('<button>Go</button>');
    b.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 30 }) as DOMRect;
    b.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 40, clientY: 10 }));
    await vi.advanceTimersByTimeAsync(20);
    expect(b.hasAttribute('data-reveal')).toBe(true);
    expect(b.style.getPropertyValue('--usa-reveal-x')).toBe('40px');
    off();
    expect(root.hasAttribute('data-usa-variant')).toBe(false);
    expect(b.hasAttribute('data-reveal')).toBe(false);
  });

  it('no Reveal tracking under reduced motion', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const off = fluentPreset({ mica: false });
    expect(document.documentElement.classList.contains('usa-fluent-mica')).toBe(false);
    const b = mount<HTMLButtonElement>('<button>Go</button>');
    b.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
    await tick();
    expect(b.hasAttribute('data-reveal')).toBe(false);
    off();
  });
});
