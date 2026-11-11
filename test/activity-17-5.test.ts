import { beforeAll, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { defineWidgets } from '../src/components/widgets';
import { configureComponents } from '../src/components/base';
import { installMocks, fireAll } from './setup';

const names = ['flight-status', 'transit-progress', 'sun-timeline', 'delivery-tracker', 'glucose-sparkline', 'coffee-timer', 'vital-wave', 'orbit-pass', 'meter-countdown', 'race-telemetry', 'workout-player', 'status-pill', 'ride-status', 'route-sparkline', 'activity-wall'];
beforeAll(() => defineWidgets('17.5'));
beforeEach(() => { installMocks({ reducedMotion: false }); configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' }); });
afterEach(() => { document.body.replaceChildren(); vi.useRealTimers(); });

it('registers all fifteen public names and mounts finite vector views without remote assets', () => {
  document.body.innerHTML = names.map(n => `<mo-${n}></mo-${n}>`).join('');
  for (const name of names) expect(customElements.get('mo-' + name), name).toBeDefined();
  expect(document.body.innerHTML).not.toMatch(/NaN|Infinity|<canvas|<img|<iframe/);
  expect(document.querySelectorAll('.usa-ac-content')).toHaveLength(14);
});
it('escapes supplied labels and filters update keys instead of creating executable markup or attributes', () => {
  document.body.innerHTML = '<mo-flight-status></mo-flight-status><mo-delivery-tracker></mo-delivery-tracker>';
  const el = document.querySelector('mo-flight-status')!;
  el.update({ origin: '<img src=x onerror=alert(1)>', from: '<svg/onload=1>', value: 150, onclick: 'alert(1)', style: 'display:none' });
  expect(el.textContent).toContain('<img src=x'); expect(el.querySelector('img')).toBeNull(); expect(el.hasAttribute('onclick')).toBe(false); expect(el.hasAttribute('style')).toBe(false);
  expect(el.querySelector<HTMLElement>('.usa-ac-route i')!.style.width).toBe('100%');
});
it('uses distinct gradient IDs and accepts an arbitrary history with invalid values discarded', () => {
  document.body.innerHTML = '<mo-glucose-sparkline values="4,NaN,8,Infinity,2"></mo-glucose-sparkline><mo-glucose-sparkline></mo-glucose-sparkline><mo-orbit-pass></mo-orbit-pass>';
  const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(document.querySelector('mo-glucose-sparkline')!.querySelectorAll('rect')).toHaveLength(3);
  expect(document.body.innerHTML).not.toMatch(/(?:x|y|height|width)="(?:NaN|Infinity)/);
  const route = document.createElement('mo-route-sparkline'); route.setAttribute('values', '1e308,-1e308,0'); document.body.append(route);
  expect(route.querySelector('polyline')!.getAttribute('points')).not.toMatch(/NaN|Infinity/);
});
it('clocks are opt-in, pause offscreen, resume without adding hidden time and complete once', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<mo-meter-countdown value="2"></mo-meter-countdown>';
  const el = document.querySelector('mo-meter-countdown')!, complete = vi.fn(); el.addEventListener('usa:complete', complete);
  fireAll([el], true); vi.advanceTimersByTime(2000); expect(el.value).toBe(2);
  el.play(); vi.advanceTimersByTime(1000); expect(el.value).toBe(1);
  fireAll([el], false); vi.advanceTimersByTime(5000); expect(el.value).toBe(1);
  fireAll([el], true); vi.advanceTimersByTime(1000); expect(el.value).toBe(0); expect(complete).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(3000); expect(complete).toHaveBeenCalledTimes(1); expect(el.hasAttribute('running')).toBe(false);
});
it('native timer actions preserve focus, respect disabled and reset to the first mounted value', () => {
  vi.useFakeTimers(); document.body.innerHTML = '<mo-coffee-timer value="18" duration="20"></mo-coffee-timer>';
  const el = document.querySelector('mo-coffee-timer')!, action = vi.fn(); el.addEventListener('usa:action', action); fireAll([el], true);
  const b = el.querySelector('button')!; b.focus(); b.click(); expect(el.hasAttribute('running')).toBe(true); expect(document.activeElement?.getAttribute('aria-label')).toBe('Stop timer');
  vi.advanceTimersByTime(1000); expect(el.value).toBe(19); expect(document.activeElement?.getAttribute('aria-label')).toBe('Stop timer');
  el.setAttribute('disabled', ''); el.querySelector('button')!.click(); expect(action).toHaveBeenCalledTimes(1);
  el.removeAttribute('disabled'); el.reset(); expect(el.value).toBe(18); expect(el.hasAttribute('running')).toBe(false);
});
it('disconnect clears clocks, observers and delegated actions; reconnect does not duplicate controls', () => {
  vi.useFakeTimers(); document.body.innerHTML = '<mo-workout-player value="10" running></mo-workout-player>';
  const el = document.querySelector('mo-workout-player')!, action = vi.fn(), old = el.querySelector('button')!;
  el.addEventListener('usa:action', action); fireAll([el], true); expect(vi.getTimerCount()).toBe(1);
  el.remove(); expect(vi.getTimerCount()).toBe(0); old.click(); expect(action).not.toHaveBeenCalled();
  document.body.append(el); fireAll([el], true); expect(el.querySelectorAll('button')).toHaveLength(3); expect(vi.getTimerCount()).toBe(1);
});
it('wall pauses for hover, focus and explicit pause without cloning interactive content', () => {
  document.body.innerHTML = '<mo-activity-wall><div data-column><mo-coffee-timer></mo-coffee-timer></div></mo-activity-wall>';
  const el = document.querySelector('mo-activity-wall')!; fireAll([el], true); expect(el.hasAttribute('data-wall-animate')).toBe(true);
  el.dispatchEvent(new MouseEvent('mouseenter')); expect(el.hasAttribute('data-wall-animate')).toBe(false);
  el.dispatchEvent(new MouseEvent('mouseleave')); expect(el.hasAttribute('data-wall-animate')).toBe(true);
  el.pause(); expect(el.paused).toBe(true); expect(el.hasAttribute('data-wall-animate')).toBe(false);
  el.play(); expect(el.querySelectorAll('button')).toHaveLength(1);
});
it('ornamental motion follows reduced motion while supplied values remain readable', () => {
  installMocks({ reducedMotion: true }); document.body.innerHTML = '<mo-vital-wave value="88" animated></mo-vital-wave><mo-activity-wall></mo-activity-wall>';
  const el = document.querySelector('mo-vital-wave')!, wall = document.querySelector('mo-activity-wall')!; fireAll([el, wall], true);
  expect(el.textContent).toContain('88'); expect(el.hasAttribute('data-activity-animate')).toBe(false); expect(wall.hasAttribute('data-wall-animate')).toBe(false);
});
