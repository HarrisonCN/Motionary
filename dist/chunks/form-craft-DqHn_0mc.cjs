'use strict';

function node(tag, cls = '', text = '') {
    const el = document.createElement(tag);
    el.className = cls;
    el.textContent = text;
    return el;
}
function numberValue(value, fallback, min = -1e12, max = 1e12) {
    const n = Number(value);
    return Math.max(min, Math.min(max, Number.isFinite(n) ? n : fallback));
}
function formReset(host, reset) {
    let active = true;
    host.onCleanup(() => { active = false; });
    const form = host.closest('form');
    if (form)
        host.listen(form, 'reset', (event) => queueMicrotask(() => { if (active && host.isConnected && !event.defaultPrevented)
            reset(); }));
}
function formMotion(host) {
    const animations = new Set();
    const cancel = () => { animations.forEach(a => a.cancel()); animations.clear(); };
    if (typeof matchMedia === 'function')
        host.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', cancel);
    host.listen(document, 'visibilitychange', () => { if (document.hidden)
        cancel(); });
    host.onCleanup(cancel);
    return el => {
        cancel();
        const a = host.motion(el, [{ opacity: .5, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
        if (a) {
            animations.add(a);
            a.finished.then(() => animations.delete(a), () => animations.delete(a));
        }
    };
}
function formShell(host, fallback) {
    host.classList.add('usa-form');
    const root = node('div', 'usa-form-frame');
    const title = node('div', 'usa-form-label', host.getAttribute('label') || fallback);
    const hint = node('div', 'usa-form-hint', host.getAttribute('hint') || '');
    root.append(title);
    host.prepend(root);
    host.onCleanup(() => root.remove());
    return { root, title, hint };
}

var css = ".usa-form{display:block;min-width:0;--fc-bg:var(--mo-form-bg,#12161e);--fc-fg:var(--mo-form-fg,#edf0f5);--fc-muted:var(--mo-form-muted,#8c98ab);--fc-accent:var(--mo-form-accent,#b5d5ff);color:var(--fc-fg);font:13px/1.5 system-ui,sans-serif}.usa-form-frame{position:relative;min-width:0;padding:22px;border:1px solid #99b9e21f;border-radius:20px;background:linear-gradient(145deg,#b8d4ff09,transparent 45%),var(--fc-bg);box-shadow:inset 0 1px #ffffff0a,0 15px 40px #00000012;transition:border-color .2s,box-shadow .2s}.usa-form-frame:focus-within{border-color:#a8c9ff70;box-shadow:0 0 0 3px #96bdff0b,inset 0 1px #ffffff0e}.usa-form-label{font-size:11px;letter-spacing:.035em;color:var(--fc-muted);margin-bottom:14px}.usa-form-hint{font-size:11px;color:var(--fc-muted);margin-top:12px;min-height:1em}.usa-form-row{display:flex;gap:10px;align-items:center;min-width:0}.usa-form-row>*{min-width:0}.usa-form-row>input,.usa-form-row>select{flex:1}.usa-form :is(input,select,button){font:inherit;color:inherit}.usa-form :is(input:not([type=checkbox]):not([type=range]),select){min-height:46px;width:100%;border:1px solid #a4b9dc26;border-radius:12px;background:#060a1080;padding:11px 14px;outline-offset:3px}.usa-form input::placeholder{color:#68768b}.usa-form select{appearance:auto;color-scheme:dark}.usa-form option{background:#171e2a;color:#edf0f5}.usa-form button{border:1px solid #b4c8e82b;border-radius:11px;background:#afc8ed0c;padding:10px 14px;min-height:44px;cursor:pointer;touch-action:manipulation}.usa-form button:hover{background:#b2cfff19}.usa-form button:active{transform:translateY(1px)}.usa-form button[data-primary]{background:var(--fc-accent);color:#102138;border-color:transparent}.usa-form :disabled{opacity:.42;cursor:default}.usa-form :focus-visible{outline:2px solid var(--fc-accent);outline-offset:3px}.usa-form [hidden]{display:none!important}.usa-form output{font-variant-numeric:tabular-nums}.usa-form-error{color:#ffb6ab;font-size:11px;margin-top:10px}.usa-form-meter{height:3px;border-radius:3px;background:#ffffff10;margin-top:16px;overflow:hidden}.usa-form-meter>i{display:block;height:100%;background:var(--fc-accent);width:var(--progress,0%);transition:width .25s}.usa-form-options{display:grid;gap:5px;max-height:240px;overflow:auto;padding:7px;border:1px solid #bed4f02b;border-radius:13px;background:#101721;box-shadow:0 16px 40px #0005;margin-top:8px}.usa-form-option{padding:10px 12px;border-radius:8px;cursor:pointer}.usa-form-option[aria-selected=true]{color:var(--fc-accent);background:#b5d5ff0e}.usa-form-option[data-active]{outline:1px solid #b5d5ff55;background:#b5d5ff16}.usa-form-option[aria-disabled=true]{opacity:.4;cursor:default}.usa-form-tokens{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 12px}.usa-form-token{display:inline-flex;align-items:center;gap:7px;padding:4px 5px 4px 11px;border:1px solid #c4d9ff24;border-radius:20px;background:#b2d3ff0a;font-size:11px}.usa-form-token button{min-height:30px;min-width:30px;padding:3px;border:0;border-radius:50%;background:transparent}.usa-form-step-number{text-align:center;font-size:24px!important;font-variant-numeric:tabular-nums}.usa-form-step-button{font-size:20px!important;min-width:46px}.usa-form-range{display:grid;gap:17px}.usa-form-range label{display:grid;grid-template-columns:45px 1fr 50px;gap:10px;align-items:center;font-size:11px;color:var(--fc-muted)}.usa-form-range input{width:100%;accent-color:var(--fc-accent)}.usa-form-range output{text-align:right;color:var(--fc-fg)}.usa-form-range-track{height:6px;border-radius:6px;background:linear-gradient(to right,#ffffff12 var(--low),var(--fc-accent) var(--low),var(--fc-accent) var(--high),#ffffff12 var(--high));margin-bottom:10px}.usa-form-check{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #bcd1ed12}.usa-form-check input{accent-color:var(--fc-accent);width:18px;height:18px}.usa-form-check span{flex:1}.usa-form-check small{display:block;color:var(--fc-muted);font-size:11px;margin-top:3px}.usa-form-dialog{max-width:min(440px,calc(100vw - 32px));width:100%;padding:0;border:0;border-radius:24px;background:transparent;color:var(--fc-fg);overflow:visible}.usa-form-dialog::backdrop{background:#050912a3;backdrop-filter:blur(7px)}.usa-form-dialog h3{font-size:25px;letter-spacing:-.04em;font-weight:500;margin:12px 0}.usa-form-dialog p{color:var(--fc-muted);font-size:13px;line-height:1.8}.usa-form-dialog .usa-form-row{margin-top:24px}.usa-form-errors{margin:0;padding-left:20px;display:grid;gap:7px}.usa-form-errors a{color:#ffcbc2;text-underline-offset:3px}.usa-form-step-dots{display:flex;gap:7px;margin-bottom:20px}.usa-form-step-dots span{height:3px;flex:1;background:#ffffff14;border-radius:3px}.usa-form-step-dots [data-current]{background:var(--fc-accent)}.usa-form-panel{min-width:0}.usa-form-panel>h3{font-weight:500;margin:0 0 12px;font-size:21px;letter-spacing:-.025em}.usa-form-panel label{display:grid;gap:7px;font-size:12px;margin:12px 0}@media(prefers-reduced-motion:reduce){.usa-form *{transition:none!important;animation:none!important}.usa-form button:active{transform:none}}[data-usa-sensitivity=static] .usa-form *,[data-usa-sensitivity=minimal] .usa-form *{transition:none!important;animation:none!important}@media(max-width:480px){.usa-form-frame{padding:18px}.usa-form-row{gap:7px}}";

exports.css = css;
exports.formMotion = formMotion;
exports.formReset = formReset;
exports.formShell = formShell;
exports.node = node;
exports.numberValue = numberValue;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/chunks/form-craft-DqHn_0mc.cjs.map