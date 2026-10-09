/**
 * 10.2: declarative `data-motion` in `motionary/core` — no DSL package needed.
 *
 * ```html
 * <h1 data-motion="enter: fade-up 600ms">Hello</h1>
 * <ul data-motion="enter: fade-up 500ms stagger 80ms"> <li>…</li> <li>…</li> </ul>
 * <button data-motion="click: pop; hover: lift">Buy</button>
 * ```
 * ```ts
 * import { createMotion, applyMotionAttributes } from 'motionary/core';
 * const stop = applyMotionAttributes(createMotion(), document, { observe: true });
 * ```
 *
 * Rule grammar (subset of the 9.0 DSL): `trigger: effect [duration] [delay <t>]
 * [stagger <t>] [ease <easing>] [once]`, rules separated by `;`. Triggers:
 * `enter`, `load`, `click`, `hover`, `loop`. Times: `600ms`, `0.6s`, `600`.
 * `stagger` animates the element's children. Effects are core presets or any
 * effect a plugin registered with `use()`.
 */
import { PRESETS, type MotionInstance, type Trigger } from './index';

export interface MotionAttrRule {
  trigger: Trigger;
  effect: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  once?: boolean;
}

const TRIGGERS = ['enter', 'load', 'click', 'hover', 'loop'];
const ms = (t: string): number => (t.endsWith('ms') ? parseFloat(t) : t.endsWith('s') ? parseFloat(t) * 1000 : parseFloat(t));

/** Parse a `data-motion` value. Throws on an unknown trigger or a malformed rule. */
export function parseMotionAttr(value: string): MotionAttrRule[] {
  return value
    .split(';')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const m = /^([a-z]+)\s*:\s*(.+)$/i.exec(r);
      if (!m || !TRIGGERS.includes(m[1])) throw new Error(`[motionary] data-motion: bad rule "${r}" (use trigger: effect, trigger = ${TRIGGERS.join(' | ')})`);
      const toks = m[2].trim().split(/\s+/);
      const rule: MotionAttrRule = { trigger: m[1] as Trigger, effect: toks.shift()! };
      for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        if (t === 'delay' || t === 'stagger') rule[t] = ms(toks[++i] || '0');
        else if (t === 'ease') rule.easing = toks[++i];
        else if (t === 'once') rule.once = true;
        else if (/^[\d.]+(ms|s)?$/.test(t)) rule.duration = ms(t);
        else rule.easing = t;
      }
      return rule;
    });
}

/**
 * Wire every `[data-motion]` element under `root` to the motion instance.
 * `observe: true` also wires elements added later (MutationObserver).
 * Returns a function that unbinds everything. No-op without a DOM (SSR).
 */
export function applyMotionAttributes(m: MotionInstance, root: ParentNode | null = typeof document !== 'undefined' ? document : null, o: { attribute?: string; observe?: boolean } = {}): () => void {
  if (!root) return () => undefined;
  const attr = o.attribute || 'data-motion';
  const offs = new Map<Element, (() => void)[]>();
  const wire = (el: Element) => {
    if (offs.has(el)) return;
    const value = el.getAttribute(attr);
    if (!value) return;
    const list: (() => void)[] = [];
    for (const r of parseMotionAttr(value)) {
      const opts = { duration: r.duration, delay: r.delay, easing: r.easing };
      for (const k of Object.keys(opts) as (keyof typeof opts)[]) if (opts[k] === undefined) delete opts[k];
      if (r.trigger === 'enter' && r.effect in PRESETS) {
        list.push(m.reveal(r.stagger ? el.children : el, r.effect, { ...opts, stagger: r.stagger, once: r.once ?? true }));
      } else {
        if (!m.has(r.effect)) throw new Error(`[motionary] data-motion: unknown effect "${r.effect}" — register its plugin with createMotion().use(…)`);
        list.push(m.bind(el as HTMLElement, r.effect, { ...opts, trigger: r.trigger, once: r.once }));
      }
    }
    offs.set(el, list);
    el.setAttribute('data-motion-ready', '');
  };
  const scan = (n: ParentNode) => {
    if ((n as Element).getAttribute?.(attr)) wire(n as Element);
    n.querySelectorAll?.(`[${attr}]`).forEach(wire);
  };
  scan(root);
  let mo: MutationObserver | null = null;
  if (o.observe && typeof MutationObserver !== 'undefined') {
    mo = new MutationObserver((recs) => recs.forEach((r) => r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n as Element))));
    mo.observe(root as Node, { childList: true, subtree: true });
  }
  return () => {
    mo?.disconnect();
    offs.forEach((l, el) => {
      l.forEach((f) => f());
      el.removeAttribute('data-motion-ready');
    });
    offs.clear();
  };
}

