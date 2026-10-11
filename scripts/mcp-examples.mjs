// 13.7.0: the generated-example set of the MCP server — every manifest component's scaffold_snippet output in every
// framework, labelled with the environment it needs. test/browser/mcp-examples.spec.mjs runs the html + esm ones in a
// real browser through validate_snippet { browser: true }; test/ai-tools-13-7.test.ts checks them all statically.
import { scaffold } from '../bin/motionary-mcp.mjs';

export const EXAMPLE_FRAMEWORKS = ['html', 'esm', 'react', 'vue', 'svelte', 'solid', 'angular'];

/** [{ id, tag, framework, code, environment: 'browser' | 'needs-peer:<pkg>' }] */
export function generateExamples(m, frameworks = EXAMPLE_FRAMEWORKS) {
  const peers = new Map((m.runtimeModules || []).filter((r) => r.kind === 'peer').map((r) => [r.id, r.label]));
  const out = [];
  for (const framework of frameworks) for (const c of m.components) {
    const peer = (c.requires || []).map((r) => peers.get(r) || (r.startsWith('@') ? r : null)).find(Boolean);
    out.push({ id: `${framework}:${c.tag}`, tag: c.tag, framework, code: scaffold(m, [c.tag], framework).code, environment: peer ? `needs-peer:${peer}` : 'browser' });
  }
  return out;
}
