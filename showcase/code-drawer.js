/**
 * motionary showcase — the code drawer (17.17).
 *
 * The component gallery and the Store have always let you open a part and copy its code in several
 * flavours (HTML with no build, ES module, React, Vue, desktop shells). The release pages from 17.16 on
 * (micro-interactions, spring parts, the icon preview, the looks) and the home page Collections did not.
 * This module brings the same drawer to them: a native <details> that expands into one code box per
 * flavour, with a copy button.
 *
 *   createDrawer({ id, markup })      the drawer for one gallery component, for this exact markup
 *   createDrawer({ tabs, snippets })  a drawer with your own tabs (the looks use this)
 *   mountCodeDrawers(root)            one drawer per `main article` that holds a known <mo-*> element
 *
 * Markup is read before the page's own module defines the elements, so what you copy is the markup the
 * page wrote, not what the elements rendered into it. Pure DOM, no library import.
 */
import { componentSnippets, CODE_TABS, findComponent } from './components-catalog.js';
import { highlight } from './codegen.js';

const STR = {
  en: { code: 'Code', copy: 'Copy code', copied: 'Copied', failed: 'Copy failed: select the code and copy it', flavours: 'Code flavour' },
  zh: { code: '代码', copy: '复制代码', copied: '已复制', failed: '复制失败，请手动选择代码复制', flavours: '代码格式' },
};
const lang = () => ((typeof document !== 'undefined' && document.documentElement.lang) || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
const t = (key) => STR[lang()][key];
const KEY = 'motionary:code-tab';
const remembered = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
const remember = (tab) => { try { localStorage.setItem(KEY, tab); } catch { /* private mode */ } };

const CSS = `
.mo-code{margin-top:12px;border:1px solid rgb(127 127 127 / .28);border-radius:14px;background:rgb(127 127 127 / .06);min-width:0;text-align:start}
.mo-code>summary{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font:600 13px/1.4 system-ui,sans-serif;list-style:none;border-radius:14px}
.mo-code>summary::-webkit-details-marker{display:none}
.mo-code>summary::after{content:'';margin-inline-start:auto;width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .2s ease;opacity:.6}
.mo-code[open]>summary::after{transform:rotate(-135deg)}
.mo-code>summary:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.mo-code-glyph{font:12px ui-monospace,monospace;opacity:.7}
.mo-code-body{display:grid;gap:8px;padding:0 10px 10px;min-width:0}
.mo-code-tabs{display:flex;flex-wrap:wrap;gap:6px}
.mo-code-tabs button{padding:4px 10px;border:1px solid rgb(127 127 127 / .35);border-radius:999px;background:transparent;color:inherit;font:12px/1.4 system-ui,sans-serif;cursor:pointer}
.mo-code-tabs button[aria-pressed="true"]{background:#16171c;border-color:#16171c;color:#e8e8ee}
.mo-code-tabs button:focus-visible,.mo-code-copy:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.mo-code-box{position:relative;min-width:0}
.mo-code-box pre{margin:0;max-height:320px;overflow:auto;padding:12px 14px;padding-top:40px;border-radius:10px;background:#16171c;color:#e8e8ee;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre;tab-size:2}
.mo-code-box pre:focus-visible{outline:2px solid #7aa2ff;outline-offset:2px}
.mo-code-box .tk-c{color:#8b8fa3}.mo-code-box .tk-s{color:#9ad18b}.mo-code-box .tk-t{color:#ff9f6e}.mo-code-box .tk-k{color:#b69cff}.mo-code-box .tk-n{color:#ffcf6e}
.mo-code-copy{position:absolute;top:8px;inset-inline-end:8px;padding:4px 10px;border:1px solid rgb(255 255 255 / .25);border-radius:999px;background:#24262e;color:#e8e8ee;font:12px/1.4 system-ui,sans-serif;cursor:pointer}
.mo-code-copy[data-state="ok"]{background:#1f6f43;border-color:#1f6f43}
.mo-code-copy[data-state="fail"]{background:#8a2a2a;border-color:#8a2a2a}
.mo-code-status{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

function adoptCss(doc) {
  if (doc.getElementById('mo-code-css')) return;
  const style = doc.createElement('style');
  style.id = 'mo-code-css';
  style.textContent = CSS;
  doc.head.append(style);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/** Tidy page markup for copying: drop page-only ids and the elements' own render state. */
export function cleanMarkup(html) {
  return String(html)
    .replace(/\s(id|data-log|aria-busy)="[^"]*"/g, '')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

const subOf = (item) => `motionary/components/${item.entry || item.category}`;

/** Other gallery elements used inside `markup` (a <mo-icon> inside a <mo-micro>, say), so their define calls ship too. */
function extrasIn(item, markup) {
  const seen = new Set([item.id]);
  const out = [];
  for (const [, id] of String(markup).matchAll(/<mo-([a-z0-9-]+)/g)) {
    if (seen.has(id)) continue;
    seen.add(id);
    const other = findComponent(id);
    if (other && other.kind === 'element' && !other.requires?.length) out.push(other);
  }
  return out;
}

/** Add the define calls of `extras` next to the main one in every module flavour. */
function withExtras(snips, item, extras) {
  if (!extras.length) return snips;
  const sub = subOf(item);
  const same = extras.filter((x) => subOf(x) === sub);
  const other = extras.filter((x) => subOf(x) !== sub);
  const imports = [`import { ${[item.define, ...same.map((x) => x.define)].join(', ')} } from '${sub}';`, ...other.map((x) => `import { ${x.define} } from '${subOf(x)}';`)].join('\n');
  const out = { ...snips };
  for (const key of ['esm', 'react', 'vue', 'desktop']) {
    if (!out[key]) continue;
    const lines = out[key].replace(`import { ${item.define} } from '${sub}';`, imports).split('\n');
    const at = lines.findIndex((l) => l.trimStart().startsWith(`${item.define}();`));
    if (at >= 0) {
      const pad = lines[at].match(/^\s*/)[0];
      const note = lines[at].includes('//');
      lines.splice(at + 1, 0, ...extras.map((x) => `${pad}${x.define}();${note ? ` // registers <mo-${x.id}>` : ''}`));
    }
    out[key] = lines.join('\n');
  }
  return out;
}

/** Snippets (one per CODE_TABS flavour) for gallery component `id`, written for `markup` when given. */
export function snippetsFor(id, markup) {
  const item = findComponent(id);
  if (!item || item.kind !== 'element') return null;
  if (!markup) return componentSnippets(item);
  const usage = cleanMarkup(markup);
  return withExtras(componentSnippets({ ...item, usage, live: undefined }), item, extrasIn(item, usage));
}

const drawers = new Set();
let watching = false;
function watchLang() {
  if (watching || typeof MutationObserver === 'undefined') return;
  watching = true;
  new MutationObserver(() => { for (const d of drawers) d.relabel(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

/**
 * A code drawer. Either { id, markup } for a gallery component, or { tabs: [{ id, en, zh }], snippets }.
 * Returns { el, update(markupOrSnippets) }. The code is only highlighted when the drawer is open.
 */
export function createDrawer({ id, markup, tabs, snippets, open = false } = {}) {
  const doc = document;
  adoptCss(doc);
  watchLang();
  const flavours = tabs || CODE_TABS;
  let snips = snippets || snippetsFor(id, markup);
  if (!snips) return null;

  const el = doc.createElement('details');
  el.className = 'mo-code';
  if (id) el.dataset.moCode = id;
  const summary = doc.createElement('summary');
  const glyph = doc.createElement('span');
  glyph.className = 'mo-code-glyph';
  glyph.setAttribute('aria-hidden', 'true');
  glyph.textContent = '</>';
  const word = doc.createElement('span');
  summary.append(glyph, word);
  const body = doc.createElement('div');
  body.className = 'mo-code-body';
  const bar = doc.createElement('div');
  bar.className = 'mo-code-tabs';
  bar.setAttribute('role', 'group');
  const box = doc.createElement('div');
  box.className = 'mo-code-box';
  const pre = doc.createElement('pre');
  pre.tabIndex = 0;
  const copy = doc.createElement('button');
  copy.type = 'button';
  copy.className = 'mo-code-copy';
  const status = doc.createElement('span');
  status.className = 'mo-code-status';
  status.setAttribute('role', 'status');
  box.append(pre, copy, status);
  body.append(bar, box);
  el.append(summary, body);

  const buttons = flavours.map((f) => {
    const b = doc.createElement('button');
    b.type = 'button';
    b.dataset.tab = f.id;
    b.append(doc.createElement('span'));
    b.addEventListener('click', () => { remember(f.id); show(f.id); });
    bar.append(b);
    return b;
  });

  const pick = () => {
    const want = remembered();
    return flavours.some((f) => f.id === want && snips[want]) ? want : flavours.find((f) => snips[f.id])?.id;
  };
  let current = pick();
  const paint = () => {
    if (!el.open) return;
    pre.innerHTML = `<code>${highlight(snips[current] || '')}</code>`;
    pre.setAttribute('aria-label', flavours.find((f) => f.id === current)?.[lang()] || current);
  };
  function show(tab) {
    current = snips[tab] ? tab : pick();
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.tab === current));
    paint();
  }
  const relabel = () => {
    const L = lang();
    word.textContent = t('code');
    bar.setAttribute('aria-label', t('flavours'));
    flavours.forEach((f, i) => { buttons[i].firstChild.textContent = f[L] || f.en; buttons[i].hidden = !snips[f.id]; });
    if (!copy.dataset.state) copy.textContent = t('copy');
    paint();
  };
  el.addEventListener('toggle', paint);

  let timer;
  copy.addEventListener('click', async () => {
    const ok = await copyText(snips[current] || '');
    copy.dataset.state = ok ? 'ok' : 'fail';
    copy.textContent = ok ? t('copied') : t('copy');
    status.textContent = ok ? t('copied') : t('failed');
    if (!ok) { const r = doc.createRange(); r.selectNodeContents(pre); getSelection()?.removeAllRanges(); getSelection()?.addRange(r); }
    clearTimeout(timer);
    timer = setTimeout(() => { delete copy.dataset.state; copy.textContent = t('copy'); status.textContent = ''; }, 1600);
    el.dispatchEvent(new CustomEvent('mo-code:copy', { bubbles: true, detail: { ok, tab: current, id: id || null } }));
  });

  const api = {
    el,
    relabel,
    /** New markup (string) for a component drawer, or a new snippets object. */
    update(next) {
      const s = typeof next === 'string' ? snippetsFor(id, next) : next;
      if (!s) return;
      snips = s;
      relabel();
      show(current);
    },
    get code() { return snips[current] || ''; },
  };
  drawers.add(api);
  if (open) el.open = true;
  relabel();
  show(current);
  return api;
}

/** Tabs of the look drawer: no "HTML" tab, since a look is a style on markup you already have. */
export const LOOK_TABS = [
  { id: 'esm', en: 'ES module', zh: 'ES 模块' },
  { id: 'react', en: 'React', zh: 'React' },
  { id: 'vue', en: 'Vue', zh: 'Vue' },
  { id: 'css', en: 'CSS variables', zh: 'CSS 变量' },
];

const LOOK_SAMPLE = {
  ui: '<mo-download-button label="Download" done-label="Done"></mo-download-button>',
  parts: '<mo-split-pane label="Resize panes" position="45">\n  <div>Left</div>\n  <div>Right</div>\n</mo-split-pane>',
  motion: '<mo-border-beam glow>\n  <img src="photo.jpg" alt="">\n</mo-border-beam>',
};
const pad = (text, n) => text.split('\n').map((line) => ' '.repeat(n) + line).join('\n');

/**
 * Code for one look. `info` is lookInfo(name), `tokens` lookTokens(name), `count` how many looks its family has
 * (the page passes these in from the built library, so this module never imports it).
 */
export function lookSnippets({ name, info, tokens = {}, count, sample }) {
  const fam = info?.family || 'ui';
  const html = `<section data-mo-look="${name}">\n${pad(sample || LOOK_SAMPLE[fam], 2)}\n</section>`;
  const feel = info?.feel ? `\n// ${name} also sets the spring feel "${info.feel}": <mo-micro> and the spring parts inside it follow it.` : '';
  const setup = `import { defineWidgets, adoptLooks } from 'motionary/components/widgets';\n\ndefineWidgets();\nadoptLooks('${fam}'); // ${count ? `this family's ${count} looks; ` : ''}adoptLooks() loads every family${feel}`;
  const vars = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return {
    esm: `${setup}\n\n/* then, in your HTML (or look="${name}" on a single element):\n${html}\n*/`,
    react: `${setup}\n\nexport function Demo() {\n  return (\n${pad(html.replace(/\bclass="/g, 'className="'), 4)}\n  );\n}`,
    vue: `<!-- vite.config: vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('mo-') } } }) -->\n<script setup>\n${setup}\n</script>\n\n<template>\n${pad(html, 2)}\n</template>`,
    css: `/* ${name}: the custom properties adoptLooks() sets, for use without it */\n[data-mo-look="${name}"] {\n${vars}\n}`,
  };
}

/** The first element in `scope` whose <mo-*> name is a gallery component, and the outerHTML of every one of them. */
function componentIn(scope) {
  for (const node of scope.querySelectorAll('*')) {
    const name = node.localName;
    if (!name.startsWith('mo-')) continue;
    const id = name.slice(3);
    const item = findComponent(id);
    if (!item || item.kind !== 'element') continue;
    const all = [...scope.querySelectorAll(name)].filter((n) => !n.parentElement.closest(name));
    return { id, markup: all.map((n) => n.outerHTML).join('\n') };
  }
  return null;
}

/** One drawer at the end of every card in `root` (`main article` by default) that holds a known <mo-*>. */
export function mountCodeDrawers(root = document, selector = 'main article') {
  const made = [];
  for (const card of root.querySelectorAll(selector)) {
    if (card.querySelector(':scope > .mo-code')) continue;
    // data-mo-code="id" names the part when it lives outside the card (a toast pile at the end of <body>, say)
    const named = card.dataset.moCode;
    const found = named ? { id: named, markup: [...(card.querySelector(`mo-${named}`) ? card : document).querySelectorAll(`mo-${named}`)].map((n) => n.outerHTML).join('\n') || undefined } : componentIn(card);
    if (!found) continue;
    const d = createDrawer(found);
    if (!d) continue;
    card.append(d.el);
    made.push(d);
  }
  return made;
}

// <script type="module" src="./code-drawer.js" data-auto></script> before the page's own module.
if (typeof document !== 'undefined') {
  const me = [...document.querySelectorAll('script[type="module"][data-auto]')].find((s) => /code-drawer\.js/.test(s.getAttribute('src') || ''));
  if (me) mountCodeDrawers(document, me.dataset.auto || 'main article');
}
