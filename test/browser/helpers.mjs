// 13.1.0: shared helpers for the Playwright browser suite.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect } from '@playwright/test';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const manifest = JSON.parse(readFileSync(ROOT + 'dist/manifest.json', 'utf8'));
export const byTag = Object.fromEntries(manifest.components.map((c) => [c.tag, c]));
const PROBE = readFileSync(new URL('./probe.js', import.meta.url), 'utf8');

/** The module code that registers `tag` exactly as the manifest documents it (prerequisites first). */
export function registerCode(tag) {
  const c = byTag[tag];
  if (!c) throw new Error('not in manifest: ' + tag);
  const code = c.prerequisites?.importAndRegister || c.esm;
  return code.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** The documented example markup for `tag`; photo URLs (before.jpg, photo.jpg …) point at the fixture's own PNG. */
export const exampleOf = (tag) => (byTag[tag].prerequisites?.example || byTag[tag].example).replace(/(src|poster)="(?!\/__img)[^"]*\.(jpe?g|png|webp|gif|avif)"/g, '$1="/__img.png"');

/** Open the fixture page with the resource probe installed; collects uncaught errors in `page.__errors`. */
export async function openFixture(page, { reducedMotion = 'no-preference' } = {}) {
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(String(e && e.message)));
  // no network beyond the fixture server: components that would fetch remote assets must fail soft
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript(PROBE);
  await page.goto('/__fixture.html');
}

/** Register components through their manifest snippets (one module per tag). */
export async function define(page, ...tags) {
  for (const tag of tags) {
    await page.evaluate(async ({ code, tag }) => {
      const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      try { await import(url); } finally { URL.revokeObjectURL(url); }
      await customElements.whenDefined(tag);
    }, { code: registerCode(tag), tag });
  }
}

/** Put `html` into #stage and wait for two frames. */
export async function mount(page, html) {
  await page.evaluate(async (html) => {
    document.getElementById('stage').innerHTML = html;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, html);
}

export const frames = (page, n = 2) => page.evaluate((n) => new Promise((r) => { let i = 0; const f = () => (++i >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

/** Fails on uncaught page errors seen so far. */
export function expectNoErrors(page, what = '') {
  expect(page.__errors, `uncaught errors ${what}`).toEqual([]);
}

/** Tab until document.activeElement (deep, through shadow roots) matches `pred`. */
export async function activeInfo(page) {
  return page.evaluate(() => {
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    if (!a) return null;
    return { tag: a.localName, text: (a.textContent || '').trim().slice(0, 40), role: a.getAttribute('role'), id: a.id, label: a.getAttribute('aria-label'), host: a.getRootNode().host?.localName || null };
  });
}
