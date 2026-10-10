// 12.2: stronger MCP validation — validate_snippet { mount: true } mounts the markup in jsdom with real bundles.
import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { markupOf, listenedEvents, mountSnippet, LEGACY_EVENTS_12 } from '../bin/mcp-mount.mjs';
import { TOOLS } from '../bin/motionary-mcp.mjs';

const read = (f: string) => readFileSync(f, 'utf8');

describe('12.2 mount helpers (pure)', () => {
  it('markup: HTML keeps its children and drops scripts; ESM / JSX get one element per opening tag', () => {
    expect(markupOf('<usa-accordion><details><summary>A</summary></details></usa-accordion><script>alert(1)</script>')).toBe('<usa-accordion><details><summary>A</summary></details></usa-accordion>');
    expect(markupOf("import { defineTilt } from 'x';\nconst a = <usa-tilt max=\"12\" glare />;")).toBe('<usa-tilt max="12" glare></usa-tilt>');
  });
  it('listened events across frameworks', () => {
    const ev = listenedEvents("el.addEventListener('usa:change', f); <usa-audio @usa-beat=\"x\" (usa:step)=\"y\" on:usa:finish={z}>");
    expect(ev.sort()).toEqual(['usa-beat', 'usa:change', 'usa:finish', 'usa:step']);
    expect(LEGACY_EVENTS_12['usa-player-ready']).toBe('usa:ready');
  });
  it('without jsdom the mount is skipped, never fails', async () => {
    const r = await mountSnippet({ components: [] }, '<usa-tilt></usa-tilt>', { distDir: '/nope', loadJsdom: () => Promise.reject(new Error('missing')) });
    expect(r).toMatchObject({ mounted: false });
    expect(r.skipped).toContain('optional peer');
  });
  it('tool schema, optional peer, docs', () => {
    const t = TOOLS.find((x) => x.name === 'validate_snippet')!;
    expect((t.inputSchema.properties as any).mount).toMatchObject({ type: 'boolean', default: false });
    expect(t.description).toContain('never run');
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.peerDependenciesMeta.jsdom).toEqual({ optional: true });
    expect(pkg.dependencies).toBeUndefined();
    expect(read('docs/mcp.md')).toContain('## Mounted validation (12.2)');
  });
});

describe('12.2 validate_snippet { mount: true } over stdio', () => {
  it('mounts with real component code: clean snippet, legacy event, unknown usa:* event, missing prerequisite', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mcp122-'));
    const manifest = join(dir, 'manifest.json');
    writeFileSync(manifest, execFileSync(process.execPath, ['scripts/gen-manifest.mjs', '--stdout'], { maxBuffer: 64 << 20 }));
    const aiBundle = join(dir, 'ai.mjs');
    execFileSync('node_modules/.bin/esbuild', ['src/components/ai/index.ts', '--bundle', '--format=esm', `--outfile=${aiBundle}`, '--log-level=warning']);
    // a small "dist" with the real sources of four elements (built in a child process: esbuild refuses to run inside jsdom)
    const dist = join(dir, 'dist');
    const entry = ["import { defineAccordion } from './src/components/transitions/accordion';", "import { defineAudio } from './src/components/effects/audio';", "import { defineTilt } from './src/components/interaction/tilt';", "import { defineSnapCarousel } from './src/components/widgets/snap-carousel';", 'defineAccordion(); defineAudio(); defineTilt(); defineSnapCarousel();'].join('\n');
    const script = join(dir, 'build.mjs');
    writeFileSync(script, `import { build } from ${JSON.stringify(resolve('node_modules/esbuild/lib/main.js'))};
import { readFileSync } from 'node:fs'; import { join } from 'node:path';
await build({ stdin: { contents: ${JSON.stringify(entry)}, resolveDir: ${JSON.stringify(resolve('.'))}, loader: 'ts' }, bundle: true, format: 'iife', outfile: ${JSON.stringify(join(dist, 'components.umd.js'))}, logLevel: 'warning',
  plugins: [{ name: 'raw', setup(b) { b.onResolve({ filter: /\\.css\\?raw$/ }, (a) => ({ path: join(a.resolveDir, a.path.replace(/\\?raw$/, '')), namespace: 'raw' })); b.onLoad({ filter: /.*/, namespace: 'raw' }, (a) => ({ contents: readFileSync(a.path, 'utf8'), loader: 'text' })); } }] });`);
    execFileSync(process.execPath, [script]);
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
    const client = new Client({ name: 'motionary-test', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: ['bin/motionary-mcp.mjs'], env: { ...process.env, MOTIONARY_MANIFEST: manifest, MOTIONARY_AI: aiBundle, MOTIONARY_DIST: dist } as Record<string, string> }));
    const call = async (code: string, mount = true) => ((await client.callTool({ name: 'validate_snippet', arguments: { code, mount } })) as any).structuredContent;
    try {
      const ok = await call('<usa-accordion><details><summary>A</summary><p>x</p></details></usa-accordion>\n<usa-tilt max="12"></usa-tilt>\n<script>document.querySelector("usa-accordion").addEventListener("usa:toggle", () => {})</script>');
      expect(ok.mount).toMatchObject({ mounted: true, environment: 'jsdom' });
      expect(ok.mount.components).toEqual([{ tag: 'usa-accordion', defined: true, upgraded: true }, { tag: 'usa-tilt', defined: true, upgraded: true }]);
      expect(ok.errors).toEqual([]);
      expect(ok.valid).toBe(true);

      const legacy = await call('<usa-audio></usa-audio><script>document.querySelector("usa-audio").addEventListener("usa-beat", f); document.querySelector("usa-audio").addEventListener("usa:nope", f)</script>');
      expect(legacy.valid).toBe(false);
      expect(legacy.errors.join('\n')).toContain('event "usa-beat" was removed in 12.0 — listen to "usa:beat"');
      expect(legacy.warnings.join('\n')).toContain('no component in this snippet emits "usa:nope"');

      const prereq = await call('<usa-snap-carousel><div>1</div><div>2</div></usa-snap-carousel>');
      expect(prereq.mount.components[0]).toMatchObject({ tag: 'usa-snap-carousel', defined: true });
      expect(prereq.errors.concat(prereq.warnings).join('\n')).toContain('motionary/runtime/drag-snap');

      const stat = await call('<usa-tilt></usa-tilt>', false);
      expect(stat.mount).toBeUndefined();
    } finally {
      await client.close();
    }
  }, 180_000);
});
