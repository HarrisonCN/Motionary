// 13.7.0 "AI tools 2.0" — motionary-mcp 2.1: retrieval ranking, check_compatibility, validate_snippet browser 'auto'
// with static fallback, suggest_fix, versioned tool schemas, the generated-example set. MOTIONARY_MCP_BIN points the
// suite at another build of the server (how the failing-before run in the release notes was made).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const BIN = process.env.MOTIONARY_MCP_BIN || join(ROOT, 'bin/motionary-mcp.mjs');
const M: any = await import(BIN);
const m = M.loadManifest(join(ROOT, 'dist/manifest.json'));
const call = (name: string, args: any) => M.callTool(m, name, args);
const sc = (r: any) => r.structuredContent;

describe('13.7 tool contracts', () => {
  it('list_components / search_components / get_component keep their 13.6 contract (name, input schema, annotations)', () => {
    const frozen = JSON.parse(readFileSync(join(ROOT, 'test/fixtures/mcp/frozen-tools-13.6.json'), 'utf8'));
    for (const [name, def] of Object.entries<any>(frozen)) {
      const { _meta, ...now } = M.TOOLS.find((t: any) => t.name === name);
      expect({ ...now, description: def.description }, name).toEqual(def);
    }
  });
  it('every tool carries a schema version; the new tools have an output schema', () => {
    for (const t of M.TOOLS) expect(t._meta?.['motionary/schemaVersion'], t.name).toMatch(/^\d+\.\d+$/);
    for (const n of ['check_compatibility', 'suggest_fix']) {
      const t = M.TOOLS.find((x: any) => x.name === n);
      expect(t, n).toBeTruthy();
      expect(t.outputSchema.required).toContain('schema');
      expect(t.annotations.readOnlyHint).toBe(true);
    }
  });
  it('tools/list over JSON-RPC lists the new tools', () => {
    const r = M.handle(m, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const names = r.result.tools.map((t: any) => t.name);
    expect(names).toEqual(expect.arrayContaining(['list_components', 'search_components', 'get_component', 'validate_snippet', 'check_compatibility', 'suggest_fix']));
  });
});

describe('13.7 search_components ranking (same result shape)', () => {
  const top = (q: string) => M.searchComponents(m, q, 5).map((x: any) => x.tag);
  it('an exact tag wins, typed any way', () => {
    for (const q of ['tilt', 'usa-tilt', '<usa-tilt>', 'TILT']) expect(top(q)[0], q).toBe('usa-tilt');
    expect(top('pull refresh')[0]).toBe('usa-pull-refresh');
    expect(top('badge wall')[0]).toBe('usa-badge-wall');
    expect(top('counter')[0]).toBe('usa-counter');
  });
  it('typos still find the component (fuzzy)', () => {
    expect(top('acordion')).toContain('usa-accordion');
    expect(top('countr')[0]).toBe('usa-counter');
    expect(top('leaderbord')).toContain('usa-leaderboard');
  });
  it('stable: same input → same order; result fields unchanged', () => {
    expect(M.searchComponents(m, 'scroll', 20)).toEqual(M.searchComponents(m, 'scroll', 20));
    const r = M.searchComponents(m, 'toast', 3);
    expect(Object.keys(r[0]).sort()).toEqual(['category', 'description', 'import', 'requires', 'score', 'since', 'tag', 'title'].sort());
    for (let i = 1; i < r.length; i++) expect(r[i - 1].score >= r[i].score).toBe(true);
  });
});

describe('13.7 check_compatibility', () => {
  it('framework, version and browser support per component', () => {
    const r = sc(call('check_compatibility', { tags: ['usa-tilt', 'usa-gl-model'], framework: 'react', browsers: ['safari 16'] }));
    expect(r.schema).toBe('motionary-mcp/check_compatibility@1');
    expect(r.compatible).toBe(true);
    const gl = r.components.find((c: any) => c.tag === 'usa-gl-model');
    expect(Object.keys(gl.frameworks)).toEqual(['react']);
    expect(gl.browsers.tested).toEqual(['chromium', 'firefox', 'webkit']);
    expect(gl.browsers.features.map((f: any) => f.id)).toContain('webgl2');
    expect(r.issues.some((i: any) => /safari 16.*webgl2/.test(i.message))).toBe(true);
  });
  it('a component newer than the installed version is incompatible; unknown tags are errors', () => {
    const newer = m.components.find((c: any) => c.since && Number(String(c.since).split('.')[0]) >= 3);
    const r = sc(call('check_compatibility', { tags: [newer.tag, 'usa-nope'], version: '2.0.0' }));
    expect(r.compatible).toBe(false);
    expect(r.issues.filter((i: any) => i.level === 'error').map((i: any) => i.tag)).toEqual(expect.arrayContaining([newer.tag, 'usa-nope']));
  });
  it('accepts a snippet instead of tags', () => {
    const r = sc(call('check_compatibility', { code: '<usa-tilt></usa-tilt><usa-counter to="9"></usa-counter>' }));
    expect(r.components.map((c: any) => c.tag).sort()).toEqual(['usa-counter', 'usa-tilt']);
  });
});

describe('13.7 validate_snippet browser: true | "auto" falls back to the static checks', () => {
  it('without a usable browser build the static result comes back with mode "static" and why', async () => {
    const prev = process.env.MOTIONARY_DIST;
    process.env.MOTIONARY_DIST = '/nonexistent-dist';
    try {
      const r = sc(await call('validate_snippet', { code: '<usa-tlit></usa-tlit>', browser: 'auto' }));
      expect(r.mode).toBe('static');
      expect(r.schema).toBe('motionary-mcp/validate_snippet@1');
      expect(r.valid).toBe(false);
      expect(r.errors[0]).toMatch(/usa-tilt/);
      expect(r.mount.skipped).toBeTruthy();
    } finally {
      if (prev === undefined) delete process.env.MOTIONARY_DIST; else process.env.MOTIONARY_DIST = prev;
    }
  });
});

describe('13.7 suggest_fix', () => {
  const fix = (code: string, context?: string) => sc(call('suggest_fix', { code, ...(context ? { context } : {}) }));
  it('wrong tag name → closest real tag, open and close', () => {
    const r = fix('<usa-tosater></usa-tosater>');
    expect(r.schema).toBe('motionary-mcp/suggest_fix@1');
    expect(r.fixes.filter((f: any) => f.kind === 'unknown-tag').map((f: any) => f.patch.replace)).toEqual(['<usa-toaster', '</usa-toaster>']);
    expect(r.fixed).toContain('<usa-toaster></usa-toaster>');
  });
  it('mistyped attribute → the component attribute', () => {
    const r = fix('<usa-toaster positon="top"></usa-toaster>');
    const f = r.fixes.find((x: any) => x.kind === 'unknown-attribute');
    expect(f.patch.replace).toBe('<usa-toaster position="top">');
    expect(r.remaining.warnings).toEqual([]);
  });
  it('bare motionary/ imports in a CDN page → CDN module URL of the same major', () => {
    const r = fix('<script src="https://unpkg.com/motionary@14/dist/components.umd.js"></script>\n<script type="module">\nimport { loadingBar } from \'motionary/components/page\';\n</script>');
    expect(r.context).toBe('cdn');
    const f = r.fixes.find((x: any) => x.kind === 'bare-import');
    expect(f.patch.replace).toMatch(/from 'https:\/\/[^']+motionary@16\/dist\/components\/page\.js'/); // CDN major = the current major (16 since 16.0)
    expect(f.line).toBe(3);
  });
  it('missing import / define in ESM → import + register lines', () => {
    const r = fix("import { defineTilt } from 'motionary/components/ui';\ndefineTilt();\nconst html = `<usa-tilt></usa-tilt><usa-counter to=\"5\"></usa-counter>`;", 'esm');
    const f = r.fixes.find((x: any) => x.kind === 'missing-import');
    expect(f.patch.replace).toMatch(/import \{ defineCounter \} from 'motionary\/components\/[a-z-]+';\ndefineCounter\(\);/);
    expect(r.valid).toBe(true);
  });
  it('missing runtime prerequisite → import + use() before the components', () => {
    const c = m.components.find((x: any) => x.requires.length === 1 && x.requires[0] !== 'core' && !x.requires[0].startsWith('@') && m.runtimeModules.find((r: any) => r.id === x.requires[0])?.kind !== 'peer');
    const r = fix(`import { ${c.import.define} } from '${c.import.path}';\n${c.import.register}\n// <${c.tag}></${c.tag}>`, 'esm');
    const f = r.fixes.find((x: any) => x.kind === 'missing-prerequisite');
    expect(f, c.tag).toBeTruthy();
    expect(f.patch.replace).toContain(`motionary/runtime/${c.requires[0]}`);
    expect(r.remaining.errors.filter((e: string) => /requires motionary\/runtime/.test(e))).toEqual([]);
  });
  it('import paths / CDN pins removed in 13.0 → current ones (usa-codemod-13 tables)', () => {
    const r = fix("import { x } from 'motionary/components/core';\n<script src=\"https://unpkg.com/motionary@12/dist/components.umd.js\"></script>");
    const kinds = r.fixes.filter((f: any) => f.kind === 'deprecated-api').map((f: any) => f.patch.replace);
    expect(kinds.join('\n')).toContain("'motionary/core'");
    expect(kinds.join('\n')).toContain('motionary@13/');
  });
  it('clean code → no fixes', () => {
    const r = fix(M.scaffold(m, ['usa-tilt'], 'html').code);
    expect(r.fixes).toEqual([]);
    expect(r.valid).toBe(true);
  });
});

describe('13.7 generated examples (scripts/mcp-examples.mjs)', async () => {
  const { generateExamples } = await import('../scripts/mcp-examples.mjs');
  const set = generateExamples(m);
  it('every component in every framework, labelled with the environment it needs', () => {
    expect(set.length).toBe(m.components.length * 7);
    expect(set.filter((x: any) => x.environment !== 'browser').every((x: any) => x.environment.startsWith('needs-peer:'))).toBe(true);
  });
  it('every html / esm example passes the static checks (peer-runtime scaffolds set the peer up)', () => {
    const bad = set.filter((x: any) => x.framework === 'html' || x.framework === 'esm').filter((x: any) => {
      const v = M.validateSnippet(m, x.code);
      return !v.valid;
    }).map((x: any) => `${x.id}: ${M.validateSnippet(m, x.code).errors.join(' | ')}`);
    expect(bad).toEqual([]);
  });
  it('inline scripts of the examples parse, have no placeholder "…" and no bare motionary/ imports in CDN pages', () => {
    const bad: string[] = [];
    for (const c of m.components) {
      for (const [, attrs, body] of String(c.example).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/type=["'](?!module|text\/javascript)/.test(attrs)) continue;
        if (body.includes('…')) bad.push(`${c.tag}: … in script`);
        if (!/type=["']module/.test(attrs)) { try { new Function(body); } catch (e: any) { bad.push(`${c.tag}: ${e.message}`); } }
      }
      const page = M.scaffold(m, [c.tag], 'html').code;
      for (const [, body] of page.matchAll(/<script\b[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)) if (/from\s*['"]motionary\//.test(body)) bad.push(`${c.tag}: bare import in CDN page`);
    }
    expect(bad).toEqual([]);
  });
  it('identifiers an example script calls methods on are declared in it (no implicit element globals)', () => {
    const GLOBALS = new Set(['document', 'window', 'console', 'Math', 'JSON', 'customElements', 'navigator', 'performance', 'Promise', 'Object', 'Array', 'location', 'history', 'localStorage', 'e', 'motionClock', 'loadingBar', 'Motionary', 'MotionaryWidgets']);
    const bad: string[] = [];
    for (const c of m.components) for (const [, body] of String(c.example).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
      const declared = new Set([...body.matchAll(/\b(?:const|let|var|function|import)\s*(?:\{([^}]*)\}|\[([^\]]*)\]|(\w+))/g)].flatMap((x) => (x[1] || x[2] || x[3] || '').split(',').map((s) => s.trim().split(/\s+as\s+/).pop()!)));
      for (const [, id] of body.matchAll(/(?:^|[;{(\s])([a-zA-Z_$][\w$]*)\.[a-zA-Z_$]/g)) if (!declared.has(id) && !GLOBALS.has(id) && !/^[A-Z]/.test(id)) bad.push(`${c.tag}: ${id}`);
    }
    expect([...new Set(bad)]).toEqual([]);
  });
});

describe('13.7 gateway interop (docs/mcp-gateway-interop.md, scripts/gateway-interop.mjs)', () => {
  it('the doc names the gateway env values and the tool list the gateway e2e must expect', () => {
    const doc = readFileSync(join(ROOT, 'docs/mcp-gateway-interop.md'), 'utf8');
    expect(doc).toContain('MOTIONARY_VERSION=13.7.0');
    for (const t of M.TOOLS) expect(doc, t.name).toContain(t.name);
    expect(doc).toContain('npx @winstonsayno/mcp-gateway@latest');
  });
  it('the interop job installs the gateway only in CI (never a dependency)', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    for (const k of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) expect(Object.keys(pkg[k] || {})).not.toContain('@winstonsayno/mcp-gateway');
    const wf = readFileSync(join(ROOT, '.github/workflows/gateway-interop.yml'), 'utf8');
    expect(wf).toContain('scripts/gateway-interop.mjs');
  });
  it('16.2: the interop config uses gateway config schema v13 (Gateway 17.0 reads only v13; v12 and older are refused at start)', () => {
    expect(readFileSync(join(ROOT, 'scripts/gateway-interop.mjs'), 'utf8')).toContain("'version: 13'");
    expect(readFileSync(join(ROOT, 'docs/mcp-gateway-interop.md'), 'utf8')).toMatch(/^version: 13$/m);
    expect(readFileSync(join(ROOT, '.github/workflows/gateway-interop.yml'), 'utf8')).toMatch(/node-version: 24/);
  });
});
