import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installComponentMocks, anims, mount } from './components-setup';
import { timeline, supportsNativeScrub } from '../src/components/timeline';
import { defineTimelineComponents } from '../src/components/timeline';

class FakeViewTimeline {
  constructor(public opts: any) {}
}
class FakeScrollTimeline {
  constructor(public opts: any) {}
}

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
});
afterEach(() => {
  delete (globalThis as any).ViewTimeline;
  delete (globalThis as any).ScrollTimeline;
});

describe('timeline().scrub() — native ScrollTimeline / ViewTimeline (4.1)', () => {
  it('maps each step onto the cover range of a ViewTimeline', () => {
    (globalThis as any).ViewTimeline = FakeViewTimeline;
    expect(supportsNativeScrub()).toBe(true);
    const a = mount('<i></i>'), b = mount('<b></b>'), sec = mount('<section></section>');
    const tl = timeline({ defaults: { duration: 500 } }).to(a, 'fade').to(b, 'scale');
    const stop = tl.scrub(sec);
    expect(stop.native).toBe(true);
    const live = anims.filter((x) => (x.timing as any).timeline);
    expect(live).toHaveLength(2);
    expect((live[0].timing as any).timeline.opts.subject).toBe(sec);
    expect((live[0].timing as any).rangeStart).toBe('cover 0.000%');
    expect((live[0].timing as any).rangeEnd).toBe('cover 50.000%');
    expect((live[1].timing as any).rangeStart).toBe('cover 50.000%');
    stop();
    expect(live.every((x) => x.cancelled)).toBe(true);
  });

  it('uses a ScrollTimeline on the container with { source: "scroll" }', () => {
    (globalThis as any).ScrollTimeline = FakeScrollTimeline;
    const a = mount('<i></i>'), box = mount('<div></div>');
    const stop = timeline().to(a, 'fade').scrub(box, { source: 'scroll', axis: 'x' });
    expect(stop.native).toBe(true);
    const t = anims.find((x) => (x.timing as any).timeline)!.timing as any;
    expect(t.timeline.opts).toEqual({ source: box, axis: 'x' });
    expect(t.duration).toBe('auto');
  });

  it('falls back to JS without support, with smooth, cues, onUpdate or engine:"js"', () => {
    const a = mount('<i></i>'), sec = mount('<section></section>');
    expect(timeline().to(a, 'fade').scrub(sec).native).toBe(false);
    (globalThis as any).ViewTimeline = FakeViewTimeline;
    expect(timeline().to(a, 'fade').scrub(sec, { smooth: 0.3 }).native).toBe(false);
    expect(timeline().to(a, 'fade').scrub(sec, { engine: 'js' }).native).toBe(false);
    expect(timeline({ onUpdate() {} }).to(a, 'fade').scrub(sec).native).toBe(false);
    expect(timeline().to(a, 'fade').call(() => {}, 100).scrub(sec).native).toBe(false);
  });

  it('JS fallback follows a scroll container with { source: "scroll" }', () => {
    const a = mount('<i></i>');
    const box = mount('<div></div>') as HTMLElement;
    Object.defineProperties(box, { scrollHeight: { value: 1100 }, clientHeight: { value: 100 }, scrollTop: { value: 500, writable: true } });
    const tl = timeline({ defaults: { duration: 1000 } }).to(a, 'fade');
    tl.scrub(box, { source: 'scroll' });
    expect(tl.progress()).toBeCloseTo(0.5);
  });

  it('<usa-timeline scrub> marks data-native when the browser drives it', () => {
    (globalThis as any).ViewTimeline = FakeViewTimeline;
    defineTimelineComponents();
    const el = mount('<usa-timeline scrub><p data-tl="fade">x</p></usa-timeline>');
    expect(el.hasAttribute('data-native')).toBe(true);
    const js = mount('<usa-timeline scrub="js"><p data-tl="fade">x</p></usa-timeline>');
    expect(js.hasAttribute('data-native')).toBe(false);
  });
});
