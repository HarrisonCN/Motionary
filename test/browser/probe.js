// 13.1.0: resource probe injected before any page script (page.addInitScript). It counts what a component can leave
// behind after it is disconnected: listeners on window / document / <html> / <body>, intervals, observers that still
// observe something, requestAnimationFrame calls, and WebGL contexts that were never lost or released.
// Read it with window.__probe.snapshot(); window.__probe.rafCount() counts rAF calls since the last reset.
(() => {
  if (window.__probe) return;
  const globals = () => [window, document, document.documentElement, document.body].filter(Boolean);
  const listeners = new Map(); // target -> Set<key>
  const keyOf = (type, fn, opts) => type + '|' + (typeof opts === 'boolean' ? opts : !!(opts && opts.capture)) + '|' + fnId(fn);
  const ids = new WeakMap();
  let nextId = 1;
  const fnId = (fn) => {
    if (!fn || (typeof fn !== 'function' && typeof fn !== 'object')) return String(fn);
    if (!ids.has(fn)) ids.set(fn, nextId++);
    return ids.get(fn);
  };
  const add = EventTarget.prototype.addEventListener;
  const rem = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (globals().includes(this) && fn) {
      if (!listeners.has(this)) listeners.set(this, new Map());
      const once = typeof opts === 'object' && opts && opts.once;
      if (!once) listeners.get(this).set(keyOf(type, fn, opts), String(type));
    }
    return add.call(this, type, fn, opts);
  };
  EventTarget.prototype.removeEventListener = function (type, fn, opts) {
    listeners.get(this)?.delete(keyOf(type, fn, opts));
    return rem.call(this, type, fn, opts);
  };

  const intervals = new Set();
  const si = window.setInterval, ci = window.clearInterval;
  window.setInterval = function (...a) { const id = si.apply(this, a); intervals.add(id); return id; };
  window.clearInterval = function (id) { intervals.delete(id); return ci.call(this, id); };

  let raf = 0;
  const r = window.requestAnimationFrame;
  window.requestAnimationFrame = function (cb) { raf++; return r.call(this, cb); };

  const observing = new Map(); // observer -> Set<target>
  for (const name of ['ResizeObserver', 'IntersectionObserver', 'MutationObserver']) {
    const O = window[name];
    if (!O) continue;
    const P = class extends O {
      observe(t, o) { if (!observing.has(this)) observing.set(this, { name, targets: new Set() }); observing.get(this).targets.add(t); return super.observe(t, o); }
      unobserve(t) { const s = observing.get(this); s?.targets.delete(t); if (s && !s.targets.size) observing.delete(this); return super.unobserve(t); }
      disconnect() { observing.delete(this); return super.disconnect(); }
    };
    Object.defineProperty(window, name, { value: P, configurable: true, writable: true });
  }

  const contexts = []; // { ctx, kind, canvas, released }
  const wrapGetContext = (proto) => {
    if (!proto || !proto.getContext) return;
    const g = proto.getContext;
    proto.getContext = function (type, ...rest) {
      const ctx = g.call(this, type, ...rest);
      if (ctx && /webgl/.test(String(type)) && !contexts.some((c) => c.ctx === ctx)) contexts.push({ ctx, kind: String(type), canvas: this });
      return ctx;
    };
  };
  wrapGetContext(window.HTMLCanvasElement && HTMLCanvasElement.prototype);
  wrapGetContext(window.OffscreenCanvas && OffscreenCanvas.prototype);

  // every Element.animate() call: who animated and which properties each keyframe touches
  const anims = [];
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (frames, opts) {
    const list = Array.isArray(frames) ? frames : frames && typeof frames === 'object' ? Object.keys(frames).map((k) => ({ [k]: [].concat(frames[k]).join(' ') })) : [];
    anims.push({ el: this.localName + (typeof this.className === 'string' && this.className ? '.' + this.className.trim().split(/\s+/)[0] : ''), frames: list.map((f) => Object.fromEntries(Object.entries(f).filter(([k]) => !['offset', 'easing', 'composite'].includes(k)).map(([k, v]) => [k, String(v)]))) });
    return animate.call(this, frames, opts);
  };

  const errors = [];
  window.addEventListener('error', (e) => errors.push(String(e.message || e.error)));
  window.addEventListener('unhandledrejection', (e) => errors.push(String((e.reason && e.reason.message) || e.reason)));

  window.__probe = {
    snapshot() {
      let n = 0; const types = [];
      for (const m of listeners.values()) { n += m.size; types.push(...m.values()); }
      let obs = 0;
      for (const [, v] of observing) obs += [...v.targets].filter((t) => t instanceof Node).length ? 1 : 0;
      const obsDetached = [...observing.values()].filter((v) => [...v.targets].some((t) => t instanceof Node && !t.isConnected)).map((v) => v.name);
      return { listeners: n, listenerTypes: types.sort(), intervals: intervals.size, observers: obs, observersOnDetached: obsDetached, webgl: contexts.length, webglLive: contexts.filter((c) => !c.ctx.isContextLost()).length, errors: errors.slice() };
    },
    // contexts created after `from` that are still alive although their canvas left the document
    leakedContexts(from = 0) { return contexts.slice(from).filter((c) => !c.ctx.isContextLost() && !(c.canvas.isConnected)).map((c) => c.kind); },
    contextCount() { return contexts.length; },
    liveContexts(from = 0) { return contexts.slice(from).filter((c) => !c.ctx.isContextLost()).length; },
    resetRaf() { raf = 0; },
    animations() { return anims.slice(); },
    resetAnimations() { anims.length = 0; },
    rafCount() { return raf; },
  };
})();
