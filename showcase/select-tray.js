/**
 * 17.3 (T5): pick several components in the gallery, then copy them as one prompt for an AI coding assistant or copy a
 * link that reopens the same selection. Pure functions here (tested in test/widgets-17-3-tray.test.ts); the gallery
 * wires the card buttons and the tray.
 */

/** The default `mo-*` name of a card's tag (`usa-tabs` → `mo-tabs`). */
export const moName = (tag) => (/^usa-[a-z]/.test(tag || '') ? 'mo-' + tag.slice(4) : tag || '');

/**
 * `usa-*` element names in a snippet → their `mo-*` names: tags, and tag selectors passed to querySelector / closest /
 * matches / createElement / customElements.get / whenDefined. Attribute values, class names and `usa:*` events stay.
 */
export const toMo = (code) =>
  String(code || '')
    .replace(/(<\/?)usa-([a-z][a-z0-9-]*)/g, '$1mo-$2')
    .replace(/((?:querySelector(?:All)?|closest|matches|createElement|customElements\.get|whenDefined)\(\s*['"`])usa-(?=[a-z])/g, '$1mo-');

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Selection → URL hash (`#select=a,b,c`), keeping order and dropping duplicates / malformed ids. */
export function encodeSelection(ids) {
  const clean = [...new Set(ids)].filter((id) => ID.test(id));
  return clean.length ? '#select=' + clean.join(',') : '';
}

/** URL hash → ids that exist (`known(id)`), at most 24, in order. Anything else in the hash is ignored. */
export function decodeSelection(hash, known = () => true) {
  const m = /^#select=([a-z0-9,-]*)$/.exec(hash || '');
  if (!m) return [];
  return [...new Set(m[1].split(','))].filter((id) => ID.test(id) && known(id)).slice(0, 24);
}

const STR = {
  en: {
    intro: 'Build this with Motionary (npm i motionary — zero dependencies, accessible by default). Use these components:',
    rules: [
      'Register before use: call each define function once (or load the CDN bundle components.umd.js + widgets.umd.js, which registers every element under its mo-* name).',
      'With ESM imports from per-component entries, call defineMoAliases() from motionary/components/mo first so the mo-* names exist (17.3+ widgets register mo-* by themselves).',
      'Use only the documented attributes and usa:* events; every component already honours prefers-reduced-motion — do not add motion overrides.',
      'Keep real text and links in the light DOM.',
    ],
    note: 'Note',
    import: 'Import',
    example: 'Example',
  },
  zh: {
    intro: '请用 Motionary 实现（npm i motionary —— 零依赖，默认无障碍）。使用以下组件：',
    rules: [
      '使用前先注册：每个 define 函数调用一次（或加载 CDN 包 components.umd.js + widgets.umd.js，会以 mo-* 名称注册全部元素）。',
      '从单组件入口按需引入（ESM）时，先调用 motionary/components/mo 的 defineMoAliases()，使 mo-* 名称可用（17.3 起的新组件会自行注册 mo-*）。',
      '只使用文档中的属性与 usa:* 事件；所有组件已遵循 prefers-reduced-motion，不要另加动效覆盖。',
      '真实文字与链接保留在 light DOM 中。',
    ],
    note: '备注',
    import: '引入',
    example: '示例',
  },
};

/**
 * The prompt for `items` (gallery cards: { id, tag, title, desc, usage } plus `imports`, the import / register lines), with an optional note per
 * card id (`notes[id]`). Plain text, our own wording; the snippets come from the cards and use the mo-* names.
 */
export function selectionPrompt(items, lang = 'en', notes = {}) {
  const s = STR[lang] || STR.en;
  const L = (o) => (o && typeof o === 'object' ? o[lang] || o.en : o || '');
  const out = [s.intro, ''];
  items.forEach((it, i) => {
    const name = it.tag ? `<${moName(it.tag)}>` : `${it.fn}()`;
    out.push(`${i + 1}. ${name} — ${L(it.title)}`);
    const desc = L(it.desc).replace(/^\d+(\.\d+)*[^:：]*[:：]\s*/, '');
    if (desc) out.push(`   ${desc}`);
    const imp = String(it.imports || '').trim();
    if (imp) out.push(`   ${s.import}:`, ...imp.split('\n').map((l) => '     ' + l));
    if (it.usage) out.push(`   ${s.example}:`, ...toMo(it.usage).split('\n').map((l) => '     ' + l));
    if (notes[it.id]) out.push(`   ${s.note}: ${String(notes[it.id]).slice(0, 500)}`);
    out.push('');
  });
  out.push(...s.rules.map((r) => '- ' + r));
  return out.join('\n');
}
