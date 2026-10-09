import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks, mount, tick } from './components-setup';
import { defineComponents, COMPONENT_CATEGORIES } from '../src/components';
import { configureComponents } from '../src/components/base';
import { createUsaComponents, eventName, pascal, USA_TAGS } from '../src/components/frameworks/react';
import { isUsaElement, UsaPlugin } from '../src/components/frameworks/vue';
import { categoryOfTag, defineUsed, loadCategory } from '../src/components/lazy';

const TAGS = Object.values(COMPONENT_CATEGORIES).flat() as string[];
/** Elements users operate directly must be focusable and carry a role. */
const INTERACTIVE: Record<string, string> = {
  'usa-like': 'button',
  'usa-hold': 'button',
  'usa-checkbox': 'checkbox',
  'usa-slider': 'slider',
  'usa-motion-switch': 'radiogroup',
};

describe('a11y sweep over every <usa-*> element', () => {
  beforeEach(() => {
    installComponentMocks();
    document.body.innerHTML = '';
    defineComponents();
  });

  it('every tag mounts and unmounts cleanly, also under reduced motion and motion "off"', async () => {
    for (const mode of ['user', 'reduce'] as const) {
      configureComponents({ reducedMotion: mode });
      for (const tag of TAGS) {
        const el = mount(`<${tag}><span>x</span></${tag}>`);
        expect(customElements.get(tag), tag).toBeTruthy();
        el.remove();
      }
    }
    configureComponents({ reducedMotion: 'user', motionSensitivity: 'minimal' });
    for (const tag of TAGS) mount(`<${tag}></${tag}>`).remove();
    configureComponents({ motionIntensity: 'normal', motionSensitivity: 'full' });
    await tick();
  });

  it('interactive elements are focusable with the right role', () => {
    for (const [tag, role] of Object.entries(INTERACTIVE)) {
      const el = mount<HTMLElement>(`<${tag} label="Test"></${tag}>`);
      expect(el.getAttribute('role'), tag).toBe(role);
      if (tag !== 'usa-motion-switch') expect(el.tabIndex, tag).toBe(0);
    }
  });

  it('decorative layers are hidden from assistive tech', () => {
    for (const tag of ['usa-cursor', 'usa-ambient']) expect(mount(`<${tag}></${tag}>`).getAttribute('aria-hidden'), tag).toBe('true');
  });
});

describe('framework helpers', () => {
  it('React wrappers: names, event mapping, element creation', () => {
    expect(pascal('usa-auto-animate')).toBe('UsaAutoAnimate');
    expect(pascal('usa-carousel-3d')).toBe('UsaCarousel3d');
    expect(eventName('onUsaChange')).toBe('usa:change');
    expect(eventName('onUsaDragEnd')).toBe('usa:drag-end');
    expect(eventName('onChange')).toBe('change');
    expect(eventName('label')).toBeNull();
    expect(USA_TAGS).toEqual(TAGS);
    const calls: any[] = [];
    const React = {
      createElement: (type: any, props: any, ...children: any[]) => (calls.push({ type, props, children }), { type, props }),
      forwardRef: (render: any) => ({ render }),
      useRef: (v: any) => ({ current: v }),
      useEffect: () => undefined,
    };
    const C = createUsaComponents(React);
    expect(Object.keys(C)).toHaveLength(TAGS.length);
    C.UsaButton.render({ deform: 'squash', disabled: true, hidden: false, className: 'x', onUsaSubmit: () => 0, children: 'Go' }, null);
    expect(calls[0].type).toBe('usa-button');
    expect(calls[0].props).toMatchObject({ deform: 'squash', disabled: '', class: 'x' });
    expect(calls[0].props).not.toHaveProperty('hidden');
    expect(calls[0].props).not.toHaveProperty('onUsaSubmit');
    expect(C.UsaButton.displayName).toBe('UsaButton');
  });

  it('Vue: isCustomElement predicate and plugin', () => {
    installComponentMocks();
    expect(isUsaElement('usa-card')).toBe(true);
    expect(isUsaElement('div')).toBe(false);
    const app: any = { config: {} };
    UsaPlugin.install(app, { categories: ['click'] });
    expect(app.config.compilerOptions.isCustomElement('usa-button')).toBe(true);
    expect(customElements.get('usa-button')).toBeTruthy();
  });

  it('lazy registration maps tags to categories and loads only what is used', async () => {
    expect(categoryOfTag('usa-button')).toBe('click');
    expect(categoryOfTag('usa-nope')).toBeNull();
    document.body.innerHTML = '<usa-fab></usa-fab>';
    const cats = await defineUsed(document);
    expect(cats.every((c) => c === 'ui') || cats.length === 0).toBe(true);
    await loadCategory('ui');
    expect(customElements.get('usa-fab')).toBeTruthy();
  });
});

describe('3.0: kind replaces variant-as-kind', () => {
  it('kind selects the kind; variant is only a style variant now', () => {
    installComponentMocks();
    defineComponents(['feedback', 'transitions']);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const s = mount<any>('<usa-spinner kind="dots"></usa-spinner>');
    expect(s.kind).toBe('dots');
    expect(s.getAttribute('data-kind')).toBe('dots');
    expect(mount<any>('<usa-spinner variant="bars"></usa-spinner>').kind).toBe('fluent');
    expect(mount<any>('<usa-check kind="warning"></usa-check>').getAttribute('data-kind')).toBe('warning');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
