import { p as prefersReducedMotion, v as EASE_OUT, m as motionScale, u as defineElement } from '../chunks/base-CZiIAMBc.js';
export { f as configureComponents } from '../chunks/base-CZiIAMBc.js';

/** FLIP keyframes from a previous box to the current one (pure). */
function flipFrames(from, to, scale = true) {
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = scale && to.width ? from.width / to.width : 1;
    const sy = scale && to.height ? from.height / to.height : 1;
    return [
        { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: '0 0', transform: 'none' },
    ];
}
/**
 * Auto-animate a container: children that are added fade / scale in, removed
 * ones fade out in place, and moved ones (re-sort, filter, reflow, resize)
 * glide to their new spot — no extra code at the call site. Returns
 * `{ disable, enable, stop }`. Reduced motion: changes apply instantly.
 *
 * @example
 * const ctl = autoAnimate(document.querySelector('ul'));
 * list.append(item); // animates
 */
function autoAnimate(parent, o = {}) {
    let on = true;
    const boxes = new WeakMap();
    const rel = (el) => {
        const r = el.getBoundingClientRect();
        const p = parent.getBoundingClientRect();
        return { left: r.left - p.left, top: r.top - p.top, width: r.width, height: r.height };
    };
    const snap = () => Array.from(parent.children).forEach((c) => boxes.set(c, rel(c)));
    const dur = () => (o.duration ?? 300) * motionScale();
    const timing = () => ({ duration: dur(), easing: o.easing ?? EASE_OUT });
    const animate = (el, frames, t = timing()) => (typeof el.animate === 'function' ? el.animate(frames, t) : null);
    const mo = typeof MutationObserver === 'function'
        ? new MutationObserver((records) => {
            if (!on || prefersReducedMotion() || dur() <= 0)
                return snap();
            const added = new Set();
            for (const r of records) {
                r.addedNodes.forEach((n) => n instanceof Element && n.parentElement === parent && added.add(n));
                r.removedNodes.forEach((n) => {
                    if (!(n instanceof HTMLElement) || n.isConnected)
                        return;
                    const b = boxes.get(n);
                    if (!b)
                        return;
                    // put a ghost back at its old place and fade it out
                    n.style.position = 'absolute';
                    n.style.left = `${b.left}px`;
                    n.style.top = `${b.top}px`;
                    n.style.width = `${b.width}px`;
                    n.style.height = `${b.height}px`;
                    n.style.margin = '0';
                    n.style.pointerEvents = 'none';
                    if (getComputedStyle(parent).position === 'static')
                        parent.style.position = 'relative';
                    parent.appendChild(n);
                    n.__usaGhost = true;
                    const a = animate(n, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }]);
                    const drop = () => {
                        n.remove();
                        for (const k of ['position', 'left', 'top', 'width', 'height', 'margin', 'pointerEvents'])
                            n.style[k] = '';
                    };
                    if (a)
                        a.finished.then(drop, drop);
                    else
                        drop();
                });
            }
            Array.from(parent.children).forEach((c) => {
                if (c.__usaGhost)
                    return;
                if (added.has(c))
                    return void animate(c, [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }]);
                const prev = boxes.get(c);
                if (!prev)
                    return;
                const now = rel(c);
                if (Math.abs(prev.left - now.left) + Math.abs(prev.top - now.top) + Math.abs(prev.width - now.width) + Math.abs(prev.height - now.height) < 1)
                    return;
                animate(c, flipFrames(prev, now, o.scale !== false));
            });
            snap();
        })
        : null;
    mo?.observe(parent, { childList: true });
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => snap()) : null;
    ro?.observe(parent);
    snap();
    // capture boxes right before any change in the same task (events, timers)
    const capture = () => snap();
    parent.addEventListener('pointerdown', capture, true);
    return {
        enable: () => ((on = true), snap()),
        disable: () => (on = false),
        stop: () => {
            mo?.disconnect();
            ro?.disconnect();
            parent.removeEventListener('pointerdown', capture, true);
        },
    };
}
/** Masonry placement: shortest-column-first positions for item heights (pure). */
function masonryLayout(heights, columns, columnWidth, gap) {
    const cols = Array(Math.max(1, columns)).fill(0);
    const out = heights.map((h) => {
        const c = cols.indexOf(Math.min(...cols));
        const pos = { x: c * (columnWidth + gap), y: cols[c] };
        cols[c] += h + gap;
        return pos;
    });
    out.height = Math.max(0, Math.max(...cols) - gap);
    return out;
}
/**
 * Shared-element transition between two states of the page: every element
 * with `data-shared="id"` before `update()` flies to the element with the
 * same id afterwards (size and position), the rest cross-fades. Uses the
 * View Transitions API when present (with `view-transition-name` per id),
 * otherwise a FLIP fallback. Reduced motion: just runs `update()`.
 */
async function sharedTransition(update, root = document, o = {}) {
    if (prefersReducedMotion() || typeof document === 'undefined')
        return void (await update());
    const collect = () => new Map(Array.from(root.querySelectorAll('[data-shared]')).map((el) => [el.dataset.shared, el]));
    const doc = document;
    if (typeof doc.startViewTransition === 'function') {
        const named = (m) => m.forEach((el, id) => (el.style.viewTransitionName = `usa-${id.replace(/[^\w-]/g, '_')}`));
        const clear = (m) => m.forEach((el) => (el.style.viewTransitionName = ''));
        const before = collect();
        named(before);
        let after = new Map();
        const vt = doc.startViewTransition(async () => {
            clear(before);
            await update();
            after = collect();
            named(after);
        });
        await vt.finished.catch(() => undefined);
        clear(after);
        return;
    }
    const before = new Map(Array.from(collect()).map(([id, el]) => [id, el.getBoundingClientRect()]));
    await update();
    const anims = [];
    collect().forEach((el, id) => {
        const a = before.get(id);
        if (!a || typeof el.animate !== 'function')
            return;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height)
            return;
        anims.push(el.animate(flipFrames(a, b), { duration: (o.duration ?? 450) * motionScale(), easing: o.easing ?? EASE_OUT }).finished.catch(() => undefined));
    });
    await Promise.all(anims);
}

var css = "usa-auto-animate{display:block}usa-masonry{display:block;column-width:220px;column-gap:16px}usa-masonry>*{break-inside:avoid;margin-bottom:16px}usa-masonry[data-js]{position:relative;columns:auto}usa-masonry[data-js]>*{position:absolute;left:0;top:0;margin:0;box-sizing:border-box;transition:transform 0.45s cubic-bezier(0.22,1,0.36,1)}@media (prefers-reduced-motion:reduce){usa-masonry[data-js]>*{transition:none}}";

function defineAutoAnimate(tag = 'usa-auto-animate') {
    return defineElement(tag, (Base) => class UsaAutoAnimate extends Base {
        constructor() {
            super(...arguments);
            this._c = null;
        }
        enable() {
            this._c?.enable();
        }
        disable() {
            this._c?.disable();
        }
        mount() {
            const c = (this._c = autoAnimate(this, { duration: this.num('duration', 300), scale: !this.flag('no-scale') }));
            this.onCleanup(() => c.stop());
        }
    }, { id: 'layout', text: css });
}
function defineMasonry(tag = 'usa-masonry') {
    return defineElement(tag, (Base) => class UsaMasonry extends Base {
        static get observedAttributes() {
            return ['columns', 'min', 'gap'];
        }
        changed() {
            this.layout();
        }
        layout() {
            const items = Array.from(this.children).filter((c) => !c.__usaGhost);
            const w = this.clientWidth;
            if (!w)
                return;
            const gap = this.num('gap', 16);
            const cols = this.num('columns', 0) || Math.max(1, Math.floor((w + gap) / (this.num('min', 220) + gap)));
            const cw = (w - gap * (cols - 1)) / cols;
            items.forEach((el) => (el.style.width = `${cw}px`));
            const pos = masonryLayout(items.map((el) => el.offsetHeight), cols, cw, gap);
            items.forEach((el, i) => (el.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px)`));
            this.style.height = `${pos.height}px`;
            this.style.setProperty('--usa-masonry-cols', String(cols));
        }
        mount() {
            this.setAttribute('data-js', '');
            this.onCleanup(() => this.removeAttribute('data-js'));
            let id = 0;
            const queue = () => {
                if (id)
                    return;
                id = requestAnimationFrame(() => {
                    id = 0;
                    this.layout();
                });
            };
            if (typeof ResizeObserver === 'function') {
                const ro = new ResizeObserver(queue);
                ro.observe(this);
                Array.from(this.children).forEach((c) => ro.observe(c));
                const mo = new MutationObserver((recs) => {
                    recs.forEach((r) => r.addedNodes.forEach((n) => n instanceof Element && ro.observe(n)));
                    queue();
                });
                mo.observe(this, { childList: true });
                this.onCleanup(() => (ro.disconnect(), mo.disconnect()));
            }
            this.listen(this, 'load', queue, { capture: true });
            this.layout();
        }
        unmount() {
            this.style.height = '';
            Array.from(this.children).forEach((c) => (c.style.transform = '', c.style.width = ''));
        }
    }, { id: 'layout', text: css });
}

/**
 * use-scroll-animate/components/layout — layout animation (v3.6).
 * `autoAnimate()` / `<usa-auto-animate>` (list & grid reflow),
 * `<usa-masonry>`, and `sharedTransition()` for shared-element transitions
 * (View Transitions API with a FLIP fallback).
 */
/** Register every component of this category under its default tag. */
function defineLayoutComponents() {
    defineAutoAnimate();
    defineMasonry();
}

export { autoAnimate, defineAutoAnimate, defineLayoutComponents, defineMasonry, flipFrames, masonryLayout, prefersReducedMotion, sharedTransition };
//# sourceMappingURL=layout.js.map
