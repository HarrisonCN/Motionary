import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, finishAll, intersect, ioFor, mount, tick } from './components-setup';
import { defineBackgroundComponents } from '../src/components/background';
import { defineTransitionComponents, viewTransition, flip, connectedAnimation } from '../src/components/transitions';
import { defineComponents, COMPONENT_CATEGORIES } from '../src/components';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineBackgroundComponents();
  defineTransitionComponents();
});
afterEach(() => {
  vi.useRealTimers();
  delete (document as any).startViewTransition;
});

const box = (el: Element, r: Partial<DOMRect>) => (el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 50, ...r }) as DOMRect);

describe('<usa-aurora>, <usa-grain>, <usa-acrylic>', () => {
  it('aurora adds a hidden layer of coloured blobs and pauses off-screen', () => {
    const el = mount('<usa-aurora colors="red, blue" speed="2"><h1>Hi</h1></usa-aurora>');
    const layer = el.querySelector('.usa-aurora-layer')!;
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    const blobs = Array.from(layer.children) as HTMLElement[];
    expect(blobs.map((b) => b.style.getPropertyValue('--c'))).toEqual(['red', 'blue', 'red', 'blue']);
    expect(el.style.getPropertyValue('--usa-aurora-speed')).toBe('9.00s');
    expect(el.querySelector('h1')).toBeTruthy();
    intersect(el, false);
    expect(el.hasAttribute('data-offscreen')).toBe(true);
  });

  it('grain overlays an SVG noise texture', () => {
    const el = mount('<usa-grain opacity="0.2">x</usa-grain>');
    const layer = el.querySelector<HTMLElement>('.usa-grain-layer')!;
    expect(layer.style.opacity).toBe('0.2');
    expect(layer.style.backgroundSize).toBe('180px');
    expect(layer.getAttribute('aria-hidden')).toBe('true');
  });

  it('acrylic maps tint / blur to custom properties', () => {
    const el = mount('<usa-acrylic tint="#202020" tint-opacity="0.4" blur="12">x</usa-acrylic>');
    expect(el.style.getPropertyValue('--usa-acrylic-tint')).toBe('#202020');
    expect(el.style.getPropertyValue('--usa-acrylic-opacity')).toBe('40%');
    expect(el.style.getPropertyValue('--usa-acrylic-blur')).toBe('12px');
  });
});

describe('<usa-particles>', () => {
  it('draws on a canvas only while visible, and a still frame under reduced motion', async () => {
    const calls: string[] = [];
    const ctx: any = new Proxy({}, { get: (_t, p) => (typeof p === 'string' && /^[a-z]/.test(p) && !['globalAlpha', 'fillStyle', 'strokeStyle', 'lineWidth'].includes(p) ? (...a: unknown[]) => calls.push(p) : undefined), set: () => true });
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    const el = mount<any>('<usa-particles count="20" links="0"></usa-particles>');
    expect(el.querySelector('canvas')!.getAttribute('aria-hidden')).toBe('true');
    expect(calls).toContain('arc');
    const before = calls.length;
    await new Promise((r) => setTimeout(r, 40));
    expect(calls.length).toBe(before); // not visible yet → no loop
    intersect(el, true);
    await new Promise((r) => setTimeout(r, 60));
    expect(calls.length).toBeGreaterThan(before);
    el.remove();
    const after = calls.length;
    await new Promise((r) => setTimeout(r, 40));
    expect(calls.length).toBe(after);
    spy.mockRestore();
  });
});

describe('<usa-marquee>', () => {
  it('clones the content (hidden from AT) and slides the track at the given speed', () => {
    const w = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('usa-marquee-group') ? 200 : 0;
    });
    const c = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(500);
    const el = mount<any>('<usa-marquee speed="100" gap="0" pause-on-hover><span>A</span><span>B</span></usa-marquee>');
    const groups = el.querySelectorAll('.usa-marquee-group');
    expect(groups.length).toBe(4); // ceil(500 / 200) + 1
    expect(groups[1].getAttribute('aria-hidden')).toBe('true');
    expect(groups[1].hasAttribute('inert')).toBe(true);
    const a = anims.find((x) => x.el.classList.contains('usa-marquee-track'))!;
    expect(a.timing).toMatchObject({ duration: 2000, iterations: Infinity });
    expect(a.keyframes[1]).toEqual({ transform: 'translateX(-200px)' });
    el.dispatchEvent(new MouseEvent('pointerenter'));
    expect(a.playState).toBe('paused');
    el.dispatchEvent(new MouseEvent('pointerleave'));
    expect(a.playState).toBe('running');
    intersect(el, false);
    expect(a.playState).toBe('paused');
    w.mockRestore();
    c.mockRestore();
  });

  it('does not move under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount('<usa-marquee><span>A</span></usa-marquee>');
    expect(el.hasAttribute('data-static')).toBe(true);
    expect(anims).toHaveLength(0);
  });
});

describe('<usa-dialog>', () => {
  it('slots its content, opens with an animation and closes via data-close', async () => {
    const el = mount<any>('<usa-dialog kind="drawer-end" label="Settings"><h2>Settings</h2><button data-close="done">OK</button></usa-dialog>');
    const dlg = el.dialog as HTMLDialogElement;
    expect(el.shadowRoot.querySelector('slot')).toBeTruthy();
    expect(el.querySelector('h2')!.parentElement).toBe(el); // light DOM untouched
    expect(dlg.getAttribute('data-kind')).toBe('drawer-end');
    expect(dlg.getAttribute('aria-label')).toBe('Settings');
    const opened = vi.fn();
    const closed = vi.fn();
    el.addEventListener('usa:open', opened);
    el.addEventListener('usa:close', (e: CustomEvent) => closed(e.detail.returnValue));
    const p = el.show();
    await tick();
    expect(dlg.hasAttribute('open')).toBe(true);
    expect(el.open).toBe(true);
    expect(opened).toHaveBeenCalled();
    expect(anims.some((a) => (a.keyframes[0] as any).transform === 'translateX(100%)')).toBe(true);
    await finishAll();
    await p;
    el.querySelector('button')!.click();
    await finishAll();
    await tick();
    expect(dlg.hasAttribute('open')).toBe(false);
    expect(el.open).toBe(false);
    expect(closed).toHaveBeenCalledWith('done');
    expect(el.returnValue).toBe('done');
  });

  it('the open attribute drives it, and usa:beforeclose can cancel', async () => {
    const el = mount<any>('<usa-dialog><p>x</p></usa-dialog>');
    el.setAttribute('open', '');
    await finishAll();
    expect(el.dialog.hasAttribute('open')).toBe(true);
    el.addEventListener('usa:beforeclose', (e: Event) => e.preventDefault(), { once: true });
    await el.close();
    expect(el.open).toBe(true);
    el.removeAttribute('open');
    await finishAll();
    await tick();
    expect(el.dialog.hasAttribute('open')).toBe(false);
  });
});

describe('<usa-accordion>', () => {
  it('animates <details> height and keeps a single item open', async () => {
    const el = mount<any>(`<usa-accordion duration="200">
      <details><summary>A</summary><p>a</p></details>
      <details><summary>B</summary><p>b</p></details></usa-accordion>`);
    const [a, b] = el.items as HTMLDetailsElement[];
    let h = 20;
    box(a, {});
    a.getBoundingClientRect = () => ({ height: a.open ? 120 : h }) as DOMRect;
    a.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(a.open).toBe(true);
    const an = anims.find((x) => x.el === a)!;
    expect(an.keyframes).toEqual([{ height: '20px' }, { height: '120px' }]);
    await finishAll();
    b.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(b.open).toBe(true);
    expect(a.hasAttribute('data-closing')).toBe(true);
    await finishAll();
    expect(a.open).toBe(false);
    expect(a.querySelector('p')!.parentElement).toBe(a); // no wrapper elements
  });

  it('multiple allows several open; reduced motion toggles instantly', async () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-accordion multiple><details><summary>A</summary>a</details><details><summary>B</summary>b</details></usa-accordion>');
    await el.toggleItem(el.items[0], true);
    await el.toggleItem(el.items[1], true);
    expect(el.items.every((d: HTMLDetailsElement) => d.open)).toBe(true);
    expect(anims).toHaveLength(0);
  });
});

describe('<usa-flip-list> and flip()', () => {
  it('flip() animates moved elements from their old position', async () => {
    const list = mount('<ul><li>1</li><li>2</li></ul>');
    const [one, two] = Array.from(list.children);
    const pos = new Map<Element, number>([[one, 0], [two, 30]]);
    for (const li of [one, two]) li.getBoundingClientRect = () => ({ left: 0, top: pos.get(li)!, width: 100, height: 30 }) as DOMRect;
    const p = flip(list, () => {
      list.append(one);
      pos.set(one, 30);
      pos.set(two, 0);
    });
    await tick();
    const moved = anims.filter((a) => a.el === one || a.el === two);
    expect(moved).toHaveLength(2);
    expect((moved.find((a) => a.el === one)!.keyframes[0] as any).transform).toBe('translate(0px, -30px) scale(1, 1)');
    await finishAll();
    await p;
  });

  it('the element animates DOM reorders by itself', async () => {
    const el = mount<any>('<usa-flip-list><i>a</i><i>b</i></usa-flip-list>');
    box(el, {});
    const [a, b] = Array.from(el.children) as HTMLElement[];
    const pos = new Map<Element, number>([[a, 0], [b, 20]]);
    for (const n of [a, b]) n.getBoundingClientRect = () => ({ left: 0, top: pos.get(n)!, width: 10, height: 20 }) as DOMRect;
    const p = el.flip(() => {
      el.append(a);
      pos.set(a, 20);
      pos.set(b, 0);
    });
    await tick();
    expect(anims.filter((x) => x.el === a || x.el === b)).toHaveLength(2);
    await finishAll();
    await p;
  });
});

describe('<usa-view-switch>', () => {
  it('shows one view at a time and animates the switch', async () => {
    const el = mount<any>('<usa-view-switch active="home"><section data-view="home">H</section><section data-view="about">A</section></usa-view-switch>');
    const [home, about] = el.views as HTMLElement[];
    expect(home.hidden).toBe(false);
    expect(about.hidden).toBe(true);
    expect(about.hasAttribute('inert')).toBe(true);
    const change = vi.fn();
    el.addEventListener('usa:change', (e: CustomEvent) => change(e.detail.name));
    const p = el.show('about');
    expect(about.hidden).toBe(false);
    expect(change).toHaveBeenCalledWith('about');
    expect(el.getAttribute('active')).toBe('about');
    expect(anims.find((a) => a.el === about)!.keyframes[0]).toMatchObject({ transform: 'translateX(48px)' });
    await finishAll();
    await p;
    expect(home.hidden).toBe(true);
    el.active = '0';
    await finishAll();
    expect(home.hidden).toBe(false);
  });
});

describe('helpers', () => {
  it('viewTransition() uses the View Transitions API when present', async () => {
    const update = vi.fn();
    const start = vi.fn((cb: any) => {
      (typeof cb === 'function' ? cb : cb.update)();
      return { finished: Promise.resolve() };
    });
    (document as any).startViewTransition = start;
    await viewTransition(update);
    expect(start).toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it('viewTransition() falls back to a cross-fade, or to a plain update', async () => {
    const el = mount('<div></div>');
    const update = vi.fn();
    const p = viewTransition(update, { fallback: el });
    await tick();
    await finishAll();
    await finishAll();
    await p;
    expect(update).toHaveBeenCalledOnce();
    expect(anims.filter((a) => a.el === el).length).toBeGreaterThanOrEqual(2);
    const u2 = vi.fn();
    await viewTransition(u2);
    expect(u2).toHaveBeenCalledOnce();
  });

  it('connectedAnimation() flies `to` from the rect of `from`', async () => {
    const from = mount('<img>');
    const to = mount('<div></div>');
    box(from, { left: 10, top: 20, width: 50, height: 25 });
    box(to, { left: 100, top: 200, width: 100, height: 50 });
    const p = connectedAnimation(from, to);
    expect(from.style.visibility).toBe('hidden');
    expect((anims.at(-1)!.keyframes[0] as any).transform).toBe('translate(-90px, -180px) scale(0.5, 0.5)');
    await finishAll();
    await p;
    expect(from.style.visibility).toBe('');
  });
});

describe('defineComponents()', () => {
  it('registers every tag listed in COMPONENT_CATEGORIES', () => {
    defineComponents();
    const tags = Object.values(COMPONENT_CATEGORIES).flat();
    expect(tags.length).toBeGreaterThanOrEqual(30);
    tags.forEach((t) => expect(customElements.get(t), t).toBeTruthy());
  });

  it('defines can use custom tag names', async () => {
    const { defineSpinner } = await import('../src/components/feedback');
    expect(defineSpinner('my-loader')).toBeTruthy();
    expect(customElements.get('my-loader')).toBeTruthy();
    expect(defineSpinner('my-loader')).toBe(customElements.get('my-loader'));
  });

  it('elements created before definition upgrade', async () => {
    const el = document.createElement('usa-reveal-late');
    document.body.append(el);
    const { defineReveal } = await import('../src/components/reveal');
    defineReveal('usa-reveal-late');
    expect(el.getAttribute('data-state')).toBe('hidden');
    expect(ioFor(el)).toBeTruthy();
  });
});
