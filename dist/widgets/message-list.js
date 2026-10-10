import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

var css = "usa-message-list{position:relative;display:block;width:var(--usa-ml-w,320px);max-width:100%;font:400 14px/1.35 system-ui,sans-serif}.usa-ml-list{display:flex;flex-direction:column;gap:6px;height:var(--usa-ml-h,260px);margin:0;padding:10px;list-style:none;overflow-y:auto;overscroll-behavior:contain;border-radius:14px;background:var(--usa-ml-bg,#f8fafc)}.usa-ml-msg{display:flex;flex-direction:column;align-items:flex-start;max-width:80%}.usa-ml-msg[data-side=right]{align-self:flex-end;align-items:flex-end}.usa-ml-msg[data-grouped] .usa-ml-from{display:none}.usa-ml-from{font-size:11px;font-weight:600;opacity:.6;margin:2px 8px}.usa-ml-from:empty,.usa-ml-time:empty{display:none}.usa-ml-bubble{padding:8px 12px;border-radius:16px 16px 16px 4px;background:var(--usa-ml-them,#e2e8f0);color:#0f172a;overflow-wrap:anywhere}.usa-ml-msg[data-side=right] .usa-ml-bubble{border-radius:16px 16px 4px 16px;background:var(--usa-ml-me,#7c5cff);color:#fff}.usa-ml-time{font-size:10px;opacity:.5;margin:2px 8px}.usa-ml-typing .usa-ml-bubble{display:inline-flex;gap:4px;padding:11px 12px}.usa-ml-typing i{width:7px;height:7px;border-radius:50%;background:#64748b;animation:usa-ml-dot 1.1s infinite}.usa-ml-typing i:nth-child(2){animation-delay:.18s}.usa-ml-typing i:nth-child(3){animation-delay:.36s}@keyframes usa-ml-dot{0%,60%,100%{transform:none;opacity:.4}30%{transform:translateY(-5px);opacity:1}}.usa-ml-new{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);border:0;border-radius:999px;padding:6px 12px;background:#0f172a;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 16px -6px rgba(0,0,0,.5)}.usa-ml-new[hidden]{display:none}@media (prefers-reduced-motion:reduce){.usa-ml-typing i{animation:none}}";

function defineMessageList(tag = 'usa-message-list') {
    return defineElement(tag, (Base) => {
        class UsaMessageList extends Base {
            constructor() {
                super(...arguments);
                this._msgs = [];
            }
            get messages() {
                return this._msgs.map((m) => ({ ...m }));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > p'));
                this._msgs = [];
                this.insertAdjacentHTML('beforeend', '<ol class="usa-ml-list" data-usa-part role="log" aria-live="polite"></ol><button type="button" class="usa-ml-new" data-usa-part hidden>↓ New messages</button>');
                this.querySelector('.usa-ml-list').setAttribute('aria-label', this.str('label', 'Messages'));
                seed.forEach((p) => {
                    p.hidden = true;
                    this.add({ text: p.textContent || '', me: p.hasAttribute('data-me'), from: p.dataset.from, time: p.dataset.time }, false);
                });
                const list = this.querySelector('.usa-ml-list');
                const pill = this.querySelector('.usa-ml-new');
                this.listen(list, 'scroll', () => this.atBottom() && (pill.hidden = true));
                this.listen(pill, 'click', () => this.toBottom(true));
                this.toBottom(false);
            }
            atBottom() {
                const l = this.querySelector('.usa-ml-list');
                return l.scrollHeight - l.scrollTop - l.clientHeight < 24;
            }
            toBottom(smooth) {
                const l = this.querySelector('.usa-ml-list');
                if (typeof l.scrollTo === 'function')
                    l.scrollTo({ top: l.scrollHeight, behavior: smooth && !this.reduced ? 'smooth' : 'auto' });
                else
                    l.scrollTop = l.scrollHeight;
                this.querySelector('.usa-ml-new').hidden = true;
            }
            add(m, animate) {
                const list = this.querySelector('.usa-ml-list');
                const stick = this.atBottom();
                this.typing(false);
                const prev = this._msgs[this._msgs.length - 1];
                this._msgs.push({ ...m });
                const li = document.createElement('li');
                li.className = 'usa-ml-msg';
                li.dataset.side = m.me ? 'right' : 'left';
                if (prev && !!prev.me === !!m.me && prev.from === m.from)
                    li.dataset.grouped = '';
                li.innerHTML = '<span class="usa-ml-from"></span><span class="usa-ml-bubble"></span><time class="usa-ml-time"></time>';
                li.querySelector('.usa-ml-from').textContent = m.me ? '' : m.from || '';
                li.querySelector('.usa-ml-bubble').textContent = m.text;
                li.querySelector('.usa-ml-time').textContent = m.time || '';
                list.appendChild(li);
                if (animate && !this.reduced) {
                    li.style.transformOrigin = m.me ? '100% 100%' : '0 100%';
                    this.motion(li, [{ transform: `translateX(${m.me ? 20 : -20}px) scale(.7)`, opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
                }
                if (stick || m.me)
                    this.toBottom(animate);
                else
                    this.querySelector('.usa-ml-new').hidden = false;
            }
            push(msg) {
                this.add(msg, true);
                this.emit('message', { message: { ...msg } });
            }
            typing(who) {
                const list = this.querySelector('.usa-ml-list');
                if (!list)
                    return;
                list.querySelector('.usa-ml-typing')?.remove();
                if (who === false || who === '')
                    return;
                const li = document.createElement('li');
                li.className = 'usa-ml-msg usa-ml-typing';
                li.dataset.side = 'left';
                li.innerHTML = '<span class="usa-ml-bubble"><i></i><i></i><i></i></span>';
                li.setAttribute('aria-label', `${who} is typing`);
                list.appendChild(li);
                if (this.atBottom() || list.children.length < 3)
                    this.toBottom(false);
            }
        }
        return UsaMessageList;
    }, { id: 'message-list', text: css });
}

export { defineMessageList };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/widgets/message-list.js.map