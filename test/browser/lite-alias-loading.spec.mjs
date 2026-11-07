import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

for (const aliasesFirst of [true, false]) {
  test('lite retries category CSS and styles mounted aliases with aliases registered ' + (aliasesFirst ? 'first' : 'last'), async ({ page }) => {
    await openFixture(page);
    const requests = [];
    await page.route('**/dist/components/interaction.css', async (route) => {
      requests.push(route.request().url());
      if (requests.length === 1) await route.abort();
      else await route.continue();
    });
    await page.evaluate(async (aliasesFirst) => {
      const lite = await import('/dist/components/lite.js');
      const { defineMoAliases } = await import('/dist/components/mo.js');
      const stage = document.getElementById('stage');
      stage.innerHTML = '<mo-press><button>Press</button></mo-press>';
      if (aliasesFirst) defineMoAliases();
      lite.defineComponents(['interaction']);
      if (!aliasesFirst) defineMoAliases();
    }, aliasesFirst);
    await expect.poll(() => requests.length).toBe(1);
    await expect(page.locator('link[data-usa-css]')).toHaveCount(0);

    await page.evaluate(() => {
      const legacy = document.createElement('usa-press');
      document.getElementById('stage').append(legacy, document.createElement('usa-press'));
    });
    await expect(page.locator('mo-press')).toHaveCSS('display', 'inline-block');
    await expect(page.locator('usa-press').first()).toHaveCSS('display', 'inline-block');
    await expect(page.locator('link[data-usa-css]')).toHaveCount(1);
    await expect(page.locator('link[data-usa-css]')).toHaveAttribute('href', /\/components\/interaction\.css$/);

    await page.evaluate(() => {
      const alias = document.querySelector('mo-press');
      alias.remove();
      document.getElementById('stage').append(alias);
    });
    const button = page.getByRole('button', { name: 'Press' });
    await button.focus();
    await page.keyboard.down('Space');
    await expect(page.locator('mo-press')).toHaveAttribute('data-pressed', '');
    await page.keyboard.up('Space');
    await expect(page.locator('mo-press')).not.toHaveAttribute('data-pressed', '');
    await expect(button).toBeFocused();
    expect(requests).toHaveLength(2);
    expectNoErrors(page);
  });
}
