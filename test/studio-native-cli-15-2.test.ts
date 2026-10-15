// 15.2: `npx motionary export --scene file.json --target compose|swiftui|arkts|css|wxss [--out f] [--report f]` — the CLI
// side of motionary/studio/native. Tests first: fails before bin/motionary.mjs knows --scene.
import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { main } from '../bin/motionary.mjs';
import * as N from '../src/components/studio/native';

const SCENE = { format: 'motionary-scene', version: 2, name: 'Fade', duration: 300, layers: [
  { id: 'a', type: 'track', target: '.a', keyframes: [{ id: 'k0', time: 0, props: { opacity: 0, filter: 'blur(2px)' } }, { id: 'k1', time: 300, props: { opacity: 1, filter: 'blur(0px)' } }] },
] };

describe('15.2 motionary export --scene', () => {
  const dir = mkdtempSync(join(tmpdir(), 'usa152-'));
  const scene = join(dir, 'fade.json');
  writeFileSync(scene, JSON.stringify(SCENE));

  it('writes the target file and the loss report; lost properties are printed, never silent', async () => {
    const out = join(dir, 'Fade.kt'), rep = join(dir, 'report.json');
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const rc = await main(['export', '--scene', scene, '--target', 'compose', '--out', out, '--report', rep], { native: N });
    expect(rc).toBe(0);
    expect(readFileSync(out, 'utf8')).toBe(N.exportNative(SCENE, { target: 'compose' }).code);
    const report = JSON.parse(readFileSync(rep, 'utf8'));
    expect(report.target).toBe('compose');
    expect(report.lost.map((l: any) => `${l.layer}:${l.prop}`)).toEqual(['a:filter']);
    expect(err.mock.calls.flat().join('\n')).toMatch(/lost.*a.*filter/i);
    err.mockRestore(); log.mockRestore();
  });

  it('--strict exits 1 when anything is lost; an unknown target exits 2 with the target list', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const w = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    expect(await main(['export', '--scene', scene, '--target', 'swiftui', '--strict'], { native: N })).toBe(1);
    expect(await main(['export', '--scene', scene, '--target', 'css', '--strict'], { native: N })).toBe(0);
    expect(await main(['export', '--scene', scene, '--target', 'flutter'], { native: N })).toBe(2);
    expect(err.mock.calls.flat().join('\n')).toMatch(/css, wxss, arkts, compose, swiftui/);
    expect(existsSync(join(dir, 'fade.swift'))).toBe(false);
    err.mockRestore(); w.mockRestore();
  });
});
