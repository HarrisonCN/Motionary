'use strict';

var indexTags = require('./index-tags-hLIF2Clq.cjs');

const categoryByTag = /*#__PURE__*/ new Map();
for (const [category, tags] of Object.entries(indexTags.COMPONENT_CATEGORIES)) {
    for (const tag of tags)
        categoryByTag.set(tag, category);
}
/** Resolve either default element name without loading its component implementation. */
function categoryForTag(tag) {
    return categoryByTag.get(tag.replace(/^mo-/, 'usa-'));
}

exports.categoryForTag = categoryForTag;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.2.2/dist/chunks/category-for-tag-D_QJPwpZ.cjs.map