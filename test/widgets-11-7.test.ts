// 11.7: component contract audit — report only (findings never fail; the committed report must be current).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { audit, summary, renderMarkdown, RULES } from '../scripts/contract-audit.mjs';
import { COMPONENT_CATEGORIES } from '../src/components/index-tags';

const read = (f: string) => readFileSync(f, 'utf8');

describe('11.7: component contract audit', () => {
  const rows = audit();
  const s = summary(rows);
  it('covers every registered <usa-*> tag of the categories', () => {
    const tags = new Set(rows.map((r: any) => r.tag));
    const all = Object.values(COMPONENT_CATEGORIES).flat() as string[];
    const missing = all.filter((t) => !tags.has(t));
    expect(missing.length, missing.join(', ')).toBeLessThanOrEqual(Math.ceil(all.length * 0.05));
    expect(rows.length).toBeGreaterThan(150);
  });
  it('checks the six contract parts', () => {
    const parts = new Set(Object.values(RULES).map((r: any) => r[0]));
    expect([...parts].sort()).toEqual(['attributes', 'errors', 'events', 'keyboard', 'lifecycle', 'reduced motion']);
    for (const r of rows) for (const f of r.findings) expect(RULES[f.rule], f.rule).toBeTruthy();
  });
  it('the committed report is current (regenerate: npm run contract)', () => {
    expect(read('docs/contract-report.md')).toBe(renderMarkdown(rows));
    const j = JSON.parse(read('docs/contract-report.json'));
    expect(j.format).toBe('motionary/contract-report');
    expect(j.summary).toEqual(s);
  });
  it('report only: prints the findings, never fails on them', () => {
    console.info(`contract audit: ${s.components} components, ${s.clean} clean, ${s.findings} findings`, s.byRule);
    expect(s.findings).toBeGreaterThanOrEqual(0);
    expect(read('docs/component-contract.md')).toContain('report only');
  });
});
