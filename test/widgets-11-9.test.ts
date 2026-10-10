// 11.9: 12.0 prep — upgrading-12.md, usa-codemod-12 legacy event rules, doctor reports events, contract preview, ROADMAP.
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { LEGACY_EVENTS, EVENTS_REMOVED_IN, rewriteEvents, findDeprecated } from '../bin/public-paths.mjs';
import { transform } from '../bin/usa-codemod-12.mjs';
import { doctor } from '../bin/motionary.mjs';

const read = (f: string) => readFileSync(f, 'utf8');
const SRC = `audio.addEventListener('usa-beat', onBeat);\nplayer.addEventListener("usa-player-finish", done);\n<usa-player @usa-player-ready="r" (usa-story-step)="s" on:usa-audio-error={e}></usa-player>\n<div data-usa-beat="pulse"></div>\nimport { describeMotion } from 'motionary/components/ai';\n`;

describe('11.9: legacy event names → usa:* (removed in 12.0)', () => {
  it('the table matches the events 11.8 added', () => {
    expect(LEGACY_EVENTS).toEqual({ 'usa-beat': 'usa:beat', 'usa-audio-error': 'usa:audio-error', 'usa-player-ready': 'usa:ready', 'usa-player-finish': 'usa:finish', 'usa-story-step': 'usa:step' });
    expect(EVENTS_REMOVED_IN).toBe('12.0');
    expect(read('src/components/effects/audio.ts')).toContain("this.emit('beat', d)");
  });
  it('usa-codemod-12 rewrites listeners and bindings, not data-usa-* attributes; idempotent', () => {
    const { code, changes } = transform(SRC);
    expect(code).toContain("addEventListener('usa:beat'");
    expect(code).toContain('addEventListener("usa:finish"');
    expect(code).toContain('@usa:ready="r"');
    expect(code).toContain('(usa:step)="s"');
    expect(code).toContain('on:usa:audio-error={e}');
    expect(code).toContain('data-usa-beat="pulse"');
    expect(code).toContain("'motionary/tooling/ai'");
    expect(changes.length).toBe(6);
    expect(transform(code).changes).toEqual([]);
    expect(rewriteEvents('<usa-player-x>').hits).toEqual([]);
  });
  it('motionary doctor reports events and paths with the release that removes them', () => {
    const f = findDeprecated(SRC);
    expect(f.filter((x: any) => x.kind === 'event').map((x: any) => x.line)).toEqual([1, 2, 3, 3, 3]);
    expect(f.find((x: any) => x.kind === 'path').removedIn).toBe('13.0');
    const dir = mkdtempSync(join(tmpdir(), 'mdoc9-'));
    writeFileSync(join(dir, 'a.ts'), SRC);
    expect(doctor([dir]).length).toBe(6);
    const r = spawnSync(process.execPath, ['bin/motionary.mjs', 'doctor', dir], { encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('usa-beat  →  usa:beat  (removed in 12.0)');
  });
});

describe('11.9: docs and the 12.0 preview', () => {
  it('upgrading-12.md, ROADMAP and README', () => {
    const u = read('docs/upgrading-12.md');
    for (const s of ['usa:beat', 'usa:ready', 'usa:finish', 'usa:step', 'npx motionary doctor', 'npx usa-codemod-12 --write', '13.0']) expect(u).toContain(s);
    const m = read('docs/ROADMAP.md');
    expect(m).toContain('11.5 弃用的导入路径保留到 13.0');
    expect(m).toContain('upgrading-12.md');
    expect(read('README.md')).toContain('docs/upgrading-12.md');
  });
  it('contract --preview prints what 12.0 would block and exits 0', () => {
    const r = spawnSync(process.execPath, ['scripts/contract-audit.mjs', '--preview'], { encoding: 'utf8' });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/12\.0 preview: \d+ finding\(s\) would block/);
  });
});
