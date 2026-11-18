import type { UsaBase } from '../base';
import { createSpring, rubberBand } from '../physics/spring';
import { velocityTracker } from '../../runtime/drag-snap';
import type { InstrumentKind, InstrumentView, SpatialInstrumentsApi } from '../../runtime/spatial-instruments';
import { runtimeModule } from './runtime-link';

export const bounded = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const captions = {
  lens: ['Lens assembly', 'Separation'],
  iris: ['Iris diaphragm', 'Opening'],
  relief: ['Contour study', 'Elevation'],
};

export function instrumentPanel(
  host: UsaBase & { value: number },
  kind: InstrumentKind,
  input: (value: number) => void,
  change: (value: number) => void,
) {
  const root = document.createElement('section');
  root.className = 'mo-instrument';
  root.dataset.kind = kind;
  const header = document.createElement('header');
  const title = document.createElement('strong');
  const reading = document.createElement('span');
  header.append(title, reading);

  const stage = document.createElement('div');
  stage.className = 'mo-instrument-stage';
  stage.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  const diagram = document.createElement('div');
  diagram.className = 'mo-instrument-diagram';
  const count = kind === 'iris' ? 1 : 7;
  for (let i = 0; i < count; i++) {
    const line = document.createElement('i');
    line.style.setProperty('--layer', String(i - Math.floor(count / 2)));
    diagram.append(line);
  }
  stage.append(canvas, diagram);

  const control = document.createElement('label');
  const caption = document.createElement('span');
  caption.textContent = captions[kind][1];
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.step = '1';
  control.append(caption, slider);
  root.append(header, stage, control);
  host.append(root);

  let view: InstrumentView | undefined;
  let visible = false;
  let lost = false;
  let frame = 0;
  let pointer: number | undefined;
  let originX = 0, originY = 0, startValue = 0, width = 1;
  let dragging = false;
  let internal = false;
  const tracker = velocityTracker();
  const paint = () => {
    frame = 0;
    root.style.setProperty('--progress', String(position.value / 100));
    if (!lost && visible) view?.render(position.value / 100, tilt.value);
  };
  const invalidate = () => {
    if (visible && !frame) frame = requestAnimationFrame(paint);
  };
  const position = createSpring({ value: host.value, spring: { stiffness: 325, damping: 23 }, onUpdate: invalidate });
  const tilt = createSpring({ spring: { stiffness: 180, damping: 19, precision: 0.0001 }, onUpdate: invalidate });

  const sync = () => {
    const label = host.str('label', captions[kind][0]);
    title.textContent = label;
    reading.textContent = host.value + '%';
    slider.setAttribute('aria-label', label + ' — ' + captions[kind][1]);
    slider.value = String(host.value);
    if (!internal && position.target !== host.value) {
      if (visible && !host.reduced) position.set(host.value);
      else position.jump(host.value);
    }
  };
  const write = (v: number) => {
    const next = Math.round(bounded(v));
    if (next === host.value) return;
    internal = true;
    try { host.value = next; } finally { internal = false; }
    input(next);
  };
  const resize = () => {
    const rect = stage.getBoundingClientRect();
    view?.resize(rect.width, rect.height);
    invalidate();
  };
  const api = runtimeModule<SpatialInstrumentsApi>(host, 'spatial-instruments');
  const show = (on: boolean) => {
    visible = on;
    if (!on) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      tilt.jump(0);
      position.jump(host.value);
      return;
    }
    if (api && !view && !root.dataset.renderer) {
      try {
        view = api.createInstrument(canvas, kind);
        root.dataset.renderer = 'webgl';
      } catch {
        root.dataset.renderer = 'diagram';
      }
    }
    resize();
  };
  host.listen(canvas, 'webglcontextlost', (e: Event) => { e.preventDefault(); lost = true; root.dataset.renderer = 'diagram'; });
  host.listen(canvas, 'webglcontextrestored', () => { if (view) { lost = false; root.dataset.renderer = 'webgl'; resize(); } });
  host.inView(show);
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    host.onCleanup(() => observer.disconnect());
  } else host.listen(window, 'resize', resize);

  host.listen(slider, 'input', () => {
    const value = slider.valueAsNumber;
    write(value);
    position.jump(value);
  });
  host.listen(slider, 'change', () => change(host.value));

  host.listen(stage, 'pointerdown', (e: PointerEvent) => {
    if (pointer !== undefined || !e.isPrimary || e.button !== 0) return;
    pointer = e.pointerId;
    originX = e.clientX;
    originY = e.clientY;
    startValue = host.value;
    width = Math.max(1, stage.getBoundingClientRect().width * 0.8);
    tracker.reset();
    tracker.add(e.timeStamp, originX);
    stage.setPointerCapture(pointer);
  });
  host.listen(stage, 'pointermove', (e: PointerEvent) => {
    if (pointer === undefined) {
      if (e.pointerType === 'mouse' && !host.reduced) {
        const r = stage.getBoundingClientRect();
        if (r.width) tilt.set((e.clientX - r.left) / r.width * 2 - 1);
      }
      return;
    }
    if (pointer !== e.pointerId) return;
    const dx = e.clientX - originX;
    if (!dragging && (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(e.clientY - originY))) return;
    dragging = true;
    root.dataset.dragging = '';
    tracker.add(e.timeStamp, e.clientX);
    const raw = startValue + dx / width * 100;
    const logical = bounded(raw);
    write(logical);
    position.jump(host.reduced ? logical : logical + rubberBand(raw - logical, 10));
  });
  const end = (e: PointerEvent, cancel: boolean) => {
    if (pointer !== e.pointerId) return;
    pointer = undefined;
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    if (!dragging) return;
    dragging = false;
    delete root.dataset.dragging;
    const velocity = host.reduced ? 0 : tracker.velocity(e.timeStamp) / width * 100;
    const travel = Math.max(-12, Math.min(12, velocity * 0.075));
    const final = cancel ? startValue : Math.round(bounded(host.value + travel));
    write(final);
    position.set(final, cancel ? 0 : Math.max(-160, Math.min(160, velocity)));
    if (!cancel && final !== startValue) change(final);
  };
  host.listen(stage, 'pointerup', (e: PointerEvent) => end(e, false));
  host.listen(stage, 'pointercancel', (e: PointerEvent) => end(e, true));
  host.listen(stage, 'lostpointercapture', (e: PointerEvent) => end(e, true));
  host.listen(stage, 'pointerleave', () => { if (tilt.target) tilt.set(0); });
  host.onCleanup(() => {
    visible = false;
    position.stop();
    tilt.stop();
    if (frame) cancelAnimationFrame(frame);
    view?.dispose();
    root.remove();
    host.querySelector(':scope > .usa-rt-missing')?.remove();
  });
  sync();
  return sync;
}
