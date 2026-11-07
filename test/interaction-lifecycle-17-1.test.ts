import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { definePress, defineMagnetic } from '../src/components/interaction';
import type { UsaPressElement } from '../src/components/interaction/press';

beforeEach(() => {
  document.body.replaceChildren();
  installComponentMocks();
  definePress();
  defineMagnetic();
});
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe('interaction lifecycle', () => {
  it('releases a keyboard press when its child loses focus', () => {
    const el = mount<UsaPressElement>('<usa-press><button>Save</button></usa-press>');
    const button = el.querySelector('button')!;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(el.pressed).toBe(false);
    expect(el.hasAttribute('data-pressed')).toBe(false);
  });
  it('clears the pressed marker when disabled or reconnected during a press', () => {
    const el = mount<UsaPressElement>('<usa-press><button>Save</button></usa-press>');
    el.dispatchEvent(new Event('pointerdown'));
    el.setAttribute('disabled', '');
    expect(el.pressed).toBe(false);
    expect(el.hasAttribute('data-pressed')).toBe(false);
    el.removeAttribute('disabled');
    el.dispatchEvent(new Event('pointerdown'));
    el.remove();
    document.body.append(el);
    expect(el.pressed).toBe(false);
    expect(el.hasAttribute('data-pressed')).toBe(false);
  });

  it.each(['blur', 'pointerleave'])('cancels a queued magnetic frame on %s', (type) => {
    vi.useFakeTimers();
    const el = mount('<usa-magnetic>Save</usa-magnetic>');
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 40 }) as DOMRect;
    const move = new MouseEvent('pointermove', { clientX: 70, clientY: 20 });
    Object.defineProperty(move, 'pointerType', { value: 'mouse' });
    document.dispatchEvent(move);
    (type === 'blur' ? window : document).dispatchEvent(new Event(type));
    vi.advanceTimersByTime(100);
    expect(el.hasAttribute('data-active')).toBe(false);
    expect(el.style.getPropertyValue('--usa-mx')).toBe('');
    // Releasing must also allow the next pointer frame to be scheduled.
    document.dispatchEvent(move);
    vi.advanceTimersByTime(100);
    expect(el.style.getPropertyValue('--usa-mx')).toBe('7.00px');
  });
});
