// 13.3.0: phones — runs only in the mobile projects (playwright.config.mjs): `mobile-chrome` (Pixel 7: Chromium, touch,
// DPR 2.625) and `mobile-safari` (iPhone 14: WebKit, touch, DPR 3). Touch input, rotation, the soft keyboard (a
// controllable window.visualViewport — no engine opens a real keyboard headless), sheets / modals / toasts above the
// keyboard, canvas sizes under DPR > 1, and native-bridge message origin checks in a real engine. docs/mobile.md
import { test, expect } from '@playwright/test';
import { manifest, openFixture, define, mount, frames, expectNoErrors, exampleOf } from './helpers.mjs';

const LANDSCAPE = (vp) => ({ width: vp.height, height: vp.width });
const rotate = async (page, size) => {
  await page.setViewportSize(size);
  await page.evaluate(() => dispatchEvent(new Event('orientationchange')));
  await frames(page, 4);
};

/** Replace window.visualViewport with a controllable one before any page script runs; `__kb(px)` opens a "keyboard". */
const FAKE_VV = () => {
  const f = new EventTarget();
  Object.assign(f, { offsetTop: 0, offsetLeft: 0, scale: 1 });
  Object.defineProperty(f, 'width', { get: () => innerWidth });
  let kb = 0;
  Object.defineProperty(f, 'height', { get: () => innerHeight - kb });
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f });
  window.__kb = (px) => { kb = px; f.dispatchEvent(new Event('resize')); };
  addEventListener('resize', () => f.dispatchEvent(new Event('resize')));
};

/** A touch pointer gesture on `sel` (the browser would deliver these for a finger): down, moves by (dx, dy), then up or cancel. */
const touchDrag = (page, sel, dx, dy, end = 'pointerup') => page.evaluate(async ({ sel, dx, dy, end }) => {
  const t = document.querySelector(sel);
  const r = t.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + Math.min(r.height, 40) / 2;
  const o = { pointerId: 11, pointerType: 'touch', isPrimary: true, bubbles: true, composed: true, cancelable: true, button: 0, buttons: 1 };
  t.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: x, clientY: y }));
  for (let i = 1; i <= 8; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    t.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: x + (dx * i) / 8, clientY: y + (dy * i) / 8 }));
  }
  t.dispatchEvent(new PointerEvent(end, { ...o, buttons: 0, clientX: x + dx, clientY: y + dy }));
}, { sel, dx, dy, end });

const settle = (page, ms = 1200) => page.waitForTimeout(ms);
const rectOf = (page, sel) => page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height, vh: innerHeight, vw: innerWidth }; }, sel);

// Synthetic touch PointerEvents (dispatchEvent) are not "active pointers" to the engine, so setPointerCapture() throws
// NotFoundError for them; a real finger's pointer is active. Only that error is swallowed — a test artifact, not a fix.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const set = Element.prototype.setPointerCapture;
    Element.prototype.setPointerCapture = function (id) { try { return set.call(this, id); } catch (e) { if (e.name !== 'NotFoundError') throw e; } };
  });
});

test.describe('phone emulation', () => {
  test('runs as a phone: touch, coarse pointer, DPR > 1, narrow portrait viewport', async ({ page, browserName }) => {
    await openFixture(page);
    const env = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, touch: 'ontouchstart' in window, mtp: navigator.maxTouchPoints, dpr: devicePixelRatio, w: innerWidth, h: innerHeight }));
    expect(env.coarse).toBe(true);
    expect(env.touch).toBe(true);
    // Playwright's WebKit build reports navigator.maxTouchPoints = 0 even with hasTouch (touch events and pointer: coarse work)
    if (browserName !== 'webkit') expect(env.mtp).toBeGreaterThan(0);
    expect(env.dpr).toBeGreaterThan(1);
    expect(env.w).toBeLessThan(500);
    expect(env.h).toBeGreaterThan(env.w);
  });
});

test.describe('touch', () => {
  test('a tap toggles <usa-switch> (touch only, no mouse)', async ({ page }) => {
    await openFixture(page);
    await define(page, 'usa-switch');
    await mount(page, exampleOf('usa-switch'));
    const changes = await page.evaluate(() => { window.__c = 0; document.querySelector('usa-switch').addEventListener('usa:change', () => window.__c++); return 0; });
    const sw = page.locator('usa-switch[role="switch"]');
    const before = await sw.getAttribute('aria-checked');
    await sw.tap();
    await frames(page, 3);
    expect(await sw.getAttribute('aria-checked')).not.toBe(before);
    expect(await page.evaluate(() => window.__c)).toBe(changes + 1);
    expectNoErrors(page);
  });

  test('<usa-bottom-sheet>: dragging the handle down with a finger dismisses it; a cancelled touch springs back', async ({ page }) => {
    await openFixture(page);
    await define(page, 'usa-bottom-sheet');
    await mount(page, '<usa-bottom-sheet snap="0.5,0.9" label="Filters"><p>Filters</p></usa-bottom-sheet>');
    await page.evaluate(() => (document.querySelector('usa-bottom-sheet').open = true));
    await settle(page);
    const open = await rectOf(page, 'usa-bottom-sheet');
    // the browser takes the gesture over (pointercancel): the sheet returns to its snap point
    await touchDrag(page, 'usa-bottom-sheet .usa-sheet-handle', 0, 120, 'pointercancel');
    await settle(page);
    expect(Math.abs((await rectOf(page, 'usa-bottom-sheet')).top - open.top)).toBeLessThan(3);
    await touchDrag(page, 'usa-bottom-sheet .usa-sheet-handle', 0, open.vh * 0.6);
    await settle(page);
    expect(await page.evaluate(() => document.querySelector('usa-bottom-sheet').open)).toBe(false);
    expectNoErrors(page);
  });

  test('sheets: long content scrolls with a finger, the grab handles keep the drag', async ({ page }) => {
    await openFixture(page);
    await define(page, 'usa-bottom-sheet', 'usa-sheet');
    await mount(page, '<usa-bottom-sheet><div style="height:3000px">long</div></usa-bottom-sheet><usa-sheet id="s" side="bottom" label="S"><div style="height:3000px">long</div></usa-sheet>');
    await page.evaluate(() => { document.querySelector('usa-bottom-sheet').open = true; document.querySelector('usa-sheet').show(); });
    await settle(page);
    const ta = await page.evaluate(() => {
      const cs = (el) => el && getComputedStyle(el).touchAction;
      return { sheet: cs(document.querySelector('usa-bottom-sheet')), handle: cs(document.querySelector('.usa-sheet-handle')), body: cs(document.querySelector('usa-sheet .usa-ov-body')), grab: cs(document.querySelector('usa-sheet .usa-ov-grab')) };
    });
    expect(ta.sheet).toBe('pan-y');
    expect(ta.handle).toBe('none');
    expect(ta.body).not.toBe('none');
    expect(ta.grab).toBe('none');
  });
});

test.describe('rotation', () => {
  test('an open <usa-bottom-sheet> keeps its snap point and stays on screen when the phone rotates', async ({ page, viewport }) => {
    await openFixture(page);
    await define(page, 'usa-bottom-sheet');
    await mount(page, '<usa-bottom-sheet snap="0.5,0.92" start="0" label="Filters"><p>Filters</p></usa-bottom-sheet>');
    await page.evaluate(() => (document.querySelector('usa-bottom-sheet').open = true));
    await settle(page);
    for (const size of [LANDSCAPE(viewport), viewport]) {
      await rotate(page, size);
      await settle(page, 800);
      const r = await rectOf(page, 'usa-bottom-sheet');
      expect(r.height, `sheet height at ${size.width}×${size.height}`).toBeLessThanOrEqual(r.vh * 0.92 + 2);
      expect(Math.abs(r.vh - r.top - r.vh * 0.5), `visible part at ${size.width}×${size.height}`).toBeLessThan(4);
    }
    expectNoErrors(page);
  });

  test('<usa-pagination>: the ink stays on the current page after rotating (buttons change size under 420 px)', async ({ page, viewport }) => {
    await openFixture(page);
    await define(page, 'usa-pagination');
    await mount(page, '<usa-pagination total="20" page="3" siblings="1"></usa-pagination>');
    await rotate(page, LANDSCAPE(viewport));
    await settle(page, 600);
    const d = await page.evaluate(() => {
      const a = document.querySelector('.usa-pg-ink').getBoundingClientRect(), b = document.querySelector('[aria-current="page"]').getBoundingClientRect();
      return [Math.abs(a.left - b.left), Math.abs(a.width - b.width)];
    });
    expect(d[0]).toBeLessThan(2);
    expect(d[1]).toBeLessThan(2);
  });

  test('canvas components keep their canvas to the element box under DPR > 1, before and after rotating', async ({ page, viewport }) => {
    await openFixture(page);
    const tags = manifest.components.filter((c) => /canvas|webgl|gl-|shader|particles/i.test(c.tag + ' ' + (c.category || ''))).map((c) => c.tag).filter((t) => t !== 'usa-rive');
    const bad = [];
    for (const tag of tags) {
      await define(page, tag);
      await mount(page, exampleOf(tag));
      for (const size of [viewport, LANDSCAPE(viewport)]) {
        await rotate(page, size);
        await settle(page, 300);
        const r = await page.evaluate(() => {
          const host = document.getElementById('stage').firstElementChild;
          const hb = host.getBoundingClientRect();
          const big = [...host.querySelectorAll('canvas'), ...(host.shadowRoot ? host.shadowRoot.querySelectorAll('canvas') : [])].map((c) => c.getBoundingClientRect()).filter((b) => b.width > innerWidth + 1);
          return { host: hb.width, vw: innerWidth, big: big.length };
        });
        if (r.host > r.vw + 1 || r.big) bad.push(`${tag} @${size.width}: host ${Math.round(r.host)} px, oversized canvases ${r.big}`);
      }
      await rotate(page, viewport);
    }
    expect(bad).toEqual([]);
  });
});

test.describe('soft keyboard (visualViewport)', () => {
  test.beforeEach(async ({ page }) => { await page.addInitScript(FAKE_VV); });

  test('<usa-bottom-sheet> with a focused input stays above the keyboard', async ({ page }) => {
    await openFixture(page);
    await define(page, 'usa-bottom-sheet');
    await mount(page, '<usa-bottom-sheet snap="0.5,0.9" start="1" label="Search"><input id="q" aria-label="q"></usa-bottom-sheet>');
    await page.evaluate(() => (document.querySelector('usa-bottom-sheet').open = true));
    await settle(page);
    await page.focus('#q');
    await page.evaluate(() => window.__kb(300));
    await settle(page, 800);
    const r = await rectOf(page, 'usa-bottom-sheet');
    expect(r.bottom).toBeLessThanOrEqual(r.vh - 300 + 1);
    expect(r.top).toBeGreaterThanOrEqual(-1);
    const kb = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--usa-kb').trim());
    expect(kb).toBe('300px');
    await page.evaluate(() => window.__kb(0));
    await settle(page, 800);
    expect((await rectOf(page, 'usa-bottom-sheet')).bottom).toBeGreaterThan(r.vh - 2);
  });

  test('<usa-sheet side="bottom"> and <usa-modal> stay above the keyboard; the variables go away on close', async ({ page }) => {
    await openFixture(page);
    await define(page, 'usa-sheet', 'usa-modal');
    await mount(page, '<usa-sheet id="s" side="bottom" label="Reply"><input id="a" aria-label="a"></usa-sheet><usa-modal id="m" label="Login"><input id="b" aria-label="b"><p style="height:300px">x</p></usa-modal>');
    for (const [id, input, panel] of [['s', '#a', 'usa-sheet .usa-sheet-panel'], ['m', '#b', 'usa-modal dialog']]) {
      await page.evaluate((id) => document.getElementById(id).show(), id);
      await settle(page, 700);
      await page.focus(input);
      await page.evaluate(() => window.__kb(320));
      await settle(page, 500);
      const r = await rectOf(page, panel);
      expect(r.bottom, id).toBeLessThanOrEqual(r.vh - 320 + 1);
      expect(r.top, id).toBeGreaterThanOrEqual(-1);
      await page.evaluate(() => window.__kb(0));
      await page.evaluate((id) => document.getElementById(id).close(), id);
      await settle(page, 700);
    }
    expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--usa-kb'))).toBe('');
  });

  test('bottom toasts move up above the keyboard', async ({ page }) => {
    await openFixture(page);
    await define(page, 'usa-toast-stack');
    await mount(page, '<usa-toast-stack position="bottom-center"></usa-toast-stack>');
    await page.evaluate(() => document.querySelector('usa-toast-stack').show('Saved'));
    await page.evaluate(() => window.__kb(280));
    await settle(page, 400);
    const r = await rectOf(page, 'usa-toast-stack');
    expect(r.bottom).toBeLessThanOrEqual(r.vh - 280 + 1);
  });
});

test.describe('native bridge origin validation (real engine)', () => {
  test('a cross-origin frame cannot change settings; the page itself and allowed origins can', async ({ page }) => {
    await openFixture(page);
    const out = await page.evaluate(async () => {
      const { connectNativeShell } = await import('motionary/components/bridge');
      const got = [];
      const a = connectNativeShell({ onSettings: (s) => got.push('default:' + s.theme) });
      // sandboxed srcdoc frame = opaque origin, another window
      const f = document.createElement('iframe');
      f.setAttribute('sandbox', 'allow-scripts');
      f.srcdoc = `<script>parent.postMessage({ type: 'usa:settings', theme: 'dark' }, '*')<\/script>`;
      document.body.append(f);
      await new Promise((r) => setTimeout(r, 600));
      const afterFrame = document.documentElement.getAttribute('data-theme');
      window.postMessage({ type: 'usa:settings', theme: 'light' }, location.origin);
      await new Promise((r) => setTimeout(r, 100));
      a.disconnect();
      // a same-origin frame is trusted only when its origin is listed
      const b = connectNativeShell({ allowedOrigins: [location.origin], onSettings: (s) => got.push('allowed:' + s.theme) });
      const g = document.createElement('iframe');
      g.srcdoc = `<script>parent.postMessage({ type: 'usa:settings', theme: 'high-contrast' }, '*')<\/script>`;
      document.body.append(g);
      await new Promise((r) => setTimeout(r, 600));
      b.disconnect();
      return { afterFrame, got };
    });
    expect(out.afterFrame).toBeNull();
    expect(out.got).toEqual(['default:light', 'allowed:high-contrast']);
  });
});

test.describe('every component on a phone', () => {
  // Batched sweep: mount every manifest example, rotate portrait → landscape → portrait, run a cancelled touch drag on
  // each — no uncaught errors, nothing wider than the screen because of the rotation.
  const tags = manifest.components.map((c) => c.tag).filter((t) => t !== 'usa-rive');
  const BATCH = 30;
  for (let i = 0; i < tags.length; i += BATCH) {
    const batch = tags.slice(i, i + BATCH);
    test(`mount, rotate and touch-cancel: ${batch[0]} … ${batch[batch.length - 1]}`, async ({ page, viewport }) => {
      test.setTimeout(120_000);
      await openFixture(page);
      for (const t of batch) await define(page, t);
      await mount(page, batch.map((t) => `<section data-t="${t}">${exampleOf(t)}</section>`).join(''));
      await settle(page, 600);
      await rotate(page, LANDSCAPE(viewport));
      await rotate(page, viewport);
      await settle(page, 400);
      await page.evaluate(async () => {
        for (const s of document.querySelectorAll('#stage > section')) {
          const h = s.firstElementChild;
          if (!h) continue;
          const r = h.getBoundingClientRect();
          const o = { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, composed: true, cancelable: true, buttons: 1, clientX: r.left + 5, clientY: r.top + 5 };
          h.dispatchEvent(new PointerEvent('pointerdown', o));
          h.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: o.clientX + 40 }));
          h.dispatchEvent(new PointerEvent('pointercancel', { ...o, buttons: 0 }));
        }
      });
      await settle(page, 600);
      const wide = await page.evaluate(() => [...document.querySelectorAll('#stage > section')].filter((s) => s.firstElementChild && s.firstElementChild.getBoundingClientRect().width > innerWidth * 2).map((s) => s.dataset.t));
      expect(wide, 'elements that grew past twice the screen width').toEqual([]);
      // WebKit reports "ResizeObserver loop completed with undelivered notifications." as a page error when a rotation
      // resizes many observed elements at once; per spec those notifications are delivered next frame (not a thrown error).
      // Only that exact message is dropped here; everything else still fails the test.
      page.__errors = page.__errors.filter((m) => m !== 'ResizeObserver loop completed with undelivered notifications.');
      expectNoErrors(page, batch.join(','));
    });
  }
});
