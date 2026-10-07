import { vi } from 'vitest';
import { MockIO } from './setup';
import { configureComponents } from '../src/components/base';

/** WAAPI mock with the parts the components use (finished, onfinish, pause/play). */
export class MockAnim {
  onfinish: (() => void) | null = null;
  playState: AnimationPlayState = 'running';
  currentTime: number | null = 0;
  cancelled = false;
  private _resolve!: () => void;
  finished: Promise<MockAnim>;
  effect = {
    getComputedTiming: () => ({ progress: 0 }),
    getTiming: () => this.timing,
  };
  constructor(public el: Element, public keyframes: Keyframe[], public timing: KeyframeAnimationOptions) {
    this.finished = new Promise((r) => (this._resolve = () => r(this)));
  }
  finish() {
    this.playState = 'finished';
    this.onfinish?.();
    this._resolve();
  }
  cancel() {
    this.cancelled = true;
    this.playState = 'idle';
    this._resolve();
  }
  pause() {
    this.playState = 'paused';
  }
  play() {
    this.playState = 'running';
  }
}

export const anims: MockAnim[] = [];

export function installComponentMocks(opts: { reducedMotion?: boolean } = {}) {
  MockIO.instances = [];
  anims.length = 0;
  (globalThis as any).IntersectionObserver = MockIO;
  (Element.prototype as any).animate = function (kf: Keyframe[], timing: KeyframeAnimationOptions) {
    const a = new MockAnim(this, kf, timing);
    anims.push(a);
    return a;
  };
  (Element.prototype as any).getAnimations = function () {
    return anims.filter((a) => a.el === this && a.playState !== 'idle' && a.playState !== 'finished');
  };
  (globalThis as any).matchMedia = window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: (!!opts.reducedMotion && q.includes('reduce')) || q.includes('hover: hover'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as any;
  (HTMLCanvasElement.prototype as any).getContext = () => null; // jsdom has no canvas: silence its warning
  configureComponents({ reducedMotion: 'user', injectStyles: true, motionIntensity: 'normal' });
}

/** Finish every running mock animation (repeatedly, for chained ones). */
export async function finishAll() {
  for (let i = 0; i < 5; i++) {
    anims.filter((a) => a.playState === 'running').forEach((a) => a.finish());
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
  }
}

export const ioFor = (node: Element) => MockIO.instances.find((io) => io.targets.has(node));

/** Fire an intersection entry for `node` on whichever observer watches it. */
export function intersect(node: Element, visible = true) {
  const io = ioFor(node);
  if (!io) throw new Error('not observed');
  io.fire(node, visible);
}

export function mount<T extends HTMLElement = HTMLElement>(html: string): T {
  const wrap = document.createElement('div');
  wrap.innerHTML = html.trim();
  const node = wrap.firstElementChild as T;
  document.body.appendChild(node);
  return node;
}

export const tick = () => new Promise((r) => setTimeout(r, 0));
