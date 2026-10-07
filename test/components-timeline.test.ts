import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, anims, intersect, mount, tick } from './components-setup';
import { defineTimelineComponents, timeline, resolvePosition, TIMELINE_PRESETS } from '../src/components/timeline';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineTimelineComponents();
});
afterEach(() => vi.useRealTimers());

const boxes = (n: number) => {
  document.body.innerHTML = Array.from({ length: n }, (_, i) => `<div class="b" id="b${i}"></div>`).join('');
  return Array.from(document.querySelectorAll('.b'));
};

describe('timeline positions', () => {
  it('resolves chain, overlap, start-of-previous and labels', () => {
    expect(resolvePosition(undefined, 500, 100)).toBe(500);
    expect(resolvePosition('>', 500, 100)).toBe(500);
    expect(resolvePosition('<', 500, 100)).toBe(100);
    expect(resolvePosition('-=200', 500, 100)).toBe(300);
    expect(resolvePosition('+=50', 500, 100)).toBe(550);
    expect(resolvePosition('<+=25', 500, 100)).toBe(125);
    expect(resolvePosition(42, 500, 100)).toBe(42);
    expect(resolvePosition('-=900', 500, 100)).toBe(0);
    expect(resolvePosition('intro+=10', 500, 100, { intro: 200 })).toBe(210);
    expect(resolvePosition('missing', 500, 100)).toBe(500);
  });
});

describe('timeline()', () => {
  it('chains, overlaps, staggers and labels steps', () => {
    const [a, b, c] = boxes(3);
    const tl = timeline({ defaults: { duration: 400 } })
      .to(a, 'fade-up')
      .label('mid')
      .to([b, c], 'scale', { at: '-=100', stagger: 50 })
      .to(a, [{ opacity: 1 }, { opacity: 0.5 }], { at: 'mid', duration: 100 });
    expect(tl.labels.mid).toBe(400);
    expect(tl.duration).toBe(300 + 50 + 400);
    tl.seek(0);
    expect(anims).toHaveLength(4);
    expect(anims.map((x) => x.timing.delay)).toEqual([0, 300, 350, 400]);
    expect(anims.every((x) => x.playState === 'paused')).toBe(true);
  });

  it('seek / progress drive every animation from one playhead', () => {
    const [a, b] = boxes(2);
    const tl = timeline().to(a, 'fade').to(b, 'blur');
    tl.progress(0.5);
    expect(tl.time).toBe(600);
    expect(anims.map((x) => x.currentTime)).toEqual([600, 600]);
    tl.seek(5000);
    expect(tl.progress()).toBe(1);
  });

  it('fires call() cues when the playhead passes them', () => {
    const [a] = boxes(1);
    const fn = vi.fn();
    const tl = timeline().to(a, 'fade', { duration: 200 }).call(fn, 100);
    tl.seek(50);
    expect(fn).not.toHaveBeenCalled();
    tl.seek(150);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('plays to the end and resolves (reverse goes back to 0)', async () => {
    const [a] = boxes(1);
    const done = vi.fn();
    const tl = timeline({ onComplete: done }).to(a, 'fade', { duration: 30 });
    await tl.play();
    expect(tl.progress()).toBe(1);
    expect(done).toHaveBeenCalled();
    await tl.reverse();
    expect(tl.time).toBe(0);
  });

  it('jumps to the end under reduced motion', async () => {
    installComponentMocks({ reducedMotion: true });
    const [a] = boxes(1);
    const tl = timeline().to(a, 'fade-up', { duration: 10000 });
    await tl.play();
    expect(tl.progress()).toBe(1);
  });

  it('scrub maps the source position in the viewport to progress', () => {
    const [a] = boxes(1);
    const src = document.createElement('section');
    document.body.appendChild(src);
    (window as any).innerHeight = 1000;
    src.getBoundingClientRect = () => ({ top: 500, height: 1000 } as DOMRect);
    const tl = timeline().to(a, 'fade', { duration: 1000 });
    const stop = tl.scrub(src);
    expect(tl.progress()).toBeCloseTo(0.25);
    stop();
  });

  it('has named presets', () => {
    expect(Object.keys(TIMELINE_PRESETS)).toEqual(expect.arrayContaining(['fade-up', 'scale', 'blur', 'clip-up']));
  });
});

describe('<usa-timeline>', () => {
  it('builds steps from data-tl children and plays when in view', async () => {
    const el = mount<any>('<usa-timeline overlap="100" duration="300"><h2 data-tl="fade-up">A</h2><p data-tl="blur" data-label="p">B</p><i data-tl="nope"></i></usa-timeline>');
    expect(el.timeline.duration).toBe(300 + 200 + 200);
    expect(el.timeline.labels.p).toBe(300);
    const complete = vi.fn();
    el.addEventListener('usa:complete', complete);
    intersect(el, true);
    await new Promise((r) => setTimeout(r, 800));
    expect(el.timeline.progress()).toBe(1);
    expect(complete).toHaveBeenCalled();
  });

  it('shows the final state under reduced motion', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-timeline><h2 data-tl="fade-up">A</h2></usa-timeline>');
    expect(el.timeline.progress()).toBe(1);
  });

  it('click trigger', async () => {
    const el = mount<any>('<usa-timeline trigger="click" duration="20"><b data-tl="scale">x</b></usa-timeline>');
    el.click();
    await new Promise((r) => setTimeout(r, 120));
    await tick();
    expect(el.timeline.progress()).toBe(1);
  });
});
