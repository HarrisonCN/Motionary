'use strict';

var base = require('./base-vu_KhBiv.cjs');

var css = "usa-shader-backdrop{position:relative;display:block;isolation:isolate;overflow:hidden;min-height:120px;background:var(--usa-sb-fallback,linear-gradient(135deg,#1e1b4b,#22d3ee,#a855f7))}usa-shader-backdrop>.usa-sb-canvas{position:absolute;inset:0;z-index:-1;width:100%;height:100%;display:block}usa-shader-backdrop>script{display:none}";

const HEAD = `#version 300 es
precision highp float;uniform vec2 u_res;uniform float u_t,u_k;uniform vec3 u_c0,u_c1,u_c2;uniform sampler2D u_src;in vec2 v_uv;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return v;}
`;
/** Built-in scenes: GLSL bodies of `vec3 scene(vec2 uv, float t)`. */
const BACKDROP_PRESETS = {
    aurora: 'vec3 scene(vec2 uv,float t){float b=fbm(vec2(uv.x*3.0,uv.y*1.5-t*0.15));float band=smoothstep(0.25,0.0,abs(uv.y-0.55-0.18*sin(uv.x*4.0+t*0.4)-0.2*(b-0.5)));return mix(u_c0*0.25,mix(u_c1,u_c2,uv.x),band*1.4+b*0.25);}',
    plasma: 'vec3 scene(vec2 uv,float t){float v=sin(uv.x*8.0+t)+sin(uv.y*7.0-t*1.3)+sin((uv.x+uv.y)*6.0+t*0.7)+sin(length(uv-0.5)*12.0-t*1.6);v=v*0.25+0.5;return v<0.5?mix(u_c0,u_c1,v*2.0):mix(u_c1,u_c2,v*2.0-1.0);}',
    waves: 'vec3 scene(vec2 uv,float t){float y=uv.y;vec3 c=u_c0*0.3;for(int i=0;i<4;i++){float fi=float(i);float w=0.5+0.12*sin(uv.x*(3.0+fi)+t*(0.6+fi*0.2)+fi)-fi*0.08;c=mix(c,mix(u_c1,u_c2,fi/3.0),smoothstep(0.012,0.0,abs(y-w))+0.35*smoothstep(w,w-0.3,y)*0.25);}return c;}',
    nebula: 'vec3 scene(vec2 uv,float t){vec2 p=(uv-0.5)*3.0;float f=fbm(p+fbm(p+t*0.05)*1.6);vec3 c=mix(u_c0*0.2,u_c1,f);c=mix(c,u_c2,pow(fbm(p*2.0-t*0.03),3.0)*1.5);float s=step(0.997,h(floor(uv*u_res/2.0)));return c+s*0.8;}',
};
/** Post passes (GLSL bodies reading `u_src`). */
const POST_PASSES = {
    bloom: 'void main(){vec2 px=1.0/u_res;vec3 c=texture(u_src,v_uv).rgb,b=vec3(0);for(int x=-3;x<=3;x++)for(int y=-3;y<=3;y++){vec3 s=texture(u_src,v_uv+vec2(x,y)*px*2.5).rgb;b+=max(s-0.55,0.0);}o=vec4(c+b/49.0*3.0*u_k,1);}',
    vignette: 'void main(){vec3 c=texture(u_src,v_uv).rgb;float d=length(v_uv-0.5);o=vec4(c*mix(1.0,smoothstep(0.85,0.25,d),u_k),1);}',
    grain: 'void main(){vec3 c=texture(u_src,v_uv).rgb;o=vec4(c+(h(v_uv*u_res+fract(u_t)*100.0)-0.5)*0.12*u_k,1);}',
    chromatic: 'void main(){vec2 d=(v_uv-0.5)*0.012*u_k;o=vec4(texture(u_src,v_uv+d).r,texture(u_src,v_uv).g,texture(u_src,v_uv-d).b,1);}',
    pixelate: 'void main(){vec2 s=max(vec2(2.0),u_res/(160.0-120.0*u_k));o=vec4(texture(u_src,(floor(v_uv*s)+0.5)/s).rgb,1);}',
    scanlines: 'void main(){vec3 c=texture(u_src,v_uv).rgb;o=vec4(c*(1.0-0.25*u_k*step(0.5,fract(v_uv.y*u_res.y/3.0))),1);}',
};
const VS = '#version 300 es\nout vec2 v_uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));v_uv=p;gl_Position=vec4(p*2.0-1.0,0,1);}';
const hex = (c) => {
    const s = c.trim().replace('#', '');
    const v = parseInt(s.length === 3 ? s.split('').map((x) => x + x).join('') : s.slice(0, 6), 16) || 0;
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};
function defineShaderBackdrop(tag = 'usa-shader-backdrop') {
    return base.defineElement(tag, (Base) => {
        class UsaShaderBackdrop extends Base {
            constructor() {
                super(...arguments);
                this.chain = [];
            }
            static get observedAttributes() {
                return ['preset', 'post', 'colors', 'speed', 'intensity', 'label'];
            }
            get passes() {
                return this.chain.slice();
            }
            mount() {
                const cols = this.str('colors', '#1e1b4b,#22d3ee,#a855f7').split(',').map(hex);
                while (cols.length < 3)
                    cols.push(cols[cols.length - 1]);
                this.style.setProperty('--usa-sb-fallback', `linear-gradient(135deg, rgb(${cols.map((c) => c.map((v) => Math.round(v * 255)).join(' ')).join('), rgb(')}))`);
                const canvas = document.createElement('canvas');
                canvas.className = 'usa-sb-canvas';
                canvas.setAttribute('aria-hidden', 'true');
                this.prepend(canvas);
                this.onCleanup(() => canvas.remove());
                if (this.hasAttribute('label'))
                    this.setAttribute('aria-label', this.str('label'));
                const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, antialias: false });
                if (!gl) {
                    this.dataset.usaBackend = 'css';
                    this.emit('backend', { backend: 'css' });
                    return;
                }
                const custom = this.querySelector('script[type="x-shader/x-fragment"]')?.textContent;
                const body = custom || BACKDROP_PRESETS[this.str('preset', 'aurora')] || BACKDROP_PRESETS.aurora;
                this.chain = this.str('post', '').split(/[\s,]+/).filter((p) => POST_PASSES[p]);
                const prog = (fs) => {
                    const p = gl.createProgram();
                    for (const [t, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]]) {
                        const s = gl.createShader(t);
                        gl.shaderSource(s, src);
                        gl.compileShader(s);
                        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                            throw new Error(String(gl.getShaderInfoLog(s)));
                        gl.attachShader(p, s);
                    }
                    gl.linkProgram(p);
                    return p;
                };
                let scene, posts;
                try {
                    scene = prog(`${HEAD}${body}\nvoid main(){o=vec4(scene(v_uv,u_t),1);}`);
                    posts = this.chain.map((p) => prog(HEAD + POST_PASSES[p]));
                }
                catch (e) {
                    this.dataset.usaBackend = 'css';
                    this.emit('backend', { backend: 'css', error: String(e.message) });
                    return;
                }
                this.dataset.usaBackend = 'webgl2';
                this.emit('backend', { backend: 'webgl2', passes: this.chain });
                const targets = [0, 1].map(() => ({ fb: gl.createFramebuffer(), tex: gl.createTexture(), w: 0, h: 0 }));
                const fit = (w, h) => {
                    for (const t of targets) {
                        if (t.w === w && t.h === h)
                            continue;
                        gl.bindTexture(gl.TEXTURE_2D, t.tex);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
                        t.w = w;
                        t.h = h;
                    }
                };
                const run = (p, w, h, t, src, out) => {
                    gl.useProgram(p);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, out);
                    gl.viewport(0, 0, w, h);
                    gl.uniform2f(gl.getUniformLocation(p, 'u_res'), w, h);
                    gl.uniform1f(gl.getUniformLocation(p, 'u_t'), t);
                    gl.uniform1f(gl.getUniformLocation(p, 'u_k'), this.num('intensity', 0.7));
                    cols.forEach((c, i) => gl.uniform3fv(gl.getUniformLocation(p, `u_c${i}`), c));
                    if (src) {
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, src);
                        gl.uniform1i(gl.getUniformLocation(p, 'u_src'), 0);
                    }
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                };
                let visible = false, raf = 0, t0 = 0, stop = false;
                const frame = (now) => {
                    raf = 0;
                    if (stop)
                        return;
                    if (!t0)
                        t0 = now;
                    const dpr = Math.min(1.5, devicePixelRatio || 1);
                    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
                    if (canvas.width !== w || canvas.height !== h)
                        Object.assign(canvas, { width: w, height: h });
                    const t = this.reduced ? 3 : ((now - t0) / 1000) * this.num('speed', 1);
                    if (posts.length)
                        fit(w, h);
                    run(scene, w, h, t, null, posts.length ? targets[0].fb : null);
                    posts.forEach((p, i) => run(p, w, h, t, targets[i % 2].tex, i === posts.length - 1 ? null : targets[(i + 1) % 2].fb));
                    if (visible && !this.reduced)
                        raf = requestAnimationFrame(frame);
                };
                this.inView((v) => {
                    visible = v;
                    if (v && !raf)
                        raf = requestAnimationFrame(frame);
                });
                this.onCleanup(() => {
                    stop = true;
                    raf && cancelAnimationFrame(raf);
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                });
            }
        }
        return UsaShaderBackdrop;
    }, { id: 'shader-backdrop', text: css });
}

exports.BACKDROP_PRESETS = BACKDROP_PRESETS;
exports.POST_PASSES = POST_PASSES;
exports.defineShaderBackdrop = defineShaderBackdrop;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/chunks/shader-backdrop-DT1h5Zoc.cjs.map