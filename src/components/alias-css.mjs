// Keep strings, comments, attribute selectors and escaped identifiers opaque. Braces / semicolons inside them
// are content, not rule boundaries (and an attribute value that happens to name a component must stay unchanged).
const CSS_TOKENS = /\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\[(?:\\[\s\S]|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[^\]\\])*\]|(?:\\[\s\S]|[\w-]|[^\x00-\x7f])+|[^\w]/g;
/**
 * Rewrite component tag names in selectors only (the text in front of each `{` that is not an at-rule); declarations, at-rule
 * preludes such as `@keyframes usa-spin`, classes, attributes and custom properties are untouched.
 */
export const rewriteTagSelectors = (text, replaceTag) => {
  let out = '', raw = '', renamed = '', first = '', previous = '';
  for (const [token] of text.matchAll(CSS_TOKENS)) {
    if (token === '{' || token === '}' || token === ';') {
      out += (token === '{' && first !== '@' ? renamed : raw) + token;
      raw = renamed = first = previous = '';
    } else {
      raw += token;
      const comment = token.startsWith('/*');
      if (!first && !comment && token.trim()) first = token;
      renamed += /^usa-[a-z]/.test(token) && previous !== '.' && previous !== '#' && previous !== ':'
        ? replaceTag(token) : token;
      if (!comment) previous = token;
    }
  }
  return out + raw;
};
