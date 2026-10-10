// 12.4: component playground — a runnable page per component.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { runnablePage, scriptsFor, depsLabel, esmSnippet } from '../showcase/runnable.js';

const read = (f: string) => readFileSync(f, 'utf8');

const { buildManifest } = await import('../scripts/gen-manifest.mjs');
const m = buildManifest();
const major = String(m.version).split('.')[0];

describe('12.4 runnable pages', () => {
  it('every component yields a complete page with its example and bundle', () => {
    for (const c of m.components) {
      const p = runnablePage(c, { version: m.version });
      expect(p.startsWith('<!doctype html>'), c.tag).toBe(true);
      expect(p, c.tag).toContain(c.example);
      expect(p, c.tag).toContain(`<script src="${c.cdn}"></script>`);
      expect(p, c.tag).toContain(depsLabel(c));
      expect(c.cdn, c.tag).toContain(`motionary@${major}/`);
    }
  });
  it('prerequisites load before the component bundle, in manifest order', () => {
    const snap = m.components.find((c: any) => c.tag === 'usa-snap-carousel');
    const s = scriptsFor(snap);
    const core = s.findIndex((u: string) => u.endsWith('/runtime.iife.js')), mod = s.findIndex((u: string) => u.endsWith('/runtime/drag-snap.iife.js')), bundle = s.indexOf(snap.cdn);
    expect(core).toBeGreaterThan(-1);
    expect(core).toBeLessThan(mod);
    expect(mod).toBeLessThan(bundle);
    expect(depsLabel(snap)).toBe(`Requires: motionary/runtime/drag-snap · ${snap.tier} tier`);
    const plain = m.components.find((c: any) => !c.requires.length);
    expect(depsLabel(plain)).toBe(`No prerequisites · ${plain.tier} tier`);
    expect(scriptsFor(plain)).toEqual([plain.cdn]);
  });
  it('previews swap the CDN for a local dist/; npm snippet keeps the register order', () => {
    const snap = m.components.find((c: any) => c.tag === 'usa-snap-carousel');
    const p = runnablePage(snap, { base: '/dist/' });
    expect(p).toContain('<script src="/dist/runtime.iife.js"></script>');
    expect(p).not.toMatch(/motionary@\d+\/dist/);
    expect(esmSnippet(snap)).toContain('use(dragSnap);');
    expect(esmSnippet(m.components.find((c: any) => !c.requires.length))).toContain('// npm i motionary');
  });
  it('page wiring', () => {
    const h = read('showcase/run.html');
    expect(h).toContain("from './runnable.js'");
    expect(h).toContain('sandbox="allow-scripts"');
    expect(h).toContain("fetch('../dist/manifest.json')");
    expect(read('showcase/components.html')).toContain('href="./run.html"');
    expect(read('README.md')).toContain('showcase/run.html');
  });
});
