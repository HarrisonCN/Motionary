// 16.3.0: motionary/studio/budget in real browsers (chromium / firefox / webkit in CI): gzip is measured with the
// browser's CompressionStream, the live meter updates as the scene changes, and guardPublish refuses over budget.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

test.describe('16.3 Studio performance budget', () => {
  test('measure (raw + gzip), meter, guardPublish', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => (document.getElementById('stage').innerHTML = '<div id="meter"></div>'));
    const r = await page.evaluate(async () => {
      const B = await import('motionary/studio/budget');
      const tl = await import('motionary/components/timeline-editor');
      const mk = (props) => tl.createTimelineDoc({ name: 'b', layers: [{ id: 'a', type: 'track', target: '#a', keyframes: [{ id: 'k1', time: 0, props: props[0] }, { id: 'k2', time: 1000, props: props[1] }] }] });
      const limits = { kb: 50, frameCost: 5 };
      const meter = B.createBudgetMeter(document.getElementById('meter'), limits);
      const m1 = await B.measureExport(mk([{ opacity: 0 }, { opacity: 1 }]), { js: false });
      meter.update(m1);
      const t1 = document.getElementById('meter').textContent, o1 = document.getElementById('meter').getAttribute('data-over');
      const m2 = await B.measureExport(mk([{ width: '0px' }, { width: '90px' }]), { js: false });
      meter.update(m2);
      const o2 = document.getElementById('meter').getAttribute('data-over');
      let called = 0;
      const g = await B.guardPublish(mk([{ width: '0px' }, { width: '90px' }]), limits, () => ++called, { js: false });
      return { gz: typeof m1.gzipBytes === 'number' && m1.gzipBytes > 0 && m1.gzipBytes < m1.bytes, t1, o1, o2, ok: g.ok, called, cost: [m1.cost.peak, m2.cost.peak] };
    });
    expect(r.gz).toBe(true);
    expect(r.t1).toMatch(/KB \/ 50 KB · gzip [\d.]+ KB · cost 1 \/ 5/);
    expect(r.o1).toBeNull();
    expect(r.o2).toBe('frameCost');
    expect(r.ok).toBe(false);
    expect(r.called).toBe(0);
    expect(r.cost).toEqual([1, 10]);
    expectNoErrors(page, 'studio budget');
  });
});
