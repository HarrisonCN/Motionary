import { p as prefersReducedMotion } from './base-SPDwWyB1.js';
import { c as createSpringGroup } from './spring-solver-CQNBJPRE.js';

/** Height progress → each child's [opacity, offset factor], child `i` of `n`, starting `stagger` later per child. */
function expandContentAt(p, i, n, stagger = 0.08) {
    const s = Math.min(0.5, Math.max(0, stagger)) * Math.min(i, Math.max(0, n - 1));
    const q = Math.min(1, Math.max(0, (p - s) / Math.max(0.05, 1 - s)));
    const opacity = Math.round(Math.min(1, Math.max(0, q * 1.6 - 0.4)) * 100) / 100;
    return [opacity, Math.round((1 - q) * 1000) / 1000];
}
const OPEN_SPRING = { duration: 520, bounce: 0.16 };
const CLOSE_SPRING = { duration: 360, bounce: 0 };
/** Longest a motion may run: on a frame-starved page the spring may crawl, but the box still reaches its end state. */
const SETTLE_LIMIT = 2000;
const states = /*#__PURE__*/ new WeakMap();
const isDetails = (el) => el.localName === 'details';
const summaryOf = (el) => (isDetails(el) ? el.querySelector(':scope > summary') : null);
const contentOf = (el) => [...el.children].filter((c) => c.localName !== 'summary');
const num = (v) => parseFloat(v) || 0;
/** Whether `el` is shown: `open` for `<details>`, not `hidden` otherwise. */
function isExpanded(el) {
    const st = states.get(el);
    if (st)
        return st.open;
    return isDetails(el) ? el.open : !el.hidden;
}
/** The border-box height of the closed box: 0 for a plain box, the summary line for `<details>`. */
function closedHeight(el) {
    const sum = summaryOf(el);
    if (!sum)
        return 0;
    const cs = getComputedStyle(el);
    const top = el.getBoundingClientRect().top;
    const r = sum.getBoundingClientRect();
    return Math.max(0, r.bottom - top + num(getComputedStyle(sum).marginBottom) + num(cs.paddingBottom) + num(cs.borderBottomWidth));
}
/** The border-box height of the open box right now (content may still be painting in). */
function fullHeight(el) {
    const cs = getComputedStyle(el);
    return el.scrollHeight + num(cs.borderTopWidth) + num(cs.borderBottomWidth);
}
function clear(el) {
    for (const k of ['height', 'overflow', 'box-sizing', '--mo-expand'])
        el.style.removeProperty(k);
    for (const c of contentOf(el)) {
        c.style.removeProperty('opacity');
        c.style.removeProperty('translate');
    }
    el.removeAttribute('data-mo-expanding');
}
function finish(el, st) {
    if (!st.open) {
        if (isDetails(el))
            el.open = false;
        else
            el.hidden = true;
    }
    clear(el);
    // at rest the box's own CSS decides (e.g. `details[open] { --mo-expand-turn: 1 }`)
    el.style.removeProperty('--mo-expand-turn');
    states.delete(el);
    st.ro?.disconnect();
    clearTimeout(st.guard);
    st.group.stop();
    const done = st.settle.splice(0);
    for (const fn of done)
        fn(st.open);
}
/**
 * Open or close `el` (a `<details>` or any box toggled with `hidden`) on a damped spring. `open` defaults to the
 * opposite of its current state. Resolves with the final state once it rests, or with the new state at once when
 * motion is reduced. A call during the motion retargets it and keeps its velocity.
 */
function springExpand(el, open, opts = {}) {
    const want = open ?? !isExpanded(el);
    const running = states.get(el);
    if (typeof window === 'undefined' || prefersReducedMotion() || typeof getComputedStyle !== 'function') {
        if (running)
            finish(el, { ...running, open: want });
        if (isDetails(el))
            el.open = want;
        else
            el.hidden = !want;
        el.style.removeProperty('--mo-expand-turn');
        return Promise.resolve(want);
    }
    if (!running && want === isExpanded(el))
        return Promise.resolve(want);
    let st = running;
    if (!st) {
        const wasOpen = isExpanded(el);
        // measure the closed height before anything changes
        const closed = wasOpen ? -1 : isDetails(el) ? el.getBoundingClientRect().height : 0;
        if (isDetails(el))
            el.open = true;
        else
            el.hidden = false;
        el.setAttribute('data-mo-expanding', '');
        el.style.boxSizing = 'border-box';
        el.style.overflow = 'hidden';
        const start = wasOpen ? 1 : 0;
        const drift = Number.isFinite(opts.drift) ? Math.max(0, opts.drift) : 10;
        const stagger = opts.stagger ?? 0.08;
        // The open height is measured when the motion starts and again only when the content resizes
        // (code drawers and lazy panels paint after `open` flips): reading it every frame forced a layout
        // of the whole page per frame, which stalls long pages (a gallery grid of hundreds of cards).
        const measure = () => {
            const was = el.style.height;
            el.style.height = 'auto';
            const h = fullHeight(el);
            el.style.height = was;
            return h;
        };
        let full = measure();
        let last = { p: start, turn: start };
        const paint = (v) => {
            last = v;
            const p = v.p;
            const to = Math.max(full, s.closed);
            el.style.height = `${Math.round((s.closed + Math.max(0, p) * (to - s.closed)) * 10) / 10}px`;
            el.style.setProperty('--mo-expand', String(Math.round(Math.min(1, Math.max(0, p)) * 1000) / 1000));
            el.style.setProperty('--mo-expand-turn', String(Math.round(v.turn * 1000) / 1000));
            const kids = contentOf(el);
            kids.forEach((c, i) => {
                const [o, f] = expandContentAt(p, i, kids.length, stagger);
                c.style.opacity = String(o);
                c.style.translate = drift ? `0 ${Math.round(-f * drift * 10) / 10}px` : '';
            });
        };
        const s = {
            open: want,
            closed: closed < 0 ? closedHeight(el) : closed,
            settle: [],
            opts,
            group: createSpringGroup({ p: start, turn: start }, {
                feel: opts.feel,
                owner: el,
                onUpdate: (v) => paint(v),
                onRest: () => {
                    if (states.get(el) === s)
                        finish(el, s);
                },
            }),
        };
        if (typeof ResizeObserver === 'function') {
            s.ro = new ResizeObserver(() => {
                if (states.get(el) !== s)
                    return;
                full = measure();
                paint(last);
            });
            for (const c of contentOf(el))
                s.ro.observe(c);
        }
        states.set(el, s);
        st = s;
    }
    st.open = want;
    const spring = want ? opts.spring ?? st.opts.spring ?? OPEN_SPRING : opts.closeSpring ?? st.opts.closeSpring ?? CLOSE_SPRING;
    st.group.set({ p: want ? 1 : 0 }, { spring });
    st.group.set({ turn: want ? 1 : 0 }, { spring: want ? 'bouncy' : 'snappy' });
    const s = st;
    clearTimeout(s.guard);
    s.guard = setTimeout(() => {
        if (states.get(el) === s)
            finish(el, s);
    }, SETTLE_LIMIT);
    return new Promise((resolve) => s.settle.push(resolve));
}
/**
 * Give a native `<details>` the damped open / close: its summary's click (mouse, Enter, Space) runs
 * `springExpand()` instead of the instant toggle. Returns a function that removes it.
 */
function springDetails(details, opts = {}) {
    const sum = summaryOf(details);
    if (!sum)
        return () => undefined;
    const onClick = (e) => {
        if (e.defaultPrevented || prefersReducedMotion())
            return;
        e.preventDefault();
        void springExpand(details, undefined, opts);
    };
    sum.addEventListener('click', onClick);
    return () => sum.removeEventListener('click', onClick);
}
/** Whether a summary click inside `root` belongs to a `<details>` that a custom element (a component) owns. */
const ownedByComponent = (el) => {
    for (let n = el; n; n = n.parentElement)
        if (n.localName.includes('-'))
            return true;
    return typeof ShadowRoot !== 'undefined' && el.getRootNode() instanceof ShadowRoot;
};
/**
 * Every `<details>` under `root` (now and added later) opens and closes on a damped spring, except those inside
 * a component, inside `[data-mo-expand="off"]`, or whose summary click is already handled. One listener, on `root`.
 */
function springAllDetails(root = document, opts = {}) {
    if (typeof document === 'undefined')
        return () => undefined;
    const onClick = (e) => {
        const t = e.target;
        const sum = t?.closest?.('summary');
        const d = sum?.parentElement;
        if (!sum || !d || d.localName !== 'details' || d.querySelector(':scope > summary') !== sum)
            return;
        if (e.defaultPrevented || prefersReducedMotion() || d.closest('[data-mo-expand="off"]') || ownedByComponent(d))
            return;
        // links and controls placed inside a summary keep their own click
        if (t !== sum && t?.closest?.('a[href], button, input, select, textarea, label') && sum.contains(t.closest('a[href], button, input, select, textarea, label')))
            return;
        e.preventDefault();
        void springExpand(d, undefined, opts);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
}

export { springDetails as a, springExpand as b, expandContentAt as e, isExpanded as i, springAllDetails as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/expand-DR_ipRf6.js.map