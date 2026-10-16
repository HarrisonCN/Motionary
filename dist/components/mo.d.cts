/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
declare const aliasTag: (tag: string) => string | null;
/**
 * `usa-…` → `mo-…` in selectors only (the text in front of each `{` that is not an at-rule); declarations, at-rule
 * preludes such as `@keyframes usa-spin`, classes, attributes and custom properties are untouched.
 */
declare const aliasCss: (text: string) => string;
/**
 * Turn on the `<mo-*>` names: every `usa-*` element defined from now on gets its `mo-*` alias, and so do the default
 * components already defined and any `usa-*` definition behind a `<mo-*>` element already on the page. Idempotent.
 */
declare function defineMoAliases(): void;

export { aliasCss, aliasTag, defineMoAliases };
