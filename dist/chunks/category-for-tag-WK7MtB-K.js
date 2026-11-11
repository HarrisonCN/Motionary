import { C as COMPONENT_CATEGORIES } from './index-tags-B-JBecYg.js';

const categoryByTag = /*#__PURE__*/ new Map();
for (const [category, tags] of Object.entries(COMPONENT_CATEGORIES)) {
    for (const tag of tags)
        categoryByTag.set(tag, category);
}
/** Resolve either default element name without loading its component implementation. */
function categoryForTag(tag) {
    return categoryByTag.get(tag.replace(/^mo-/, 'usa-'));
}

export { categoryForTag as c };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.3.1/dist/chunks/category-for-tag-WK7MtB-K.js.map