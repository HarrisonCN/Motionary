import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineWidgets, WIDGETS, relayOrder, deadZone, hueColor } from '../src/components/widgets';
import { notchValues, nearestNotch, shortestTurn, roundTo } from '../src/components/widgets/moments';
import { defineMagnetic } from '../src/components/interaction/magnetic';
import { paramPrompt, formatParam, fenceFor } from '../showcase/param-prompt.js';
import { playgroundParams, newLayer } from '../showcase/playground-core.js';
import { components as moments } from '../showcase/catalog/moments.js';
import { components as tactile } from '../showcase/catalog/tactile.js';
import { installComponentMocks } from './components-setup';
import { readFileSync } from 'node:fs';

const TAGS = ['eclipse-toggle', 'hue-orbit', 'notch-slider', 'bulge-volume', 'copy-button', 'tile-relay', 'squish-key', 'squish-stepper', 'analog-stick', 'transfer-button',
  'six-dot-orbit', 'center-bars', 'quarter-ring', 'triple-pulse', 'breath-orb', 'three-dot-bounce', 'infinity-loop', 'sweep-lines', 'wifi-signal', 'text-reveal',
  'jelly-button', 'bounce-button', 'tada-button', 'groove-toggle', 'cart-badge', 'chip-input', 'plan-picker', 'align-switch', 'elastic-slider', 'code-shake',
  'strength-meter', 'step-track', 'elastic-accordion', 'squish-indicator'];

beforeEach(() => {
  installComponentMocks({ reducedMotion: true });
  defineWidgets('17.9');
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

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

describe('17.9 registration', () => {
  it('registers thirty-four widgets under 17.9 with mo-* and usa-* names', () => {
    expect(Object.keys(WIDGETS['17.9']).map((t) => t.slice(4))).toEqual(TAGS);
    for (const name of TAGS) {
      expect(customElements.get('mo-' + name)).toBeTruthy();
      expect(customElements.get('usa-' + name)).toBeTruthy();
    }
  });

  it('lists every new widget in the showcase catalog and the lab page', () => {
    const ids = [...moments, ...tactile].map((c) => c.id);
    expect([...ids].sort()).toEqual([...TAGS].sort());
    const lab = readFileSync('showcase/moments.html', 'utf8');
    for (const name of TAGS) expect(lab).toContain(`<mo-${name}`);
  });

  it('remounts cleanly: one root after detach and reattach', () => {
    for (const name of TAGS) {
      const el = mount<HTMLElement>(`<mo-${name}></mo-${name}>`);
      const count = el.childElementCount;
      expect(count).toBeGreaterThan(0);
      el.remove();
      document.body.append(el);
      expect(el.childElementCount).toBe(count);
    }
  });
});

describe('pure helpers', () => {
  it('relayOrder walks the outer ring clockwise', () => {
    expect(relayOrder(2)).toEqual([0, 1, 3, 2]);
    expect(relayOrder(3)).toEqual([0, 1, 2, 5, 8, 7, 6, 3]);
  });
  it('notches, snapping and turning', () => {
    expect(notchValues(-2, 2, 5)).toEqual([-2, -1, 0, 1, 2]);
    expect(notchValues(0, 1, 99)).toHaveLength(21);
    expect(nearestNotch(0.95, [0, 1], 0.1)).toBe(1);
    expect(nearestNotch(0.5, [0, 1], 0.1)).toBeNull();
    expect(shortestTurn(-350, -10)).toBe(-370);
    expect(roundTo(0.1 + 0.2, 0.1)).toBe(0.3);
  });
  it('deadZone zeroes the centre and still reaches 1 at the rim', () => {
    expect(deadZone(0.05, 0.05, 0.12)).toEqual([0, 0]);
    expect(deadZone(1, 0, 0.12)).toEqual([1, 0]);
    expect(deadZone(3, 0, 0.12)).toEqual([1, 0]);
  });
  it('hueColor is a plain hsl() string', () => {
    expect(hueColor(210, 78, 58)).toBe('hsl(210 78% 58%)');
  });
});

describe('moments', () => {
  it('eclipse toggle is a native switch that flips and reports', () => {
    const el = mount<any>('<mo-eclipse-toggle label="Night"></mo-eclipse-toggle>');
    const got = events(el, 'change');
    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    btn.click();
    expect(el.checked).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
    expect(got).toEqual([{ checked: true }]);
    el.setAttribute('disabled', '');
    btn.click();
    expect(got).toHaveLength(1);
  });

  it('hue orbit is a radio group whose pick reports hue and colour', () => {
    const el = mount<any>('<mo-hue-orbit count="12" hue="0"></mo-hue-orbit>');
    const got = events(el, 'change');
    const radios = el.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(12);
    const pick = radios[3] as HTMLInputElement;
    pick.checked = true;
    pick.dispatchEvent(new Event('change', { bubbles: true }));
    expect(got[0].hue).toBe(Number(pick.value));
    expect(got[0].color).toMatch(/^hsl\(/);
  });

  it('notch slider snaps to a nearby notch on change', () => {
    const el = mount<any>('<mo-notch-slider min="0" max="10" notches="3" snap="0.1"></mo-notch-slider>');
    const got = events(el, 'change');
    const input = el.querySelector('input[type="range"]') as HTMLInputElement;
    expect(el.querySelectorAll('.usa-notch-tick')).toHaveLength(3);
    input.value = '5.5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(el.value).toBe(5);
    expect(got.at(-1)).toEqual({ value: 5 });
  });

  it('copy button copies and reports only success and length', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const el = mount<any>('<mo-copy-button text="secret-token"></mo-copy-button>');
    const got = events(el, 'copy');
    expect(await el.copy()).toBe(true);
    expect(writeText).toHaveBeenCalledWith('secret-token');
    expect(got).toEqual([{ ok: true, length: 12 }]);
    expect(JSON.stringify(got)).not.toContain('secret');
    expect(el.querySelector('[role="status"]')?.textContent).toBe('Copied');
  });

  it('tile relay draws an n×n grid with a still core and announces once', () => {
    const el = mount<any>('<mo-tile-relay size="3" label="Loading photos"></mo-tile-relay>');
    expect(el.querySelectorAll('.usa-relay-tile')).toHaveLength(9);
    expect(el.querySelectorAll('.usa-relay-tile[data-core]')).toHaveLength(1);
    expect(el.querySelector('[role="status"]')?.textContent).toBe('Loading photos');
    expect(el.querySelector('.usa-relay')?.hasAttribute('data-static')).toBe(true);
  });
});

describe('tactile', () => {
  it('squish key is a button that emits press', () => {
    const el = mount<any>('<mo-squish-key label="B" shape="round"></mo-squish-key>');
    const got = events(el, 'press');
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(got).toEqual([null]);
    expect(el.querySelector('.usa-squish')?.getAttribute('data-shape')).toBe('round');
  });

  it('squish stepper steps within bounds and disables the key at the edge', () => {
    const el = mount<any>('<mo-squish-stepper value="7" min="1" max="8"></mo-squish-stepper>');
    const input = events(el, 'input');
    const change = events(el, 'change');
    const [minus, plus] = el.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    plus.click();
    expect(el.value).toBe(8);
    expect(input).toEqual([{ value: 8 }]);
    expect(change).toEqual([{ value: 8 }]);
    expect(plus.disabled).toBe(true);
    minus.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(el.value).toBe(7);
    expect(el.querySelector('output')?.textContent).toBe('7');
  });

  it('analog stick moves with arrow keys and springs home with a release event', () => {
    const el = mount<any>('<mo-analog-stick></mo-analog-stick>');
    const moves = events(el, 'move');
    const releases = events(el, 'release');
    const cap = el.querySelector('button') as HTMLButtonElement;
    cap.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(moves.at(-1)).toEqual({ x: 1, y: 0 });
    cap.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
    expect(releases).toEqual([{ x: 1, y: 0 }]);
    expect(el.x).toBe(0);
  });

  it('transfer button asks for the transfer and completes once at 100', () => {
    const el = mount<any>('<mo-transfer-button direction="upload"></mo-transfer-button>');
    const asked = events(el, 'transfer');
    const done = events(el, 'complete');
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(asked).toEqual([{ direction: 'upload' }]);
    el.progress = 40;
    expect(el.querySelector('.usa-transfer')?.getAttribute('data-state')).toBe('busy');
    el.progress = 100;
    el.progress = 100;
    expect(done).toEqual([{ direction: 'upload' }]);
    el.progress = null;
    expect(el.querySelector('.usa-transfer')?.getAttribute('data-state')).toBe('idle');
  });
});

describe('magnetic release="spring"', () => {
  it('observes the new attribute and keeps the old default', () => {
    defineMagnetic();
    const ctor = customElements.get('usa-magnetic') as any;
    expect(ctor.observedAttributes).toContain('release');
    const el = mount<HTMLElement>('<usa-magnetic release="spring"><button>x</button></usa-magnetic>');
    expect(el.hasAttribute('data-releasing')).toBe(false);
  });
});

describe('Copy as AI prompt', () => {
  it('includes the tuned values, the code with mo-* names and the shared rules', () => {
    const text = paramPrompt({ name: 'Fade up', tag: 'usa-reveal', params: [['duration', 900], ['easing', 'ease-out'], ['delay', '']], code: '<usa-reveal effect="fade-up">Hi</usa-reveal>', fence: 'html' });
    expect(text).toContain('Effect: Fade up <mo-reveal>');
    expect(text).toContain('- duration: 900');
    expect(text).toContain('- easing: ease-out');
    expect(text).not.toContain('delay');
    expect(text).toContain('```html\n<mo-reveal effect="fade-up">Hi</mo-reveal>\n```');
    expect(text).toContain('prefers-reduced-motion');
  });
  it('speaks Chinese and keeps long values short', () => {
    const zh = paramPrompt({ name: '淡入', params: { duration: 600 }, lang: 'zh' });
    expect(zh).toContain('效果：淡入');
    expect(zh).toContain('请保持这些已调好的参数不变：');
    expect(formatParam('x', 'a'.repeat(500)).length).toBeLessThan(220);
    expect(fenceFor('react')).toBe('tsx');
  });
  it('lists each playground layer with only the values that differ from the default', () => {
    // a new tilt layer keeps its numeric defaults out and writes only the flag that is on by default
    const layer = newLayer('usa-tilt');
    expect(playgroundParams({ layers: [layer] })).toEqual([['1. <mo-tilt>', 'glare']]);
    layer.attrs.max = 18;
    layer.attrs.glare = false;
    expect(playgroundParams({ layers: [layer] })).toEqual([['1. <mo-tilt>', 'max="18"']]);
    layer.attrs.max = 10;
    expect(playgroundParams({ layers: [layer] })).toEqual([['1. <mo-tilt>', '(defaults)']]);
  });
});

describe('Agent Skill', () => {
  it('has front matter with a name and a description', () => {
    const skill = readFileSync('skills/motionary/SKILL.md', 'utf8');
    const front = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] || '';
    expect(front).toMatch(/^name: motionary$/m);
    expect(front).toMatch(/^description: .{40,}/m);
  });
});
