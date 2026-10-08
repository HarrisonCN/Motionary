import { k as defineElement, n as now, h as caf, f as clamp, r as raf } from '../chunks/base-BtJDNCB6.js';
export { d as configureComponents, p as prefersReducedMotion } from '../chunks/base-BtJDNCB6.js';

/** Minimal WebGL runner: one full-canvas quad, one fragment shader, optional image texture. */
const VERTEX = 'attribute vec2 p;varying vec2 v_uv;void main(){v_uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const HEAD = 'precision mediump float;varying vec2 v_uv;uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;uniform float u_hover;uniform sampler2D u_tex;uniform vec4 u_ripples[4];\n';
/** Built-in fragment shaders (bodies; uniforms `u_time`, `u_resolution`, `u_mouse` 0–1, `u_hover` 0–1, `u_tex`, `u_ripples[4]` = x, y, age, strength). */
const SHADERS = {
    gradient: 'void main(){vec2 u=v_uv;float t=u_time*.15;vec3 a=vec3(.39,.4,.95),b=vec3(.93,.29,.6),c=vec3(.13,.83,.93);float k=.5+.5*sin(u.x*3.+t*2.)*cos(u.y*2.-t);vec3 col=mix(mix(a,b,u.x+.2*sin(t)),c,k*.6);gl_FragColor=vec4(col,1.);}',
    plasma: 'void main(){vec2 u=v_uv*4.;float t=u_time*.6;float v=sin(u.x+t)+sin(u.y+t*.7)+sin(u.x+u.y+t*.5)+sin(length(u-2.+vec2(sin(t),cos(t)))*2.);vec3 col=.5+.5*cos(v+vec3(0.,2.,4.));gl_FragColor=vec4(col,1.);}',
    waves: 'void main(){vec2 u=v_uv;float t=u_time*.4;float w=0.;for(int i=0;i<4;i++){float f=float(i)+1.;w+=sin(u.x*6.*f+t*f)*.08/f;}float l=smoothstep(.0,.02,abs(u.y-.5-w));vec3 col=mix(vec3(.2,.5,1.),vec3(.04,.06,.15),l)+vec3(.1,.0,.2)*u.y;gl_FragColor=vec4(col,1.);}',
    aurora: 'void main(){vec2 u=v_uv;float t=u_time*.2;float b=0.;for(int i=0;i<3;i++){float f=float(i);b+=.4/abs((u.y-.6+.15*sin(u.x*3.+t+f*1.7))*(8.+f*4.));}vec3 col=vec3(.02,.03,.08)+b*mix(vec3(.1,.9,.6),vec3(.6,.3,1.),u.x)*.35;gl_FragColor=vec4(col,1.);}',
    distort: 'void main(){vec2 u=v_uv;vec2 d=u-u_mouse;float r=length(d);float k=u_hover*.08*exp(-r*r*18.);u-=normalize(d+1e-4)*k;float s=u_hover*.006;vec3 col=vec3(texture2D(u_tex,u+vec2(s,0.)).r,texture2D(u_tex,u).g,texture2D(u_tex,u-vec2(s,0.)).b);gl_FragColor=vec4(col,1.);}',
    liquid: 'void main(){vec2 u=v_uv;vec2 o=vec2(0.);for(int i=0;i<4;i++){vec4 r=u_ripples[i];if(r.w>0.){float d=distance(u,r.xy);float w=sin(d*60.-r.z*12.)*exp(-d*6.)*exp(-r.z*1.6)*r.w*.02;o+=normalize(u-r.xy+1e-4)*w;}}o+=vec2(sin(u.y*10.+u_time),cos(u.x*10.+u_time))*.002*u_hover;gl_FragColor=texture2D(u_tex,u+o);}',
};
/** Full fragment source for a preset or custom body (adds the shared header). */
function fragmentSource(body) {
    const src = SHADERS[body] || body;
    return /precision\s+\w+\s+float/.test(src) ? src : HEAD + src;
}
/** `true` when the browser can create a WebGL context (cached). */
let support;
function supportsWebGL() {
    if (support !== undefined)
        return support;
    try {
        const c = typeof document !== 'undefined' ? document.createElement('canvas') : null;
        support = !!(c && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    }
    catch {
        support = false;
    }
    return support;
}
/** Compile `frag` on a full-canvas quad, or `null` when WebGL / compilation is unavailable. */
function glQuad(canvas, frag) {
    let gl = null;
    try {
        gl = (canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false }) || canvas.getContext('experimental-webgl'));
    }
    catch {
        gl = null;
    }
    if (!gl)
        return null;
    const g = gl;
    const sh = (type, src) => {
        const s = g.createShader(type);
        g.shaderSource(s, src);
        g.compileShader(s);
        return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(g.VERTEX_SHADER, VERTEX);
    const fs = sh(g.FRAGMENT_SHADER, fragmentSource(frag));
    if (!vs || !fs)
        return null;
    const prog = g.createProgram();
    g.attachShader(prog, vs);
    g.attachShader(prog, fs);
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS))
        return null;
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, 'p');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n) => g.getUniformLocation(prog, n);
    const uT = U('u_time'), uR = U('u_resolution'), uM = U('u_mouse'), uH = U('u_hover'), uRp = U('u_ripples');
    let tex = null;
    const quad = {
        resize() {
            const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
            const w = Math.max(1, Math.round((canvas.clientWidth || 300) * dpr));
            const h = Math.max(1, Math.round((canvas.clientHeight || 150) * dpr));
            if (canvas.width !== w || canvas.height !== h)
                ((canvas.width = w), (canvas.height = h));
            g.viewport(0, 0, w, h);
        },
        texture(img) {
            tex = tex || g.createTexture();
            g.bindTexture(g.TEXTURE_2D, tex);
            g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
        },
        render(u) {
            g.uniform1f(uT, u.time ?? 0);
            g.uniform2f(uR, canvas.width, canvas.height);
            g.uniform2f(uM, ...(u.mouse ?? [0.5, 0.5]));
            g.uniform1f(uH, u.hover ?? 0);
            if (uRp)
                g.uniform4fv(uRp, new Float32Array((u.ripples ?? []).concat(Array(16).fill(0)).slice(0, 16)));
            g.drawArrays(g.TRIANGLES, 0, 6);
        },
        dispose() {
            g.deleteProgram(prog);
            g.deleteBuffer(buf);
            if (tex)
                g.deleteTexture(tex);
            g.getExtension('WEBGL_lose_context')?.loseContext();
        },
    };
    quad.resize();
    return quad;
}

var css = "usa-shader,usa-distort,usa-liquid{display:block;position:relative;isolation:isolate;overflow:hidden}usa-shader{background:linear-gradient(120deg,#6366f1,#ec4899 50%,#22d3ee)}usa-shader>canvas.usa-gl{position:absolute;inset:0;width:100%;height:100%;z-index:-1;display:block}usa-distort>canvas.usa-gl,usa-liquid>canvas.usa-gl{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}usa-distort>img,usa-liquid>img{display:block;width:100%;height:auto}usa-distort[data-active]>img,usa-liquid[data-active]>img{visibility:hidden}usa-distort[data-fallback]>img{transition:transform 0.6s cubic-bezier(0.22,1,0.36,1),filter 0.6s}usa-distort[data-fallback]:hover>img{transform:scale(1.04);filter:saturate(1.2)}@media (prefers-reduced-motion:reduce){usa-distort[data-fallback]:hover>img{transform:none}}";

function make(kind) {
    return (Base) => class extends Base {
        constructor() {
            super(...arguments);
            this._q = null;
            this._c = null;
            this._id = 0;
            this._mouse = [0.5, 0.5];
            this._hover = 0;
            this._hoverTo = 0;
            this._ripples = [];
        }
        static get observedAttributes() {
            return kind === 'shader' ? ['preset', 'speed'] : ['src'];
        }
        get active() {
            return !!this._q;
        }
        fallback(reason) {
            this.setAttribute('data-fallback', reason);
            this._c?.remove();
            this._c = null;
            this._q?.dispose();
            this._q = null;
        }
        frame() {
            const q = this._q;
            if (!q)
                return;
            this._hover += (this._hoverTo - this._hover) * 0.12;
            const t = now();
            this._ripples = this._ripples.filter((r) => t - r.t < 2500);
            q.render({
                time: (t / 1000) * this.num('speed', 1),
                mouse: this._mouse,
                hover: this._hover,
                ripples: this._ripples.flatMap((r) => [r.x, r.y, (t - r.t) / 1000, this.num('strength', 1)]),
            });
        }
        mount() {
            this.removeAttribute('data-fallback');
            const custom = this.querySelector('script[type="x-shader/x-fragment"]');
            const frag = kind === 'shader' ? custom?.textContent || this.str('preset', 'gradient') : kind;
            const img = kind === 'shader' ? null : this.querySelector('img');
            if (kind !== 'shader' && !img)
                return this.fallback('no-image');
            const c = (this._c = document.createElement('canvas'));
            c.setAttribute('aria-hidden', 'true');
            c.className = 'usa-gl';
            this.prepend(c);
            const q = (this._q = glQuad(c, frag));
            if (!q)
                return this.fallback('webgl');
            this.onCleanup(() => this.fallback('off'));
            const start = () => {
                if (!img)
                    return true;
                try {
                    q.texture(img);
                    return true;
                }
                catch {
                    this.fallback('image');
                    return false;
                }
            };
            const draw = () => {
                q.resize();
                this.frame();
            };
            if (img && !(img.complete && img.naturalWidth)) {
                if (!img.crossOrigin && /^https?:/.test(img.src) && !img.src.startsWith(location.origin))
                    img.crossOrigin = 'anonymous';
                this.listen(img, 'load', () => start() && draw());
                this.listen(img, 'error', () => this.fallback('image'));
            }
            else if (!start())
                return;
            this.setAttribute('data-active', '');
            this.onCleanup(() => this.removeAttribute('data-active'));
            draw();
            if (kind !== 'shader') {
                const pos = (e) => {
                    const r = this.getBoundingClientRect();
                    this._mouse = [clamp((e.clientX - r.left) / (r.width || 1), 0, 1), clamp(1 - (e.clientY - r.top) / (r.height || 1), 0, 1)];
                };
                this.listen(this, 'pointermove', pos);
                this.listen(this, 'pointerenter', (e) => (pos(e), (this._hoverTo = 1)));
                this.listen(this, 'pointerleave', () => (this._hoverTo = 0));
                if (kind === 'liquid')
                    this.listen(this, 'pointerdown', (e) => {
                        pos(e);
                        this._ripples = [...this._ripples.slice(-3), { x: this._mouse[0], y: this._mouse[1], t: now() }];
                    });
            }
            // 4.0.1: also follow the element's own size (grid reflow, card expand…)
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    q.resize();
                    if (!this._id)
                        this.frame();
                });
                ro.observe(this);
                this.onCleanup(() => ro.disconnect());
            }
            if (this.reduced)
                return; // one static frame, no loop
            let visible = false;
            const loop = () => {
                this.frame();
                this._id = raf(loop);
            };
            const sync = () => {
                caf(this._id);
                this._id = 0;
                if (visible && !document.hidden)
                    this._id = raf(loop);
            };
            this.inView((v) => ((visible = v), sync()));
            this.listen(document, 'visibilitychange', sync);
            this.listen(window, 'resize', () => q.resize(), { passive: true });
            this.onCleanup(() => caf(this._id));
        }
    };
}
/**
 * `<usa-shader>` — GPU shader background behind its content. `preset`
 * (`gradient` · `plasma` · `waves` · `aurora`) or your own fragment shader in
 * `<script type="x-shader/x-fragment">` (uniforms `u_time`, `u_resolution`,
 * `u_mouse`, `v_uv`); `speed`. Without WebGL: the element's CSS background.
 */
function defineShader(tag = 'usa-shader') {
    return defineElement(tag, make('shader'), { id: 'webgl', text: css });
}
/**
 * `<usa-distort>` — hover distortion + RGB split on the `<img>` inside,
 * following the pointer. Without WebGL / CORS: a gentle CSS zoom.
 */
function defineDistort(tag = 'usa-distort') {
    return defineElement(tag, make('distort'), { id: 'webgl', text: css });
}
/**
 * `<usa-liquid>` — liquid image: clicks / taps send ripples through the
 * `<img>` inside, hover adds a gentle wobble; `strength`. Fallback: plain image.
 */
function defineLiquid(tag = 'usa-liquid') {
    return defineElement(tag, make('liquid'), { id: 'webgl', text: css });
}

/**
 * use-scroll-animate/components/webgl — lightweight canvas / WebGL (v3.4).
 * `<usa-shader>` (shader backgrounds), `<usa-distort>` (hover image
 * distortion), `<usa-liquid>` (ripple images) on a tiny single-quad runner
 * (`glQuad()`), with graceful fallbacks when WebGL is unavailable.
 */
/** Register every component of this category under its default tag. */
function defineWebglComponents() {
    defineShader();
    defineDistort();
    defineLiquid();
}

export { SHADERS, defineDistort, defineLiquid, defineShader, defineWebglComponents, fragmentSource, glQuad, supportsWebGL };
//# sourceMappingURL=webgl.js.map
