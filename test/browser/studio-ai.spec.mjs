// 14.6.0: the AI Studio assistant's diff-review panel (motionary/studio/ai createAiPanel) in a real browser — prompt →
// proposed ops (one checkbox each) → structured diff → Apply as ONE undo step → Undo; per-op reject; a failed proposal
// offers nothing and keeps the project; model text is rendered as text, never as markup. The deterministic mock
// provider stands in for a model (no network: the fixture blocks every non-local request).
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

/** Mount the panel on a Scene v2 history; `mode` picks the provider: 'mock' | 'evil' (markup + a too-new component) | 'two'. */
async function mount(page, mode = 'mock') {
  await openFixture(page);
  await page.evaluate(async (mode) => {
    const T = await import('motionary/components/timeline-editor');
    const A = await import('motionary/studio/ai');
    const scene = { format: 'motionary-scene', version: 2, name: 'hero', layers: [
      { id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 400, props: { opacity: 1 } }] },
      { id: 'card', type: 'track', target: '.card', keyframes: [] },
    ] };
    const catalog = [{ tag: 'usa-reveal', since: '1.0', keywords: ['fade', 'reveal'] }, { tag: 'usa-confetti', since: '99.0', keywords: ['confetti'] }];
    const providers = {
      mock: A.createMockProvider(),
      evil: () => ({ format: 'motionary-ai-edit', version: 1, summary: '<img src=x onerror="window.__pwned=1">', ops: [{ op: 'set-component', layer: 'card', component: { tag: 'usa-confetti', props: {} }, reason: '<b>bold</b>' }] }),
      two: () => ({ format: 'motionary-ai-edit', version: 1, summary: 'two changes', ops: [
        { op: 'set-layer', layer: 'card', patch: { easing: 'ease-out' }, reason: 'smoother' },
        { op: 'add-keyframe', layer: 'card', keyframe: { id: 'n1', time: 0, props: { opacity: '0' } }, reason: '<i>start hidden</i>' },
      ] }),
    };
    window.__scene0 = JSON.stringify(scene);
    window.__h = T.createTimelineHistory(scene);
    window.__p = A.createAiPanel(document.getElementById('stage'), { history: window.__h, provider: providers[mode], catalog, version: '14.6.0', getSelection: () => ['card'] });
  }, mode);
}
const ops = (page) => page.locator('[data-ai="ops"] > li');
const generate = async (page, text) => { await page.fill('[data-ai="prompt"]', text); await page.click('[data-ai="generate"]'); };

test.describe('14.6 AI Studio assistant — diff review', () => {
  test('prompt → ops + diff; nothing changes until Apply; Apply = one undo step; Undo restores', async ({ page }) => {
    await mount(page);
    await generate(page, 'fade the card up slowly');
    await expect(page.locator('.usa-ai')).toHaveAttribute('data-state', 'review');
    await expect(ops(page).first()).toBeVisible();
    expect(await ops(page).count()).toBeGreaterThan(1);
    await expect(page.locator('[data-ai="diff"]')).toContainText('layers[1]');
    await expect(page.locator('[data-ai="status"]')).toContainText('Checks passed');
    expect(await page.evaluate(() => window.__h.size)).toBe(0);
    await expect(page.locator('[data-ai="apply"]')).toBeDisabled();
    await page.click('[data-ai="accept-all"]');
    await page.click('[data-ai="apply"]');
    await expect(page.locator('.usa-ai')).toHaveAttribute('data-state', 'applied');
    expect(await page.evaluate(() => window.__h.size)).toBe(1);
    expect(await page.evaluate(() => window.__h.undoLabel)).toMatch(/^AI/);
    expect(await page.evaluate(() => window.__h.doc.layers[1].keyframes.length)).toBeGreaterThan(0);
    await page.click('[data-ai="undo"]');
    expect(await page.evaluate(() => JSON.stringify(window.__h.doc) === window.__scene0)).toBe(true);
    expectNoErrors(page);
  });

  test('accept one op, reject the other with the checkboxes: only the accepted op lands', async ({ page }) => {
    await mount(page, 'two');
    await generate(page, 'smoother and hidden');
    await expect(ops(page)).toHaveCount(2);
    await ops(page).nth(0).locator('input[type=checkbox]').check();
    await expect(page.locator('[data-ai="apply"]')).toBeEnabled();
    await page.click('[data-ai="apply"]');
    const card = await page.evaluate(() => window.__h.doc.layers[1]);
    expect(card.easing).toBe('ease-out');
    expect(card.keyframes).toEqual([]);
    await expect(ops(page).nth(0)).toHaveAttribute('data-status', 'applied');
    await expect(ops(page).nth(1)).toHaveAttribute('data-status', 'rejected');
    // reasons are text: the <i> tag is shown literally, no element is created
    await expect(ops(page).nth(1)).toContainText('<i>start hidden</i>');
    expect(await page.locator('[data-ai="ops"] i').count()).toBe(0);
    expectNoErrors(page);
  });

  test('a failing proposal (component newer than the project) offers nothing, keeps the project, suggests fixes; markup in model text stays text', async ({ page }) => {
    await mount(page, 'evil');
    await generate(page, 'confetti');
    await expect(page.locator('.usa-ai')).toHaveAttribute('data-state', 'failed');
    await expect(ops(page)).toHaveCount(0);
    await expect(page.locator('[data-ai="apply"]')).toBeDisabled();
    await expect(page.locator('[data-ai="status"]')).toContainText('needs motionary 99.0');
    await expect(page.locator('[data-ai="fixes"]')).toBeVisible();
    expect(await page.evaluate(() => JSON.stringify(window.__h.doc) === window.__scene0)).toBe(true);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(await page.locator('.usa-ai img').count()).toBe(0);
    expectNoErrors(page);
  });

  test('keyboard: the prompt submits with the form, checkboxes and buttons are reachable', async ({ page }) => {
    await mount(page);
    await page.focus('[data-ai="prompt"]');
    await page.keyboard.type('fade the card up');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(ops(page).first()).toBeVisible();
    await ops(page).first().locator('input[type=checkbox]').focus();
    await page.keyboard.press('Space');
    await expect(ops(page).first()).toHaveAttribute('data-status', 'accepted');
    expectNoErrors(page);
  });
});
