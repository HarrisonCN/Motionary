import { f as defineElement } from './base-CBMzOs1k.js';

var css = "usa-retro-button{display:inline-block}.usa-rb{font:700 14px/1 system-ui,sans-serif;cursor:pointer;color:inherit}.usa-rb:disabled{opacity:.5;cursor:not-allowed}usa-retro-button[data-variant=pixel] .usa-rb{padding:10px 16px;border:0;background:#f43f5e;color:#fff;font-family:ui-monospace,Menlo,monospace;letter-spacing:.06em;text-transform:uppercase;box-shadow:3px 0 0 #111,-3px 0 0 #111,0 3px 0 #111,0 -3px 0 #111,6px 6px 0 #111;image-rendering:pixelated}usa-retro-button[data-variant=pixel] .usa-rb:focus-visible{outline:3px dashed #111;outline-offset:6px}usa-retro-button[data-variant=crt] .usa-rb{padding:10px 18px;border:2px solid #22c55e;border-radius:4px;background:#03140a;color:#4ade80;font-family:ui-monospace,Menlo,monospace;text-shadow:0 0 6px #4ade80;box-shadow:0 0 10px rgba(74,222,128,.45),inset 0 0 12px rgba(74,222,128,.25);background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}usa-retro-button[data-variant=crt] .usa-rb:focus-visible{outline:2px solid #86efac;outline-offset:3px}usa-retro-button[data-variant=y2k] .usa-rb{padding:11px 22px;border:1px solid rgba(255,255,255,.7);border-radius:999px;color:#1e1b4b;background:linear-gradient(180deg,#f8fafc 0%,#c7d2fe 45%,#818cf8 52%,#e0e7ff 100%);box-shadow:0 6px 14px -6px rgba(79,70,229,.6),inset 0 1px 0 #fff;text-shadow:0 1px 0 rgba(255,255,255,.7)}usa-retro-button[data-variant=y2k] .usa-rb:focus-visible{outline:2px solid #6366f1;outline-offset:3px}usa-retro-button[data-variant=win95] .usa-rb{padding:7px 16px;border:0;border-radius:0;background:#c0c0c0;color:#000;font:400 13px/1 Tahoma,Verdana,sans-serif;box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px #808080,inset 2px 2px #dfdfdf}usa-retro-button[data-variant=win95] .usa-rb:active{box-shadow:inset -1px -1px #fff,inset 1px 1px #0a0a0a,inset -2px -2px #dfdfdf,inset 2px 2px #808080}usa-retro-button[data-variant=win95] .usa-rb:focus-visible{outline:1px dotted #000;outline-offset:-4px}";

const RETRO_VARIANTS = ['pixel', 'crt', 'y2k', 'win95'];
function defineRetroButton(tag = 'usa-retro-button') {
    return defineElement(tag, (Base) => {
        class UsaRetroButton extends Base {
            static get observedAttributes() {
                return ['variant', 'disabled', 'type'];
            }
            get button() {
                return this.querySelector('.usa-rb');
            }
            get variant() {
                const v = this.str('variant', 'pixel');
                return RETRO_VARIANTS.includes(v) ? v : 'pixel';
            }
            set variant(v) {
                this.setAttribute('variant', v);
            }
            mount() {
                let btn = this.button;
                if (!btn) {
                    btn = document.createElement('button');
                    btn.className = 'usa-rb';
                    btn.setAttribute('data-usa-part', '');
                    while (this.firstChild)
                        btn.appendChild(this.firstChild);
                    this.appendChild(btn);
                }
                btn.type = this.str('type', 'button') || 'button';
                btn.disabled = this.flag('disabled');
                for (const a of ['name', 'value'])
                    if (this.hasAttribute(a))
                        btn.setAttribute(a, this.str(a));
                this.setAttribute('data-variant', this.variant);
                const b = btn;
                this.listen(b, 'pointerdown', () => this.press(b));
                this.listen(b, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.press(b));
            }
            press(b) {
                if (this.reduced || b.hasAttribute('disabled'))
                    return;
                const v = this.variant;
                if (v === 'pixel')
                    this.motion(b, [{ transform: 'none' }, { transform: 'translate(3px,3px)' }, { transform: 'translate(3px,3px)', offset: 0.6 }, { transform: 'none' }], { duration: 260, easing: 'steps(3, end)' });
                else if (v === 'crt')
                    this.motion(b, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(.7)' }, { filter: 'brightness(1.4)' }, { filter: 'brightness(1)' }], { duration: 300, easing: 'steps(4, end)' });
                else if (v === 'y2k')
                    this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
                else
                    this.motion(b, [{ transform: 'none' }, { transform: 'translate(1px,1px)' }, { transform: 'none' }], { duration: 180 });
            }
        }
        return UsaRetroButton;
    }, { id: 'retro-button', text: css });
}

export { RETRO_VARIANTS as R, defineRetroButton as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/chunks/retro-button-DPOGCNEB.js.map