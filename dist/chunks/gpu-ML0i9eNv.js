import { registerEffects } from './registry-CYojuxi5.js';
import { h as hexRgb, c as canvasBackground, n as noise2 } from './generative-2LhxG5BJ.js';
import { b as origin, s as spawn, a as all, r as rand } from './shared-CkKHWrtJ.js';

/** WGSL shared by every shader: uniforms, hash, value noise, fbm (mirrors `GLSL_HEAD`). */
const WGSL_HEAD = `struct U{res:vec2f,ptr:vec2f,t:f32,speed:f32,scale:f32,pad:f32,c0:vec4f,c1:vec4f,c2:vec4f};
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
function glslToWgsl(body) {
    if (/[?]|\bmod\s*\(|\bdiscard\b|\bstruct\b|\buniform\b|\bvoid\b/.test(body))
        throw new Error('unsupported GLSL construct');
    let s = body;
    s = s.replace(/\bu_c([012])\b/g, 'u.c$1.xyz').replace(/\bu_ptr\b/g, 'u.ptr').replace(/\bu_res\b/g, 'u.res').replace(/\bu_t\b/g, 'u.t');
    s = s.replace(/for\s*\(\s*int\s+(\w+)\s*=/g, 'for(var $1:i32=');
    s = s.replace(/\bfloat\s+(\w+)\s*=/g, 'var $1:f32=');
    s = s.replace(/\bvec([234])\s+(\w+)\s*=/g, 'var $2:vec$1f=');
    s = s.replace(/\bint\s+(\w+)\s*=/g, 'var $1:i32=');
    s = s.replace(/\bvec([234])\s*\(/g, 'vec$1f(').replace(/\bfloat\s*\(/g, 'f32(').replace(/\bint\s*\(/g, 'i32(').replace(/\batan\s*\(([^(),]+),/g, 'atan2($1,');
    s = s.replace(/(\d)\.(?![\d\w])/g, '$1.0');
    s = s.replace(/(^|[^\w.])\.(\d)/g, '$10.$2');
    if (/\b(float|vec[234]|int|mat[234])\s+\w+\s*[,;]/.test(s))
        throw new Error('unsupported declaration');
    return s;
}
/** The full WGSL module for a body. */
const wgslModule = (body) => `${WGSL_HEAD}@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{var uv=vec2f(fc.x,u.res.y-fc.y)/u.res;var p=uv*vec2f(u.res.x/u.res.y,1.0)*u.scale;var t=u.t*u.speed;var o=vec4f(0.0,0.0,0.0,1.0);${body}return o;}`;
/** `true` when `navigator.gpu` exists (the adapter may still be refused). */
const supportsWebGPU = () => typeof navigator !== 'undefined' && !!navigator.gpu;
const rgb$1 = (c) => [...hexRgb(c).map((v) => v / 255), 1];
/**
 * Start a WebGPU shader background behind `el`. Resolves to its cleanup, or
 * `null` when WebGPU cannot run this shader (the caller falls back).
 */
async function webgpuBackground(el, fx, spec, o) {
    if (!supportsWebGPU())
        return null;
    let code;
    try {
        code = wgslModule(spec.wgsl || glslToWgsl(spec.body));
    }
    catch {
        return null;
    }
    const gpu = navigator.gpu;
    try {
        const adapter = await gpu.requestAdapter({ powerPreference: 'low-power' });
        if (!adapter)
            return null;
        const device = await adapter.requestDevice();
        const module = device.createShaderModule({ code });
        const info = await module.getCompilationInfo?.();
        if (info?.messages?.some((m) => m.type === 'error'))
            return (device.destroy?.(), null);
        if (!el.isConnected)
            return (device.destroy?.(), null);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('webgpu');
        if (!ctx)
            return (device.destroy?.(), null);
        const format = gpu.getPreferredCanvasFormat();
        ctx.configure({ device, format, alphaMode: 'opaque' });
        device.pushErrorScope?.('validation');
        const pipeline = device.createRenderPipeline({ layout: 'auto', vertex: { module, entryPoint: 'vs' }, fragment: { module, entryPoint: 'fs', targets: [{ format }] }, primitive: { topology: 'triangle-list' } });
        const ubuf = device.createBuffer({ size: 80, usage: 0x40 | 0x8 /* UNIFORM | COPY_DST */ });
        const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
        const err = await device.popErrorScope?.();
        if (err)
            return (device.destroy?.(), null);
        canvas.setAttribute('aria-hidden', 'true');
        canvas.setAttribute('data-usa-fx-canvas', '');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;border-radius:inherit';
        const restore = [];
        const set = (k, v) => {
            restore.push([k, el.style[k]]);
            el.style[k] = v;
        };
        if (getComputedStyle(el).position === 'static')
            set('position', 'relative');
        set('isolation', 'isolate');
        el.prepend(canvas);
        el.dataset.usaBackend = 'webgpu';
        const cols = o.colors || [];
        const data = new Float32Array(20);
        data.set([Number(o.speed) || 1, Number(o.scale) || 3, 0], 5);
        [0, 1, 2].forEach((i) => data.set(rgb$1(cols[i] || cols[0] || '#7c5cff'), 8 + i * 4));
        let ptr = [0.5, 0.5];
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
        const draw = (t) => {
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
        const frame = (now) => {
            raf = 0;
            if (last && now - last > 34 && ++slow > 24 && quality > 0.3)
                ((quality = Math.max(0.3, quality - 0.15)), (slow = 0), resize());
            last = now;
            draw((now - t0) / 1000);
            if (visible && !document.hidden)
                raf = requestAnimationFrame(frame);
        };
        const start = () => {
            if (!raf && !fx.reduced)
                raf = requestAnimationFrame(frame);
        };
        resize();
        draw(fx.reduced ? 7 : 0);
        const move = (e) => {
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
            for (const [k, v] of restore)
                el.style[k] = v;
            delete el.dataset.usaBackend;
            device.destroy?.();
        };
    }
    catch {
        return null;
    }
}

/** GLSL shared by every shader: uniforms, hash, value noise, fbm. */
const GLSL_HEAD = `#version 300 es
precision highp float;
uniform vec2 u_res;uniform float u_t;uniform vec3 u_c0,u_c1,u_c2;uniform vec2 u_ptr;uniform float u_speed,u_scale;
out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
`;
const VERT = `#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
/** `true` when this browser can create a WebGL2 context (cached). */
let gl2 = null;
function supportsWebGL2() {
    if (gl2 !== null)
        return gl2;
    try {
        gl2 = typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2');
    }
    catch {
        gl2 = false;
    }
    return gl2;
}
function compile(gl, frag) {
    const mk = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const v = mk(gl.VERTEX_SHADER, VERT);
    const f = mk(gl.FRAGMENT_SHADER, frag);
    if (!v || !f)
        return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}
const rgb = (c) => hexRgb(c).map((v) => v / 255);
/**
 * Mount a shader background behind `el` (options: `colors` [3 hex], `speed`,
 * `scale`, `quality`, `backend` = `'auto' | 'webgpu' | 'webgl2' | 'canvas'`).
 * 7.0: `auto` tries WebGPU first, then WebGL2, then Canvas 2D
 * (`el.dataset.usaBackend` names the one running). Returns the cleanup.
 */
function shaderBackground(el, fx, spec, o) {
    const want = o.backend || 'auto';
    if ((want === 'auto' || want === 'webgpu') && supportsWebGPU()) {
        let stop = null;
        let dead = false;
        webgpuBackground(el, fx, spec, o).then((s) => {
            if (dead)
                return s?.();
            stop = s || webglBackground(el, fx, spec, o);
        });
        return () => {
            dead = true;
            stop?.();
        };
    }
    return webglBackground(el, fx, spec, o);
}
function webglBackground(el, fx, spec, o) {
    const fallback = () => {
        el.dataset.usaBackend = 'canvas';
        const stop = canvasBackground(el, fx, spec.fallback, o);
        return () => {
            stop();
            delete el.dataset.usaBackend;
        };
    };
    if (o.backend === 'canvas' || !supportsWebGL2())
        return fallback();
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: false });
    const prog = gl && compile(gl, `${GLSL_HEAD}void main(){vec2 uv=gl_FragCoord.xy/u_res;vec2 p=uv*vec2(u_res.x/u_res.y,1.)*u_scale;float t=u_t*u_speed;${spec.body}}`);
    if (!gl || !prog)
        return fallback();
    el.dataset.usaBackend = 'webgl2';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-usa-fx-canvas', '');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;border-radius:inherit';
    const restore = [];
    const set = (k, v) => {
        restore.push([k, el.style[k]]);
        el.style[k] = v;
    };
    if (getComputedStyle(el).position === 'static')
        set('position', 'relative');
    set('isolation', 'isolate');
    el.prepend(canvas);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const cols = o.colors || [];
    ['u_c0', 'u_c1', 'u_c2'].forEach((u, i) => gl.uniform3fv(U(u), rgb(cols[i] || cols[0] || '#7c5cff')));
    gl.uniform1f(U('u_speed'), Number(o.speed) || 1);
    gl.uniform1f(U('u_scale'), Number(o.scale) || 3);
    const uRes = U('u_res');
    const uT = U('u_t');
    const uPtr = U('u_ptr');
    let ptr = [0.5, 0.5];
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
    const draw = (t) => {
        gl.uniform1f(uT, t);
        gl.uniform2f(uPtr, ptr[0], ptr[1]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const frame = (now) => {
        raf = 0;
        if (last && now - last > 34 && ++slow > 24 && quality > 0.3) {
            quality = Math.max(0.3, quality - 0.15);
            slow = 0;
            resize();
        }
        last = now;
        draw((now - t0) / 1000);
        if (visible && !document.hidden)
            raf = requestAnimationFrame(frame);
    };
    const start = () => {
        if (!raf && !fx.reduced)
            raf = requestAnimationFrame(frame);
    };
    resize();
    draw(fx.reduced ? 7 : 0);
    const move = (e) => {
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
    let swapped = null;
    const lost = (e) => {
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
        for (const [k, v] of restore)
            el.style[k] = v;
    };
    start();
    return () => {
        if (swapped)
            return swapped();
        stop();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        delete el.dataset.usaBackend;
    };
}
/**
 * Canvas 2D fallback for a scalar field: `color(x, y, t)` (x, y in 0–1)
 * returns `[r, g, b]` (0–255), sampled on a coarse grid and scaled up smoothly.
 */
function fieldFallback(color, cell = 8) {
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
            if (!x || !img)
                return;
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
const mixRgb = (a, b, k) => {
    const q = Math.min(1, Math.max(0, k));
    return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q, a[2] + (b[2] - a[2]) * q];
};
/** Smoothstep. */
const sstep = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
/** fbm-like noise in 0–1 built on `noise2`. */
const fbm2 = (x, y, t = 0) => 0.5 + 0.35 * noise2(x, y, t) + 0.15 * noise2(x * 2.1 + 3, y * 2.1 - 1, t * 1.3);

const shader = (name, description, colors, spec, extra = {}) => ({
    name,
    kind: 'background',
    description,
    reduced: 'run',
    defaults: { colors, speed: 1, scale: 3, quality: 0.75, backend: 'auto', ...extra },
    run: (el, o, ctx) => {
        const stop = shaderBackground(el, ctx, spec, o);
        ctx.onCleanup(stop);
        return stop;
    },
});
const C = (o) => o.colors.map(hexRgb);
const GPU_FX = [
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
const fall = (draw) => ({
    init: (w, h, o) => ({ f: Array.from({ length: o.count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: rand(5, 11) * (o.size || 1), a: rand(0, 6.3), va: rand(-1.5, 1.5), vy: rand(18, 46), ph: rand(0, 6.3), c: o.colors[Math.floor(Math.random() * o.colors.length)] })), last: 0 }),
    draw: ({ ctx, w, h, t, state, o, quality }) => {
        const dt = state.last ? Math.min(0.05, t - state.last) : 0;
        state.last = t;
        ctx.clearRect(0, 0, w, h);
        const n = Math.max(4, Math.round(state.f.length * quality));
        for (let i = 0; i < n; i++) {
            const f = state.f[i];
            f.y += f.vy * dt * o.speed;
            f.x += (Math.sin(t * 1.2 + f.ph) * 22 + (o.wind || 0)) * dt * o.speed;
            f.a += f.va * dt * o.speed;
            if (f.y > h + 16)
                (f.y = -16), (f.x = Math.random() * w);
            if (f.x > w + 16)
                f.x = -16;
            if (f.x < -16)
                f.x = w + 16;
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
const particles = (name, description, defaults, spec) => ({
    name,
    kind: 'background',
    description,
    reduced: 'run',
    defaults: { speed: 1, quality: 1, ...defaults },
    run: (el, o, ctx) => {
        const stop = canvasBackground(el, ctx, spec, o);
        ctx.onCleanup(stop);
        return stop;
    },
});
GPU_FX.push(particles('sakura', 'Cherry-blossom petals drifting down, swaying and flipping (Canvas 2D).', { count: 46, colors: ['#ffc8dd', '#ffafcc', '#fde2e4', '#f9a8d4'], wind: 14 }, fall((ctx, f) => {
    ctx.beginPath();
    ctx.moveTo(0, -f.r);
    ctx.bezierCurveTo(f.r, -f.r, f.r * 0.9, f.r * 0.6, 0, f.r);
    ctx.bezierCurveTo(-f.r * 0.9, f.r * 0.6, -f.r, -f.r, 0, -f.r * 0.55);
    ctx.fill();
})), particles('leaves', 'Autumn leaves tumbling down in the wind (Canvas 2D).', { count: 30, size: 1.4, colors: ['#ea580c', '#d97706', '#b45309', '#dc2626', '#ca8a04'], wind: 26 }, fall((ctx, f) => {
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
})));
GPU_FX.push({
    name: 'splash',
    kind: 'click',
    description: 'A water splash from the pointer: a ring plus droplets that arc out and fall with gravity.',
    defaults: { color: '#38bdf8', count: 14 },
    run: (el, o, ctx) => {
        const { x, y } = origin(el, ctx);
        if (ctx.reduced)
            return spawn(x - 12, y - 12, `width:24px;height:24px;border-radius:50%;background:${o.color};opacity:.5`, ctx, [{ opacity: 0.5 }, { opacity: 0 }], { duration: 300 });
        const anims = [
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
function registerGpuPack() {
    registerEffects(GPU_FX);
}

export { GPU_FX as G, WGSL_HEAD as W, GLSL_HEAD as a, supportsWebGL2 as b, supportsWebGPU as c, wgslModule as d, fieldFallback as f, glslToWgsl as g, registerGpuPack as r, shaderBackground as s, webgpuBackground as w };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/chunks/gpu-ML0i9eNv.js.map