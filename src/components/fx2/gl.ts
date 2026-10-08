/**
 * 6.2 — tiny WebGL2 full-screen shader runner with a Canvas 2D fallback, shared
 * by the 6.x GPU effect packs. One canvas behind the element (aria-hidden,
 * pointer-transparent), renders only while visible and the tab is shown,
 * adaptive resolution, pointer uniform, and a static first frame under reduced
 * motion. No WebGL2 (or a lost context / compile error) → the Canvas 2D
 * `fallback` spec runs through `canvasBackground()` instead.
 * `el.dataset.usaBackend` tells which one is active: `webgl2` or `canvas`.
 */
import type { EffectContext } from '../fx/registry';
import { canvasBackground, hexRgb, noise2, type GenerativeSpec } from '../effects/generative';

export { hexRgb, noise2 };

/** GLSL shared by every shader: uniforms, hash, value noise, fbm. */
export const GLSL_HEAD = `#version 300 es
precision highp float;
uniform vec2 u_res;uniform float u_t;uniform vec3 u_c0,u_c1,u_c2;uniform vec2 u_ptr;uniform float u_speed,u_scale;
out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
`;
const VERT = `#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

export interface ShaderSpec {
  /** GLSL body of `main()`: `uv` (0–1), `p` (aspect-corrected, scaled), `t` (s × speed) are in scope; write `o`. */
  body: string;
  /** Canvas 2D fallback. */
  fallback: GenerativeSpec;
}

/** `true` when this browser can create a WebGL2 context (cached). */
let gl2: boolean | null = null;
export function supportsWebGL2(): boolean {
  if (gl2 !== null) return gl2;
  try {
    gl2 = typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2');
  } catch {
    gl2 = false;
  }
  return gl2;
}

function compile(gl: WebGL2RenderingContext, frag: string): WebGLProgram | null {
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const v = mk(gl.VERTEX_SHADER, VERT);
  const f = mk(gl.FRAGMENT_SHADER, frag);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.bindAttribLocation(p, 0, 'a');
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

const rgb = (c: string): [number, number, number] => hexRgb(c).map((v) => v / 255) as [number, number, number];

/**
 * Mount a shader background behind `el` (options: `colors` [3 hex], `speed`,
 * `scale`, `quality`, `backend` = `'auto' | 'webgl2' | 'canvas'`). Returns the cleanup.
 */
export function shaderBackground(el: HTMLElement, fx: EffectContext, spec: ShaderSpec, o: any): () => void {
  const fallback = () => {
    el.dataset.usaBackend = 'canvas';
    const stop = canvasBackground(el, fx, spec.fallback, o);
    return () => {
      stop();
      delete el.dataset.usaBackend;
    };
  };
  if (o.backend === 'canvas' || !supportsWebGL2()) return fallback();
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: false }) as WebGL2RenderingContext | null;
  const prog = gl && compile(gl, `${GLSL_HEAD}void main(){vec2 uv=gl_FragCoord.xy/u_res;vec2 p=uv*vec2(u_res.x/u_res.y,1.)*u_scale;float t=u_t*u_speed;${spec.body}}`);
  if (!gl || !prog) return fallback();
  el.dataset.usaBackend = 'webgl2';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('data-usa-fx-canvas', '');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;border-radius:inherit';
  const restore: [string, string][] = [];
  const set = (k: 'position' | 'isolation', v: string) => {
    restore.push([k, el.style[k]]);
    el.style[k] = v;
  };
  if (getComputedStyle(el).position === 'static') set('position', 'relative');
  set('isolation', 'isolate');
  el.prepend(canvas);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const cols: string[] = o.colors || [];
  ['u_c0', 'u_c1', 'u_c2'].forEach((u, i) => gl.uniform3fv(U(u), rgb(cols[i] || cols[0] || '#7c5cff')));
  gl.uniform1f(U('u_speed'), Number(o.speed) || 1);
  gl.uniform1f(U('u_scale'), Number(o.scale) || 3);
  const uRes = U('u_res');
  const uT = U('u_t');
  const uPtr = U('u_ptr');
  let ptr: [number, number] = [0.5, 0.5];
  let quality = Math.min(1, Math.max(0.3, Number(o.quality) || 0.75));
  let raf = 0;
  let visible = true;
  let slow = 0;
  let last = 0;
  const t0 = performance.now();
  const resize = () => {
    const r = el.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1) * quality;
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  const draw = (t: number) => {
    gl.uniform1f(uT, t);
    gl.uniform2f(uPtr, ptr[0], ptr[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const frame = (now: number) => {
    raf = 0;
    if (last && now - last > 34 && ++slow > 24 && quality > 0.3) {
      quality = Math.max(0.3, quality - 0.15);
      slow = 0;
      resize();
    }
    last = now;
    draw((now - t0) / 1000);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!raf && !fx.reduced) raf = requestAnimationFrame(frame);
  };
  resize();
  draw(fx.reduced ? 7 : 0);
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ptr = [(e.clientX - r.left) / Math.max(1, r.width), 1 - (e.clientY - r.top) / Math.max(1, r.height)];
  };
  el.addEventListener('pointermove', move);
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => (visible = es.some((e) => e.isIntersecting)) && start()) : null;
  io?.observe(el);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => (resize(), fx.reduced && draw(7))) : null;
  ro?.observe(el);
  const vis = () => !document.hidden && visible && start();
  document.addEventListener('visibilitychange', vis);
  let swapped: (() => void) | null = null;
  const lost = (e: Event) => {
    e.preventDefault();
    stop();
    swapped = fallback();
  };
  canvas.addEventListener('webglcontextlost', lost);
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    ro?.disconnect();
    el.removeEventListener('pointermove', move);
    document.removeEventListener('visibilitychange', vis);
    canvas.removeEventListener('webglcontextlost', lost);
    canvas.remove();
    for (const [k, v] of restore) el.style[k as 'position'] = v;
  };
  start();
  return () => {
    if (swapped) return swapped();
    stop();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    delete el.dataset.usaBackend;
  };
}

/**
 * Canvas 2D fallback for a scalar field: `color(x, y, t)` (x, y in 0–1)
 * returns `[r, g, b]` (0–255), sampled on a coarse grid and scaled up smoothly.
 */
export function fieldFallback(color: (x: number, y: number, t: number, o: any) => [number, number, number], cell = 8): GenerativeSpec {
  return {
    init: (w, h) => {
      const c = document.createElement('canvas');
      c.width = Math.max(2, Math.ceil(w / cell));
      c.height = Math.max(2, Math.ceil(h / cell));
      const x = c.getContext('2d');
      return { c, x, img: x?.createImageData(c.width, c.height) };
    },
    draw: ({ ctx, w, h, t, state, o }) => {
      const { c, x, img } = state;
      if (!x || !img) return;
      const d = img.data;
      for (let j = 0; j < c.height; j++)
        for (let i = 0; i < c.width; i++) {
          const [r, g, b] = color(i / c.width, 1 - j / c.height, t * (Number(o.speed) || 1), o);
          const k = (j * c.width + i) * 4;
          d[k] = r;
          d[k + 1] = g;
          d[k + 2] = b;
          d[k + 3] = 255;
        }
      x.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(c, 0, 0, w, h);
    },
  };
}

/** Linear blend of two `[r,g,b]` colors. */
export const mixRgb = (a: number[], b: number[], k: number): [number, number, number] => {
  const q = Math.min(1, Math.max(0, k));
  return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q, a[2] + (b[2] - a[2]) * q];
};
/** Smoothstep. */
export const sstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** fbm-like noise in 0–1 built on `noise2`. */
export const fbm2 = (x: number, y: number, t = 0): number => 0.5 + 0.35 * noise2(x, y, t) + 0.15 * noise2(x * 2.1 + 3, y * 2.1 - 1, t * 1.3);
