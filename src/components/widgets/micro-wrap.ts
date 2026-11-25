import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { micro, type MicroFeedback, type MicroHandle, type MicroOptions } from '../interaction/micro';
import css from './micro-kit-16.css?raw';

/**
 * `<mo-micro>` gives whatever it wraps spring micro-interactions from the 17.16 engine: press, hover, lift, magnetic,
 * tilt, glow, squish, drag and focus, in any mix, all adding up in one transform. Feedback impulses (`shake`, `nod`,
 * `pop`, `wiggle`, `jelly`, `nudge`, `bump`, `attention`) play through `feedback(kind)` or the `feedback` attribute.
 *
 * Attributes: `fx` (behaviours, space separated; press hover), `feel` (crisp | snappy | smooth | bouncy | playful |
 * calm | heavy), `spring` (one spring for everything: a preset name or "380ms 0.3"), `haptics`, `disabled`,
 * `press-scale` (0.96), `hover-scale` (1.03), `lift` (4), `strength` (magnet pull 0–1; 0.35), `reach` (14),
 * `tilt` (8), `bounds` (parent | none), `snap` (drag grid px), `axis` (x | y | both), `feedback` (plays when set).
 * Events: `usa:press`, `usa:release`, `usa:drag-end` ({ x, y }).
 */
export interface UsaMicroElement extends UsaElement {
  feedback(kind: MicroFeedback | string): void;
  readonly position: { x: number; y: number };
  moveTo(x: number, y: number, instant?: boolean): void;
}

export function defineMicro(tag = 'usa-micro'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class Micro extends Base {
    static get observedAttributes(): string[] {
      return ['fx', 'feel', 'spring', 'haptics', 'disabled', 'press-scale', 'hover-scale', 'lift', 'strength', 'reach', 'tilt', 'bounds', 'snap', 'axis', 'feedback'];
    }
    private _h: MicroHandle | null = null;
    get position(): { x: number; y: number } {
      return this._h ? this._h.position : { x: 0, y: 0 };
    }
    moveTo(x: number, y: number, instant?: boolean): void {
      this._h?.moveTo(x, y, instant);
    }
    feedback(kind: MicroFeedback | string): void {
      this._h?.feedback(kind);
    }
    private opts(): MicroOptions {
      const n = (a: string) => {
        const v = this.num(a, NaN);
        return Number.isFinite(v) ? v : undefined;
      };
      const axis = this.str('axis');
      return {
        feel: this.str('feel') || undefined,
        spring: this.str('spring') || undefined,
        haptics: this.flag('haptics'),
        disabled: this.flag('disabled'),
        pressScale: n('press-scale'),
        hoverScale: n('hover-scale'),
        lift: n('lift'),
        strength: n('strength'),
        reach: n('reach'),
        tilt: n('tilt'),
        snap: n('snap'),
        axis: axis === 'x' || axis === 'y' ? axis : 'both',
        bounds: this.str('bounds') === 'none' ? 'none' : 'parent',
        onPress: () => void this.emit('press'),
        onRelease: () => void this.emit('release'),
        onDragEnd: (p: { x: number; y: number }) => void this.emit('drag-end', { x: p.x, y: p.y }),
      };
    }
    mount(): void {
      this._h = micro(this, this.str('fx', 'press hover'), this.opts());
    }
    changed(name: string): void {
      if (!this._h) return;
      if (name === 'feedback') {
        const k = this.str('feedback');
        if (k) this._h.feedback(k);
        return;
      }
      this._h.update(this.str('fx', 'press hover'), this.opts());
    }
    unmount(): void {
      this._h?.destroy();
      this._h = null;
    }
  }, { id: 'micro-kit-16', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
