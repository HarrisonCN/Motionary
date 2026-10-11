// 14.4.0: Motion Studio 1.0 (motionary/studio) in real browsers — real mouse and keyboard input builds a multi-track
// animation through the UI only (toolbar, ruler scrubs, inspector fields, key drags, curve presets), saves it, reopens
// it in a fresh Studio and compares the sampled frames; grid keyboard navigation and ARIA; marquee + curve handle drag;
// touch pointers (finger drag of a key, touch-action); and the listener-count guarantee in a real engine. Real fingers
// on real devices and real screen readers: the manual checklist in docs/studio.md.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

const STAGE = `
<div id="st"></div>
<div id="cv" style="position:relative;width:480px;height:200px;background:#fafafa">
  <div id="a" style="position:absolute;left:20px;top:20px;width:80px;height:40px;background:#08f"></div>
  <div id="b" style="position:absolute;left:200px;top:60px;width:60px;height:40px;background:#f80"></div>
  <div id="c" style="position:absolute;left:340px;top:120px;width:40px;height:40px;background:#0a4"></div>
</div>`;
const ZOOM = 600; // px per second: one frame (60 fps) = 10 px

/** Mount a Studio on #st (stage #cv). `withDoc`: start from a three-track document instead of an empty one. */
async function mount(page, { withDoc = false, opts = {} } = {}) {
  await openFixture(page);
  await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
  await page.evaluate(async ({ withDoc, opts, ZOOM }) => {
    const T = await import('motionary/components/timeline-editor');
    const S = await import('motionary/studio');
    window.__T = T;
    window.__S = S;
    const doc = withDoc
      ? T.createTimelineDoc({ layers: [
        { id: 'a', type: 'track', name: 'A', target: '#a', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 500, props: { opacity: 1 } }] },
        { id: 'b', type: 'track', name: 'B', target: '#b', keyframes: [{ id: 'k3', time: 250, props: { opacity: 0.5 } }] },
        { id: 'c', type: 'track', name: 'C', target: '#c', keyframes: [{ id: 'k4', time: 100, props: { opacity: 0 } }, { id: 'k5', time: 600, props: { opacity: 1 } }] },
      ] })
      : T.createTimelineDoc({ name: 'browser' });
    window.__h = T.createTimelineHistory(doc);
    window.__s = S.createStudio(document.getElementById('st'), { history: window.__h, stage: document.getElementById('cv'), zoom: ZOOM, rowHeight: 24, length: 1000, canvas: { snap: false }, ...opts });
  }, { withDoc, opts, ZOOM });
}
const center = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
const left = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().left, sel);
const kf = (page, id) => page.evaluate((id) => window.__h.doc.layers.flatMap((l) => l.keyframes || []).find((k) => k.id === id), id);
async function drag(page, from, to, steps = 8, mods = []) {
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps });
  await page.mouse.up();
  for (const m of mods) await page.keyboard.up(m);
}
const MOD = process.platform === 'darwin' ? 'Meta' : 'Control';

test.describe('14.4 Motion Studio', () => {
  test('mouse + keyboard only: build a multi-track animation, save, reopen in a new Studio → same frames', async ({ page }) => {
    await mount(page);
    const fill = async (sel, v) => { const l = page.locator(sel); await l.fill(v); await l.press('Enter'); };
    const scrub = async (ms) => { const x = (await left(page, '[data-ruler]')) + (ms * ZOOM) / 1000; await page.mouse.click(x, (await center(page, '[data-ruler]')).y); };
    // tracks: A (top level), group G with B and C
    await page.locator('[data-field="track-name"]').fill('A');
    await page.locator('[data-field="track-target"]').fill('#a');
    await page.click('[data-act="add-track"]');
    await page.locator('[data-field="track-name"]').fill('G');
    await page.click('[data-act="add-group"]');
    const gid = await page.evaluate(() => window.__h.doc.layers[1].id);
    for (const [n, t] of [['B', '#b'], ['C', '#c']]) {
      await page.click(`[data-row-head="${gid}"] span`);
      await page.locator('[data-field="track-name"]').fill(n);
      await page.locator('[data-field="track-target"]').fill(t);
      await page.click('[data-act="add-track"]');
    }
    const ids = await page.evaluate(() => window.__h.doc.layers.map((l) => l.id));
    expect(await page.evaluate(() => window.__h.doc.layers.map((l) => [l.type, l.name, l.parent || null]))).toEqual([['track', 'A', null], ['group', 'G', null], ['track', 'B', ids[1]], ['track', 'C', ids[1]]]);
    // keys from the inspector at ruler-scrubbed times
    const key = async (layer, ms, prop, value) => {
      await page.click(`[data-row-head="${layer}"] span`);
      await scrub(ms);
      if (await page.locator(`[data-inspector] [data-prop="${prop}"]`).count()) await fill(`[data-inspector] [data-prop="${prop}"]`, value);
      else { await page.locator('[data-field="prop-name"]').fill(prop); await page.locator('[data-field="prop-value"]').fill(value); await page.click('[data-act="add-prop"]'); }
    };
    await key(ids[0], 0, 'opacity', '0');
    await key(ids[0], 500, 'opacity', '1');
    await key(ids[2], 100, 'translate', '0px 40px');
    await key(ids[2], 700, 'translate', '0px 0px');
    await key(ids[3], 200, 'scale', '0.5');
    await key(ids[3], 800, 'scale', '1');
    expect(await page.evaluate(() => window.__h.doc.layers.flatMap((l) => (l.keyframes || []).map((k) => [l.name, k.time]))))
      .toEqual([['A', 0], ['A', 500], ['B', 100], ['B', 700], ['C', 200], ['C', 800]]);
    // a preset on A's first key (click it, choose from the select)
    const k0 = await page.evaluate(() => window.__h.doc.layers[0].keyframes[0].id);
    await page.click(`[data-key="${k0}"]`);
    await page.selectOption('[data-field="preset"]', 'ease-out');
    expect((await kf(page, k0)).easing).toBe('cubic-bezier(0, 0, 0.58, 1)');
    // drag C's last key 50 px later with the mouse: snaps to a frame, one undo step
    const kc = await page.evaluate(() => window.__h.doc.layers[3].keyframes[1].id);
    const size0 = await page.evaluate(() => window.__h.size);
    const p = await center(page, `[data-key="${kc}"]`);
    await drag(page, p, { x: p.x + 50, y: p.y });
    const t = (await kf(page, kc)).time;
    expect(Math.abs(t - 883.3333)).toBeLessThan(17); // ≈ 800 + 50 px / 0.6 px/ms, on the frame grid
    expect(Math.abs(Math.round(t / (1000 / 60)) * (1000 / 60) - t)).toBeLessThan(0.001);
    expect(await page.evaluate(() => window.__h.size)).toBe(size0 + 1);
    // undo / redo with the keyboard on the grid
    await page.focus(`[data-key="${kc}"]`);
    await page.keyboard.press(`${MOD}+z`);
    expect((await kf(page, kc)).time).toBe(800);
    await page.keyboard.press(`${MOD}+Shift+z`);
    expect((await kf(page, kc)).time).toBe(t);
    // the stage shows the frame at the playhead
    await scrub(250);
    expect(Number(await page.evaluate(() => getComputedStyle(document.getElementById('a')).opacity))).toBeGreaterThan(0.1);
    // save → reopen in a fresh Studio → same frames, same stage DOM
    const r = await page.evaluate(() => {
      const built = window.__h.doc, frames = window.__S.sampleFrames(built, { fps: 60 }), saved = window.__s.save();
      window.__s.setTime(400);
      const decl = (id) => document.getElementById(id).style.cssText.split(';').map((x) => x.trim()).filter(Boolean).sort().join(';');
      const dom = ['a', 'b', 'c'].map(decl);
      window.__s.destroy();
      const h2 = window.__T.createTimelineHistory(window.__T.createTimelineDoc());
      const s2 = window.__S.createStudio(document.getElementById('st'), { history: h2, stage: document.getElementById('cv'), zoom: 600 });
      const lost = s2.load(saved);
      s2.setTime(400);
      const out = { lost, same: JSON.stringify(h2.doc) === JSON.stringify(window.__T.normalizeTimelineDoc(built)), frames: JSON.stringify(window.__S.sampleFrames(h2.doc, { fps: 60 })) === JSON.stringify(frames), dom: JSON.stringify(['a', 'b', 'c'].map(decl)) === JSON.stringify(dom), n: frames.length };
      s2.destroy();
      return out;
    });
    expect(r).toEqual({ lost: [], same: true, frames: true, dom: true, n: r.n });
    expect(r.n).toBeGreaterThan(50);
    await expectNoErrors(page);
  });

  test('keyboard + ARIA: the timeline is a grid with one tab stop; arrows move between keys and rows; Alt+arrow nudges', async ({ page }) => {
    await mount(page, { withDoc: true });
    const aria = await page.evaluate(() => {
      const g = document.querySelector('[role="grid"]');
      return { label: g.getAttribute('aria-label'), rows: g.querySelectorAll('[role="row"]').length, rowcount: g.getAttribute('aria-rowcount'), heads: g.querySelectorAll('[role="rowheader"]').length, cells: g.querySelectorAll('[role="gridcell"]').length, stops: g.querySelectorAll('[data-layer] [tabindex="0"]').length, slider: document.querySelector('[data-playhead]').getAttribute('role') };
    });
    expect(aria).toEqual({ label: 'Timeline', rows: 4, rowcount: '4', heads: 3, cells: 3, stops: 1, slider: 'slider' });
    await page.focus('[data-row-head="a"]');
    await page.keyboard.press('ArrowRight');
    expect(await page.evaluate(() => document.activeElement.getAttribute('data-key'))).toBe('k1');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => document.activeElement.getAttribute('data-key'))).toBe('k3');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => window.__s.selection)).toEqual(['k3']);
    expect(await page.getAttribute('[data-key="k3"]', 'aria-pressed')).toBe('true');
    await page.keyboard.press('Alt+ArrowRight');
    expect((await kf(page, 'k3')).time).toBe(266.6667);
    expect(await page.evaluate(() => document.activeElement.getAttribute('data-key'))).toBe('k3');
    await page.keyboard.press('Period');
    expect(await page.evaluate(() => window.__s.time)).toBe(16.6667);
    await page.focus('[data-playhead]');
    await page.keyboard.press('End');
    expect(await page.evaluate(() => window.__s.time)).toBe(1000);
    expect(await page.getAttribute('[data-playhead]', 'aria-valuenow')).toBe('1000');
    await expectNoErrors(page);
  });

  test('marquee across rows, multi-select move, copy / paste; curve handle drag is one undo step', async ({ page }) => {
    await mount(page, { withDoc: true });
    const cell = await page.evaluate(() => { const r = document.querySelector('[data-keys="a"]').getBoundingClientRect(); return { x: r.left, y: r.top, h: r.height }; });
    await drag(page, { x: cell.x + 120, y: cell.y + 3 }, { x: cell.x + 320, y: cell.y + cell.h + 10 });
    expect((await page.evaluate(() => window.__s.selection)).sort()).toEqual(['k2', 'k3']);
    expect(await page.evaluate(() => window.__h.size)).toBe(0);
    const p = await center(page, '[data-key="k2"]');
    await drag(page, p, { x: p.x + 20, y: p.y }, 8, ['Alt']);
    expect((await kf(page, 'k2')).time).toBeCloseTo(533.33, 0);
    expect((await kf(page, 'k3')).time).toBeCloseTo(283.33, 0);
    expect(await page.evaluate(() => window.__h.size)).toBe(1);
    await page.focus('[data-key="k2"]');
    await page.keyboard.press(`${MOD}+c`);
    await page.evaluate(() => window.__s.setTime(800));
    await page.focus('[data-key="k2"]');
    await page.keyboard.press(`${MOD}+v`);
    expect(await page.evaluate(() => window.__s.selection.length)).toBe(2);
    expect(await page.evaluate(() => window.__h.size)).toBe(2);
    // curve: select k1, drag handle 1 up and right
    await page.click('[data-key="k1"]');
    const h1 = await center(page, '[data-handle="1"]');
    await drag(page, h1, { x: h1.x + 30, y: h1.y - 60 });
    const e = (await kf(page, 'k1')).easing;
    expect(e).toMatch(/^cubic-bezier\(0\.2\d?, 0\.[45]\d*, 1, 1\)$/);
    expect(await page.evaluate(() => window.__h.size)).toBe(3);
    await expectNoErrors(page);
  });

  test('touch pointers: a finger drags a key (one undo step); touch-action none on the timeline; no global listeners', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => {
      window.__added = [];
      const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function (t, f, o) { window.__added.push([this, t, f]); return add.call(this, t, f, o); };
      EventTarget.prototype.removeEventListener = function (t, f, o) { window.__added = window.__added.filter((x) => !(x[0] === this && x[1] === t && x[2] === f)); return rem.call(this, t, f, o); };
    });
    await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
    await page.evaluate(async () => {
      const T = await import('motionary/components/timeline-editor');
      const S = await import('motionary/studio');
      window.__base = window.__added.length;
      window.__h = T.createTimelineHistory(T.createTimelineDoc({ layers: [{ id: 'a', type: 'track', target: '#a', keyframes: [{ id: 'k1', time: 100, props: { opacity: 0 } }, { id: 'k2', time: 500, props: { opacity: 1 } }] }] }));
      window.__s = S.createStudio(document.getElementById('st'), { history: window.__h, stage: document.getElementById('cv'), zoom: 600, rowHeight: 24, canvas: false });
    });
    const globals = () => page.evaluate(() => window.__added.filter((x) => x[0] === window || x[0] === document).length);
    const g0 = await globals();
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-keys="a"]')).touchAction)).toBe('none');
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-ruler]')).touchAction)).toBe('none');
    await page.evaluate(async () => {
      const k = document.querySelector('[data-key="k1"]'), box = document.querySelector('[data-studio]');
      const r = k.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const o = { pointerId: 11, pointerType: 'touch', isPrimary: true, bubbles: true, composed: true, cancelable: true, button: 0, buttons: 1 };
      k.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: x, clientY: y }));
      for (let i = 1; i <= 8; i++) {
        await new Promise((res) => requestAnimationFrame(res));
        box.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: x + (60 * i) / 8, clientY: y })); // what pointer capture delivers
      }
      box.dispatchEvent(new PointerEvent('pointerup', { ...o, buttons: 0, clientX: x + 60, clientY: y }));
    });
    expect((await kf(page, 'k1')).time).toBe(200); // 100 ms + 60 px / 0.6 px/ms, on the frame grid
    expect(await page.evaluate(() => window.__h.size)).toBe(1);
    expect(await globals()).toBe(g0);
    await page.evaluate(() => window.__s.destroy());
    expect(await page.evaluate(() => window.__added.length - window.__base)).toBe(0);
    expect(await page.evaluate(() => document.getElementById('st').innerHTML)).toBe('');
    await expectNoErrors(page);
  });
});
