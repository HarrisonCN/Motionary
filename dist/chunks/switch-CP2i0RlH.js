import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-switch{--usa-sw-c:#34c759;--usa-sw-w:52px;--usa-sw-h:30px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;vertical-align:middle;outline-offset:3px;border-radius:999px}usa-switch[disabled]{opacity:.45;cursor:not-allowed}.usa-sw-track{position:relative;flex:none;width:var(--usa-sw-w);height:var(--usa-sw-h);border-radius:999px;background:rgba(127,127,127,.35);overflow:hidden;transition:background .3s}.usa-sw-fill{position:absolute;inset:0;border-radius:999px;background:var(--usa-sw-c);transform:scale(0);transform-origin:calc(var(--usa-sw-h)/2) 50%;transition:transform .35s cubic-bezier(.4,0,.2,1)}usa-switch[data-on] .usa-sw-fill{transform:scale(1)}.usa-sw-thumb{position:absolute;top:3px;left:3px;width:calc(var(--usa-sw-h) - 6px);height:calc(var(--usa-sw-h) - 6px);border-radius:999px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);transition:left .32s cubic-bezier(.3,1.25,.5,1),width .2s ease,background .3s,box-shadow .3s}usa-switch[data-on] .usa-sw-thumb{left:calc(var(--usa-sw-w) - var(--usa-sw-h) + 3px)}usa-switch[data-variant=\"ios\"][data-press] .usa-sw-thumb{width:calc(var(--usa-sw-h) + 2px)}usa-switch[data-variant=\"ios\"][data-press][data-on] .usa-sw-thumb{left:calc(var(--usa-sw-w) - var(--usa-sw-h) - 5px)}usa-switch[data-variant=\"daynight\"]{--usa-sw-w:64px;--usa-sw-h:32px}usa-switch[data-variant=\"daynight\"] .usa-sw-track{background:linear-gradient(#7dd3fc,#38bdf8)}usa-switch[data-variant=\"daynight\"] .usa-sw-fill{background:linear-gradient(#1e1b4b,#312e81);transform:none;opacity:0;transition:opacity .45s}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-fill{opacity:1}usa-switch[data-variant=\"daynight\"] .usa-sw-thumb{background:radial-gradient(circle at 40% 40%,#fde68a,#f59e0b);box-shadow:0 0 10px #fbbf24}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-thumb{background:radial-gradient(circle at 65% 35%,transparent 5px,#e5e7eb 5.5px);box-shadow:0 0 8px rgba(255,255,255,.5)}usa-switch[data-variant=\"daynight\"] .usa-sw-deco{position:absolute;inset:0;background:radial-gradient(circle,#fff 1px,transparent 1.5px) 12px 8px/14px 11px;opacity:0;transform:translateY(6px);transition:opacity .4s,transform .5s}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-deco{opacity:.9;transform:none}usa-switch[data-variant=\"bounce\"] .usa-sw-thumb{transition:left .28s cubic-bezier(.5,0,.75,0)}usa-switch[data-variant=\"liquid\"] .usa-sw-fill{background:linear-gradient(90deg,#22d3ee,#7c5cff)}usa-switch[data-variant=\"liquid\"] .usa-sw-thumb{transition:left .5s cubic-bezier(.68,-.4,.27,1.4)}usa-switch:focus-visible .usa-sw-track{box-shadow:0 0 0 3px rgba(124,92,255,.5)}@media (prefers-reduced-motion:reduce){.usa-sw-thumb,.usa-sw-fill,.usa-sw-deco,.usa-sw-track{transition:none!important}}";

const SWITCH_VARIANTS = ['ios', 'daynight', 'bounce', 'liquid'];
function defineSwitch(tag = 'usa-switch') {
    return defineElement(tag, (Base) => {
        class UsaSwitch extends Base {
            constructor() {
                super(...arguments);
                this._on = false;
                this._input = null;
            }
            static get observedAttributes() {
                return ['variant'];
            }
            get checked() {
                return this._on;
            }
            set checked(v) {
                this.toggle(!!v, false);
            }
            mount() {
                const v = this.str('variant', 'ios');
                this.dataset.variant = SWITCH_VARIANTS.includes(v) ? v : 'ios';
                if (!this.querySelector(':scope > .usa-sw-track')) {
                    const t = document.createElement('span');
                    t.className = 'usa-sw-track';
                    t.setAttribute('aria-hidden', 'true');
                    t.setAttribute('data-usa-part', '');
                    t.innerHTML = '<span class="usa-sw-fill"></span><span class="usa-sw-deco"></span><span class="usa-sw-thumb"></span>';
                    this.prepend(t);
                }
                this.setAttribute('role', 'switch');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label') && !this.textContent?.trim())
                    this.setAttribute('aria-label', this.str('label', 'Toggle'));
                this._on = this.flag('checked');
                if (this.str('name', '') && !this._input) {
                    this._input = document.createElement('input');
                    this._input.type = 'hidden';
                    this._input.setAttribute('data-usa-part', '');
                    this.appendChild(this._input);
                }
                this.sync(false);
                this.querySelector('.usa-sw-thumb');
                this.listen(this, 'pointerdown', () => !this.reduced && this.toggleAttribute('data-press', true));
                this.listen(this, 'pointerup', () => this.removeAttribute('data-press'));
                this.listen(this, 'pointerleave', () => this.removeAttribute('data-press'));
                this.listen(this, 'click', () => this.toggle(undefined, true));
                this.listen(this, 'keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        this.toggle(undefined, true);
                    }
                });
            }
            sync(animate) {
                this.setAttribute('aria-checked', String(this._on));
                this.toggleAttribute('data-on', this._on);
                this.toggleAttribute('data-animate', animate && !this.reduced);
                if (this._input) {
                    this._input.name = this.str('name', '');
                    this._input.value = this.str('value', 'on');
                    this._input.disabled = !this._on;
                }
                if (!animate || this.reduced)
                    return;
                const thumb = this.querySelector('.usa-sw-thumb');
                if (thumb && this.dataset.variant === 'bounce')
                    this.motion(thumb, [{ scale: '1 1' }, { scale: '1.35 .7', offset: 0.55 }, { scale: '.9 1.1', offset: 0.75 }, { scale: '1 1' }], { duration: 520, easing: 'ease-out' });
                const fill = this.querySelector('.usa-sw-fill');
                if (fill && this.dataset.variant === 'liquid')
                    this.motion(fill, [{ borderRadius: '50% 50% 40% 60%' }, { borderRadius: '30% 70% 60% 40%', offset: 0.5 }, { borderRadius: '999px' }], { duration: 600, easing: 'ease-out' });
            }
            toggle(force, user = false) {
                if (this.flag('disabled') && user)
                    return;
                const next = typeof force === 'boolean' ? force : !this._on;
                if (next === this._on)
                    return;
                this._on = next;
                this.toggleAttribute('checked', next);
                this.sync(user);
                if (user)
                    this.emit('change', { checked: next });
            }
        }
        return UsaSwitch;
    }, { id: 'switch', text: css });
}

export { SWITCH_VARIANTS as S, defineSwitch as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/chunks/switch-CP2i0RlH.js.map