import { d as docError, f as isLayerLocked, i as isValidEasing, g as round, b as byTime } from './format-CI6Vx9Ui.js';

/**
 * 13.6: editing operations on a `motionary-timeline` document. Every operation
 * is pure: it returns a new document (unchanged layers are shared, so history
 * snapshots stay cheap) and never edits a locked layer.
 */
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
        throw docError('id', `duplicate layer id "${id}"`);
    const n = { ...layer, id, type: layer.type ?? 'track' };
    if (n.type === 'track' && !n.keyframes)
        n.keyframes = [];
    if (n.parent !== undefined && doc.layers.find((l) => l.id === n.parent)?.type !== 'group')
        throw docError('parent', `no group "${n.parent}"`);
    if (n.parent !== undefined && isLayerLocked(doc, n.parent))
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
        if (!isLayerLocked(doc, id))
            for (const s of layerSubtree(doc, id))
                if (!isLayerLocked(doc, s))
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
        if (isLayerLocked(doc, l.id)) {
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
    const members = doc.layers.filter((l) => ids.includes(l.id) && !isLayerLocked(doc, l.id));
    if (!members.length)
        return { doc, id: '' };
    const id = group.id ?? uniqueId(doc, 'g');
    if (doc.layers.some((l) => l.id === id))
        throw docError('id', `duplicate layer id "${id}"`);
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
    if (!g || g.type !== 'group' || isLayerLocked(doc, groupId))
        return doc;
    return { ...doc, layers: doc.layers.filter((l) => l.id !== groupId).map((l) => (l.parent === groupId ? withParent(l, g.parent) : l)) };
}
/**
 * Move a layer (with its children) so it sits at `toIndex` among its siblings
 * (layers with the same parent), or into another group with `{ parent }`.
 */
function moveLayer(doc, id, toIndex, o = {}) {
    const layer = doc.layers.find((l) => l.id === id);
    if (!layer || isLayerLocked(doc, id))
        return doc;
    const sub = new Set(layerSubtree(doc, id));
    const parent = o.parent === undefined ? layer.parent : o.parent === null ? undefined : o.parent;
    if (parent !== undefined) {
        const p = doc.layers.find((l) => l.id === parent);
        if (!p || p.type !== 'group' || sub.has(parent))
            throw docError('parent', `cannot move "${id}" into "${parent}"`);
        if (isLayerLocked(doc, parent))
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
        if (!l.keyframes?.some((k) => sel.has(k.id)) || isLayerLocked(doc, l.id))
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
    return ids.filter((id) => where.has(id) && !isLayerLocked(doc, where.get(id).id));
}
/** Add a keyframe to a track (`id` defaults to a fresh one). */
function addKeyframe(doc, layerId, kf) {
    const l = doc.layers.find((x) => x.id === layerId);
    if (!l || l.type !== 'track')
        throw docError('layer', `no track "${layerId}"`);
    if (isLayerLocked(doc, layerId))
        return doc;
    const id = kf.id ?? uniqueId(doc, 'k');
    if (locate(doc).has(id))
        throw docError('id', `duplicate keyframe id "${id}"`);
    if (kf.easing !== undefined && !isValidEasing(kf.easing))
        throw docError('easing', `unknown easing "${kf.easing}"`);
    const n = { id, time: Math.max(0, round(kf.time)), props: { ...kf.props } };
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
    return d ? mapKeyframes(doc, ok, (k) => ({ ...k, time: round(k.time + d) })) : doc;
}
/** Scale keyframe times by `factor` (> 0) around `pivot` (default: the earliest selected keyframe). */
function scaleKeyframes(doc, ids, factor, pivot) {
    if (!(factor > 0) || !Number.isFinite(factor))
        throw docError('factor', 'expected a positive number');
    const ok = editableKeyframes(doc, ids);
    if (!ok.length || factor === 1)
        return doc;
    const where = locate(doc);
    const p = pivot ?? Math.min(...ok.map((id) => where.get(id).keyframes.find((k) => k.id === id).time));
    return mapKeyframes(doc, ok, (k) => ({ ...k, time: Math.max(0, round(p + (k.time - p) * factor)) }));
}
/** Set the easing of every selected keyframe (`'linear'` clears it). */
function setKeyframeEasing(doc, ids, easing) {
    if (!isValidEasing(easing))
        throw docError('easing', `unknown easing "${easing}"`);
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
        items: found.map(({ layer, k }) => ({ layer, time: round(k.time - t0), props: { ...k.props }, ...(k.easing ? { easing: k.easing } : {}) })),
    };
}
/**
 * Paste a clip at `at` ms: onto its source layers, or all onto `layer`.
 * Returns the document and the new keyframe ids (fresh, deterministic).
 */
function pasteKeyframes(doc, clip, o) {
    if (!clip || clip.format !== 'motionary-timeline-clip' || !Array.isArray(clip.items))
        throw docError('clip', 'not a keyframe clip');
    const taken = new Set();
    const ids = [];
    let out = doc;
    for (const it of clip.items) {
        const target = o.layer ?? it.layer;
        const l = out.layers.find((x) => x.id === target);
        if (!l || l.type !== 'track' || isLayerLocked(out, target))
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

export { addKeyframe as a, bindHistoryKeys as b, uniqueId as c, createTimelineHistory as d, setKeyframeEasing as e, addLayer as f, copyKeyframes as g, historyKeyAction as h, shiftKeyframes as i, editableKeyframes as j, groupLayers as k, layerSubtree as l, moveLayer as m, removeLayers as n, scaleKeyframes as o, pasteKeyframes as p, ungroupLayer as q, removeKeyframes as r, setKeyframeProps as s, updateLayers as u };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.1/dist/chunks/history-DtNn2Q0g.js.map