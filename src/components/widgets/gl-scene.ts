import { defineElement, type UsaElement } from '../base';
import { runtimeModule } from './runtime-link';
import type { GlApi, Scene, Camera, Renderer, GlNode } from '../../runtime/gl';
import type { FormatGltfApi } from '../../runtime/format-gltf';
import type { FormatObjApi } from '../../runtime/format-obj';
import css from './gl-scene.css?raw';

/**
 * `<usa-gl-scene src="model.glb" controls auto-rotate></usa-gl-scene>` (10.5)
 * — a WebGL2 3D viewer on **`motionary/runtime/gl`** (requires `use(gl)`;
 * `.gltf` / `.glb` models also need `motionary/runtime/format-gltf`, `.obj`
 * needs `motionary/runtime/format-obj`). Without `src` it shows a built-in
 * `shape` (torus · box · sphere · plane). `color`, `metallic`, `roughness`,
 * `background`, `exposure`, `controls` (drag / wheel / pinch / arrow keys),
 * `auto-rotate` (deg/s; off under reduced motion), `video` (a video URL
 * mapped onto the shape as a texture; `video-scrub` ties its time to the
 * element's scroll position instead of playing), `label` (accessible name).
 * Renders only while visible. `scene`, `camera`, `root`, `reload()`;
 * `usa:load` { nodes, meshes }, `usa:error`.
 * `<usa-three-scene>` is an alias with the same API.
 */
export interface UsaGlSceneElement extends UsaElement {
  readonly scene: Scene | null;
  readonly camera: Camera | null;
  readonly root: GlNode | null;
  reload(): Promise<void>;
}

export function defineGlScene(tag = 'usa-gl-scene'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaGlScene extends Base {
        static get observedAttributes(): string[] {
          return ['src', 'shape', 'color', 'metallic', 'roughness', 'background', 'exposure', 'controls', 'auto-rotate', 'video', 'video-scrub', 'label'];
        }
        private s: Scene | null = null;
        private cam: Camera | null = null;
        private node: GlNode | null = null;
        private r: Renderer | null = null;
        get scene(): Scene | null {
          return this.s;
        }
        get camera(): Camera | null {
          return this.cam;
        }
        get root(): GlNode | null {
          return this.node;
        }
        reload(): Promise<void> {
          this.changed('src');
          return Promise.resolve();
        }
        mount(): void {
          const G = runtimeModule<GlApi>(this, 'gl');
          if (!G) return;
          const canvas = document.createElement('canvas');
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', this.str('label', '3D scene'));
          if (this.flag('controls')) canvas.tabIndex = 0;
          this.querySelector(':scope > canvas')?.remove();
          this.prepend(canvas);
          this.onCleanup(() => canvas.remove());
          let r: Renderer;
          try {
            r = G.createRenderer(canvas, { alpha: true });
          } catch (e) {
            this.dataset.usaBackend = 'none';
            this.emit('error', { error: String((e as Error).message) });
            return;
          }
          this.r = r;
          this.dataset.usaBackend = 'webgl2';
          const scene = (this.s = new G.Scene());
          const bg = this.str('background');
          if (bg) scene.background = G.color(bg);
          scene.exposure = this.num('exposure', 1);
          scene.lights.push({ type: 'directional', vector: [0.8, -0.2, 0.5], color: [0.55, 0.65, 1], intensity: 0.8 });
          const cam = (this.cam = new G.Camera({ position: [1.6, 1.1, 2.6], fov: 40 }));
          let video: HTMLVideoElement | null = null;
          const vsrc = this.str('video');
          if (vsrc) {
            video = document.createElement('video');
            Object.assign(video, { src: vsrc, muted: true, loop: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
            video.setAttribute('aria-hidden', 'true');
            this.onCleanup(() => {
              video!.pause();
              video!.removeAttribute('src');
              video!.load();
            });
          }
          const fallback = () => {
            const shapes: Record<string, () => any> = { box: () => G.box(1.2, 1.2, 1.2), sphere: () => G.sphere(0.8, 48, 24), plane: () => G.plane(1.8, 1.0125), torus: () => G.torus(0.62, 0.24, 64, 24) };
            const geo = (shapes[this.str('shape', video ? 'plane' : 'torus')] || shapes.torus)();
            const mat = G.standardMaterial({ color: G.color(this.str('color', '#818cf8')), metallic: this.num('metallic', 0.3), roughness: this.num('roughness', 0.35), doubleSided: true });
            if (video) {
              mat.map = G.texture(video, { repeat: false });
              mat.color = [1, 1, 1, 1];
              mat.type = 'unlit';
            }
            return new G.GlNode('shape', { geometry: geo, material: mat });
          };
          const done = (n: GlNode) => {
            this.node = n;
            scene.add(n);
            G.frameNode(cam, n, 1.15);
            let meshes = 0;
            n.traverse((x) => (meshes += x.mesh ? (Array.isArray(x.mesh) ? x.mesh.length : 1) : 0));
            this.emit('load', { meshes });
            this.dataset.loaded = '';
          };
          const src = this.str('src');
          if (src) {
            const isObj = /\.obj(\?|#|$)/i.test(src);
            const loader = isObj ? runtimeModule<FormatObjApi>(this, 'format-obj') : runtimeModule<FormatGltfApi>(this, 'format-gltf');
            if (!loader) return;
            (isObj ? (loader as FormatObjApi).loadObj(new URL(src, location.href).href) : (loader as FormatGltfApi).loadGltf(new URL(src, location.href).href))
              .then((n) => this.isConnected && done(n))
              .catch((e) => {
                this.emit('error', { error: String(e.message || e) });
                done(fallback());
              });
          } else done(fallback());
          const ctl = this.flag('controls') ? G.orbitControls(cam, canvas, { autoRotate: this.reduced ? 0 : (this.num('auto-rotate', 0) * Math.PI) / 180 }) : null;
          const spin = !ctl && this.hasAttribute('auto-rotate') && !this.reduced ? (this.num('auto-rotate', 20) * Math.PI) / 180 : 0;
          this.onCleanup(() => {
            ctl?.dispose();
            r.dispose();
            this.r = null;
          });
          let visible = false, raf = 0, last = 0, t = 0;
          const frame = (now: number) => {
            raf = 0;
            const dt = last ? Math.min(50, now - last) : 16;
            last = now;
            t += dt;
            r.resize();
            ctl?.update(dt);
            if (spin && this.node) this.node.rotation = G.quatFromEuler(0, (t / 1000) * spin, 0);
            if (video && this.flag('video-scrub')) {
              const rc = this.getBoundingClientRect();
              G.scrubVideo(video, Math.min(1, Math.max(0, (innerHeight - rc.top) / (innerHeight + rc.height))));
            }
            r.render(scene, cam, t);
            if (visible && (spin || ctl || video || !this.dataset.loaded)) raf = requestAnimationFrame(frame);
          };
          const kick = () => {
            if (!raf) raf = requestAnimationFrame(frame);
          };
          this.listen(canvas, 'pointerdown', kick);
          this.listen(canvas, 'wheel', kick, { passive: true });
          this.listen(canvas, 'keydown', kick);
          this.listen(this, 'usa:load', kick);
          this.listen(window, 'resize', kick, { passive: true });
          this.inView((v) => {
            visible = v;
            if (video && !this.flag('video-scrub')) v && !this.reduced ? video.play().catch(() => undefined) : video.pause();
            if (v) {
              last = 0;
              kick();
            }
          });
          this.onCleanup(() => raf && cancelAnimationFrame(raf));
        }
      }
      return UsaGlScene as unknown as CustomElementConstructor;
    },
    { id: 'gl-scene', text: css }
  );
}

/** `<usa-three-scene>` — alias of `<usa-gl-scene>` (same attributes, events and methods; no Three.js involved). */
export function defineThreeScene(tag = 'usa-three-scene'): CustomElementConstructor | undefined {
  return defineGlScene(tag);
}
