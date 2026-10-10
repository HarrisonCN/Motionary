import { f as defineElement } from './base-zSGb8ujt.js';
import { r as runtimeModule } from './runtime-link-CvJOTQYQ.js';

var css = "usa-gl-scene{position:relative;display:block;aspect-ratio:16/10;min-height:120px}usa-gl-scene>canvas{display:block;width:100%;height:100%;border-radius:inherit;touch-action:none;outline:none}usa-gl-scene>canvas:focus-visible{box-shadow:0 0 0 2px #6366f1}usa-gl-scene .usa-rt-missing{position:absolute;inset:0;margin:0;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow:auto;overflow-wrap:anywhere}";

function defineGlScene(tag = 'usa-gl-scene') {
    return defineElement(tag, (Base) => {
        class UsaGlScene extends Base {
            constructor() {
                super(...arguments);
                this.s = null;
                this.cam = null;
                this.node = null;
                this.r = null;
                this.an = null;
            }
            static get observedAttributes() {
                return ['src', 'shape', 'color', 'metallic', 'roughness', 'background', 'exposure', 'controls', 'auto-rotate', 'video', 'video-scrub', 'label', 'animation', 'animation-speed'];
            }
            get animator() {
                return this.an;
            }
            get scene() {
                return this.s;
            }
            get camera() {
                return this.cam;
            }
            get root() {
                return this.node;
            }
            reload() {
                this.changed('src');
                return Promise.resolve();
            }
            mount() {
                const G = runtimeModule(this, 'gl');
                if (!G)
                    return;
                const canvas = document.createElement('canvas');
                canvas.setAttribute('role', 'img');
                canvas.setAttribute('aria-label', this.str('label', '3D scene'));
                if (this.flag('controls'))
                    canvas.tabIndex = 0;
                this.querySelector(':scope > canvas')?.remove();
                this.prepend(canvas);
                this.onCleanup(() => canvas.remove());
                let r;
                try {
                    r = G.createRenderer(canvas, { alpha: true });
                }
                catch (e) {
                    this.dataset.usaBackend = 'none';
                    this.emit('error', { error: String(e.message) });
                    return;
                }
                this.r = r;
                this.dataset.usaBackend = 'webgl2';
                const scene = (this.s = new G.Scene());
                const bg = this.str('background');
                if (bg)
                    scene.background = G.color(bg);
                scene.exposure = this.num('exposure', 1);
                scene.lights.push({ type: 'directional', vector: [0.8, -0.2, 0.5], color: [0.55, 0.65, 1], intensity: 0.8 });
                const cam = (this.cam = new G.Camera({ position: [1.6, 1.1, 2.6], fov: 40 }));
                let video = null;
                const vsrc = this.str('video');
                if (vsrc) {
                    video = document.createElement('video');
                    Object.assign(video, { src: vsrc, muted: true, loop: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
                    video.setAttribute('aria-hidden', 'true');
                    this.onCleanup(() => {
                        video.pause();
                        video.removeAttribute('src');
                        video.load();
                    });
                }
                const fallback = () => {
                    const shapes = { box: () => G.box(1.2, 1.2, 1.2), sphere: () => G.sphere(0.8, 48, 24), plane: () => G.plane(1.8, 1.0125), torus: () => G.torus(0.62, 0.24, 64, 24) };
                    const geo = (shapes[this.str('shape', video ? 'plane' : 'torus')] || shapes.torus)();
                    const mat = G.standardMaterial({ color: G.color(this.str('color', '#818cf8')), metallic: this.num('metallic', 0.3), roughness: this.num('roughness', 0.35), doubleSided: true });
                    if (video) {
                        mat.map = G.texture(video, { repeat: false });
                        mat.color = [1, 1, 1, 1];
                        mat.type = 'unlit';
                    }
                    return new G.GlNode('shape', { geometry: geo, material: mat });
                };
                const done = (n) => {
                    this.node = n;
                    scene.add(n);
                    G.frameNode(cam, n, 1.15);
                    let meshes = 0;
                    n.traverse((x) => (meshes += x.mesh ? (Array.isArray(x.mesh) ? x.mesh.length : 1) : 0));
                    const clip = this.getAttribute('animation');
                    if (clip !== null && clip !== 'none' && n.extras.gltf) {
                        const A = runtimeModule(this, 'gltf-anim');
                        if (A) {
                            const an = (this.an = A.gltfAnimator(n, { clip: clip === '' ? 0 : /^\d+$/.test(clip) ? +clip : clip, speed: this.num('animation-speed', 1) }));
                            if (!an.clip && an.clips.length)
                                this.emit('error', { error: `no animation "${clip}" (have: ${an.clips.map((c) => c.name).join(', ')})` });
                        }
                    }
                    this.emit('load', { meshes, animations: this.an ? this.an.clips.map((c) => c.name) : [] });
                    this.dataset.loaded = '';
                };
                const src = this.str('src');
                if (src) {
                    const isObj = /\.obj(\?|#|$)/i.test(src);
                    const loader = isObj ? runtimeModule(this, 'format-obj') : runtimeModule(this, 'format-gltf');
                    if (!loader)
                        return;
                    (isObj ? loader.loadObj(new URL(src, location.href).href) : loader.loadGltf(new URL(src, location.href).href, (this.gltfOptions?.() ?? {})))
                        .then((n) => this.isConnected && done(n))
                        .catch((e) => {
                        this.emit('error', { error: String(e.message || e) });
                        done(fallback());
                    });
                }
                else
                    done(fallback());
                const ctl = this.flag('controls') ? G.orbitControls(cam, canvas, { autoRotate: this.reduced ? 0 : (this.num('auto-rotate', 0) * Math.PI) / 180 }) : null;
                const spin = !ctl && this.hasAttribute('auto-rotate') && !this.reduced ? (this.num('auto-rotate', 20) * Math.PI) / 180 : 0;
                this.onCleanup(() => {
                    ctl?.dispose();
                    r.dispose();
                    this.r = null;
                    this.an = null;
                });
                let visible = false, raf = 0, last = 0, t = 0;
                const frame = (now) => {
                    raf = 0;
                    const dt = last ? Math.min(50, now - last) : 16;
                    last = now;
                    t += dt;
                    r.resize();
                    ctl?.update(dt);
                    if (spin && this.node)
                        this.node.rotation = G.quatFromEuler(0, (t / 1000) * spin, 0);
                    if (video && this.flag('video-scrub')) {
                        const rc = this.getBoundingClientRect();
                        G.scrubVideo(video, Math.min(1, Math.max(0, (innerHeight - rc.top) / (innerHeight + rc.height))));
                    }
                    const play = !!this.an?.clip && !this.reduced;
                    if (play)
                        this.an.update(dt / 1000);
                    r.render(scene, cam, t);
                    if (visible && (spin || ctl || video || play || !this.dataset.loaded))
                        raf = requestAnimationFrame(frame);
                };
                const kick = () => {
                    if (!raf)
                        raf = requestAnimationFrame(frame);
                };
                this.listen(canvas, 'pointerdown', kick);
                this.listen(canvas, 'wheel', kick, { passive: true });
                this.listen(canvas, 'keydown', kick);
                this.listen(this, 'usa:load', kick);
                this.listen(window, 'resize', kick, { passive: true });
                this.inView((v) => {
                    visible = v;
                    if (video && !this.flag('video-scrub'))
                        v && !this.reduced ? video.play().catch(() => undefined) : video.pause();
                    if (v) {
                        last = 0;
                        kick();
                    }
                });
                this.onCleanup(() => raf && cancelAnimationFrame(raf));
            }
        }
        return UsaGlScene;
    }, { id: 'gl-scene', text: css });
}

export { css as c, defineGlScene as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/chunks/gl-scene-DqFpR0Z7.js.map