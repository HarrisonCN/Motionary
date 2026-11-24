import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defineWidgets, badgeText, splitChips, parsePlans, passwordScore, digitsOf, revealPieces, parseOptions, ALIGNMENTS,
} from '../src/components/widgets';
import { installComponentMocks } from './components-setup';

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
const pick = (input: HTMLInputElement) => {
  input.checked = true;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

const LOADERS: [string, number][] = [
  ['six-dot-orbit', 6], ['center-bars', 5], ['quarter-ring', 1], ['triple-pulse', 3],
  ['breath-orb', 2], ['three-dot-bounce', 3], ['infinity-loop', 0], ['sweep-lines', 4],
];

describe('17.9 UI moment helpers', () => {
  it('badgeText hides zero and caps at max', () => {
    expect(badgeText(0, 99)).toBe('');
    expect(badgeText(7, 99)).toBe('7');
    expect(badgeText(120, 99)).toBe('99+');
  });
  it('splitChips trims and drops empties', () => {
    expect(splitChips(' a, b ,,\nc ')).toEqual(['a', 'b', 'c']);
  });
  it('parsePlans reads name|detail pairs', () => {
    expect(parsePlans('Basic|Free, Pro|$12')).toEqual([{ name: 'Basic', detail: 'Free' }, { name: 'Pro', detail: '$12' }]);
  });
  it('passwordScore grows with length and variety', () => {
    expect(passwordScore('abc')).toBe(0);
    expect(passwordScore('aaaaaaaa')).toBe(1);
    expect(passwordScore('Tr0ub4dor&3xyz')).toBe(4);
  });
  it('digitsOf keeps digits only, up to n', () => {
    expect(digitsOf('12-3 4x5', 4)).toEqual(['1', '2', '3', '4']);
  });
  it('revealPieces splits by char or word', () => {
    expect(revealPieces('ab c', 'char')).toEqual(['a', 'b', ' ', 'c']);
    expect(revealPieces('ab c', 'word')).toEqual(['ab', ' ', 'c']);
  });
  it('parseOptions dedupes and falls back to A, B, C', () => {
    expect(parseOptions('x, y, x')).toEqual(['x', 'y']);
    expect(parseOptions(' , ')).toEqual(['A', 'B', 'C']);
    expect(ALIGNMENTS).toEqual(['left', 'center', 'right']);
  });
});

describe('17.9 loaders', () => {
  it.each(LOADERS)('%s is a labelled status with %i parts that pauses and stands still', (name, parts) => {
    const el = mount<HTMLElement>(`<mo-${name} label="Saving" duration="900" paused></mo-${name}>`);
    const root = el.querySelector('.usa-loader') as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(root.textContent).toBe('Saving');
    expect(root.querySelector('.usa-loader-art')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelectorAll('.usa-loader-part')).toHaveLength(parts);
    expect(root.style.getPropertyValue('--lap')).toBe('900ms');
    expect(root.hasAttribute('data-paused')).toBe(true);
    expect(root.hasAttribute('data-static')).toBe(true);
    el.removeAttribute('paused');
    expect(root.hasAttribute('data-paused')).toBe(false);
  });
  it('infinity loop draws an SVG track', () => {
    const el = mount<HTMLElement>('<mo-infinity-loop></mo-infinity-loop>');
    expect(el.querySelector('svg .usa-loader-track')).toBeTruthy();
    expect(el.querySelector('svg .usa-loader-run')).toBeTruthy();
  });
  it('wifi signal speaks its level and searching state', () => {
    const el = mount<HTMLElement>('<mo-wifi-signal level="2"></mo-wifi-signal>');
    const root = el.querySelector('.usa-wifi') as HTMLElement;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('Signal: 2 of 3');
    expect(root.dataset.level).toBe('2');
    el.setAttribute('searching', '');
    expect(root.getAttribute('aria-label')).toBe('Signal: searching');
  });
});

describe('17.9 buttons and toggles', () => {
  it('jelly and bounce buttons emit press and respect disabled', () => {
    for (const name of ['jelly-button', 'bounce-button']) {
      const el = mount<HTMLElement>(`<mo-${name}></mo-${name}>`);
      const got = events(el, 'press');
      const btn = el.querySelector('button') as HTMLButtonElement;
      btn.click();
      expect(got).toEqual([null]);
      el.setAttribute('disabled', '');
      expect(btn.disabled).toBe(true);
    }
    const bounce = mount<HTMLElement>('<mo-bounce-button direction="left"></mo-bounce-button>');
    expect(bounce.querySelector('.usa-bounce')?.getAttribute('data-direction')).toBe('left');
    bounce.setAttribute('direction', 'sideways');
    expect(bounce.querySelector('.usa-bounce')?.getAttribute('data-direction')).toBe('up');
  });
  it('tada and groove are pressed toggles', () => {
    for (const [name, sel] of [['tada-button', '.usa-tada'], ['groove-toggle', '.usa-groove-key']]) {
      const el = mount<any>(`<mo-${name}></mo-${name}>`);
      const got = events(el, 'change');
      const btn = el.querySelector(sel) as HTMLButtonElement;
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      btn.click();
      expect(el.pressed).toBe(true);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
      btn.click();
      expect(got).toEqual([{ pressed: true }, { pressed: false }]);
    }
  });
  it('cart badge adds, pops the count and names the bag', () => {
    const el = mount<any>('<mo-cart-badge count="98" max="99"></mo-cart-badge>');
    const added = events(el, 'add');
    const opened = events(el, 'open');
    const [bag, plus] = el.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(bag.getAttribute('aria-label')).toBe('Cart, 98 items');
    plus.click();
    plus.click();
    expect(added).toEqual([{ count: 99 }, { count: 100 }]);
    expect(el.querySelector('.usa-cart-count')?.textContent).toBe('99+');
    expect(el.querySelector('[role="status"]')?.textContent).toBe('100 items in cart');
    bag.click();
    expect(opened).toEqual([null]);
    el.count = 0;
    expect(el.querySelector('.usa-cart')?.hasAttribute('data-empty')).toBe(true);
  });
  it('text reveal splits into pieces and keeps the full text for readers', () => {
    const el = mount<HTMLElement>('<mo-text-reveal text="Hi you" by="word"></mo-text-reveal>');
    expect(Array.from(el.querySelectorAll('.usa-reveal-piece'), (p) => p.textContent)).toEqual(['Hi', 'you']);
    expect(el.querySelector('.usa-reveal-art')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.usa-sr')?.textContent).toBe('Hi you');
  });
  it('squish indicator picks one option and reports it', () => {
    const el = mount<any>('<mo-squish-indicator options="A,B,C" value="B" name="grade"></mo-squish-indicator>');
    const got = events(el, 'change');
    const radios = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    expect(radios).toHaveLength(3);
    expect(radios[1].checked).toBe(true);
    pick(radios[2]);
    expect(el.value).toBe('C');
    expect(got).toEqual([{ value: 'C', index: 2 }]);
    expect((el.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('C');
    expect(el.querySelector('.usa-pick-key[data-on]')?.textContent).toBe('C');
  });
});

describe('17.9 form moments', () => {
  it('chip input adds on Enter, ignores duplicates and removes on Backspace', () => {
    const el = mount<any>('<mo-chip-input value="a" name="tags"></mo-chip-input>');
    const got = events(el, 'change');
    const input = el.querySelector('.usa-chips-input') as HTMLInputElement;
    input.value = 'b';
    key(input, 'Enter');
    input.value = 'a';
    key(input, 'Enter');
    expect(el.values).toEqual(['a', 'b']);
    expect(el.querySelectorAll('.usa-chip')).toHaveLength(2);
    expect(Array.from(el.querySelectorAll('input[type="hidden"]'), (i: any) => i.value)).toEqual(['a', 'b']);
    key(input, 'Backspace');
    expect(el.values).toEqual(['a']);
    expect(got).toEqual([{ values: ['a', 'b'] }, { values: ['a'] }]);
    (el.querySelector('.usa-chip-remove') as HTMLButtonElement).click();
    expect(el.values).toEqual([]);
  });
  it('chip input stops at max', () => {
    const el = mount<any>('<mo-chip-input max="2"></mo-chip-input>');
    const input = el.querySelector('.usa-chips-input') as HTMLInputElement;
    input.value = 'x, y, z';
    key(input, 'Enter');
    expect(el.values).toEqual(['x', 'y']);
    expect(input.disabled).toBe(true);
  });
  it('plan picker is a radio group that reports value and index', () => {
    const el = mount<any>('<mo-plan-picker plans="Basic|Free, Pro|$12, Team|$29" value="Pro" name="plan"></mo-plan-picker>');
    const got = events(el, 'change');
    const radios = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    expect(radios).toHaveLength(3);
    expect(radios[1].checked).toBe(true);
    pick(radios[2]);
    expect(got).toEqual([{ value: 'Team', index: 2 }]);
    expect((el.querySelector('.usa-plans') as HTMLElement).style.getPropertyValue('--at')).toBe('2');
    expect((el.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('Team');
  });
  it('align switch moves the preview and reports the alignment', () => {
    const el = mount<any>('<mo-align-switch></mo-align-switch>');
    const got = events(el, 'change');
    const radios = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    pick(radios[2]);
    expect(el.value).toBe('right');
    expect(el.querySelector('.usa-align')?.getAttribute('data-align')).toBe('right');
    expect(got).toEqual([{ value: 'right' }]);
  });
  it('elastic slider is a native range with a bubble', () => {
    const el = mount<any>('<mo-elastic-slider min="0" max="10" value="4" unit="px" ticks="5"></mo-elastic-slider>');
    const got = events(el, 'change');
    const input = el.querySelector('input[type="range"]') as HTMLInputElement;
    expect(el.querySelectorAll('.usa-elastic-ticks i')).toHaveLength(5);
    input.value = '7';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(el.value).toBe(7);
    expect(el.querySelector('output')?.textContent).toBe('7px');
    expect(got).toEqual([{ value: 7 }]);
  });
  it('code shake fills across boxes on paste, completes without the code, and clears on reject', () => {
    const el = mount<any>('<mo-code-shake length="4"></mo-code-shake>');
    const got = events(el, 'complete');
    const boxes = el.querySelectorAll('.usa-code-box') as NodeListOf<HTMLInputElement>;
    expect(boxes).toHaveLength(4);
    const paste = new Event('paste', { bubbles: true, cancelable: true }) as any;
    paste.clipboardData = { getData: () => '9 8 7 6' };
    boxes[0].dispatchEvent(paste);
    expect(el.value).toBe('9876');
    expect(got).toEqual([{ length: 4 }]);
    expect(JSON.stringify(got)).not.toContain('9876');
    el.reject();
    expect(el.value).toBe('');
    expect(el.querySelector('.usa-code')?.getAttribute('data-state')).toBe('error');
    el.accept();
    expect(el.querySelector('.usa-code')?.getAttribute('data-state')).toBe('ok');
  });
  it('strength meter reports only the score and toggles visibility', () => {
    const el = mount<any>('<mo-strength-meter></mo-strength-meter>');
    const got = events(el, 'change');
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
    input.value = 'Tr0ub4dor&3xyz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.score).toBe(4);
    expect(got).toEqual([{ score: 4 }]);
    expect(JSON.stringify(got)).not.toContain('Tr0ub');
    expect(el.querySelector('.usa-strength')?.getAttribute('data-score')).toBe('4');
    const eye = el.querySelector('.usa-strength-eye') as HTMLButtonElement;
    eye.click();
    expect(input.type).toBe('text');
    expect(eye.getAttribute('aria-pressed')).toBe('true');
  });
  it('step track moves between bounds', () => {
    const el = mount<any>('<mo-step-track steps="3" value="2"></mo-step-track>');
    const got = events(el, 'change');
    const [back, fwd] = el.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    fwd.click();
    expect(el.value).toBe(3);
    expect(fwd.disabled).toBe(true);
    back.click();
    expect(got).toEqual([{ value: 3 }, { value: 2 }]);
    expect(el.querySelectorAll('.usa-steps-dot[data-done]')).toHaveLength(2);
    expect(el.querySelector('[role="status"]')?.textContent).toBe('Step 2 of 3');
  });
  it('elastic accordion wraps its children and toggles with aria-expanded', () => {
    const el = mount<any>('<mo-elastic-accordion heading="Shipping"><p>Free over $50.</p></mo-elastic-accordion>');
    const got = events(el, 'toggle');
    const head = el.querySelector('.usa-accord-head') as HTMLButtonElement;
    const body = el.querySelector('.usa-accord-body') as HTMLElement;
    expect(body.querySelector('p')?.textContent).toBe('Free over $50.');
    expect(head.getAttribute('aria-controls')).toBe(body.id);
    expect(head.getAttribute('aria-expanded')).toBe('false');
    expect(body.hidden).toBe(true);
    head.click();
    expect(el.open).toBe(true);
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect(body.hidden).toBe(false);
    expect(got).toEqual([{ open: true }]);
    el.remove();
    expect(el.querySelector('p')?.parentElement).toBe(el);
  });
});
