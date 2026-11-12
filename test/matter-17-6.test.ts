import { beforeAll, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { defineWidgets } from '../src/components/widgets';
import { configureComponents } from '../src/components/base';
import { createMatterEngine, reactionGrid, springResponse, cubicResponse, type MatterKind } from '../src/components/matter/engine';
import { MATTER_FX, registerMatterPack } from '../src/components/fx2/matter';
import { bindEffect, playEffect } from '../src/components/fx/registry';
import { installMocks, fireAll, MockIO } from './setup';

const names = ['gravity-well', 'liquid-metal', 'reaction-field', 'ink-flow', 'fluid-type', 'magnetic-field', 'elastic-mesh', 'spring-lab', 'bezier-lab', 'text-loupe', 'revision-reveal', 'hold-action', 'scrub-number'];
let frames: Map<number, FrameRequestCallback>, id = 0, reduced = false, mediaListeners: Set<() => void>, numbers: number[];
const flush = (now: number) => { const pending = [...frames]; frames.clear(); pending.forEach(([, callback]) => callback(now)); };
function context(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const c: any = { canvas, measureText: () => ({ width: 350 }), getImageData: () => ({ data: new Uint8ClampedArray(560 * 340 * 4).fill(255) }) };
  for (const name of ['save', 'restore', 'clearRect', 'scale', 'setTransform', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'fillText']) c[name] = (...args: unknown[]) => { numbers.push(...args.filter(a => typeof a === 'number') as number[]); };
  return c;
}
beforeAll(() => { defineWidgets('17.6'); registerMatterPack(); });
beforeEach(() => {
  installMocks(); configureComponents({ reducedMotion: 'user', motionSensitivity: 'full' }); frames = new Map(); numbers = []; mediaListeners = new Set(); reduced = false;
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => { frames.set(++id, fn); return id; }); vi.stubGlobal('cancelAnimationFrame', (i: number) => frames.delete(i));
  vi.stubGlobal('matchMedia', () => ({ get matches() { return reduced; }, addEventListener: (_: string, fn: () => void) => mediaListeners.add(fn), removeEventListener: (_: string, fn: () => void) => mediaListeners.delete(fn) }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) { return context(this); } as any);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
});
afterEach(() => { document.body.replaceChildren(); flush(performance.now() + 10000); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('registers thirteen independent mo names, mounts static by default and reconnects without duplicated controls', () => {
  document.body.innerHTML = names.map(n => `<mo-${n}></mo-${n}>`).join('');
  for (const n of names) expect(customElements.get('mo-' + n), n).toBeDefined();
  expect(document.querySelectorAll('canvas')).toHaveLength(7); expect(frames.size).toBe(0);
  const el = document.querySelector('mo-gravity-well')!, buttons = el.querySelectorAll('button').length; el.remove(); document.body.append(el); expect(el.querySelectorAll('button')).toHaveLength(buttons);
});
it('spring responses satisfy the analytic critical case and settle correctly with damping', () => {
  expect(springResponse(0, 100, 20, 1)).toBeCloseTo(0); expect(springResponse(.1, 100, 20, 1)).toBeCloseTo(1 - 2 / Math.E);
  expect(springResponse(5, 180, 12, 1)).toBeCloseTo(1, 7); expect(springResponse(.25, 180, 3, 1)).toBeGreaterThan(1);
  for (const k of [1, 100, 800]) for (const d of [0, 20, 100]) expect(Number.isFinite(springResponse(2, k, d, .1))).toBe(true);
});
it('CSS timing inverts x before sampling y', () => {
  expect(cubicResponse(.5, .25, 0, .75, 0)).toBeCloseTo(.125, 7);
  expect(cubicResponse(.5, 0, 0, 1, 1)).toBeCloseTo(.5, 7);
  expect(cubicResponse(.3, .8, 0, 1, 1)).toBeLessThan(.1);
});
it('Gray–Scott chemistry is seeded, bounded, evolves and supports painting or erasing', () => {
  const a = reactionGrid(30, 20, 7), b = reactionGrid(30, 20, 7); const first = [...a.values];
  for (let i = 0; i < 30; i++) { a.step(); b.step(); }
  expect([...a.values]).toEqual([...b.values]); expect([...a.values]).not.toEqual(first);
  expect([...a.values].every(v => Number.isFinite(v) && v >= 0 && v <= 1)).toBe(true);
  a.paint(.5, .5); expect(a.values[10 * 30 + 15]).toBeCloseTo(.9); a.paint(.5, .5, true); expect(a.values[10 * 30 + 15]).toBe(0);
});
it('all seven rendering algorithms keep finite geometry with extreme supplied values', () => {
  const canvas = document.createElement('canvas'), ctx = context(canvas);
  for (const kind of ['gravity', 'metal', 'reaction', 'ink', 'fluid', 'magnetic', 'mesh'] as MatterKind[]) {
    const engine = createMatterEngine(kind, { seed: Infinity, count: -1e300, fill: NaN, strength: 1e308, text: '<svg/onload=1>' });
    engine.draw(ctx, 560, 340, Infinity, 1e300, { x: NaN, y: Infinity, pressed: true, active: true });
  }
  expect(numbers.length).toBeGreaterThan(100); expect(numbers.every(Number.isFinite)).toBe(true);
});
it('canvas motion suspends offscreen, on pause and live reduced motion; disconnect releases frames and observers', () => {
  document.body.innerHTML = '<mo-gravity-well animated></mo-gravity-well>'; const el = document.querySelector('mo-gravity-well')!;
  fireAll([el], true); expect(frames.size).toBe(1); flush(16); expect(frames.size).toBe(1);
  fireAll([el], false); flush(32); expect(frames.size).toBe(0); fireAll([el], true); expect(frames.size).toBe(1);
  el.pause(); flush(48); expect(frames.size).toBe(0); el.play(); expect(frames.size).toBe(1);
  reduced = true; mediaListeners.forEach(fn => fn()); flush(64); expect(frames.size).toBe(0);
  el.remove(); expect(frames.size).toBe(0); expect(MockIO.instances.every(io => io.disconnected)).toBe(true); expect(mediaListeners.size).toBe(0);
});
it('touch activation has a keyboard exit and update cannot create handlers or style attributes', () => {
  document.body.innerHTML = '<mo-liquid-metal></mo-liquid-metal>'; const el = document.querySelector('mo-liquid-metal')!, canvas = el.querySelector('canvas')!;
  el.activate(); expect(document.activeElement).toBe(canvas); expect(el.querySelector('[data-engaged]')).not.toBeNull();
  canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); expect(el.querySelector('[data-engaged]')).toBeNull(); expect(document.activeElement?.textContent).toBe('Interact');
  el.update({ onclick: 'alert(1)', style: 'display:none', label: '<img src=x>' }); expect(el.hasAttribute('onclick')).toBe(false); expect(el.hasAttribute('style')).toBe(false); expect(el.querySelector('img')).toBeNull();
});
it('curve editing preserves native focus and clamps invalid parameters', () => {
  document.body.innerHTML = '<mo-bezier-lab></mo-bezier-lab>'; const el = document.querySelector('mo-bezier-lab')!, input = el.querySelector<HTMLInputElement>('[data-param=x1]')!;
  input.focus(); input.value = '.81'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(document.activeElement).toBe(input); expect(el.params.x1).toBe(.81);
  el.update({ x1: 300, x2: 'NaN', duration: -5 }); expect(el.params.x1).toBe(1); expect(el.params.x2).toBe(0); expect(el.params.duration).toBe(100); expect(el.querySelector('[data-curve]')!.getAttribute('d')).not.toMatch(/NaN|Infinity/);
  el.reset(); expect(el.params.x1).toBe(.32);
});
it('loupe and revisions preserve safe text and expose bounded reveal progress', () => {
  document.body.innerHTML = '<mo-text-loupe></mo-text-loupe><mo-revision-reveal></mo-revision-reveal>';
  const loupe = document.querySelector('mo-text-loupe')!, revision = document.querySelector('mo-revision-reveal')!;
  loupe.update({ text: '<img src=x onerror=1>' }); loupe.focusAt(5, -2); expect(loupe.querySelector('img')).toBeNull(); expect(loupe.textContent).toContain('<img src=x'); expect(loupe.querySelector<HTMLElement>('.usa-matter-text')!.style.getPropertyValue('--mx')).toBe('100%');
  revision.value = Infinity; expect(revision.value).toBe(50); revision.value = 200; expect(revision.value).toBe(100); expect(revision.querySelector<HTMLInputElement>('input')!.value).toBe('100');
});
it('holding is cancellable, confirms once after the full duration, and resets', () => {
  vi.useFakeTimers(); document.body.innerHTML = '<mo-hold-action duration="400"></mo-hold-action>'; const el = document.querySelector('mo-hold-action')!, button = el.querySelector('button')!, confirm = vi.fn(), cancel = vi.fn(); el.addEventListener('usa:confirm', confirm); el.addEventListener('usa:cancel', cancel);
  button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })); vi.advanceTimersByTime(100); button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true })); vi.advanceTimersByTime(1000); expect(confirm).not.toHaveBeenCalled(); expect(cancel).toHaveBeenCalledTimes(1);
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); vi.advanceTimersByTime(400); expect(confirm).toHaveBeenCalledTimes(1); expect(el.confirmed).toBe(true); button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true })); expect(cancel).toHaveBeenCalledTimes(1);
  el.reset(); expect(el.confirmed).toBe(false); expect(el.value).toBe(0);
});
it('disabled or disconnected holds cannot finish later', () => {
  vi.useFakeTimers(); document.body.innerHTML = '<mo-hold-action duration="400"></mo-hold-action>'; const el = document.querySelector('mo-hold-action')!, button = el.querySelector('button')!, confirm = vi.fn(); el.addEventListener('usa:confirm', confirm);
  button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })); el.setAttribute('disabled', ''); vi.advanceTimersByTime(1000); expect(confirm).not.toHaveBeenCalled(); expect(button.disabled).toBe(true);
  el.removeAttribute('disabled'); button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })); el.remove(); expect(vi.getTimerCount()).toBe(0); vi.advanceTimersByTime(1000); expect(confirm).not.toHaveBeenCalled();
});
it('scrub number supports keyboard, bounded steps, editable values and safe updates', () => {
  document.body.innerHTML = '<mo-scrub-number min="1" max="2" step=".1" value="1.1"></mo-scrub-number>'; const el = document.querySelector('mo-scrub-number')!, input = el.querySelector('input')!;
  input.focus(); input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })); expect(el.value).toBe(1.2); expect(document.activeElement).toBe(input);
  el.stepUp(100); expect(el.value).toBe(2); el.stepDown(100); expect(el.value).toBe(1); el.update({ value: 1.5, onclick: 'bad' }); expect(el.value).toBe(1.5); expect(el.hasAttribute('onclick')).toBe(false); el.reset(); expect(el.value).toBe(1.1);
  input.value = '1.55'; input.dispatchEvent(new Event('input', { bubbles: true })); expect(input.value).toBe('1.55'); expect(el.value).toBe(1.6); input.dispatchEvent(new Event('change', { bubbles: true })); expect(input.value).toBe('1.6');
  input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); expect(input.value).toBe('1.6');
});
it('six finite effects preserve content, positioning and focus when unbound', async () => {
  expect(MATTER_FX).toHaveLength(6);
  for (const effect of MATTER_FX) {
    const button = document.createElement('button'); button.textContent = 'A real button'; button.style.position = 'static'; document.body.append(button); button.focus();
    const off = bindEffect(button, effect.name, { trigger: 'load' }); expect(button.querySelector('canvas')).not.toBeNull(); off(); expect(button.querySelector('canvas')).toBeNull(); expect(button.textContent).toBe('A real button'); expect(button.style.position).toBe('static'); expect(document.activeElement).toBe(button); button.remove();
  }
  flush(100); expect(frames.size).toBe(0);
});
it('one-shot effects resolve and remove themselves, including live motion preference changes', async () => {
  const button = document.createElement('button'); document.body.append(button);
  const done = playEffect(button, 'dust-vortex', { duration: 200 }); flush(16); flush(300); await done; expect(button.querySelector('canvas')).toBeNull(); expect(frames.size).toBe(0);
  const off = bindEffect(button, 'chemical-bloom', { trigger: 'load' }); reduced = true; mediaListeners.forEach(fn => fn()); expect(button.querySelector('canvas')).toBeNull(); off(); flush(350); expect(frames.size).toBe(0);
});
it('removing an effect target resolves its playback and releases observers without waiting for a frame', async () => {
  const button = document.createElement('button'); document.body.append(button);
  const done = playEffect(button, 'mercury-morph'); button.remove(); await done; flush(400);
  expect(button.querySelector('canvas')).toBeNull(); expect(mediaListeners.size).toBe(0); expect(frames.size).toBe(0);
});
