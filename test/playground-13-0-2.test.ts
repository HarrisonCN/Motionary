// 13.0.2: component playground correctness — Run, Copy and Download share the editor; full-document runs;
// HTML (CDN) vs npm + bundler (import map); prerequisite / error hints; sandbox isolation.
// The real-browser half of these checks is scripts/check-playground.mjs (npm run check:playground).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as R from '../showcase/runnable.js';

const read = (f: string) => readFileSync(f, 'utf8');
const { buildManifest } = await import('../scripts/gen-manifest.mjs');
const m = buildManifest();
const major = String(m.version).split('.')[0];
const pkg = JSON.parse(read('package.json'));
const exportsMap = (R as any).exportsToMap?.(pkg.exports) ?? {}; // tolerant so each test reports on its own (13.0.1 has no exportsToMap)
const byTag = (t: string) => m.components.find((c: any) => c.tag === t);
const reveal = byTag('usa-reveal'), snap = byTag('usa-snap-carousel'), rive = byTag('usa-rive'), splitter = byTag('usa-text-splitter');
const html = (c: any) => (R as any).starterCode(c, 'html', { version: m.version, exportsMap });
const esm = (c: any) => (R as any).starterCode(c, 'esm', { version: m.version });

describe('13.0.2 one source of truth: Copy == Download == editor', () => {
  it('starter code is the 12.4 page / npm snippet', () => {
    expect(html(reveal)).toBe(R.runnablePage(reveal, { version: m.version }));
    expect(html(snap)).toBe((R.runnablePage as any)(snap, { version: m.version, exportsMap }));
    expect(esm(snap)).toBe(R.esmSnippet(snap));
  });
  it('downloadFile returns exactly the editor text (edited, not the sample), named per tab', () => {
    const edited = html(reveal).replace('<h2>Hello</h2>', '<h2>Edited</h2>');
    const f = (R as any).downloadFile(reveal, 'html', edited);
    expect(f.text).toBe(edited);
    expect(f.name).toBe('usa-reveal.html');
    expect(f.type).toMatch(/^text\/html/);
    const e = (R as any).downloadFile(reveal, 'esm', esm(reveal) + '\n// mine');
    expect(e.text).toBe(esm(reveal) + '\n// mine');
    expect(e.name).toBe('usa-reveal.js');
    expect(e.type).toMatch(/^text\/javascript/);
  });
  it('run.html: Run, Copy and Download read the same editor value; Download no longer rebuilds the sample', () => {
    const h = read('showcase/run.html');
    expect(h).toContain('downloadFile(cur, tab, editorCode())');
    expect(h).toContain('previewDocument(editorCode(), cur');
    expect(h).toContain('navigator.clipboard.writeText(editorCode())');
    expect(h).not.toMatch(/Blob\(\[runnablePage\(/);
    expect(h).not.toContain('.replace(cur.example');
  });
});

describe('13.0.2 Run uses the whole document (HTML / CDN tab)', () => {
  // computed per test (lazily) so a missing export fails each test instead of the whole file
  const E = () => html(reveal)
    .replace('</title>', ' (edited)</title>')
    .replace('<style>', '<style id="mine">h2{color:red}</style>\n<style>')
    .replace('<h2>Hello</h2>', '<h2 id="x">Edited</h2>');
  const D = () => (R as any).previewDocument(E(), reveal, { mode: 'html', base: '/dist/', version: m.version, token: 't1' });
  it('keeps head and body edits', () => {
    const doc = D();
    expect(doc).toContain('<style id="mine">h2{color:red}</style>');
    expect(doc).toContain('(edited)</title>');
    expect(doc).toContain('<h2 id="x">Edited</h2>');
    expect(doc).not.toContain('<h2>Hello</h2>');
  });
  it('swaps this major\'s CDN for the local dist/, leaves other versions alone', () => {
    const doc = D(), edited = E();
    expect(doc).toContain('<script crossorigin="anonymous" src="/dist/components.umd.js"></script>');
    expect(doc).not.toMatch(new RegExp(`motionary@${major}/dist/`));
    const pinned = edited.replace(`motionary@${major}/`, 'motionary@12.4.0/');
    expect((R as any).previewDocument(pinned, reveal, { mode: 'html', base: '/dist/', version: m.version })).toContain('motionary@12.4.0/dist/');
  });
  it('injects the error reporter first, carrying the run token', () => {
    const doc = D();
    const i = doc.indexOf('__motionaryPlayground');
    expect(i).toBeGreaterThan(-1);
    expect(i).toBeLessThan(doc.indexOf('components.umd.js'));
    expect(doc).toContain('"t1"');
  });
  it('a markup-only editor runs inside the sample page (prerequisites + bundles)', () => {
    const d = (R as any).previewDocument('<usa-text-splitter>Hi</usa-text-splitter>', splitter, { mode: 'html', base: '/dist/', version: m.version });
    expect(d).toContain('src="/dist/runtime/text.iife.js"></script>');
    expect(d).toContain('<usa-text-splitter>Hi</usa-text-splitter>');
    const e = (R as any).previewDocument('<usa-snap-carousel><article>1</article></usa-snap-carousel>', snap, { mode: 'html', base: '/dist/', version: m.version, exportsMap });
    expect(e).toContain('"motionary/runtime/drag-snap": "/dist/runtime/drag-snap.js"');
  });
});

describe('13.0.2 npm + bundler tab runs through an import map', () => {
  it('maps every motionary specifier to the dist file package.json exports names', () => {
    expect(exportsMap['motionary']).toBe('index.js');
    expect(exportsMap['motionary/runtime/drag-snap']).toBe('runtime/drag-snap.js');
    expect(exportsMap['motionary/fx/gpu']).toBe('components/fx-gpu.js');
    const { imports } = (R as any).importMapFor(esm(snap), { base: '/dist/', exportsMap });
    expect(imports['motionary/runtime']).toBe('/dist/runtime.js');
    expect(imports['motionary/runtime/drag-snap']).toBe('/dist/runtime/drag-snap.js');
    expect(imports['motionary/components/snap-carousel']).toBe('/dist/' + exportsMap['motionary/components/snap-carousel']);
  });
  it('third-party packages come from an ESM CDN; unknown motionary paths are reported', () => {
    const r = (R as any).importMapFor(esm(rive) + "\nimport 'motionary/does-not-exist';", { base: '/dist/', exportsMap });
    expect(r.imports['@rive-app/canvas']).toBe('https://cdn.jsdelivr.net/npm/@rive-app/canvas/+esm');
    expect(r.unknown).toEqual(['motionary/does-not-exist']);
  });
  it('the preview document holds the edited module and the edited markup', () => {
    const code = esm(reveal).replace('<h2>Hello</h2>', '<h2 id="e">From npm</h2>') + '\nconsole.log("mine");';
    const d = (R as any).previewDocument(code, reveal, { mode: 'esm', base: '/dist/', version: m.version, exportsMap });
    expect(d).toMatch(/<script type="importmap">/);
    expect(d.indexOf('type="importmap"')).toBeLessThan(d.indexOf('type="module"'));
    expect(d).toContain('console.log("mine");');
    expect(d).toMatch(/<body>[\s\S]*<h2 id="e">From npm<\/h2>[\s\S]*<script type="module">/);
    expect((R as any).previewDocument('x</script><b>', reveal, { mode: 'esm', base: '/dist/', exportsMap })).not.toContain('x</script><b>');
  });
});

describe('13.0.2 problems: missing prerequisites, unknown imports, runtime errors', () => {
  const msgs = (ps: any[]) => ps.map((p) => `${p.message} ${p.fix || ''}`).join('\n');
  it('every starter page and snippet is clean', () => {
    for (const c of m.components) {
      expect((R as any).checkCode(html(c), c, { mode: 'html', exportsMap }).filter((p: any) => p.level === 'error'), c.tag).toEqual([]);
      expect((R as any).checkCode(esm(c), c, { mode: 'esm', exportsMap }).filter((p: any) => p.level === 'error'), c.tag).toEqual([]);
    }
  });
  it('HTML: a removed prerequisite names the module and the exact <script> line', () => {
    const code = html(splitter).split('\n').filter((l: string) => !l.includes('runtime/text.iife.js')).join('\n');
    const ps = (R as any).checkCode(code, splitter, { mode: 'html', exportsMap });
    expect(ps[0].level).toBe('error');
    expect(msgs(ps)).toContain('motionary/runtime/text');
    expect(msgs(ps)).toContain(`<script src="https://cdn.jsdelivr.net/npm/motionary@${major}/dist/runtime/text.iife.js"></script>`);
  });
  it('HTML: prerequisites after the bundle are flagged with the order to use', () => {
    const lines = html(splitter).split('\n');
    const i = lines.findIndex((l: string) => l.includes('runtime/text.iife.js'));
    const [mod] = lines.splice(i, 1);
    lines.splice(lines.findIndex((l: string) => l.startsWith('<body>')), 0, mod);
    const ps = (R as any).checkCode(lines.join('\n'), splitter, { mode: 'html', exportsMap });
    expect(msgs(ps)).toMatch(/before/);
  });
  it('HTML: an ES-module-only component without its module script gets the module code to add', () => {
    const code = html(snap).replace(/<script type="module">[\s\S]*?<\/script>\n/, '');
    const ps = (R as any).checkCode(code, snap, { mode: 'html', exportsMap });
    expect(msgs(ps)).toContain('use(dragSnap);');
    const noUse = html(snap).replace('use(dragSnap);', '');
    expect(msgs((R as any).checkCode(noUse, snap, { mode: 'html', exportsMap }))).toContain('use(dragSnap);');
  });
  it('HTML: a missing component bundle is an error with its line', () => {
    const code = html(reveal).replace(/<script src="[^"]*components\.umd\.js"><\/script>\n/, '');
    expect(msgs((R as any).checkCode(code, reveal, { mode: 'html', exportsMap }))).toContain(reveal.cdn);
  });
  it('npm: a missing prerequisite import / use() / define call each come with the line to add', () => {
    const noImport = esm(snap).split('\n').filter((l: string) => !l.includes("'motionary/runtime/drag-snap'")).join('\n');
    expect(msgs((R as any).checkCode(noImport, snap, { mode: 'esm', exportsMap }))).toContain("import { dragSnap } from 'motionary/runtime/drag-snap';");
    const noDefine = esm(reveal).replace('defineReveal();', '');
    expect(msgs((R as any).checkCode(noDefine, reveal, { mode: 'esm', exportsMap }))).toContain('defineReveal();');
    const unknown = (R as any).checkCode("import 'motionary/does-not-exist';\n" + esm(reveal), reveal, { mode: 'esm', exportsMap });
    expect(unknown[0].level).toBe('error');
    expect(msgs(unknown)).toContain('motionary/does-not-exist');
  });
  it('reports from the preview become problems with fixes', () => {
    const rm = (R as any).explainReport({ kind: 'runtime-missing', module: 'drag-snap', message: '[motionary] needs drag-snap' }, snap, 'html');
    expect(rm.level).toBe('error');
    expect(`${rm.message} ${rm.fix}`).toContain('runtime/drag-snap.iife.js');
    const un = (R as any).explainReport({ kind: 'ready', undefined: ['usa-reveal'] }, reveal, 'html');
    expect(`${un.message} ${un.fix}`).toContain(reveal.cdn);
    const er = (R as any).explainReport({ kind: 'error', message: 'Uncaught ReferenceError: foo is not defined', line: 3 }, reveal, 'html');
    expect(er.message).toContain('foo is not defined');
    const spec = (R as any).explainReport({ kind: 'error', message: 'Failed to resolve module specifier "lodash". Relative references must start with either "/", "./", or "../".' }, reveal, 'esm');
    expect(spec.fix).toMatch(/npm i lodash|import map/);
    expect((R as any).explainReport({ kind: 'error', message: "Uncaught TypeError: Failed to construct 'URL': Invalid URL" }, reveal, 'html').fix).toContain('absolute https:// URL');
    expect((R as any).explainReport({ kind: 'ready', undefined: [] }, reveal, 'html')).toBe(null);
    expect((R as any).explainReport({ kind: 'nonsense' }, reveal, 'html')).toBe(null);
    expect((R as any).explainReport('<img src=x>', reveal, 'html')).toBe(null);
  });
});

describe('13.0.2 HTML pages that need ES modules', () => {
  it('ESM_ONLY lists exactly the components no CDN bundle defines', () => {
    const bundles: Record<string, string> = {};
    const text = (f: string) => (bundles[f] ??= (() => { try { return read('dist/' + f); } catch { return ''; } })());
    const none = m.components.filter((c: any) => {
      // 13.2: the manifest cdn of an entry-only element is its own ES module entry, so only the two no-build bundles count here
      const all = ['components.umd.js', 'widgets.umd.js'].map(text).join('\n');
      const short = c.tag.slice(4);
      return !all.includes(c.tag) && !all.includes(`"${short}"`) && !all.includes(`'${short}'`) && !all.includes(c.import?.define || '@@');
    }).map((c: any) => c.tag).sort();
    if (!text('components.umd.js')) return; // dist not built
    expect(none).toEqual([...(R as any).ESM_ONLY].sort());
  });
  it('an ESM_ONLY page loads the component through an import map + module script (prerequisites first)', () => {
    const p = html(snap);
    expect(p).toContain('<script type="importmap">');
    expect(p).toContain(`"motionary/runtime/drag-snap": "https://cdn.jsdelivr.net/npm/motionary@${major}/dist/runtime/drag-snap.js"`);
    expect(p).toContain('<script type="module">\n' + snap.prerequisites.importAndRegister);
    expect(p).not.toContain('components.umd.js');
  });
  it('bare imports in an example\'s module script get an import map; a page without one is flagged', () => {
    const aa = byTag('usa-auto-animate');
    const p = html(aa);
    expect(p).toContain(`"motionary/components/layout": "https://cdn.jsdelivr.net/npm/motionary@${major}/dist/${exportsMap['motionary/components/layout']}"`);
    expect(p.indexOf('type="importmap"')).toBeLessThan(p.indexOf('type="module"'));
    const without = R.runnablePage(aa, { version: m.version });
    const ps = (R as any).checkCode(without, aa, { mode: 'html', exportsMap });
    expect(ps.map((x: any) => x.message + x.fix).join()).toContain('"motionary/components/layout"');
  });
  it('preview: same-site scripts load with crossorigin so errors are not "Script error."', () => {
    const d = (R as any).previewDocument(html(reveal), reveal, { mode: 'html', base: 'http://site/dist/', version: m.version });
    expect(d).toContain('<script crossorigin="anonymous" src="http://site/dist/components.umd.js"></script>');
  });
});

describe('13.0.2 isolation and page wiring', () => {
  const h = read('showcase/run.html');
  const pkgScripts = pkg.scripts || {};
  it('the preview stays sandboxed: scripts only, never same-origin, popups, top navigation or modals', () => {
    expect((R as any).PREVIEW_SANDBOX).toBe('allow-scripts');
    expect(h).toContain('sandbox="allow-scripts"');
    expect(h).not.toMatch(/allow-same-origin|allow-top-navigation|allow-popups|allow-modals/);
    expect(h).not.toMatch(/\.sandbox\s*=|setAttribute\(['"]sandbox|createElement\(['"]iframe/);
    expect(h).toContain("old.cloneNode(false)"); // each run gets a fresh frame with the same sandbox attribute
  });
  it('messages are accepted only from the current preview run and rendered as text', () => {
    expect(h).toMatch(/e\.source !== \$\('preview'\)\.contentWindow/);
    expect(h).toMatch(/__motionaryPlayground !== token/);
    const panel = h.slice(h.indexOf('const renderProblems'), h.indexOf('const renderProblems') + 900);
    expect(panel).toContain('textContent');
    expect(panel).not.toContain('innerHTML');
  });
  it('mobile: own badge class, short list, 16 px editor, 40 px tap targets', () => {
    expect(h).not.toContain('class="badge"');
    const mq = h.slice(h.lastIndexOf('@media (max-width: 820px)'));
    expect(mq).toMatch(/aside ul \{[^}]*max-height: 180px/);
    expect(mq).toMatch(/textarea \{[^}]*font-size: 16px/);
    expect(mq).toMatch(/min-height: 40px/);
    expect(h.indexOf('aside ul { list-style')).toBeLessThan(h.lastIndexOf('@media (max-width: 820px)'));
  });
  it('Pages ships package.json for the import map; CI runs the browser check', () => {
    expect(read('.github/workflows/pages.yml')).toMatch(/cp package\.json _site\//);
    expect(read('.github/workflows/ci.yml')).toContain('npm run check:playground');
    expect(pkg.scripts['check:playground']).toBe('node scripts/check-playground.mjs');
  });
});
