'use strict';

var spring = require('./spring-DoapHVAk.cjs');

/**
 * 17.20 helpers shared by the snap and swing parts (fling-ruler, fling-dial, spring-grid, chat-head, fling-tabs,
 * swing-sign). Pure functions with no DOM access, so they are easy to test. The motion itself comes from the 17.16
 * spring core (`createSpringGroup`) and, for the hanging sign, a small pendulum stepped on the shared frame scheduler.
 * Original implementations; see docs/snap-parts-17-20.md.
 */
const fin = (n, d) => (typeof n === 'number' && Number.isFinite(n) ? n : d);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const r1 = (n) => Math.round(n * 10) / 10;
/* ---------------------------------------------------------------- ruler */
/** The most steps a ruler draws; a finer `step` over a long range is widened to stay under it. */
const RULER_MAX_STEPS = 2000;
/** Number of decimals a `step` needs to be shown exactly (0.25 → 2, 5 → 0). */
function stepDecimals(step) {
    const s = Math.abs(fin(step, 1));
    if (!s || s >= 1)
        return 0;
    const text = String(s);
    const e = /e-(\d+)$/.exec(text);
    if (e)
        return Math.min(10, Number(e[1]));
    return Math.min(10, (text.split('.')[1] || '').length);
}
/**
 * A ruler's range: `min` and `max` in order, a positive `step` no finer than `RULER_MAX_STEPS` steps, and how many
 * steps lie between them.
 */
function rulerRange(min, max, step) {
    let lo = fin(min, 0);
    let hi = fin(max, 100);
    if (hi < lo)
        [lo, hi] = [hi, lo];
    let s = Math.abs(fin(step, 1)) || 1;
    if ((hi - lo) / s > RULER_MAX_STEPS)
        s = (hi - lo) / RULER_MAX_STEPS;
    const steps = Math.max(0, Math.round((hi - lo) / s));
    return { min: lo, max: lo + steps * s, step: s, steps };
}
/** The value of step `i` (clamped to the range), rounded to the step's decimals. */
function rulerValue(i, min, step, steps) {
    const k = clamp(Math.round(fin(i, 0)), 0, Math.max(0, Math.floor(fin(steps, 0))));
    return Number((fin(min, 0) + k * fin(step, 1)).toFixed(stepDecimals(step)));
}
/** The step nearest to `value`. */
function rulerIndex(value, min, step, steps) {
    const s = fin(step, 1) || 1;
    return clamp(Math.round((fin(value, fin(min, 0)) - fin(min, 0)) / s), 0, Math.max(0, Math.floor(fin(steps, 0))));
}
/**
 * The step a ruler flung at `position` (in steps, possibly past an end) with `velocity` (steps per second) comes to
 * rest on: its momentum carries it on, then it snaps to the nearest step inside the range.
 */
function rulerRest(position, velocity, steps) {
    const n = Math.max(0, Math.floor(fin(steps, 0)));
    return clamp(Math.round(spring.projectInertia(fin(position, 0), fin(velocity, 0), 0.3)), 0, n);
}
/* ---------------------------------------------------------------- dial */
/** Split `"A, B, C"` into trimmed, non-empty option labels (2 to 36; falls back to 0 to 9). */
function parseDialOptions(text) {
    const out = String(text ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 36);
    return out.length >= 2 ? out : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
}
/** Angle in degrees (0 = straight up, clockwise) of the point (`x`, `y`) seen from the centre (`cx`, `cy`). */
function dialAngle(x, y, cx, cy) {
    const a = (Math.atan2(fin(x, 0) - fin(cx, 0), -(fin(y, 0) - fin(cy, 0))) * 180) / Math.PI;
    return a < 0 ? a + 360 : a;
}
/** The shortest turn (degrees, −180 to 180) from angle `a` to angle `b`. */
function dialDelta(a, b) {
    let d = (fin(b, 0) - fin(a, 0)) % 360;
    if (d > 180)
        d -= 360;
    if (d < -180)
        d += 360;
    return d === -180 ? 180 : d;
}
/**
 * The option a dial turned to `rotation` degrees points at, for `n` options spaced evenly round it. Turning the
 * dial clockwise brings the options before the current one under the pointer, as on a real dial.
 */
function detentAt(rotation, n) {
    const k = Math.max(1, Math.floor(fin(n, 1)));
    const i = Math.round(-fin(rotation, 0) / (360 / k));
    return ((i % k) + k) % k;
}
/** The rotation (degrees) nearest to `rotation` that puts option `index` under the pointer. */
function detentRotation(index, n, rotation = 0) {
    const k = Math.max(1, Math.floor(fin(n, 1)));
    const step = 360 / k;
    const base = -fin(index, 0) * step;
    const turns = Math.round((fin(rotation, 0) - base) / 360);
    return base + turns * 360;
}
/**
 * Where a dial released at `rotation` with `velocity` (degrees per second) settles: its momentum spins it on, and it
 * stops on the nearest detent.
 */
function dialRest(rotation, velocity, n) {
    const k = Math.max(1, Math.floor(fin(n, 1)));
    const step = 360 / k;
    return Math.round(spring.projectInertia(fin(rotation, 0), clamp(fin(velocity, 0), -2400, 2400), 0.28) / step) * step;
}
/* ---------------------------------------------------------------- grid */
/** Top-left (px) of slot `i` in a grid of `cols` columns of `cell` × `rowH` px cells, `gap` px apart. */
function gridSlot(i, cols, cell, gap, rowH = cell) {
    const c = Math.max(1, Math.floor(fin(cols, 1)));
    const k = Math.max(0, Math.floor(fin(i, 0)));
    const g = Math.max(0, fin(gap, 0));
    return { x: r1((k % c) * (fin(cell, 0) + g)), y: r1(Math.floor(k / c) * (fin(rowH, cell) + g)) };
}
/** The slot (0 to `count` − 1) whose cell is nearest to the point (`x`, `y`), in px from the grid's top-left. */
function slotAtPoint(x, y, cols, cell, gap, count, rowH = cell) {
    const c = Math.max(1, Math.floor(fin(cols, 1)));
    const n = Math.max(0, Math.floor(fin(count, 0)));
    if (!n)
        return -1;
    const g = Math.max(0, fin(gap, 0));
    const cw = Math.max(1, fin(cell, 1) + g);
    const ch = Math.max(1, fin(rowH, cell) + g);
    const col = clamp(Math.floor((fin(x, 0) + g / 2) / cw), 0, c - 1);
    const rows = Math.ceil(n / c);
    const row = clamp(Math.floor((fin(y, 0) + g / 2) / ch), 0, rows - 1);
    return Math.min(n - 1, row * c + col);
}
/** The slot an arrow key (or Home / End) moves a picked-up item to in a grid of `cols` columns and `count` items. */
function slotStep(index, key, cols, count) {
    const c = Math.max(1, Math.floor(fin(cols, 1)));
    const n = Math.max(1, Math.floor(fin(count, 1)));
    const i = clamp(Math.floor(fin(index, 0)), 0, n - 1);
    const to = { ArrowLeft: i - 1, ArrowRight: i + 1, ArrowUp: i - c, ArrowDown: i + c, Home: 0, End: n - 1 };
    const t = to[key];
    return t === undefined || t < 0 || t >= n ? i : t;
}
/** The order of `n` items after the one at `from` moves to `to` (indices of the original items). */
function gridReorder(n, from, to) {
    const list = Array.from({ length: Math.max(0, Math.floor(fin(n, 0))) }, (_, i) => i);
    if (!list.length)
        return list;
    const f = clamp(Math.round(fin(from, 0)), 0, list.length - 1);
    const t = clamp(Math.round(fin(to, 0)), 0, list.length - 1);
    const [item] = list.splice(f, 1);
    list.splice(t, 0, item);
    return list;
}
/**
 * Where a chat head released at (`x`, `y`) (its top-left, px) with speed (`vx`, `vy`) px/s comes to rest in a
 * `fw` × `fh` frame: against the side its momentum points at, at the height it would coast to, `inset` px from the
 * edges. `size` is the head's diameter.
 */
function headRest(x, y, vx, vy, size, fw, fh, inset = 10) {
    const s = Math.max(0, fin(size, 56));
    const i = Math.max(0, fin(inset, 10));
    const w = Math.max(0, fin(fw, 0));
    const h = Math.max(0, fin(fh, 0));
    const cx = spring.projectInertia(fin(x, 0) + s / 2, fin(vx, 0), 0.2);
    const side = cx < w / 2 ? 'left' : 'right';
    const top = i;
    const bottom = Math.max(i, h - s - i);
    const ty = clamp(spring.projectInertia(fin(y, 0), clamp(fin(vy, 0), -3e3, 3000), 0.12), top, bottom);
    return { side, x: side === 'left' ? i : Math.max(i, w - s - i), y: r1(ty) };
}
/**
 * How strongly a chat head at (`x`, `y`) (its centre) is drawn to a target at (`tx`, `ty`): 0 beyond `radius`,
 * rising to 1 at the target.
 */
function magnetPull(x, y, tx, ty, radius) {
    const r = Math.max(1, fin(radius, 80));
    const d = Math.hypot(fin(x, 0) - fin(tx, 0), fin(y, 0) - fin(ty, 0));
    if (d >= r)
        return 0;
    const f = 1 - d / r;
    return Math.round(f * f * (3 - 2 * f) * 1000) / 1000;
}
/* ---------------------------------------------------------------- tabs */
/**
 * The tab indicator at scroll position `p` (in tabs, 0 = first; fractions while a swipe is under way) for tabs at
 * `rects` (x and width, px). Between two tabs the leading edge runs ahead and the trailing edge catches up, so the
 * indicator stretches in the middle of a move and is exactly the tab's size at rest.
 */
function indicatorAt(p, rects) {
    if (!rects.length)
        return { x: 0, w: 0 };
    const last = rects.length - 1;
    const at = fin(p, 0);
    if (at <= 0) {
        // past the first tab the indicator only squashes a little, as the panels stretch
        const f = Math.min(0.5, -at);
        return { x: r1(rects[0].x), w: r1(rects[0].w * (1 - f * 0.5)) };
    }
    if (at >= last) {
        const f = Math.min(0.5, at - last);
        const w = rects[last].w * (1 - f * 0.5);
        return { x: r1(rects[last].x + rects[last].w - w), w: r1(w) };
    }
    const i = Math.floor(at);
    const t = at - i;
    const a = rects[i];
    const b = rects[i + 1];
    // leading edge eases out, trailing edge eases in
    const lead = 1 - (1 - t) * (1 - t);
    const trail = t * t;
    const fwd = b.x >= a.x;
    const left = fwd ? a.x + (b.x - a.x) * trail : a.x + (b.x - a.x) * lead;
    const right = fwd ? a.x + a.w + (b.x + b.w - a.x - a.w) * lead : a.x + a.w + (b.x + b.w - a.x - a.w) * trail;
    return { x: r1(left), w: r1(Math.max(0, right - left)) };
}
/* ---------------------------------------------------------------- swing sign */
/**
 * One step of a damped pendulum: `angle` (radians from hanging straight down), `velocity` (rad/s), over `dt` ms, for
 * a string `length` px long under gravity, losing `damping` of its speed per second. Sub-stepped, so a long frame
 * stays stable.
 */
function pendulumStep(angle, velocity, dt, length, damping = 1.2) {
    let a = fin(angle, 0);
    let v = fin(velocity, 0);
    const total = clamp(fin(dt, 0), 0, 100) / 1000;
    const len = Math.max(20, fin(length, 120));
    // a sign is not a point mass on a thread: a stiffer "gravity" keeps the swing lively at small sizes
    const g = 9.81 * 380;
    const k = Math.max(0, fin(damping, 1.2));
    const n = Math.max(1, Math.ceil(total / 0.004));
    const h = total / n;
    for (let i = 0; i < n; i++) {
        v += (-(g / len) * Math.sin(a) - k * v) * h;
        a += v * h;
    }
    a = clamp(a, -1.2, 1.2);
    return { angle: a, velocity: Math.abs(v) < 1e-4 && Math.abs(a) < 1e-4 ? 0 : v };
}
/** The angular speed (rad/s) a push of `vx` px/s at the bottom of a sign on a `length` px string gives it, capped. */
function swingImpulse(vx, length) {
    const len = Math.max(20, fin(length, 120));
    return clamp(fin(vx, 0) / len, -9, 9);
}
/** True when a pendulum has all but stopped (so its frame loop can rest). */
function pendulumAtRest(angle, velocity) {
    return Math.abs(fin(angle, 0)) < 0.0015 && Math.abs(fin(velocity, 0)) < 0.004;
}

var css = ":is(usa-fling-ruler,mo-fling-ruler,usa-fling-dial,mo-fling-dial,usa-spring-grid,mo-spring-grid,usa-chat-head,mo-chat-head,usa-fling-tabs,mo-fling-tabs,usa-swing-sign,mo-swing-sign){display:block;min-width:0}.usa-snkit{--sn-ink:var(--mo-kit-ink,#18181b);--sn-paper:var(--mo-kit-paper,#ffffff);--sn-accent:var(--mo-kit-accent,#4f46e5);--sn-on-accent:var(--mo-kit-on-accent,#ffffff);--sn-soft:var(--mo-kit-soft,color-mix(in srgb,var(--sn-ink) 7%,var(--sn-paper)));--sn-line:var(--mo-kit-line,color-mix(in srgb,var(--sn-ink) 16%,transparent));--sn-mute:color-mix(in srgb,var(--sn-ink) 60%,transparent);--sn-radius:var(--mo-kit-radius,14px);--sn-shadow:var(--mo-kit-shadow,0 14px 36px -14px color-mix(in srgb,var(--sn-ink) 45%,transparent));--sn-bw:var(--mo-kit-border-width,1px);--sn-bs:var(--mo-kit-border-style,solid);box-sizing:border-box;color:var(--sn-ink);font:inherit}.usa-snkit *,.usa-snkit *::before,.usa-snkit *::after{box-sizing:border-box}:where(.usa-snkit) button{font:inherit;color:inherit;-webkit-appearance:none;appearance:none;background:none;border:0;margin:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}.usa-snkit :focus-visible{outline:2px solid var(--sn-accent);outline-offset:3px}.usa-snkit svg{display:block}.usa-ruler{display:grid;gap:10px;justify-items:center}.usa-ruler-value{font-size:var(--usa-ruler-value-size,2.2rem);font-weight:650;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}.usa-ruler-value small{font-size:.45em;font-weight:600;color:var(--sn-mute);margin-inline-start:.25em;letter-spacing:0}.usa-ruler-view{position:relative;width:100%;height:var(--usa-ruler-height,76px);overflow:hidden;border-radius:var(--sn-radius);background:var(--sn-soft);border:var(--sn-bw) var(--sn-bs) var(--sn-line);cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)}.usa-ruler[data-dragging] .usa-ruler-view{cursor:grabbing}.usa-ruler[data-disabled] .usa-ruler-view{cursor:not-allowed;opacity:.5}.usa-ruler-view:focus-visible{outline-offset:2px}.usa-ruler-strip{position:absolute;left:0;bottom:0;height:100%;will-change:transform;background-image:linear-gradient(90deg,color-mix(in srgb,var(--sn-ink) 70%,transparent) 2px,transparent 2px),linear-gradient(90deg,color-mix(in srgb,var(--sn-ink) 34%,transparent) 1px,transparent 1px);background-size:var(--usa-ruler-major-px,100px) 46%,var(--usa-ruler-step-px,10px) 24%;background-repeat:repeat-x;background-position:-1px 100%,0 100%}.usa-ruler-label{position:absolute;top:8px;transform:translateX(-50%);font-size:11px;font-weight:600;color:var(--sn-mute);font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none}.usa-ruler-needle{position:absolute;left:50%;top:6px;bottom:0;width:3px;margin-left:-1.5px;border-radius:3px;background:var(--sn-accent);pointer-events:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--sn-accent) 18%,transparent)}.usa-ruler-needle::before{content:'';position:absolute;left:50%;top:-6px;width:11px;height:11px;margin-left:-5.5px;border-radius:50%;background:var(--sn-accent)}.usa-fdial{position:relative;width:var(--usa-dial-size,220px);aspect-ratio:1;margin-inline:auto}.usa-fdial-wheel{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 38%,var(--sn-paper),var(--sn-soft) 72%);border:var(--sn-bw) var(--sn-bs) var(--sn-line);box-shadow:var(--sn-shadow),inset 0 -10px 24px -16px color-mix(in srgb,var(--sn-ink) 40%,transparent);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}.usa-fdial[data-dragging] .usa-fdial-wheel{cursor:grabbing}.usa-fdial[data-disabled] .usa-fdial-wheel{cursor:not-allowed;opacity:.5}.usa-fdial-wheel:focus-visible{outline-offset:4px}.usa-fdial-face{position:absolute;inset:0;will-change:transform}.usa-fdial-face svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-fdial-tick{stroke:color-mix(in srgb,var(--sn-ink) 32%,transparent);stroke-width:1.4;stroke-linecap:round}.usa-fdial-tick[data-major]{stroke:color-mix(in srgb,var(--sn-ink) 70%,transparent);stroke-width:2.4}.usa-fdial-opt{position:absolute;left:50%;top:50%;font-size:13px;font-weight:650;white-space:nowrap;color:var(--sn-mute);pointer-events:none}.usa-fdial-opt[data-on]{color:var(--sn-ink)}.usa-fdial-hub{position:absolute;inset:31%;border-radius:50%;display:grid;place-items:center;text-align:center;background:var(--sn-paper);border:var(--sn-bw) var(--sn-bs) var(--sn-line);box-shadow:0 6px 16px -10px color-mix(in srgb,var(--sn-ink) 50%,transparent);pointer-events:none;font-weight:700;font-size:var(--usa-dial-value-size,1.25rem);line-height:1.1;padding:6px;overflow:hidden}.usa-fdial-mark{position:absolute;left:50%;top:-4px;width:0;height:0;margin-left:-8px;border:8px solid transparent;border-top:12px solid var(--sn-accent);border-bottom:0;pointer-events:none;filter:drop-shadow(0 2px 3px color-mix(in srgb,var(--sn-ink) 30%,transparent))}.usa-sgrid{position:relative;width:100%;touch-action:manipulation}.usa-sgrid-item{position:absolute;left:0;top:0;display:grid;place-items:center;border-radius:var(--sn-radius);background:var(--sn-paper);border:var(--sn-bw) var(--sn-bs) var(--sn-line);cursor:grab;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;will-change:transform;text-align:center;overflow:hidden}.usa-sgrid-item>:first-child{margin-top:0}.usa-sgrid-item>:last-child{margin-bottom:0}.usa-sgrid-item[data-lifted]{z-index:3;cursor:grabbing;box-shadow:var(--sn-shadow);border-color:var(--sn-accent)}.usa-sgrid[data-editing] .usa-sgrid-item:not([data-lifted]){animation:usa-sgrid-jiggle .26s ease-in-out infinite alternate}.usa-sgrid[data-editing] .usa-sgrid-item:nth-child(2n):not([data-lifted]){animation-delay:-.13s}@keyframes usa-sgrid-jiggle{from{rotate:-1.2deg}to{rotate:1.2deg}}.usa-chead{position:relative;height:var(--usa-chead-height,320px);overflow:hidden;border-radius:var(--sn-radius);border:var(--sn-bw) var(--sn-bs) var(--sn-line);background:var(--sn-soft);isolation:isolate}.usa-chead-page{height:100%;padding:18px;overflow:auto}.usa-chead-page>:first-child{margin-top:0}.usa-chead-btn{position:absolute;left:0;top:0;z-index:3;width:var(--usa-chead-size,56px);height:var(--usa-chead-size,56px);border-radius:50%;background:var(--sn-accent);color:var(--sn-on-accent);display:grid;place-items:center;font-weight:700;box-shadow:0 10px 24px -8px color-mix(in srgb,var(--sn-ink) 55%,transparent);touch-action:none;will-change:transform;user-select:none;-webkit-user-select:none;overflow:visible}.usa-chead-btn>span:first-child{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;overflow:hidden}.usa-chead[data-dragging] .usa-chead-btn{cursor:grabbing}.usa-chead[data-dismissed] .usa-chead-btn{visibility:hidden}.usa-chead-badge{position:absolute;right:-3px;top:-3px;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;line-height:20px;text-align:center;box-shadow:0 0 0 2px var(--sn-paper)}.usa-chead-target{position:absolute;left:50%;bottom:22px;z-index:2;width:60px;height:60px;margin-left:-30px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--sn-ink) 78%,transparent);color:var(--sn-paper);font-size:24px;line-height:1;pointer-events:none;opacity:0;will-change:transform,opacity}.usa-chead-shade{position:absolute;inset:auto 0 0 0;height:45%;z-index:1;background:linear-gradient(transparent,color-mix(in srgb,var(--sn-ink) 30%,transparent));pointer-events:none;opacity:0}.usa-ftabs{display:grid;gap:12px;min-width:0}.usa-ftabs-bar{position:relative;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:4px;border-radius:999px;background:var(--sn-soft);border:var(--sn-bw) var(--sn-bs) var(--sn-line)}.usa-ftabs-bar::-webkit-scrollbar{display:none}.usa-ftabs-tab{position:relative;z-index:1;flex:1 0 auto;padding:8px 16px;border-radius:999px;font-weight:600;font-size:.92rem;white-space:nowrap;color:var(--sn-mute);transition:color .2s}.usa-ftabs-tab[aria-selected=\"true\"]{color:var(--sn-on-accent)}.usa-ftabs-ink{position:absolute;left:0;top:4px;bottom:4px;width:0;border-radius:999px;background:var(--sn-accent);will-change:transform,width;pointer-events:none}.usa-ftabs-view{position:relative;overflow:hidden;touch-action:pan-y;border-radius:var(--sn-radius)}.usa-ftabs[data-dragging] .usa-ftabs-view{user-select:none;-webkit-user-select:none;cursor:grabbing}.usa-ftabs-track{display:flex;align-items:flex-start;will-change:transform}.usa-ftabs-panel{flex:0 0 100%;min-width:0;padding:16px 18px;border-radius:var(--sn-radius);background:var(--sn-paper);border:var(--sn-bw) var(--sn-bs) var(--sn-line)}.usa-ftabs-panel>:first-child{margin-top:0}.usa-ftabs-panel>:last-child{margin-bottom:0}.usa-swing{position:relative;display:grid;justify-items:center;padding-top:10px;min-height:calc(var(--usa-swing-length,60px) + 130px);perspective:900px}.usa-swing-nail{position:absolute;top:4px;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;z-index:2;background:radial-gradient(circle at 35% 35%,color-mix(in srgb,var(--sn-paper) 80%,#999),color-mix(in srgb,var(--sn-ink) 70%,transparent));box-shadow:0 2px 4px color-mix(in srgb,var(--sn-ink) 40%,transparent)}.usa-swing-rig{position:relative;display:grid;justify-items:center;transform-origin:50% 1px;will-change:transform;padding-top:var(--usa-swing-length,60px)}.usa-swing-rig svg{position:absolute;left:0;top:0;width:100%;height:var(--usa-swing-length,60px);overflow:visible;pointer-events:none}.usa-swing-rig line{stroke:color-mix(in srgb,var(--sn-ink) 55%,transparent);stroke-width:1.6;stroke-linecap:round}.usa-swing-card{position:relative;display:grid;min-width:var(--usa-swing-width,180px);transform-style:preserve-3d;will-change:transform;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}.usa-swing[data-dragging] .usa-swing-card{cursor:grabbing}.usa-swing-face{grid-area:1/1;display:grid;place-items:center;text-align:center;padding:18px 22px;border-radius:var(--sn-radius);background:var(--sn-paper);border:var(--sn-bw) var(--sn-bs) var(--sn-line);box-shadow:var(--sn-shadow);-webkit-backface-visibility:hidden;backface-visibility:hidden}.usa-swing-face>:first-child{margin-top:0}.usa-swing-face>:last-child{margin-bottom:0}.usa-swing-back{transform:rotateY(180deg);background:var(--sn-ink);color:var(--sn-paper)}.usa-swing-card::before,.usa-swing-card::after{content:'';position:absolute;top:10px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:color-mix(in srgb,var(--sn-ink) 45%,transparent);z-index:1;transform:translateZ(1px)}.usa-swing-card::before{left:24%}.usa-swing-card::after{left:76%}@media (prefers-reduced-motion:reduce){.usa-sgrid[data-editing] .usa-sgrid-item:not([data-lifted]){animation:none}.usa-ftabs-tab{transition:none}}";

exports.RULER_MAX_STEPS = RULER_MAX_STEPS;
exports.css = css;
exports.detentAt = detentAt;
exports.detentRotation = detentRotation;
exports.dialAngle = dialAngle;
exports.dialDelta = dialDelta;
exports.dialRest = dialRest;
exports.gridReorder = gridReorder;
exports.gridSlot = gridSlot;
exports.headRest = headRest;
exports.indicatorAt = indicatorAt;
exports.magnetPull = magnetPull;
exports.parseDialOptions = parseDialOptions;
exports.pendulumAtRest = pendulumAtRest;
exports.pendulumStep = pendulumStep;
exports.rulerIndex = rulerIndex;
exports.rulerRange = rulerRange;
exports.rulerRest = rulerRest;
exports.rulerValue = rulerValue;
exports.slotAtPoint = slotAtPoint;
exports.slotStep = slotStep;
exports.stepDecimals = stepDecimals;
exports.swingImpulse = swingImpulse;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/snap-kit-20-CfLyvsrA.cjs.map