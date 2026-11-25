import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { fraction, valueAt, overdrag, stretch, edgeSprings, holdDelays } from '../src/components/widgets/micro-kit-16';
import {
  MICRO_SPRINGS, MICRO_FEELS, springFromFeel, springFeel, microSpring, springSolution, settleTime, microEasing, createSpringGroup,
} from '../src/components/physics';
import { micro, applyMicro, feedback, microOf, parseMicro, microTransform, readFeel, readSpeed, MICRO_BEHAVIORS, MICRO_FEEDBACK } from '../src/components/interaction';
import { configureComponents } from '../src/components/base';
import { components as cat } from '../showcase/catalog/micro.js';
import { installComponentMocks } from './components-setup';

const TAGS = ['micro', 'micro-switch', 'micro-checkbox', 'micro-input', 'micro-button', 'micro-slider', 'micro-segmented', 'micro-stepper'];

const mount = <T extends HTMLElement>(html: string): T => {
  const box = document.createElement('div');
  box.innerHTML = html;
  document.body.append(box);
  return box.firstElementChild as T;
};
const events = (el: Element, type: string) => {
  const got: any[] = [];
  el.addEventListener(`usa:${type}`, (e) => got.push((e as CustomEvent).detail));
  return got;
};
const pointer = (type: string, init: Record<string, unknown> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, button: 0, clientX: 0, clientY: 0, ...init } as MouseEventInit);
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  return e;
};
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

/** Fake every clock the frame scheduler reads, so spring motion advances with the test clock. */
const fakeClocks = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'],
  });

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('17.16 spring solver', () => {
  it('springFromFeel and springFeel convert both ways', () => {
    for (const [duration, bounce] of [[400, 0], [300, 0.3], [650, 0.55], [500, -0.4]]) {
      const back = springFeel(springFromFeel({ duration, bounce }));
      expect(back.duration).toBeCloseTo(duration, 6);
      expect(back.bounce).toBeCloseTo(bounce, 6);
    }
    const p = springFromFeel({ duration: 1000, bounce: 0 });
    expect(p.mass).toBe(1);
    expect(p.stiffness).toBeCloseTo((2 * Math.PI) ** 2, 6);
    expect(springFeel(p).dampingRatio).toBeCloseTo(1, 6);
  });

  it('keeps bad input finite', () => {
    const p = springFromFeel({ duration: NaN, bounce: 9 });
    expect(Number.isFinite(p.stiffness) && Number.isFinite(p.damping)).toBe(true);
    expect(springFeel(p).bounce).toBeLessThan(1);
  });

  it('springSolution starts at from, ends at to and matches the given velocity', () => {
    for (const bounce of [0.4, 0, -0.5]) {
      const f = springSolution(springFromFeel({ duration: 400, bounce }), 0, 100, 250);
      expect(f(0)[0]).toBeCloseTo(0, 6);
      expect(f(0)[1]).toBeCloseTo(250, 6);
      expect(f(6000)[0]).toBeCloseTo(100, 3);
      expect(Math.abs(f(6000)[1])).toBeLessThan(1e-3);
    }
  });

  it('a bouncy spring overshoots, a critically damped one does not', () => {
    const peak = (bounce: number) => {
      const f = springSolution(springFromFeel({ duration: 400, bounce }), 0, 1);
      let max = 0;
      for (let t = 0; t < 3000; t += 4) max = Math.max(max, f(t)[0]);
      return max;
    };
    expect(peak(0.5)).toBeGreaterThan(1.1);
    expect(peak(0)).toBeLessThanOrEqual(1 + 1e-9);
    expect(peak(-0.5)).toBeLessThanOrEqual(1 + 1e-9);
  });

  it('velocity is the derivative of position', () => {
    const f = springSolution(springFromFeel({ duration: 380, bounce: 0.3 }), 10, -20, -50);
    for (const t of [30, 120, 260]) {
      const slope = (f(t + 0.01)[0] - f(t - 0.01)[0]) / 0.00002;
      expect(f(t)[1]).toBeCloseTo(slope, 1);
    }
  });

  it('settleTime grows with bounce and shrinks with speed', () => {
    expect(settleTime(microSpring('elastic'))).toBeGreaterThan(settleTime(microSpring('smooth')));
    expect(settleTime(microSpring('smooth', null, 2))).toBeLessThan(settleTime(microSpring('smooth')));
    expect(settleTime(microSpring('press'))).toBeLessThan(400);
  });

  it('microSpring reads names, v2.3 presets, shorthand and objects', () => {
    expect(Object.keys(MICRO_SPRINGS)).toHaveLength(16);
    expect(Object.keys(MICRO_FEELS)).toEqual(['crisp', 'snappy', 'smooth', 'bouncy', 'playful', 'calm', 'heavy']);
    expect(springFeel(microSpring('pop')).bounce).toBeCloseTo(MICRO_SPRINGS.pop.bounce, 6);
    expect(springFeel(microSpring('380ms 0.3')).duration).toBeCloseTo(380, 6);
    expect(springFeel(microSpring('0.5s')).duration).toBeCloseTo(500, 6);
    expect(springFeel(microSpring({ duration: 250, bounce: 0.2 })).bounce).toBeCloseTo(0.2, 6);
    expect(microSpring({ stiffness: 300, damping: 20, mass: 1 })).toEqual({ stiffness: 300, damping: 20, mass: 1 });
    expect(springFeel(microSpring('wobbly')).duration).toBeGreaterThan(0);
    expect(springFeel(microSpring('nonsense')).duration).toBeCloseTo(MICRO_SPRINGS.smooth.duration, 6);
  });

  it('a feel retunes every spring and speed scales duration', () => {
    const plain = springFeel(microSpring('toggle'));
    const crisp = springFeel(microSpring('toggle', 'crisp'));
    const playful = springFeel(microSpring('toggle', 'playful'));
    expect(crisp.duration).toBeLessThan(plain.duration);
    expect(playful.bounce).toBeGreaterThan(plain.bounce);
    expect(springFeel(microSpring('toggle', null, 2)).duration).toBeCloseTo(plain.duration / 2, 6);
  });

  it('microEasing gives a CSS easing and a duration', () => {
    const e = microEasing('bouncy');
    expect(e.duration).toBeGreaterThan(100);
    expect(typeof e.easing).toBe('string');
  });
});

describe('17.16 spring groups', () => {
  beforeEach(() => installComponentMocks());

  it('animates to its target and rests there', async () => {
    fakeClocks();
    const rest = vi.fn();
    const g = createSpringGroup({ x: 0 }, { spring: 'snappy', onRest: rest });
    g.set({ x: 100 });
    expect(g.animating).toBe(true);
    await vi.advanceTimersByTimeAsync(80);
    expect(g.get('x')).toBeGreaterThan(0);
    expect(g.get('x')).toBeLessThan(100);
    await vi.advanceTimersByTimeAsync(3000);
    expect(g.get('x')).toBe(100);
    expect(g.animating).toBe(false);
    expect(rest).toHaveBeenCalled();
  });

  it('retargeting keeps the velocity instead of starting from rest', async () => {
    fakeClocks();
    const g = createSpringGroup({ x: 0 }, { spring: 'smooth' });
    g.set({ x: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const v = g.velocity('x');
    expect(v).toBeGreaterThan(0);
    g.set({ x: -100 });
    expect(g.velocity('x')).toBeCloseTo(v, 6);
    g.stop();
  });

  it('impulse adds velocity and springs back to the target', async () => {
    fakeClocks();
    const g = createSpringGroup({ s: 0 });
    g.impulse({ s: 5 }, 'pop');
    expect(g.velocity('s')).toBe(5);
    await vi.advanceTimersByTimeAsync(60);
    expect(g.get('s')).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(4000);
    expect(g.get('s')).toBe(0);
  });

  it('jump moves at once and reports through onUpdate', () => {
    const seen: number[] = [];
    const g = createSpringGroup({ x: 0 }, { onUpdate: (v) => seen.push(v.x) });
    g.jump({ x: 42 });
    expect(g.get('x')).toBe(42);
    expect(g.animating).toBe(false);
    expect(seen).toContain(42);
  });

  it('under reduced motion set jumps and impulse does nothing', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const g = createSpringGroup({ x: 0 });
    g.set({ x: 10 });
    expect(g.get('x')).toBe(10);
    expect(g.animating).toBe(false);
    g.impulse({ x: 500 });
    expect(g.animating).toBe(false);
    const always = createSpringGroup({ x: 0 }, { always: true });
    always.set({ x: 1 });
    expect(always.animating).toBe(true);
    always.stop();
    configureComponents({ reducedMotion: 'user' });
  });

  it('stops when its owner is detached', async () => {
    fakeClocks();
    const owner = document.createElement('div');
    document.body.append(owner);
    const g = createSpringGroup({ x: 0 }, { owner });
    g.set({ x: 100 });
    await vi.advanceTimersByTimeAsync(50);
    const at = g.get('x');
    owner.remove();
    await vi.advanceTimersByTimeAsync(500);
    expect(g.get('x')).toBe(at);
  });
});

describe('17.16 micro engine', () => {
  beforeEach(() => installComponentMocks());

  it('lists its behaviours and feedback and parses specs', () => {
    expect(MICRO_BEHAVIORS).toEqual(['press', 'hover', 'lift', 'magnetic', 'tilt', 'glow', 'squish', 'drag', 'focus']);
    expect(MICRO_FEEDBACK).toEqual(['shake', 'nod', 'pop', 'wiggle', 'jelly', 'nudge', 'bump', 'attention']);
    expect(parseMicro('press, hover  bogus press')).toEqual(['press', 'hover']);
    expect(parseMicro(['tilt', 'drag'])).toEqual(['tilt', 'drag']);
    expect(parseMicro(null)).toEqual([]);
  });

  it('microTransform composes every channel into one transform', () => {
    expect(microTransform({})).toBe('');
    const t = microTransform({ press: 1, hover: 0.5, lift: 4, dx: 10, rz: 3 }, { pressScale: 0.9, hoverScale: 1.1 });
    expect(t).toContain('translate');
    expect(t).toContain('scale');
    expect(t).toContain('rotate');
  });

  it('reads the feel and speed from attributes and look tokens', () => {
    const el = mount<HTMLElement>('<div data-mo-feel="playful"><span></span></div>');
    expect(readFeel(el.firstElementChild!)).toBe('playful');
    expect(readSpeed(el)).toBe(1);
  });

  it('micro() attaches once, marks the element and cleans up', () => {
    const el = mount<HTMLButtonElement>('<button style="transform: rotate(1deg)">Go</button>');
    const h = micro(el, 'press hover lift');
    expect(microOf(el)).toBe(h);
    expect(micro(el, 'press')).toBe(h);
    expect(el.getAttribute('data-mo-micro')).toContain('press');
    h.destroy();
    expect(microOf(el)).toBeUndefined();
    expect(el.hasAttribute('data-mo-micro')).toBe(false);
    expect(el.style.transform).toBe('rotate(1deg)');
  });

  it('press springs the element down and calls back', async () => {
    fakeClocks();
    const el = mount<HTMLButtonElement>('<button>Go</button>');
    const onPress = vi.fn();
    const onRelease = vi.fn();
    const h = micro(el, 'press', { onPress, onRelease });
    el.dispatchEvent(pointer('pointerdown'));
    expect(onPress).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);
    expect(h.group.get('press')).toBeGreaterThan(0.9);
    expect(el.style.transform).toContain('scale');
    el.dispatchEvent(pointer('pointerup'));
    expect(onRelease).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3000);
    expect(h.group.get('press')).toBe(0);
    h.destroy();
  });

  it('drag moves with the keyboard and reports the end', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<HTMLDivElement>('<div tabindex="0">Drag</div>');
    const ends: any[] = [];
    const h = micro(el, 'drag', { bounds: 'none', onDragEnd: (p) => ends.push(p) });
    key(el, 'ArrowRight');
    key(el, 'ArrowDown');
    expect(h.position).toEqual({ x: 16, y: 16 });
    h.moveTo(5, -5);
    expect(h.position).toEqual({ x: 5, y: -5 });
    expect(ends).toHaveLength(2);
    h.destroy();
    const grid = mount<HTMLDivElement>('<div tabindex="0">Snap</div>');
    const g = micro(grid, 'drag', { bounds: 'none', snap: 40 });
    key(grid, 'ArrowRight');
    expect(g.position).toEqual({ x: 40, y: 0 });
    g.destroy();
    configureComponents({ reducedMotion: 'user' });
  });

  it('feedback flashes instead of moving under reduced motion', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<HTMLDivElement>('<div>x</div>');
    feedback(el, 'shake');
    expect(el.getAttribute('data-mo-micro-flash')).toBe('error');
    feedback(el, 'nod');
    expect(el.getAttribute('data-mo-micro-flash')).toBe('success');
    configureComponents({ reducedMotion: 'user' });
  });

  it('applyMicro wires markup, including elements added later, and undoes it', async () => {
    const root = mount<HTMLDivElement>('<div><button data-mo-micro="press">A</button></div>');
    const stop = applyMicro(root);
    expect(microOf(root.querySelector('button')!)).toBeTruthy();
    const late = document.createElement('a');
    late.setAttribute('data-mo-micro', 'hover lift');
    root.append(late);
    await new Promise((r) => setTimeout(r, 0));
    expect(microOf(late)).toBeTruthy();
    stop();
    expect(microOf(root.querySelector('button')!)).toBeUndefined();
  });
});

describe('17.16 widgets', () => {
  beforeEach(() => {
    installComponentMocks({ reducedMotion: true });
    defineWidgets('17.16');
  });

  it('registers eight widgets under 17.16 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.16']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every widget in the catalog and on the demo page', () => {
    expect(cat.map((c: any) => c.id).sort()).toEqual([...TAGS].sort());
    for (const c of cat as any[]) expect(c.since).toBe('17.16');
    const page = readFileSync('showcase/micro.html', 'utf8');
    for (const name of TAGS) expect(page).toContain(`<mo-${name}`);
  });

  it('remounts every catalog example cleanly', () => {
    for (const c of cat as any[]) {
      const box = document.createElement('div');
      box.innerHTML = c.usage;
      document.body.append(box);
      const el = box.querySelector(`mo-${c.id}`) as HTMLElement;
      expect(el, c.id).toBeTruthy();
      const count = el.querySelectorAll('*').length;
      const text = el.textContent;
      el.remove();
      box.prepend(el);
      expect(el.querySelectorAll('*').length, c.id).toBe(count);
      expect(el.textContent, c.id).toBe(text);
      box.remove();
    }
  });

  it('documents every widget, the core and the engine', () => {
    const doc = readFileSync('docs/micro-17-16.md', 'utf8');
    for (const name of TAGS) expect(doc).toContain(`mo-${name}`);
    for (const word of ['createSpringGroup', 'microSpring', 'micro(', 'feedback(', 'prefers-reduced-motion']) expect(doc).toContain(word);
  });

  it('mo-micro wraps content, emits press and plays feedback from its attribute', () => {
    const el = mount<HTMLElement>('<mo-micro fx="press glow"><button>Hi</button></mo-micro>');
    expect(microOf(el)).toBeTruthy();
    const got = events(el, 'press');
    el.dispatchEvent(pointer('pointerdown'));
    expect(got).toHaveLength(1);
    el.setAttribute('feedback', 'shake');
    expect(el.getAttribute('data-mo-micro-flash')).toBe('error');
  });

  it('mo-micro-switch toggles by click and keeps state across remounts', () => {
    const el = mount<any>('<mo-micro-switch label="Wi-Fi"></mo-micro-switch>');
    const btn = el.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    const got = events(el, 'change');
    btn.click();
    expect(el.checked).toBe(true);
    expect(got).toEqual([{ checked: true }]);
    const host = el.parentElement!;
    el.remove();
    host.append(el);
    expect(el.querySelector('[role="switch"]').getAttribute('aria-checked')).toBe('true');
    el.checked = false;
    expect(el.querySelector('[role="switch"]').getAttribute('aria-checked')).toBe('false');
  });

  it('mo-micro-checkbox checks and clears indeterminate', () => {
    const el = mount<any>('<mo-micro-checkbox label="All" indeterminate></mo-micro-checkbox>');
    const btn = el.querySelector('[role="checkbox"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('mixed');
    const got = events(el, 'change');
    btn.click();
    expect(btn.getAttribute('aria-checked')).toBe('true');
    expect(got).toEqual([{ checked: true }]);
  });

  it('mo-micro-input validates and announces the message', () => {
    const el = mount<any>('<mo-micro-input label="Email" type="email" required error="Enter an email"></mo-micro-input>');
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.labels?.length || el.querySelector('label')!.contains(input)).toBeTruthy();
    const bad = events(el, 'invalid');
    expect(el.validate()).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(bad[0].message).toBe('Enter an email');
    el.value = 'a@b.co';
    expect(el.validate()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('mo-micro-button runs a task through loading to success or error', async () => {
    const el = mount<any>('<mo-micro-button label="Save" success-label="Saved" error-label="Retry"></mo-micro-button>');
    const states = events(el, 'state');
    const btn = el.querySelector('button') as HTMLButtonElement;
    const ok = el.run(Promise.resolve());
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(await ok).toBe(true);
    expect(states.map((s) => s.state)).toEqual(['loading', 'success']);
    expect(await el.run(() => Promise.reject(new Error('no')))).toBe(false);
    expect(states.at(-1).state).toBe('error');
  });

  it('mo-micro-slider moves by keys within its range', () => {
    const el = mount<any>('<mo-micro-slider label="Volume" value="40" step="5"></mo-micro-slider>');
    const thumb = el.querySelector('[role="slider"]') as HTMLElement;
    const got = events(el, 'change');
    key(thumb, 'ArrowRight');
    expect(el.value).toBe(45);
    key(thumb, 'End');
    expect(el.value).toBe(100);
    key(thumb, 'End');
    expect(el.value).toBe(100);
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
    expect(got.map((g) => g.value)).toEqual([45, 100]);
  });

  it('mo-micro-segmented picks by click and arrow keys', () => {
    const el = mount<any>('<mo-micro-segmented label="View" options="List,Board,Calendar" value="Board"></mo-micro-segmented>');
    const opts = Array.from(el.querySelectorAll('[role="radio"]')) as HTMLButtonElement[];
    expect(opts).toHaveLength(3);
    expect(opts[1].getAttribute('aria-checked')).toBe('true');
    const got = events(el, 'change');
    opts[0].click();
    expect(el.value).toBe('List');
    key(opts[0], 'ArrowRight');
    expect(el.value).toBe('Board');
    expect(got.map((g) => g.index)).toEqual([0, 1]);
  });

  it('mo-micro-stepper steps, stops at its limits and supports keys', () => {
    const el = mount<any>('<mo-micro-stepper label="Guests" value="2" min="1" max="3"></mo-micro-stepper>');
    const [minus, plus] = Array.from(el.querySelectorAll('.usa-mstep-btn')) as HTMLButtonElement[];
    const box = el.querySelector('[role="spinbutton"]') as HTMLElement;
    plus.click();
    expect(el.value).toBe(3);
    plus.click();
    expect(el.value).toBe(3);
    expect(plus.getAttribute('aria-disabled')).toBe('true');
    minus.click();
    expect(el.value).toBe(2);
    key(box, 'Home');
    expect(el.value).toBe(1);
    expect(box.getAttribute('aria-valuenow')).toBe('1');
  });
});

describe('17.16 kit helpers', () => {
  it('maps values, steps and rubber bands', () => {
    expect(fraction(5, 0, 10)).toBe(0.5);
    expect(fraction(50, 0, 10)).toBe(1);
    expect(valueAt(0.52, 0, 100, 5)).toBe(50);
    expect(overdrag(50, 0, 100, 100)).toBe(0);
    const past = overdrag(160, 0, 100, 100);
    expect(past).toBeGreaterThan(0);
    expect(past).toBeLessThan(60);
    expect(overdrag(-60, 0, 100, 100)).toBeCloseTo(-past, 6);
    expect(Math.abs(stretch(100000))).toBeLessThanOrEqual(0.3);
    expect(edgeSprings(0, 10)).toEqual({ left: 'settle', right: 'snappy' });
    expect(edgeSprings(10, 0)).toEqual({ left: 'snappy', right: 'settle' });
    const d = holdDelays(10);
    expect(d[0]).toBeGreaterThan(d[d.length - 1]);
  });
});
