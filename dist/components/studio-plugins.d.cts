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
declare const PLUGIN_API_VERSION: 1;
declare const PLUGIN_PERMISSIONS: readonly ["project:read", "project:propose", "panel", "exporter"];
type PluginPermission = (typeof PLUGIN_PERMISSIONS)[number];
interface PluginManifest {
    id: string;
    name: string;
    version: string;
    api: 1;
    permissions: PluginPermission[];
}
type PluginResult<T> = {
    ok: true;
    value: T;
    error?: undefined;
} | {
    ok: false;
    error: string;
    value?: undefined;
};
interface PluginTransport {
    send(message: unknown): void;
    onMessage(fn: (message: any) => void): void;
    onError(fn: (error: unknown) => void): void;
    terminate(): void;
}
/** The `motionary` object a plugin sees. */
interface PluginApi {
    getProject(): Promise<any>;
    propose(project: unknown, note?: string): Promise<boolean>;
    setPanel(panel: {
        title?: string;
        text: string;
    }): Promise<boolean>;
    onExport(fn: (project: any) => Record<string, string> | Promise<Record<string, string>>): Promise<boolean>;
}
interface PluginInfo {
    id: string;
    name: string;
    version: string;
    permissions: PluginPermission[];
    status: 'running' | 'crashed' | 'stopped';
    exporter: boolean;
    error?: string;
}
interface PluginAuditEntry {
    plugin: string;
    method: string;
    allowed: boolean;
    at: number;
}
interface PluginPanel {
    plugin: string;
    title?: string;
    text: string;
}
interface PluginHostOptions {
    getProject: () => unknown;
    /** Receives a copy of the proposed project; return true when the Studio applied it. Without it proposals are refused. */
    propose?: (project: any, meta: {
        plugin: string;
        note: string;
    }) => boolean | Promise<boolean>;
    /** Exporter answer limit (default 2000 ms); a plugin that misses it is crashed. */
    timeoutMs?: number;
    /** Messages per second before a plugin counts as flooding (default 200). */
    maxMessages?: number;
    onCrash?: (plugin: string, reason: string) => void;
}
interface PluginHost {
    /** Load a plugin from its code (run in a Worker) or through a transport (`createIframeTransport`, `createLocalTransport`). */
    load(manifest: unknown, codeOrTransport: string | PluginTransport): PluginResult<PluginInfo>;
    plugins(): PluginInfo[];
    panels(): PluginPanel[];
    runExporter(id: string): Promise<PluginResult<{
        files: Record<string, string>;
    }>>;
    stop(id: string): void;
    readonly audit: PluginAuditEntry[];
}
/** Validate a manifest (object or JSON text); unknown fields are dropped, anything unclear is refused. */
declare function parsePluginManifest(input: unknown): PluginManifest;
/** Worker source: the runtime as a `motionary` global, error reporting, then the plugin code. */
declare function pluginWorkerSource(code: string): string;
/** iframe `srcdoc`: scripts only (CSP `default-src 'none'`), messages only to and from the parent. */
declare function pluginFrameSource(code: string): string;
/** Run plugin code in a dedicated Worker (no DOM, own thread: an endless loop cannot block the Studio). */
declare function createWorkerTransport(code: string): PluginTransport;
/** Run plugin code in a hidden `sandbox="allow-scripts"` iframe (opaque origin: no cookies, storage or parent DOM). */
declare function createIframeTransport(code: string, parent?: Element): PluginTransport;
/** In-process transport for tests and trusted code (NO sandbox). Messages are copied and delivered asynchronously. */
declare function createLocalTransport(plugin: (motionary: PluginApi) => unknown): PluginTransport;
/** The Studio side: loads plugins, answers their calls by permission, runs exporters, isolates crashes. */
declare function createPluginHost(o: PluginHostOptions): PluginHost;

export { PLUGIN_API_VERSION, PLUGIN_PERMISSIONS, createIframeTransport, createLocalTransport, createPluginHost, createWorkerTransport, parsePluginManifest, pluginFrameSource, pluginWorkerSource };
export type { PluginApi, PluginAuditEntry, PluginHost, PluginHostOptions, PluginInfo, PluginManifest, PluginPanel, PluginPermission, PluginResult, PluginTransport };
