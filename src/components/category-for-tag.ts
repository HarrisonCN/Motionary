import { COMPONENT_CATEGORIES, type ComponentCategory } from './index-tags';

const categoryByTag = /*#__PURE__*/ new Map<string, ComponentCategory>();
for (const [category, tags] of Object.entries(COMPONENT_CATEGORIES)) {
  for (const tag of tags) categoryByTag.set(tag, category as ComponentCategory);
}

/** Resolve either default element name without loading its component implementation. */
export function categoryForTag(tag: string): ComponentCategory | undefined {
  return categoryByTag.get(tag.replace(/^mo-/, 'usa-'));
}
