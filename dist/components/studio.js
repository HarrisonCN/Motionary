import { createStudioCanvas } from './studio-canvas.js';
import { h as historyKeyAction, d as setKeyframeEasing, s as setKeyframeProps, r as removeKeyframes, a as addKeyframe, u as updateLayers, e as addLayer, f as copyKeyframes, g as shiftKeyframes, i as editableKeyframes, p as pasteKeyframes } from '../chunks/history-lWoJx_Yk.js';
import { c as createTimelinePreview, s as sampleTimelineDoc } from '../chunks/preview-C9tONksA.js';
import { t as timelineDocToScene } from '../chunks/scene-D5SKvFBd.js';
import { d as isLayerLocked, b as timelineDocDuration } from '../chunks/format-CHcmOPqK.js';
import { a as parseBezier, C as CURVE_PRESETS, p as parseStudioProject, s as serializeStudioProject, b as sampleFrames, c as springParams, d as springBezier, e as bezierEasing, f as frameTime } from '../chunks/project-C7WnO3IM.js';
export { S as STUDIO_PROJECT_FORMAT, g as STUDIO_PROJECT_VERSION, h as cleanUiState } from '../chunks/project-C7WnO3IM.js';

/**
 * motionary/studio (14.4) — Motion Studio 1.0: a timeline UI over the 13.6 timeline editor model, composed with the
 * 14.3 canvas (`motionary/studio/canvas`).
 *
 * - Timeline: tracks and track groups (collapse, mute, lock), a time ruler, a scrubbable playhead, zoom.
 * - Keyframes: drag, marquee, multi-select move, copy / paste, snapping to frames and to other keys (Alt: free).
 * - Curve editor: cubic-bezier handles, presets, spring parameters (fitted to a cubic-bezier).
 * - Inspector: the focused track's values at the playhead; editing adds a key there or changes the key there.
 * - Preview: frame by frame, play / pause, deterministic seek (`createTimelinePreview`: same time → same DOM).
 * - Undo / redo through the existing `createTimelineHistory` (one gesture = one step).
 * - Save / load: Scene Format v2 and the Studio project file (`serializeStudioProject` / `parseStudioProject`).
 *
 * Nothing is reimplemented: edits are the editor model's operations (`shiftKeyframes`, `addKeyframe`, …), playback is
 * its preview, the canvas is `createStudioCanvas`. Editor-only and opt-in: nothing in `motionary`, `motionary/core`,
 * `motionary/motion` or `components/lite` imports it. SSR-safe at import; no listeners on window / document: the
 * Studio listens on its own container, adds move / up / cancel listeners when a gesture starts and removes them when
 * it ends or on `destroy()`.
 */
const STUDIO_VERSION = 1;
const SVG = 'http://www.w3.org/2000/svg';
const HEAD = 168;
const CW = 120, CP = 60; // curve box: 120 × 120 px, 60 px above / below for overshoot
const PROP = /^(--)?[a-zA-Z][\w-]*$/;
const r2 = (n) => Math.round(n * 100) / 100 + 0;
const fmt = (t) => `${(t / 1000).toFixed(3)} s`;
const parseVal = (v) => (/^\s*-?(\d+\.?\d*|\.\d+)\s*$/.test(v) ? +v : v.trim());
/** Build a Studio inside `root` for the history's document. */
function createStudio(root, o) {
    const { history } = o;
    const D = root.ownerDocument;
    const coarse = !!D.defaultView?.matchMedia?.('(pointer: coarse)').matches;
    const fps = o.fps && o.fps > 0 ? o.fps : 60, F = 1000 / fps, RH = o.rowHeight ?? (coarse ? 32 : 24), minLen = o.length ?? 2000;
    let zoom = o.zoom ?? 100, time = 0, playing = false, dead = false;
    let selection = [], focusId, focusAt, clip;
    let collapsed = new Set(), springs = {};
    let g = null;
    const h = (tag, a = {}, parent, text) => {
        const e = D.createElement(tag);
        for (const k in a)
            e.setAttribute(k, a[k]);
        if (text !== undefined)
            e.textContent = text;
        parent?.append(e);
        return e;
    };
    const btn = (act, label, text, parent, a = {}) => h('button', { type: 'button', 'data-act': act, 'aria-label': label, ...a }, parent, text);
    const field = (f, label, parent, a = {}) => h('input', { 'data-field': f, 'aria-label': label, ...a }, parent);
    // --- DOM ----------------------------------------------------------------------------------------------------------
    const box = h('div', { 'data-studio': '', style: 'position:relative;font:12px/1.5 system-ui,sans-serif' }, root);
    const bar = h('div', { role: 'toolbar', 'aria-label': 'Studio', style: 'display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:4px 0' }, box);
    btn('prev', 'Previous frame', '⏮', bar);
    const playBtn = btn('play', 'Play', '▶', bar, { 'aria-pressed': 'false' });
    btn('next', 'Next frame', '⏭', bar);
    const timeOut = h('output', { 'data-time': '', 'aria-label': 'Time', style: 'min-width:9em;font-variant-numeric:tabular-nums' }, bar);
    btn('undo', 'Undo', '↶', bar);
    btn('redo', 'Redo', '↷', bar);
    btn('zoom-out', 'Zoom out', '−', bar);
    btn('zoom-in', 'Zoom in', '+', bar);
    const nameIn = field('track-name', 'New layer name', bar, { placeholder: 'Name', size: '10' });
    const targetIn = field('track-target', 'New track target selector', bar, { placeholder: '#target', size: '10' });
    btn('add-track', 'Add track', '+ Track', bar);
    btn('add-group', 'Add group', '+ Group', bar);
    const grid = h('div', { role: 'grid', 'aria-label': o.label || 'Timeline', 'aria-multiselectable': 'true', 'aria-colcount': '2', style: 'position:relative;overflow:auto;max-height:60vh;user-select:none;-webkit-user-select:none;border:1px solid #8885' }, box);
    const headRow = h('div', { role: 'row', 'aria-rowindex': '1', style: `display:flex;height:${RH}px;position:sticky;top:0;z-index:2;background:Canvas` }, grid);
    h('div', { role: 'columnheader', style: `flex:0 0 ${HEAD}px;padding-left:4px;box-sizing:border-box;position:sticky;left:0;background:Canvas;z-index:1` }, headRow, 'Layers');
    const ruler = h('div', { role: 'columnheader', 'data-ruler': '', 'aria-label': 'Time ruler', style: 'position:relative;flex:1 0 auto;touch-action:none;cursor:ew-resize;overflow:hidden' }, headRow);
    const ticks = h('div', { 'aria-hidden': 'true', style: 'position:absolute;inset:0;pointer-events:none' }, ruler);
    const head = h('div', { 'data-playhead': '', role: 'slider', tabindex: '0', 'aria-label': 'Playhead', 'aria-valuemin': '0', style: 'position:absolute;top:0;bottom:0;width:3px;margin-left:-1px;background:#e5484d' }, ruler);
    const body = h('div', { role: 'rowgroup' }, grid);
    const insp = h('div', { 'data-inspector': '', role: 'group', 'aria-label': 'Properties', style: 'padding:4px 0' }, box);
    const curve = h('div', { 'data-curve': '', role: 'group', 'aria-label': 'Easing', style: 'display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start;padding:4px 0' }, box);
    const status = h('div', { role: 'status', 'aria-live': 'polite', style: 'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap' }, box);
    const say = (m) => { status.textContent = m; };
    // --- model ----------------------------------------------------------------------------------------------------------
    const doc = () => history.doc;
    const layer = (id) => doc().layers.find((l) => l.id === id);
    const nameOf = (l) => l.name || l.id;
    const len = () => Math.max(timelineDocDuration(doc()), minLen);
    const px = (t) => r2((t * zoom) / 1000);
    const keys = () => doc().layers.flatMap((l) => l.keyframes || []);
    const keyOf = (id) => keys().find((k) => k.id === id);
    const keyAt = (l, t) => l?.keyframes?.find((k) => Math.abs(k.time - t) < F / 2);
    const depth = (l) => { let n = 0; for (let p = layer(l.parent); p && n < 32; p = layer(p.parent))
        n++; return n; };
    const visible = () => doc().layers.filter((l) => { for (let p = layer(l.parent), n = 0; p && n < 32; p = layer(p.parent), n++)
        if (collapsed.has(p.id))
            return false; return true; });
    const edit = (next, label) => {
        if (next === doc())
            return false;
        history.apply(next, { label });
        say(label);
        return true;
    };
    const editable = (ids) => editableKeyframes(doc(), ids);
    const valuesAt = (id) => {
        const l = layer(id);
        if (!l?.keyframes?.length)
            return {};
        const one = { ...doc(), duration: undefined, layers: [{ ...l, parent: undefined, muted: undefined, solo: undefined }] };
        return sampleTimelineDoc(one, time).layers[l.id] || {};
    };
    // --- preview + canvas ---------------------------------------------------------------------------------------------------
    const copts = typeof o.canvas === 'object' ? o.canvas : {};
    const canvas = o.stage && o.canvas !== false
        ? createStudioCanvas(o.stage, { ...copts, history, time, onSelect: (ids) => { copts.onSelect?.(ids); if (ids.length === 1)
                api.focusLayer(ids[0]); } })
        : undefined;
    const preview = createTimelinePreview(o.stage || D.createElement('div'), doc(), {
        onFrame: (f) => {
            if (!playing)
                return;
            time = f.time;
            drawTime();
            if (time >= preview.duration)
                stop();
        },
    });
    // --- rendering --------------------------------------------------------------------------------------------------------
    const sig = (e) => {
        if (!e || !box.contains(e))
            return;
        for (const a of ['data-key', 'data-row-head', 'data-prop', 'data-key-prop', 'data-handle', 'data-field'])
            if (e.hasAttribute(a))
                return `[${a}="${e.getAttribute(a)}"]`;
        const act = e.getAttribute('data-act'), row = e.closest('[data-layer]');
        return act ? `${row ? `[data-layer="${row.getAttribute('data-layer')}"] ` : ''}[data-act="${act}"]` : undefined;
    };
    const refocus = (s) => { if (s)
        box.querySelector(s)?.focus(); };
    function render() {
        if (dead)
            return;
        const s = sig(D.activeElement);
        const rows = visible(), W = px(len()) + 40;
        body.textContent = '';
        grid.setAttribute('aria-rowcount', String(rows.length + 1));
        ruler.style.minWidth = `${W}px`;
        rows.forEach((l, i) => {
            const n = nameOf(l), d = depth(l), grp = l.type === 'group', col = collapsed.has(l.id);
            const row = h('div', { role: 'row', 'data-layer': l.id, 'aria-rowindex': String(i + 2), 'aria-level': String(d + 1), style: `display:flex;height:${RH}px;box-sizing:border-box;border-top:1px solid #8883` }, body);
            if (grp)
                row.setAttribute('aria-expanded', String(!col));
            const hd = h('div', { role: 'rowheader', 'data-row-head': l.id, tabindex: '-1', style: `flex:0 0 ${HEAD}px;display:flex;align-items:center;gap:2px;padding-left:${4 + d * 12}px;box-sizing:border-box;overflow:hidden;white-space:nowrap;position:sticky;left:0;z-index:1;background:Canvas` }, row);
            if (grp)
                btn('collapse', `${col ? 'Expand' : 'Collapse'} ${n}`, col ? '▸' : '▾', hd, { 'aria-expanded': String(!col), tabindex: '-1' });
            h('span', { style: `flex:1;overflow:hidden;text-overflow:ellipsis${grp ? ';font-weight:600' : ''}` }, hd, n);
            btn('mute', `Mute ${n}`, 'M', hd, { 'aria-pressed': String(!!l.muted), tabindex: '-1' });
            btn('lock', `Lock ${n}`, 'L', hd, { 'aria-pressed': String(!!l.locked), tabindex: '-1' });
            const cell = h('div', { role: 'gridcell', 'data-keys': l.id, style: `position:relative;flex:1 0 auto;min-width:${W}px;touch-action:none` }, row);
            const ks = coarse ? 16 : 11;
            for (const k of l.keyframes || []) {
                h('button', {
                    type: 'button', 'data-key': k.id, tabindex: '-1',
                    'aria-label': `${n}: ${Object.keys(k.props).join(', ') || 'empty'} at ${fmt(k.time)}${k.easing ? `, ${k.easing}` : ''}`,
                    style: `position:absolute;left:${px(k.time)}px;top:50%;width:${ks}px;height:${ks}px;margin:${-ks / 2}px 0 0 ${-ks / 2}px;padding:0;border:1px solid #0a84ff;border-radius:2px;transform:rotate(45deg);cursor:grab;touch-action:none`,
                }, cell);
            }
        });
        // ruler ticks
        ticks.textContent = '';
        const step = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000].find((s) => (s * zoom) / 1000 >= 56) || 60000;
        for (let tt = 0; tt <= len(); tt += step)
            h('span', { style: `position:absolute;left:${px(tt)}px;bottom:0;border-left:1px solid #8888;padding-left:2px;font-size:10px;opacity:.7` }, ticks, `${tt / 1000}s`);
        drawTime();
        paint();
        refocus(s);
    }
    /** Selection, focus and the panels that follow them — without rebuilding the rows (keys keep their elements). */
    function paint() {
        for (const b of body.querySelectorAll('[data-key]')) {
            const on = selection.includes(b.getAttribute('data-key'));
            b.setAttribute('aria-pressed', String(on));
            b.style.background = on ? '#0a84ff' : 'Canvas';
        }
        for (const r of body.querySelectorAll('[data-layer]'))
            r.style.background = r.getAttribute('data-layer') === focusId ? '#0a84ff1a' : '';
        for (const e of body.querySelectorAll('[tabindex="0"]'))
            e.setAttribute('tabindex', '-1');
        const first = body.querySelector('[data-row-head]');
        if (!focusAt || !box.querySelector(focusAt))
            focusAt = first ? `[data-row-head="${first.getAttribute('data-row-head')}"]` : undefined;
        if (focusAt)
            box.querySelector(focusAt).setAttribute('tabindex', '0');
        renderInspector();
        renderCurve();
    }
    function drawTime() {
        const n = Math.round(time / F), L = len();
        head.style.left = `${px(time)}px`;
        head.setAttribute('aria-valuenow', String(time));
        head.setAttribute('aria-valuemax', String(L));
        head.setAttribute('aria-valuetext', `${fmt(time)}, frame ${n}`);
        timeOut.textContent = `${fmt(time)} · f${n}`;
        playBtn.setAttribute('aria-pressed', String(playing));
        playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        playBtn.textContent = playing ? '⏸' : '▶';
    }
    function renderInspector() {
        insp.textContent = '';
        const l = layer(focusId);
        if (!l || l.type !== 'track') {
            h('p', { style: 'margin:0;opacity:.7' }, insp, 'Focus a track to edit its values.');
            return;
        }
        h('div', { style: 'font-weight:600' }, insp, `${nameOf(l)} · ${fmt(time)}`);
        const vals = valuesAt(l.id), k = keyAt(l, time);
        for (const p of Object.keys(vals).sort()) {
            const r = h('div', { style: 'display:flex;gap:4px;align-items:center' }, insp);
            h('span', { style: 'min-width:7em' }, r, p);
            h('input', { 'data-prop': p, 'aria-label': `${p} at ${fmt(time)}`, value: String(vals[p]) }, r);
            const on = !!k && p in k.props;
            h('button', { type: 'button', 'data-key-prop': p, 'aria-pressed': String(on), 'aria-label': `Keyframe ${p} at ${fmt(time)}` }, r, on ? '◆' : '◇');
        }
        const r = h('div', { style: 'display:flex;gap:4px;align-items:center' }, insp);
        field('prop-name', 'New property', r, { placeholder: 'property' });
        field('prop-value', 'New property value', r, { placeholder: 'value' });
        btn('add-prop', 'Add property key', '+ Key', r);
    }
    const curveIds = () => editable(selection);
    function renderCurve() {
        curve.textContent = '';
        const ids = curveIds(), k = ids.length ? keyOf(ids[0]) : undefined;
        const b = parseBezier(k?.easing) || [0, 0, 1, 1];
        const X = (x) => r2(x * CW), Y = (y) => r2(CP + (1 - y) * CW);
        const svg = D.createElementNS(SVG, 'svg');
        const sa = (e, a) => { for (const n in a)
            e.setAttribute(n, String(a[n])); return e; };
        sa(svg, { width: CW, height: CW + 2 * CP, viewBox: `0 0 ${CW} ${CW + 2 * CP}`, role: 'img', 'aria-label': `Curve ${k ? bezierEasing(b) : '(no keyframe selected)'}`, style: 'touch-action:none;overflow:visible;border:1px solid #8884' });
        const el = (tag, a) => svg.appendChild(sa(D.createElementNS(SVG, tag), a));
        el('rect', { x: 0, y: CP, width: CW, height: CW, fill: 'none', stroke: '#8886' });
        el('path', { d: `M0 ${Y(0)} C${X(b[0])} ${Y(b[1])} ${X(b[2])} ${Y(b[3])} ${CW} ${Y(1)}`, fill: 'none', stroke: '#0a84ff', 'stroke-width': 2 });
        el('line', { x1: 0, y1: Y(0), x2: X(b[0]), y2: Y(b[1]), stroke: '#8888' });
        el('line', { x1: CW, y1: Y(1), x2: X(b[2]), y2: Y(b[3]), stroke: '#8888' });
        for (const n of [1, 2]) {
            const x = b[n * 2 - 2], y = b[n * 2 - 1];
            el('circle', { 'data-handle': n, cx: X(x), cy: Y(y), r: coarse ? 11 : 6, fill: '#0a84ff', role: 'slider', tabindex: k ? 0 : -1, 'aria-label': `Control point ${n}`, 'aria-valuenow': x, 'aria-valuetext': `${x}, ${y}`, style: 'cursor:move;touch-action:none' });
        }
        curve.append(svg);
        const side = h('div', { style: 'display:grid;gap:4px' }, curve);
        const sel = h('select', { 'data-field': 'preset', 'aria-label': 'Curve preset' }, side);
        const cur = bezierEasing(b);
        h('option', { value: '' }, sel, 'Custom');
        for (const p of Object.keys(CURVE_PRESETS)) {
            const op = h('option', { value: p }, sel, p);
            if (k && bezierEasing(CURVE_PRESETS[p]) === cur)
                op.setAttribute('selected', '');
        }
        const sp = (k && springs[k.id]) || springParams();
        for (const f of ['stiffness', 'damping', 'mass']) {
            const lb = h('label', { style: 'display:flex;gap:4px;justify-content:space-between' }, side, f);
            field(f, `Spring ${f}`, lb, { type: 'number', min: '0', step: 'any', value: String(sp[f]), style: 'width:6em' });
        }
        btn('spring', 'Apply spring', 'Spring', side);
        if (!k)
            for (const c of side.querySelectorAll('select,input,button'))
                c.setAttribute('disabled', '');
    }
    // --- edits ------------------------------------------------------------------------------------------------------------
    const setSel = (ids) => {
        const have = new Set(keys().map((k) => k.id));
        selection = [...new Set(ids)].filter((id) => have.has(id));
        paint();
        say(`${selection.length} keyframe${selection.length === 1 ? '' : 's'} selected`);
    };
    const nudge = (n) => {
        const ids = editable(selection);
        const ref = keyOf(focusAt?.startsWith('[data-key=') && ids.includes(focusAt.slice(11, -2)) ? focusAt.slice(11, -2) : ids[0]);
        return !!ref && edit(shiftKeyframes(doc(), ids, frameTime(ref.time + n * F, fps) - ref.time), 'Nudge keyframes');
    };
    const stop = () => {
        preview.pause();
        playing = false;
        api.setTime(time);
    };
    // --- pointer ------------------------------------------------------------------------------------------------------------
    const timeAt = (x, el) => ((x - el.getBoundingClientRect().left) * 1000) / zoom;
    function onDown(e) {
        if (g || dead || e.button > 0)
            return;
        const t = e.target;
        const k = t.closest('[data-key]'), cell = t.closest('[data-keys]'), hd = t.closest('[data-handle]'), rh = t.closest('[data-row-head]');
        const st = { mode: 'none', x0: e.clientX, y0: e.clientY };
        if (hd) {
            const ids = curveIds(), kk = ids.length ? keyOf(ids[0]) : undefined;
            if (!kk)
                return;
            Object.assign(st, { mode: 'curve', h: +hd.getAttribute('data-handle'), b: parseBezier(kk.easing) || [0, 0, 1, 1], start: doc(), ids });
        }
        else if (k && cell) {
            const id = k.getAttribute('data-key');
            focusId = cell.getAttribute('data-keys');
            focusAt = `[data-key="${id}"]`;
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                const s = new Set(selection);
                s.has(id) ? s.delete(id) : s.add(id);
                setSel([...s]);
            }
            else {
                if (!selection.includes(id))
                    setSel([id]);
                else
                    paint();
                const ids = editable(selection), moving = new Set(ids);
                Object.assign(st, { mode: 'drag', t0: keyOf(id).time, start: doc(), ids, others: [time, ...keys().filter((x) => !moving.has(x.id)).map((x) => x.time)] });
            }
        }
        else if (t.closest('[data-ruler]')) {
            st.mode = 'scrub';
            api.setTime(timeAt(e.clientX, ruler));
        }
        else if (cell) {
            Object.assign(st, { mode: 'marquee', base: e.shiftKey || e.ctrlKey || e.metaKey ? selection.slice() : [], left: cell.getBoundingClientRect().left });
        }
        else {
            if (rh)
                api.focusLayer(rh.getAttribute('data-row-head'));
            return;
        }
        g = st;
        try {
            box.setPointerCapture?.(e.pointerId);
        }
        catch { /* synthetic or inactive pointer */ }
        box.addEventListener('pointermove', onMove);
        box.addEventListener('pointerup', onUp);
        box.addEventListener('pointercancel', onCancel);
    }
    function onMove(e) {
        if (!g)
            return;
        const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
        if (!g.moved && Math.abs(dx) + Math.abs(dy) < 3 && g.mode !== 'scrub')
            return;
        g.moved = true;
        if (g.mode === 'scrub')
            api.setTime(timeAt(e.clientX, ruler));
        else if (g.mode === 'drag') {
            const raw = g.t0 + (dx * 1000) / zoom;
            let t = Math.round(raw * 1e4) / 1e4;
            if (o.snap !== false && !e.altKey) {
                let near;
                for (const x of g.others)
                    if (near === undefined || Math.abs(x - raw) < Math.abs(near - raw))
                        near = x;
                t = near !== undefined && (Math.abs(near - raw) * zoom) / 1000 <= 6 ? near : frameTime(raw, fps);
            }
            if (!g.began) {
                history.begin('Move keyframes');
                g.began = true;
            }
            history.apply(shiftKeyframes(g.start, g.ids, Math.max(0, t) - g.t0));
        }
        else if (g.mode === 'curve') {
            const svg = curve.querySelector('svg'), r = svg.getBoundingClientRect();
            const x = r2(Math.min(1, Math.max(0, (e.clientX - r.left) / CW))), y = r2(1 - (e.clientY - r.top - CP) / CW);
            const b = g.b.slice();
            b[g.h * 2 - 2] = x;
            b[g.h * 2 - 1] = y;
            if (!g.began) {
                history.begin('Edit curve');
                g.began = true;
            }
            history.apply(setKeyframeEasing(g.start, g.ids, bezierEasing(b)));
        }
        else if (g.mode === 'marquee') {
            const x1 = Math.min(e.clientX, g.x0), x2 = Math.max(e.clientX, g.x0), y1 = Math.min(e.clientY, g.y0), y2 = Math.max(e.clientY, g.y0);
            if (!g.box)
                g.box = h('div', { 'data-marquee': '', 'aria-hidden': 'true' }, box);
            g.box.style.cssText = `position:fixed;left:${x1}px;top:${y1}px;width:${x2 - x1}px;height:${y2 - y1}px;border:1px dashed #0a84ff;background:#0a84ff22;pointer-events:none;z-index:3`;
            const t1 = ((x1 - g.left) * 1000) / zoom, t2 = ((x2 - g.left) * 1000) / zoom, top = body.getBoundingClientRect().top;
            const r1 = Math.floor((y1 - top) / RH), rr2 = Math.floor((y2 - top) / RH);
            const hits = visible().filter((_, i) => i >= r1 && i <= rr2).flatMap((l) => (l.keyframes || []).filter((k) => k.time >= t1 && k.time <= t2).map((k) => k.id));
            const before = selection.join();
            selection = [...new Set([...g.base, ...hits])];
            if (selection.join() !== before)
                paint();
        }
    }
    function end(cancel) {
        const s = g;
        g = null;
        box.removeEventListener('pointermove', onMove);
        box.removeEventListener('pointerup', onUp);
        box.removeEventListener('pointercancel', onCancel);
        if (!s)
            return;
        s.box?.remove();
        if (s.began) {
            cancel ? history.cancel() : history.commit();
            render();
        }
        if (s.mode === 'marquee')
            setSel(cancel ? s.base : s.moved ? selection : s.base);
    }
    const onUp = () => end(false);
    const onCancel = () => end(true);
    function onWheel(e) {
        if (!(e.ctrlKey || e.metaKey))
            return;
        e.preventDefault();
        api.setZoom(zoom * (e.deltaY < 0 ? 1.25 : 0.8));
    }
    // --- keyboard -------------------------------------------------------------------------------------------------------------
    function move(k, e) {
        const rows = visible();
        const at = focusAt ? box.querySelector(focusAt) : null;
        const rowId = at?.closest('[data-layer]')?.getAttribute('data-layer');
        let r = Math.max(0, rows.findIndex((l) => l.id === rowId));
        const kid = at?.getAttribute('data-key');
        const ks = (i) => rows[i]?.keyframes || [];
        let i = kid ? ks(r).findIndex((x) => x.id === kid) : -1;
        if (k === 'ArrowLeft')
            i = Math.max(-1, i - 1);
        else if (k === 'ArrowRight')
            i = Math.min(ks(r).length - 1, i + 1);
        else if (k === 'Home')
            i = -1;
        else if (k === 'End')
            i = ks(r).length - 1;
        else {
            const t = i >= 0 ? ks(r)[i].time : undefined;
            r = Math.min(rows.length - 1, Math.max(0, r + (k === 'ArrowUp' ? -1 : 1)));
            i = t === undefined || !ks(r).length ? -1 : ks(r).reduce((b, x, j) => (Math.abs(x.time - t) < Math.abs(ks(r)[b].time - t) ? j : b), 0);
        }
        if (!rows[r])
            return;
        focusAt = i >= 0 ? `[data-key="${ks(r)[i].id}"]` : `[data-row-head="${rows[r].id}"]`;
        focusId = rows[r].id;
        render();
        refocus(focusAt);
        if (e)
            e.preventDefault();
    }
    function onKey(e) {
        if (e.defaultPrevented || dead)
            return;
        const t = e.target, k = e.key, mod = e.ctrlKey || e.metaKey;
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable)
            return;
        const act = historyKeyAction(e);
        if (act) {
            e.preventDefault();
            history[act]();
            return;
        }
        if (t.closest('[data-handle]')) {
            const ids = curveIds(), kk = ids.length ? keyOf(ids[0]) : undefined, d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[k];
            if (!kk || !d)
                return;
            e.preventDefault();
            const n = +t.getAttribute('data-handle'), b = parseBezier(kk.easing) || [0, 0, 1, 1], s = e.shiftKey ? 0.1 : 0.01;
            b[n * 2 - 2] = r2(Math.min(1, Math.max(0, b[n * 2 - 2] + d[0] * s)));
            b[n * 2 - 1] = r2(b[n * 2 - 1] + d[1] * s);
            api.setBezier(b);
            refocus(`[data-handle="${n}"]`);
            return;
        }
        if (t === head) {
            const map = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 };
            if (k === 'Home')
                api.setTime(0);
            else if (k === 'End')
                api.setTime(len());
            else if (map[k])
                api.step(map[k]);
            else
                return;
            e.preventDefault();
            return;
        }
        if (!t.closest('[role="grid"]'))
            return;
        const at = focusAt ? box.querySelector(focusAt) : null, row = layer(at?.closest('[data-layer]')?.getAttribute('data-layer') || undefined);
        const lk = k.toLowerCase();
        if (mod && lk === 'a')
            api.selectAllKeys();
        else if (mod && lk === 'c')
            api.copy();
        else if (mod && lk === 'v')
            api.paste();
        else if (mod)
            return;
        else if (e.altKey && (k === 'ArrowLeft' || k === 'ArrowRight')) {
            nudge((k === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 10 : 1));
            refocus(focusAt);
        }
        else if (/^Arrow|^Home$|^End$/.test(k))
            move(k, e);
        else if (k === 'Delete' || k === 'Backspace')
            api.deleteKeys();
        else if (k === ',' || k === '<')
            api.step(k === '<' || e.shiftKey ? -10 : -1);
        else if (k === '.' || k === '>')
            api.step(k === '>' || e.shiftKey ? 10 : 1);
        else if (lk === 'k')
            playing ? api.pause() : api.play();
        else if ((k === 'Enter' || k === ' ') && at) {
            const kid = at.getAttribute('data-key');
            if (kid)
                api.selectKeys([kid], { toggle: e.shiftKey });
            else if (row?.type === 'group')
                api.collapse(row.id, !collapsed.has(row.id));
            else if (row)
                api.focusLayer(row.id);
            refocus(focusAt);
        }
        else if ((lk === 'm' || lk === 'l') && row)
            api[lk === 'm' ? 'mute' : 'lock']([row.id], !row[lk === 'm' ? 'muted' : 'locked']);
        else if (k === '-' || k === '=' || k === '+')
            api.setZoom(zoom * (k === '-' ? 0.8 : 1.25));
        else
            return;
        e.preventDefault();
    }
    // --- clicks / fields -------------------------------------------------------------------------------------------------------
    const val = (f) => box.querySelector(`[data-field="${f}"]`)?.value.trim() ?? '';
    function onClick(e) {
        const b = e.target.closest('[data-act],[data-key-prop]');
        if (!b || dead || b.disabled)
            return;
        const lid = b.closest('[data-layer]')?.getAttribute('data-layer') || '', l = layer(lid);
        const kp = b.getAttribute('data-key-prop');
        if (kp) {
            if (b.getAttribute('aria-pressed') === 'true')
                api.removeKey(focusId, kp);
            else {
                const v = valuesAt(focusId)[kp];
                if (v !== undefined)
                    api.setValue(focusId, kp, v);
            }
            refocus(`[data-key-prop="${kp}"]`);
            return;
        }
        switch (b.getAttribute('data-act')) {
            case 'prev':
                api.step(-1);
                break;
            case 'next':
                api.step(1);
                break;
            case 'play':
                playing ? api.pause() : api.play();
                break;
            case 'undo':
                history.undo();
                break;
            case 'redo':
                history.redo();
                break;
            case 'zoom-in':
                api.setZoom(zoom * 1.25);
                break;
            case 'zoom-out':
                api.setZoom(zoom * 0.8);
                break;
            case 'add-track':
                api.addTrack({ name: nameIn.value.trim() || undefined, target: targetIn.value.trim() || undefined });
                break;
            case 'add-group':
                api.addGroup({ name: nameIn.value.trim() || undefined });
                break;
            case 'collapse':
                api.collapse(lid, !collapsed.has(lid));
                break;
            case 'mute':
                if (l)
                    api.mute([lid], !l.muted);
                break;
            case 'lock':
                if (l)
                    api.lock([lid], !l.locked);
                break;
            case 'add-prop': {
                const p = val('prop-name');
                if (focusId && PROP.test(p) && !/^(__proto__|constructor|prototype)$/.test(p))
                    api.setValue(focusId, p, parseVal(val('prop-value')));
                refocus('[data-field="prop-name"]');
                break;
            }
            case 'spring':
                api.setSpring({ stiffness: +val('stiffness'), damping: +val('damping'), mass: +val('mass') });
                break;
        }
    }
    function onChange(e) {
        const t = e.target;
        const p = t.getAttribute('data-prop');
        if (p && focusId) {
            api.setValue(focusId, p, parseVal(t.value));
            refocus(`[data-prop="${p}"]`);
        }
        else if (t.getAttribute('data-field') === 'preset' && CURVE_PRESETS[t.value]) {
            api.setBezier(CURVE_PRESETS[t.value]);
            refocus('[data-field="preset"]');
        }
    }
    // --- API -------------------------------------------------------------------------------------------------------------------
    const api = {
        el: box,
        canvas,
        get time() { return time; },
        get zoom() { return zoom; },
        fps,
        get playing() { return playing; },
        get selection() { return selection.slice(); },
        get focusedLayer() { return focusId; },
        get collapsed() { return [...collapsed]; },
        setTime(ms) {
            const L = len();
            time = Math.min(L, Math.max(0, frameTime(Math.min(L, Math.max(0, Number.isFinite(ms) ? ms : 0)), fps)));
            canvas?.setTime(time);
            preview.seek(time);
            drawTime();
            if (!playing)
                renderInspector();
            return time;
        },
        step: (n = 1) => api.setTime((Math.round(time / F) + Math.round(n)) * F),
        play() {
            if (playing || dead)
                return;
            playing = true;
            if (time >= preview.duration)
                api.setTime(0);
            preview.play();
            drawTime();
        },
        pause() { if (playing)
            stop(); },
        setZoom(z) {
            zoom = Math.min(5000, Math.max(10, Number.isFinite(z) ? z : zoom));
            render();
        },
        selectKeys(ids, s = {}) {
            if (s.toggle) {
                const set = new Set(selection);
                for (const id of ids)
                    set.has(id) ? set.delete(id) : set.add(id);
                setSel([...set]);
            }
            else
                setSel(s.add ? [...selection, ...ids] : ids);
        },
        selectAllKeys: () => setSel(keys().map((k) => k.id)),
        clearSelection: () => setSel([]),
        focusLayer(id) {
            focusId = layer(id) ? id : undefined;
            if (focusId)
                focusAt = `[data-row-head="${focusId}"]`;
            render();
        },
        moveKeys: (dt, ids = selection) => edit(shiftKeyframes(doc(), editable(ids), dt), 'Move keyframes'),
        copy() {
            if (!selection.length)
                return undefined;
            return (clip = copyKeyframes(doc(), selection));
        },
        paste(at = time) {
            if (!clip)
                return [];
            const r = pasteKeyframes(doc(), clip, { at });
            if (!edit(r.doc, 'Paste keyframes'))
                return [];
            setSel(r.ids);
            return r.ids;
        },
        deleteKeys(ids = selection) {
            const ok = edit(removeKeyframes(doc(), editable(ids)), 'Delete keyframes');
            if (ok)
                setSel(selection);
            return ok;
        },
        addTrack(t = {}) {
            const f = layer(focusId), parent = t.parent ?? (f?.type === 'group' ? f.id : f?.parent);
            const n = doc().layers.length + 1;
            const next = addLayer(doc(), { type: 'track', name: t.name || t.target || `Track ${n}`, ...(t.target ? { target: t.target } : {}), ...(parent ? { parent } : {}) });
            const id = next.layers.find((l) => !doc().layers.includes(l))?.id || '';
            if (id) {
                focusId = id;
                focusAt = `[data-row-head="${id}"]`;
                edit(next, 'Add track');
            }
            return id;
        },
        addGroup(t = {}) {
            const f = layer(focusId), parent = t.parent ?? (f?.type === 'group' ? f.id : f?.parent);
            const next = addLayer(doc(), { type: 'group', name: t.name || `Group ${doc().layers.length + 1}`, ...(parent ? { parent } : {}) });
            const id = next.layers.find((l) => !doc().layers.includes(l))?.id || '';
            if (id) {
                focusId = id;
                focusAt = `[data-row-head="${id}"]`;
                edit(next, 'Add group');
            }
            return id;
        },
        collapse(id, v = true) {
            if (layer(id)?.type !== 'group')
                return;
            v ? collapsed.add(id) : collapsed.delete(id);
            render();
        },
        mute: (ids, v = true) => edit(updateLayers(doc(), ids, { muted: v }), v ? 'Mute' : 'Unmute'),
        lock: (ids, v = true) => edit(updateLayers(doc(), ids, { locked: v }), v ? 'Lock' : 'Unlock'),
        valuesAt,
        setValue(id, p, v) {
            const l = layer(id);
            if (!l || l.type !== 'track' || isLayerLocked(doc(), id))
                return false;
            const k = keyAt(l, time);
            return edit(k ? setKeyframeProps(doc(), k.id, { [p]: v }) : addKeyframe(doc(), id, { time, props: { [p]: v } }), `Set ${p}`);
        },
        removeKey(id, p) {
            const k = keyAt(layer(id), time);
            if (!k)
                return false;
            const rest = p ? Object.keys(k.props).filter((x) => x !== p) : [];
            return edit(rest.length ? setKeyframeProps(doc(), k.id, { [p]: null }) : removeKeyframes(doc(), [k.id]), p ? `Remove ${p} key` : 'Remove keyframe');
        },
        setEasing: (easing, ids = selection) => edit(setKeyframeEasing(doc(), editable(ids), easing), 'Easing'),
        setBezier: (b, ids = selection) => api.setEasing(bezierEasing(b), ids),
        setSpring(s, ids = selection) {
            const p = springParams(s), ok = editable(ids);
            for (const id of ok)
                springs[id] = p;
            const changed = api.setEasing(springBezier(p).easing, ok);
            if (!changed)
                render();
            return changed;
        },
        frames: () => sampleFrames(doc(), { fps }),
        save: () => serializeStudioProject(doc(), { time, zoom, fps, collapsed: [...collapsed], springs }),
        exportScene: () => timelineDocToScene(doc()),
        load(input) {
            const r = parseStudioProject(input);
            if (playing)
                stop();
            springs = { ...(r.ui.springs || {}) };
            collapsed = new Set(r.ui.collapsed || []);
            selection = [];
            focusId = undefined;
            if (r.ui.zoom)
                zoom = r.ui.zoom;
            history.reset(r.doc);
            api.setTime(r.ui.time ?? 0);
            return r.lost;
        },
        undo: () => history.undo(),
        redo: () => history.redo(),
        destroy() {
            if (dead)
                return;
            if (g?.began)
                history.cancel();
            end(true);
            preview.pause();
            dead = true;
            unsub();
            preview.destroy();
            canvas?.destroy();
            box.removeEventListener('pointerdown', onDown);
            box.removeEventListener('keydown', onKey);
            box.removeEventListener('click', onClick);
            box.removeEventListener('change', onChange);
            grid.removeEventListener('wheel', onWheel);
            box.remove();
        },
    };
    const unsub = history.subscribe((d) => {
        if (dead)
            return;
        const have = new Set(d.layers.flatMap((l) => (l.keyframes || []).map((k) => k.id)));
        selection = selection.filter((id) => have.has(id));
        for (const id of collapsed)
            if (!d.layers.some((l) => l.id === id))
                collapsed.delete(id);
        if (focusId && !layer(focusId))
            focusId = undefined;
        preview.setDoc(d);
        // during a drag only what moves is updated, so the element under the pointer stays in place; the full render follows on release
        if (g?.mode === 'drag')
            for (const b of body.querySelectorAll('[data-key]')) {
                const k = keyOf(b.getAttribute('data-key'));
                if (k)
                    b.style.left = `${px(k.time)}px`;
            }
        else if (g?.mode === 'curve')
            renderCurve();
        else
            render();
    });
    box.addEventListener('pointerdown', onDown);
    box.addEventListener('keydown', onKey);
    box.addEventListener('click', onClick);
    box.addEventListener('change', onChange);
    grid.addEventListener('wheel', onWheel, { passive: false });
    render();
    api.setTime(0);
    return api;
}

export { CURVE_PRESETS, STUDIO_VERSION, bezierEasing, createStudio, frameTime, parseBezier, parseStudioProject, sampleFrames, serializeStudioProject, springBezier, springParams };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.6.0/dist/components/studio.js.map