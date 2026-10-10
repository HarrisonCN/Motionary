// 13.2: documentation facts generated from the AI manifest (scripts/gen-manifest.mjs → buildManifest), so README, docs and
// package metadata cannot drift from the catalog:
//   • inline numbers      <!--fact:public-->209<!--/fact-->        README.md, README_zh.md, README_ja.md, docs/components.md
//   • the core table      <!-- core-table:start --> … <!-- core-table:end -->   category · entry point · elements (all three READMEs)
//   • how we count        <!-- counting:start --> … <!-- counting:end -->       docs/components.md#how-components-are-counted
//   • package.json "description"
// `node scripts/facts.mjs` writes them; `--check` exits 1 when any is stale (CI: npm run check:docs).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildManifest } from './gen-manifest.mjs';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

const umd = (c) => /\.umd\.js$/.test(c.cdn || '');
/**
 * One definition for every count the docs state:
 *   public        every <usa-*> element in the manifest (each has a contract, a docs page and a gzip budget)
 *   core          elements registered by `motionary/components` (defineComponents(), CDN components.umd.js), by category
 *   widgets       elements with their own entry point `motionary/widgets/<name>`
 *   widgetsBundle   … of which the no-build widgets.umd.js registers
 *   entryOnly       … of which load only from their own ES module entry (not in either no-build bundle)
 *   effects       effects with their own entry point `motionary/effects/<name>`
 *   runtimeModules  motionary/runtime modules besides the core; peers = official runtimes (optional peer dependencies)
 */
export function componentCounts(m) {
  const c = m.components;
  return {
    public: c.length,
    core: c.filter((x) => !x.entry).length,
    widgets: c.filter((x) => x.entry).length,
    widgetsBundle: c.filter((x) => x.entry && umd(x)).length,
    entryOnly: c.filter((x) => x.entry && !umd(x)).length,
    effects: (m.effects || []).length,
    runtimeModules: (m.runtimeModules || []).filter((r) => r.kind !== 'peer' && r.id !== 'core').length,
    peers: (m.runtimeModules || []).filter((r) => r.kind === 'peer').length,
  };
}

export function packageDescription(m) {
  const n = componentCounts(m);
  return `Motionary (formerly use-scroll-animate): dependency-free scroll animations + ${n.public} animated Web Components (${n.core} in motionary/components, ${n.widgets} widgets with their own entry points) — 214 scroll-reveal presets, card/click/button morphs, physics, page transitions, generative & sound-reactive backgrounds, cursor/gesture effects, themes, micro-interactions, <usa-player>, WebGL. React, Vue, Svelte, Solid, Angular or plain HTML.`;
}

// category labels of the core table, per README language (order follows the manifest)
const LABELS = {
  en: { head: ['Category', 'Entry', 'Elements'], reveal: 'Scroll reveal', text: 'Text', interaction: 'Interaction', feedback: 'Feedback', background: 'Backgrounds', transitions: 'Transitions', physics: 'Spring & physics', cards: 'Cards', click: 'Click & buttons', ui: 'UI kit', page: 'Page-wide', timeline: 'Timeline', gesture: 'Gestures', svg: 'SVG', webgl: 'WebGL', depth: '3D depth', layout: 'Layout', packs: 'Packs', fx: 'Effect registry', effects: 'Effect packs' },
  zh: { head: ['分类', '入口', '元素'], reveal: '滚动显现', text: '文字', interaction: '交互', feedback: '反馈', background: '背景', transitions: '过渡', physics: '弹簧与物理', cards: '卡片', click: '点击与按钮', ui: 'UI 套件', page: '整页', timeline: '时间线', gesture: '手势', svg: 'SVG', webgl: 'WebGL', depth: '3D 景深', layout: '布局', packs: '效果包', fx: '效果注册表', effects: '效果包元素' },
  ja: { head: ['カテゴリ', 'エントリ', '要素'], reveal: 'スクロール表示', text: 'テキスト', interaction: 'インタラクション', feedback: 'フィードバック', background: '背景', transitions: 'トランジション', physics: 'バネ・物理', cards: 'カード', click: 'クリック・ボタン', ui: 'UI キット', page: 'ページ全体', timeline: 'タイムライン', gesture: 'ジェスチャー', svg: 'SVG', webgl: 'WebGL', depth: '3D 奥行き', layout: 'レイアウト', packs: 'パック', fx: 'エフェクトレジストリ', effects: 'エフェクトパック' },
};
const ORDER = ['reveal', 'text', 'interaction', 'feedback', 'background', 'transitions', 'physics', 'cards', 'click', 'ui', 'page', 'timeline', 'gesture', 'svg', 'webgl', 'depth', 'layout', 'packs', 'fx', 'effects'];

export function coreTable(m, lang = 'en') {
  const L = LABELS[lang];
  const by = new Map();
  for (const c of m.components.filter((x) => !x.entry)) {
    const k = c.import.path.replace(/^motionary\/components\//, '');
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(c.tag);
  }
  const keys = [...by.keys()].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b));
  return [`| ${L.head.join(' | ')} |`, '|---|---|---|', ...keys.map((k) => `| **${L[k] || k}** | \`motionary/components/${k}\` | ${by.get(k).map((t) => `\`<${t}>\``).join(' · ')} |`)].join('\n');
}

export function countingSection(m) {
  const n = componentCounts(m);
  const entryOnly = m.components.filter((x) => x.entry && !umd(x)).map((x) => `\`<${x.tag}>\``).join(', ');
  return [
    '## How components are counted',
    '',
    `> Generated from the AI manifest by \`scripts/facts.mjs\` — README, docs and package metadata use these numbers and nothing else.`,
    '',
    '| Count | Value | What it counts |',
    '|---|---|---|',
    `| **All public components** | **${n.public}** | Every \`<usa-*>\` element in the manifest (\`motionary/manifest.json\`, \`/components.json\`). Each has a contract (\`npm run check:contract\`), a docs page and a gzip budget. |`,
    `| **Core components** | **${n.core}** | Elements registered by \`motionary/components\` (\`defineComponents()\`, CDN \`components.umd.js\`), imported by category (\`motionary/components/<category>\`). |`,
    `| Widgets | ${n.widgets} | Elements with their own entry point \`motionary/widgets/<name>\`. ${n.widgetsBundle} of them are also in the no-build \`widgets.umd.js\`; ${n.entryOnly} (${entryOnly}) load only from their own ES module entry. |`,
    `| Effects | ${n.effects} | Effects with their own entry point \`motionary/effects/<name>\` (not elements, not in the counts above). |`,
    `| Runtime modules | ${n.runtimeModules} + core | \`motionary/runtime/<module>\`; plus ${n.peers} official runtimes as optional peer dependencies. |`,
    '',
    `Core + widgets = all public components (${n.core} + ${n.widgets} = ${n.public}). "Core" is about how an element is registered, not about its quality or stability: every public component is held to the same contract.`,
  ].join('\n');
}

const splice = (s, a, b, body, file) => {
  const i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < i) throw new Error(`${file}: markers ${a} … ${b} not found`);
  return s.slice(0, i + a.length) + '\n' + body + '\n' + s.slice(j);
};

export function generate() {
  const m = buildManifest();
  const n = componentCounts(m);
  const files = {};
  const facts = (s, file) => s.replace(/<!--fact:([a-zA-Z]+)-->[^<]*<!--\/fact-->/g, (all, k) => {
    if (!(k in n)) throw new Error(`${file}: unknown fact "${k}"`);
    return `<!--fact:${k}-->${n[k]}<!--/fact-->`;
  });
  for (const [f, lang] of [['README.md', 'en'], ['README_zh.md', 'zh'], ['README_ja.md', 'ja']]) files[f] = splice(facts(read(f), f), '<!-- core-table:start -->', '<!-- core-table:end -->', coreTable(m, lang), f);
  files['docs/components.md'] = splice(facts(read('docs/components.md'), 'docs/components.md'), '<!-- counting:start -->', '<!-- counting:end -->', countingSection(m), 'docs/components.md');
  const pkgText = read('package.json');
  const pkg = JSON.parse(pkgText);
  if (pkg.description !== packageDescription(m)) files['package.json'] = pkgText.replace(/("description":\s*)"(?:[^"\\]|\\.)*"/, (_, k) => k + JSON.stringify(packageDescription(m)));
  else files['package.json'] = pkgText;
  return files;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes('--check');
  const stale = [];
  for (const [f, s] of Object.entries(generate())) {
    if (read(f) === s) continue;
    if (check) stale.push(f); else writeFileSync(join(ROOT, f), s);
  }
  if (stale.length) { console.error(`❌ docs facts out of date: ${stale.join(', ')} — run node scripts/facts.mjs`); process.exit(1); }
  console.log(check ? 'docs facts up to date' : 'docs facts written');
}
