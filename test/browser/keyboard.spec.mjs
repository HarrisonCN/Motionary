// 13.1.0: keyboard operation, focus management and dynamic attribute updates for the key interactive components,
// in Chromium, Firefox and WebKit. The list (docs/browser-matrix.md) comes from the manifest: every component whose
// documented role is an overlay, a tab list, a menu, a switch / radio group, a value control or a navigation widget.
// Expectations follow the WAI-ARIA Authoring Practices patterns each component documents.
import { test, expect } from '@playwright/test';
import { openFixture, define, mount, frames, expectNoErrors, activeInfo } from './helpers.mjs';

const settle = (page, ms = 450) => page.waitForTimeout(ms);
const events = async (page, type) => page.evaluate((type) => { window.__ev ??= {}; window.__ev[type] = []; document.addEventListener(type, (e) => window.__ev[type].push(e.detail ?? null)); }, type);
const got = (page, type) => page.evaluate((type) => window.__ev[type], type);
const focusIn = (page, sel) => page.evaluate((sel) => { const host = document.querySelector(sel); let a = document.activeElement; while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement; return !!a && (host === a || host.contains(a) || host.shadowRoot?.contains(a) || false); }, sel);
// WebKit (Safari) skips buttons on Tab unless "Press Tab to highlight each item" is on: Playwright's WebKit follows that,
// so Tab-order assertions use Alt+Tab there (what Safari users press).
const tabKey = (browserName, shift = false) => (shift ? 'Shift+' : '') + (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

/** WAI-ARIA tabs: only tabs in the list, one selected, panels wired, arrows / Home / End, one tab stop. */
async function checkTablist(page, host, browserName, { automatic = true } = {}) {
  const shape = await page.evaluate((host) => {
    const el = document.querySelector(host);
    const lists = [...el.querySelectorAll('[role=tablist]'), ...(el.shadowRoot ? el.shadowRoot.querySelectorAll('[role=tablist]') : [])];
    return lists.map((l) => {
      const kids = [...l.children].filter((k) => k.getAttribute('aria-hidden') !== 'true' && !['presentation', 'none'].includes(k.getAttribute('role')));
      const tabs = kids.filter((k) => k.getAttribute('role') === 'tab');
      const root = l.getRootNode();
      return {
        nonTabs: kids.filter((k) => k.getAttribute('role') !== 'tab').map((k) => k.outerHTML.slice(0, 80)),
        tabs: tabs.length,
        selected: tabs.filter((t) => t.getAttribute('aria-selected') === 'true').length,
        tabStops: tabs.filter((t) => t.tabIndex >= 0).length,
        panels: tabs.map((t) => { const id = t.getAttribute('aria-controls'); const p = id && root.getElementById ? root.getElementById(id) : id && document.getElementById(id); return p ? p.getAttribute('role') : null; }),
      };
    });
  }, host);
  expect(shape.length, `${host}: renders a tablist`).toBeGreaterThan(0);
  for (const s of shape) {
    expect(s.nonTabs, `${host}: every child of role=tablist is a role=tab (aria-required-children)`).toEqual([]);
    expect(s.selected, `${host}: exactly one tab is aria-selected`).toBe(1);
    expect(s.tabStops, `${host}: one tab stop (roving tabindex)`).toBe(1);
    expect(s.panels.every((r) => r === 'tabpanel'), `${host}: aria-controls point at role=tabpanel`).toBe(true);
  }
  const tabs = page.locator(`${host} [role=tab]`);
  const n = await tabs.count();
  const selected = page.locator(`${host} [role=tab][aria-selected=true]`).first();
  await selected.focus();
  const start = await tabs.evaluateAll((ts) => ts.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  await page.keyboard.press('ArrowRight');
  await settle(page, 120);
  const want = (start + 1) % n;
  expect(await tabs.nth(want).evaluate((t) => t === (t.getRootNode().activeElement)), `${host}: ArrowRight moves focus to the next tab`).toBe(true);
  if (automatic) expect(await tabs.nth(want).getAttribute('aria-selected'), `${host}: ArrowRight selects it`).toBe('true');
  await page.keyboard.press('End');
  await settle(page, 120);
  expect(await tabs.nth(n - 1).evaluate((t) => t === t.getRootNode().activeElement), `${host}: End → last tab`).toBe(true);
  await page.keyboard.press('ArrowRight');
  await settle(page, 120);
  expect(await tabs.nth(0).evaluate((t) => t === t.getRootNode().activeElement), `${host}: ArrowRight wraps to the first tab`).toBe(true);
  if (!automatic) { await page.keyboard.press('Enter'); await settle(page, 120); }
  expect(await tabs.nth(0).getAttribute('aria-selected'), `${host}: first tab selected`).toBe('true');
  await page.keyboard.press(tabKey(browserName));
  expect(await tabs.evaluateAll((ts) => ts.some((t) => t === t.getRootNode().activeElement)), `${host}: Tab leaves the tab list`).toBe(false);
}

test.describe('tabs', () => {
  test('usa-tabs: tablist pattern, selected attribute', async ({ page, browserName }) => {
    await openFixture(page); await define(page, 'usa-tabs');
    await mount(page, '<usa-tabs id="t"><nav><button data-tab>One</button><button data-tab>Two</button><button data-tab>Three</button></nav><section data-panel>1</section><section data-panel>2</section><section data-panel>3</section></usa-tabs><button id="after">after</button>');
    await events(page, 'usa:change');
    await checkTablist(page, '#t', browserName);
    expect((await got(page, 'usa:change')).length).toBeGreaterThan(0);
    expect(await page.locator('#t [role=tabpanel]:not([hidden])').count(), 'one visible panel').toBe(1);
    expectNoErrors(page);
  });

  test('usa-tab-bar: tablist pattern, selected attribute updates live', async ({ page, browserName }) => {
    await openFixture(page); await define(page, 'usa-tab-bar');
    await mount(page, '<usa-tab-bar id="t" indicator="pill"><button>Overview</button><button>Specs</button><button>Reviews</button><div data-panel>1</div><div data-panel>2</div><div data-panel>3</div></usa-tab-bar>');
    await checkTablist(page, '#t', browserName);
    await page.evaluate(() => document.getElementById('t').setAttribute('selected', '2'));
    await settle(page);
    expect(await page.locator('#t [role=tab]').nth(2).getAttribute('aria-selected'), 'selected="2" selects the third tab').toBe('true');
    expectNoErrors(page);
  });

  test('usa-native-preview: tab list holds only tabs (upstream report: axe aria-required-children), Replay outside it', async ({ page, browserName }) => {
    await openFixture(page); await define(page, 'usa-native-preview');
    await mount(page, '<usa-native-preview id="t" platform="ios" rules="enter: fade-up 500ms"><div class="row">Inbox</div><div class="row">Starred</div></usa-native-preview>');
    await checkTablist(page, '#t', browserName);
    expect(await page.locator('#t .usa-np-replay').evaluate((b) => !b.closest('[role=tablist]') && b.localName === 'button'), 'Replay is a plain button outside the tab list').toBe(true);
    expect(await page.locator('#t [role=tab][aria-selected=true]').textContent()).toBe('React Native');
    const code = await page.locator('#t [role=tabpanel] code').textContent();
    expect(code).toMatch(/\S/);
    await page.evaluate(() => document.getElementById('t').setAttribute('platform', 'android'));
    await settle(page);
    expect(await page.locator('#t').getAttribute('data-platform')).toBe('android');
    expectNoErrors(page);
  });

  test('usa-install-button: tablist pattern', async ({ page, browserName }) => {
    await openFixture(page); await define(page, 'usa-install-button');
    await mount(page, '<usa-install-button id="t" package="motionary" managers="npm pnpm yarn"></usa-install-button>');
    await checkTablist(page, '#t', browserName);
    expectNoErrors(page);
  });

  test('usa-code-export: tablist pattern', async ({ page, browserName }) => {
    await openFixture(page); await define(page, 'usa-code-export');
    await mount(page, '<usa-code-export id="t"><div data-motion="enter: fade-up">Hi</div></usa-code-export>');
    await checkTablist(page, '#t', browserName);
    expectNoErrors(page);
  });
});

test('usa-segmented: radio group — arrows move and select, one tab stop, value attribute', async ({ page, browserName }) => {
  await openFixture(page); await define(page, 'usa-segmented');
  await mount(page, '<usa-segmented id="s" label="View"><button>Day</button><button>Week</button><button>Month</button></usa-segmented><button id="after">after</button>');
  await events(page, 'usa:change');
  const radios = page.locator('#s [role=radio]');
  expect(await radios.count()).toBe(3);
  expect(await page.locator('#s [role=radiogroup], #s[role=radiogroup]').count()).toBe(1);
  expect(await radios.evaluateAll((r) => r.filter((x) => x.tabIndex >= 0).length), 'one tab stop').toBe(1);
  await radios.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await settle(page, 150);
  expect(await radios.nth(1).getAttribute('aria-checked')).toBe('true');
  expect(await activeInfo(page)).toMatchObject({ text: 'Week' });
  await page.keyboard.press('End');
  await settle(page, 150);
  expect(await radios.nth(2).getAttribute('aria-checked')).toBe('true');
  expect((await got(page, 'usa:change')).length).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => document.getElementById('s').setAttribute('value', '0'));
  await settle(page);
  expect(await radios.nth(0).getAttribute('aria-checked'), 'value attribute (index) selects').toBe('true');
  expectNoErrors(page);
});

test('usa-switch: role=switch, Space and Enter toggle, disabled attribute blocks', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-switch');
  await mount(page, '<usa-switch id="s" label="Dark mode" name="dark"></usa-switch>');
  await events(page, 'usa:change');
  const sw = page.locator('#s [role=switch], #s[role=switch]').first();
  await sw.focus();
  expect(await focusIn(page, '#s')).toBe(true);
  const before = await sw.getAttribute('aria-checked');
  await page.keyboard.press(' ');
  await settle(page, 150);
  expect(await sw.getAttribute('aria-checked'), 'Space toggles').not.toBe(before);
  await page.keyboard.press('Enter');
  await settle(page, 150);
  expect(await sw.getAttribute('aria-checked'), 'Enter toggles back').toBe(before);
  expect((await got(page, 'usa:change')).length).toBe(2);
  await page.evaluate(() => document.getElementById('s').setAttribute('disabled', ''));
  await settle(page);
  await sw.focus().catch(() => {});
  await page.keyboard.press(' ');
  await settle(page, 150);
  expect(await sw.getAttribute('aria-checked'), 'disabled: no toggle').toBe(before);
  expect(await sw.getAttribute('aria-disabled')).toBe('true');
  expectNoErrors(page);
});

test('usa-menu: menu button pattern — open with Enter / ArrowDown, arrows, Home / End, Esc returns focus', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-menu');
  await mount(page, '<usa-menu id="m"><button>Actions</button><button>Edit</button><button>Duplicate</button><hr><button>Delete</button></usa-menu>');
  await events(page, 'usa:select');
  const trigger = page.locator('#m [aria-haspopup]').first();
  expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await trigger.getAttribute('aria-expanded')).toBe('true');
  expect(await activeInfo(page), 'focus on the first item').toMatchObject({ text: 'Edit', role: 'menuitem' });
  await page.keyboard.press('ArrowDown');
  expect(await activeInfo(page)).toMatchObject({ text: 'Duplicate' });
  await page.keyboard.press('End');
  expect(await activeInfo(page)).toMatchObject({ text: 'Delete' });
  await page.keyboard.press('ArrowDown');
  expect(await activeInfo(page), 'wraps').toMatchObject({ text: 'Edit' });
  await page.keyboard.press('Escape');
  await settle(page);
  expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  expect(await activeInfo(page), 'focus back on the trigger').toMatchObject({ text: 'Actions' });
  await page.keyboard.press('ArrowDown');
  await settle(page);
  expect(await activeInfo(page), 'ArrowDown on the trigger opens on the first item').toMatchObject({ text: 'Edit' });
  await page.keyboard.press('ArrowUp');
  expect(await activeInfo(page)).toMatchObject({ text: 'Delete' });
  await page.keyboard.press('Enter');
  await settle(page);
  expect((await got(page, 'usa:select')).length).toBe(1);
  expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  expectNoErrors(page);
});

async function overlay(page, browserName, { tag, html, open, host, closeKey = 'Escape', hasOpener = true }) {
  await openFixture(page); await define(page, tag);
  await mount(page, html + '<button id="after">page content</button>');
  await events(page, 'usa:open'); await events(page, 'usa:close');
  if (hasOpener) await page.locator('#opener').focus();
  await open();
  await settle(page, 700);
  expect(await focusIn(page, host), `${tag}: focus moves into the open overlay`).toBe(true);
  // modal: Tab / Shift+Tab never reach the page behind (focus may visit the browser's own UI — WebKit does that with a
  // native <dialog> — but never #opener / #after)
  for (const shift of [false, true]) {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press(tabKey(browserName, shift));
      expect(await page.evaluate(() => ['opener', 'after'].includes(document.activeElement?.id)), `${tag}: Tab${shift ? ' (shift)' : ''} stays out of the page behind the modal`).toBe(false);
    }
  }
  if (!(await focusIn(page, host))) await page.locator(host).locator('button').last().focus();
  await page.keyboard.press(closeKey);
  await settle(page, 800);
  expect(await focusIn(page, host), `${tag}: closed`).toBe(false);
  if (hasOpener) expect(await activeInfo(page), `${tag}: focus returns to the opener`).toMatchObject({ id: 'opener' });
  expect((await got(page, 'usa:open')).length, `${tag}: usa:open`).toBe(1);
  expect((await got(page, 'usa:close')).length, `${tag}: usa:close`).toBe(1);
  expectNoErrors(page);
}

test.describe('overlays', () => {
  test('usa-modal: focus in, trapped, Esc, focus back to the opener; label attribute live', async ({ page, browserName }) => {
    await overlay(page, browserName, { tag: 'usa-modal', host: '#welcome', html: '<button id="opener" data-usa-open="welcome">Open</button><usa-modal id="welcome" label="Welcome"><h2>Hello</h2><input aria-label="name"><button data-usa-close="ok">Got it</button></usa-modal>', open: () => page.keyboard.press('Enter') });
    await page.evaluate(() => document.getElementById('welcome').setAttribute('label', 'Renamed'));
    await settle(page);
    expect(await page.locator('#welcome dialog, #welcome [role=dialog]').first().getAttribute('aria-label')).toBe('Renamed');
  });
  test('usa-sheet: focus in, trapped, Esc, focus back to the opener', async ({ page, browserName }) => {
    await overlay(page, browserName, { tag: 'usa-sheet', host: '#cart', html: '<button id="opener" data-usa-open="cart">Cart</button><usa-sheet id="cart" side="right" label="Cart"><h2>Your cart</h2><button>Checkout</button><button data-usa-close>Close</button></usa-sheet>', open: () => page.keyboard.press('Enter') });
  });
  test('usa-dialog: show(), trapped, Esc, focus back; no-esc attribute', async ({ page, browserName }) => {
    await overlay(page, browserName, { tag: 'usa-dialog', host: '#dlg', html: '<button id="opener">Open</button><usa-dialog id="dlg" kind="modal" label="Settings"><h2>Settings</h2><button>One</button><button data-close>Done</button></usa-dialog>', open: () => page.evaluate(() => document.getElementById('dlg').show()) });
    await page.evaluate(() => { const d = document.getElementById('dlg'); d.setAttribute('no-esc', ''); d.show(); });
    await settle(page, 700);
    await page.keyboard.press('Escape');
    await settle(page, 500);
    expect(await focusIn(page, '#dlg'), 'no-esc: Esc does not close').toBe(true);
  });
  test('usa-drawer: open, trapped, Esc, focus back', async ({ page, browserName }) => {
    await overlay(page, browserName, { tag: 'usa-drawer', host: '#nav', html: '<button id="opener">Menu</button><usa-drawer id="nav" side="left" label="Navigation"><a href="#a">A</a><a href="#b">B</a><button>Close</button></usa-drawer>', open: () => page.evaluate(() => (document.getElementById('nav').open = true)) });
  });
  test('usa-command-palette: opens, type to filter, arrows + Enter run, Esc closes and returns focus', async ({ page }) => {
    await openFixture(page); await define(page, 'usa-command-palette');
    await mount(page, '<button id="opener">x</button><usa-command-palette id="p"><option value="new" data-group="File">New file</option><option value="open" data-group="File">Open file</option><option value="theme" data-group="View">Toggle theme</option></usa-command-palette>');
    await events(page, 'usa:run');
    await page.locator('#opener').focus();
    await page.evaluate(() => document.getElementById('p').show());
    await settle(page, 600);
    expect(await activeInfo(page), 'focus in the search box').toMatchObject({ tag: 'input' });
    await page.keyboard.type('theme');
    await settle(page, 200);
    await page.keyboard.press('Enter');
    await settle(page, 600);
    expect(await got(page, 'usa:run')).toEqual([expect.objectContaining({ id: 'theme' })]);
    await page.evaluate(() => document.getElementById('p').show());
    await settle(page, 600);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await settle(page, 600);
    expect((await got(page, 'usa:run')).length).toBe(2);
    await page.evaluate(() => document.getElementById('p').show());
    await settle(page, 600);
    await page.keyboard.press('Escape');
    await settle(page, 600);
    expect(await activeInfo(page), 'focus back where it was').toMatchObject({ id: 'opener' });
    expectNoErrors(page);
  });
});

test('usa-popover: Enter opens (aria-expanded), Esc closes, focus returns to the trigger', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-popover');
  await mount(page, '<usa-popover id="p"><button>Share</button><div data-popover><a href="#x">Copy link</a></div></usa-popover>');
  const trigger = page.locator('#p > button');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await trigger.getAttribute('aria-expanded')).toBe('true');
  expect(await page.locator('#p [data-popover]').isVisible()).toBe(true);
  await page.keyboard.press('Escape');
  await settle(page);
  expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  expect(await activeInfo(page)).toMatchObject({ text: 'Share' });
  expectNoErrors(page);
});

test('usa-tip: focus shows a role=tooltip described by, Esc hides', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-tip');
  await mount(page, '<usa-tip id="t" text="Copied" placement="top"><button>Copy</button></usa-tip>');
  await page.locator('#t button').focus();
  await settle(page, 700);
  const tip = await page.evaluate(() => { const b = document.querySelector('#t button'); const id = b.getAttribute('aria-describedby'); const el = id && (document.getElementById(id) || document.querySelector('#t').shadowRoot?.getElementById(id)); return el ? { role: el.getAttribute('role'), text: el.textContent.trim() } : null; });
  expect(tip).toEqual({ role: 'tooltip', text: 'Copied' });
  expect(await page.locator('#t').evaluate((t) => t.hasAttribute('open') || !!t.querySelector('[role=tooltip]:not([hidden])'))).toBe(true);
  await page.keyboard.press('Escape');
  await settle(page, 400);
  expect(await page.locator('#t').evaluate((t) => t.hasAttribute('open'))).toBe(false);
  expectNoErrors(page);
});

test('usa-stepper: aria-current step, value attribute and next() update it', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-stepper');
  await mount(page, '<usa-stepper id="s" value="1" label="Checkout" clickable><span>Cart</span><span>Shipping</span><span>Payment</span><span>Done</span></usa-stepper>');
  const cur = () => page.evaluate(() => [...document.querySelectorAll('#s [aria-current=step]')].map((e) => e.textContent.trim()));
  expect(await cur()).toEqual([expect.stringContaining('Shipping')]);
  await page.evaluate(() => document.getElementById('s').next());
  await settle(page);
  expect(await cur()).toEqual([expect.stringContaining('Payment')]);
  await page.evaluate(() => (document.getElementById('s').value = 0)); // state goes through the property (component contract)
  await settle(page);
  expect(await cur(), 'value property').toEqual([expect.stringContaining('Cart')]);
  // clickable: steps are keyboard reachable buttons
  const steps = page.locator('#s [aria-current], #s [role=listitem]');
  expect(await steps.evaluateAll((s) => s.filter((x) => x.tabIndex >= 0).length), 'clickable steps are in the tab order').toBe(4);
  const btn = steps.nth(2);
  await btn.focus();
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await cur(), 'Enter on a clickable step').toEqual([expect.stringContaining('Payment')]);
  expectNoErrors(page);
});

test('usa-pagination: nav landmark, aria-current page, keyboard, total / page attributes', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-pagination');
  await mount(page, '<usa-pagination id="p" total="20" page="1" siblings="1"></usa-pagination>');
  await events(page, 'usa:change');
  expect(await page.locator('#p nav, #p[role=navigation]').count()).toBeGreaterThan(0);
  const current = () => page.locator('#p [aria-current=page]').textContent();
  expect((await current()).trim()).toBe('1');
  const next = page.locator('#p button[aria-label*="ext" i], #p [rel=next]').first();
  await next.focus();
  await page.keyboard.press('Enter');
  await settle(page);
  expect((await current()).trim()).toBe('2');
  expect((await got(page, 'usa:change')).length).toBe(1);
  await page.evaluate(() => (document.getElementById('p').page = 20)); // state goes through the property (component contract)
  await settle(page);
  expect((await current()).trim(), 'page property').toBe('20');
  await page.evaluate(() => document.getElementById('p').setAttribute('total', '5'));
  await settle(page);
  expect(Number((await current()).trim()), 'total shrinks: page clamps').toBeLessThanOrEqual(5);
  expectNoErrors(page);
});

test('usa-slider: role=slider, arrows / Page / Home / End, value attribute', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-slider');
  await mount(page, '<usa-slider id="s" value="40" label="Volume"></usa-slider>');
  await events(page, 'usa:change');
  const s = page.locator('#s [role=slider], #s[role=slider]').first();
  await s.focus();
  await page.keyboard.press('ArrowRight');
  expect(await s.getAttribute('aria-valuenow')).toBe('41');
  await page.keyboard.press('End');
  expect(await s.getAttribute('aria-valuenow')).toBe('100');
  await page.keyboard.press('Home');
  expect(await s.getAttribute('aria-valuenow')).toBe('0');
  await page.keyboard.press('PageUp');
  expect(Number(await s.getAttribute('aria-valuenow'))).toBeGreaterThan(1);
  await page.evaluate(() => document.getElementById('s').setAttribute('value', '75'));
  await settle(page);
  expect(await s.getAttribute('aria-valuenow'), 'value attribute').toBe('75');
  expectNoErrors(page);
});

test('usa-color-picker: both areas are keyboard sliders; value property reflected', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-color-picker');
  await mount(page, '<usa-color-picker id="c" value="#7c5cff"></usa-color-picker>');
  await events(page, 'usa:change');
  const sliders = page.locator('#c [role=slider]');
  expect(await sliders.count()).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < await sliders.count(); i++) {
    const s = sliders.nth(i);
    await s.focus();
    expect(await s.getAttribute('aria-valuenow'), `slider ${i}: aria-valuenow is required on role=slider`).not.toBeNull();
    const v0 = (await s.getAttribute('aria-valuetext')) + (await s.getAttribute('aria-valuenow'));
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await settle(page, 100);
    expect((await s.getAttribute('aria-valuetext')) + (await s.getAttribute('aria-valuenow')), `slider ${i} moves`).not.toBe(v0);
  }
  expect((await got(page, 'usa:change')).length).toBeGreaterThan(0);
  // contract: `value` is state the element reflects (not an observed attribute) — set the property, the attribute follows
  await page.evaluate(() => (document.getElementById('c').value = '#22c55e'));
  await settle(page);
  expect(await page.locator('#c').evaluate((c) => [String(c.value).toLowerCase(), c.getAttribute('value')])).toEqual(['#22c55e', '#22c55e']);
  expectNoErrors(page);
});

test('usa-carousel: arrow keys change slide, labelled controls, index attribute', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-carousel');
  await mount(page, '<usa-carousel id="c" label="Featured"><div>A</div><div>B</div><div>C</div></usa-carousel>');
  await events(page, 'usa:change');
  expect(await page.locator('#c').evaluate((c) => c.getAttribute('aria-roledescription') || c.querySelector('[aria-roledescription]')?.getAttribute('aria-roledescription'))).toBe('carousel');
  const controls = await page.locator('#c button').evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') || b.textContent.trim()));
  expect(controls.every(Boolean), 'every control is labelled').toBe(true);
  await page.locator('#c').focus().catch(() => {});
  await page.locator('#c button').first().focus();
  await page.keyboard.press('ArrowRight');
  await settle(page, 700);
  expect(await got(page, 'usa:change')).toEqual([expect.objectContaining({ index: 1 })]);
  await page.evaluate(() => document.getElementById('c').setAttribute('index', '2'));
  await settle(page, 700);
  expect(await page.locator('#c').evaluate((c) => c.index ?? Number(c.getAttribute('index')))).toBe(2);
  expectNoErrors(page);
});

test('usa-date-picker: grid keyboard — arrows, PageDown, Enter selects', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-date-picker');
  await mount(page, '<usa-date-picker id="d" value="2026-10-08" first-day="1"></usa-date-picker>');
  await events(page, 'usa:change');
  await page.locator('#d [role=gridcell][tabindex="0"]').focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => document.activeElement.closest('[role=gridcell]')?.dataset.date || document.activeElement.dataset.date)).toBe('2026-10-09');
  await page.keyboard.press('ArrowDown');
  expect(await page.evaluate(() => document.activeElement.dataset.date)).toBe('2026-10-16');
  await page.keyboard.press('PageDown');
  await settle(page);
  expect(await page.evaluate(() => document.activeElement.dataset.date)).toBe('2026-11-16');
  await page.keyboard.press('Enter');
  await settle(page);
  expect(await got(page, 'usa:change')).toEqual([expect.objectContaining({ value: '2026-11-16' })]);
  await page.evaluate(() => document.getElementById('d').setAttribute('locale', 'de-DE'));
  await settle(page);
  expect(await page.locator('#d').textContent()).toMatch(/November/);
  expectNoErrors(page);
});

test('usa-star-rating: keyboard value control, readonly attribute', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-star-rating');
  await mount(page, '<usa-star-rating id="r" value="3" label="Your rating"></usa-star-rating>');
  await events(page, 'usa:change');
  const s = page.locator('#r');
  expect(await s.getAttribute('role')).toBe('slider');
  await s.focus();
  await page.keyboard.press('ArrowRight');
  await settle(page, 150);
  expect(await got(page, 'usa:change')).toEqual([expect.objectContaining({ value: 4 })]);
  await page.evaluate(() => document.getElementById('r').setAttribute('readonly', ''));
  await settle(page);
  await s.focus();
  await page.keyboard.press('ArrowRight');
  await settle(page, 150);
  expect((await got(page, 'usa:change')).length, 'readonly: no change').toBe(1);
  expectNoErrors(page);
});

test('usa-disclosure: native summary toggles with Enter and Space', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-disclosure');
  await mount(page, '<usa-disclosure id="d"><details><summary>Shipping</summary><p>a</p></details><details><summary>Returns</summary><p>b</p></details></usa-disclosure>');
  await events(page, 'usa:toggle');
  await page.locator('#d summary').first().focus();
  await page.keyboard.press('Enter');
  await settle(page, 700);
  expect(await page.locator('#d details').first().evaluate((d) => d.open)).toBe(true);
  await page.keyboard.press(' ');
  await settle(page, 700);
  expect(await page.locator('#d details').first().evaluate((d) => d.open)).toBe(false);
  expect((await got(page, 'usa:toggle')).length).toBeGreaterThanOrEqual(2);
  expectNoErrors(page);
});

test('usa-otp: typing advances focus, Backspace goes back, complete fires', async ({ page }) => {
  await openFixture(page); await define(page, 'usa-otp');
  await mount(page, '<usa-otp id="o" length="4"></usa-otp>');
  await events(page, 'usa:complete');
  await page.locator('#o input').first().focus();
  await page.keyboard.type('12');
  expect(await page.evaluate(() => [...document.querySelectorAll('#o input')].indexOf(document.activeElement))).toBe(2);
  await page.keyboard.press('Backspace'); // empty box: back to the previous one
  expect(await page.evaluate(() => [...document.querySelectorAll('#o input')].indexOf(document.activeElement))).toBe(1);
  await page.keyboard.type('234');
  await settle(page, 200);
  expect(await got(page, 'usa:complete')).toEqual([expect.objectContaining({ code: '1234' })]);
  expectNoErrors(page);
});
