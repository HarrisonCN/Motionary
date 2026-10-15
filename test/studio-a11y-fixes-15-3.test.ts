// 15.3 Studio a11y fixes found by the axe / keyboard browser spec (v15.3.0/bspec-failing-before.log):
// the curve editor's <svg> holds focusable handles, so it is role="group" (role="img" makes its children
// presentational → axe nested-interactive); the app ships a visible :focus-visible ring (2px outline + offset).
import { describe, it, expect } from 'vitest';
import { createStudioApp } from '../src/components/studio/app';

const stage = () => { const s = document.createElement('div'); s.innerHTML = '<div id="a"></div>'; document.body.append(s); return s; };
const mount = () => { const r = document.createElement('div'); document.body.append(r); return r; };

describe('15.3 Studio a11y fixes', () => {
  it('curve editor svg is a group (its handles stay interactive), never role=img', async () => {
    const app = await createStudioApp(mount(), { stage: stage(), name: 'a11y' });
    const svgs = [...document.querySelectorAll('.usa-studio-app svg[aria-label^="Curve"]')];
    expect(svgs.length).toBeGreaterThan(0);
    for (const s of svgs) expect(s.getAttribute('role')).toBe('group');
    app.destroy();
  });
  it('app carries a :focus-visible rule with a 2px outline and an offset', async () => {
    const root = mount();
    const app = await createStudioApp(root, { stage: stage(), name: 'a11y' });
    const css = [...root.querySelectorAll('style')].map((s) => s.textContent).join('\n');
    expect(css).toMatch(/\.usa-studio-app[^{]*:focus-visible\s*\{[^}]*outline:\s*2px solid[^}]*outline-offset:\s*2px/);
    app.destroy();
  });
});
