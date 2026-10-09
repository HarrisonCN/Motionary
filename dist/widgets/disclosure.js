import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { d as springEasing } from '../chunks/spring-CznnvQCN.js';

var css = "usa-disclosure{display:block;--usa-disclosure-accent:#7c5cff}usa-disclosure>details{border-bottom:1px solid rgba(127,127,127,.25);overflow:hidden}usa-disclosure>details>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 4px;font-weight:600}usa-disclosure>details>summary::-webkit-details-marker{display:none}usa-disclosure>details>summary::after{content:\"\";flex:none;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;rotate:45deg;translate:0 -3px;transition:rotate .35s cubic-bezier(.34,1.56,.64,1),translate .35s}usa-disclosure>details[open]>summary::after{rotate:225deg;translate:0 2px}usa-disclosure>details>summary:focus-visible{outline:2px solid var(--usa-disclosure-accent);outline-offset:2px;border-radius:6px}usa-disclosure>details>:not(summary){padding:0 4px 12px}usa-disclosure[variant=\"cards\"]>details{border:1px solid rgba(127,127,127,.25);border-radius:12px;margin-bottom:8px;padding:0 10px;transition:box-shadow .3s,border-color .3s}usa-disclosure[variant=\"cards\"]>details[open]{border-color:var(--usa-disclosure-accent);box-shadow:0 8px 24px rgba(124,92,255,.16)}@media (prefers-reduced-motion:reduce){usa-disclosure>details>summary::after{transition:none}}";

function defineDisclosure(tag = 'usa-disclosure') {
    return defineElement(tag, (Base) => {
        class UsaDisclosure extends Base {
            constructor() {
                super(...arguments);
                this._anims = new WeakMap();
            }
            get items() {
                return Array.from(this.children).filter((c) => c.localName === 'details');
            }
            mount() {
                this.listen(this, 'click', (e) => {
                    const s = e.target.closest('summary');
                    const d = s?.parentElement;
                    if (!s || !d || d.parentElement !== this)
                        return;
                    e.preventDefault();
                    this.set(d, !d.open);
                });
            }
            set(d, open) {
                if (open && !this.flag('multiple'))
                    for (const o of this.items)
                        if (o !== d && o.open)
                            this.set(o, false);
                if (d.open === open && !this._anims.get(d))
                    return;
                const summary = d.querySelector('summary');
                const closedH = summary ? summary.offsetHeight : 0;
                const startH = d.offsetHeight;
                this._anims.get(d)?.cancel();
                if (open)
                    d.open = true;
                const endH = open ? d.scrollHeight : closedH;
                const sp = springEasing(this.str('spring', 'gentle'));
                const a = this.reduced ? null : this.motion(d, [{ height: `${startH}px` }, { height: `${endH}px` }], { duration: Math.min(sp.duration, 700), easing: sp.easing, fill: 'forwards' });
                const body = Array.from(d.children).filter((c) => c.localName !== 'summary');
                if (open && !this.reduced)
                    body.forEach((b) => this.motion(b, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 60, easing: 'ease-out' }));
                const done = () => {
                    this._anims.delete(d);
                    if (!open)
                        d.open = false;
                    a?.cancel();
                };
                if (a) {
                    this._anims.set(d, a);
                    a.finished.then(() => this._anims.get(d) === a && done(), () => undefined);
                }
                else
                    done();
                this.emit('toggle', { index: this.items.indexOf(d), open });
            }
            toggle(i, force) {
                const d = this.items[i];
                if (d)
                    this.set(d, force ?? !d.open);
            }
            openAll() {
                this.items.forEach((d) => (d.open = true));
            }
            closeAll() {
                this.items.forEach((d) => this.set(d, false));
            }
        }
        return UsaDisclosure;
    }, { id: 'disclosure', text: css });
}

export { defineDisclosure };
//# sourceMappingURL=disclosure.js.map
