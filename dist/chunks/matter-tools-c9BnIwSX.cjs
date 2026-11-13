'use strict';

var engine = require('./engine-D89D-YmJ.cjs');
var matter = require('./matter-CeAHN-RP.cjs');

function matterToolClass(Base, kind) {
    const specs = kind === 'spring'
        ? [['stiffness', 'Stiffness', 180, 1, 800, 1], ['damping', 'Damping', 12, 0, 100, .1], ['mass', 'Mass', 1, .1, 5, .1]]
        : [['x1', 'Control 1 X', .32, 0, 1, .01], ['y1', 'Control 1 Y', .72, 0, 1, .01], ['x2', 'Control 2 X', 0, 0, 1, .01], ['y2', 'Control 2 Y', 1, 0, 1, .01], ['duration', 'Duration', 500, 100, 3000, 10]];
    return class MatterTool extends Base {
        get params() { return Object.fromEntries(specs.map(([key, , fallback, min, max]) => [key, engine.finite(this.num(key, fallback), fallback, min, max)])); }
        notify(type, detail) { this.emit(type, detail); }
        update(data) { matter.setMatterData(this, data); }
        play() { this._play?.(); }
        pause() { this._stop?.(); }
        reset() { this.pause(); this.update(this._initial || {}); this._sync?.(); this.notify('action', { action: 'reset', params: this.params }); }
        changed() { this._sync?.(); }
        mount() {
            this._initial ?? (this._initial = this.params);
            this.classList.add('usa-matter');
            this.setAttribute('role', 'group');
            const root = document.createElement('div');
            root.className = 'usa-matter-tool';
            root.dataset.lab = kind;
            const form = document.createElement('div');
            form.className = 'usa-matter-params';
            const controls = new Map();
            for (const [key, label, , min, max, step] of specs) {
                const row = document.createElement('label');
                row.className = 'usa-matter-param';
                const text = document.createElement('span');
                text.textContent = label;
                const input = document.createElement('input');
                input.type = 'range';
                input.min = String(min);
                input.max = String(max);
                input.step = String(step);
                input.setAttribute('aria-label', label);
                input.dataset.param = key;
                const out = document.createElement('output');
                out.setAttribute('aria-hidden', 'true');
                row.append(text, input, out);
                form.append(row);
                controls.set(key, { input, out });
            }
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('usa-matter-plot');
            svg.setAttribute('viewBox', '0 0 340 180');
            svg.setAttribute('role', 'img');
            svg.innerHTML = '<path d="M20 10V155H325M20 45H325" stroke="#ffffff18" fill="none" stroke-dasharray="3 5"/><path data-curve stroke="#74aaff" stroke-width="1.8" fill="none"/><path data-handles stroke="#9dabc066" stroke-width="1" fill="none"/><circle data-handle="0" r="4" fill="#74aaff"/><circle data-handle="1" r="4" fill="#74aaff"/>';
            const curve = svg.querySelector('[data-curve]'), handles = svg.querySelector('[data-handles]'), dots = [...svg.querySelectorAll('[data-handle]')];
            const code = document.createElement('pre');
            code.className = 'usa-matter-code';
            const preview = document.createElement('div');
            preview.className = 'usa-matter-preview';
            preview.setAttribute('aria-hidden', 'true');
            const mass = document.createElement('div');
            mass.className = 'usa-matter-mass';
            preview.append(mass);
            const bar = document.createElement('div');
            bar.className = 'usa-matter-bar';
            const hint = document.createElement('span');
            hint.textContent = kind === 'spring' ? 'Mass · damping · stiffness' : 'CSS timing · real x inversion';
            const play = document.createElement('button');
            play.type = 'button';
            play.textContent = 'Replay';
            const reset = document.createElement('button');
            reset.type = 'button';
            reset.textContent = 'Reset';
            bar.append(hint, play, reset);
            root.append(form, svg, code, preview, bar);
            this.prepend(root);
            const animations = new Set();
            let drag;
            const release = () => { const held = drag; drag = undefined; if (held) {
                try {
                    if (svg.hasPointerCapture?.(held.pointer))
                        svg.releasePointerCapture(held.pointer);
                }
                catch { /* already released */ }
            } };
            const stop = () => { for (const a of animations)
                a.cancel(); animations.clear(); };
            const sync = () => {
                stop();
                const p = this.params, disabled = this.flag('disabled');
                if (disabled)
                    release();
                this.setAttribute('aria-label', this.str('label', `${kind} laboratory`));
                for (const [key, c] of controls) {
                    c.input.value = String(p[key]);
                    c.input.disabled = disabled;
                    c.out.value = `${p[key]}${key === 'duration' ? 'ms' : ''}`;
                }
                play.disabled = reset.disabled = disabled;
                if (kind === 'spring') {
                    curve.setAttribute('d', Array.from({ length: 181 }, (_, i) => `${i ? 'L' : 'M'}${20 + i / 180 * 300},${155 - engine.springResponse(i / 90, p.stiffness, p.damping, p.mass) * 110}`).join(' '));
                    code.textContent = `spring({ stiffness: ${p.stiffness}, damping: ${p.damping}, mass: ${p.mass} })`;
                    svg.setAttribute('aria-label', `Spring step response. Stiffness ${p.stiffness}, damping ${p.damping}, mass ${p.mass}.`);
                    handles.setAttribute('d', '');
                    dots.forEach(dot => dot.setAttribute('visibility', 'hidden'));
                }
                else {
                    curve.setAttribute('d', `M20 155C${20 + p.x1 * 300} ${155 - p.y1 * 110},${20 + p.x2 * 300} ${155 - p.y2 * 110},320 45`);
                    handles.setAttribute('d', `M20 155L${20 + p.x1 * 300} ${155 - p.y1 * 110}M320 45L${20 + p.x2 * 300} ${155 - p.y2 * 110}`);
                    dots.forEach((dot, i) => { dot.setAttribute('cx', String(20 + p[i ? 'x2' : 'x1'] * 300)); dot.setAttribute('cy', String(155 - p[i ? 'y2' : 'y1'] * 110)); });
                    code.textContent = `transition: transform ${p.duration}ms\n  cubic-bezier(${p.x1}, ${p.y1}, ${p.x2}, ${p.y2});`;
                    svg.setAttribute('aria-label', `Cubic bezier timing curve ${p.x1}, ${p.y1}, ${p.x2}, ${p.y2}.`);
                }
            };
            this._sync = sync;
            this._stop = stop;
            this._play = () => {
                if (this.flag('disabled') || document.hidden)
                    return;
                stop();
                const p = this.params;
                const frames = kind === 'spring'
                    ? Array.from({ length: 121 }, (_, i) => ({ transform: `translateX(${engine.springResponse(i / 60, p.stiffness, p.damping, p.mass) * (preview.clientWidth || 360) * .7}px)` }))
                    : Array.from({ length: 61 }, (_, i) => ({ transform: `translateY(${(1 - engine.cubicResponse(i / 60, p.x1, p.y1, p.x2, p.y2)) * 70}px)` }));
                const a = this.motion(mass, frames, { duration: this.reduced ? 0 : kind === 'spring' ? 2000 : p.duration, easing: 'linear', fill: 'forwards' });
                if (a) {
                    animations.add(a);
                    a.finished?.then(() => animations.delete(a), () => animations.delete(a));
                }
                this.notify('action', { action: 'play', params: p });
            };
            this.listen(form, 'input', (e) => { const input = e.target; if (!this.flag('disabled') && input.dataset.param) {
                this.setAttribute(input.dataset.param, input.value);
                this.notify('change', { params: this.params });
            } });
            this.listen(form, 'change', () => this.play());
            this.listen(play, 'click', () => this.play());
            this.listen(reset, 'click', () => this.reset());
            if (kind === 'bezier') {
                dots.forEach(dot => dot.setAttribute('style', 'touch-action:none;cursor:grab;stroke:transparent;stroke-width:20;paint-order:stroke'));
                this.listen(svg, 'pointerdown', (e) => {
                    const dot = e.target.closest('[data-handle]');
                    if (!dot || this.flag('disabled') || e.button !== 0)
                        return;
                    drag = { handle: Number(dot.getAttribute('data-handle')), pointer: e.pointerId };
                    try {
                        svg.setPointerCapture(e.pointerId);
                    }
                    catch { /* synthetic */ }
                });
                this.listen(svg, 'pointermove', (e) => {
                    if (!drag || drag.pointer !== e.pointerId || this.flag('disabled'))
                        return;
                    const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / Math.max(1, r.width) * 340, y = (e.clientY - r.top) / Math.max(1, r.height) * 180;
                    const suffix = drag.handle ? '2' : '1';
                    this.setAttribute('x' + suffix, engine.finite((x - 20) / 300, .5, 0, 1).toFixed(2));
                    this.setAttribute('y' + suffix, engine.finite((155 - y) / 110, .5, 0, 1).toFixed(2));
                    this.notify('change', { params: this.params });
                });
                for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
                    this.listen(svg, type, () => { if (drag) {
                        release();
                        this.play();
                    } });
            }
            this.listen(document, 'visibilitychange', () => { if (document.hidden) {
                release();
                stop();
            } });
            if (typeof matchMedia === 'function')
                this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', () => { if (this.reduced)
                    stop(); });
            this.inView(v => { if (!v) {
                release();
                stop();
            } });
            const sensitivity = new MutationObserver(() => { if (this.reduced)
                stop(); });
            sensitivity.observe(document.documentElement, { attributes: true, attributeFilter: ['data-usa-sensitivity'] });
            this.onCleanup(() => { release(); stop(); sensitivity.disconnect(); this._sync = this._play = this._stop = undefined; root.remove(); });
            sync();
        }
    };
}

exports.matterToolClass = matterToolClass;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/chunks/matter-tools-c9BnIwSX.cjs.map