'use strict';

// While anything watches, <html> carries --usa-vvh (visible height) and --usa-kb (the height the keyboard covers at
// the bottom of the layout viewport).
let vpSubs = null;
const vpSet = (k, v) => {
    const s = document.documentElement.style;
    v === undefined ? s.removeProperty(k) : s.setProperty(k, v + 'px');
};
const vpUpdate = (e) => {
    const v = window.visualViewport, h = viewportHeight();
    vpSet('--usa-vvh', h);
    // a pinch-zoom (scale > 1) shrinks the visual viewport too: that is not a keyboard
    vpSet('--usa-kb', v && v.scale < 1.01 ? Math.max(0, Math.round(innerHeight - h - v.offsetTop)) : 0);
    if (e)
        vpSubs?.forEach((f) => f());
};
const vpOn = (m, v = window.visualViewport) => {
    window[m]('resize', vpUpdate);
    window[m]('orientationchange', vpUpdate);
    v?.[m]('resize', vpUpdate);
    v?.[m]('scroll', vpUpdate);
};
/** The visible viewport height: the layout height minus what the soft keyboard covers (13.3.0). */
const viewportHeight = () => window.visualViewport?.height || innerHeight;
/**
 * Watch the visible viewport on phones (13.3.0): `fn` runs when the soft keyboard opens or closes
 * (`visualViewport` resize / scroll), on window resize and on `orientationchange`. While at least one
 * watcher is active, `<html>` has `--usa-vvh` and `--usa-kb` (px). Returns the unsubscribe function;
 * the last one removes every listener and both variables.
 */
function watchViewport(fn) {
    const f = () => fn?.();
    if (!vpSubs)
        vpOn('addEventListener'), (vpSubs = new Set());
    vpSubs.add(f);
    vpUpdate();
    return () => {
        if (!vpSubs?.delete(f) || vpSubs.size)
            return;
        vpOn('removeEventListener');
        vpSubs = null;
        vpSet('--usa-vvh');
        vpSet('--usa-kb');
    };
}
/**
 * Keep an open panel on its snap point through rotation and the soft keyboard, and let long content scroll with a
 * finger (`data-scrollable` → `touch-action: pan-y`; short content keeps drag-anywhere). Returns the unsubscribe.
 */
function followPanel(p) {
    const fit = () => p.toggleAttribute('data-scrollable', p.scrollHeight > p.clientHeight + 1);
    fit();
    return watchViewport(() => {
        if (p._drag || !p.open)
            return;
        p._pos.jump(p.stops()[p._si] ?? 0);
        fit();
    });
}

exports.followPanel = followPanel;
exports.viewportHeight = viewportHeight;
exports.watchViewport = watchViewport;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.5.0/dist/chunks/viewport-EFYGqMNa.cjs.map