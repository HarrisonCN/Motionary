import { f as defineElement } from './base-BTev8qxg.js';

var css = "usa-command-palette{display:contents;--usa-cp-accent:#6366f1}usa-command-palette>option{display:none}.usa-cp{width:min(560px,calc(100vw - 24px));max-width:none;padding:0;margin:12vh auto auto;border:0;border-radius:16px;background:transparent;color:inherit;overflow:visible}.usa-cp::backdrop{background:rgba(15,23,42,.35);backdrop-filter:blur(3px)}.usa-cp-box{border-radius:16px;background:var(--usa-cp-bg,#fff);color:var(--usa-cp-fg,#0f172a);box-shadow:0 24px 60px -20px rgba(15,23,42,.55);border:1px solid rgba(100,116,139,.2);overflow:hidden;font:500 14px/1.3 system-ui,sans-serif}.usa-cp-q{box-sizing:border-box;width:100%;padding:16px 18px;border:0;border-bottom:1px solid rgba(100,116,139,.18);background:transparent;color:inherit;font:inherit;font-size:16px;outline:none}.usa-cp-list{position:relative;max-height:min(340px,50vh);overflow-y:auto;padding:6px}.usa-cp-hl{position:absolute;left:6px;right:6px;top:0;border-radius:10px;background:color-mix(in srgb,var(--usa-cp-accent) 12%,transparent);pointer-events:none;opacity:0}.usa-cp-group{padding:8px 10px 4px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;opacity:.55}.usa-cp-item{position:relative;display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer}.usa-cp-item[aria-selected=true] .usa-cp-label{color:var(--usa-cp-accent)}.usa-cp-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-cp-label mark{background:none;color:var(--usa-cp-accent);font-weight:800}.usa-cp-keys{display:flex;gap:3px}.usa-cp-keys kbd,usa-shortcut kbd{display:inline-grid;place-items:center;min-width:1.6em;padding:2px 5px;border-radius:5px;border:1px solid rgba(100,116,139,.35);border-bottom-width:2px;background:var(--usa-kbd-bg,rgba(148,163,184,.12));font:600 11px/1.3 system-ui,sans-serif;color:inherit}.usa-cp-empty{margin:0;padding:18px;text-align:center;opacity:.6}usa-command-palette[inline]{display:block;width:var(--usa-cp-w,100%);max-width:100%}usa-command-palette[inline] .usa-cp{position:static;width:100%;margin:0}usa-command-palette[inline] .usa-cp-box{box-shadow:0 12px 30px -18px rgba(15,23,42,.45)}";

/**
 * Fuzzy match: every query letter in order. Returns a score (higher is
 * better; -1 = no match) and the matched indexes (7.9).
 */
function fuzzyMatch(query, text) {
    const q = query.trim().toLowerCase();
    const t = text.toLowerCase();
    if (!q)
        return { score: 0, hits: [] };
    const hits = [];
    let score = 0;
    let from = 0;
    let prev = -2;
    for (const ch of q) {
        if (ch === ' ')
            continue;
        const i = t.indexOf(ch, from);
        if (i < 0)
            return { score: -1, hits: [] };
        hits.push(i);
        score += i === prev + 1 ? 3 : 1; // consecutive letters
        if (i === 0 || /[\s\-_/]/.test(t[i - 1]))
            score += 2; // word starts
        prev = i;
        from = i + 1;
    }
    return { score: score - t.length / 100, hits };
}
/** "mod+shift+k" → ["⌘", "⇧", "K"] on Apple platforms, ["Ctrl", "Shift", "K"] elsewhere (7.9). */
function keyLabels(keys, apple = isApple()) {
    const map = { mod: ['⌘', 'Ctrl'], cmd: ['⌘', '⌘'], meta: ['⌘', 'Win'], ctrl: ['⌃', 'Ctrl'], shift: ['⇧', 'Shift'], alt: ['⌥', 'Alt'], option: ['⌥', 'Alt'], enter: ['↵', 'Enter'], esc: ['Esc', 'Esc'], escape: ['Esc', 'Esc'], up: ['↑', '↑'], down: ['↓', '↓'], left: ['←', '←'], right: ['→', '→'], space: ['Space', 'Space'], tab: ['⇥', 'Tab'], backspace: ['⌫', 'Backspace'] };
    return keys
        .split('+')
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => (map[k.toLowerCase()] ? map[k.toLowerCase()][apple ? 0 : 1] : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1)));
}
/** Does a KeyboardEvent match "mod+k"-style keys? (7.9) */
function matchesKeys(e, keys, apple = isApple()) {
    const parts = keys.toLowerCase().split('+').map((k) => k.trim()).filter(Boolean);
    const key = parts.filter((p) => !['mod', 'cmd', 'meta', 'ctrl', 'shift', 'alt', 'option'].includes(p))[0];
    if (!key)
        return false;
    const want = { meta: false, ctrl: false, shift: parts.includes('shift'), alt: parts.includes('alt') || parts.includes('option') };
    if (parts.includes('mod'))
        want[apple ? 'meta' : 'ctrl'] = true;
    if (parts.includes('cmd') || parts.includes('meta'))
        want.meta = true;
    if (parts.includes('ctrl'))
        want.ctrl = true;
    const names = { esc: 'escape', space: ' ', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };
    const k = (e.key || '').toLowerCase();
    return k === (names[key] || key) && e.metaKey === want.meta && e.ctrlKey === want.ctrl && e.shiftKey === want.shift && e.altKey === want.alt;
}
function isApple() {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '');
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let uid = 0;
function defineCommandPalette(tag = 'usa-command-palette') {
    return defineElement(tag, (Base) => {
        class UsaCommandPalette extends Base {
            constructor() {
                super(...arguments);
                this._cmds = null;
                this._id = `usa-cp-${++uid}`;
                this._active = 0;
                this._shown = [];
                this._opener = null;
            }
            static get observedAttributes() {
                return ['placeholder', 'label', 'hotkey', 'inline'];
            }
            get commands() {
                if (this._cmds)
                    return this._cmds.slice();
                return Array.from(this.querySelectorAll(':scope > option')).map((o) => ({ id: o.value || (o.textContent || '').trim(), label: (o.textContent || '').trim(), group: o.getAttribute('data-group') || undefined, keys: o.getAttribute('data-keys') || undefined }));
            }
            set commands(v) {
                this.setCommands(v);
            }
            setCommands(list) {
                this._cmds = list.map((c) => ({ ...c, id: String(c.id), label: String(c.label) }));
                this.render();
            }
            get dlg() {
                return this.querySelector('.usa-cp');
            }
            get opened() {
                return !!this.dlg?.hasAttribute('open');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const id = this._id;
                this.insertAdjacentHTML('beforeend', `<dialog class="usa-cp" data-usa-part aria-label="${esc(this.str('label', 'Command palette'))}"><div class="usa-cp-box"><input class="usa-cp-q" role="combobox" aria-expanded="true" aria-controls="${id}-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="${esc(this.str('placeholder', 'Type a command or search…'))}"><div class="usa-cp-list" id="${id}-list" role="listbox"><span class="usa-cp-hl" aria-hidden="true"></span></div><p class="usa-cp-empty" hidden>No results</p></div></dialog>`);
                const dlg = this.dlg;
                const q = this.querySelector('.usa-cp-q');
                this.listen(q, 'input', () => this.render(true));
                this.listen(q, 'keydown', (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        this.move(e.key === 'ArrowDown' ? 1 : -1);
                    }
                    else if (e.key === 'Enter') {
                        e.preventDefault();
                        this.run(this._active);
                    }
                    else if (e.key === 'Escape' && typeof dlg.showModal !== 'function')
                        this.close();
                });
                this.listen(dlg, 'click', (e) => {
                    if (e.target === dlg)
                        this.close();
                });
                this.listen(dlg, 'cancel', (e) => {
                    e.preventDefault();
                    this.close();
                });
                const hk = this.str('hotkey', 'mod+k');
                if (hk !== 'none')
                    this.listen(document, 'keydown', (e) => {
                        if (matchesKeys(e, hk)) {
                            e.preventDefault();
                            this.toggle();
                        }
                    });
                this.render();
                if (this.flag('inline'))
                    dlg.setAttribute('open', '');
            }
            render(typed = false) {
                const list = this.querySelector('.usa-cp-list');
                if (!list)
                    return;
                const q = this.querySelector('.usa-cp-q').value;
                const all = this.commands;
                const scored = all
                    .map((c, i) => ({ c, i, m: fuzzyMatch(q, c.label) }))
                    .filter((x) => x.m.score >= 0)
                    .sort((a, b) => (q ? b.m.score - a.m.score : 0) || a.i - b.i);
                this._shown = scored.map((x) => x.c);
                this._active = 0;
                list.querySelectorAll('.usa-cp-item, .usa-cp-group').forEach((n) => n.remove());
                let html = '';
                let group = '\u0000';
                scored.forEach(({ c, m }, i) => {
                    if (!q && c.group !== group) {
                        group = c.group;
                        if (group)
                            html += `<div class="usa-cp-group" role="presentation">${esc(group)}</div>`;
                    }
                    const label = Array.from(c.label)
                        .map((ch, j) => (m.hits.includes(j) ? `<mark>${esc(ch)}</mark>` : esc(ch)))
                        .join('');
                    const keys = c.keys ? `<span class="usa-cp-keys">${keyLabels(c.keys).map((k) => `<kbd>${esc(k)}</kbd>`).join('')}</span>` : '';
                    html += `<div class="usa-cp-item" role="option" id="${this._id}-o${i}" data-i="${i}" aria-selected="false"><span class="usa-cp-label">${label}</span>${keys}</div>`;
                });
                list.insertAdjacentHTML('beforeend', html);
                list.querySelectorAll('.usa-cp-item').forEach((el) => {
                    el.addEventListener('pointermove', () => this.select(Number(el.dataset.i)));
                    el.addEventListener('click', () => this.run(Number(el.dataset.i)));
                });
                this.querySelector('.usa-cp-empty').hidden = scored.length > 0;
                this.select(0, false);
                if (typed && !this.reduced)
                    list.querySelectorAll('.usa-cp-item').forEach((el, i) => i < 8 && this.motion(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: i * 25, easing: 'ease-out', fill: 'backwards' }));
            }
            select(i, glide = true) {
                const items = Array.from(this.querySelectorAll('.usa-cp-item'));
                const q = this.querySelector('.usa-cp-q');
                const hl = this.querySelector('.usa-cp-hl');
                if (!items.length || !q || !hl) {
                    q?.removeAttribute('aria-activedescendant');
                    if (hl)
                        hl.style.opacity = '0';
                    return;
                }
                this._active = Math.max(0, Math.min(items.length - 1, i));
                items.forEach((el, j) => el.setAttribute('aria-selected', String(j === this._active)));
                const el = items[this._active];
                q.setAttribute('aria-activedescendant', el.id);
                const to = `translateY(${el.offsetTop}px)`;
                const from = hl.style.transform;
                hl.style.opacity = '1';
                hl.style.height = `${el.offsetHeight || 36}px`;
                hl.style.transform = to;
                if (glide && from && from !== to && !this.reduced)
                    this.motion(hl, [{ transform: from }, { transform: to }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' });
                el.scrollIntoView?.({ block: 'nearest' });
            }
            move(d) {
                const n = this._shown.length;
                if (n)
                    this.select((this._active + d + n) % n);
            }
            run(i) {
                const c = this._shown[i];
                if (!c)
                    return;
                this.emit('run', { id: c.id, label: c.label });
                this.close();
            }
            show() {
                const dlg = this.dlg;
                if (dlg && this.flag('inline'))
                    return this.querySelector('.usa-cp-q').focus();
                if (!dlg || this.opened)
                    return;
                this._opener = document.activeElement;
                const q = this.querySelector('.usa-cp-q');
                q.value = '';
                this.render();
                if (typeof dlg.showModal === 'function') {
                    try {
                        dlg.showModal();
                    }
                    catch {
                        dlg.setAttribute('open', '');
                    }
                }
                else
                    dlg.setAttribute('open', '');
                this.select(0, false);
                q.focus();
                if (!this.reduced)
                    this.motion(this.querySelector('.usa-cp-box'), [{ opacity: 0, transform: 'translateY(-8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
                this.emit('open');
            }
            close() {
                const dlg = this.dlg;
                if (dlg && this.flag('inline')) {
                    this.querySelector('.usa-cp-q').value = '';
                    return this.render();
                }
                if (!dlg || !this.opened)
                    return;
                const done = () => {
                    if (typeof dlg.close === 'function' && dlg.open)
                        dlg.close();
                    dlg.removeAttribute('open');
                    this._opener?.focus?.();
                    this.emit('close');
                };
                const a = this.reduced ? null : this.motion(this.querySelector('.usa-cp-box'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 140, easing: 'ease-in' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
            }
            toggle() {
                if (this.opened)
                    this.close();
                else
                    this.show();
            }
        }
        return UsaCommandPalette;
    }, { id: 'command-palette', text: css });
}

export { defineCommandPalette as d, fuzzyMatch as f, keyLabels as k, matchesKeys as m };
//# sourceMappingURL=command-palette-BzD2fATL.js.map
