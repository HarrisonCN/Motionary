'use strict';

var moments = require('./moments-eoZA2npZ.cjs');

/** Build the loader inside `host`; returns the function that re-reads its attributes. */
function mountLoader(host, spec) {
    const root = moments.make('span', `usa-moment usa-loader usa-loader-${spec.kind}`);
    root.setAttribute('role', 'status');
    const art = moments.make('span', 'usa-loader-art');
    art.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < spec.parts; i++) {
        const part = moments.make('i', 'usa-loader-part');
        part.style.setProperty('--i', String(i));
        art.append(part);
    }
    if (spec.extra)
        art.append(spec.extra());
    art.style.setProperty('--count', String(spec.parts));
    const label = moments.make('span', 'usa-sr');
    root.append(art, label);
    host.append(root);
    const sync = () => {
        label.textContent = host.str('label', 'Loading');
        root.style.setProperty('--lap', `${moments.bound(host.num('duration', spec.lap), 300, 8000, spec.lap)}ms`);
        root.toggleAttribute('data-paused', host.flag('paused'));
        root.toggleAttribute('data-static', host.reduced);
    };
    host.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
    host.onCleanup(() => root.remove());
    sync();
    return sync;
}

var css = ":is(usa-six-dot-orbit,usa-center-bars,usa-quarter-ring,usa-triple-pulse,usa-breath-orb,usa-three-dot-bounce,usa-infinity-loop,usa-sweep-lines,mo-six-dot-orbit,mo-center-bars,mo-quarter-ring,mo-triple-pulse,mo-breath-orb,mo-three-dot-bounce,mo-infinity-loop,mo-sweep-lines){display:inline-block;vertical-align:middle;line-height:0}:is(usa-sweep-lines,mo-sweep-lines){display:block}.usa-loader{--mo-ink:var(--mo-moment-ink,#161616);--mo-paper:var(--mo-moment-paper,#f4f3ef);--mo-soft:var(--mo-moment-soft,color-mix(in srgb,var(--mo-ink) 14%,transparent));--lap:1200ms;position:relative;display:inline-flex;color:var(--mo-ink)}:where([data-usa-variant],[variant]) .usa-loader{--mo-moment-ink:var(--usa-accent);--mo-moment-paper:var(--usa-surface)}.usa-loader .usa-sr{position:absolute !important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}.usa-loader-art{position:relative;display:inline-block}.usa-loader-part{position:absolute;display:block;animation-duration:var(--lap);animation-iteration-count:infinite;animation-delay:calc(var(--lap) / var(--count) * var(--i) - var(--lap))}.usa-loader:is([data-paused],[data-offscreen]) :is(.usa-loader-part,.usa-loader-run,.usa-loader-art){animation-play-state:paused}.usa-loader[data-static] *,.usa-loader[data-static] *::after,.usa-loader[data-static]{animation:none !important}@media (prefers-reduced-motion:reduce){.usa-loader *,.usa-loader *::after{animation:none !important}}.usa-loader-orbit .usa-loader-art{width:28px;height:28px}.usa-loader-orbit .usa-loader-part{left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:var(--mo-ink);transform:rotate(calc(var(--i) * 32deg)) translateY(-11px) scale(calc(1 - var(--i) * .13));opacity:calc(1 - var(--i) * .12);animation:none}.usa-loader-orbit .usa-loader-art{animation:usa-orbit-spin var(--lap) cubic-bezier(.55,.15,.35,.9) infinite}@keyframes usa-orbit-spin{to{transform:rotate(-360deg)}}.usa-loader-bars .usa-loader-art{display:inline-flex;align-items:center;gap:3px;height:24px}.usa-loader-bars .usa-loader-part{position:static;width:3px;height:24px;border-radius:2px;background:var(--mo-ink);transform:scaleY(.35);animation-name:usa-bars;animation-timing-function:ease-in-out}@keyframes usa-bars{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}.usa-loader-bars[data-static] .usa-loader-part{transform:scaleY(calc(.4 + var(--i) * .15))}.usa-loader-quarter .usa-loader-art{width:26px;height:26px;border-radius:50%;border:3px solid var(--mo-soft)}.usa-loader-quarter .usa-loader-part{inset:-3px;border-radius:50%;border:3px solid transparent;border-top-color:var(--mo-ink);animation-name:usa-quarter;animation-timing-function:cubic-bezier(.6,.1,.4,.9);animation-delay:0s}@keyframes usa-quarter{to{transform:rotate(360deg)}}.usa-loader-pulse .usa-loader-art{width:30px;height:30px}.usa-loader-pulse .usa-loader-art::after{content:\"\";position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px;border-radius:50%;background:var(--mo-ink)}.usa-loader-pulse .usa-loader-part{inset:0;border-radius:50%;border:2px solid var(--mo-ink);opacity:0;transform:scale(.25);animation-name:usa-pulse;animation-timing-function:cubic-bezier(.2,.6,.3,1)}@keyframes usa-pulse{0%{opacity:.9;transform:scale(.25)}100%{opacity:0;transform:scale(1)}}.usa-loader-pulse[data-static] .usa-loader-part{opacity:calc(.6 - var(--i) * .2);transform:scale(calc(.45 + var(--i) * .25))}.usa-loader-breath .usa-loader-art{width:36px;height:36px}.usa-loader-breath .usa-loader-part{inset:6px;border-radius:50%;animation-name:usa-breath;animation-timing-function:ease-in-out;animation-delay:calc(var(--i) * var(--lap) / -8)}.usa-loader-breath .usa-loader-part:first-child{background:var(--mo-ink)}.usa-loader-breath .usa-loader-part:last-child{background:var(--mo-soft);inset:0;z-index:-1}@keyframes usa-breath{0%,100%{transform:scale(.78)}50%{transform:scale(1)}}.usa-loader-dots .usa-loader-art{display:inline-flex;align-items:flex-end;gap:5px;height:20px}.usa-loader-dots .usa-loader-part{position:static;width:7px;height:7px;border-radius:50%;background:var(--mo-ink);animation-name:usa-dot-hop;animation-timing-function:ease-in-out;animation-delay:calc(var(--i) * var(--lap) / 6 - var(--lap))}@keyframes usa-dot-hop{0%,60%,100%{transform:translateY(0) scale(1.15,.8)}20%{transform:translateY(-11px) scale(.9,1.1)}40%{transform:translateY(0) scale(1.1,.9)}}.usa-loader-infinity .usa-loader-svg{display:block;width:44px;height:22px;overflow:visible;fill:none;stroke-linecap:round}.usa-loader-infinity .usa-loader-track{stroke:var(--mo-soft);stroke-width:3}.usa-loader-infinity .usa-loader-run{stroke:var(--mo-ink);stroke-width:3;stroke-dasharray:22 78;animation:usa-infinity var(--lap) linear infinite}@keyframes usa-infinity{to{stroke-dashoffset:-100}}.usa-loader-sweep{display:flex;width:100%}.usa-loader-sweep .usa-loader-art{display:grid;gap:8px;width:100%;min-width:120px;overflow:hidden}.usa-loader-sweep .usa-loader-part{position:relative;height:8px;border-radius:4px;width:calc(100% - var(--i) * 14%);background:var(--mo-soft);overflow:hidden;animation:none}.usa-loader-sweep .usa-loader-part:last-child{width:45%}.usa-loader-sweep .usa-loader-part::after{content:\"\";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--mo-ink) 28%,transparent),transparent);animation:usa-sweep var(--lap) ease-in-out infinite;animation-delay:calc(var(--i) * 70ms)}.usa-loader-sweep:is([data-paused],[data-offscreen]) .usa-loader-part::after{animation-play-state:paused}@keyframes usa-sweep{to{transform:translateX(100%)}}";

exports.css = css;
exports.mountLoader = mountLoader;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/loaders-Bo75693N.cjs.map