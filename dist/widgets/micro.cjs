'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var micro = require('../chunks/micro-3qfNbgwt.cjs');
var microKit16 = require('../chunks/micro-kit-16-CPdfvyga.cjs');

function defineMicro(tag = 'usa-micro') {
    const ctor = base.defineElement(tag, (Base) => class Micro extends Base {
        constructor() {
            super(...arguments);
            this._h = null;
        }
        static get observedAttributes() {
            return ['fx', 'feel', 'spring', 'haptics', 'disabled', 'press-scale', 'hover-scale', 'lift', 'strength', 'reach', 'tilt', 'bounds', 'snap', 'axis', 'feedback'];
        }
        get position() {
            return this._h ? this._h.position : { x: 0, y: 0 };
        }
        moveTo(x, y, instant) {
            this._h?.moveTo(x, y, instant);
        }
        feedback(kind) {
            this._h?.feedback(kind);
        }
        opts() {
            const n = (a) => {
                const v = this.num(a, NaN);
                return Number.isFinite(v) ? v : undefined;
            };
            const axis = this.str('axis');
            return {
                feel: this.str('feel') || undefined,
                spring: this.str('spring') || undefined,
                haptics: this.flag('haptics'),
                disabled: this.flag('disabled'),
                pressScale: n('press-scale'),
                hoverScale: n('hover-scale'),
                lift: n('lift'),
                strength: n('strength'),
                reach: n('reach'),
                tilt: n('tilt'),
                snap: n('snap'),
                axis: axis === 'x' || axis === 'y' ? axis : 'both',
                bounds: this.str('bounds') === 'none' ? 'none' : 'parent',
                onPress: () => void this.emit('press'),
                onRelease: () => void this.emit('release'),
                onDragEnd: (p) => void this.emit('drag-end', { x: p.x, y: p.y }),
            };
        }
        mount() {
            this._h = micro.micro(this, this.str('fx', 'press hover'), this.opts());
        }
        changed(name) {
            if (!this._h)
                return;
            if (name === 'feedback') {
                const k = this.str('feedback');
                if (k)
                    this._h.feedback(k);
                return;
            }
            this._h.update(this.str('fx', 'press hover'), this.opts());
        }
        unmount() {
            this._h?.destroy();
            this._h = null;
        }
    }, { id: 'micro-kit-16', text: microKit16.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMicro = defineMicro;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/micro.cjs.map