import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as matterClass } from '../chunks/matter-s1ApmJnh.js';

function defineElasticMesh(tag = 'usa-elastic-mesh') {
    const ctor = defineElement(tag, Base => {
        class ElasticMesh extends matterClass(Base, 'mesh') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'strength']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return ElasticMesh;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineElasticMesh };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/elastic-mesh.js.map