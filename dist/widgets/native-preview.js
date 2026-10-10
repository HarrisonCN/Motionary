import { f as defineElement } from '../chunks/base-nzeN_ux7.js';
import { n as nextId, a as arrowIndex } from '../chunks/shared-o9CtwHmi.js';
import { toFlutter, toReactNative, entranceFrom } from '../components/native.js';
import { parseMotion } from '../components/dsl.js';
import '../components/design.js';
import '../chunks/core-Bar7NFx7.js';
import '../components/tokens.js';
import '../chunks/registry-PxXkPc1Q.js';

var css = "usa-native-preview{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;max-width:100%;font:12px/1.4 system-ui,sans-serif}usa-native-preview .usa-np-device{position:relative;flex:none;width:150px;height:280px;padding:26px 8px 10px;border-radius:30px;background:#0f172a;box-shadow:0 14px 30px -16px rgba(15,23,42,.8);box-sizing:border-box}usa-native-preview[data-platform=android] .usa-np-device{border-radius:18px;padding-top:18px}usa-native-preview .usa-np-notch{position:absolute;top:8px;left:50%;width:52px;height:12px;margin-left:-26px;border-radius:8px;background:#000}usa-native-preview[data-platform=android] .usa-np-notch{width:8px;height:8px;margin-left:-4px;border-radius:50%;top:6px}usa-native-preview .usa-np-screen{display:flex;flex-direction:column;gap:8px;height:100%;padding:10px;border-radius:22px;background:#f8fafc;overflow:hidden;box-sizing:border-box}usa-native-preview[data-platform=android] .usa-np-screen{border-radius:10px}usa-native-preview .usa-np-side{flex:1 1 200px;min-width:0}usa-native-preview .usa-np-bar,usa-native-preview [role=tablist]{display:flex;gap:4px;flex-wrap:wrap}usa-native-preview .usa-np-bar{align-items:center}usa-native-preview .usa-np-bar button{padding:4px 8px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-native-preview [aria-selected=true]{background:#0f172a!important;color:#fff;border-color:#0f172a!important}usa-native-preview .usa-np-replay{margin-left:auto;background:#4f46e5!important;color:#fff;border-color:#4f46e5!important}usa-native-preview .usa-np-code{margin:6px 0 0;padding:8px;max-height:230px;overflow:auto;border-radius:8px;background:#0f172a;color:#e2e8f0;font:10.5px/1.45 ui-monospace,monospace;white-space:pre}";

function defineNativePreview(tag = 'usa-native-preview') {
    return defineElement(tag, (Base) => {
        class UsaNativePreview extends Base {
            static get observedAttributes() {
                return ['rules', 'platform', 'name'];
            }
            code(platform) {
                const opts = { name: this.str('name', 'MotionView') };
                return platform === 'flutter' ? toFlutter(this.str('rules'), opts) : toReactNative(this.str('rules'), opts);
            }
            items() {
                return Array.from(this.querySelectorAll(':scope > .usa-np-device > .usa-np-screen > *'));
            }
            mount() {
                const plat = this.str('platform') === 'android' ? 'android' : 'ios';
                this.setAttribute('data-platform', plat);
                if (!this.querySelector(':scope > .usa-np-device')) {
                    const kids = Array.from(this.childNodes);
                    // 13.1.0: Replay sits next to the tab list, not in it (a tablist may only own tabs — axe aria-required-children);
                    // the code is the tabs' tabpanel
                    const id = nextId('usa-np');
                    this.insertAdjacentHTML('afterbegin', `<div class="usa-np-device"><span class="usa-np-notch" aria-hidden="true"></span><div class="usa-np-screen"></div></div><div class="usa-np-side"><div class="usa-np-bar"><div role="tablist" aria-label="Native code"><button type="button" role="tab" id="${id}-rn" aria-controls="${id}-code" data-p="react-native">React Native</button><button type="button" role="tab" id="${id}-fl" aria-controls="${id}-code" data-p="flutter">Flutter</button></div><button type="button" class="usa-np-replay">Replay</button></div><pre class="usa-np-code" id="${id}-code" role="tabpanel" tabindex="0"><code></code></pre></div>`);
                    const scr = this.querySelector('.usa-np-screen');
                    kids.forEach((k) => scr.appendChild(k));
                }
                let cur = 'react-native';
                const tabs = Array.from(this.querySelectorAll('[role=tab][data-p]'));
                const show = () => {
                    tabs.forEach((t) => {
                        const on = t.dataset.p === cur;
                        t.setAttribute('aria-selected', String(on));
                        t.tabIndex = on ? 0 : -1;
                        if (on)
                            this.querySelector('.usa-np-code')?.setAttribute('aria-labelledby', t.id);
                    });
                    const c = this.querySelector('.usa-np-code code');
                    if (c)
                        c.textContent = this.code(cur);
                };
                this.listen(this, 'keydown', (e) => {
                    const i = tabs.indexOf(e.target);
                    const j = i < 0 ? -1 : arrowIndex(e, i, tabs.length);
                    if (j < 0)
                        return;
                    e.preventDefault();
                    cur = tabs[j].dataset.p;
                    show();
                    tabs[j].focus();
                });
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const tab = t.closest?.('[data-p]');
                    if (tab) {
                        cur = tab.dataset.p;
                        show();
                    }
                    if (t.closest?.('.usa-np-replay'))
                        this.replay();
                });
                this.listen(this, 'pointerdown', (e) => {
                    const it = e.target.closest?.('.usa-np-screen > *');
                    if (it && !this.reduced)
                        this.motion(it, [{ transform: 'scale(1)' }, { transform: 'scale(.92)', offset: 0.35 }, { transform: 'scale(1.03)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
                });
                show();
                let seen = false;
                this.inView((v) => {
                    if (v && !seen) {
                        seen = true;
                        this.replay();
                    }
                });
            }
            replay() {
                const r = parseMotion(this.str('rules')).rules.find((x) => x.trigger === 'enter' || x.trigger === 'load');
                if (!r || this.reduced)
                    return;
                const f = entranceFrom(r.effect);
                this.items().forEach((el, i) => this.motion(el, [{ opacity: f.opacity, transform: `translate(${f.x}px, ${f.y}px) scale(${f.scale})` }, { opacity: 1, transform: 'none' }], { duration: r.duration ?? 600, delay: (r.delay || 0) + (r.stagger || 0) * i, easing: r.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
                this.emit('replay');
            }
        }
        return UsaNativePreview;
    }, { id: 'native-preview', text: css });
}

export { defineNativePreview };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/widgets/native-preview.js.map