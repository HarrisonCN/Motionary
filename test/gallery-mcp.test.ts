import { expect, it } from 'vitest';
import { buildManifest } from '../scripts/gen-manifest.mjs';
import { findComponent, searchComponents, validateSnippet } from '../bin/motionary-mcp.mjs';

it('resolves every mo-* name and reports an unknown public tag', () => {
  const manifest = buildManifest();
  for (const c of manifest.components) expect(findComponent(manifest, c.tag.replace(/^usa-/, 'mo-'))?.tag).toBe(c.tag);
  expect(searchComponents(manifest, 'mo-download-menu')[0].tag).toBe('usa-download-menu');
  expect(validateSnippet(manifest, '<mo-unknown-widget></mo-unknown-widget>').errors.join(' ')).toContain('unknown component');
});
