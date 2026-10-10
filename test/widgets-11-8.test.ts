// 11.8: non-breaking component-contract fixes (from the 11.7 audit).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { audit, summary } from '../scripts/contract-audit.mjs';
import { defineAnimIcon } from '../src/components/svg/anim-icon';
import { defineMarquee } from '../src/components/background/marquee';

const read = (f: string) => readFileSync(f, 'utf8');
const rows = audit();
const s = summary(rows);

describe('11.8: audit after the non-breaking fixes', () => {
  it('only attribute observation is left for 12.0; every other rule is at zero', () => {
    for (const [rule, n] of Object.entries(s.byRule)) if (rule !== 'attr-unobserved') expect(n, rule).toBe(0);
    expect(s.byRule['attr-unobserved']).toBeLessThan(150);
    expect(s.clean).toBeGreaterThan(150);
    expect(s.exempt).toBeGreaterThanOrEqual(10);
  });
  it('exemptions carry a reason and are listed in the report', () => {
    for (const r of rows) for (const e of r.exempt) expect(e.reason.length, `${r.tag} ${e.rule}`).toBeGreaterThan(10);
    expect(read('docs/contract-report.md')).toContain('## Documented exemptions');
  });
});

describe('11.8: keyboard — click-activated hosts', () => {
  it('<usa-anim-icon trigger="click"> is a focusable button; Enter and Space play it; attributes go on disconnect', () => {
    defineAnimIcon('usa-anim-icon-118');
    const el = document.createElement('usa-anim-icon-118') as any;
    el.setAttribute('trigger', 'click');
    el.setAttribute('icon', 'heart');
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    document.body.append(el);
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('role')).toBe('button');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(clicks).toBe(2);
    el.remove();
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(el.hasAttribute('role')).toBe(false);
  });
  it('keeps a tabindex / role the page set', () => {
    const el = document.createElement('usa-anim-icon-118') as any;
    el.setAttribute('trigger', 'click');
    el.setAttribute('tabindex', '-1');
    el.setAttribute('role', 'link');
    document.body.append(el);
    expect(el.getAttribute('tabindex')).toBe('-1');
    expect(el.getAttribute('role')).toBe('link');
    el.remove();
    expect(el.getAttribute('tabindex')).toBe('-1');
  });
});

describe('11.8: attributes, events, errors, reduced motion', () => {
  it('attributes an element reads are observed (changing them re-renders)', () => {
    const C = defineMarquee('usa-marquee-118') || customElements.get('usa-marquee-118');
    expect((C as any).observedAttributes).toContain('pause-on-hover');
  });
  it('usa:* events next to the legacy names', () => {
    expect(read('src/components/effects/audio.ts')).toContain("this.emit('beat', d)");
    expect(read('src/components/effects/audio.ts')).toContain("this.emit('audio-error'");
    expect(read('src/components/effects/player.ts')).toContain("this.emit('ready'");
    expect(read('src/components/effects/player.ts')).toContain("this.emit('finish')");
    expect(read('src/components/effects/story.ts')).toContain("this.emit('step'");
  });
  it('[motionary] error prefix; <usa-player> end state under reduced motion', () => {
    expect(read('src/components/widgets/gpu-particles.ts')).toContain("'[motionary] <usa-gpu-particles>: no WebGPU adapter");
    expect(read('src/components/effects/player.ts')).toMatch(/this\.reduced && \(trig === 'load' \|\| trig === 'view'\)\) p\.seek\(p\.duration\)/);
    expect(read('docs/component-contract.md')).toContain('11.8 fixed the non-breaking findings');
  });
});
