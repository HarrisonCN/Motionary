import { raf, caf, getMotionSensitivity, type UsaBase, type UsaElement } from '../base';
import { createMatterEngine, finite, type MatterKind, type MatterOptions, type MatterPoint } from '../matter/engine';

export type MatterData = Record<string, string | number | boolean | null>;
export interface UsaMatterElement extends UsaElement {
  play(): void; pause(): void; reset(): void; activate(): void; deactivate(): void; update(data: MatterData): void;
}
type BaseCtor = new () => UsaBase;
interface MatterController extends UsaBase, UsaMatterElement { notify(type: 'action' | 'change', detail: Record<string, unknown>): void; }
export function setMatterData(el: HTMLElement, data: MatterData): void {
  const allowed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
  for (const [key, value] of Object.entries(data)) if (allowed.includes(key)) {
    if (value === false || value === null) el.removeAttribute(key); else el.setAttribute(key, value === true ? '' : String(value));
  }
}
export const matterOptions = (el: UsaBase): MatterOptions => ({
  seed: el.num('seed', 1), count: el.num('count', 900), color: el.str('color', '#e7e8df'), accent: el.str('accent', '#74aaff'),
  text: el.str('text', 'flow'), fill: el.num('fill', .5), feed: el.num('feed', .037), kill: el.num('kill', .06),
  strength: el.num('strength', 1), mode: el.str('mode', 'dots'), shape: el.str('shape', 'square'),
});

/** One owned canvas, no cloned content. All observers, captures and frame callbacks are released. */
export function matterClass(Base: BaseCtor, kind: MatterKind): new () => MatterController {
  return class Matter extends Base {
    private _sync?: (rebuild?: boolean) => void;
    private _reset?: () => void;
    private _engage?: (on: boolean) => void;
    notify(type: 'action' | 'change', detail: Record<string, unknown>): void { this.emit(type, detail); }
    play(): void { if (!this.flag('disabled')) { this.setFlag('animated', true); this.setFlag('paused', false); } }
    pause(): void { this.setFlag('paused', true); }
    reset(): void { this._reset?.(); }
    activate(): void { this._engage?.(true); }
    deactivate(): void { this._engage?.(false); }
    update(data: MatterData): void { setMatterData(this, data); }
    changed(name: string): void { this._sync?.(!['label', 'disabled', 'animated', 'paused'].includes(name)); }
    mount(): void {
      this.classList.add('usa-matter'); this.dataset.matter = kind; this.setAttribute('role', 'group');
      const shell = document.createElement('div'); shell.className = 'usa-matter-shell';
      const canvas = document.createElement('canvas'); canvas.className = 'usa-matter-canvas'; canvas.setAttribute('role', 'img');
      const bar = document.createElement('div'); bar.className = 'usa-matter-bar';
      const hint = document.createElement('span'); hint.textContent = 'Drag to explore · arrows move · Space holds';
      const engage = document.createElement('button'); engage.type = 'button'; engage.textContent = 'Interact';
      const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Reset';
      bar.append(hint, engage, reset); shell.append(canvas, bar); this.prepend(shell);
      let ctx: CanvasRenderingContext2D | null = null;
      try { ctx = canvas.getContext('2d'); } catch { /* an accessible fallback remains usable */ }
      let engine = createMatterEngine(kind, matterOptions(this)), id = 0, last = 0, time = 0, until = 0;
      let visible = typeof IntersectionObserver === 'undefined', engaged = false, pointer: number | undefined;
      const point: MatterPoint = { x: .5, y: .5, active: false, pressed: false };
      const calm = () => this.reduced || getMotionSensitivity() !== 'full';
      const stop = () => { if (id) caf(id); id = 0; last = 0; };
      const release = () => {
        const held = pointer; pointer = undefined; point.pressed = false;
        if (held !== undefined) { try { if (canvas.hasPointerCapture?.(held)) canvas.releasePointerCapture(held); } catch { /* already cancelled */ } }
      };
      const paint = (dt = 0) => {
        if (!ctx) return;
        const box = canvas.getBoundingClientRect(), width = Math.max(1, box.width || 560), height = Math.max(1, box.height || 340);
        const dpr = finite(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 1, 1, 2);
        const pw = Math.round(width * dpr), ph = Math.round(height * dpr);
        if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
        point.instant = calm(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); engine.draw(ctx, width, height, time, dt, point);
      };
      const active = () => visible && !document.hidden && !this.flag('disabled') && !this.flag('paused') && !calm() && (this.flag('animated') || performance.now() < until);
      const frame = (now: number) => {
        id = 0; if (!active()) { stop(); return; }
        const dt = last ? Math.min(.04, Math.max(0, (now - last) / 1000)) : 0; last = now; time += dt;
        paint(dt); id = raf(frame, this);
      };
      const wake = () => { if (active() && !id) id = raf(frame, this); else if (!active()) stop(); };
      const sync = (rebuild = false) => {
        if (rebuild) engine = createMatterEngine(kind, matterOptions(this));
        const disabled = this.flag('disabled'), label = this.str('label', kind.replace(/-/g, ' '));
        this.setAttribute('aria-label', label); canvas.setAttribute('aria-label', `${label}. Arrow keys move, Space holds, Enter resets, Escape exits.`);
        canvas.tabIndex = disabled ? -1 : 0; canvas.setAttribute('aria-disabled', String(disabled)); reset.disabled = engage.disabled = disabled;
        this.toggleAttribute('data-matter-calm', calm());
        if (disabled || document.hidden || !visible || this.flag('paused')) { release(); until = 0; }
        if (!ctx) hint.textContent = 'Canvas 2D is unavailable in this browser';
        paint(); wake();
      };
      this._sync = sync;
      this._engage = on => {
        if (this.flag('disabled')) return;
        engaged = on; shell.toggleAttribute('data-engaged', on); engage.textContent = on ? 'Done' : 'Interact'; engage.setAttribute('aria-pressed', String(on));
        if (on) canvas.focus(); else { release(); point.active = false; engage.focus(); }
        this.notify('action', { action: on ? 'activate' : 'deactivate' }); sync();
      };
      this._reset = () => { release(); point.x = point.y = .5; point.active = false; time = 0; until = 0; engine = createMatterEngine(kind, matterOptions(this)); paint(); this.notify('action', { action: 'reset' }); };
      const move = (event: PointerEvent) => {
        const r = canvas.getBoundingClientRect(); point.x = finite((event.clientX - r.left) / Math.max(1, r.width), .5, 0, 1); point.y = finite((event.clientY - r.top) / Math.max(1, r.height), .5, 0, 1); point.active = true;
        until = performance.now() + 1600; paint(); wake();
      };
      this.listen(canvas, 'pointerdown', (e: PointerEvent) => {
        if (pointer !== undefined || this.flag('disabled') || e.button !== 0 || (e.pointerType === 'touch' && !engaged)) return;
        pointer = e.pointerId; move(e); point.pressed = true;
        try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic input */ }
        canvas.focus(); this.notify('action', { action: 'press', x: point.x, y: point.y }); paint();
      });
      this.listen(canvas, 'pointermove', (e: PointerEvent) => { if (!this.flag('disabled') && (pointer === undefined || pointer === e.pointerId) && (e.pointerType !== 'touch' || engaged)) move(e); });
      const end = (event: PointerEvent) => { if (pointer === undefined || event.pointerId !== pointer) return; release(); until = performance.now() + 1200; this.notify('change', { x: point.x, y: point.y, pressed: false }); paint(); wake(); };
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) this.listen(canvas, type, end);
      this.listen(canvas, 'pointerleave', () => { if (!point.pressed) { point.active = false; until = performance.now() + 1000; paint(); wake(); } });
      this.listen(canvas, 'keydown', (e: KeyboardEvent) => {
        if (this.flag('disabled') || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape', '0'].includes(e.key)) return;
        e.preventDefault(); if (e.repeat && e.key === ' ') return;
        if (e.key === 'Escape') { this.deactivate(); return; }
        if (e.key === 'Enter' || e.key === '0') { this.reset(); return; }
        point.active = true; if (e.key === ' ') point.pressed = !point.pressed;
        if (e.key === 'ArrowLeft') point.x = Math.max(0, point.x - .05); if (e.key === 'ArrowRight') point.x = Math.min(1, point.x + .05);
        if (e.key === 'ArrowUp') point.y = Math.max(0, point.y - .05); if (e.key === 'ArrowDown') point.y = Math.min(1, point.y + .05);
        until = performance.now() + 1600; paint(); wake(); this.notify('change', { x: point.x, y: point.y, pressed: point.pressed });
      });
      this.listen(canvas, 'blur', () => { release(); point.active = false; });
      this.listen(engage, 'click', () => engaged ? this.deactivate() : this.activate()); this.listen(reset, 'click', () => this.reset());
      this.listen(document, 'visibilitychange', () => { if (document.hidden) { release(); point.active = false; until = 0; } sync(); });
      if (typeof matchMedia === 'function') this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', () => sync());
      const sensitivity = new MutationObserver(() => sync()); sensitivity.observe(document.documentElement, { attributes: true, attributeFilter: ['data-usa-sensitivity', 'data-usa-motion'] }); this.onCleanup(() => sensitivity.disconnect());
      if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => paint()); ro.observe(canvas); this.onCleanup(() => ro.disconnect()); }
      this.inView(v => { visible = v; sync(); });
      this.onCleanup(() => { stop(); release(); this._sync = this._reset = this._engage = undefined; shell.remove(); }); sync();
    }
  };
}
