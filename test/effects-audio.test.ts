import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, bindEffect, getEffect, registerEffect } from '../src/components/fx';
import { registerAllEffects, registerAudioEffects, AUDIO_FX, EFFECT_PACKS, createBeatDetector, enableAudio, disableAudio, getAudio, onBeat, bindBeat, defineAudio } from '../src/components/effects';

/** A recording 2D-context stub (jsdom has no canvas). */
function stubCanvas() {
  const calls: string[] = [];
  const ctx: any = new Proxy({}, {
    get: (t: any, k: string) => (k in t ? t[k] : (..._a: unknown[]) => void calls.push(k)),
    set: (t: any, k: string, v: unknown) => ((t[k] = v), true),
  });
  (HTMLCanvasElement.prototype as any).getContext = () => ctx;
  return calls;
}

/** Fake Web Audio: an analyser whose spectrum / waveform we control. */
let level = 0; // 0–255 written into every frequency bin
const connections: string[] = [];
class FakeNode {
  constructor(public kind: string) {}
  connect(n: any) {
    connections.push(`${this.kind}->${n.kind}`);
  }
  disconnect() {
    connections.push(`${this.kind}-x`);
  }
}
class FakeAnalyser extends FakeNode {
  fftSize = 512;
  smoothingTimeConstant = 0.8;
  constructor() {
    super('analyser');
  }
  get frequencyBinCount() {
    return this.fftSize / 2;
  }
  getByteFrequencyData(a: Uint8Array) {
    a.fill(level);
  }
  getByteTimeDomainData(a: Uint8Array) {
    for (let i = 0; i < a.length; i++) a[i] = 128 + (i % 2 ? 1 : -1) * Math.round(level / 2);
  }
}
class FakeAudioContext {
  state = 'suspended';
  destination = new FakeNode('destination');
  resume = vi.fn(async () => void (this.state = 'running'));
  createAnalyser = () => new FakeAnalyser();
  createMediaElementSource = vi.fn(() => new FakeNode('media'));
  createMediaStreamSource = vi.fn(() => new FakeNode('stream'));
}

let rafs: FrameRequestCallback[] = [];
const tick = (t: number) => rafs.splice(0).forEach((cb) => cb(t));
let trackStop: ReturnType<typeof vi.fn>;

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  rafs = [];
  level = 0;
  connections.length = 0;
  trackStop = vi.fn();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => rafs.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal('AudioContext', FakeAudioContext);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: trackStop }] })) },
  });
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => {
  disableAudio();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

describe('5.6 beat detector', () => {
  it('fires on energy spikes above the recent average, respecting floor and cooldown', () => {
    const d = createBeatDetector({ threshold: 1.4, cooldown: 200 });
    let t = 0;
    for (let i = 0; i < 20; i++) expect(d(0.2, (t += 16))).toBe(false); // steady → no beat
    expect(d(0.6, (t += 16))).toBe(true); // spike
    expect(d(0.9, (t += 16))).toBe(false); // within cooldown
    for (let i = 0; i < 30; i++) d(0.2, (t += 16));
    expect(d(0.7, (t += 16))).toBe(true);
    const quiet = createBeatDetector({ floor: 0.1 });
    for (let i = 0; i < 20; i++) quiet(0.01, i * 16);
    expect(quiet(0.05, 400)).toBe(false); // spike, but under the floor
  });

  it('needs some history before the first beat', () => {
    const d = createBeatDetector();
    expect(d(1, 0)).toBe(false);
  });
});

describe('5.6 enableAudio', () => {
  it('analyses an <audio> element: resumes the context, routes media → analyser → speakers, plays it', async () => {
    const audio = mount<HTMLAudioElement>('<audio id="track"></audio>');
    const play = vi.fn(async () => undefined);
    Object.defineProperty(audio, 'paused', { value: true });
    (audio as any).play = play;
    const a = await enableAudio('#track');
    expect((a.context as any).resume).toHaveBeenCalled();
    expect(connections).toContain('media->analyser');
    expect(connections).toContain('analyser->destination');
    expect(play).toHaveBeenCalled();
    expect(getAudio()).toBe(a);
    level = 255;
    const s = a.sample();
    expect(s.bass).toBeCloseTo(1);
    expect(s.level).toBeGreaterThan(0.5);
    expect(s.freq.length).toBe(256);
    a.stop();
    expect(getAudio()).toBeNull();
    expect(connections.at(-1)).toBe('media->destination'); // stays audible
    // the media source node is reused (it can only be created once per element)
    await enableAudio(audio);
    expect((getAudio()!.context as any).createMediaElementSource).toHaveBeenCalledTimes(1);
  });

  it('the microphone is never routed to the speakers and is released on stop', async () => {
    const a = await enableAudio('mic');
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(connections).toEqual(['stream->analyser']);
    a.stop();
    expect(trackStop).toHaveBeenCalled();
  });

  it('rejects an unknown source', async () => {
    await expect(enableAudio('#nope')).rejects.toThrow(/no audio source/);
  });

  it('sets --usa-audio-level / --usa-audio-bass while running (0 under reduced motion)', async () => {
    await enableAudio('mic');
    level = 200;
    tick(16);
    expect(Number(document.documentElement.style.getPropertyValue('--usa-audio-bass'))).toBeGreaterThan(0.7);
    configureComponents({ reducedMotion: 'reduce' });
    tick(32);
    expect(document.documentElement.style.getPropertyValue('--usa-audio-bass')).toBe('0.000');
  });
});

describe('5.6 onBeat / bindBeat', () => {
  async function pump(frames: number[], start = 0) {
    let t = start;
    for (const v of frames) {
      level = v;
      tick((t += 20));
    }
  }

  it('onBeat reports beats from the running source', async () => {
    await enableAudio('mic');
    const beats: number[] = [];
    const off = onBeat((d) => beats.push(d.energy));
    await pump([...Array(12).fill(40), 220]);
    expect(beats.length).toBe(1);
    expect(beats[0]).toBeGreaterThan(0.8);
    off();
    await pump([...Array(12).fill(40), 220], 1000);
    expect(beats.length).toBe(1);
  });

  it('bindBeat plays any registered effect on each beat, but not under reduced motion', async () => {
    const run = vi.fn();
    registerEffect({ name: 'test-beat-fx', kind: 'attention', run });
    const el = mount<HTMLElement>('<div></div>');
    await enableAudio('mic');
    const off = bindBeat(el, 'test-beat-fx', { scale: 2 });
    await pump([...Array(12).fill(40), 220]);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][1]).toMatchObject({ scale: 2 });
    configureComponents({ reducedMotion: 'reduce' });
    await pump([...Array(20).fill(40), 220], 2000);
    expect(run).toHaveBeenCalledTimes(1);
    off();
  });
});

describe('5.6 sound-reactive backgrounds', () => {
  it('registers three background effects that are skipped under reduced motion', () => {
    registerAudioEffects();
    expect(AUDIO_FX.map((d) => d.name)).toEqual(['spectrum-bars', 'pulse-ring', 'wave-ring']);
    for (const d of AUDIO_FX) {
      expect(getEffect(d.name)).toBe(d);
      expect(d.kind).toBe('background');
      expect(d.reduced).toBe('skip');
    }
    expect(EFFECT_PACKS.audio).toBe(AUDIO_FX);
  });

  it.each(AUDIO_FX.map((d) => d.name))('%s idles without audio, reacts once enabled, cleans up', async (name) => {
    const calls = stubCanvas();
    const el = mount<HTMLElement>('<div></div>');
    (el as any).getBoundingClientRect = () => ({ top: 0, left: 0, width: 160, height: 90, right: 160, bottom: 90 });
    const off = bindEffect(el, name, { trigger: 'load' });
    expect(el.querySelector('canvas')!.getAttribute('aria-hidden')).toBe('true');
    expect(calls.length).toBeGreaterThan(0);
    await enableAudio('mic');
    level = 180;
    const n = calls.length;
    tick(performance.now() + 16);
    expect(calls.length).toBeGreaterThan(n);
    off();
    expect(el.querySelector('canvas')).toBeNull();
  });

  it('reduced motion: nothing is mounted', () => {
    configureComponents({ reducedMotion: 'reduce' });
    stubCanvas();
    const el = mount<HTMLElement>('<div></div>');
    bindEffect(el, 'spectrum-bars', { trigger: 'load' });
    expect(el.querySelector('canvas')).toBeNull();
  });
});

describe('5.6 <usa-audio>', () => {
  it('renders a toggle button, enables the source on click, plays [data-usa-beat] effects, emits usa:beat', async () => {
    defineAudio();
    const run = vi.fn();
    registerEffect({ name: 'test-el-beat', kind: 'attention', run });
    const host = mount<HTMLElement>('<usa-audio source="mic"><div data-usa-beat="test-el-beat" data-usa-beat-options=\'{"k":1}\'></div></usa-audio>');
    const btn = host.querySelector<HTMLButtonElement>('[data-audio-toggle]')!;
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    const beats: unknown[] = [];
    host.addEventListener('usa:beat', (e) => beats.push((e as CustomEvent).detail));
    await (host as any).toggle();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect((host as any).active).toBe(true);
    let t = 0;
    for (const v of [...Array(12).fill(40), 220]) {
      level = v;
      tick((t += 20));
    }
    expect(beats.length).toBe(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][1]).toMatchObject({ k: 1 });
    await (host as any).toggle();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(getAudio()).toBeNull();
    expect(trackStop).toHaveBeenCalled();
  });

  it('uses your own [data-audio-toggle] and flags errors', async () => {
    defineAudio();
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(new Error('denied'));
    const host = mount<HTMLElement>('<usa-audio><button data-audio-toggle>Mine</button></usa-audio>');
    expect(host.querySelectorAll('button').length).toBe(1);
    const errs: unknown[] = [];
    host.addEventListener('usa:audio-error', (e) => errs.push(e));
    await (host as any).toggle();
    expect(host.hasAttribute('data-audio-error')).toBe(true);
    expect(errs.length).toBe(1);
    host.remove();
  });
});
