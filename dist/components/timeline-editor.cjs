'use strict';

var format = require('../chunks/format-DrRrPbjl.cjs');
var ease$1 = require('../chunks/ease-HwYZnZat.cjs');
var base = require('../chunks/base-BvH4nAcv.cjs');
var scene = require('../chunks/scene-C4h75wjo.cjs');

/**
 * 13.6: editing operations on a `motionary-timeline` document. Every operation
 * is pure: it returns a new document (unchanged layers are shared, so history
 * snapshots stay cheap) and never edits a locked layer.
 */
const bad = (path, message) => new format.TimelineDocError([{ path, message }]);
const round$1 = (n) => {
    const r = Math.round(n * 1e4) / 1e4;
    return r === 0 ? 0 : r;
};
const byTime = (ks) => ks.map((k, i) => [k, i]).sort((a, b) => a[0].time - b[0].time || a[1] - b[1]).map(([k]) => k);
/** A fresh id `prefix<n>` unused by any layer or keyframe of `doc`. */
function uniqueId(doc, prefix = 'id', taken = new Set()) {
    const used = new Set(taken);
    for (const l of doc.layers) {
        used.add(l.id);
        for (const k of l.keyframes || [])
            used.add(k.id);
    }
    let n = 1;
    while (used.has(`${prefix}${n}`))
        n++;
    return `${prefix}${n}`;
}
/** Ids of a layer and every layer below it in its groups. */
function layerSubtree(doc, id) {
    const out = [id];
    for (let i = 0; i < out.length; i++)
        for (const l of doc.layers)
            if (l.parent === out[i] && !out.includes(l.id))
                out.push(l.id);
    return out;
}
/** Add a track or group layer (`id` defaults to a fresh one). */
function addLayer(doc, layer, o = {}) {
    const id = layer.id ?? uniqueId(doc, layer.type === 'group' ? 'g' : 'l');
    if (doc.layers.some((l) => l.id === id))
        throw bad('id', `duplicate layer id "${id}"`);
    const n = { ...layer, id, type: layer.type ?? 'track' };
    if (n.type === 'track' && !n.keyframes)
        n.keyframes = [];
    if (n.parent !== undefined && doc.layers.find((l) => l.id === n.parent)?.type !== 'group')
        throw bad('parent', `no group "${n.parent}"`);
    if (n.parent !== undefined && format.isLayerLocked(doc, n.parent))
        return doc;
    const layers = doc.layers.slice();
    let at = o.index ?? layers.length;
    if (o.index === undefined && n.parent !== undefined) {
        const sub = layerSubtree(doc, n.parent);
        at = Math.max(...sub.map((s) => layers.findIndex((l) => l.id === s))) + 1;
    }
    layers.splice(Math.max(0, Math.min(at, layers.length)), 0, n);
    return { ...doc, layers };
}
/** Remove layers (a group takes its children with it). Locked layers stay. */
function removeLayers(doc, ids) {
    const drop = new Set();
    for (const id of ids)
        if (!format.isLayerLocked(doc, id))
            for (const s of layerSubtree(doc, id))
                if (!format.isLayerLocked(doc, s))
                    drop.add(s);
    if (!drop.size)
        return doc;
    return { ...doc, layers: doc.layers.filter((l) => !drop.has(l.id)) };
}
/** Change layer fields (`name`, `locked`, `muted`, `solo`, `target`). On a locked layer only `locked`, `muted` and `solo` change (playback state, not content). */
function updateLayers(doc, ids, patch) {
    const set = new Set(ids);
    let changed = false;
    const layers = doc.layers.map((l) => {
        if (!set.has(l.id))
            return l;
        const p = { ...patch };
        if (format.isLayerLocked(doc, l.id)) {
            delete p.name;
            delete p.target;
        }
        if (l.type === 'group')
            delete p.target;
        const n = { ...l, ...p };
        for (const f of ['locked', 'muted', 'solo'])
            if (!n[f])
                delete n[f];
        if (n.name === undefined)
            delete n.name;
        if (JSON.stringify(n) === JSON.stringify(l))
            return l;
        changed = true;
        return n;
    });
    return changed ? { ...doc, layers } : doc;
}
/** Put layers into a new group placed where the first of them was. Returns the document and the group id. */
function groupLayers(doc, ids, group = {}) {
    const members = doc.layers.filter((l) => ids.includes(l.id) && !format.isLayerLocked(doc, l.id));
    if (!members.length)
        return { doc, id: '' };
    const id = group.id ?? uniqueId(doc, 'g');
    if (doc.layers.some((l) => l.id === id))
        throw bad('id', `duplicate layer id "${id}"`);
    const parent = members[0].parent;
    const moving = new Set();
    for (const m of members)
        for (const s of layerSubtree(doc, m.id))
            moving.add(s);
    const memberIds = new Set(members.map((m) => m.id));
    // a member nested inside another member stays where it is
    for (const m of members)
        for (let p = m.parent; p; p = doc.layers.find((l) => l.id === p)?.parent)
            if (memberIds.has(p))
                memberIds.delete(m.id);
    const first = doc.layers.findIndex((l) => moving.has(l.id));
    const block = doc.layers.filter((l) => moving.has(l.id)).map((l) => (memberIds.has(l.id) ? withParent(l, id) : l));
    const g = { id, type: 'group' };
    if (group.name)
        g.name = group.name;
    if (parent !== undefined && !moving.has(parent))
        g.parent = parent;
    const rest = doc.layers.filter((l) => !moving.has(l.id));
    const insertAt = doc.layers.slice(0, first).filter((l) => !moving.has(l.id)).length;
    rest.splice(insertAt, 0, g, ...block);
    return { doc: { ...doc, layers: rest }, id };
}
const withParent = (l, parent) => {
    if (l.parent === parent)
        return l;
    const n = { ...l };
    if (parent === undefined)
        delete n.parent;
    else
        n.parent = parent;
    return n;
};
/** Dissolve a group: its children move up to the group's parent. */
function ungroupLayer(doc, groupId) {
    const g = doc.layers.find((l) => l.id === groupId);
    if (!g || g.type !== 'group' || format.isLayerLocked(doc, groupId))
        return doc;
    return { ...doc, layers: doc.layers.filter((l) => l.id !== groupId).map((l) => (l.parent === groupId ? withParent(l, g.parent) : l)) };
}
/**
 * Move a layer (with its children) so it sits at `toIndex` among its siblings
 * (layers with the same parent), or into another group with `{ parent }`.
 */
function moveLayer(doc, id, toIndex, o = {}) {
    const layer = doc.layers.find((l) => l.id === id);
    if (!layer || format.isLayerLocked(doc, id))
        return doc;
    const sub = new Set(layerSubtree(doc, id));
    const parent = o.parent === undefined ? layer.parent : o.parent === null ? undefined : o.parent;
    if (parent !== undefined) {
        const p = doc.layers.find((l) => l.id === parent);
        if (!p || p.type !== 'group' || sub.has(parent))
            throw bad('parent', `cannot move "${id}" into "${parent}"`);
        if (format.isLayerLocked(doc, parent))
            return doc;
    }
    const block = doc.layers.filter((l) => sub.has(l.id)).map((l) => (l.id === id ? withParent(l, parent) : l));
    const rest = doc.layers.filter((l) => !sub.has(l.id));
    const siblings = rest.filter((l) => l.parent === parent);
    const i = Math.max(0, Math.min(Math.round(toIndex), siblings.length));
    let at;
    if (i < siblings.length)
        at = rest.indexOf(siblings[i]);
    else if (siblings.length) {
        const last = layerSubtree({ ...doc, layers: rest }, siblings[siblings.length - 1].id);
        at = Math.max(...last.map((s) => rest.findIndex((l) => l.id === s))) + 1;
    }
    else
        at = parent === undefined ? rest.length : rest.findIndex((l) => l.id === parent) + 1;
    rest.splice(at, 0, ...block);
    const same = rest.every((l, k) => l === doc.layers[k]);
    return same ? doc : { ...doc, layers: rest };
}
// --- keyframes ----------------------------------------------------------------
/** Where each keyframe id lives (`[layer index, keyframe index]`). */
const locate = (doc) => {
    const m = new Map();
    for (const l of doc.layers)
        for (const k of l.keyframes || [])
            m.set(k.id, l);
    return m;
};
/** Map selected, editable keyframes; layers whose keyframes did not change are shared. */
function mapKeyframes(doc, ids, fn) {
    const sel = new Set(ids);
    let changed = false;
    const layers = doc.layers.map((l) => {
        if (!l.keyframes?.some((k) => sel.has(k.id)) || format.isLayerLocked(doc, l.id))
            return l;
        const ks = [];
        for (const k of l.keyframes) {
            const n = sel.has(k.id) ? fn(k) : k;
            if (n !== k)
                changed = true;
            if (n)
                ks.push(n);
        }
        return { ...l, keyframes: byTime(ks) };
    });
    return changed ? { ...doc, layers } : doc;
}
/** Selected keyframe ids that can be edited (exist, layer not locked). */
function editableKeyframes(doc, ids) {
    const where = locate(doc);
    return ids.filter((id) => where.has(id) && !format.isLayerLocked(doc, where.get(id).id));
}
/** Add a keyframe to a track (`id` defaults to a fresh one). */
function addKeyframe(doc, layerId, kf) {
    const l = doc.layers.find((x) => x.id === layerId);
    if (!l || l.type !== 'track')
        throw bad('layer', `no track "${layerId}"`);
    if (format.isLayerLocked(doc, layerId))
        return doc;
    const id = kf.id ?? uniqueId(doc, 'k');
    if (locate(doc).has(id))
        throw bad('id', `duplicate keyframe id "${id}"`);
    if (kf.easing !== undefined && !format.isValidEasing(kf.easing))
        throw bad('easing', `unknown easing "${kf.easing}"`);
    const n = { id, time: Math.max(0, round$1(kf.time)), props: { ...kf.props } };
    if (kf.easing !== undefined)
        n.easing = kf.easing;
    return { ...doc, layers: doc.layers.map((x) => (x === l ? { ...l, keyframes: byTime([...(l.keyframes || []), n]) } : x)) };
}
/** Change one keyframe's props (merged; `null` removes a prop). */
function setKeyframeProps(doc, id, props) {
    return mapKeyframes(doc, [id], (k) => {
        const p = { ...k.props };
        for (const [name, v] of Object.entries(props))
            if (v === null)
                delete p[name];
            else
                p[name] = v;
        return { ...k, props: p };
    });
}
/** Delete keyframes. */
const removeKeyframes = (doc, ids) => mapKeyframes(doc, ids, () => null);
/** Move keyframes by `dt` ms, keeping their spacing (the move stops at 0). */
function shiftKeyframes(doc, ids, dt) {
    const ok = editableKeyframes(doc, ids);
    if (!ok.length || !dt)
        return doc;
    const where = locate(doc);
    const min = Math.min(...ok.map((id) => where.get(id).keyframes.find((k) => k.id === id).time));
    const d = Math.max(dt, -min);
    return d ? mapKeyframes(doc, ok, (k) => ({ ...k, time: round$1(k.time + d) })) : doc;
}
/** Scale keyframe times by `factor` (> 0) around `pivot` (default: the earliest selected keyframe). */
function scaleKeyframes(doc, ids, factor, pivot) {
    if (!(factor > 0) || !Number.isFinite(factor))
        throw bad('factor', 'expected a positive number');
    const ok = editableKeyframes(doc, ids);
    if (!ok.length || factor === 1)
        return doc;
    const where = locate(doc);
    const p = pivot ?? Math.min(...ok.map((id) => where.get(id).keyframes.find((k) => k.id === id).time));
    return mapKeyframes(doc, ok, (k) => ({ ...k, time: Math.max(0, round$1(p + (k.time - p) * factor)) }));
}
/** Set the easing of every selected keyframe (`'linear'` clears it). */
function setKeyframeEasing(doc, ids, easing) {
    if (!format.isValidEasing(easing))
        throw bad('easing', `unknown easing "${easing}"`);
    return mapKeyframes(doc, ids, (k) => {
        if ((k.easing ?? 'linear') === easing)
            return k;
        const n = { ...k };
        if (easing === 'linear')
            delete n.easing;
        else
            n.easing = easing;
        return n;
    });
}
/** Copy keyframes (relative times) for `pasteKeyframes`. */
function copyKeyframes(doc, ids) {
    const sel = new Set(ids);
    const found = [];
    for (const l of doc.layers)
        for (const k of l.keyframes || [])
            if (sel.has(k.id))
                found.push({ layer: l.id, k });
    const t0 = found.length ? Math.min(...found.map((f) => f.k.time)) : 0;
    return {
        format: 'motionary-timeline-clip',
        version: 1,
        items: found.map(({ layer, k }) => ({ layer, time: round$1(k.time - t0), props: { ...k.props }, ...(k.easing ? { easing: k.easing } : {}) })),
    };
}
/**
 * Paste a clip at `at` ms: onto its source layers, or all onto `layer`.
 * Returns the document and the new keyframe ids (fresh, deterministic).
 */
function pasteKeyframes(doc, clip, o) {
    if (!clip || clip.format !== 'motionary-timeline-clip' || !Array.isArray(clip.items))
        throw bad('clip', 'not a keyframe clip');
    const taken = new Set();
    const ids = [];
    let out = doc;
    for (const it of clip.items) {
        const target = o.layer ?? it.layer;
        const l = out.layers.find((x) => x.id === target);
        if (!l || l.type !== 'track' || format.isLayerLocked(out, target))
            continue;
        const id = uniqueId(out, 'k', taken);
        taken.add(id);
        out = addKeyframe(out, target, { id, time: Math.max(0, o.at + it.time), props: it.props, ...(it.easing ? { easing: it.easing } : {}) });
        ids.push(id);
    }
    return { doc: out, ids };
}

function createTimelineHistory(initial, o = {}) {
    const limit = Math.max(1, Math.floor(o.limit ?? 100));
    const window = o.coalesceMs ?? 1000;
    const clock = o.now ?? Date.now;
    let doc = initial;
    let undo = [];
    let redo = [];
    let tx = null;
    const subs = new Set();
    const emit = () => subs.forEach((fn) => fn(doc));
    const push = (e) => {
        undo.push(e);
        if (undo.length > limit)
            undo.splice(0, undo.length - limit);
        redo = [];
    };
    const h = {
        get doc() { return doc; },
        get canUndo() { return !tx && undo.length > 0; },
        get canRedo() { return !tx && redo.length > 0; },
        get undoLabel() { return undo[undo.length - 1]?.label; },
        get redoLabel() { return redo[redo.length - 1]?.label; },
        get size() { return undo.length; },
        apply(change, a = {}) {
            const next = typeof change === 'function' ? change(doc) : change;
            if (!next || next === doc)
                return doc;
            const before = doc;
            doc = next;
            if (!tx) {
                const top = undo[undo.length - 1];
                const t = clock();
                if (a.coalesce && top && top.key === a.coalesce && redo.length === 0 && t - top.at <= window) {
                    top.after = doc;
                    top.at = t;
                    if (top.after === top.before)
                        undo.pop();
                }
                else
                    push({ before, after: doc, label: a.label, key: a.coalesce, at: t });
            }
            emit();
            return doc;
        },
        begin(label) {
            if (!tx)
                tx = { before: doc, label };
        },
        commit() {
            if (!tx)
                return;
            const { before, label } = tx;
            tx = null;
            if (before !== doc)
                push({ before, after: doc, label, at: clock() });
        },
        cancel() {
            if (!tx)
                return;
            const changed = tx.before !== doc;
            doc = tx.before;
            tx = null;
            if (changed)
                emit();
        },
        undo() {
            if (tx)
                h.commit();
            const e = undo.pop();
            if (!e)
                return false;
            redo.push(e);
            doc = e.before;
            emit();
            return true;
        },
        redo() {
            if (tx)
                h.commit();
            const e = redo.pop();
            if (!e)
                return false;
            undo.push(e);
            doc = e.after;
            emit();
            return true;
        },
        reset(d) {
            tx = null;
            undo = [];
            redo = [];
            doc = d;
            emit();
        },
        subscribe(fn) {
            subs.add(fn);
            return () => subs.delete(fn);
        },
    };
    return h;
}
/** Keys `bindHistoryKeys` maps: ⌘/Ctrl+Z undo, ⇧⌘/Ctrl+Shift+Z or Ctrl+Y redo. */
function historyKeyAction(e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey)
        return null;
    const k = e.key.toLowerCase();
    if (k === 'z')
        return e.shiftKey ? 'redo' : 'undo';
    if (k === 'y' && e.ctrlKey && !e.shiftKey)
        return 'redo';
    return null;
}
/**
 * Wire the undo / redo shortcuts on `target` (an editor root or `document`).
 * Ignored while typing in a text field (its own undo wins). Returns an unbind function.
 */
function bindHistoryKeys(target, history) {
    const onKey = (ev) => {
        const e = ev;
        const action = historyKeyAction(e);
        if (!action)
            return;
        const el = (e.composedPath?.()[0] ?? e.target);
        if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName || '')))
            return;
        e.preventDefault();
        history[action]();
    };
    target.addEventListener('keydown', onKey);
    return () => target.removeEventListener('keydown', onKey);
}

/**
 * 13.6: reproducible preview. `sampleTimelineDoc(doc, t)` is a pure function of
 * the document and the time — the same time always gives the same frame state,
 * whatever was seeked before (scrubbing back and forth, jumping, playing), and
 * `random(a, b)` values depend only on the seed. `createTimelinePreview` writes
 * that state to the DOM; `createFixedClock` drives it in fixed steps for tests.
 */
const round = (n) => {
    const r = Math.round(n * 1e4) / 1e4;
    return r === 0 ? 0 : r;
};
const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hexRgb = (h) => {
    const m = HEX.exec(h.trim());
    if (!m)
        return h;
    const s = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return `rgb(${parseInt(s.slice(0, 2), 16)}, ${parseInt(s.slice(2, 4), 16)}, ${parseInt(s.slice(4, 6), 16)})`;
};
const easeCache = /*#__PURE__*/ new Map();
const ease = (e) => {
    const k = e || 'linear';
    let f = easeCache.get(k);
    if (!f) {
        try {
            f = ease$1.parseEase(k);
        }
        catch {
            f = ease$1.parseEase('linear');
        }
        easeCache.set(k, f);
    }
    return f;
};
/**
 * Interpolate two values at `p` (0–1): numbers, and strings whose non-numeric
 * parts match (`translateX(10px) scale(1)`, `rgb(…)`, `#hex` colours); anything
 * else switches at the midpoint (like CSS discrete animation). `p` outside 0–1
 * (overshooting easings) extrapolates numbers.
 */
function interpolateValue(a, b, p) {
    // eased progress may leave 0–1 (back / elastic overshoot): numbers extrapolate, discrete values clamp
    if (p === 0)
        return a;
    if (p === 1)
        return b;
    if (typeof a === 'number' && typeof b === 'number')
        return round(a + (b - a) * p);
    const sa = HEX.test(String(a).trim()) && HEX.test(String(b).trim()) ? hexRgb(String(a)) : String(a);
    const sb = sa !== String(a) ? hexRgb(String(b)) : String(b);
    const na = sa.match(NUM) || [];
    const nb = sb.match(NUM) || [];
    if (na.length && na.length === nb.length && sa.replace(NUM, '#') === sb.replace(NUM, '#')) {
        let i = 0;
        const rgb = /^rgba?\(/.test(sa);
        return sa.replace(NUM, () => {
            const k = i++;
            const v = +na[k] + (+nb[k] - +na[k]) * p;
            return String(rgb && k < 3 ? Math.min(255, Math.max(0, Math.round(v))) : round(v));
        });
    }
    return p < 0.5 ? a : b;
}
/** The frame state at `time` ms (active tracks only; mute / solo applied; `random()` resolved by seed). */
function sampleTimelineDoc(doc, time) {
    const total = format.timelineDocDuration(doc);
    const t = Math.min(Math.max(Number.isFinite(time) ? time : 0, 0), total);
    const seed = doc.seed ?? 1;
    const layers = {};
    for (const l of doc.layers) {
        if (l.type !== 'track' || !l.keyframes?.length || !format.isLayerActive(doc, l.id))
            continue;
        const ks = l.keyframes.map((k, i) => [k, i]).sort((x, y) => x[0].time - y[0].time || x[1] - y[1]).map(([k]) => k);
        const names = [];
        for (const k of ks)
            for (const n of Object.keys(k.props))
                if (!names.includes(n))
                    names.push(n);
        const state = {};
        for (const name of names.sort()) {
            const own = ks.filter((k) => name in k.props);
            const val = (i) => format.resolveRandom(own[i].props[name], seed, `${l.id}/${own[i].id}/${name}`);
            let i = 0;
            while (i < own.length - 1 && own[i + 1].time <= t)
                i++;
            if (t <= own[0].time)
                state[name] = val(0);
            else if (i >= own.length - 1)
                state[name] = val(own.length - 1);
            else {
                const a = own[i], b = own[i + 1];
                const span = b.time - a.time;
                state[name] = interpolateValue(val(i), val(i + 1), span > 0 ? ease(a.easing)((t - a.time) / span) : 1);
            }
        }
        layers[l.id] = state;
    }
    return { time: t, layers };
}
/** A clock that only moves in fixed steps (default 1000/60 ms) — frame n is always at n × step. */
function createFixedClock(o = {}) {
    const step = o.step && o.step > 0 ? o.step : 1000 / 60;
    let n = Math.round((o.start ?? 0) / step);
    const at = () => round(n * step);
    return {
        get time() { return at(); },
        step,
        tick(k = 1) { n += Math.round(k); return at(); },
        set(ms) { n = Math.round(ms / step); return at(); },
    };
}
const cssName = (p) => (p.startsWith('--') ? p : p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
const pick = (root, sel) => {
    if (sel === ':scope')
        return [root];
    try {
        return Array.from(root.querySelectorAll(sel));
    }
    catch {
        return [];
    }
};
/**
 * Drive the elements under `root` from a timeline document. Each `seek()`
 * writes the full frame state (and clears properties no longer animated), so
 * the DOM at time t is the same however you got there.
 */
function createTimelinePreview(root, doc, o = {}) {
    let d = doc;
    let t = 0;
    let id = 0;
    const written = new Map();
    const render = (ms) => {
        const f = sampleTimelineDoc(d, ms);
        t = f.time;
        const next = new Map();
        for (const l of d.layers) {
            const state = f.layers[l.id];
            if (!state)
                continue;
            for (const el of pick(root, l.target || ':scope')) {
                const m = next.get(el) || new Map();
                for (const [p, v] of Object.entries(state))
                    m.set(cssName(p), String(v));
                next.set(el, m);
            }
        }
        for (const [el, props] of written)
            for (const p of props)
                if (!next.get(el)?.has(p))
                    el.style.removeProperty(p);
        written.clear();
        for (const [el, m] of next) {
            for (const [p, v] of m)
                el.style.setProperty(p, v);
            written.set(el, new Set(m.keys()));
        }
        o.onFrame?.(f);
        return f;
    };
    const stop = () => {
        if (id)
            base.caf(id);
        id = 0;
    };
    const p = {
        get time() { return t; },
        get duration() { return format.timelineDocDuration(d); },
        seek: (ms) => render(ms),
        setDoc(next) { d = next; render(t); },
        play() {
            stop();
            if (t >= p.duration)
                t = 0;
            let last = base.now();
            const loop = () => {
                const n = base.now();
                render(t + (n - last));
                last = n;
                id = t < p.duration ? base.raf(loop, root) : 0;
            };
            id = base.raf(loop, root);
        },
        pause: stop,
        advance(n = 1) {
            const c = o.clock || createFixedClock({ start: t });
            if (!o.clock)
                o.clock = c;
            return render(c.tick(n));
        },
        destroy() {
            stop();
            for (const [el, props] of written)
                for (const prop of props)
                    el.style.removeProperty(prop);
            written.clear();
        },
    };
    return p;
}

/**
 * 13.6: JSON Schema (draft 2020-12) of `motionary-timeline` v1, for editors and
 * other tools. `validateTimelineDoc` is the authority: it also checks what a
 * schema cannot (unique ids across layers, parents that are groups, no group
 * cycles, valid easings, total keyframe limit).
 */
const id = { type: 'string', minLength: 1, maxLength: 128 };
const value = { oneOf: [{ type: 'number' }, { type: 'string', maxLength: 2048 }] };
const TIMELINE_DOC_SCHEMA = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://cdn.jsdelivr.net/npm/motionary@14/docs/timeline-doc.schema.json',
    title: 'motionary-timeline v1',
    type: 'object',
    additionalProperties: false,
    required: ['format', 'version', 'layers'],
    properties: {
        format: { const: 'motionary-timeline' },
        version: { const: 1 },
        name: { type: 'string', maxLength: 2048 },
        duration: { type: 'number', minimum: 0, maximum: 1e7 },
        seed: { type: 'integer', minimum: 0, maximum: 4294967295 },
        meta: {},
        layers: {
            type: 'array',
            maxItems: 1000,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'type'],
                properties: {
                    id,
                    type: { enum: ['track', 'group'] },
                    name: { type: 'string', maxLength: 2048 },
                    parent: id,
                    locked: { type: 'boolean' },
                    muted: { type: 'boolean' },
                    solo: { type: 'boolean' },
                    target: { type: 'string', minLength: 1, maxLength: 512 },
                    keyframes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['id', 'time', 'props'],
                            properties: {
                                id,
                                time: { type: 'number', minimum: 0, maximum: 1e7 },
                                easing: { type: 'string', maxLength: 200 },
                                props: {
                                    type: 'object',
                                    maxProperties: 64,
                                    propertyNames: { pattern: '^(--[A-Za-z0-9_-]+|[a-zA-Z][A-Za-z0-9_-]*)$', not: { enum: ['constructor', 'prototype'] } },
                                    additionalProperties: value,
                                },
                            },
                        },
                    },
                },
                if: { properties: { type: { const: 'group' } } },
                then: { not: { anyOf: [{ required: ['target'] }, { required: ['keyframes'] }] } },
            },
        },
    },
};

exports.TIMELINE_DOC_FORMAT = format.TIMELINE_DOC_FORMAT;
exports.TIMELINE_DOC_LIMITS = format.TIMELINE_DOC_LIMITS;
exports.TIMELINE_DOC_VERSION = format.TIMELINE_DOC_VERSION;
exports.TimelineDocError = format.TimelineDocError;
exports.createSeededRandom = format.createSeededRandom;
exports.createTimelineDoc = format.createTimelineDoc;
exports.isLayerActive = format.isLayerActive;
exports.isLayerLocked = format.isLayerLocked;
exports.isValidEasing = format.isValidEasing;
exports.normalizeTimelineDoc = format.normalizeTimelineDoc;
exports.parseTimelineDoc = format.parseTimelineDoc;
exports.resolveRandom = format.resolveRandom;
exports.serializeTimelineDoc = format.serializeTimelineDoc;
exports.timelineDocDuration = format.timelineDocDuration;
exports.timelineDocFromAnimation = format.timelineDocFromAnimation;
exports.timelineDocToAnimation = format.timelineDocToAnimation;
exports.validateTimelineDoc = format.validateTimelineDoc;
exports.loadMotionDoc = scene.loadMotionDoc;
exports.timelineDocFromScene = scene.timelineDocFromScene;
exports.timelineDocToScene = scene.timelineDocToScene;
exports.TIMELINE_DOC_SCHEMA = TIMELINE_DOC_SCHEMA;
exports.addKeyframe = addKeyframe;
exports.addLayer = addLayer;
exports.bindHistoryKeys = bindHistoryKeys;
exports.copyKeyframes = copyKeyframes;
exports.createFixedClock = createFixedClock;
exports.createTimelineHistory = createTimelineHistory;
exports.createTimelinePreview = createTimelinePreview;
exports.editableKeyframes = editableKeyframes;
exports.groupLayers = groupLayers;
exports.historyKeyAction = historyKeyAction;
exports.interpolateValue = interpolateValue;
exports.layerSubtree = layerSubtree;
exports.moveLayer = moveLayer;
exports.pasteKeyframes = pasteKeyframes;
exports.removeKeyframes = removeKeyframes;
exports.removeLayers = removeLayers;
exports.sampleTimelineDoc = sampleTimelineDoc;
exports.scaleKeyframes = scaleKeyframes;
exports.setKeyframeEasing = setKeyframeEasing;
exports.setKeyframeProps = setKeyframeProps;
exports.shiftKeyframes = shiftKeyframes;
exports.ungroupLayer = ungroupLayer;
exports.uniqueId = uniqueId;
exports.updateLayers = updateLayers;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.1.0/dist/components/timeline-editor.cjs.map