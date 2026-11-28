import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { u as uid, h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { d as dampedAt, p as pageAfter } from '../chunks/damped-kit-18-ykWuNSDE.js';
import { h as frameOnce } from '../chunks/fling-kit-19-Q_8uCj02.js';
import { v as css, i as indicatorAt } from '../chunks/snap-kit-20-0ruReijY.js';

function defineFlingTabs(tag = 'usa-fling-tabs') {
    const ctor = defineElement(tag, (Base) => class FlingTabs extends Base {
        constructor() {
            super(...arguments);
            this._index = 0;
            this._source = null;
            this._go = null;
        }
        static get observedAttributes() {
            return ['index', 'label', 'feel', 'haptics'];
        }
        get index() {
            return this._index;
        }
        set index(v) {
            if (this._go)
                this._go(Math.floor(Number(v)) || 0, false);
            else
                this._index = Math.max(0, Math.floor(Number(v)) || 0);
        }
        get count() {
            return this._source?.length ?? 0;
        }
        mount() {
            if (!this._source) {
                const kids = [...this.children];
                const marked = kids.filter((k) => k.hasAttribute('data-tab'));
                const use = marked.length ? marked : kids;
                this._source = use.map((k, i) => {
                    const copy = k.cloneNode(true);
                    const name = (k.getAttribute('data-tab') || '').trim() || `Tab ${i + 1}`;
                    copy.removeAttribute('data-tab');
                    return { name, nodes: [copy] };
                });
                kids.forEach((k) => k.remove());
            }
            const tabsSrc = this._source.length ? this._source : [{ name: 'Tab 1', nodes: [] }];
            const n = tabsSrc.length;
            const attr = this.getAttribute('index');
            if (attr !== this._seen) {
                this._seen = attr;
                this._index = Math.floor(this.num('index', 0)) || 0;
            }
            this._index = Math.min(n - 1, Math.max(0, this._index));
            const root = make('div', 'usa-snkit usa-ftabs');
            const bar = make('div', 'usa-ftabs-bar');
            bar.setAttribute('role', 'tablist');
            bar.setAttribute('aria-label', this.str('label', 'Tabs'));
            const ink = make('div', 'usa-ftabs-ink');
            ink.setAttribute('aria-hidden', 'true');
            bar.append(ink);
            const view = make('div', 'usa-ftabs-view');
            const track = make('div', 'usa-ftabs-track');
            view.append(track);
            const tabs = [];
            const panels = [];
            tabsSrc.forEach((t, i) => {
                const tab = make('button', 'usa-ftabs-tab', t.name);
                tab.type = 'button';
                tab.id = uid('usa-ftabs-tab');
                tab.setAttribute('role', 'tab');
                tab.dataset.index = String(i);
                const panel = make('div', 'usa-ftabs-panel');
                panel.id = uid('usa-ftabs-panel');
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tab.id);
                tab.setAttribute('aria-controls', panel.id);
                panel.append(...t.nodes.map((x) => x.cloneNode(true)));
                bar.append(tab);
                track.append(panel);
                tabs.push(tab);
                panels.push(panel);
            });
            root.append(bar, view);
            this.append(root);
            const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? -1 : 1;
            let w = 0;
            let rects = [];
            let heights = [];
            const measure = () => {
                w = view.getBoundingClientRect().width || w || 320;
                rects = tabs.map((t) => ({ x: t.offsetLeft, w: t.offsetWidth }));
                heights = panels.map((p) => p.offsetHeight);
            };
            measure();
            const heightAt = (p) => {
                const i = Math.min(n - 1, Math.max(0, Math.floor(p)));
                const j = Math.min(n - 1, i + 1);
                const t = Math.min(1, Math.max(0, p - i));
                return (heights[i] || 0) + ((heights[j] || 0) - (heights[i] || 0)) * t;
            };
            const group = hostSprings(this, { x: this._index }, (v) => {
                track.style.transform = `translateX(${Math.round(-v.x * w * dir * 10) / 10}px)`;
                const at = indicatorAt(v.x, rects);
                if (at.w) {
                    ink.style.width = `${at.w}px`;
                    ink.style.transform = `translateX(${at.x}px)`;
                }
                const h = heightAt(v.x);
                if (h > 0)
                    view.style.height = `${Math.round(h)}px`;
            });
            const reveal = (tab) => {
                // keep the chosen tab inside a scrolling tab bar without scrolling the page
                const left = tab.offsetLeft - 8;
                const right = tab.offsetLeft + tab.offsetWidth + 8;
                if (left < bar.scrollLeft)
                    bar.scrollLeft = left;
                else if (right > bar.scrollLeft + bar.clientWidth)
                    bar.scrollLeft = right - bar.clientWidth;
            };
            const paint = () => {
                tabs.forEach((t, i) => {
                    const on = i === this._index;
                    t.setAttribute('aria-selected', String(on));
                    t.tabIndex = on ? 0 : -1;
                });
                panels.forEach((p, i) => {
                    const on = i === this._index;
                    p.toggleAttribute('inert', !on);
                    p.setAttribute('aria-hidden', String(!on));
                });
                reveal(tabs[this._index]);
            };
            const go = (i, user, velocity = 0) => {
                const to = Math.min(n - 1, Math.max(0, i));
                const changed = to !== this._index;
                this._index = to;
                paint();
                group.set({ x: to }, { spring: { duration: 540, bounce: 0.16 }, velocity: velocity ? { x: velocity } : undefined });
                if (changed) {
                    if (user)
                        tick(this, 6);
                    this.emit('change', { index: to, label: tabsSrc[to].name });
                }
            };
            this._go = go;
            paint();
            group.jump({ x: this._index });
            this.listen(bar, 'click', (e) => {
                const t = e.target.closest?.('.usa-ftabs-tab');
                if (t)
                    go(Number(t.dataset.index), true);
            });
            this.listen(bar, 'keydown', (e) => {
                const keys = { ArrowRight: this._index + dir, ArrowLeft: this._index - dir, Home: 0, End: n - 1 };
                if (!(e.key in keys))
                    return;
                e.preventDefault();
                go(keys[e.key], true);
                tabs[this._index].focus();
            });
            // `from` is where the track is when grabbed; `base` is the tab it was heading to, which a drag turns by one at most
            let drag = null;
            this.listen(view, 'pointerdown', (e) => {
                if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest?.('a, button, input, textarea, select, label, [contenteditable]'))
                    return;
                measure();
                drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: group.get('x'), base: this._index, last: e.clientX, t: e.timeStamp, v: 0, live: false };
            });
            this.listen(view, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = (e.clientX - drag.x0) * dir;
                if (!drag.live) {
                    if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y0))
                        return;
                    drag.live = true;
                    root.setAttribute('data-dragging', '');
                    try {
                        view.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                }
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.v = drag.v * 0.3 + ((-((e.clientX - drag.last) * dir) / dt) * 1000) * 0.7;
                drag.last = e.clientX;
                drag.t = e.timeStamp;
                group.jump({ x: dampedAt(drag.from * w - dx, 0, (n - 1) * w, w) / w });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                root.removeAttribute('data-dragging');
                if (!d.live)
                    return;
                const v = e.timeStamp - d.t > 90 ? 0 : d.v;
                go(pageAfter(group.get('x') * w, v, w, n, d.base), true, v / w);
            };
            this.listen(view, 'pointerup', end);
            this.listen(view, 'pointercancel', end);
            if (typeof ResizeObserver !== 'undefined') {
                const later = frameOnce(() => {
                    measure();
                    if (!drag && !group.animating)
                        group.jump({ x: this._index });
                }, this);
                const ro = new ResizeObserver(() => later.ask());
                ro.observe(view);
                ro.observe(bar);
                panels.forEach((p) => ro.observe(p));
                this.onCleanup(() => {
                    ro.disconnect();
                    later.cancel();
                });
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._go = null;
            });
        }
    }, { id: 'snap-kit-20', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFlingTabs };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/fling-tabs.js.map