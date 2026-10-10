// 13.1.0: lifecycle sweep for EVERY public component in the AI manifest, in Chromium, Firefox and WebKit.
// For each <usa-*> element, registered through its own manifest snippet and mounted from its documented example:
//   connect → disconnect: nothing left behind — no listener on window / document / <html> / <body>, no interval, no
//                         observer still watching a detached node, no requestAnimationFrame loop, no live WebGL context
//   reconnect:            the element re-mounts to the same structure (no duplicated wrappers / indicators / styles)
//   attributes:           every documented attribute can be set to an invalid value and back without an uncaught error,
//                         and the element ends in the structure it started with (re-mount on change is idempotent)
// Components that need something the suite cannot provide offline are listed in docs/browser-matrix.md (SKIP below).
import { test, expect } from '@playwright/test';
import { manifest, openFixture, define, exampleOf, expectNoErrors } from './helpers.mjs';

// external peer from a CDN (the suite has no network): covered by unit tests + the playground
export const SKIP = { 'usa-rive': 'needs @rive-app/canvas from npm/CDN (optional peer, not installed offline)' };

const wait = (page, ms) => page.waitForTimeout(ms);

async function signature(page) {
  return page.evaluate(() => {
    const out = [];
    for (const host of document.querySelectorAll('#stage *')) {
      if (!host.localName.startsWith('usa-')) continue;
      const kids = (root) => [...root.children].map((c) => c.localName + (c.className && typeof c.className === 'string' ? '.' + c.className.trim().split(/\s+/).sort().join('.') : '')).sort().join(',');
      out.push(`${host.localName}[${kids(host)}]` + (host.shadowRoot ? `{${kids(host.shadowRoot)}}` : ''));
    }
    return out;
  });
}

async function leaks(page, base, ctxFrom) {
  return page.evaluate(({ base, ctxFrom }) => {
    const s = window.__probe.snapshot();
    const extra = s.listenerTypes.slice();
    for (const t of base.listenerTypes) { const i = extra.indexOf(t); if (i >= 0) extra.splice(i, 1); }
    return { listeners: extra, intervals: s.intervals - base.intervals, observersOnDetached: s.observersOnDetached, webgl: window.__probe.leakedContexts(ctxFrom) };
  }, { base, ctxFrom });
}

async function rafAfter(page, ms = 400) {
  await page.evaluate(() => window.__probe.resetRaf());
  await wait(page, ms);
  return page.evaluate(() => window.__probe.rafCount());
}

const CLEAN = { listeners: [], intervals: 0, observersOnDetached: [], webgl: [] };

for (const c of manifest.components) {
  test(`lifecycle ${c.tag}`, async ({ page }, info) => {
    test.skip(!!SKIP[c.tag], SKIP[c.tag]);
    await openFixture(page);
    await define(page, c.tag);
    const base = await page.evaluate(() => window.__probe.snapshot());
    const ctxFrom = await page.evaluate(() => window.__probe.contextCount());
    // the example is wrapped so it can be detached and re-attached as one node
    await page.evaluate((html) => {
      const w = document.createElement('div');
      w.id = 'wrap';
      w.innerHTML = html;
      document.getElementById('stage').append(w);
      window.__wrap = w;
    }, /<usa-/.test(exampleOf(c.tag)) ? exampleOf(c.tag) : `<${c.tag}></${c.tag}>`); // script-only examples (loadingBar.track())
    await wait(page, 350);
    const first = await signature(page);
    expect(first.length, 'example mounts at least one usa-* element').toBeGreaterThan(0);

    // disconnect
    await page.evaluate(() => window.__wrap.remove());
    await wait(page, 250);
    expect.soft(await leaks(page, base, ctxFrom), 'resources after disconnect').toEqual(CLEAN);
    expect.soft(await rafAfter(page), 'requestAnimationFrame calls while disconnected').toBe(0);

    // reconnect
    await page.evaluate(() => document.getElementById('stage').append(window.__wrap));
    await wait(page, 350);
    expect.soft(await signature(page), 'structure after reconnect').toEqual(first);

    // dynamic attributes: invalid value, then back to the original
    const attrs = c.attributes || [];
    if (attrs.length) {
      await page.evaluate(async (attrs) => {
        const el = window.__wrap.querySelector('*') && [...window.__wrap.querySelectorAll('*')].find((n) => n.localName.startsWith('usa-'));
        for (const a of attrs) {
          const was = el.getAttribute(a);
          el.setAttribute(a, 'x-invalid-%');
          await new Promise((r) => setTimeout(r, 20));
          if (was === null) el.removeAttribute(a); else el.setAttribute(a, was);
          await new Promise((r) => setTimeout(r, 20));
        }
      }, attrs);
      await wait(page, 900); // let one-shot effects (e.g. the presence ripple, 700 ms) finish and remove themselves
      expect.soft(await signature(page), 'structure after attribute round-trips').toEqual(first);
    }

    // disconnect again: still clean after reconnect + updates
    await page.evaluate(() => window.__wrap.remove());
    await wait(page, 250);
    expect.soft(await leaks(page, base, ctxFrom), 'resources after second disconnect').toEqual(CLEAN);
    expect.soft(await rafAfter(page), 'requestAnimationFrame calls after second disconnect').toBe(0);
    expectNoErrors(page, c.tag);
  });
}
