import { r as raf, g as getMotionSensitivity, b as caf } from './base-SPDwWyB1.js';
import { c as createMatterEngine, f as finite } from './engine-CUOpaIK4.js';

function setMatterData(el, data) {
    const allowed = el.constructor.observedAttributes;
    for (const [key, value] of Object.entries(data))
        if (allowed.includes(key)) {
            if (value === false || value === null)
                el.removeAttribute(key);
            else
                el.setAttribute(key, value === true ? '' : String(value));
        }
}
const matterOptions = (el) => ({
    seed: el.num('seed', 1), count: el.num('count', 900), color: el.str('color', '#e7e8df'), accent: el.str('accent', '#74aaff'),
    text: el.str('text', 'flow'), fill: el.num('fill', .5), feed: el.num('feed', .037), kill: el.num('kill', .06),
    strength: el.num('strength', 1), mode: el.str('mode', 'dots'), shape: el.str('shape', 'square'),
});
/** One owned canvas, no cloned content. All observers, captures and frame callbacks are released. */
function matterClass(Base, kind) {
    return class Matter extends Base {
        notify(type, detail) { this.emit(type, detail); }
        play() { if (!this.flag('disabled')) {
            this.setFlag('animated', true);
            this.setFlag('paused', false);
        } }
        pause() { this.setFlag('paused', true); }
        reset() { this._reset?.(); }
        activate() { this._engage?.(true); }
        deactivate() { this._engage?.(false); }
        update(data) { setMatterData(this, data); }
        changed(name) { this._sync?.(!['label', 'disabled', 'animated', 'paused'].includes(name)); }
        mount() {
            this.classList.add('usa-matter');
            this.dataset.matter = kind;
            this.setAttribute('role', 'group');
            const shell = document.createElement('div');
            shell.className = 'usa-matter-shell';
            const canvas = document.createElement('canvas');
            canvas.className = 'usa-matter-canvas';
            canvas.setAttribute('role', 'img');
            const bar = document.createElement('div');
            bar.className = 'usa-matter-bar';
            const hint = document.createElement('span');
            hint.textContent = 'Drag to explore · arrows move · Space holds';
            const engage = document.createElement('button');
            engage.type = 'button';
            engage.textContent = 'Interact';
            const reset = document.createElement('button');
            reset.type = 'button';
            reset.textContent = 'Reset';
            bar.append(hint, engage, reset);
            shell.append(canvas, bar);
            this.prepend(shell);
            let ctx = null;
            try {
                ctx = canvas.getContext('2d');
            }
            catch { /* an accessible fallback remains usable */ }
            let engine = createMatterEngine(kind, matterOptions(this)), id = 0, last = 0, time = 0, until = 0;
            let visible = typeof IntersectionObserver === 'undefined', engaged = false, pointer;
            const point = { x: .5, y: .5, active: false, pressed: false };
            const calm = () => this.reduced || getMotionSensitivity() !== 'full';
            const stop = () => { if (id)
                caf(id); id = 0; last = 0; };
            const release = () => {
                const held = pointer;
                pointer = undefined;
                point.pressed = false;
                if (held !== undefined) {
                    try {
                        if (canvas.hasPointerCapture?.(held))
                            canvas.releasePointerCapture(held);
                    }
                    catch { /* already cancelled */ }
                }
            };
            const paint = (dt = 0) => {
                if (!ctx)
                    return;
                const box = canvas.getBoundingClientRect(), width = Math.max(1, box.width || 560), height = Math.max(1, box.height || 340);
                const dpr = finite(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 1, 1, 2);
                const pw = Math.round(width * dpr), ph = Math.round(height * dpr);
                if (canvas.width !== pw || canvas.height !== ph) {
                    canvas.width = pw;
                    canvas.height = ph;
                }
                point.instant = calm();
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                engine.draw(ctx, width, height, time, dt, point);
            };
            const active = () => visible && !document.hidden && !this.flag('disabled') && !this.flag('paused') && !calm() && (this.flag('animated') || performance.now() < until);
            const frame = (now) => {
                id = 0;
                if (!active()) {
                    stop();
                    return;
                }
                const dt = last ? Math.min(.04, Math.max(0, (now - last) / 1000)) : 0;
                last = now;
                time += dt;
                paint(dt);
                id = raf(frame, this);
            };
            const wake = () => { if (active() && !id)
                id = raf(frame, this);
            else if (!active())
                stop(); };
            const sync = (rebuild = false) => {
                if (rebuild)
                    engine = createMatterEngine(kind, matterOptions(this));
                const disabled = this.flag('disabled'), label = this.str('label', kind.replace(/-/g, ' '));
                this.setAttribute('aria-label', label);
                canvas.setAttribute('aria-label', `${label}. Arrow keys move, Space holds, Enter resets, Escape exits.`);
                canvas.tabIndex = disabled ? -1 : 0;
                canvas.setAttribute('aria-disabled', String(disabled));
                reset.disabled = engage.disabled = disabled;
                this.toggleAttribute('data-matter-calm', calm());
                if (disabled || document.hidden || !visible || this.flag('paused')) {
                    release();
                    until = 0;
                }
                if (!ctx)
                    hint.textContent = 'Canvas 2D is unavailable in this browser';
                paint();
                wake();
            };
            this._sync = sync;
            this._engage = on => {
                if (this.flag('disabled'))
                    return;
                engaged = on;
                shell.toggleAttribute('data-engaged', on);
                engage.textContent = on ? 'Done' : 'Interact';
                engage.setAttribute('aria-pressed', String(on));
                if (on)
                    canvas.focus();
                else {
                    release();
                    point.active = false;
                    engage.focus();
                }
                this.notify('action', { action: on ? 'activate' : 'deactivate' });
                sync();
            };
            this._reset = () => { release(); point.x = point.y = .5; point.active = false; time = 0; until = 0; engine = createMatterEngine(kind, matterOptions(this)); paint(); this.notify('action', { action: 'reset' }); };
            const move = (event) => {
                const r = canvas.getBoundingClientRect();
                point.x = finite((event.clientX - r.left) / Math.max(1, r.width), .5, 0, 1);
                point.y = finite((event.clientY - r.top) / Math.max(1, r.height), .5, 0, 1);
                point.active = true;
                until = performance.now() + 1600;
                paint();
                wake();
            };
            this.listen(canvas, 'pointerdown', (e) => {
                if (pointer !== undefined || this.flag('disabled') || e.button !== 0 || (e.pointerType === 'touch' && !engaged))
                    return;
                pointer = e.pointerId;
                move(e);
                point.pressed = true;
                try {
                    canvas.setPointerCapture(e.pointerId);
                }
                catch { /* synthetic input */ }
                canvas.focus();
                this.notify('action', { action: 'press', x: point.x, y: point.y });
                paint();
            });
            this.listen(canvas, 'pointermove', (e) => { if (!this.flag('disabled') && (pointer === undefined || pointer === e.pointerId) && (e.pointerType !== 'touch' || engaged))
                move(e); });
            const end = (event) => { if (pointer === undefined || event.pointerId !== pointer)
                return; release(); until = performance.now() + 1200; this.notify('change', { x: point.x, y: point.y, pressed: false }); paint(); wake(); };
            for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
                this.listen(canvas, type, end);
            this.listen(canvas, 'pointerleave', () => { if (!point.pressed) {
                point.active = false;
                until = performance.now() + 1000;
                paint();
                wake();
            } });
            this.listen(canvas, 'keydown', (e) => {
                if (this.flag('disabled') || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape', '0'].includes(e.key))
                    return;
                e.preventDefault();
                if (e.repeat && e.key === ' ')
                    return;
                if (e.key === 'Escape') {
                    this.deactivate();
                    return;
                }
                if (e.key === 'Enter' || e.key === '0') {
                    this.reset();
                    return;
                }
                point.active = true;
                if (e.key === ' ')
                    point.pressed = !point.pressed;
                if (e.key === 'ArrowLeft')
                    point.x = Math.max(0, point.x - .05);
                if (e.key === 'ArrowRight')
                    point.x = Math.min(1, point.x + .05);
                if (e.key === 'ArrowUp')
                    point.y = Math.max(0, point.y - .05);
                if (e.key === 'ArrowDown')
                    point.y = Math.min(1, point.y + .05);
                until = performance.now() + 1600;
                paint();
                wake();
                this.notify('change', { x: point.x, y: point.y, pressed: point.pressed });
            });
            this.listen(canvas, 'blur', () => { release(); point.active = false; });
            this.listen(engage, 'click', () => engaged ? this.deactivate() : this.activate());
            this.listen(reset, 'click', () => this.reset());
            this.listen(document, 'visibilitychange', () => { if (document.hidden) {
                release();
                point.active = false;
                until = 0;
            } sync(); });
            if (typeof matchMedia === 'function')
                this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', () => sync());
            const sensitivity = new MutationObserver(() => sync());
            sensitivity.observe(document.documentElement, { attributes: true, attributeFilter: ['data-usa-sensitivity', 'data-usa-motion'] });
            this.onCleanup(() => sensitivity.disconnect());
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => paint());
                ro.observe(canvas);
                this.onCleanup(() => ro.disconnect());
            }
            this.inView(v => { visible = v; sync(); });
            this.onCleanup(() => { stop(); release(); this._sync = this._reset = this._engage = undefined; shell.remove(); });
            sync();
        }
    };
}

var css = ".usa-matter{display:block;min-width:0;color:var(--usa-matter-fg,#e7e8df);font-family:system-ui,sans-serif;--usa-matter-accent:#74aaff}.usa-matter-shell,.usa-matter-tool{position:relative;overflow:hidden;border:1px solid #ffffff12;border-radius:18px;background:var(--usa-matter-bg,#10131a)}.usa-matter-canvas{display:block;width:100%;height:auto;aspect-ratio:28/17;touch-action:pan-y;outline-offset:-4px}.usa-matter-shell[data-engaged] .usa-matter-canvas{touch-action:none;cursor:crosshair}.usa-matter-bar{display:flex;align-items:center;gap:8px;padding:12px 15px;border-top:1px solid #ffffff0d;font:10px ui-monospace,monospace;color:#8b94a5;flex-wrap:wrap}.usa-matter-bar>span{flex:1;min-width:120px}.usa-matter button,.usa-matter input{font:inherit;color:inherit}.usa-matter button{border:1px solid #ffffff20;background:#ffffff08;border-radius:8px;padding:7px 11px;cursor:pointer;font-size:11px;touch-action:manipulation;user-select:none;-webkit-touch-callout:none}.usa-matter button:hover{background:#ffffff12}.usa-matter button:disabled,.usa-matter input:disabled{opacity:.4;cursor:default}.usa-matter :focus-visible{outline:2px solid var(--usa-matter-accent);outline-offset:3px}.usa-matter-canvas:focus-visible{outline-offset:-4px}.usa-matter-tool{padding:22px}.usa-matter-params{display:grid;gap:12px}.usa-matter-param{display:grid;grid-template-columns:78px 1fr 54px;gap:10px;align-items:center;font:11px ui-monospace,monospace;color:#a5acbc}.usa-matter-param input{width:100%;min-width:0;accent-color:var(--usa-matter-accent)}.usa-matter-param output{text-align:right;color:var(--usa-matter-accent);font-variant-numeric:tabular-nums}.usa-matter-plot{display:block;width:100%;height:auto;aspect-ratio:17/9;margin:20px 0 10px;overflow:visible}.usa-matter-code{white-space:pre-wrap;overflow-wrap:anywhere;margin:15px 0;color:#a1b9e1;font:11px/1.7 ui-monospace,monospace}.usa-matter-preview{position:relative;height:66px;overflow:hidden;border:1px solid #ffffff12;border-radius:10px;margin-top:12px;background:#080b10}.usa-matter-mass{position:absolute;left:10%;top:18px;width:30px;height:30px;border-radius:7px;background:var(--usa-matter-accent);box-shadow:0 0 28px #74aaff25}.usa-matter-tool[data-lab=bezier] .usa-matter-mass{left:calc(50% - 45px);top:9px;width:90px;height:60px;border-radius:12px 12px 0 0;background:linear-gradient(#d5dce8,#748198)}.usa-matter-text{position:relative;padding:25px;min-height:220px;font:15px/1.85 ui-monospace,monospace;overflow:hidden;touch-action:pan-y;white-space:pre-wrap;overflow-wrap:anywhere}.usa-matter-text p{margin:0}.usa-matter-lens{position:absolute;inset:0;pointer-events:none;clip-path:circle(65px at var(--mx,50%) var(--my,50%));background:#17202f;color:#e9f2ff;transition:opacity .15s;opacity:0;padding:25px}.usa-matter-lens p{transform:scale(1.8);transform-origin:var(--mx,50%) var(--my,50%)}.usa-matter-text[data-active] .usa-matter-lens{opacity:1}.usa-matter-draft{color:#6e7686}.usa-matter-final{position:absolute;inset:25px;color:#e8edf7;clip-path:inset(0 var(--cut,50%) 0 0)}.usa-matter-sr{position:absolute!important;width:1px;height:1px;padding:0!important;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.usa-hold{position:relative;width:100%;min-height:60px!important;overflow:hidden;isolation:isolate;font-size:14px!important}.usa-hold::before{content:\"\";position:absolute;inset:0;background:var(--usa-matter-accent);opacity:.2;transform:scaleX(var(--hold,0));transform-origin:left;z-index:-1}.usa-hold[data-confirmed]{color:#b8efd4!important;border-color:#7ddbb15c!important}.usa-hold-status{min-height:18px;margin-top:12px;font:11px ui-monospace,monospace;color:#8b94a5}.usa-scrub{display:flex;align-items:center;gap:12px}.usa-scrub input{width:100%;min-width:60px;border:0;border-bottom:1px solid #ffffff26;background:transparent;font-size:32px;font-variant-numeric:tabular-nums;padding:10px;outline-offset:1px}.usa-scrub button{cursor:ew-resize;touch-action:pan-y;min-width:44px;min-height:44px}.usa-matter-unit{color:#8996ac;font-size:12px}[data-usa-sensitivity=minimal] .usa-matter *,[data-usa-sensitivity=static] .usa-matter *,.usa-matter[data-matter-calm] *{transition:none!important}@media(prefers-reduced-motion:reduce){.usa-matter *{transition:none!important;animation:none!important}}@media(max-width:480px){.usa-matter-tool{padding:16px}.usa-matter-param{grid-template-columns:68px 1fr 42px;font-size:10px}.usa-matter-text{padding:18px;font-size:12px}.usa-matter-lens{padding:18px}.usa-matter-final{inset:18px}}";

export { css as c, matterClass as m, setMatterData as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/chunks/matter-s1ApmJnh.js.map