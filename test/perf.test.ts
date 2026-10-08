import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { raf, caf, configureComponents, getMotionIntensity } from '../src/components/base';
import {
  onFrame,
  schedulerStats,
  activeAnimations,
  setAnimationBudget,
  animationBudget,
  autoDegrade,
  loadCategoryStyles,
  onDemandStyles,
  categoryOf,
  loadedStyles,
} from '../src/components/perf';
import { defineComponents } from '../src/components';

describe('shared rAF scheduler (4.5)', () => {
  let queued: FrameRequestCallback[] = [];
  beforeEach(() => {
    queued = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => queued.push(cb));
  });
  afterEach(() => vi.unstubAllGlobals());
  const frame = (t: number) => queued.splice(0).forEach((cb) => cb(t));

  it('batches every callback of a frame into one native requestAnimationFrame', () => {
    const seen: number[] = [];
    raf(() => seen.push(1));
    raf(() => seen.push(2));
    const id = raf(() => seen.push(3));
    caf(id);
    expect(queued.length).toBe(1);
    frame(16);
    expect(seen).toEqual([1, 2]);
    expect(schedulerStats().pending).toBe(0);
  });

  it('one throwing callback does not starve the others (the error is rethrown)', () => {
    const seen: string[] = [];
    raf(() => {
      throw new Error('boom');
    });
    raf(() => seen.push('ok'));
    expect(() => frame(32)).toThrow('boom');
    expect(seen).toEqual(['ok']);
  });

  it('onFrame runs every frame with a delta until stopped', () => {
    const dts: number[] = [];
    const stop = onFrame((_t, dt) => dts.push(Math.round(dt)));
    frame(1000);
    frame(1016);
    frame(1050);
    stop();
    frame(1066);
    expect(dts.slice(1)).toEqual([16, 34]);
    expect(schedulerStats().loops).toBe(0);
  });

  it('autoDegrade steps motion down on low fps and restores it', () => {
    configureComponents({ motionIntensity: 'normal' });
    const changes: any[] = [];
    const stop = autoDegrade({ minFps: 45, sample: 100, patience: 2, recovery: 2, onChange: (s) => changes.push(s) });
    let t = 0;
    const run = (ms: number, step: number) => {
      for (let x = 0; x < ms; x += step) frame((t += step));
    };
    run(400, 50); // 20 fps
    expect(getMotionIntensity()).toBe('low');
    expect(animationBudget()).toBe(20);
    run(600, 16);
    expect(getMotionIntensity()).toBe('normal');
    expect(animationBudget()).toBe(Infinity);
    expect(changes.map((c) => [c.degraded, c.reason])).toEqual([
      [true, 'fps'],
      [false, ''],
    ]);
    stop();
  });
});

describe('animation budget', () => {
  beforeEach(() => {
    installComponentMocks();
    document.body.innerHTML = '';
    defineComponents(['reveal']);
  });
  afterEach(() => setAnimationBudget(Infinity));

  it('counts running animations and lands extra ones on their final frame', async () => {
    const el = mount<any>('<usa-reveal><p>x</p></usa-reveal>');
    const base = activeAnimations();
    setAnimationBudget(base + 1);
    const a = el.motion(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
    expect(a).toBeTruthy();
    expect(activeAnimations()).toBe(base + 1);
    const b = el.motion(el, [{ opacity: 0 }, { opacity: 0.5 }], { duration: 100 });
    expect(b).toBeNull();
    expect(el.style.opacity).toBe('0.5');
    a.finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(activeAnimations()).toBe(base);
    expect(anims.length).toBeGreaterThan(0);
  });
});

describe('on-demand CSS', () => {
  beforeEach(() => {
    installComponentMocks();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('maps tags to categories and loads each stylesheet once', () => {
    expect(categoryOf('usa-card')).toBe('cards');
    expect(categoryOf('my-thing')).toBeUndefined();
    const l = loadCategoryStyles('ui', 'https://cdn.example/dist');
    expect(l!.href).toBe('https://cdn.example/dist/components/ui.css');
    expect(loadCategoryStyles('ui', 'https://cdn.example/dist')).toBeNull();
    expect(loadedStyles()).toContain('ui');
  });

  it('onDemandStyles loads a category when its first element connects', () => {
    defineComponents(['feedback']);
    const undo = onDemandStyles('/dist/');
    expect(document.querySelector('link[data-usa-css="feedback"]')).toBeNull();
    mount('<usa-spinner></usa-spinner>');
    mount('<usa-progress value="3"></usa-progress>');
    expect(document.querySelectorAll('link[data-usa-css="feedback"]').length).toBe(1);
    expect(document.querySelector<HTMLLinkElement>('link[data-usa-css="feedback"]')!.getAttribute('href')).toBe('/dist/components/feedback.css');
    undo();
  });

  it('the lite entry exposes the same API and a style base', async () => {
    const lite = await import('../src/components/lite');
    expect(typeof lite.defineComponents).toBe('function');
    expect(typeof lite.autoDegrade).toBe('function');
    expect(typeof lite.STYLE_BASE).toBe("string");
  });
});
