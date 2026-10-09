import { f as defineElement } from '../chunks/base-BTev8qxg.js';
import { r as runtimeModule } from '../chunks/runtime-link-CQyKFwE1.js';
import { c as css, a as defineGlScene } from '../chunks/three-scene-DibsZUID.js';
import '../chunks/registry-RJYrdUTF.js';

function defineGlModel(tag = 'usa-gl-model') {
    return defineElement(tag, () => {
        const Scene = (customElements.get('usa-gl-scene') || defineGlScene());
        class UsaGlModel extends Scene {
            mount() {
                // the decoder hooks are this element's contract: ask for them up front (clear notice), then mount as <usa-gl-scene>
                if (!runtimeModule(this, 'gltf-decoders'))
                    return;
                Scene.prototype.mount.call(this);
            }
            gltfOptions() {
                const D = runtimeModule(this, 'gltf-decoders');
                return D ? { prepare: D.prepareGltf } : null;
            }
        }
        return UsaGlModel;
    }, { id: 'gl-scene', text: css });
}

export { defineGlModel };
//# sourceMappingURL=gl-model.js.map
