/**
 * 13.6: undo / redo for timeline editing. Documents are immutable, so an entry
 * is a pair of snapshots (cheap: unchanged layers are shared). Drags either
 * run inside `begin()` … `commit()` or pass the same `coalesce` key on every
 * step: one gesture = one undo step. The stack is bounded (`limit`).
 */
import type { TimelineDoc } from './format';

export interface HistoryOptions {
  /** Most undo steps kept (oldest dropped first). Default 100. */
  limit?: number;
  /** Steps with the same `coalesce` key within this many ms merge into one. Default 1000. */
  coalesceMs?: number;
  /** Clock for coalescing (default `Date.now`); inject a fixed clock in tests. */
  now?: () => number;
}
export interface ApplyOptions {
  /** Label for the step (`'Move keyframes'`) — shown by undo / redo UI. */
  label?: string;
  /** Merge with the previous step when it has the same key and is recent (drags, typing). */
  coalesce?: string;
}
export interface TimelineHistory {
  readonly doc: TimelineDoc;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly undoLabel: string | undefined;
  readonly redoLabel: string | undefined;
  /** Undo steps currently stored. */
  readonly size: number;
  /** Apply a change (a new document or a function of the current one). No-op changes add no step. */
  apply(change: TimelineDoc | ((doc: TimelineDoc) => TimelineDoc), o?: ApplyOptions): TimelineDoc;
  /** Start a gesture: `apply()` calls update the document without adding steps until `commit()` / `cancel()`. */
  begin(label?: string): void;
  /** End the gesture as one step (none when nothing changed). */
  commit(): void;
  /** End the gesture and restore the document from `begin()`. */
  cancel(): void;
  undo(): boolean;
  redo(): boolean;
  /** Replace the document and forget every step (e.g. after loading a file). */
  reset(doc: TimelineDoc): void;
  /** Called after every change of `doc`; returns an unsubscribe function. */
  subscribe(fn: (doc: TimelineDoc) => void): () => void;
}

interface Entry { before: TimelineDoc; after: TimelineDoc; label?: string; key?: string; at: number }

export function createTimelineHistory(initial: TimelineDoc, o: HistoryOptions = {}): TimelineHistory {
  const limit = Math.max(1, Math.floor(o.limit ?? 100));
  const window = o.coalesceMs ?? 1000;
  const clock = o.now ?? Date.now;
  let doc = initial;
  let undo: Entry[] = [];
  let redo: Entry[] = [];
  let tx: { before: TimelineDoc; label?: string } | null = null;
  const subs = new Set<(d: TimelineDoc) => void>();
  const emit = () => subs.forEach((fn) => fn(doc));
  const push = (e: Entry) => {
    undo.push(e);
    if (undo.length > limit) undo.splice(0, undo.length - limit);
    redo = [];
  };

  const h: TimelineHistory = {
    get doc() { return doc; },
    get canUndo() { return !tx && undo.length > 0; },
    get canRedo() { return !tx && redo.length > 0; },
    get undoLabel() { return undo[undo.length - 1]?.label; },
    get redoLabel() { return redo[redo.length - 1]?.label; },
    get size() { return undo.length; },
    apply(change, a = {}) {
      const next = typeof change === 'function' ? change(doc) : change;
      if (!next || next === doc) return doc;
      const before = doc;
      doc = next;
      if (!tx) {
        const top = undo[undo.length - 1];
        const t = clock();
        if (a.coalesce && top && top.key === a.coalesce && redo.length === 0 && t - top.at <= window) {
          top.after = doc;
          top.at = t;
          if (top.after === top.before) undo.pop();
        } else push({ before, after: doc, label: a.label, key: a.coalesce, at: t });
      }
      emit();
      return doc;
    },
    begin(label) {
      if (!tx) tx = { before: doc, label };
    },
    commit() {
      if (!tx) return;
      const { before, label } = tx;
      tx = null;
      if (before !== doc) push({ before, after: doc, label, at: clock() });
    },
    cancel() {
      if (!tx) return;
      const changed = tx.before !== doc;
      doc = tx.before;
      tx = null;
      if (changed) emit();
    },
    undo() {
      if (tx) h.commit();
      const e = undo.pop();
      if (!e) return false;
      redo.push(e);
      doc = e.before;
      emit();
      return true;
    },
    redo() {
      if (tx) h.commit();
      const e = redo.pop();
      if (!e) return false;
      undo.push(e);
      doc = e.after;
      emit();
      return true;
    },
    reset(d) {
      tx = null;
      undo = [];
      redo = [];
      doc = d;
      emit();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
  return h;
}

/** Keys `bindHistoryKeys` maps: ⌘/Ctrl+Z undo, ⇧⌘/Ctrl+Shift+Z or Ctrl+Y redo. */
export function historyKeyAction(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>): 'undo' | 'redo' | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  const k = e.key.toLowerCase();
  if (k === 'z') return e.shiftKey ? 'redo' : 'undo';
  if (k === 'y' && e.ctrlKey && !e.shiftKey) return 'redo';
  return null;
}

/**
 * Wire the undo / redo shortcuts on `target` (an editor root or `document`).
 * Ignored while typing in a text field (its own undo wins). Returns an unbind function.
 */
export function bindHistoryKeys(target: EventTarget, history: Pick<TimelineHistory, 'undo' | 'redo'>): () => void {
  const onKey = (ev: Event) => {
    const e = ev as KeyboardEvent;
    const action = historyKeyAction(e);
    if (!action) return;
    const el = (e.composedPath?.()[0] ?? e.target) as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName || ''))) return;
    e.preventDefault();
    history[action]();
  };
  target.addEventListener('keydown', onKey);
  return () => target.removeEventListener('keydown', onKey);
}
