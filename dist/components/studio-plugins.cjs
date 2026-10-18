'use strict';

/**
 * Studio plugin API v1 (`@experimental` since 16.2: may change in a minor release — docs/stability.md). Third-party panels and
 * exporters run in a sandbox (a Worker, or an iframe with `sandbox="allow-scripts"` and a `default-src 'none'` CSP)
 * and talk to the Studio only through messages. A manifest declares the permissions; the host answers a call only
 * when its permission was granted and audits every call. Proposals never write the project: the host hands a copy
 * to the Studio's `propose` callback, which decides (one undo step). A plugin that throws, times out or floods the
 * host is marked `crashed` and terminated; the host and every other plugin keep working, and no host method throws.
 * Opt-in entry `motionary/studio/plugins` (= `motionary/components/studio-plugins`); not in lite or studio.
 */
/** The plugin API version a manifest declares (`api: 1`). @experimental */
const PLUGIN_API_VERSION = 1;
const PLUGIN_PERMISSIONS = ['project:read', 'project:propose', 'panel', 'exporter'];
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const bad = (m) => new Error(`[motionary] plugins: ${m}`);
const msg = (x) => String((x && x.message) || x);
const fail = (error) => ({ ok: false, error });
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const NEEDS = { 'project.get': 'project:read', 'project.propose': 'project:propose', 'panel.set': 'panel', 'exporter.register': 'exporter' };
/** Validate a manifest (object or JSON text); unknown fields are dropped, anything unclear is refused. */
function parsePluginManifest(input) {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    if (!text || text.length > 16384)
        throw bad('manifest too large');
    const m = JSON.parse(text);
    if (!isObj(m))
        throw bad('manifest must be an object');
    if (typeof m.id !== 'string' || !/^[a-z0-9][a-z0-9.-]{1,63}$/.test(m.id))
        throw bad(`bad id "${m.id}"`);
    if (typeof m.name !== 'string' || !m.name)
        throw bad('name required');
    if (typeof m.version !== 'string' || !/^\d+\.\d+\.\d+(-[\w.-]+)?$/.test(m.version))
        throw bad(`bad version "${m.version}"`);
    if (m.api !== 1)
        throw bad('api must be 1');
    const ps = Array.isArray(m.permissions) ? m.permissions : [];
    for (const p of ps)
        if (!PLUGIN_PERMISSIONS.includes(p))
            throw bad(`permission "${p}" unknown`);
    return { id: m.id, name: m.name, version: m.version, api: 1, permissions: [...new Set(ps)] };
}
/** Plugin side of the protocol. Self-contained: it is also serialized into the Worker / iframe source. */
function pluginRuntime(post, listen) {
    let n = 0, exp;
    const wait = new Map();
    listen((m) => {
        if (m && m.t === 'res') {
            const w = wait.get(m.id);
            if (w) {
                wait.delete(m.id);
                m.ok ? w[0](m.value) : w[1](new Error(m.error));
            }
        }
        else if (m && m.t === 'export')
            new Promise((r) => r(exp(m.project))).then((files) => post({ t: 'exported', id: m.id, files }), (e) => post({ t: 'exported', id: m.id, error: String((e && e.message) || e) }));
    });
    const call = (method, ...args) => new Promise((res, rej) => { wait.set(++n, [res, rej]); post({ t: 'call', id: n, method, args }); });
    return { getProject: () => call('project.get'), propose: (p, note) => call('project.propose', p, note), setPanel: (p) => call('panel.set', p), onExport: (fn) => { exp = fn; return call('exporter.register'); } };
}
const report = (post) => `addEventListener('error',e=>${post}({t:'error',message:String(e.message)}));addEventListener('unhandledrejection',e=>${post}({t:'error',message:String(e.reason&&e.reason.message||e.reason)}));`;
/** Worker source: the runtime as a `motionary` global, error reporting, then the plugin code. */
function pluginWorkerSource(code) {
    return `const motionary=(${pluginRuntime})(m=>postMessage(m),f=>addEventListener('message',e=>f(e.data)));${report('postMessage')}\n${code}`;
}
/** iframe `srcdoc`: scripts only (CSP `default-src 'none'`), messages only to and from the parent. */
function pluginFrameSource(code) {
    return `<!doctype html><meta id="sandbox-csp" http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'"><script>const P=m=>parent.postMessage(m,'*');const motionary=(${pluginRuntime})(P,f=>addEventListener('message',e=>{if(e.source===parent)f(e.data)}));${report('P')}\n${code.replace(/<\/(script)/gi, '<\\/$1')}\n</script>`;
}
/** Run plugin code in a dedicated Worker (no DOM, own thread: an endless loop cannot block the Studio). */
function createWorkerTransport(code) {
    if (typeof Worker !== 'function')
        throw bad('Worker is not available here');
    const url = URL.createObjectURL(new Blob([pluginWorkerSource(code)], { type: 'text/javascript' }));
    const w = new Worker(url);
    return {
        send: (m) => w.postMessage(m),
        onMessage: (f) => { w.onmessage = (e) => f(e.data); },
        onError: (f) => { w.onerror = (e) => { e.preventDefault(); f(e.message); }; },
        terminate: () => { w.terminate(); URL.revokeObjectURL(url); },
    };
}
/** Run plugin code in a hidden `sandbox="allow-scripts"` iframe (opaque origin: no cookies, storage or parent DOM). */
function createIframeTransport(code, parent = document.body) {
    const f = document.createElement('iframe');
    f.setAttribute('sandbox', 'allow-scripts');
    f.style.display = 'none';
    f.srcdoc = pluginFrameSource(code);
    let q = [], on = () => { }, err = () => { };
    const listen = (e) => { if (e.source && e.source === f.contentWindow) {
        const m = e.data;
        isObj(m) && m.t === 'error' ? err(m.message) : on(m);
    } };
    addEventListener('message', listen);
    f.onload = () => { for (const m of q || [])
        f.contentWindow?.postMessage(m, '*'); q = null; };
    parent.appendChild(f);
    return {
        send: (m) => (q ? q.push(m) : f.contentWindow?.postMessage(m, '*')),
        onMessage: (fn) => { on = fn; },
        onError: (fn) => { err = fn; },
        terminate: () => { removeEventListener('message', listen); f.remove(); },
    };
}
/** In-process transport for tests and trusted code (NO sandbox). Messages are copied and delivered asynchronously. */
function createLocalTransport(plugin) {
    let host, err, inbox, dead = false;
    const later = (f) => queueMicrotask(() => { if (!dead)
        f(); });
    later(() => {
        const mo = pluginRuntime((m) => later(() => host?.(clone(m))), (f) => { inbox = f; });
        new Promise((r) => r(plugin(mo))).catch((e) => later(() => err?.(e)));
    });
    return { send: (m) => later(() => inbox?.(clone(m))), onMessage: (f) => { host = f; }, onError: (f) => { err = f; }, terminate: () => { dead = true; } };
}
function files(f) {
    if (!isObj(f))
        return fail('exporter must return { path: text }');
    let size = 0;
    const keys = Object.keys(f);
    if (keys.length > 500)
        return fail('too many files');
    for (const k of keys) {
        if (!/^[\w-][\w.-]*(\/[\w-][\w.-]*)*$/.test(k) || k.includes('..'))
            return fail(`bad path "${k}"`);
        if (typeof f[k] !== 'string')
            return fail(`file "${k}" is not text`);
        if ((size += f[k].length) > 1e7)
            return fail('export too large');
    }
    return { ok: true, value: { files: f } };
}
/** The Studio side: loads plugins, answers their calls by permission, runs exporters, isolates crashes. */
function createPluginHost(o) {
    const all = new Map();
    const audit = [];
    const timeout = o.timeoutMs ?? 2000, max = o.maxMessages ?? 200;
    let seq = 0;
    const end = (e) => {
        try {
            e.t.terminate();
        }
        catch { /* already gone */ }
        for (const w of e.wait.values())
            w(fail(e.error || 'stopped'));
        e.wait.clear();
    };
    const crash = (e, why) => {
        if (e.status !== 'running')
            return;
        e.status = 'crashed';
        e.error = why;
        end(e);
        try {
            o.onCrash?.(e.m.id, why);
        }
        catch { /* the host never throws */ }
    };
    const info = (e) => ({ id: e.m.id, name: e.m.name, version: e.m.version, permissions: e.m.permissions, status: e.status, exporter: e.exporter, ...(e.error ? { error: e.error } : {}) });
    const onMsg = (e, m) => {
        if (e.status !== 'running' || !isObj(m))
            return;
        const now = Date.now();
        if (now - e.win >= 1000) {
            e.win = now;
            e.n = 0;
        }
        if (++e.n > max)
            return crash(e, 'message flood');
        if (m.t === 'error')
            return crash(e, String(m.message));
        if (m.t === 'exported') {
            const w = e.wait.get(m.id);
            if (w) {
                e.wait.delete(m.id);
                w(m.error !== undefined ? fail(String(m.error)) : files(m.files));
            }
            return;
        }
        if (m.t !== 'call')
            return;
        const need = NEEDS[m.method], a = Array.isArray(m.args) ? m.args : [];
        const allowed = !!need && e.m.permissions.includes(need);
        audit.push({ plugin: e.m.id, method: String(m.method), allowed, at: now });
        new Promise((res) => {
            if (!need)
                throw bad(`unknown method "${m.method}"`);
            if (!allowed)
                throw bad(`permission "${need}" not granted`);
            if (need === 'project:read')
                return res(clone(o.getProject()));
            if (need === 'project:propose') {
                if (!o.propose)
                    throw bad('proposals are not accepted here');
                return res(Promise.resolve(o.propose(clone(a[0]), { plugin: e.m.id, note: String(a[1] ?? '') })).then(Boolean));
            }
            if (need === 'panel') {
                const p = a[0];
                if (!isObj(p) || typeof p.text !== 'string' || (p.title !== undefined && typeof p.title !== 'string'))
                    throw bad('panel needs { title?, text }');
                if (p.text.length + (p.title || '').length > 8192)
                    throw bad('panel text too large');
                e.panel = p.title !== undefined ? { title: p.title, text: p.text } : { text: p.text };
            }
            else
                e.exporter = true;
            res(true);
        }).then((value) => ({ t: 'res', id: m.id, ok: true, value }), (x) => ({ t: 'res', id: m.id, ok: false, error: msg(x) }))
            .then((r) => { if (e.status === 'running')
            try {
                e.t.send(r);
            }
            catch (x) {
                crash(e, msg(x));
            } });
    };
    return {
        audit,
        load(manifest, t) {
            try {
                const m = parsePluginManifest(manifest);
                if (all.has(m.id))
                    return fail(`plugin "${m.id}" is already loaded`);
                const tr = typeof t === 'string' ? createWorkerTransport(t) : t;
                const e = { m, t: tr, status: 'running', wait: new Map(), n: 0, win: 0, exporter: false };
                all.set(m.id, e);
                tr.onMessage((x) => onMsg(e, x));
                tr.onError((x) => crash(e, msg(x)));
                return { ok: true, value: info(e) };
            }
            catch (x) {
                return fail(msg(x));
            }
        },
        plugins: () => [...all.values()].map(info),
        panels: () => [...all.values()].filter((e) => e.panel && e.status === 'running').map((e) => ({ plugin: e.m.id, ...e.panel })),
        runExporter(id) {
            const e = all.get(id);
            if (!e || e.status !== 'running')
                return Promise.resolve(fail(`plugin "${id}" is not running`));
            if (!e.exporter)
                return Promise.resolve(fail(`plugin "${id}" has no exporter`));
            const n = ++seq;
            return new Promise((res) => {
                const timer = setTimeout(() => { e.wait.delete(n); res(fail(`timeout after ${timeout} ms`)); crash(e, `exporter timeout after ${timeout} ms`); }, timeout);
                e.wait.set(n, (r) => { clearTimeout(timer); res(r); });
                try {
                    e.t.send({ t: 'export', id: n, project: clone(o.getProject()) });
                }
                catch (x) {
                    crash(e, msg(x));
                }
            });
        },
        stop(id) {
            const e = all.get(id);
            if (e && e.status === 'running') {
                e.status = 'stopped';
                end(e);
            }
        },
    };
}

exports.PLUGIN_API_VERSION = PLUGIN_API_VERSION;
exports.PLUGIN_PERMISSIONS = PLUGIN_PERMISSIONS;
exports.createIframeTransport = createIframeTransport;
exports.createLocalTransport = createLocalTransport;
exports.createPluginHost = createPluginHost;
exports.createWorkerTransport = createWorkerTransport;
exports.parsePluginManifest = parsePluginManifest;
exports.pluginFrameSource = pluginFrameSource;
exports.pluginWorkerSource = pluginWorkerSource;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.1/dist/components/studio-plugins.cjs.map