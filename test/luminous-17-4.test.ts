import { beforeAll, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { configureComponents } from '../src/components/base';
import { defineLuminousSwitch, type UsaLuminousSwitchElement } from '../src/components/widgets/luminous-switch';
import { defineParticleIcon } from '../src/components/widgets/particle-icon';
import { defineParticleButton } from '../src/components/widgets/particle-button';
import { defineHaloSegmented, type UsaHaloSegmentedElement } from '../src/components/widgets/halo-segmented';
import { defineHaloSlider, type UsaHaloSliderElement } from '../src/components/widgets/halo-slider';
import { defineOrbitProgress } from '../src/components/widgets/orbit-progress';
import { installMocks, animations } from './setup';

beforeAll(() => { for (const fn of [defineLuminousSwitch, defineParticleIcon, defineParticleButton, defineHaloSegmented, defineHaloSlider, defineOrbitProgress]) fn(); });
beforeEach(() => { installMocks({ reducedMotion: true }); configureComponents({ motionSensitivity: 'full', reducedMotion: 'user' }); });
afterEach(() => { document.body.replaceChildren(); configureComponents({ motionSensitivity: 'full', reducedMotion: 'user' }); });

it('registers all six public names directly from individual define functions', () => {
  for (const name of ['luminous-switch', 'particle-icon', 'particle-button', 'halo-segmented', 'halo-slider', 'orbit-progress']) expect(customElements.get('mo-' + name)).toBeDefined();
});
it('switch reflects external attributes, submits only enabled checked values and restores initial state', async () => {
  document.body.innerHTML = '<form><mo-luminous-switch name="light" label="Theme"></mo-luminous-switch></form><main id="target"></main>';
  const form = document.querySelector('form')!, el = document.querySelector('mo-luminous-switch') as UsaLuminousSwitchElement;
  const change = vi.fn(); el.addEventListener('usa:change', change);
  el.setAttribute('target', '#target');
  el.querySelector('button')!.click();
  expect(el.checked).toBe(true); expect(el.querySelector('button')!.getAttribute('aria-checked')).toBe('true');
  expect(new FormData(form).get('light')).toBe('on'); expect(document.querySelector('main')!.getAttribute('data-usa-surface')).toBe('light');
  el.setAttribute('disabled', ''); expect(new FormData(form).has('light')).toBe(false);
  el.querySelector('button')!.click(); expect(change).toHaveBeenCalledTimes(1);
  el.removeAttribute('disabled'); form.reset(); await Promise.resolve(); expect(el.checked).toBe(false);
  el.setAttribute('checked', 'false'); expect(el.querySelector('button')!.getAttribute('aria-checked')).toBe('false');
  expect(change).toHaveBeenCalledTimes(1);
});
it('cancelled reset leaves the switch state unchanged and no target means no page theme change', async () => {
  document.body.innerHTML = '<form><mo-luminous-switch></mo-luminous-switch></form>';
  const before = document.documentElement.getAttribute('data-usa-surface');
  const el = document.querySelector('mo-luminous-switch') as UsaLuminousSwitchElement; el.checked = true;
  document.querySelector('form')!.addEventListener('reset', e => e.preventDefault()); document.querySelector('form')!.reset(); await Promise.resolve();
  expect(el.checked).toBe(true); expect(document.documentElement.getAttribute('data-usa-surface')).toBe(before);
});
it('segmented choices support reflected value, keyboard navigation, disable and deduplicated text-only labels', () => {
  document.body.innerHTML = '<mo-halo-segmented options="One,Two,Two,Three" value="Two"></mo-halo-segmented>';
  const el = document.querySelector('mo-halo-segmented') as UsaHaloSegmentedElement;
  expect(el.querySelectorAll('button')).toHaveLength(3);
  const event = vi.fn(); el.addEventListener('usa:change', event);
  el.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  expect(el.value).toBe('Three'); expect(document.activeElement?.textContent).toBe('Three');
  el.value = 'missing'; expect(el.value).toBe('One'); expect(event).toHaveBeenCalledTimes(1);
  el.setAttribute('disabled', ''); expect([...el.querySelectorAll('button')].every(b => b.disabled)).toBe(true);
});
it('native slider clamps, snaps, emits input and change, submits and resets', async () => {
  document.body.innerHTML = '<form><mo-halo-slider name="volume" min="10" max="30" step="5" value="20"></mo-halo-slider></form>';
  const el = document.querySelector('mo-halo-slider') as UsaHaloSliderElement, input = el.querySelector('input')!;
  const onInput = vi.fn(), onChange = vi.fn(); el.addEventListener('usa:input', onInput); el.addEventListener('usa:change', onChange);
  el.value = 200; expect(el.value).toBe(30); input.value = '15'; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
  expect(el.value).toBe(15); expect(el.getAttribute('value')).toBe('15'); expect(onInput).toHaveBeenCalledTimes(1); expect(onChange).toHaveBeenCalledTimes(1);
  expect(new FormData(document.querySelector('form')!).get('volume')).toBe('15');
  document.querySelector('form')!.reset(); await Promise.resolve(); expect(el.value).toBe(20);
});
it('progress exposes bounded finite values and remains static at rest', () => {
  document.body.innerHTML = '<mo-orbit-progress max="50" value="500"></mo-orbit-progress>';
  const el = document.querySelector('mo-orbit-progress')!;
  expect(el.getAttribute('aria-valuenow')).toBe('50'); el.value = NaN; expect(el.getAttribute('aria-valuenow')).toBe('0');
  expect(el.querySelectorAll('circle')).toHaveLength(2); expect(animations).toHaveLength(0);
});
it('particle action toggles once, honours disabled and does not animate under reduced motion', () => {
  document.body.innerHTML = '<mo-particle-button toggle label="Like" active-icon="heart"></mo-particle-button><mo-particle-icon decorative></mo-particle-icon>';
  const el = document.querySelector('mo-particle-button')!, b = el.querySelector('button')!, activate = vi.fn(); el.addEventListener('usa:activate', activate);
  b.click(); expect(b.getAttribute('aria-pressed')).toBe('true'); expect(activate).toHaveBeenCalledTimes(1);
  el.setAttribute('disabled', ''); b.click(); expect(activate).toHaveBeenCalledTimes(1);
  expect(document.querySelector('mo-particle-icon')!.getAttribute('aria-hidden')).toBe('true'); expect(animations).toHaveLength(0);
});
it('reconnect rebuilds one control and removes old handlers', () => {
  document.body.innerHTML = '<mo-luminous-switch></mo-luminous-switch>';
  const el = document.querySelector('mo-luminous-switch')!, old = el.querySelector('button')!, handler = vi.fn(); el.addEventListener('usa:change', handler);
  el.remove(); document.body.append(el); old.click(); expect(handler).not.toHaveBeenCalled();
  expect(el.querySelectorAll('button')).toHaveLength(1); el.querySelector('button')!.click(); expect(handler).toHaveBeenCalledTimes(1);
});
