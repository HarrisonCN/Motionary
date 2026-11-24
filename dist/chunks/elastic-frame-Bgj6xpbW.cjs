'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionKit = require('./motion-kit-Bl78eN_4.cjs');

/**
 * Path data for a `w` × `h` box with corner radius `r` whose four edges bow outward at their middles by
 * `top`, `right`, `bottom` and `left` px (negative pulls them in).
 */
function elasticPath(w, h, r, bow) {
    const k = Math.max(0, Math.min(r, w / 2, h / 2));
    const f = (n) => Math.round(n * 10) / 10;
    return [
        `M${f(k)} 0`,
        `Q${f(w / 2)} ${f(-bow.top * 2)} ${f(w - k)} 0`,
        `Q${f(w)} 0 ${f(w)} ${f(k)}`,
        `Q${f(w + bow.right * 2)} ${f(h / 2)} ${f(w)} ${f(h - k)}`,
        `Q${f(w)} ${f(h)} ${f(w - k)} ${f(h)}`,
        `Q${f(w / 2)} ${f(h + bow.bottom * 2)} ${f(k)} ${f(h)}`,
        `Q0 ${f(h)} 0 ${f(h - k)}`,
        `Q${f(-bow.left * 2)} ${f(h / 2)} 0 ${f(k)}`,
        `Q0 0 ${f(k)} 0Z`,
    ].join('');
}
function defineElasticFrame(tag = 'usa-elastic-frame') {
    const ctor = base.defineElement(tag, Base => class ElasticFrame extends Base {
        static get observedAttributes() { return ['stretch', 'reach', 'radius', 'fill', 'stroke', 'stroke-width']; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-eframe');
            const NS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('class', 'usa-eframe-svg');
            svg.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS(NS, 'path');
            svg.append(path);
            root.append(svg, ...kids);
            this.append(root);
            const fill = kit.cleanColor(this.str('fill')), stroke = kit.cleanColor(this.str('stroke'));
            if (fill)
                root.style.setProperty('--fill', fill);
            if (stroke)
                root.style.setProperty('--stroke', stroke);
            root.style.setProperty('--sw', String(Math.max(0, Math.min(12, this.num('stroke-width', 2)))));
            const stretch = Math.max(0, this.num('stretch', 22)), reach = Math.max(1, this.num('reach', 70)), radius = Math.max(0, this.num('radius', 18));
            const sides = ['top', 'right', 'bottom', 'left'];
            const cur = { top: 0, right: 0, bottom: 0, left: 0 }, vel = { ...cur }, want = { ...cur };
            let w = 0, h = 0;
            const draw = () => {
                svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
                path.setAttribute('d', elasticPath(w, h, radius, cur));
            };
            const size = () => { w = root.offsetWidth; h = root.offsetHeight; draw(); };
            let stop;
            const settle = () => {
                if (stop || this.reduced)
                    return;
                stop = base.onFrame((_t, dt) => {
                    const s = Math.min(0.033, (dt || 16) / 1000);
                    let moving = false;
                    for (const k of sides) {
                        const a = 260 * (want[k] - cur[k]) - 14 * vel[k];
                        vel[k] += a * s;
                        cur[k] += vel[k] * s;
                        if (Math.abs(want[k] - cur[k]) > 0.05 || Math.abs(vel[k]) > 0.05)
                            moving = true;
                        else {
                            cur[k] = want[k];
                            vel[k] = 0;
                        }
                    }
                    draw();
                    if (!moving) {
                        stop?.();
                        stop = undefined;
                    }
                }, this);
            };
            let visible = true;
            this.inView((v) => (visible = v));
            this.listen(window, 'pointermove', (e) => {
                if (this.reduced || !visible || e.pointerType === 'touch')
                    return;
                const r = root.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                const inX = x > -reach && x < r.width + reach, inY = y > -reach && y < r.height + reach;
                const pullTo = (dist, inside, along) => (along && Math.abs(dist) < reach ? (inside ? -1 : 1) * stretch * (1 - Math.abs(dist) / reach) : 0);
                const next = {
                    top: pullTo(y, y > 0, inX),
                    bottom: pullTo(y - r.height, y < r.height, inX),
                    left: pullTo(x, x > 0, inY),
                    right: pullTo(x - r.width, x < r.width, inY),
                };
                let changed = false;
                for (const k of sides) {
                    if (Math.abs(next[k] - want[k]) > 0.1)
                        changed = true;
                    want[k] = next[k];
                }
                if (changed)
                    settle();
            }, { passive: true });
            this.listen(root, 'focusin', () => {
                if (this.reduced)
                    return;
                for (const k of sides)
                    vel[k] += stretch * 9;
                settle();
            });
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(size);
                ro.observe(root);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                stop?.();
                this.append(...kids);
                root.remove();
            });
            size();
        }
    }, { id: 'motion-kit', text: motionKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineElasticFrame = defineElasticFrame;
exports.elasticPath = elasticPath;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/elastic-frame-Bgj6xpbW.cjs.map