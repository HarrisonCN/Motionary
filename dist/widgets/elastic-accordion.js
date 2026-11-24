import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { c as createSpring } from '../chunks/spring-Bu3AwUgu.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-ui-CQJNkFyY.js';

function defineElasticAccordion(tag = 'usa-elastic-accordion') {
    const ctor = defineElement(tag, Base => class ElasticAccordion extends Base {
        static get observedAttributes() { return ['heading', 'open', 'disabled']; }
        get open() { return this.flag('open'); }
        set open(on) { this.setFlag('open', !!on); }
        toggle(force) {
            if (this.flag('disabled'))
                return this.open;
            this.open = force === undefined ? !this.open : !!force;
            return this.open;
        }
        changed() { this._sync?.(); }
        mount() {
            const kids = Array.from(this.childNodes);
            const root = make('div', 'usa-moment usa-accord');
            const id = uniqueId('usa-accord');
            const head = make('button', 'usa-accord-head');
            head.type = 'button';
            head.setAttribute('aria-controls', id);
            const title = make('span', 'usa-accord-title');
            const chevron = make('span', 'usa-accord-chevron');
            chevron.setAttribute('aria-hidden', 'true');
            head.append(title, chevron);
            const body = make('div', 'usa-accord-body');
            body.id = id;
            const inner = make('div', 'usa-accord-inner');
            inner.append(...kids);
            body.append(inner);
            root.append(head, body);
            this.append(root);
            // 0 = closed, 1 = open; the spring may overshoot past 1 before it settles
            const grow = createSpring({ value: this.open ? 1 : 0, spring: { stiffness: 300, damping: 16 }, onUpdate: (p) => {
                    root.style.setProperty('--open', p.toFixed(4));
                    body.style.height = `${Math.max(0, p) * inner.offsetHeight}px`;
                }, onRest: (p) => {
                    body.style.height = p > 0.5 ? 'auto' : '0px';
                    body.hidden = p <= 0.5;
                } });
            body.style.height = this.open ? 'auto' : '0px';
            body.hidden = !this.open;
            let was = this.open;
            const sync = () => {
                const open = this.open;
                title.textContent = this.str('heading', 'Details');
                head.setAttribute('aria-expanded', String(open));
                head.disabled = this.flag('disabled');
                root.toggleAttribute('data-open', open);
                if (open === was)
                    return;
                was = open;
                if (open)
                    body.hidden = false;
                if (this.reduced) {
                    grow.jump(open ? 1 : 0);
                    body.style.height = open ? 'auto' : '0px';
                    body.hidden = !open;
                    return;
                }
                grow.set(open ? 1 : 0);
            };
            this._sync = sync;
            this.listen(head, 'click', () => {
                if (this.flag('disabled'))
                    return;
                this.emit('toggle', { open: this.toggle() });
            });
            this.onCleanup(() => {
                grow.stop();
                this.append(...Array.from(inner.childNodes));
                root.remove();
                this._sync = undefined;
            });
            head.setAttribute('aria-expanded', String(this.open));
            sync();
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineElasticAccordion };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/elastic-accordion.js.map