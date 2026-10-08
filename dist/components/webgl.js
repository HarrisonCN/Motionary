import { x as defineElement, n as now, k as clamp, q as caf, r as raf } from '../chunks/base-C3Sw9sAO.js';

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
    // 4.8 particle presets (procedural, one quad: no buffers, no per-particle JS)
    snow: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 u=v_uv;u.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=mix(vec3(.05,.08,.16),vec3(.12,.16,.3),v_uv.y);for(int l=0;l<3;l++){float s=8.+float(l)*7.;vec2 q=u*s;q.y+=u_time*(.6+float(l)*.35);q.x+=sin(q.y*.7+float(l))*.3;vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id);if(r>.6){vec2 o=vec2(h(id+3.)-.5,h(id+7.)-.5)*.6;float d=length(f-o);col+=smoothstep(.09-float(l)*.02,0.,d)*(.5+.5*r);}}gl_FragColor=vec4(col,1.);}',
    fireflies: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 u=v_uv;u.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=vec3(.02,.04,.03);for(int l=0;l<2;l++){vec2 q=u*(5.+float(l)*4.);vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id+float(l)*13.);vec2 o=.35*vec2(sin(u_time*(.4+r)+r*6.28),cos(u_time*(.3+r)+r*12.));float d=length(f-o);float tw=.5+.5*sin(u_time*3.*r+r*20.);col+=vec3(1.,.85,.3)*smoothstep(.12,0.,d)*tw*step(.45,r);}gl_FragColor=vec4(col,1.);}',
    stars: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 c=v_uv-.5;c.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=vec3(.01,.01,.04);for(int l=0;l<4;l++){float z=fract(float(l)*.25+u_time*.05);float sc=mix(20.,.5,z);vec2 q=c*sc+float(l)*7.;vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id);float d=length(f-(vec2(h(id+1.),h(id+2.))-.5)*.7);col+=vec3(.8,.9,1.)*smoothstep(.06,0.,d)*step(.8,r)*smoothstep(0.,.5,z)*smoothstep(1.,.8,z)*2.;}gl_FragColor=vec4(col,1.);}',
    bokeh: 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 u=v_uv;u.x*=u_resolution.x/max(u_resolution.y,1.);vec3 col=mix(vec3(.08,.03,.12),vec3(.02,.05,.12),v_uv.y);for(int l=0;l<3;l++){vec2 q=u*(2.5+float(l)*1.5);q.y-=u_time*.05*(1.+float(l));vec2 id=floor(q);vec2 f=fract(q)-.5;float r=h(id+float(l)*5.);float d=length(f-(vec2(h(id+4.),h(id+9.))-.5)*.5);vec3 tint=.5+.5*cos(r*6.28+vec3(0.,2.,4.));col+=tint*smoothstep(.3,.26,d)*.18*step(.35,r);}gl_FragColor=vec4(col,1.);}',
    rain: 'float h(float n){return fract(sin(n)*43758.5453);}void main(){vec2 u=v_uv;vec3 col=mix(vec3(.04,.06,.1),vec3(.1,.13,.2),u.y);float n=floor(u.x*120.);float sp=.8+h(n)*1.2;float y=fract(u.y+u_time*sp+h(n+1.));float drop=smoothstep(.0,.08,y)*smoothstep(.16,.08,y)*step(.7,h(n+2.));col+=vec3(.5,.6,.8)*drop*.6;gl_FragColor=vec4(col,1.);}',
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
        support = !!(c && (c.getContext('webgl')));
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
        gl = (canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false }));
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
    const extraLoc = {};
    const quad = {
        resize(scale = 1) {
            const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1) * Math.min(1, Math.max(0.25, scale));
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
            if (u.extra)
                for (const [k, v] of Object.entries(u.extra))
                    g.uniform1f((extraLoc[k] ?? (extraLoc[k] = U(k))), v);
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

/**
 * 4.8 — WebGL preset library on `glQuad()`: particle presets (`snow`,
 * `fireflies`, `stars`, `bokeh`, `rain` — usable as `<usa-shader preset>`),
 * chainable post-processing passes for images (`<usa-post-fx>`), one CSS
 * fallback per preset, and an adaptive quality governor (fps + battery).
 */
const PARTICLE_PRESETS = ['snow', 'fireflies', 'stars', 'bokeh', 'rain'];
/** Post-processing passes: `vec3 fx(vec3 c, vec2 uv)` bodies, applied in order. `u_intensity` 0–1. */
const POST_EFFECTS = {
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
/** One fragment shader running the passes in order over `u_tex` (pixel-sampling passes read the source). */
function postFxShader(effects) {
    const list = effects.filter((e) => POST_EFFECTS[e]);
    const body = list.map((e) => `{${POST_EFFECTS[e]}}`).join('');
    return `uniform float u_intensity;void main(){vec2 uv=v_uv;vec3 c=texture2D(u_tex,uv).rgb;${body}gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
}
/** The unified CSS fallback (no WebGL / reduced data): a still background or image filter per preset. */
const GL_FALLBACKS = {
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
function glFallbackCss(preset, post = false) {
    if (post)
        return preset.split(/\s+/).map((e) => GL_FALLBACKS[`post:${e}`]).filter(Boolean).join(' ');
    return GL_FALLBACKS[preset] || GL_FALLBACKS.gradient;
}
/**
 * Adaptive quality for GL loops: measures fps, steps the resolution scale
 * down (1 → 0.5 → 0.35) after two slow seconds and back up after five good
 * ones, and caps the frame rate in battery-saver mode. Pure — feed it times.
 */
function glGovernor(options = {}) {
    const { minFps = 40, saverFps = 30 } = options;
    const STEPS = [1, 0.5, 0.35];
    let step = 0;
    let frames = 0;
    let winStart = -1;
    let last = -Infinity;
    let slow = 0;
    let good = 0;
    let fps = 60;
    const g = {
        saver: false,
        get scale() {
            return Math.min(STEPS[step], g.saver ? 0.6 : 1);
        },
        get fps() {
            return fps;
        },
        tick(t) {
            if (winStart < 0)
                winStart = t;
            if (g.saver && t - last < 1000 / saverFps - 1)
                return false;
            last = t;
            frames++;
            if (t - winStart >= 1000) {
                fps = Math.round((frames * 1000) / (t - winStart));
                frames = 0;
                winStart = t;
                const before = g.scale;
                if (fps < minFps && !g.saver) {
                    good = 0;
                    if (++slow >= 2 && step < STEPS.length - 1)
                        ((step++), (slow = 0));
                }
                else {
                    slow = 0;
                    if (++good >= 5 && step > 0)
                        ((step--), (good = 0));
                }
                if (g.scale !== before)
                    g.onScale?.(g.scale);
            }
            return true;
        },
    };
    return g;
}
/** Watch the Battery Status API (where available) and Save-Data; calls `cb(true)` in saver conditions. Returns a stop function. */
function watchPowerSaver(cb) {
    let stopped = false;
    const nav = (typeof navigator !== 'undefined' ? navigator : {});
    const saveData = !!nav.connection?.saveData;
    if (saveData)
        cb(true);
    if (typeof nav.getBattery !== 'function')
        return () => undefined;
    let battery = null;
    const update = () => !stopped && cb(saveData || (!!battery && !battery.charging && battery.level <= 0.2));
    nav.getBattery().then((b) => {
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

var css = "usa-shader,usa-distort,usa-liquid,usa-post-fx{display:block;position:relative;isolation:isolate;overflow:hidden}usa-shader{background:linear-gradient(120deg,#6366f1,#ec4899 50%,#22d3ee)}usa-shader>canvas.usa-gl{position:absolute;inset:0;width:100%;height:100%;z-index:-1;display:block}usa-distort>canvas.usa-gl,usa-liquid>canvas.usa-gl{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}usa-distort>img,usa-liquid>img{display:block;width:100%;height:auto}usa-distort[data-active]>img,usa-liquid[data-active]>img{visibility:hidden}usa-distort[data-fallback]>img{transition:transform 0.6s cubic-bezier(0.22,1,0.36,1),filter 0.6s}usa-distort[data-fallback]:hover>img{transform:scale(1.04);filter:saturate(1.2)}@media (prefers-reduced-motion:reduce){usa-distort[data-fallback]:hover>img{transform:none}}usa-shader[data-fallback]{background:var(--usa-gl-fallback,linear-gradient(120deg,#6366f1,#ec4899 50%,#22d3ee))}usa-post-fx>canvas.usa-gl{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}usa-post-fx>img{display:block;width:100%;height:auto}usa-post-fx[data-active]>img{visibility:hidden}usa-post-fx[data-fallback]>img{filter:var(--usa-gl-filter,none)}";

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
            this._scale = 1;
        }
        static get observedAttributes() {
            return kind === 'shader' ? ['preset', 'speed', 'quality'] : kind === 'post' ? ['effects', 'intensity', 'quality'] : ['src'];
        }
        get active() {
            return !!this._q;
        }
        fallback(reason) {
            this.setAttribute('data-fallback', reason);
            // 4.8 unified fallback: a still CSS rendering of the preset / effects
            if (reason !== 'off') {
                if (kind === 'shader')
                    this.style.setProperty('--usa-gl-fallback', glFallbackCss(this.str('preset', 'gradient')));
                if (kind === 'post')
                    this.style.setProperty('--usa-gl-filter', glFallbackCss(this.str('effects', 'vignette grain'), true) || 'none');
            }
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
                extra: kind === 'post' ? { u_intensity: clamp(this.num('intensity', 0.6), 0, 1) } : undefined,
            });
        }
        mount() {
            this.removeAttribute('data-fallback');
            const custom = this.querySelector('script[type="x-shader/x-fragment"]');
            const frag = kind === 'shader' ? custom?.textContent || this.str('preset', 'gradient') : kind === 'post' ? postFxShader(this.str('effects', 'vignette grain').split(/[\s,]+/)) : kind;
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
                q.resize(this._scale);
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
            if (kind === 'distort' || kind === 'liquid') {
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
                    q.resize(this._scale);
                    if (!this._id)
                        this.frame();
                });
                ro.observe(this);
                this.onCleanup(() => ro.disconnect());
            }
            if (this.reduced)
                return; // one static frame, no loop
            // 4.8 adaptive quality: fps-driven resolution steps + battery saver frame cap
            const gov = glGovernor();
            const auto = this.str('quality', 'auto') !== 'high';
            gov.onScale = (sc) => {
                this._scale = sc;
                this.setAttribute('data-quality', String(sc));
                q.resize(sc);
            };
            if (auto)
                this.onCleanup(watchPowerSaver((saver) => ((gov.saver = saver), gov.onScale?.(gov.scale))));
            let visible = false;
            const loop = () => {
                if (!auto || gov.tick(now()))
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
            this.listen(window, 'resize', () => q.resize(this._scale), { passive: true });
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
 * `<usa-post-fx effects="vignette grain crt" intensity="0.6">` — GPU
 * post-processing over the `<img>` inside (4.8): `vignette` · `grain` ·
 * `chromatic` · `scanlines` · `crt` · `bloom` · `pixelate` · `duotone` ·
 * `glitch`, chained in order. `quality="high"` disables adaptive quality.
 * Fallback: the image with an approximate CSS filter.
 */
function definePostFx(tag = 'usa-post-fx') {
    return defineElement(tag, make('post'), { id: 'webgl', text: css });
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
    definePostFx();
}

export { GL_FALLBACKS, PARTICLE_PRESETS, POST_EFFECTS, SHADERS, defineDistort, defineLiquid, definePostFx, defineShader, defineWebglComponents, fragmentSource, glFallbackCss, glGovernor, glQuad, postFxShader, supportsWebGL, watchPowerSaver };
//# sourceMappingURL=webgl.js.map
