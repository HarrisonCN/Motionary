// 12.4: one runnable page per component, built from the AI manifest (dist/manifest.json, on the site /components.json).
// Pure functions (no DOM): used by showcase/run.html (component playground) and the tests.

const MOTIONARY_DIST = /https:\/\/(?:cdn\.jsdelivr\.net\/npm|unpkg\.com)\/motionary@\d+\/dist\//g;

/** Script URLs a page needs for this component, in load order: prerequisites (runtime core → modules, official runtimes) → bundles. */
export function scriptsFor(c) {
  const fromPre = c.prerequisites && c.prerequisites.cdn ? [...c.prerequisites.cdn.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]) : [];
  const list = fromPre.length ? fromPre : [c.cdn];
  if (!list.includes(c.cdn)) list.push(c.cdn);
  return list;
}

/** 'No prerequisites · basic tier' / 'Requires: motionary/runtime/drag-snap · standard tier'. */
export function depsLabel(c) {
  const mods = (c.prerequisites && c.prerequisites.modules) || [];
  return `${mods.length ? 'Requires: ' + mods.join(' + ') : 'No prerequisites'} · ${c.tier || 'basic'} tier`;
}

/** Components no CDN (UMD / IIFE) bundle defines: their HTML page loads them as ES modules (13.0.2). */
export const ESM_ONLY = ['usa-dotlottie', 'usa-gl-model', 'usa-snap-carousel'];

const majorOf = (c, version) => (version ? String(version).split('.')[0] : ((c.cdn || '').match(/motionary@(\d+)\//) || [, 'latest'])[1]);
const moduleBodies = (html) => [...html.matchAll(/<script\b[^>]*\btype\s*=\s*["']?module["']?[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);

/** A complete HTML page that runs the component's example. base: replace the Motionary CDN with a local dist/ (for previews).
 * exportsMap (13.0.2, from package.json exports): bare `motionary/…` imports in the example get an import map to the
 * CDN's dist/ files, and ESM_ONLY components load through a module script instead of a bundle. */
export function runnablePage(c, { base, version, exportsMap } = {}) {
  const src = (u) => (base ? u.replace(MOTIONARY_DIST, base) : u);
  const L = [
    '<!doctype html>',
    '<html lang="en">',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${c.title} · Motionary</title>`,
    `<!-- <${c.tag}> · ${depsLabel(c)}${version ? ` · motionary ${version}` : ''} · docs: https://github.com/HarrisonCN/Motionary/blob/main/docs/components/${c.tag}.md -->`,
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#0b0d12;color:#e8ecf3}</style>',
  ];
  const esmOnly = !!(exportsMap && c.prerequisites && ESM_ONLY.includes(c.tag));
  if (exportsMap) {
    const mods = moduleBodies(c.example).join('\n') + (esmOnly ? '\n' + c.prerequisites.importAndRegister : '');
    const { imports } = importMapFor(mods, { base: `https://cdn.jsdelivr.net/npm/motionary@${majorOf(c, version)}/dist/`, exportsMap });
    if (Object.keys(imports).length) L.push('<!-- import map: bare imports in the module scripts resolve to the CDN -->', `<script type="importmap">\n${JSON.stringify({ imports }, null, 2)}\n</script>`);
  }
  if (esmOnly) {
    L.push(`<!-- no CDN bundle defines <${c.tag}>: it loads as ES modules, prerequisites first -->`, '<script type="module">', c.prerequisites.importAndRegister, '</script>');
  } else {
    const scripts = scriptsFor(c);
    if (scripts.length > 1) L.push('<!-- prerequisites first, then the component bundle -->');
    for (const u of scripts) L.push(`<script src="${src(u)}"></script>`);
  }
  L.push('<body>', c.example, '</body>', '</html>');
  return L.join('\n') + '\n';
}

/** npm + bundler version (install, import + register in order, markup). */
export function esmSnippet(c) {
  if (c.prerequisites) return `// ${c.prerequisites.install}\n${c.prerequisites.importAndRegister}\n\n/* markup:\n${c.example}\n*/\n`;
  return `// npm i motionary\n${c.esm}\n`;
}

// ---------------------------------------------------------------------------------------------------------------
// 13.0.2: playground correctness. The editor is the one source of truth: Run previews it, Copy and Download hand it
// out unchanged. HTML (CDN) runs the whole document; npm + bundler runs the module through an import map. Problems
// (missing prerequisites, unknown imports, runtime errors) come with the line that fixes them.

/** The preview iframe's sandbox: scripts only — no same-origin, popups, top navigation, forms or modals. */
export const PREVIEW_SANDBOX = 'allow-scripts';

/** What the editor starts with for a tab: 'html' → runnablePage, 'esm' → esmSnippet. */
export function starterCode(c, mode, { version, exportsMap } = {}) {
  return mode === 'esm' ? esmSnippet(c) : runnablePage(c, { version, exportsMap });
}

/** The file Download saves: exactly the editor text. */
export function downloadFile(c, mode, code) {
  return mode === 'esm'
    ? { name: `${c.tag}.js`, type: 'text/javascript;charset=utf-8', text: code }
    : { name: `${c.tag}.html`, type: 'text/html;charset=utf-8', text: code };
}

/** True when the HTML is a whole page (doctype / html / head / body) rather than a markup fragment. */
export function isFullDocument(code) {
  return /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(code);
}

/** package.json `exports` → { 'motionary/…': path inside dist/ } for the ESM files. */
export function exportsToMap(exports) {
  const map = {};
  for (const [k, v] of Object.entries(exports || {})) {
    const t = typeof v === 'string' ? v : v && (v.import ? (typeof v.import === 'string' ? v.import : v.import.default) : v.default);
    if (typeof t === 'string' && t.startsWith('./dist/') && /\.m?js$/.test(t)) map[k === '.' ? 'motionary' : 'motionary/' + k.slice(2)] = t.slice(7);
  }
  return map;
}

const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');
const isMotionary = (s) => s === 'motionary' || s.startsWith('motionary/');
const isBare = (s) => !/^(\.{0,2}\/|[a-z][a-z0-9+.-]*:)/i.test(s);
const pkgName = (s) => (s.startsWith('@') ? s.split('/').slice(0, 2) : s.split('/').slice(0, 1)).join('/');

/** Module specifiers a snippet imports (static, side-effect, re-export and dynamic), comments ignored. */
export function importSpecifiers(code) {
  const out = new Set();
  for (const m of stripComments(code).matchAll(/\b(?:import|export)\s*(?:[\w*{}\s,$]+?\s*from\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) out.add(m[1] || m[2]);
  return [...out];
}

/** Import map for an npm snippet: motionary subpaths → the site's dist/ (as package.json exports name them),
 * other bare packages → an ESM CDN. `unknown` lists motionary paths that are not exported. */
export function importMapFor(code, { base = '../dist/', exportsMap = {} } = {}) {
  const imports = {}, unknown = [], external = [];
  for (const s of importSpecifiers(code)) {
    if (isMotionary(s)) { if (exportsMap[s]) imports[s] = base + exportsMap[s]; else unknown.push(s); }
    else if (isBare(s)) { imports[s] = `https://cdn.jsdelivr.net/npm/${s}/+esm`; external.push(pkgName(s)); }
  }
  return { imports, unknown, external };
}

/** The markup a snippet carries in its `/* markup: … *\/` (or `/* then use it in your HTML: … *\/`) comment. */
export function markupFromSnippet(code) {
  const m = code.match(/\/\*\s*(?:markup:|then use it in your HTML:)\s*\n?([\s\S]*?)\*\//);
  return m ? m[1].trim() : null;
}

// Reports errors from the sandboxed preview to the playground page (postMessage only: the frame has no access to it).
const reporter = (token, offset) => `<script>/* motionary playground: reports errors to the editor — not part of your code */(()=>{const T=${JSON.stringify(String(token || ''))},O=${offset | 0},P=(kind,o)=>{try{parent.postMessage(Object.assign({__motionaryPlayground:T,kind:kind},o),'*')}catch(e){}};addEventListener('error',(e)=>{const t=e.target;if(t&&t!==window&&(t.src||t.href)){P('load',{url:String(t.src||t.href)})}else{const d=!e.filename||e.filename===location.href;P('error',{message:String(e.message||e.error||'Script error'),line:d?Math.max(0,(e.lineno||0)-O):0,file:d?'':String(e.filename).split('/').pop()+':'+(e.lineno||0)})}},true);addEventListener('unhandledrejection',(e)=>{const r=e.reason;P('error',{message:String((r&&r.message)||r)})});const ce=console.error.bind(console);console.error=(...a)=>{P('console',{message:a.map((x)=>(x&&x.message)||String(x)).join(' ')});ce(...a)};document.addEventListener('usa:runtime-missing',(e)=>{const d=e.detail||{};P('runtime-missing',{module:String(d.module||''),message:String(d.message||'')})});addEventListener('load',()=>setTimeout(()=>{const u=[...new Set([...document.querySelectorAll('*')].map((n)=>n.localName).filter((t)=>t.startsWith('usa-')&&!customElements.get(t)))];P('ready',{undefined:u})},400))})();</script>`;

const cdnFor = (version) => {
  const v = version ? String(version) : '';
  const which = v ? `(?:${v.split('.')[0]}|${v.replace(/\./g, '\\.')})` : '\\d+';
  return new RegExp(`https:\\/\\/(?:cdn\\.jsdelivr\\.net\\/npm|unpkg\\.com)\\/motionary@${which}\\/dist\\/`, 'g');
};

/** The document the preview runs for the editor code. html: the whole page as written (a bare fragment runs inside
 * the sample page), this major's CDN swapped for `base`; esm: markup + import map + the module. A small error
 * reporter is injected first. */
export function previewDocument(code, c, { mode = 'html', base, version, exportsMap = {}, token = '' } = {}) {
  if (mode === 'esm') {
    const { imports } = importMapFor(code, { base: base || `https://cdn.jsdelivr.net/npm/motionary@${version ? String(version).split('.')[0] : 'latest'}/dist/`, exportsMap });
    const head = [
      '<!doctype html>',
      '<html lang="en">',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${c.title} · npm preview</title>`,
      `<script type="importmap">${JSON.stringify({ imports }).replace(/</g, '\\u003c')}</script>`,
      '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#0b0d12;color:#e8ecf3}</style>',
      '<body>',
      markupFromSnippet(code) ?? c.example,
      '<script type="module">',
    ].join('\n') + '\n';
    const offset = head.split('\n').length - 1;
    const doc = head + code.replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>\n</html>\n';
    return doc.replace('<!doctype html>', '<!doctype html>' + reporter(token, offset));
  }
  let doc = isFullDocument(code) ? code : runnablePage({ ...c, example: code }, { version, exportsMap });
  if (base) {
    doc = doc.replace(cdnFor(version), base);
    // same-site scripts load with CORS in the preview, so their errors are reported in full (not just "Script error.")
    const esc = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    doc = doc.replace(new RegExp(`<script(?![^>]*\\bcrossorigin)(?=[^>]*\\ssrc\\s*=\\s*["']${esc})`, 'gi'), '<script crossorigin="anonymous"');
  }
  const dt = doc.match(/^\s*<!doctype[^>]*>/i);
  return dt ? dt[0] + reporter(token, 0) + doc.slice(dt[0].length) : reporter(token, 0) + doc;
}

const scriptTail = (u) => u.replace(/^[a-z]+:\/\/[^/]+\//i, '').replace(/^npm\//, '').replace(/^(@[^/]+\/)?[^/@]+@[^/]+\//, '').replace(/^\.?\//, '');
const scriptName = (u) => {
  const t = scriptTail(u);
  let m = t.match(/(?:^|\/)dist\/runtime\/(.+)\.iife\.js$/);
  if (m) return `motionary/runtime/${m[1]}`;
  if (/(?:^|\/)dist\/runtime\.iife\.js$/.test(t)) return 'motionary/runtime (core)';
  if ((m = t.match(/(?:^|\/)dist\/([^/]+\.umd\.js)$/))) return `the ${m[1]} bundle`;
  m = u.match(/(?:npm\/|\.com\/)((?:@[^/]+\/)?[^/@]+)/);
  return m ? m[1] : t;
};

// The imports and register calls of a starter module (`starter`) that the edited module (`code`) lacks.
function checkModule(code, c, starter) {
  const out = [];
  const have = new Set(importSpecifiers(code));
  const bare = stripComments(code);
  const pre = (c.prerequisites && c.prerequisites.modules) || [];
  for (const s of importSpecifiers(starter)) {
    if (have.has(s) || !isMotionary(s)) continue;
    const line = starter.split('\n').find((l) => l.includes(`'${s}'`));
    out.push({ level: 'error', message: `Missing import: ${s}${pre.includes(s) ? ` — <${c.tag}> needs this prerequisite` : ''}.`, fix: `Add: ${line}` });
  }
  for (const line of stripComments(starter).split('\n')) {
    const m = line.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);
    if (!m || m[1] === 'import') continue;
    if (!new RegExp(`(^|[^\\w$.])${m[1]}\\s*\\(`, 'm').test(bare.split('\n').filter((l) => !/^\s*import\b/.test(l)).join('\n'))) {
      out.push({ level: 'error', message: `${m[1]}() is never called — ${m[1] === 'use' ? 'the prerequisites are not registered' : `<${c.tag}> stays unregistered`}.`, fix: `Add (after the imports): ${line.trim()}` });
    }
  }
  return out;
}

/** Problems in the editor code before it runs: [{ level: 'error' | 'warning' | 'info', message, fix }]. */
export function checkCode(code, c, { mode = 'html', exportsMap = {} } = {}) {
  const out = [];
  if (mode === 'esm') {
    out.push(...checkModule(code, c, esmSnippet(c)));
    for (const s of importSpecifiers(code)) {
      if (isMotionary(s) && Object.keys(exportsMap).length && !exportsMap[s]) {
        const last = s.split('/').pop();
        const near = Object.keys(exportsMap).filter((k) => k.split('/').pop() === last);
        out.push({ level: 'error', message: `${s} is not an export of motionary.`, fix: near.length ? `Did you mean ${near.map((k) => `'${k}'`).join(' or ')}?` : `Use a path from package.json "exports" — for <${c.tag}>: '${(c.import && c.import.path) || 'motionary'}'.` });
      } else if (!isMotionary(s) && isBare(s)) {
        out.push({ level: 'info', message: `${s} is loaded from cdn.jsdelivr.net (+esm) in this preview.`, fix: `In your project: npm i ${pkgName(s)}` });
      } else if (!isBare(s)) {
        out.push({ level: 'warning', message: `${s} is a file of your own project — the playground cannot load it.`, fix: 'Serve that file next to your page (see the prerequisites docs); the rest of the preview still runs.' });
      }
    }
    if (markupFromSnippet(code) == null) out.push({ level: 'info', message: 'No /* markup: … */ block — the preview uses the sample markup.', fix: `Add one: /* markup:\n${c.example}\n*/` });
    return out;
  }
  if (!isFullDocument(code)) {
    out.push({ level: 'info', message: 'The editor holds markup only: Run wraps it in the sample page (prerequisites + bundles); Copy and Download give exactly this markup.', fix: `For a page that runs on its own, start from the sample page (Reset) and put your markup in its <body>.` });
    return out;
  }
  // module scripts: every bare import needs an import map entry (browsers have no node_modules)
  const mapped = {};
  for (const m of code.matchAll(/<script\b[^>]*\btype\s*=\s*["']?importmap["']?[^>]*>([\s\S]*?)<\/script>/gi)) { try { Object.assign(mapped, JSON.parse(m[1]).imports || {}); } catch { out.push({ level: 'error', message: 'The import map is not valid JSON.', fix: 'Check commas and quotes: {"imports": {"motionary/…": "https://cdn.jsdelivr.net/npm/motionary@13/dist/…"}}' }); } }
  const mods = moduleBodies(code).join('\n');
  const cdnDist = `https://cdn.jsdelivr.net/npm/motionary@${majorOf(c)}/dist/`;
  for (const s of importSpecifiers(mods)) {
    if (!isBare(s) || mapped[s]) continue;
    if (isMotionary(s) && Object.keys(exportsMap).length && !exportsMap[s]) { out.push({ level: 'error', message: `${s} is not an export of motionary.`, fix: `Use a path from package.json "exports" — for <${c.tag}>: '${(c.import && c.import.path) || 'motionary'}'.` }); continue; }
    out.push({ level: 'error', message: `"${s}" is a bare import: a browser cannot resolve it without an import map.`, fix: `Add before the module script: <script type="importmap">{"imports": {"${s}": "${isMotionary(s) && exportsMap[s] ? cdnDist + exportsMap[s] : `https://cdn.jsdelivr.net/npm/${s}/+esm`}"}}</script>` });
  }
  if (ESM_ONLY.includes(c.tag) && c.prerequisites) {
    if (!mods.trim()) out.push({ level: 'error', message: `No CDN bundle defines <${c.tag}> — it loads as ES modules.`, fix: `Add an import map and:\n<script type="module">\n${c.prerequisites.importAndRegister}\n</script>\n(Reset shows the complete page.)` });
    else out.push(...checkModule(mods, c, c.prerequisites.importAndRegister));
    if (!new RegExp(`<${c.tag}[\\s>/]`).test(code)) out.push({ level: 'warning', message: `The page has no <${c.tag}> element.`, fix: `Add the sample markup:\n${c.example}` });
    return out;
  }
  const req = scriptsFor(c);
  const srcs = [...code.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  const at = req.map((u) => { const t = scriptTail(u); return srcs.findIndex((s) => scriptTail(s).endsWith(t)); });
  req.forEach((u, i) => {
    if (at[i] !== -1) return;
    const next = req.slice(i + 1).find((_, j) => at[i + 1 + j] !== -1);
    const what = scriptName(u);
    const isPre = !/ bundle$/.test(what);
    out.push({
      level: 'error',
      message: isPre ? `Missing prerequisite: ${what} — <${c.tag}> needs it before the component bundle.` : `Missing ${what}: nothing defines <${c.tag}>.`,
      fix: `Add <script src="${u}"></script> ${next ? `before <script src="${srcs[at[req.indexOf(next)]]}">` : 'before </body>'}.`,
    });
  });
  for (let i = 0; i < req.length; i++) for (let j = i + 1; j < req.length; j++) {
    if (at[i] !== -1 && at[j] !== -1 && at[i] > at[j]) out.push({ level: 'error', message: `Load order: ${scriptName(req[i])} must load before ${scriptName(req[j])}.`, fix: `Move <script src="${srcs[at[i]]}"></script> before <script src="${srcs[at[j]]}">.` });
  }
  if (!new RegExp(`<${c.tag}[\\s>/]`).test(code)) out.push({ level: 'warning', message: `The page has no <${c.tag}> element.`, fix: `Add the sample markup:\n${c.example}` });
  return out;
}

const preFix = (c, mode) => {
  if (!c.prerequisites) return mode === 'esm' ? `${(c.import && `import { ${c.import.define} } from '${c.import.path}';\n${c.import.register}`) || ''}` : `<script src="${c.cdn}"></script>`;
  return mode === 'esm' ? c.prerequisites.importAndRegister : scriptsFor(c).map((u) => `<script src="${u}"></script>`).join('\n');
};

/** A report posted by the preview → a problem with a fix, or null (nothing to show / not a report). */
export function explainReport(r, c, mode = 'html') {
  if (!r || typeof r !== 'object' || typeof r.kind !== 'string') return null;
  const txt = (v) => String(v == null ? '' : v).slice(0, 500);
  switch (r.kind) {
    case 'ready': {
      const u = Array.isArray(r.undefined) ? r.undefined.filter((t) => typeof t === 'string').map(txt) : [];
      if (!u.length) return null;
      const mine = u.includes(c.tag);
      return {
        level: 'error',
        message: `${u.map((t) => `<${t}>`).join(', ')} ${u.length > 1 ? 'are' : 'is'} not registered — ${mine ? (mode === 'esm' ? 'the define call did not run' : 'its bundle did not load or loaded too late') : mode === 'esm' ? 'the snippet does not import it' : 'none of the loaded bundles defines it'}.`,
        fix: mine ? (mode === 'esm' ? `Import and register it:\n${preFix(c, 'esm')}` : `Load (in this order, before the markup runs):\n${preFix(c, 'html')}`) : mode === 'esm' ? 'This snippet does not register it: import its define function and call it (open that component in the playground for the exact lines).' : 'Open that component in the playground to see the bundle and prerequisites it needs.',
      };
    }
    case 'runtime-missing': {
      const mod = txt(r.module);
      return {
        level: 'error',
        message: `Missing runtime module${mod ? ` ${mod}` : ''}: ${txt(r.message) || `<${c.tag}> cannot start without it`}.`,
        fix: mode === 'esm' ? `Register the prerequisites before the component:\n${preFix(c, 'esm')}` : `Load the prerequisites before the component bundle:\n${preFix(c, 'html')}`,
      };
    }
    case 'load':
      return { level: 'warning', message: `Could not load ${txt(r.url)}.`, fix: /motionary@/.test(String(r.url)) ? 'Check the path against https://cdn.jsdelivr.net/npm/motionary@13/dist/ (a version that is not on the CDN yet, or a typo).' : 'Check the URL — sample assets such as /anim/… are placeholders for your own files.' };
    case 'error':
    case 'console': {
      const msg = txt(r.message);
      if (!msg) return null;
      const line = Number(r.line) > 0 ? ` (line ${Number(r.line) | 0})` : r.file ? ` (in ${txt(r.file).slice(0, 80)})` : '';
      const spec = msg.match(/(?:resolve module specifier|Failed to fetch dynamically imported module:?)\s*["']?([^"'\s]+)["']?/i);
      let fix = '';
      if (spec && isMotionary(spec[1])) fix = `${spec[1]} is not an export of motionary — use a path from package.json "exports" (for <${c.tag}>: '${(c.import && c.import.path) || 'motionary'}').`;
      else if (spec) fix = `In your project: npm i ${pkgName(spec[1])}. In this preview, bare imports are mapped to cdn.jsdelivr.net; relative files of your project are not available.`;
      else if (/Failed to construct 'URL'|Invalid URL/i.test(msg)) fix = 'The preview runs as about:srcdoc, so a relative file URL (src="/anim/…", a placeholder in the sample) cannot be resolved here. Point it at an absolute https:// URL of your file, or Download the page and open it from your site.';
      else if (/runtime|prerequisite|use\(/i.test(msg) && c.prerequisites) fix = `<${c.tag}> needs its prerequisites first:\n${preFix(c, mode)}`;
      return { level: r.kind === 'console' ? 'warning' : 'error', message: `${r.kind === 'console' ? 'console.error' : 'Runtime error'}${line}: ${msg}`, fix };
    }
    default:
      return null;
  }
}
