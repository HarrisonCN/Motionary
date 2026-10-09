'use strict';

var base = require('../chunks/base-DBheNxJu.cjs');
var runtimeLink = require('../chunks/runtime-link-GD9ayzxH.cjs');
var widgets_glScene = require('../chunks/three-scene-BFZnZuqp.cjs');
require('../chunks/registry-xGDPpmX2.cjs');

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
//# sourceMappingURL=gl-model.cjs.map
