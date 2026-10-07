import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks, mount } from './components-setup';
import { defineDepthComponents, orientationToTilt, deviceTilt, requestOrientationPermission } from '../src/components/depth';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineDepthComponents();
});

const raf = () => new Promise((r) => setTimeout(r, 40));

describe('device orientation', () => {
  it('maps beta / gamma to -1…1 around a resting pose', () => {
    expect(orientationToTilt(45, 0)).toEqual({ x: 0, y: 0 });
    expect(orientationToTilt(75, 15)).toEqual({ x: 0.5, y: 1 });
    expect(orientationToTilt(-90, -90)).toEqual({ x: -1, y: -1 });
    expect(orientationToTilt(null, null)).toEqual({ x: 0, y: 0 });
  });
  it('deviceTilt listens (smoothed) and stops; permission is granted where not required', async () => {
    (window as any).DeviceOrientationEvent = class {};
    const cb = vi.fn();
    const stop = deviceTilt(cb, { smooth: 0 });
    const e = new Event('deviceorientation') as any;
    e.beta = 75;
    e.gamma = 15;
    window.dispatchEvent(e);
    expect(cb).toHaveBeenLastCalledWith({ x: 0.5, y: 1 });
    stop();
    window.dispatchEvent(e);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(await requestOrientationPermission()).toBe(true);
    (window as any).DeviceOrientationEvent.requestPermission = async () => 'denied';
    expect(await requestOrientationPermission()).toBe(false);
    delete (window as any).DeviceOrientationEvent;
  });
});

describe('<usa-cube>', () => {
  it('labels faces, rotates with keys and reports changes', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-cube size="120"><div>1</div><div>2</div><div>3</div><div>4</div></usa-cube>');
    const faces = Array.from(el.children) as HTMLElement[];
    expect(faces.map((f) => f.dataset.face)).toEqual(['front', 'right', 'back', 'left']);
    expect(el.style.getPropertyValue('--usa-cube-size')).toBe('120px');
    const change = vi.fn();
    el.addEventListener('usa:change', change);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(el.index).toBe(1);
    expect(el.style.getPropertyValue('--usa-cube-ry')).toBe('-90deg');
    expect(faces[1].getAttribute('aria-hidden')).toBe('false');
    expect(faces[0].getAttribute('aria-hidden')).toBe('true');
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ detail: { index: 1, face: 'right' } }));
    el.prev();
    el.prev();
    expect(el.index).toBe(3);
    expect(el.style.getPropertyValue('--usa-cube-ry')).toBe('90deg');
  });
  it('shows top / bottom faces only with six faces', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-cube><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i></usa-cube>');
    el.show('top');
    expect(el.index).toBe(4);
    expect(el.style.getPropertyValue('--usa-cube-rx')).toBe('-90deg');
  });
});

describe('<usa-depth>', () => {
  it('moves layers by depth with the pointer', async () => {
    const el = mount<any>('<usa-depth strength="50" rotate="10"><div><span data-depth="1">a</span><span data-depth="-0.5">b</span></div></usa-depth>');
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 50 }));
    await raf();
    expect(el.tilt).toEqual({ x: 1, y: 0 });
    const [a, b] = el.querySelectorAll('[data-depth]');
    expect(a.style.transform).toContain('translate3d(50.00px, 0.00px, 0)');
    expect(b.style.transform).toContain('translate3d(-25.00px');
    expect(el.style.getPropertyValue('--usa-depth-rot')).toContain('rotateY(10.00deg)');
  });
  it('stays flat under reduced motion', async () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-depth><span data-depth="1">a</span></usa-depth>');
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 50 }));
    await raf();
    expect(el.querySelector('[data-depth]').style.transform).toBe('');
  });
});
