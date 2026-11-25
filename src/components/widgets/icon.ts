import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { cleanColor } from './kit';
import { ICON_SVG_ATTRS, iconParts } from './icon-set';
import css from './icons.css?raw';

/** The motions an icon can play (17.14). */
export const ICON_MOTIONS = ['spin', 'pulse', 'beat', 'bounce', 'wiggle', 'shake', 'ring', 'float', 'flip', 'draw', 'pop', 'blink'] as const;
export type IconMotion = (typeof ICON_MOTIONS)[number];

/** When a motion plays: always, on hover or focus of the nearest control, on click, or once when scrolled into view. */
export const ICON_TRIGGERS = ['loop', 'hover', 'click', 'view'] as const;
export type IconTrigger = (typeof ICON_TRIGGERS)[number];

const SVG_NS = 'http://www.w3.org/2000/svg';

/** An icon's `<svg>` element, built with DOM calls (no markup parsing). Unknown names give an empty svg. */
export function iconElement(name: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries(ICON_SVG_ATTRS)) svg.setAttribute(k, v);
  for (const part of iconParts(name)) {
    const el = document.createElementNS(SVG_NS, part.tag);
    for (const [k, v] of Object.entries(part.attrs)) el.setAttribute(k, v);
    // a path length of 1 lets the draw motion trace any shape with the same dash numbers
    el.setAttribute('pathLength', '1');
    svg.append(el);
  }
  return svg;
}

/**
 * One icon from the built-in set of 753 line icons (`ICONS`, see docs/icons-17-14.md), drawn with `currentColor` so it
 * takes the colour of the text around it. It can play one of twelve small motions: `spin`, `pulse`, `beat`, `bounce`,
 * `wiggle`, `shake`, `ring`, `float`, `flip`, `draw` (the lines trace themselves), `pop` and `blink`, either on a loop,
 * on hover or focus of the nearest button or link (or the icon itself), on click, or once when it scrolls into view.
 * Without a `label` the icon is decorative and hidden from screen readers; with one it is an image with that name.
 * Nothing moves under reduced motion.
 *
 * Attributes: `name`, `size` (px; 24), `stroke` (line width, 0.5–4; 2), `color`, `label`, `motion`, `trigger` (loop,
 * hover, click, view; hover), `duration` (ms of one run; depends on the motion).
 * Event `usa:play` ({ name, motion }) when a motion starts by hover, click or view.
 */
export interface UsaIconElement extends UsaElement {
  /** Play the icon's motion once now (no-op without a motion or under reduced motion). */
  play(): void;
}

const DURATIONS: Record<IconMotion, number> = { spin: 1200, pulse: 1200, beat: 900, bounce: 900, wiggle: 700, shake: 600, ring: 900, float: 1800, flip: 900, draw: 1100, pop: 450, blink: 900 };

export function defineIcon(tag = 'usa-icon'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Icon extends Base {
    static get observedAttributes(): string[] { return ['name', 'size', 'stroke', 'color', 'label', 'motion', 'trigger', 'duration']; }
    private _play?: () => void;
    play(): void { this._play?.(); }
    mount(): void {
      const name = this.str('name');
      const svg = iconElement(name);
      svg.classList.add('usa-kit', 'usa-icon');
      svg.dataset.name = name;
      const size = Math.max(8, Math.min(512, this.num('size', 24)));
      svg.setAttribute('width', String(size));
      svg.setAttribute('height', String(size));
      svg.setAttribute('stroke-width', String(Math.max(0.5, Math.min(4, this.num('stroke', 2)))));
      const color = cleanColor(this.str('color'));
      if (color) svg.style.color = color;
      const label = this.str('label');
      if (label) {
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', label);
      } else svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const motion = (ICON_MOTIONS as readonly string[]).includes(this.str('motion')) ? (this.str('motion') as IconMotion) : null;
      const trigger = (ICON_TRIGGERS as readonly string[]).includes(this.str('trigger')) ? (this.str('trigger') as IconTrigger) : 'hover';
      if (motion) {
        svg.dataset.motion = motion;
        svg.style.setProperty('--usa-icon-dur', `${Math.max(150, Math.min(10000, this.num('duration', DURATIONS[motion])))}ms`);
      }
      this.append(svg);
      this.onCleanup(() => svg.remove());
      this._play = undefined;
      if (!motion || this.reduced) return;

      if (trigger === 'loop') {
        svg.dataset.run = 'loop';
        return;
      }
      const start = () => {
        if (svg.dataset.run === 'once') return;
        svg.dataset.run = 'once';
        this.emit('play', { name, motion });
      };
      // the run ends when the motion's last animation ends (the draw motion animates every shape)
      this.listen(svg, 'animationend', (e: AnimationEvent) => {
        if (e.target === svg || e.target === svg.lastElementChild) delete svg.dataset.run;
      });
      this._play = start;
      if (trigger === 'view') {
        let seen = false;
        this.inView((v) => { if (v && !seen) { seen = true; start(); } }, { threshold: 0.6 });
      } else {
        const host = (this.closest('button, a, [role="button"], label') as HTMLElement | null) || this;
        if (trigger === 'click') this.listen(host, 'click', start);
        else {
          this.listen(host, 'pointerenter', start);
          this.listen(host, 'focusin', start);
        }
      }
    }
  }, { id: 'icons', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
