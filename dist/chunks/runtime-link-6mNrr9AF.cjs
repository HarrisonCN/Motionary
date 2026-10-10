'use strict';

var registry = require('./registry-D3N8O2Nc.cjs');

/**
 * 10.1: how runtime-powered components reach `motionary/runtime` without
 * importing it — they read the page-wide module registry (only the tiny
 * registry file is bundled with the component) and, when a module is
 * missing, show the clear install / import / CDN message in place, log it
 * once and dispatch `usa:runtime-missing`.
 */
const logged = /*#__PURE__*/ new Set();
/** The module API, or null after rendering the "missing module" notice into `host`. */
function runtimeModule(host, id) {
    const who = `<${host.localName}>`;
    try {
        return registry.requireModule(id, who);
    }
    catch {
        const msg = registry.missingMessage(id, who);
        if (!logged.has(id + who)) {
            logged.add(id + who);
            console.error(msg);
        }
        if (!host.querySelector(':scope > .usa-rt-missing')) {
            const p = document.createElement('p');
            p.className = 'usa-rt-missing';
            p.setAttribute('role', 'alert');
            p.textContent = msg;
            host.prepend(p);
        }
        host.dispatchEvent(new CustomEvent('usa:runtime-missing', { detail: { module: id, message: msg }, bubbles: true, composed: true }));
        return null;
    }
}

exports.runtimeModule = runtimeModule;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/chunks/runtime-link-6mNrr9AF.cjs.map