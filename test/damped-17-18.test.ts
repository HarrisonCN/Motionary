import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { springExpand, springDetails, springAllDetails, isExpanded, expandContentAt } from '../src/components/interaction';
import { configureComponents } from '../src/components/base';
import { installComponentMocks } from './components-setup';

const read = (f: string) => readFileSync(f, 'utf8');
const fakeClocks = () =>
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'],
  });
const details = (html = '<summary>Code</summary><div class="a">A</div><div class="b">B</div>') => {
  const d = document.createElement('details');
  d.innerHTML = html;
  document.body.append(d);
  return d;
};

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('17.18 damped expand', () => {
  beforeEach(() => installComponentMocks());

  it('expandContentAt fades the content in after the height and staggers the children', () => {
    expect(expandContentAt(0, 0, 2)).toEqual([0, 1]);
    expect(expandContentAt(1, 0, 2)).toEqual([1, 0]);
    expect(expandContentAt(1, 1, 2)).toEqual([1, 0]);
    // half-way the first child is further along than the second
    const [o0, f0] = expandContentAt(0.5, 0, 3);
    const [o1, f1] = expandContentAt(0.5, 1, 3);
    expect(o0).toBeGreaterThan(o1);
    expect(f0).toBeLessThan(f1);
    // overshoot past 1 stays fully shown
    expect(expandContentAt(1.1, 0, 1)).toEqual([1, 0]);
  });

  it('opens a <details> at once (open for the whole motion) and only drops open once the close has settled', async () => {
    fakeClocks();
    const d = details();
    const opened = springExpand(d, true);
    expect(d.open).toBe(true);
    expect(d.hasAttribute('data-mo-expanding')).toBe(true);
    expect(isExpanded(d)).toBe(true);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(opened).resolves.toBe(true);
    expect(d.hasAttribute('data-mo-expanding')).toBe(false);
    expect(d.style.height).toBe('');
    expect(d.querySelector<HTMLElement>('.a')!.style.opacity).toBe('');

    const closed = springExpand(d);
    expect(d.open).toBe(true); // still on screen while it closes
    expect(isExpanded(d)).toBe(false);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(closed).resolves.toBe(false);
    expect(d.open).toBe(false);
    expect(d.style.getPropertyValue('--mo-expand-turn')).toBe('');
  });

  it('a second toggle mid-way reverses from where it is and every caller gets the final state', async () => {
    fakeClocks();
    const box = document.createElement('div');
    box.hidden = true;
    box.innerHTML = '<p>x</p>';
    document.body.append(box);
    const a = springExpand(box, true);
    expect(box.hidden).toBe(false);
    await vi.advanceTimersByTimeAsync(60);
    expect(box.style.getPropertyValue('--mo-expand')).not.toBe('');
    const b = springExpand(box, false);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(a).resolves.toBe(false);
    await expect(b).resolves.toBe(false);
    expect(box.hidden).toBe(true);
    expect(box.style.overflow).toBe('');
  });

  it('toggles at once under reduced motion', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const d = details();
    await expect(springExpand(d)).resolves.toBe(true);
    expect(d.open).toBe(true);
    expect(d.hasAttribute('data-mo-expanding')).toBe(false);
    const box = document.createElement('div');
    document.body.append(box);
    await expect(springExpand(box, false)).resolves.toBe(false);
    expect(box.hidden).toBe(true);
    configureComponents({ reducedMotion: 'user' });
  });

  it('springDetails and springAllDetails take over the summary click, but not inside components or opted-out areas', () => {
    fakeClocks();
    const d = details();
    const off = springDetails(d);
    const click = (s: Element) => {
      const e = new MouseEvent('click', { bubbles: true, cancelable: true });
      s.dispatchEvent(e);
      return e.defaultPrevented;
    };
    expect(click(d.querySelector('summary')!)).toBe(true);
    expect(d.hasAttribute('data-mo-expanding')).toBe(true);
    off();

    const stop = springAllDetails(document);
    const plain = details();
    expect(click(plain.querySelector('summary')!)).toBe(true);
    const host = document.createElement('mo-thing');
    host.innerHTML = '<details><summary>S</summary><p>p</p></details>';
    document.body.append(host);
    expect(click(host.querySelector('summary')!)).toBe(false);
    const zone = document.createElement('div');
    zone.dataset.moExpand = 'off';
    zone.innerHTML = '<details><summary>S</summary><p>p</p></details>';
    document.body.append(zone);
    expect(click(zone.querySelector('summary')!)).toBe(false);
    stop();
    const later = details();
    expect(click(later.querySelector('summary')!)).toBe(false);
  });
});

describe('17.18 showcase damped motion', () => {
  it('every showcase page loads the damped motion, directly or through the drawer / store / gallery modules', () => {
    for (const f of readdirSync('showcase').filter((n) => n.endsWith('.html') && !['thumb.html', 'run.html'].includes(n))) {
      expect(read(`showcase/${f}`), f).toMatch(/src="\.\/(damped|code-drawer|app|gallery)\.js"/);
    }
    expect(read('showcase/code-drawer.js')).toContain("import './damped.js';");
    expect(read('showcase/app.js')).toContain("from './damped.js'");
    expect(read('showcase/gallery.js')).toContain("from './damped.js'");
  });

  it('the drawer chevron follows the spring and the detail sheet can be pulled down', () => {
    const drawer = read('showcase/code-drawer.js');
    expect(drawer).toContain('var(--mo-expand-turn,0)');
    expect(drawer).toContain('.mo-code[open]{--mo-expand-turn:1}');
    const app = read('showcase/app.js');
    expect(app).toContain("dragToDismiss($('#detail-sheet'), '.detail-head', requestClose)");
    expect(app).not.toContain("cubic-bezier(.2,.8,.2,1)' });");
    expect(read('showcase/styles.css')).toContain('var(--mo-spring-ease');
    expect(read('showcase/index.html')).toContain('id="detail" data-smooth-ignore');
    const damped = read('showcase/damped.js');
    for (const s of ['springAllDetails', 'microEasing', "runtime/smooth.js", 'prefers-reduced-motion', 'motionary:damped']) expect(damped, s).toContain(s);
  });

  it('smooth scrolling leaves a wheel that a component already took, and nested scrollers', () => {
    expect(read('src/runtime/smooth.ts')).toContain('e.defaultPrevented');
    expect(read('src/components/page/scroll.ts')).toContain("data-smooth-ignore");
  });
});
