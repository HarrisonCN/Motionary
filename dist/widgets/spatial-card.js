import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

var css = "usa-spatial-card{position:relative;display:block;box-sizing:border-box;padding:20px 22px;margin-bottom:28px;border-radius:24px;color:#0f172a;background:linear-gradient(140deg,rgba(255,255,255,.62),rgba(255,255,255,.28));border:1px solid rgba(255,255,255,.75);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);box-shadow:0 22px 44px -26px rgba(15,23,42,.6),inset 0 1px 0 rgba(255,255,255,.8);transform:perspective(900px) translateZ(0);transform-style:preserve-3d;transition:transform .45s cubic-bezier(.2,.9,.25,1),box-shadow .45s}usa-spatial-card[data-active]{transform:perspective(900px) translateZ(18px);box-shadow:0 34px 60px -28px rgba(15,23,42,.55),inset 0 1px 0 rgba(255,255,255,.9)}usa-spatial-card .usa-sp-gaze{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--gx,50%) var(--gy,40%),rgba(255,255,255,.55),transparent 45%);opacity:0;transition:opacity .3s}usa-spatial-card[data-active] .usa-sp-gaze{opacity:1}usa-spatial-card [data-depth]{position:relative;display:block;transform:translateZ(calc(10px * var(--d,1)));transition:transform .45s}usa-spatial-card [data-depth=\"2\"]{--d:2}usa-spatial-card [data-depth=\"3\"]{--d:3}usa-spatial-card .usa-sp-ornament{position:absolute;left:50%;bottom:-22px;display:flex;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 10px 20px -12px rgba(15,23,42,.5);transform:translateX(-50%) translateZ(30px);transition:transform .45s}usa-spatial-card[data-active] .usa-sp-ornament{transform:translateX(-50%) translateZ(40px) translateY(4px)}@media (prefers-reduced-motion:reduce){usa-spatial-card,usa-spatial-card *{transition:none!important}usa-spatial-card[data-active]{transform:none}}";

function defineSpatialCard(tag = 'usa-spatial-card') {
    return defineElement(tag, (Base) => {
        class UsaSpatialCard extends Base {
            constructor() {
                super(...arguments);
                this._a = false;
            }
            get active() {
                return this._a;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<span class="usa-sp-gaze" aria-hidden="true" data-usa-part></span>');
                const orn = this.querySelector(':scope > [slot=ornament]');
                if (orn)
                    orn.classList.add('usa-sp-ornament');
                const set = (on) => {
                    if (on === this._a)
                        return;
                    this._a = on;
                    this.setFlag('data-active', on);
                    this.emit('focus-depth', { active: on });
                };
                this.listen(this, 'pointermove', (e) => {
                    const r = this.getBoundingClientRect();
                    if (!r.width)
                        return;
                    this.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
                    this.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
                });
                this.listen(this, 'pointerenter', () => set(true));
                this.listen(this, 'pointerleave', () => set(this.matches(':focus-within')));
                this.listen(this, 'focusin', () => set(true));
                this.listen(this, 'focusout', (e) => {
                    if (!this.contains(e.relatedTarget))
                        set(false);
                });
                // contract-exempt: keyboard-click-only — pointer-driven depth decoration, no action
                this.listen(this, 'pointerdown', () => {
                    if (!this.reduced)
                        this.motion(this, [{ transform: 'perspective(900px) translateZ(18px)' }, { transform: 'perspective(900px) translateZ(-6px)', offset: 0.4 }, { transform: 'perspective(900px) translateZ(18px)' }], { duration: 320, easing: 'ease-out' });
                });
            }
        }
        return UsaSpatialCard;
    }, { id: 'spatial-card', text: css });
}

export { defineSpatialCard };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/widgets/spatial-card.js.map