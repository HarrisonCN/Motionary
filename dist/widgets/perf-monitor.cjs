'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_fxPerf = require('../components/fx-perf.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-perf-monitor{position:fixed;z-index:2147483000;top:10px;right:10px;width:150px;border-radius:10px;background:rgba(15,23,42,.88);color:#e2e8f0;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 8px 24px -10px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}usa-perf-monitor[data-corner=top-left]{right:auto;left:10px}usa-perf-monitor[data-corner=bottom-right]{top:auto;bottom:10px}usa-perf-monitor[data-corner=bottom-left]{top:auto;right:auto;bottom:10px;left:10px}usa-perf-monitor[data-corner=inline]{position:relative;top:auto;right:auto;z-index:auto}usa-perf-monitor .usa-pm-head{display:block;width:100%;padding:6px 8px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}usa-perf-monitor .usa-pm-fps{font-size:16px;color:#4ade80;transition:color .3s}usa-perf-monitor[data-jank] .usa-pm-fps{color:#f87171}usa-perf-monitor .usa-pm-body{padding:0 8px 8px}usa-perf-monitor[collapsed] .usa-pm-body{display:none}usa-perf-monitor .usa-pm-spark{display:block;width:100%;height:22px}usa-perf-monitor .usa-pm-spark polyline{fill:none;stroke:#4ade80;stroke-width:1.5;vector-effect:non-scaling-stroke}usa-perf-monitor dl{display:grid;grid-template-columns:1fr auto;gap:1px 6px;margin:4px 0 0}usa-perf-monitor dt{color:#94a3b8}usa-perf-monitor dd{margin:0;text-align:right}usa-perf-monitor .usa-pm-head:focus-visible{outline:2px solid #818cf8;outline-offset:-2px}";

function definePerfMonitor(tag = 'usa-perf-monitor') {
    return base.defineElement(tag, (Base) => {
        class UsaPerfMonitor extends Base {
            constructor() {
                super(...arguments);
                this._s = { fps: 0, animations: 0, loops: 0, longTasks: 0, clock: 'running' };
            }
            static get observedAttributes() {
                return ['corner', 'warn'];
            }
            get stats() {
                return { ...this._s };
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const corner = ['top-left', 'bottom-right', 'bottom-left', 'inline'].includes(this.str('corner')) ? this.str('corner') : 'top-right';
                this.setAttribute('data-corner', corner);
                this.setAttribute('role', 'status');
                this.setAttribute('aria-label', 'Performance monitor');
                this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-pm-head" aria-expanded="${!this.hasAttribute('collapsed')}" data-usa-part><b class="usa-pm-fps">–</b> fps</button><div class="usa-pm-body" data-usa-part><svg class="usa-pm-spark" viewBox="0 0 60 20" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg><dl><dt>Animations</dt><dd data-k="animations">0</dd><dt>Loops</dt><dd data-k="loops">0</dd><dt>Long tasks</dt><dd data-k="longTasks">0</dd><dt>Clock</dt><dd data-k="clock">running</dd></dl></div>`);
                const head = this.querySelector('.usa-pm-head');
                this.listen(head, 'click', () => {
                    const open = head.getAttribute('aria-expanded') !== 'true';
                    head.setAttribute('aria-expanded', String(open));
                    this.toggleAttribute('collapsed', !open);
                });
                const meter = components_fxPerf.fpsMeter(40);
                this.onCleanup(() => meter.stop());
                let longTasks = 0;
                if (typeof PerformanceObserver !== 'undefined')
                    try {
                        const po = new PerformanceObserver((l) => (longTasks += l.getEntries().length));
                        po.observe({ type: 'longtask', buffered: true });
                        this.onCleanup(() => po.disconnect());
                    }
                    catch {
                        /* longtask not supported */
                    }
                const hist = [];
                let jank = false;
                const tick = () => {
                    const c = base.getClock();
                    this._s = { fps: meter.fps, animations: base.activeAnimations(), loops: base.schedulerStats().loops, longTasks, clock: c.paused ? 'paused' : c.rate === 1 ? 'running' : `${c.rate}×` };
                    hist.push(this._s.fps);
                    if (hist.length > 30)
                        hist.shift();
                    this.querySelector('.usa-pm-fps').textContent = this._s.fps ? String(this._s.fps) : '–';
                    for (const k of ['animations', 'loops', 'longTasks', 'clock']) {
                        const d = this.querySelector(`[data-k=${k}]`);
                        if (d)
                            d.textContent = String(this._s[k]);
                    }
                    const max = 70;
                    this.querySelector('.usa-pm-spark polyline')?.setAttribute('points', hist.map((v, i) => `${(i / 29) * 60},${20 - (Math.min(v, max) / max) * 20}`).join(' '));
                    const low = this._s.fps > 0 && this._s.fps < this.num('warn', 45);
                    this.setFlag('data-jank', low);
                    if (low && !jank)
                        this.emit('jank', { fps: this._s.fps });
                    jank = low;
                };
                const id = setInterval(tick, 500);
                this.onCleanup(() => clearInterval(id));
                tick();
            }
        }
        return UsaPerfMonitor;
    }, { id: 'perf-monitor', text: css });
}

exports.definePerfMonitor = definePerfMonitor;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/widgets/perf-monitor.cjs.map