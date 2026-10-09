import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets } from '../src/components/widgets';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';
import * as rt from '../src/runtime';
import { registry, register } from '../src/runtime/registry';
import { smooth, smoothScroll } from '../src/runtime/smooth';
import { formatGif, decodeGif, lzwDecode } from '../src/runtime/format-gif';
import { formatApng, parseApng, apngFramePngs, decodeApng } from '../src/runtime/format-apng';
import { formatWebp, parseWebp, webpFrameFiles, decodeWebp } from '../src/runtime/format-webp';
import { composeFrames, animatedImagePlayer, crc32 } from '../src/runtime/anim-image';
import { pickEngine, scrollProgress, viewProgress } from '../src/components/widgets/scroll-driven';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  registry().modules.clear();
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const bytes = (f: string) => new Uint8Array(readFileSync(`test/fixtures/formats/${f}`));
const EXP = JSON.parse(readFileSync('test/fixtures/formats/animated-images.expected.json', 'utf8')).files;
/** SHA-256 of an RGBA frame with fully transparent pixels zeroed (how the expected hashes were made). */
const hash = (d: Uint8ClampedArray) => {
  const b = Buffer.from(d);
  for (let i = 0; i < b.length; i += 4) if (b[i + 3] === 0) b.fill(0, i, i + 4);
  return createHash('sha256').update(b).digest('hex');
};
/** Decoder stub for Node (no PNG / WebP decoder here): Pillow's pixels for the exact bytes the loader rebuilt. */
const stub = (name: string) => async (b: Uint8Array) => {
  const crc = zlib.crc32 ? zlib.crc32(b) : crc32(b);
  const p = EXP[name].parts.find((x: any) => x.crc === crc);
  if (!p) throw new Error(`rebuilt frame file not recognised (crc ${crc})`);
  return { width: p.w, height: p.h, data: new Uint8ClampedArray(Buffer.from(p.px, 'base64')) };
};

describe('10.4 format-gif (own LZW decoder)', () => {
  it.each(['sample-anim.gif', 'sample-interlaced.gif', 'sample-plasma.gif'])('%s decodes pixel-exact (vs Pillow), with delays and loop count', (f) => {
    const g = decodeGif(bytes(f));
    const e = EXP[f];
    expect([g.width, g.height]).toEqual(e.size);
    expect(g.frames.map((x) => hash(x.image.data))).toEqual(e.frames);
    expect(g.frames.map((x) => x.delay)).toEqual(e.durations.map((d: number) => (d <= 10 ? 100 : d)));
  });
  it('reads versions, loop counts (NETSCAPE2.0) and interlacing', () => {
    expect(decodeGif(bytes('sample-anim.gif')).info).toMatchObject({ version: '89a', loopCount: 0, frameCount: 4 });
    expect(decodeGif(bytes('sample-anim.gif')).plays).toBe(0);
    const i = decodeGif(bytes('sample-interlaced.gif'));
    expect(i.info.loopCount).toBe(2);
    expect(i.plays).toBe(3);
    expect(() => decodeGif(new Uint8Array([1, 2, 3, 4, 5, 6]))).toThrow(/not a GIF/);
  });
  it('lzwDecode handles the KwKwK case and clear codes', () => {
    // min code size 2: clear(4) 1 6(=1,1 KwKwK) 6 eoi(5) packed LSB-first at 3 bits
    const codes = [4, 1, 6, 6, 5];
    let acc = 0, bits = 0;
    const out: number[] = [];
    for (const c of codes) {
      acc |= c << bits;
      bits += 3;
      while (bits >= 8) {
        out.push(acc & 255);
        acc >>= 8;
        bits -= 8;
      }
    }
    if (bits) out.push(acc & 255);
    expect(Array.from(lzwDecode(2, new Uint8Array(out), 5))).toEqual([1, 1, 1, 1, 1]);
  });
  it('module object, registration and the canvas player (seek / reverse / progress)', () => {
    expect(formatGif.requires).toEqual(['core']);
    rt.use(formatGif);
    expect(rt.hasModule('format-gif')).toBe(true);
    const g = decodeGif(bytes('sample-anim.gif'));
    const put = vi.fn();
    const canvas: any = { width: 0, height: 0, getContext: () => ({ putImageData: put }) };
    vi.stubGlobal('ImageData', class { constructor(public data: Uint8ClampedArray, public width: number, public height: number) {} });
    const p = animatedImagePlayer(canvas, g, { paused: true });
    expect([canvas.width, canvas.height]).toEqual([24, 16]);
    expect(p.duration).toBe(520);
    expect(p.frameCount).toBe(4);
    p.seek(250);
    expect(p.frame).toBe(2);
    p.progress = 0;
    expect(p.frame).toBe(0);
    expect(put).toHaveBeenCalled();
  });
});

describe('10.4 format-apng', () => {
  it('parses acTL / fcTL / fdAT and rebuilds valid standalone PNGs (CRC, IHDR size, inflatable data)', () => {
    const info = parseApng(bytes('sample-anim.png'));
    expect(info).toMatchObject({ width: 24, height: 16, plays: 0, animated: true, hiddenDefault: false });
    expect(info.frames.map((f) => [f.x, f.y, f.width, f.height, f.delay])).toEqual([[0, 0, 24, 16, 100], [0, 2, 14, 12, 120], [4, 2, 14, 12, 140], [8, 2, 14, 12, 160]]);
    for (const [i, png] of apngFramePngs(info).entries()) {
      const f = info.frames[i];
      let p = 8, idat: Buffer[] = [];
      while (p < png.length) {
        const len = (png[p] << 24) | (png[p + 1] << 16) | (png[p + 2] << 8) | png[p + 3];
        const type = String.fromCharCode(...png.subarray(p + 4, p + 8));
        const crc = ((png[p + 8 + len] << 24) | (png[p + 9 + len] << 16) | (png[p + 10 + len] << 8) | png[p + 11 + len]) >>> 0;
        expect(crc32(png, p + 4, p + 8 + len)).toBe(crc);
        if (type === 'IHDR') expect([png[p + 11], png[p + 15]]).toEqual([f.width, f.height]);
        if (type === 'IDAT') idat.push(Buffer.from(png.subarray(p + 8, p + 8 + len)));
        p += 12 + len;
      }
      expect(zlib.inflateSync(Buffer.concat(idat)).length).toBe(f.height * (1 + f.width * 4));
    }
  });
  it('composites frames (dispose / blend) to match Pillow', async () => {
    const a = await decodeApng(bytes('sample-anim.png'), { decode: stub('sample-anim.png') });
    expect(a.frames.map((x) => hash(x.image.data))).toEqual(EXP['sample-anim.png'].frames);
    expect(a.frames.map((x) => x.delay)).toEqual([100, 120, 140, 160]);
  });
  it('treats a plain PNG as one frame', () => {
    const one = apngFramePngs(parseApng(bytes('sample-anim.png')))[0];
    // strip acTL / fcTL → the rebuilt first frame is a plain PNG
    const info = parseApng(one);
    expect(info.animated).toBe(false);
    expect(info.frames).toHaveLength(1);
    expect(formatApng.id).toBe('format-apng');
  });
});

describe('10.4 format-webp', () => {
  it('parses VP8X / ANIM / ANMF (lossless, lossy, lossy + ALPH)', () => {
    const l = parseWebp(bytes('sample-anim.webp'));
    expect(l).toMatchObject({ width: 24, height: 16, animated: true, plays: 0 });
    expect(l.frames.map((f) => f.chunks.map((c) => c.type).join('+'))).toEqual(['VP8L', 'VP8L', 'VP8L', 'VP8L']);
    expect(parseWebp(bytes('sample-anim-lossy.webp')).plays).toBe(2);
    const a = parseWebp(bytes('sample-alpha-lossy.webp'));
    expect(a.frames.map((f) => [f.x, f.y, f.width, f.height, f.delay, f.blend, f.dispose])).toEqual([[2, 4, 17, 17, 150, 'source', 'background'], [8, 6, 19, 13, 150, 'source', 'background'], [16, 6, 13, 13, 150, 'source', 'none']]);
    // lossy + alpha frames get their own VP8X (alpha flag) header
    const files = webpFrameFiles(a);
    const t = (b: Uint8Array, i: number) => String.fromCharCode(...b.subarray(i, i + 4));
    expect([t(files[0], 0), t(files[0], 8), t(files[0], 12), files[0][20] & 0x10]).toEqual(['RIFF', 'WEBP', 'VP8X', 0x10]);
    expect(t(webpFrameFiles(l)[0], 12)).toBe('VP8L');
  });
  it.each(['sample-anim.webp', 'sample-anim-lossy.webp', 'sample-alpha-lossy.webp'])('%s composites to match Pillow', async (f) => {
    const a = await decodeWebp(bytes(f), { decode: stub(f) });
    // (for files without the VP8X alpha flag Pillow returns RGB with black where browsers show transparent; the expected hashes zero those pixels)
    expect(a.frames.map((x) => hash(x.image.data))).toEqual(EXP[f].frames);
  });
  it('composeFrames: over-blending and dispose to previous', () => {
    const px = (r: number, a: number) => ({ width: 1, height: 1, data: new Uint8ClampedArray([r, 0, 0, a]) });
    const out = composeFrames(1, 1, [
      { x: 0, y: 0, image: px(200, 255), delay: 10, blend: 'source', dispose: 'none' },
      { x: 0, y: 0, image: px(0, 128), delay: 10, blend: 'over', dispose: 'previous' },
      { x: 0, y: 0, image: px(0, 0), delay: 10, blend: 'over', dispose: 'none' },
    ]);
    expect(Array.from(out[1].image.data)).toEqual([100, 0, 0, 255]);
    expect(Array.from(out[2].image.data)).toEqual([200, 0, 0, 255]);
    expect(formatWebp.requires).toEqual(['core']);
  });
});

describe('10.4 runtime/smooth', () => {
  const box = () => {
    const el = document.createElement('div');
    Object.defineProperties(el, { scrollHeight: { value: 2000 }, clientHeight: { value: 400 } });
    document.body.appendChild(el);
    return el;
  };
  it('eases wheel input towards its target on the ticker, follows native scrolling, stops at the edges', () => {
    rt.use(smooth);
    const el = box();
    const s = smoothScroll({ wrapper: el, lerp: 0.2 });
    expect(s.active).toBe(true);
    const ev = new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(s.target).toBe(300);
    rt.getTicker().step(16.7);
    expect(el.scrollTop).toBeGreaterThan(0);
    expect(el.scrollTop).toBeLessThan(300);
    for (let i = 0; i < 80; i++) rt.getTicker().step(16.7);
    expect(el.scrollTop).toBe(300);
    expect(s.isScrolling).toBe(false);
    // native scroll (keyboard / scrollbar) moves the target too
    el.scrollTop = 900;
    el.dispatchEvent(new Event('scroll'));
    expect(s.target).toBe(900);
    // wheel past the end → clamped to the limit (1600)
    el.dispatchEvent(new WheelEvent('wheel', { deltaY: 5000, bubbles: true, cancelable: true }));
    expect(s.target).toBe(1600);
    s.destroy();
  });
  it('is off under prefers-reduced-motion (wheel stays native) and scrollTo jumps', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
    rt.use(smooth);
    const el = box();
    const s = smoothScroll({ wrapper: el });
    expect(s.active).toBe(false);
    const ev = new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    s.scrollTo(700);
    expect(el.scrollTop).toBe(700);
    s.destroy();
  });
  it('fixed-duration glides, stop() / resume(), ctrl+wheel (zoom) is left alone', () => {
    rt.use(smooth);
    const el = box();
    const s = smoothScroll({ wrapper: el, duration: 400, ease: 'linear' });
    s.scrollTo(400);
    rt.getTicker().step(100);
    expect(Math.round(el.scrollTop)).toBe(100);
    rt.getTicker().step(300);
    expect(el.scrollTop).toBe(400);
    const z = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true });
    el.dispatchEvent(z);
    expect(z.defaultPrevented).toBe(false);
    s.stop();
    expect(s.active).toBe(false);
    s.resume();
    expect(s.active).toBe(true);
    s.destroy();
  });
  it('needs the core: a clear error names the install / register steps', () => {
    expect(() => register(smooth)).toThrow(/npm i motionary/);
  });
});

describe('10.4 widgets: scroll ring, parallax layers, smooth scroll', () => {
  it('scroll-driven helpers: engine choice and progress maths', () => {
    vi.stubGlobal('CSS', { supports: (p: string, v: string) => p === 'animation-timeline' && v === 'scroll()' });
    expect(pickEngine('auto', 'scroll')).toBe('native');
    expect(pickEngine('auto', 'view')).toBe('js');
    expect(pickEngine('js', 'scroll')).toBe('js');
    const el = document.createElement('div');
    Object.defineProperties(el, { scrollHeight: { value: 1000 }, clientHeight: { value: 200 }, scrollTop: { value: 400, writable: true } });
    expect(scrollProgress(el)).toBe(0.5);
    const v = document.createElement('div');
    v.getBoundingClientRect = () => ({ top: innerHeight / 2, height: 100 } as DOMRect);
    expect(viewProgress(v)).toBeGreaterThan(0);
  });
  it('<usa-scroll-ring> tracks a container (JS engine), labels and announces progress, back-to-top button', async () => {
    document.body.innerHTML = '<div class="wrap"><div class="sc"></div><usa-scroll-ring for=".sc" label back-to-top engine="js"></usa-scroll-ring></div>';
    const sc = document.querySelector('.sc') as HTMLElement;
    Object.defineProperties(sc, { scrollHeight: { value: 1000 }, clientHeight: { value: 200 } });
    sc.scrollTo = vi.fn() as any;
    const ring = document.querySelector('usa-scroll-ring') as any;
    ring.remove();
    document.querySelector('.wrap')!.appendChild(ring); // re-mount after the size stubs
    expect(ring.dataset.engine).toBe('js');
    sc.scrollTop = 200;
    sc.dispatchEvent(new Event('scroll'));
    await new Promise((r) => setTimeout(r, 40));
    expect(ring.progress).toBeCloseTo(0.25);
    expect(ring.querySelector('.usa-ring-label').textContent).toBe('25%');
    expect(ring.querySelector('.usa-ring-bar').getAttribute('stroke-dashoffset')).not.toBe(ring.style.getPropertyValue('--usa-ring-c'));
    ring.querySelector('button').click();
    expect(sc.scrollTo).toHaveBeenCalled();
  });
  it('<usa-scroll-ring> native engine binds a named scroll timeline (timeline-scope on the common ancestor)', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    document.body.innerHTML = '<div class="wrap"><div class="sc"></div><usa-scroll-ring for=".sc"></usa-scroll-ring></div>';
    const ring = document.querySelector('usa-scroll-ring') as any;
    expect(ring.engine).toBe('native');
    const name = (document.querySelector('.sc') as HTMLElement).style.getPropertyValue('scroll-timeline').split(' ')[0];
    expect(name).toMatch(/^--usa-ring-\d+$/);
    expect((document.querySelector('.wrap') as HTMLElement).style.getPropertyValue('timeline-scope')).toBe(name);
    expect(ring.getAttribute('role')).toBe('progressbar');
  });
  it('<usa-parallax-layers> moves depth layers (JS engine) and stays static under reduced motion', async () => {
    document.body.innerHTML = '<div style="height:3000px"></div><usa-parallax-layers range="100" engine="js"><div data-depth="0.5"></div><div data-depth="-1"></div></usa-parallax-layers>';
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 4000, configurable: true });
    const el = document.querySelector('usa-parallax-layers') as any;
    el.remove();
    el.getBoundingClientRect = () => ({ top: 0, height: 200, left: 0, width: 300 } as DOMRect);
    document.body.appendChild(el);
    expect(el.dataset.engine).toBe('js');
    const [a, b] = el.layers();
    expect(a.style.translate).toMatch(/^0 -?\d/);
    expect(parseFloat(a.style.translate.split(' ')[1])).toBeCloseTo(-parseFloat(b.style.translate.split(' ')[1]) / 2, 1);
    configureComponents({ reducedMotion: 'reduce' });
    el.remove();
    document.body.appendChild(el);
    expect(el.dataset.engine).toBe('static');
  });
  it('<usa-smooth-scroll> needs motionary/runtime/smooth (clear notice), then smooths its wrapper', () => {
    document.body.innerHTML = '<usa-smooth-scroll wrapper></usa-smooth-scroll>';
    const missing = document.querySelector('usa-smooth-scroll') as any;
    expect(missing.querySelector('.usa-rt-missing').textContent).toContain('use(smooth)');
    missing.remove();
    rt.use(smooth);
    document.body.innerHTML = '<usa-smooth-scroll wrapper lerp="0.2" offset="40"><p id="t">x</p></usa-smooth-scroll>';
    const el = document.querySelector('usa-smooth-scroll') as any;
    expect(el.instance).toBeTruthy();
    expect(el.dataset.wrapper).toBe('');
    expect(typeof el.glideTo).toBe('function');
    el.stop();
    expect(el.instance.active).toBe(false);
  });
  it('cards, Store badge, snippets and docs carry the smooth prerequisite; format docs list the compatibility', () => {
    const card: any = COMPONENTS.find((c: any) => c.tag === 'usa-smooth-scroll');
    expect(card.requires).toEqual(['smooth']);
    expect(COMPONENT_ITEMS.find((i: any) => i.gallery === 'smooth-scroll').requiresBadge).toBe('Requires: motionary/runtime/smooth');
    expect(componentSnippets(card).esm).toContain('use(smooth);');
    for (const id of ['smooth', 'format-gif', 'format-apng', 'format-webp']) expect(readFileSync(`docs/runtime/${id}.md`, 'utf8')).toMatch(/## Compatibility[\s\S]*✅ yes/);
    expect(readFileSync('test/fixtures/formats/CREDITS.md', 'utf8')).toContain('sample-plasma.gif');
  });
});

describe('10.4 motionary-mcp (read-only MCP server)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-'));
  const manifest = join(dir, 'manifest.json');
  writeFileSync(manifest, execFileSync(process.execPath, ['scripts/gen-manifest.mjs', '--stdout'], { maxBuffer: 64 << 20 }));
  it('works with the official MCP SDK client over stdio: tools, search, component, snippet, resources', async () => {
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
    const client = new Client({ name: 'motionary-test', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: ['bin/motionary-mcp.mjs'], env: { ...process.env, MOTIONARY_MANIFEST: manifest } as Record<string, string> }));
    expect(client.getServerVersion()?.name).toBe('motionary-mcp');
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(['list_components', 'search_components', 'get_component', 'get_example', 'scaffold_snippet']);
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true);
    const s: any = await client.callTool({ name: 'search_components', arguments: { query: 'smooth scroll' } });
    expect(s.structuredContent.results[0].tag).toBe('usa-smooth-scroll');
    const g: any = await client.callTool({ name: 'get_component', arguments: { tag: '<usa-smooth-scroll>' } });
    expect(g.structuredContent.prerequisites.badge).toBe('Requires: motionary/runtime/smooth');
    const sn: any = await client.callTool({ name: 'scaffold_snippet', arguments: { tags: ['usa-smooth-scroll', 'usa-scroll-ring'], framework: 'esm' } });
    const code: string = sn.structuredContent.code;
    expect(code.indexOf('use(smooth)')).toBeGreaterThan(-1);
    expect(code.indexOf('use(smooth)')).toBeLessThan(code.indexOf('defineSmoothScroll();'));
    const html: any = await client.callTool({ name: 'get_example', arguments: { tag: 'smooth-scroll' } });
    expect(html.content[0].text).toContain('runtime/smooth.iife.js');
    const list: any = await client.callTool({ name: 'list_components', arguments: { requires: 'smooth' } });
    expect(list.structuredContent.components.map((c: any) => c.tag)).toEqual(['usa-smooth-scroll']);
    const bad: any = await client.callTool({ name: 'get_component', arguments: { tag: 'usa-nope' } });
    expect(bad.isError).toBe(true);
    const r = await client.readResource({ uri: 'motionary://component/usa-scroll-ring' });
    expect(JSON.parse((r.contents[0] as any).text).tag).toBe('usa-scroll-ring');
    await client.ping();
    await client.close();
  }, 30000);
  it('answers JSON-RPC errors correctly (parse error, unknown method) and stays read-only', async () => {
    const mod: any = await import('../bin/motionary-mcp.mjs');
    const m = JSON.parse(readFileSync(manifest, 'utf8'));
    expect(mod.handle(m, { jsonrpc: '2.0', id: 1, method: 'nope' }).error.code).toBe(-32601);
    expect(mod.handle(m, { jsonrpc: '2.0', method: 'notifications/initialized' })).toBeNull();
    expect(mod.handle(m, { jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '2024-11-05' } }).result.protocolVersion).toBe('2024-11-05');
    expect(mod.handle(m, { jsonrpc: '2.0', id: 3, method: 'initialize', params: { protocolVersion: '1999-01-01' } }).result.protocolVersion).toBe('2025-06-18');
    expect(mod.TOOLS.every((t: any) => t.annotations.destructiveHint === false)).toBe(true);
    expect(readFileSync('bin/motionary-mcp.mjs', 'utf8')).not.toMatch(/writeFile|child_process|fetch\(/);
  });
});
