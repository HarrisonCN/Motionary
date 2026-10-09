import { defineElement } from '../base';
import { runtimeModule } from './runtime-link';
import { defineGlScene, type UsaGlSceneElement } from './gl-scene';
import type { GltfDecodersApi } from '../../runtime/gltf-decoders';
import css from './gl-scene.css?raw';

/**
 * `<usa-gl-model src="model.glb" controls></usa-gl-model>` (10.9) —
 * `<usa-gl-scene>` for **compressed glTF**: Draco meshes
 * (`KHR_draco_mesh_compression`) and KTX2 / Basis Universal textures
 * (`KHR_texture_basisu`) are decoded by the **official decoders** through
 * `motionary/runtime/gltf-decoders` (requires `use(gl, formatGltf,
 * gltfDecoders)` and `provideGltfDecoder('draco', () => import('draco3d'))`
 * / `provideGltfDecoder('ktx2', …)`; only the decoder a file needs is
 * fetched). Same attributes, methods and events as `<usa-gl-scene>`
 * (incl. `animation`, which also needs `motionary/runtime/gltf-anim`).
 * Its own entry point: `motionary/components/gl-model`.
 */
export type UsaGlModelElement = UsaGlSceneElement;

export function defineGlModel(tag = 'usa-gl-model'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    () => {
      const Scene = (customElements.get('usa-gl-scene') || defineGlScene()) as unknown as new () => HTMLElement;
      class UsaGlModel extends Scene {
        mount(): void {
          // the decoder hooks are this element's contract: ask for them up front (clear notice), then mount as <usa-gl-scene>
          if (!runtimeModule<GltfDecodersApi>(this, 'gltf-decoders')) return;
          (Scene.prototype as any).mount.call(this);
        }
        gltfOptions(): Record<string, unknown> | null {
          const D = runtimeModule<GltfDecodersApi>(this, 'gltf-decoders');
          return D ? { prepare: D.prepareGltf } : null;
        }
      }
      return UsaGlModel as unknown as CustomElementConstructor;
    },
    { id: 'gl-scene', text: css }
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-gl-model': UsaGlModelElement;
  }
}
