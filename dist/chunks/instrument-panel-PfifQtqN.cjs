'use strict';

var base = require('./base-DzZEJhQB.cjs');
var spring = require('./spring-DoapHVAk.cjs');
var cursor = require('./cursor-CXTVV9RE.cjs');
var runtimeLink = require('./runtime-link-DS8feZhq.cjs');

const bounded = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
const captions = {
    lens: ['Lens assembly', 'Separation'],
    iris: ['Iris diaphragm', 'Opening'],
    relief: ['Contour study', 'Elevation'],
};
function instrumentPanel(host, kind, input, change) {
    const root = document.createElement('section');
    root.className = 'mo-instrument';
    root.dataset.kind = kind;
    const header = document.createElement('header');
    const title = document.createElement('strong');
    const reading = document.createElement('span');
    header.append(title, reading);
    const stage = document.createElement('div');
    stage.className = 'mo-instrument-stage';
    stage.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    const diagram = document.createElement('div');
    diagram.className = 'mo-instrument-diagram';
    const count = kind === 'iris' ? 1 : 7;
    for (let i = 0; i < count; i++) {
        const line = document.createElement('i');
        line.style.setProperty('--layer', String(i - Math.floor(count / 2)));
        diagram.append(line);
    }
    stage.append(canvas, diagram);
    const control = document.createElement('label');
    const caption = document.createElement('span');
    caption.textContent = captions[kind][1];
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.step = '1';
    control.append(caption, slider);
    root.append(header, stage, control);
    host.append(root);
    let view;
    let visible = false;
    let lost = false;
    let frame = 0;
    let pointer;
    let originX = 0, originY = 0, startValue = 0, startPose = 0, width = 1;
    let dragging = false;
    let internal = false;
    const samples = [];
    const sample = (e) => {
        samples.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
        if (samples.length > 32)
            samples.shift();
    };
    const paint = () => {
        frame = 0;
        root.style.setProperty('--progress', String(position.value / 100));
        if (!lost && visible)
            view?.render(position.value / 100, tilt.value);
    };
    const invalidate = () => {
        if (visible && !frame)
            frame = base.raf(paint, host);
    };
    const position = spring.createSpring({ value: host.value, spring: { stiffness: 325, damping: 23 }, onUpdate: invalidate });
    const tilt = spring.createSpring({ spring: { stiffness: 180, damping: 19, precision: 0.0001 }, onUpdate: invalidate });
    const sync = () => {
        const label = host.str('label', captions[kind][0]);
        title.textContent = label;
        reading.textContent = host.value + '%';
        slider.setAttribute('aria-label', label + ' — ' + captions[kind][1]);
        slider.value = String(host.value);
        if (!internal && position.target !== host.value) {
            if (visible && !host.reduced)
                position.set(host.value);
            else
                position.jump(host.value);
        }
    };
    const write = (v) => {
        const next = Math.round(bounded(v));
        if (next === host.value)
            return;
        internal = true;
        try {
            host.value = next;
        }
        finally {
            internal = false;
        }
        input(next);
    };
    const resize = () => {
        const rect = stage.getBoundingClientRect();
        view?.resize(rect.width, rect.height);
        invalidate();
    };
    const api = runtimeLink.runtimeModule(host, 'spatial-instruments');
    const show = (on) => {
        visible = on;
        if (!on) {
            if (frame)
                base.caf(frame);
            frame = 0;
            tilt.jump(0);
            position.jump(host.value);
            return;
        }
        if (api && !view && !root.dataset.renderer) {
            try {
                view = api.createInstrument(canvas, kind);
                root.dataset.renderer = 'webgl';
            }
            catch {
                root.dataset.renderer = 'diagram';
            }
        }
        resize();
    };
    host.listen(canvas, 'webglcontextlost', (e) => { e.preventDefault(); lost = true; root.dataset.renderer = 'diagram'; });
    host.listen(canvas, 'webglcontextrestored', () => { if (view) {
        lost = false;
        root.dataset.renderer = 'webgl';
        resize();
    } });
    host.inView(show);
    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(resize);
        observer.observe(stage);
        host.onCleanup(() => observer.disconnect());
    }
    else
        host.listen(window, 'resize', resize);
    host.listen(slider, 'input', () => {
        const value = slider.valueAsNumber;
        write(value);
        position.jump(value);
    });
    host.listen(slider, 'change', () => change(host.value));
    host.listen(stage, 'pointerdown', (e) => {
        if (pointer !== undefined || !e.isPrimary || e.button !== 0)
            return;
        pointer = e.pointerId;
        originX = e.clientX;
        originY = e.clientY;
        startValue = host.value;
        startPose = position.value;
        width = Math.max(1, stage.getBoundingClientRect().width * 0.8);
        samples.length = 0;
        sample(e);
        stage.setPointerCapture(pointer);
    });
    host.listen(stage, 'pointermove', (e) => {
        if (pointer === undefined) {
            if (e.pointerType === 'mouse' && !host.reduced) {
                const r = stage.getBoundingClientRect();
                if (r.width)
                    tilt.set((e.clientX - r.left) / r.width * 2 - 1);
            }
            return;
        }
        if (pointer !== e.pointerId)
            return;
        const dx = e.clientX - originX;
        if (!dragging && (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(e.clientY - originY)))
            return;
        dragging = true;
        root.dataset.dragging = '';
        sample(e);
        const raw = startPose + dx / width * 100;
        const logical = bounded(raw);
        write(logical);
        position.jump(host.reduced ? logical : logical + spring.rubberBand(raw - logical, 10));
    });
    const end = (e, cancel) => {
        if (pointer !== e.pointerId)
            return;
        pointer = undefined;
        if (stage.hasPointerCapture(e.pointerId))
            stage.releasePointerCapture(e.pointerId);
        if (!dragging)
            return;
        dragging = false;
        delete root.dataset.dragging;
        const held = e.timeStamp - samples[samples.length - 1].t > 60;
        const velocity = host.reduced || held ? 0 : cursor.flingVelocity(samples).vx * 1000 / width * 100;
        const travel = Math.max(-12, Math.min(12, velocity * 0.075));
        const final = cancel ? startValue : Math.round(bounded(host.value + travel));
        write(final);
        position.set(final, cancel ? 0 : Math.max(-160, Math.min(160, velocity)));
        if (!cancel && final !== startValue)
            change(final);
    };
    host.listen(stage, 'pointerup', (e) => end(e, false));
    host.listen(stage, 'pointercancel', (e) => end(e, true));
    host.listen(stage, 'lostpointercapture', (e) => end(e, true));
    host.listen(stage, 'pointerleave', () => { if (tilt.target)
        tilt.set(0); });
    host.onCleanup(() => {
        visible = false;
        position.stop();
        tilt.stop();
        if (frame)
            base.caf(frame);
        view?.dispose();
        root.remove();
        host.querySelector(':scope > .usa-rt-missing')?.remove();
    });
    sync();
    return sync;
}

var css = "usa-lens-stack,usa-iris-diaphragm,usa-contour-relief{display:block;min-width:0}.mo-instrument{--tint:#a6e4dd;--progress:.35;position:relative;isolation:isolate;min-width:0;overflow:hidden;box-sizing:border-box;border:1px solid #495658;border-radius:22px;color:#eff3ee;background:#101b20;font:500 14px/1.35 system-ui,sans-serif;color-scheme:dark}.mo-instrument[data-kind=iris]{--tint:#f5c28b;background:#221c1c;border-color:#625345}.mo-instrument[data-kind=relief]{--tint:#bde2a9;background:#14221e;border-color:#435c4e}.mo-instrument header,.mo-instrument label{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px}.mo-instrument header strong{font-size:1.06em;font-weight:550;overflow-wrap:anywhere}.mo-instrument header span{font:500 .93em ui-monospace,monospace;color:var(--tint);font-variant-numeric:tabular-nums}.mo-instrument-stage{position:relative;height:clamp(176px,28vw,290px);touch-action:pan-y pinch-zoom;user-select:none;cursor:ew-resize;overflow:hidden;background:radial-gradient(ellipse at 48% 50%,#ffffff12,transparent 68%)}.mo-instrument-stage canvas,.mo-instrument-diagram{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}.mo-instrument-stage canvas{visibility:hidden}.mo-instrument[data-renderer=webgl] canvas{visibility:visible}.mo-instrument[data-renderer=webgl] .mo-instrument-diagram{display:none}.mo-instrument label{align-items:center;margin:0;border-top:1px solid #ffffff20;font-size:.87em;color:#d5dcd6}.mo-instrument input{width:58%;min-width:0;height:32px;margin:0;accent-color:var(--tint);cursor:pointer}.mo-instrument input:focus-visible{outline:2px solid var(--tint);outline-offset:4px;border-radius:4px}.mo-instrument-diagram i{position:absolute;top:50%;left:50%;box-sizing:border-box;width:82px;height:115px;border-radius:50%;border:3px solid var(--tint);background:#24353ce0;transform:translate(calc(-50% + var(--layer) * (5px + var(--progress) * 14px)),-50%) skewY(-12deg)}.mo-instrument[data-kind=iris] i{width:120px;height:120px;transform:translate(-50%,-50%);border:2px solid #d5b692;background:radial-gradient(circle,#151518 calc(8% + var(--progress) * 48%),transparent calc(9% + var(--progress) * 48%)),repeating-conic-gradient(from 15deg,#7c6960 0deg,#483d39 38deg,#a08d73 40deg)}.mo-instrument[data-kind=relief] i{width:calc(140px - var(--layer) * 20px);height:calc(60px - var(--layer) * 7px);border-radius:40% 60% 38% 62%;border:2px solid #bdddb1;background:#387364;transform:translate(-50%,calc(-50% - var(--layer) * (4px + var(--progress) * 8px))) rotate(-12deg)}";

exports.bounded = bounded;
exports.css = css;
exports.instrumentPanel = instrumentPanel;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/instrument-panel-PfifQtqN.cjs.map