'use strict';

var base = require('../chunks/base-BvH4nAcv.cjs');
var runtimeLink = require('../chunks/runtime-link-D8m3c_eo.cjs');
var widgets_glScene = require('../chunks/gl-scene-CzKaU6uH.cjs');

function defineGlModel(tag = 'usa-gl-model') {
    return base.defineElement(tag, () => {
        const Scene = (customElements.get('usa-gl-scene') || widgets_glScene.defineGlScene());
        class UsaGlModel extends Scene {
            mount() {
                // the decoder hooks are this element's contract: ask for them up front (clear notice), then mount as <usa-gl-scene>
                if (!runtimeLink.runtimeModule(this, 'gltf-decoders'))
                    return;
                Scene.prototype.mount.call(this);
            }
            gltfOptions() {
                const D = runtimeLink.runtimeModule(this, 'gltf-decoders');
                return D ? { prepare: D.prepareGltf } : null;
            }
        }
        return UsaGlModel;
    }, { id: 'gl-scene', text: widgets_glScene.css });
}

exports.defineGlModel = defineGlModel;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.0-rc.1/dist/components/gl-model.cjs.map