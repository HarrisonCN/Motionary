import { test, expect } from '@playwright/test';
import { openFixture, define, mount, frames, expectNoErrors } from './helpers.mjs';

// 17.3 Navigation I: real-browser checks for <mo-mega-menu>, <mo-nav-flyout>, <mo-fullscreen-menu>, <mo-breadcrumbs>
// and the motionary/fx/hover pack — geometry of the shared surface, keyboard, focus containment, reduced motion.
const NAV = (tag) => `<${tag} id="nav" label="Primary" style="width:640px">
  <div><button id="t0">Products</button><div data-panel style="width:${tag === 'mo-nav-flyout' ? 220 : 'auto'}px"><a href="#a" id="a0">SDK</a><a href="#b">CLI</a><a href="#c">API</a></div></div>
  <div><button id="t1">Resources</button><div data-panel style="width:${tag === 'mo-nav-flyout' ? 160 : 'auto'}px"><a href="#d" id="a1">Docs</a></div></div>
  <a href="#p" id="t2">Pricing</a>
</${tag}>`;

const bgMatchesPanel = () => {
  const nav = document.getElementById('nav');
  const bg = nav.querySelector('.usa-np-bg').getBoundingClientRect();
  const open = nav.querySelector('[data-open] > [data-panel]').getBoundingClientRect();
  return Math.max(Math.abs(bg.x - open.x), Math.abs(bg.y - open.y), Math.abs(bg.width - open.width), Math.abs(bg.height - open.height));
};

for (const [tag, usa] of [['mo-mega-menu', 'usa-mega-menu'], ['mo-nav-flyout', 'usa-nav-flyout']]) {
  test(`${tag}: keyboard, aria-expanded and the shared surface settle on the open panel`, async ({ page }) => {
    await openFixture(page);
    await define(page, usa);
    // A focusable element after the bar: Firefox keeps focus on the last element when Tab has nowhere to go in the page,
    // so "out of the bar" has to land somewhere real for the check to mean the same thing in every engine.
    await mount(page, NAV(tag) + '<button id="after">after</button>');
    await page.locator('#t0').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#t0')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#a0')).toBeFocused();
    await page.waitForTimeout(400);
    expect(await page.evaluate(bgMatchesPanel)).toBeLessThan(1.5);
    await page.keyboard.press('Escape');
    await expect(page.locator('#t0')).toBeFocused();
    await expect(page.locator('#t0')).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#t1')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#t1')).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(400);
    expect(await page.evaluate(bgMatchesPanel)).toBeLessThan(1.5);
    await page.keyboard.press('Tab'); // into the panel
    await page.keyboard.press('Tab'); // out of the panel to "Pricing"…
    await page.keyboard.press('Tab'); // …and out of the bar
    await expect(page.locator('#after')).toBeFocused();
    await expect(page.locator('#t1')).toHaveAttribute('aria-expanded', 'false');
    expectNoErrors(page);
  });

  test(`${tag}: hover intent opens, switching keeps one surface, leaving closes; reduced motion does not animate`, async ({ page }) => {
    await openFixture(page, { reducedMotion: 'reduce' });
    await define(page, usa);
    await mount(page, NAV(tag));
    await page.locator('#t0').hover();
    await expect(page.locator('#t0')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#t1').hover();
    await expect(page.locator('#t1')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#t0')).toHaveAttribute('aria-expanded', 'false');
    expect(await page.locator('#nav').evaluate((n) => n.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.evaluate(bgMatchesPanel)).toBeLessThan(1.5);
    await page.mouse.move(5, 700);
    await expect(page.locator('#t1')).toHaveAttribute('aria-expanded', 'false');
    expectNoErrors(page);
  });
}

test('mo-fullscreen-menu: dialog opens from the button, traps focus, Esc restores focus and scrolling', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-fullscreen-menu');
  await mount(page, '<mo-fullscreen-menu id="fm" label="Site menu"><a href="#h" id="l0">Home</a><a href="#w" id="l1">Work</a></mo-fullscreen-menu><button id="after">after</button>');
  const btn = page.locator('#fm .usa-fm-toggle');
  await btn.click();
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible();
  await expect(page.locator('#l0')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await page.keyboard.press('Tab');
  await expect(page.locator('#l1')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(btn).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#l0')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#fm .usa-fm-layer')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  expectNoErrors(page);
});

test('mo-breadcrumbs: collapsed middle expands by keyboard; set() keeps the shared prefix', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-breadcrumbs');
  await mount(page, '<mo-breadcrumbs id="bc" max="3"><a href="#1">Home</a><a href="#2">Docs</a><a href="#3">Components</a><a href="#4">Navigation</a><span>Breadcrumbs</span></mo-breadcrumbs>');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  const more = page.getByRole('button', { name: 'Show 2 more' });
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#bc a[href="#2"]')).toBeFocused();
  await expect(page.locator('#bc li:not([hidden])')).toHaveCount(5);
  const kept = await page.evaluate(() => {
    const bc = document.getElementById('bc');
    const first = bc.querySelector('li');
    bc.set([{ label: 'Home', href: '#1' }, { label: 'Blog', href: '#b' }]);
    return bc.querySelector('li') === first;
  });
  expect(kept).toBe(true);
  await expect(page.locator('#bc li:not(.usa-bc-out)')).toHaveCount(2);
  await expect(page.locator('#bc [aria-current="page"]')).toHaveText('Blog');
  expectNoErrors(page);
});

test('fx/hover: text-roll keeps the accessible name and restores the element on cleanup', async ({ page }) => {
  await openFixture(page);
  await mount(page, '<a id="l" href="#x" style="font-size:24px">View work</a>');
  const name = await page.evaluate(async () => {
    const url = URL.createObjectURL(new Blob(["import { registerHoverPack } from 'motionary/fx/hover'; import { bindEffect } from 'motionary/components/fx'; registerHoverPack(); window.__off = bindEffect(document.getElementById('l'), 'text-roll', { trigger: 'load' });"], { type: 'text/javascript' }));
    await import(url);
    return document.getElementById('l').innerText;
  });
  expect(name.replace(/\s+/g, ' ').trim()).toContain('View work');
  await expect(page.getByRole('link', { name: 'View work' })).toBeVisible();
  await page.locator('#l').hover();
  await frames(page, 4);
  await page.evaluate(() => window.__off());
  expect(await page.locator('#l').innerHTML()).toBe('View work');
  expectNoErrors(page);
});
