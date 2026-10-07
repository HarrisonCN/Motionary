import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, intersect, ioFor, mount, tick } from './components-setup';
import { defineRevealComponents, revealKeyframes, readScrollProgress, REVEAL_EFFECTS } from '../src/components/reveal';
import { defineTextComponents, scrambleFrame, easeOutExpo } from '../src/components/text';
import { configureComponents } from '../src/components/base';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineRevealComponents();
  defineTextComponents();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('<usa-reveal>', () => {
  it('hides until it enters, then plays the effect and fires events', async () => {
    const el = mount<any>('<usa-reveal effect="zoom-in" duration="500" delay="100">Hi</usa-reveal>');
    expect(el.getAttribute('data-state')).toBe('hidden');
    expect(ioFor(el)).toBeTruthy();
    const onEnter = vi.fn();
    const onComplete = vi.fn();
    el.addEventListener('usa:enter', onEnter);
    el.addEventListener('usa:complete', onComplete);
    intersect(el, true);
    expect(onEnter).toHaveBeenCalledOnce();
    expect(el.getAttribute('data-state')).toBe('shown');
    const a = anims.find((x) => x.el === el)!;
    expect(a.keyframes[0]).toMatchObject({ opacity: 0, transform: 'scale(0.86)' });
    expect(a.keyframes[1]).toMatchObject({ opacity: 1, transform: 'none' });
    expect(a.timing).toMatchObject({ duration: 500, delay: 100, fill: 'backwards' });
    a.finish();
    expect(onComplete).toHaveBeenCalledOnce();
    expect(el.revealed).toBe(true);
  });

  it('repeat hides it again on leave; disconnect stops observing', () => {
    const el = mount<any>('<usa-reveal repeat>x</usa-reveal>');
    intersect(el, true);
    intersect(el, false);
    expect(el.getAttribute('data-state')).toBe('hidden');
    el.remove();
    expect(ioFor(el)).toBeUndefined();
  });

  it('reduced motion shows content immediately and never observes', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount('<usa-reveal>x</usa-reveal>');
    expect(el.getAttribute('data-state')).toBe('shown');
    expect(ioFor(el)).toBeUndefined();
    expect(anims).toHaveLength(0);
  });

  it('configureComponents({ reducedMotion }) overrides the OS setting', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(mount('<usa-reveal>x</usa-reveal>').getAttribute('data-state')).toBe('shown');
    configureComponents({ reducedMotion: 'user' });
  });

  it('every effect has from/to keyframes on transform, opacity or filter only', () => {
    for (const e of REVEAL_EFFECTS) {
      const [from, to] = revealKeyframes(e, 20);
      expect(from.opacity, e).toBe(0);
      expect(Object.keys(to).sort()).toEqual(Object.keys(from).sort());
      Object.keys(from).forEach((k) => expect(['opacity', 'transform', 'filter', 'transformOrigin']).toContain(k));
    }
  });
});

describe('<usa-stagger>', () => {
  it('animates children with increasing delays', () => {
    const el = mount('<usa-stagger interval="50" delay="10"><i></i><i></i><i></i></usa-stagger>');
    expect(el.getAttribute('data-state')).toBe('hidden');
    intersect(el, true);
    const delays = anims.map((a) => a.timing.delay);
    expect(delays).toEqual([10, 60, 110]);
    expect(el.getAttribute('data-state')).toBe('shown');
  });
});

describe('<usa-scroll-progress>', () => {
  it('maps the page scroll to scaleX and aria-valuenow', async () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
    (window as any).scrollY = 250;
    const el = mount<any>('<usa-scroll-progress></usa-scroll-progress>');
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('25');
    expect((el.firstElementChild as HTMLElement).style.transform).toBe('scaleX(0.25)');
    expect(el.progress).toBeCloseTo(0.25);
    (window as any).scrollY = 1000;
    window.dispatchEvent(new Event('scroll'));
    await new Promise((r) => setTimeout(r, 40));
    expect(el.getAttribute('aria-valuenow')).toBe('100');
    (window as any).scrollY = 0;
  });

  it('readScrollProgress tracks a target element', () => {
    const t = document.createElement('div');
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    t.getBoundingClientRect = () => ({ top: -250, height: 1000 }) as DOMRect;
    expect(readScrollProgress(t)).toBeCloseTo(0.5);
  });
});

describe('<usa-scrolly>', () => {
  it('activates the step crossing the trigger line', () => {
    const el = mount<any>('<usa-scrolly><div data-sticky></div><p data-step="a">1</p><p data-step="b">2</p></usa-scrolly>');
    const steps = el.steps;
    expect(el.active).toBe(0);
    expect(steps[0].hasAttribute('data-active')).toBe(true);
    const onStep = vi.fn();
    el.addEventListener('usa:step', (e: CustomEvent) => onStep(e.detail.name));
    intersect(steps[1], true);
    expect(el.active).toBe(1);
    expect(el.getAttribute('data-step-name')).toBe('b');
    expect(steps[0].hasAttribute('data-active')).toBe(false);
    expect(onStep).toHaveBeenCalledWith('b');
  });
});

describe('<usa-typewriter>', () => {
  it('types the text, keeps the full text for screen readers, and completes', () => {
    vi.useFakeTimers();
    const el = mount('<usa-typewriter speed="10" start="load">Hello</usa-typewriter>');
    const out = el.querySelector('.usa-tw-text')!;
    expect(el.querySelector('.usa-sr')!.textContent).toBe('Hello');
    expect(out.getAttribute('aria-hidden')).toBe('true');
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    vi.advanceTimersByTime(1);
    expect(out.textContent).toBe('H');
    vi.advanceTimersByTime(200);
    expect(out.textContent).toBe('Hello');
    expect(done).toHaveBeenCalledOnce();
  });

  it('cycles through words (type, pause, delete)', () => {
    vi.useFakeTimers();
    const el = mount('<usa-typewriter words="ab|cd" speed="10" delete-speed="5" pause="100" start="load"></usa-typewriter>');
    const out = el.querySelector('.usa-tw-text')!;
    vi.advanceTimersByTime(60);
    expect(out.textContent).toBe('ab');
    const seen = new Set<string>();
    for (let t = 0; t < 400; t += 5) {
      vi.advanceTimersByTime(5);
      seen.add(out.textContent || '');
    }
    expect([...seen]).toEqual(expect.arrayContaining(['a', '', 'c', 'cd']));
  });

  it('waits for the viewport by default and shows everything under reduced motion', () => {
    const el = mount('<usa-typewriter>Hi there</usa-typewriter>');
    expect(ioFor(el)).toBeTruthy();
    installComponentMocks({ reducedMotion: true });
    const el2 = mount('<usa-typewriter>Hi there</usa-typewriter>');
    expect(el2.querySelector('.usa-tw-text')!.textContent).toBe('Hi there');
  });
});

describe('<usa-split-text>', () => {
  it('splits into words of characters with an index, and plays on enter', () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-split-text stagger="10" duration="100">Hi you</usa-split-text>');
    expect(el.units.map((u: HTMLElement) => u.textContent)).toEqual(['H', 'i', 'y', 'o', 'u']);
    expect(el.units[4].style.getPropertyValue('--i')).toBe('4');
    expect(el.querySelectorAll('.usa-split-word')).toHaveLength(2);
    expect(el.querySelector('.usa-sr').textContent).toBe('Hi you');
    expect(el.getAttribute('data-state')).toBe('hidden');
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    intersect(el, true);
    expect(el.getAttribute('data-state')).toBe('play');
    vi.advanceTimersByTime(100 + 4 * 10);
    expect(el.getAttribute('data-state')).toBe('shown');
    expect(done).toHaveBeenCalledOnce();
  });

  it('by="words" keeps words whole', () => {
    const el = mount<any>('<usa-split-text by="words" trigger="manual">one two three</usa-split-text>');
    expect(el.units.map((u: HTMLElement) => u.textContent)).toEqual(['one', 'two', 'three']);
  });
});

describe('<usa-scramble>', () => {
  it('scrambleFrame resolves left to right and keeps spaces/punctuation', () => {
    const f = scrambleFrame('AB CD!', 0.5, 'x', () => 0);
    expect(f).toBe('AB xx!');
    expect(scrambleFrame('AB CD!', 1)).toBe('AB CD!');
    expect(scrambleFrame('AB', 0, '#', () => 0)).toBe('##');
  });

  it('ends on the real text', async () => {
    const el = mount<any>('<usa-scramble duration="20" trigger="manual">Decode</usa-scramble>');
    await el.play();
    expect(el.querySelector('[aria-hidden]').textContent).toBe('Decode');
    expect(el.querySelector('.usa-sr').textContent).toBe('Decode');
  });
});

describe('<usa-counter>', () => {
  it('formats with locale, decimals, prefix and suffix', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-counter to="12345.6" decimals="1" locale="en-US" prefix="$" suffix=" USD"></usa-counter>');
    expect(el.textContent).toBe('$12,345.6 USD');
    el.setAttribute('grouping', 'false');
    expect(el.textContent).toBe('$12345.6 USD');
  });

  it('counts to the target and animates to a new value', async () => {
    const el = mount<any>('<usa-counter from="0" to="100" duration="30" locale="en-US"></usa-counter>');
    expect(el.textContent).toBe('0');
    intersect(el, true);
    await new Promise((r) => setTimeout(r, 120));
    expect(el.textContent).toBe('100');
    await el.play(250);
    expect(el.textContent).toBe('250');
    expect(el.value).toBe(250);
  });

  it('easeOutExpo ends at 1', () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
  });
});

describe('<usa-shimmer-text> and <usa-text-rotate>', () => {
  it('shimmer maps attributes to custom properties', () => {
    const el = mount('<usa-shimmer-text duration="1800" shine="gold">Pro</usa-shimmer-text>');
    expect(el.style.getPropertyValue('--usa-shimmer-duration')).toBe('1800ms');
    expect(el.style.getPropertyValue('--usa-shimmer-shine')).toBe('gold');
  });

  it('text-rotate stacks words and advances with an event', async () => {
    vi.useFakeTimers();
    const el = mount<any>('<usa-text-rotate words="fast|small|typed" interval="500"></usa-text-rotate>');
    const words = el.querySelectorAll('.usa-rotate-word');
    expect(words).toHaveLength(3);
    expect(words[1].hasAttribute('data-hidden')).toBe(true);
    const change = vi.fn();
    el.addEventListener('usa:change', (e: CustomEvent) => change(e.detail.word));
    vi.advanceTimersByTime(500);
    expect(change).toHaveBeenCalledWith('small');
    expect(words[0].hasAttribute('data-hidden')).toBe(true);
    expect(words[1].hasAttribute('data-hidden')).toBe(false);
    el.remove();
    vi.advanceTimersByTime(2000);
    expect(change).toHaveBeenCalledTimes(1);
  });
});

describe('styles', () => {
  it('each defined component injects its stylesheet once', async () => {
    await tick();
    const ids = Array.from(document.querySelectorAll('style[data-usa]')).map((s) => s.getAttribute('data-usa'));
    expect(ids).toEqual(expect.arrayContaining(['base', 'reveal', 'scroll-progress', 'typewriter', 'split-text']));
    expect(new Set(ids).size).toBe(ids.length);
    expect(document.querySelector('style[data-usa="typewriter"]')!.textContent).toContain('usa-typewriter');
  });
});
