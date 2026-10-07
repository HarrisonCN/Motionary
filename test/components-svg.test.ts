import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, intersect, mount } from './components-setup';
import { defineSvgComponents, interpolatePath, pathsCompatible, morphTo, drawLines, MASK_SHAPES, ANIM_ICONS } from '../src/components/svg';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineSvgComponents();
});

describe('path morphing', () => {
  it('interpolates compatible paths number by number', () => {
    expect(pathsCompatible('M0 0 L10 10', 'M5,5 L20 20')).toBe(true);
    expect(interpolatePath('M0 0 L10 10', 'M10 10 L20 30', 0.5)).toBe('M5 5 L15 20');
    expect(interpolatePath('M0 0 L10 10', 'M10 10 L20 30', 0)).toBe('M0 0 L10 10');
    expect(interpolatePath('M0 0 L10 10', 'M10 10 L20 30', 1)).toBe('M10 10 L20 30');
  });
  it('switches incompatible paths at the midpoint', () => {
    expect(pathsCompatible('M0 0 L1 1', 'M0 0 C1 1 2 2 3 3')).toBe(false);
    expect(interpolatePath('M0 0 L1 1', 'M0 0 C1 1 2 2 3 3', 0.4)).toBe('M0 0 L1 1');
    expect(interpolatePath('M0 0 L1 1', 'M0 0 C1 1 2 2 3 3', 0.6)).toBe('M0 0 C1 1 2 2 3 3');
  });
  it('morphTo animates d and resolves; instant under reduced motion', async () => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M0 0 L10 10');
    await morphTo(p, 'M10 10 L20 20', { duration: 30 });
    expect(p.getAttribute('d')).toBe('M10 10 L20 20');
    installComponentMocks({ reducedMotion: true });
    await morphTo(p, 'M1 1 L2 2', { duration: 5000 });
    expect(p.getAttribute('d')).toBe('M1 1 L2 2');
  });
});

describe('line drawing', () => {
  it('normalises strokes and staggers progress', () => {
    const root = mount('<div><svg><path d="M0 0 L1 1"/><circle r="4"/></svg></div>');
    const set = drawLines(root, { stagger: 0.5 });
    const [a, b] = Array.from(root.querySelectorAll('path, circle')) as SVGElement[];
    expect(a.getAttribute('pathLength')).toBe('1');
    set(0.5);
    expect(Number(a.style.strokeDashoffset)).toBe(0);
    expect(Number(b.style.strokeDashoffset)).toBe(1);
    set(1);
    expect(Number(b.style.strokeDashoffset)).toBe(0);
  });
  it('<usa-draw> draws when in view and fires complete', async () => {
    const el = mount<any>('<usa-draw duration="20"><svg><path d="M0 0 L5 5"/></svg></usa-draw>');
    expect(el.progress).toBe(0);
    const done = vi.fn();
    el.addEventListener('usa:complete', done);
    intersect(el, true);
    await new Promise((r) => setTimeout(r, 120));
    expect(el.progress).toBe(1);
    expect(el.hasAttribute('data-drawn')).toBe(true);
    expect(done).toHaveBeenCalled();
  });
  it('<usa-draw> is drawn immediately under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-draw><svg><path d="M0 0 L5 5"/></svg></usa-draw>');
    expect(el.progress).toBe(1);
  });
});

describe('<usa-morph>', () => {
  it('cycles through paths on click / Enter', async () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-morph paths="M0 0 L1 1 | M2 2 L3 3"></usa-morph>');
    const path = el.querySelector('path');
    expect(path.getAttribute('d')).toBe('M0 0 L1 1');
    expect(el.getAttribute('role')).toBe('button');
    el.click();
    await Promise.resolve();
    expect(el.index).toBe(1);
    expect(path.getAttribute('d')).toBe('M2 2 L3 3');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.index).toBe(0);
  });
});

describe('<usa-mask-reveal>', () => {
  it('starts masked and reveals with a clip-path animation in view', async () => {
    const el = mount<any>('<usa-mask-reveal shape="diamond"><img alt=""></usa-mask-reveal>');
    expect(el.dataset.state).toBe('hidden');
    expect(el.style.clipPath).toBe(MASK_SHAPES.diamond[0]);
    intersect(el, true);
    expect(anims[0].keyframes[1].clipPath).toBe(MASK_SHAPES.diamond[1]);
    await finishAll();
    expect(el.dataset.state).toBe('visible');
  });
  it('is shown without a mask under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-mask-reveal><p>x</p></usa-mask-reveal>');
    expect(el.dataset.state).toBe('visible');
    expect(el.style.clipPath).toBe('');
  });
});

describe('<usa-anim-icon>', () => {
  it('renders the named icon, is decorative unless labelled, plays on hover', () => {
    const el = mount<any>('<usa-anim-icon name="bell"></usa-anim-icon>');
    const svg = el.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('path').getAttribute('d')).toBe(ANIM_ICONS.bell.d);
    el.dispatchEvent(new Event('pointerenter'));
    expect(anims).toHaveLength(1);
    const l = mount<any>('<usa-anim-icon name="heart" label="Like" trigger="click"></usa-anim-icon>');
    expect(l.querySelector('svg').getAttribute('aria-label')).toBe('Like');
  });
  it('stays still under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-anim-icon name="gear"></usa-anim-icon>');
    el.play();
    expect(anims).toHaveLength(0);
  });
});
