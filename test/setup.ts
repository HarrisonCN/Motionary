import { vi } from 'vitest';

/** Minimal controllable IntersectionObserver mock. */
export class MockIO {
  static instances: MockIO[] = [];
  targets = new Set<Element>();
  disconnected = false;
  constructor(public callback: IntersectionObserverCallback, public options: IntersectionObserverInit = {}) {
    MockIO.instances.push(this);
  }
  observe(el: Element) { this.targets.add(el); }
  unobserve(el: Element) { this.targets.delete(el); }
  disconnect() { this.targets.clear(); this.disconnected = true; }
  takeRecords() { return []; }
  /** Fire an entry for `el` if this observer is watching it. */
  fire(el: Element, isIntersecting: boolean, ratio = isIntersecting ? 1 : 0) {
    if (!this.targets.has(el)) return false;
    this.callback([{ target: el, isIntersecting, intersectionRatio: ratio } as any], this as any);
    return true;
  }
}

export function fireAll(els: Element[], isIntersecting: boolean, ratio?: number) {
  // Batch per observer, like the browser does
  MockIO.instances.forEach((io) => {
    const watched = els.filter((el) => io.targets.has(el));
    if (watched.length) {
      io.callback(
        watched.map((target) => ({ target, isIntersecting, intersectionRatio: ratio ?? (isIntersecting ? 1 : 0) }) as any),
        io as any
      );
    }
  });
}

export class MockAnimation {
  onfinish: (() => void) | null = null;
  cancelled = false;
  committed = false;
  constructor(public el: Element, public keyframes: Keyframe[], public timing: KeyframeAnimationOptions) {}
  cancel() { this.cancelled = true; }
  commitStyles() { this.committed = true; }
  finish() { this.onfinish?.(); }
}

export const animations: MockAnimation[] = [];

export function installMocks(opts: { reducedMotion?: boolean } = {}) {
  MockIO.instances = [];
  animations.length = 0;
  (globalThis as any).IntersectionObserver = MockIO;
  (Element.prototype as any).animate = function (kf: Keyframe[], timing: KeyframeAnimationOptions) {
    const a = new MockAnimation(this, kf, timing);
    animations.push(a);
    return a;
  };
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: !!opts.reducedMotion && q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as any;
}
