// Rough perf benchmark (jsdom): define + mount + unmount N of every <usa-*> element.
// Usage: node scripts/bench.mjs [N=50]   (run after `npm run build`)
import { JSDOM } from 'jsdom';
const N = Number(process.argv[2] || 50);
const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
for (const k of ['window', 'document', 'HTMLElement', 'customElements', 'Element', 'Node', 'CustomEvent', 'Event', 'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'HTMLCanvasElement'])
  globalThis[k] = dom.window[k];
dom.window.HTMLCanvasElement.prototype.getContext = () => null;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const { defineComponents, COMPONENT_CATEGORIES } = await import('../dist/components.js');
let t = performance.now();
defineComponents();
console.log(`defineComponents(): ${(performance.now() - t).toFixed(1)} ms`);
const rows = [];
for (const [cat, tags] of Object.entries(COMPONENT_CATEGORIES)) {
  for (const tag of tags) {
    t = performance.now();
    const host = document.createElement('div');
    host.innerHTML = Array.from({ length: N }, () => `<${tag}><span>x</span></${tag}>`).join('');
    document.body.append(host);
    const mount = performance.now() - t;
    t = performance.now();
    host.remove();
    rows.push({ category: cat, tag, [`mount ×${N} (ms)`]: mount.toFixed(1), 'unmount (ms)': (performance.now() - t).toFixed(1) });
  }
}
console.table(rows);
