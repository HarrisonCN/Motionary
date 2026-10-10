// 12.0: unified component contract — blocking. Legacy event names removed; every element observes what it reads.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { audit, summary } from '../scripts/contract-audit.mjs';
import { RUNTIME_VERSION, RUNTIME_CDN } from '../src/runtime/registry';

const read = (f: string) => readFileSync(f, 'utf8');

describe('12.0: the component contract is blocking', () => {
  const rows = audit();
  const s = summary(rows);
  it('zero findings across every element', () => {
    const left = rows.flatMap((r: any) => r.findings.map((f: any) => `<${r.tag}> ${f.rule} ${f.detail}`));
    expect(left).toEqual([]);
    expect(s.components).toBeGreaterThan(200);
    expect(s.clean).toBe(s.components);
  });
  it('every exemption is documented with a reason', () => {
    for (const r of rows) for (const e of r.exempt) expect(e.reason.length, `${r.tag} ${e.rule}`).toBeGreaterThan(15);
    expect(rows.flatMap((r: any) => r.exempt).some((e: any) => e.rule === 'event-prefix')).toBe(false);
  });
  it('check:contract exits 0 now and runs in CI', () => {
    const r = spawnSync(process.execPath, ['scripts/contract-audit.mjs', '--check'], { encoding: 'utf8' });
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).toContain('0 findings');
    expect(read('.github/workflows/ci.yml')).toContain('npm run check:contract');
    expect(read('scripts/contract-audit.mjs')).toContain('return stale || s.findings ? 1 : 0');
  });
});

describe('12.0: legacy event names are gone', () => {
  it('only usa:* events are dispatched', () => {
    for (const f of ['src/components/effects/audio.ts', 'src/components/effects/player.ts', 'src/components/effects/story.ts']) {
      const src = read(f);
      expect(src, f).not.toMatch(/new CustomEvent\('usa-(beat|audio-error|player-ready|player-finish|story-step)'/);
    }
    expect(read('src/components/effects/audio.ts')).toContain("this.emit('beat', d)");
    expect(read('src/components/effects/player.ts')).toContain("onFinish: () => this.emit('finish'),");
    expect(read('src/components/effects/story.ts')).toContain("this.emit('step'");
  });
});

describe('12.0: major version wiring', () => {
  it('runtime version, CDN major, docs', () => {
    const MAJOR = JSON.parse(read('package.json')).version.split('.')[0]; // follows the current major (13.0 reuses this test)
    expect(Number(MAJOR)).toBeGreaterThanOrEqual(12);
    expect(RUNTIME_VERSION.split('.')[0]).toBe(MAJOR);
    expect(RUNTIME_CDN).toContain(`motionary@${MAJOR}/`);
    expect(read('README.md')).toContain(`https://unpkg.com/motionary@${MAJOR}/dist/index.umd.js`);
    expect(read('README.md')).not.toContain('motionary@11/');
    expect(read('docs/component-contract.md')).toContain('12.0 makes the contract blocking');
    expect(read('docs/upgrading-12.md')).toContain('`motionary@11/` → `motionary@12/`');
  });
});
