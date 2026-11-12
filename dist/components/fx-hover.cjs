'use strict';

var registry = require('../chunks/registry-_XKU28ZC.cjs');
var base = require('../chunks/base-DzZEJhQB.cjs');

const active = /*#__PURE__*/ new WeakMap();
/** Wire enter (pointerenter / focusin) and leave (pointerleave / focusout) once per element and effect. */
function hover(el, name, make, ev) {
    let m = active.get(el);
    if (!m)
        active.set(el, (m = new Map()));
    const known = m.get(name);
    if (known) {
        known.enter(ev);
        return () => undefined;
    }
    const h = make();
    const enter = (e) => h.enter(e);
    const leave = (e) => {
        if (e.type === 'focusout' && el.contains(e.relatedTarget))
            return;
        h.leave?.();
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('focusin', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusout', leave);
    m.set(name, h);
    if (ev && (ev.type === 'pointerenter' || ev.type === 'focusin'))
        h.enter(ev);
    return () => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('focusin', enter);
        el.removeEventListener('pointerleave', leave);
        el.removeEventListener('focusout', leave);
        m.delete(name);
        h.cleanup();
    };
}
function layer(el, css, tag = 'span') {
    if (getComputedStyle(el).position === 'static')
        el.style.position = 'relative';
    const o = document.createElement(tag);
    o.setAttribute('aria-hidden', 'true');
    o.setAttribute('data-usa-fx-layer', '');
    o.style.cssText = css;
    el.appendChild(o);
    return o;
}
/** Split the element's text into spans (letters or words) behind a screen-reader copy; returns the spans and undo. */
function split(el, by) {
    const html = el.innerHTML;
    const text = el.textContent || '';
    const sr = document.createElement('span');
    sr.className = 'usa-sr';
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    sr.textContent = text;
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    const parts = [];
    for (const piece of by === 'char' ? Array.from(text) : text.split(/(\s+)/)) {
        if (by === 'word' && (!piece || /^\s+$/.test(piece))) {
            vis.append(piece);
            continue;
        }
        const s = document.createElement('span');
        s.style.display = 'inline-block';
        s.style.whiteSpace = 'pre';
        s.textContent = piece;
        vis.append(s);
        parts.push(s);
    }
    el.replaceChildren(sr, vis);
    return [parts, () => (el.innerHTML = html)];
}
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
const HOVER_FX = [
    {
        name: 'text-roll',
        kind: 'hover',
        reduced: 'run',
        description: 'Letters roll up and a copy of each rolls in from below, one after another (persistent; `stagger` ms, `duration` ms).',
        defaults: { stagger: 18, duration: 420 },
        run: (el, o, ctx) => hover(el, 'text-roll', () => {
            const [chars, undo] = split(el, 'char');
            el.style.overflow = 'hidden';
            for (const c of chars)
                c.style.textShadow = '0 1.25em currentColor';
            let running = false;
            return {
                enter: () => {
                    if (ctx.reduced || running)
                        return;
                    running = true;
                    let last = null;
                    chars.forEach((c, i) => {
                        last = ctx.animate(c, [{ transform: 'translateY(0)' }, { transform: 'translateY(-1.25em)' }], { duration: num(o.duration, 420), delay: i * num(o.stagger, 18), easing: 'cubic-bezier(.7,0,.2,1)' }) || last;
                    });
                    const end = () => void (running = false);
                    if (last)
                        last.finished.then(end, end);
                    else
                        end();
                },
                cleanup: () => {
                    el.style.overflow = '';
                    undo();
                },
            };
        }, ctx.event),
    },
    {
        name: 'image-swap',
        kind: 'hover',
        reduced: 'run',
        description: 'A second picture opens as a circle from the pointer and closes again on leave (persistent; `src` or the second <img>, `duration` ms).',
        defaults: { src: '', duration: 520 },
        run: (el, o, ctx) => hover(el, 'image-swap', () => {
            const imgs = el.querySelectorAll('img');
            const own = !o.src && imgs[1] ? imgs[1] : null;
            const img = own || layer(el, '', 'img');
            if (!own) {
                img.alt = '';
                if (o.src)
                    img.setAttribute('src', String(o.src));
            }
            const prev = img.style.cssText;
            img.style.cssText += ';position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;clip-path:circle(0% at 50% 50%)';
            if (ctx.reduced)
                img.style.cssText += ';clip-path:none;opacity:0';
            let at = '50% 50%';
            let a = null;
            const play = (open) => {
                const shut = `circle(0% at ${at})`;
                const full = `circle(150% at ${at})`;
                a?.cancel();
                if (ctx.reduced) {
                    img.style.clipPath = 'none';
                    a = ctx.animate(img, [{ opacity: open ? 0 : 1 }, { opacity: open ? 1 : 0 }], { duration: 200, fill: 'forwards' });
                    return;
                }
                img.style.clipPath = open ? full : shut;
                a = ctx.animate(img, [{ clipPath: open ? shut : full }, { clipPath: open ? full : shut }], { duration: num(o.duration, 520), easing: 'cubic-bezier(.6,0,.2,1)' });
            };
            return {
                enter: (e) => {
                    const r = el.getBoundingClientRect();
                    const p = e;
                    at = p && 'clientX' in p && r.width ? `${(((p.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((p.clientY - r.top) / r.height) * 100).toFixed(1)}%` : '50% 50%';
                    play(true);
                },
                leave: () => play(false),
                cleanup: () => {
                    a?.cancel();
                    if (own)
                        img.style.cssText = prev;
                    else
                        img.remove();
                },
            };
        }, ctx.event),
    },
    {
        name: 'focus-reveal',
        kind: 'hover',
        reduced: 'run',
        description: 'Words start soft; a focus frame travels across them and sharpens each in turn (persistent; `blur` px, `step` ms, `color`).',
        defaults: { blur: 3, step: 140, color: 'currentColor' },
        run: (el, o, ctx) => hover(el, 'focus-reveal', () => {
            const [words, undo] = split(el, 'word');
            const blur = `blur(${num(o.blur, 3)}px)`;
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            const frame = layer(el, `position:absolute;left:0;top:0;pointer-events:none;opacity:0;border:1.5px solid ${o.color === 'currentColor' ? 'currentColor' : String(o.color).replace(/[;{}<>]/g, '')};border-radius:4px;box-sizing:border-box`);
            const soft = () => words.forEach((w) => (w.style.filter = ctx.reduced ? '' : blur));
            soft();
            let anims = [];
            const stop = () => (anims.forEach((a) => a.cancel()), (anims = []));
            return {
                enter: () => {
                    if (ctx.reduced)
                        return;
                    stop();
                    const step = num(o.step, 140);
                    const host = el.getBoundingClientRect();
                    const boxes = words.map((w) => {
                        const r = w.getBoundingClientRect();
                        return { transform: `translate(${(r.left - host.left - 3).toFixed(1)}px,${(r.top - host.top - 2).toFixed(1)}px)`, width: `${(r.width + 6).toFixed(1)}px`, height: `${(r.height + 4).toFixed(1)}px` };
                    });
                    words.forEach((w, i) => {
                        const a = ctx.animate(w, [{ filter: blur }, { filter: 'blur(0px)' }], { duration: step * 1.5, delay: i * step, easing: 'ease-out', fill: 'forwards' });
                        if (a)
                            anims.push(a);
                    });
                    if (boxes.length) {
                        const f = ctx.animate(frame, [...boxes.map((b, i) => ({ ...b, opacity: 1, offset: boxes.length > 1 ? i / boxes.length : 0 })), { ...boxes[boxes.length - 1], opacity: 0, offset: 1 }], { duration: step * (boxes.length + 1), easing: 'linear' });
                        if (f)
                            anims.push(f);
                    }
                },
                leave: () => {
                    stop();
                    soft();
                },
                cleanup: () => {
                    stop();
                    frame.remove();
                    undo();
                },
            };
        }, ctx.event),
    },
    {
        name: 'grid-warp',
        kind: 'hover',
        reduced: 'skip',
        description: 'The element shears and tilts toward the pointer over a faint grid, then springs back on leave (persistent; `amount` deg, `grid` px).',
        defaults: { amount: 8, grid: 24 },
        run: (el, o, ctx) => hover(el, 'grid-warp', () => {
            const g = Math.max(4, num(o.grid, 24));
            const grid = layer(el, `position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;background:linear-gradient(currentColor 1px,transparent 1px) 0 0/${g}px ${g}px,linear-gradient(90deg,currentColor 1px,transparent 1px) 0 0/${g}px ${g}px;mix-blend-mode:soft-light`);
            const prev = el.style.transform;
            const amt = num(o.amount, 8);
            let raf = 0;
            let x = 0.5, y = 0.5;
            const apply = () => {
                raf = 0;
                el.style.transform = `${prev} perspective(600px) skewX(${((x - 0.5) * amt).toFixed(2)}deg) rotateX(${((0.5 - y) * amt).toFixed(2)}deg) rotateY(${((x - 0.5) * amt).toFixed(2)}deg)`;
            };
            const move = (e) => {
                const r = el.getBoundingClientRect();
                if (!r.width || !r.height)
                    return;
                x = (e.clientX - r.left) / r.width;
                y = (e.clientY - r.top) / r.height;
                raf || (raf = base.raf(apply, el));
            };
            el.addEventListener('pointermove', move);
            return {
                enter: () => {
                    grid.style.opacity = '.35';
                },
                leave: () => {
                    if (raf)
                        base.caf(raf), (raf = 0);
                    const from = el.style.transform;
                    el.style.transform = prev;
                    grid.style.opacity = '0';
                    if (from && from !== prev)
                        ctx.animate(el, [{ transform: from }, { transform: prev || 'none' }], { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)' });
                },
                cleanup: () => {
                    if (raf)
                        base.caf(raf);
                    el.removeEventListener('pointermove', move);
                    el.style.transform = prev;
                    grid.remove();
                },
            };
        }, ctx.event),
    },
    {
        name: 'googly-eyes',
        kind: 'hover',
        reduced: 'skip',
        description: 'Two eyes pop up on the element and their pupils follow the pointer while it hovers (persistent; `size` px, `color`).',
        defaults: { size: 22, color: '#111' },
        run: (el, o, ctx) => hover(el, 'googly-eyes', () => {
            const s = Math.max(8, num(o.size, 22));
            const color = String(o.color).replace(/[;{}<>]/g, '');
            const box = layer(el, `position:absolute;left:50%;top:0;translate:-50% -55%;display:flex;gap:${Math.round(s / 5)}px;pointer-events:none;opacity:0;z-index:2`);
            const pupils = [0, 1].map(() => {
                const eye = document.createElement('span');
                eye.style.cssText = `width:${s}px;height:${s}px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px ${color};display:grid;place-items:center`;
                const p = document.createElement('span');
                p.style.cssText = `width:${Math.round(s * 0.45)}px;height:${Math.round(s * 0.45)}px;border-radius:50%;background:${color};transition:transform .08s`;
                eye.append(p);
                box.append(eye);
                return p;
            });
            const move = (e) => {
                for (const p of pupils) {
                    const r = p.parentElement.getBoundingClientRect();
                    const dx = e.clientX - (r.left + r.width / 2);
                    const dy = e.clientY - (r.top + r.height / 2);
                    const d = Math.hypot(dx, dy) || 1;
                    const k = Math.min(1, d / 40) * s * 0.22;
                    p.style.transform = `translate(${((dx / d) * k).toFixed(1)}px,${((dy / d) * k).toFixed(1)}px)`;
                }
            };
            el.addEventListener('pointermove', move);
            return {
                enter: () => {
                    box.style.opacity = '1';
                    ctx.animate(box, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
                },
                leave: () => {
                    for (const p of pupils)
                        p.style.transform = '';
                    box.style.opacity = '0';
                },
                cleanup: () => {
                    el.removeEventListener('pointermove', move);
                    box.remove();
                },
            };
        }, ctx.event),
    },
];
/** Register the 17.3 hover pack (idempotent). */
function registerHoverPack() {
    registry.registerEffects(HOVER_FX);
}

exports.HOVER_FX = HOVER_FX;
exports.registerHoverPack = registerHoverPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/components/fx-hover.cjs.map