'use strict';

/** 17.3: register the default `mo-*` name next to `usa-*` (new widgets ship `mo-*` without `defineMoAliases()`). */
function defineMoName(tag, ctor) {
    const m = tag.startsWith('usa-') ? 'mo-' + tag.slice(4) : '';
    if (!ctor || !m || customElements.get(m))
        return;
    try {
        customElements.define(m, class extends ctor {
        });
    }
    catch {
        /* the name is taken by another library */
    }
}

exports.defineMoName = defineMoName;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/chunks/mo-name-DR9ysd5S.cjs.map