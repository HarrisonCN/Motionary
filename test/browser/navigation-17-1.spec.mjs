import { test, expect } from '@playwright/test';
import { openFixture, define, mount, frames, expectNoErrors } from './helpers.mjs';

const html = '<usa-liquid-nav id="nav" label="Primary"><button>A</button><button disabled>B</button><button>C</button><button>D</button></usa-liquid-nav>';
const alignment = (vertical) => {
  const nav = document.getElementById('nav');
  const item = nav.querySelector('[aria-current="page"]').getBoundingClientRect();
  const drop = nav.querySelector('.usa-lq-drop').getBoundingClientRect();
  return Math.abs(vertical ? drop.y + drop.height / 2 - item.y - item.height / 2 : drop.x + drop.width / 2 - item.x - item.width / 2);
};

test('liquid nav keeps value, vertical geometry and keyboard focus in sync', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-liquid-nav');
  await mount(page, html);
  await page.locator('#nav').evaluate((nav) => {
    nav.setAttribute('value', '2');
    nav.setAttribute('orientation', 'vertical');
  });
  await expect(page.locator('#nav button').nth(2)).toHaveAttribute('aria-current', 'page');
  expect(await page.evaluate(alignment, true)).toBeLessThan(1);
  await page.locator('#nav button').first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#nav button').nth(2)).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#nav button').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#nav button').first()).toBeFocused();
  await page.locator('#nav').evaluate((nav) => {
    nav.removeAttribute('orientation');
    nav.style.direction = 'rtl';
  });
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#nav button').nth(2)).toBeFocused();
  expectNoErrors(page);
});

test('rapid liquid selections continue from the visible drop and cancel on disconnect', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-liquid-nav');
  await mount(page, html);
  const delta = await page.evaluate(() => {
    const nav = document.getElementById('nav');
    const buttons = nav.querySelectorAll('button');
    buttons[2].click();
    const drop = nav.querySelector('.usa-lq-drop');
    drop.getAnimations().forEach((a) => { a.pause(); a.currentTime = 240; });
    const before = drop.getBoundingClientRect().x;
    buttons[3].click();
    return Math.abs(before - drop.getBoundingClientRect().x);
  });
  expect(delta).toBeLessThan(1);
  await page.waitForTimeout(850);
  expect(await page.evaluate(alignment, false)).toBeLessThan(1);
  await page.locator('#nav').evaluate((nav) => {
    nav.querySelector('button').click();
    nav.remove();
    window.__detachedNav = nav;
  });
  expect(await page.evaluate(() => window.__detachedNav.getAnimations({ subtree: true }).length)).toBe(0);
  expectNoErrors(page);
});

test('liquid indicator follows item resizing and honours reduced motion', async ({ page }) => {
  await openFixture(page, { reducedMotion: 'reduce' });
  await define(page, 'usa-liquid-nav');
  await mount(page, html);
  await page.locator('#nav button').last().click();
  await page.locator('#nav button').first().evaluate((item) => { item.style.paddingInline = '70px'; });
  await expect.poll(() => page.evaluate(alignment, false)).toBeLessThan(1);
  expect(await page.locator('#nav').evaluate((nav) => nav.getAnimations({ subtree: true }).filter((a) => a.effect.getKeyframes().some((f) => 'transform' in f)).length)).toBe(0);
  expectNoErrors(page);
});

test('press reconnect and queued magnetic blur leave no stale interaction state', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-press', 'usa-magnetic');
  await mount(page, '<usa-press id="press"><button>Save</button></usa-press><usa-magnetic id="magnetic"><button>Go</button></usa-magnetic>');
  await page.evaluate(() => {
    const press = document.getElementById('press');
    press.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0 }));
    press.remove();
    document.getElementById('stage').append(press);
    const r = document.getElementById('magnetic').getBoundingClientRect();
    document.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 }));
    window.dispatchEvent(new Event('blur'));
  });
  await frames(page);
  await expect(page.locator('#press')).not.toHaveAttribute('data-pressed');
  await expect(page.locator('#magnetic')).not.toHaveAttribute('data-active');
  expectNoErrors(page);
});
