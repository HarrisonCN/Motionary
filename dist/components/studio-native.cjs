'use strict';

var scene = require('../chunks/scene-U2YkjCm0.cjs');
var format = require('../chunks/format-b5fQz-vc.cjs');

/**
 * 15.2: cross-platform export 2.0 — `motionary/studio/native` (= `motionary/components/studio-native`).
 * A Scene v2 document (or a timeline v1 document, or a Studio project `{ doc }`) → CSS, mini-program WXSS, HarmonyOS
 * ArkTS, Jetpack Compose or SwiftUI source, plus a per-property report: every animated property of every playing track
 * is listed once, as `supported` or as `lost` with the reason. Nothing is dropped silently. Pure (no DOM, no Node APIs),
 * deterministic (same input → same text).
 *
 * Supported on every target: opacity; transform translate (px) / scale / rotate (2D); color and background-color
 * (hex on the native targets); segment easings linear / ease / ease-in / ease-out / ease-in-out / cubic-bezier().
 * CSS and WXSS keep every other CSS property as is; the native targets report them as lost.
 */
const STUDIO_NATIVE_VERSION = 1;
const NATIVE_TARGETS = ['css', 'wxss', 'arkts', 'compose', 'swiftui'];
const EXT = { css: 'css', wxss: 'wxss', arkts: 'ets', compose: 'kt', swiftui: 'swift' };
const CSSLIKE = (t) => t === 'css' || t === 'wxss';
const FEATURES = ['opacity', 'translate', 'scale', 'rotate', 'color', 'background-color', 'cubic-bezier', 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
/** Whether a target carries a property or feature (`opacity`, `translate`, `scale`, `rotate`, `color`, `background-color`, an easing name, or any CSS property). */
function nativeSupport(target, feature) {
    if (!NATIVE_TARGETS.includes(target))
        return false;
    return CSSLIKE(target) || FEATURES.includes(feature);
}
const BEZ = { linear: null, ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] };
/** CSS easing → bezier control points (null = linear), or undefined when it is not in the supported subset. */
function bezier(e) {
    const s = String(e ?? 'linear').trim();
    if (s in BEZ)
        return BEZ[s];
    const m = /^cubic-bezier\(([^)]*)\)$/.exec(s);
    if (!m)
        return undefined;
    const n = m[1].split(',').map((x) => parseFloat(x));
    return n.length === 4 && n.every((x) => Number.isFinite(x)) ? n : undefined;
}
const f = (n) => { const r = Math.round(n * 1000) / 1000; return Object.is(r, -0) ? '0' : String(r); };
const kt = (n) => `${f(n)}f`;
const words = (s) => String(s).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
const slugOf = (s) => words(s).join('-').toLowerCase() || 'motion';
const pascal = (s) => words(s).map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'Motion';
const camel = (s) => { const p = pascal(s); return p[0].toLowerCase() + p.slice(1); };
const str = (s) => JSON.stringify(s);
function hex(v) {
    const m = /^#([0-9a-f]{3,8})$/i.exec(String(v).trim());
    if (!m || ![3, 4, 6, 8].includes(m[1].length))
        return null;
    let h = m[1];
    if (h.length <= 4)
        h = [...h].map((c) => c + c).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) : 255];
}
const IDENT = { tx: 0, ty: 0, sx: 1, sy: 1, rz: 0 };
/** 'translateY(20px) scale(0.9)' → components, or the list of functions the native targets cannot carry. */
function transformOf(t) {
    const c = {}, bad = [];
    const len = (a) => (/^-?[\d.]+(px)?$/.test(a) ? parseFloat(a) : NaN);
    const ang = (a) => { const n = parseFloat(a); return /turn$/.test(a) ? n * 360 : /rad$/.test(a) ? (n * 180) / Math.PI : /grad$/.test(a) ? n * 0.9 : n; };
    for (const m of String(t).matchAll(/([a-zA-Z0-9]+)\(([^)]*)\)/g)) {
        const fn = m[1], a = m[2].split(',').map((s) => s.trim()).filter(Boolean);
        const set = (k, v) => (Number.isFinite(v) ? (c[k] = v) : bad.push(`${fn}(${m[2]})`));
        if (fn === 'translateX')
            set('tx', len(a[0]));
        else if (fn === 'translateY')
            set('ty', len(a[0]));
        else if (fn === 'translate') {
            set('tx', len(a[0]));
            if (a[1] != null)
                set('ty', len(a[1]));
        }
        else if (fn === 'scale') {
            set('sx', parseFloat(a[0]));
            set('sy', parseFloat(a[1] ?? a[0]));
        }
        else if (fn === 'scaleX')
            set('sx', parseFloat(a[0]));
        else if (fn === 'scaleY')
            set('sy', parseFloat(a[0]));
        else if (fn === 'rotate' || fn === 'rotateZ')
            set('rz', ang(a[0]));
        else
            bad.push(fn);
    }
    return { c, bad };
}
function toDoc(input, notes) {
    const x = input;
    if (x && typeof x === 'object' && x.format === 'motionary-scene') {
        const { doc, lost } = scene.timelineDocFromScene(x);
        for (const l of lost)
            notes.push(`${l.path}: ${l.message}`);
        return format.normalizeTimelineDoc(doc);
    }
    if (x && typeof x === 'object' && x.format === 'motionary-timeline')
        return format.normalizeTimelineDoc(x);
    if (x && typeof x === 'object' && x.doc)
        return toDoc(x.doc, notes);
    throw new Error('[motionary] exportNative: expected a Scene v2 document, a timeline v1 document or a Studio project');
}
function playing(layers) {
    const by = new Map(layers.map((l) => [l.id, l]));
    const chain = (l) => { const out = []; for (let c = l, i = 0; c && i < 64; c = c.parent ? by.get(c.parent) : undefined, i++)
        out.push(c); return out; };
    const solo = layers.some((l) => l.solo);
    return layers.filter((l) => l.type === 'track' && !chain(l).some((c) => c.muted) && (!solo || chain(l).some((c) => c.solo)));
}
function analyse(doc, target, report) {
    const native = !CSSLIKE(target);
    const tracks = [];
    let end = 0;
    for (const l of playing(doc.layers)) {
        const kfs = [...(l.keyframes || [])].sort((a, b) => a.time - b.time);
        if (!kfs.length)
            continue;
        end = Math.max(end, kfs[kfs.length - 1].time);
        const props = [...new Set(kfs.flatMap((k) => Object.keys(k.props)))];
        const tr = { id: l.id, target: l.target || ':scope', name: l.name || l.id, channels: [], css: kfs.map((k) => ({ t: k.time, props: k.props, e: k.easing })) };
        const easingOk = kfs.every((k) => bezier(k.easing) !== undefined);
        if (!easingOk && native)
            report.lost.push({ layer: l.id, prop: 'easing', reason: `easing ${kfs.map((k) => k.easing).find((e) => bezier(e) === undefined)} is not in the supported subset; segments play linear` });
        for (const p of props) {
            const pts = kfs.filter((k) => p in k.props);
            if (!native) {
                report.supported.push({ layer: l.id, prop: p });
                continue;
            }
            const e = (k) => bezier(k.easing) ?? null;
            if (p === 'opacity') {
                const ok = pts.every((k) => Number.isFinite(Number(k.props[p])));
                if (!ok) {
                    report.lost.push({ layer: l.id, prop: p, reason: 'opacity must be a number' });
                    continue;
                }
                tr.channels.push({ name: 'opacity', kind: 'num', pts: pts.map((k) => ({ t: k.time, v: Number(k.props[p]), e: e(k) })) });
            }
            else if (p === 'transform') {
                const parsed = pts.map((k) => transformOf(k.props[p]));
                const bad = [...new Set(parsed.flatMap((x) => x.bad))];
                if (bad.length) {
                    report.lost.push({ layer: l.id, prop: p, reason: `${bad.join(', ')} not in the ${target} subset (translate in px, scale, 2D rotate)` });
                    continue;
                }
                const used = Object.keys(IDENT).filter((c) => parsed.some((x) => x.c[c] !== undefined));
                for (const c of used)
                    tr.channels.push({ name: c, kind: 'num', pts: pts.map((k, i) => ({ t: k.time, v: parsed[i].c[c] ?? IDENT[c], e: e(k) })) });
            }
            else if (p === 'color' || p === 'background-color') {
                const cs = pts.map((k) => hex(k.props[p]));
                if (cs.some((c) => !c)) {
                    report.lost.push({ layer: l.id, prop: p, reason: `${target} export takes hex colors (#rgb, #rrggbb, #rrggbbaa)` });
                    continue;
                }
                tr.channels.push({ name: p === 'color' ? 'color' : 'background', kind: 'color', pts: pts.map((k, i) => ({ t: k.time, v: cs[i], e: e(k) })) });
            }
            else {
                report.lost.push({ layer: l.id, prop: p, reason: `no ${target} equivalent in the supported subset` });
                continue;
            }
            report.supported.push({ layer: l.id, prop: p });
        }
        tracks.push(tr);
    }
    return { tracks, duration: Math.max(1, doc.duration ?? end) };
}
const header = (target, name) => `motionary 15.2 — ${target} export of "${name}" (motionary/studio/native). Generated; edit the scene, not this file.`;
// ---- CSS / WXSS --------------------------------------------------------------------------------------------------
function cssLike(target, name, tracks, D, rpx) {
    const slug = slugOf(name), L = [`/* ${header(target === 'css' ? 'CSS' : 'Mini program (WXSS / ACSS / TTSS)', name)} */`, ''];
    const val = (v) => (rpx ? String(v).replace(/(-?[0-9.]+)px/g, (_, n) => `${f(+n * 2)}rpx`) : String(v));
    const pct = (t) => `${f((t / D) * 100)}%`;
    const sel = (t) => (t.target === ':scope' ? `.usa-${slug}` : t.target);
    for (const t of tracks) {
        const kn = `usa-${slug}-${slugOf(t.id)}`;
        const blocks = [...t.css];
        if (blocks[0].t > 0)
            blocks.unshift({ t: 0, props: blocks[0].props });
        if (blocks[blocks.length - 1].t < D)
            blocks.push({ t: D, props: blocks[blocks.length - 1].props });
        L.push(`@keyframes ${kn} {`);
        for (const b of blocks) {
            const body = Object.entries(b.props).map(([k, v]) => `${k}: ${val(v)};`);
            if (b.e && b.e !== 'linear')
                body.push(`animation-timing-function: ${b.e};`);
            L.push(`  ${pct(b.t)} { ${body.join(' ')} }`);
        }
        L.push('}', `${sel(t)} { animation: ${kn} ${D}ms linear both; }`, '');
    }
    const all = tracks.map(sel).join(', ');
    if (all)
        L.push('/* reduced motion: the OS setting, or add .usa-reduce-motion from your own setting */', `@media (prefers-reduced-motion: reduce) { ${all} { animation-duration: 1ms; animation-delay: 0s; } }`, `.usa-reduce-motion ${tracks.map(sel).join(', .usa-reduce-motion ')} { animation-duration: 1ms; animation-delay: 0s; }`);
    return L.join('\n') + '\n';
}
// ---- Jetpack Compose ---------------------------------------------------------------------------------------------
function compose(name, tracks, D, pkg) {
    const P = pascal(name), c0 = camel(name);
    const L = [`// ${header('Jetpack Compose', name)}`, `// Usage: Modifier.${c0}${pascal(tracks[0]?.id || 'layer')}(play = visible, reduceMotion = …)`, `package ${pkg}`, '',
        'import androidx.compose.animation.animateColor', 'import androidx.compose.animation.core.*', 'import androidx.compose.foundation.background', 'import androidx.compose.runtime.Composable', 'import androidx.compose.runtime.getValue',
        'import androidx.compose.ui.Modifier', 'import androidx.compose.ui.graphics.Color', 'import androidx.compose.ui.graphics.graphicsLayer', 'import androidx.compose.ui.unit.dp', '',
        `object ${P}Motion {`, `    const val DURATION_MILLIS = ${D}`, '}', ''];
    const ease = (e) => (e ? `CubicBezierEasing(${e.map(kt).join(', ')})` : 'LinearEasing');
    const lit = (ch, v) => (ch.kind === 'color' ? `Color(0x${v.slice(3).concat(v.slice(0, 3)).map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join('')})` : kt(v));
    for (const t of tracks) {
        if (!t.channels.length)
            continue;
        L.push(`/** Layer "${t.name}" (${t.target}). */`, '@Composable', `fun Modifier.${c0}${pascal(t.id)}(play: Boolean, reduceMotion: Boolean = false): Modifier {`, `    val transition = updateTransition(targetState = play, label = ${str(t.id)})`);
        for (const ch of t.channels) {
            const fn = ch.kind === 'color' ? 'animateColor' : 'animateFloat';
            const pts = [...ch.pts];
            if (pts[0].t > 0)
                pts.unshift({ t: 0, v: pts[0].v, e: null });
            L.push(`    val ${ch.name} by transition.${fn}(label = ${str(ch.name)}, transitionSpec = {`, '        if (reduceMotion || !targetState) snap() else keyframes {', `            durationMillis = ${D}`);
            for (const p of pts)
                L.push(`            ${lit(ch, p.v)} at ${p.t} using ${ease(p.e)}`);
            L.push('        }', `    }) { on -> if (on) ${lit(ch, ch.pts[ch.pts.length - 1].v)} else ${lit(ch, ch.pts[0].v)} }`);
        }
        const g = t.channels.filter((c) => c.kind === 'num'), map = { opacity: 'alpha = opacity', tx: 'translationX = tx.dp.toPx()', ty: 'translationY = ty.dp.toPx()', sx: 'scaleX = sx', sy: 'scaleY = sy', rz: 'rotationZ = rz' };
        let m = 'this';
        if (g.length)
            m += `.graphicsLayer {\n${g.map((c) => `        ${map[c.name]}`).join('\n')}\n    }`;
        if (t.channels.some((c) => c.name === 'background'))
            m += '.background(background)';
        L.push(`    return ${m}`, '}', '');
        if (t.channels.some((c) => c.name === 'color'))
            L.push(`// "${t.id}" animates its text color: read it with transition.animateColor and pass it to Text(color = …).`, '');
    }
    return L.join('\n');
}
// ---- SwiftUI -----------------------------------------------------------------------------------------------------
function swiftui(name, tracks) {
    const P = pascal(name);
    const L = [`// ${header('SwiftUI', name)}`, '// iOS 17+ / macOS 14+ (keyframeAnimator). Usage: Text("…").' + camel(name) + pascal(tracks[0]?.id || 'layer') + '(play: visible)', 'import SwiftUI', ''];
    const curve = (e) => (e ? `.bezier(startControlPoint: UnitPoint(x: ${f(e[0])}, y: ${f(e[1])}), endControlPoint: UnitPoint(x: ${f(e[2])}, y: ${f(e[3])}))` : '.linear');
    const lit = (ch, v) => (ch.kind === 'color' ? `Color(red: ${f(v[0] / 255)}, green: ${f(v[1] / 255)}, blue: ${f(v[2] / 255)}, opacity: ${f(v[3] / 255)})` : f(v));
    const prop = { opacity: 'opacity', tx: 'offsetX', ty: 'offsetY', sx: 'scaleX', sy: 'scaleY', rz: 'rotation', color: 'color', background: 'background' };
    for (const t of tracks) {
        if (!t.channels.length)
            continue;
        const T = `${P}${pascal(t.id)}`, has = (n) => t.channels.some((c) => c.name === n);
        L.push(`/** Layer "${t.name}" (${t.target}). */`, `struct ${T}Values {`);
        for (const ch of t.channels)
            L.push(`    var ${prop[ch.name]}: ${ch.kind === 'color' ? 'Color' : 'Double'}`);
        L.push(`    static let start = ${T}Values(${t.channels.map((c) => `${prop[c.name]}: ${lit(c, c.pts[0].v)}`).join(', ')})`, `    static let end = ${T}Values(${t.channels.map((c) => `${prop[c.name]}: ${lit(c, c.pts[c.pts.length - 1].v)}`).join(', ')})`, '}', '');
        const ap = ['view'];
        if (has('opacity'))
            ap.push(`.opacity(v.opacity)`);
        if (has('tx') || has('ty'))
            ap.push(`.offset(${[has('tx') && 'x: v.offsetX', has('ty') && 'y: v.offsetY'].filter(Boolean).join(', ')})`);
        if (has('sx') || has('sy'))
            ap.push(`.scaleEffect(x: ${has('sx') ? 'v.scaleX' : '1'}, y: ${has('sy') ? 'v.scaleY' : '1'})`);
        if (has('rz'))
            ap.push('.rotationEffect(.degrees(v.rotation))');
        if (has('color'))
            ap.push('.foregroundStyle(v.color)');
        if (has('background'))
            ap.push('.background(v.background)');
        L.push(`struct ${T}Motion: ViewModifier {`, '    var play: Bool', '    @Environment(\\.accessibilityReduceMotion) private var reduceMotion', '', `    static func apply(_ view: some View, _ v: ${T}Values) -> some View {`, `        ${ap.join('')}`, '    }', '', '    @ViewBuilder func body(content: Content) -> some View {', '        if reduceMotion || !play {', `            Self.apply(content, play ? .end : .start)`, '        } else {', `            content.keyframeAnimator(initialValue: ${T}Values.end, trigger: play) { view, v in`, '                Self.apply(view, v)', '            } keyframes: { _ in');
        for (const ch of t.channels) {
            L.push(`                KeyframeTrack(\\.${prop[ch.name]}) {`, `                    LinearKeyframe(${lit(ch, ch.pts[0].v)}, duration: 0)`);
            let prev = 0;
            if (ch.pts[0].t > 0) {
                L.push(`                    LinearKeyframe(${lit(ch, ch.pts[0].v)}, duration: ${f(ch.pts[0].t / 1000)})`);
                prev = ch.pts[0].t;
            }
            for (let i = 1; i < ch.pts.length; i++) {
                L.push(`                    LinearKeyframe(${lit(ch, ch.pts[i].v)}, duration: ${f((ch.pts[i].t - prev) / 1000)}, timingCurve: ${curve(ch.pts[i - 1].e)})`);
                prev = ch.pts[i].t;
            }
            L.push('                }');
        }
        L.push('            }', '        }', '    }', '}', '', 'extension View {', `    func ${camel(name)}${pascal(t.id)}(play: Bool) -> some View { modifier(${T}Motion(play: play)) }`, '}', '');
    }
    return L.join('\n');
}
// ---- HarmonyOS ArkTS ---------------------------------------------------------------------------------------------
function arkts(name, tracks, D) {
    const P = pascal(name), U = slugOf(name).toUpperCase().replace(/-/g, '_');
    const L = [`// ${header('HarmonyOS ArkTS', name)}`, '// API 11+ (UIContext.keyframeAnimateTo). Usage: play' + P + pascal(tracks[0]?.id || 'layer') + '(this.getUIContext(), (f) => this.frame = f, reduceMotion)', "import { curves } from '@kit.ArkUI';", '', `export const ${U}_DURATION: number = ${D};`, ''];
    const attr = { opacity: 'opacity', tx: 'translateX', ty: 'translateY', sx: 'scaleX', sy: 'scaleY', rz: 'rotate', color: 'fontColor', background: 'backgroundColor' };
    const lit = (ch, v) => (ch.kind === 'color' ? `'#${v.slice(0, 3).map((x) => x.toString(16).padStart(2, '0')).join('')}${v[3] < 255 ? v[3].toString(16).padStart(2, '0') : ''}'` : f(v));
    const curve = (e) => (e ? `curves.cubicBezierCurve(${e.map(f).join(', ')})` : 'Curve.Linear');
    const at = (ch, t) => {
        const p = ch.pts;
        if (t <= p[0].t)
            return p[0].v;
        if (t >= p[p.length - 1].t)
            return p[p.length - 1].v;
        const i = p.findIndex((x) => x.t >= t);
        if (p[i].t === t || ch.kind === 'color')
            return p[i].v;
        const a = p[i - 1], b = p[i];
        return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t);
    };
    for (const t of tracks) {
        if (!t.channels.length)
            continue;
        const T = `${P}${pascal(t.id)}`, TU = `${U}_${slugOf(t.id).toUpperCase().replace(/-/g, '_')}`, fr = (time) => `{ ${t.channels.map((c) => `${attr[c.name]}: ${lit(c, at(c, time))}`).join(', ')} }`;
        const times = [...new Set(t.channels.flatMap((c) => c.pts.map((p) => p.t)).concat([0]))].sort((a, b) => a - b);
        const easeAt = (time) => t.channels.flatMap((c) => c.pts).find((p) => p.t === time)?.e ?? null;
        L.push(`/** Layer "${t.name}" (${t.target}): bind these fields to the component's attributes. */`, `export interface ${T}Frame { ${t.channels.map((c) => `${attr[c.name]}: ${c.kind === 'color' ? 'string' : 'number'}`).join('; ')} }`, `export const ${TU}_START: ${T}Frame = ${fr(0)};`, `export const ${TU}_END: ${T}Frame = ${fr(times[times.length - 1])};`, '', `export function play${T}(ctx: UIContext, apply: (f: ${T}Frame) => void, reduceMotion: boolean = false): void {`, `  apply(${TU}_START);`, `  if (reduceMotion) { apply(${TU}_END); return; }`, '  ctx.keyframeAnimateTo({ iterations: 1 }, [');
        for (let i = 1; i < times.length; i++)
            L.push(`    { duration: ${times[i] - times[i - 1]}, curve: ${curve(easeAt(times[i - 1]))}, event: () => apply(${fr(times[i])}) },`);
        L.push('  ]);', '}', '');
    }
    return L.join('\n');
}
/** Export a motion document to one target. Throws on an unknown target or an unreadable document. */
function exportNative(input, opts) {
    const target = opts?.target;
    if (!NATIVE_TARGETS.includes(target))
        throw new Error(`[motionary] unknown export target "${target}" — use one of: ${NATIVE_TARGETS.join(', ')}`);
    const report = { target, supported: [], lost: [], notes: [], ai: [] };
    const doc = toDoc(input, report.notes);
    const name = doc.name || 'motion';
    const { tracks, duration } = analyse(doc, target, report);
    const exported = new Set(tracks.map((t) => t.id));
    const recs = doc.meta?.['motionary:provenance'];
    if (Array.isArray(recs))
        for (const r of recs) {
            if (!r || typeof r !== 'object' || !Array.isArray(r.layers) || !r.layers.some((l) => exported.has(String(l))))
                continue;
            const c = { id: String(r.id), generator: String(r.generator) };
            if (typeof r.model === 'string')
                c.model = r.model;
            if (typeof r.requestId === 'string')
                c.requestId = r.requestId;
            c.at = String(r.at);
            c.layers = r.layers.map(String).filter((l) => exported.has(l));
            report.ai.push(c);
        }
    const code = target === 'css' || target === 'wxss' ? cssLike(target, name, tracks, duration, !!opts.rpx)
        : target === 'compose' ? compose(name, tracks, duration, opts.package || 'motionary.generated')
            : target === 'swiftui' ? swiftui(name, tracks) : arkts(name, tracks, duration);
    return { code, file: `${slugOf(name)}.${EXT[target]}`, report };
}

exports.NATIVE_TARGETS = NATIVE_TARGETS;
exports.STUDIO_NATIVE_VERSION = STUDIO_NATIVE_VERSION;
exports.exportNative = exportNative;
exports.nativeSupport = nativeSupport;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0-rc.1/dist/components/studio-native.cjs.map