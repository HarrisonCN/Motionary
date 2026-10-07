import { h as defineElement, k as kindOf, s as shadowStyles, i as EASE_OUT, F as FLUENT_DECELERATE, p as prefersReducedMotion } from '../chunks/base-Cu-86Z31.js';
export { a as configureComponents } from '../chunks/base-Cu-86Z31.js';

var shadowCss = ":host{display:contents}dialog{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;color:inherit;overflow:hidden}dialog:not([open]){display:none}dialog::backdrop{background:transparent}[part=\"backdrop\"]{position:absolute;inset:0;background:var(--usa-dialog-backdrop,rgb(0 0 0 / 0.42))}[part=\"panel\"]{position:absolute;left:50%;top:50%;translate:-50% -50%;box-sizing:border-box;width:min(var(--usa-dialog-width,480px),calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:var(--usa-dialog-padding,24px);border-radius:var(--usa-dialog-radius,12px);background:var(--usa-dialog-bg,Canvas);color:var(--usa-dialog-fg,CanvasText);box-shadow:0 32px 64px -12px rgb(0 0 0 / 0.45),0 0 0 1px rgb(127 127 127 / 0.18)}dialog[data-kind^=\"drawer\"] [part=\"panel\"]{top:0;bottom:0;translate:none;max-height:none;height:100%;border-radius:0;width:min(var(--usa-dialog-width,380px),88vw)}dialog[data-kind=\"drawer-start\"] [part=\"panel\"]{left:0}dialog[data-kind=\"drawer-end\"] [part=\"panel\"]{left:auto;right:0}dialog[data-kind=\"drawer-bottom\"] [part=\"panel\"],dialog[data-kind=\"sheet\"] [part=\"panel\"]{top:auto;bottom:0;left:0;right:0;translate:none;width:100%;height:auto;max-height:85vh;border-radius:var(--usa-dialog-radius,16px) var(--usa-dialog-radius,16px) 0 0}dialog[data-kind=\"sheet\"] [part=\"panel\"]{left:50%;translate:-50% 0;width:min(var(--usa-dialog-width,560px),100vw)}";

var css$3 = "usa-dialog{display:contents}usa-dialog:not(:defined){display:none}";

const FROM = {
    modal: 'scale(0.94)',
    'drawer-start': 'translateX(-100%)',
    'drawer-end': 'translateX(100%)',
    'drawer-bottom': 'translateY(100%)',
    sheet: 'translateY(40px)',
};
function defineDialog(tag = 'usa-dialog') {
    return defineElement(tag, (Base) => class UsaDialog extends Base {
        constructor() {
            super(...arguments);
            this._dialog = null;
            this._panel = null;
            this._backdrop = null;
            this._busy = null;
            this._syncing = false;
            this.returnValue = '';
        }
        static get observedAttributes() {
            return ['open', 'kind', 'label'];
        }
        get dialog() {
            return this._dialog;
        }
        get open() {
            return this.hasAttribute('open');
        }
        set open(v) {
            this.toggleAttribute('open', !!v);
        }
        get kind() {
            return kindOf(this, FROM, 'modal');
        }
        changed(name) {
            if (name === 'open') {
                if (this._syncing)
                    return;
                if (this.open)
                    this.show();
                else
                    this.close();
            }
            else
                this.syncAttrs();
        }
        syncAttrs() {
            if (!this._dialog)
                return;
            this._dialog.setAttribute('data-kind', this.kind);
            this._dialog.setAttribute('aria-modal', 'true');
            const label = this.getAttribute('label');
            if (label)
                this._dialog.setAttribute('aria-label', label);
        }
        mount() {
            if (!this._dialog) {
                const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
                root.innerHTML = '<dialog part="dialog"><div part="backdrop" aria-hidden="true"></div><div part="panel"><slot></slot></div></dialog>';
                shadowStyles(root, shadowCss);
                this._dialog = root.querySelector('dialog');
                this._backdrop = root.querySelector('[part=backdrop]');
                this._panel = root.querySelector('[part=panel]');
            }
            this.syncAttrs();
            const dlg = this._dialog;
            this.listen(dlg, 'cancel', (e) => {
                e.preventDefault();
                if (!this.flag('no-esc'))
                    this.close('cancel');
            });
            this.listen(this._backdrop, 'click', () => !this.flag('no-backdrop-close') && this.close('backdrop'));
            this.listen(this, 'click', (e) => {
                const t = e.target.closest?.('[data-close]');
                if (t && this.contains(t))
                    this.close(t.getAttribute('data-close') || 'close');
            });
            if (this.open && !dlg.open)
                this.show();
        }
        unmount() {
            if (this._dialog?.open)
                this._dialog.close();
        }
        setOpenAttr(on) {
            this._syncing = true;
            this.toggleAttribute('open', on);
            this._syncing = false;
        }
        async show() {
            await this._busy;
            const dlg = this._dialog;
            if (!dlg) {
                this.setOpenAttr(true); // opens on connect
                return;
            }
            if (dlg.open)
                return;
            this.setOpenAttr(true);
            try {
                if (typeof dlg.showModal === 'function')
                    dlg.showModal();
                else
                    dlg.setAttribute('open', '');
            }
            catch {
                dlg.setAttribute('open', '');
            }
            this.emit('open');
            if (this.reduced) {
                await this.animate2([{ opacity: 0 }, { opacity: 1 }], [{ opacity: 0 }, { opacity: 1 }], 160, EASE_OUT);
                return;
            }
            await this.animate2([{ opacity: 0, transform: FROM[this.kind] }, { opacity: 1, transform: 'none' }], [{ opacity: 0 }, { opacity: 1 }], this.kind === 'modal' ? 260 : 360, FLUENT_DECELERATE);
        }
        async close(returnValue = '') {
            await this._busy;
            const dlg = this._dialog;
            if (!dlg || !dlg.open) {
                this.setOpenAttr(false);
                return;
            }
            if (!this.emit('beforeclose', { returnValue })) {
                this.setOpenAttr(true);
                return;
            }
            this.returnValue = returnValue;
            this._busy = (async () => {
                const panelTo = this.reduced ? { opacity: 0 } : { opacity: 0, transform: FROM[this.kind] };
                const panelFrom = this.reduced ? { opacity: 1 } : { opacity: 1, transform: 'none' };
                await this.animate2([panelFrom, panelTo], [{ opacity: 1 }, { opacity: 0 }], this.reduced ? 120 : 200, 'cubic-bezier(0.7, 0, 0.84, 0)', 'forwards');
                try {
                    if (typeof dlg.close === 'function')
                        dlg.close(returnValue);
                    else
                        dlg.removeAttribute('open');
                }
                catch {
                    dlg.removeAttribute('open');
                }
                dlg.removeAttribute('open');
                this._panel?.getAnimations?.().forEach((a) => a.cancel());
                this._backdrop?.getAnimations?.().forEach((a) => a.cancel());
                this.setOpenAttr(false);
                this.emit('close', { returnValue });
            })();
            await this._busy;
            this._busy = null;
        }
        animate2(panel, backdrop, duration, easing, fill = 'none') {
            const a = this._panel ? this.motion(this._panel, panel, { duration, easing, fill }) : null;
            const b = this._backdrop ? this.motion(this._backdrop, backdrop, { duration, easing: 'linear', fill }) : null;
            return Promise.all([a?.finished, b?.finished].map((p) => p?.catch(() => undefined))).then(() => undefined);
        }
    }, { id: 'dialog', text: css$3 });
}

var css$2 = "usa-accordion{display:block}usa-accordion>details>summary{cursor:pointer}usa-accordion>details>summary::-webkit-details-marker{display:none}usa-accordion>details>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:1em}usa-accordion>details>summary::after{content:\"\";flex:none;width:0.5em;height:0.5em;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-25%) rotate(45deg);transition:transform 0.3s cubic-bezier(0.22,1,0.36,1);opacity:0.7}usa-accordion>details[open]:not([data-closing])>summary::after{transform:translateY(25%) rotate(-135deg)}@media (prefers-reduced-motion:reduce){usa-accordion>details>summary::after{transition:none}}";

function defineAccordion(tag = 'usa-accordion') {
    return defineElement(tag, (Base) => class UsaAccordion extends Base {
        constructor() {
            super(...arguments);
            this._running = new WeakMap();
        }
        static get observedAttributes() {
            return [];
        }
        get items() {
            return Array.from(this.children).filter((c) => c.tagName === 'DETAILS');
        }
        mount() {
            this.listen(this, 'click', (e) => {
                const summary = e.target.closest?.('summary');
                const d = summary?.parentElement;
                if (!summary || !d || d.tagName !== 'DETAILS' || d.parentElement !== this)
                    return;
                e.preventDefault();
                this.toggleItem(d);
            });
        }
        /** Height of `d` when closed: its summary plus its own padding and border. */
        closedHeight(d) {
            const summary = d.querySelector(':scope > summary');
            const cs = typeof getComputedStyle === 'function' ? getComputedStyle(d) : null;
            const extra = cs
                ? ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((n, k) => n + (parseFloat(cs[k]) || 0), 0)
                : 0;
            return (summary ? summary.getBoundingClientRect().height : 0) + extra;
        }
        async toggleItem(d, open = !d.open || d.hasAttribute('data-closing')) {
            if (open && !this.flag('multiple'))
                this.items.forEach((o) => o !== d && o.open && this.toggleItem(o, false));
            this._running.get(d)?.cancel();
            this._running.delete(d);
            const duration = this.reduced ? 0 : this.num('duration', 300);
            const startH = d.getBoundingClientRect().height;
            if (open) {
                d.removeAttribute('data-closing');
                d.open = true;
            }
            this.emit('toggle', { details: d, open });
            if (!duration || typeof d.animate !== 'function') {
                if (!open)
                    d.open = false;
                return;
            }
            const endH = open ? d.getBoundingClientRect().height : this.closedHeight(d);
            if (!open)
                d.setAttribute('data-closing', '');
            d.style.overflow = 'hidden';
            const a = d.animate([{ height: `${startH}px` }, { height: `${endH}px` }], { duration, easing: EASE_OUT });
            this._running.set(d, a);
            await a.finished.catch(() => undefined);
            if (this._running.get(d) !== a)
                return;
            this._running.delete(d);
            d.style.overflow = '';
            if (!open) {
                d.open = false;
                d.removeAttribute('data-closing');
            }
        }
    }, { id: 'accordion', text: css$2 });
}

var css$1 = "usa-flip-list{display:block}";

function defineFlipList(tag = 'usa-flip-list') {
    return defineElement(tag, (Base) => class UsaFlipList extends Base {
        constructor() {
            super(...arguments);
            /** Child positions relative to the host, from the last layout we saw. */
            this._pos = new WeakMap();
            this._manual = false;
        }
        static get observedAttributes() {
            return [];
        }
        snapshot() {
            const host = this.getBoundingClientRect();
            for (const el of Array.from(this.children)) {
                const r = el.getBoundingClientRect();
                this._pos.set(el, { x: r.left - host.left, y: r.top - host.top });
            }
        }
        mount() {
            this.snapshot();
            if (typeof MutationObserver !== 'undefined') {
                const mo = new MutationObserver(() => {
                    if (!this._manual)
                        this.animateFrom(this._pos);
                });
                mo.observe(this, { childList: true });
                this.onCleanup(() => mo.disconnect());
            }
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => this.snapshot());
                ro.observe(this);
                this.onCleanup(() => ro.disconnect());
            }
        }
        animateFrom(prev) {
            const off = this.reduced || this.flag('disabled');
            const host = this.getBoundingClientRect();
            const kids = Array.from(this.children);
            const now = kids.map((el) => {
                const r = el.getBoundingClientRect();
                return { x: r.left - host.left, y: r.top - host.top };
            });
            const anims = [];
            const duration = this.num('duration', 420);
            const easing = this.str('easing', FLUENT_DECELERATE);
            kids.forEach((el, i) => {
                const before = prev.get(el);
                this._pos.set(el, now[i]);
                if (off || typeof el.animate !== 'function')
                    return;
                if (!before) {
                    anims.push(el.animate([{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }], { duration, easing }).finished.catch(() => 0));
                    return;
                }
                const dx = before.x - now[i].x;
                const dy = before.y - now[i].y;
                if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)
                    return;
                anims.push(el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration, easing, composite: 'add' }).finished.catch(() => 0));
            });
            return Promise.all(anims).then(() => undefined);
        }
        async flip(mutate) {
            this.snapshot();
            const prev = this._pos;
            this._pos = new WeakMap();
            // Copy the snapshot so the observer does not overwrite it mid-mutation
            for (const el of Array.from(this.children)) {
                const p = prev.get(el);
                if (p)
                    this._pos.set(el, p);
            }
            this._manual = true;
            try {
                await mutate();
            }
            finally {
                this._manual = false;
            }
            await this.animateFrom(prev);
        }
    }, { id: 'flip-list', text: css$1 });
}

var css = "usa-view-switch{display:grid}usa-view-switch>*{grid-area:1 / 1;min-width:0}usa-view-switch>[hidden]:not([data-leaving]){display:none !important}usa-view-switch>[data-leaving]{display:block;pointer-events:none}";

function defineViewSwitch(tag = 'usa-view-switch') {
    return defineElement(tag, (Base) => class UsaViewSwitch extends Base {
        constructor() {
            super(...arguments);
            this._index = -1;
            this._anims = [];
        }
        static get observedAttributes() {
            return ['active'];
        }
        get views() {
            return Array.from(this.children);
        }
        get active() {
            return this.str('active', '0');
        }
        set active(v) {
            this.setAttribute('active', String(v));
        }
        indexOf(v) {
            const views = this.views;
            const byName = views.findIndex((el) => el.dataset.view === String(v));
            if (byName >= 0)
                return byName;
            const n = Number(v);
            return Number.isInteger(n) && n >= 0 && n < views.length ? n : -1;
        }
        changed() {
            this.show(this.active);
        }
        mount() {
            const i = Math.max(0, this.indexOf(this.active));
            this._index = i;
            this.views.forEach((v, j) => this.setVisible(v, j === i));
        }
        setVisible(v, on) {
            v.hidden = !on;
            v.toggleAttribute('inert', !on);
            v.toggleAttribute('data-active', on);
        }
        async show(view) {
            const next = this.indexOf(view);
            const prev = this._index;
            if (next < 0 || next === prev)
                return;
            const views = this.views;
            const from = views[prev];
            const to = views[next];
            this._index = next;
            const name = to.dataset.view ?? String(next);
            if (this.active !== name && this.active !== String(next))
                this.setAttribute('active', name);
            this._anims.splice(0).forEach((a) => a.finish());
            this.setVisible(to, true);
            this.emit('change', { view: to, index: next, name });
            if (!from)
                return;
            const duration = this.num('duration', 320);
            const effect = this.reduced ? 'fade' : this.str('effect', 'slide');
            const dir = next > prev ? 1 : -1;
            let outF;
            let inF;
            switch (effect) {
                case 'fade':
                    outF = { opacity: 0 };
                    inF = { opacity: 0 };
                    break;
                case 'scale':
                    outF = { opacity: 0, transform: 'scale(0.96)' };
                    inF = { opacity: 0, transform: 'scale(1.04)' };
                    break;
                case 'drill':
                    outF = { opacity: 0, transform: `scale(${dir > 0 ? 1.06 : 0.94})` };
                    inF = { opacity: 0, transform: `scale(${dir > 0 ? 0.94 : 1.06})` };
                    break;
                default:
                    outF = { opacity: 0, transform: `translateX(${-dir * 32}px)` };
                    inF = { opacity: 0, transform: `translateX(${dir * 48}px)` };
            }
            const neutral = (f) => ('transform' in f ? { opacity: 1, transform: 'none' } : { opacity: 1 });
            // Outgoing view stays stacked in the same grid cell while it leaves
            from.setAttribute('data-leaving', '');
            const a = this.motion(from, [neutral(outF), outF], { duration: duration * 0.6, easing: EASE_OUT, fill: 'forwards' });
            const b = this.motion(to, [inF, neutral(inF)], { duration, delay: duration * 0.15, easing: FLUENT_DECELERATE, fill: 'backwards' });
            this._anims = [a, b].filter((x) => !!x);
            await Promise.all(this._anims.map((x) => x.finished.catch(() => undefined)));
            from.removeAttribute('data-leaving');
            if (this._index !== prev)
                this.setVisible(from, false);
            a?.cancel();
        }
    }, { id: 'view-switch', text: css });
}

/**
 * Run `update()` (which changes the DOM) inside a view transition:
 * `document.startViewTransition()` where available (Chrome/Edge 111+, so
 * Electron, WebView2 and Tauri on Windows), otherwise a short cross-fade of
 * `options.fallback`. Instant under reduced motion. Resolves when finished.
 *
 * Give elements a `view-transition-name` in CSS for shared-element morphs.
 */
async function viewTransition(update, options = {}) {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc || prefersReducedMotion()) {
        await update();
        return;
    }
    if (typeof doc.startViewTransition === 'function') {
        let vt;
        try {
            vt = options.types ? doc.startViewTransition({ update, types: options.types }) : doc.startViewTransition(update);
        }
        catch {
            vt = doc.startViewTransition(update);
        }
        await vt.finished.catch(() => undefined);
        return;
    }
    const el = options.fallback;
    const d = options.duration ?? 200;
    if (!el || typeof el.animate !== 'function') {
        await update();
        return;
    }
    await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d * 0.8, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    await update();
    const a = el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: d * 1.1, easing: EASE_OUT });
    // remove the forwards fill of the fade-out
    el.getAnimations?.().forEach((x) => x !== a && x.cancel());
    await a.finished.catch(() => undefined);
}
const list = (t) => (t instanceof Element ? Array.from(t.children) : Array.from(t));
/**
 * FLIP animation for layout changes (list reorder, filter, grid resize):
 * measures `targets` (an element's children, or a list), runs `mutate()`,
 * then animates each element from its old position to its new one with
 * transforms only. Elements added by `mutate()` fade in.
 *
 * ```js
 * await flip(list, () => list.append(...shuffled));
 * ```
 */
async function flip(targets, mutate, options = {}) {
    const before = new Map(list(targets).map((el) => [el, el.getBoundingClientRect()]));
    await mutate();
    if (prefersReducedMotion())
        return;
    const after = list(targets);
    const duration = options.duration ?? 420;
    const easing = options.easing ?? FLUENT_DECELERATE;
    const anims = [];
    // Read all, then write all
    const rects = after.map((el) => el.getBoundingClientRect());
    after.forEach((el, i) => {
        if (typeof el.animate !== 'function')
            return;
        const first = before.get(el);
        const last = rects[i];
        if (!first) {
            if (options.animateEnter !== false)
                anims.push(el.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration, easing }));
            return;
        }
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        const sx = last.width ? first.width / last.width : 1;
        const sy = last.height ? first.height / last.height : 1;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01)
            return;
        anims.push(el.animate([{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }], { duration, easing }));
    });
    await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
}
/**
 * Connected (shared-element) animation, like WinUI's
 * `ConnectedAnimationService`: `to` flies from the position and size of
 * `from` into its own place (e.g. a thumbnail opening into a detail view).
 * Call it right after `to` is shown. Transforms only.
 */
async function connectedAnimation(from, to, options = {}) {
    if (prefersReducedMotion() || typeof to.animate !== 'function')
        return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    if (!b.width || !b.height)
        return;
    const hide = options.hideSource !== false && from instanceof HTMLElement;
    const prev = hide ? from.style.visibility : '';
    if (hide)
        from.style.visibility = 'hidden';
    const anim = to.animate([
        { transformOrigin: '0 0', transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` },
        { transformOrigin: '0 0', transform: 'none' },
    ], { duration: options.duration ?? 480, easing: options.easing ?? FLUENT_DECELERATE });
    await anim.finished.catch(() => undefined);
    if (hide)
        from.style.visibility = prev;
}

/**
 * use-scroll-animate/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-flip-list>`, `<usa-view-switch>`
 * and the `viewTransition()`, `flip()`, `connectedAnimation()` helpers.
 */
/** Register every component of this category under its default tag. */
function defineTransitionComponents() {
    defineDialog();
    defineAccordion();
    defineFlipList();
    defineViewSwitch();
}

export { connectedAnimation, defineAccordion, defineDialog, defineFlipList, defineTransitionComponents, defineViewSwitch, flip, prefersReducedMotion, viewTransition };
//# sourceMappingURL=transitions.js.map
