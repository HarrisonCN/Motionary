'use strict';

/**
 * 11.8 (component contract · keyboard): a host that acts on click becomes keyboard-reachable — `tabindex="0"` and
 * `role="button"` unless the page set them or a focusable control is inside, and Enter / Space on the host → `click()`.
 * Both attributes are removed again on disconnect.
 */
function keyClick(el) {
    if (el.querySelector('a[href],button,input,select,textarea,summary,[tabindex]'))
        return;
    for (const [n, v] of [['tabindex', '0'], ['role', 'button']]) {
        if (el.hasAttribute(n))
            continue;
        el.setAttribute(n, v);
        el.onCleanup(() => el.removeAttribute(n));
    }
    el.listen(el, 'keydown', (e) => {
        if (e.target !== el || (e.key !== 'Enter' && e.key !== ' '))
            return;
        e.preventDefault();
        el.click();
    });
}

exports.keyClick = keyClick;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/chunks/key-click-v7I4K5Sr.cjs.map