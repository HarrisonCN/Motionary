'use strict';

var base = require('./base-vu_KhBiv.cjs');

var css = "usa-gpu-particles{position:relative;display:block;aspect-ratio:16/10;min-height:120px;background:#020617;border-radius:12px;overflow:hidden}usa-gpu-particles>canvas{display:block;width:100%;height:100%}";

const MODES = { swirl: 0, galaxy: 1, fountain: 2 };
const hex = (c) => {
    const s = c.trim().replace('#', '');
    const v = parseInt(s.length === 3 ? s.split('').map((x) => x + x).join('') : s.slice(0, 6), 16) || 0;
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};
const WGSL_HEAD = `struct P{pos:vec2f,vel:vec2f};struct U{t:f32,dt:f32,mode:f32,speed:f32,ptr:vec2f,aspect:f32,size:f32,c0:vec4f,c1:vec4f};
@group(0) @binding(1) var<uniform> u:U;`;
/** WGSL compute pass: integrates every particle (flow field / orbit / fountain + pointer repulsion). */
const PARTICLE_SIM_WGSL = `${WGSL_HEAD}@group(0) @binding(0) var<storage,read_write> ps:array<P>;
fn h(n:f32)->f32{return fract(sin(n)*43758.5453);}
@compute @workgroup_size(64) fn sim(@builtin(global_invocation_id) id:vec3u){let i=id.x;if(i>=arrayLength(&ps)){return;}var p=ps[i];let fi=f32(i);
var acc=vec2f(0.0);let r=length(p.pos)+1e-3;
if(u.mode<0.5){acc=vec2f(-p.pos.y,p.pos.x)*0.9/r+vec2f(sin(p.pos.y*3.0+u.t),cos(p.pos.x*3.0-u.t))*0.35-p.pos*0.15;}
else if(u.mode<1.5){acc=vec2f(-p.pos.y,p.pos.x)/(r*r*4.0+0.2)-p.pos*0.08/r;}
else{acc=vec2f(0.0,-1.4);if(p.pos.y<-1.1){p.pos=vec2f((h(fi+u.t)-0.5)*0.1,-1.0);p.vel=vec2f((h(fi*1.7+u.t)-0.5)*0.9,1.6+h(fi*3.1)*0.8);}}
let d=p.pos-u.ptr;let dl=length(d);if(dl<0.35&&u.ptr.x>-5.0){acc+=d/(dl*dl+0.02)*0.12;}
p.vel=(p.vel+acc*u.dt*u.speed)*pow(0.985,u.dt*60.0);p.pos+=p.vel*u.dt*u.speed;
if(abs(p.pos.x)>1.6||abs(p.pos.y)>1.6){p.pos=vec2f(h(fi)-0.5,h(fi*7.3)-0.5)*1.6;p.vel=vec2f(0.0);}ps[i]=p;}`;
/** WGSL render pass: instanced soft round quads, additive. */
const PARTICLE_DRAW_WGSL = `${WGSL_HEAD}@group(0) @binding(0) var<storage,read> ps:array<P>;
struct V{@builtin(position) pos:vec4f,@location(0) q:vec2f,@location(1) c:vec4f};
@vertex fn vs(@builtin(vertex_index) vi:u32,@builtin(instance_index) ii:u32)->V{var c=array<vec2f,6>(vec2f(-1.0,-1.0),vec2f(1.0,-1.0),vec2f(-1.0,1.0),vec2f(-1.0,1.0),vec2f(1.0,-1.0),vec2f(1.0,1.0));let p=ps[ii];let q=c[vi];var o:V;
o.pos=vec4f(p.pos.x/u.aspect+q.x*u.size/u.aspect,p.pos.y+q.y*u.size,0.0,1.0);o.q=q;o.c=mix(u.c0,u.c1,clamp(length(p.vel)*0.8,0.0,1.0));return o;}
@fragment fn fs(v:V)->@location(0) vec4f{let a=smoothstep(1.0,0.0,length(v.q));return vec4f(v.c.rgb*a,a*v.c.a);}`;
function defineGpuParticles(tag = 'usa-gpu-particles') {
    return base.defineElement(tag, (Base) => {
        class UsaGpuParticles extends Base {
            constructor() {
                super(...arguments);
                this.be = 'none';
            }
            static get observedAttributes() {
                return ['count', 'mode', 'colors', 'size', 'speed', 'trail', 'pointer', 'label'];
            }
            get backend() {
                return this.be;
            }
            setBackend(b) {
                this.be = b;
                this.dataset.usaBackend = b;
                this.emit('backend', { backend: b });
            }
            mount() {
                const canvas = document.createElement('canvas');
                canvas.setAttribute('role', 'img');
                canvas.setAttribute('aria-label', this.str('label', 'Animated particles'));
                this.querySelector(':scope > canvas')?.remove();
                this.prepend(canvas);
                this.onCleanup(() => canvas.remove());
                const cols = this.str('colors', '#818cf8,#f472b6').split(',').map(hex);
                const mode = MODES[this.str('mode', 'swirl')] ?? 0;
                const ptr = [-9, -9];
                if (this.flag('pointer')) {
                    this.listen(canvas, 'pointermove', (e) => {
                        const r = canvas.getBoundingClientRect();
                        ptr[0] = (((e.clientX - r.left) / r.width) * 2 - 1) * (r.width / r.height);
                        ptr[1] = -(((e.clientY - r.top) / r.height) * 2 - 1);
                    });
                    this.listen(canvas, 'pointerleave', () => (ptr[0] = ptr[1] = -9));
                }
                let stop = false;
                this.onCleanup(() => (stop = true));
                const size = () => {
                    const dpr = Math.min(2, devicePixelRatio || 1);
                    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
                    if (canvas.width !== w || canvas.height !== h)
                        Object.assign(canvas, { width: w, height: h });
                    return [w, h];
                };
                let visible = false;
                this.inView((v) => (visible = v));
                const gpu = navigator.gpu;
                const start2d = () => {
                    this.setBackend('canvas2d');
                    const ctx = canvas.getContext('2d');
                    if (!ctx)
                        return;
                    const n = Math.min(1500, this.num('count', 20000));
                    const P = new Float32Array(n * 4);
                    for (let i = 0; i < n; i++)
                        P.set([Math.sin(i * 12.9898) * 0.8, Math.cos(i * 78.233) * 0.8, 0, 0], i * 4);
                    let last = 0, t = 0;
                    const loop = (now) => {
                        if (stop)
                            return;
                        requestAnimationFrame(loop);
                        if (!visible && last)
                            return;
                        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
                        last = now;
                        t += dt;
                        const [w, h] = size(), asp = w / h, sp = this.num('speed', 1);
                        ctx.fillStyle = `rgba(2,6,23,${1 - this.num('trail', 0.8) * 0.9})`;
                        ctx.fillRect(0, 0, w, h);
                        for (let i = 0; i < n; i++) {
                            let x = P[i * 4], y = P[i * 4 + 1], vx = P[i * 4 + 2], vy = P[i * 4 + 3];
                            const r = Math.hypot(x, y) + 1e-3;
                            let ax = 0, ay = 0;
                            if (mode === 0) {
                                ax = (-y * 0.9) / r + Math.sin(y * 3 + t) * 0.35 - x * 0.15;
                                ay = (x * 0.9) / r + Math.cos(x * 3 - t) * 0.35 - y * 0.15;
                            }
                            else if (mode === 1) {
                                ax = -y / (r * r * 4 + 0.2) - (x * 0.08) / r;
                                ay = x / (r * r * 4 + 0.2) - (y * 0.08) / r;
                            }
                            else {
                                ay = -1.4;
                                if (y < -1.1) {
                                    x = (Math.random() - 0.5) * 0.1;
                                    y = -1;
                                    vx = (Math.random() - 0.5) * 0.9;
                                    vy = 1.6 + Math.random() * 0.8;
                                }
                            }
                            const dx = x - ptr[0], dy = y - ptr[1], dl = Math.hypot(dx, dy);
                            if (dl < 0.35) {
                                ax += (dx / (dl * dl + 0.02)) * 0.12;
                                ay += (dy / (dl * dl + 0.02)) * 0.12;
                            }
                            const damp = Math.pow(0.985, dt * 60);
                            vx = (vx + ax * dt * sp) * damp;
                            vy = (vy + ay * dt * sp) * damp;
                            x += vx * dt * sp;
                            y += vy * dt * sp;
                            if (Math.abs(x) > 1.6 || Math.abs(y) > 1.6) {
                                x = Math.random() - 0.5;
                                y = Math.random() - 0.5;
                                vx = vy = 0;
                            }
                            P.set([x, y, vx, vy], i * 4);
                            const k = Math.min(1, Math.hypot(vx, vy) * 0.8), c = cols[0].map((v, j) => Math.round((v + ((cols[1] || cols[0])[j] - v) * k) * 255));
                            ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
                            ctx.fillRect(((x / asp + 1) / 2) * w, ((1 - y) / 2) * h, 2, 2);
                        }
                        if (this.reduced)
                            stop = true;
                    };
                    requestAnimationFrame(loop);
                };
                if (!gpu)
                    return start2d();
                (async () => {
                    const adapter = await gpu.requestAdapter();
                    if (!adapter)
                        throw new Error('[motionary] <usa-gpu-particles>: no WebGPU adapter — falling back to 2D');
                    const dev = await adapter.requestDevice();
                    if (stop)
                        return;
                    const ctx = canvas.getContext('webgpu');
                    const fmt = gpu.getPreferredCanvasFormat();
                    ctx.configure({ device: dev, format: fmt, alphaMode: 'premultiplied' });
                    const n = Math.min(200000, Math.max(64, this.num('count', 20000)));
                    const init = new Float32Array(n * 4);
                    for (let i = 0; i < n; i++)
                        init.set([Math.sin(i * 12.9898) * 0.8, Math.cos(i * 78.233) * 0.8, 0, 0], i * 4);
                    const pb = dev.createBuffer({ size: init.byteLength, usage: 0x80 | 0x8 }); // STORAGE | COPY_DST
                    dev.queue.writeBuffer(pb, 0, init);
                    const ub = dev.createBuffer({ size: 80, usage: 0x40 | 0x8 }); // UNIFORM | COPY_DST
                    const simMod = dev.createShaderModule({ code: PARTICLE_SIM_WGSL });
                    const drawMod = dev.createShaderModule({ code: PARTICLE_DRAW_WGSL });
                    const layout = dev.createBindGroupLayout({ entries: [{ binding: 0, visibility: 0x4, buffer: { type: 'storage' } }, { binding: 1, visibility: 0x4, buffer: { type: 'uniform' } }] });
                    // the vertex stage may only read storage buffers → a read-only layout for drawing
                    const rlayout = dev.createBindGroupLayout({ entries: [{ binding: 0, visibility: 0x1, buffer: { type: 'read-only-storage' } }, { binding: 1, visibility: 0x1 | 0x2, buffer: { type: 'uniform' } }] });
                    const sim = dev.createComputePipeline({ layout: dev.createPipelineLayout({ bindGroupLayouts: [layout] }), compute: { module: simMod, entryPoint: 'sim' } });
                    const draw = dev.createRenderPipeline({ layout: dev.createPipelineLayout({ bindGroupLayouts: [rlayout] }), vertex: { module: drawMod, entryPoint: 'vs' }, fragment: { module: drawMod, entryPoint: 'fs', targets: [{ format: fmt, blend: { color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } } }] }, primitive: { topology: 'triangle-list' } });
                    const bg = dev.createBindGroup({ layout, entries: [{ binding: 0, resource: { buffer: pb } }, { binding: 1, resource: { buffer: ub } }] });
                    const rbg = dev.createBindGroup({ layout: rlayout, entries: [{ binding: 0, resource: { buffer: pb } }, { binding: 1, resource: { buffer: ub } }] });
                    this.setBackend('webgpu');
                    this.onCleanup(() => dev.destroy());
                    let last = 0, t = 0;
                    const loop = (now) => {
                        if (stop)
                            return;
                        requestAnimationFrame(loop);
                        if (!visible && last)
                            return;
                        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
                        last = now;
                        t += dt;
                        const [w, h] = size();
                        const c0 = cols[0], c1 = cols[1] || cols[0];
                        dev.queue.writeBuffer(ub, 0, new Float32Array([t, dt, mode, this.num('speed', 1), ptr[0], ptr[1], w / h, this.num('size', 3) / h, ...c0, 0.9, ...c1, 0.9]));
                        const enc = dev.createCommandEncoder();
                        const cp = enc.beginComputePass();
                        cp.setPipeline(sim);
                        cp.setBindGroup(0, bg);
                        cp.dispatchWorkgroups(Math.ceil(n / 64));
                        cp.end();
                        const fade = this.num('trail', 0);
                        const rp = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', clearValue: { r: 0.008 * (1 - fade), g: 0.024 * (1 - fade), b: 0.09 * (1 - fade), a: 1 }, storeOp: 'store' }] });
                        rp.setPipeline(draw);
                        rp.setBindGroup(0, rbg);
                        rp.draw(6, n);
                        rp.end();
                        dev.queue.submit([enc.finish()]);
                        if (this.reduced)
                            stop = true;
                    };
                    requestAnimationFrame(loop);
                })().catch(() => !stop && start2d());
            }
        }
        return UsaGpuParticles;
    }, { id: 'gpu-particles', text: css });
}

exports.PARTICLE_DRAW_WGSL = PARTICLE_DRAW_WGSL;
exports.PARTICLE_SIM_WGSL = PARTICLE_SIM_WGSL;
exports.defineGpuParticles = defineGpuParticles;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/chunks/gpu-particles-DrjYuSVR.cjs.map