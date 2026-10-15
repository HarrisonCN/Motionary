// 13.9.0 — `motionary migrate` (CLI over migrateToSceneV2): dry run by default, --diff, --report, --json,
// --out / --write (never overwrites the input), exit codes.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as scene from '../src/components/scene/index';
import { main } from '../bin/motionary.mjs';

const FIX = 'test/fixtures/scene-v2';
let dir = '';
let out: string[] = [];
let err: string[] = [];
const run = async (...argv: string[]) => main(['migrate', ...argv], { sceneV2: scene });

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'mig-'));
  for (const f of ['timeline-basic.json', 'player-keyframes.json', 'playground.json']) copyFileSync(join(FIX, f), join(dir, f));
  writeFileSync(join(dir, 'bad.json'), '{"format":"motionary-timeline","version":1,"layers":[{"id":"a","type":"nope"}]}');
  out = []; err = [];
  vi.spyOn(console, 'log').mockImplementation((...a) => { out.push(a.join(' ')); });
  vi.spyOn(console, 'error').mockImplementation((...a) => { err.push(a.join(' ')); });
  vi.spyOn(process.stdout, 'write').mockImplementation(((s: string) => { out.push(String(s)); return true; }) as any);
});
afterEach(() => { vi.restoreAllMocks(); rmSync(dir, { recursive: true, force: true }); });

describe('13.9 motionary migrate', () => {
  it('help lists the command', async () => {
    await main(['help'], {});
    expect(out.join('\n')).toMatch(/migrate <files…>.*--dry-run/s);
  });
  it('no arguments → usage, exit 2', async () => {
    expect(await run()).toBe(2);
    expect(err.join('\n')).toMatch(/usage: motionary migrate/);
  });
  it('default is a dry run: report printed, nothing written', async () => {
    const f = join(dir, 'timeline-basic.json');
    const before = readFileSync(f, 'utf8');
    expect(await run(f)).toBe(0);
    expect(out.join('\n')).toMatch(/motionary-timeline@1 → motionary-scene v2/);
    expect(out.join('\n')).toMatch(/dry run/);
    expect(readFileSync(f, 'utf8')).toBe(before);
    expect(existsSync(join(dir, 'timeline-basic.scene.json'))).toBe(false);
  });
  it('--write writes <name>.scene.json next to each input (the golden output), never the input', async () => {
    // 16.0: v3 is the default write format; --to-v2 keeps the v2 goldens (v3 output: scene-v3-major-16-0)
    expect(await run('--write', '--to-v2', join(dir, 'timeline-basic.json'), join(dir, 'player-keyframes.json'))).toBe(0);
    expect(readFileSync(join(dir, 'timeline-basic.scene.json'), 'utf8')).toBe(readFileSync(join(FIX, 'timeline-basic.scene.json'), 'utf8'));
    expect(readFileSync(join(dir, 'player-keyframes.scene.json'), 'utf8')).toBe(readFileSync(join(FIX, 'player-keyframes.scene.json'), 'utf8'));
    expect(readFileSync(join(dir, 'timeline-basic.json'), 'utf8')).toBe(readFileSync(join(FIX, 'timeline-basic.json'), 'utf8'));
  });
  it('--out <file> for a single input', async () => {
    const o = join(dir, 'x.json');
    expect(await run(join(dir, 'playground.json'), '--to-v2', '--out', o)).toBe(0);
    expect(scene.validateSceneV2(readFileSync(o, 'utf8'))).toEqual([]);
  });
  it('--out with several inputs → exit 2', async () => {
    expect(await run(join(dir, 'playground.json'), join(dir, 'timeline-basic.json'), '--out', join(dir, 'x.json'))).toBe(2);
  });
  it('--diff prints the structural changes', async () => {
    expect(await run('--diff', join(dir, 'timeline-basic.json'))).toBe(0);
    const t = out.join('\n');
    expect(t).toMatch(/~ format: "motionary-timeline" → "motionary-scene"/);
    expect(t).toMatch(/~ version: 1 → 2/);
    expect(t).toMatch(/\+ source:/);
  });
  it('--json prints machine-readable results', async () => {
    expect(await run('--json', join(dir, 'timeline-basic.json'), join(dir, 'bad.json'))).toBe(1);
    const j = JSON.parse(out.join(''));
    expect(j.map((r: any) => [r.ok, r.report.from])).toEqual([[true, 'motionary-timeline@1'], [false, 'motionary-timeline@1']]);
    expect(j[1].problems[0].path).toBe('layers[0].type');
  });
  it('an invalid input → exit 1 with the problems, other files still processed', async () => {
    expect(await run('--write', join(dir, 'bad.json'), join(dir, 'playground.json'))).toBe(1);
    expect(out.join('\n') + err.join('\n')).toMatch(/layers\[0\]\.type/);
    expect(existsSync(join(dir, 'bad.scene.json'))).toBe(false);
    expect(existsSync(join(dir, 'playground.scene.json'))).toBe(true);
  });
  it('a missing file → exit 1', async () => {
    expect(await run(join(dir, 'nope.json'))).toBe(1);
  });
  it('--tokenize is passed through', async () => {
    const f = join(dir, 'c.json');
    writeFileSync(f, JSON.stringify({ format: 'motionary-timeline', version: 1, layers: [{ id: 't', type: 'track', target: '.a', keyframes: [{ id: 'k', time: 0, props: { opacity: 0 }, easing: 'linear' }, { id: 'k2', time: 300, props: { opacity: 1 } }] }] }));
    expect(await run('--json', '--tokenize', f)).toBe(0);
    expect(JSON.parse(out.join(''))[0].ok).toBe(true);
  });
});
