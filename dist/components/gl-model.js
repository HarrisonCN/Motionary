import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { r as runtimeModule } from '../chunks/runtime-link-LolrEAJv.js';
import { c as css, d as defineGlScene } from '../chunks/gl-scene-DsfDIyzr.js';
import '../chunks/registry-CorBCE7b.js';

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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/components/gl-model.js.map