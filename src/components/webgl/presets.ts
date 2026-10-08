/**
 * 4.8 — WebGL preset library on `glQuad()`: particle presets (`snow`,
 * `fireflies`, `stars`, `bokeh`, `rain` — usable as `<usa-shader preset>`),
 * chainable post-processing passes for images (`<usa-post-fx>`), one CSS
 * fallback per preset, and an adaptive quality governor (fps + battery).
 */
export const PARTICLE_PRESETS = ['snow', 'fireflies', 'stars', 'bokeh', 'rain'] as const;
export type ParticlePreset = (typeof PARTICLE_PRESETS)[number];

/** Post-processing passes: `vec3 fx(vec3 c, vec2 uv)` bodies, applied in order. `u_intensity` 0–1. */
export const POST_EFFECTS: Record<string, string> = {
  vignette: 'c*=mix(1.,smoothstep(.85,.25,length(uv-.5)),u_intensity);',
  grain: 'c+=(fract(sin(dot(uv*u_resolution+u_time,vec2(12.9898,78.233)))*43758.5453)-.5)*.18*u_intensity;',
  chromatic: 'float s=.008*u_intensity;c=vec3(texture2D(u_tex,uv+vec2(s,0.)).r,c.g,texture2D(u_tex,uv-vec2(s,0.)).b);',
  scanlines: 'c*=1.-.25*u_intensity*step(.5,fract(uv.y*u_resolution.y*.5));',
  crt: 'vec2 d=uv-.5;float r=dot(d,d);c*=1.-.6*u_intensity*r;c*=.92+.08*sin(uv.y*u_resolution.y*3.14159);c.r*=1.+.05*u_intensity;',
  bloom: 'vec3 b=vec3(0.);for(int i=0;i<8;i++){float a=float(i)*.785;b+=max(texture2D(u_tex,uv+vec2(cos(a),sin(a))*.012).rgb-.6,0.);}c+=b*.35*u_intensity;',
  pixelate: 'float px=mix(1.,48.,u_intensity);vec2 g=floor(uv*u_resolution/px)*px/u_resolution;c=texture2D(u_tex,g+.5*px/u_resolution).rgb;',
  duotone: 'float l=dot(c,vec3(.299,.587,.114));c=mix(c,mix(vec3(.12,.05,.35),vec3(1.,.55,.4),l),u_intensity);',
  glitch: 'float k=step(.97,fract(sin(floor(uv.y*24.)+floor(u_time*6.))*4375.5));c=mix(c,texture2D(u_tex,uv+vec2(k*.04*u_intensity,0.)).rgb,k);',
};
export type PostEffect = keyof typeof POST_EFFECTS;

/** One fragment shader running the passes in order over `u_tex` (pixel-sampling passes read the source). */
export function postFxShader(effects: string[]): string {
  const list = effects.filter((e) => POST_EFFECTS[e]);
  const body = list.map((e) => `{${POST_EFFECTS[e]}}`).join('');
  return `uniform float u_intensity;void main(){vec2 uv=v_uv;vec3 c=texture2D(u_tex,uv).rgb;${body}gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
}

/** The unified CSS fallback (no WebGL / reduced data): a still background or image filter per preset. */
export const GL_FALLBACKS: Record<string, string> = {
  gradient: 'linear-gradient(120deg,#6366f1,#ec4899 50%,#22d3ee)',
  plasma: 'conic-gradient(from 90deg,#f43f5e,#a855f7,#06b6d4,#f43f5e)',
  waves: 'linear-gradient(#0a0f26,#1e3a8a)',
  aurora: 'radial-gradient(120% 60% at 30% 40%,#10b98155,transparent),radial-gradient(100% 50% at 70% 50%,#8b5cf655,transparent),#05070f',
  snow: 'radial-gradient(2px 2px at 20% 30%,#fff,transparent),radial-gradient(2px 2px at 70% 60%,#fff,transparent),radial-gradient(1.5px 1.5px at 40% 80%,#fff,transparent),linear-gradient(#0d1428,#1f2a4d)',
  fireflies: 'radial-gradient(3px 3px at 25% 40%,#fde68a,transparent),radial-gradient(3px 3px at 65% 70%,#fde68a,transparent),#05090a',
  stars: 'radial-gradient(1px 1px at 10% 20%,#fff,transparent),radial-gradient(1px 1px at 80% 30%,#fff,transparent),radial-gradient(1.5px 1.5px at 50% 70%,#cfe0ff,transparent),#02020a',
  bokeh: 'radial-gradient(40px 40px at 30% 40%,#f472b633,transparent),radial-gradient(60px 60px at 70% 60%,#60a5fa33,transparent),#140820',
  rain: 'repeating-linear-gradient(100deg,#ffffff10 0 1px,transparent 1px 14px),linear-gradient(#0a0f1a,#1a2133)',
  // post-fx fallbacks are CSS filters on the <img>
  'post:duotone': 'grayscale(1) sepia(.6) hue-rotate(220deg) saturate(2)',
  'post:vignette': 'brightness(.95) contrast(1.05)',
  'post:crt': 'contrast(1.15) saturate(1.2)',
  'post:bloom': 'brightness(1.08) saturate(1.15)',
};

/** CSS fallback for a shader preset / post effect list. */
export function glFallbackCss(preset: string, post = false): string {
  if (post) return preset.split(/\s+/).map((e) => GL_FALLBACKS[`post:${e}`]).filter(Boolean).join(' ');
  return GL_FALLBACKS[preset] || GL_FALLBACKS.gradient;
}

export interface GLGovernorOptions {
  /** Below this fps quality drops (default 40). */
  minFps?: number;
  /** Frame-rate cap on battery saver / low battery (default 30). */
  saverFps?: number;
}

export interface GLGovernor {
  /** Feed a frame time (ms); returns `true` when this frame should render. */
  tick(t: number): boolean;
  /** Current resolution scale (1 → 0.5 → 0.35). */
  readonly scale: number;
  /** Measured fps over the last second. */
  readonly fps: number;
  /** Battery saver / low battery: renders at `saverFps` and scale ≤ 0.6. */
  saver: boolean;
  /** Called when `scale` changes (resize the canvas). */
  onScale?: (scale: number) => void;
}

/**
 * Adaptive quality for GL loops: measures fps, steps the resolution scale
 * down (1 → 0.5 → 0.35) after two slow seconds and back up after five good
 * ones, and caps the frame rate in battery-saver mode. Pure — feed it times.
 */
export function glGovernor(options: GLGovernorOptions = {}): GLGovernor {
  const { minFps = 40, saverFps = 30 } = options;
  const STEPS = [1, 0.5, 0.35];
  let step = 0;
  let frames = 0;
  let winStart = -1;
  let last = -Infinity;
  let slow = 0;
  let good = 0;
  let fps = 60;
  const g: GLGovernor = {
    saver: false,
    get scale() {
      return Math.min(STEPS[step], g.saver ? 0.6 : 1);
    },
    get fps() {
      return fps;
    },
    tick(t: number) {
      if (winStart < 0) winStart = t;
      if (g.saver && t - last < 1000 / saverFps - 1) return false;
      last = t;
      frames++;
      if (t - winStart >= 1000) {
        fps = Math.round((frames * 1000) / (t - winStart));
        frames = 0;
        winStart = t;
        const before = g.scale;
        if (fps < minFps && !g.saver) {
          good = 0;
          if (++slow >= 2 && step < STEPS.length - 1) ((step++), (slow = 0));
        } else {
          slow = 0;
          if (++good >= 5 && step > 0) ((step--), (good = 0));
        }
        if (g.scale !== before) g.onScale?.(g.scale);
      }
      return true;
    },
  };
  return g;
}

/** Watch the Battery Status API (where available) and Save-Data; calls `cb(true)` in saver conditions. Returns a stop function. */
export function watchPowerSaver(cb: (saver: boolean) => void): () => void {
  let stopped = false;
  const nav = (typeof navigator !== 'undefined' ? navigator : {}) as any;
  const saveData = !!nav.connection?.saveData;
  if (saveData) cb(true);
  if (typeof nav.getBattery !== 'function') return () => undefined;
  let battery: any = null;
  const update = () => !stopped && cb(saveData || (!!battery && !battery.charging && battery.level <= 0.2));
  nav.getBattery().then((b: any) => {
    battery = b;
    update();
    b.addEventListener?.('levelchange', update);
    b.addEventListener?.('chargingchange', update);
  }, () => undefined);
  return () => {
    stopped = true;
    battery?.removeEventListener?.('levelchange', update);
    battery?.removeEventListener?.('chargingchange', update);
  };
}
