// 15.3 acceptance: a breakpoint variant + sensitivity plays the same in the Studio app, the 14.7 standalone export and
// the 15.2 native export, because all three read the one document resolveVariant returns. Plus the package entry.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveVariant } from '../src/components/studio/a11y';
import { createStudioApp } from '../src/components/studio/app';
import { frameDigest } from '../src/components/studio/export';
import { exportNative } from '../src/components/studio/native';

const DOC = {
  format: 'motionary-scene', version: 2, name: 'Hero', duration: 800,
  layers: [
    { id: 'title', type: 'track', target: '#t', keyframes: [
      { id: 't0', time: 0, props: { opacity: 0, transform: 'translateY(40px)' } }, { id: 't1', time: 800, props: { opacity: 1, transform: 'translateY(0px)' } }] },
    { id: 'bg', type: 'track', target: '#hero', keyframes: [
      { id: 'b0', time: 0, props: { transform: 'translateX(-200px)' } }, { id: 'b1', time: 800, props: { transform: 'translateX(0px)' } }] },
  ],
  meta: { 'motionary:variants': [{ id: 'phone', media: { maxWidth: 600 }, layers: { bg: { muted: true } } }] },
};
const stage = () => { const s = document.createElement('div'); s.innerHTML = '<h2 id="t">Hi</h2><img id="hero">'; document.body.append(s); return s; };
const mount = () => { const r = document.createElement('div'); document.body.append(r); return r; };

describe('15.3 variants: Studio = standalone export = native export', () => {
  for (const ctx of [{ width: 360 }, { width: 768, sensitivity: 'gentle' as const }, { width: 1280, sensitivity: 'reduced' as const }]) {
    it(`width ${ctx.width}${ctx.sensitivity ? ' ' + ctx.sensitivity : ''}`, async () => {
      const doc = resolveVariant(DOC, ctx);
      const app = await createStudioApp(mount(), { stage: stage(), name: 'v' });
      const r = await app.open(doc);
      expect(r.ok).toBe(true);
      const d = await app.digest();
      expect(d).toBe(frameDigest(doc));
      expect((await app.exportStandalone({ inline: true })).report.digest).toBe(d);
      const layers = exportNative(doc, { target: 'css' }).report.supported.map((s) => s.layer);
      expect(layers.includes('bg')).toBe(ctx.width >= 600);
      app.destroy();
    });
  }
});

describe('15.3 package entry', () => {
  it('motionary/studio/a11y and motionary/components/studio-a11y with a size line', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./studio/a11y'].import.default).toBe('./dist/components/studio-a11y.js');
    expect(pkg.exports['./components/studio-a11y'].require.default).toBe('./dist/components/studio-a11y.cjs');
    expect(readFileSync('size-budget.json', 'utf8')).toMatch(/components\/studio-a11y/);
  });
});
