/**
 * 6.2 — GPU effect pack (`motionary/components/fx-gpu`), registered through
 * `registerEffect()`:
 *
 * - WebGL2 shaders with a Canvas 2D fallback (kind `background`): `fluid`
 *   (domain-warped fluid that swirls around the pointer), `smoke`, `fire`,
 *   `ink` (ink blooming in water), `fireflies`.
 * - Canvas 2D particles (kind `background`): `sakura` (falling cherry
 *   petals), `leaves` (tumbling autumn leaves).
 * - `splash` (kind `click`): droplets + a ring burst from the pointer.
 *
 * Every background renders only while visible, lowers its resolution when
 * frames are slow, and draws one static frame under reduced motion.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';
import { canvasBackground, type GenerativeSpec } from '../effects/generative';
import { origin, spawn, rand, all } from '../effects/shared';
import { shaderBackground, fieldFallback, hexRgb, mixRgb, sstep, fbm2, type ShaderSpec } from './gl';

const shader = (name: string, description: string, colors: string[], spec: ShaderSpec, extra: Record<string, unknown> = {}): EffectDefinition => ({
  name,
  kind: 'background',
  description,
  reduced: 'run',
  defaults: { colors, speed: 1, scale: 3, quality: 0.75, backend: 'auto', ...extra },
  run: (el: HTMLElement, o: any, ctx: EffectContext) => {
    const stop = shaderBackground(el, ctx, spec, o);
    ctx.onCleanup(stop);
    return stop;
  },
});

const C = (o: any) => (o.colors as string[]).map(hexRgb);

export const GPU_FX: EffectDefinition[] = [
  shader('fluid', 'Domain-warped fluid colors that swirl around the pointer (WebGL2, Canvas 2D fallback).', ['#1b1446', '#7c5cff', '#22d3ee'], {
    body: 'vec2 q=vec2(fbm(p+t*.1),fbm(p+vec2(5.2,1.3)-t*.08));vec2 d=uv-u_ptr;q+=.5*exp(-dot(d,d)*14.)*vec2(sin(t*1.3),cos(t*1.1));float f=fbm(p+3.*q+t*.05);vec3 c=mix(u_c0,u_c1,clamp(f*1.7-.2,0.,1.));c=mix(c,u_c2,clamp(length(q)*1.1-.45,0.,1.));o=vec4(c,1.);',
    fallback: fieldFallback((x, y, t, o) => {
      const [a, b, c] = C(o);
      const q = fbm2(x * 3 + t * 0.1, y * 3);
      const f = fbm2(x * 3 + q * 2, y * 3 + q * 2, t * 0.3);
      return mixRgb(mixRgb(a, b, f * 1.7 - 0.2), c, q * 1.1 - 0.45);
    }),
  }),
  shader('smoke', 'Soft smoke rising and curling (WebGL2, Canvas 2D fallback).', ['#0f172a', '#cbd5e1', '#64748b'], {
    body: 'vec2 s=p;s.y-=t*.25;float f=fbm(s+fbm(s*1.5+t*.1));float a=smoothstep(.38,.92,f)*(1.05-uv.y*.55);o=vec4(mix(u_c0,mix(u_c2,u_c1,f),a),1.);',
    fallback: fieldFallback((x, y, t, o) => {
      const [bg, sm, ac] = C(o);
      const f = fbm2(x * 3, y * 3 - t * 0.25, t * 0.2);
      return mixRgb(bg, mixRgb(ac, sm, f), sstep(0.38, 0.92, f) * (1.05 - y * 0.55));
    }),
  }),
  shader('fire', 'Licking flames from the bottom edge (WebGL2, Canvas 2D fallback).', ['#140404', '#e2401b', '#fbbf24'], {
    body: 'vec2 s=p*vec2(1.,1.4);s.y-=t*.9;float f=fbm(s*1.6+fbm(s*2.+t*.3));float g=f*(1.3-uv.y)*1.7-.3;vec3 c=mix(u_c0,u_c1,smoothstep(0.,.4,g));c=mix(c,u_c2,smoothstep(.35,.72,g));c=mix(c,vec3(1.,.96,.82),smoothstep(.72,1.05,g));o=vec4(c,1.);',
    fallback: fieldFallback((x, y, t, o) => {
      const [a, b, c] = C(o);
      const g = fbm2(x * 4, y * 5 - t * 0.9, t) * (1.3 - y) * 1.7 - 0.3;
      return mixRgb(mixRgb(mixRgb(a, b, sstep(0, 0.4, g)), c, sstep(0.35, 0.72, g)), [255, 245, 210], sstep(0.72, 1.05, g));
    }, 6),
  }),
  shader('ink', 'Ink blooming and drifting in water on a paper background (WebGL2, Canvas 2D fallback).', ['#f6f1e7', '#1e1b4b', '#be185d'], {
    body: 'vec2 q=vec2(fbm(p*.8+t*.04),fbm(p*.8+vec2(3.1,7.7)+t*.05));float f=fbm(p*1.2+2.5*q);float b=smoothstep(.48,.74,f+.12*sin(t*.4));o=vec4(mix(u_c0,mix(u_c1,u_c2,clamp(q.x*1.4-.2,0.,1.)),b),1.);',
    fallback: fieldFallback((x, y, t, o) => {
      const [bg, i1, i2] = C(o);
      const q = fbm2(x * 2 + t * 0.04, y * 2);
      const f = fbm2(x * 3 + q * 2.5, y * 3 + q * 2.5, t * 0.1);
      return mixRgb(bg, mixRgb(i1, i2, q * 1.4 - 0.2), sstep(0.48, 0.74, f));
    }),
  }, { scale: 2.4 }),
  shader('fireflies', 'Glowing fireflies wandering and blinking at dusk (WebGL2, Canvas 2D fallback).', ['#06121f', '#facc15', '#a3e635'], {
    body: 'vec3 c=u_c0*(.55+.45*uv.y);float ar=u_res.x/u_res.y;for(int i=0;i<28;i++){float fi=float(i);vec2 b=vec2(h(vec2(fi,1.)),h(vec2(fi,2.)));vec2 pos=fract(b+.07*vec2(sin(t*.3+fi),cos(t*.23+fi*1.7)));vec2 d=(uv-pos)*vec2(ar,1.);float k=.5+.5*sin(t*(1.+h(vec2(fi,3.))*2.)+fi*2.1);c+=mix(u_c1,u_c2,h(vec2(fi,4.)))*k*.00055/(dot(d,d)+.0003);}o=vec4(min(c,vec3(1.)),1.);',
    fallback: {
      init: (w, h) => ({ f: Array.from({ length: 28 }, () => [Math.random(), Math.random(), Math.random() * 6, Math.random()]) }),
      draw: ({ ctx, w, h, t, state, o }) => {
        ctx.fillStyle = o.colors[0];
        ctx.fillRect(0, 0, w, h);
        for (const [bx, by, ph, hue] of state.f) {
          const x = ((bx + 0.07 * Math.sin(t * 0.3 + ph)) % 1) * w;
          const y = ((by + 0.07 * Math.cos(t * 0.23 + ph)) % 1) * h;
          const k = 0.5 + 0.5 * Math.sin(t * 2 + ph * 3);
          const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
          g.addColorStop(0, hue > 0.5 ? o.colors[1] : o.colors[2]);
          g.addColorStop(1, 'transparent');
          ctx.globalAlpha = 0.25 + k * 0.75;
          ctx.fillStyle = g;
          ctx.fillRect(x - 14, y - 14, 28, 28);
        }
        ctx.globalAlpha = 1;
      },
    },
  }),
];

interface Flake {
  x: number;
  y: number;
  r: number;
  a: number;
  va: number;
  vy: number;
  ph: number;
  c: string;
}
const fall = (draw: (ctx: CanvasRenderingContext2D, f: Flake) => void): GenerativeSpec => ({
  init: (w, h, o) => ({ f: Array.from({ length: o.count }, (): Flake => ({ x: Math.random() * w, y: Math.random() * h, r: rand(5, 11) * (o.size || 1), a: rand(0, 6.3), va: rand(-1.5, 1.5), vy: rand(18, 46), ph: rand(0, 6.3), c: o.colors[Math.floor(Math.random() * o.colors.length)] })), last: 0 }),
  draw: ({ ctx, w, h, t, state, o, quality }) => {
    const dt = state.last ? Math.min(0.05, t - state.last) : 0;
    state.last = t;
    ctx.clearRect(0, 0, w, h);
    const n = Math.max(4, Math.round(state.f.length * quality));
    for (let i = 0; i < n; i++) {
      const f: Flake = state.f[i];
      f.y += f.vy * dt * o.speed;
      f.x += (Math.sin(t * 1.2 + f.ph) * 22 + (o.wind || 0)) * dt * o.speed;
      f.a += f.va * dt * o.speed;
      if (f.y > h + 16) (f.y = -16), (f.x = Math.random() * w);
      if (f.x > w + 16) f.x = -16;
      if (f.x < -16) f.x = w + 16;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.a);
      ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(t * 1.7 + f.ph)));
      ctx.fillStyle = f.c;
      draw(ctx, f);
      ctx.restore();
    }
  },
});
const particles = (name: string, description: string, defaults: Record<string, unknown>, spec: GenerativeSpec): EffectDefinition => ({
  name,
  kind: 'background',
  description,
  reduced: 'run',
  defaults: { speed: 1, quality: 1, ...defaults },
  run: (el: HTMLElement, o: any, ctx: EffectContext) => {
    const stop = canvasBackground(el, ctx, spec, o);
    ctx.onCleanup(stop);
    return stop;
  },
});

GPU_FX.push(
  particles('sakura', 'Cherry-blossom petals drifting down, swaying and flipping (Canvas 2D).', { count: 46, colors: ['#ffc8dd', '#ffafcc', '#fde2e4', '#f9a8d4'], wind: 14 }, fall((ctx, f) => {
    ctx.beginPath();
    ctx.moveTo(0, -f.r);
    ctx.bezierCurveTo(f.r, -f.r, f.r * 0.9, f.r * 0.6, 0, f.r);
    ctx.bezierCurveTo(-f.r * 0.9, f.r * 0.6, -f.r, -f.r, 0, -f.r * 0.55);
    ctx.fill();
  })),
  particles('leaves', 'Autumn leaves tumbling down in the wind (Canvas 2D).', { count: 30, size: 1.4, colors: ['#ea580c', '#d97706', '#b45309', '#dc2626', '#ca8a04'], wind: 26 }, fall((ctx, f) => {
    ctx.beginPath();
    ctx.moveTo(0, -f.r);
    ctx.quadraticCurveTo(f.r * 0.9, -f.r * 0.2, 0, f.r);
    ctx.quadraticCurveTo(-f.r * 0.9, -f.r * 0.2, 0, -f.r);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -f.r * 0.8);
    ctx.lineTo(0, f.r * 1.25);
    ctx.stroke();
  }))
);

GPU_FX.push({
  name: 'splash',
  kind: 'click',
  description: 'A water splash from the pointer: a ring plus droplets that arc out and fall with gravity.',
  defaults: { color: '#38bdf8', count: 14 },
  run: (el: HTMLElement, o: any, ctx: EffectContext) => {
    const { x, y } = origin(el, ctx);
    if (ctx.reduced) return spawn(x - 12, y - 12, `width:24px;height:24px;border-radius:50%;background:${o.color};opacity:.5`, ctx, [{ opacity: 0.5 }, { opacity: 0 }], { duration: 300 });
    const anims: (Animation | null)[] = [
      spawn(x - 30, y - 30, `width:60px;height:60px;border-radius:50%;border:3px solid ${o.color}`, ctx, [{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' }),
    ];
    for (let i = 0; i < o.count; i++) {
      const ang = -Math.PI / 2 + rand(-1.15, 1.15);
      const v = rand(50, 110);
      const dx = Math.cos(ang) * v;
      const s = rand(4, 9);
      const peak = Math.sin(ang) * v;
      anims.push(spawn(x - s / 2, y - s / 2, `width:${s}px;height:${s * 1.25}px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:${o.color}`, ctx, [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px,${peak}px) scale(1)`, opacity: 1, offset: 0.45, easing: 'cubic-bezier(.3,0,.7,1)' },
        { transform: `translate(${dx}px,${peak + 90}px) scale(.6)`, opacity: 0 },
      ], { duration: rand(650, 900), easing: 'cubic-bezier(.15,.6,.4,1)' }));
    }
    return all(anims);
  },
});

/** Register the 6.2 GPU pack (idempotent). */
export function registerGpuEffects(): void {
  registerEffects(GPU_FX);
}
