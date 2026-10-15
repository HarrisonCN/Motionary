import { createStudio } from './studio.js';
import { f as createTimelineDoc } from '../chunks/format-efFi6HuG.js';
import { d as createTimelineHistory } from '../chunks/history-6uuzTeIv.js';
import '../chunks/ease-XN8_0sXu.js';
import { f as frameTime } from '../chunks/project-Blmkuhzk.js';

/**
 * `motionary/studio/app` (= `motionary/components/studio-app`, 15.0) — Motion Studio 2.0: one call puts the 14.x
 * Studio parts together into a working authoring loop:
 *
 *   new → edit (timeline + canvas) → preview → save → reopen → export
 *
 * - the Studio (14.4) and its canvas (14.3) edit one undo history;
 * - save / reopen go through a storage adapter (`createMemoryStorage()`, `createLocalStorage()` or your own async
 *   `{ read, write }`), so a host can keep projects anywhere; the saved text is a Studio project (Scene v2 + editor state);
 * - `open()` reads Studio projects, Scene v2, timeline v1, animation JSON and 14.5 packs; damaged input is reported and
 *   the current project is kept; a pack's missing assets are listed with relink suggestions (14.5);
 * - `exportStandalone()` is the 14.7 export (offline HTML / CSS / player; `inline` for one file) — its digest equals
 *   `digest()` of the project;
 * - optional AI review (14.6) when you pass `ai: { provider }`: proposals are reviewed op by op before anything is written.
 *
 * The export, assets and AI modules are loaded on first use (dynamic `import()`), so opening the app costs the Studio only.
 */
const STUDIO_APP_VERSION = 1;
/** In-memory storage (default). */
function createMemoryStorage() {
    const m = new Map();
    return { read: (n) => m.get(n) ?? null, write: (n, t) => void m.set(n, t), get names() { return [...m.keys()].sort(); } };
}
/** `localStorage` storage under `prefix + name` (default prefix "motionary-studio:"). */
function createLocalStorage(prefix = 'motionary-studio:', ls = globalThis.localStorage) {
    return { read: (n) => ls.getItem(prefix + n), write: (n, t) => ls.setItem(prefix + n, t) };
}
const filesMap = (f) => (f instanceof Map ? new Map(f) : new Map(Object.entries(f || {})));
const msg = (e) => String(e?.message || e).replace(/^\[motionary\]\s*/, '');
const sceneKey = (s) => JSON.stringify(s.exportScene());
/** Build the app inside `root`. Resolves once the Studio is ready. */
async function createStudioApp(root, o = {}) {
    const d = root.ownerDocument;
    const storage = o.storage || createMemoryStorage();
    const fps = o.fps ?? 60;
    let name = o.name || 'untitled';
    let files = filesMap(o.assets);
    const history = createTimelineHistory(createTimelineDoc({ name }));
    const el = d.createElement('section');
    el.className = 'usa-studio-app';
    el.setAttribute('aria-label', 'Motion Studio');
    const bar = d.createElement('div');
    bar.className = 'usa-studio-app-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Project');
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;align-items:center;max-width:100%';
    const status = d.createElement('output');
    status.className = 'usa-studio-app-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const host = d.createElement('div');
    const aiHost = d.createElement('div');
    const css = d.createElement('style');
    css.textContent = '.usa-studio-app :focus-visible{outline:2px solid #0a84ff;outline-offset:2px}';
    el.append(css, bar, host, aiHost, status);
    root.append(el);
    const { name: _n, storage: _s, assets: _a, ai: _ai, onStatus: _o, ...studioOpts } = o;
    const studio = createStudio(host, { ...studioOpts, fps, history });
    let saved = sceneKey(studio);
    let download;
    const say = (m) => { status.textContent = m; o.onStatus?.(m); };
    const mods = { export: undefined, assets: undefined };
    const ex = async () => (mods.export || (mods.export = await import('./studio-export.js')));
    const as = async () => (mods.assets || (mods.assets = await import('./studio-assets.js')));
    const button = (act, label, run) => {
        const b = d.createElement('button');
        b.type = 'button';
        b.dataset.app = act;
        b.textContent = label;
        b.addEventListener('click', () => {
            try {
                Promise.resolve(run()).catch((e) => say(`${label}: ${msg(e)}`));
            }
            catch (e) {
                say(`${label}: ${msg(e)}`);
            }
        });
        bar.append(b);
        return b;
    };
    const picker = d.createElement('input');
    picker.type = 'file';
    picker.accept = '.json,application/json';
    picker.hidden = true;
    picker.dataset.app = 'file';
    picker.addEventListener('change', async () => {
        const f = picker.files && picker.files[0];
        if (!f)
            return;
        const r = await app.open(await f.text(), { name: f.name.replace(/(\.motionary)?(\.pack)?\.json$/i, '') });
        picker.value = '';
        if (!r.ok)
            return;
    });
    async function load(input, extra) {
        let text = typeof input === 'string' ? input : JSON.stringify(input);
        let incoming = new Map(files);
        for (const [k, v] of filesMap(extra))
            incoming.set(k, v);
        let head;
        try {
            head = JSON.parse(text);
        }
        catch {
            head = undefined;
        }
        try {
            if (head && head.format === 'motionary-studio-pack') {
                const A = await as();
                const u = A.unpackStudioProject(text);
                for (const [k, v] of u.files)
                    incoming.set(k, v);
                text = A.packStudioProject ? JSON.stringify(JSON.parse(text).project) : text;
            }
            const lost = studio.load(head && head.format === 'motionary-studio-pack' ? JSON.parse(text) : text);
            files = incoming;
            saved = sceneKey(studio);
            const r = { ok: true, lost, missing: [], relink: [] };
            if (head && (head.format === 'motionary-studio-pack' || files.size || /"--?[\w-]*src"|url\(/.test(text))) {
                const A = await as();
                const manifest = A.createAssetManifest(history.doc);
                const chk = A.checkAssets(manifest, files);
                r.missing = chk.missing.map((m) => m.path);
                if (r.missing.length)
                    r.relink = A.relinkAssets(chk.missing, files);
            }
            say(`Opened ${name}${r.missing.length ? ` — ${r.missing.length} missing asset(s)` : ''}${lost.length ? ` — ${lost.length} item(s) not carried over` : ''}`);
            return r;
        }
        catch (e) {
            say(`Could not open: ${msg(e)}`);
            return { ok: false, error: msg(e), lost: [], missing: [], relink: [] };
        }
    }
    const app = {
        el,
        studio,
        history,
        get name() { return name; },
        get dirty() { return sceneKey(studio) !== saved; },
        async newProject(n) {
            name = n || 'untitled';
            files = new Map();
            studio.load(createTimelineDoc({ name }));
            saved = sceneKey(studio);
            say(`New project ${name}`);
        },
        async open(input, oo = {}) {
            const before = name;
            if (oo.name)
                name = oo.name;
            const r = await load(input, oo.assets);
            if (!r.ok)
                name = before;
            return r;
        },
        async save() {
            const text = studio.save();
            await storage.write(name, text);
            saved = sceneKey(studio);
            say(`Saved ${name}`);
            return text;
        },
        async reopen(n) {
            const text = await storage.read(n || name);
            if (text == null) {
                say(`Nothing saved as ${n || name}`);
                return { ok: false, error: `nothing saved as ${n || name}`, lost: [], missing: [], relink: [] };
            }
            if (n)
                name = n;
            return load(text);
        },
        async savePack() {
            const A = await as();
            const r = A.packStudioProject(studio.save(), files);
            return { text: r.text, missing: (r.missing || []).map((m) => (typeof m === 'string' ? m : m.path)) };
        },
        async exportStandalone(eo = {}) {
            const E = await ex();
            const out = E.exportStandalone(studio.save(), { fps, assets: files, title: name, ...eo });
            if (download)
                URL.revokeObjectURL?.(download);
            download = undefined;
            say(out.report.ok ? `Exported ${name} (${out.files.size} file(s), digest ${out.report.digest.slice(0, 16)}…)` : `Export finished with problems`);
            return out;
        },
        async digest() {
            const E = await ex();
            return E.frameDigest(studio.save(), { fps });
        },
        destroy() {
            if (download)
                URL.revokeObjectURL?.(download);
            studio.destroy();
            el.remove();
        },
    };
    button('new', 'New', () => app.newProject());
    button('open', 'Open…', () => picker.click());
    button('save', 'Save', () => app.save());
    button('reopen', 'Reopen', () => app.reopen());
    button('export', 'Export', async () => {
        const out = await app.exportStandalone({ inline: true });
        const html = out.files.get('index.html');
        if (typeof Blob === 'function' && typeof URL.createObjectURL === 'function' && html !== undefined) {
            download = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
            let a = el.querySelector('[data-app="download"]');
            if (!a) {
                a = d.createElement('a');
                a.dataset.app = 'download';
                a.textContent = 'Download export';
                bar.append(a);
            }
            a.href = download;
            a.download = `${name}.html`;
        }
    });
    button('undo', 'Undo', () => studio.undo());
    button('redo', 'Redo', () => studio.redo());
    bar.append(picker);
    if (o.ai) {
        const AI = await import('./studio-ai.js');
        AI.createAiPanel(aiHost, { history, ...o.ai });
    }
    say(`Ready — ${name} at ${fps} fps (frame ${frameTime(studio.time, fps)} ms)`);
    return app;
}

export { STUDIO_APP_VERSION, createLocalStorage, createMemoryStorage, createStudioApp };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.3.0/dist/components/studio-app.js.map