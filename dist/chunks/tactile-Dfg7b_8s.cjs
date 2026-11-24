'use strict';

var spring = require('./spring-DoapHVAk.cjs');

const PRESS_SPRING = { stiffness: 520, damping: 17, mass: 1 };
/** Wire `key` (a native button) so pointer, Enter and Space drive a press spring. Returns the spring. */
function pressSpring(host, key, depth = 1) {
    const press = spring.createSpring({ spring: PRESS_SPRING, onUpdate: (p) => key.style.setProperty('--press', p.toFixed(4)) });
    let held = false;
    const down = () => {
        if (key.disabled || held)
            return;
        held = true;
        press.set(depth);
    };
    const up = () => {
        if (!held)
            return;
        held = false;
        // let go with an upward kick so the key springs past rest and settles
        press.set(0, -9 * depth);
    };
    host.listen(key, 'pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button === 0)
        down(); });
    host.listen(key, 'pointerup', up);
    host.listen(key, 'pointerleave', up);
    host.listen(key, 'pointercancel', up);
    host.listen(key, 'keydown', (e) => { if (!e.repeat && (e.key === ' ' || e.key === 'Enter'))
        down(); });
    host.listen(key, 'keyup', (e) => { if (e.key === ' ' || e.key === 'Enter')
        up(); });
    host.listen(key, 'blur', up);
    host.onCleanup(() => press.stop());
    return press;
}
/** A quick tap for programmatic presses (a click from assistive tech, `press()` from script): down and back up. */
function tap(press) {
    // no hold to follow: a downward kick from rest dips the key and lets it spring back up
    if (!press.animating)
        press.set(0, 14);
}

exports.pressSpring = pressSpring;
exports.tap = tap;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/tactile-Dfg7b_8s.cjs.map