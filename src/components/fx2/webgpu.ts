/**
 * 7.0 — WebGPU backend for the shader backgrounds (`shaderBackground()`).
 *
 * Every 6.x shader is written once as a small GLSL `main()` body. 7.0 runs it
 * on **WebGPU** where the browser has it: `glslToWgsl()` translates the body
 * (types, constructors, literals, loops, uniforms) into a WGSL fragment
 * shader with the same noise helpers; a spec can also ship hand-written
 * `wgsl`. If WebGPU is missing, the adapter / device is refused, or the
 * shader does not compile, the effect falls back to **WebGL2**, then to the
 * Canvas 2D fallback — `el.dataset.usaBackend` says which one runs.
 */
import type { EffectContext } from '../fx/registry';
import { hexRgb } from '../effects/generative';

/** WGSL shared by every shader: uniforms, hash, value noise, fbm (mirrors `GLSL_HEAD`). */
export const WGSL_HEAD = `struct U{res:vec2f,ptr:vec2f,t:f32,speed:f32,scale:f32,pad:f32,c0:vec4f,c1:vec4f,c2:vec4f};
@group(0) @binding(0) var<uniform> u:U;
fn h(p:vec2f)->f32{return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}
fn n(p:vec2f)->f32{let i=floor(p);var f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2f(1.0,0.0)),f.x),mix(h(i+vec2f(0.0,1.0)),h(i+vec2f(1.0,1.0)),f.x),f.y);}
fn fbm(p0:vec2f)->f32{var v=0.0;var a=0.5;var p=p0;for(var k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2f(1.7,9.2);a*=0.5;}return v;}
@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f{var q=array<vec2f,3>(vec2f(-1.0,-1.0),vec2f(3.0,-1.0),vec2f(-1.0,3.0));return vec4f(q[i],0.0,1.0);}
`;

/**
 * Translate a GLSL `main()` body (the 6.x `ShaderSpec.body` dialect) to WGSL
 * statements. Throws on constructs it does not support (ternaries, `mod`,
 * `discard`, user functions) so the caller can fall back to WebGL2.
 */
export function glslToWgsl(body: string): string {
  if (/[?]|\bmod\s*\(|\bdiscard\b|\bstruct\b|\buniform\b|\bvoid\b/.test(body)) throw new Error('unsupported GLSL construct');
  let s = body;
  s = s.replace(/\bu_c([012])\b/g, 'u.c$1.xyz').replace(/\bu_ptr\b/g, 'u.ptr').replace(/\bu_res\b/g, 'u.res').replace(/\bu_t\b/g, 'u.t');
  s = s.replace(/for\s*\(\s*int\s+(\w+)\s*=/g, 'for(var $1:i32=');
  s = s.replace(/\bfloat\s+(\w+)\s*=/g, 'var $1:f32=');
  s = s.replace(/\bvec([234])\s+(\w+)\s*=/g, 'var $2:vec$1f=');
  s = s.replace(/\bint\s+(\w+)\s*=/g, 'var $1:i32=');
  s = s.replace(/\bvec([234])\s*\(/g, 'vec$1f(').replace(/\bfloat\s*\(/g, 'f32(').replace(/\bint\s*\(/g, 'i32(').replace(/\batan\s*\(([^(),]+),/g, 'atan2($1,');
  s = s.replace(/(\d)\.(?![\d\w])/g, '$1.0');
  s = s.replace(/(^|[^\w.])\.(\d)/g, '$10.$2');
  if (/\b(float|vec[234]|int|mat[234])\s+\w+\s*[,;]/.test(s)) throw new Error('unsupported declaration');
  return s;
}

/** The full WGSL module for a body. */
export const wgslModule = (body: string): string =>
  `${WGSL_HEAD}@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{var uv=vec2f(fc.x,u.res.y-fc.y)/u.res;var p=uv*vec2f(u.res.x/u.res.y,1.0)*u.scale;var t=u.t*u.speed;var o=vec4f(0.0,0.0,0.0,1.0);${body}return o;}`;

/** `true` when `navigator.gpu` exists (the adapter may still be refused). */
export const supportsWebGPU = (): boolean => typeof navigator !== 'undefined' && !!(navigator as Navigator & { gpu?: unknown }).gpu;

const rgb = (c: string): number[] => [...hexRgb(c).map((v) => v / 255), 1];

/**
 * Start a WebGPU shader background behind `el`. Resolves to its cleanup, or
 * `null` when WebGPU cannot run this shader (the caller falls back).
 */
export async function webgpuBackground(el: HTMLElement, fx: EffectContext, spec: { body: string; wgsl?: string }, o: any): Promise<(() => void) | null> {
  if (!supportsWebGPU()) return null;
  let code: string;
  try {
    code = wgslModule(spec.wgsl || glslToWgsl(spec.body));
  } catch {
    return null;
  }
  const gpu = (navigator as any).gpu;
  try {
    const adapter = await gpu.requestAdapter({ powerPreference: 'low-power' });
    if (!adapter) return null;
    const device = await adapter.requestDevice();
    const module = device.createShaderModule({ code });
    const info = await module.getCompilationInfo?.();
    if (info?.messages?.some((m: any) => m.type === 'error')) return (device.destroy?.(), null);
    if (!el.isConnected) return (device.destroy?.(), null);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('webgpu') as any;
    if (!ctx) return (device.destroy?.(), null);
    const format = gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'opaque' });
    device.pushErrorScope?.('validation');
    const pipeline = device.createRenderPipeline({ layout: 'auto', vertex: { module, entryPoint: 'vs' }, fragment: { module, entryPoint: 'fs', targets: [{ format }] }, primitive: { topology: 'triangle-list' } });
    const ubuf = device.createBuffer({ size: 80, usage: 0x40 | 0x8 /* UNIFORM | COPY_DST */ });
    const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
    const err = await device.popErrorScope?.();
    if (err) return (device.destroy?.(), null);
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
    el.dataset.usaBackend = 'webgpu';
    const cols: string[] = o.colors || [];
    const data = new Float32Array(20);
    data.set([Number(o.speed) || 1, Number(o.scale) || 3, 0], 5);
    [0, 1, 2].forEach((i) => data.set(rgb(cols[i] || cols[0] || '#7c5cff'), 8 + i * 4));
    let ptr: [number, number] = [0.5, 0.5];
    let quality = Math.min(1, Math.max(0.3, Number(o.quality) || 0.75));
    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1) * quality;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    const draw = (t: number) => {
      data.set([canvas.width, canvas.height, ptr[0], ptr[1], t], 0);
      device.queue.writeBuffer(ubuf, 0, data);
      const enc = device.createCommandEncoder();
      const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bind);
      pass.draw(3);
      pass.end();
      device.queue.submit([enc.finish()]);
    };
    let last = 0;
    let slow = 0;
    const frame = (now: number) => {
      raf = 0;
      if (last && now - last > 34 && ++slow > 24 && quality > 0.3) ((quality = Math.max(0.3, quality - 0.15)), (slow = 0), resize());
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
    start();
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      el.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', vis);
      canvas.remove();
      for (const [k, v] of restore) el.style[k as 'position'] = v;
      delete el.dataset.usaBackend;
      device.destroy?.();
    };
  } catch {
    return null;
  }
}
