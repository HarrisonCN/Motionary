// 13.7.0 (written in 13.2, parked until 13.7): the MCP example regression set in real browsers — every component's generated HTML page and ESM module
// (scaffold_snippet / get_example) run through validate_snippet { browser: true } on the built package. Examples labelled
// needs-peer:<pkg> use an official runtime the offline browser cannot fetch; if they fail, it must be with that prerequisite named.
import { test, expect } from '@playwright/test';
import { loadManifest, validateSnippetInBrowser } from '../../bin/motionary-mcp.mjs';
import { generateExamples } from '../../scripts/mcp-examples.mjs';

const m = loadManifest();
const set = generateExamples(m).filter((x) => x.framework === 'html' || x.framework === 'esm');
const CHUNKS = 12;

for (let i = 0; i < CHUNKS; i++) {
  const part = set.filter((_, k) => k % CHUNKS === i);
  test(`MCP examples ${i + 1}/${CHUNKS} run clean (${part.length} snippets)`, async ({ browser, browserName }, info) => {
    // the generated examples are engine-independent markup + scripts: one engine (Chromium job) is the gate, phones skip
    test.skip(browserName !== 'chromium' || /mobile/.test(info.project.name), 'runs in the Chromium desktop project');
    test.setTimeout(part.length * 6_000 + 30_000);
    const fails = [];
    for (const x of part) {
      const v = await validateSnippetInBrowser(m, x.code, { browser });
      expect(v.mount.mounted, x.id).toBe(true);
      if (x.environment.startsWith('needs-peer:')) {
        const pk = x.environment.slice(11);
        // an optional runtime (e.g. draco3d for compressed glTF) may not be needed to mount; if the run fails, it must be for that peer
        if (!v.valid && !v.errors.concat(v.warnings).some((e) => e.includes(pk))) fails.push(`${x.id}: failed without naming the missing ${pk}: ${v.errors.join(' | ')}`);
        continue;
      }
      if (!v.valid) fails.push(`${x.id}: ${v.errors.join(' | ')}`);
      const notUp = v.mount.components.filter((c) => !c.upgraded).map((c) => c.tag);
      if (notUp.length) fails.push(`${x.id}: not upgraded ${notUp.join(', ')}`);
    }
    expect(fails).toEqual([]);
  });
}
