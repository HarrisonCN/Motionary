import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { k as keyLabels, m as matchesKeys } from '../chunks/command-palette-BSTQQK3b.js';

var css = "usa-shortcut{display:inline-block;font:500 13px/1.3 system-ui,sans-serif}.usa-sk{display:inline-flex;align-items:center;gap:8px}.usa-sk-caps{display:inline-flex;gap:4px}usa-shortcut kbd{display:inline-grid;place-items:center;min-width:1.9em;height:1.9em;padding:0 6px;box-sizing:border-box;border-radius:6px;border:1px solid rgba(100,116,139,.4);border-bottom-width:3px;background:var(--usa-kbd-bg,#fff);color:inherit;font:600 12px/1 system-ui,sans-serif;box-shadow:0 1px 0 rgba(15,23,42,.08)}usa-shortcut[data-pressed] kbd{background:var(--usa-kbd-on,#eef2ff);border-color:var(--usa-kbd-accent,#6366f1)}.usa-sk-label{opacity:.75}";

const SPOKEN = { '⌘': 'Command', '⇧': 'Shift', '⌥': 'Option', '⌃': 'Control', Ctrl: 'Control', '↵': 'Enter', '⇥': 'Tab', '⌫': 'Backspace' };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineShortcut(tag = 'usa-shortcut') {
    return defineElement(tag, (Base) => {
        class UsaShortcut extends Base {
            static get observedAttributes() {
                return ['keys', 'label', 'listen', 'for'];
            }
            get labels() {
                return keyLabels(this.str('keys', 'mod+k'));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const labels = this.labels;
                const spoken = labels.map((l) => SPOKEN[l] || l).join(' ');
                const text = this.str('label');
                this.insertAdjacentHTML('beforeend', `<span class="usa-sk" data-usa-part><span class="usa-sk-caps" role="img" aria-label="${esc(spoken)}">${labels.map((l) => `<kbd aria-hidden="true">${esc(l)}</kbd>`).join('')}</span>${text ? `<span class="usa-sk-label">${esc(text)}</span>` : ''}</span>`);
                if (this.str('listen') !== 'false')
                    this.listen(document, 'keydown', (e) => {
                        if (!e.repeat && matchesKeys(e, this.str('keys', 'mod+k'))) {
                            this.press();
                            const id = this.str('for');
                            const target = id ? document.getElementById(id) : null;
                            if (target) {
                                e.preventDefault();
                                target.click();
                            }
                        }
                    });
            }
            /** Animate the caps as if pressed and emit `usa:trigger`. */
            press() {
                const caps = Array.from(this.querySelectorAll('kbd'));
                this.setAttribute('data-pressed', '');
                const off = () => this.removeAttribute('data-pressed');
                if (!this.reduced) {
                    const runs = caps.map((k, i) => this.motion(k, [{ transform: 'none' }, { transform: 'translateY(2px) scale(.94)', borderBottomWidth: '1px' }, { transform: 'none' }], { duration: 260, delay: i * 50, easing: 'ease-out' }));
                    const last = runs[runs.length - 1];
                    if (last)
                        last.finished.then(off, off);
                    else
                        off();
                }
                else
                    off();
                this.emit('trigger', { keys: this.str('keys', 'mod+k') });
            }
        }
        return UsaShortcut;
    }, { id: 'shortcut', text: css });
}

export { defineShortcut };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/widgets/shortcut.js.map