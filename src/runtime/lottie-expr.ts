/**
 * Lottie / After Effects expression subset for `motionary/runtime/vector`
 * (10.8). A small parser + interpreter — **no `eval` / `new Function`**, so it
 * runs under a strict CSP and an expression can only call what is listed
 * here: `time`, `value`, `thisComp.frameDuration`, `wiggle()`, `loopOut()` /
 * `loopIn()` (cycle · pingpong · offset · continue), `linear()`, `ease()`,
 * `easeIn()`, `easeOut()`, `clamp()`, `valueAtTime()`, `framesToTime()`,
 * `timeToFrames()`, `degreesToRadians()`, `radiansToDegrees()`, `add()` /
 * `sub()` / `mul()` / `div()`, `length()`, `Math.*`, arithmetic on numbers
 * and arrays, `var` / `let` / `const` and `$bm_rt =`, the conditional
 * operator and comparisons. Anything else fails to compile and the
 * keyframed value is used (inspectLottie() lists it).
 */
type Num = number;
type V = any;
type Node = [string, ...any[]];

export interface ExprContext {
  /** Seconds. */
  time: Num;
  /** The keyframed value now. */
  value: V;
  /** Frame rate of the composition. */
  fr: Num;
  /** Keyframed value at a frame (no expression). */
  at(frame: Num): V;
  /** Keyframe frames (empty for a static property). */
  keys: Num[];
  /** Seed for wiggle() (stable per property). */
  seed: Num;
}

const ALLOWED = /*#__PURE__*/ new Set(['time', 'value', 'thisComp', 'thisLayer', 'thisProperty', 'Math', 'wiggle', 'loopOut', 'loopIn', 'loopOutDuration', 'loopInDuration', 'linear', 'ease', 'easeIn', 'easeOut', 'clamp', 'valueAtTime', 'framesToTime', 'timeToFrames', 'degreesToRadians', 'radiansToDegrees', 'add', 'sub', 'mul', 'div', 'length', 'true', 'false', '$bm_rt', 'index']);

function lex(src: string): string[] {
  const t: string[] = [];
  const re = /\s*(?:(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_$][\w$]*)|(===|!==|==|!=|<=|>=|&&|\|\||[-+*/%()[\],.;=<>!?:{}]))/gy;
  let m: RegExpExecArray | null, at = 0;
  while (at < src.length) {
    re.lastIndex = at;
    if (!(m = re.exec(src))) break;
    at = re.lastIndex;
    if (m[1]) continue;
    const tok = m[2] || m[3] || m[4] || m[5];
    if (tok) t.push(m[2] ? '#' + tok : m[3] ? '"' + m[3].slice(1, -1) : tok);
  }
  if (src.slice(at).trim()) throw new Error('expr: unexpected ' + src.slice(at, at + 10));
  return t;
}

/** Compile an expression to an AST (throws on anything outside the subset). */
export function compileExpression(src: string): Node {
  const T = lex(src);
  let i = 0;
  const peek = () => T[i], next = () => T[i++];
  const eat = (s: string) => {
    if (T[i] !== s) throw new Error(`expr: expected ${s} got ${T[i]}`);
    i++;
  };
  const declared = new Set<string>();
  const prim = (): Node => {
    const k = next();
    if (k === undefined) throw new Error('expr: unexpected end');
    if (k[0] === '#') return ['n', +k.slice(1)];
    if (k[0] === '"') return ['s', k.slice(1)];
    if (k === '(') {
      const e = expr();
      eat(')');
      return e;
    }
    if (k === '[') {
      const a: Node[] = [];
      while (peek() !== ']') {
        a.push(expr());
        if (peek() === ',') next();
      }
      eat(']');
      return ['arr', a];
    }
    if (/^[A-Za-z_$]/.test(k)) {
      if (!ALLOWED.has(k) && !declared.has(k)) throw new Error('expr: unsupported ' + k);
      return ['id', k];
    }
    throw new Error('expr: unexpected ' + k);
  };
  const post = (): Node => {
    let e = prim();
    for (;;) {
      if (peek() === '.') {
        next();
        e = ['get', e, ['s', next()]];
      } else if (peek() === '[') {
        next();
        e = ['get', e, expr()];
        eat(']');
      } else if (peek() === '(') {
        next();
        const a: Node[] = [];
        while (peek() !== ')') {
          a.push(expr());
          if (peek() === ',') next();
        }
        eat(')');
        e = ['call', e, a];
      } else return e;
    }
  };
  const un = (): Node => (peek() === '-' || peek() === '+' || peek() === '!' ? ['un', next(), un()] : post());
  const bin = (ops: string[], sub: () => Node) => (): Node => {
    let e = sub();
    while (ops.includes(peek())) e = ['bin', next(), e, sub()];
    return e;
  };
  const mul = bin(['*', '/', '%'], un), add = bin(['+', '-'], mul), cmp = bin(['<', '>', '<=', '>='], add), eq = bin(['==', '!=', '===', '!=='], cmp), and = bin(['&&'], eq), or = bin(['||'], and);
  const expr = (): Node => {
    const c = or();
    if (peek() !== '?') return c;
    next();
    const a = expr();
    eat(':');
    return ['if', c, a, expr()];
  };
  const stmts: Node[] = [];
  while (i < T.length) {
    if (peek() === ';') {
      next();
      continue;
    }
    if (['var', 'let', 'const'].includes(peek())) {
      next();
      const name = next();
      declared.add(name);
      eat('=');
      stmts.push(['set', name, expr()]);
    } else if (/^[A-Za-z_$]/.test(peek() || '') && T[i + 1] === '=') {
      const name = next();
      next();
      declared.add(name);
      stmts.push(['set', name, expr()]);
    } else stmts.push(expr());
  }
  if (!stmts.length) throw new Error('expr: empty');
  return ['prog', stmts];
}

// ------------------------------------------------------------------ values
const isA = Array.isArray;
const zip = (a: V, b: V, f: (x: Num, y: Num) => Num): V => (isA(a) && isA(b) ? Array.from({ length: Math.max(a.length, b.length) }, (_, i) => f(a[i] ?? 0, b[i] ?? 0)) : isA(a) ? a.map((x: Num) => f(x, b)) : isA(b) ? b.map((y: Num) => f(a, y)) : f(a, b));
const vadd = (a: V, b: V) => (typeof a === 'string' || typeof b === 'string' ? String(a) + String(b) : zip(a, b, (x, y) => x + y));
const vsub = (a: V, b: V) => zip(a, b, (x, y) => x - y);
const vmul = (a: V, b: V) => zip(a, b, (x, y) => x * y);
const vdiv = (a: V, b: V) => zip(a, b, (x, y) => x / y);
const lerpV = (a: V, b: V, p: Num) => vadd(a, vmul(vsub(b, a), p));

// smooth 1D value noise in [-1, 1]
const hash = (n: Num) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};
const noise = (x: Num) => {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};

function remap(ease: (p: Num) => Num, args: V[]): V {
  const [t, a, b, c, d] = args;
  let tMin = 0, tMax = 1, v1: V, v2: V;
  if (args.length >= 5) (tMin = a), (tMax = b), (v1 = c), (v2 = d);
  else (v1 = a), (v2 = b);
  const p = tMax === tMin ? (t >= tMax ? 1 : 0) : Math.min(1, Math.max(0, (t - tMin) / (tMax - tMin)));
  return lerpV(v1, v2, ease(tMax < tMin ? 1 - p : p));
}

function loop(c: ExprContext, out: boolean, type: V = 'cycle', n: Num = 0, dur = 0): V {
  const K = c.keys, f = c.time * c.fr;
  if (K.length < 2) return c.value;
  const first = K[0], last = K[K.length - 1];
  let a = out ? (n > 0 ? K[Math.max(0, K.length - 1 - n)] : first) : first;
  let b = out ? last : n > 0 ? K[Math.min(K.length - 1, n)] : last;
  if (dur > 0) out ? (a = last - dur * c.fr) : (b = first + dur * c.fr);
  if (out ? f <= b : f >= a) return c.value;
  const d = b - a || 1;
  if (type === 'continue') {
    const e = out ? b : a, v = c.at(e), slope = out ? vsub(v, c.at(e - 1)) : vsub(c.at(e + 1), v);
    return vadd(v, vmul(slope, f - e));
  }
  const over = out ? f - b : a - f, k = Math.floor(over / d), r = over - k * d;
  if (type === 'pingpong') return c.at(out ? (k % 2 ? a + r : b - r) : k % 2 ? b - r : a + r);
  const base = c.at(out ? a + r : b - r);
  if (type === 'offset') return vadd(base, vmul(vsub(c.at(b), c.at(a)), out ? k + 1 : -(k + 1)));
  return base; // cycle
}

/** Evaluate a compiled expression. */
export function runExpression(ast: Node, c: ExprContext): V {
  const vars: Record<string, V> = {};
  const fr = c.fr;
  const lib: Record<string, V> = {
    Math,
    thisComp: { frameDuration: 1 / fr },
    thisLayer: {},
    thisProperty: { value: c.value },
    index: 1,
    true: true,
    false: false,
    wiggle: (freq: Num, amp: V, oct = 1, mult = 0.5, t = c.time) => {
      const w = (d: Num) => {
        let s = 0, a = 1, fq = freq, tot = 0;
        for (let o = 0; o < Math.max(1, oct); o++) (s += a * noise(t * fq + c.seed * 13.7 + d * 101.3)), (tot += a), (a *= mult), (fq *= 2);
        return s / tot;
      };
      return isA(c.value) ? c.value.map((v: Num, d: Num) => v + (isA(amp) ? amp[d] ?? 0 : amp) * w(d)) : c.value + amp * w(0);
    },
    loopOut: (t?: V, n?: Num) => loop(c, true, t, n),
    loopIn: (t?: V, n?: Num) => loop(c, false, t, n),
    loopOutDuration: (t?: V, d?: Num) => loop(c, true, t, 0, d),
    loopInDuration: (t?: V, d?: Num) => loop(c, false, t, 0, d),
    linear: (...a: V[]) => remap((p) => p, a),
    ease: (...a: V[]) => remap((p) => p * p * (3 - 2 * p), a),
    easeIn: (...a: V[]) => remap((p) => p * p, a),
    easeOut: (...a: V[]) => remap((p) => 1 - (1 - p) * (1 - p), a),
    clamp: (v: V, lo: V, hi: V) => zip(zip(v, lo, Math.max), hi, Math.min),
    valueAtTime: (t: Num) => c.at(t * fr),
    framesToTime: (f: Num) => f / fr,
    timeToFrames: (t = c.time) => t * fr,
    degreesToRadians: (d: Num) => (d * Math.PI) / 180,
    radiansToDegrees: (r: Num) => (r * 180) / Math.PI,
    add: vadd,
    sub: vsub,
    mul: vmul,
    div: vdiv,
    length: (a: V, b?: V) => {
      const d = b === undefined ? a : vsub(a, b);
      return isA(d) ? Math.hypot(...d) : Math.abs(d);
    },
  };
  const ev = (n: Node): V => {
    switch (n[0]) {
      case 'n':
      case 's':
        return n[1];
      case 'arr':
        return n[1].map(ev);
      case 'id': {
        const k = n[1];
        if (k in vars) return vars[k];
        if (k === 'time') return c.time;
        if (k === 'value') return c.value;
        return lib[k];
      }
      case 'get': {
        const o = ev(n[1]), k = ev(n[2]);
        if (o === null || o === undefined || (typeof k === 'string' && /^(__proto__|constructor|prototype)$/.test(k))) throw new Error('expr: bad member');
        if (o === Math && typeof k === 'string' && !(k in Math)) throw new Error('expr: Math.' + k);
        return o[k];
      }
      case 'call': {
        const f = ev(n[1]);
        if (typeof f !== 'function') throw new Error('expr: not a function');
        return f(...n[2].map(ev));
      }
      case 'un': {
        const v = ev(n[2]);
        return n[1] === '-' ? vmul(v, -1) : n[1] === '!' ? !v : v;
      }
      case 'bin': {
        const a = ev(n[2]), b = ev(n[3]);
        switch (n[1]) {
          case '+': return vadd(a, b);
          case '-': return vsub(a, b);
          case '*': return vmul(a, b);
          case '/': return vdiv(a, b);
          case '%': return zip(a, b, (x, y) => x % y);
          case '<': return a < b;
          case '>': return a > b;
          case '<=': return a <= b;
          case '>=': return a >= b;
          case '==': case '===': return a === b;
          case '!=': case '!==': return a !== b;
          case '&&': return a && b;
          default: return a || b;
        }
      }
      case 'if':
        return ev(n[1]) ? ev(n[2]) : ev(n[3]);
      case 'set':
        return (vars[n[1]] = ev(n[2]));
      default: {
        let r: V;
        for (const s of n[1]) r = ev(s);
        return '$bm_rt' in vars ? vars.$bm_rt : r;
      }
    }
  };
  return ev(ast);
}

const cache = /*#__PURE__*/ new Map<string, Node | null>();
/** Compile (cached); null when outside the subset. */
export function expression(src: string): Node | null {
  if (!cache.has(src)) {
    let ast: Node | null = null;
    try {
      ast = compileExpression(src);
    } catch {
      ast = null;
    }
    cache.set(src, ast);
  }
  return cache.get(src)!;
}
