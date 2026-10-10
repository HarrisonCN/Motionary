import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineStory, defineEffectElements, STORY_TEMPLATES, storyProgress, formatCount } from '../src/components/effects';

const rect = (el: Element, top: number, height: number, left = 0, width = 400) =>
  ((el as any).getBoundingClientRect = () => ({ top, bottom: top + height, height, left, right: left + width, width, x: left, y: top }));

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineEffectElements();
  (window as any).innerHeight = 800;
});
afterEach(() => configureComponents({ reducedMotion: 'user' }));

describe('5.4 <usa-story> scroll-storytelling templates', () => {
  it('defines <usa-story> (idempotent) with six templates', () => {
    expect(defineStory()).toBe(customElements.get('usa-story'));
    expect(STORY_TEMPLATES).toEqual(['pin', 'gallery', 'zoom', 'compare', 'counter', 'highlight']);
  });

  it('storyProgress maps the scroll position through tall and short elements', () => {
    const el = document.createElement('div');
    rect(el, 0, 2800);
    expect(storyProgress(el, 800)).toBe(0);
    rect(el, -1000, 2800);
    expect(storyProgress(el, 800)).toBe(0.5);
    rect(el, -3000, 2800);
    expect(storyProgress(el, 800)).toBe(1);
  });

  it('formatCount keeps separators, decimals, prefix and suffix', () => {
    expect(formatCount('12,480', 1)).toBe('12,480');
    expect(formatCount('12,480', 0.5)).toBe('6,240');
    expect(formatCount('99.9%', 1)).toBe('99.9%');
    expect(formatCount('$4.2M', 0)).toBe('$0.0M');
    expect(formatCount('n/a', 0.5)).toBe('n/a');
  });

  it('pin: marks the step crossing the viewport center active and fires usa:step', () => {
    const s = mount<any>('<usa-story template="pin"><div data-stage></div><section data-step>a</section><section data-step>b</section></usa-story>');
    const [a, b] = Array.from(s.querySelectorAll('[data-step]')) as HTMLElement[];
    rect(a, -500, 400);
    rect(b, 100, 600);
    const seen: number[] = [];
    s.addEventListener('usa:step', (e: CustomEvent) => seen.push(e.detail.index));
    s.update();
    expect(b.hasAttribute('data-active')).toBe(true);
    expect(a.hasAttribute('data-active')).toBe(false);
    expect(s.querySelector('[data-stage]').dataset.activeStep).toBe('1');
    expect(seen).toEqual([1]);
    expect(s.step).toBe(1);
  });

  it('gallery / zoom: transform with progress; static under reduced motion', () => {
    const g = mount<any>('<usa-story template="gallery"><div data-sticky><div data-track></div></div></usa-story>');
    const track = g.querySelector('[data-track]');
    Object.defineProperty(track, 'scrollWidth', { value: 2000 });
    Object.defineProperty(g.querySelector('[data-sticky]'), 'clientWidth', { value: 1000 });
    rect(g, -1000, 2800);
    g.update();
    expect(track.style.transform).toBe('translateX(-500.0px)');
    expect(g.style.getPropertyValue('--usa-story-progress')).toBe('0.5000');
    const z = mount<any>('<usa-story template="zoom" zoom="5"><div data-stage><b>Z</b></div></usa-story>');
    rect(z, -2000, 2800);
    z.update();
    expect(z.querySelector('b').style.transform).toBe('scale(5.000)');
    configureComponents({ reducedMotion: 'reduce' });
    const g2 = mount<any>('<usa-story template="gallery"><div data-sticky><div data-track></div></div></usa-story>');
    rect(g2, -1000, 2800);
    g2.update();
    expect(g2.hasAttribute('data-static')).toBe(true);
    expect(g2.querySelector('[data-track]').style.transform).toBe('');
  });

  it('compare: adds a keyboard slider handle; scroll and keys move the split', () => {
    const c = mount<any>('<usa-story template="compare" label="Then / now"><div data-sticky><i data-before></i><i data-after></i></div></usa-story>');
    const h = c.querySelector('[data-handle]') as HTMLElement;
    expect(h.getAttribute('role')).toBe('slider');
    expect(h.getAttribute('aria-label')).toBe('Then / now');
    expect(h.tabIndex).toBe(0);
    rect(c, -500, 1800);
    c.update();
    expect(c.style.getPropertyValue('--usa-split')).toBe('50.00%');
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(h.getAttribute('aria-valuenow')).toBe('100');
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true }));
    expect(h.getAttribute('aria-valuenow')).toBe('90');
    rect(c, 0, 1800);
    c.update(); // after manual input, scroll no longer drives the split
    expect(h.getAttribute('aria-valuenow')).toBe('90');
  });

  it('counter: counts visible numbers once; reduced motion shows the final value', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-story template="counter"><b data-count="1,200">0</b><b data-count="5">0</b></usa-story>');
    const [a, b] = Array.from(c.querySelectorAll('b')) as HTMLElement[];
    rect(a, 100, 40);
    rect(b, 2000, 40);
    c.update();
    expect(a.textContent).toBe('1,200');
    expect(a.getAttribute('aria-label')).toBe('1,200');
    expect(b.textContent).toBe('0');
  });

  it('highlight: falls back to paragraphs', () => {
    const s = mount<any>('<usa-story template="highlight"><p>a</p><p>b</p></usa-story>');
    const [a, b] = Array.from(s.querySelectorAll('p')) as HTMLElement[];
    rect(a, 380, 60);
    rect(b, 900, 60);
    s.update();
    expect(a.hasAttribute('data-active')).toBe(true);
    expect(b.hasAttribute('data-active')).toBe(false);
  });
});
