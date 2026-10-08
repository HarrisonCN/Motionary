import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { installComponentMocks, mount } from './components-setup';
import { configureComponents } from '../src/components/base';
import { setMotionIntensity, restoreMotionIntensity, definePageComponents } from '../src/components/page';
import { baselineReport, warnBaseline } from '../src/components/a11y';
import { defineTimeline } from '../src/components/timeline';
// @ts-ignore - untyped .mjs
import { transform, run } from '../bin/usa-codemod-5.mjs';

const root = resolve(__dirname, '..');

describe('5.0 deprecation warnings (4.9)', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    installComponentMocks();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    configureComponents({ motionIntensity: 'normal', reducedMotion: 'user' });
    warn.mockRestore();
    localStorage.clear();
  });
  const said = (s: string) => warn.mock.calls.some((c: unknown[]) => String(c[0]).includes(s));

  it("warns once for motionIntensity 'off', reducedMotion 'no-preference' and setMotionIntensity('off')", () => {
    configureComponents({ motionIntensity: 'off' });
    configureComponents({ motionIntensity: 'off' });
    configureComponents({ reducedMotion: 'no-preference' });
    setMotionIntensity('off');
    expect(said("motionIntensity: 'off' is deprecated")).toBe(true);
    expect(said("reducedMotion: 'no-preference' is deprecated")).toBe(true);
    expect(said("setMotionIntensity('off') is deprecated")).toBe(true);
    expect(warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes("motionIntensity: 'off'")).length).toBe(1);
  });

  it('the motion switch and restoring a saved level stay silent', () => {
    definePageComponents();
    const sw = mount<any>('<usa-motion-switch></usa-motion-switch>');
    warn.mockClear();
    sw.value = 'off';
    localStorage.setItem('usa:motion', 'off');
    restoreMotionIntensity();
    expect(warn).not.toHaveBeenCalled();
  });

  it('<usa-timeline scrub="js"> warns', () => {
    defineTimeline();
    mount('<usa-timeline scrub="js"><p data-tl="fade">x</p></usa-timeline>');
    expect(said('scrub="js"> is deprecated')).toBe(true);
  });

  it('baselineReport lists required and progressive features', () => {
    const r = baselineReport();
    expect(r.filter((f) => f.required).map((f) => f.id)).toEqual(['custom-elements', 'web-animations', 'intersection-observer', 'resize-observer', 'adopted-stylesheets']);
    expect(Array.isArray(warnBaseline())).toBe(true);
  });
});

describe('usa-codemod-5', () => {
  it('rewrites every deprecated pattern', () => {
    const src = [
      "import { defineToggle, configureComponents, type ComponentsConfig } from 'use-scroll-animate/components/interaction';",
      "import { defineTokens } from 'use-scroll-animate/components/tokens';",
      "configureComponents({ motionIntensity: 'off', reducedMotion: \"no-preference\" });",
      "setMotionIntensity('off', true);",
      '<usa-timeline overlap="100" scrub="js"></usa-timeline>',
    ].join('\n');
    const { code, changes } = transform(src);
    expect(code).toContain("import { setMotionSensitivity } from 'use-scroll-animate/components/a11y';");
    expect(code).toContain("import { defineToggle } from 'use-scroll-animate/components/interaction';\nimport { configureComponents, type ComponentsConfig } from 'use-scroll-animate/components';");
    expect(code).toContain("import { defineTokens } from 'use-scroll-animate/components/tokens';");
    expect(code).toContain("configureComponents({ motionSensitivity: 'minimal', reducedMotion: \"user\" });");
    expect(code).toContain("setMotionSensitivity('minimal', true);");
    expect(code).toContain('<usa-timeline overlap="100" scrub smooth="0.1">');
    expect(changes).toHaveLength(6);
    expect(transform("import { defineToggle } from 'use-scroll-animate/components/interaction';").changes).toEqual([]);
  });

  it('CLI: dry run by default, --write applies', () => {
    const dir = mkdtempSync(join(tmpdir(), 'usa5-'));
    mkdirSync(join(dir, 'src'));
    const f = join(dir, 'src', 'app.ts');
    writeFileSync(f, "configureComponents({ motionIntensity: 'off' });\n");
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(run([join(dir, 'src')])).toEqual({ files: 1, edits: 1 });
    expect(readFileSync(f, 'utf8')).toContain("'off'");
    run(['--write', join(dir, 'src')]);
    expect(readFileSync(f, 'utf8')).toContain("motionSensitivity: 'minimal'");
    log.mockRestore();
  });

  it('is published as a bin with an upgrade guide', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    expect(pkg.bin['usa-codemod-5']).toBe('./bin/usa-codemod-5.mjs');
    expect(pkg.files).toContain('bin');
    expect(existsSync(resolve(root, 'docs/upgrading-5.md'))).toBe(true);
  });
});
