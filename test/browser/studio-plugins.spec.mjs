// 16.2.0: motionary/studio/plugins in real browsers (chromium / firefox / webkit in CI): a Worker plugin and a sandboxed
// iframe plugin read the project, set a panel, propose (the host decides), export files; a plugin that crashes or
// loops forever is isolated (crashed + terminated) while the host and the other plugin keep answering.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

test.describe('16.2 Studio plugins', () => {
  test('Worker + iframe plugins: permissions, proposals, exporter, crash isolation', async ({ page }) => {
    await openFixture(page);
    const r = await page.evaluate(async () => {
      document.cookie = 'mtnHostProbe=1; path=/';
      if (!document.cookie.includes('mtnHostProbe')) throw new Error('host cookie probe not set');
      const P = await import('motionary/studio/plugins');
      const project = { format: 'motionary-studio', version: 2, scene: { version: 3, duration: 1000, layers: [{ id: 'a', type: 'track', target: '.a', keyframes: [] }] } };
      const proposals = [];
      const host = P.createPluginHost({ getProject: () => project, propose: (p, meta) => (proposals.push([p.scene.duration, meta.plugin, meta.note]), true), timeoutMs: 1500 });
      const m = (id, permissions) => ({ id, name: id, version: '1.0.0', api: 1, permissions });
      const until = async (f) => { for (let i = 0; i < 300 && !f(); i++) await new Promise((x) => setTimeout(x, 10)); return f(); };
      host.load(m('com.example.worker', ['project:read', 'panel', 'exporter']), `(async () => {
        const p = await motionary.getProject();
        await motionary.setPanel({ title: 'W', text: p.scene.layers.length + ' layer' });
        await motionary.onExport((q) => ({ 'scene.txt': 'duration ' + q.scene.duration }));
        try { await motionary.propose(p, 'no'); } catch (e) { await motionary.setPanel({ title: 'W', text: e.message }); }
      })();`);
      host.load(m('com.example.frame', ['project:read', 'project:propose']), P.createIframeTransport(`(async () => {
        const p = await motionary.getProject();
        p.scene.duration = 2000;
        await motionary.propose(p, 'longer');
        // Opaque-origin sandbox: Chromium/Firefox throw on document.cookie, WebKit returns '' — either way the
        // host page's cookie must not be readable from the plugin frame.
        let cookie; try { cookie = String(document.cookie); } catch (e) { cookie = 'blocked'; }
        await motionary.propose({ scene: { duration: cookie === 'blocked' || !cookie.includes('mtnHostProbe') ? -1 : -2 } }, 'cookie');
      })();`));
      await until(() => proposals.length === 2 && host.panels()[0]?.text.includes('permission'));
      const exp = await host.runExporter('com.example.worker');
      host.load(m('com.example.crash', []), 'throw new Error("boom")');
      host.load(m('com.example.loop', ['exporter']), 'motionary.onExport(() => { for (;;) {} });');
      await until(() => host.plugins().find((p) => p.id === 'com.example.loop')?.exporter);
      const looped = await host.runExporter('com.example.loop');
      await until(() => host.plugins().find((p) => p.id === 'com.example.crash')?.status === 'crashed');
      const again = await host.runExporter('com.example.worker'); // host + healthy plugin still fine
      const status = Object.fromEntries(host.plugins().map((p) => [p.id, p.status]));
      const denied = host.audit.filter((a) => !a.allowed).map((a) => a.plugin + ' ' + a.method);
      return { proposals, panel: host.panels()[0], exp, looped: looped.ok, again: again.ok, status, denied };
    });
    expect(r.proposals).toEqual([[2000, 'com.example.frame', 'longer'], [-1, 'com.example.frame', 'cookie']]);
    expect(r.panel.plugin).toBe('com.example.worker');
    expect(r.panel.text).toMatch(/permission "project:propose"/);
    expect(r.exp).toEqual({ ok: true, value: { files: { 'scene.txt': 'duration 1000' } } });
    expect(r.looped).toBe(false);
    expect(r.again).toBe(true);
    expect(r.status).toEqual({ 'com.example.worker': 'running', 'com.example.frame': 'running', 'com.example.crash': 'crashed', 'com.example.loop': 'crashed' });
    expect(r.denied).toEqual(['com.example.worker project.propose']);
    expectNoErrors(page, 'studio plugins');
  });
});
