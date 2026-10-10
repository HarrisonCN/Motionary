import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

var css = "usa-notification-bell{position:relative;display:inline-block;font:400 13px/1.35 system-ui,sans-serif}.usa-nb-btn{position:relative;display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:50%;background:var(--usa-nb-bg,#f1f5f9);color:var(--usa-nb-fg,#0f172a);cursor:pointer}.usa-nb-bell{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transform-origin:50% 12%}.usa-nb-badge{position:absolute;top:2px;right:2px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#ef4444;color:#fff;font:800 10px/17px system-ui,sans-serif;text-align:center}.usa-nb-badge:empty{display:none}.usa-nb-panel{position:absolute;top:calc(100% + 8px);right:0;width:min(280px,86vw);border-radius:14px;background:#fff;color:#0f172a;box-shadow:0 18px 40px -14px rgba(15,23,42,.45);overflow:hidden;z-index:20;transform-origin:90% 0}.usa-nb-panel[hidden]{display:none}.usa-nb-panel header{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(15,23,42,.08)}.usa-nb-read{border:0;background:none;color:#7c5cff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}.usa-nb-list{max-height:220px;margin:0;padding:4px;list-style:none;overflow:auto}.usa-nb-item{display:flex;justify-content:space-between;gap:8px;padding:8px;border-radius:8px}.usa-nb-item[data-unread]{background:#f5f3ff;font-weight:600}.usa-nb-item[data-unread]::before{content:\"\";flex:0 0 7px;height:7px;margin-top:6px;border-radius:50%;background:#7c5cff}.usa-nb-item time{opacity:.5;font-size:11px;white-space:nowrap}.usa-nb-text{flex:1;min-width:0}.usa-nb-empty{margin:16px;text-align:center;opacity:.55}.usa-nb-btn:focus-visible,.usa-nb-read:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}";

function defineNotificationBell(tag = 'usa-notification-bell') {
    return defineElement(tag, (Base) => {
        class UsaNotificationBell extends Base {
            constructor() {
                super(...arguments);
                this._n = [];
                this._open = false;
            }
            get unread() {
                return this._n.filter((n) => !n.read).length;
            }
            get notices() {
                return this._n.map((n) => ({ ...n }));
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(!!v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > li'));
                this._n = seed.map((li, i) => ({ id: `n${i}`, text: li.textContent || '', time: li.dataset.time, read: li.hasAttribute('data-read') }));
                seed.forEach((li) => li.remove());
                this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-nb-btn" data-usa-part aria-expanded="false"><svg class="usa-nb-bell" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0"/></svg><b class="usa-nb-badge"></b></button><div class="usa-nb-panel" data-usa-part role="region" hidden><header><strong>Notifications</strong><button type="button" class="usa-nb-read">Mark all read</button></header><ul class="usa-nb-list"></ul><p class="usa-nb-empty">You’re all caught up</p></div>');
                this.querySelector('.usa-nb-panel').setAttribute('aria-label', this.str('label', 'Notifications'));
                this.listen(this.querySelector('.usa-nb-btn'), 'click', () => this.toggle());
                this.listen(this.querySelector('.usa-nb-read'), 'click', () => this.markAllRead());
                this.listen(this, 'keydown', (e) => e.key === 'Escape' && this._open && (this.toggle(false), this.querySelector('.usa-nb-btn').focus()));
                this.listen(document, 'pointerdown', (e) => this._open && !this.contains(e.target) && this.toggle(false));
                this.render(null);
            }
            toggle(force) {
                const on = force ?? !this._open;
                this._open = on;
                const p = this.querySelector('.usa-nb-panel');
                if (!p)
                    return;
                p.hidden = !on;
                this.querySelector('.usa-nb-btn').setAttribute('aria-expanded', String(on));
                if (on && !this.reduced)
                    this.motion(p, [{ transform: 'translateY(-8px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
            }
            ring() {
                if (this.reduced)
                    return;
                this.motion(this.querySelector('.usa-nb-bell'), [0, 18, -16, 12, -8, 4, 0].map((d) => ({ transform: `rotate(${d}deg)` })), { duration: 800, easing: 'ease-out' });
            }
            notify(n) {
                const item = typeof n === 'string' ? { text: n } : { ...n };
                item.id = item.id || `n${Date.now().toString(36)}${this._n.length}`;
                item.read = !!item.read;
                this._n.unshift(item);
                this.ring();
                this.render(item.id);
                this.emit('notify', { notice: { ...item } });
            }
            markAllRead() {
                if (!this.unread)
                    return;
                this._n.forEach((n) => (n.read = true));
                this.render(null);
                this.emit('read', {});
            }
            render(added) {
                const list = this.querySelector('.usa-nb-list');
                list.textContent = '';
                for (const n of this._n) {
                    const li = document.createElement('li');
                    li.className = 'usa-nb-item';
                    if (!n.read)
                        li.dataset.unread = '';
                    li.innerHTML = '<span class="usa-nb-text"></span><time></time>';
                    li.querySelector('.usa-nb-text').textContent = n.text;
                    li.querySelector('time').textContent = n.time || '';
                    list.appendChild(li);
                    if (n.id === added && !this.reduced)
                        this.motion(li, [{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
                }
                this.querySelector('.usa-nb-empty').hidden = this._n.length > 0;
                const u = this.unread;
                const badge = this.querySelector('.usa-nb-badge');
                const had = badge.textContent !== '';
                badge.textContent = u ? (u > 99 ? '99+' : String(u)) : '';
                this.querySelector('.usa-nb-btn').setAttribute('aria-label', `${this.str('label', 'Notifications')}${u ? `, ${u} unread` : ''}`);
                if (!this.reduced && added)
                    this.motion(badge, [{ transform: 'scale(.3)' }, { transform: 'scale(1.35)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                else if (!this.reduced && had && !u)
                    this.motion(badge, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: 200 });
            }
        }
        return UsaNotificationBell;
    }, { id: 'notification-bell', text: css });
}

export { defineNotificationBell };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/widgets/notification-bell.js.map