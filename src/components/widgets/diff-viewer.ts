import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { changedSpan, diffLines, type DiffLine } from './kit-13';
import css from './ui-kit-13.css?raw';

/**
 * A code diff from two child `pre` elements, `data-before` and `data-after`. Lines are compared, then shown unified
 * (one column with − and + lines) or split (old and new side by side); a toggle switches between them. Changed lines
 * cascade in, and inside a pair of changed lines the characters that differ are marked. A header gives the file name
 * and the +added / −removed counts. The table is real text with line numbers that screen readers can step through.
 *
 * Attributes: `mode` (unified, split; unified), `file`, `label` (Diff), `unified-label` (Unified), `split-label` (Split),
 * `added-label` (added), `removed-label` (removed).
 * Event `usa:mode` ({ mode }).
 */
export interface UsaDiffViewerElement extends UsaElement {
  readonly lines: DiffLine[];
}

export function defineDiffViewer(tag = 'usa-diff-viewer'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class DiffViewer extends Base {
    static get observedAttributes(): string[] { return ['mode', 'file', 'label', 'unified-label', 'split-label', 'added-label', 'removed-label']; }
    private _lines: DiffLine[] = [];
    get lines(): DiffLine[] { return this._lines.slice(); }
    mount(): void {
      const before = this.querySelector<HTMLElement>(':scope > [data-before]');
      const after = this.querySelector<HTMLElement>(':scope > [data-after]');
      const srcs = [before, after].filter(Boolean) as HTMLElement[];
      const hid = srcs.map((s) => s.hidden);
      for (const s of srcs) s.hidden = true;
      const trimEdge = (t: string) => t.replace(/^\n/, '').replace(/\n\s*$/, '');
      const lines = (this._lines = diffLines(trimEdge(before?.textContent ?? ''), trimEdge(after?.textContent ?? '')));
      const root = make('figure', 'usa-kit usa-diff');
      root.toggleAttribute('data-static', this.reduced);
      const head = make('figcaption', 'usa-diff-head');
      const file = make('span', 'usa-diff-file', this.str('file') || this.str('label', 'Diff'));
      const added = lines.filter((l) => l.type === 'add').length;
      const removed = lines.filter((l) => l.type === 'del').length;
      const stats = make('span', 'usa-diff-stats');
      const plus = make('span', 'usa-diff-plus', `+${added}`);
      plus.setAttribute('aria-label', `${added} ${this.str('added-label', 'added')}`);
      const minus = make('span', 'usa-diff-minus', `−${removed}`);
      minus.setAttribute('aria-label', `${removed} ${this.str('removed-label', 'removed')}`);
      const blocks = make('span', 'usa-diff-blocks');
      blocks.setAttribute('aria-hidden', 'true');
      const total = Math.max(1, added + removed);
      for (let i = 0; i < 5; i++) blocks.append(make('i', i < Math.round((added / total) * 5) ? 'add' : i < Math.round(((added + removed) / total) * 5) ? 'del' : ''));
      stats.append(plus, minus, blocks);
      const seg = make('span', 'usa-diff-modes');
      seg.setAttribute('role', 'radiogroup');
      seg.setAttribute('aria-label', this.str('label', 'Diff'));
      const modes = (['unified', 'split'] as const).map((m) => {
        const b = make('button', 'usa-diff-mode', this.str(`${m}-label`, m === 'unified' ? 'Unified' : 'Split'));
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.dataset.mode = m;
        seg.append(b);
        return b;
      });
      head.append(file, stats, seg);
      const body = make('div', 'usa-diff-body');
      root.append(head, body);
      this.append(root);
      const mark = (text: string, span: [number, number] | null, cls: string) => {
        const code = make('code', 'usa-diff-code');
        if (!span || span[0] >= span[1]) { code.textContent = text || ' '; return code; }
        code.append(text.slice(0, span[0]), make('mark', cls, text.slice(span[0], span[1])), text.slice(span[1]));
        return code;
      };
      // pair each run of removed lines with the added lines right after it, for character marks and the split view
      type Row = { del?: DiffLine; add?: DiffLine; same?: DiffLine; spanA?: [number, number]; spanB?: [number, number] };
      const rows: Row[] = [];
      for (let i = 0; i < lines.length;) {
        if (lines[i].type === 'same') { rows.push({ same: lines[i] }); i++; continue; }
        const dels: DiffLine[] = [], adds: DiffLine[] = [];
        while (i < lines.length && lines[i].type === 'del') dels.push(lines[i++]);
        while (i < lines.length && lines[i].type === 'add') adds.push(lines[i++]);
        for (let k = 0; k < Math.max(dels.length, adds.length); k++) {
          const r: Row = { del: dels[k], add: adds[k] };
          if (r.del && r.add) {
            const [s, ea, eb] = changedSpan(r.del.text, r.add.text);
            if (ea - s < r.del.text.length * 0.8 || eb - s < r.add.text.length * 0.8) { r.spanA = [s, ea]; r.spanB = [s, eb]; }
          }
          rows.push(r);
        }
      }
      const num = (n?: number) => make('span', 'usa-diff-num', n ? String(n) : '');
      const sign = (s: string) => { const e = make('span', 'usa-diff-sign', s); e.setAttribute('aria-hidden', 'true'); return e; };
      let step = 0;
      const line = (cls: string, parts: Node[]) => {
        const row = make('div', `usa-diff-line ${cls}`);
        row.setAttribute('role', 'row');
        if (cls !== 'same') row.style.setProperty('--i', String(Math.min(step++, 30)));
        for (const p of parts) { const c = make('span', 'usa-diff-cell'); c.setAttribute('role', 'cell'); c.append(p); row.append(c); }
        return row;
      };
      const srText = (t: string, el: HTMLElement) => { el.prepend(make('span', 'usa-kit-sr', t)); return el; };
      const render = (mode: 'unified' | 'split') => {
        step = 0;
        const table = make('div', `usa-diff-table ${mode}`);
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', this.str('file') || this.str('label', 'Diff'));
        const code = (l: DiffLine, span: [number, number] | undefined, cls: string, kind: string) => {
          const c = mark(l.text, span ?? null, cls);
          c.classList.add(kind);
          return c;
        };
        for (let i = 0; i < rows.length;) {
          const same = rows[i].same;
          if (same) {
            table.append(mode === 'unified'
              ? line('same', [num(same.a), num(same.b), sign(' '), mark(same.text, null, '')])
              : line('same', [num(same.a), mark(same.text, null, ''), num(same.b), mark(same.text, null, '')]));
            i++;
            continue;
          }
          const run: Row[] = [];
          while (i < rows.length && !rows[i].same) run.push(rows[i++]);
          if (mode === 'unified') {
            // removed lines first, then the lines that replace them
            for (const r of run) if (r.del) table.append(line('del', [num(r.del.a), num(), sign('−'), srText(`${this.str('removed-label', 'removed')}: `, code(r.del, r.spanA, 'usa-diff-x', 'del'))]));
            for (const r of run) if (r.add) table.append(line('add', [num(), num(r.add.b), sign('+'), srText(`${this.str('added-label', 'added')}: `, code(r.add, r.spanB, 'usa-diff-y', 'add'))]));
          } else {
            for (const r of run) table.append(line('pair', [
              num(r.del?.a), r.del ? code(r.del, r.spanA, 'usa-diff-x', 'del') : make('span', 'usa-diff-blank'),
              num(r.add?.b), r.add ? code(r.add, r.spanB, 'usa-diff-y', 'add') : make('span', 'usa-diff-blank'),
            ]));
          }
        }
        body.replaceChildren(table);
        modes.forEach((b) => { const on = b.dataset.mode === mode; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
        root.dataset.mode = mode;
        root.removeAttribute('data-in');
        void root.offsetWidth;
        root.setAttribute('data-in', '');
      };
      const mode = this.str('mode') === 'split' ? 'split' : 'unified';
      render(mode);
      const choose = (m: 'unified' | 'split', focus = false) => {
        render(m);
        if (focus) modes.find((b) => b.dataset.mode === m)?.focus();
        this.emit('mode', { mode: m });
      };
      for (const b of modes) this.listen(b, 'click', () => choose(b.dataset.mode as 'unified' | 'split'));
      this.listen(seg, 'keydown', (e: KeyboardEvent) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        choose(root.dataset.mode === 'split' ? 'unified' : 'split', true);
      });
      this.onCleanup(() => { root.remove(); srcs.forEach((s, i) => (s.hidden = hid[i])); });
    }
  }, { id: 'ui-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
