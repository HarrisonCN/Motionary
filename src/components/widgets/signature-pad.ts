import { defineElement, now, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { cleanColor } from './kit';
import { strokeWidth } from './kit-13';
import css from './ui-kit-13.css?raw';

type Pt = { x: number; y: number; w: number };

/**
 * A signature pad. Draw with a mouse, pen or finger: strokes are smoothed into curves and get thinner when drawn fast,
 * like ink (pen pressure is used when the device reports it). Undo takes back the last stroke and Clear empties the
 * pad. People who cannot draw can type their name instead; it is set in a handwriting style. With `name` the
 * signature is also put into a hidden form field as a PNG data URL, so a surrounding form submits it.
 *
 * Attributes: `label` (Signature), `color` (ink; #111827), `width` (base stroke in px; 2.5), `name`, `clear-label`
 * (Clear), `undo-label` (Undo), `type-label` (Or type your name), `placeholder` (Sign here).
 * Event `usa:change` ({ empty, strokes, typed }). Methods `clear()`, `undo()`, `toDataURL()`; property `empty`.
 */
export interface UsaSignaturePadElement extends UsaElement {
  readonly empty: boolean;
  clear(): void;
  undo(): void;
  toDataURL(type?: string): string;
}

export function defineSignaturePad(tag = 'usa-signature-pad'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SignaturePad extends Base {
    static get observedAttributes(): string[] { return ['label', 'color', 'width', 'name', 'clear-label', 'undo-label', 'type-label', 'placeholder']; }
    private _strokes: Pt[][] = [];
    private _typed = '';
    private _api?: { clear(): void; undo(): void; url(type?: string): string };
    get empty(): boolean { return !this._strokes.length && !this._typed; }
    clear(): void { this._api?.clear(); }
    undo(): void { this._api?.undo(); }
    toDataURL(type = 'image/png'): string { return this._api?.url(type) ?? ''; }
    mount(): void {
      const root = make('div', 'usa-kit usa-sign');
      const id = uniqueId('usa-sign');
      const head = make('div', 'usa-sign-head');
      const lab = make('span', 'usa-sign-label', this.str('label', 'Signature'));
      lab.id = `${id}-l`;
      const tools = make('span', 'usa-sign-tools');
      const undoB = make('button', 'usa-sign-undo', this.str('undo-label', 'Undo'));
      const clearB = make('button', 'usa-sign-clear', this.str('clear-label', 'Clear'));
      undoB.type = clearB.type = 'button';
      tools.append(undoB, clearB);
      head.append(lab, tools);
      const pad = make('div', 'usa-sign-pad');
      const canvas = make('canvas', 'usa-sign-canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-labelledby', `${id}-l`);
      const hint = make('span', 'usa-sign-hint', this.str('placeholder', 'Sign here'));
      hint.setAttribute('aria-hidden', 'true');
      const line = make('span', 'usa-sign-line');
      line.setAttribute('aria-hidden', 'true');
      pad.append(canvas, line, hint);
      const typeWrap = make('label', 'usa-sign-type');
      const typeText = make('span', '', this.str('type-label', 'Or type your name'));
      const typeField = make('input', 'usa-sign-field');
      typeField.type = 'text';
      typeField.autocomplete = 'name';
      typeWrap.append(typeText, typeField);
      const hiddenField = make('input');
      hiddenField.type = 'hidden';
      const fieldName = this.str('name');
      if (fieldName) hiddenField.name = fieldName;
      root.append(head, pad, typeWrap);
      if (fieldName) root.append(hiddenField);
      this.append(root);
      const ctx = (() => { try { return canvas.getContext('2d'); } catch { return null; } })();
      const ink = cleanColor(this.str('color')) || '#111827';
      const base = Math.max(0.5, Math.min(12, this.num('width', 2.5)));
      let dpr = 1;
      const size = () => {
        dpr = Math.min(3, window.devicePixelRatio || 1);
        const w = pad.clientWidth || 320, h = pad.clientHeight || 160;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        draw();
      };
      const seg = (p: Pt[]) => {
        if (!ctx || !p.length) return;
        ctx.fillStyle = ctx.strokeStyle = ink;
        ctx.lineCap = ctx.lineJoin = 'round';
        if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0].x, p[0].y, p[0].w / 2, 0, Math.PI * 2); ctx.fill(); return; }
        for (let i = 1; i < p.length; i++) {
          const a = p[i - 1], b = p[i];
          const prev = p[i - 2] ?? a;
          ctx.beginPath();
          ctx.lineWidth = (a.w + b.w) / 2;
          ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
          ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
          ctx.stroke();
        }
      };
      const draw = () => {
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this._typed) {
          const w = canvas.width / dpr, h = canvas.height / dpr;
          ctx.fillStyle = ink;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          let fs = Math.min(56, h * 0.42);
          ctx.font = `italic ${fs}px "Segoe Script","Brush Script MT","Snell Roundhand",cursive`;
          const tw = ctx.measureText(this._typed).width;
          if (tw > w * 0.86) { fs *= (w * 0.86) / tw; ctx.font = `italic ${fs}px "Segoe Script","Brush Script MT","Snell Roundhand",cursive`; }
          ctx.fillText(this._typed, w / 2, h * 0.66);
          return;
        }
        for (const s of this._strokes) seg(s);
      };
      const sync = (fire = true) => {
        const empty = this.empty;
        root.toggleAttribute('data-empty', empty);
        undoB.disabled = !this._strokes.length;
        clearB.disabled = empty;
        canvas.setAttribute('aria-label', `${this.str('label', 'Signature')}: ${empty ? '—' : this._typed || `${this._strokes.length}`}`);
        if (fieldName) hiddenField.value = empty ? '' : this.toDataURL();
        if (fire) this.emit('change', { empty, strokes: this._strokes.length, typed: !!this._typed });
      };
      let cur: Pt[] | null = null;
      let last = { x: 0, y: 0, t: 0 };
      const at = (e: PointerEvent): Pt => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const t = now();
        const speed = last.t ? Math.hypot(x - last.x, y - last.y) / Math.max(1, t - last.t) : 0;
        last = { x, y, t };
        const pr = e.pointerType === 'pen' && e.pressure > 0 ? 0.5 + e.pressure : 1;
        return { x, y, w: strokeWidth(speed, base) * pr };
      };
      this.listen(canvas, 'pointerdown', (e: PointerEvent) => {
        if (e.button > 0) return;
        e.preventDefault();
        if (this._typed) { this._typed = ''; typeField.value = ''; }
        try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
        last = { x: 0, y: 0, t: 0 };
        cur = [at(e)];
        this._strokes.push(cur);
        draw();
        root.setAttribute('data-drawing', '');
      });
      this.listen(canvas, 'pointermove', (e: PointerEvent) => {
        if (!cur) return;
        const p = at(e);
        const q = cur[cur.length - 1];
        if (Math.hypot(p.x - q.x, p.y - q.y) < 1.2) return;
        p.w = q.w * 0.6 + p.w * 0.4;
        cur.push(p);
        if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); seg(cur.slice(-3)); }
      });
      const up = () => {
        if (!cur) return;
        cur = null;
        root.removeAttribute('data-drawing');
        draw();
        sync();
      };
      this.listen(canvas, 'pointerup', up);
      this.listen(canvas, 'pointercancel', up);
      this.listen(typeField, 'input', () => {
        this._typed = typeField.value.trim().slice(0, 60);
        if (this._typed) this._strokes = [];
        draw();
        sync();
      });
      const clear = () => { this._strokes = []; this._typed = ''; typeField.value = ''; draw(); sync(); };
      const undo = () => { if (this._strokes.length) { this._strokes.pop(); draw(); sync(); } };
      this._api = {
        clear, undo,
        url: (type = 'image/png') => { try { return canvas.toDataURL(type); } catch { return ''; } },
      };
      this.listen(clearB, 'click', clear);
      this.listen(undoB, 'click', undo);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => size());
        ro.observe(pad);
        this.onCleanup(() => ro.disconnect());
      }
      size();
      sync(false);
      this.onCleanup(() => { root.remove(); this._api = undefined; });
    }
  }, { id: 'ui-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
