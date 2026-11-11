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

export { defineMoName as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.4.0/dist/chunks/mo-name-DT5wwaGR.js.map