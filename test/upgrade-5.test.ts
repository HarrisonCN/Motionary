import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { installComponentMocks, mount } from './components-setup';
import { configureComponents, getMotionIntensity, prefersReducedMotion, MOTION_SCALE } from '../src/components/base';
import { setMotionIntensity, restoreMotionIntensity, definePageComponents, getMotionLevel } from '../src/components/page';
import { baselineReport, warnBaseline } from '../src/components/a11y';
import * as reveal from '../src/components/reveal';
// @ts-ignore - untyped .mjs
import { transform, run } from '../bin/usa-codemod-5.mjs';

const root = resolve(__dirname, '..');

describe('5.0 removals', () => {
  beforeEach(() => installComponentMocks());
  afterEach(() => {
    configureComponents({ motionIntensity: 'normal', reducedMotion: 'user', motionSensitivity: 'full' });
    localStorage.clear();
  });

  it("motionIntensity 'off' and reducedMotion 'no-preference' are gone (ignored at runtime)", () => {
    expect(Object.keys(MOTION_SCALE)).toEqual(['low', 'normal', 'high']);
    configureComponents({ motionIntensity: 'off' as any });
    expect(getMotionIntensity()).toBe('normal');
    configureComponents({ reducedMotion: 'reduce' });
    expect(prefersReducedMotion()).toBe(true);
    configureComponents({ reducedMotion: 'no-preference' as any });
    expect(prefersReducedMotion()).toBe(false); // treated as 'user' (OS says no preference in jsdom)
    setMotionIntensity('off' as any);
    expect(getMotionIntensity()).toBe('normal');
  });

  it("<usa-motion-switch> Off maps to sensitivity 'minimal', and a saved 'off' still restores", () => {
    definePageComponents();
    const sw = mount<any>('<usa-motion-switch></usa-motion-switch>');
    sw.value = 'off';
    expect(getMotionLevel()).toBe('off');
    expect(prefersReducedMotion()).toBe(true);
    sw.value = 'high';
    expect(prefersReducedMotion()).toBe(false);
    localStorage.setItem('usa:motion', 'off');
    restoreMotionIntensity();
    expect(getMotionLevel()).toBe('off');
  });

  it('category entries no longer re-export the shared config helpers', () => {
    expect((reveal as any).configureComponents).toBeUndefined();
    expect((reveal as any).prefersReducedMotion).toBeUndefined();
  });

  it('baselineReport lists required and progressive features', () => {
    const r = baselineReport();
    expect(r.filter((f) => f.required).map((f) => f.id)).toEqual(['custom-elements', 'web-animations', 'intersection-observer', 'resize-observer', 'adopted-stylesheets']);
    expect(Array.isArray(warnBaseline())).toBe(true);
  });
});

describe('usa-codemod-5', () => {
  it('rewrites every removed pattern', () => {
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
