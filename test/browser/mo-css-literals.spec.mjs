import { test, expect } from '@playwright/test';
import { openFixture } from './helpers.mjs';

test('mo aliases preserve CSS attribute values and generated content when styles are copied', async ({ page }) => {
  await openFixture(page);
  const result = await page.evaluate(async () => {
    const { defineMoAliases } = await import('/dist/components/mo.js');
    defineMoAliases();
    const style = document.createElement('style');
    style.setAttribute('data-usa', 'css-literal-fixture');
    style.textContent = `
      /* usa-css-demo { illustrative selector } */
      usa-css-demo[data-kind="usa-tab"] { color: rgb(12, 34, 56); }
      usa-css-demo::before { content: ";usa-tab{literal}"; }
    `;
    document.head.append(style);
    customElements.define('usa-css-demo', class extends HTMLElement {});
    const original = document.createElement('usa-css-demo');
    const alias = document.createElement('mo-css-demo');
    for (const element of [original, alias]) {
      element.setAttribute('data-kind', 'usa-tab');
      document.getElementById('stage').append(element);
    }
    const inspect = (element) => ({
      color: getComputedStyle(element).color,
      content: getComputedStyle(element, '::before').content,
      attribute: element.getAttribute('data-kind'),
    });
    return { original: inspect(original), alias: inspect(alias) };
  });
  expect(result.alias).toEqual(result.original);
  expect(result.alias).toEqual({ color: 'rgb(12, 34, 56)', content: '";usa-tab{literal}"', attribute: 'usa-tab' });
});
