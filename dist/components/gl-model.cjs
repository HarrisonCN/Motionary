'use strict';

var base = require('../chunks/base-vu_KhBiv.cjs');
var runtimeLink = require('../chunks/runtime-link-Bq9F9pt8.cjs');
var widgets_glScene = require('../chunks/gl-scene-DOjhIgPM.cjs');
require('../chunks/registry-IdH145NL.cjs');

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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/components/gl-model.cjs.map