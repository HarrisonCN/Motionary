// 13.1.0: prefers-reduced-motion and every Motion Sensitivity level (full · gentle · minimal · static) in Chromium,
// Firefox and WebKit. Each interaction below is run under each setting; every Element.animate() call is recorded by
// the probe (test/browser/probe.js) and checked against docs/accessibility.md:
//   full     the component animates
//   gentle   no vestibular motion: no rotate / scale / skew / perspective / 3D transforms
//   minimal  opacity-only animations (components use their reduced-motion variants)
//   static   no animation at all; the end state is applied directly
//   reduce   prefers-reduced-motion: reduce (OS setting, default config): reduced variants — no movement, at most fades
// and in every mode the interaction reaches the same end state.
import { test, expect } from '@playwright/test';
import { openFixture, define, mount, expectNoErrors } from './helpers.mjs';

const VESTIBULAR = /rotate|scale|skew|perspective|matrix3d|3d\(/i;
const IDENTITY = /^(none|0|1|1 1|0px|0px 0px|scale\(1\)|translate\(0(px)?(,\s*0(px)?)?\)|translate[xy]\(0(px)?\))$/i;
// a keyframe property that moves, turns or resizes something (reduced motion allows fades and colour only)
const moving = ([k, v]) => (['transform', 'translate', 'rotate', 'scale'].includes(k) && !IDENTITY.test(String(v).trim())) || ['left', 'top', 'right', 'bottom', 'offsetDistance'].includes(k);

// interaction: markup, what to do, and the end state that must hold in every mode
const CASES = {
  'usa-tabs': {
    html: '<usa-tabs id="x"><nav><button data-tab>One</button><button data-tab>Two</button></nav><section data-panel>1</section><section data-panel>2</section></usa-tabs>',
    run: () => document.getElementById('x').select(1),
    end: () => document.querySelectorAll('#x [data-panel]')[1].hidden === false,
  },
  'usa-segmented': {
    html: '<usa-segmented id="x"><button>Day</button><button>Week</button></usa-segmented>',
    run: () => document.querySelectorAll('#x button')[1].click(),
    end: () => document.querySelectorAll('#x button')[1].getAttribute('aria-checked') === 'true',
  },
  'usa-modal': {
    html: '<usa-modal id="x" effect="flip" label="Hi"><p>Hello</p><button data-usa-close>OK</button></usa-modal>',
    run: () => document.getElementById('x').show(),
    end: () => !!document.querySelector('#x dialog[open], #x[open]'),
  },
  'usa-menu': {
    html: '<usa-menu id="x" effect="scale"><button>Actions</button><button>Edit</button><button>Copy</button></usa-menu>',
    run: () => document.getElementById('x').open(),
    end: () => document.querySelector('#x [aria-haspopup]').getAttribute('aria-expanded') === 'true',
  },
  'usa-carousel': {
    html: '<usa-carousel id="x" effect="cards" label="C"><div>A</div><div>B</div><div>C</div></usa-carousel>',
    run: () => document.getElementById('x').next(),
    end: () => document.getElementById('x').index === 1,
  },
  'usa-switch': {
    html: '<usa-switch id="x" variant="bounce" label="S"></usa-switch>',
    run: () => document.getElementById('x').click(),
    end: () => document.getElementById('x').getAttribute('aria-checked') === 'true',
  },
  'usa-stepper': {
    html: '<usa-stepper id="x" value="0"><span>A</span><span>B</span><span>C</span></usa-stepper>',
    run: () => document.getElementById('x').next(),
    end: () => document.querySelectorAll('#x [aria-current=step]')[0]?.textContent.includes('B'),
  },
  'usa-popover': {
    html: '<usa-popover id="x"><button>Share</button><div data-popover>Panel</div></usa-popover>',
    run: () => document.getElementById('x').toggle(),
    end: () => document.querySelector('#x > button').getAttribute('aria-expanded') === 'true',
  },
  'usa-disclosure': {
    html: '<usa-disclosure id="x"><details><summary>A</summary><p>a</p></details></usa-disclosure>',
    run: () => document.querySelector('#x summary').click(),
    end: () => document.querySelector('#x details').open,
  },
  'usa-dialog': {
    html: '<usa-dialog id="x" kind="drawer-right" label="D"><p>D</p></usa-dialog>',
    run: () => document.getElementById('x').show(),
    end: () => document.getElementById('x').hasAttribute('open') || !!document.querySelector('#x dialog[open]'),
  },
};

const MODES = [
  { name: 'full' }, { name: 'gentle' }, { name: 'minimal' }, { name: 'static' }, { name: 'reduce', media: 'reduce' },
];

for (const [tag, c] of Object.entries(CASES)) {
  test.describe(tag, () => {
    for (const mode of MODES) {
      test(`${mode.name}`, async ({ page }) => {
        await openFixture(page, { reducedMotion: mode.media || 'no-preference' });
        await define(page, tag);
        if (mode.name !== 'full' && !mode.media) {
          await page.evaluate(async (level) => (await import('motionary/components/a11y')).setMotionSensitivity(level), mode.name);
        }
        await mount(page, c.html);
        await page.waitForTimeout(150);
        await page.evaluate(() => { window.__probe.resetAnimations(); window.__transitions = 0; document.addEventListener('transitionrun', () => window.__transitions++, true); });
        await page.evaluate(`(${c.run})()`);
        await page.waitForTimeout(900);
        const anims = await page.evaluate(() => window.__probe.animations());
        const transitions = await page.evaluate(() => window.__transitions);
        const props = anims.flatMap((a) => a.frames.flatMap((f) => Object.entries(f)));
        const reduced = await page.evaluate((tag) => document.querySelector(tag).reduced, tag);
        expect(await page.evaluate(`(${c.end})()`), `${tag} reaches its end state (${mode.name})`).toBe(true);
        if (mode.name === 'full') {
          expect(anims.length + transitions, `${tag} animates with full motion (WAAPI or CSS transitions)`).toBeGreaterThan(0);
          expect(reduced).toBe(false);
        }
        if (mode.name === 'gentle') expect(props.filter(([k, v]) => k === 'rotate' || k === 'scale' || (k === 'transform' && VESTIBULAR.test(v))), `${tag}: no vestibular motion (gentle)`).toEqual([]);
        if (mode.name === 'minimal' || mode.name === 'reduce') {
          expect(reduced, `${tag}.reduced`).toBe(true);
          expect(props.filter(moving), `${tag}: no movement (${mode.name})`).toEqual([]);
        }
        if (mode.name === 'static') {
          expect(anims, `${tag}: no animation at all (static)`).toEqual([]);
          expect(transitions, `${tag}: no CSS transition (static)`).toBe(0);
        }
        expectNoErrors(page);
      });
    }
  });
}

test('setMotionSensitivity("static") also stops CSS animations and transitions (SENSITIVITY_CSS)', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-marquee');
  await page.evaluate(async () => (await import('motionary/components/a11y')).setMotionSensitivity('static'));
  await mount(page, '<usa-marquee id="m"><span>a</span><span>b</span></usa-marquee><div id="spin" style="animation:sp 1s infinite linear">x</div><style>@keyframes sp{to{transform:rotate(1turn)}}</style>');
  await page.waitForTimeout(300);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.constructor.name + ':' + (a.effect?.target?.localName || '')));
  expect(running).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.dataset.usaSensitivity)).toBe('static');
  await page.evaluate(async () => (await import('motionary/components/a11y')).setMotionSensitivity('full'));
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-usa-sensitivity'))).toBe(false);
  expectNoErrors(page);
});
