// @vitest-environment node
import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { packageIssues } from '../scripts/check-pack.mjs';

it('accepts package bytes and file counts far above every historical reference', () => {
  expect(packageIssues({ size: 2 ** 40, unpackedSize: 2 ** 42, files: Array.from({ length: 10_000 }, (_, i) => ({ path: `dist/${i}.js` })) })).toEqual([]);
  expect(packageIssues({ size: 1, unpackedSize: 1, files: [{ path: 'dist/index.js.map' }] })).toHaveLength(1);
});

it('size:check reports above-reference builds successfully but still rejects missing outputs', () => {
  const root = mkdtempSync(resolve('test/.size-policy-'));
  try {
    mkdirSync(join(root, 'scripts'));
    copyFileSync('scripts/size.mjs', join(root, 'scripts/size.mjs'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module', exports: {} }));
    writeFileSync(join(root, 'size-budget.json'), JSON.stringify([{ name: 'fixture', file: 'fixture.js', limit: 1 }]));
    writeFileSync(join(root, 'fixture.js'), 'export const fixture = "a build above its old one-byte reference";');
    const run = () => spawnSync(process.execPath, ['scripts/size.mjs', '--check'], { cwd: root, encoding: 'utf8' });
    const measured = run();
    expect(measured.status, measured.stderr).toBe(0);
    expect(measured.stdout).toContain('above reference (informational)');
    rmSync(join(root, 'fixture.js'));
    const missing = run();
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain('configured build output is missing');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
