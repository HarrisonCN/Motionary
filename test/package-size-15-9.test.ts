// 15.9 package size: the new motionary/scene/v3-preview entry + v16 docs must fit under the unchanged 14 MB unpacked
// npm limit (15.9 measured 14.07 MB before this change). Genuine reduction first, no limit raise: dist/llms-full.txt
// (~165 KB) is the same generated reference as docs/components/*.md + the runtime docs, published on Pages
// (https://harrisoncn.github.io/Motionary/llms-full.txt, which AGENTS.md / ai-prompt-guide.md point to); it stays in
// the build (Pages copies dist/) but leaves the npm tarball. dist/llms.txt (the MCP resource) stays packed.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('15.9 package size', () => {
  it('dist/llms-full.txt is excluded from the npm files list; llms.txt and docs/components stay', () => {
    const files: string[] = JSON.parse(readFileSync('package.json', 'utf8')).files;
    expect(files).toContain('!dist/llms-full.txt');
    expect(files).not.toContain('!dist/llms.txt');
    expect(files).toContain('docs');
    expect(files).toContain('dist');
  });
  it('the unpacked limit is unchanged (14 MB) and Pages still gets llms-full.txt from the build', () => {
    expect(readFileSync('scripts/check-pack.mjs', 'utf8')).toContain('unpacked: 14 * 1024 * 1024');
    expect(readFileSync('scripts/gen-manifest.mjs', 'utf8')).toMatch(/llms-full\.txt/);
    if (existsSync('dist/llms-full.txt')) expect(readFileSync('dist/llms-full.txt', 'utf8')).toMatch(/full component reference/);
    expect(readFileSync('AGENTS.md', 'utf8')).toContain('https://harrisoncn.github.io/Motionary/llms-full.txt');
  });
});
