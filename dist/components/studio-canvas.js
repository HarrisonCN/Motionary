import { a as addKeyframe, s as setKeyframeProps, u as updateLayers, m as moveLayer, b as bindHistoryKeys, c as uniqueId } from '../chunks/history-lWoJx_Yk.js';
import { d as isLayerLocked, T as TimelineDocError } from '../chunks/format-CHcmOPqK.js';

/**
 * motionary/studio/canvas (14.3) — the foundations of the Studio canvas: visual selection, marquee and multi-select,
 * layer order / lock / hide, guides and snapping (guides, the other layers' edges and centres, a grid), drag / resize /
 * rotate with pointer and touch (pinch-zoom of the canvas), keyboard navigation and nudge, and an accessible selection
 * model (listbox / option, roving focus, live announcements).
 *
 * No new document format: the canvas edits the 13.6 timeline editor model (Scene Format v2's `motionary-timeline`
 * subset) through its own operations and the existing `createTimelineHistory`:
 *
 * - geometry = keyframe props at the edit time — `translate: "Xpx Ypx"`, `rotate: "Ddeg"`, `width` / `height: "Npx"`
 *   (the CSS individual transform properties, so `<usa-player>` and `playScene` animate them as they are);
 * - lock = `locked`, hide = `muted` (left out of preview and export), order = the layer order (first = in front).
 *
 * Every edit is also returned as a list of `CanvasOp`s that `applyCanvasOps` replays on a Scene v2 document — the
 * lossless path that keeps what timeline v1 cannot hold (preset / effect layers, tokens, composite, loop).
 *
 * Editor-only: nothing in `motionary`, `motionary/core`, `motionary/motion` or `components/lite` imports it. It never
 * touches `window` / `document` at import (SSR-safe) and never listens on them: the controller listens on its root
 * only, adds the move / up / cancel listeners when a gesture starts and removes them when it ends or on `destroy()`.
 */
const STUDIO_CANVAS_VERSION = 1;
const z0 = (n) => n + 0; // -0 → 0
const r2 = (n) => z0(Math.round(n * 100) / 100);
const r4 = (n) => z0(Math.round(n * 1e4) / 1e4);
const N = '(-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?)';
const PX = /*#__PURE__*/ new RegExp(`^${N}px$`);
const DEG = /*#__PURE__*/ new RegExp(`^${N}deg$`);
const TR = /*#__PURE__*/ new RegExp(`^${N}px(?:\\s+${N}px)?$`);
const GEO = ['translate', 'width', 'height', 'rotate'];
const FORBIDDEN = ['__proto__', 'constructor', 'prototype'];
const none = (doc) => ({ doc, ops: [] });
const bad = (path, message) => new TimelineDocError([{ path, message }]);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const track = (doc, id) => doc.layers.find((l) => l.id === id && l.type === 'track');
/** The value of `prop` at `time`: the last keyframe at or before it that sets it, else the first one that does. */
function held(ks, prop, time) {
    let v;
    for (const k of ks)
        if (own(k.props, prop) && (!v || k.time <= time))
            v = k;
    return v?.props[prop];
}
/**
 * A track's geometry at `time` (held from the last keyframe at or before it). `null` for groups, unknown ids, and
 * values the canvas cannot represent (`10%`, `calc()`, numbers …): such layers stay read-only instead of being rewritten.
 */
function readCanvasGeometry(doc, id, time) {
    const l = track(doc, id);
    if (!l)
        return null;
    const g = { x: 0, y: 0, rotation: 0 };
    for (const p of GEO) {
        const v = held(l.keyframes || [], p, time);
        if (v === undefined)
            continue;
        const m = typeof v === 'string' ? (p === 'translate' ? TR : p === 'rotate' ? DEG : PX).exec(v.trim()) : null;
        if (!m)
            return null;
        if (p === 'translate') {
            g.x = z0(+m[1]);
            g.y = z0(+(m[2] ?? 0));
        }
        else if (p === 'rotate')
            g.rotation = z0(+m[1]);
        else
            g[p] = z0(+m[1]);
    }
    return g;
}
/** The canvas box: the layer's untransformed layout box (`base`, canvas px) moved by the translate, with size overrides. */
const canvasBox = (base, g) => ({
    x: base.x + g.x, y: base.y + g.y, width: g.width ?? base.width, height: g.height ?? base.height, rotation: g.rotation,
});
/** The axis-aligned bounds of a (rotated) box. */
function canvasBounds(b) {
    const t = (b.rotation * Math.PI) / 180, c = Math.abs(Math.cos(t)), s = Math.abs(Math.sin(t));
    const w = b.width * c + b.height * s, h = b.width * s + b.height * c;
    return { x: b.x + b.width / 2 - w / 2, y: b.y + b.height / 2 - h / 2, width: w, height: h };
}
/** Whether two rects overlap (touching counts). */
const rectsIntersect = (a, b) => a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;
/** Ids whose (rotated) box the marquee touches (`'intersect'`) or fully holds (`'contain'`), in the order given. */
function marqueeHits(boxes, m, mode = 'intersect') {
    const out = [];
    for (const id of Object.keys(boxes)) {
        const b = canvasBounds(boxes[id]);
        if (mode === 'contain' ? m.x <= b.x && m.y <= b.y && b.x + b.width <= m.x + m.width && b.y + b.height <= m.y + m.height : rectsIntersect(m, b))
            out.push(id);
    }
    return out;
}
/** Snap lines: the edges and centres of `rects` plus the guides, sorted, unique. */
function snapLines(rects, guides = {}) {
    const u = (a) => [...new Set(a.map(r4))].sort((p, q) => p - q);
    return {
        x: u([...rects.flatMap((r) => [r.x, r.x + r.width / 2, r.x + r.width]), ...(guides.x || [])]),
        y: u([...rects.flatMap((r) => [r.y, r.y + r.height / 2, r.y + r.height]), ...(guides.y || [])]),
    };
}
/** The nearest line within `threshold` (a tie goes to the first); none → `{ value }` unchanged. */
function snapValue(v, lines, threshold) {
    let best;
    for (const l of lines)
        if (Math.abs(l - v) <= threshold && (best === undefined || Math.abs(l - v) < Math.abs(best - v)))
            best = l;
    return best === undefined ? { value: v } : { value: best, line: best };
}
/** `v` on a grid of `grid` px (0 = off). */
const snapToGrid = (v, grid) => (grid > 0 ? z0(Math.round(v / grid) * grid) : v);
/**
 * How far to move `rect` so its left / centre / right (top / middle / bottom) lands on the nearest line within
 * `threshold`; on an axis with no line the left (top) edge goes to the grid when one is set. `x` / `y` name the line hit.
 */
function snapRect(rect, lines, o) {
    const axis = (start, size, ls) => {
        let best;
        for (const v of [start, start + size / 2, start + size]) {
            const s = snapValue(v, ls, o.threshold);
            if (s.line !== undefined && (!best || Math.abs(s.line - v) < Math.abs(best.d)))
                best = { d: s.line - v, line: s.line };
        }
        return best || { d: o.grid ? snapToGrid(start, o.grid) - start : 0 };
    };
    const ax = axis(rect.x, rect.width, lines.x), ay = axis(rect.y, rect.height, lines.y);
    const out = { dx: r4(ax.d), dy: r4(ay.d) };
    if ('line' in ax)
        out.x = ax.line;
    if ('line' in ay)
        out.y = ay.line;
    return out;
}
/**
 * Resize `box` by dragging `handle` by (dx, dy) canvas px: the dragged edges follow the pointer in the box's own
 * (rotated) frame and the opposite edges stay where they are. `keepAspect` scales both sides; `min` (default 1) px.
 */
function resizeBox(box, handle, dx, dy, o = {}) {
    const hx = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0;
    const hy = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0;
    const t = (box.rotation * Math.PI) / 180, c = box.rotation ? Math.cos(t) : 1, s = box.rotation ? Math.sin(t) : 0;
    const min = o.min ?? 1;
    let w = box.width + hx * (dx * c + dy * s);
    let h = box.height + hy * (-dx * s + dy * c);
    if (o.keepAspect && box.width && box.height) {
        const k = hx && hy ? Math.max(w / box.width, h / box.height) : hx ? w / box.width : h / box.height;
        w = box.width * k;
        h = box.height * k;
    }
    w = Math.max(min, w);
    h = Math.max(min, h);
    const lx = (hx * (w - box.width)) / 2, ly = (hy * (h - box.height)) / 2;
    const cx = box.x + box.width / 2 + lx * c - ly * s, cy = box.y + box.height / 2 + lx * s + ly * c;
    return { x: z0(cx - w / 2), y: z0(cy - h / 2), width: w, height: h, rotation: box.rotation };
}
/** The rotation after dragging from `start` to `p` around the box centre, from `r0`; `step` snaps (Shift: 15). (-180, 180]. */
function rotationFromPointer(box, start, p, r0, step = 0) {
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    let a = r0 + ((Math.atan2(p.y - cy, p.x - cx) - Math.atan2(start.y - cy, start.x - cx)) * 180) / Math.PI;
    if (step > 0)
        a = Math.round(a / step) * step;
    a = (((a % 360) + 540) % 360) - 180;
    return z0(a === -180 ? 180 : a);
}
// --- ops ------------------------------------------------------------------------------------------------------
/** Write geometry props on a track at `time`: into the keyframe there, else a new keyframe. */
function writeProps(doc, layer, time, props) {
    if (!Object.keys(props).length)
        return none(doc);
    const t = r4(Math.max(0, time));
    const ks = track(doc, layer).keyframes || [];
    let k;
    for (const x of ks)
        if (x.time === t)
            k = x;
    if (k)
        return { doc: setKeyframeProps(doc, k.id, props), ops: [{ op: 'set-props', layer, keyframe: k.id, props }] };
    const id = uniqueId(doc, 'k');
    return { doc: addKeyframe(doc, layer, { id, time: t, props }), ops: [{ op: 'add-keyframe', layer, keyframe: { id, time: t, props: { ...props } } }] };
}
/** Set a layer's box (any of x / y / width / height / rotation) at `time`; only what changed is written. Locked → no-op. */
function canvasSetBox(doc, id, time, base, box) {
    const g = isLayerLocked(doc, id) ? null : readCanvasGeometry(doc, id, time);
    if (!g)
        return none(doc);
    const p = {};
    const x = box.x === undefined ? g.x : r2(box.x - base.x), y = box.y === undefined ? g.y : r2(box.y - base.y);
    if (x !== g.x || y !== g.y)
        p.translate = `${x}px ${y}px`;
    for (const k of ['width', 'height'])
        if (box[k] !== undefined && r2(box[k]) !== (g[k] ?? r2(base[k])))
            p[k] = `${r2(box[k])}px`;
    if (box.rotation !== undefined && r2(box.rotation) !== g.rotation)
        p.rotate = `${r2(box.rotation)}deg`;
    return writeProps(doc, id, time, p);
}
/** Move layers by (dx, dy) canvas px at `time`. Locked layers, layers in locked groups and read-only geometry stay. */
function canvasMove(doc, ids, time, bases, dx, dy) {
    let d = doc;
    const ops = [];
    for (const id of [...new Set(ids)]) {
        const g = readCanvasGeometry(d, id, time), b = bases[id];
        if (!g || !b)
            continue;
        const e = canvasSetBox(d, id, time, b, { x: b.x + g.x + dx, y: b.y + g.y + dy });
        d = e.doc;
        ops.push(...e.ops);
    }
    return { doc: d, ops };
}
function flag(doc, ids, f, v) {
    const ch = [...new Set(ids)].filter((id) => doc.layers.some((l) => l.id === id && !!l[f] !== v));
    if (!ch.length)
        return none(doc);
    const next = updateLayers(doc, ch, { [f]: v });
    return next === doc ? none(doc) : { doc: next, ops: [{ op: 'update-layers', ids: ch, patch: { [f]: v } }] };
}
/** Lock / unlock layers (`locked`; a locked group locks its children). */
const canvasSetLocked = (doc, ids, locked) => flag(doc, ids, 'locked', locked);
/** Hide / show layers (`muted`: hidden on the canvas and left out of preview and export). */
const canvasSetHidden = (doc, ids, hidden) => flag(doc, ids, 'muted', hidden);
/** Change a layer's place among its siblings: the first layer is in front. Locked layers stay. */
function canvasReorder(doc, id, to) {
    const l = doc.layers.find((x) => x.id === id);
    if (!l || isLayerLocked(doc, id))
        return none(doc);
    const sib = doc.layers.filter((x) => x.parent === l.parent);
    const i = sib.indexOf(l), n = sib.length;
    const at = to === 'forward' ? i - 1 : to === 'backward' ? i + 1 : to === 'front' ? 0 : n - 1;
    if (at < 0 || at >= n || at === i)
        return none(doc);
    const next = moveLayer(doc, id, at);
    return next === doc ? none(doc) : { doc: next, ops: [{ op: 'move-layer', layer: id, index: at }] };
}
function checkProps(props, path) {
    if (!props || typeof props !== 'object')
        throw bad(path, 'expected props');
    for (const k of Object.keys(props)) {
        const v = props[k];
        if (FORBIDDEN.includes(k))
            throw bad(`${path}.${k}`, 'forbidden key');
        if (typeof v !== 'string' || v.length > 2048)
            throw bad(`${path}.${k}`, 'expected a string');
    }
}
/**
 * Replay canvas ops on a Scene v2 document (pure; throws `TimelineDocError` on an op that does not apply). Everything the
 * ops do not name is kept as it is — preset / effect / component layers, tokens, loop, keyframe `composite`.
 */
function applyCanvasOps(scene, ops) {
    let d = scene;
    ops.forEach((o, i) => {
        const at = `ops[${i}]`;
        const need = (id, t) => {
            if (!d.layers.some((l) => l.id === id && (!t || l.type === 'track')))
                throw bad(at, `no ${t ? 'track' : 'layer'} "${id}"`);
            if (t && isLayerLocked(d, id))
                throw bad(at, `"${id}" is locked`);
        };
        if (o?.op === 'add-keyframe') {
            need(o.layer, true);
            checkProps(o.keyframe?.props, `${at}.keyframe.props`);
            d = addKeyframe(d, o.layer, { id: o.keyframe.id, time: o.keyframe.time, props: o.keyframe.props });
        }
        else if (o?.op === 'set-props') {
            need(o.layer, true);
            checkProps(o.props, `${at}.props`);
            if (!track(d, o.layer).keyframes?.some((k) => k.id === o.keyframe))
                throw bad(at, `no keyframe "${o.keyframe}"`);
            d = setKeyframeProps(d, o.keyframe, o.props);
        }
        else if (o?.op === 'update-layers') {
            if (!Array.isArray(o.ids))
                throw bad(at, 'expected ids');
            o.ids.forEach((id) => need(id));
            const p = o.patch || {};
            if (Object.keys(p).some((k) => (k !== 'locked' && k !== 'muted') || typeof p[k] !== 'boolean'))
                throw bad(`${at}.patch`, 'only locked / muted');
            d = updateLayers(d, o.ids, p);
        }
        else if (o?.op === 'move-layer') {
            need(o.layer);
            if (isLayerLocked(d, o.layer))
                throw bad(at, `"${o.layer}" is locked`);
            d = moveLayer(d, o.layer, o.index);
        }
        else
            throw bad(`${at}.op`, `unknown op "${o?.op}"`);
    });
    return d;
}
const HANDLES = [['nw', 0, 0, 'nwse'], ['n', 50, 0, 'ns'], ['ne', 100, 0, 'nesw'], ['e', 100, 50, 'ew'], ['se', 100, 100, 'nwse'], ['s', 50, 100, 'ns'], ['sw', 0, 100, 'nesw'], ['w', 0, 50, 'ew']];
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
/** Turn `root` into an editing canvas for the history's document. */
function createStudioCanvas(root, o) {
    const { history } = o;
    const stage = o.stage || root;
    const doc0 = root.ownerDocument;
    const sn = o.snap === false ? null : { threshold: 6, guides: true, siblings: true, grid: true, ...(typeof o.snap === 'object' ? o.snap : {}) };
    let time = o.time ?? 0, grid = o.grid ?? 0, guides = o.guides || {};
    let zoom = 1, pan = { x: 0, y: 0 };
    const minZ = o.minZoom ?? 0.1, maxZ = o.maxZoom ?? 8;
    let items = [];
    let selection = [];
    let focusId;
    let g = null;
    const pointers = new Map();
    let attached = false, dead = false;
    const coarse = !!doc0.defaultView?.matchMedia?.('(pointer: coarse)').matches;
    // --- DOM bookkeeping: every attribute / inline style we touch is restored on destroy ----------------------------
    const saved = new Map();
    const rec = (el) => {
        let r = saved.get(el);
        if (!r)
            saved.set(el, (r = { a: new Map(), s: new Map(), st: el.getAttribute('style') }));
        return r;
    };
    const attr = (el, n, v) => {
        const r = rec(el);
        if (!r.a.has(n))
            r.a.set(n, el.getAttribute(n));
        if (v === null)
            el.removeAttribute(n);
        else if (el.getAttribute(n) !== v)
            el.setAttribute(n, v);
    };
    const css = (el, p, v) => {
        const r = rec(el);
        if (!r.s.has(p))
            r.s.set(p, [el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]);
        const orig = r.s.get(p);
        if (v === undefined) {
            if (orig[0])
                el.style.setProperty(p, orig[0], orig[1]);
            else
                el.style.removeProperty(p);
        }
        else
            el.style.setProperty(p, v);
    };
    const restore = (el) => {
        const r = saved.get(el);
        if (!r)
            return;
        for (const [p, [v, pr]] of r.s)
            if (v)
                el.style.setProperty(p, v, pr);
            else
                el.style.removeProperty(p);
        for (const [n, v] of r.a)
            if (v === null)
                el.removeAttribute(n);
            else
                el.setAttribute(n, v);
        if (r.st === null) {
            if (el.getAttribute('style') === '')
                el.removeAttribute('style');
        }
        else if (el.getAttribute('style') !== r.st) {
            // same declarations → put the author's exact text back (browsers re-serialize the attribute after setProperty)
            const t = el.cloneNode(false);
            t.setAttribute('style', r.st);
            if (t.style.cssText === el.style.cssText)
                el.setAttribute('style', r.st);
        }
        saved.delete(el);
    };
    const div = (style, parent) => {
        const d = doc0.createElement('div');
        d.style.cssText = style;
        parent.append(d);
        return d;
    };
    attr(root, 'role', 'listbox');
    attr(root, 'aria-multiselectable', 'true');
    if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby'))
        attr(root, 'aria-label', o.label || 'Canvas');
    css(root, 'touch-action', 'none');
    css(root, '-webkit-user-select', undefined); // record both before writing: engines alias them (restore order matters)
    css(root, 'user-select', 'none');
    css(root, '-webkit-user-select', 'none');
    if (doc0.defaultView?.getComputedStyle(stage).position === 'static')
        css(stage, 'position', 'relative');
    const overlay = div('position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:2147483647', stage);
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('data-canvas-overlay', '');
    const status = div('position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap', root);
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const say = (m) => { status.textContent = m; };
    // --- model ------------------------------------------------------------------------------------------------------
    const doc = () => history.doc;
    const layer = (id) => doc().layers.find((l) => l.id === id);
    const nameOf = (id) => layer(id)?.name || id;
    const hidden = (id) => {
        for (let l = layer(id), n = 0; l && n < 64; l = l.parent ? layer(l.parent) : undefined, n++)
            if (l.muted)
                return true;
        return false;
    };
    const item = (id) => items.find((i) => i.id === id);
    const box = (id) => {
        const it = item(id), ge = it && readCanvasGeometry(doc(), id, time);
        return ge ? canvasBox(it.base, ge) : undefined;
    };
    const movable = (ids) => ids.filter((id) => !isLayerLocked(doc(), id) && readCanvasGeometry(doc(), id, time));
    const bases = () => Object.fromEntries(items.map((i) => [i.id, i.base]));
    const visibleBoxes = (skip = []) => {
        const out = {};
        for (const i of items)
            if (!skip.includes(i.id) && !hidden(i.id)) {
                const b = box(i.id);
                if (b)
                    out[i.id] = b;
            }
        return out;
    };
    const measure = (el) => {
        if (o.measure)
            return o.measure(el);
        let x = 0, y = 0;
        for (let n = el; n && n !== stage; n = n.offsetParent) {
            x += n.offsetLeft;
            y += n.offsetTop;
        }
        return { x, y, width: el.offsetWidth, height: el.offsetHeight };
    };
    const find = (l) => {
        if (l.type !== 'track' || !l.target || l.target === ':scope')
            return null;
        try {
            const el = stage.querySelector(l.target);
            return el && el !== overlay && !overlay.contains(el) ? el : null;
        }
        catch {
            return null;
        }
    };
    const layerAt = (t) => {
        const el = t?.closest?.('[data-canvas-layer]');
        return el ? items.find((i) => i.el === el)?.id : undefined;
    };
    // --- rendering ----------------------------------------------------------------------------------------------------
    function bind() {
        const next = [];
        for (const l of doc().layers) {
            const el = find(l);
            if (!el || next.some((i) => i.el === el))
                continue;
            const old = items.find((i) => i.id === l.id && i.el === el);
            if (old) {
                next.push(old);
                continue;
            }
            next.push({ id: l.id, el, base: measure(el) });
        }
        for (const i of items)
            if (!next.some((n) => n.el === i.el))
                restore(i.el);
        items = next;
    }
    function render() {
        if (dead)
            return;
        bind();
        const n = items.length;
        const keep = selection.filter((id) => item(id));
        if (keep.length !== selection.length)
            setSel(keep, true);
        if (focusId && !item(focusId))
            focusId = undefined;
        items.forEach((it, i) => {
            const l = layer(it.id), el = it.el, ks = l.keyframes || [];
            for (const p of GEO) {
                const v = held(ks, p, time);
                css(el, p, v === undefined ? undefined : String(v));
            }
            css(el, 'visibility', hidden(it.id) ? 'hidden' : undefined);
            css(el, 'z-index', String(n - i));
            attr(el, 'data-canvas-layer', it.id);
            attr(el, 'role', 'option');
            attr(el, 'aria-selected', String(selection.includes(it.id)));
            attr(el, 'tabindex', it.id === (focusId ?? items[0].id) ? '0' : '-1');
            const r = rec(el);
            if (r.a.has('aria-label') ? r.a.get('aria-label') === null : !el.hasAttribute('aria-label'))
                attr(el, 'aria-label', l.name || null);
            const st = [isLayerLocked(doc(), it.id) && 'locked', hidden(it.id) && 'hidden'].filter(Boolean).join(', ');
            attr(el, 'aria-description', st || null);
        });
        draw();
    }
    function draw() {
        overlay.textContent = '';
        const px = (v) => `${v}px`, lw = 1 / zoom;
        const hs = (coarse ? 22 : 12) / zoom;
        const sel = selection.filter((id) => !hidden(id));
        for (const id of sel) {
            const b = box(id);
            if (!b)
                continue;
            const f = div(`position:absolute;left:${px(b.x)};top:${px(b.y)};width:${px(b.width)};height:${px(b.height)};transform:rotate(${b.rotation}deg);outline:${px(lw)} solid #0a84ff;box-sizing:border-box`, overlay);
            f.setAttribute('data-canvas-box', id);
            if (sel.length !== 1 || selection.length !== 1 || isLayerLocked(doc(), id) || (g && g.mode !== 'pending' && g.mode !== 'resize' && g.mode !== 'rotate'))
                continue;
            const h = (name, l, t, cur) => div(`position:absolute;left:${l};top:${t};width:${px(hs)};height:${px(hs)};margin:${px(-hs / 2)} 0 0 ${px(-hs / 2)};box-sizing:border-box;background:#fff;border:${px(lw)} solid #0a84ff;border-radius:${name === 'rotate' ? '50%' : '2px'};pointer-events:auto;touch-action:none;cursor:${cur}`, f).setAttribute('data-canvas-handle', name);
            for (const [name, x, y, c] of HANDLES)
                h(name, `${x}%`, `${y}%`, `${c}-resize`);
            h('rotate', '50%', px(-24 / zoom), 'grab');
        }
        if (g?.rect)
            div(`position:absolute;left:${px(g.rect.x)};top:${px(g.rect.y)};width:${px(g.rect.width)};height:${px(g.rect.height)};border:${px(lw)} dashed #0a84ff;background:rgba(10,132,255,.08);box-sizing:border-box`, overlay).setAttribute('data-canvas-marquee', '');
        if (g?.gx !== undefined)
            div(`position:absolute;left:${px(g.gx)};top:-100000px;width:0;height:200000px;border-left:${px(lw)} solid #ff2d95`, overlay).setAttribute('data-canvas-guide', 'x');
        if (g?.gy !== undefined)
            div(`position:absolute;top:${px(g.gy)};left:-100000px;height:0;width:200000px;border-top:${px(lw)} solid #ff2d95`, overlay).setAttribute('data-canvas-guide', 'y');
    }
    function setSel(ids, quiet = false) {
        const next = [...new Set(ids)].filter((id) => item(id));
        if (next.length === selection.length && next.every((id, i) => id === selection[i]))
            return;
        selection = next;
        for (const it of items)
            attr(it.el, 'aria-selected', String(selection.includes(it.id)));
        if (!quiet)
            say(selection.length ? `${selection.map(nameOf).join(', ')} selected` : 'Selection cleared');
        draw();
        o.onSelect?.(selection.slice());
    }
    function focusLayer(id) {
        const it = id ? item(id) : undefined;
        if (!it)
            return;
        focusId = it.id;
        for (const i of items)
            attr(i.el, 'tabindex', i === it ? '0' : '-1');
        it.el.focus({ preventScroll: true });
    }
    function view() {
        css(stage, 'transform-origin', zoom === 1 && !pan.x && !pan.y ? undefined : '0 0');
        css(stage, 'transform', zoom === 1 && !pan.x && !pan.y ? undefined : `translate(${r2(pan.x)}px, ${r2(pan.y)}px) scale(${zoom})`);
        draw();
        o.onZoom?.(zoom);
    }
    const clampZ = (z) => r4(Math.min(maxZ, Math.max(minZ, z)));
    const toCanvas = (x, y) => {
        const r = stage.getBoundingClientRect();
        return { x: (x - r.left) / zoom, y: (y - r.top) / zoom };
    };
    function edit(label, e, coalesce) {
        if (!e.ops.length)
            return [];
        history.apply(e.doc, { label, coalesce });
        o.onEdit?.({ label, ops: e.ops });
        return e.ops;
    }
    const moved = (ids) => {
        const b = box(ids[0]);
        if (b)
            say(`${ids.map(nameOf).join(', ')} moved to ${Math.round(b.x)}, ${Math.round(b.y)}`);
    };
    // --- pointer ------------------------------------------------------------------------------------------------------
    const onDown = (ev) => {
        const e = ev;
        if (dead || (e.pointerType === 'mouse' && e.button))
            return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (!attached)
            attach();
        try {
            root.setPointerCapture?.(e.pointerId);
        }
        catch { /* synthetic events */ }
        if (pointers.size === 2 && e.pointerType === 'touch' && g?.mode !== 'pinch')
            return pinch();
        if (pointers.size > 1)
            return;
        const c0 = { x: e.clientX, y: e.clientY }, p0 = toCanvas(c0.x, c0.y);
        const h = e.target?.closest?.('[data-canvas-handle]');
        const mod = e.shiftKey || e.ctrlKey || e.metaKey;
        if (h && overlay.contains(h) && selection.length === 1) {
            const id = selection[0], b = box(id);
            const name = h.getAttribute('data-canvas-handle');
            g = b ? { mode: name === 'rotate' ? 'rotate' : 'resize', handle: name, c0, p0, id, box: b, start: doc(), label: name === 'rotate' ? 'Rotate' : 'Resize' } : { mode: 'noop', c0, p0 };
            if (b && name !== 'rotate')
                g.lines = snapLines(Object.values(visibleBoxes([id])).map(canvasBounds), guides);
        }
        else {
            const id = layerAt(e.target);
            if (id) {
                const was = selection.includes(id);
                if (!was)
                    setSel(mod ? [...selection, id] : [id]);
                focusLayer(id);
                g = { mode: 'pending', c0, p0, id, toggle: mod && was };
            }
            else
                g = { mode: 'marquee-pending', c0, p0, keep: e.shiftKey ? selection.slice() : [] };
        }
        e.preventDefault();
    };
    const onMove = (ev) => {
        const e = ev;
        if (!pointers.has(e.pointerId) || !g)
            return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (g.mode === 'pinch')
            return pinchMove();
        if (g.mode === 'noop' || pointers.size > 1)
            return;
        const p = toCanvas(e.clientX, e.clientY);
        let dx = p.x - g.p0.x, dy = p.y - g.p0.y;
        const far = Math.hypot(e.clientX - g.c0.x, e.clientY - g.c0.y) >= 3;
        const th = sn ? sn.threshold / zoom : 0, snapOn = !!sn && !e.altKey, gr = sn?.grid ? grid : 0;
        if (g.mode === 'pending') {
            if (!far)
                return;
            const ids = movable(selection);
            if (!ids.length) {
                g = { ...g, mode: 'noop' };
                return;
            }
            const bx = ids.map((id) => canvasBounds(box(id)));
            const x = Math.min(...bx.map((b) => b.x)), y = Math.min(...bx.map((b) => b.y));
            const others = Object.values(visibleBoxes(selection)).map(canvasBounds);
            g = { ...g, mode: 'move', ids, start: doc(), label: 'Move', bounds: { x, y, width: Math.max(...bx.map((b) => b.x + b.width)) - x, height: Math.max(...bx.map((b) => b.y + b.height)) - y },
                lines: snapLines(sn?.siblings === false ? [] : others, sn?.guides === false ? {} : guides) };
        }
        if (g.mode === 'marquee-pending') {
            if (!far)
                return;
            g.mode = 'marquee';
        }
        g.gx = g.gy = undefined;
        if (g.mode === 'move') {
            if (snapOn) {
                const s = snapRect({ ...g.bounds, x: g.bounds.x + dx, y: g.bounds.y + dy }, g.lines, { threshold: th, grid: gr });
                dx += s.dx;
                dy += s.dy;
                g.gx = s.x;
                g.gy = s.y;
            }
            const ed = canvasMove(g.start, g.ids, time, bases(), dx, dy);
            begin();
            g.ops = ed.ops;
            history.apply(ed.doc);
            draw();
        }
        else if (g.mode === 'marquee') {
            const r = { x: Math.min(g.p0.x, p.x), y: Math.min(g.p0.y, p.y), width: Math.abs(dx), height: Math.abs(dy) };
            g.rect = r;
            setSel([...g.keep, ...marqueeHits(visibleBoxes(), r)], true);
            draw();
        }
        else if (g.mode === 'resize' || g.mode === 'rotate') {
            const b0 = g.box;
            let nb;
            if (g.mode === 'rotate')
                nb = { rotation: rotationFromPointer(b0, g.p0, p, b0.rotation, e.shiftKey ? 15 : 0) };
            else {
                const r = resizeBox(b0, g.handle, dx, dy, { keepAspect: e.shiftKey });
                if (snapOn && !e.shiftKey && !(b0.rotation % 360)) {
                    const se = (v, ls) => { const s = snapValue(v, ls, th); return s.line !== undefined ? s : { value: snapToGrid(v, gr) }; };
                    const hx = g.handle.includes('e') ? 1 : g.handle.includes('w') ? -1 : 0, hy = g.handle.includes('s') ? 1 : g.handle.includes('n') ? -1 : 0;
                    if (hx > 0) {
                        const s = se(r.x + r.width, g.lines.x);
                        r.width = Math.max(1, s.value - r.x);
                        g.gx = s.line;
                    }
                    if (hx < 0) {
                        const s = se(r.x, g.lines.x);
                        r.width = Math.max(1, r.x + r.width - s.value);
                        r.x = s.value;
                        g.gx = s.line;
                    }
                    if (hy > 0) {
                        const s = se(r.y + r.height, g.lines.y);
                        r.height = Math.max(1, s.value - r.y);
                        g.gy = s.line;
                    }
                    if (hy < 0) {
                        const s = se(r.y, g.lines.y);
                        r.height = Math.max(1, r.y + r.height - s.value);
                        r.y = s.value;
                        g.gy = s.line;
                    }
                }
                nb = r;
            }
            const ed = canvasSetBox(g.start, g.id, time, item(g.id).base, nb);
            begin();
            g.ops = ed.ops;
            history.apply(ed.doc);
            draw();
        }
    };
    const begin = () => {
        if (g && !g.began) {
            history.begin(g.label);
            g.began = true;
        }
    };
    const end = (commit) => {
        const cur = g;
        g = null;
        if (cur?.began) {
            if (commit) {
                history.commit();
                if (cur.ops?.length) {
                    o.onEdit?.({ label: cur.label, ops: cur.ops });
                    if (cur.mode === 'move')
                        moved(cur.ids);
                    else
                        say(`${nameOf(cur.id)} ${cur.mode === 'rotate' ? 'rotated' : 'resized'}`);
                }
            }
            else
                history.cancel();
        }
        if (cur?.mode === 'marquee' && selection.length)
            say(`${selection.map(nameOf).join(', ')} selected`);
        draw();
    };
    const onUp = (ev) => {
        const e = ev;
        if (!pointers.has(e.pointerId))
            return;
        pointers.delete(e.pointerId);
        const cur = g;
        if (cur?.mode === 'pinch') {
            if (pointers.size)
                g = { mode: 'noop', c0: cur.c0, p0: cur.p0 };
            else
                g = null;
        }
        else if (cur && !pointers.size) {
            if (cur.mode === 'pending') {
                if (cur.toggle)
                    setSel(selection.filter((id) => id !== cur.id));
                else if (!(e.shiftKey || e.ctrlKey || e.metaKey) && selection.length > 1)
                    setSel([cur.id]);
            }
            else if (cur.mode === 'marquee-pending' && !e.shiftKey)
                setSel([]);
            end(true);
        }
        if (!pointers.size)
            detach();
    };
    const onCancel = (ev) => {
        const e = ev;
        if (!pointers.has(e.pointerId))
            return;
        pointers.delete(e.pointerId);
        if (g?.mode !== 'pinch' || !pointers.size)
            end(false);
        if (!pointers.size)
            detach();
    };
    function pinch() {
        if (g?.began)
            history.cancel();
        const [a, b] = [...pointers.values()];
        const m0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        g = { mode: 'pinch', c0: m0, p0: m0, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: zoom, m0, pan0: { ...pan }, P: toCanvas(m0.x, m0.y) };
        draw();
    }
    function pinchMove() {
        const [a, b] = [...pointers.values()];
        if (!a || !b || !g)
            return;
        const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        zoom = clampZ((g.z0 * Math.hypot(a.x - b.x, a.y - b.y)) / g.d0);
        pan = { x: g.pan0.x + m.x - g.m0.x + g.P.x * (g.z0 - zoom), y: g.pan0.y + m.y - g.m0.y + g.P.y * (g.z0 - zoom) };
        view();
    }
    const onWheel = (ev) => {
        const e = ev;
        if (!(e.ctrlKey || e.metaKey))
            return;
        e.preventDefault();
        api.setZoom(zoom * Math.exp(-e.deltaY * 0.01), { x: e.clientX, y: e.clientY });
    };
    function attach() {
        attached = true;
        root.addEventListener('pointermove', onMove);
        root.addEventListener('pointerup', onUp);
        root.addEventListener('pointercancel', onCancel);
    }
    function detach() {
        attached = false;
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onCancel);
    }
    // --- keyboard -----------------------------------------------------------------------------------------------------
    const onKey = (ev) => {
        const e = ev;
        const t = e.target;
        if (dead || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''))))
            return;
        const mod = e.ctrlKey || e.metaKey, k = e.key, code = e.code;
        const ids = items.map((i) => i.id);
        const cur = layerAt(t) ?? focusId;
        const done = () => e.preventDefault();
        if (k === 'Escape') {
            if (g?.began)
                end(false);
            else
                setSel([]);
            return done();
        }
        if (mod && !e.altKey) {
            if (k.toLowerCase() === 'a' && !e.shiftKey) {
                setSel(ids.filter((id) => !hidden(id)));
                return done();
            }
            const br = code === 'BracketRight' || k === ']' || k === '}' ? 1 : code === 'BracketLeft' || k === '[' || k === '{' ? -1 : 0;
            if (br && selection.length) {
                const to = e.shiftKey ? (br > 0 ? 'front' : 'back') : br > 0 ? 'forward' : 'backward';
                let d = doc();
                const ops = [];
                for (const id of br > 0 ? selection : [...selection].reverse()) {
                    const r = canvasReorder(d, id, to);
                    d = r.doc;
                    ops.push(...r.ops);
                }
                if (edit('Reorder', { doc: d, ops }).length)
                    say(`${selection.map(nameOf).join(', ')} moved ${to}`);
                return done();
            }
            if (e.shiftKey && (code === 'KeyL' || k.toLowerCase() === 'l') && selection.length) {
                const v = !selection.every((id) => layer(id)?.locked);
                api.lock(selection, v);
                return done();
            }
            if (e.shiftKey && (code === 'KeyH' || k.toLowerCase() === 'h') && selection.length) {
                api.hide(selection, !selection.every((id) => layer(id)?.muted));
                return done();
            }
            return;
        }
        const at = cur ? ids.indexOf(cur) : -1;
        const go = (i, sel) => {
            const id = ids[Math.max(0, Math.min(ids.length - 1, i))];
            if (id === undefined)
                return;
            focusLayer(id);
            if (sel)
                setSel(e.shiftKey ? [...selection, id] : [id]);
            else
                say(`${nameOf(id)}${selection.includes(id) ? ', selected' : ''}`);
        };
        if (ARROWS[k]) {
            const [x, y] = ARROWS[k];
            if (e.altKey || !selection.length) {
                go(at + (x + y > 0 ? 1 : -1), e.altKey);
                return done();
            }
            const s = e.shiftKey ? 10 : 1;
            const ids2 = movable(selection);
            if (edit('Nudge', canvasMove(doc(), ids2, time, bases(), x * s, y * s), 'nudge').length)
                moved(ids2);
            return done();
        }
        if (k === 'Home' || k === 'End') {
            go(k === 'Home' ? 0 : ids.length - 1, true);
            return done();
        }
        if ((k === ' ' || code === 'Space') && cur) {
            api.select([cur], { toggle: true });
            return done();
        }
        if (k === 'Enter' && cur) {
            setSel([cur]);
            return done();
        }
    };
    const unKeys = bindHistoryKeys(root, history);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('keydown', onKey);
    root.addEventListener('wheel', onWheel, { passive: false });
    const unsub = history.subscribe(render);
    if (o.zoom && o.zoom !== 1) {
        zoom = clampZ(o.zoom);
        view();
    }
    render();
    const api = {
        root,
        get selection() { return selection.slice(); },
        get focused() { return focusId; },
        get zoom() { return zoom; },
        layers: () => items.map((i) => i.id),
        getBox: (id) => box(id),
        select(ids, s = {}) {
            if (s.toggle) {
                const set = new Set(selection);
                for (const id of ids)
                    set.has(id) ? set.delete(id) : set.add(id);
                setSel([...set]);
            }
            else
                setSel(s.add ? [...selection, ...ids] : ids);
        },
        selectAll: () => setSel(items.map((i) => i.id).filter((id) => !hidden(id))),
        clearSelection: () => setSel([]),
        focus: (id) => focusLayer(id),
        move(dx, dy, ids = selection) {
            const m = movable(ids), ops = edit('Move', canvasMove(doc(), m, time, bases(), dx, dy));
            if (ops.length)
                moved(m);
            return ops;
        },
        setBox(id, b) {
            const it = item(id);
            return it ? edit('Transform', canvasSetBox(doc(), id, time, it.base, b)) : [];
        },
        reorder: (id, to) => edit('Reorder', canvasReorder(doc(), id, to)),
        lock(ids = selection, v = true) {
            const ops = edit(v ? 'Lock' : 'Unlock', canvasSetLocked(doc(), ids, v));
            if (ops.length)
                say(`${ids.map(nameOf).join(', ')} ${v ? 'locked' : 'unlocked'}`);
            return ops;
        },
        hide(ids = selection, v = true) {
            const ops = edit(v ? 'Hide' : 'Show', canvasSetHidden(doc(), ids, v));
            if (ops.length)
                say(`${ids.map(nameOf).join(', ')} ${v ? 'hidden' : 'shown'}`);
            return ops;
        },
        setTime(ms) { time = Math.max(0, ms); render(); },
        setZoom(z, origin) {
            const nz = clampZ(z);
            if (origin) {
                const P = toCanvas(origin.x, origin.y);
                pan = { x: pan.x + P.x * (zoom - nz), y: pan.y + P.y * (zoom - nz) };
            }
            zoom = nz;
            view();
        },
        setGrid(px) { grid = Math.max(0, px || 0); },
        setGuides(gd) { guides = gd || {}; },
        refresh() {
            for (const it of items) {
                for (const p of ['translate', 'rotate', 'width', 'height'])
                    css(it.el, p, undefined);
                it.base = measure(it.el);
            }
            render();
        },
        destroy() {
            if (dead)
                return;
            if (g?.began)
                history.cancel();
            g = null;
            pointers.clear();
            detach();
            dead = true;
            unsub();
            unKeys();
            root.removeEventListener('pointerdown', onDown);
            root.removeEventListener('keydown', onKey);
            root.removeEventListener('wheel', onWheel, { passive: false });
            overlay.remove();
            status.remove();
            for (const el of [...saved.keys()])
                restore(el);
            items = [];
            selection = [];
        },
    };
    return api;
}

export { STUDIO_CANVAS_VERSION, applyCanvasOps, canvasBounds, canvasBox, canvasMove, canvasReorder, canvasSetBox, canvasSetHidden, canvasSetLocked, createStudioCanvas, marqueeHits, readCanvasGeometry, rectsIntersect, resizeBox, rotationFromPointer, snapLines, snapRect, snapToGrid, snapValue };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.9.0/dist/components/studio-canvas.js.map