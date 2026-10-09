// 11.2: source-map strategy (docs/source-maps.md).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { rewriteMapUrl, mapBase, MAP_REPO } from '../scripts/sourcemap-urls.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));

describe('11.2: source maps stay out of the npm package', () => {
  it('files excludes dist/**/*.map; the build rewrites map URLs; check:pack runs in CI', () => {
    expect(pkg.files).toContain('dist');
    expect(pkg.files).toContain('!dist/**/*.map');
    expect(pkg.scripts.build.endsWith('&& node scripts/sourcemap-urls.mjs')).toBe(true);
    expect(pkg.scripts['check:pack']).toBe('node scripts/check-pack.mjs');
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toMatch(/npm run check:pack/);
    expect(ci.indexOf('npm run check:pack')).toBeGreaterThan(ci.indexOf('npm run build'));
  });
  it('check:pack has fixed limits and refuses .map files', () => {
    const s = read('scripts/check-pack.mjs');
    expect(s).toMatch(/PACK_LIMITS = \{ packed: 4\.0 \* 1024 \* 1024, unpacked: 14 \* 1024 \* 1024, files: 2300 \}/);
    expect(s).toMatch(/endsWith\('\.map'\)/);
  });
});

describe('11.2: sourceMappingURL points at the release tag', () => {
  it('relative URLs become raw.githubusercontent.com/<repo>/v<version>/<path>', () => {
    expect(MAP_REPO).toBe('https://raw.githubusercontent.com/HarrisonCN/Motionary');
    expect(mapBase('11.2.0')).toBe('https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/');
    expect(rewriteMapUrl('code();\n//# sourceMappingURL=index.js.map', 'dist/index.js', '11.2.0'))
      .toBe('code();\n//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/index.js.map');
    expect(rewriteMapUrl('x\n//# sourceMappingURL=base-Ab1.js.map\n', 'dist/chunks/base-Ab1.js', '11.2.0'))
      .toBe('x\n//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/chunks/base-Ab1.js.map');
    expect(rewriteMapUrl('y\n//# sourceMappingURL=gl.iife.js.map', 'dist/runtime/gl.iife.js', '11.2.0'))
      .toMatch(/\/v11\.2\.0\/dist\/runtime\/gl\.iife\.js\.map$/);
  });
  it('is idempotent and leaves absolute / data URLs and code alone', () => {
    const abs = 'z\n//# sourceMappingURL=https://example.com/a.js.map';
    expect(rewriteMapUrl(abs, 'dist/a.js', '11.2.0')).toBe(abs);
    const data = 'z\n//# sourceMappingURL=data:application/json;base64,e30=';
    expect(rewriteMapUrl(data, 'dist/a.js', '11.2.0')).toBe(data);
    expect(rewriteMapUrl('no map here', 'dist/a.js', '11.2.0')).toBe('no map here');
    const once = rewriteMapUrl('q\n//# sourceMappingURL=a.js.map', 'dist/a.js', '11.2.0');
    expect(rewriteMapUrl(once, 'dist/a.js', '11.2.0')).toBe(once);
  });
});

describe('11.2: docs', () => {
  it('docs/source-maps.md has the measurements; README and ROADMAP link it', () => {
    const d = read('docs/source-maps.md');
    expect(d).toMatch(/6\.33 MB/);
    expect(d).toMatch(/3\.28 MB/);
    expect(d).toMatch(/raw\.githubusercontent\.com\/HarrisonCN\/Motionary\/v/);
    expect(read('README.md')).toMatch(/docs\/source-maps\.md/);
    expect(read('docs/ROADMAP.md')).toMatch(/✅ \*\*v11\.2 — /);
  });
});
