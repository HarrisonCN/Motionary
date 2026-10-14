// 14.8.0: Studio templates (motionary/studio/templates) in a real browser — install a shipped template into an editor
// history, render its preview (the 14.7 export, one inline file without scripts) in a sandboxed iframe with no network,
// read the frozen frame and compare it with the reference (`sampleTimelineDoc` at the manifest's preview time), then
// uninstall and get the original project bytes back. A tampered template is refused before anything renders.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TP = await import(pathToFileURL(join(ROOT, 'dist/components/studio-templates.js')).href);
const T = await import(pathToFileURL(join(ROOT, 'dist/components/timeline-editor.js')).href);
const S = await import(pathToFileURL(join(ROOT, 'dist/components/studio.js')).href);
const read = (id) => readFileSync(join(ROOT, `templates/${id}.motionary-template.json`), 'utf8');

async function offline(page) {
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(String(e && e.message)));
  page.__requests = [];
  await page.route(/^https?:\/\//, (r) => { page.__requests.push(r.request().url()); return r.abort(); });
}

/** Mount the preview in an iframe (sandbox without scripts) and compare the frozen frame with the reference values. */
async function framed(page, html, sandbox, frame, checks) {
  await page.setContent('<!doctype html><html><body><iframe id="f" style="width:600px;height:400px"></iframe></body></html>');
  await page.evaluate(({ html, sandbox }) => new Promise((r) => {
    const f = document.getElementById('f');
    f.setAttribute('sandbox', sandbox);
    f.onload = () => r();
    f.srcdoc = html;
  }), { html, sandbox });
  return page.evaluate(({ frame, checks }) => {
    const d = document.getElementById('f').contentDocument;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden';
    document.body.appendChild(probe);
    const nums = (s) => (String(s).match(/-?\d*\.?\d+(e[-+]?\d+)?/gi) || []).map(Number);
    const close = (a, b) => { const x = nums(a), y = nums(b); return x.length === y.length && x.every((v, i) => Math.abs(v - y[i]) <= 0.003 * Math.max(1, Math.abs(y[i]))); };
    const bad = [];
    for (const [id, sel, props] of checks) {
      const el = d.querySelector(sel);
      if (!el) { bad.push(`missing ${sel}`); continue; }
      for (const p of props) {
        probe.style.setProperty(p, String(frame.layers[id][p]));
        const want = getComputedStyle(probe).getPropertyValue(p), got = d.defaultView.getComputedStyle(el).getPropertyValue(p);
        if (!close(got, want)) bad.push(`${sel} ${p}: ${got} vs ${want}`);
        probe.style.removeProperty(p);
      }
    }
    return { bad, scripts: d.querySelectorAll('script').length, animations: d.getAnimations().length };
  }, { frame, checks });
}

test('install a shipped template → sandboxed preview equals the reference at the preview time → uninstall restores the bytes', async ({ page }) => {
  await offline(page);
  const r = TP.parseTemplate(read('fade-up-hero'));
  expect(r.errors).toEqual([]);
  expect(r.info).toMatchObject({ id: 'fade-up-hero', license: 'MIT', requires: ['motionary/studio'] });
  const host = T.createTimelineDoc({ name: 'page', layers: [{ id: 'h', type: 'track', target: 'h1', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 200, props: { opacity: 1 } }] }] });
  const history = T.createTimelineHistory(host);
  const before = S.serializeStudioProject(history.doc);
  const ins = TP.installTemplate(history, r.template);
  expect(ins.ok).toBe(true);
  expect(history.size).toBe(1);
  expect([...ins.files.keys()]).toEqual(['templates/fade-up-hero/img/dots.svg']);

  const p = TP.previewTemplate(r.template);
  expect(p.sandbox).toBe('');
  expect(p.html).not.toMatch(/<script/i);
  const ref = T.sampleTimelineDoc(r.doc, p.time);
  // read the frame through a frame that runs no scripts (allow-same-origin only, so the test page can inspect it)
  const res = await framed(page, p.html, 'allow-same-origin', ref, [['title', '#hero-title', ['opacity', 'transform']], ['sub', '#hero-sub', ['opacity', 'transform']], ['bg', '#hero-bg', ['opacity']]]);
  expect(res.bad).toEqual([]);
  expect(res.scripts).toBe(0);
  expect(res.animations).toBe(3);
  // the installed layers sample like the template's own (ids prefixed)
  expect(T.sampleTimelineDoc(history.doc, p.time).layers['fade-up-hero--title']).toEqual(ref.layers.title);

  const un = TP.uninstallTemplate(history, 'fade-up-hero');
  expect(un.ok).toBe(true);
  expect(S.serializeStudioProject(history.doc)).toBe(before);
  expect(page.__requests).toEqual([]);
  expect(page.__errors).toEqual([]);
});

test('every shipped template previews without scripts in a sandbox="" frame (no errors, no requests)', async ({ page }) => {
  await offline(page);
  const index = JSON.parse(readFileSync(join(ROOT, 'templates/index.json'), 'utf8'));
  for (const t of index.templates) {
    const p = TP.previewTemplate(read(t.id));
    expect(p.report.ok, t.id).toBe(true);
    await page.setContent(`<!doctype html><html><body><iframe sandbox="" id="f"></iframe></body></html>`);
    await page.evaluate((html) => new Promise((r) => { const f = document.getElementById('f'); f.onload = () => r(); f.srcdoc = html; }), p.html);
  }
  expect(page.__requests).toEqual([]);
  expect(page.__errors).toEqual([]);
});

test('a tampered template is refused before anything renders, and the project is unchanged', async () => {
  const t = JSON.parse(read('stagger-cards'));
  t.manifest.license = 'GPL-3.0-only';
  const history = T.createTimelineHistory(T.createTimelineDoc({ layers: [] }));
  const before = S.serializeStudioProject(history.doc);
  const ins = TP.installTemplate(history, t);
  expect(ins.ok).toBe(false);
  expect(ins.errors.map((e) => e.reason)).toContain('integrity');
  expect(() => TP.previewTemplate(t)).toThrow(/integrity/);
  expect(S.serializeStudioProject(history.doc)).toBe(before);
  expect(history.size).toBe(0);
});
