import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installComponentMocks, mount, tick } from './components-setup';
import { defineComponents } from '../src/components';
import { configureComponents, adaptKeyframes, prefersReducedMotion } from '../src/components/base';
import { ALL_TAGS, auditMotionA11y, announce, liveRegion, LIVE_REGION_IDS, setMotionSensitivity, restoreMotionSensitivity, getMotionSensitivity, motionAllowed, staticAlternative, STATIC_ALTERNATIVES, MOTION_SENSITIVITY } from '../src/components/a11y';
import { COMPONENT_CATEGORIES } from '../src/components/index-tags';

/** Representative markup per tag: a label and some content, like real use. */
const markup = (tag: string) => `<${tag} label="Demo" aria-label="Demo"><button type="button">Action</button><span>Text</span></${tag}>`;

describe('automated a11y regression sweep (4.4)', () => {
  beforeEach(() => {
    installComponentMocks();
    document.body.innerHTML = '';
    defineComponents();
  });
  afterEach(() => configureComponents({ motionSensitivity: 'full', reducedMotion: 'user' }));

  for (const level of ['full', 'gentle', 'minimal', 'static'] as const) {
    it(`every <usa-*> element passes the audit at sensitivity "${level}"`, async () => {
      configureComponents({ motionSensitivity: level });
      const failures: string[] = [];
      for (const tag of ALL_TAGS) {
        document.body.innerHTML = '';
        mount(markup(tag));
        await tick();
        const { errors } = auditMotionA11y(document.body);
        errors.forEach((e) => failures.push(`${tag}: ${e.rule} — ${e.message}`));
      }
      expect(failures).toEqual([]);
    });
  }

  it('covers every category and documents a static alternative for each', () => {
    expect(ALL_TAGS.length).toBeGreaterThan(80);
    expect(Object.keys(STATIC_ALTERNATIVES).sort()).toEqual(Object.keys(COMPONENT_CATEGORIES).sort());
  });

  it('the audit catches real problems', () => {
    document.body.innerHTML = '<div aria-hidden="true"><button>x</button></div><div role="slider" aria-label="v"></div><div role="switch"></div><img src="a.png"><p aria-live="assertive">x</p>';
    const { errors, warnings } = auditMotionA11y(document.body);
    expect(errors.map((e) => e.rule).sort()).toEqual(['aria-hidden-focusable', 'img-alt', 'range-value', 'role-name']);
    expect(warnings.map((w) => w.rule)).toEqual(['assertive-live']);
  });
});

describe('motion-sensitivity levels', () => {
  beforeEach(() => {
    installComponentMocks();
    document.body.innerHTML = '';
    localStorage.clear();
  });
  afterEach(() => setMotionSensitivity('full'));

  it('adapts keyframes per level', () => {
    const f: Keyframe[] = [{ opacity: 0, transform: 'scale(0.5) rotate(20deg)' }, { opacity: 1, transform: 'none', translate: '0 0' }];
    expect(adaptKeyframes(f, 'full')).toBe(f);
    expect(adaptKeyframes(f, 'gentle')).toEqual([{ opacity: 0 }, { opacity: 1, transform: 'none', translate: '0 0' }]);
    expect(adaptKeyframes(f, 'minimal')).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(adaptKeyframes(f, 'static')).toEqual([f[1]]);
  });

  it('sets the attribute, persists, restores and maps to reduced motion', () => {
    const seen: string[] = [];
    document.addEventListener('usa:sensitivity', (e: any) => seen.push(e.detail.level));
    setMotionSensitivity('gentle', true);
    expect(document.documentElement.getAttribute('data-usa-sensitivity')).toBe('gentle');
    expect(prefersReducedMotion()).toBe(false);
    expect(motionAllowed('rotate')).toBe(false);
    expect(motionAllowed('translate')).toBe(true);
    setMotionSensitivity('minimal');
    expect(prefersReducedMotion()).toBe(true);
    setMotionSensitivity('full');
    expect(document.documentElement.hasAttribute('data-usa-sensitivity')).toBe(false);
    expect(restoreMotionSensitivity()).toBe('gentle');
    expect(getMotionSensitivity()).toBe('gentle');
    expect(seen).toEqual(['gentle', 'minimal', 'full', 'gentle']);
    setMotionSensitivity('nope' as any);
    expect(getMotionSensitivity()).toBe('gentle');
    expect(Object.keys(MOTION_SENSITIVITY)).toEqual(['full', 'gentle', 'minimal', 'static']);
  });

  it('static: element motion lands on the final frame without animating', () => {
    defineComponents(['reveal']);
    setMotionSensitivity('static');
    const el = mount<any>('<usa-reveal><p>Hi</p></usa-reveal>');
    expect(el.motion(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 })).toBeNull();
    expect(el.style.opacity).toBe('1');
  });

  it('staticAlternative finishes finite and cancels endless animations', () => {
    const fin = { finished: 0, cancelled: 0 };
    const mk = (iterations: number) => ({ effect: { getComputedTiming: () => ({ iterations }) }, finish: () => fin.finished++, cancel: () => fin.cancelled++ });
    const root = document.createElement('div');
    (root as any).getAnimations = () => [mk(1), mk(Infinity)];
    const undo = staticAlternative(root);
    expect(fin).toEqual({ finished: 1, cancelled: 1 });
    expect(root.hasAttribute('data-usa-static')).toBe(true);
    undo();
    expect(root.hasAttribute('data-usa-static')).toBe(false);
  });
});

describe('aria-live conventions', () => {
  beforeEach(() => (document.body.innerHTML = ''));

  it('uses one shared polite (status) and assertive (alert) region', () => {
    expect(announce('Saved')).toBe(true);
    const p = document.getElementById(LIVE_REGION_IDS.polite)!;
    expect(p.getAttribute('role')).toBe('status');
    expect(p.getAttribute('aria-live')).toBe('polite');
    expect(p.textContent).toBe('Saved');
    expect(announce('Saved')).toBe(false); // deduped
    announce('Card declined', { politeness: 'assertive' });
    expect(liveRegion('assertive')!.getAttribute('role')).toBe('alert');
    expect(document.querySelectorAll('[aria-live]').length).toBe(2);
    expect(auditMotionA11y(document.body).warnings).toEqual([]);
  });
});
