// Shared by every fixture: window.__fx — the test API (log of received events, console errors / warnings, hooks the
// app fills in: setChecked(bool), show(bool), optional keepAlive(tab)).
export interface Fx { name: string; log: string[]; errors: string[]; warnings: string[]; ready: boolean; [k: string]: any }
export function capture(name: string): Fx {
  const fx: Fx = ((globalThis as any).__fx = { name, log: [], errors: [], warnings: [], ready: false });
  const wrap = (k: 'error' | 'warn', into: string[]) => {
    const orig = console[k].bind(console);
    console[k] = (...a: unknown[]) => { into.push(a.map((x) => (x instanceof Error ? x.message : String(x))).join(' ')); orig(...a); };
  };
  wrap('error', fx.errors);
  wrap('warn', fx.warnings);
  addEventListener('error', (e) => fx.errors.push('uncaught: ' + e.message));
  return fx;
}
