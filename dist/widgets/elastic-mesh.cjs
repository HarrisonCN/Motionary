'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineElasticMesh(tag = 'usa-elastic-mesh') {
    const ctor = base.defineElement(tag, Base => {
        class ElasticMesh extends matter.matterClass(Base, 'mesh') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'strength']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return ElasticMesh;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineElasticMesh = defineElasticMesh;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/elastic-mesh.cjs.map