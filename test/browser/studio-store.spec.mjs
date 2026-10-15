// 15.5.0: motionary/studio/store in real browsers (chromium / firefox / webkit in CI): the IndexedDB ProjectStore keeps
// revisions across store instances, refuses a stale write, and createStudioApp saves / reopens through toAppStorage.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

test.describe('15.5 team projects', () => {
  test('IndexedDB store: revisions, conflict, Studio app save → reopen', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => (document.getElementById('stage').innerHTML = '<div id="app"></div><div id="cv" style="position:relative;width:200px;height:80px"><div id="a"></div></div>'));
    const r = await page.evaluate(async () => {
      const S = await import('motionary/studio/store');
      const A = await import('motionary/studio/app');
      const dbName = 'motionary-test-' + Math.random().toString(36).slice(2);
      const s1 = S.createIndexedDBProjectStore({ dbName });
      const r1 = await s1.put('p', '{"format":"motionary-scene","version":2,"layers":[]}');
      const s2 = S.createIndexedDBProjectStore({ dbName }); // a second tab / instance sees the same data
      const got = await s2.get('p');
      await s2.put('p', '{"format":"motionary-scene","version":2,"duration":10,"layers":[]}', { baseRev: r1.rev });
      const stale = await s1.put('p', '{}', { baseRev: r1.rev }).then(() => 'written', (e) => e.code);
      const app = await A.createStudioApp(document.getElementById('app'), { stage: document.getElementById('cv'), name: 'hero', storage: S.toAppStorage(s1) });
      await app.save();
      const reopened = await app.reopen('hero');
      const hist = (await s2.history('p')).length;
      const names = (await s2.list()).map((x) => x.name);
      app.destroy();
      return { same: got.rev === r1.rev, stale, reopened: reopened.ok, hist, names };
    });
    expect(r).toEqual({ same: true, stale: 'conflict', reopened: true, hist: 2, names: ['hero', 'p'] });
    expectNoErrors(page, 'studio store');
  });
});
