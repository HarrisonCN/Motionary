'use strict';

var base = require('../chunks/base-DBheNxJu.cjs');
var runtimeLink = require('../chunks/runtime-link-GD9ayzxH.cjs');
var widgets_lottiePlayer = require('../chunks/lottie-player-Mcpt1H5w.cjs');
require('../chunks/registry-xGDPpmX2.cjs');

function defineDotLottie(tag = 'usa-dotlottie') {
    return base.defineElement(tag, () => {
        const Player = (customElements.get('usa-lottie-player') || widgets_lottiePlayer.defineLottiePlayer());
        class UsaDotLottie extends Player {
            constructor() {
                super(...arguments);
                this.sm = null;
                this.themeId = null;
                this.retheme = null;
            }
            static get observedAttributes() {
                return [...(Player.observedAttributes || []), 'theme', 'state-machine'];
            }
            get stateMachine() {
                return this.sm;
            }
            get state() {
                return this.sm?.state.name ?? null;
            }
            fire(name) {
                this.sm?.fire(name);
            }
            setInput(name, value) {
                this.sm?.set(name, value);
            }
            setTheme(id) {
                this.themeId = id;
                this.retheme?.();
            }
            /** Hook called by <usa-lottie-player> before the player is built. */
            prepareAnimation(animation, dl, animationId) {
                const S = runtimeLink.runtimeModule(this, 'lottie-state');
                if (!S || !dl)
                    return animation;
                if (this.themeId === null)
                    this.themeId = this.str('theme') || null;
                const theme = this.themeId ? dl.themes?.[this.themeId] : null;
                if (this.themeId && !theme)
                    this.emit('error', { error: `no theme "${this.themeId}" (have: ${Object.keys(dl.themes || {}).join(', ') || 'none'})` });
                return S.applyTheme(animation, theme, animationId);
            }
            /** Hook called after the player exists. */
            playerReady(ctx) {
                const S = runtimeLink.runtimeModule(this, 'lottie-state');
                const dl = ctx.dotLottie;
                if (!S || !dl)
                    return false;
                this.retheme = () => {
                    const theme = this.themeId ? dl.themes?.[this.themeId] : null;
                    ctx.player = ctx.rebuild(S.applyTheme(ctx.source, theme, ctx.animationId));
                    if (this.sm)
                        apply(this.sm.state, null);
                };
                const id = this.str('state-machine');
                if (!id)
                    return false;
                const def = dl.stateMachines?.[id];
                if (!def) {
                    this.emit('error', { error: `no state machine "${id}" (have: ${Object.keys(dl.stateMachines || {}).join(', ') || 'none'})` });
                    return false;
                }
                const skipped = S.inspectStateMachine(def);
                if (skipped.length)
                    this.dataset.smSkipped = skipped.join(', ');
                const apply = (st, from) => {
                    const p = ctx.player;
                    p.setSegment(st.segment || null);
                    p.timeScale = Math.abs(st.speed ?? 1) || 1;
                    p.repeat = st.loop ? -1 : 0;
                    p.yoyo = /bounce/i.test(st.mode || '');
                    if (this.reduced || st.autoplay === false) {
                        p.pause();
                        p.seek(0);
                    }
                    else {
                        p.restart();
                        if (/^reverse/i.test(st.mode || ''))
                            p.reverse();
                    }
                    this.emit('state', { state: st.name, from: from?.name ?? null });
                };
                this.sm = S.createStateMachine(def, {
                    onState: (st, from) => apply(st, from),
                    onTheme: (t) => this.setTheme(t),
                    onFrame: (f) => ctx.player.goToFrame(f),
                    onProgress: (v) => (ctx.player.progress = v),
                    onCustomEvent: (name) => this.emit('custom', { name }),
                });
                const map = [['pointerdown', 'PointerDown'], ['pointerup', 'PointerUp'], ['pointerenter', 'PointerEnter'], ['pointerleave', 'PointerExit'], ['click', 'Click']];
                for (const [ev, type] of map)
                    this.listen(ctx.canvas, ev, () => this.sm?.interact(type));
                ctx.canvas.tabIndex = 0;
                this.listen(ctx.canvas, 'keydown', (e) => {
                    if (e.key !== 'Enter' && e.key !== ' ')
                        return;
                    e.preventDefault();
                    this.sm?.interact('PointerDown');
                    this.sm?.interact('Click');
                });
                this.onCleanup(() => {
                    this.sm = null;
                    this.retheme = null;
                });
                return true; // the state machine drives playback
            }
            completed() {
                this.sm?.interact('OnComplete');
            }
        }
        return UsaDotLottie;
    }, { id: 'lottie-player', text: widgets_lottiePlayer.css });
}

exports.defineDotLottie = defineDotLottie;
//# sourceMappingURL=dotlottie.cjs.map
