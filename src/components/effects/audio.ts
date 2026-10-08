/**
 * 5.6 — sound-reactive effects (Web Audio).
 *
 * - `enableAudio(input)` — start analysing the microphone (`'mic'`), an
 *   `<audio>` / `<video>` element (or a selector for one) or a `MediaStream`.
 *   Browsers only allow an `AudioContext` to start inside a user gesture, so
 *   call it from a click handler (or use `<usa-audio>`, which renders the
 *   toggle button for you).
 * - Background effects (kind `background`, Canvas 2D through
 *   `canvasBackground()`): `spectrum-bars`, `pulse-ring`, `wave-ring`. Before
 *   audio is enabled they idle gently.
 * - Beat detection: `createBeatDetector()` (pure: energy → beat?), `onBeat(cb)`
 *   and `bindBeat(el, effect, options)`, which plays any registered effect on
 *   every beat. `<usa-audio>` does the same for `[data-usa-beat="effect"]`
 *   children and emits `usa-beat`.
 * - While audio runs, `--usa-audio-level` and `--usa-audio-bass` (0–1) are set
 *   on `<html>` for CSS-driven reactions.
 *
 * Reduced motion: the visual effects are skipped, beats play no effects and
 * the CSS variables stay at 0 — audio itself keeps playing.
 */
import type { EffectDefinition } from '../fx/registry';
import { playEffect } from '../fx/registry';
import { defineElement, prefersReducedMotion, type UsaElement } from '../base';
import { canvasBackground, hexRgb, type GenerativeSpec } from './generative';
import { PALETTE } from './shared';

export type AudioInput = 'mic' | HTMLMediaElement | MediaStream | string;

export interface AudioSample {
  /** Overall loudness (RMS of the waveform), 0–1. */
  level: number;
  /** Low-frequency energy (first ~8 % of the spectrum), 0–1. */
  bass: number;
  /** Frequency bins, 0–255 each. */
  freq: Uint8Array;
  /** Time-domain waveform, 0–255 (128 = silence). */
  wave: Uint8Array;
}

export interface AudioReactive {
  readonly context: AudioContext;
  readonly analyser: AnalyserNode;
  /** Read the analyser now. */
  sample(): AudioSample;
  /** Stop analysing (media keeps playing; the microphone is released). */
  stop(): void;
}

export interface BeatOptions {
  /** A beat is energy above `threshold` × the recent average (default 1.35). */
  threshold?: number;
  /** Minimum ms between beats (default 250). */
  cooldown?: number;
  /** Frames of history for the average (default 43 ≈ 0.7 s). */
  history?: number;
  /** Ignore energy below this floor, 0–1 (default 0.08). */
  floor?: number;
}

let actx: AudioContext | null = null;
let current: AudioReactive | null = null;
const mediaSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

/** The running analyser, if `enableAudio()` was called. */
export const getAudio = (): AudioReactive | null => current;

function audioContext(): AudioContext {
  const AC = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  if (!AC) throw new Error('[use-scroll-animate] Web Audio is not available');
  if (!actx || actx.state === 'closed') actx = new AC() as AudioContext;
  return actx;
}

/**
 * Start analysing `input` and make it the source of every sound-reactive
 * effect. Call from a user gesture. Replaces a previous source.
 */
export async function enableAudio(input: AudioInput = 'mic', opts: { fftSize?: number; smoothing?: number } = {}): Promise<AudioReactive> {
  current?.stop();
  const ac = audioContext();
  if (ac.state === 'suspended') await ac.resume().catch(() => undefined);
  const analyser = ac.createAnalyser();
  analyser.fftSize = opts.fftSize || 512;
  analyser.smoothingTimeConstant = opts.smoothing ?? 0.8;
  let src: AudioNode;
  let release = () => {};
  const media = typeof input === 'string' && input !== 'mic' ? document.querySelector<HTMLMediaElement>(input) : input;
  if (media === 'mic') {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    src = ac.createMediaStreamSource(stream);
    src.connect(analyser); // never to the speakers: no feedback
    release = () => stream.getTracks().forEach((t) => t.stop());
  } else if (media && typeof (media as HTMLMediaElement).play === 'function') {
    const m = media as HTMLMediaElement;
    let node = mediaSources.get(m);
    if (!node) mediaSources.set(m, (node = ac.createMediaElementSource(m)));
    try {
      node.disconnect();
    } catch {
      /* not connected */
    }
    src = node;
    src.connect(analyser);
    analyser.connect(ac.destination);
    release = () => {
      try {
        node!.disconnect();
      } catch {
        /* already */
      }
      node!.connect(ac.destination); // keep the media audible
    };
    if (m.paused) await m.play()?.catch?.(() => undefined);
  } else if (media && typeof (media as MediaStream).getTracks === 'function') {
    src = ac.createMediaStreamSource(media as MediaStream);
    src.connect(analyser);
  } else throw new Error(`[use-scroll-animate] enableAudio: no audio source for ${String(input)}`);
  const freq = new Uint8Array(analyser.frequencyBinCount);
  const wave = new Uint8Array(analyser.fftSize);
  const self: AudioReactive = {
    context: ac,
    analyser,
    sample: () => {
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(wave);
      let sq = 0;
      for (let i = 0; i < wave.length; i++) sq += ((wave[i] - 128) / 128) ** 2;
      const n = Math.max(1, Math.round(freq.length * 0.08));
      let b = 0;
      for (let i = 0; i < n; i++) b += freq[i];
      return { level: Math.min(1, Math.sqrt(sq / wave.length) * 2), bass: b / n / 255, freq, wave };
    },
    stop: () => {
      if (current === self) {
        current = null;
        if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
        raf = 0;
      }
      try {
        src.disconnect();
        analyser.disconnect();
      } catch {
        /* already */
      }
      release();
      setVars(0, 0);
    },
  };
  current = self;
  kick();
  return self;
}

/** Stop the current audio source (if any). */
export function disableAudio(): void {
  current?.stop();
}

/** A pure beat detector: feed it energy (0–1) and a timestamp per frame; it answers "beat?". */
export function createBeatDetector(o: BeatOptions = {}): (energy: number, now: number) => boolean {
  const { threshold = 1.35, cooldown = 250, history = 43, floor = 0.08 } = o;
  const hist: number[] = [];
  let last = -Infinity;
  return (energy, now) => {
    const avg = hist.length ? hist.reduce((a, b) => a + b, 0) / hist.length : energy;
    const ready = hist.length >= 8;
    hist.push(energy);
    if (hist.length > history) hist.shift();
    if (ready && energy > floor && energy > avg * threshold && now - last >= cooldown) {
      last = now;
      return true;
    }
    return false;
  };
}

type BeatListener = { detect: (e: number, t: number) => boolean; cb: (detail: { energy: number; time: number }) => void };
const listeners = new Set<BeatListener>();
let raf = 0;

function setVars(level: number, bass: number): void {
  if (typeof document === 'undefined') return;
  const s = document.documentElement.style;
  s.setProperty('--usa-audio-level', level.toFixed(3));
  s.setProperty('--usa-audio-bass', bass.toFixed(3));
}

function loop(now: number): void {
  raf = 0;
  if (!current) return;
  const { level, bass } = current.sample();
  const reduced = prefersReducedMotion();
  setVars(reduced ? 0 : level, reduced ? 0 : bass);
  for (const l of Array.from(listeners)) if (l.detect(bass, now)) l.cb({ energy: bass, time: now });
  kick();
}

function kick(): void {
  if (!raf && current && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(loop);
}

/** Call `cb` on every detected beat of the current audio source. Returns an unsubscribe. */
export function onBeat(cb: (detail: { energy: number; time: number }) => void, o: BeatOptions = {}): () => void {
  const l: BeatListener = { detect: createBeatDetector(o), cb };
  listeners.add(l);
  kick();
  return () => void listeners.delete(l);
}

/** Play the registered effect `name` on `el` at every beat (not under reduced motion). Returns an unbind. */
export function bindBeat(el: HTMLElement, name: string, options: Record<string, unknown> & BeatOptions = {}): () => void {
  const { threshold, cooldown, history, floor, ...fx } = options;
  return onBeat(() => {
    if (!prefersReducedMotion()) playEffect(el, name, fx).catch(() => undefined);
  }, { threshold, cooldown, history, floor } as BeatOptions);
}

// --- visual effects ----------------------------------------------------------

/** The current sample, or a gentle synthetic one while no audio is enabled. */
function read(t: number, bins: number): AudioSample & { idle: boolean } {
  if (current) return { ...current.sample(), idle: false };
  const freq = new Uint8Array(bins);
  const wave = new Uint8Array(bins * 2);
  for (let i = 0; i < bins; i++) freq[i] = 70 + 50 * Math.sin(t * 2 + i * 0.35) * Math.cos(t * 0.7 + i * 0.11) * (1 - i / bins);
  for (let i = 0; i < wave.length; i++) wave[i] = 128 + 22 * Math.sin(t * 3 + i * 0.12);
  return { level: 0.25 + 0.1 * Math.sin(t * 2), bass: 0.35 + 0.2 * Math.sin(t * 2.4), freq, wave, idle: true };
}

const audioFx = (name: string, description: string, defaults: Record<string, unknown>, spec: GenerativeSpec): EffectDefinition => ({
  name,
  kind: 'background',
  description,
  reduced: 'skip',
  defaults: { colors: PALETTE, background: '#0b0d12', speed: 1, quality: 1, ...defaults },
  run: (el, o: any, ctx) => canvasBackground(el, ctx, spec, o),
});

export const AUDIO_FX: EffectDefinition[] = [
  audioFx('spectrum-bars', 'Frequency bars dance to the audio (mirror them with `mirror: true`).', { bars: 48, gap: 2, mirror: false }, {
    draw: ({ ctx, w, h, t, o }) => {
      ctx.fillStyle = o.background;
      ctx.fillRect(0, 0, w, h);
      const s = read(t, o.bars);
      const per = Math.max(1, Math.floor((s.freq.length * 0.7) / o.bars));
      const bw = w / o.bars;
      for (let i = 0; i < o.bars; i++) {
        let v = 0;
        for (let k = 0; k < per; k++) v += s.freq[Math.min(s.freq.length - 1, i * per + k)];
        const bh = (v / per / 255) * h * (o.mirror ? 0.5 : 0.9);
        ctx.fillStyle = o.colors[i % o.colors.length];
        ctx.fillRect(i * bw + o.gap / 2, o.mirror ? h / 2 - bh : h - bh, Math.max(1, bw - o.gap), o.mirror ? bh * 2 : bh);
      }
    },
  }),
  audioFx('pulse-ring', 'Glowing rings pulse with the bass.', { rings: 3, color: '#7c5cff' }, {
    draw: ({ ctx, w, h, t, o }) => {
      ctx.fillStyle = o.background;
      ctx.fillRect(0, 0, w, h);
      const s = read(t, 32);
      const [r, g, b] = hexRgb(o.color);
      const base = Math.min(w, h) * 0.18;
      for (let i = 0; i < o.rings; i++) {
        const rad = base * (1 + i * 0.55) * (1 + s.bass * 0.6);
        ctx.strokeStyle = `rgba(${r},${g},${b},${(0.9 - i * 0.25) * (0.4 + s.level)})`;
        ctx.lineWidth = 3 + s.bass * 10 - i;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  }),
  audioFx('wave-ring', 'The live waveform wrapped into a circle.', { color: '#22d3ee', amplitude: 0.35 }, {
    draw: ({ ctx, w, h, t, o }) => {
      ctx.fillStyle = o.background;
      ctx.fillRect(0, 0, w, h);
      const s = read(t, 64);
      const n = s.wave.length;
      const base = Math.min(w, h) * 0.28;
      ctx.strokeStyle = o.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rad = base * (1 + ((s.wave[i % n] - 128) / 128) * o.amplitude * 2);
        const x = w / 2 + Math.cos(a) * rad;
        const y = h / 2 + Math.sin(a) * rad;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    },
  }),
];

// --- <usa-audio> -----------------------------------------------------------

export interface UsaAudioElement extends UsaElement {
  /** `true` while this element's audio source is being analysed. */
  readonly active: boolean;
  /** Start (from a user gesture) or stop analysing. */
  toggle(): Promise<void>;
}

/**
 * `<usa-audio source="#track | mic" label="…">` — a toggle button (yours, as
 * `[data-audio-toggle]`, or one it renders) that enables the audio source on
 * click; children with `data-usa-beat="effect"` play that effect on every
 * beat (`data-usa-beat-options` JSON; `threshold` / `cooldown` attributes).
 * Emits `usa-beat` and `usa-audio-error`.
 */
export function defineAudio(tag = 'usa-audio'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAudio extends Base {
        static get observedAttributes(): string[] {
          return ['source'];
        }
        active = false;
        private audio: AudioReactive | null = null;
        private off: (() => void) | null = null;
        private button(): HTMLButtonElement {
          let b = this.querySelector<HTMLButtonElement>('[data-audio-toggle]');
          if (!b) {
            b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('data-audio-toggle', '');
            b.textContent = this.str('label', '🔊 Enable sound-reactive effects');
            this.prepend(b);
            this.onCleanup(() => b!.remove());
          }
          return b;
        }
        async toggle(): Promise<void> {
          const b = this.button();
          if (this.active) return this.stop();
          try {
            this.audio = await enableAudio(this.str('source', 'mic'));
            this.active = true;
            this.removeAttribute('data-audio-error');
            b.setAttribute('aria-pressed', 'true');
            this.off = onBeat((d) => {
              this.dispatchEvent(new CustomEvent('usa-beat', { detail: d, bubbles: true }));
              if (prefersReducedMotion()) return;
              this.querySelectorAll<HTMLElement>('[data-usa-beat]').forEach((el) => {
                let opts = {};
                try {
                  opts = JSON.parse(el.dataset.usaBeatOptions || '{}') || {};
                } catch {
                  /* ignore bad JSON */
                }
                playEffect(el, el.dataset.usaBeat || 'pulse', opts).catch(() => undefined);
              });
            }, { threshold: this.num('threshold', 1.35), cooldown: this.num('cooldown', 250) });
          } catch (err) {
            this.setAttribute('data-audio-error', '');
            this.dispatchEvent(new CustomEvent('usa-audio-error', { detail: { error: err }, bubbles: true }));
          }
        }
        private stop(): void {
          this.off?.();
          this.off = null;
          if (this.audio && current === this.audio) this.audio.stop();
          this.audio = null;
          this.active = false;
          this.querySelector('[data-audio-toggle]')?.setAttribute('aria-pressed', 'false');
        }
        mount(): void {
          const b = this.button();
          b.setAttribute('aria-pressed', 'false');
          this.listen(b, 'click', () => void this.toggle());
          this.onCleanup(() => this.stop());
        }
      },
    { id: 'usa-audio', text: 'usa-audio{display:block}usa-audio[data-audio-error] [data-audio-toggle]{outline:2px solid #ff5c8a}' }
  );
}
