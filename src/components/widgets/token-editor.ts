import { defineElement, type UsaElement } from '../base';
import { getMotionTokens, applyMotionTokens, type MotionTokens } from '../tokens/index';
import { exportDesignTokens, importDesignTokens, validateDesignTokens } from '../tokens/dtcg';
import css from './token-editor.css?raw';

/**
 * `<usa-token-editor apply></usa-token-editor>` (10.6, motion design tokens
 * 2.0) — edit motion tokens (durations and cubic-bézier easings) with a live
 * preview per token, then export them as W3C Design Tokens (DTCG 2025.10 or
 * the earlier draft) or import a DTCG file (aliases resolved, problems
 * listed). `apply` writes the tokens to `:root` custom properties as you
 * edit; `format` (2025.10 · draft); `groups` (duration,easing). `tokens`,
 * `exportJSON()`, `importJSON(json)`; `usa:change` { tokens },
 * `usa:export` { json }, `usa:import` { problems }.
 */
export interface UsaTokenEditorElement extends UsaElement {
  tokens: MotionTokens;
  exportJSON(): Record<string, unknown>;
  importJSON(json: unknown): string[];
}

const bez = (e: string): number[] | null => {
  const m = /^cubic-bezier\(([^)]+)\)$/.exec(e.trim());
  return m ? m[1].split(',').map(Number) : null;
};

export function defineTokenEditor(tag = 'usa-token-editor'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaTokenEditor extends Base {
        static get observedAttributes(): string[] {
          return ['apply', 'format', 'groups', 'label'];
        }
        private t: MotionTokens = JSON.parse(JSON.stringify(getMotionTokens()));
        get tokens(): MotionTokens {
          return this.t;
        }
        set tokens(v: MotionTokens) {
          this.t = JSON.parse(JSON.stringify(v));
          if (this.isConnected) this.changed('tokens');
        }
        exportJSON(): Record<string, unknown> {
          const json = exportDesignTokens(this.t, { format: (this.str('format', '2025.10') as any) || '2025.10' });
          this.emit('export', { json });
          return json;
        }
        importJSON(json: unknown): string[] {
          const problems = validateDesignTokens(json);
          try {
            this.t = importDesignTokens(json, this.t);
          } catch (e) {
            problems.push(String((e as Error).message));
          }
          this.emit('import', { problems });
          if (this.isConnected) this.changed('tokens');
          return problems;
        }
        mount(): void {
          const groups = this.str('groups', 'duration,easing').split(/[\s,]+/);
          const root = document.createElement('div');
          root.className = 'usa-te';
          root.setAttribute('role', 'group');
          root.setAttribute('aria-label', this.str('label', 'Motion tokens'));
          const rows: string[] = [];
          if (groups.includes('duration'))
            for (const [k, v] of Object.entries(this.t.duration))
              rows.push(`<div class="usa-te-row" data-g="duration" data-k="${k}"><span class="usa-te-name">duration.${k}</span><input type="number" min="0" step="10" value="${v}" aria-label="duration ${k} (ms)"><span class="usa-te-unit">ms</span><span class="usa-te-prev" aria-hidden="true"><i></i></span></div>`);
          if (groups.includes('easing'))
            for (const [k, v] of Object.entries(this.t.easing)) {
              const b = bez(v);
              if (!b) continue;
              rows.push(`<div class="usa-te-row" data-g="easing" data-k="${k}"><span class="usa-te-name">easing.${k}</span><input type="text" value="${b.join(', ')}" aria-label="easing ${k} (x1, y1, x2, y2)" spellcheck="false"><span class="usa-te-unit"></span><span class="usa-te-prev" aria-hidden="true"><i></i></span></div>`);
            }
          root.innerHTML = `<div class="usa-te-rows">${rows.join('')}</div><div class="usa-te-bar"><button type="button" data-act="export">Export DTCG</button><button type="button" data-act="import">Import…</button></div><textarea class="usa-te-json" rows="5" spellcheck="false" aria-label="Design tokens JSON" hidden></textarea><ul class="usa-te-problems" aria-live="polite"></ul>`;
          this.replaceChildren(root);
          const ta = root.querySelector('textarea')!, probs = root.querySelector('.usa-te-problems')!;
          const preview = (row: HTMLElement) => {
            const dot = row.querySelector('i')!;
            if (this.reduced) return;
            const g = row.dataset.g!, k = row.dataset.k!;
            const dur = g === 'duration' ? this.t.duration[k] : this.t.duration.normal || 300;
            const ease = g === 'easing' ? this.t.easing[k] : this.t.easing.standard || 'ease';
            this.motion(dot, [{ transform: 'translateX(0)' }, { transform: 'translateX(var(--usa-te-run, 44px))' }], { duration: Math.max(1, dur), easing: ease, fill: 'both' });
          };
          let undoApply: (() => void) | null = null;
          const applyNow = () => {
            if (!this.flag('apply')) return;
            undoApply?.();
            undoApply = applyMotionTokens(this.t);
          };
          this.onCleanup(() => undoApply?.());
          root.querySelectorAll<HTMLElement>('.usa-te-row').forEach((row) => {
            const inp = row.querySelector('input')!;
            this.listen(inp, 'change', () => {
              const g = row.dataset.g!, k = row.dataset.k!;
              if (g === 'duration') {
                const v = Math.max(0, Number(inp.value) || 0);
                this.t.duration[k] = v;
                inp.value = String(v);
                row.removeAttribute('data-invalid');
              } else {
                const n = inp.value.split(/[\s,]+/).filter(Boolean).map(Number);
                const ok = n.length === 4 && n.every(Number.isFinite) && n[0] >= 0 && n[0] <= 1 && n[2] >= 0 && n[2] <= 1;
                row.toggleAttribute('data-invalid', !ok);
                inp.setAttribute('aria-invalid', String(!ok));
                if (!ok) return;
                this.t.easing[k] = `cubic-bezier(${n.join(', ')})`;
              }
              applyNow();
              preview(row);
              this.emit('change', { tokens: this.t, group: g, name: k });
            });
            this.listen(row, 'pointerenter', () => preview(row));
          });
          this.listen(root, 'click', (e: MouseEvent) => {
            const act = (e.target as HTMLElement).closest('button')?.dataset.act;
            if (act === 'export') {
              ta.hidden = false;
              ta.value = JSON.stringify(this.exportJSON(), null, 2);
              probs.innerHTML = '';
            } else if (act === 'import') {
              if (ta.hidden || !ta.value.trim()) {
                ta.hidden = false;
                ta.placeholder = 'Paste W3C Design Tokens JSON, then press Import again';
                ta.focus();
                return;
              }
              let json: unknown;
              try {
                json = JSON.parse(ta.value);
              } catch {
                probs.innerHTML = '<li>Not valid JSON</li>';
                return;
              }
              const p = this.importJSON(json);
              const list = this.querySelector('.usa-te-problems');
              if (list) list.innerHTML = p.map((x) => `<li>${x.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</li>`).join('');
            }
          });
          applyNow();
          const first = root.querySelector<HTMLElement>('.usa-te-row');
          if (first) this.inView((v) => v && preview(first));
        }
      }
      return UsaTokenEditor as unknown as CustomElementConstructor;
    },
    { id: 'token-editor', text: css }
  );
}
