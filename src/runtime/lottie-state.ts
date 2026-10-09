/**
 * `motionary/runtime/lottie-state` (10.9) — dotLottie **themes** (slots) and a
 * **state machine subset** for `motionary/runtime/vector` (own
 * implementation; requires `use(vector, lottieState)`).
 *
 * Themes: Lottie slots (`"sid"` on a property + the animation's `slots`)
 * and dotLottie theme files (`t/<id>.json`, rules of type Color · Scalar ·
 * Vector / Position · Text, static `value` or `keyframes`, optionally limited
 * to some `animations`) → `applyTheme(animation, theme)` returns a themed copy
 * the vector renderer plays as is.
 *
 * State machines (dotLottie `s/<id>.json`, subset): `initial`, PlaybackState
 * and GlobalState states (animation, autoplay, loop, speed, mode, marker
 * segment, entry / exit actions), transitions nested in states or top-level
 * (`fromState`), guards on Numeric / String / Boolean inputs (Equal,
 * NotEqual, GreaterThan(OrEqual), LessThan(OrEqual)) and Events,
 * interactions PointerDown / PointerUp / PointerEnter / PointerExit / Click /
 * OnComplete / OnLoopComplete, actions Fire, SetNumeric / SetString /
 * SetBoolean, Toggle, Increment, Decrement, Reset, SetTheme, SetFrame,
 * SetProgress, FireCustomEvent. **OpenUrl is not supported** (a file must not
 * navigate the page); `inspectStateMachine()` lists anything skipped.
 * Pure (no DOM); `<usa-lottie-player theme state-machine>` wires it up.
 */
import { RUNTIME_VERSION, type RuntimeModule } from './registry';

type Num = number;
type Any = any;

// ------------------------------------------------------------------ themes
export interface ThemeRule {
  id: string;
  type: string;
  value?: Any;
  keyframes?: { frame: Num; value: Any; inTangent?: Any; outTangent?: Any; hold?: boolean }[];
  animations?: string[];
  expression?: string;
}
export interface LottieTheme {
  rules: ThemeRule[];
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const vec = (v: Any) => (Array.isArray(v) ? v : [v]);

/** A theme rule as a Lottie property ({ a, k }). */
export function ruleProp(r: ThemeRule): Any {
  if (r.type === 'Text') return null; // text rules patch the text document
  if (r.keyframes?.length)
    return {
      a: 1,
      k: r.keyframes.map((k, i) => ({
        t: k.frame,
        s: vec(k.value),
        ...(k.hold ? { h: 1 } : {}),
        ...(i < r.keyframes!.length - 1 ? { o: k.outTangent || { x: [0], y: [0] }, i: r.keyframes![i + 1].inTangent || { x: [1], y: [1] } } : {}),
      })),
      ...(r.expression ? { x: r.expression } : {}),
    };
  return { a: 0, k: r.type === 'Scalar' ? (Array.isArray(r.value) ? r.value[0] : r.value) : r.value, ...(r.expression ? { x: r.expression } : {}) };
}

/**
 * A copy of `animation` with its slots resolved: every property that names a
 * slot (`"sid"`) takes the theme's rule for it, else the animation's default
 * slot value. `animationId` limits rules that list `animations`.
 */
export function applyTheme(animation: Any, theme?: LottieTheme | null, animationId?: string): Any {
  const a = clone(animation);
  const slots: Record<string, Any> = {};
  for (const [id, s] of Object.entries<Any>(a.slots || {})) slots[id] = s?.p ?? s;
  const text: Record<string, Any> = {};
  for (const r of theme?.rules || []) {
    if (r.animations?.length && animationId && !r.animations.includes(animationId)) continue;
    if (r.type === 'Text') text[r.id] = r.value;
    else if (r.type !== 'Image') slots[r.id] = ruleProp(r);
  }
  const walk = (o: Any): void => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    if (typeof o.sid === 'string') {
      if (text[o.sid] !== undefined && o.k?.[0]?.s) {
        // text document property: patch the documents
        for (const d of o.k) d.s = { ...d.s, ...(typeof text[o.sid] === 'string' ? { t: text[o.sid] } : text[o.sid]) };
      } else if (slots[o.sid]) {
        const p = slots[o.sid];
        delete o.a;
        delete o.k;
        delete o.x;
        Object.assign(o, clone(p));
      }
    }
    for (const k in o) if (k !== 'slots') walk(o[k]);
  };
  walk(a.layers);
  (a.assets || []).forEach((x: Any) => walk(x.layers));
  return a;
}

// ------------------------------------------------------------------ state machines
export interface SmInput { type: 'Numeric' | 'String' | 'Boolean' | 'Event'; name: string; value?: Any }
export interface SmGuard { type: 'Numeric' | 'String' | 'Boolean' | 'Event'; inputName: string; conditionType?: string; compareTo?: Any }
export interface SmTransition { type?: string; fromState?: string; toState: string; guards?: SmGuard[] }
export interface SmAction { type: string; inputName?: string; value?: Any; themeId?: string }
export interface SmState {
  name: string;
  type?: 'PlaybackState' | 'GlobalState' | string;
  animation?: string;
  autoplay?: boolean;
  loop?: boolean;
  loopCount?: Num;
  speed?: Num;
  mode?: 'Forward' | 'Reverse' | 'Bounce' | 'ReverseBounce' | string;
  segment?: string;
  transitions?: SmTransition[];
  entryActions?: SmAction[];
  exitActions?: SmAction[];
}
export interface SmInteraction { type: string; layerName?: string; stateName?: string; actions: SmAction[] }
export interface StateMachineDef {
  initial: string;
  states: SmState[];
  transitions?: SmTransition[];
  inputs?: SmInput[];
  interactions?: SmInteraction[];
}
export interface StateMachineHooks {
  onState?(state: SmState, from: SmState | null): void;
  onTheme?(id: string): void;
  onFrame?(frame: Num): void;
  onProgress?(progress: Num): void;
  onCustomEvent?(name: string): void;
}
export interface StateMachine {
  readonly state: SmState;
  readonly inputs: Record<string, Any>;
  fire(event: string): void;
  set(name: string, value: Any): void;
  /** Feed an interaction (PointerDown, Click, OnComplete …); `layerName` filters interactions bound to a layer. */
  interact(type: string, layerName?: string): void;
  reset(): void;
}

const ACTIONS = ['Fire', 'SetNumeric', 'SetString', 'SetBoolean', 'Toggle', 'Increment', 'Decrement', 'Reset', 'SetTheme', 'SetFrame', 'SetProgress', 'FireCustomEvent'];
const INTERACTIONS = ['PointerDown', 'PointerUp', 'PointerEnter', 'PointerExit', 'PointerMove', 'Click', 'OnComplete', 'OnLoopComplete'];

/** What a state machine uses that this subset skips (never throws). */
export function inspectStateMachine(def: StateMachineDef): string[] {
  const u = new Set<string>();
  if (!def?.states?.length) u.add('no states');
  for (const s of def?.states || []) {
    if (s.type && !['PlaybackState', 'GlobalState'].includes(s.type)) u.add(`state type ${s.type}`);
    for (const a of [...(s.entryActions || []), ...(s.exitActions || [])]) if (!ACTIONS.includes(a.type)) u.add(`action ${a.type}`);
  }
  for (const i of def?.interactions || []) {
    if (!INTERACTIONS.includes(i.type)) u.add(`interaction ${i.type}`);
    for (const a of i.actions || []) if (!ACTIONS.includes(a.type)) u.add(`action ${a.type}`);
  }
  return [...u];
}

export function compare(v: Any, op = 'Equal', to: Any): boolean {
  switch (op) {
    case 'NotEqual': return v !== to;
    case 'GreaterThan': return v > to;
    case 'GreaterThanOrEqual': return v >= to;
    case 'LessThan': return v < to;
    case 'LessThanOrEqual': return v <= to;
    default: return v === to;
  }
}

/** Run a dotLottie state machine (subset). `hooks.onState` applies each state to a player. */
export function createStateMachine(def: StateMachineDef, hooks: StateMachineHooks = {}): StateMachine {
  const byName = new Map(def.states.map((s) => [s.name, s]));
  const initialInputs = (): Record<string, Any> => Object.fromEntries((def.inputs || []).filter((i) => i.type !== 'Event').map((i) => [i.name, i.value ?? (i.type === 'Numeric' ? 0 : i.type === 'Boolean' ? false : '')]));
  let inputs = initialInputs();
  let cur: SmState = byName.get(def.initial) || def.states[0];
  let fired: string | null = null;
  const global = def.states.filter((s) => s.type === 'GlobalState');
  const outgoing = (s: SmState) => [...(s.transitions || []), ...(def.transitions || []).filter((t) => t.fromState === s.name || t.fromState === '*' || t.fromState === undefined), ...global.flatMap((g) => (g === s ? [] : g.transitions || []))];
  const ok = (g: SmGuard) => (g.type === 'Event' ? fired === g.inputName : compare(inputs[g.inputName], g.conditionType, g.compareTo));
  const run = (acts: SmAction[] | undefined) => {
    for (const a of acts || []) {
      const n = a.inputName || '';
      switch (a.type) {
        case 'Fire': fire(n); break;
        case 'SetNumeric': case 'SetString': case 'SetBoolean': set(n, a.value); break;
        case 'Toggle': set(n, !inputs[n]); break;
        case 'Increment': set(n, (inputs[n] || 0) + (a.value ?? 1)); break;
        case 'Decrement': set(n, (inputs[n] || 0) - (a.value ?? 1)); break;
        case 'Reset': set(n, (def.inputs || []).find((i) => i.name === n)?.value); break;
        case 'SetTheme': hooks.onTheme?.(a.themeId || a.value); break;
        case 'SetFrame': hooks.onFrame?.(Number(a.value) || 0); break;
        case 'SetProgress': hooks.onProgress?.(Math.min(1, Math.max(0, Number(a.value) || 0))); break;
        case 'FireCustomEvent': hooks.onCustomEvent?.(String(a.value ?? n)); break;
        default: break; // OpenUrl & co. are not supported
      }
    }
  };
  let depth = 0;
  const enter = (to: SmState) => {
    const from = cur;
    run(from.exitActions);
    cur = to;
    hooks.onState?.(to, from);
    run(to.entryActions);
  };
  const step = () => {
    if (depth > 16) return; // guard against transition loops
    depth++;
    for (const t of outgoing(cur)) {
      const to = byName.get(t.toState);
      if (!to || to === cur) continue;
      if ((t.guards || []).every(ok) && (t.guards?.length || fired === null)) {
        fired = null;
        enter(to);
        step();
        break;
      }
    }
    depth--;
  };
  function fire(name: string) {
    fired = name;
    step();
    fired = null;
  }
  function set(name: string, value: Any) {
    inputs = { ...inputs, [name]: value };
    step();
  }
  const sm: StateMachine = {
    get state() {
      return cur;
    },
    get inputs() {
      return inputs;
    },
    fire,
    set,
    interact(type, layerName) {
      for (const i of def.interactions || []) {
        if (i.type !== type) continue;
        if (i.layerName && layerName !== undefined && i.layerName !== layerName) continue;
        if (i.stateName && i.stateName !== cur.name) continue;
        run(i.actions);
      }
    },
    reset() {
      inputs = initialInputs();
      enter(byName.get(def.initial) || def.states[0]);
    },
  };
  hooks.onState?.(cur, null);
  run(cur.entryActions);
  return sm;
}

export interface LottieStateApi {
  applyTheme: typeof applyTheme;
  ruleProp: typeof ruleProp;
  createStateMachine: typeof createStateMachine;
  inspectStateMachine: typeof inspectStateMachine;
  compare: typeof compare;
}

export const lottieState: RuntimeModule<LottieStateApi> = { id: 'lottie-state', version: RUNTIME_VERSION, requires: ['core', 'vector'], api: { applyTheme, ruleProp, createStateMachine, inspectStateMachine, compare } };
