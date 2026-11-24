import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make, b as bound } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-D7dR6K16.js';

const SVG = 'http://www.w3.org/2000/svg';
function defineCopyButton(tag = 'usa-copy-button') {
    const ctor = defineElement(tag, Base => class CopyButton extends Base {
        static get observedAttributes() { return ['text', 'for', 'label', 'done-label', 'fail-label', 'duration', 'disabled']; }
        source() {
            const id = this.str('for');
            if (id) {
                const target = this.getRootNode().getElementById?.(id) ?? document.getElementById(id);
                if (target)
                    return 'value' in target && typeof target.value === 'string' ? target.value : target.textContent || '';
            }
            return this.str('text');
        }
        async copy() {
            if (this.flag('disabled'))
                return false;
            const text = this.source();
            let ok = false;
            try {
                if (text && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    ok = true;
                }
            }
            catch {
                ok = false;
            }
            this._show?.(ok ? 'done' : 'fail');
            this.emit('copy', { ok, length: text.length });
            return ok;
        }
        changed() { this._sync?.(); }
        mount() {
            const root = make('button', 'usa-moment usa-copy');
            root.type = 'button';
            const icon = document.createElementNS(SVG, 'svg');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('aria-hidden', 'true');
            icon.classList.add('usa-copy-icon');
            const paths = [
                ['usa-copy-back', 'M15 8V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H8'],
                ['usa-copy-front', 'M9.5 9h9a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 8 19.5v-9A1.5 1.5 0 0 1 9.5 9z'],
                ['usa-copy-tick', 'M5 12.5l4.5 4.5L19 7.5'],
            ];
            for (const [cls, d] of paths) {
                const p = document.createElementNS(SVG, 'path');
                p.setAttribute('d', d);
                p.setAttribute('pathLength', '1');
                p.classList.add(cls);
                icon.append(p);
            }
            const roll = make('span', 'usa-copy-roll');
            const idle = make('span', 'usa-copy-idle'), done = make('span', 'usa-copy-done');
            roll.append(idle, done);
            const status = make('span', 'usa-sr');
            status.setAttribute('role', 'status');
            root.append(icon, roll, status);
            this.append(root);
            let timer;
            const sync = () => {
                idle.textContent = this.str('label', 'Copy');
                done.textContent = root.dataset.state === 'fail' ? this.str('fail-label', 'Press Ctrl+C') : this.str('done-label', 'Copied');
                root.disabled = this.flag('disabled');
                root.toggleAttribute('data-static', this.reduced);
            };
            this._show = (state) => {
                clearTimeout(timer);
                if (state)
                    root.dataset.state = state;
                else
                    delete root.dataset.state;
                sync();
                status.textContent = state ? done.textContent || '' : '';
                if (state)
                    timer = setTimeout(() => this._show?.(''), bound(this.num('duration', 1600), 400, 10000, 1600));
            };
            this._sync = sync;
            this.listen(root, 'click', () => { void this.copy(); });
            this.onCleanup(() => { clearTimeout(timer); root.remove(); this._sync = undefined; this._show = undefined; });
            sync();
        }
    }, { id: 'moments', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineCopyButton };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/copy-button.js.map