// 14.3.0: Studio canvas (motionary/studio/canvas) in real browsers — real mouse input for select / drag / marquee /
// resize / rotate / snapping, keyboard nudge, and touch pointer emulation in a phone viewport (finger drag, pinch-zoom,
// touch-action), plus the listener-count guarantee in a real engine. Real fingers on real devices: the manual
// checklist in docs/studio-canvas.md.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

const STAGE = `
<div id="cv" style="position:absolute;left:0;top:0;width:600px;height:400px;margin:0;padding:0;background:#fafafa">
  <div id="a" style="position:absolute;left:20px;top:20px;width:100px;height:60px;background:#08f"></div>
  <div id="b" style="position:absolute;left:300px;top:200px;width:80px;height:40px;background:#f80"></div>
  <div id="c" style="position:absolute;left:150px;top:300px;width:40px;height:40px;background:#0a4"></div>
</div>`;

/** Mount the canvas; `opts` are passed to createStudioCanvas (JSON). Exposes window.__h (history), __c (canvas), __T (editor). */
async function mount(page, opts = {}) {
  await openFixture(page);
  await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
  await page.evaluate(async (opts) => {
    const T = await import('motionary/components/timeline-editor');
    const S = await import('motionary/studio/canvas');
    const doc = T.createTimelineDoc({ layers: ['a', 'b', 'c'].map((id) => ({ id, type: 'track', name: id.toUpperCase(), target: '#' + id, keyframes: [] })) });
    window.__T = T;
    window.__S = S;
    window.__h = T.createTimelineHistory(doc);
    window.__edits = [];
    window.__c = S.createStudioCanvas(document.getElementById('cv'), { history: window.__h, onEdit: (e) => window.__edits.push(e), ...opts });
  }, opts);
}
const rect = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
const near = (a, b, eps = 1.5) => { for (const k of Object.keys(b)) expect(Math.abs(a[k] - b[k]), `${k}: ${a[k]} vs ${b[k]}`).toBeLessThan(eps); };
const geo = (page, id) => page.evaluate((id) => window.__S.readCanvasGeometry(window.__h.doc, id, 0), id);
async function drag(page, from, to, steps = 8, mods = []) {
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps });
  await page.mouse.up();
  for (const m of mods) await page.keyboard.up(m);
}
/** A synthetic touch pointer event on `sel` (or the element under the point) — what a browser delivers for a finger. */
const touch = (page, type, x, y, id) => page.evaluate(({ type, x, y, id }) => {
  const t = (type === 'pointerdown' ? document.elementFromPoint(x, y) : null) || document.getElementById('cv');
  t.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: x, clientY: y, buttons: type === 'pointerup' ? 0 : 1 }));
}, { type, x, y, id });

test.describe('14.3 Studio canvas', () => {
  test('mouse: click selects, drag moves the selection as one undo step, the ops replay losslessly on the scene', async ({ page }) => {
    await mount(page, { snap: false });
    const a0 = await rect(page, '#a');
    await page.mouse.click(a0.x + 10, a0.y + 10);
    expect(await page.evaluate(() => window.__c.selection)).toEqual(['a']);
    expect(await page.evaluate(() => document.getElementById('a').getAttribute('aria-selected'))).toBe('true');
    expect(await page.evaluate(() => window.__h.size)).toBe(0);
    await drag(page, { x: a0.x + 10, y: a0.y + 10 }, { x: a0.x + 60, y: a0.y + 40 });
    near(await rect(page, '#a'), { x: a0.x + 50, y: a0.y + 30, w: 100, h: 60 });
    expect(await geo(page, 'a')).toEqual({ x: 50, y: 30, rotation: 0 });
    const r = await page.evaluate(() => {
      const before = window.__T.createTimelineDoc({ layers: ['a', 'b', 'c'].map((id) => ({ id, type: 'track', name: id.toUpperCase(), target: '#' + id, keyframes: [] })) });
      const replay = window.__S.applyCanvasOps(window.__T.timelineDocToScene(before), window.__edits.flatMap((e) => e.ops));
      return { size: window.__h.size, label: window.__h.undoLabel, same: JSON.stringify(replay) === JSON.stringify(window.__T.timelineDocToScene(window.__h.doc)) };
    });
    expect(r).toEqual({ size: 1, label: 'Move', same: true });
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
    near(await rect(page, '#a'), { x: a0.x, y: a0.y });
    await expectNoErrors(page);
  });

  test('marquee from empty space; Shift-click adds; snapping to a sibling edge shows a guide; Alt moves freely', async ({ page }) => {
    await mount(page, { snap: { threshold: 6 } });
    const cv = await rect(page, '#cv');
    await drag(page, { x: cv.x + 5, y: cv.y + 5 }, { x: cv.x + 330, y: cv.y + 220 });
    expect(await page.evaluate(() => window.__c.selection)).toEqual(['a', 'b']);
    await page.mouse.click(cv.x + 590, cv.y + 390);
    expect(await page.evaluate(() => window.__c.selection)).toEqual([]);
    // c (left 150) dragged right by 147 → its left edge 297 snaps to b's left edge 300
    const c0 = await rect(page, '#c');
    await page.mouse.move(c0.x + 5, c0.y + 5);
    await page.mouse.down();
    await page.mouse.move(c0.x + 152, c0.y + 5, { steps: 6 });
    expect(await page.evaluate(() => !!document.querySelector('[data-canvas-guide="x"]'))).toBe(true);
    await page.mouse.up();
    expect((await geo(page, 'c')).x).toBe(150);
    expect(await page.evaluate(() => !!document.querySelector('[data-canvas-guide]'))).toBe(false);
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
    await drag(page, { x: c0.x + 5, y: c0.y + 5 }, { x: c0.x + 152, y: c0.y + 5 }, 6, ['Alt']);
    expect((await geo(page, 'c')).x).toBe(147);
    await expectNoErrors(page);
  });

  test('resize and rotate handles (real hit-testing on the overlay); Shift snaps rotation to 15°', async ({ page }) => {
    await mount(page, { snap: false });
    await page.evaluate(() => window.__c.select(['b']));
    const se = await rect(page, '[data-canvas-handle="se"]');
    await drag(page, { x: se.x + se.w / 2, y: se.y + se.h / 2 }, { x: se.x + se.w / 2 + 40, y: se.y + se.h / 2 + 20 });
    expect(await geo(page, 'b')).toEqual({ x: 0, y: 0, width: 120, height: 60, rotation: 0 });
    near(await rect(page, '#b'), { w: 120, h: 60 });
    const b = await rect(page, '#b');
    const rot = await rect(page, '[data-canvas-handle="rotate"]');
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    await drag(page, { x: rot.x + rot.w / 2, y: rot.y + rot.h / 2 }, { x: cx + 80, y: cy - 4 }, 8, ['Shift']);
    expect((await geo(page, 'b')).rotation).toBe(90);
    const after = await rect(page, '#b'); // rotated 90°: the bounding box is 60 × 120 around the same centre
    near(after, { w: 60, h: 120, x: cx - 30, y: cy - 60 });
    expect(await page.evaluate(() => window.__h.size)).toBe(2);
    await expectNoErrors(page);
  });

  test('keyboard: Tab into the canvas, Alt+Arrow moves focus and selects, arrows nudge (Shift ×10), Ctrl+] reorders', async ({ page }) => {
    await mount(page);
    await page.evaluate(() => document.getElementById('a').focus());
    await page.keyboard.press('Alt+ArrowDown');
    expect(await page.evaluate(() => [document.activeElement.id, window.__c.selection])).toEqual(['b', ['b']]);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    expect(await geo(page, 'b')).toEqual({ x: 1, y: 10, rotation: 0 });
    expect(await page.evaluate(() => [window.__h.size, window.__h.undoLabel])).toEqual([1, 'Nudge']);
    expect(await page.evaluate(() => document.querySelector('#cv [role="status"]').textContent)).toContain('B moved to');
    await page.keyboard.press('Control+BracketRight');
    expect(await page.evaluate(() => window.__h.doc.layers.map((l) => l.id))).toEqual(['b', 'a', 'c']);
    expect(await page.evaluate(() => +getComputedStyle(document.getElementById('b')).zIndex > +getComputedStyle(document.getElementById('a')).zIndex)).toBe(true);
    await expectNoErrors(page);
  });

  test('no listeners on window / document; gesture listeners only during a drag; destroy restores the DOM', async ({ page }) => {
    await openFixture(page);
    await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
    const r = await page.evaluate(async () => {
      const live = new Set();
      const key = (t, type, fn, o) => [t, type, fn, typeof o === 'boolean' ? o : !!(o && o.capture)];
      const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener;
      const find = (k) => [...live].find((x) => x.every((v, i) => v === k[i]));
      EventTarget.prototype.addEventListener = function (type, fn, o) { if (fn && !find(key(this, type, fn, o))) live.add(key(this, type, fn, o)); return add.call(this, type, fn, o); };
      EventTarget.prototype.removeEventListener = function (type, fn, o) { const f = find(key(this, type, fn, o)); if (f) live.delete(f); return rem.call(this, type, fn, o); };
      const T = await import('motionary/components/timeline-editor');
      const S = await import('motionary/studio/canvas');
      const cv = document.getElementById('cv');
      const html = cv.outerHTML;
      const base = live.size;
      const h = T.createTimelineHistory(T.createTimelineDoc({ layers: [{ id: 'a', type: 'track', target: '#a', keyframes: [] }] }));
      const c = S.createStudioCanvas(cv, { history: h, snap: false });
      const idle = live.size;
      const on = (t) => [...live].filter((x) => x[0] === t).length;
      const glob = () => on(window) + on(document);
      const a = document.getElementById('a').getBoundingClientRect();
      const ev = (t, type, x, y) => t.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 5, pointerType: 'mouse', clientX: x, clientY: y, buttons: 1 }));
      ev(document.getElementById('a'), 'pointerdown', a.left + 5, a.top + 5);
      const during = live.size;
      ev(cv, 'pointermove', a.left + 25, a.top + 5);
      ev(cv, 'pointerup', a.left + 25, a.top + 5);
      const after = live.size;
      const touchAction = getComputedStyle(cv).touchAction;
      c.destroy();
      EventTarget.prototype.addEventListener = add;
      EventTarget.prototype.removeEventListener = rem;
      return { base, idle, during, after, end: live.size, glob: glob(), touchAction, restored: cv.outerHTML === html, moved: S.readCanvasGeometry(h.doc, 'a', 0).x, touchAfter: getComputedStyle(cv).touchAction };
    });
    expect(r.idle).toBeGreaterThan(r.base);
    expect(r.during).toBeGreaterThan(r.idle);
    expect(r.after).toBe(r.idle);
    expect(r.end).toBe(r.base);
    expect(r.glob).toBe(0);
    expect(r.touchAction).toBe('none');
    expect(r.touchAfter).toBe('auto');
    expect(r.restored).toBe(true);
    expect(r.moved).toBe(20);
    await expectNoErrors(page);
  });
});

test.describe('14.3 Studio canvas — touch in a phone viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a finger drags a layer (one undo step); a second finger pinch-zooms around the midpoint and cancels the move', async ({ page }) => {
    await mount(page, { snap: false });
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('cv')).touchAction)).toBe('none');
    const a0 = await rect(page, '#a');
    await touch(page, 'pointerdown', a0.x + 10, a0.y + 10, 1);
    for (let i = 1; i <= 5; i++) await touch(page, 'pointermove', a0.x + 10 + i * 6, a0.y + 10 + i * 4, 1);
    await touch(page, 'pointerup', a0.x + 40, a0.y + 30, 1);
    expect(await geo(page, 'a')).toEqual({ x: 30, y: 20, rotation: 0 });
    expect(await page.evaluate(() => window.__h.size)).toBe(1);
    // pinch: finger 1 starts a move on c, finger 2 lands → the move is cancelled, the distance 100 → 150 zooms ×1.5
    const c0 = await rect(page, '#c');
    await touch(page, 'pointerdown', c0.x + 20, c0.y + 20, 1);
    await touch(page, 'pointermove', c0.x + 25, c0.y + 20, 1);
    await touch(page, 'pointerdown', c0.x + 125, c0.y + 20, 2);
    await touch(page, 'pointermove', c0.x + 175, c0.y + 20, 2);
    const z = await page.evaluate(() => window.__c.zoom);
    expect(z).toBeCloseTo(1.5, 4);
    await touch(page, 'pointerup', c0.x + 175, c0.y + 20, 2);
    await touch(page, 'pointerup', c0.x + 25, c0.y + 20, 1);
    expect(await geo(page, 'c')).toEqual({ x: 0, y: 0, rotation: 0 });
    expect(await page.evaluate(() => window.__h.size)).toBe(1);
    // the stage point under the start midpoint stays under the (moved) midpoint: midpoint moved +25 px
    const mid0 = { x: c0.x + 75, y: c0.y + 20 };
    const c1 = await rect(page, '#c');
    near({ x: c1.x, w: c1.w }, { x: mid0.x + 25 - (mid0.x - c0.x) * 1.5, w: 60 }, 2);
    await page.evaluate(() => window.__c.destroy());
    expect(await page.evaluate(() => [getComputedStyle(document.getElementById('cv')).touchAction, document.getElementById('cv').style.transform])).toEqual(['auto', '']);
    await expectNoErrors(page);
  });

  test('touch: tap selects, a finger marquee multi-selects, and resize from a handle works with a coarse-size target', async ({ page }) => {
    await mount(page, { snap: false });
    const a0 = await rect(page, '#a');
    await touch(page, 'pointerdown', a0.x + 5, a0.y + 5, 1);
    await touch(page, 'pointerup', a0.x + 5, a0.y + 5, 1);
    expect(await page.evaluate(() => window.__c.selection)).toEqual(['a']);
    const cv = await rect(page, '#cv');
    await touch(page, 'pointerdown', cv.x + 590, cv.y + 390, 1);
    await touch(page, 'pointermove', cv.x + 180, cv.y + 190, 1);
    await touch(page, 'pointerup', cv.x + 180, cv.y + 190, 1);
    expect(await page.evaluate(() => window.__c.selection)).toEqual(['b', 'c']);
    await page.evaluate(() => window.__c.select(['a']));
    const e = await rect(page, '[data-canvas-handle="e"]');
    await touch(page, 'pointerdown', e.x + e.w / 2, e.y + e.h / 2, 1);
    await touch(page, 'pointermove', e.x + e.w / 2 + 30, e.y + e.h / 2, 1);
    await touch(page, 'pointerup', e.x + e.w / 2 + 30, e.y + e.h / 2, 1);
    expect(await geo(page, 'a')).toEqual({ x: 0, y: 0, width: 130, rotation: 0 });
    await expectNoErrors(page);
  });
});
