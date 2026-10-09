import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-festival-banner{position:relative;display:block;overflow:hidden;padding:18px 44px 18px 20px;border-radius:14px;color:#fff;font:700 15px/1.35 system-ui,sans-serif;isolation:isolate;background:linear-gradient(120deg,#b91c1c,#dc2626 55%,#ea580c)}usa-festival-banner[data-theme=xmas]{background:linear-gradient(120deg,#14532d,#166534 55%,#b91c1c)}usa-festival-banner[data-theme=halloween]{background:linear-gradient(120deg,#1e1b4b,#4c1d95 60%,#c2410c)}usa-festival-banner[data-theme=fireworks]{background:linear-gradient(120deg,#0f172a,#1e293b 60%,#312e81)}.usa-fb-scene{position:absolute;inset:0;z-index:-1;pointer-events:none}.usa-fb-scene i{position:absolute;display:block;font-style:normal;animation-play-state:paused}usa-festival-banner[data-live] .usa-fb-scene i{animation-play-state:running}.usa-fb-lantern{left:var(--x);top:-4px;width:18px;height:24px;border-radius:45%;background:radial-gradient(circle at 50% 40%,#fde68a,#f97316 45%,#b91c1c);box-shadow:0 0 14px rgba(251,191,36,.7);transform-origin:50% -10px;animation:usa-fb-sway 2.6s ease-in-out var(--d) infinite alternate}.usa-fb-lantern::after{content:\"\";position:absolute;left:50%;bottom:-8px;width:2px;height:8px;background:#facc15;transform:translateX(-50%)}@keyframes usa-fb-sway{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}.usa-fb-spark{left:var(--x);bottom:-6px;width:4px;height:4px;border-radius:50%;background:#fde047;box-shadow:0 0 6px #fde047;animation:usa-fb-rise 4s linear var(--d) infinite}@keyframes usa-fb-rise{from{transform:translateY(0);opacity:0}20%{opacity:1}to{transform:translateY(-90px);opacity:0}}.usa-fb-light{left:var(--x);top:3px;width:8px;height:11px;border-radius:50% 50% 45% 45%;background:#fde047;box-shadow:0 0 8px #fde047;animation:usa-fb-twinkle 1.2s ease-in-out var(--d) infinite alternate}.usa-fb-light:nth-child(3n){background:#f87171;box-shadow:0 0 8px #f87171}.usa-fb-light:nth-child(3n+1){background:#60a5fa;box-shadow:0 0 8px #60a5fa}@keyframes usa-fb-twinkle{from{opacity:.35}to{opacity:1}}.usa-fb-snow{left:var(--x);top:-8px;width:6px;height:6px;border-radius:50%;background:#fff;opacity:.85;animation:usa-fb-fall 6s linear var(--d) infinite}@keyframes usa-fb-fall{to{transform:translate(14px,120px)}}.usa-fb-moon{right:18%;top:10%;width:34px;height:34px;border-radius:50%;background:#fde68a;box-shadow:0 0 24px 6px rgba(253,230,138,.55);animation:usa-fb-glow 3s ease-in-out infinite alternate}@keyframes usa-fb-glow{to{box-shadow:0 0 34px 12px rgba(253,230,138,.75)}}.usa-fb-bat{left:-24px;top:var(--y);font-size:16px;animation:usa-fb-fly 7s linear var(--d) infinite}@keyframes usa-fb-fly{0%{transform:translate(0,0)}25%{transform:translate(28vw,-8px)}50%{transform:translate(56vw,6px)}100%{transform:translate(120vw,-4px)}}.usa-fb-rocket{left:var(--x);bottom:20%;width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 0 0 var(--c),14px 0 0 -1px var(--c),-14px 0 0 -1px var(--c),0 14px 0 -1px var(--c),0 -14px 0 -1px var(--c),10px 10px 0 -1px var(--c),-10px -10px 0 -1px var(--c),10px -10px 0 -1px var(--c),-10px 10px 0 -1px var(--c);animation:usa-fb-boom 2.4s ease-out var(--d) infinite}@keyframes usa-fb-boom{0%{transform:translateY(40px) scale(.1);opacity:0}30%{transform:translateY(0) scale(.2);opacity:1}60%{transform:scale(1.2);opacity:1}100%{transform:scale(1.5);opacity:0}}.usa-fb-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:18px;line-height:1;cursor:pointer}.usa-fb-x:focus-visible{outline:2px solid #fff;outline-offset:2px}@media (prefers-reduced-motion:reduce){.usa-fb-scene i{animation:none!important}}";

const FESTIVAL_THEMES = ['lunar', 'xmas', 'halloween', 'fireworks'];
const SCENES = {
    lunar: (i) => (i < 4 ? `<i class="usa-fb-lantern" style="--x:${8 + i * 26}%;--d:${i * -0.6}s"></i>` : `<i class="usa-fb-spark" style="--x:${(i * 37) % 100}%;--d:${(i * -0.7) % 4}s"></i>`),
    xmas: (i) => (i < 7 ? `<i class="usa-fb-light" style="--x:${6 + i * 14.5}%;--d:${i * -0.3}s"></i>` : `<i class="usa-fb-snow" style="--x:${(i * 29) % 100}%;--d:${(i * -0.9) % 6}s"></i>`),
    halloween: (i) => (i === 0 ? '<i class="usa-fb-moon"></i>' : i < 5 ? `<i class="usa-fb-bat" style="--y:${10 + i * 12}%;--d:${i * -1.4}s">🦇</i>` : ''),
    fireworks: (i) => (i < 4 ? `<i class="usa-fb-rocket" style="--x:${12 + i * 25}%;--d:${i * -0.7}s;--c:${['#f43f5e', '#facc15', '#22d3ee', '#a855f7'][i]}"></i>` : ''),
};
function defineFestivalBanner(tag = 'usa-festival-banner') {
    return defineElement(tag, (Base) => {
        class UsaFestivalBanner extends Base {
            static get observedAttributes() {
                return ['theme', 'label', 'dismissible'];
            }
            get theme() {
                const t = this.str('theme', 'lunar');
                return FESTIVAL_THEMES.includes(t) ? t : 'lunar';
            }
            set theme(t) {
                this.setAttribute('theme', t);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'region');
                this.setAttribute('aria-label', this.str('label', 'Announcement'));
                this.setAttribute('data-theme', this.theme);
                const scene = Array.from({ length: 16 }, (_, i) => SCENES[this.theme](i)).join('');
                this.insertAdjacentHTML('afterbegin', `<span class="usa-fb-scene" aria-hidden="true" data-usa-part>${scene}</span>`);
                if (this.flag('dismissible')) {
                    this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-fb-x" aria-label="Dismiss" data-usa-part>×</button>');
                    this.listen(this.querySelector('.usa-fb-x'), 'click', () => this.dismiss());
                }
                this.inView((v) => this.setFlag('data-live', v && !this.reduced));
            }
            dismiss() {
                const done = () => {
                    this.hidden = true;
                    this.emit('dismiss');
                };
                const a = this.reduced ? null : this.motion(this, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, easing: 'ease-in' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
            }
        }
        return UsaFestivalBanner;
    }, { id: 'festival-banner', text: css });
}

export { FESTIVAL_THEMES as F, defineFestivalBanner as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.3.0/dist/chunks/festival-banner-BYn-HCza.js.map