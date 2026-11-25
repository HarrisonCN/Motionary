'use strict';

var base = require('./base-DzZEJhQB.cjs');
var springSolver = require('./spring-solver-CS4saXm-.cjs');
var spring = require('./spring-DoapHVAk.cjs');
var fx = require('./fx-BLAi-SpO.cjs');

var css = "[data-mo-micro]{-webkit-tap-highlight-color:transparent}[data-mo-micro~=\"glow\"]{position:relative;isolation:isolate}[data-mo-micro~=\"glow\"]::after{content:\"\";position:absolute;inset:0;z-index:1;border-radius:inherit;pointer-events:none;opacity:var(--mo-micro-glow,0);background:radial-gradient(circle at var(--mo-micro-gx,50%) var(--mo-micro-gy,50%),color-mix(in srgb,var(--mo-micro-glow-color,var(--mo-kit-accent,#6366f1)) 42%,transparent),transparent 62%)}[data-mo-micro~=\"lift\"]{box-shadow:0 calc(var(--mo-micro-lift,0) * 1.6px) calc(4px + var(--mo-micro-lift,0) * 4px) color-mix(in srgb,var(--mo-micro-shadow-color,#000) calc(8% + var(--mo-micro-lift,0) * 2.5%),transparent)}[data-mo-micro~=\"focus\"]:is(:focus-visible,:has(:focus-visible)){outline:2px solid var(--mo-micro-ring,var(--mo-kit-accent,#6366f1));outline-offset:calc(2px + (1 - var(--mo-micro-focus,1)) * 6px)}[data-mo-micro~=\"drag\"]{touch-action:none;cursor:grab;-webkit-user-select:none;user-select:none}[data-mo-micro~=\"drag\"][data-mo-dragging]{cursor:grabbing}[data-mo-micro-flash]{outline:2px solid var(--mo-kit-accent,#6366f1);outline-offset:2px}[data-mo-micro-flash=\"error\"]{outline-color:var(--mo-kit-bad,#dc2626)}[data-mo-micro-flash=\"success\"]{outline-color:var(--mo-kit-ok,#16a34a)}@media (prefers-reduced-motion:reduce){[data-mo-micro~=\"focus\"]:is(:focus-visible,:has(:focus-visible)){outline-offset:2px}}";

const MICRO_BEHAVIORS = ['press', 'hover', 'lift', 'magnetic', 'tilt', 'glow', 'squish', 'drag', 'focus'];
const MICRO_FEEDBACK = ['shake', 'nod', 'pop', 'wiggle', 'jelly', 'nudge', 'bump', 'attention'];
/** Impulse (channel velocities), spring and tone of each feedback. */
const IMPULSES = {
    shake: [{ fx: 420 }, '170 0.78', 'error'],
    nod: [{ fy: 200 }, '220 0.6', 'success'],
    pop: [{ s: 1.8 }, 'pop', 'success'],
    wiggle: [{ rz: 240 }, '260 0.72', 'info'],
    jelly: [{ sx: 0.9, sy: -0.9 }, 'jelly', 'info'],
    nudge: [{ fx: 260 }, '300 0.35', 'info'],
    bump: [{ fy: -140 }, 'bouncy', 'info'],
};
/** Split a behaviour list (`"press hover, glow"`) into known behaviours, in order, without repeats. */
function parseMicro(spec) {
    const words = Array.isArray(spec) ? spec : String(spec ?? '').split(/[\s,]+/);
    const out = [];
    for (const w of words) {
        const k = String(w).trim().toLowerCase();
        if (MICRO_BEHAVIORS.includes(k) && !out.includes(k))
            out.push(k);
    }
    return out;
}
/** The feel that applies to `el`: its closest `[data-mo-feel]`, else the `--mo-feel` custom property, else `null`. */
function readFeel(el) {
    const host = el.closest?.('[data-mo-feel]');
    const v = host?.getAttribute('data-mo-feel')?.trim();
    if (v)
        return v;
    if (typeof getComputedStyle !== 'function')
        return null;
    return getComputedStyle(el).getPropertyValue('--mo-feel').trim() || null;
}
/** A look's `--mo-kit-speed` on `el` (1 when unset). */
function readSpeed(el) {
    if (typeof getComputedStyle !== 'function')
        return 1;
    const n = parseFloat(getComputedStyle(el).getPropertyValue('--mo-kit-speed'));
    return Number.isFinite(n) && n > 0 ? n : 1;
}
/** Channel values → the composed CSS transform (`''` at rest). */
function microTransform(v, o = {}) {
    const g = (k) => v[k] || 0;
    const scale = 1 + g('hover') * ((o.hoverScale ?? 1.03) - 1) - g('press') * (1 - (o.pressScale ?? 0.96)) + g('s');
    const sx = scale * (1 + g('sx'));
    const sy = scale * (1 + g('sy'));
    const x = g('mx') + g('dx') + g('fx');
    const y = g('my') + g('dy') + g('fy') - g('lift');
    const r = (n) => Math.round(n * 1000) / 1000;
    const parts = [];
    if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01)
        parts.push(`translate3d(${r(x)}px, ${r(y)}px, 0)`);
    if (Math.abs(g('rx')) > 0.01)
        parts.push(`rotateX(${r(g('rx'))}deg)`);
    if (Math.abs(g('ry')) > 0.01)
        parts.push(`rotateY(${r(g('ry'))}deg)`);
    if (Math.abs(g('rz')) > 0.01)
        parts.push(`rotate(${r(g('rz'))}deg)`);
    if (Math.abs(sx - 1) > 0.0005 || Math.abs(sy - 1) > 0.0005)
        parts.push(Math.abs(sx - sy) < 0.0005 ? `scale(${r(sx)})` : `scale(${r(sx)}, ${r(sy)})`);
    if (!parts.length)
        return '';
    return (o.perspective && parts.some((p) => p.startsWith('rotateX') || p.startsWith('rotateY')) ? 'perspective(700px) ' : '') + parts.join(' ');
}
const handles = /*#__PURE__*/ new WeakMap();
/** The micro handle of `el`, if it has one. */
const microOf = (el) => handles.get(el);
const isDisabled = (el, o) => !!o.disabled || el.getAttribute('aria-disabled') === 'true' || el.disabled === true;
/** Give `el` spring micro-interactions. Calling it again on the same element updates it. */
function micro(el, fx$1 = 'press hover', opts = {}) {
    const had = handles.get(el);
    if (had) {
        had.update(fx$1, opts);
        return had;
    }
    base.adoptStyles('micro-17-16', css);
    let o = { ...opts };
    let list = parseMicro(fx$1);
    const ownAttr = !el.hasAttribute('data-mo-micro');
    const savedTransform = el.style.transform;
    let off = [];
    let pressed = false;
    let inside = false;
    let dragging = null;
    let swallowClick = false;
    let pointer = [];
    let flashTimer;
    const has = (k) => list.includes(k);
    const role = (name) => (o.spring !== undefined && o.spring !== null ? o.spring : name);
    const paint = (v) => {
        const t = microTransform(v, { pressScale: o.pressScale, hoverScale: o.hoverScale, perspective: has('tilt') });
        el.style.transform = t || savedTransform;
        const css = el.style;
        if (has('lift'))
            css.setProperty('--mo-micro-lift', String(Math.round((v.lift || 0) * 100) / 100));
        if (has('glow')) {
            css.setProperty('--mo-micro-glow', String(Math.max(0, Math.min(1, Math.round((v.glow || 0) * 1000) / 1000))));
            css.setProperty('--mo-micro-gx', `${Math.round((v.gx ?? 50) * 10) / 10}%`);
            css.setProperty('--mo-micro-gy', `${Math.round((v.gy ?? 50) * 10) / 10}%`);
        }
        if (has('focus'))
            css.setProperty('--mo-micro-focus', String(Math.max(0, Math.round((v.focus || 0) * 1000) / 1000)));
        if (has('press'))
            css.setProperty('--mo-micro-press', String(Math.max(0, Math.min(1, Math.round((v.press || 0) * 1000) / 1000))));
    };
    const group = springSolver.createSpringGroup({ gx: 50, gy: 50 }, { feel: o.feel ?? readFeel(el), speed: readSpeed(el), owner: el, onUpdate: paint });
    const press = (on) => {
        if (on === pressed)
            return;
        pressed = on;
        el.toggleAttribute('data-mo-pressed', on);
        if (on) {
            if (o.haptics)
                fx.haptic(8);
            o.onPress?.();
            if (has('press'))
                group.set({ press: 1 }, { spring: role('press') });
            if (has('squish'))
                group.set({ sx: 0.06, sy: -0.08 }, { spring: role('press') });
            if (has('lift'))
                group.set({ lift: inside ? (o.lift ?? 4) * 0.35 : 0 }, { spring: role('press') });
        }
        else {
            o.onRelease?.();
            if (has('press'))
                group.set({ press: 0 }, { spring: role('release') });
            if (has('squish'))
                group.set({ sx: 0, sy: 0 }, { spring: role('jelly') });
            if (has('lift'))
                group.set({ lift: inside ? o.lift ?? 4 : 0 }, { spring: role('release') });
        }
    };
    const enter = () => {
        inside = true;
        if (has('hover'))
            group.set({ hover: 1 }, { spring: role('hover') });
        if (has('lift'))
            group.set({ lift: pressed ? (o.lift ?? 4) * 0.35 : o.lift ?? 4 }, { spring: role('hover') });
        if (has('glow'))
            group.set({ glow: 1 }, { spring: role('hover') });
    };
    const pointerSpeed = () => {
        const h = pointer.filter((p) => p[2] > performance.now() - 100);
        if (h.length < 2)
            return [0, 0];
        const a = h[0];
        const b = h[h.length - 1];
        const dt = Math.max(1, b[2] - a[2]) / 1000;
        return [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt];
    };
    const leave = () => {
        inside = false;
        press(false);
        if (has('hover'))
            group.set({ hover: 0 }, { spring: role('settle') });
        if (has('lift'))
            group.set({ lift: 0 }, { spring: role('settle') });
        if (has('glow'))
            group.set({ glow: 0 }, { spring: role('smooth') });
        if (has('tilt'))
            group.set({ rx: 0, ry: 0 }, { spring: role('settle') });
        if (has('magnetic')) {
            const [vx, vy] = pointerSpeed();
            const s = Math.min(1, Math.max(0, o.strength ?? 0.35));
            const cap = 1600;
            group.set({ mx: 0, my: 0 }, { spring: role('release'), velocity: { mx: Math.max(-cap, Math.min(cap, vx * s)), my: Math.max(-cap, Math.min(cap, vy * s)) } });
        }
        pointer = [];
    };
    const move = (e) => {
        pointer.push([e.clientX, e.clientY, performance.now()]);
        if (pointer.length > 8)
            pointer.shift();
        if (dragging || !(has('magnetic') || has('tilt') || has('glow')))
            return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height)
            return;
        // the element's own transform moves its box: measure from the untransformed centre
        const v = group.values;
        const cx = r.left + r.width / 2 - ((v.mx || 0) + (v.dx || 0) + (v.fx || 0));
        const cy = r.top + r.height / 2 - ((v.my || 0) + (v.dy || 0) + (v.fy || 0) - (v.lift || 0));
        const px = (e.clientX - cx) / r.width;
        const py = (e.clientY - cy) / r.height;
        if (has('magnetic')) {
            const s = Math.min(1, Math.max(0, o.strength ?? 0.35));
            const reach = Math.max(0, o.reach ?? 14);
            const clampR = (n) => Math.max(-reach, Math.min(reach, n));
            group.set({ mx: clampR(px * r.width * s), my: clampR(py * r.height * s) }, { spring: role('snappy') });
        }
        if (has('tilt')) {
            const t = Math.min(30, Math.max(0, o.tilt ?? 8));
            group.set({ ry: Math.max(-1, Math.min(1, px * 2)) * t, rx: -Math.max(-1, Math.min(1, py * 2)) * t }, { spring: role('hover') });
        }
        if (has('glow'))
            group.set({ gx: (px + 0.5) * 100, gy: (py + 0.5) * 100 }, { spring: role('drag') });
    };
    /* drag */
    const bounds = () => {
        const none = [[-Infinity, -Infinity], [Infinity, Infinity]];
        const b = o.bounds ?? 'parent';
        if (b === 'none')
            return none;
        const box = b === 'parent' ? el.parentElement : b;
        if (!box)
            return none;
        const pr = box.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const v = group.values;
        const left = r.left - ((v.mx || 0) + (v.dx || 0) + (v.fx || 0));
        const top = r.top - ((v.my || 0) + (v.dy || 0) + (v.fy || 0) - (v.lift || 0));
        const minX = Math.min(0, pr.left - left);
        const maxX = Math.max(0, pr.right - (left + r.width));
        const minY = Math.min(0, pr.top - top);
        const maxY = Math.max(0, pr.bottom - (top + r.height));
        return [[minX, minY], [maxX, maxY]];
    };
    const band = (n, min, max, dim) => (n < min ? min + spring.rubberBand(n - min, dim) : n > max ? max + spring.rubberBand(n - max, dim) : n);
    const dragDown = (e) => {
        // catch a moving element where it is (only the drag channels stop; press / hover keep springing)
        group.jump({ dx: group.get('dx'), dy: group.get('dy') });
        const [min, max] = bounds();
        dragging = { id: e.pointerId, sx: e.clientX, sy: e.clientY, bx: group.get('dx'), by: group.get('dy'), min, max, moved: false, hist: [[e.clientX, e.clientY, performance.now()]] };
        try {
            el.setPointerCapture?.(e.pointerId);
        }
        catch {
            /* synthetic events */
        }
    };
    const dragMove = (e) => {
        const d = dragging;
        if (!d || e.pointerId !== d.id)
            return;
        let x = d.bx + (e.clientX - d.sx);
        let y = d.by + (e.clientY - d.sy);
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) {
            d.moved = true;
            el.setAttribute('data-mo-dragging', '');
        }
        d.hist.push([e.clientX, e.clientY, performance.now()]);
        if (d.hist.length > 6)
            d.hist.shift();
        const r = el.getBoundingClientRect();
        if (o.axis === 'y')
            x = d.bx;
        if (o.axis === 'x')
            y = d.by;
        x = band(x, d.min[0], d.max[0], Math.max(80, r.width));
        y = band(y, d.min[1], d.max[1], Math.max(80, r.height));
        group.jump({ dx: x, dy: y });
    };
    const settleTo = (x, y, vx = 0, vy = 0, spring$1 = 'settle') => {
        const [min, max] = bounds();
        let tx = Math.max(min[0], Math.min(max[0], x));
        let ty = Math.max(min[1], Math.min(max[1], y));
        if (o.snap && o.snap > 0) {
            tx = Math.max(min[0], Math.min(max[0], spring.snapTo(tx, o.snap)));
            ty = Math.max(min[1], Math.min(max[1], spring.snapTo(ty, o.snap)));
        }
        if (o.axis === 'y')
            tx = group.target('dx');
        if (o.axis === 'x')
            ty = group.target('dy');
        group.set({ dx: tx, dy: ty }, { spring: role(spring$1), velocity: { dx: vx, dy: vy } });
        return { x: tx, y: ty };
    };
    const dragUp = (e) => {
        const d = dragging;
        if (!d || e.pointerId !== d.id)
            return;
        dragging = null;
        el.removeAttribute('data-mo-dragging');
        const h = d.hist.filter((p) => p[2] > performance.now() - 120);
        let vx = 0;
        let vy = 0;
        if (h.length > 1 && e.type !== 'pointercancel') {
            const a = h[0];
            const b = h[h.length - 1];
            const dt = Math.max(8, b[2] - a[2]) / 1000;
            vx = (b[0] - a[0]) / dt;
            vy = (b[1] - a[1]) / dt;
        }
        const cap = 4000;
        vx = Math.max(-cap, Math.min(cap, vx));
        vy = Math.max(-cap, Math.min(cap, vy));
        const x = group.get('dx');
        const y = group.get('dy');
        const end = settleTo(spring.projectInertia(x, vx, 0.2), spring.projectInertia(y, vy, 0.2), vx, vy);
        if (d.moved) {
            swallowClick = true;
            setTimeout(() => (swallowClick = false), 0);
            o.onDragEnd?.(end);
        }
    };
    const on = (t, type, fn, opt) => {
        t.addEventListener(type, fn, opt);
        off.push(() => t.removeEventListener(type, fn, opt));
    };
    const bind = () => {
        off.forEach((f) => f());
        off = [];
        if (!list.length)
            return;
        const hoverish = has('hover') || has('lift') || has('magnetic') || has('tilt') || has('glow');
        on(el, 'pointerenter', (e) => {
            if (isDisabled(el, o))
                return;
            if (e.pointerType !== 'touch' && hoverish)
                enter();
        });
        on(el, 'pointerleave', (e) => {
            if (dragging)
                return;
            if (e.pointerType === 'touch')
                return press(false);
            leave();
        });
        on(el, 'pointermove', (e) => {
            if (isDisabled(el, o))
                return;
            if (dragging)
                return dragMove(e);
            if (e.pointerType !== 'touch')
                move(e);
        }, { passive: true });
        on(el, 'pointerdown', (e) => {
            if (isDisabled(el, o) || (e.pointerType === 'mouse' && e.button !== 0))
                return;
            if (has('glow') && e.pointerType === 'touch') {
                move(e);
                group.set({ glow: 1 }, { spring: role('hover') });
            }
            if (has('press') || has('squish') || has('lift'))
                press(true);
            if (has('drag'))
                dragDown(e);
        });
        const up = (e) => {
            if (dragging)
                dragUp(e);
            press(false);
            if (has('glow') && e.pointerType === 'touch')
                group.set({ glow: 0 }, { spring: role('smooth') });
        };
        on(el, 'pointerup', up);
        on(el, 'pointercancel', up);
        on(el, 'lostpointercapture', (e) => dragging && dragUp(e));
        on(el, 'click', (e) => {
            if (swallowClick) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { capture: true });
        on(el, 'keydown', (e) => {
            if (isDisabled(el, o))
                return;
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && (has('press') || has('squish')))
                press(true);
            if (has('drag') && e.target === el && e.key.startsWith('Arrow')) {
                e.preventDefault();
                // with a snap grid the keys move a whole cell (else 16 px, 64 with Shift)
                const step = (o.snap && o.snap > 0 ? o.snap : 16) * (e.shiftKey ? 4 : 1);
                const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
                const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
                const end = settleTo(group.target('dx') + dx, group.target('dy') + dy, 0, 0, 'snappy');
                o.onDragEnd?.(end);
            }
        });
        on(el, 'keyup', (e) => (e.key === ' ' || e.key === 'Enter') && press(false));
        on(el, 'blur', () => press(false), { capture: true });
        if (has('focus')) {
            // focusin / focusout so a wrapper reacts to the control inside it too
            on(el, 'focusin', (e) => {
                let visible = true;
                try {
                    visible = e.target.matches(':focus-visible');
                }
                catch {
                    /* old engines */
                }
                if (visible)
                    group.set({ focus: 1 }, { spring: role('pop') });
            });
            on(el, 'focusout', (e) => {
                if (!el.contains(e.relatedTarget))
                    group.set({ focus: 0 }, { spring: role('smooth') });
            });
        }
    };
    const syncAttr = () => {
        if (ownAttr)
            el.setAttribute('data-mo-micro', list.join(' '));
    };
    syncAttr();
    bind();
    const flash = (tone) => {
        clearTimeout(flashTimer);
        el.setAttribute('data-mo-micro-flash', tone);
        flashTimer = setTimeout(() => el.removeAttribute('data-mo-micro-flash'), 700);
    };
    const handle = {
        el,
        get fx() {
            return list.slice();
        },
        group,
        get position() {
            return { x: group.target('dx'), y: group.target('dy') };
        },
        feedback(kind) {
            const k = String(kind);
            if (!MICRO_FEEDBACK.includes(k))
                return;
            const parts = k === 'attention' ? ['pop', 'wiggle'] : [k];
            const tone = k === 'attention' ? 'info' : IMPULSES[k][2];
            if (o.haptics)
                fx.haptic(tone === 'error' ? [10, 50, 10] : 12);
            if (base.prefersReducedMotion())
                return flash(tone);
            for (const p of parts) {
                const [vel, spring] = IMPULSES[p];
                group.impulse(vel, spring);
            }
        },
        update(next, opts2) {
            if (opts2)
                o = { ...o, ...opts2 };
            if (next !== undefined) {
                const was = list.join(' ');
                list = parseMicro(next);
                if (list.join(' ') !== was) {
                    syncAttr();
                    bind();
                }
            }
            else
                bind();
            group.configure({ feel: o.feel ?? readFeel(el), speed: readSpeed(el) });
            if (!has('drag'))
                group.jump({ dx: 0, dy: 0 });
        },
        moveTo(x, y, instant) {
            if (instant)
                group.jump({ dx: x, dy: y });
            else
                settleTo(x, y, 0, 0, 'settle');
        },
        destroy() {
            off.forEach((f) => f());
            off = [];
            group.stop();
            clearTimeout(flashTimer);
            handles.delete(el);
            el.style.transform = savedTransform;
            for (const p of ['--mo-micro-lift', '--mo-micro-glow', '--mo-micro-gx', '--mo-micro-gy', '--mo-micro-focus', '--mo-micro-press'])
                el.style.removeProperty(p);
            for (const a of ['data-mo-pressed', 'data-mo-dragging', 'data-mo-micro-flash'])
                el.removeAttribute(a);
            if (ownAttr)
                el.removeAttribute('data-mo-micro');
        },
    };
    handles.set(el, handle);
    return handle;
}
/**
 * Play a feedback impulse on any element (`shake` for an error, `nod` / `pop` for success, `wiggle`, `jelly`,
 * `nudge`, `bump`, `attention`). Elements without `micro()` get a temporary handle that goes away when they settle.
 */
function feedback(el, kind, opts = {}) {
    const had = handles.get(el);
    if (had)
        return had.feedback(kind);
    const h = micro(el, [], opts);
    h.feedback(kind);
    const done = () => (h.group.animating ? setTimeout(done, 120) : h.destroy());
    setTimeout(done, base.prefersReducedMotion() ? 760 : 120);
}
const fromData = (el) => {
    const d = el.dataset;
    const n = (v) => (v !== undefined && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined);
    const b = d.moBounds;
    return {
        feel: d.moFeel || undefined,
        spring: d.moSpring || undefined,
        haptics: d.moHaptics !== undefined && d.moHaptics !== 'false',
        pressScale: n(d.moPressScale),
        hoverScale: n(d.moHoverScale),
        lift: n(d.moLift),
        strength: n(d.moStrength),
        reach: n(d.moReach),
        tilt: n(d.moTilt),
        snap: n(d.moSnap),
        axis: d.moAxis === 'x' || d.moAxis === 'y' ? d.moAxis : 'both',
        bounds: b === 'none' ? 'none' : b && b !== 'parent' ? el.closest(b) || 'parent' : 'parent',
    };
};
/**
 * Wire every `[data-mo-micro]` element under `root` (default `document`) and keep watching for new, changed and
 * removed ones. Options come from `data-mo-*` attributes (`data-mo-feel`, `data-mo-spring`, `data-mo-haptics`,
 * `data-mo-press-scale`, `data-mo-hover-scale`, `data-mo-lift`, `data-mo-strength`, `data-mo-reach`, `data-mo-tilt`,
 * `data-mo-snap`, `data-mo-axis`, `data-mo-bounds`). Returns a function that stops watching and undoes it all.
 */
function applyMicro(root = document) {
    if (typeof document === 'undefined')
        return () => { };
    const mine = new Set();
    const wire = (el) => {
        const spec = el.getAttribute('data-mo-micro');
        if (spec === null)
            return;
        const h = handles.get(el);
        if (h && !mine.has(el))
            return; // wired by code or by <mo-micro>
        if (h)
            h.update(spec, fromData(el));
        else {
            micro(el, spec, fromData(el));
            mine.add(el);
        }
    };
    const scan = (node) => {
        if (node instanceof HTMLElement && node.hasAttribute('data-mo-micro'))
            wire(node);
        node.querySelectorAll?.('[data-mo-micro]').forEach(wire);
    };
    scan(root);
    if (typeof MutationObserver === 'undefined')
        return () => mine.forEach((el) => handles.get(el)?.destroy());
    const mo = new MutationObserver((recs) => {
        for (const r of recs) {
            if (r.type === 'attributes') {
                const el = r.target;
                if (el.hasAttribute('data-mo-micro'))
                    wire(el);
                else if (mine.has(el)) {
                    handles.get(el)?.destroy();
                    mine.delete(el);
                }
                continue;
            }
            r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n));
            r.removedNodes.forEach((n) => {
                if (n.nodeType !== 1)
                    return;
                for (const el of [...mine])
                    if (!el.isConnected && (n === el || n.contains(el))) {
                        handles.get(el)?.destroy();
                        mine.delete(el);
                    }
            });
        }
    });
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mo-micro'] });
    return () => {
        mo.disconnect();
        mine.forEach((el) => handles.get(el)?.destroy());
        mine.clear();
    };
}

exports.MICRO_BEHAVIORS = MICRO_BEHAVIORS;
exports.MICRO_FEEDBACK = MICRO_FEEDBACK;
exports.applyMicro = applyMicro;
exports.feedback = feedback;
exports.micro = micro;
exports.microOf = microOf;
exports.microTransform = microTransform;
exports.parseMicro = parseMicro;
exports.readFeel = readFeel;
exports.readSpeed = readSpeed;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/micro-3qfNbgwt.cjs.map